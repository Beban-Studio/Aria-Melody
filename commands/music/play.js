const { 
	SlashCommandBuilder, 
	PermissionFlagsBits, 
	EmbedBuilder } = require("discord.js");
const { default_color } = require("../../config")
const { logger } = require("../../utils/logger");

module.exports = {
	data: new SlashCommandBuilder()
   	.setName("play")
   	.setDescription("Play a track/playlist")
    	.addStringOption(option => 
      	option.setName("query")
      	.setDescription("The song name/url")
      	.setRequired(true)
    	),

	run: async ({ interaction, client }) => {
   	if (!interaction.guild.members.me.permissionsIn(interaction.channel).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
   		return interaction.reply({ content: '\`❌\` | Bot can\'t access the channel your currently in\n\`⚠️\` | Please check Bot\`s permission on this server', ephemeral: true })
   	}
   	if (!interaction.guild.members.me.permissionsIn(interaction.member.voice.channel.id).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect])) {
      	return interaction.reply({ content: '\`❌\` | Bot can\'t connect to the voice channel your currently in\n\`⚠️\` | Please check Bot\`s permission on this server', ephemeral: true })
   	}
   	await interaction.deferReply();

   	logger(`</> /play used by ${interaction.user.tag} on ${interaction.guild} (${interaction.guildId})`, "info");
   	const query = interaction.options.getString("query");

   	const players = client.riffy.createConnection({
		defaultVolume: 50,
      	guildId: interaction.guild.id,
      	voiceChannel: interaction.member.voice.channel.id,
      	textChannel: interaction.channel.id,
      	deaf: true
   	})

   	const resolve = await client.riffy.resolve({ query: query, requester: interaction.member });
   	const { loadType, tracks, playlistInfo } = resolve;

   	if (loadType === "playlist") {
      	const embed = new EmbedBuilder()
      		.setColor(default_color)
        		.setDescription(`\`➕\` | **[${playlistInfo.name}](${query})** • ${interaction.member}`);
      	for (const track of resolve.tracks) {
         	track.info.requester = interaction.member;
         	players.queue.add(track);
      	}

      	await interaction.editReply({ embeds: [embed] });
      	if (!players.playing && !players.paused) return players.play();

   	} else if (loadType === "search" || loadType === "track") {
      	const track = tracks.shift();
      	const embed = new EmbedBuilder()
      		.setColor(default_color)
      		.setDescription(`\`➕\` | **[${track.info.title}](${track.info.uri})** • ${interaction.member}`);
        
      	track.info.requester = interaction.member;
      	players.queue.add(track);

      	await interaction.editReply({ embeds: [embed] });
      	if (!players.playing && !players.paused) return players.play();

   	} else {
      	return interaction.editReply(`\`❌\` | There were no results found for your query.`);
   	}
  	},
	options: {
		inVoice: true,
		sameVoice: true,
	}
};