// File system operations using Node.js fs module
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileSystemService {
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async isDirectory(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  async readDirectory(dirPath: string): Promise<string[]> {
    return await fs.readdir(dirPath);
  }

  async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, 'utf-8');
  }

  async readJson<T>(filePath: string): Promise<T> {
    const content = await this.readFile(filePath);
    return JSON.parse(content) as T;
  }

  async writeJson(filePath: string, data: any): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await this.writeFile(filePath, content);
  }

  async deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    await fs.rm(dirPath, { recursive: true, force: true });
  }

  async copyFile(source: string, destination: string): Promise<void> {
    await fs.copyFile(source, destination);
  }

  async moveFile(source: string, destination: string): Promise<void> {
    await fs.rename(source, destination);
  }

  getRelativePath(from: string, to: string): string {
    return path.relative(from, to);
  }

  joinPath(...paths: string[]): string {
    return path.join(...paths);
  }

  getDirectoryName(filePath: string): string {
    return path.dirname(filePath);
  }

  getFileName(filePath: string): string {
    return path.basename(filePath);
  }

  getFileExtension(filePath: string): string {
    return path.extname(filePath);
  }
}