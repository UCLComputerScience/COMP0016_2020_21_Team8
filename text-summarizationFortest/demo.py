# -*- coding: utf-8 -*-

from __future__ import absolute_import
from __future__ import division, print_function, unicode_literals

from sumy.parsers.html import HtmlParser
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
import os
import read_file
import installPunkt

LANGUAGE = "english"

def summary(path):
    installPunkt.downloadPunkt()
    # url = "https://en.wikipedia.org/wiki/Automatic_summarization"
    # parser = HtmlParser.from_url(url, Tokenizer(LANGUAGE))
    content = ""
    if path.endswith('pdf'):
        tup = read_file.readPdf(path,"a.txt") 
    elif path.endswith('docx'):
        tup = read_file.readDocx(path,"a.txt") 

    
    title = tup[0]
    count = tup[1]
    line = min(20,count*5) 
    content += "Title: " + title + "\n"
    content += " " + "\n"
    content += "Summary: " + "\n"
    content += " " + "\n"
    # or for plain text files
    parser = PlaintextParser.from_file("a.txt", Tokenizer(LANGUAGE))
    # parser = PlaintextParser.from_string("Check this out.", Tokenizer(LANGUAGE))
    stemmer = Stemmer(LANGUAGE)

    summarizer = Summarizer(stemmer)
    summarizer.stop_words = get_stop_words(LANGUAGE)

    for sentence in summarizer(parser.document, line):
        content += str(sentence) + "\n"
        content += " " + "\n"
    content += "(in " + str(line) + " sentences)"  + "\n"
    content += " " + "\n"
    os.remove("a.txt")
    return content


if __name__ == "__main__":
    #content = summary("text-summarizationFortest/test.docx")
    content = summary("text-summarizationFortest/test.pdf")
    print(content)
    
    

