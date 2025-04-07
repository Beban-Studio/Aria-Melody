const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { logger } = require("../../utils/logger");
const guild = require("../../schemas/guild");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("control-button")
        .setDescription("Toggle music control buttons")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setDMPermission(false),

    run: async ({ interaction }) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);
        const guildId = interaction.guild.id;

        try {
            let buttonState = await guild.findOne({ guildId: guildId });

            if (!buttonState) {
                buttonState = new guild({ guildId: guildId, buttons: false });
            }

            buttonState.buttons = !buttonState.buttons;
            await buttonState.save();

            return interaction.reply({ 
                embeds: [embed.setDescription(`\`✔️\` | Music control buttons have been ${buttonState.buttons ? "\`enabled\`" : "\`disabled\`"}.`)],
                ephemeral: true 
            });

        } catch (err) {
            logger(err, "error");
            return interaction.reply({ 
                content: `\`❌\` | An error occurred: ${err.message}`,  
                ephemeral: true 
            });
        }
    },
};