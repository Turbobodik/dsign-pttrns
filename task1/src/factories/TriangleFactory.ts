import { Point } from '../entities/Point';
import { Triangle } from '../entities/Triangle';
import { InvalidShapeDataException } from '../exceptions/InvalidShapeDataException';
import { TOKEN_SPLIT_PATTERN } from '../constants/regex';
import { NumberValidator } from '../validators/NumberValidator';
import { TriangleDataValidator } from '../validators/TriangleDataValidator';
import { ShapeFactory } from './ShapeFactory';
import { logger } from '../logger/logger';

export class TriangleFactory extends ShapeFactory {
  constructor(
    private readonly numberValidator: NumberValidator,
    private readonly dataValidator: TriangleDataValidator,
  ) {
    super();
  }

  /** Boundary: recovers from invalid lines (catch is not next to throw). */
  createFromLine(line: string): Triangle | null {
    try {
      return this.createOrThrow(line);
    } catch (error) {
      if (error instanceof InvalidShapeDataException) {
        logger.warn({
          reason: error.message,
          rawLine: line,
          pointsInSpace: 'unavailable (line rejected before entity creation)',
        }, 'Skipped invalid triangle line');
        return null;
      }
      logger.error({
        err: error,
        rawLine: line,
        pointsInSpace: 'unavailable (line rejected before entity creation)',
      }, 'Unexpected error while creating a triangle');
      return null;
    }
  }

  /** Throws InvalidShapeDataException — caller must handle. */
  private createOrThrow(line: string): Triangle {
    const tokens = line.trim().split(TOKEN_SPLIT_PATTERN);
    if (!this.dataValidator.hasValidTokenCount(tokens)) {
      throw new InvalidShapeDataException(
        `Triangle line must contain id and 6 coordinates, got ${tokens.length} tokens: "${line}"`,
      );
    }
    const name = tokens[0];
    const coordinateTokens = tokens.slice(1);
    if (!this.dataValidator.hasValidCoordinates(coordinateTokens)) {
      throw new InvalidShapeDataException(
        `Triangle line contains a non-numeric coordinate: "${line}"`,
      );
    }
    const values = coordinateTokens.map((token) => this.numberValidator.parseNumber(token));
    const [x1, y1, x2, y2, x3, y3] = values;
    if (!this.dataValidator.formsTriangle(x1, y1, x2, y2, x3, y3)) {
      throw new InvalidShapeDataException(
        `Points are collinear, cannot create triangle "${name}"`,
      );
    }
    const firstPoint = new Point(`${name}-p1`, x1, y1, 0);
    const secondPoint = new Point(`${name}-p2`, x2, y2, 0);
    const thirdPoint = new Point(`${name}-p3`, x3, y3, 0);
    return new Triangle(name, firstPoint, secondPoint, thirdPoint);
  }
}
