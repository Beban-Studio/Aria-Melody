const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { parseTimeString } = require("../../../utils/parseTimeString");
const guild = require("../../../schemas/guild");
const config = require("../../../config");

module.exports = async (oldState, newState, client) => {
    const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);

    if (newState.channelId && newState.channel.type == 13 && newState.guild.members.me.voice.suppress) {
        if (
            newState.guild.members.me.permissions.has(PermissionsBitField.Flags.Speak) ||
            newState.channel.permissionsFor(newState.guild.members.me).has(PermissionsBitField.Flags.Speak)
        ) {
            newState.guild.members.me.voice.setSuppressed(false);
        }
    }

    const newStatePlayer = client.riffy.players.get(newState.guild.id);

    if (newStatePlayer && newState.channelId == null && newState.member?.user.id === client.user?.id) {
        newStatePlayer.state !== 2 ? newStatePlayer.destroy() : true;
    }

    const guildData = await guild.findOne({ guildId: newState.guild.id || oldState.guild.id });

    if (guildData && guildData.reconnect.status) return;

    const oldStatePlayer = client.riffy.players.get(oldState.guild.id || newState.guild.id);

    if (!oldStatePlayer) return;

    const emptyVoice =
        oldState.guild.members.me.voice?.channel && oldState.guild.members.me.voice.channel.members.filter((m) => !m.user.bot).size === 0;

    const notPlaying = !oldStatePlayer.playing && !oldStatePlayer.queue.current;

    if (oldStatePlayer.voiceId || oldState.guild.members.me.voice.channelId === oldState.channelId) {
        if (emptyVoice || notPlaying) {
            await delay(config.riffyOptions.leaveTimeout);
            const vcMembers = oldState.guild.members.me.voice.channel?.members.size;
            const leaveEmbedChannel = await client.channels.fetch(guildData.reconnect.textChannel || oldStatePlayer.textChannel);
            const stillBotAlone = oldState.guild.members.me.voice.channel?.members.filter((m) => !m.user.bot).size === 0;
            const stillNotPlaying = !oldStatePlayer.playing && !oldStatePlayer.queue.current;

            if ((stillBotAlone || stillNotPlaying) && (!vcMembers || vcMembers === 1 || vcMembers > 1)) {
                if (oldStatePlayer.message) await oldStatePlayer.message.delete().catch((err) => {});

                oldStatePlayer.destroy()

                return leaveEmbedChannel.send({ embeds: [embed.setDescription("Disconnecting from the voice channel due to inactivity. You can disable this by using \`247\` command.")] }).then((msg) => {
                    if (!msg) return;

                    setTimeout(() => {
                        msg.delete().catch((err) => {});
                    }, parseTimeString("30s"));
                });
            }
        }
    }
};

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}