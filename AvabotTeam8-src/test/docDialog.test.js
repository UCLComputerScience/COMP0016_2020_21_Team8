const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { DocDialog } = require('../dialogs/docDialog');
const assert = require('assert');


describe('DocDialog', () => {
    var client;
    var sut;

    beforeEach(async ()=> {
        sut = new DocDialog('WATERFALL_DIALOG');
        client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
        await client.sendActivity('hi');
    });

    it('tests sumOk', async () => {
        sut.a = 'summary';
        let reply = await client.sendActivity('summarize it');
        assert.strictEqual(reply.text, 'summary');
    });

    it('tests sumFail', async () => {
        let reply = await client.sendActivity('summarize it');
        assert.strictEqual(reply.text, 'Summarization failed.');
    });

    it('tests FormOk', async () => {
        sut.c = ['{"0":{"0":"row1"}}', '{"0":{"0":"row1"}}'];
        let reply = await client.sendActivity('extract table');
        assert.strictEqual(
          reply.text,
          'Table 1: \r\nColumn 1: "row1" \r\nTable 2: \r\nColumn 1: "row1" \r\n'
        );
    });

    it('tests FormOkNoTable', async () => {
        sut.c = 'No Table Found';
        let reply = await client.sendActivity('extract table');
        assert.strictEqual(reply.text, 'No Table Found');
    });


    it('tests FormFail', async () => {
        let reply = await client.sendActivity('extract table');
        assert.strictEqual(reply.text, 'Table recognition failed.');
    });

    it('tests queryOk', async () => {
        sut.b = 'query';
        let reply = await client.sendActivity('QnA about it');
        assert.strictEqual(reply.text, 'What is the question?');
    });

    it('tests queryFail', async () => {
        let reply = await client.sendActivity('QnA about it');
        assert.strictEqual(reply.text, 'QA system preprocessing failed.');
    });

    it('tests no', async () => {
        let reply = await client.sendActivity('summarize it');
        reply = await client.sendActivity('no');
        reply = await client.sendActivity('hi');
        assert.strictEqual(reply.text, 'How can I help with the document? (1) summarize it, (2) extract table, or (3) QnA about it');
    });

    it('tests answer', async () => {
        sut.b = 'query';
        let reply = await client.sendActivity('QnA about it');
        reply = await client.sendActivity('What?');
        reply = client.getNextReply();
        reply = client.getNextReply();
        assert.strictEqual(reply.text, 'Anything else for the document?\n\n   1. summarize it\n   2. extract table\n   3. QnA about it\n   4. no');

    });

    it('tests Begin', async () => {
        const w = new DocDialog('WATERFALL_DIALOG');
        await w.beginStep({options:{sum:'sum',query:'query',form:'form',filepath:'path'},prompt: function(){return}})
        assert.strictEqual(w.sum, 'sum');
    });

    it("tests TableFormat", async () => {
      const w = new DocDialog("WATERFALL_DIALOG");
        const table = ['{"0":{"0":"row1"}}', '{"0":{"0":"row1"}}'];
      assert.strictEqual(
        w.formatTable(table),
        'Table 1: \r\nColumn 1: "row1" \r\nTable 2: \r\nColumn 1: "row1" \r\n'
      );
    });

    


});