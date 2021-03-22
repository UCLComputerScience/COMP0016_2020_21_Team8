import shutil
import os
from fastapi import HTTPException
from haystack.document_store.elasticsearch import ElasticsearchDocumentStore

from haystack.file_converter.pdf import PDFToTextConverter
from haystack.file_converter.txt import TextConverter
from haystack.preprocessor.preprocessor import PreProcessor

from app.config import REMOVE_WHITESPACE, REMOVE_EMPTY_LINES, REMOVE_HEADER_FOOTER, \
    SPLIT_BY, SPLIT_LENGTH, SPLIT_OVERLAP, SPLIT_RESPECT_SENTENCE_BOUNDARY, DB_HOST, DB_PORT, DB_USER, DB_INDEX, DB_PW, \
    DB_INDEX_FEEDBACK, ES_CONN_SCHEME, TEXT_FIELD_NAME, SEARCH_FIELD_NAME, EMBEDDING_DIM, EMBEDDING_FIELD_NAME, \
    FAQ_QUESTION_FIELD_NAME, CREATE_INDEX, UPDATE_EXISTING_DOCUMENTS, VECTOR_SIMILARITY_METRIC

# Connect to Elasticsearch
document_store = ElasticsearchDocumentStore(
    host=DB_HOST,
    port=DB_PORT,
    username=DB_USER,
    password=DB_PW,
    index=DB_INDEX,
    label_index=DB_INDEX_FEEDBACK,
    scheme=ES_CONN_SCHEME,
    ca_certs=None,
    verify_certs=False,
    text_field=TEXT_FIELD_NAME,
    search_fields=SEARCH_FIELD_NAME,
    embedding_dim=EMBEDDING_DIM,
    embedding_field=EMBEDDING_FIELD_NAME,
    faq_question_field=FAQ_QUESTION_FIELD_NAME,
    create_index=CREATE_INDEX,
    update_existing_documents=UPDATE_EXISTING_DOCUMENTS,
    similarity=VECTOR_SIMILARITY_METRIC
)



def file_upload(file):
    try:
        file_path = '/tmp/' + file.name + '_tmp'
        with open(file_path, "wb") as buffer:
            buffer.write(file.read())

        if file.filename.split(".")[-1].lower() == "pdf":
            pdf_converter = PDFToTextConverter(
                remove_numeric_tables=True, valid_languages=["en"]
            )
            document = pdf_converter.convert(file_path)
        elif file.filename.split(".")[-1].lower() == "txt":
            txt_converter = TextConverter(
                remove_numeric_tables=True, valid_languages=["en"],
            )
            document = txt_converter.convert(file_path)
        else:
            raise HTTPException(status_code=415, detail=f"Only .pdf and .txt file formats are supported.")

        document = {TEXT_FIELD_NAME: document["text"], "name": file.filename}

        preprocessor = PreProcessor(
            clean_whitespace=REMOVE_WHITESPACE,
            clean_header_footer=REMOVE_HEADER_FOOTER,
            clean_empty_lines=REMOVE_EMPTY_LINES,
            split_by=SPLIT_BY,
            split_length=SPLIT_LENGTH,
            split_respect_sentence_boundary=SPLIT_RESPECT_SENTENCE_BOUNDARY,
        )

        documents = preprocessor.process(document)


        # write the docs to the DB.
        document_store.write_documents(documents)
        return document_store
    finally:
        os.remove(file_path)
        buffer.close()