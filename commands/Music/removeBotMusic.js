const { Permissions } = require('discord.js')
const { SlashCommandBuilder } = require("@discordjs/builders");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            category: "Musica",
            usage: "[addbotmusica]",
            description: "Quitar un bot de musica de la lista.",
            options: [{
                name: "bot",
                description: "Seleccione un bot",
                type: "USER",
                required: true
            }],
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD,
            ]
        });
    }

    async execute(interaction, [ botId ]) {
        const bot = await interaction.guild.members.cache.get(botId)

        if (!bot.user.bot) return interaction.editReply('🎶 Deberias mensionar un bot de musica.');

        return this.client.database.collection('guilds').doc(interaction.guild.id)
            .collection('musicBots').doc(botId).delete()
                .then(()=> {
                    return interaction.editReply(`El bot fue removido con exito: <@${botId}>`)
                });
    }
};
