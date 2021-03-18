const { ActivityHandler, MessageFactory } = require("botbuilder");
const { ActionTypes } = require("botframework-schema");

class AvaBot extends ActivityHandler {
  /**
   * @param {ConversationState} conversationState
   * @param {UserState} userState
   * @param {Dialog} dialog
   */
  constructor(conversationState, userState, dialog) {
    super();
    if (!conversationState)
      throw new Error(
        "[AvaBot]: Missing parameter. conversationState is required"
      );
    if (!userState)
      throw new Error("[AvaBot]: Missing parameter. userState is required");
    if (!dialog)
      throw new Error("[AvaBot]: Missing parameter. dialog is required");

    this.conversationState = conversationState;
    this.userState = userState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty("DialogState");

    /**
     * OnMessage is called for each user input received.
     */
    this.onMessage(async (context, next) => {
      console.log("Running dialog with Message Activity.");
      // Run the Dialog with the new message Activity.
      await this.dialog.run(context, this.dialogState);
      await next();
    });

    /**
     * onMembersAdded is called when a user joins in, and sends a greeting message.
     */
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id == context.activity.recipient.id) {
          await this.sendSuggestedActions(context);
        }
      }
      await next();
    });
  }

  /**
   * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
   */
  async run(context) {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }

  /**
   * Send suggested actions to the user.
   * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
   */
  async sendSuggestedActions(turnContext) {
    const cardActions = [
      {
        type: ActionTypes.PostBack,
        title: "Got it!",
        value: "Got it!",
      },
    ];

    var reply = MessageFactory.suggestedActions(
      cardActions,
      "Hi, I am AvaBot, your remote-working assistant. I can answer questions you have about the company and help you with documents.\n" +
        "\nFor the document, you can \n" +
        "1. ask me to summarize it so that you will know what it's about\n" +
        "2. ask me to extract table data from it\n" +
        "3. ask me any question about the document, and I will try to answer it\n" +
        "\nYou can also send me an image, I will detect familiar patterns and extract text for you."
    );
    await turnContext.sendActivity(reply);
  }
}

module.exports.AvaBot = AvaBot;
