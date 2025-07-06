/**
 * Handles the 'nodeDisconnect' event from Riffy.
 * Logs a warning or error when a Lavalink node disconnects.
 * @param {import('discord.js').Client} client The Discord client instance (which has client.riffy).
 */
export default async function nodeDisconnect(client) {
  if (!client.riffy) {
    client.logger.error('Riffy instance not found on client. Cannot attach event listener.');
    return;
  }

  client.riffy.on('nodeDisconnect', async (node, reason) => {
    let reasonString;

    try {
      if (reason && typeof reason === 'object') {
        reasonString = `Code: ${reason.code || 'N/A'}, Reason: "${reason.reason || 'No reason provided'}"`;
      } else {
        reasonString = String(reason);
      }

    } catch (err) {
      reasonString = "Could not stringify reason object.";
      client.logger.error('Error processing disconnect reason:', err);
    }

    client.logger.warn(`Node disconnected. ${reasonString}`);
  });
};