require("dotenv").config();

/* 
 * FILL IN ALL THE REQUIRED INFO
 * PLEASE FOR THE LOVE OF GOD DON'T SHARE YOUR API KEYS
 * AND ALSO FILL ALL THE INFORMATION BEFORE YOU ASK FOR HELP TO THE SUPPORT SERVER 
 */

module.exports = {

    /**
     * Client token | Used to login to the bot
     */
    client_token: process.env.CLIENT_TOKEN || "", 
    /**
     * Client ID | Used to check bot information and such
     */
    client_id: process.env.CLIENT_ID || "",
    /**
     * Default color | The default color of the bot's embeds
     */
    default_color: process.env.DEFAULT_COLOR || "",
    /**
     * Mongo URL | The mongodb url to store database information
     */
    mongodb_url: process.env.MONGO_URI || "",
    /**
     * Developer | The bot developer's id to use dev only command
     */
    developer_id: process.env.DEV_ID || "",
    /**
     * Developer guild | The bot development's guild id to use dev only command
     */
    developer_guild: process.env.DEV_GUILD || "",
    /**
     * Default search platform | The default search platform of the music feature ( This can be spsearch, ytsearch, ytmsearch, scsearch )
     */
    defaultSearchPlatform: process.env.DEFAULT_SEARCH_PLATFORM || "spsearch",

    /**
     * The lavalink nodes information
     * Check the available lavalink server on https://deployments.beban.tech
     */
    nodes: [
        {
            name: "Lavalink", // Don't change the name of the node if you don't know what you're doing
            host: "lava-v4.beban.tech", // The hostname of the lavalink server
            port: 80,  // The port of the lavalink server
            password: "bytebee_", // The password of lavalink server
            secure: false, // Does the lavalink server use secure connection
            autoResume: true // Just keep this as true
        },
    ],

    /**
     * The spotify client information for spotify source plugin
     */
    spotify: {
        ClientId: process.env.SPOTIFY_CLIENTID || "",
        ClientSecret: process.env.SPOTIFY_SECRET || ""
    },

    /**
     * The bot's presence setting
     */
    presence: {
		/**
		 * online, idle, dnd, invisible, ...
		 */
		status: "idle",
		activities: [
			{
				name: "{Guilds} servers",
				type: "WATCHING",
				data: (client) => {
					return {
						Guilds: client.guilds.cache.size,
					};
				},
			},
			{
				name: "Spotify",
				type: "LISTENING",
			},
            {
                name: "This bot is made by Beban Community🧡",
                type: "CUSTOM"
            }
		],
	},
}

/**
 * Aria Melody Source Code
 * Author : Juna
 * Inspired by Lunox, Sudhan's music bot, Riffy music bot, etc...
 * Feel free to edit this source code, but please leave some credit for the author
 */
