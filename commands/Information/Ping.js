const { SlashCommandBuilder } = require("@discordjs/builders");
const getLocale = require("../../helpers/translate/getLocale");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            category: "Información",
            usage: "[ping]",
            description: "Muestra el ping del bot y la api de discord"
        });
    }

    async execute(interaction) {
        const translate = getLocale({
            interaction,
            client: this.client
        })

        interaction
            .editReply({ content: translate('ping.load') })
            .then(() => new Date())
            .then(async timing => {
                await interaction.editReply({content: translate('ping.checking') })
                return timing
            })
            .then(timing => new Date() - timing)
            .then(latency => {
                const choices = [
                    () => translate('ping.response.one'),
                    () => translate('ping.response.two'),
                    () => translate('ping.response.three'),
                ];
                const response = choices[Math.floor(Math.random() * choices.length)]();
                return interaction.editReply(
                    `${response}, Bot Latency: \`${latency}ms\`, API latency: \`${Math.round(
                        this.client.ws.ping
                    )}ms\``
                
                );
            })
            .catch(console.error)

        
    }
};
