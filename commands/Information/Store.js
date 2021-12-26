const { SlashCommandBuilder } = require("@discordjs/builders");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            aliases: ["pong"],
            category: "Información",
            usage: "[ping]",
            description: "Muestra el ping del bot y la api de discord"
        });
    }

    async execute(interaction) {
        console.log(this.client.store.getState().interactionChannels)
    }
};
