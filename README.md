<img src="Aria Melody.svg" />

---

<p align="center">
  <strong style="color:orange; font-size:1.2em;">⚠️ Note: You are viewing the README for the <code>dev</code> branch. This is a development playground for Aria Melody. Expect experimental features, potential instability, and ongoing changes. For the stable version, please see the <code>master</code> branch.</strong>
</p>

---

<p align="center">
  <strong>Development Branch for Aria Melody - Advance Discord music bot.</strong>
</p>

<p align="center">
    <a href="https://github.com/Beban-Studio/Aria-Melody/tree/master"><b>Stable Branch (master)</b></a> •
    <a href="https://discord.gg/9eCgpGuZAa"><b>Support</b></a>
</p>

<p align="center">
  <a href="https://discord.gg/9eCgpGuZAa" target="_blank"> <img src="https://discordapp.com/api/guilds/1215235509958479894/widget.png?style=banner2"/> </a>
</p>

#

### `🚧` Upcoming Features & Focus for `dev`
This branch is where new ideas and improvements are being tested. Here's a glimpse of what's being worked on or planned:

-   🚀 Implementing hybrid command handling (Slash & Message Commands).
-   🏗️ Major refactoring for a better, more maintainable project structure.
-   🎼 Dedicated Music Request Channel feature.
-   🛠️ Utilizing the latest development version of **[CommandKit](https://www.npmjs.com/package/commandkit) (`@dev`)**.
-   ✨ Integrating the newest updates from **[Riffy](https://www.npmjs.com/package/riffy) (`latest`)**.
-   ✅ Sticking with CommonJS for now.
-   💡 And many more enhancements and experimental features!

### `📝` Developer Note
> "I want my code to at least look good if the function is bad or something."
>
> This branch also serves as a space to experiment with code style and organization. While functionality is key, readability and a clean codebase are also priorities here.

### `📍` Core Requirements (May change with development)
-   Node.js `v18` or higher
-   MongoDB `v5` or higher
-   Spotify API credentials
-   Lavalink server [**[Check above](https://github.com/Beban-Studio/Aria-Melody/tree/dev#available-lavalink-for-testing)**]
-   **Note for `dev` branch:** Ensure compatibility with `commandkit@dev` and the latest `riffy` version, which might have different or newer requirements as development progresses.

### `⚙` Configuration & Installation (for `dev` branch)
-   Clone the `dev` branch of this repository:
```bash
git clone https://github.com/Beban-Studio/Aria-Melody.git -b dev
cd Aria-Melody
```
-   Install dependencies (this will include `commandkit@dev` and latest `riffy` as per `package.json`):
```bash
npm install
```
-   Rename `.env.example` to `.env` and fill out the variables:
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
-   Deploy commands (run once):
```bash
npm run deploy
```
-   Start the bot:
```bash
npm start
```
(or `node Aria.js`)

<details>
<summary>Aria Melody Lavalink v3 Configuration (If testing legacy support)</summary>

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
Contributions to the `dev` branch are welcome, especially for testing and iterating on upcoming features! Please fork this `dev` branch and make pull requests against it. For suggestions or bug reports related to development, use the [Beban Community](https://discord.gg/9eCgpGuZAa) server, making sure to specify you're referring to the `dev` branch.

<a href="https://github.com/Beban-Studio/Aria-Melody/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=beban-studio/aria-melody" />
</a>