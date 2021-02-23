// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { QnAMaker } = require('botbuilder-ai');
const { MessageFactory, InputHints } = require('botbuilder');

const ANSWER_DIALOG = 'ANSWER_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';

class AnswerDialog extends ComponentDialog {
    constructor() {
        super(ANSWER_DIALOG);
        try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAEndpointKey,
                host: process.env.QnAEndpointHostName
            });
        } catch (err) {
            console.warn(`QnAMaker Exception: ${err} Check your QnAMaker configuration in .env`);
        }

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.beginStep.bind(this),
            this.answerStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async beginStep(stepContext) {
        const msg = stepContext.options.restartMsg ? stepContext.options.restartMsg : 'Feel free to ask any questions you have.';
        const promptOptions = MessageFactory.text(msg, msg, InputHints.ExpectingInput);

        // Ask the user to enter their name.
        return await stepContext.prompt(TEXT_PROMPT, promptOptions);
    }

    async answerStep(stepContext) {
        if (!process.env.QnAKnowledgebaseId || !process.env.QnAEndpointKey || !process.env.QnAEndpointHostName) {
            const unconfiguredQnaMessage = 'NOTE: \r\n' +
                'QnA Maker is not configured. To enable all capabilities, add `QnAKnowledgebaseId`, `QnAEndpointKey` and `QnAEndpointHostName` to the .env file. \r\n' +
                'You may visit www.qnamaker.ai to create a QnA Maker knowledge base.';

            await stepContext.context.sendActivity(unconfiguredQnaMessage);
            return await stepContext.endDialog();
        }
        else {
            console.log('Calling QnA Maker');
            try {
                const qnaResults = await this.qnaMaker.getAnswers(stepContext.context);
                var msg = '';
                // If an answer was received from QnA Maker, send the answer back to the user.
                if (qnaResults[0]) {
                    msg = qnaResults[0].answer;

                    // If no answers were returned from QnA Maker, reply with help.
                } else {
                    msg = 'No QnA Maker answers were found.';
                }
            }
            catch (error) {
                await stepContext.context.sendActivity('Sorry, QnA maker is currently unavailable.');
                return await stepContext.endDialog();

            }


        }
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: msg });
    }
}

module.exports.AnswerDialog = AnswerDialog;
module.exports.ANSWER_DIALOG = ANSWER_DIALOG;