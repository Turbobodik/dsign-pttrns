import fs from 'fs';
import path from 'path';
import { FileReadException } from '../exceptions/FileReadException';
import { COMMENT_LINE_PATTERN, EMPTY_LINE_PATTERN } from '../constants/regex';
import { logger } from '../logger/logger';

export class SafeFileReader {
  constructor(private readonly projectRoot: string = process.cwd()) {}

  readLines(relativePath: string): string[] {
    const resolvedPath = this.resolveInsideProject(relativePath);
    try {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      return content.split(/\r?\n/).filter((line) => (
        !EMPTY_LINE_PATTERN.test(line) && !COMMENT_LINE_PATTERN.test(line)
      ));
    } catch (error) {
      logger.error({ err: error, relativePath }, 'Failed to read data file');
      throw new FileReadException(`Cannot read file: ${relativePath}`);
    }
  }

  private resolveInsideProject(relativePath: string): string {
    if (path.isAbsolute(relativePath)) {
      throw new FileReadException(`Absolute paths are not allowed: ${relativePath}`);
    }
    const resolvedPath = path.resolve(this.projectRoot, relativePath);
    const relativeToRoot = path.relative(this.projectRoot, resolvedPath);
    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
      throw new FileReadException(`File is outside the project directory: ${relativePath}`);
    }
    return resolvedPath;
  }
}
