export interface SchrodNode {
  path: string;
  name: string;
  level: SchrodLevel;
  domain: SchrodDomain | null;
  type: SchrodNodeType;
  status: SchrodNodeStatus;
  parent?: string;
  children: string[];
  dependencies: string[];
}

export enum SchrodLevel {
  App = 1,
  Architecture = 2,
  Feature = 3,
  Ticket = 4
}

export enum SchrodDomain {
  UI = 'ui',
  Logic = 'logic',
  Test = 'test'
}

export enum SchrodNodeType {
  App = 'app',
  Domain = 'domain',
  Feature = 'feature',
  Ticket = 'ticket'
}

export enum SchrodNodeStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed'
}

export interface SchrodConfig {
  version: string;
  projectName: string;
  defaultAI: string;
  aiOverrides: Record<string, string>;
  outputDir: string;
  created: string;
  lastModified: string;
}

export interface SchrodTicketStatus {
  status: SchrodNodeStatus;
  lastRun?: string;
  aiUsed?: string;
  executionTime?: number;
  dependencies: string[];
  outputs: string[];
  checkpoints: string[];
  error?: string;
}

export interface ExecutionContext {
  node: SchrodNode;
  config: SchrodConfig;
  aiModel: string;
  workspaceRoot: string;
}

export interface ExecutionResult {
  success: boolean;
  outputs: string[];
  executionTime: number;
  error?: string;
  checkpoints?: string[];
}

export interface AIProvider {
  name: string;
  execute(prompt: string, context: ExecutionContext): Promise<string>;
  isAvailable(): Promise<boolean>;
}

export interface DependencyGraph {
  nodes: Map<string, SchrodNode>;
  edges: Map<string, Set<string>>;
}

export interface SchrodMetrics {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  aiUsageStats: Record<string, { count: number; successRate: number }>;
  commonErrors: Array<{ type: string; count: number }>;
}