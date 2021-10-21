const { Client, Collection, Intents } = require("discord.js");
const Utils = require("./Utils");
module.exports.Bot = class Bot extends (
    Client
) {
    constructor(token = "") {
        super({
            disableMentions: "everyone",
            intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
            partials: ['MESSAGE', 'CHANNEL', 'REACTION']
        });
        
        this.validate(token);
        this.events = new Collection();
    }

    validate(token) {
        if (typeof token !== "string")
            throw new TypeError("El token no es un string");

        if (!token) throw new Error("Debe pasar el token para el cliente.");
        this.token = token;
        this.utils = new Utils(this);
        this.commands = new Collection();
        this.aliases = new Collection();
    }

    async start(token = this.token) {
        this.utils.loadEvents()
            .then(()=> {
                return super.login(token);
            })
            .then(() => {
                return this.utils.loadCommands();
            })
    }
}