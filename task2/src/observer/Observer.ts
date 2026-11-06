import type { Shape } from '../entities/Shape';

export interface Observer {
  update(shape: Shape): void;
}
