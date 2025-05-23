import pathlib

from starlette.config import Config

ROOT = pathlib.Path(__file__).resolve().parent.parent  # svc/
BASE_DIR = ROOT.parent  # ./

config = Config(BASE_DIR / ".env")

# Existing auth configs
API_USERNAME = config("API_USERNAME", str)
API_PASSWORD = config("API_PASSWORD", str)

# Auth configs
API_SECRET_KEY = config("API_SECRET_KEY", str)
API_ALGORITHM = config("API_ALGORITHM", str)
API_ACCESS_TOKEN_EXPIRE_MINUTES = config(
    "API_ACCESS_TOKEN_EXPIRE_MINUTES", int
)  # infinity

# Gemini API configs
GEMINI_API_KEY = config("GEMINI_API_KEY", str)

# Default Gemini models
DEFAULT_TEXT_MODEL = config("DEFAULT_TEXT_MODEL", default="gemini-pro")
DEFAULT_VISION_MODEL = config("DEFAULT_VISION_MODEL", default="gemini-pro-vision")
DEFAULT_EMBEDDING_MODEL = config("DEFAULT_EMBEDDING_MODEL", default="embedding-001")