// Schröd service for managing nodes and configuration
import * as path from 'path';
import { SchrodNode, SchrodConfig, SchrodLevel, SchrodDomain, SchrodNodeType, SchrodNodeStatus } from '../types';
import { FileSystemService } from './fileSystemService';
import { DependencyService } from './dependencyService';
import { ExecutionService } from './executionService';

export class SchrodService {
  private workspaceRoot: string = '';
  private schrodRoot: string = '';
  private nodes: Map<string, SchrodNode> = new Map();
  private config: SchrodConfig | null = null;

  constructor(
    private fileSystemService: FileSystemService,
    private dependencyService: DependencyService,
    private executionService: ExecutionService
  ) {}

  async initialize(workspaceRoot: string): Promise<void> {
    this.workspaceRoot = workspaceRoot;
    this.schrodRoot = path.join(workspaceRoot, '.schrod');

    // Load config
    await this.loadConfig();

    // Scan for Schröd nodes
    await this.scanSchrodNodes();
  }

  async initializeProject(projectName: string): Promise<void> {
    if (!this.workspaceRoot) {
      throw new Error('No workspace root found');
    }

    // Create .schrod directory
    await this.fileSystemService.createDirectory(this.schrodRoot);

    // Create default config
    const config: SchrodConfig = {
      version: '1.0.0',
      projectName,
      defaultAI: 'claude-sonnet-4',
      aiOverrides: {
        '**/*@Schröd.ui/**': 'claude-haiku',
        '**/*@Schröd.logic/**': 'claude-sonnet-4',
        '**/test*': 'gpt-4'
      },
      outputDir: 'src',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    await this.fileSystemService.writeJson(
      path.join(this.schrodRoot, 'config.json'),
      config
    );

    this.config = config;

    // Create initial app node
    const appNodePath = path.join(this.schrodRoot, `${projectName}@Schröd`);
    await this.fileSystemService.createDirectory(appNodePath);
    await this.fileSystemService.writeFile(
      path.join(appNodePath, 'idea.md'),
      `# ${projectName}\n\n## Overview\n\nDescribe your application idea here.\n`
    );

    await this.scanSchrodNodes();
  }

  async createAppSpec(idea: string): Promise<void> {
    const appNode = this.getAppNode();
    if (!appNode) {
      throw new Error('No app node found. Initialize project first.');
    }

    const appPath = path.join(this.schrodRoot, appNode.name);
    await this.fileSystemService.writeFile(
      path.join(appPath, 'idea.md'),
      `# ${this.config?.projectName}\n\n## Overview\n\n${idea}\n`
    );

    await this.fileSystemService.writeFile(
      path.join(appPath, 'requirements.md'),
      `# Requirements\n\n## Functional Requirements\n\n- TODO: Add functional requirements\n\n## Non-Functional Requirements\n\n- TODO: Add non-functional requirements\n`
    );
  }

  async decomposeToUILogic(): Promise<void> {
    const appNode = this.getAppNode();
    if (!appNode) {
      throw new Error('No app node found');
    }

    // Create UI domain
    const uiPath = path.join(this.schrodRoot, 'Schröd.ui');
    await this.fileSystemService.createDirectory(uiPath);
    await this.fileSystemService.writeFile(
      path.join(uiPath, 'architecture.md'),
      '# UI Architecture\n\n## Overview\n\nDescribe the UI architecture here.\n'
    );

    // Create Logic domain
    const logicPath = path.join(this.schrodRoot, 'Schröd.logic');
    await this.fileSystemService.createDirectory(logicPath);
    await this.fileSystemService.writeFile(
      path.join(logicPath, 'architecture.md'),
      '# Logic Architecture\n\n## Overview\n\nDescribe the business logic architecture here.\n'
    );

    // Create Test domain
    const testPath = path.join(this.schrodRoot, 'Schröd.test');
    await this.fileSystemService.createDirectory(testPath);
    await this.fileSystemService.writeFile(
      path.join(testPath, 'architecture.md'),
      '# Test Architecture\n\n## Overview\n\nDescribe the testing strategy here.\n'
    );

    await this.scanSchrodNodes();
  }

  async addFeature(featureName: string, domain: SchrodDomain): Promise<void> {
    const domainPath = path.join(this.schrodRoot, `Schröd.${domain}`);
    const featurePath = path.join(domainPath, `${featureName}@Schröd.${domain}`);

    await this.fileSystemService.createDirectory(featurePath);
    await this.fileSystemService.writeFile(
      path.join(featurePath, 'design.md'),
      `# ${featureName} Design\n\n## Overview\n\nDescribe the ${featureName} feature design here.\n`
    );

    await this.scanSchrodNodes();
  }

  async createTickets(nodePath: string): Promise<void> {
    const node = this.nodes.get(nodePath);
    if (!node || node.level !== SchrodLevel.Feature) {
      throw new Error('Can only create tickets for feature-level nodes');
    }

    // This is a placeholder - in real implementation, this would use AI
    // to analyze the feature and create appropriate tickets
    const ticketName = 'implementation';
    const ticketPath = path.join(
      this.schrodRoot,
      nodePath,
      `${ticketName}@Schröd.ticket`
    );

    await this.fileSystemService.createDirectory(ticketPath);
    await this.fileSystemService.writeFile(
      path.join(ticketPath, 'spec.md'),
      `# ${ticketName} Specification\n\n## Implementation Details\n\nTODO: Add implementation details\n`
    );

    await this.fileSystemService.writeJson(
      path.join(ticketPath, 'status.json'),
      {
        status: SchrodNodeStatus.Pending,
        dependencies: [],
        outputs: [],
        checkpoints: []
      }
    );

    await this.scanSchrodNodes();
  }

  async runNode(nodePath: string): Promise<void> {
    const node = this.nodes.get(nodePath);
    if (!node) {
      throw new Error(`Node not found: ${nodePath}`);
    }

    await this.executionService.execute(node, this.config!);
    await this.scanSchrodNodes();
  }

  async getNodeStatus(nodePath: string): Promise<SchrodNodeStatus> {
    const node = this.nodes.get(nodePath);
    return node?.status || SchrodNodeStatus.Pending;
  }

  getNodes(): Map<string, SchrodNode> {
    return new Map(this.nodes);
  }

  getConfig(): SchrodConfig | null {
    return this.config;
  }

  private async loadConfig(): Promise<void> {
    const configPath = path.join(this.schrodRoot, 'config.json');
    if (await this.fileSystemService.exists(configPath)) {
      this.config = await this.fileSystemService.readJson<SchrodConfig>(configPath);
    }
  }

  private async scanSchrodNodes(): Promise<void> {
    this.nodes.clear();

    if (!await this.fileSystemService.exists(this.schrodRoot)) {
      return;
    }

    await this.scanDirectory(this.schrodRoot, '');
    this.dependencyService.buildGraph(this.nodes);
  }

  private async scanDirectory(dirPath: string, parentPath: string): Promise<void> {
    const entries = await this.fileSystemService.readDirectory(dirPath);

    for (const entry of entries) {
      if (entry.includes('@Schröd')) {
        const fullPath = path.join(dirPath, entry);
        const relativePath = path.relative(this.schrodRoot, fullPath);
        
        const node = this.parseSchrodNode(entry, relativePath, parentPath);
        if (node) {
          this.nodes.set(relativePath, node);

          // Load status for tickets
          if (node.type === SchrodNodeType.Ticket) {
            const statusPath = path.join(fullPath, 'status.json');
            if (await this.fileSystemService.exists(statusPath)) {
              const status = await this.fileSystemService.readJson<any>(statusPath);
              node.status = status.status || SchrodNodeStatus.Pending;
            }
          }

          // Recursively scan subdirectories
          if (await this.fileSystemService.isDirectory(fullPath)) {
            await this.scanDirectory(fullPath, relativePath);
          }
        }
      }
    }
  }

  private parseSchrodNode(name: string, path: string, parent: string): SchrodNode | null {
    const match = name.match(/^(.+)@Schröd(?:\.(\w+))?$/);
    if (!match) {
      return null;
    }

    const [, , domainOrType] = match;
    const level = this.getNodeLevel(path);
    const domain = this.getNodeDomain(domainOrType);
    const type = this.getNodeType(level, domainOrType);

    return {
      path,
      name,
      level,
      domain,
      type,
      status: SchrodNodeStatus.Pending,
      parent: parent || undefined,
      children: [],
      dependencies: []
    };
  }

  private getNodeLevel(path: string): SchrodLevel {
    const depth = path.split('/').length;
    return Math.min(depth, 4) as SchrodLevel;
  }

  private getNodeDomain(domainOrType?: string): SchrodDomain | null {
    if (!domainOrType) {
      return null;
    }

    if (Object.values(SchrodDomain).includes(domainOrType as SchrodDomain)) {
      return domainOrType as SchrodDomain;
    }

    return null;
  }

  private getNodeType(level: SchrodLevel, domainOrType?: string): SchrodNodeType {
    if (domainOrType === 'ticket') {
      return SchrodNodeType.Ticket;
    }

    switch (level) {
      case SchrodLevel.App:
        return SchrodNodeType.App;
      case SchrodLevel.Architecture:
        return SchrodNodeType.Domain;
      case SchrodLevel.Feature:
        return SchrodNodeType.Feature;
      case SchrodLevel.Ticket:
        return SchrodNodeType.Ticket;
      default:
        return SchrodNodeType.Feature;
    }
  }

  private getAppNode(): SchrodNode | undefined {
    return Array.from(this.nodes.values()).find(
      node => node.type === SchrodNodeType.App
    );
  }
}