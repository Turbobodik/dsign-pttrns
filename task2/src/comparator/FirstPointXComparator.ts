import { Shape } from '../entities/Shape';
import type { Comparator } from './Comparator';

export class FirstPointXComparator implements Comparator<Shape> {
  compare(left: Shape, right: Shape): number {
    return left.getFirstPoint().getX() - right.getFirstPoint().getX();
  }
}
