// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path');
const axios = require('axios');
const fse = require("fs-extra");
var FormData = require("form-data");
const { ComponentDialog, ChoiceFactory, ChoicePrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const DOC_DIALOG = 'DOC_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';


class DocDialog extends ComponentDialog {
    constructor(mainId) {
        super(DOC_DIALOG);
        this.mainId = mainId;

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.beginStep.bind(this),
            this.dealStep.bind(this),
            this.answerStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async beginStep(stepContext) {
        if (stepContext.options.restartMsg) {
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'Anything else for the document?',
                choices: ChoiceFactory.toChoices(['summarize it', 'extract form', 'ask me about it', 'no'])
            });
        }
        else {
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'How can I help with the document?',
                choices: ChoiceFactory.toChoices(['summarize it', 'extract form', 'ask me about it'])
            });
        }
    }

    async dealStep(step) {
        console.log(step.result.value);
        const choice = step.result.value;
        if (choice == 'summarize it') {
            await this.sumText(step);
        }
        else if (choice == 'extract form') {
            await step.context.sendActivity('More functions to be updating...');
        }
        else if (choice == 'ask me about it') {
            return await step.prompt(TEXT_PROMPT, {prompt : 'What is the question?'});
        }
        else {
            return await step.endDialog();
        }

        return await step.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }

    async answerStep(step) {
        //answer matching API
        await step.context.sendActivity('More functions to be updating...');
        return await step.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }

    async sumText(step) {
        var form = new FormData();
        const FileName = path.join(__dirname, 'text.pdf');
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
}

module.exports.DocDialog = DocDialog;
module.exports.DOC_DIALOG = DOC_DIALOG;