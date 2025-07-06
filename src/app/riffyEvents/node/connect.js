import { parseTimeString } from '#utils/time';
import GuildModel from '#schemas/guildSchema'; 

/**
 * Handles the 'nodeConnect' event from Riffy.
 * Attempts to reconnect players for guilds with 24/7 mode enabled.
 * @param {import('discord.js').Client<true>} client
 */
export default async function nodeConnect(client) {
  if (!client.riffy) {
    client.logger.error('Riffy instance not found on client.');
    return;
  }

  client.riffy.on('nodeConnect', async (node) => {
    client.logger.success(`[${node.name}] Node connected successfully!`); 

    try {
      const allGuildData = await GuildModel.find({ 'reconnect.status': true });
      client.logger.info(`Found ${allGuildData.length} guilds with 24/7 mode enabled. Attempting reconnections...`);

      if (allGuildData.length === 0) {
        return;
      }

      allGuildData.forEach((guildDataEntry, index) => {
        setTimeout(async () => {
          if (!guildDataEntry.reconnect || !guildDataEntry.reconnect.status) {
            client.logger.debug(`Skipping reconnect for guild ${guildDataEntry.guildId}: Reconnect status is false or data missing.`);
            return;
          }

          const guild = client.guilds.cache.get(guildDataEntry.guildId);

          if (!guild) {
            client.logger.warn(`Guild ${guildDataEntry.guildId} not found in cache. Cannot reconnect player. Disabling 24/7 for this guild.`);
            guildDataEntry.reconnect.status = false;
            guildDataEntry.reconnect.textChannel = null;
            guildDataEntry.reconnect.voiceChannel = null;

            try {
              await guildDataEntry.save();

            } catch (saveErr) {
              client.logger.error(`Failed to save updated guild data for ${guildDataEntry.guildId} after guild not found:`, saveErr);
            }
            return;
          }

          const textChannel = guild.channels.cache.get(guildDataEntry.reconnect.textChannel);
          const voiceChannel = guild.channels.cache.get(guildDataEntry.reconnect.voiceChannel);

          if (!textChannel || !voiceChannel) {
            client.logger.warn(`Text or Voice channel not found for guild ${guild.name} (${guild.id}). Text: ${guildDataEntry.reconnect.textChannel}, Voice: ${guildDataEntry.reconnect.voiceChannel}. Disabling 24/7.`);
            guildDataEntry.reconnect.status = false;
            try {
              await guildDataEntry.save();
            } catch (saveErr) {
              client.logger.error(`Failed to save updated guild data for ${guild.id} after channel not found:`, saveErr);
            }
            return;
          }

          client.logger.info(`Attempting to reconnect player for guild: ${guild.name} (${guild.id}) to VC: ${voiceChannel.name}, Text: ${textChannel.name}`);

          try {
            let player = client.riffy.players.get(guild.id);

            if (player && player.connected) {
                client.logger.info(`Player already exists and is connected in ${guild.name}. Skipping reconnection.`);
                if (player.voiceId !== voiceChannel.id) {
                    client.logger.warn(`Player in ${guild.name} is in VC ${player.voiceId} but 24/7 is set for ${voiceChannel.id}. Consider manual adjustment or /join.`);
                }
                return;
            }
            
            player = await client.riffy.createConnection({
              guildId: guild.id,
              voiceChannel: voiceChannel.id,
              textChannel: textChannel.id,
              deaf: true,
              defaultVolume: client.config.riffyOptions.playerVolume || 50, 
            });
            client.logger.success(`Successfully reconnected player to ${voiceChannel.name} in ${guild.name}.`);

            if (textChannel.isTextBased()) { 
                textChannel.send({ embeds: [client.createEmbed({ description: `🎶 Reconnected and ready to play in <#${voiceChannel.id}>!` })]}).catch(err => client.logger.warn(`Could not send reconnect message to ${textChannel.name} (${textChannel.id}): ${err}`));
            }

          } catch (err) {
            client.logger.error(`Could not reconnect player for guild ${guild.name} (${guild.id}):`, err);
          }
        }, index * parseTimeString("5s")); 
      });

    } catch (dbErr) {
      client.logger.error('Error fetching guild data for reconnections:', dbErr);
    }
  });
};