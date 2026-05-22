from pathlib import Path

from dotenv import load_dotenv
from prisma import Prisma

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

db = Prisma()
