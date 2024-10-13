require("dotenv").config();
/* 
FILL IN ALL THE REQUIRED INFO
*/
module.exports = {
    client_token: process.env.CLIENT_TOKEN || "", // REQUIRED The bot's Token
    client_id: process.env.CLIENT_ID || "", // REQUIRED The Bot's Id
    default_color: process.env.DEFAULT_COLOR || "", // REQUIRED The bot's default embed color code ( hex color code )
    mongodb_url: process.env.MONGO_URI || "", // REQUIRED Mongodb Url
    developers: process.env.DEV_ID || "", // REQUIRED Developer Id ( can be an array )
    support_server:  process.env.SUPPORT_SERVER || "", // REQUIRED Support Server Id
    defaultSearchPlatform: process.env.DEFAULT_SEARCH_PLATFORM || "spsearch", // REQUIRED ( this Can Be spsearch, ytsearch, ytmsearc, scsearch )
    nodes: [
        {
            name: "Lavalink v4",
            host: "node-us.beban.tech",
            port: 80,
            password: "dsc.gg/bebancommunity",
            secure: false,
            reconnectTimeout: 5000,
            reconnectTries: 15
        },
        /*
            CHECK OUT THE AVAILABLE LAVALINK SERVER ON https://uptime.beban.tech/status/servers
        */
    ],
    spotify: {
        clientId: "PUT_YOUR_SPOTIFY_ID_HERE", // https://developer.spotify.com/
        ClientSecret: "PUT_YOUR_SPOTIFY_SECRET_HERE" // https://developer.spotify.com/
    }
}