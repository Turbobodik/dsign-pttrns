import { Shape } from '../entities/Shape';
import type { Specification } from './Specification';

export class IdSpecification implements Specification<Shape> {
  constructor(private readonly id: string) {}

  isSatisfiedBy(candidate: Shape): boolean {
    return candidate.getId() === this.id;
  }
}
