const { parseTimeString } = require("./utils/parseTimeString");
const { Spotify } = require("riffy-spotify");
require("dotenv").config();

module.exports = {
    clientOptions: {
        clientToken: process.env.CLIENT_TOKEN || "", // Your bot's token
        clientId: process.env.CLIENT_ID || "", // Your bot's id
        devId: process.env.DEV_ID?.split(",") || [""], // Your user id(s) for development purposes
        devGuild: process.env.DEV_GUILD?.split(",") || [""], // Your guild id(s) for development purposes
        mongoUri: process.env.MONGO_URI || "", // Your MongoDB URI
        embedColor: process.env.EMBED_COLOR || "", // Your embed hex code
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
            new Spotify({
                clientId: process.env.SPOTIFY_CLIENTID || "", // Your Spotify client id
                clientSecret: process.env.SPOTIFY_SECRET || "" // Your Spotify client secret
            })
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

    presence: { // Your bot's presence
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
                type: "CUSTOM",
            },
        ],
    },
}