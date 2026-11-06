import { FirstPointXComparator } from './comparator/FirstPointXComparator';
import { IdComparator } from './comparator/IdComparator';
import { NameComparator } from './comparator/NameComparator';
import { Point } from './entities/Point';
import { Pyramid } from './entities/Pyramid';
import { Shape } from './entities/Shape';
import { Triangle } from './entities/Triangle';
import { RepositoryException } from './exceptions/RepositoryException';
import { describeShapePoints } from './formatting/ShapeDescribe';
import { ShapeRepository } from './repository/ShapeRepository';
import { DistanceFromOriginSpecification } from './specification/DistanceFromOriginSpecification';
import { FirstQuadrantSpecification } from './specification/FirstQuadrantSpecification';
import { IdSpecification } from './specification/IdSpecification';
import { MetricRangeSpecification } from './specification/MetricRangeSpecification';
import { NameSpecification } from './specification/NameSpecification';
import { Warehouse } from './warehouse/Warehouse';

function addShape(repository: ShapeRepository, shape: Shape): void {
  try {
    repository.add(shape);
    console.log(
      `Added ${shape.constructor.name} id=${shape.getId()} name=${shape.getName()}`,
    );
    console.log(`  points: ${describeShapePoints(shape)}`);
  } catch (error) {
    if (error instanceof RepositoryException) {
      console.error('Repository error:', error.message);
      return;
    }
    throw error;
  }
}

function main(): void {
  try {
    Warehouse.resetInstance();
    const repository = new ShapeRepository();

    const triangle = new Triangle(
      't1',
      'alpha',
      new Point('A', 1, 1),
      new Point('B', 4, 1),
      new Point('C', 1, 5),
    );
    const pyramid = new Pyramid(
      'p1',
      'beta',
      [
        new Point('B1', 0, 0, 0),
        new Point('B2', 2, 0, 0),
        new Point('B3', 2, 2, 0),
        new Point('B4', 0, 2, 0),
      ],
      new Point('Apex', 1, 1, 3),
    );

    addShape(repository, triangle);
    addShape(repository, pyramid);
    // duplicate id — caught, app continues
    addShape(repository, new Triangle(
      't1',
      'duplicate',
      new Point('A', 0, 0),
      new Point('B', 1, 0),
      new Point('C', 0, 1),
    ));

    const warehouse = Warehouse.getInstance();
    const triangleParams = warehouse.getParameters('t1');
    const pyramidParams = warehouse.getParameters('p1');

    console.log('Repository size:', repository.size());
    console.log('Triangle area/perimeter:', triangleParams?.getArea(), triangleParams?.getPerimeter());
    console.log('Pyramid volume/surface:', pyramidParams?.getVolume(), pyramidParams?.getSurfaceArea());
    console.log('By id t1:', repository.query(new IdSpecification('t1')).map((s) => s.getName()));
    console.log('By name beta:', repository.query(new NameSpecification('beta')).map((s) => s.getId()));
    console.log('First quadrant:', repository.query(new FirstQuadrantSpecification()).map((s) => s.getId()));
    console.log(
      'Area in [0, 10]:',
      repository.query(new MetricRangeSpecification('area', 0, 10)).map((s) => s.getId()),
    );
    console.log(
      'Distance [0, 2]:',
      repository.query(new DistanceFromOriginSpecification(0, 2)).map((s) => s.getId()),
    );
    console.log('Sorted by id:', repository.sort(new IdComparator()).map((s) => s.getId()));
    console.log('Sorted by name:', repository.sort(new NameComparator()).map((s) => s.getName()));
    console.log('Sorted by first X:', repository.sort(new FirstPointXComparator()).map((s) => s.getId()));

    triangle.setFirstPoint(new Point('A', 2, 2));
    console.log('After mutate, triangle area:', warehouse.getParameters('t1')?.getArea());
  } catch (error) {
    console.error('Application failed:', error);
  }
}

main();
