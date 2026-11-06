import { Point } from '../src/entities/Point';
import { Warehouse } from '../src/warehouse/Warehouse';
import {
  createRepository,
  rightTriangle,
  unitPyramid,
} from './helpers';

describe('Warehouse (Observer + Singleton)', () => {
  it('exposes a single shared instance', () => {
    Warehouse.resetInstance();
    const first = Warehouse.getInstance();
    const second = Warehouse.getInstance();

    expect(first).toBe(second);
    expect(Warehouse.getInstance()).toBe(first);
  });

  it('recalculates triangle metrics when a vertex changes', () => {
    const repository = createRepository();
    const warehouse = Warehouse.getInstance();
    const triangle = rightTriangle();
    repository.add(triangle);

    const before = warehouse.getParameters('t1');
    expect(before?.getArea()).toBeCloseTo(6, 5);
    expect(before?.getPerimeter()).toBeCloseTo(12, 5);

    triangle.setFirstPoint(new Point('A', 1, 0));

    const after = warehouse.getParameters('t1');
    expect(after?.getArea()).toBeCloseTo(4, 5);
    expect(after?.getPerimeter()).toBeCloseTo(2 + 5 + Math.sqrt(17), 5);
    expect(after?.getArea()).not.toBeCloseTo(6, 5);
    expect(after?.getPerimeter()).not.toBeCloseTo(12, 5);
  });

  it('recalculates pyramid metrics when the apex changes', () => {
    const repository = createRepository();
    const warehouse = Warehouse.getInstance();
    const pyramid = unitPyramid();
    repository.add(pyramid);

    expect(warehouse.getParameters('p1')?.getVolume()).toBeCloseTo(4, 5);

    pyramid.setApex(new Point('Apex', 1, 1, 6));

    const after = warehouse.getParameters('p1');
    expect(after?.getVolume()).toBeCloseTo(8, 5);
    expect(after?.getSurfaceArea()).toBeGreaterThan(0);
    expect(after?.getVolume()).not.toBeCloseTo(4, 5);
  });

  it('stops updating after the shape is removed from the repository', () => {
    const repository = createRepository();
    const warehouse = Warehouse.getInstance();
    const triangle = rightTriangle();
    repository.add(triangle);
    repository.remove('t1');

    triangle.setSecondPoint(new Point('B', 10, 0));

    expect(warehouse.has('t1')).toBe(false);
    expect(warehouse.getParameters('t1')).toBeUndefined();
    expect(warehouse.size()).toBe(0);
  });
});
