import { SchrodNode, DependencyGraph } from '../types';

export class DependencyService {
  private graph: DependencyGraph = {
    nodes: new Map(),
    edges: new Map()
  };

  buildGraph(nodes: Map<string, SchrodNode>): void {
    this.graph.nodes = new Map(nodes);
    this.graph.edges.clear();

    // Build parent-child relationships
    for (const [path, node] of nodes) {
      if (node.parent) {
        this.addEdge(node.parent, path);
      }
    }

    // TODO: In real implementation, analyze file imports and
    // spec files to detect cross-dependencies
  }

  addDependency(from: string, to: string): void {
    this.addEdge(from, to);
  }

  getDependencies(nodePath: string): string[] {
    return Array.from(this.graph.edges.get(nodePath) || []);
  }

  getDependents(nodePath: string): string[] {
    const dependents: string[] = [];
    for (const [node, deps] of this.graph.edges) {
      if (deps.has(nodePath)) {
        dependents.push(node);
      }
    }
    return dependents;
  }

  getExecutionOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (node: string) => {
      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      const deps = this.getDependencies(node);
      for (const dep of deps) {
        visit(dep);
      }
      order.push(node);
    };

    for (const node of this.graph.nodes.keys()) {
      visit(node);
    }

    return order;
  }

  detectCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (node: string, path: string[]): boolean => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const deps = this.getDependencies(node);
      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (detectCycle(dep, [...path])) {
            return true;
          }
        } else if (recursionStack.has(dep)) {
          const cycleStart = path.indexOf(dep);
          cycles.push(path.slice(cycleStart));
          return true;
        }
      }

      path.pop();
      recursionStack.delete(node);
      return false;
    };

    for (const node of this.graph.nodes.keys()) {
      if (!visited.has(node)) {
        detectCycle(node, []);
      }
    }

    return cycles;
  }

  getParallelGroups(): string[][] {
    const order = this.getExecutionOrder();
    const groups: string[][] = [];
    const processed = new Set<string>();

    for (const node of order) {
      if (processed.has(node)) {
        continue;
      }

      const group: string[] = [node];
      processed.add(node);

      // Find other nodes that can be executed in parallel
      for (const candidate of order) {
        if (processed.has(candidate)) {
          continue;
        }

        // Check if candidate has no dependencies on current group nodes
        const candidateDeps = this.getDependencies(candidate);
        const hasGroupDep = candidateDeps.some(dep => group.includes(dep));

        // Check if any group node depends on candidate
        const groupDependsOnCandidate = group.some(groupNode => {
          const groupNodeDeps = this.getDependencies(groupNode);
          return groupNodeDeps.includes(candidate);
        });

        if (!hasGroupDep && !groupDependsOnCandidate) {
          group.push(candidate);
          processed.add(candidate);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  private addEdge(from: string, to: string): void {
    if (!this.graph.edges.has(from)) {
      this.graph.edges.set(from, new Set());
    }
    this.graph.edges.get(from)!.add(to);
  }
}