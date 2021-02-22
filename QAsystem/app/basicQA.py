# ## Task: Question Answering for Game of Thrones
#
# Question Answering can be used in a variety of use cases. A very common one:  Using it to navigate through complex
# knowledge bases or long documents ("search setting").
#
# A "knowledge base" could for example be your website, an internal wiki or a collection of financial reports.
# In this tutorial we will work on a slightly different domain: "Game of Thrones".
#
# Let's see how we can use a bunch of Wikipedia articles to answer a variety of questions about the
# marvellous seven kingdoms...

import logging
import subprocess
import time

from haystack import Finder
from haystack.document_store.elasticsearch import ElasticsearchDocumentStore
from haystack.preprocessor.cleaning import clean_wiki_text
from haystack.preprocessor.utils import convert_files_to_dicts, fetch_archive_from_http
from haystack.reader.farm import FARMReader
from haystack.reader.transformers import TransformersReader
from haystack.utils import print_answers
from haystack.retriever.sparse import ElasticsearchRetriever


def basic_qa_pipeline(file, query):
    logger = logging.getLogger(__name__)

    LAUNCH_ELASTICSEARCH = False
    # ## Document Store
    #
    # Haystack finds answers to queries within the documents stored in a `DocumentStore`. The current implementations of
    # `DocumentStore` include `ElasticsearchDocumentStore`, `FAISSDocumentStore`, `SQLDocumentStore`, and `InMemoryDocumentStore`.
    #
    # Elasticsearch is recommended as it comes preloaded with features like full-text queries, BM25 retrieval,
    # and vector storage for text embeddings.

    # Start an Elasticsearch server

    if LAUNCH_ELASTICSEARCH:
        logging.info("Starting Elasticsearch ...")
        status = subprocess.run(
            ['docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:7.6.2'], shell=True
        )
        if status.returncode:
            raise Exception("Failed to launch Elasticsearch. If you want to connect to an existing Elasticsearch instance"
                            "then set LAUNCH_ELASTICSEARCH in the script to False.")
        time.sleep(90)

    # Connect to Elasticsearch
    document_store = ElasticsearchDocumentStore(host="localhost", username="", password="", index="document")

    # Now, let's write the docs to our DB.
    if LAUNCH_ELASTICSEARCH:
        document_store.write_documents(file)
    else:
        logger.warning("Since we already have a running ES instance we should not index the same documents again. \n"
                       "If you still want to do this call: document_store.write_documents(dicts) manually ")
    document_store.write_documents(file)
    # ## Initalize Retriever, Reader,  & Finder
    #
    # ### Retriever
    #
    # Retrievers help narrowing down the scope for the Reader to smaller units of text where a given question
    # could be answered.
    #
    # They use some simple but fast algorithm.
    # **Here:** We use Elasticsearch's default BM25 algorithm
    # **Alternatives:**
    # - Customize the `ElasticsearchRetriever`with custom queries (e.g. boosting) and filters
    # - Use `EmbeddingRetriever` to find candidate documents based on the similarity of
    #   embeddings (e.g. created via Sentence-BERT)
    # - Use `TfidfRetriever` in combination with a SQL or InMemory Document store for simple prototyping and debugging

    retriever = ElasticsearchRetriever(document_store=document_store)
    print("finish retriever")
    # Alternative: An in-memory TfidfRetriever based on Pandas dataframes for building quick-prototypes
    # with SQLite document store.
    #
    # from haystack.retriever.tfidf import TfidfRetriever
    # retriever = TfidfRetriever(document_store=document_store)

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
    # **Hint:** You can adjust the model to return "no answer possible" with the no_ans_boost. Higher values mean
    #           the model prefers "no answer possible"
    #

    # #### TransformersReader
    reader = TransformersReader(
       model_name_or_path="distilbert-base-uncased-distilled-squad", tokenizer="distilbert-base-uncased", use_gpu=-1)

    # ### Finder
    #
    # The Finder sticks together reader and retriever in a pipeline to answer our actual questions.

    finder = Finder(reader, retriever)

    # Deriving the predicted answers from the finder
    prediction = finder.get_answers(question=query, top_k_retriever=10, top_k_reader=5)

    return prediction


# if __name__ == "__main__":
#     tutorial1_basic_qa_pipeline()