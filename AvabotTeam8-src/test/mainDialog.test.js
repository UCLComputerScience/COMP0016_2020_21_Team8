const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { MainDialog } = require('../dialogs/mainDialog');
const assert = require('assert');


describe('MainDialog', () => {
    it('tests startStep', async () => {
        //const mockRecognizer = new MockFlightBookingRecognizer(false);
        //const mockBookingDialog = new MockBookingDialogWithPrompt();
        const sut = new MainDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        const reply = await client.sendActivity('hi');
        assert.strictEqual(reply.text, 'What can I do for you? (1) ask a question, (2) process a document, or (3) recognize an image');
    });

    describe('test chooseStep', () => {
        // Create array with test case data.
        const testCases = [
            { utterance: 'ask a question', reply: 'Feel free to ask any questions you have.' },
            { utterance: 'process a document', reply: 'Please attach a document in pdf.' },
            { utterance: 'recognize an image', reply: 'Please attach an image.' },
            { utterance: 'hi', reply: 'What can I do for you? (1) ask a question, (2) process a document, or (3) recognize an image' }
        ];

        testCases.map(testData => {
            it(testData.utterance, async () => {
                const sut = new MainDialog();
                const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
                let reply = await client.sendActivity('hi');
                assert.strictEqual(reply.text, 'What can I do for you? (1) ask a question, (2) process a document, or (3) recognize an image');
                reply = await client.sendActivity(testData.utterance);
                assert.strictEqual(reply.text, testData.reply);

            });
        });
    });

    it('tests docMissing', async () => {
        //const mockRecognizer = new MockFlightBookingRecognizer(false);
        //const mockBookingDialog = new MockBookingDialogWithPrompt();
        const sut = new MainDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        await client.sendActivity('hi');
        await client.sendActivity('process a document');
        let reply = await client.sendActivity('no');
        assert.strictEqual(reply.text, 'No attachments received.');
        reply = client.getNextReply();
        assert.strictEqual(reply.text, 'What else can I do for you? (1) ask a question, (2) process a document, or (3) recognize an image');
    });

    it('tests sendReqMethod', async () => {
        const sut = new MainDialog();
        let a = await sut.sendReq('./testData/test.txt');
        assert.strictEqual(a[0], 0);
        assert.strictEqual(a[1], 0);

    });


});

