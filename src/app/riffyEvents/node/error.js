/**
 * Handles the 'nodeError' event from Riffy.
 * Logs errors that occur on a Lavalink node connection.
 * @param {import('discord.js').Client} client The Discord client instance (which has client.riffy).
 */
export default async function nodeError(client) {
  if (!client.riffy) {
    client.logger.error('Riffy instance not found on client. Cannot attach event listener.');
    return;
  }

  client.riffy.on('nodeError', async (node, error) => {
    client.logger.error(`[${node.name}] Node encountered an error: ${error}`);
  });
};