import { Shape } from '../entities/Shape';
import { Warehouse } from '../warehouse/Warehouse';
import type { Specification } from './Specification';

export type MetricKind = 'area' | 'perimeter' | 'volume' | 'surfaceArea';

/** Matches shapes whose warehouse metric falls within [min, max] inclusive. */
export class MetricRangeSpecification implements Specification<Shape> {
  constructor(
    private readonly metric: MetricKind,
    private readonly min: number,
    private readonly max: number,
    private readonly warehouse: Warehouse = Warehouse.getInstance(),
  ) {}

  isSatisfiedBy(candidate: Shape): boolean {
    const parameters = this.warehouse.getParameters(candidate.getId());
    if (parameters === undefined) {
      return false;
    }
    const value = this.readMetric(parameters);
    if (value === null) {
      return false;
    }
    return value >= this.min && value <= this.max;
  }

  private readMetric(parameters: {
    getArea(): number | null;
    getPerimeter(): number | null;
    getVolume(): number | null;
    getSurfaceArea(): number | null;
  }): number | null {
    if (this.metric === 'area') {
      return parameters.getArea();
    }
    if (this.metric === 'perimeter') {
      return parameters.getPerimeter();
    }
    if (this.metric === 'volume') {
      return parameters.getVolume();
    }
    return parameters.getSurfaceArea();
  }
}
