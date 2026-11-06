import { Shape } from '../entities/Shape';
import type { Specification } from './Specification';

export class NameSpecification implements Specification<Shape> {
  constructor(private readonly name: string) {}

  isSatisfiedBy(candidate: Shape): boolean {
    return candidate.getName() === this.name;
  }
}
