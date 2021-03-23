
from azure.ai.formrecognizer import FormRecognizerClient
from azure.ai.formrecognizer import FormTrainingClient
from azure.core.credentials import AzureKeyCredential

from pandas import DataFrame 

from FormRecogFunction.endpoint import ENDPOINT,KEY

form_recognizer_client = FormRecognizerClient(ENDPOINT, AzureKeyCredential(KEY))
form_training_client = FormTrainingClient(ENDPOINT, AzureKeyCredential(KEY))

# form = 'Form_1.jpg'
pages_tables_info = '-1'
specificInformation = 'allInfo'

def process(form_path):
    try:
        with open(form_path, "rb") as f:
            poller = form_recognizer_client.begin_recognize_content(form=f)
            page = poller.result()
    except:
        return "File Not Found"

    if isinstance(CheckPagesTables(page), str): # to see whether the output is an error string
        return CheckPagesTables(page)
    tables = CheckPagesTables(page) # list of Tables
    extractedInfo = []
    for i in range(len(tables)):
        # extractedInfo.append(["Table found on page {}:\n".format(tables[i].page_number)])
        print("Table found on page {}:".format(tables[i].page_number))
        table_contents = []
        table_contents = GetAllValues(table_contents, tables[i])
        extractedInfo.append(DataFrame.to_json(ChooseSpecificInfo(table_contents, i+1)))
        print(ChooseSpecificInfo(table_contents, i+1))
    return extractedInfo

def CheckPagesTables(page):
    quantity_of_pages_tables = pages_tables_info.split(",")

    try:
        multipleTables = []
        
        if len(quantity_of_pages_tables)==2:
            page_count = int (quantity_of_pages_tables[0])
            table_count = int (quantity_of_pages_tables[1])

            if len(page) < page_count or page_count < 1:
                return "Wrong Page wanted"
            if len(page[page_count-1].tables) < table_count or (table_count < 1 and table_count != -1):
                return "Wrong Table wanted or There is no Table in Document"
            if table_count!=-1:
                table = page[page_count-1].tables[table_count-1]
                multipleTables.append(table)
                return multipleTables
            for each_table in range(len(page[page_count-1].tables)):
                table = page[page_count-1].tables[each_table-1]
                multipleTables.append(table)
            return multipleTables
        
        if int (quantity_of_pages_tables[0])!=-1 and len(quantity_of_pages_tables)==1:
            return "Wrong Value Entered"    
        elif len(quantity_of_pages_tables)==1:
            for each_page in range(len(page)):
                for each_table in range(len(page[each_page-1].tables)):
                    table = page[each_page-1].tables[each_table-1]
                    multipleTables.append(table)
            if len(multipleTables)==0:
                return "No Table Found"
            return multipleTables
        return "Wrong number of Arguments"
    except:
        return "Wrong values are placed"

def GetAllValues(table_contents, table):
    row_values = []
    column = 0
    currentRow = 0

    for cell in table.cells:
        rowsCount = cell.row_index
        if(rowsCount > currentRow): #row has been changed
            currentRow = rowsCount
            column = 0
            table_contents.append(row_values)
            row_values = []

        row_values.append(cell.text)
        column += 1
    table_contents.append(row_values)

    return table_contents

def ChooseSpecificInfo(table_contents, tableCount):
    specificValues = specificInformation.split(',')

    if(specificValues[0]=="edit"):
        return changeInfo(table_contents,specificValues[1],specificValues[2],specificValues[3], tableCount)
    elif(specificValues[0]=="search"):
        return GetRequirements(table_contents,specificValues[1], tableCount)
    elif(specificValues[0]=="allInfo"):
        dataBase = DataFrame (table_contents)
        # png = dataBase.dfi.export('tables {}.png'.format(tableCount))
        return dataBase
    return "Wrong Requirement"

def GetRequirements(table_contents, searchInfoRow, tableCount):
    allFoundRows = []
    found = False
    for i in range(len(table_contents)):
        for j in range(len(table_contents[i])):
            if table_contents[i][j]==searchInfoRow:
                found = True
                allFoundRows.append(table_contents[i])
                #return table_contents[i]
    if found==True:
        dataBase = DataFrame (allFoundRows)
        # png = dataBase.dfi.export('tables {}.png'.format(tableCount))
        return dataBase
    return "In the table {}, there is no such information".format(tableCount)       

def changeInfo(table_contents, required_row, required_column, required_word, tableCount):
    try:
        row = int(required_row)
        column = int(required_column)

        if len(table_contents) < row or row < 1:
            return "No such row"
        if len(table_contents[row-1]) < column or column < 1:
            return "No such column"

        table_contents[row-1].pop(column-1)
        table_contents[row-1].insert(column-1,required_word)
        dataBase = DataFrame (table_contents)
        # png = dataBase.dfi.export('tables {}.png'.format(tableCount))

        return dataBase
    except:
        return "Wrong Input"
    
    def TableIntoExcel(table_contents,tableCount,changeColumnNames,fullTable):
    dataBase = pd.DataFrame (table_contents)

    if fullTable:
        '''
        Replace Columns Name with 1st Row
        '''
        dataBase = dataBase[1:]
        dataBase.columns = changeColumnNames
    else:
        index_list = []
        for i in range(len(table_contents)):
            index_list.append(i+1)
        dataBase.columns = changeColumnNames
        dataBase.index = index_list
    
    #png = dataBase.dfi.export('tables {}.png'.format(tableCount))
    excel = pd.ExcelWriter('Excel {}.xlsx'.format(tableCount))
    dataBase.to_excel(excel, index = False)
    excel.save()

    return dataBase
