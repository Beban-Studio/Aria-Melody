require("dotenv").config();
/* 
FILL IN ALL THE REQUIRED INFO

*/
module.exports = {
    client_token: process.env.CLIENT_TOKEN || "", // REQUIRED The bot's Token
    client_id: process.env.CLIENT_ID || "", // REQUIRED The Bot's Id
    default_color: process.env.DEFAULT_COLOR || "", // THE BOT'S DEFAULT EMBED COLOR ( HEX COLOR CODE )
    mongodb_url: process.env.MONGO_URI || "", // REQUIRED Mongodb Url
    developers: process.env.DEV_ID || "", // REQUIRED Developer Id
    defaultSearchPlatform: process.env.DEFAULT_SEARCH_PLATFORM || "spsearch", // REQUIRED ( This Can Be spsearch, ytsearch, ytmsearc, scsearch )
    nodes: [
        {
            name: "Lavalink v4",
            host: "5.255.104.252",
            port: 2233,
            password: "LittleStar42",
            secure: false
        },
        /*
        {
            DEAD
            name: "Lavalink v3",
            host: "node-v3.beban.tech",
            port: 80,
            password: "discord.gg/codersplanet",
            secure: false
        },
        */
    ],
    spotify: {
        clientId: "PUT_YOUR_SPOTIFY_ID_HERE", // https://developer.spotify.com/
        ClientSecret: "PUT_YOUR_SPOTIFY_SECRET_HERE" // https://developer.spotify.com/
    }
}