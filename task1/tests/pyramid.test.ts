import { Pyramid } from '../src/entities/Pyramid';
import { createTestContext } from './helpers';

describe('Pyramid', () => {
  const ctx = createTestContext();

  const onXyLine = 'pyr-on-xy 0.0 0.0 0.0 4.0 0.0 0.0 4.0 4.0 0.0 0.0 4.0 0.0 2.0 2.0 6.0';
  const splitLine = 'pyr-split -2.0 -2.0 0.0 2.0 -2.0 0.0 2.0 2.0 0.0 -2.0 2.0 0.0 0.0 0.0 3.0';
  const onYzLine = 'pyr-on-yz 0.0 0.0 0.0 0.0 4.0 0.0 0.0 4.0 4.0 0.0 0.0 4.0 5.0 2.0 2.0';

  test('creates an axis-aligned pyramid and computes volume and surface area', () => {
    const pyramid = ctx.pyramidFactory.createFromLine(onXyLine);
    expect(pyramid).not.toBeNull();
    expect(pyramid).toBeInstanceOf(Pyramid);
    expect(pyramid?.getId()).toEqual('pyr-on-xy');
    expect(pyramid?.getPoints()).toHaveLength(5);
    expect(pyramid?.getBasePoints()).toHaveLength(4);
    expect(ctx.pyramidService.isPyramid(pyramid as Pyramid)).toBe(true);
    expect(ctx.pyramidService.calculateVolume(pyramid as Pyramid)).toBeCloseTo(32, 5);
    expect(ctx.pyramidService.calculateSurfaceArea(pyramid as Pyramid)).toBeGreaterThan(16);
    expect(ctx.pyramidService.isBaseOnCoordinatePlane(pyramid as Pyramid)).toBe(true);
  });

  test('reports volume ratios when coordinate planes cut the interior', () => {
    const pyramid = ctx.pyramidFactory.createFromLine(splitLine) as Pyramid;
    const splits = ctx.pyramidService.calculateVolumeSplits(pyramid);
    const yz = splits.find((item) => item.plane === 'YZ');
    const xz = splits.find((item) => item.plane === 'XZ');
    const xy = splits.find((item) => item.plane === 'XY');
    expect(splits).toHaveLength(3);
    expect(ctx.pyramidService.calculateVolume(pyramid)).toBeCloseTo(16, 5);
    expect(yz?.cutsInterior).toBe(true);
    expect(xz?.cutsInterior).toBe(true);
    expect(xy?.cutsInterior).toBe(false);
    expect(yz?.ratio).toBeCloseTo(1, 4);
    expect(xz?.ratio).toBeCloseTo(1, 4);
    expect(yz?.volumePositive).toBeCloseTo(8, 4);
    expect(yz?.volumeNegative).toBeCloseTo(8, 4);
  });

  test('detects a base lying on the YZ coordinate plane', () => {
    const pyramid = ctx.pyramidFactory.createFromLine(onYzLine) as Pyramid;
    expect(ctx.pyramidService.isBaseOnCoordinatePlane(pyramid)).toBeTruthy();
    expect(ctx.pyramidService.isPyramid(pyramid)).toBeTruthy();
    expect(ctx.pyramidService.calculateVolume(pyramid)).toBeCloseTo(80 / 3, 4);
    expect(pyramid.getApex().getX()).toBe(5);
    expect(pyramid.getBasePoints().every((point) => point.getX() === 0)).toBe(true);
  });

  test('skips invalid pyramid source lines', () => {
    expect(ctx.pyramidFactory.createFromLine('pyr-short 0.0 0.0 0.0 1.0 0.0 0.0')).toBeNull();
    expect(ctx.pyramidFactory.createFromLine(
      'pyr-letter 0.0 0.0 0.0 4a.0 0.0 0.0 4.0 4.0 0.0 0.0 4.0 0.0 2.0 2.0 5.0',
    )).toBeNull();
    expect(ctx.pyramidFactory.createFromLine(
      'pyr-flat 0.0 0.0 0.0 4.0 0.0 0.0 4.0 4.0 0.0 0.0 4.0 0.0 2.0 2.0 0.0',
    )).toBeNull();
    expect(ctx.pyramidFactory.createFromLine(
      'pyr-not-rect 0.0 0.0 0.0 4.0 0.0 0.0 5.0 3.0 0.0 1.0 4.0 0.0 2.0 2.0 5.0',
    )).toBeNull();
    expect(ctx.pyramidDataValidator.hasValidTokenCount(new Array(16).fill('1'))).toBe(true);
    expect(ctx.pyramidDataValidator.hasValidTokenCount(['id'])).toBe(false);
  });
});
