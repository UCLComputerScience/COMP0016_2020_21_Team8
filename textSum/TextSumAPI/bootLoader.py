# # -*- coding: utf-8 -*-

from __future__ import absolute_import
from __future__ import division, print_function, unicode_literals

from sumy.parsers.html import HtmlParser
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
import os
from . import read_file
from . import installPunkt

LANGUAGE = "english"
outputTextPath = "/tmp/tmp.txt"

def summary(path):
    installPunkt.downloadPunkt()
    content = ""
    tup = read_file.readPdf(path, outputTextPath) 
    # title of the doc
    title = tup[0]
    # how many pages in the doc
    count = tup[1]
    if count == 0:
        return "Sorry, summarization failed, the document was not text based."
    # How many lines to output
    line = min(10,count*2) 
    content += "Title: " + title + "\n"
    content += " " + "\n"
    content += "Summary: " + "\n"
    content += " " + "\n"
    parser = PlaintextParser.from_file(outputTextPath, Tokenizer(LANGUAGE))
    ## for parsing from url:
    # url = "https://en.wikipedia.org/wiki/Automatic_summarization"
    # parser = HtmlParser.from_url(url, Tokenizer(LANGUAGE))
    ## for paring from string:
    # parser = PlaintextParser.from_string("Check this out.", Tokenizer(LANGUAGE))
    stemmer = Stemmer(LANGUAGE)


    summarizer = Summarizer(stemmer)
    summarizer.stop_words = get_stop_words(LANGUAGE)

    for sentence in summarizer(parser.document, line):
        content += str(sentence) + "\n"
        content += " " + "\n"
    
    content += "(in " + str(line) + " sentences)"  + "\n"
    os.remove(outputTextPath)

    return content


# if __name__ == "__main__":
#     content = summary("text-summarizationFortest/test.pdf")
#     print (content)
    

