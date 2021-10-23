const { SlashCommandBuilder } = require("@discordjs/builders");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            aliases: ["channelsdinamics"],
            category: "Canales de interacion",
            description: "Crea las categorias y canales necesarios para las reacciones y configuración",
            usage: "[ping]",
            options: [
                {
                    name: "title",
                    description: "Titulo del embed",
                    type: "STRING",
                    required: true,
                },
            ]
        });
    }

    async execute(interaction, args) {
        const [title] = args
        console.log(args)
        interaction.editReply('Creado')
    }
}
