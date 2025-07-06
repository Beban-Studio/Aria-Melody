import { Client, GatewayIntentBits } from 'discord.js';
import { onApplicationBootstrap } from 'commandkit';
import { loadAndBindConfig } from '#utils/loadConfig';
import { initializeRiffy } from '#utils/riffy';
import { getGuildData } from '#dbManagers/guildData';
import { createEmbed } from '#utils/createEmbed';
import * as mongoose from './app/databases/dbConnection';
import config from './app/configurations/config';
import * as logger from '#utils/logger';
import path from 'node:path';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, 
  ],
});

await logger.initializeLogger({
  logDirectory: path.join(process.cwd(), 'logs'),
  logFileName: `${config.clientOptions.clientName}.log`,
  maxFileSizeMB: 1024,
  maxRotatedFiles: 3,
  consoleLogLevel: 'info', 
  fileLogLevel: 'debug', 
  includeCallerInfo: false, /* This option is used for debugging purposes. Feel free to set it to true */
  webhookUrl: config.clientOptions.webhookUrl,
  webhookLogLevels: ['error', 'fatal', 'warn'], 
});

client.logger = logger;
client.createEmbed = createEmbed;
client.token = config.clientOptions.clientToken;

await initializeRiffy(client);
await loadAndBindConfig(client)
await mongoose.connectToDatabase()

onApplicationBootstrap((commandkit) => {
  commandkit.setPrefixResolver((message) => {
    return getGuildData(message.guildId, 'prefix');
  });
});

export default client;