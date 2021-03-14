const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { MainDialog } = require('../dialogs/mainDialog');
const assert = require('assert');
const { MessageFactory, CardFactory } = require('botbuilder');


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
          {
            utterance: "ask a question",
            reply:
              "Welcome! You can go on ask questions, or click `quit` to quit the QnA mode whenever feeling like so.",
          },
          {
            utterance: "process a document",
            reply: "Please attach a document in pdf.",
          },
          { utterance: "recognize an image", reply: "Please attach an image." },
          {
            utterance: "hi",
            reply:
              "What can I do for you? (1) ask a question, (2) process a document, or (3) recognize an image",
          },
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

    it('tests sendNoPdf', async () => {
        const sut = new MainDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        let reply = await client.sendActivity('hi');
        const message = MessageFactory.attachment(
            CardFactory.heroCard(
                'White T-Shirt',
                ['https://example.com/whiteShirt.jpg'],
                ['buy']
            )
        );
        reply = await client.sendActivity('process a document');
        reply = await client.sendActivity(message);
        assert.strictEqual(reply.text, 'That was not a document that I can help, please try again.')

    });

    it('tests sendNoImage', async () => {
        const sut = new MainDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        let reply = await client.sendActivity('hi');
        const message = MessageFactory.attachment(
            CardFactory.heroCard(
                'White T-Shirt',
                ['https://example.com/whiteShirt.jpg'],
                ['buy']
            )
        );
        reply = await client.sendActivity('recognize an image');
        reply = await client.sendActivity(message);
        assert.strictEqual(reply.text, 'That was not an image that I can help, please try again.')

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

    it('tests downloadAttach', async () => {
        const sut = new MainDialog();
        let a = await sut.downloadAttachmentAndWrite({ contentType: 'a/b', contentUrl: 'url', name:'hi'});
        assert.strictEqual(a, undefined);

    });

    it('tests docStep', async () => {
        const sut = new MainDialog();
        let a = await sut.docStep({ result: [{ contentUrl: 'url' }], activity: '', next: function () { return } }).catch(function (error) { });
        assert.strictEqual(a, undefined);

    });

    it('tests docStepPdf', async () => {
        const sut = new MainDialog();
        let a = await sut.docStep({ result: [{ contentUrl: 'url', contentType: 'application/pdf' }], activity: '', next: function () { return } }).catch(function (error) { });
        assert.strictEqual(a, undefined);

    });

    it('tests docStepImage', async () => {
        const sut = new MainDialog();
        let a = await sut.docStep({ result: [{ contentUrl: 'url', contentType: 'application/png' }], activity: '', context: '', next: function () { return } }).catch(function (error) { });
        assert.strictEqual(a, undefined);

    });

    it('tests handleAttachment', async () => {
        const path = require('path');
        const sut = new MainDialog();
        let a = await sut.handleIncomingAttachment({ activity: { attachments: [{ contentType: 'application/txt', contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',name:'test.txt'}] }, sendActivity: function () { return } })
        var localFileName = path.join(path.resolve(__dirname, '..'), 'dialogs');
        localFileName = path.join(localFileName, 'test.txt');
        assert.strictEqual(a, localFileName);

    });

    it('tests promptValidatorPdf', async () => {
        const sut = new MainDialog();
        let a = await sut.promptValidator({ recognized: { succeeded: true, value: [{ contentType: 'application/pdf' }] }, options: { prompt: 'Please attach a document in pdf.' } })
        assert.strictEqual(a, true);

    });

    it('tests promptValidatorImage', async () => {
        const sut = new MainDialog();
        let a = await sut.promptValidator({ recognized: { succeeded: true, value: [{ contentType: 'image/png' }] }, options: { prompt: 'Please attach an image.' } })
        assert.strictEqual(a, true);

    });



    it('tests errorAttachment', async () => {
        const sut = new MainDialog();
        let a = await sut.handleIncomingAttachment({ activity: { attachments: [{ contentType: 'application/nvm', contentUrl: 'nvm', name:'nvm' }] }, sendActivity: function () { return } })
        assert.strictEqual(a, undefined);

    });

    it('tests docStepDocReq', async () => {
        const sut = new MainDialog();
        let a = await sut.docStep({
          result: [{ contentUrl: "nvm", contentType: "application/pdf" }],
          context: {
            activity: {
              attachments: [
                {
                  contentType: "application/txt",
                  contentUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                  name: "test.txt",
                },
              ],
            },
            sendActivity: function () {
              return;
            },
          },
          next: function () {
            return;
          },
          beginDialog: function () {
            return;
          },
        });
        assert.strictEqual(a, undefined);

    });

    it('tests docStepPicReq', async () => {
        const sut = new MainDialog();
        let a = await sut.docStep({result:[{contentUrl:'nvm',contentType:'image/png'}], context:{ activity: { attachments: [{ contentType: 'application/txt', contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', name:'test.txt' }] }, sendActivity: function () { return } }, next:function(){return}, beginDialog:function(){return}})
        assert.strictEqual(a, undefined);

    });

    it('tests docStepSendReq', async () => {
        const sut = new MainDialog();
        let a = await sut.docStep({result:[{contentUrl:'nvm',contentType:'image/jpeg'}], context:{ activity: { attachments: [{ contentType: 'application/jpeg', contentUrl: 'https://github.com/Azure-Samples/cognitive-services-REST-api-samples/blob/master/curl/form-recognizer/business-card-english.jpg', name:'test.jpg' }] }, sendActivity: function () { return } }, next:function(){return}, beginDialog:function(){return}})
        assert.strictEqual(a, undefined);

    });

    after(function () {
        const path = require('path');
        const fs = require('fs');
        var localFileName = path.join(path.resolve(__dirname, '..'), 'dialogs');
        localFileName = path.join(localFileName, 'test.txt');
        try{
            fs.unlinkSync(localFileName);
        }
        catch(error){
        }
        var localFileName = path.join(path.resolve(__dirname, '..'), 'dialogs');
        localFileName = path.join(localFileName, 'test.jpeg');
        try{
            fs.unlinkSync(localFileName);
        }
        catch(error){
        }
        
    });



});

