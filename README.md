# Schröd Framework

An AI-driven application development framework that implements a hierarchical "Schrödinger project structure" for systematic development workflow. Features both CLI tool and VS Code extension for comprehensive project management.

## Features

- **Hierarchical Schrödinger Structure**: 4-level hierarchy (App → Domain → Feature → Ticket)
- **AI-Driven Development**: Context-aware AI model selection and automatic code generation
- **Dual Interface**: CLI tool and VS Code extension for different development preferences
- **Pattern-Based AI Selection**: Automatic AI model routing based on node patterns
- **Parallel Execution**: Dependency-aware parallel execution of tickets
- **Progress Tracking**: Real-time status monitoring and execution metrics

## Framework Architecture

The Schröd Framework enforces a strict 4-level hierarchy where each development task exists in quantum-like superposition states:

```
Level 1 (App): ProjectName@Schröd
├── Level 2 (Domain): Schröd.ui | Schröd.logic | Schröd.test
    ├── Level 3 (Feature): FeatureName@Schröd.[domain]
        └── Level 4 (Ticket): TaskName@Schröd.ticket
```

### Node States
- **Pending**: Task not yet started (superposition state)
- **Running**: Currently being executed by AI
- **Completed**: Successfully implemented
- **Failed**: Execution failed, requires attention

## Installation

### VS Code Extension
1. Install from VS Code Marketplace (search "Schröd Framework")
2. Open any project in VS Code
3. Look for "Schröd Explorer" in the sidebar

### CLI Tool
```bash
npm install -g schrod-cli
```

## Core Commands

### VS Code Extension Commands
- `Schröd: Initialize Project` - Set up hierarchical project structure
- `Schröd: Create App Spec` - Define application requirements from ideas
- `Schröd: Decompose to UI/Logic` - Break down into UI/Logic/Test domains
- `Schröd: Add Feature` - Add features to specific domains
- `Schröd: Create Tickets` - Generate implementation tickets from features
- `Schröd: Run` - Execute individual nodes with AI
- `Schröd: Run All Tickets` - Execute all tickets with dependency resolution
- `Schröd: Status` - Show project progress and metrics
- `Schröd: Resume Failed` - Retry failed executions

### CLI Commands
```bash
schrod init <project-name>    # Initialize new project
schrod run <node-pattern>     # Execute nodes matching pattern
schrod status                 # Show project status
```

## AI Integration

The framework supports multiple AI providers with intelligent routing:

### Default Configuration
```json
{
  "defaultAI": "claude-sonnet-4",
  "aiOverrides": {
    "**/*@Schröd.ui/**": "claude-haiku",
    "**/*@Schröd.logic/**": "claude-sonnet-4", 
    "**/*@Schröd.test/**": "gpt-4"
  },
  "outputDir": "src",
  "parallelExecutions": 3
}
```

### Supported AI Models
- Claude Sonnet 4 (complex logic, architecture decisions)
- Claude Haiku (UI components, simple implementations)
- GPT-4 (testing, documentation)
- Claude Opus (complex system design)

## Development Workflow

1. **Initialize**: Create project with `Schröd: Initialize Project`
2. **Specify**: Define app idea with `Schröd: Create App Spec`
3. **Decompose**: Break into domains with `Schröd: Decompose to UI/Logic`
4. **Add Features**: Create features with `Schröd: Add Feature`
5. **Create Tickets**: Generate tickets with `Schröd: Create Tickets`
6. **Execute**: Run implementation with `Schröd: Run All Tickets`

## Configuration Files

Each node maintains specification files:
- `idea.md` - Initial concept description
- `requirements.md` - Detailed requirements
- `design.md` - Design specifications
- `spec.md` - Implementation specifications

## VS Code Settings

```json
{
  "schrod.showDefaultStructure": true,
  "schrod.defaultAI": "claude-sonnet-4"
}
```

## Requirements

- VS Code 1.74.0 or higher (for extension)
- Node.js 18.0.0 or higher
- AI API keys (Claude, OpenAI, etc.)

## Framework Philosophy

The Schröd Framework treats development tasks as quantum-like entities that exist in superposition until "observed" (executed) by AI systems. This approach enables:

- **Systematic Development**: Enforced hierarchical structure
- **AI-First Implementation**: Heavy reliance on AI for code generation
- **Domain Separation**: Clear separation of UI, logic, and testing concerns
- **Progressive Refinement**: From high-level ideas to specific implementation

## Contributing

Visit our [GitHub repository](https://github.com/NishizukaKoichi/Schrod) for documentation, issues, and contributions.

## License

MIT License - see LICENSE file for details.