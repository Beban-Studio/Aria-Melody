import { PermissionFlagsBits, ApplicationCommandOptionType } from 'discord.js';
import { getGuildData } from '#dbManagers/guildData'; 
import * as logger from '#utils/logger'; 

/**
 * @type {import('commandkit').CommandData}
 */
export const command = {
  name: 'play',
  description: 'Play a song or playlist from various sources.',
  aliases: ['p', 'pl'],
  options: [
    {
      name: 'query',
      description: 'A song name or URL.',
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: false,
    },
  ],
};

/**
 * Check if the user's query matched with any of the urlPatterns 
 * @param {string} link 
 * @returns 
 */
function checkUrl(link) {
  const urlPatterns = {
    youtube: /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/gi,
    spotify: /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track|artist)(?:[/:])([A-Za-z0-9]+).*$/gi,
    appleMusic: /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/gi,
    deezer: /^(?:https?:\/\/|)?(?:www\.)?deezer\.com\/(?:\w{2}\/)?(track|album|playlist|artist)\/(\d+)/gi,
    soundCloud: /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/
	};

  for (const [key, pattern] of Object.entries(urlPatterns)) {
    if (pattern.test(link)) {
      return { type: key, url: link };
    }
  }

  return null;
}

/**
 * Core logic for playing a track. Shared between chatInput and message handlers.
 * @param {import('commandkit').AnyCommandContext} ctx
 * @param {import('discord.js').Message} [botReply=null] - The bot's reply message to edit (for message commands).
 * @returns {Promise<void>}
 */
async function _handlePlay(ctx, botReply = null) { 
  const { client, guild, channel } = ctx;

  const message = ctx.isChatInputCommand() ? ctx.interaction.editReply : botReply.edit.bind(botReply); 
  const member = ctx.isChatInputCommand() ? ctx.interaction.member : ctx.message.member;
  const query = ctx.isChatInputCommand() ? ctx.options.getString('query') : ctx.args().join(' ');
  const voiceChannel = member?.voice?.channel;

  if (!voiceChannel) {
    const embed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | You must be in a voice channel to use this command.` });
    await message({ embeds: [embed] })
    return;
  }

  if (client.riffy?.players.get(guild.id) && client.riffy.players.get(guild.id).voiceChannel !== voiceChannel.id) {
    const embed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | You must be in the same voice channel as me.` });
    await message({ embeds: [embed] })
    return;
  }

  let player = client.riffy.players.get(guild.id);
  if (!player) {
    player = client.riffy.createConnection({
      guildId: guild.id,
      voiceChannel: voiceChannel.id,
      textChannel: channel.id,
      deaf: true,
      defaultVolume: client.config.riffyOptions.defaultVolume || 50,
    });
  }

  const resolve = await client.riffy.resolve({ query: query, requester: member });
  const { loadType, tracks, playlistInfo } = resolve;
  const embed = client.createEmbed();

  switch (loadType) {
    case 'playlist':
      for (const track of tracks) {
        player.queue.add(track);
      }
      embed.setDescription(`\`➕\` | Added **${tracks.length}** tracks from playlist **[${playlistInfo.name}](${query})**`);
      break;

    case 'track':
    case 'search':
      const track = tracks.shift();
      if (!track) {
        embed.setDescription(`${client.emoji?.system?.xMark || '❌'} | No results were found for your query.`);
        await message({ embeds: [embed] });
        return; 
      }
      player.queue.add(track);
      embed.setDescription(`\`➕\` | Added **[${track.info.title}](${track.info.uri})** to the queue.`);
      break;

    default:
      logger.error(`[PlayCommand] Load failed for query "${query}" in guild ${guild.id}. LoadType: ${loadType}`);
      embed.setDescription(`${client.emoji?.system?.xMark || '❌'} | I couldn't load your track. The source may be unsupported or an error occurred.`);
      break;
  }

  await message({ embeds: [embed] });

  if (!player.playing && !player.paused && player.queue.length) {
    player.play();
  }
}

/**
 * Handler for slash command interactions.
 * @param {import('commandkit').ChatInputCommandContext} ctx
 */
export const chatInput = async (ctx) => {	
  const { interaction, client, config } = ctx;

  try {
    await interaction.deferReply(); 
    await interaction.editReply({ embeds: [client.createEmbed({ description: "`🔎` | Searching..." })] }); 
    await _handlePlay(ctx);
  } catch (err) {
    client.logger.error(`[${interaction.commandName}:${config?.executionMode}] Error:`, err);
    const errorEmbed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | An unexpected error occurred: ${err.message}` });
    await interaction.editReply({ embeds: [errorEmbed] }).catch(() => {});
  }
};

/**
 * Handler for message command interactions.
 * @param {import('commandkit').MessageCommandContext} ctx
 */
export const message = async (ctx) => {
  const { message, client, config, command } = ctx;
  const args = ctx.args();

  if (!args.length) {
    const embed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | Please provide a song name or URL. Usage: \`${ctx.prefix || '!'}${command.name} <query>\`` });
    return message.reply({ embeds: [embed] });
  }

  try {
    const botReply = await message.reply({ 
      embeds: [client.createEmbed({ description: "`🔎` | Searching..." })],
      allowedMentions: { repliedUser: false }
    });
    await _handlePlay(ctx, botReply); 
  } catch (err) {
    client.logger.error(`[${command.name}:${config?.executionMode}] Error:`, err);
    const errorEmbed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | An unexpected error occurred: ${err.message}` });
    await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } }).catch(() => {});
  }
};


