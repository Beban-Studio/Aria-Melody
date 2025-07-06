import { cacheTag } from '@commandkit/cache';
import GuildModel from '#schemas/guildSchema'; 
import * as logger from '#utils/logger'; 

/**
 * Fetches guild data from the database. If not found, creates a new default entry.
 * @param {string} guildId The ID of the guild.
 * @returns {Promise<import('mongoose').Document & YourGuildSchemaType>} The guild data document.
 */
export async function getGuildData(guildId, option) {
  'use cache';

  cacheTag(`${option}:${guildId}`);

  if (!guildId) {
    logger.error('Attempted to get guild data without a guildId.');
    return null;
  }

  try {
    let guildData = await GuildModel.findOne({ guildId: guildId }); 

    if (!guildData) {
      logger.info(`No data found for guild ${guildId}. Creating new default entry.`);
      guildData = new GuildModel({ guildId: guildId }); 
      await guildData.save();
    }
    
    if (option) {
      return guildData[option] !== undefined ? guildData[option] : null;
    }

    return guildData;

  } catch (err) {
    logger.error(`Error fetching or creating data for guild ${guildId}:`, err);
    return null;
  }
};

/**
 * Updates guild data in the database.
 * @param {import('mongoose').Document & YourGuildSchemaType} guildDataDocument The Mongoose document to save.
 * @returns {Promise<void>}
 */
export async function updateGuildData(guildDataDocument) {
  if (!guildDataDocument || !guildDataDocument.guildId) {
    logger.error('Attempted to update guild data with an invalid document.');
    return;
  }
		
  try {
  	await guildDataDocument.save();
    logger.debug(`Successfully updated data for guild ${guildDataDocument.guildId}`);

  } catch (err) {
    logger.error(`Error updating data for guild ${guildDataDocument.guildId}:`, err);
  }
};