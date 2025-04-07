const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger.js");
const guild = require("../../schemas/guild");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("247")
        .setDescription("Toggle the current player session to 24/7")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        .setDMPermission(false),

    run: async ({ client, interaction }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);
        const player = client.riffy.players.get(interaction.guildId);

        if (!player) {
            return interaction.reply({ 
                embeds: [embed.setDescription("\`❌\` | No player found in this server.")],  
                ephemeral: true 
            });
        }

        await interaction.deferReply({ ephemeral: false });

        try {
            const data = await guild.findOne({ guildId: interaction.guildId });

            if (data) {
                data.reconnect.status = !data.reconnect.status;
                data.reconnect.textChannel = player.textChannel || interaction.channelId;
                data.reconnect.voiceChannel = player.voiceChannel || interaction.member.voice.channelId;
                await data.save();
            } else {
                const newData = new guild({
                    guildId: interaction.guildId,
                    reconnect: {
                        status: true,
                        textChannel: player.textChannel || interaction.channelId,
                        voiceChannel: player.voiceChannel || interaction.member.voice.channelId,
                    },
                    buttons: true
                });
                await newData.save();
            }

            const statusMessage = data ? (data.reconnect.status ? "Enabled" : "Disabled") : "Enabled";
            return interaction.editReply({ 
                embeds: [embed.setDescription(`\`📻\` | 24/7 Mode has been: \`${statusMessage}\``)] 
            });
        } catch (err) {
            logger(err, "error");
            return interaction.editReply({ 
                embeds: [embed.setDescription(`\`❌\` | An error occurred: ${err.message}`)], 
                ephemeral: true 
            });
        }
    },
    options: {
        inVoice: true,
        sameVoice: true,
    }
};