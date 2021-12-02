const { Client, Collection, Intents } = require("discord.js");
const Utils = require("./Utils");
const store = require("../redux/store");
const firebase = require("../data/firebase");
module.exports.Bot = class Bot extends (
    Client
) {
    constructor(token = "") {
        super({
            disableMentions: "everyone",
            intents: 32767
        });
        
        this.validate(token);
        this.events = new Collection();
        this.utils = new Utils(this);
        this.globalCommands = new Collection();
        this.aliases = new Collection();
        this.utils.loadEvents()
        this.utils.loadCommands()
        this.store = store
        this.database = firebase
    }

    validate(token) {
        if (typeof token !== "string")
            throw new TypeError("El token no es un string");

        if (!token) throw new Error("Debe pasar el token para el cliente.");
        this.token = token;
    }

    async start(token = this.token) {
        await super.login(token);
        await this.utils.loadGuilsInfo();
    }
}
