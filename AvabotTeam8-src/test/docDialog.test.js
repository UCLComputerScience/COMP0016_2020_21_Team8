const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { DocDialog } = require('../dialogs/docDialog');
const assert = require('assert');

describe('MainDialog', () => {
    it('tests beginStep', async () => {
        //const mockRecognizer = new MockFlightBookingRecognizer(false);
        //const mockBookingDialog = new MockBookingDialogWithPrompt();
        let sut = new DocDialog('WATERFALL_DIALOG');
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
        sut.a = 'summary';
        let reply = await client.sendActivity('hi');
        reply = await client.sendActivity('summarize it');
        assert.strictEqual(reply.text, 'summary');
    });


});