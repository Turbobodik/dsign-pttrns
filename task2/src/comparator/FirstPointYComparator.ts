import { Shape } from '../entities/Shape';
import type { Comparator } from './Comparator';

export class FirstPointYComparator implements Comparator<Shape> {
  compare(left: Shape, right: Shape): number {
    return left.getFirstPoint().getY() - right.getFirstPoint().getY();
  }
}
