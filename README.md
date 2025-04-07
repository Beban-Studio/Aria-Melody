<img src="Aria Melody.svg" />

---

<p align="center">
  <strong>Advance Discord music bot using Riffy Lavalink Client and CommandKit.</strong>
  </p>

<p align="center">
    <a href="https://github.com/BebanCode/Aria-Melody"><b>Github</b></a> •
    <a href="https://discord.gg/9eCgpGuZAa"><b>Support</b></a>
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/commandkit"><img src="https://img.shields.io/badge/CommandKit-@0.1.10-purple"/>
  <a href="https://www.npmjs.com/package/riffy"><img src="https://img.shields.io/badge/Riffy-@15b650b-blue"/>
</div>
<p align="center"> 
  <a href="https://discord.gg/9eCgpGuZAa" target="_blank"> <img src="https://discordapp.com/api/guilds/1215235509958479894/widget.png?style=banner2"/> </a>
</p>

#

### `📢` Top Features
-   🎻 Using **[Riffy](https://www.npmjs.com/package/riffy) `@15b650b`** Lavalink Client
-   🌊 Support Lavalink v3 & v4 Connection
-   🍸️ Slash Command
-   🎵 Music System
-   📦 Playlist System
-   🎙️ Lots of Sound Filters
-   💺 24/7 in Voice Channel
-   🔎 AutoPlay [**Support Youtube, Spotify, Soundcloud**]
-   🫧 Clean UI
-   🏆️ Easy to Use
-   And Many More...!

### `🎵` Available Lavalink
**Version 4.0.8 | Hosted by [BebanCode](https://github.com/BebanCode)**
```yml
Host : lavalink.beban.tech
Port : 80
Pass : bytebee_
Region : US, Utah, Salt Lake City
Secure : false
Plugins :
  - sponsorblock-plugin
  - youtube-plugin
  - duncteBot-plugin
  - java-lyrics-plugin
  - lavalyrics-plugin
  - lavasrc-plugin
```

### `📍` Requirements
-   Node.js `v16` or higher
-   MongoDB `v5` or higher
-   Spotify API credentials
-   Lavalink server [**[Check above](https://github.com/Beban-Studio/Aria-Melody#available-lavalink)**]

### `⚙` Configuration & Installation
-   Clone this repository.
```
https://github.com/Beban-Studio/Aria-Melody.git
```
-   Open the main folder then install all the package.
```
npm install
```
-   Rename `.env.example` to `.env` and fill out these variables according to yours.
```
##########################################################
# RENAME THIS FILE TO .env AFTER FILLING THE INFORMATION #
##########################################################

# Discord Bot Configuration
CLIENT_TOKEN=YOUR_BOT_TOKEN_HERE
CLIENT_ID=YOUR_BOT_ID_HERE
DEV_ID=YOUR_DEV_USER_ID_HERE,ANOTHER_DEV_USER_ID_HERE # Comma-separated if multiple
DEV_GUILD=YOUR_DEV_GUILD_ID_HERE,ANOTHER_DEV_GUILD_ID_HERE # Comma-separated if multiple

# MongoDB Configuration
MONGO_URI=YOUR_MONGODB_URI_HERE

# Embed Color
EMBED_COLOR=7289DA # Example hex color for embeds without the # hasign

# Spotify Configuration
SPOTIFY_CLIENTID=YOUR_SPOTIFY_CLIENT_ID_HERE
SPOTIFY_SECRET=YOUR_SPOTIFY_CLIENT_SECRET_HERE

# Default Search Platform
DEFAULT_SEARCH_PLATFORM=spsearch # Default search platform, can be changed as needed
```
-   Starts the bot by running
```
npm run deploy
```
You only need to run this command once to deploy and flush all the command from the bot the bot, you can start it  after that by running `npm start` or `node Aria.js`

<details>
<summary>Aria Melody Lavalink v3 Configuration</summary>

On `config.js` change the following:
```diff
    riffyOptions: {
        leaveTimeout: parseTimeString("1m"), 
-       restVersion: "v4", 
+       restVersion: "v3", 
        reconnectTries: Infinity, 
        reconnectTimeout: parseTimeString("6s"), 
        defaultSearchPlatform: process.env.DEFAULT_SEARCH_PLATFORM || "spsearch", 
        plugins: [
            new Spotify({
                clientId: process.env.SPOTIFY_CLIENTID || "",
                clientSecret: process.env.SPOTIFY_SECRET || "" 
            })
        ],
    },
```

On `play.js` change the following:
```diff
-	  if (loadType === "playlist") {
+     if (loadType === 'PLAYLIST_LOADED') {

			for (const track of resolve.tracks) {
				track.info.requester = interaction.member;
				player.queue.add(track);
			}

			await interaction.editReply({ embeds: [embed.setDescription(`\`➕\` | **[${playlistInfo.name}](${query})** • \`${tracks.length}\` Track(s) • ${interaction.member}`)] });
			if (!player.playing && !player.paused) return player.play();

-		} else if (loadType === "search" || loadType === "track") {
+       } else if (loadType === 'SEARCH_RESULT' || loadType === 'TRACK_LOADED') {
			const track = tracks.shift();
				
			track.info.requester = interaction.member;
			player.queue.add(track);

			await interaction.editReply({ embeds: [embed.setDescription(`\`➕\` | **[${track.info.title}](${track.info.uri})** • ${interaction.member}`)] });
			if (!player.playing && !player.paused) return player.play();

		} else {
			return interaction.editReply({ embeds: [embed.setDescription("\`❌\` | There were no results found for your query.")] });
		}
  	},
```

On `pl-addSong.js` change the following:
```diff
  try {
    // ... (rest of the code remains the same)
-    if (loadType === "playlist") {
+    if (loadType === "PLAYLIST_LOADED") {
      const songsToAdd = resolve.tracks.map(track => ({
        url: track.info.uri,
        title: track.info.title,
        artist: track.info.author,
        time: track.info.length
      }));
      // ... (rest of the code remains the same)
-    } else if (loadType === "search" || loadType === "track") {
+    } else if (loadType === "search" || loadType === "track") {
      const track = tracks.shift();
      const song = { 
        url: track.info.uri, 
        title: track.info.title, 
        artist: track.info.author,
        time: track.info.length
      };
      // ... (rest of the code remains the same)
     }
```
</details>



## Contributors
We really appreciated if any of you can contribute to this project. To contribute to this project you can fork this repository and make a pull request, we will gladly check it out. If you have any suggestion or want to report any bug you can join this server: [Beban Community](https://discord.gg/9eCgpGuZAa)

<a href="https://github.com/Beban-Studio/Aria-Melody/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=beban-studio/aria-melody" />
</a>