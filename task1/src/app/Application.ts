import path from 'path';
import { PROJECT_DATA_DIRECTORY, PYRAMIDS_FILE_NAME, TRIANGLES_FILE_NAME } from '../constants/geometry';
import { TriangleFactory } from '../factories/TriangleFactory';
import { PyramidFactory } from '../factories/PyramidFactory';
import { SafeFileReader } from '../io/SafeFileReader';
import { logger } from '../logger/logger';
import { PyramidService } from '../services/PyramidService';
import { TriangleService } from '../services/TriangleService';
import { Triangle } from '../entities/Triangle';
import { Pyramid } from '../entities/Pyramid';

export class Application {
  constructor(
    private readonly fileReader: SafeFileReader,
    private readonly triangleFactory: TriangleFactory,
    private readonly pyramidFactory: PyramidFactory,
    private readonly triangleService: TriangleService,
    private readonly pyramidService: PyramidService,
  ) {}

  run(): void {
    try {
      this.processTriangles();
      this.processPyramids();
    } catch (error) {
      logger.error({ err: error }, 'Application failed');
    }
  }

  private processTriangles(): void {
    const relativePath = path.join(PROJECT_DATA_DIRECTORY, TRIANGLES_FILE_NAME);
    const lines = this.fileReader.readLines(relativePath);
    lines.forEach((line) => {
      const triangle = this.triangleFactory.createFromLine(line);
      if (triangle !== null) {
        this.logTriangle(triangle);
      }
    });
  }

  private processPyramids(): void {
    const relativePath = path.join(PROJECT_DATA_DIRECTORY, PYRAMIDS_FILE_NAME);
    const lines = this.fileReader.readLines(relativePath);
    lines.forEach((line) => {
      const pyramid = this.pyramidFactory.createFromLine(line);
      if (pyramid !== null) {
        this.logPyramid(pyramid);
      }
    });
  }

  private logTriangle(triangle: Triangle): void {
    try {
      logger.info({
        id: triangle.getId(),
        isTriangle: this.triangleService.isTriangle(triangle),
        area: this.triangleService.calculateArea(triangle),
        perimeter: this.triangleService.calculatePerimeter(triangle),
        isEquilateral: this.triangleService.isEquilateral(triangle),
        isIsosceles: this.triangleService.isIsosceles(triangle),
        isRight: this.triangleService.isRight(triangle),
        isAcute: this.triangleService.isAcute(triangle),
        isObtuse: this.triangleService.isObtuse(triangle),
      }, 'Triangle computed');
    } catch (error) {
      logger.error({ err: error, id: triangle.getId() }, 'Failed to compute triangle properties');
    }
  }

  private logPyramid(pyramid: Pyramid): void {
    try {
      logger.info({
        id: pyramid.getId(),
        isPyramid: this.pyramidService.isPyramid(pyramid),
        volume: this.pyramidService.calculateVolume(pyramid),
        surfaceArea: this.pyramidService.calculateSurfaceArea(pyramid),
        baseOnCoordinatePlane: this.pyramidService.isBaseOnCoordinatePlane(pyramid),
        volumeSplits: this.pyramidService.calculateVolumeSplits(pyramid),
      }, 'Pyramid computed');
    } catch (error) {
      logger.error({ err: error, id: pyramid.getId() }, 'Failed to compute pyramid properties');
    }
  }
}
