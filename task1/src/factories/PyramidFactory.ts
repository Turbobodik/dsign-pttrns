import { Point } from '../entities/Point';
import { Pyramid } from '../entities/Pyramid';
import { InvalidShapeDataException } from '../exceptions/InvalidShapeDataException';
import { TOKEN_SPLIT_PATTERN } from '../constants/regex';
import { NumberValidator } from '../validators/NumberValidator';
import { ParsedPointCoordinates, PyramidDataValidator } from '../validators/PyramidDataValidator';
import { ShapeFactory } from './ShapeFactory';
import { logger } from '../logger/logger';

export class PyramidFactory extends ShapeFactory {
  constructor(
    private readonly numberValidator: NumberValidator,
    private readonly dataValidator: PyramidDataValidator,
  ) {
    super();
  }

  /** Boundary: recovers from invalid lines (catch is not next to throw). */
  createFromLine(line: string): Pyramid | null {
    try {
      return this.createOrThrow(line);
    } catch (error) {
      if (error instanceof InvalidShapeDataException) {
        logger.warn({
          reason: error.message,
          rawLine: line,
          pointsInSpace: 'unavailable (line rejected before entity creation)',
        }, 'Skipped invalid pyramid line');
        return null;
      }
      logger.error({
        err: error,
        rawLine: line,
        pointsInSpace: 'unavailable (line rejected before entity creation)',
      }, 'Unexpected error while creating a pyramid');
      return null;
    }
  }

  /** Throws InvalidShapeDataException — caller must handle. */
  private createOrThrow(line: string): Pyramid {
    const tokens = line.trim().split(TOKEN_SPLIT_PATTERN);
    if (!this.dataValidator.hasValidTokenCount(tokens)) {
      throw new InvalidShapeDataException(
        `Pyramid line must contain id and 15 coordinates, got ${tokens.length} tokens: "${line}"`,
      );
    }
    const name = tokens[0];
    const coordinateTokens = tokens.slice(1);
    if (!this.dataValidator.hasValidCoordinates(coordinateTokens)) {
      throw new InvalidShapeDataException(
        `Pyramid line contains a non-numeric coordinate: "${line}"`,
      );
    }
    const values = coordinateTokens.map((token) => this.numberValidator.parseNumber(token));
    const parsedPoints = this.toCoordinates(values);
    const base = parsedPoints.slice(0, 4);
    const apex = parsedPoints[4];
    if (!this.dataValidator.hasDistinctPoints(parsedPoints)) {
      throw new InvalidShapeDataException(`Pyramid "${name}" has duplicate vertices`);
    }
    if (!this.dataValidator.isAxisAlignedRectangle(base)) {
      throw new InvalidShapeDataException(
        `Pyramid "${name}" base is not an axis-aligned rectangle parallel to a coordinate plane`,
      );
    }
    if (!this.dataValidator.isApexOffBasePlane(base, apex)) {
      throw new InvalidShapeDataException(`Pyramid "${name}" apex lies on the base plane`);
    }
    const basePoints = base.map((point, index) => new Point(
      `${name}-b${index + 1}`,
      point.x,
      point.y,
      point.z,
    ));
    const apexPoint = new Point(`${name}-apex`, apex.x, apex.y, apex.z);
    return new Pyramid(name, basePoints, apexPoint);
  }

  private toCoordinates(values: number[]): ParsedPointCoordinates[] {
    const points: ParsedPointCoordinates[] = [];
    for (let index = 0; index < values.length; index += 3) {
      points.push({
        x: values[index],
        y: values[index + 1],
        z: values[index + 2],
      });
    }
    return points;
  }
}
