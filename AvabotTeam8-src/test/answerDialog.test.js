const { DialogTestClient, DialogTestLogger } = require("botbuilder-testing");
const { AnswerDialog } = require("../dialogs/answerDialog");
const assert = require("assert");
const { QnAMaker } = require("botbuilder-ai");
var assertChai = require("chai").assert;

describe("AnswerDialog", () => {
  it("tests beginStep", async () => {
    const sut = new AnswerDialog();
    const client = new DialogTestClient("test", sut, null, [
      new DialogTestLogger(),
    ]);

    const reply = await client.sendActivity("hi");
    assert.strictEqual(
      reply.text,
      "Welcome! You can go on ask questions, or click `quit` to quit the QnA mode whenever feeling like so."
    );
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

  it("tests answerStep", async () => {
    const sut = new AnswerDialog();
    const client = new DialogTestClient("test", sut, null, [
      new DialogTestLogger(),
    ]);
    const path = require("path");
    const ENV_FILE = path.join(path.resolve(__dirname, ".."), ".env");
    require("dotenv").config({ path: ENV_FILE });
    sut.a = new QnAMaker({
      knowledgeBaseId: process.env.QnAKnowledgebaseId,
      endpointKey: process.env.QnAEndpointKey,
      host: process.env.QnAEndpointHostName,
    });
    await client.sendActivity("hi");
    let reply = await client.sendActivity("Hi");
    assert.strictEqual(reply.text, "Hey.");
  });

  it("tests answerStepNoAnswer", async () => {
    const sut = new AnswerDialog();
    const client = new DialogTestClient("test", sut, null, [
      new DialogTestLogger(),
    ]);
    const path = require("path");
    const ENV_FILE = path.join(path.resolve(__dirname, ".."), ".env");
    require("dotenv").config({ path: ENV_FILE });
    sut.a = new QnAMaker({
      knowledgeBaseId: process.env.QnAKnowledgebaseId,
      endpointKey: process.env.QnAEndpointKey,
      host: process.env.QnAEndpointHostName,
    });
    await client.sendActivity("hi");
    let reply = await client.sendActivity("= =");
    assert.strictEqual(
      reply.text,
      "Sorry, I haven't got this one. Please contact the administrator for feeding relevant material to my knowledge base at https://www.qnamaker.ai."
    );
  });

  it("tests noQnaMaker", async () => {
    const sut = new AnswerDialog();
    const client = new DialogTestClient("test", sut, null, [
      new DialogTestLogger(),
    ]);
    sut.a = undefined;
    await client.sendActivity("hi");
    let reply = await client.sendActivity("Hi");
    assertChai.typeOf(reply.text, "string");
  });
});
