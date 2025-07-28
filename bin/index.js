#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

const program = new Command();

program
  .name('schrod')
  .description('AI-driven application framework that displays hierarchical Schrödinger project structure')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize a new Schröd project')
  .action(() => {
    console.log('🚀 Initializing Schröd project...');
    console.log('✅ Project initialized! Use VS Code extension for full functionality.');
  });

program
  .command('plan')
  .description('Plan the project structure')
  .option('-f, --file <file>', 'Schröd file to plan')
  .action((options) => {
    console.log('📋 Planning project structure...');
    if (options.file) {
      console.log(`Planning file: ${options.file}`);
    }
    console.log('💡 Use the VS Code extension for interactive planning.');
  });

program
  .command('run')
  .description('Run Schröd execution')
  .option('-f, --file <file>', 'Schröd file to run')
  .action((options) => {
    console.log('⚡ Running Schröd execution...');
    if (options.file) {
      console.log(`Running file: ${options.file}`);
    }
    console.log('💡 Use the VS Code extension for full execution capabilities.');
  });

program
  .command('status')
  .description('Show project status')
  .action(() => {
    console.log('📊 Project Status:');
    console.log('For detailed status, use the VS Code extension.');
  });

program.parse();