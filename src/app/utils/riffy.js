import { Riffy } from 'riffy';
import { GatewayDispatchEvents } from 'discord.js';
import { pathToFileURL } from 'node:url';
import config from '../configurations/config';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Sets up the Riffy instance on the client and attaches raw event listeners.
 * Does NOT call riffy.init() or load custom Riffy events.
 * This should be called early in the bot's startup sequence, after client is created.
 * @param {import('discord.js').Client} client The Discord client instance.
 * @returns {boolean} True if setup was successful, false otherwise.
 */
export function initializeRiffy(client) {
  if (!client || !client.logger) { 
    client.logger.error('Discord client instance or client.logger is required to set up Riffy');
    return false;
  }

  const logger = client.logger; 

  if (!config.riffyNodes || config.riffyNodes.length === 0) {
    logger.warn('No Riffy nodes configured. Music functionality will be unavailable');
    return false;
  }

  logger.info('Setting up Riffy instance...');

  try {
    client.riffy = new Riffy(client, config.riffyNodes,
      {
				...config.riffyOptions,
				send: (payload) => {
					if (!payload || !payload.d || !payload.d.guild_id) return;
					
					const guild = client.guilds.cache.get(payload.d.guild_id);
					
					if (guild) {
						guild.shard.send(payload);
					} 
        }
			}
    );

    client.on('raw', (d) => {
			if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) return;
			if (client.riffy) { 
				client.riffy.updateVoiceState(d);
			}
    });

    client.on('ready', (client) => {
      finalizeRiffySetup(client)
    });

    logger.success('Riffy instance created');
    return true;

  } catch (err) {
    logger.error('Failed to create Riffy instance:', err);
    return false;
  }
};

/**
 * Loads custom Riffy event handlers and initializes Riffy's connection to nodes.
 * This function should be called once the Discord client is 'ready'.
 * @param {import('discord.js').Client<true>} client The Discord client instance (client.user should be available).
 */
export async function finalizeRiffySetup(client) {
  if (!client || !client.logger) {
    console.error('Discord client instance or client.logger is required.');
    return;
  }

  if (!client.riffy) {
    client.logger.error('Riffy instance not found on client. Cannot finalize setup');
    return;
  }

  if (!client.user || !client.user.id) {
    client.logger.error('Client user or ID not available. Cannot initialize Riffy nodes');
    return;
  }

  client.logger.info('Finalizing Riffy setup: Loading events and initializing nodes...');
  await loadRiffyEvents(client); 
	await getSpotifyAccessToken(client);

  try {
    client.riffy.init(client.user.id);
  } catch (err) {
    client.logger.error('Error during riffy.init():', err);
	}
};

/**
 * Loads Riffy event handlers from a specified directory structure.
 * @param {import('discord.js').Client} client The Discord client instance.
 */
async function loadRiffyEvents(client) {
  const logger = client.logger; 

  if (!client.riffy) {
    logger.error('Riffy instance not found on client. Cannot load Riffy events');
    return;
  }

  logger.info('Loading Riffy events...');
  const riffyEventsBasePath = path.join(process.cwd(), 'src', 'app', 'riffyEvents');

  try {
    if (!fs.existsSync(riffyEventsBasePath)) {
    	logger.warn(`Riffy events directory not found: ${riffyEventsBasePath}. No Riffy events will be loaded`);
      return;
    }

    const eventDirs = fs.readdirSync(riffyEventsBasePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
    	.map(dirent => dirent.name);
    let count = 0;

    for (const dir of eventDirs) {
      const dirPath = path.join(riffyEventsBasePath, dir);
      const eventFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.js'));

      for (const file of eventFiles) {
        const filePath = path.join(dirPath, file);

        try {
          const moduleUrl = pathToFileURL(filePath).toString();
          const module = await import(moduleUrl);
          const eventHandler = module.default;

          if (typeof eventHandler !== 'function') {
            logger.error(`Couldn't load Riffy event ${file}: Exported value is not a function`);
            continue;
          }

          await eventHandler(client); 
          logger.debug(`Loaded Riffy event: ${dir}/${file}`);
          count++;

        } catch (err) {
          logger.error(`Couldn't load Riffy event ${file} from ${filePath}:`, err);
        }
      }
    }

    if (count > 0) {
      logger.success(`Successfully loaded ${count} Riffy events`);
    } else {
      logger.info('No Riffy events were loaded');
    }

  } catch (err) {
    logger.error('Error reading Riffy events directory structure:', err);
  }
};

async function getSpotifyAccessToken(client) {
  try {
		const data = await client.spotify.clientCredentialsGrant();
		client.logger.success('Successfully retrieved fresh Spotify access token');
    client.spotify.setAccessToken(data.body['access_token']);

  } catch (err) {
    client.logger.error('Error retrieving Spotify access token:', err);
  }
};