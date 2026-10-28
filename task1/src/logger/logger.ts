import path from 'path';
import pino from 'pino';
import { LOG_FILE_PATH } from '../constants/geometry';

const logFilePath = path.resolve(process.cwd(), LOG_FILE_PATH);

export const logger = pino({
  level: 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
      {
        target: 'pino/file',
        options: {
          destination: logFilePath,
          mkdir: true,
        },
      },
    ],
  },
});
