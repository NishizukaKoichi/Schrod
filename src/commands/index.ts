import * as vscode from 'vscode';
import { SchrodService } from '../services/schrodService';
import { SchrodExplorerProvider } from '../providers/schrodExplorerProvider';
// SchrodTreeItem is defined in the provider file
import { SchrodDomain } from '../types';

export function registerCommands(
  context: vscode.ExtensionContext,
  schrodService: SchrodService,
  explorerProvider: SchrodExplorerProvider
) {
  // Initialize Project
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.initializeProject', async () => {
      const projectName = await vscode.window.showInputBox({
        prompt: 'Enter project name',
        placeHolder: 'my-app',
        validateInput: (value) => {
          if (!value || value.trim() === '') {
            return 'Project name is required';
          }
          if (!/^[a-z0-9-]+$/.test(value)) {
            return 'Project name must contain only lowercase letters, numbers, and hyphens';
          }
          return null;
        }
      });

      if (projectName) {
        try {
          await schrodService.initializeProject(projectName);
          explorerProvider.refresh();
          vscode.window.showInformationMessage(`Schröd project '${projectName}' initialized`);
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to initialize project: ${error}`);
        }
      }
    })
  );

  // Create App Spec
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.createAppSpec', async () => {
      const idea = await vscode.window.showInputBox({
        prompt: 'Describe your application idea',
        placeHolder: 'A blog application with authentication and comments'
      });

      if (idea) {
        try {
          await schrodService.createAppSpec(idea);
          explorerProvider.refresh();
          vscode.window.showInformationMessage('App specification created');
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create app spec: ${error}`);
        }
      }
    })
  );

  // Decompose to UI/Logic
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.decomposeToUILogic', async () => {
      try {
        await schrodService.decomposeToUILogic();
        explorerProvider.refresh();
        vscode.window.showInformationMessage('Decomposed to UI/Logic/Test domains');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to decompose: ${error}`);
      }
    })
  );

  // Add Feature
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.addFeature', async () => {
      const featureName = await vscode.window.showInputBox({
        prompt: 'Enter feature name',
        placeHolder: 'auth, dashboard, profile',
        validateInput: (value) => {
          if (!value || value.trim() === '') {
            return 'Feature name is required';
          }
          if (!/^[a-z0-9-]+$/.test(value)) {
            return 'Feature name must contain only lowercase letters, numbers, and hyphens';
          }
          return null;
        }
      });

      if (!featureName) {
        return;
      }

      const domain = await vscode.window.showQuickPick(
        ['ui', 'logic', 'test'],
        {
          placeHolder: 'Select domain for the feature'
        }
      );

      if (domain) {
        try {
          await schrodService.addFeature(featureName, domain as SchrodDomain);
          explorerProvider.refresh();
          vscode.window.showInformationMessage(`Feature '${featureName}' added to ${domain} domain`);
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to add feature: ${error}`);
        }
      }
    })
  );

  // Create Tickets
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.createTickets', async (item?: any) => {
      let nodePath: string | undefined;

      if (item) {
        nodePath = item.node.path;
      } else {
        const nodes = schrodService.getNodes();
        const featureNodes = Array.from(nodes.values())
          .filter(node => node.level === 3)
          .map(node => ({
            label: node.name,
            description: node.path,
            path: node.path
          }));

        const selected = await vscode.window.showQuickPick(featureNodes, {
          placeHolder: 'Select a feature to create tickets for'
        });

        nodePath = selected?.path;
      }

      if (nodePath) {
        try {
          await schrodService.createTickets(nodePath);
          explorerProvider.refresh();
          vscode.window.showInformationMessage('Tickets created');
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create tickets: ${error}`);
        }
      }
    })
  );

  // Run Node
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.run', async (item?: any) => {
      let nodePath: string | undefined;

      if (item) {
        nodePath = item.node.path;
      } else {
        const nodes = schrodService.getNodes();
        const runnableNodes = Array.from(nodes.values())
          .filter(node => node.type === 'ticket')
          .map(node => ({
            label: node.name,
            description: node.path,
            path: node.path
          }));

        const selected = await vscode.window.showQuickPick(runnableNodes, {
          placeHolder: 'Select a node to run'
        });

        nodePath = selected?.path;
      }

      if (nodePath) {
        try {
          await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Running ${nodePath}`,
            cancellable: false
          }, async (progress) => {
            progress.report({ increment: 0 });
            await schrodService.runNode(nodePath);
            progress.report({ increment: 100 });
          });

          explorerProvider.refresh();
          vscode.window.showInformationMessage(`Successfully ran ${nodePath}`);
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to run node: ${error}`);
        }
      }
    })
  );

  // Run All Tickets
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.runAllTickets', async () => {
      const nodes = schrodService.getNodes();
      const tickets = Array.from(nodes.values()).filter(node => node.type === 'ticket');

      if (tickets.length === 0) {
        vscode.window.showInformationMessage('No tickets found to run');
        return;
      }

      const answer = await vscode.window.showWarningMessage(
        `Run all ${tickets.length} tickets?`,
        'Yes',
        'No'
      );

      if (answer === 'Yes') {
        try {
          await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Running all tickets',
            cancellable: false
          }, async (progress) => {
            for (let i = 0; i < tickets.length; i++) {
              const ticket = tickets[i];
              progress.report({
                increment: (100 / tickets.length),
                message: `Running ${ticket.name} (${i + 1}/${tickets.length})`
              });
              
              try {
                await schrodService.runNode(ticket.path);
              } catch (error) {
                console.error(`Failed to run ${ticket.path}:`, error);
              }
            }
          });

          explorerProvider.refresh();
          vscode.window.showInformationMessage('All tickets completed');
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to run tickets: ${error}`);
        }
      }
    })
  );

  // Show Status
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.status', async () => {
      const config = schrodService.getConfig();
      const nodes = schrodService.getNodes();

      if (!config) {
        vscode.window.showInformationMessage('No Schröd project initialized');
        return;
      }

      const totalNodes = nodes.size;
      const completedNodes = Array.from(nodes.values()).filter(n => n.status === 'completed').length;
      const runningNodes = Array.from(nodes.values()).filter(n => n.status === 'running').length;
      const failedNodes = Array.from(nodes.values()).filter(n => n.status === 'failed').length;

      const message = `
Schröd Project: ${config.projectName}

Total Nodes: ${totalNodes}
Completed: ${completedNodes}
Running: ${runningNodes}
Failed: ${failedNodes}
Pending: ${totalNodes - completedNodes - runningNodes - failedNodes}

Progress: ${Math.round((completedNodes / totalNodes) * 100)}%
      `.trim();

      vscode.window.showInformationMessage(message, { modal: true });
    })
  );

  // Plan
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.plan', async (item?: any) => {
      if (!item) {
        vscode.window.showErrorMessage('Please select a node to plan');
        return;
      }

      // This would show execution plan
      vscode.window.showInformationMessage(`Planning execution for: ${item.node.path}`);
    })
  );

  // View Dependencies
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.viewDependencies', async (item?: any) => {
      if (!item) {
        vscode.window.showErrorMessage('Please select a node to view dependencies');
        return;
      }

      // This would show dependency graph
      vscode.window.showInformationMessage(`Dependencies for: ${item.node.path}`);
    })
  );

  // Show Dependency Graph (placeholder)
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.showDependencyGraph', async () => {
      vscode.window.showInformationMessage('Dependency graph visualization coming soon!');
    })
  );

  // Run with AI Selection (placeholder)
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.runWithAISelection', async () => {
      const ai = await vscode.window.showQuickPick(
        ['claude-sonnet-4', 'claude-haiku', 'gpt-4', 'claude-opus'],
        { placeHolder: 'Select AI model' }
      );

      if (ai) {
        vscode.window.showInformationMessage(`Running with ${ai}`);
      }
    })
  );

  // Run Specific Path
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.runSpecificPath', async () => {
      const path = await vscode.window.showInputBox({
        prompt: 'Enter Schröd path pattern',
        placeHolder: '**/*@Schröd.ticket',
        value: '**/*@Schröd.ticket'
      });

      if (path) {
        vscode.window.showInformationMessage(`Running pattern: ${path}`);
      }
    })
  );

  // Resume Failed
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.resumeFailed', async () => {
      const nodes = schrodService.getNodes();
      const failedNodes = Array.from(nodes.values()).filter(n => n.status === 'failed');

      if (failedNodes.length === 0) {
        vscode.window.showInformationMessage('No failed nodes to resume');
        return;
      }

      vscode.window.showInformationMessage(`Resuming ${failedNodes.length} failed nodes`);
    })
  );

  // Clean and Restart
  context.subscriptions.push(
    vscode.commands.registerCommand('schrod.cleanAndRestart', async () => {
      const answer = await vscode.window.showWarningMessage(
        'This will clean all generated files and reset status. Continue?',
        'Yes',
        'No'
      );

      if (answer === 'Yes') {
        vscode.window.showInformationMessage('Cleaning and restarting...');
      }
    })
  );
}