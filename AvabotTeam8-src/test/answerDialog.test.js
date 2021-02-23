const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { AnswerDialog } = require('../dialogs/answerDialog');
const assert = require('assert');

describe('MainDialog', () => {
    it('tests beginStep', async () => {
        //const mockRecognizer = new MockFlightBookingRecognizer(false);
        //const mockBookingDialog = new MockBookingDialogWithPrompt();
        const sut = new AnswerDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        const reply = await client.sendActivity('hi');
        assert.strictEqual(reply.text, 'Feel free to ask any questions you have.');
    });

    it('tests answerStep', async () => {
        //const mockRecognizer = new MockFlightBookingRecognizer(false);
        //const mockBookingDialog = new MockBookingDialogWithPrompt();
        const sut = new AnswerDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        await client.sendActivity('hi');
        let reply = await client.sendActivity('our main business');
        assert.strictEqual(reply.text,'Sorry, QnA maker is currently unavailable.')
    });



});