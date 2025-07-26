# Schröd Framework - VS Code Extension

A VS Code extension that displays hierarchical Schrödinger project structure for systematic AI-driven development workflow.

## Features

- **Default Structure Display**: Shows standard Schrödinger hierarchy when no project exists
- **Hierarchical Project Visualization**: Clear display of App → Domain → Feature → Ticket structure
- **AI-Driven Development Context**: Provides clear context for AI development assistance
- **Interactive Project Management**: Click-to-initialize and structured development flow

## Default Structure

When you open the Schröd Explorer, you'll see the default structure:

```
📱 Project@Schröd          # Application root
├── 🏗️ Schröd.ui           # User Interface Domain
├── ⚙️ Schröd.logic        # Business Logic Domain
└── 🧪 Schröd.test         # Testing Domain
```

## Installation

1. Install from VS Code Marketplace
2. Open any project in VS Code
3. Look for "Schröd Explorer" in the sidebar
4. Start developing with structured AI guidance

## Usage

### Initialize a Project
1. Click on "📱 Project@Schröd" in the explorer
2. Use Command Palette: `Schröd: Initialize Project`
3. Follow the structured development workflow

### Commands Available
- `Schröd: Initialize Project` - Set up project structure
- `Schröd: Create App Spec` - Define application requirements
- `Schröd: Decompose to UI/Logic` - Break down into domains
- `Schröd: Add Feature` - Add new features
- `Schröd: Create Tickets` - Break features into implementation units

## Schrödinger Structure Concept

The framework follows a strict 4-level hierarchy:

1. **Level 1 - App**: Overall application specification
2. **Level 2 - Domain**: UI, Logic, or Test separation
3. **Level 3 - Feature**: Specific feature implementation
4. **Level 4 - Ticket**: Atomic implementation units

This structure provides clear context for AI development assistance and systematic project organization.

## Configuration

Customize the extension behavior in VS Code settings:

```json
{
  "schrod.showDefaultStructure": true,
  "schrod.defaultAI": "claude-sonnet-4",
  "schrod.autoRun": false,
  "schrod.parallelExecutions": 3
}
```

## Requirements

- VS Code 1.74.0 or higher
- Node.js for development projects

## Contributing

This extension is part of the Schrödinger Framework ecosystem. Visit our [GitHub repository](https://github.com/NishizukaKoichi/Schrod) for more information.

## License

MIT License - see LICENSE file for details.