const restify = require("restify");
const path = require("path");

// Read environment variables from .env file
const ENV_FILE = path.join(__dirname, ".env");
require("dotenv").config({ path: ENV_FILE });

// Import required bot services.
const {
  BotFrameworkAdapter,
  ConversationState,
  MemoryStorage,
  UserState,
} = require("botbuilder");

// Import our custom bot class that provides a turn handling function.
// Import the begin dialog to feed into our bot.
const { AvaBot } = require("./bots/avaBot");
const { MainDialog } = require("./dialogs/mainDialog");

// Create the adapter using the AppId and AppKey configured.
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  await context.sendActivity("The bot encountered an error or bug.");
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
  // Clear out state
  await conversationState.delete(context);
};

// Define the state store for the bot.
// A bot requires a state storage system to persist the dialog and user state between messages.
const memoryStorage = new MemoryStorage();

// Create conversation state with in-memory storage provider.
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the main dialog.
const dialog = new MainDialog();
const bot = new AvaBot(conversationState, userState, dialog);

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`\n${server.name} listening to ${server.url}.`);
  console.log(
    "\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator"
  );
  console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Listen for incoming requests.
server.post("/api/messages", (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    // Route the message to the bot's main handler.
    await bot.run(context);
  });
});
