import { Client, GatewayIntentBits } from 'discord.js';
import { createEmbed } from './app/utils/createEmbed';
import * as mongoose from './app/databases/dbConnection';
import config from './app/configurations/config';
import * as logger from './app/utils/logger';
import path from 'node:path';

await logger.initializeLogger({
  logDirectory: path.join(process.cwd(), 'logs'),
  logFileName: 'aria.log',
  maxFileSizeMB: 1024,
  maxRotatedFiles: 3,
  consoleLogLevel: 'info', 
  fileLogLevel: 'debug', 
  includeCallerInfo: true, /* This option is used for debugging purposes. Feel free to set it to true */
  webhookUrl: config.clientOptions.webhookUrl,
  webhookLogLevels: ['error', 'fatal', 'warn'], 
});

await mongoose.connectToDatabase()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, 
  ],
});

client.createEmbed = createEmbed;
client.config = config;
client.logger = logger;
client.token = config.clientOptions.clientToken;

export default client;