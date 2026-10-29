import path from 'path';
import { PROJECT_DATA_DIRECTORY, PYRAMIDS_FILE_NAME, TRIANGLES_FILE_NAME } from '../constants/geometry';
import { Triangle } from '../entities/Triangle';
import { Pyramid } from '../entities/Pyramid';
import { TriangleFactory } from '../factories/TriangleFactory';
import { PyramidFactory } from '../factories/PyramidFactory';
import { describePyramidPoints, describeTrianglePoints } from '../formatting/ShapeDescribe';
import { SafeFileReader } from '../io/SafeFileReader';
import { logger } from '../logger/logger';
import { PyramidService } from '../services/PyramidService';
import { TriangleService } from '../services/TriangleService';

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
      this.processTrianglesFromFile();
      this.processPyramidsFromFile();
    } catch (error) {
      logger.error({ err: error }, 'Application failed');
    }
  }

  private processTrianglesFromFile(): void {
    const relativePath = path.join(PROJECT_DATA_DIRECTORY, TRIANGLES_FILE_NAME);
    const lines = this.fileReader.readLines(relativePath);
    lines.forEach((line) => {
      const triangle = this.triangleFactory.createFromLine(line);
      if (triangle !== null) {
        this.logTriangleReport(triangle);
      }
    });
  }

  private processPyramidsFromFile(): void {
    const relativePath = path.join(PROJECT_DATA_DIRECTORY, PYRAMIDS_FILE_NAME);
    const lines = this.fileReader.readLines(relativePath);
    lines.forEach((line) => {
      const pyramid = this.pyramidFactory.createFromLine(line);
      if (pyramid !== null) {
        this.logPyramidReport(pyramid);
      }
    });
  }

  private logTriangleReport(triangle: Triangle): void {
    const pointsInSpace = describeTrianglePoints(triangle);
    try {
      logger.info({
        id: triangle.getId(),
        pointsInSpace,
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
      logger.error({
        err: error,
        id: triangle.getId(),
        pointsInSpace,
      }, 'Failed to compute triangle properties');
    }
  }

  private logPyramidReport(pyramid: Pyramid): void {
    const pointsInSpace = describePyramidPoints(pyramid);
    try {
      logger.info({
        id: pyramid.getId(),
        pointsInSpace,
        isPyramid: this.pyramidService.isPyramid(pyramid),
        volume: this.pyramidService.calculateVolume(pyramid),
        surfaceArea: this.pyramidService.calculateSurfaceArea(pyramid),
        baseOnCoordinatePlane: this.pyramidService.isBaseOnCoordinatePlane(pyramid),
        volumeSplits: this.pyramidService.calculateVolumeSplits(pyramid),
      }, 'Pyramid computed');
    } catch (error) {
      logger.error({
        err: error,
        id: pyramid.getId(),
        pointsInSpace,
      }, 'Failed to compute pyramid properties');
    }
  }
}
