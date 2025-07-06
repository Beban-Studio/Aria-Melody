import { formatDurationDetailed, formatTimestamp, convertNumber } from '#utils/time';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getClientStatsDocument } from '#dbManagers/clientData';
import pkg from '../../../../package.json' with { type: 'json' };
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
  let lavalinkNodesInfo = [];

  if (client.riffy && client.riffy.nodes) {
    client.riffy.nodes.forEach((node) => {
      const lavalinkNode = client.riffy.nodeMap.get(node.name);
      if (lavalinkNode && lavalinkNode.connected && lavalinkNode.stats && lavalinkNode.stats.memory) {
        const lavalinkMemoryUsedMB = (lavalinkNode.stats.memory.used / 1024 / 1024).toFixed(2);
        const lavalinkMemoryReservableMB = (lavalinkNode.stats.memory.reservable / 1024 / 1024).toFixed(2);
        const lavalinkMemoryAllocatedMB = (lavalinkNode.stats.memory.allocated / 1024 / 1024).toFixed(2);
        
        let memoryUsagePercent = 0;

        if (lavalinkNode.stats.memory.reservable > 0) {
          memoryUsagePercent = ((lavalinkNode.stats.memory.used / lavalinkNode.stats.memory.reservable) * 100).toFixed(2);
        } else if (lavalinkNode.stats.memory.allocated > 0) {
          memoryUsagePercent = ((lavalinkNode.stats.memory.used / lavalinkNode.stats.memory.allocated) * 100).toFixed(2);
        }

        const lavalinkUptime = formatDurationDetailed(lavalinkNode.stats.uptime);
        
        lavalinkNodesInfo.push({
          stats: `\`\`\`yml\nName: ${node.name}\nState: Connected\nUptime: ${lavalinkUptime}\nMemory: ${memoryUsagePercent}%\nPlayers: ${lavalinkNode.stats.playingPlayers} / ${lavalinkNode.stats.players}\nLavalink Client: Riffy\`\`\`\n`,
          playingPlayers: lavalinkNode.stats.playingPlayers,
          totalPlayers: lavalinkNode.stats.players
        });
      } else {
        lavalinkNodesInfo.push({
          stats: `\`\`\`yml\nName: ${node.name}\nState: Not Connected or no memory stats.\n\`\`\`\n`,
          playingPlayers: 0,
          totalPlayers: 0
        });
      }
    });
  }

  let botCreationDate = "Unknown";
  if (client.user && client.user.createdTimestamp) {
    botCreationDate = formatTimestamp(client.user.createdTimestamp); 
  } else if (client.user && client.user.createdAt) { 
    botCreationDate = formatTimestamp(client.user.createdAt);
  }

  let commandsCount = 0;
  let tracksCount = 0;
  let playTime = "0s";

  const clientStatsDoc = await getClientStatsDocument();
  if (clientStatsDoc && clientStatsDoc.counts) {
    commandsCount = clientStatsDoc.counts.commandCount || 0;
    tracksCount = convertNumber(clientStatsDoc.counts.trackCount) || 0;
    playTime = formatDurationDetailed(clientStatsDoc.counts.playTime || 0);
  } else {
    client.logger.warn(`No global client stats data found in database (or error fetching).`);
  }

  const systemUptime = formatDurationDetailed(os.uptime() * 1000);

  const apiFetchStart = Date.now();
  let apiPing = -1;
  try {
      await fetch("https://discord.com/api/v10/gateway");
      apiPing = Date.now() - apiFetchStart;
  } catch (err) {
      client.logger.error(`Failed to fetch Discord API gateway for ping:`, err);
  }

  return {
    lavalinkNodesInfo,
    botCreationDate,
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
    const embedFields = botData.lavalinkNodesInfo.map(nodeInfo => ({
      name: "<:ArrowForwardios:1362454729682194686> Lavalink Info",
      value: nodeInfo.stats,
      inline: false,
    }));

    const embed = client.createEmbed({
      authorName: `${client.user.username} Bot Information`,
      authorIcon: client.user.displayAvatarURL(),
      description: `\`\`\`yml\nName: ${client.user.username} (${client.user.id})\nWebsocket Ping: ${client.ws.ping}ms\nAPI Ping: ${botData.apiPing}ms\n\`\`\``,
      fields: [
        { name: "<:ArrowForwardios:1362454729682194686> General Info", value: `\`\`\`yml\nVersion              : v${pkg.version}\nCreated By           : @herjuna\nCreated At           : ${botData.botCreationDate}\nTotal Servers        : ${client.guilds.cache.size} servers\nTotal Commands       : ${commandkit.commandHandler.loadedCommands?.size || 'N/A'} commands\nTotal Players        : ${botData.lavalinkNodesInfo.reduce((acc, node) => acc + node.playingPlayers, 0)} out of ${botData.lavalinkNodesInfo.reduce((acc, node) => acc + node.totalPlayers, 0)}\nUptime               : ${botData.systemUptime}\n\`\`\`` },
        ...embedFields,        
        { name: "<:ArrowForwardios:1362454729682194686> Usage Stats", value: `\`\`\`yml\nCommands Used        : ${botData.commandsCount} times\nSongs Played         : ${botData.tracksCount} songs\nPlaying Time         : ${botData.playTime}\n\`\`\``, inline: false, },
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
    client.logger.error(`[${interaction.commandName}:${config?.executionMode}] Error:`, err);
    const errorEmbed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | Error: ${err.message}` });
    if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [errorEmbed], components: [] }).catch(err => client.logger.error(`[${interaction.commandName}:${config?.executionMode}] Failed to edit reply on error:`, err));
    } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true, components: [] }).catch(errInner => client.logger.error(`[${interaction.commandName}:${config?.executionMode}] Failed to edit reply on error:`, errInner));
    }
  }
};

/**
 * Handler for message command interactions.
 * @param {import('commandkit').MessageCommandContext} ctx
 */
export const message = async (ctx) => {
  const { message, client, commandkit, config } = ctx;

  await message.channel.sendTyping().catch(err => client.logger.debug(`[${ctx.command.command.name}:${config?.executionMode}] Failed to send typing indicator: ${err}`));

  try {
    const botData = await getBotInfoData(client);

    const embedFields = botData.lavalinkNodesInfo.map(nodeInfo => ({
      name: "<:ArrowForwardios:1362454729682194686> Lavalink Info",
      value: nodeInfo.stats,
      inline: false,
    }));

    const embed = client.createEmbed({
      authorName: `${client.user.username} Bot Information`,
      authorIcon: client.user.displayAvatarURL(),
      description: `\`\`\`yml\nName: ${client.user.username} (${client.user.id})\nWebsocket Ping: ${client.ws.ping}ms\nAPI Ping: ${botData.apiPing}ms\n\`\`\``,
      fields: [
        { name: "<:ArrowForwardios:1362454729682194686> General Info", value: `\`\`\`yml\nVersion              : v${pkg.version}\nCreated By           : @herjuna\nCreated At           : ${botData.botCreationDate}\nTotal Servers        : ${client.guilds.cache.size} servers\nTotal Commands       : ${commandkit.commandHandler.loadedCommands?.size || 'N/A'} commands\nTotal Players        : ${botData.lavalinkNodesInfo.reduce((acc, node) => acc + node.playingPlayers, 0)} out of ${botData.lavalinkNodesInfo.reduce((acc, node) => acc + node.totalPlayers, 0)}\nUptime               : ${botData.systemUptime}\n\`\`\`` },
        ...embedFields,        
        { name: "<:ArrowForwardios:1362454729682194686> Usage Stats", value: `\`\`\`yml\nCommands Used        : ${botData.commandsCount} times\nSongs Played         : ${botData.tracksCount} songs\nPlaying Time         : ${botData.playTime}\n\`\`\``, inline: false, },
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
    client.logger.error(`[${ctx.command.command.name}:${config?.executionMode}] Error executing command`, err);
    const errorEmbed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | An error occurred: ${err.message}`, allowedMentions: { repliedUser: false } });
    await message.reply({ embeds: [errorEmbed] }).catch(errInner => client.logger.error(`[${ctx.command.command.name}:${config?.executionMode}] Failed to send error reply:`, errInner));
  }
};
