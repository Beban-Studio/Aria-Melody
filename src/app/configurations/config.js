import { parseTimeString } from "../utils/time"; 

const config = {
  clientOptions: {
    clientToken: process.env.CLIENT_TOKEN || "", // Your bot's token
    clientId: process.env.CLIENT_ID || "", // Your bot's id
    devId: process.env.DEV_ID?.split(",") || [""], // Your user id(s) for development purposes
    devGuild: process.env.DEV_GUILD?.split(",") || [""], // Your guild id(s) for development purposes
    mongoUri: process.env.MONGO_URI || "", // Your MongoDB URI
    webhookUrl: process.env.WEBHOOK_URL || "", // Your webhook URL
    embedColor: process.env.EMBED_COLOR || "", // Your embed hex code

    voteUrl: process.env.VOTE_URL || "", // Your vote URL
    supportUrl: process.env.SUPPORT_URL || "", // Your support server URL
    },

  spotify: {
    clientId: process.env.SPOTIFY_CLIENTID || "", // Your Spotify client id
    clientSecret: process.env.SPOTIFY_SECRET || "" // Your Spotify client secret
  },

  riffyOptions: {
    leaveTimeout: parseTimeString("15s"), // How long the bot will wait before leaving a voice channel when empty/queueEnd, default 1 minute
    restVersion: "v4", // The REST version of lavalink you want to use
    reconnectTries: Infinity, // How many times to try reconnecting to lavalink
    reconnectTimeout: parseTimeString("6s"), // How long to wait before reconnecting to lavalink, default 6 seconds
    defaultSearchPlatform: process.env.DEFAULT_SEARCH_PLATFORM || "spsearch", // Default search platform
    plugins: [
      /* Nothing to see here (^_^) */
    ],
  },

  riffyNodes: [
    {
      name: "Lavalink", // The name of the node
      host: "lavalink.beban.tech", // The hostname of the lavalink server
      port: 80,  // The port of the lavalink server
      password: "bytebee_", // The password of lavalink server
      secure: false, // Does the lavalink server use secure connection
    },
  ],

  presence: { 
    status: "idle", // online, idle, dnd, invisible
    activities: [
      {
      	name: "{Guilds} servers",
        type: "WATCHING", 
				/** PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM_STATUS, COMPETING
				 *  For dynamic data in presence, this function will be called by your presence update logic
				 *  You'll need to pass the 'client' object to it when you set the presence.
				 */
        data: (client) => {
          return { Guilds: client.guilds.cache.size };
        },
      },
			{
        name: "Spotify",
        type: "LISTENING",
      },
      {
      	name: "This bot is made by Beban Community🧡",
        type: "CUSTOM_STATUS", 
            },
        ],
    },
};

export default config;

/**
  * Aria Melody Source Code
  * Author : Juna
	* Organization : Beban Studio
  * Inspired by Lunox, Sudhan's music bot, Soundy, etc...
  * Modifying this this code without permission is not allowed
	* Contact us: https://discord.gg/9eCgpGuZAa
  */