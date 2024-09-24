const { 
	ActionRowBuilder, 
	ButtonBuilder, 
	ButtonStyle, 
	EmbedBuilder } = require("discord.js");
const { default_color } = require("../../../config")
const formatDuration = require("../../../utils/formatDuration");
const capital = require("node-capitalize");
const client = require("../../../Aria");

client.riffy.on('trackStart', async (player, track) => {
	const bReplay = new ButtonBuilder().setCustomId("replay").setEmoji("1276835198893559961").setStyle(ButtonStyle.Secondary);
    const bPrev = new ButtonBuilder().setCustomId("prev").setEmoji("1276835196628635680").setStyle(ButtonStyle.Secondary);
    const bPause = new ButtonBuilder().setCustomId("pause").setEmoji("1276835192295915623").setStyle(ButtonStyle.Secondary);
    const bSkip = new ButtonBuilder().setCustomId("skip").setEmoji("1276835203146449031").setStyle(ButtonStyle.Secondary);
    const bShuffle = new ButtonBuilder().setCustomId("shuffle").setEmoji("1276835201028198450").setStyle(ButtonStyle.Secondary);
    const bVDown = new ButtonBuilder().setCustomId("voldown").setEmoji("1276835205377949737").setStyle(ButtonStyle.Secondary);
    const bStop = new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger);
    const bVUp = new ButtonBuilder().setCustomId("volup").setEmoji("1276835207345078293").setStyle(ButtonStyle.Secondary);
    const bInfo = new ButtonBuilder().setCustomId("info").setEmoji("1276835190416867360").setStyle(ButtonStyle.Secondary);
    const bLoop = new ButtonBuilder().setCustomId("loop").setEmoji("1276835185849143367").setStyle(ButtonStyle.Secondary);


    const startrow1 = new ActionRowBuilder()
        .addComponents(bReplay, bPrev, bPause, bSkip, bLoop);
    const startrow2 = new ActionRowBuilder()
        .addComponents(bShuffle, bVDown, bStop, bVUp, bInfo);

    const channel = client.channels.cache.get(player.textChannel);
    const titles = track.info.title.length > 20 ? track.info.title.substr(0, 20) + "..." : track.info.title;
    const authors = track.info.author.length > 20 ? track.info.author.substr(0, 20) + "..." : track.info.author;
    const trackDuration = track.info.isStream ? "LIVE" : formatDuration(track.info.length);
    const trackAuthor = track.info.author ? authors : "Unknown";
    const trackTitle = track.info.title ? titles : "Unknown";

    const startembed = new EmbedBuilder()
		.setAuthor({
            name: `Now Playing`,
            iconURL: "https://media.tenor.com/Sb0yPHMgNaUAAAAi/music-disc.gif",
        })
        .setColor(default_color)
        .setTitle(trackTitle)
        .setThumbnail(track.info.thumbnail)
        .setURL(track.info.uri)
		.addFields(
			{ name: "Artist", value: `${track.info.author}`, inline: true },
			{ name: "Duration", value: `\`${trackDuration}\``, inline: true },
			{ name: "Requester", value: `${track.info.requester}`, inline: true },	
		)
        .setFooter({ text: `Loop: ${capital(player.loop)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%` });
    
    const msg = await channel
    	.send({ embeds: [startembed], components: [startrow1, startrow2] })
    	.then((x) => (player.message = x));

    const filter = (message) => {
        if (message.guild.members.me.voice.channel && message.guild.members.me.voice.channelId === message.member.voice.channelId)
            return true;
        else {
            message.reply({
                content: `\`❌\` | You must be on the same voice channel as mine to use this button.`,
                ephemeral: true,
            });
        }
    };

    const collector = msg.createMessageComponentCollector({ filter, time: track.info.length * 15 });

    collector.on("collect", async (message) => {
        if (message.customId === "loop") {
            if (!player) {
                collector.stop();
            } else if (player.loop === "none") {
                await player.setLoop("track");
                const embed = new EmbedBuilder().setDescription(`\`✔️\` | Loop mode set to : \`${player.loop}\``).setColor(default_color);
                message.reply({ embeds: [embed], ephemeral: true });
                const loopEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `Now Playing`,
                    iconURL: "https://media.tenor.com/Sb0yPHMgNaUAAAAi/music-disc.gif",
                })
                .setColor(default_color)
                .setTitle(track.info.title)
                .setThumbnail(track.info.thumbnail)
                .setURL(track.info.uri)
                .addFields(
                    { name: "Artist", value: `${track.info.author}`, inline: true },
                    { name: "Duration", value: `\`${trackDuration}\``, inline: true },
                    { name: "Requester", value: `${track.info.requester}`, inline: true },
                )
                .setFooter({
                    text: `Loop: ${capital(player.loop)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
                });

                const looprow1 = new ActionRowBuilder()
                .addComponents(bReplay, bPrev, bPause, bSkip, bLoop);
                const looprow2 = new ActionRowBuilder()
                .addComponents(bShuffle, bVDown, bStop, bVUp, bInfo);
        
                await msg.edit({
                    embeds: [loopEmbed], component: [looprow1, looprow2]
                });
            } else if (player.loop === "track") {
                await player.setLoop("queue");
                const embed = new EmbedBuilder().setDescription(`\`✔️\` | Loop mode set to : \`${player.loop}\``).setColor(default_color);
                message.reply({ embeds: [embed], ephemeral: true });
                const loopEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `Now Playing`,
                    iconURL: "https://media.tenor.com/Sb0yPHMgNaUAAAAi/music-disc.gif",
                })
                .setColor(default_color)
                .setTitle(track.info.title)
                .setThumbnail(track.info.thumbnail)
                .setURL(track.info.uri)
                .addFields(
                    { name: "Artist", value: `${track.info.author}`, inline: true },
                    { name: "Duration", value: `\`${trackDuration}\``, inline: true },
                    { name: "Requester", value: `${track.info.requester}`, inline: true },
                )
                .setFooter({
                    text: `Loop: ${capital(player.loop)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
                });

                const looprow1 = new ActionRowBuilder()
                .addComponents(bReplay, bPrev, bPause, bSkip, bLoop);
                const looprow2 = new ActionRowBuilder()
                .addComponents(bShuffle, bVDown, bStop, bVUp, bInfo);
        
                await msg.edit({
                    embeds: [loopEmbed], component: [looprow1, looprow2]
                });
            } else if (player.loop === "queue") {
                await player.setLoop("none");
                const embed = new EmbedBuilder().setDescription(`\`✔️\` | Loop mode set to : \`${player.loop}\``).setColor(default_color);
                message.reply({ embeds: [embed], ephemeral: true });
                const loopEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `Now Playing`,
                    iconURL: "https://media.tenor.com/Sb0yPHMgNaUAAAAi/music-disc.gif",
                })
                .setColor(default_color)
                .setTitle(track.info.title)
                .setThumbnail(track.info.thumbnail)
                .setURL(track.info.uri)
                .addFields(
                    { name: "Artist", value: `${track.info.author}`, inline: true },
                    { name: "Duration", value: `\`${trackDuration}\``, inline: true },
                    { name: "Requester", value: `${track.info.requester}`, inline: true },
                )
                .setFooter({
                    text: `Loop: ${capital(player.loop)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
                });

                const looprow1 = new ActionRowBuilder()
                .addComponents(bReplay, bPrev, bPause, bSkip, bLoop);
                const looprow2 = new ActionRowBuilder()
                .addComponents(bShuffle, bVDown, bStop, bVUp, bInfo);
        
                await msg.edit({
                    embeds: [loopEmbed], component: [looprow1, looprow2]
                });
            }
        } else if (message.customId === "replay") {
            if (!player) {
                message.reply({ content: `\`❌\` | The player doesn't exist`, ephemeral: true })
                collector.stop();
            } else {
                await player.seek(0);
                const embed = new EmbedBuilder().setDescription('\`✔️\` | The song has been replayed').setColor(default_color);
                message.reply({ embeds: [embed], ephemeral: false });
            }
        } else if (message.customId === "stop") {
            if (!player) {
                message.reply({ content: `\`❌\` | The player doesn't exist`, ephemeral: true });
                collector.stop();
            } else {
                player.destroy();
                if (player.message) await player.message.delete();
            }
        } else if (message.customId === "pause") {
            if (!player) {
                message.reply({ content: `\`❌\` | The player doesn't exist`, ephemeral: true });
                collector.stop();
            } else if (player.paused === false) {
                message.deferUpdate();
                
                await player.pause(true)
                const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId("replay").setEmoji("1276835198893559961").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("prev").setEmoji("1276835196628635680").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("pause").setEmoji("1276835194636337152").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("skip").setEmoji("1276835203146449031").setStyle(ButtonStyle.Secondary),
                    bLoop,
                    );
        
                const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId("shuffle").setEmoji("1276835201028198450").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("voldown").setEmoji("1276835205377949737").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId("volup").setEmoji("1276835207345078293").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("info").setEmoji("1276835190416867360").setStyle(ButtonStyle.Secondary),
                );
                return await msg.edit({
                    components: [row1, row2]
                })
            } else if (player.paused === true) {
                message.deferUpdate();
                
                await player.pause(false)
                return await msg.edit({
                    components: [startrow1, startrow2]
                })
            }
        } else if (message.customId === "skip") {
            if (!player) {
                message.reply({ content: `\`❌\` | The player doesn't exist`, ephemeral: true });
                collector.stop();
            } else if (!player || player.queue.size == 0) {
                const embed = new EmbedBuilder().setDescription(`\`❌\` | Queue is: \`Empty\``).setColor(default_color);
    
                return message.reply({ embeds: [embed], ephemeral: true });
            } else {
                await player.stop();
            }
        } else if (message.customId === "prev") {
            if (!player) {
                message.reply({ content: `\`❌\` | The player doesn't exist`, ephemeral: true });
                collector.stop();
            } else if (!player.previous) {
                const embed = new EmbedBuilder().setDescription(`\`❌\` | Previous song was: \`Not found\``).setColor(default_color);

                return message.reply({ embeds: [embed], ephemeral: true });
            } else {
                await player.queue.unshift(player.previous);
                await player.stop();
            }
        } else if (message.customId === "shuffle") {
            if (!player) {
                message.reply({ content: `\`❌\` | The player doesn't exist`, ephemeral: true })
                collector.stop();
            } else if (player.queue.size < 2) {
                const embed = new EmbedBuilder().setDescription(`\`❌\` | Queue ammount is less than 2`).setColor(default_color);
    
                return message.reply({ embeds: [embed], ephemeral: true });
            } else {
                await player.queue.shuffle();
                const embed = new EmbedBuilder().setDescription('\`✔️\` | The queue has been shuffled').setColor(default_color);
                message.reply({ embeds: [embed], ephemeral: false });
            }
        } else if (message.customId === "voldown") {
            if (!player) {
                message.reply({ content: `\`❌\` | The player doesn't exist`, ephemeral: true })
                collector.stop();
            } else if (player.volume < 20) {
                await player.setVolume(10);
                const embed = new EmbedBuilder().setDescription(`\`❌\` | Volume can't be lower than: \`10%\``).setColor(default_color);
                await message.reply({ embeds: [embed], ephemeral: true });
            } else {
            await player.setVolume(player.volume - 10);
            const volEmbed = new EmbedBuilder()
            .setAuthor({
                name: `Now Playing`,
                iconURL: "https://media.tenor.com/Sb0yPHMgNaUAAAAi/music-disc.gif",
            })
            .setColor(default_color)
            .setTitle(track.info.title)
            .setThumbnail(track.info.thumbnail)
            .setURL(track.info.uri)
            .addFields(
                { name: "Artist", value: `${track.info.author}`, inline: true },
                { name: "Duration", value: `\`${trackDuration}\``, inline: true },
                { name: "Requester", value: `${track.info.requester}`, inline: true },
            )
            .setFooter({
                text: `Loop: ${capital(player.loop)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
            })
            await message.reply({ embeds: [new EmbedBuilder().setDescription(`\`✔️\` | Volume decreased to : \`${player.volume}%\``).setColor(default_color)], ephemeral: true })
            await msg.edit({ embeds: [volEmbed] });
            }
        } else if (message.customId === "volup") {
            if (!player) {
                message.reply({ content: `\`❌\` | The player doesn't exist`, ephemeral: true })
                collector.stop();
            } else if (player.volume > 140) {
                await player.setVolume(150);
                const embed = new EmbedBuilder().setDescription(`\`❌\` | Volume can't be higher than: \`150%\``).setColor(default_color);
                await message.reply({ embeds: [embed], ephemeral: true });
            } else {         
            await player.setVolume(player.volume + 10);
            const volEmbed = new EmbedBuilder()
            .setAuthor({
                name: `Now Playing`,
                iconURL: "https://media.tenor.com/Sb0yPHMgNaUAAAAi/music-disc.gif",
            })
            .setColor(default_color)
            .setTitle(track.info.title)
            .setThumbnail(track.info.thumbnail)
            .setURL(track.info.uri)
            .addFields(
                { name: "Artist", value: `${track.info.author}`, inline: true },
                { name: "Duration", value: `\`${trackDuration}\``, inline: true },
                { name: "Requester", value: `${track.info.requester}`, inline: true },
            )
            .setFooter({
                text: `Loop: ${capital(player.loop)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
            });
            await message.reply({ embeds: [new EmbedBuilder().setDescription(`\`✔️\` | Volume increased to : \`${player.volume}%\``).setColor(default_color)], ephemeral: true })
            await msg.edit({ embeds: [volEmbed] });
            }
        } else if (message.customId === "info") {
            if (!player) {
                collector.stop();
            } else {
                const sources = capital(track.info.sourceName);
                const Titles =
                    track.info.title.length > 20
                        ? track.info.title.substr(0, 20) + "..."
                        : track.info.title;
                const Author =
                    track.info.author.length > 20
                        ? track.info.author.substr(0, 20) + "..."
                        : track.info.author;
                const trackDuration = formatDuration(track.info.length);
                const playerDuration = track.info.isStream ? "LIVE" : trackDuration;
                const currentAuthor = track.info.author ? Author : "Unknown";
                const currentTitle = track.info.title ? Titles : "Unknown";

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: player.playing ? `Now Playing` : `Song Paused`,
                        iconURL: "https://media.tenor.com/Sb0yPHMgNaUAAAAi/music-disc.gif",
                    })
                    .setThumbnail(track.info.thumbnail)
                    .setDescription(`**[${currentTitle}](${track.info.uri})**`)
                    .addFields([
                        { name: `Author:`, value: `${currentAuthor}`, inline: true },
                        { name: `Requested By:`, value: `${track.info.requester}`, inline: true },
                        { name: `Source:`, value: `${sources}`, inline: true },
                        { name: `Duration:`, value: `${playerDuration}`, inline: true },
                        { name: `Volume:`, value: `${player.volume}%`, inline: true },
                        { name: `Queue Left:`, value: `${player.queue.length}`, inline: true },

                    ])
                    .setColor(default_color)
                    .setFooter({ text: `${client.user.username} 💙` })
                    .setTimestamp();

                return message.reply({ embeds: [embed], ephemeral: true });
            }
        }
    })
})