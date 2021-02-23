from azure.ai.formrecognizer import FormRecognizerClient
from azure.ai.formrecognizer import FormTrainingClient
from azure.core.credentials import AzureKeyCredential

from azure.cosmosdb.table.tableservice import TableService
from geopy.geocoders import Nominatim

from FormRecogFunction.endpoint import ENDPOINT, KEY, STOREAGE_ACCOUNT_KEY, STOREAGE_ACCOUNT_NAME

form_recognizer_client = FormRecognizerClient(ENDPOINT, AzureKeyCredential(KEY))
form_training_client = FormTrainingClient(ENDPOINT, AzureKeyCredential(KEY))

table_service = TableService(STOREAGE_ACCOUNT_NAME, STOREAGE_ACCOUNT_KEY)

specificInformation = "All Information"
bc_path = 's.pdf'

def PhonesWithSameCode(tableName, original_country, value1, value2, value3, value4):
    sameStartingCode = table_service.query_entities(tableName)
    phoneCode = value1 + value2 + value3 + value4

    for code in sameStartingCode:
        if(code.get("RowKey")==phoneCode):
            return "The Country to Call is: {}".format(code.get("Country"))
    return "The Country to Call is: {}".format(original_country)

def PhonesCode(mobile_phones, addresses):
    for phone in mobile_phones.value:
        print("Mobile phone number: {}".format(phone.value))
        if(phone.value==None):
            return "The Form Recognizer cannot read a phone number on the business card"
        
        if(phone.value[0]!="+"):
            #trying to find the country through the Address. (suppose that there is no any code thsan the phone number will be for that country)
            if(addresses): #if address!=None
                return AddressLocation(addresses)
            return "The Form Recognizer found neither address nor + in phone, that is why the code of the Country cannot be identify"
            
        phoneCode = ""
        for index in range(7): # max symbols can appear 7, e.g., Isle Of man(+44 1624)
            phoneCode += phone.value[index]
            
        results = table_service.query_entities("CountriesNumberCode")
        for eachresult in results:
            if(eachresult.get("RowKey") in phoneCode): # code, e.g, +1, +44, +374
                if(eachresult.get("Country")=="United States"):
                    return PhonesWithSameCode("CountriesNumberCodeWith1","United States",phoneCode[2],phoneCode[3],phoneCode[4],"") # remove +, 1 from number -> leave 3 numbers of code
                elif(eachresult.get("Country")=="Russia"):
                    return PhonesWithSameCode("CountriesNumberCodeWith7","Russia",phoneCode[2],"","","") 
                elif(eachresult.get("Country")=="United Kingdom"):
                    return PhonesWithSameCode("CountriesNumberCodeWith44","United Kingdom",phoneCode[3],phoneCode[4],phoneCode[5],phoneCode[6]) 
                return "The Country to Call is: {}".format(eachresult.get("Country"))
        return "There is no Country with given code number"
    
def AddressLocation(addresses):
    for address in addresses.value:
        print("Address: {}".format(address.value))
        if(addresses.value==None):
            return "The Form Recognizer cannot read an address on the business card"
        
        geolocator = Nominatim(user_agent="geoapiExercises")
        location = geolocator.geocode(address.value)

        list = ""
        if(location!=None): #If geolocator cannot find any info, then output is None
            list = location.address
            print(list)

        results = table_service.query_entities("CountriesNumberCode")
        for eachresult in results:
            if (eachresult.get("Country") in list):
                return "The Country is: {}".format(eachresult.get("Country"))
        return "With the given Address, Country is not found"

