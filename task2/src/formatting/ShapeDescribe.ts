import { Shape } from '../entities/Shape';

/** Compact point list for console output, e.g. `A(1, 1, 0) → B(4, 1, 0) → C(1, 5, 0)`. */
export function describeShapePoints(shape: Shape): string {
  return shape.getPoints().map((point) => point.describe()).join(' → ');
}
