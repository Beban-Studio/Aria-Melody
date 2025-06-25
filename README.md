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
This branch is where new ideas and improvements are being tested and integrated. Here's a glimpse of what's been implemented or is being worked on:

-   🚀 **Hybrid Command Handling:** Full support for both Slash Commands (application commands) and traditional Message Commands (prefix-based).
-   🏗️ **Major Refactoring & Modernization:**
    -   Transitioned to **ES Modules (ESM)** from CommonJS for improved syntax and standards compliance.
    -   Enhanced project structure for better maintainability and scalability.
-   🛠️ **Advanced Utilities:**
    -   Developed a robust, configurable **logging utility** with daily log rotation, file size limits, console/file/webhook outputs, and caller info.
    -   Integrated **MongoDB (Mongoose)** for persistent data storage.
    -   Created data managers for guild-specific settings (e.g., `request-channel`, `247`, `control-button`) and global bot statistics (e.g., command counts, message counts).
-   🎼 **Music System Enhancements:**
    -   Continued integration with the latest **[Riffy](https://riffy.js.org) (`latest`)** for Lavalink interaction.
    -   (If applicable, mention specific music features you've added or are focusing on, like the "Dedicated Music Request Channel" if that's still a focus).
-   ⚙️ **Development Workflow:**
    -   Utilizing the latest development version of **[CommandKit](https://commandkit.dev) (`@dev`)** for command and event handling.
    -   CommandKit's logger is now piped through the custom logging utility for unified log management.
-   💡 And many more enhancements and experimental features!

### `📝` Developer Note
> "I want my code to at least look good if the function is bad or something."
>
> This branch also serves as a space to experiment with code style and organization. While functionality is key, readability and a clean codebase are also priorities here. (Indentation style: 2 spaces)

### `📍` Core Requirements (May change with development)
-   Node.js `v18.19.0+` / `v20.10.0+` / `v21.2.0+` or higher.
-   MongoDB `v5` or higher.
-   Spotify API credentials (if Spotify plugin for Riffy is used).
-   Lavalink server.
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
```dotenv
##########################################################
# RENAME THIS FILE TO .env AFTER FILLING THE INFORMATION #
# Lines starting with # are comments and will be ignored #
##########################################################

#------------------------------------#
# Discord Bot Configuration          #
#------------------------------------#
# Your bot's unique token (KEEP THIS SECRET!)
CLIENT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE

# Your bot's application ID (Client ID)
CLIENT_ID=YOUR_BOT_APPLICATION_ID_HERE

# Developer User IDs (comma-separated, no spaces, for development features/commands)
# Example: DEV_ID=123456789012345678,987654321098765432
DEV_ID=YOUR_USER_ID_HERE

# Development Guild IDs (comma-separated, no spaces, for instant command registration during development)
# Example: DEV_GUILD=112233445566778899,001122334455667788
DEV_GUILD=YOUR_DEVELOPMENT_GUILD_ID_HERE

#------------------------------------#
# MongoDB Configuration              #
#------------------------------------#
# Your MongoDB connection URI
# Example (local): mongodb://localhost:27017/AriaMelodyDB
# Example (Atlas): mongodb+srv://<username>:<password>@yourcluster.mongodb.net/yourDatabaseName?retryWrites=true&w=majority
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING_HERE

#------------------------------------#
# Embed & Links Configuration        #
#------------------------------------#
# Default hex color for embeds (e.g., Discord Blurple is 5865F2). Do NOT include the '#' symbol.
EMBED_COLOR=5865F2

# URL for your bot's voting page (e.g., top.gg)
VOTE_URL=https://top.gg/bot/YOUR_BOT_ID/vote

# Invite link to your bot's support server
SUPPORT_URL=https://discord.gg/YOUR_SERVER_INVITE_CODE

#------------------------------------#
# Logger Configuration (Optional)    #
#------------------------------------#
# Discord Webhook URL for sending logs (e.g., errors, warnings)
# Your config.js reads this as WEBHOOK_URL
WEBHOOK_URL=YOUR_DISCORD_WEBHOOK_URL_FOR_LOGS_HERE

#------------------------------------#
# Spotify API Configuration          #
# (Required for autocomplete option) #
#------------------------------------#
SPOTIFY_CLIENTID=YOUR_SPOTIFY_APPLICATION_CLIENT_ID_HERE
SPOTIFY_SECRET=YOUR_SPOTIFY_APPLICATION_CLIENT_SECRET_HERE

#------------------------------------#
# Riffy Music Configuration          #
#------------------------------------#
# Default search platform for music commands (e.g., spsearch, ytsearch, scsearch, amsearch, dzsearch)
# Defaults to "spsearch" in your config.js if this is not set.
DEFAULT_SEARCH_PLATFORM=spsearch
LOGGER_WEBHOOK_URL=YOUR_DISCORD_WEBHOOK_URL_FOR_LOGS
```
-   Build bot code assets using Commandkit@dev compiler:
```bash
npm run build
```
-   Start the bot in development mode (usually with hot-reloading via CommandKit):
```bash
npm run dev
```
-   Or start for production (after you've ran `npm run build`):
```bash
npm start
```

<details>
<summary>Aria Melody Lavalink v3 Configuration (If testing legacy support)</summary>

On `config.js` (or your Riffy configuration area) change the following:
```diff
    riffyOptions: {
        leaveTimeout: parseTimeString("1m"), // Ensure parseTimeString is available or use ms
-       restVersion: "v4",
+       restVersion: "v3",
        reconnectTries: Infinity,
        reconnectTimeout: parseTimeString("6s"), // Ensure parseTimeString is available or use ms
        defaultSearchPlatform: process.env.DEFAULT_SEARCH_PLATFORM || "spsearch",
        plugins: [
            new Spotify({ // Ensure Spotify plugin is correctly imported and configured
                clientId: process.env.SPOTIFY_CLIENTID || "",
                clientSecret: process.env.SPOTIFY_SECRET || ""
            })
        ],
    },
```
(The diffs for `play.js` and `pl-addSong.js` for Lavalink v3 load types seem fine as they are.)

</details>

## Contributors
Contributions to the `dev` branch are welcome, especially for testing and iterating on upcoming features! Please fork this `dev` branch and make pull requests against it. For suggestions or bug reports related to development, use the [Beban Community](https://discord.gg/9eCgpGuZAa) server, making sure to specify you're referring to the `dev` branch.

<a href="https://github.com/Beban-Studio/Aria-Melody/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=beban-studio/aria-melody" />
</a>