def process(file_path):
    with open(file_path, "rb") as b:
        poller = form_recognizer_client.begin_recognize_business_cards(business_card=b, locale="en-GB")
    business_cards = poller.result()

    allInfo = False

    mobile_phones = ""
    work_phones = ""
    other_phones = ""
    addresses = ""

    extractedInfo = []
    for idx, business_card in enumerate(business_cards):
        extractedInfo.append("--------Recognizing business card #{}--------\n".format(idx+1))
        print("--------Recognizing business card #{}--------".format(idx+1))
        if(specificInformation=="All Information"):
            allInfo = True
            
            contact_names = business_card.fields.get("ContactNames")
            if contact_names:
                for contact_name in contact_names.value:
                    extractedInfo.append("Contact First Name: {}\n".format(contact_name.value["FirstName"].value))
                    extractedInfo.append("Contact First Name: {}\n".format(contact_name.value["LastName"].value))
                    print("Contact First Name: {}".format(contact_name.value["FirstName"].value))
                    print("Contact Last Name: {}".format(contact_name.value["LastName"].value))
            
            company_names = business_card.fields.get("CompanyNames")
            if company_names:
                for company_name in company_names.value:
                    extractedInfo.append("Company Name: {}\n".format(company_name.value))
                    print("Company Name: {}".format(company_name.value))
            
            departments = business_card.fields.get("Departments")
            if departments:
                for department in departments.value:
                    extractedInfo.append("Department: {}\n".format(department.value))
                    print("Department: {} ".format(department.value))
            
            job_titles = business_card.fields.get("JobTitles")
            if job_titles:
                for job_title in job_titles.value:
                    extractedInfo.append("Job Title: {} \n".format(job_title.value))
                    print("Job Title: {} ".format(job_title.value))
            
            emails = business_card.fields.get("Emails")
            if emails:
                for email in emails.value:
                    extractedInfo.append("Email: {} \n".format(email.value))
                    print("Email: {} ".format(email.value))
            
            websites = business_card.fields.get("Websites")
            if websites:
                for website in websites.value:
                    extractedInfo.append("Website: {}\n".format(website.value))
                    print("Website: {}".format(website.value))
            
            addresses = business_card.fields.get("Addresses")
            if addresses:
                for address in addresses.value:
                    extractedInfo.append("Address: {}\n".format(address.value))
                    print("Address: {}".format(address.value))
            
            mobile_phones = business_card.fields.get("MobilePhones")
            if mobile_phones:
                for phone in mobile_phones.value:
                    extractedInfo.append("Mobile phone number: {}\n".format(phone.value))
                    print("Mobile phone number: {}".format(phone.value))
            
            faxes = business_card.fields.get("Faxes")
            if faxes:
                for fax in faxes.value:
                    extractedInfo.append("Fax number: {}\n".format(fax.value))
                    print("Fax number: {}".format(fax.value))
            
            work_phones = business_card.fields.get("WorkPhones")
            if work_phones:
                for work_phone in work_phones.value:
                    extractedInfo.append("Work phone number: {}\n".format(work_phone.value))
                    print("Work phone number: {}".format(work_phone.value))
            
            other_phones = business_card.fields.get("OtherPhones")
            if other_phones:
                for other_phone in other_phones.value:
                    extractedInfo.append("Other phone number: {}\n".format(other_phone.value))
                    print("Other phone number: {}".format(other_phone.value))

        else:
            mobile_phones = business_card.fields.get("MobilePhones")
            work_phones = business_card.fields.get("WorkPhones")
            other_phones = business_card.fields.get("OtherPhones")
            addresses = business_card.fields.get("Addresses")

    if(specificInformation=="Country's Name From Mobile Phone"):
        if(mobile_phones):
            return PhonesCode(mobile_phones, addresses)
        elif(work_phones):
            return PhonesCode(work_phones, addresses)
        elif(other_phones):
            return PhonesCode(other_phones, addresses)
        return "Form Reconizer did not identify any phone numbers"
    elif(specificInformation=="Country's Name From Address"):
        if(addresses):
            return AddressLocation(addresses)
        return "Form Reconizer did not identify any addresses"
    elif(allInfo):
        return extractedInfo
    
    return "Wrong Requirement"