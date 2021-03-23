from logging import error
from azure.ai.formrecognizer import FormRecognizerClient
from azure.core.credentials import AzureKeyCredential

import pandas as pd
import dataframe_image as dfi

endpoint = "https://formrecognizerteam8.cognitiveservices.azure.com/"
formRecognizerKEY = "dcadf9e105944057ae4b851df205f479"  

form_recognizer_client = FormRecognizerClient(endpoint, AzureKeyCredential(formRecognizerKEY))

formDocument = "2pdf.pdf"
pages_tables_Info = "-1"
#specificInformation = "search,5.00"
specificInformation = "allTablesInfo"

def main():
    try:
        with open(formDocument, "rb") as f:
            poller = form_recognizer_client.begin_recognize_content(form=f)
        page = poller.result()
    except Exception as e:
        print(e)
        return

    if isinstance(CheckPagesTables(page),str): # to see whether the output is an error string
        return CheckPagesTables(page)
    tables = CheckPagesTables(page) # list of Tables
    
    pageN = 0
    for i in range(len(tables)):
        print("Page {}:".format(tables[i].page_number))
        
        if pageN != tables[i].page_number and "-1" in pages_tables_Info: 
            info_not_in_table(page,pageN) # if -1 -> wants all information in doc
            print("\n")
            pageN = tables[i].page_number

        table_contents = []
        table_contents = GetAllValues(table_contents,tables[i])
        print(ChooseSpecificInfo(table_contents,i+1))
        print("\n")

def info_not_in_table(page, pageN):
    not_including_lines = []
    
    for each_table in range(len(page[pageN].tables)):
        table_coordinates = format_bounding_box(page[pageN].tables[each_table].bounding_box)
        sorted_table_coordinates = organise_coordinates(table_coordinates)
        for idx_line, line in enumerate(page[pageN].lines):
            boundaries_list = format_bounding_box(line.bounding_box)
            if (boundaries_list[0] < sorted_table_coordinates[0] and boundaries_list[0] > sorted_table_coordinates[2]) and (boundaries_list[2] < sorted_table_coordinates[0] and boundaries_list[2] > sorted_table_coordinates[2]) and (boundaries_list[1] < sorted_table_coordinates[1] and boundaries_list[1] > sorted_table_coordinates[3]) and (boundaries_list[3] < sorted_table_coordinates[1] and boundaries_list[3] > sorted_table_coordinates[3]):
                not_including_lines.append(idx_line)
        for idx_line, line in enumerate(page[pageN].lines): 
            if each_table+1 == len(page[pageN].tables): #last table was added   
                if idx_line not in not_including_lines:
                    print(line.text)

def format_bounding_box(bounding_box):
    list_of_coordinates = []
    if not bounding_box:
        return "N/A"

    idx = 1
    for p in bounding_box: 
        if idx == 1 or idx == 3: # in boundary box the 1st and 3rd coordinates have different x,y pairs
            list_of_coordinates.append(float (p.x))
            list_of_coordinates.append(float (p.y))
        idx += 1
    return list_of_coordinates

def organise_coordinates(list_of_coordinates):
    list_of_new_coordinates = []
    bigger_val_x = 0
    smaller_val_x = 0
    bigger_val_y = 0
    smaller_val_y = 0

    if float (list_of_coordinates[0]) > float (list_of_coordinates[2]):
        bigger_val_x = float (list_of_coordinates[0])
        smaller_val_x = float (list_of_coordinates[2])
    elif float (list_of_coordinates[0]) < float (list_of_coordinates[2]):
        bigger_val_x = float (list_of_coordinates[2])
        smaller_val_x = float (list_of_coordinates[0])
    
    if float (list_of_coordinates[1]) > float (list_of_coordinates[3]):
        bigger_val_y = float (list_of_coordinates[1])
        smaller_val_y = float (list_of_coordinates[3])
    elif float (list_of_coordinates[1]) < float (list_of_coordinates[3]):
        bigger_val_y = float (list_of_coordinates[3])
        smaller_val_y = float (list_of_coordinates[1])
    
    list_of_new_coordinates.extend([bigger_val_x,bigger_val_y,smaller_val_x,smaller_val_y])
    return list_of_new_coordinates

def CheckPagesTables(page):
    quantity_of_pages_tables = pages_tables_Info.split(",")

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
                table = page[page_count-1].tables[each_table]
                multipleTables.append(table)
            return multipleTables
        
        if int (quantity_of_pages_tables[0])!=-1 and len(quantity_of_pages_tables)==1:
            return "Wrong Value Entered"    
        elif len(quantity_of_pages_tables)==1:
            for each_page in range(len(page)):
                for each_table in range(len(page[each_page].tables)):
                    table = page[each_page].tables[each_table]
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

    if(specificValues[0]=="search"):
        if len(specificValues)==2:
            return GetRequirements(table_contents,specificValues[1].lower(), tableCount)
        return "Search: Wrong Number Of Arguments"
    elif(specificValues[0]=="allTablesInfo"):
        if len(specificValues)!=1:
            return "allInfo: Wrong Number Of Arguments"
        return TableIntoExcel(table_contents, tableCount, table_contents[0], True)
    return "Wrong Requirement"

def GetRequirements(table_contents, searchInfoRow, tableCount):
    allFoundRows = []
    found = False
    for i in range(len(table_contents)):
        for j in range(len(table_contents[i])):
            if table_contents[i][j].lower()==searchInfoRow:
                found = True
                allFoundRows.append(table_contents[i])
                #return table_contents[i]
    if found==True:
        return TableIntoExcel(allFoundRows,tableCount,table_contents[0],False)
    return "In the table {}, there is no such information".format(tableCount)       

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
    
main()