import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { formatDurationDetailed, formatTimestamp } from '../../utils/time';
import { getClientStatsDocument } from '../../databases/managers/clientData';
import pkg from '../../../../package.json' with { type: 'json' };
import * as logger from '../../utils/logger';
import fetch from 'node-fetch';
import os from 'os';

/**
 * @type {import('commandkit').CommandData}
 */
export const command = {
  name: 'bot-info',
  description: "Show Aria's statistic information.",
  aliases: ['bi', 'stats', 'botinfo'],
  contexts: [0, 1],
};

/* --- Helper function to fetch and prepare bot information data --- */
async function getBotInfoData(client) {
  let lavalinkNodesInfo = {
    statsText: '```yml\nLavalink: Not Connected\n```',
    playingPlayers: 0,
    totalPlayers: 0,
  };

  if (client.riffy && client.riffy.nodes && client.riffy.nodes.size > 0) {
    const node = client.riffy.nodes.first();
    if (node && node.connected && node.stats && node.stats.memory) {
      const memoryStats = node.stats.memory;
      const usedMemoryMB = (memoryStats.used / 1024 / 1024).toFixed(2);
      const reservableMemoryMB = (memoryStats.reservable / 1024 / 1024).toFixed(2);
      let memoryUsagePercent = 0;
      if (memoryStats.reservable > 0) {
          memoryUsagePercent = ((memoryStats.used / memoryStats.reservable) * 100).toFixed(2);
      } else if (memoryStats.allocated > 0) {
          memoryUsagePercent = ((memoryStats.used / memoryStats.allocated) * 100).toFixed(2);
      }
      const lavalinkUptime = formatDurationDetailed(node.stats.uptime);
      lavalinkNodesInfo = {
        statsText: `\`\`\`yml\nName: ${node.name}\nState: Connected\nUptime: ${lavalinkUptime}\nMemory: ${memoryUsagePercent}% (${usedMemoryMB}MB / ${reservableMemoryMB}MB)\nPlayers: ${node.stats.playingPlayers} / ${node.stats.players}\nLavalink Client: Riffy\`\`\`\n`,
        playingPlayers: node.stats.playingPlayers,
        totalPlayers: node.stats.players,
      };
    } else {
      lavalinkNodesInfo.statsText = '```yml\nLavalink: Node found but not connected or no memory stats.\n```';
    }
  }

  let botCreationDate = "Unknown";
  if (client.user && client.user.createdTimestamp) {
    botCreationDate = formatTimestamp(client.user.createdTimestamp); 
  } else if (client.user && client.user.createdAt) { 
    botCreationDate = formatTimestamp(client.user.createdAt);
  }

  let messagesCount = 0;
  let commandsCount = 0;
  let tracksCount = 0;
  let playTime = "0s";

  const clientStatsDoc = await getClientStatsDocument();
  if (clientStatsDoc && clientStatsDoc.counts) {
    messagesCount = clientStatsDoc.counts.messageCount || 0;
    commandsCount = clientStatsDoc.counts.commandCount || 0;
    tracksCount = clientStatsDoc.counts.trackCount || 0;
    playTime = formatDurationDetailed(clientStatsDoc.counts.playTime || 0);
  } else {
    logger.warn(`No global client stats data found in database (or error fetching).`);
  }

  const systemUptime = formatDurationDetailed(os.uptime() * 1000);

  const apiFetchStart = Date.now();
  let apiPing = -1;
  try {
      await fetch("https://discord.com/api/v10/gateway");
      apiPing = Date.now() - apiFetchStart;
  } catch (err) {
      logger.error(`Failed to fetch Discord API gateway for ping:`, err);
  }

  return {
    lavalinkNodesInfo,
    botCreationDate,
    messagesCount,
    commandsCount,
    tracksCount,
    playTime,
    systemUptime,
    apiPing,
  };
}

/**
 * Handler for slash command interactions.
 * @param {import('commandkit').ChatInputCommandContext} ctx
 */
