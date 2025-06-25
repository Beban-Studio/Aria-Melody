// src/app/commands/utility/bot-ping.js (or your specific path)
import fetch from 'node-fetch';
import * as logger from '../../utils/logger.js'; // Adjust path if needed

/**
 * @type {import('commandkit').CommandData}
 */
export const command = {
  name: 'bot-ping',
  description: "Check the bot's latency and API response time.",
  aliases: ['p', 'ping', 'latency', 'botping'],
  contexts: [0, 1],
};

/**
 * Handler for slash command interactions.
 * @param {import('commandkit').ChatInputCommandContext} ctx
 */
export const chatInput = async (ctx) => {
  const { interaction, client, config } = ctx; 

  try {
    const preparingEmbed = client.createEmbed({ description: "🏓 Pinging..." });
    await interaction.reply({ embeds: [preparingEmbed], ephemeral: false });

    const interactionCreationTime = interaction.createdTimestamp;
    const websocketPing = client.ws.ping ?? -1;

    const apiFetchStart = Date.now();
    let apiPing = -1;
    try {
      await fetch("https://discord.com/api/v10/gateway");
      apiPing = Date.now() - apiFetchStart;
    } catch (err) {
      logger.error(`[${interaction.commandName}:${config?.executionMode}] Failed to fetch Discord API gateway for ping:`, err);
    }

    const processingLatency = Date.now() - interactionCreationTime;

    const responseEmbed = client.createEmbed({
      title: "🏓 Pong!",
      fields: [
        { name: "Websocket Ping", value: `\`\`\`${websocketPing}ms\`\`\``, inline: true },
        { name: "API Latency", value: `\`\`\`${apiPing === -1 ? 'Failed' : `${apiPing}ms`}\`\`\``, inline: true },
        { name: "Interaction Latency", value: `\`\`\`${processingLatency}ms\`\`\``, inline: true },
      ]
    });
    await interaction.editReply({ embeds: [responseEmbed] });

  } catch (err) {
    logger.error(`[${interaction.commandName}:${config?.executionMode}] Error:`, err);
    const errorEmbed = client.createEmbed({
      description: `${client.emoji?.system?.xMark || '❌'} | Error: ${err.message}`
    });
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed], components: [] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } catch (errInner) {
      logger.error(`[${interaction.commandName}:${config?.executionMode}] Failed to send/edit error reply:`, errInner);
    }
  }
};

/**
 * Handler for message command interactions.
 * @param {import('commandkit').MessageCommandContext} ctx
 */
export const message = async (ctx) => {
  const { message, client, config } = ctx; 

  try {
    const initialMsg = await message.reply({ content: "🏓 Pinging...", allowedMentions: { repliedUser: false } });

    const websocketPing = client.ws.ping ?? -1;

    const apiFetchStart = Date.now();
    let apiPing = -1;
    try {
      await fetch("https://discord.com/api/v10/gateway");
      apiPing = Date.now() - apiFetchStart;
    } catch (err) {
      logger.error(`[${ctx.command.command.name}:${config?.executionMode}] Failed to fetch Discord API gateway for ping:`, err);
    }

    const roundTripTime = initialMsg.createdTimestamp - message.createdTimestamp;

    const responseEmbed = client.createEmbed({
      title: "🏓 Pong!",
      fields: [
        { name: "Websocket Ping", value: `\`\`\`${websocketPing}ms\`\`\``, inline: true },
        { name: "API Latency", value: `\`\`\`${apiPing === -1 ? 'Failed' : `${apiPing}ms`}\`\`\``, inline: true },
        { name: "Message Roundtrip", value: `\`\`\`${roundTripTime}ms\`\`\``, inline: true },
      ]
    });

    await initialMsg.edit({ embeds: [responseEmbed], content: null, allowedMentions: { repliedUser: false } });

  } catch (err) {
    logger.error(`[${ctx.command.command.name}:${config?.executionMode}] Error executing command:`, err);
    const errorEmbed = client.createEmbed({ description: `${client.emoji?.system?.xMark || '❌'} | An error occurred: ${err.message}`, allowedMentions: { repliedUser: false } });
    await message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } }).catch(errInner => logger.error(`[${ctx.command.command.name}:${config?.executionMode}] Failed to send error reply:`, errInner));
  }
};