const axios = require("axios");
const {
  ComponentDialog,
  ChoiceFactory,
  ChoicePrompt,
  TextPrompt,
  WaterfallDialog,
} = require("botbuilder-dialogs");
const DOC_DIALOG = "DOC_DIALOG";
const WATERFALL_DIALOG = "WATERFALL_DIALOG";
const TEXT_PROMPT = "TEXT_PROMPT";
const CHOICE_PROMPT = "CHOICE_PROMPT";

/**
 * The dialog for user to choose what they want to do with the document that has been sent by them.
 * @class DocDialog
 * @extends {ComponentDialog}
 */
class DocDialog extends ComponentDialog {
  constructor(mainId) {
    super(DOC_DIALOG);
    this.mainId = mainId;
    this.sum = "";
    this.form = "";
    this.query = "";
    this.filepath = "";

    this.addDialog(new TextPrompt(TEXT_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.beginStep.bind(this),
        this.dealStep.bind(this),
        this.answerStep.bind(this),
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * A waterfall step for user to choose what info they want
   * @param {*} stepContext
   * @return {*}
   * @memberof DocDialog
   */
  async beginStep(stepContext) {
    if (stepContext.options.restartMsg) {
      // if the dialog was restarted, prompt directly.
      return await stepContext.prompt(CHOICE_PROMPT, {
        prompt: "Anything else for the document?",
        choices: ChoiceFactory.toChoices([
          "summarize it",
          "extract table",
          "QnA about it",
          "no",
        ]),
      });
    } else {
      // if the dialog was initiated, collect info passed by mainDialog.
      this.sum = stepContext.options.sum ? stepContext.options.sum : this.sum;
      this.query = stepContext.options.query
        ? stepContext.options.query
        : this.query;
      this.form = stepContext.options.form
        ? stepContext.options.form
        : this.form;
      this.filepath = stepContext.options.filepath
        ? stepContext.options.filepath
        : this.filepath;
      return await stepContext.prompt(CHOICE_PROMPT, {
        prompt: "How can I help with the document?",
        choices: ChoiceFactory.toChoices([
          "summarize it",
          "extract table",
          "QnA about it",
        ]),
      });
    }
  }

  /**
   * A waterfall step to send info that user has asker for
   * @param {*} step
   * @return {*}
   * @memberof DocDialog
   */
  async dealStep(step) {
    console.log(step.result.value);
    const choice = step.result.value;
    if (choice == "summarize it") {
      if (this.sum) {
        await step.context.sendActivity(this.sum);
      } else {
        await step.context.sendActivity("Summarization failed.");
      }
    } else if (choice == "extract table") {
      if (this.form) {
        if (this.form != "No Table Found") {
          await step.context.sendActivity(this.formatTable(this.form));
        } else {
          await step.context.sendActivity(this.form);
        }
      } else {
        await step.context.sendActivity("Table recognition failed.");
      }
    } else if (choice == "QnA about it") {
      if (this.query) {
        //ask what the question is from the user
        return await step.prompt(TEXT_PROMPT, {
          prompt: "What is the question?",
        });
      } else {
        await step.context.sendActivity("QA system preprocessing failed.");
      }
    } else {
      return await step.endDialog();
    }

    return await step.replaceDialog(this.initialDialogId, {
      restartMsg: "What else can I do for you?",
    });
  }

  /**
   * A waterfall dialog to retrieve answer from QA system via HTTP GET request
   * @param {*} step
   * @return {*}
   * @memberof DocDialog
   */
  async answerStep(step) {
    var question = step.result;
    await step.context.sendActivity("Searching for the answer...");
    console.log("question: " + question);
    let answer = await axios
      .get("http://20.77.57.60:8000?query=" + question) //http://20.77.57.60:8000?query=Who is the founder of UCL?
      .then(
        (v) =>
          "answer: " + v.data.answer + " \r\n" + "context: " + v.data.context
      )
      .catch(function (error) {
        console.log(error);
      });
    await step.context.sendActivity(answer);
    return await step.replaceDialog(this.initialDialogId, {
      restartMsg: "What else can I do for you?",
    });
  }

  /**
   * The method to parse the table data sent in json
   * @param {*} tables as an array
   * @return a string
   * @memberof DocDialog
   */
  formatTable(tables) {
    var formatted = "";
    var nth = 1;
    while (tables[nth - 1] != undefined) {
      formatted += "Table " + nth + ": \r\n";
      formatted += this.columDivider(tables[nth - 1]);
      nth++;
    }
    return formatted;
  }

  /**
   * The method used to parse table data
   * @param {*} string
   * @return a string
   * @memberof DocDialog
   */
  columDivider(string) {
    var oneTable = "";
    var columns = [];
    columns = this.getRidSides(string).split("}");
    var item = 1;
    while (columns[item - 1] != undefined) {
      var element = columns[item - 1].split("{")[1];
      if (element != undefined) {
        oneTable += "Column " + item + ": " + this.divide(element) + " \r\n";
      }

      item++;
    }
    return oneTable;
  }

  /**
   * The method used to parse table data
   * @param {*} string
   * @return an array
   * @memberof DocDialog
   */
  divide(string) {
    var column = [];
    var arr = [];
    arr = string.split(",");
    var item = 0;
    while (arr[item] != undefined) {
      var element = arr[item].split(":")[1];
      column.push(element);
      item++;
    }
    return column;
  }

  /**
   * The method used to parse table data
   * @param {*} str
   * @return a string
   * @memberof DocDialog
   */
  getRidSides(str) {
    return str.slice(1, str.length - 1);
  }

  /**
   * setter for sum
   * @memberof DocDialog
   */
  set a(n) {
    this.sum = n;
  }
  /**
   * setter for query
   * @memberof DocDialog
   */
  set b(n) {
    this.query = n;
  }
  /**
   * setter for form
   * @memberof DocDialog
   */
  set c(n) {
    this.form = n;
  }
}

module.exports.DocDialog = DocDialog;
module.exports.DOC_DIALOG = DOC_DIALOG;
