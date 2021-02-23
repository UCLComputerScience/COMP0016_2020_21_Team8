# Preprocessing
import os

REMOVE_WHITESPACE = os.getenv("REMOVE_WHITESPACE", "True").lower() == "true"
REMOVE_EMPTY_LINES = os.getenv("REMOVE_EMPTY_LINES", "True").lower() == "true"
REMOVE_HEADER_FOOTER = os.getenv("REMOVE_HEADER_FOOTER", "True").lower() == "true"
SPLIT_BY = os.getenv("SPLIT_BY", "word")
SPLIT_LENGTH = os.getenv("SPLIT_LENGTH", 1_000)
SPLIT_OVERLAP = os.getenv("SPLIT_OVERLAP", None)
SPLIT_RESPECT_SENTENCE_BOUNDARY = os.getenv("SPLIT_RESPECT_SENTENCE_BOUNDARY", True)

# DB
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 9200))
DB_USER = os.getenv("DB_USER", "")
DB_PW = os.getenv("DB_PW", "")
DB_INDEX = os.getenv("DB_INDEX", "document")
DB_INDEX_FEEDBACK = os.getenv("DB_INDEX_FEEDBACK", "label")
ES_CONN_SCHEME = os.getenv("ES_CONN_SCHEME", "http")
TEXT_FIELD_NAME = os.getenv("TEXT_FIELD_NAME", "text")
NAME_FIELD_NAME = os.getenv("NAME_FIELD_NAME", "name")
SEARCH_FIELD_NAME = os.getenv("SEARCH_FIELD_NAME", "text")
FAQ_QUESTION_FIELD_NAME = os.getenv("FAQ_QUESTION_FIELD_NAME", "question")
EMBEDDING_FIELD_NAME = os.getenv("EMBEDDING_FIELD_NAME", "embedding")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", 768))
VECTOR_SIMILARITY_METRIC = os.getenv("VECTOR_SIMILARITY_METRIC", "dot_product")
CREATE_INDEX = os.getenv("CREATE_INDEX", "True").lower() == "true"
UPDATE_EXISTING_DOCUMENTS = os.getenv("UPDATE_EXISTING_DOCUMENTS", "False").lower() == "true"