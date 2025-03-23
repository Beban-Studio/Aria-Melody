const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");
const fetch = require("node-fetch");
const moment = require('moment');
require("moment-duration-format");
const os = require("os");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Check the bot's stats information")
        .setDMPermission(true),

    run: async ({ interaction, client }) => {
        try {
            let nodes= "";

            client.riffy.nodes.forEach((node) => {
                const lavalinkNode = client.riffy.nodeMap.get(node.name);
                const lavalinkMemory = (lavalinkNode.stats.memory.used / 1024 / 1024).toFixed(2);

                const lavalinkUptime = moment
                    .duration(lavalinkNode.stats.uptime)
                    .format("d[ Days]・h[ Hrs]・m[ Mins]・s[ Secs]");
    
                nodes += `\`\`\`yml\nNode: ${node.name}\nUptime: ${lavalinkUptime}\nMemory: ${lavalinkMemory} MB\nPlayers: ${lavalinkNode.stats.playingPlayers} out of ${lavalinkNode.stats.players}\nLavalink Client: Riffy\`\`\`\n`;
            });

            const osVersion = os.platform() + " " + os.release();
            const nodeVersion =  process.version;

            const systemUptime = moment
			.duration(os.uptime() * 1000)
			.format("d[ Days]・h[ Hrs]・m[ Mins]・s[ Secs]");

            const startTime = Date.now();
            await fetch("https://discord.com/api/v10/gateway");
            const apiPing = Date.now() - startTime;

            const embed = new EmbedBuilder()
                .setColor(config.default_color)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                .setTitle(`${client.user.username} Information`)
                .setDescription(`\`\`\`yml\nName: ${client.user.username} (${client.user.id})\nWebsocket Ping: ${client.ws.ping}ms\nApi Ping: ${apiPing}ms\n\`\`\``)
                .setFields([
                    {
                        name: `Lavalink Stats`,
                        value: nodes,
                        inline: false,
                    },
                    {
                        name: "Bot stats",
                        value: `\`\`\`yml\nGuilds: ${
                            client.guilds.cache.size
                        } \nNodeJS: ${nodeVersion}\`\`\``,
                        inline: true,
                    },
                    {
                        name: "System stats",
                        value: `\`\`\`yml\nOS: ${osVersion}\nUptime: ${systemUptime}\n\`\`\``,
                        inline: false,
                    },
                ])
                .setFooter({ text: "Beban Community💖" })

            return interaction.reply({
                embeds: [embed]
            })
        } catch (err) {
            const embed = new EmbedBuilder().setColor(config.default_color);

            logger(err, "error");
            return interaction.reply({ 
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)], 
                ephemeral: true 
            });
        }
    }
};