export const chatInput = async (ctx) => {
  const { interaction, client, commandkit, config } = ctx;
  
  try {
    await interaction.deferReply();
    const botData = await getBotInfoData(client);

    const embed = client.createEmbed({
      authorName: `${client.user.username} Bot Information`,
      authorIcon: client.user.displayAvatarURL(),
      description: `\`\`\`yml\nName: ${client.user.username} (#${client.user.discriminator === '0' ? client.user.username : client.user.tag}) (${client.user.id})\nWebsocket Ping: ${client.ws.ping}ms\nAPI Ping: ${botData.apiPing}ms\n\`\`\``,
      fields: [
        { name: "<:ArrowForwardios:1362454729682194686> General Info", value: `\`\`\`yml\nVersion              : v${pkg.version}\nCreated By           : @herjuna\nCreated At           : ${botData.botCreationDate}\nTotal Servers        : ${client.guilds.cache.size} servers\nTotal Commands       : ${commandkit.commandHandler.loadedCommands?.size || 'N/A'} commands\nTotal Players        : ${botData.lavalinkNodesInfo.playingPlayers} out of ${botData.lavalinkNodesInfo.totalPlayers}\nUptime               : ${botData.systemUptime}\n\`\`\`` },
        { name: "<:ArrowForwardios:1362454729682194686> Lavalink Info", value: botData.lavalinkNodesInfo.statsText, inline: false, },
        { name: "<:ArrowForwardios:1362454729682194686> Usage Stats", value: `\`\`\`yml\nCommands Used        : ${botData.commandsCount} times\nMessages Sent        : ${botData.messagesCount} messages\nSongs Played         : ${botData.tracksCount} songs\nPlaying Time         : ${botData.playTime}\n\`\`\``, inline: false, },
      ],
      footerText: "Don't Forget to vote. That helps us a lot!",
      footerIcon: "https://blog.top.gg/content/images/2021/12/Avatar---New-Logo-2.png",
      image: "https://i.imgur.com/MOMYOd8.png"
    });
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Vote').setStyle(ButtonStyle.Link).setEmoji("1364861879893098507").setURL(client.config?.clientOptions?.voteUrl || 'https://top.gg/'),
        new ButtonBuilder().setLabel('Support').setStyle(ButtonStyle.Link).setURL(client.config?.clientOptions?.supportServer || 'https://discord.gg/yourserver')
      );
    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (err) {
    logger.error(`[${interaction.commandName}:${config?.executionMode}] Error:`, err);
    const errorEmbed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | Error: ${err.message}` });
    if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [errorEmbed], components: [] }).catch(err => logger.error(`[${interaction.commandName}:${config?.executionMode}] Failed to edit reply on error:`, err));
    } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true, components: [] }).catch(errInner => logger.error(`[${interaction.commandName}:${config?.executionMode}] Failed to edit reply on error:`, errInner));
    }
  }
};

/**
 * Handler for message command interactions.
 * @param {import('commandkit').MessageCommandContext} ctx
 */
export const message = async (ctx) => {
  const { message, client, commandkit, config } = ctx;

  await message.channel.sendTyping().catch(err => logger.debug(`[${ctx.command.command.name}:${config?.executionMode}] Failed to send typing indicator: ${err}`));

  try {
    const botData = await getBotInfoData(client);

    const embed = client.createEmbed({
      authorName: `${client.user.username} Bot Information`,
      authorIcon: client.user.displayAvatarURL(),
      description: `\`\`\`yml\nName: ${client.user.username} (${client.user.id})\nWebsocket Ping: ${client.ws.ping}ms\nAPI Ping: ${botData.apiPing}ms\n\`\`\``,
      fields: [
        { name: "<:ArrowForwardios:1362454729682194686> General Info", value: `\`\`\`yml\nVersion              : v${pkg.version}\nCreated By           : @herjuna\nCreated At           : ${botData.botCreationDate}\nTotal Servers        : ${client.guilds.cache.size} servers\nTotal Commands       : ${commandkit.commandHandler.loadedCommands?.size || 'N/A'} commands\nTotal Players        : ${botData.lavalinkNodesInfo.playingPlayers} out of ${botData.lavalinkNodesInfo.totalPlayers}\nUptime               : ${botData.systemUptime}\n\`\`\`` },
        { name: "<:ArrowForwardios:1362454729682194686> Lavalink Info", value: botData.lavalinkNodesInfo.statsText, inline: false, },
        { name: "<:ArrowForwardios:1362454729682194686> Usage Stats", value: `\`\`\`yml\nCommands Used        : ${botData.commandsCount} times\nMessages Sent        : ${botData.messagesCount} messages\nSongs Played         : ${botData.tracksCount} songs\nPlaying Time         : ${botData.playTime}\n\`\`\``, inline: false, },
      ],
      footerText: "Don't Forget to vote. That helps us a lot!",
      footerIcon: "https://blog.top.gg/content/images/2021/12/Avatar---New-Logo-2.png",
      image: "https://i.imgur.com/MOMYOd8.png"
    });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Vote').setStyle(ButtonStyle.Link).setURL(client.config?.clientOptions?.voteUrl || 'https://top.gg/'),
        new ButtonBuilder().setLabel('Support').setStyle(ButtonStyle.Link).setURL(client.config?.clientOptions?.supportServer || 'https://discord.gg/9eCgpGuZAa')
      );

    await message.reply({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } });

  } catch (err) {
    logger.error(`[${ctx.command.command.name}:${config?.executionMode}] Error executing command`, err);
    const errorEmbed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | An error occurred: ${err.message}`, allowedMentions: { repliedUser: false } });
    await message.reply({ embeds: [errorEmbed] }).catch(errInner => logger.error(`[${ctx.command.command.name}:${config?.executionMode}] Failed to send error reply:`, errInner));
  }
};