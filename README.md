<img src="Aria Melody.svg" />

---

<p align="center">
  <strong>Aria Melody is a simple music bot which is made using Riffy package</strong>
  </p>

<p align="center">
    <a href="https://github.com/BebanCode/Aria-Melody"><b>Github</b></a> •
    <a href="https://discord.gg/9eCgpGuZAa"><b>Support</b></a>
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/riffy"><img src="https://img.shields.io/badge/Riffy-@866c6d9-blue" />
</div>
<p align="center"> 
  <a href="https://discord.gg/9eCgpGuZAa" target="_blank"> <img src="https://discordapp.com/api/guilds/1215235509958479894/widget.png?style=banner2"/> </a>
</p>

#

## Top Features
-   🎻 Using **[Riffy](https://www.npmjs.com/package/riffy) `@866c6d9`** Lavalink Client
-   🌊 Support Lavalink v3 & v4 Connection
-   🍸️ Slash Command
-   🎵 Music System
-   🎙️ Lots of Sound Filters
-   💺 24/7 in Voice Channel
-   🔎 AutoPlay **[ Support Youtube, Spotify, Soundcloud ]**
-   🫧 Clean UI
-   🏆️ Easy to Use
-   And Many More...!

> [!IMPORTANT]
> If you want to use lavalink v3 configuration, please read more on the riffy docs about it [Riffy Docs](https://riffy.js.org/basics/usage)

<details>
<summary>Aria Melody Lavalink v3 Configuration</summary>

On Aria.js `line 53` change the rest version to `v3`
```diff
client.riffy = new Riffy(client, config.nodes, {
    send: (payload) => {
        const guild = client.guilds.cache.get(payload.d.guild_id);
        if (guild) guild.shard.send(payload);
    },
    defaultSearchPlatform: config.defaultSearchPlatform,
    reconnectTries: 15,
-   restVersion: "v4",
+   restVersion: "v3",
    plugin: [spotify]
});
```

On command/commands/music/play.js line 47-65
```diff
- if (loadType === "playlist") {
+ if (loadType === 'PLAYLIST_LOADED') {
			for (const track of resolve.tracks) {
				track.info.requester = interaction.member;
				player.queue.add(track);
			}

			await interaction.editReply({ embeds: [embed.setDescription(`\`➕\` | **[${playlistInfo.name}](${query})** • ${tracks.length} Track(s) • ${interaction.member}`)] });
			if (!player.playing && !player.paused) return player.play();

- } else if (loadType === "search" || loadType === "track") {
+ } else if (loadType === 'SEARCH_RESULT' || loadType === 'TRACK_LOADED') {
			const track = tracks.shift();
				
			track.info.requester = interaction.member;
			player.queue.add(track);

			await interaction.editReply({ embeds: [embed.setDescription(`\`➕\` | **[${track.info.title}](${track.info.uri})** • ${interaction.member}`)] });
			if (!player.playing && !player.paused) return player.play();

		}
```
</details>

## Available Lavalink
### Hosted by @[herjuna](https://discord.gg/9eCgpGuZAa)
**Version 4.0.8** <br />
```bash
Host : lavalink.beban.tech
Port : 80
Pass : bytebee_
Region : US, Utah
Secure : false
```

## Requirements
-   Basic understanding in **discord.js**
-   Node.js v16.x or higher ( I recommend LTS version v20.x )
-   A working lavalink server checkout the available lavalink servers above
-   Spotify API credentials (for searching tracks)
-   Stable Connection ( If you want to use this for production )

> [!TIP]
> You can run the bot without flushing the command every start by using `node Aria.js`or `npm start`

## Installlation
-   Clone this repository
-   Install the required packages by running `npm install` or `yarn install`
-   Find a file named `config.js` and add your bot token and other required information
-   Starts the bot using `npm run deploy`

## Contributors
We really appreciated if any of you can contribute to this project. To contribute to this project you can fork this repository and make a pull request, we will gladly check it out. If you have any suggestion or want to report any bug you can join this server: [Beban Community](https://discord.gg/9eCgpGuZAa)

<a href="https://github.com/Beban-Studio/Aria-Melody/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=beban-studio/aria-melody" />
</a>
