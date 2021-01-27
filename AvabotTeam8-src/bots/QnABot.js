// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
const { ActionTypes } = require('botframework-schema');
const { QnAMaker } = require('botbuilder-ai');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const execSync = require('child_process').execSync;

class QnABot extends ActivityHandler {
    constructor() {
        super();

        try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAEndpointKey,
                host: process.env.QnAEndpointHostName
            });
        } catch (err) {
            console.warn(`QnAMaker Exception: ${err} Check your QnAMaker configuration in .env`);
        }

        // If a new user is added to the conversation, send them a greeting message
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await this.sendSuggestedActions(context);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        // When a user sends a message, perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
        this.onMessage(async (context, next) => {
            const replyText = context.activity.text;
            if (replyText == 'ask me a question') {
                if (!process.env.QnAKnowledgebaseId || !process.env.QnAEndpointKey || !process.env.QnAEndpointHostName) {
                    const unconfiguredQnaMessage = 'NOTE: \r\n' +
                        'QnA Maker is not configured. To enable all capabilities, add `QnAKnowledgebaseId`, `QnAEndpointKey` and `QnAEndpointHostName` to the .env file. \r\n' +
                        'You may visit www.qnamaker.ai to create a QnA Maker knowledge base.';

                    await context.sendActivity(unconfiguredQnaMessage);
                }
                else {
                    console.log('Calling QnA Maker');
                    const qnaResults = await this.qnaMaker.getAnswers(context);

                    // If an answer was received from QnA Maker, send the answer back to the user.
                    if (qnaResults[0]) {
                        await context.sendActivity(qnaResults[0].answer);

                        // If no answers were returned from QnA Maker, reply with help.
                    } else {
                        await context.sendActivity('No QnA Maker answers were found.');
                    }

                }

            }
            else if (replyText == 'send me a document, I will try to help') {
                await context.sendActivity('Please upload the doc in pdf.');

            }
            else {
                if (context.activity.attachments && context.activity.attachments.length > 0) {
                    // The user sent an attachment and the bot should handle the incoming attachment.
                    await this.handleIncomingAttachment(context);
                    await this.sumText(context);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }


    async sumText(context) {
        const output = execSync('python3 text-summarization/demo.py')
        await context.sendActivity(output.toString());
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
        const localFileName = path.join(__dirname, 'text.pdf');

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


    /**
  * Returns an attachment that has been uploaded to the channel's blob storage.
  * @param {Object} turnContext
  */
    async getUploadedAttachment(turnContext) {
        const imageData = fs.readFileSync(path.join(__dirname, '../resources/architecture-resize.png'));
        const connector = turnContext.adapter.createConnectorClient(turnContext.activity.serviceUrl);
        const conversationId = turnContext.activity.conversation.id;
        const response = await connector.conversations.uploadAttachment(conversationId, {
            name: 'architecture-resize.png',
            originalBase64: imageData,
            type: 'image/png'
        });

        // Retrieve baseUri from ConnectorClient for... something.
        const baseUri = connector.baseUri;
        const attachmentUri = baseUri + (baseUri.endsWith('/') ? '' : '/') + `v3/attachments/${encodeURI(response.id)}/views/original`;
        return {
            name: 'architecture-resize.png',
            contentType: 'image/png',
            contentUrl: attachmentUri
        };
    }

    async sendSuggestedActions(turnContext) {
        const cardActions = [
            {
                type: ActionTypes.PostBack,
                title: 'ask me a question',
                value: 'ask me a question',
            },
            {
                type: ActionTypes.PostBack,
                title: 'send me a document, I will try to help',
                value: 'send me a document, I will try to help',
            },
        ];

        var reply = MessageFactory.suggestedActions(cardActions, 'What can I do for you?');
        await turnContext.sendActivity(reply);
    }



}

module.exports.QnABot = QnABot;
