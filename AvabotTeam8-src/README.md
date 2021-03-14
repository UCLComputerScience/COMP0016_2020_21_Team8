# AvaBot Deployment Manual 

 AvaBot has been created using [MS Bot Framework](https://dev.botframework.com), it can

* Answer general questions, Avanade-related questions, and UCL-related questions
* Summarize a document
* Extract table data from a document
* Answer questions about a document
* Recognize images of business-card pattern

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org)
- [ngrok](https://ngrok.com/)
- [Bot Framework Emulator](https://github.com/microsoft/botframework-emulator)

## Build and Run
### Configure Bot Framework Emulator
- Install the latest Bot Framework Emulator from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)
- Launch Bot Framework Emulator
- Go to Settings on the left bottom of the window
- Enter Path of ngrok
- Tick `Bypass ngrok for local address` box
- Tick `Run ngrok when the Emulator starts up` box

### Run the bot

- Clone the repository

    ```bash
    git clone https://github.com/UCLComputerScience/COMP0016_2020_21_Team8.git
    ```
    
- Make sure `MicrosoftAppId`, `MicrosoftAppPassword`, `QnAKnowledgebaseId`, `QnAEndpointKey`, and `QnAEndpointHostName` are correctly configured in `AvabotTeam8-src/.env` file
- In a terminal, navigate to `AvabotTeam8-src`
    
    ```bash
    cd AvabotTeam8-src
    ```
    
- Install modules
    
    ```bash
    npm install
    ```
    
- Run the bot
    
    ```bash
    npm start
    ```
    
- Launch Bot Framework Emulator
- File -> Open Bot
- Browse and choose `myBot.bot` in the `COMP0016_2020_21_Team8` repository

## Test
- In a terminal, navigate to `AvabotTeam8-src`
- Run test by
    
    ```bash
    npm run test
    ```
    
- Run test with coverage by
    
    ```bash
    npm run cover
    ```
    
- Run test and generate a coverage report by
    
    ```bash
    npm run coverage
    ```
    
Note: for passing all the tests, make sure the APIs used by the bot are working properly.

## Development

To develop your own bot application, see [Azure Bot Service](https://azure.microsoft.com/en-gb/services/bot-services/) for creating Web App Bot resource and configure the `AvabotTeam8-src/.env` file with your AppId and AppPassword. </br>
To learn more about deploying a bot to Azure, see [Deploy your bot to Azure](https://aka.ms/azuredeployment) for a complete list of deployment instructions.


