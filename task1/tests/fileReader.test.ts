import path from 'path';
import { SafeFileReader } from '../src/io/SafeFileReader';
import { FileReadException } from '../src/exceptions/FileReadException';

describe('SafeFileReader', () => {
  const reader = new SafeFileReader();

  test('reads project data files and skips comments with empty lines', () => {
    const triangleLines = reader.readLines(path.join('data', 'triangles.txt'));
    const pyramidLines = reader.readLines(path.join('data', 'pyramids.txt'));
    expect(triangleLines.length).toBeGreaterThan(5);
    expect(pyramidLines.length).toBeGreaterThan(3);
    expect(triangleLines.some((line) => line.startsWith('#'))).toBe(false);
    expect(triangleLines).toEqual(expect.arrayContaining([
      'right-345 0.0 0.0 3.0 0.0 0.0 4.0',
    ]));
    expect(pyramidLines[0]).toContain('pyr-on-xy');
  });

  test('rejects paths outside the project catalog', () => {
    expect(() => reader.readLines('..\\secrets.txt')).toThrow(FileReadException);
    expect(() => reader.readLines('/tmp/outside.txt')).toThrow(FileReadException);
    expect(() => reader.readLines('data\\missing.txt')).toThrow(FileReadException);
    try {
      reader.readLines('../outside.txt');
    } catch (error) {
      expect(error).toBeInstanceOf(FileReadException);
      expect((error as FileReadException).message).toMatch(/outside|Absolute|Cannot/i);
    }
  });
});
