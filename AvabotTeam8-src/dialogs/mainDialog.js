const path = require("path");
const axios = require("axios");
const fs = require("fs");
const fse = require("fs-extra");
var FormData = require("form-data");
const {
  AttachmentPrompt,
  ChoiceFactory,
  ChoicePrompt,
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
} = require("botbuilder-dialogs");
const { AnswerDialog, ANSWER_DIALOG } = require("./answerDialog");
const { DocDialog, DOC_DIALOG } = require("./docDialog");

const ATTACHMENT_PROMPT = "ATTACHMENT_PROMPT";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const WATERFALL_DIALOG = "WATERFALL_DIALOG";

/**
 * The bot's main dialog
 * @class MainDialog
 * @extends {ComponentDialog}
 */
class MainDialog extends ComponentDialog {
  constructor() {
    super("mainDialog");
    this.addDialog(new AnswerDialog());
    this.addDialog(new DocDialog(this.initialDialogId));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(
      new AttachmentPrompt(ATTACHMENT_PROMPT, this.promptValidator)
    );

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.startStep.bind(this),
        this.chooseStep.bind(this),
        this.docStep.bind(this),
        this.repeatStep.bind(this),
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
   * If no dialog is active, it will start the default dialog.
   * @param {*} turnContext
   * @param {*} accessor
   */
  async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  /**
   * The waterfall step to let user choose which feature to use.
   * @param {*} step
   * @returns {*} a non-null DialogTurnResult
   */
  async startStep(step) {
    // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
    // Running a prompt here means the next WaterfallStep will be run when the user's response is received.
    const msg = step.options.restartMsg
      ? step.options.restartMsg
      : "What can I do for you?";
    return await step.prompt(CHOICE_PROMPT, {
      prompt: msg,
      choices: ChoiceFactory.toChoices([
        "ask a question",
        "process a document",
        ,
        "recognize an image",
      ]),
    });
  }

  /**
   * If user has chosen QnA, jump to question answering dialog; Otherwise, ask user to upload attachment.
   * @param {*} step
   * @returns {*} a non-null DialogTurnResult
   */
  async chooseStep(step) {
    const choice = step.result.value;
    if (choice == "ask a question") {
      return await step.beginDialog(ANSWER_DIALOG);
    } else if (choice == "process a document") {
      var promptOptions = {
        prompt: "Please attach a document in pdf.",
        retryPrompt:
          "That was not a document that I can help, please try again with a document in pdf.",
      };

      return await step.prompt(ATTACHMENT_PROMPT, promptOptions);
    } else {
      var promptOptions = {
        prompt: "Please attach an image.",
        retryPrompt:
          "That was not an image that I can help, please try again with an image in png/jpg.",
      };
      return await step.prompt(ATTACHMENT_PROMPT, promptOptions);
    }
  }

  /**
   * If received attachment is in pdf, jump to docDialog; Otherwise recognize the image for user.
   * @param {*} step
   * @returns {*} a non-null DialogTurnResult
   */
  async docStep(step) {
    if (step.result && step.result[0].contentUrl) {
      var type = step.result[0].contentType;
      //save attachment to the server, keep the path of the saved file.
      var path = await this.handleIncomingAttachment(step.context);
      console.log(path);
      if (path) {
        if (type === "application/pdf") {
          await step.context.sendActivity(
            "Processing the document, please wait, it will take around 55 seconds"
          );
          //perform HTTP requests for document here
          var req_results = await this.sendReq(path);
          // delete user file after use
          try {
            fs.unlinkSync(path);
          } catch (error) {}
          // start docDialog, passing the document processing results and the file path.
          return await step.beginDialog(DOC_DIALOG, {
            sum: req_results[0],
            query: req_results[1],
            form: req_results[2],
            filepath: path,
          });
        } else {
          var image_result = "";
          await step.context.sendActivity(
            "Processing the image, please wait, it will take around 15 seconds"
          );
          // perform image recognition request
          var form = new FormData();
          form.append("file", fse.createReadStream(path));
          await axios({
            method: "post",
            url:
              "http://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=BusinessCard",
            data: form,
            headers: form.getHeaders(),
          })
            .then(function (response) {
              var a = response.data;
              a.forEach((line) => {
                image_result += line + "\n";
              });
            })
            .catch(function (error) {
              console.log(error);
            });
          //delete user file after use
          try {
            fs.unlinkSync(path);
          } catch (error) {}
          // send recognition result to user
          if (image_result) {
            await step.context.sendActivity(image_result);
          } else {
            await step.context.sendActivity(
              "Recognition failed, no pattern found"
            );
          }
        }
      }
    }
    //If having not jumped to docDialog, go to the next step
    return await step.next();
  }

  /**
   * Replace the dialog with mainDialog, restart it with a restart msg.
   * @param {*} step
   * @returns {*} a non-null DialogTurnResult
   */
  async repeatStep(step) {
    return await step.replaceDialog(this.initialDialogId, {
      restartMsg: "What else can I do for you?",
    });
  }

  /**
   * The method for performing three requests simultaneously via Axios for doc processing.
   * @param {*} path
   * @returns request results as an array
   */
  async sendReq(path) {
    var form1 = new FormData();
    form1.append("file", fse.createReadStream(path));
    var form2 = new FormData();
    form2.append("file", fse.createReadStream(path));
    var form3 = new FormData();
    form3.append("file", fse.createReadStream(path));

    let reqArr = [
      axios({
        method: "post",
        url: "https://textsumapi.azurewebsites.net/api/TextSummary",
        data: form1,
        headers: form1.getHeaders(),
      }),
      axios({
        method: "post",
        url: "http://20.77.57.60:5000",
        data: form2,
        headers: form2.getHeaders(),
      }),
      axios({
        method: "post",
        url:
          "https://avabotformrecog.azurewebsites.net/api/FormRecogFunction?type=Layout",
        data: form3,
        headers: form3.getHeaders(),
      }),
    ];
    var output = [];
    // wait till the requests are completed
    await Promise.allSettled(reqArr).then((results) => {
      results.forEach((result) => {
        console.log(result.status);
        //if status is fulfilled, record the result, if is failed, fill with 0
        if (result.status == "fulfilled") {
          output.push(result.value.data);
          console.log("first: " + result.value.data);
        } else {
          output.push(0);
        }
      });
    });
    console.log("finished!");
    console.log(output);
    return output;
  }

  /**
   * The method to handle user attachment
   * @param {*} turnContext
   * @returns file path 
   */
  async handleIncomingAttachment(turnContext) {
    // Prepare Promises to download each attachment and then execute each Promise.
    const promises = await turnContext.activity.attachments.map(
      this.downloadAttachmentAndWrite
    );
    const successfulSaves = await Promise.all(promises);

    // Replies back to the user that the file has been received.
    async function replyForReceivedAttachments(localAttachmentData) {
      if (localAttachmentData) {
        // Because the TurnContext was bound to this function, the bot can call
        // `TurnContext.sendActivity` via `this.sendActivity`;
        await this.sendActivity(
          `Attachment "${localAttachmentData.fileName}" ` + `has been received.`
        );
        return localAttachmentData.localPath;
      } else {
        await this.sendActivity("Attachment was not successfully received.");
        return undefined;
      }
    }

    // Prepare Promises to reply to the user with information about saved attachments.
    // The current TurnContext is bound so `replyForReceivedAttachments` can also send replies.
    const replyPromises = successfulSaves.map(
      replyForReceivedAttachments.bind(turnContext)
    );
    let r = await Promise.all(replyPromises).then((result) => result[0]);
    return r;
  }

  /**
   * The method to download user attachment to the server.
   * @param {*} attachment
   * @returns {fileName, localPath}
   */
  async downloadAttachmentAndWrite(attachment) {
    var name = attachment.name;
    // Retrieve the attachment via the attachment's contentUrl.
    const url = attachment.contentUrl;

    // Local file path for the bot to save the attachment.
    const localFileName = path.join(__dirname, name);

    try {
      // arraybuffer is necessary for images
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFile(localFileName, response.data, (fsError) => {
        if (fsError) {
          throw fsError;
        }
      });
    } catch (error) {
      console.error(error);
      return undefined;
    }
    // If no error was thrown while writing to disk, return the attachment's name
    // and localFilePath for the response back to the user.
    return {
      fileName: name,
      localPath: localFileName,
    };
  }

  /**
   * The method to validate if the attachment type is acceptable
   * @param {*} promptContext
   * @returns boolean
   */
  async promptValidator(promptContext) {
    if (promptContext.recognized.succeeded) {
      var docType = promptContext.options.prompt;
      var attachments = promptContext.recognized.value;
      var validDoc = [];

      attachments.forEach((attachment) => {
        if (
          docType === "Please attach a document in pdf." &&
          attachment.contentType === "application/pdf"
        ) {
          validDoc.push(attachment);
        } else if (
          docType === "Please attach an image." &&
          (attachment.contentType === "image/jpeg" ||
            attachment.contentType === "image/png")
        ) {
          validDoc.push(attachment);
        }
      });

      promptContext.recognized.value = validDoc;

      // If none of the attachments are valid, the retry prompt should be sent.
      return !!validDoc.length;
    } else {
      await promptContext.context.sendActivity("No attachments received.");

      // We can return true from a validator function even if Recognized.Succeeded is false.
      return true;
    }
  }
}

module.exports.MainDialog = MainDialog;
