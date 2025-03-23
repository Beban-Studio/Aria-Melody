const { 
	ActionRowBuilder, 
	ButtonBuilder, 
	ButtonStyle, 
	EmbedBuilder } = require("discord.js");
const { default_color } = require("../../../config");
const formatDuration = require("../../../utils/formatDuration");
const client = require("../../../Aria");

client.riffy.on('trackStart', async (player, track) => {
    const bPause = new ButtonBuilder().setCustomId("pause").setEmoji("1276835192295915623").setStyle(ButtonStyle.Secondary);
	const bReplay = new ButtonBuilder().setCustomId("replay").setEmoji("1276835198893559961").setStyle(ButtonStyle.Secondary);
    const bSkip = new ButtonBuilder().setCustomId("skip").setEmoji("1276835203146449031").setStyle(ButtonStyle.Secondary);
    const bVDown = new ButtonBuilder().setCustomId("voldown").setEmoji("1276835205377949737").setStyle(ButtonStyle.Secondary);
    const bStop = new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger);
    const bVUp = new ButtonBuilder().setCustomId("volup").setEmoji("1276835207345078293").setStyle(ButtonStyle.Secondary);

    let bAuto = new ButtonBuilder().setCustomId('autoplay').setStyle(ButtonStyle.Secondary).setEmoji('1286677681882136576');
        if (player.isAutoplay) bAuto = new ButtonBuilder().setCustomId('autoplay').setEmoji('1286677681882136576').setStyle(ButtonStyle.Primary);

    let bLoop = new ButtonBuilder().setCustomId("loop").setEmoji("1276835185849143367").setStyle(ButtonStyle.Secondary);
        if (player.loop === "track") bLoop = new ButtonBuilder().setCustomId("loop").setEmoji("1276835185849143367").setStyle(ButtonStyle.Success);
        if (player.loop === "queue") bLoop = new ButtonBuilder().setCustomId("loop").setEmoji("1276835185849143367").setStyle(ButtonStyle.Primary);


    const startrow1 = new ActionRowBuilder()
        .addComponents(bPause, bReplay, bSkip, bLoop);
    const startrow2 = new ActionRowBuilder()
        .addComponents(bStop, bVDown, bVUp, bAuto);

    const channel = client.channels.cache.get(player.textChannel);
    const titles = track.info.title.length > 20 ? track.info.title.substr(0, 20) + "..." : track.info.title;
    const authors = track.info.author.length > 20 ? track.info.author.substr(0, 20) + "..." : track.info.author;
    const trackDuration = track.info.isStream ? "LIVE" : formatDuration(track.info.length);
    const trackAuthor = track.info.author ? authors : "Unknown";
    const trackTitle = track.info.title ? titles : "Unknown";
    const trackThumbnail = track.info.thumbnail ? track.info.thumbnail : client.user.displayAvatarURL;

    const startembed = new EmbedBuilder()
		.setAuthor({
            name: `Now Playing`,
            iconURL: "https://media.tenor.com/Sb0yPHMgNaUAAAAi/music-disc.gif",
        })
        .setColor(default_color)
        .setTitle(trackTitle)
        .setThumbnail(trackThumbnail)
        .setURL(track.info.uri)
		.addFields(
			{ name: "Artist", value: `${trackAuthor}`, inline: true },
			{ name: "Duration", value: `\`${trackDuration}\``, inline: true },
			{ name: "Requester", value: `${track.info.requester}`, inline: true },	
		)
        .setFooter({ text: `Loop: ${(player.loop).charAt(0).toUpperCase() + (player.loop).slice(1)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%` });
    
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

                const embed = new EmbedBuilder()
                    .setDescription(`\`✔️\` | Loop mode set to : \`${player.loop}\``)
                    .setColor(default_color);

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
                        { name: "Artist", value: `${trackAuthor}`, inline: true },
                        { name: "Duration", value: `\`${trackDuration}\``, inline: true },
                        { name: "Requester", value: `${track.info.requester}`, inline: true },
                    )
                    .setFooter({
                        text: `Loop: ${(player.loop).charAt(0).toUpperCase() + (player.loop).slice(1)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
                    });

                bLoop = new ButtonBuilder().setCustomId("loop").setEmoji("1276835185849143367").setStyle(ButtonStyle.Success);

                const row1 = new ActionRowBuilder()
                    .addComponents(bPause, bReplay, bSkip, bLoop);
                const row2 = new ActionRowBuilder()
                    .addComponents(bStop, bVDown, bVUp, bAuto);
        
                return msg.edit({
                    embeds: [loopEmbed], 
                    components: [row1, row2]
                });
            } else if (player.loop === "track") {
                await player.setLoop("queue");

                const embed = new EmbedBuilder()
                .setDescription(`\`✔️\` | Loop mode set to : \`${player.loop}\``)
                .setColor(default_color);

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
                        { name: "Artist", value: `${trackAuthor}`, inline: true },
                        { name: "Duration", value: `\`${trackDuration}\``, inline: true },
                        { name: "Requester", value: `${track.info.requester}`, inline: true },
                    )
                    .setFooter({
                        text: `Loop: ${(player.loop).charAt(0).toUpperCase() + (player.loop).slice(1)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
                    });
                
                bLoop = new ButtonBuilder().setCustomId("loop").setEmoji("1276835185849143367").setStyle(ButtonStyle.Primary);

                const row1 = new ActionRowBuilder()
                    .addComponents(bPause, bReplay, bSkip, bLoop);
                const row2 = new ActionRowBuilder()
                    .addComponents(bStop, bVDown, bVUp, bAuto);
        
                return msg.edit({
                    embeds: [loopEmbed], 
                    components: [row1, row2]
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
                    { name: "Artist", value: `${trackAuthor}`, inline: true },
                    { name: "Duration", value: `\`${trackDuration}\``, inline: true },
                    { name: "Requester", value: `${track.info.requester}`, inline: true },
                )
                .setFooter({
                    text: `Loop: ${(player.loop).charAt(0).toUpperCase() + (player.loop).slice(1)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
                });

                bLoop = new ButtonBuilder().setCustomId("loop").setEmoji("1276835185849143367").setStyle(ButtonStyle.Secondary);

                const row1 = new ActionRowBuilder()
                    .addComponents(bPause, bReplay, bSkip, bLoop);
                const row2 = new ActionRowBuilder()
                    .addComponents(bStop, bVDown, bVUp, bAuto);
        
                return msg.edit({
                    embeds: [loopEmbed], 
                    components: [row1, row2]
                });
            }
        } else if (message.customId === "replay") {
            if (!player) {
                message.reply({ content: `\`❌\` | The player doesn't exist`, ephemeral: true })
                collector.stop();
            } else {
                await player.seek(0);
                const embed = new EmbedBuilder().setDescription('\`✔️\` | The song has been replayed').setColor(default_color);
                return message.reply({ 
                    embeds: [embed], 
                    ephemeral: false 
                });
            }
        } else if (message.customId === "stop") {
            if (!player) {
                message.reply({ 
                    content: `\`❌\` | The player doesn't exist`, 
                    ephemeral: true 
                });
                collector.stop();
            } else {
                player.destroy();
                if (player.message) await player.message.delete();
            }
        } else if (message.customId === "pause") {
            if (!player) {
                message.reply({ 
                    content: `\`❌\` | The player doesn't exist`, 
                    ephemeral: true 
                });
                collector.stop();
            } else if (!player.paused) {
                message.deferUpdate();
                
                await player.pause(true)

                const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId("pause").setEmoji("1276835194636337152").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("replay").setEmoji("1276835198893559961").setStyle(ButtonStyle.Secondary),                    
                    new ButtonBuilder().setCustomId("skip").setEmoji("1276835203146449031").setStyle(ButtonStyle.Secondary),
                    bLoop
                    );
        
                const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId("stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId("voldown").setEmoji("1276835205377949737").setStyle(ButtonStyle.Secondary),           
                    new ButtonBuilder().setCustomId("volup").setEmoji("1276835207345078293").setStyle(ButtonStyle.Secondary),
                    bAuto
                );

                return msg.edit({
                    components: [row1, row2]
                });
            } else if (player.paused) {
                message.deferUpdate();
                
                await player.pause(false)
                return msg.edit({
                    components: [startrow1, startrow2]
                })
            }
        } else if (message.customId === "skip") {
            if (!player) {
                message.reply({ 
                    content: `\`❌\` | The player doesn't exist`, 
                    ephemeral: true 
                });
                collector.stop();
            } else if (!player || player.queue.size == 0) {
                const embed = new EmbedBuilder().setDescription(`\`❌\` | Queue is: \`Empty\``).setColor(default_color);
    
                return message.reply({ embeds: [embed], ephemeral: true });
            } else {
                await player.stop();
            }
        } else if (message.customId === "voldown") {
            if (!player) {
                message.reply({ 
                    content: `\`❌\` | The player doesn't exist`, 
                    ephemeral: true 
                });
                collector.stop();
            } else if (player.volume < 20) {
                await player.setVolume(10);

                const embed = new EmbedBuilder()
                .setDescription(`\`❌\` | Volume can't be lower than: \`10%\``)
                .setColor(default_color);

                return message.reply({ 
                    embeds: [embed], 
                    ephemeral: true 
                });
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
                text: `Loop: ${(player.loop).charAt(0).toUpperCase() + (player.loop).slice(1)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
            });

            await message.reply({ 
                embeds: [new EmbedBuilder().setDescription(`\`✔️\` | Volume decreased to : \`${player.volume}%\``).setColor(default_color)], 
                ephemeral: true 
            });

            return msg.edit({ embeds: [volEmbed] });
            }
        } else if (message.customId === "volup") {
            if (!player) {
                message.reply({ 
                    content: `\`❌\` | The player doesn't exist`, 
                    ephemeral: true 
                });
                collector.stop();
            } else if (player.volume > 140) {
                await player.setVolume(150);

                const embed = new EmbedBuilder()
                .setDescription(`\`❌\` | Volume can't be higher than: \`150%\``)
                .setColor(default_color);

                return message.reply({ 
                    embeds: [embed], 
                    ephemeral: true 
                });

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
                    text: `Loop: ${(player.loop).charAt(0).toUpperCase() + (player.loop).slice(1)} • Queue: ${player.queue.length} song(s) • Volume: ${player.volume}%`,
                });

            await message.reply({ 
                embeds: [new EmbedBuilder().setDescription(`\`✔️\` | Volume increased to : \`${player.volume}%\``).setColor(default_color)], 
                ephemeral: true 
            });

            return msg.edit({ embeds: [volEmbed] });
            }
        } else if (message.customId === "autoplay") {
            if (!player) {
                message.reply({ 
                    content: `\`❌\` | The player doesn't exist`, 
                    ephemeral: true 
                });
                collector.stop();
            } else if (!player.isAutoplay) {
                player.isAutoplay = true;

                const embed = new EmbedBuilder()
                    .setDescription(`\`♾\` |  Autoplay is now \`enabled\``)
                    .setColor(default_color);

                bAuto = new ButtonBuilder().setCustomId('autoplay').setEmoji('1286677681882136576').setStyle(ButtonStyle.Primary);

                const row1 = new ActionRowBuilder()
                    .addComponents(bPause, bReplay, bSkip, bLoop);
                const row2 = new ActionRowBuilder()
                    .addComponents(bStop, bVDown, bVUp, bAuto);

                await message.reply({
                    embeds: [embed],
                    ephemeral: true
                });

                return msg.edit({
                    components: [row1, row2]
                });
            } else {
                player.isAutoplay = false;

                const embed = new EmbedBuilder()
                    .setDescription(`\`♾\` |  Autoplay is now \`disabled\``)
                    .setColor(default_color);

                bAuto = new ButtonBuilder().setCustomId('autoplay').setEmoji('1286677681882136576').setStyle(ButtonStyle.Secondary);

                const row1 = new ActionRowBuilder()
                    .addComponents(bPause, bReplay, bSkip, bLoop);
                const row2 = new ActionRowBuilder()
                    .addComponents(bStop, bVDown, bVUp, bAuto);

                await message.reply({
                    embeds: [embed],
                    ephemeral: true
                });

                return msg.edit({
                    components: [row1, row2]
                });
            }
        }
    });
});