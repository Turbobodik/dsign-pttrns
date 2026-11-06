import { Shape } from '../entities/Shape';
import type { Comparator } from './Comparator';

export class NameComparator implements Comparator<Shape> {
  compare(left: Shape, right: Shape): number {
    return left.getName().localeCompare(right.getName());
  }
}
