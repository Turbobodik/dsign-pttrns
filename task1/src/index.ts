import { createApplication } from './composition';
import { logger } from './logger/logger';

try {
  const application = createApplication();
  application.run();
} catch (error) {
  logger.error({ err: error }, 'Fatal application error');
}
