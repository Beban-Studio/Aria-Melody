import { EmbedBuilder } from 'discord.js';
import * as logger from './logger.js';
import config from '../configurations/config';

/**
 * @typedef {object} EmbedField
 * @property {string} name - The name of the field. (Max 256 characters)
 * @property {string} value - The value of the field. (Max 1024 characters)
 * @property {boolean} [inline=false] - Whether the field should be displayed inline.
 */

/**
 * @typedef {object} CreateEmbedOptions
 * @property {string} [title=''] - The title of the embed. (Max 256 characters)
 * @property {string} [url=''] - The URL the title should link to.
 * @property {string} [description=''] - The description of the embed. (Max 4096 characters)
 * @property {import('discord.js').ColorResolvable} [color='#0099ff'] - The color of the embed.
 * @property {EmbedField[]} [fzields=[]] - An array of field objects to add to the embed. (Max 25 fields)
 * @property {string} [image=''] - The URL of the main image for the embed.
 * @property {string} [thumbnail=''] - The URL of the thumbnail image for the embed.
 * @property {string} [footerText=''] - The text for the footer. (Max 2048 characters)
 * @property {string | null} [footerIcon=null] - The URL of the icon for the footer.
 * @property {string} [authorName=''] - The name of the author. (Max 256 characters)
 * @property {string | null} [authorIcon=null] - The URL of the icon for the author.
 * @property {string} [authorUrl=''] - The URL the author's name should link to.
 * @property {boolean | Date | number} [timestamp=false] - Whether to add a timestamp. Can be a boolean, Date object, or epoch milliseconds.
 */

/**
 * Creates a Discord EmbedBuilder object with the specified options.
 * @param {CreateEmbedOptions} [options={}] - The options for creating the embed.
 * @returns {EmbedBuilder}
 */
export const createEmbed = function ({
  title = '',
  url = '',
  description = '',
  color = config.clientOptions.embedColor || '#0099ff', 
  fields = [],
  image = '',
  thumbnail = '',
  footerText = '',
  footerIcon = null,
  authorName = '',
  authorIcon = null,
  authorUrl = '',
  timestamp = false
} = {}) { 
  const embed = new EmbedBuilder()
    .setColor(color);

  if (title) {
    embed.setTitle(String(title).substring(0, 256));

    if (url) {
      embed.setURL(url);
    }
  }

  if (description) {
    embed.setDescription(String(description).substring(0, 4096));
  }

	if (image) {
    embed.setImage(image);
  }

  if (thumbnail) {
    embed.setThumbnail(thumbnail);
  }

  if (footerText) {
    embed.setFooter({
      text: String(footerText).substring(0, 2048),
      iconURL: footerIcon || undefined 
    });
  }

  if (authorName) {
    embed.setAuthor({
      name: String(authorName).substring(0, 256),
      iconURL: authorIcon || undefined, 
      url: authorUrl || undefined
    });
  }

  if (timestamp) {
    if (timestamp === true) {
      embed.setTimestamp(); 
    } else if (timestamp instanceof Date || typeof timestamp === 'number') {
    	embed.setTimestamp(timestamp); 
    }
  }

  if (Array.isArray(fields) && fields.length > 0) {
    const validFields = fields.slice(0, 25).map(field => {
			if (!field || typeof field.name !== 'string' || typeof field.value !== 'string') {
				logger.warn('Skipping invalid embed field:', field);
				return null; 
			}

			return {
				name: String(field.name).substring(0, 256),
				value: String(field.value).substring(0, 1024),
				inline: typeof field.inline === 'boolean' ? field.inline : false
			};
  	}).filter(field => field !== null); 

      if (validFields.length > 0) {
        embed.addFields(validFields);
      }
    }
  return embed;
};