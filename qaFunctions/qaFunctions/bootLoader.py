from farm-haystack.file_converter.docx import DocxToTextConverter
from haystack.file_converter.pdf import PDFToTextConverter
from haystack.file_converter.txt import TextConverter
from haystack.preprocessor.preprocessor import PreProcessor

from . import basicQA

"""
@param filePath: Path to the file you want to convert
@return : Dict[str, Any]
"""
def docPrepare(filePath):
    # fileName = file.filename
    # TODO: remove_numeric_tables : This option uses heuristics to remove numeric rows from the tables.
    # TODO: The tabular structures in documents might be noise for the reader model if it does not have table parsing capability for finding answers.
    # The string from tables are retained under this case
    if (filePath.endswith("pdf")):
        converter = PDFToTextConverter(remove_numeric_tables=True, valid_languages=["en"])
    elif (filePath.endswith("docx")):
        converter = DocxToTextConverter(remove_numeric_tables=True, valid_languages=["en"])
    elif (filePath.endswith("txt")):
        converter = TextConverter(remove_numeric_tables=True, valid_languages=["en"])
    doc = converter.convert(file_path=filePath, meta=None)
    return doc

"""
@param doc: dict
@return : List[dict]
"""
def docPreProcess(doc):
    processor = PreProcessor(
        clean_empty_lines=True,
        clean_whitespace=True,
        clean_header_footer=True,
        split_by="word",
        split_length=200,
        split_respect_sentence_boundary=True
    )
    doc = processor.process(doc)
    return doc

def run(filePath, query):
    doc = docPrepare(filePath)
    doc = docPreProcess(doc)
    return basicQA.basic_qa_pipeline(doc, query)

# Press the green button in the gutter to run the script.
# if __name__ == '__main__':
#     filePath = "AppleAnnualReport.pdf"
#     run(filePath)
