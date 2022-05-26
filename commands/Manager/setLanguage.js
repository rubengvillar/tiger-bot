const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed, Permissions } = require("discord.js");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            category: "Manager",
            usage: "/setlanguage",
            description: "Configura el lenguaje de respuesta del bot en el servidor.",
            options: [{
                name: "language",
                description: "Seleccione el lenguaje",
                type: "STRING",
                choices: [
                    {
                        name: 'English',
                        value: 'en'
                    },
                    {
                        name: 'Spanish',
                        value: 'es-ES'
                    },
                ],
                required: true
            }],
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD,
            ],
            default_permission: true
        });
    }

    async execute(interaction, {language} ) {
        return this.client.database.collection('guilds').doc(interaction.guild.id).update({
            guildLocale: language
        })
        .then(()=> {
            return interaction.editReply({
                content: `${interaction.user}`,
                embeds: [new MessageEmbed()
                    .setTitle('El idioma fue actualizado.')
                    .setDescription(`Ahora respondere en: ${language}`)
                    .setFooter(`Solicitado por: ${interaction.user.username}#${interaction.user.discriminator}`)
                    .setColor('GREEN')]
            });
        })
    }
}
