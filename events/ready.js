
const loaderInteractionChannels = require("../helpers/loaderInteractionChannels");
const loaderTempChannels = require("../helpers/loaderTempChannels");
const Event = require("../Structures/Event");

module.exports = class extends (
    Event
) {
    constructor(...args) {
        super(...args, {
            once: true,
        });
    }

    async run() {
        console.log(
            [
                `Loaded ${this.client.globalCommands.size} commands!`,
                `Loaded ${this.client.events.size} events!`,
                `Logged in as ${this.client.user.tag}`,
            ].join("\n")
        );

        let activities = [
            () => `${this.client.guilds.cache.size} servidores!`,
            () => `${this.client.channels.cache.size} canales!`,
            () => `${this.client.guilds.cache.reduce(
                (a, b) => a + b.memberCount,
                0
            )} usuarios!`,
        ];

        let i = 0;
        setInterval(
            () =>
                {

                this.client.user.setActivity(
                    `${activities[i++ % activities.length]()}`,
                    { type: "WATCHING" }
                )},
            15000
        );

        // this.client.utils.loadSugestions();
        // // LoaderReactionVoices
        // await this.client.utils.createGuilds(this.client.guilds);
        loaderInteractionChannels(this.client)
        loaderTempChannels(this.client)
    }
};
