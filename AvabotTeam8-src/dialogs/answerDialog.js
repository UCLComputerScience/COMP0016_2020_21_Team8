const {
  ComponentDialog,
  TextPrompt,
  WaterfallDialog,
} = require("botbuilder-dialogs");
const { QnAMaker } = require("botbuilder-ai");
const { MessageFactory } = require("botbuilder");
const { ActionTypes } = require("botframework-schema");

const ANSWER_DIALOG = "ANSWER_DIALOG";
const WATERFALL_DIALOG = "WATERFALL_DIALOG";
const TEXT_PROMPT = "TEXT_PROMPT";

/**
 * The dialog to do QnA with user
 * @class AnswerDialog
 * @extends {ComponentDialog}
 */
class AnswerDialog extends ComponentDialog {
  constructor() {
    super(ANSWER_DIALOG);
    try {
      // create qnaMaker
      this.qnaMaker = new QnAMaker({
        knowledgeBaseId: process.env.QnAKnowledgebaseId,
        endpointKey: process.env.QnAEndpointKey,
        host: process.env.QnAEndpointHostName,
      });
    } catch (err) {
      console.warn(
        `QnAMaker Exception: ${err} Check your QnAMaker configuration in .env`
      );
    }

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.beginStep.bind(this),
        this.answerStep.bind(this),
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * A waterfall step to guide user when user enters the QnA mode or to answer the question user has asked if the dialog is restarted.
   * @param {*} stepContext
   * @return {*}
   * @memberof AnswerDialog
   */
  async beginStep(stepContext) {
    const msg = stepContext.options.restartMsg
      ? stepContext.options.restartMsg
      : "Welcome! You can go on ask questions, or click `quit` to quit the QnA mode whenever feeling like so.";
    // user can quit QnA anytime by clicking `quit`
    const cardActions = [
      {
        type: ActionTypes.PostBack,
        title: "quit",
        value: "quit",
      },
    ];
    const message = MessageFactory.suggestedActions(cardActions, msg);

    // Ask the user to enter their name.
    return await stepContext.prompt(TEXT_PROMPT, message);
  }

  /**
   * A waterfall step to fetch answer from KB and send to user.
   * @param {*} stepContext
   * @return {*}
   * @memberof AnswerDialog
   */
  async answerStep(stepContext) {
    if (stepContext.result == "quit") {
      return await stepContext.endDialog();
    }
    console.log("Calling QnA Maker");
    try {
      const qnaResults = await this.qnaMaker.getAnswers(stepContext.context);
      var msg = "";
      // If an answer was received from QnA Maker, send the answer back to the user.
      if (qnaResults[0]) {
        msg = qnaResults[0].answer;

        // If no answers were returned from QnA Maker, reply with help.
      } else {
        msg = "No QnA Maker answers were found.";
      }
    } catch (error) {
      console.log(error);
      await stepContext.context.sendActivity(
        "Sorry, QnA maker is currently unavailable."
      );
      return await stepContext.endDialog();
    }
    return await stepContext.replaceDialog(this.initialDialogId, {
      restartMsg: msg,
    });
  }

  /**
   * QnAMaker setter
   * @memberof AnswerDialog
   */
  set a(n) {
    this.qnaMaker = n;
  }
}

module.exports.AnswerDialog = AnswerDialog;
module.exports.ANSWER_DIALOG = ANSWER_DIALOG;
