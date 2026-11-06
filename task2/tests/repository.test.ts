import { FirstPointXComparator } from '../src/comparator/FirstPointXComparator';
import { FirstPointYComparator } from '../src/comparator/FirstPointYComparator';
import { IdComparator } from '../src/comparator/IdComparator';
import { NameComparator } from '../src/comparator/NameComparator';
import { Point } from '../src/entities/Point';
import { Triangle } from '../src/entities/Triangle';
import { RepositoryException } from '../src/exceptions/RepositoryException';
import { DistanceFromOriginSpecification } from '../src/specification/DistanceFromOriginSpecification';
import { FirstQuadrantSpecification } from '../src/specification/FirstQuadrantSpecification';
import { IdSpecification } from '../src/specification/IdSpecification';
import { MetricRangeSpecification } from '../src/specification/MetricRangeSpecification';
import { NameSpecification } from '../src/specification/NameSpecification';
import { AndSpecification } from '../src/specification/Specification';
import { Warehouse } from '../src/warehouse/Warehouse';
import {
  createRepository,
  firstQuadrantTriangle,
  rightTriangle,
  unitPyramid,
} from './helpers';

describe('ShapeRepository', () => {
  it('adds and removes shapes and syncs the warehouse', () => {
    const repository = createRepository();
    const warehouse = Warehouse.getInstance();
    const triangle = rightTriangle();

    repository.add(triangle);

    expect(repository.size()).toBe(1);
    expect(repository.getById('t1')).toBe(triangle);
    expect(warehouse.has('t1')).toBe(true);
    expect(warehouse.getParameters('t1')?.getArea()).toBeCloseTo(6, 5);
    expect(warehouse.getParameters('t1')?.getPerimeter()).toBeCloseTo(12, 5);

    const removed = repository.remove('t1');

    expect(removed).toBe(true);
    expect(repository.size()).toBe(0);
    expect(repository.getById('t1')).toBeUndefined();
    expect(warehouse.has('t1')).toBe(false);
    expect(repository.remove('missing')).toBe(false);
  });

  it('rejects duplicate ids', () => {
    const repository = createRepository();
    repository.add(rightTriangle('t1', 'a'));

    expect(() => repository.add(rightTriangle('t1', 'b'))).toThrow(RepositoryException);
    expect(repository.size()).toBe(1);
  });

  it('queries by id and name', () => {
    const repository = createRepository();
    repository.add(rightTriangle('t1', 'alpha'));
    repository.add(unitPyramid('p1', 'beta'));
    repository.add(firstQuadrantTriangle('t2', 'alpha'));

    const byId = repository.query(new IdSpecification('p1'));
    const byName = repository.query(new NameSpecification('alpha'));

    expect(byId).toHaveLength(1);
    expect(byId[0].getName()).toBe('beta');
    expect(byName).toHaveLength(2);
    expect(byName.map((shape) => shape.getId()).sort()).toEqual(['t1', 't2']);
  });

  it('finds shapes with all points in the first quadrant', () => {
    const repository = createRepository();
    repository.add(rightTriangle());
    repository.add(firstQuadrantTriangle());
    repository.add(unitPyramid());

    const found = repository.query(new FirstQuadrantSpecification());

    expect(found).toHaveLength(1);
    expect(found[0].getId()).toBe('t2');
    expect(found[0].getPoints().every((point) => point.getX() > 0 && point.getY() > 0)).toBe(true);
  });

  it('finds shapes by warehouse metric ranges', () => {
    const repository = createRepository();
    repository.add(rightTriangle());
    repository.add(unitPyramid());

    const byArea = repository.query(new MetricRangeSpecification('area', 5, 7));
    const byVolume = repository.query(new MetricRangeSpecification('volume', 3, 5));
    const byPerimeter = repository.query(new MetricRangeSpecification('perimeter', 10, 14));
    const empty = repository.query(new MetricRangeSpecification('area', 100, 200));

    expect(byArea.map((shape) => shape.getId())).toEqual(['t1']);
    expect(byVolume.map((shape) => shape.getId())).toEqual(['p1']);
    expect(byPerimeter.map((shape) => shape.getId())).toEqual(['t1']);
    expect(empty).toHaveLength(0);
    expect(Warehouse.getInstance().getParameters('p1')?.getVolume()).toBeCloseTo(4, 5);
  });

  it('finds shapes by distance from the origin', () => {
    const repository = createRepository();
    repository.add(rightTriangle());
    repository.add(firstQuadrantTriangle());

    const near = repository.query(new DistanceFromOriginSpecification(0, 0.5));
    const mid = repository.query(new DistanceFromOriginSpecification(1, 2));

    expect(near.map((shape) => shape.getId())).toEqual(['t1']);
    expect(mid.map((shape) => shape.getId())).toEqual(['t2']);
    expect(rightTriangle().getFirstPoint().distanceFromOrigin()).toBe(0);
  });

  it('combines specifications', () => {
    const repository = createRepository();
    repository.add(firstQuadrantTriangle('t2', 'gamma'));
    repository.add(rightTriangle('t1', 'gamma'));

    const combined = new AndSpecification(
      new NameSpecification('gamma'),
      new FirstQuadrantSpecification(),
    );
    const found = repository.query(combined);

    expect(found).toHaveLength(1);
    expect(found[0].getId()).toBe('t2');
  });

  it('sorts by id, name, and first-point coordinates', () => {
    const repository = createRepository();
    repository.add(new Triangle(
      't9',
      'zeta',
      new Point('A', 5, 1),
      new Point('B', 8, 1),
      new Point('C', 5, 5),
    ));
    repository.add(firstQuadrantTriangle('t2', 'alpha'));
    repository.add(rightTriangle('t1', 'mu'));

    expect(repository.sort(new IdComparator()).map((s) => s.getId())).toEqual(['t1', 't2', 't9']);
    expect(repository.sort(new NameComparator()).map((s) => s.getName())).toEqual(['alpha', 'mu', 'zeta']);
    expect(repository.sort(new FirstPointXComparator()).map((s) => s.getId())).toEqual(['t1', 't2', 't9']);
    expect(repository.sort(new FirstPointYComparator()).map((s) => s.getFirstPoint().getY()))
      .toEqual([0, 1, 1]);
  });
});
