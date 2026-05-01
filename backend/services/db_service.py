from pymongo import MongoClient
from config import Config

_client = None
_db = None


def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(Config.MONGODB_URI, serverSelectionTimeoutMS=5000)
        _db = _client[Config.DB_NAME]
        _ensure_indexes(_db)
    return _db


def _ensure_indexes(db):
    db.recipes.create_index(
        [("name", "text"), ("tags", "text"), ("cuisine", "text"), ("description", "text")]
    )
    db.recipes.create_index([("slug", 1)], unique=True, sparse=True)
    db.recipes.create_index([("cuisine", 1)])
    db.recipes.create_index([("tags", 1)])
    db.recipes.create_index([("created_at", -1)])
    db.recipes.create_index([("views", -1)])
