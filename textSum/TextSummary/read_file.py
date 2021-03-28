# -*- coding: utf-8 -*-
import re
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfpage import PDFTextExtractionNotAllowed
from pdfminer.pdfinterp import PDFResourceManager
from pdfminer.pdfinterp import PDFPageInterpreter
from pdfminer.layout import *
from pdfminer.converter import PDFPageAggregator
import pdftitle


def readPdf(pdfpath, txtpath):
    fp = open(pdfpath, 'rb')
    # create a pdf parser
    parser = PDFParser(fp)
    # create a PDFDocument object to store doc structure
    document = PDFDocument(parser)
    # check if text extraction is allowed
    if not document.is_extractable:
        raise PDFTextExtractionNotAllowed
    else:
        # create a PDFResourceManager() to store shared resource
        rsrcmgr = PDFResourceManager()
        # set a factor
        laparams = LAParams()
        # set a aggregator
        device = PDFPageAggregator(rsrcmgr, laparams=laparams)
        # set a interpreter
        interpreter = PDFPageInterpreter(rsrcmgr, device)

        # get title
        try:
            title = pdftitle.get_title_from_file(pdfpath)
            if title is None:
                title = 'n/a'
        except:
            title = 'n/a'

        # get content
        with open(txtpath, 'w') as f:
            count = 0
            content = ""
            for page in PDFPage.create_pages(document):
                pageContent = ""
                interpreter.process_page(page)
                layout = device.get_result()
                for x in layout:
                    if(isinstance(x, LTTextBoxHorizontal)):
                        text = x.get_text()
                        # if the text block contains no letter or is too short, skip
                        if re.search('[a-zA-Z]', text) == None or (text[0].isupper() and len(text) <= 43):
                            continue
                        pageContent += text
                content += pageContent.strip() + " "
                count += 1
            f.write(content)
            if content.isspace():
                count = 0
        return (title, count)
