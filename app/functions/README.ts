// Appwrite Functions are deployed separately, not in the app directory
// This file explains the function structure

export const FUNCTIONS_INFO = {
  webhookReceiver: {
    name: "webhook-receiver",
    runtime: "node-18.0",
    entrypoint: "src/main.js",
    description: "Receives and validates incoming webhook events",
    environment: [
      "APPWRITE_ENDPOINT",
      "APPWRITE_PROJECT_ID",
      "APPWRITE_API_KEY",
      "APPWRITE_DATABASE_ID",
    ],
  },
  eventProcessor: {
    name: "event-processor",
    runtime: "node-18.0",
    entrypoint: "src/main.js",
    description: "Processes events through flow transformations and routing",
    environment: [
      "APPWRITE_ENDPOINT",
      "APPWRITE_PROJECT_ID",
      "APPWRITE_API_KEY",
      "APPWRITE_DATABASE_ID",
      "OPENAI_API_KEY",
    ],
  },
};

export const DEPLOYMENT_COMMANDS = {
  webhookReceiver:
    "appwrite functions create --functionId webhook-receiver --name 'Webhook Receiver' --runtime node-18.0 --execute any",
  eventProcessor:
    "appwrite functions create --functionId event-processor --name 'Event Processor' --runtime node-18.0 --execute any",
};
