const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { AnswerDialog } = require('../dialogs/answerDialog');
const assert = require('assert');
var assertChai = require('chai').assert;


describe('AnswerDialog', () => {
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
        let reply = await client.sendActivity('Hi');
        assertChai.typeOf(reply.text, 'string')
    });

    it('tests answerStepNoAnswer', async () => {
        //const mockRecognizer = new MockFlightBookingRecognizer(false);
        //const mockBookingDialog = new MockBookingDialogWithPrompt();
        const sut = new AnswerDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        await client.sendActivity('hi');
        let reply = await client.sendActivity('= =');
        assertChai.typeOf(reply.text, 'string')
    });


});