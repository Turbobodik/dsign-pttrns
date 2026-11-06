import { Shape } from '../entities/Shape';
import type { Specification } from './Specification';

/**
 * Matches shapes whose distance from the origin (via the first vertex)
 * lies within [minDistance, maxDistance] inclusive.
 */
export class DistanceFromOriginSpecification implements Specification<Shape> {
  constructor(
    private readonly minDistance: number,
    private readonly maxDistance: number,
  ) {}

  isSatisfiedBy(candidate: Shape): boolean {
    const distance = candidate.getFirstPoint().distanceFromOrigin();
    return distance >= this.minDistance && distance <= this.maxDistance;
  }
}
