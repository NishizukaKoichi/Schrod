import * as vscode from 'vscode';
import { SchrodExplorerProvider } from './providers/schrodExplorerProvider';
import { registerCommands } from './commands';
import { SchrodService } from './services/schrodService';
import { FileSystemService } from './services/fileSystemService';
import { AIService } from './services/aiService';
import { DependencyService } from './services/dependencyService';
import { ExecutionService } from './services/executionService';

export function activate(context: vscode.ExtensionContext) {
  console.log('Schröd Framework is now active!');

  // Initialize services
  const fileSystemService = new FileSystemService();
  const aiService = new AIService();
  const dependencyService = new DependencyService();
  const executionService = new ExecutionService(aiService, fileSystemService);
  const schrodService = new SchrodService(
    fileSystemService,
    dependencyService,
    executionService
  );

  // Create Schröd Explorer
  const schrodExplorerProvider = new SchrodExplorerProvider(
    schrodService,
    context.extensionUri
  );
  
  const treeView = vscode.window.createTreeView('schrodExplorer', {
    treeDataProvider: schrodExplorerProvider,
    showCollapseAll: true
  });

  context.subscriptions.push(treeView);

  // Register file system watcher
  const fileWatcher = vscode.workspace.createFileSystemWatcher('**/@Schröd*/**');
  fileWatcher.onDidCreate(() => schrodExplorerProvider.refresh());
  fileWatcher.onDidChange(() => schrodExplorerProvider.refresh());
  fileWatcher.onDidDelete(() => schrodExplorerProvider.refresh());
  context.subscriptions.push(fileWatcher);

  // Register commands
  registerCommands(context, schrodService, schrodExplorerProvider);

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.text = '$(beaker) Schröd';
  statusBarItem.tooltip = 'Schröd Framework';
  statusBarItem.command = 'schrod.status';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Initialize workspace if .schrod directory exists
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot) {
    schrodService.initialize(workspaceRoot).then(() => {
      schrodExplorerProvider.refresh();
      vscode.window.showInformationMessage('Schröd Framework initialized');
    }).catch(err => {
      console.error('Failed to initialize Schröd:', err);
    });
  }
}

export function deactivate() {
  console.log('Schröd Framework deactivated');
}