import * as vscode from 'vscode';
// Path utilities are handled by VSCode built-in modules
import { SchrodService } from '../services/schrodService';
import { SchrodNode, SchrodNodeStatus, SchrodLevel, SchrodNodeType } from '../types';

export class SchrodExplorerProvider implements vscode.TreeDataProvider<SchrodTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SchrodTreeItem | undefined | null | void> = new vscode.EventEmitter<SchrodTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<SchrodTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(
    private schrodService: SchrodService,
    private extensionUri: vscode.Uri
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SchrodTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SchrodTreeItem): Thenable<SchrodTreeItem[]> {
    if (!element) {
      // Root level - show all top-level Schröd nodes
      return this.getRootNodes();
    } else {
      // Get children of the selected node
      return this.getChildNodes(element.node);
    }
  }

  private async getRootNodes(): Promise<SchrodTreeItem[]> {
    const nodes = this.schrodService.getNodes();
    const showDefaultStructure = vscode.workspace.getConfiguration('schrod').get<boolean>('showDefaultStructure', true);
    
    // Check if there are any existing nodes
    if (nodes.size === 0 && showDefaultStructure) {
      // Return default Schrödinger structure when no nodes exist
      return this.getDefaultSchrodStructure();
    }
    
    const rootNodes = Array.from(nodes.values()).filter(node => !node.parent);
    
    return rootNodes.map(node => new SchrodTreeItem(
      node,
      this.getNodeLabel(node),
      this.getNodeDescription(node),
      this.hasChildren(node, nodes),
      this.extensionUri
    ));
  }

  private getDefaultSchrodStructure(): SchrodTreeItem[] {
    // Create default Schrödinger structure display
    const defaultNodes = [
      {
        name: '📱 Project@Schröd',
        description: 'Application root (click to initialize)',
        type: 'app',
        level: 1
      },
      {
        name: '🏗️ Schröd.ui',
        description: 'User Interface Domain',
        type: 'domain',
        level: 2
      },
      {
        name: '⚙️ Schröd.logic',
        description: 'Business Logic Domain',
        type: 'domain',
        level: 2
      },
      {
        name: '🧪 Schröd.test',
        description: 'Testing Domain',
        type: 'domain',
        level: 2
      }
    ];

    return defaultNodes.map(item => {
      const mockNode = {
        path: item.name.toLowerCase().replace(/[^\w]/g, '_'),
        name: item.name,
        level: item.level,
        domain: null,
        type: item.type,
        status: 'pending',
        parent: undefined,
        children: [],
        dependencies: []
      } as any;

      return new SchrodTreeItem(
        mockNode,
        item.name,
        item.description,
        false,
        this.extensionUri
      );
    });
  }

  private async getChildNodes(parentNode: SchrodNode): Promise<SchrodTreeItem[]> {
    const nodes = this.schrodService.getNodes();
    const children = Array.from(nodes.values()).filter(
      node => node.parent === parentNode.path
    );

    return children.map(node => new SchrodTreeItem(
      node,
      this.getNodeLabel(node),
      this.getNodeDescription(node),
      this.hasChildren(node, nodes),
      this.extensionUri
    ));
  }

  private getNodeLabel(node: SchrodNode): string {
    const statusIcon = this.getStatusIcon(node.status);
    const levelBadge = this.getLevelBadge(node.level);
    return `${statusIcon} ${levelBadge} ${node.name}`;
  }

  private getNodeDescription(node: SchrodNode): string {
    const parts: string[] = [];
    
    if (node.status === SchrodNodeStatus.Running) {
      parts.push('[Running]');
    } else if (node.status === SchrodNodeStatus.Failed) {
      parts.push('[Failed]');
    }

    if (node.domain) {
      parts.push(`(${node.domain})`);
    }

    return parts.join(' ');
  }

  private getStatusIcon(status: SchrodNodeStatus): string {
    switch (status) {
      case SchrodNodeStatus.Pending:
        return '○';
      case SchrodNodeStatus.Running:
        return '●';
      case SchrodNodeStatus.Completed:
        return '✓';
      case SchrodNodeStatus.Failed:
        return '✗';
      default:
        return '○';
    }
  }

  private getLevelBadge(level: SchrodLevel): string {
    switch (level) {
      case SchrodLevel.App:
        return '🎯';
      case SchrodLevel.Architecture:
        return '🏗️';
      case SchrodLevel.Feature:
        return '📦';
      case SchrodLevel.Ticket:
        return '🎫';
      default:
        return '';
    }
  }

  private hasChildren(node: SchrodNode, allNodes: Map<string, SchrodNode>): boolean {
    return Array.from(allNodes.values()).some(n => n.parent === node.path);
  }
}

export class SchrodTreeItem extends vscode.TreeItem {
  constructor(
    public readonly node: SchrodNode,
    public readonly label: string,
    public readonly description: string,
    hasChildren: boolean,
    _extensionUri: vscode.Uri
  ) {
    super(
      label,
      hasChildren
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    this.tooltip = this.getTooltip();
    this.contextValue = 'schrodNode';
    this.iconPath = this.getIcon() as vscode.ThemeIcon;
    
    // Add decorations based on status
    this.resourceUri = vscode.Uri.parse(`schrod:${node.path}`);
  }

  private getTooltip(): string {
    const parts = [
      `Path: ${this.node.path}`,
      `Level: ${this.node.level}`,
      `Type: ${this.node.type}`,
      `Status: ${this.node.status}`
    ];

    if (this.node.domain) {
      parts.push(`Domain: ${this.node.domain}`);
    }

    if (this.node.dependencies.length > 0) {
      parts.push(`Dependencies: ${this.node.dependencies.length}`);
    }

    return parts.join('\n');
  }

  private getIcon(): vscode.ThemeIcon {
    // Use built-in VS Code icons based on node type and status
    if (this.node.type === SchrodNodeType.App) {
      return new vscode.ThemeIcon('globe');
    } else if (this.node.type === SchrodNodeType.Domain) {
      return new vscode.ThemeIcon('layers');
    } else if (this.node.type === SchrodNodeType.Feature) {
      return new vscode.ThemeIcon('package');
    } else if (this.node.type === SchrodNodeType.Ticket) {
      switch (this.node.status) {
        case SchrodNodeStatus.Completed:
          return new vscode.ThemeIcon('pass', new vscode.ThemeColor('testing.iconPassed'));
        case SchrodNodeStatus.Failed:
          return new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
        case SchrodNodeStatus.Running:
          return new vscode.ThemeIcon('sync~spin', new vscode.ThemeColor('testing.iconQueued'));
        default:
          return new vscode.ThemeIcon('circle-outline');
      }
    }

    return new vscode.ThemeIcon('file');
  }
}