const _0x13cf03=_0x5ebe;function _0x51eb(){const _0x450828=['colors','4238479gtlWdb','306235YMWABP','264555twQCGU','245388OgprCF','18EMEioa','log','3545160enVpUB','blue','568oXBWVj','\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20█████\x20\x20██████\x20\x20██\x20\x20█████\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20██\x20\x20\x20██\x20██\x20\x20\x20██\x20██\x20██\x20\x20\x20██\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20███████\x20██████\x20\x20██\x20███████\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20██\x20\x20\x20██\x20██\x20\x20\x20██\x20██\x20██\x20\x20\x20██\x0a┏╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾┓\x0a┃\x20\x20\x20\x20\x20\x20\x20\x20\x20</>\x20All\x20rights\x20reserved\x20to\x20Beban\x20Community\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20┃\x0a┃\x20\x20\x20\x20*Please\x20respect\x20our\x20work\x20by\x20not\x20removing\x20the\x20credits\x20\x20\x20\x20\x20\x20┃\x0a┗╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾╾┛','48002PZDMqt','113956EfYsvA'];_0x51eb=function(){return _0x450828;};return _0x51eb();}function _0x5ebe(_0x3185d4,_0x96591c){const _0x51eb1a=_0x51eb();return _0x5ebe=function(_0x5ebe05,_0x589ae4){_0x5ebe05=_0x5ebe05-0xfe;let _0x24691e=_0x51eb1a[_0x5ebe05];return _0x24691e;},_0x5ebe(_0x3185d4,_0x96591c);}(function(_0x29eb73,_0x3b0172){const _0x154840=_0x5ebe,_0x36f7f8=_0x29eb73();while(!![]){try{const _0x35084c=parseInt(_0x154840(0x103))/0x1*(-parseInt(_0x154840(0x109))/0x2)+-parseInt(_0x154840(0x102))/0x3+parseInt(_0x154840(0x10a))/0x4+-parseInt(_0x154840(0x100))/0x5+-parseInt(_0x154840(0x105))/0x6+-parseInt(_0x154840(0xff))/0x7+parseInt(_0x154840(0x107))/0x8*(parseInt(_0x154840(0x101))/0x9);if(_0x35084c===_0x3b0172)break;else _0x36f7f8['push'](_0x36f7f8['shift']());}catch(_0x5845c0){_0x36f7f8['push'](_0x36f7f8['shift']());}}}(_0x51eb,0x54034));const colors=require(_0x13cf03(0xfe));console[_0x13cf03(0x104)](colors[_0x13cf03(0x106)](_0x13cf03(0x108)));
const { 
defaultSearchPlatform,
clientSecret,
client_token, 
mongodb_url, 
developers, 
clientId,
nodes
} = require("./config");
const { Client, GatewayIntentBits, GatewayDispatchEvents } = require("discord.js");
const { CommandKit } = require("commandkit");
const { Spotify } = require("riffy-spotify");
const { logger } = require("./utils/logger")
const { Riffy } = require("riffy");
const path = require("path");

// CREATING DISCORD CLIENT
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
});

// CREATING COMMAND & EVENT HANDLER ( COMMANDKIT )
new CommandKit({
    client,
    commandsPath: path.join(__dirname, "commands"),
    eventsPath: path.join(__dirname, "./events/botEvents"),
    validationsPath: path.join(__dirname, "validations"),
    devUserIds: developers,
    skipBuiltInValidations: true,
    bulkRegister: true,
});

// CREATING RIFFY CLIENT
const spotify = new Spotify({clientId,clientSecret});
client.riffy = new Riffy(client, nodes, {
    send: (payload) => {
        const guild = client.guilds.cache.get(payload.d.guild_id);
        if (guild) guild.shard.send(payload);
    },
    defaultSearchPlatform,
    reconnectTries: 15,
    restVersion: "v4",
    plugin: [spotify]
});

// LOGIN TO THE BOT
client.login(client_token);
client.on("raw", (d) => {
    if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate,].includes(d.t)) return;
    client.riffy.updateVoiceState(d);
});

async () => {
    await load_riffy()
    await load_db()
}

// FUNCTION TO LOAD MONGODB 
async function load_db() {
    await connect(mongodb_url)
    .then(() => {
        logger(`Successfully connected to MongoDB!`, "debug");
    })
    .catch((err) => {
        logger(`Error: ${err}`, "error" );
    });
}

// FUNCTION TO INITIATE RIFFY CLIENT
async function load_riffy() {
    logger("Initiating Riffy Events", "warn")

    readdirSync('./events/riffyEvents').forEach(async dir => {
        const lavalink = readdirSync(`./events/riffyEvents/${dir}`).filter(file => file.endsWith('.js'));

        for (let file of lavalink) {
            try {
                let pull = require(`./events/riffyEvents/${dir}/${file}`);

                if (pull.name && typeof pull.name !== 'string') {
                    console.log(`Couldn't load the riffy event ${file}, error: Property event should be string.`)
                    continue;
                }
            } catch (err) {
                logger(`Couldn't load the riffy event ${file}, error: ${err}`, "error")
                console.log(err)
                continue;
            }
        }
    });
}
module.exports = client;