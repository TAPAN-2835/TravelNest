import logging
import os
import boto3
from watchtower import CloudWatchLogHandler
from dotenv import load_dotenv

load_dotenv()

def get_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Console Handler
    console_handler = logging.StreamHandler()
    console_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # CloudWatch Handler (Production only)
    if os.getenv("ENVIRONMENT") == "production":
        try:
            session = boto3.Session(
                region_name=os.getenv("AWS_REGION", "us-east-1")
            )
            cw_handler = CloudWatchLogHandler(
                boto3_session=session,
                log_group="TravelNest-AIService",
                stream_name=os.getenv("HOSTNAME", "default-stream")
            )
            logger.addHandler(cw_handler)
        except Exception as e:
            logger.error(f"Failed to initialize CloudWatch logging: {e}")

    return logger
