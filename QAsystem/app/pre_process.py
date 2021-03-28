import logging

from haystack import Finder
from haystack.document_store.elasticsearch import ElasticsearchDocumentStore

from haystack.pipeline import ExtractiveQAPipeline, DocumentSearchPipeline, FAQPipeline, Pipeline
from haystack.reader.farm import FARMReader
from haystack.reader.transformers import TransformersReader
from haystack.retriever.sparse import ElasticsearchRetriever

from . import query_Handler


def process(document_store):

    logger = logging.getLogger(__name__)
    # # Connect to Elasticsearch
    # document_store = ElasticsearchDocumentStore(host="localhost", username="", password="", index="document")
    #
    # # write the docs to the DB.
    # document_store.write_documents(file)
    # ## Initalize Retriever, Reader,  & Finder
    #
    # ### Retriever
    #
    # Retrievers help narrowing down the scope for the Reader to smaller units of text where a given question
    # could be answered.
    #
    # They use some simple but fast algorithm.
    # Elasticsearch's default BM25 algorithm is used
    retriever = ElasticsearchRetriever(document_store=document_store)

    # ### Reader
    #
    # A Reader scans the texts returned by retrievers in detail and extracts the k best answers. They are based
    # on powerful, but slower deep learning models.
    #
    # Haystack currently supports Readers based on the frameworks FARM and Transformers.
    # With both you can either load a local model or one from Hugging Face's model hub (https://huggingface.co/models).
    # **Here:** a medium sized RoBERTa QA model using a Reader based on
    #           FARM (https://huggingface.co/deepset/roberta-base-squad2)
    # **Alternatives (Reader):** TransformersReader (leveraging the `pipeline` of the Transformers package)
    # **Alternatives (Models):** e.g. "distilbert-base-uncased-distilled-squad" (fast) or
    #                            "deepset/bert-large-uncased-whole-word-masking-squad2" (good accuracy)

    reader = FARMReader(model_name_or_path="deepset/roberta-base-squad2",
                        use_gpu=False, context_window_size=500)

    # Some default pipes that can be chosen from
    # Extractive QA
    # qa_pipe = ExtractiveQAPipeline(reader=reader, retriever=retriever)

    # Document Search
    # doc_pipe = DocumentSearchPipeline(retriever=retriever)

    # Generative QA
    # doc_pipe = GenerativeQAPipeline(generator=rag_generator, retriever=retriever)

    # FAQ based QA
    # doc_pipe = FAQPipeline(retriever=retriever)

    # p = FAQPipeline(retriever=retriever)

    p = ExtractiveQAPipeline(reader, retriever)
    query_Handler.pipe = p
