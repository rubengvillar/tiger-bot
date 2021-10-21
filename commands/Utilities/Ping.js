const { SlashCommandBuilder } = require("@discordjs/builders");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            aliases: ["pong"],
            category: "Utilidad",
            usage: "[ping]",
            data: new SlashCommandBuilder()
                .setName('ping')
		        .setDescription('Muestra mi tiempo de respuesta. Espero este bien.')
        });
    }

    async execute(interaction) {
        interaction.reply({ content: "Pinging..." })
            .then(() => new Date())
            .then(async timing => {
                await interaction.editReply({content: 'Comprobando...' })
                return new Date() - timing
            })
            .then(latency => {
                const choices = [
                    "¿Es este realmente mi ping?",
                    "¿Esta bien? ¡No puedo mirar!",
                    "¡Espero que no esté mal!",
                ];
                const response = choices[Math.floor(Math.random() * choices.length)];
                interaction.editReply({
                    content: `${response},Bot Latency: \`${latency}ms\`, API latency: \`${Math.round(
                        this.client.ws.ping
                    )}ms\``
                }
                );
            })

        
    }
};
