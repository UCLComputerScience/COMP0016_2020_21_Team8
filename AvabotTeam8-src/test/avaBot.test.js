const {
  TestAdapter,
  ActivityTypes,
  TurnContext,
  ConversationState,
  MemoryStorage,
  UserState,
} = require("botbuilder");
const { DialogSet, DialogTurnStatus, Dialog } = require("botbuilder-dialogs");
const { AvaBot } = require("../bots/avaBot");
const assert = require("assert");


class MockRootDialog extends Dialog {
  constructor() {
    super("mockRootDialog");
  }

  async beginDialog(dc, options) {
    await dc.context.sendActivity(`${this.id} mock invoked`);
    return await dc.endDialog();
  }

  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }
}

describe("AvaBot", () => {
  const testAdapter = new TestAdapter();

  async function processActivity(activity, bot) {
    const context = new TurnContext(testAdapter, activity);
    await bot.run(context);
  }

  it("shows welcome msg", async () => {
    const mockRootDialog = new MockRootDialog();
    const memoryStorage = new MemoryStorage();
    const sut = new AvaBot(
      new ConversationState(memoryStorage),
      new UserState(memoryStorage),
      mockRootDialog,
      console
    );

    // Create conversationUpdate activity
    const conversationUpdateActivity = {
      type: ActivityTypes.ConversationUpdate,
      channelId: "test",
      conversation: {
        id: "someId",
      },
      membersAdded: [{ id: "theUser" }],
      recipient: { id: "theUser" },
    };

    const activity = {
      channelData: {
        postBack: true,
        clientActivityID: "1616469781210rt24c8005s8",
        clientTimestamp: "2021-03-23T03:23:01.210Z",
      },
      text: "Got it!",
      type: "message",
      channelId: "emulator",
      from: {
        id: "545935fe-8dbc-4d4e-a5ce-cb09bf3ac0a6",
        name: "User",
        role: "user",
      },
      locale: "en-US",
      entities: [
        {
          requiresBotState: true,
          supportsListening: true,
          supportsTts: true,
          type: "ClientCapabilities",
        },
      ],
      conversation: { id: "0c48de40-8b87-11eb-b81e-b7d60c4ca3f4|livechat" },
      id: "12903aa0-8b87-11eb-b81e-b7d60c4ca3f4",
      recipient: {
        id: "0c1a0610-8b87-11eb-8001-d1124b39928b",
        name: "Bot",
        role: "bot",
      },
      serviceUrl: "https://a0ab23c2b6f5.ngrok.io",
      rawTimestamp: "2021-03-23T03:23:01.322Z",
      rawLocalTimestamp: "2021-03-23T03:23:01+00:00",
      callerId: "urn:botframework:azure",
    };

    // Send the conversation update activity to the bot.
    await processActivity(conversationUpdateActivity, sut);

    // Assert we got the welcome card
    let reply = testAdapter.activityBuffer.shift();
    assert.strictEqual(reply.text.startsWith("Hi"), true);
    await processActivity(activity, sut);
    reply = testAdapter.activityBuffer.shift();
    console.log(reply);
    assert.strictEqual(reply.text, "mockRootDialog mock invoked");
  });

  it("shows different user", async () => {
    const mockRootDialog = new MockRootDialog();
    const memoryStorage = new MemoryStorage();
    const sut = new AvaBot(
      new ConversationState(memoryStorage),
      new UserState(memoryStorage),
      mockRootDialog,
      console
    );

    // Create conversationUpdate activity
    const conversationUpdateActivity = {
      type: ActivityTypes.ConversationUpdate,
      channelId: "test",
      conversation: {
        id: "someId",
      },
      membersAdded: [{ id: "theUser" }],
      recipient: { id: "otherUser" },
    };
    // Send the conversation update activity to the bot.
    await processActivity(conversationUpdateActivity, sut);

    // Assert we got the welcome card
    let reply = testAdapter.activityBuffer.shift();
    assert.strictEqual(reply, undefined);
  });

  it("shows missing conversation state", async () => {
    const mockRootDialog = new MockRootDialog();
    const memoryStorage = new MemoryStorage();
    try {
      const sut = new AvaBot(
        false,
        new UserState(memoryStorage),
        mockRootDialog
      );
    } catch (error) {
      assert.strictEqual(true, true);
      return;
    }
    assert.strictEqual(true, false);
  });
  it("shows missing user state", async () => {
    const mockRootDialog = new MockRootDialog();
    const memoryStorage = new MemoryStorage();
    try {
      const sut = new AvaBot(
        new ConversationState(memoryStorage),
        false,
        mockRootDialog
      );
    } catch (error) {
      assert.strictEqual(true, true);
      return;
    }
    assert.strictEqual(true, false);
  });
  it("shows missing dialog", async () => {
    const mockRootDialog = new MockRootDialog();
    const memoryStorage = new MemoryStorage();
    try {
      const sut = new AvaBot(
        new ConversationState(memoryStorage),
        new UserState(memoryStorage),
        false
      );
    } catch (error) {
      assert.strictEqual(true, true);
      return;
    }
    assert.strictEqual(true, false);
  });
});
