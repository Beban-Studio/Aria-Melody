const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const config = require("../../config");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the latency of the bot")
        .setDMPermission(true),

    run: async ({ interaction, client }) => {
        const embed = new EmbedBuilder().setColor(config.default_color);

        try {
            const wsPing = client.ws.ping;

            const startTime = Date.now();
            await fetch("https://discord.com/api/v10/gateway");
            const apiPing = Date.now() - startTime;

            return interaction.reply({ embeds: [embed.setDescription(`Pong! 🏓 WebSocket Latency: ${wsPing}ms | Discord API Latency: ${apiPing}ms`)] });

        } catch (err) {
            logger(err, "error");
            return interaction.reply({ 
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)], 
                ephemeral: true 
            });
        }
    }
};