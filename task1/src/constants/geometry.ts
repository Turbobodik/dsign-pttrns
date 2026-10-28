export const EPSILON = 1e-8;

export const PROJECT_DATA_DIRECTORY = 'data';

export const TRIANGLES_FILE_NAME = 'triangles.txt';

export const PYRAMIDS_FILE_NAME = 'pyramids.txt';

export const LOG_FILE_PATH = 'logs/app.log';

export type CoordinateAxis = 'x' | 'y' | 'z';

export const COORDINATE_PLANES = ['XY', 'XZ', 'YZ'] as const;

export type CoordinatePlane = (typeof COORDINATE_PLANES)[number];
