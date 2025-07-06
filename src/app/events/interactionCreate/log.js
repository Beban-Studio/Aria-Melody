import { incrementCommandCount } from '#dbManagers/clientData'; 
import { InteractionType } from 'discord.js'; 
import * as logger from '#utils/logger';

/**
 * @param {import('discord.js').Client<true>} client
 * @param {import('discord.js').Interaction} interaction
 */
export default async function interactionLogging(interaction, client) { 
  if (interaction?.isChatInputCommand) {
    try {
      await incrementCommandCount(); 
      logger.debug(`Incremented global command count`);
    } catch (err) {
      logger.error(`Failed to increment command count:`, err);
    }
  } else if (interaction.isButton()) {
    logger.debug(`Button interaction: ${interaction.customId}`);
  } 

  /*
 	else if (interaction.isButton()) {
  	client.logger.debug(`Button interaction: ${interaction.customId}`);
    // Handle button
  } else if (interaction.isModalSubmit()) {
    client.logger.debug(`Modal submitted: ${interaction.customId}`);
    // Handle modal
  } 
  */

}