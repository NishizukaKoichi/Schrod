import * as vscode from 'vscode';
import * as path from 'path';
import { SchrodNode, SchrodConfig, ExecutionContext, ExecutionResult, SchrodNodeStatus, SchrodNodeType } from '../types';
import { AIService } from './aiService';
import { FileSystemService } from './fileSystemService';

export class ExecutionService {
  constructor(
    private aiService: AIService,
    private fileSystemService: FileSystemService
  ) {}

  async execute(node: SchrodNode, config: SchrodConfig): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Update status to running
      await this.updateNodeStatus(node, SchrodNodeStatus.Running);

      // Create execution context
      const context: ExecutionContext = {
        node,
        config,
        aiModel: this.selectAIModel(node, config),
        workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || ''
      };

      // Build prompt
      const prompt = await this.buildPrompt(context);

      // Execute with AI
      const result = await this.aiService.execute(prompt, context);

      // Process result
      const outputs = await this.processResult(result, context);

      // Update status to completed
      await this.updateNodeStatus(node, SchrodNodeStatus.Completed, {
        outputs,
        executionTime: Date.now() - startTime,
        aiUsed: context.aiModel
      });

      return {
        success: true,
        outputs,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      // Update status to failed
      await this.updateNodeStatus(node, SchrodNodeStatus.Failed, {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        outputs: [],
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private selectAIModel(node: SchrodNode, config: SchrodConfig): string {
    // Check for pattern-based overrides
    for (const [pattern, aiModel] of Object.entries(config.aiOverrides)) {
      if (this.matchesPattern(node.path, pattern)) {
        return aiModel;
      }
    }
    return config.defaultAI;
  }

  private matchesPattern(path: string, pattern: string): boolean {
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    
    return new RegExp(`^${regex}$`).test(path);
  }

  private async buildPrompt(context: ExecutionContext): Promise<string> {
    const { node } = context;
    
    // Read specification files
    const nodePath = path.join(
      context.workspaceRoot,
      '.schrod',
      node.path
    );

    let specContent = '';
    const specFiles = ['idea.md', 'requirements.md', 'architecture.md', 'design.md', 'spec.md'];
    
    for (const specFile of specFiles) {
      const filePath = path.join(nodePath, specFile);
      if (await this.fileSystemService.exists(filePath)) {
        specContent += await this.fileSystemService.readFile(filePath) + '\n\n';
      }
    }

    // Build context information
    const contextInfo = `
Task: Implement ${node.path}

Context:
- Level: ${node.level} (1=App, 2=Architecture, 3=Feature, 4=Ticket)
- Domain: ${node.domain || 'N/A'}
- Type: ${node.type}
- Parent: ${node.parent || 'N/A'}

Specification:
${specContent}

Requirements:
1. Generate production-ready TypeScript code
2. Include proper error handling
3. Add TypeScript interfaces and types
4. Follow best practices for the domain (${node.domain})
5. Include unit tests if applicable

Output the implementation code with clear file paths.
    `;

    return contextInfo.trim();
  }

  private async processResult(result: string, context: ExecutionContext): Promise<string[]> {
    const outputs: string[] = [];
    const outputDir = path.join(context.workspaceRoot, context.config.outputDir);

    // Parse the AI result to extract code blocks with file paths
    const codeBlocks = this.parseCodeBlocks(result);

    for (const block of codeBlocks) {
      if (block.filePath) {
        const fullPath = path.join(outputDir, block.filePath);
        const dir = path.dirname(fullPath);

        // Create directory if needed
        await this.fileSystemService.createDirectory(dir);

        // Write the file
        await this.fileSystemService.writeFile(fullPath, block.code);
        outputs.push(block.filePath);

        vscode.window.showInformationMessage(`Created: ${block.filePath}`);
      }
    }

    return outputs;
  }

  private parseCodeBlocks(result: string): Array<{ filePath?: string; code: string }> {
    const blocks: Array<{ filePath?: string; code: string }> = [];
    
    // Simple parser - in real implementation, this would be more sophisticated
    const lines = result.split('\n');
    let currentBlock: { filePath?: string; code: string } | null = null;
    let inCodeBlock = false;

    for (const line of lines) {
      if (line.startsWith('// File:') || line.startsWith('# File:')) {
        const filePath = line.replace(/^(\/\/ |# )File:\s*/, '').trim();
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = { filePath, code: '' };
      } else if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
      } else if (inCodeBlock && currentBlock) {
        currentBlock.code += line + '\n';
      }
    }

    if (currentBlock) {
      blocks.push(currentBlock);
    }

    return blocks;
  }

  private async updateNodeStatus(
    node: SchrodNode,
    status: SchrodNodeStatus,
    additionalData?: any
  ): Promise<void> {
    node.status = status;

    if (node.type === SchrodNodeType.Ticket) {
      const statusPath = path.join(
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '',
        '.schrod',
        node.path,
        'status.json'
      );

      const currentStatus = await this.fileSystemService.exists(statusPath)
        ? await this.fileSystemService.readJson<any>(statusPath)
        : {};

      await this.fileSystemService.writeJson(statusPath, {
        ...currentStatus,
        status,
        lastRun: new Date().toISOString(),
        ...additionalData
      });
    }
  }
}