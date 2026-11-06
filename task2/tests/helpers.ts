import { Point } from '../src/entities/Point';
import { Pyramid } from '../src/entities/Pyramid';
import { Triangle } from '../src/entities/Triangle';
import { ShapeRepository } from '../src/repository/ShapeRepository';
import { Warehouse } from '../src/warehouse/Warehouse';

export function resetWarehouse(): Warehouse {
  Warehouse.resetInstance();
  return Warehouse.getInstance();
}

export function createRepository(): ShapeRepository {
  resetWarehouse();
  return new ShapeRepository();
}

export function rightTriangle(id = 't1', name = 'alpha'): Triangle {
  return new Triangle(
    id,
    name,
    new Point('A', 0, 0),
    new Point('B', 3, 0),
    new Point('C', 0, 4),
  );
}

export function firstQuadrantTriangle(id = 't2', name = 'gamma'): Triangle {
  return new Triangle(
    id,
    name,
    new Point('A', 1, 1),
    new Point('B', 4, 1),
    new Point('C', 1, 5),
  );
}

export function unitPyramid(id = 'p1', name = 'beta'): Pyramid {
  return new Pyramid(
    id,
    name,
    [
      new Point('B1', 0, 0, 0),
      new Point('B2', 2, 0, 0),
      new Point('B3', 2, 2, 0),
      new Point('B4', 0, 2, 0),
    ],
    new Point('Apex', 1, 1, 3),
  );
}
