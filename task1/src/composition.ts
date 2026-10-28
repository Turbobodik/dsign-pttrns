import { Application } from './app/Application';
import { PyramidFactory } from './factories/PyramidFactory';
import { TriangleFactory } from './factories/TriangleFactory';
import { Geometry } from './geometry/Geometry';
import { SafeFileReader } from './io/SafeFileReader';
import { PyramidService } from './services/PyramidService';
import { TriangleService } from './services/TriangleService';
import { CalculationValidator } from './validators/CalculationValidator';
import { NumberValidator } from './validators/NumberValidator';
import { PyramidDataValidator } from './validators/PyramidDataValidator';
import { TriangleDataValidator } from './validators/TriangleDataValidator';

/** Single place to wire dependencies (app + tests). */
export function createAppGraph() {
  const geometry = new Geometry();
  const numberValidator = new NumberValidator();
  const triangleDataValidator = new TriangleDataValidator(numberValidator, geometry);
  const pyramidDataValidator = new PyramidDataValidator(numberValidator, geometry);
  const calculationValidator = new CalculationValidator(geometry);
  const triangleFactory = new TriangleFactory(numberValidator, triangleDataValidator);
  const pyramidFactory = new PyramidFactory(numberValidator, pyramidDataValidator);
  const triangleService = new TriangleService(geometry, calculationValidator);
  const pyramidService = new PyramidService(geometry, calculationValidator, pyramidDataValidator);
  const fileReader = new SafeFileReader();
  return {
    geometry,
    numberValidator,
    triangleDataValidator,
    pyramidDataValidator,
    calculationValidator,
    triangleFactory,
    pyramidFactory,
    triangleService,
    pyramidService,
    fileReader,
  };
}

export function createApplication(): Application {
  const graph = createAppGraph();
  return new Application(
    graph.fileReader,
    graph.triangleFactory,
    graph.pyramidFactory,
    graph.triangleService,
    graph.pyramidService,
  );
}
