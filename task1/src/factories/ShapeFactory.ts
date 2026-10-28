import { Shape } from '../entities/Shape';

export abstract class ShapeFactory {
  abstract createFromLine(line: string): Shape | null;
}
