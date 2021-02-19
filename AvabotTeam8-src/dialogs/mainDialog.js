// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path');
const axios = require('axios');
const fs = require('fs');
const fse = require("fs-extra");
var FormData = require("form-data");
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { AnswerDialog, ANSWER_DIALOG } = require('./answerDialog');
const { SumDialog, SUM_DIALOG } = require('./sumDialog');

const ATTACHMENT_PROMPT = 'ATTACHMENT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEMP_PDF_NAME = 'tmp.pdf'
const SUMTEXT_URL = 'https://textsumapi.azurewebsites.net/api/textsumapi';
const QASYSTEM_URL = 'https://51.11.38.199:5000/';

class MainDialog extends ComponentDialog {
    constructor(userState) {
        super('mainDialog');

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new AnswerDialog());
        this.addDialog(new SumDialog(this.initialDialogId));
        this.addDialog(new TextPrompt('TextPrompt'));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACHMENT_PROMPT, this.picturePromptValidator));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.startStep.bind(this),
            this.chooseStep.bind(this),
            this.docStep.bind(this),
            this.dealStep.bind(this),
            this.repeatStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async startStep(step) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        // Running a prompt here means the next WaterfallStep will be run when the user's response is received.
        const msg = step.options.restartMsg ? step.options.restartMsg : 'What can I do for you?';
        return await step.prompt(CHOICE_PROMPT, {
            prompt: msg,
            choices: ChoiceFactory.toChoices(['ask a question', 'process a document'])
        });
    }

    async chooseStep(step) {
        console.log('|'+step.result.value+'|');
        const choice = step.result.value;
        if (choice == 'ask a question') {
            return await step.beginDialog(ANSWER_DIALOG);
        }
        else {
            var promptOptions = {
                prompt: 'Please attach a document in pdf.',
                retryPrompt: 'That was not a document that I can help, please try again.'
            };

            return await step.prompt(ATTACHMENT_PROMPT, promptOptions);
        }
    }

    async docStep(step) {
        if (step.result && step.result.length > 0) {
            await this.handleIncomingAttachment(step.context);

            // TODO: Send the file to both Summarizer and QASystem to be preprocessed
            const summary = this.sendRequest(step, SUMTEXT_URL);
            await this.sendRequest(step, QASYSTEM_URL); // The processing of QA System is much longer then Summarizer, so wait for this process to be finished
            await step.prompt(CHOICE_PROMPT, {
                prompt: 'How can I help with the document?',
                choices: ChoiceFactory.toChoices(['summarize it', 'create a form', 'ask me about it'])
            });
        }
        else{
            return await step.endDialog();
        }
    }

    async dealStep(step, r) {
        console.log(step.result.value);
        const choice = step.result.value;
        if (choice == 'summarize it') {
            // TODO: If user asking for summary, send the result directly
            // await this.sumText(step);
            // return await step.beginDialog(SUM_DIALOG);
            await step.context.sendActivity(r); 
        }
        else if (choice == 'ask a question') {
            // TODO When user ask a questions, send the question to endpoint by GET request
            // const resFromQA = await this.processQuery(step);
            // await step.context.sendActivity(resFromQA);
            await step.context.sendActivity('More functions to be updating...');
        }
        else {
            await step.context.sendActivity('More functions to be updating...');
        }
        return await step.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }

    async repeatStep(step) {
        return await step.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }

    async handleIncomingAttachment(turnContext) {
        // Prepare Promises to download each attachment and then execute each Promise.
        const promises = await turnContext.activity.attachments.map(this.downloadAttachmentAndWrite);
        const successfulSaves = await Promise.all(promises);

        // Replies back to the user with information about where the attachment is stored on the bot's server,
        // and what the name of the saved file is.
        async function replyForReceivedAttachments(localAttachmentData) {
            if (localAttachmentData) {
                // Because the TurnContext was bound to this function, the bot can call
                // `TurnContext.sendActivity` via `this.sendActivity`;
                await this.sendActivity(`Attachment "${localAttachmentData.fileName}" ` +
                    `has been received.`);

            } else {
                await this.sendActivity('Attachment was not successfully saved to disk.');
            }
        }

        // Prepare Promises to reply to the user with information about saved attachments.
        // The current TurnContext is bound so `replyForReceivedAttachments` can also send replies.
        const replyPromises = successfulSaves.map(replyForReceivedAttachments.bind(turnContext));
        await Promise.all(replyPromises);
    }

    async downloadAttachmentAndWrite(attachment) {
        // Retrieve the attachment via the attachment's contentUrl.
        const url = attachment.contentUrl;

        // Local file path for the bot to save the attachment.
        const localFileName = path.join(__dirname, 'tmp.pdf');

        try {
            // arraybuffer is necessary for images
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            // If user uploads JSON file, this prevents it from being written as "{"type":"Buffer","data":[123,13,10,32,32,34,108..."
            if (response.headers['content-type'] === 'application/json') {
                response.data = JSON.parse(response.data, (key, value) => {
                    return value && value.type === 'Buffer' ? Buffer.from(value.data) : value;
                });
            }
            fs.writeFile(localFileName, response.data, (fsError) => {
                if (fsError) {
                    throw fsError;
                }
            });
        } catch (error) {
            console.error(error);
            return undefined;
        }
        // If no error was thrown while writing to disk, return the attachment's name
        // and localFilePath for the response back to the user.
        return {
            fileName: attachment.name,
            localPath: localFileName
        };
    }

    async sumText(step) {
        var form = new FormData();
        const FileName = path.join(__dirname, TEMP_PDF_NAME);
        form.append("file", fse.createReadStream(FileName));
       
        let r = await axios({
          method: "post",
          url: "https://textsumapi.azurewebsites.net/api/textsumapi",
          data: form,
          headers: form.getHeaders()
        }).then(v => v.data);
       
        console.log(r); // ok
        await step.context.sendActivity(r);
    }
    // TODO: Abstraction of sending a request to a given url
    async sendRequest(step, url) {
        var form = new FormData();
        const FileName = path.join(__dirname, TEMP_PDF_NAME);
        form.append("file", fse.createReadStream(FileName));
        console.log("send request to " + url);
        let r = await axios({
          method: "post",
          url: url,
          data: form,
          headers: form.getHeaders()
        }).then(v => v.data);
       
        console.log(r); // ok
        return r;
    }
    // TODO: process a query to the qa system by sending the qa system url a GET request
    async processQuery(step, query, url) {
        let r = await axios({
            method: "get",
            url: url + '?' + query,
            data: form,
            headers: form.getHeaders()
          }).then(v => v.data);
         
            console.log(r); // ok
    }
    async picturePromptValidator(promptContext) {
        if (promptContext.recognized.succeeded) {
            var attachments = promptContext.recognized.value;
            var validImages = [];

            attachments.forEach(attachment => {
                console.log(attachment.contentType);
                if (attachment.contentType === 'application/pdf') {
                    validImages.push(attachment);
                }
            });

            promptContext.recognized.value = validImages;

            // If none of the attachments are valid images, the retry prompt should be sent.
            return !!validImages.length;
        } else {
            await promptContext.context.sendActivity('No attachments received, please try again.');

            // We can return true from a validator function even if Recognized.Succeeded is false.
            return false;
        }
    }

    
}

module.exports.MainDialog = MainDialog;