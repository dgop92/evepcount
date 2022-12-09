import logging
import logging.config

from common.settings import LOGGING_CONFIG_FILE


def config_logger():
    logging.config.fileConfig(fname=LOGGING_CONFIG_FILE, disable_existing_loggers=False)
    logger = logging.getLogger(__name__)
    logger.info("logger configured")
