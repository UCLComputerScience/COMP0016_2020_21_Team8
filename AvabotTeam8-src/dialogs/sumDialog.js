// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, ChoiceFactory, ChoicePrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const SUM_DIALOG = 'SUM_DIALOG';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const TEXT_PROMPT = 'TEXT_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';

class SumDialog extends ComponentDialog {
    constructor(mainId) {
        super(SUM_DIALOG);
        this.mainId = mainId;

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.beginStep.bind(this),
            this.secondStep.bind(this),
            this.endStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async beginStep(stepContext) {
        return await stepContext.prompt(CHOICE_PROMPT, {
            prompt: 'Anything else for the doc?',
            choices: ChoiceFactory.toChoices(['create a form', 'ask me about it', 'no'])
        });
    }

    async secondStep(stepContext) {
        const choice = stepContext.result.value;
        if (choice == 'create a form'){
            await stepContext.context.sendActivity('More functions to be updating...');
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'Anything else for the doc?',
                choices: ChoiceFactory.toChoices(['ask me about it', 'no'])
            });
        }
        else if (choice == 'ask me about it'){
            await stepContext.context.sendActivity('More functions to be updating...');
            return await stepContext.prompt(CHOICE_PROMPT, {
                prompt: 'Anything else for the doc?',
                choices: ChoiceFactory.toChoices(['create a form', 'no'])
            });
        }
        else {
            return await stepContext.endDialog();
        }
        
    }
    async endStep(stepContext) {
        const choice = stepContext.result.value;
        if (choice == 'create a form'){
            await stepContext.context.sendActivity('More functions to be updating...');
        }
        else if (choice == 'ask me about it'){
            await stepContext.context.sendActivity('More functions to be updating...');
        }
        return await stepContext.endDialog();
        
    }
}

module.exports.SumDialog = SumDialog;
module.exports.SUM_DIALOG = SUM_DIALOG;