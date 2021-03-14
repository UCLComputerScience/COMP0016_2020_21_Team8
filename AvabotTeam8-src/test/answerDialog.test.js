const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { AnswerDialog } = require('../dialogs/answerDialog');
const assert = require('assert');
var assertChai = require('chai').assert;


describe('AnswerDialog', () => {
    it('tests beginStep', async () => {
        const sut = new AnswerDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        const reply = await client.sendActivity('hi');
        assert.strictEqual(reply.text, 'Welcome! You can go on ask questions, or click `quit` to quit the QnA mode whenever feeling like so.');
    });

    it("tests quit", async () => {
      const sut = new AnswerDialog();
      const client = new DialogTestClient("test", sut, null, [
        new DialogTestLogger(),
      ]);
      await client.sendActivity("hi");
      await client.sendActivity("quit");
      let reply = await client.sendActivity("quit");
      assert.strictEqual(
        reply.text,
        "Welcome! You can go on ask questions, or click `quit` to quit the QnA mode whenever feeling like so."
      );
    });

    it('tests answerStep', async () => {
        const sut = new AnswerDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        await client.sendActivity('hi');
        let reply = await client.sendActivity('Hi');
        assertChai.typeOf(reply.text, 'string')
    });

    it('tests answerStepNoAnswer', async () => {
        const sut = new AnswerDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        await client.sendActivity('hi');
        let reply = await client.sendActivity('= =');
        assertChai.typeOf(reply.text, 'string')
    });

    it('tests noQnaMaker', async () => {
        const sut = new AnswerDialog();
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
        sut.a = undefined;
        await client.sendActivity('hi');
        let reply = await client.sendActivity('Hi');
        assertChai.typeOf(reply.text, 'string')
    });

});