import { parseTimeString } from './time';
import importedConfig from '../configurations/config'; 
import SpotifyWebApi from 'spotify-web-api-node';
import * as logger from './logger'; 

const ESSENTIAL_ENV_VARS = [
  'CLIENT_TOKEN',
  'CLIENT_PREFIX',
  'MONGO_URI',
  'SPOTIFY_CLIENTID', 
  'SPOTIFY_SECRET', 
];

const DEFAULT_CONFIG_VALUES = {
  clientOptions: {
    clientName: "Aria Melody", 
    devId: [],
    devGuild: [],
    webhookUrl: null, 
    embedColor: "5865F2", 
    voteUrl: null,
    supportUrl: null,
  },
  spotify: {
    clientId: null,
    clientSecret: null,
  },
	riffyOptions: {
    leaveTimeout: parseTimeString("60s"), 
    restVersion: "v4",
    reconnectTries: Infinity,
    reconnectTimeout: parseTimeString("10s"), 
    defaultSearchPlatform: "spsearch", 
    plugins: [],
  },
  riffyNodes: [],
  presence: {
  	status: "online",
    activities: [
    	{ name: "Music", type: "LISTENING" }
  	]
  }
};

/**
 * Validates the loaded configuration against essential environment variables
 * and merges with default values for optional settings.
 * Reports any missing essential configurations.
 * @returns {object} The validated and merged configuration object.
 */
function validateAndProcessConfig() {
  const finalConfig = { ...importedConfig }; 
  let missingEssentials = [];

  logger.info('Validating configuration...');

  if (!importedConfig.clientOptions.clientToken) missingEssentials.push('CLIENT_TOKEN (for clientOptions.clientToken)');
  if (!importedConfig.clientOptions.mongoUri) missingEssentials.push('MONGO_URI (for clientOptions.mongoUri)');
  if (!importedConfig.spotify.clientId) missingEssentials.push('SPOTIFY_CLIENTID');
  if (!importedConfig.spotify.clientSecret) missingEssentials.push('SPOTIFY_SECRET');

  finalConfig.clientOptions = { ...DEFAULT_CONFIG_VALUES.clientOptions, ...importedConfig.clientOptions };

  if (finalConfig.clientOptions.devId && finalConfig.clientOptions.devId.length === 1 && finalConfig.clientOptions.devId[0] === "") {
    finalConfig.clientOptions.devId = [];
  }

  if (finalConfig.clientOptions.devGuild && finalConfig.clientOptions.devGuild.length === 1 && finalConfig.clientOptions.devGuild[0] === "") {
    finalConfig.clientOptions.devGuild = [];
  }

  if (finalConfig.clientOptions.embedColor && finalConfig.clientOptions.embedColor.startsWith('#')) {
    finalConfig.clientOptions.embedColor = finalConfig.clientOptions.embedColor.substring(1);
  }

  if (importedConfig.spotify) {
    finalConfig.spotify = { ...DEFAULT_CONFIG_VALUES.spotify, ...importedConfig.spotify };
  } else {
    finalConfig.spotify = { ...DEFAULT_CONFIG_VALUES.spotify };
  }

  if (importedConfig.riffyOptions) {
    finalConfig.riffyOptions = { ...DEFAULT_CONFIG_VALUES.riffyOptions, ...importedConfig.riffyOptions };
  } else {
    finalConfig.riffyOptions = { ...DEFAULT_CONFIG_VALUES.riffyOptions };
  }

  finalConfig.riffyOptions.plugins = finalConfig.riffyOptions.plugins || [];

  if (!importedConfig.riffyNodes || importedConfig.riffyNodes.length === 0) {
    logger.warn('No Riffy nodes defined in config.js. Music functionality might be unavailable');
    finalConfig.riffyNodes = DEFAULT_CONFIG_VALUES.riffyNodes; 
  } else {
    finalConfig.riffyNodes = importedConfig.riffyNodes;
  }

  if (importedConfig.presence) {
      finalConfig.presence = { ...DEFAULT_CONFIG_VALUES.presence, ...importedConfig.presence };
  } else {
    finalConfig.presence = { ...DEFAULT_CONFIG_VALUES.presence };
  }

  finalConfig.presence.activities = finalConfig.presence.activities || [];

  if (missingEssentials.length > 0) {
    logger.fatal('Missing essential configuration values from environment variables:');
    missingEssentials.forEach(missing => logger.fatal(`  - ${missing}`));
    logger.fatal('Please provide these values in your .env file or environment');
    logger.warn('Bot may not function correctly or will exit');
    return null; 
  }
  

  logger.success('Configuration validated and processed successfully');
  return finalConfig;
};

/**
 * Loads the configuration, validates it, and binds it to the client.
 * @param {import('discord.js').Client} client The Discord client instance.
 * @returns {boolean} True if configuration was loaded and bound successfully, false otherwise.
 */
export function loadAndBindConfig(client) {
  if (!client) {
    logger.fatal('Discord client instance is required to bind configuration');
    return false;
  }

  const processedConfig = validateAndProcessConfig();

  if (processedConfig) {
    client.config = processedConfig;
    client.spotify = new SpotifyWebApi({
      clientId: processedConfig.spotify.clientId,
      clientSecret: processedConfig.spotify.clientSecret
    });

    logger.info('Configuration bound to client.config');
    return true;
  } else {
    logger.error('Failed to process configuration. Not binding to client');
    process.exit(1)
    return false;
  }
};