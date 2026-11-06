import { Shape } from '../entities/Shape';
import type { Comparator } from './Comparator';

export class IdComparator implements Comparator<Shape> {
  compare(left: Shape, right: Shape): number {
    return left.getId().localeCompare(right.getId());
  }
}
