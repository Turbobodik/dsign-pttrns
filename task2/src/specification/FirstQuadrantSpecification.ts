import { Shape } from '../entities/Shape';
import type { Specification } from './Specification';

/** All vertices lie in the first quadrant of the XY plane (x > 0, y > 0). */
export class FirstQuadrantSpecification implements Specification<Shape> {
  isSatisfiedBy(candidate: Shape): boolean {
    return candidate.getPoints().every((point) => point.isInFirstQuadrant());
  }
}
