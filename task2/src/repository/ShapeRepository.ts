import type { Comparator } from '../comparator/Comparator';
import { Shape } from '../entities/Shape';
import { RepositoryException } from '../exceptions/RepositoryException';
import type { Specification } from '../specification/Specification';
import { Warehouse } from '../warehouse/Warehouse';

/** In-memory repository of geometric shapes (Repository pattern). */
export class ShapeRepository {
  private readonly shapes = new Map<string, Shape>();

  constructor(private readonly warehouse: Warehouse = Warehouse.getInstance()) {}

  add(shape: Shape): void {
    if (this.shapes.has(shape.getId())) {
      throw new RepositoryException(`Shape with id "${shape.getId()}" already exists`);
    }
    shape.attach(this.warehouse);
    this.shapes.set(shape.getId(), shape);
    this.warehouse.update(shape);
  }

  remove(id: string): boolean {
    const shape = this.shapes.get(id);
    if (shape === undefined) {
      return false;
    }
    shape.detach(this.warehouse);
    this.shapes.delete(id);
    this.warehouse.remove(id);
    return true;
  }

  getById(id: string): Shape | undefined {
    return this.shapes.get(id);
  }

  getAll(): Shape[] {
    return [...this.shapes.values()];
  }

  query(specification: Specification<Shape>): Shape[] {
    return this.getAll().filter((shape) => specification.isSatisfiedBy(shape));
  }

  sort(comparator: Comparator<Shape>): Shape[] {
    return this.getAll().sort((left, right) => comparator.compare(left, right));
  }

  size(): number {
    return this.shapes.size;
  }

  clear(): void {
    this.getAll().forEach((shape) => {
      shape.detach(this.warehouse);
      this.warehouse.remove(shape.getId());
    });
    this.shapes.clear();
  }
}
