const { Permissions } = require('discord.js')
const { SlashCommandBuilder } = require("@discordjs/builders");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            category: "Music",
            usage: "/removebotmusic",
            description: "Quitar un bot de musica de la lista.",
            options: [{
                name: "botid",
                description: "Seleccione un bot",
                type: "USER",
                required: true
            }],
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD,
            ]
        });
    }

    async execute(interaction, { botid }) {
        const bot = await interaction.guild.members.cache.get(botid)

        if (!bot.user.bot) return interaction.editReply('🎶 Deberias mensionar un bot de musica.');

        return this.client.database.collection('guilds').doc(interaction.guild.id)
            .collection('musicBots').doc(botid).delete()
                .then(()=> {
                    return interaction.editReply(`El bot fue removido con exito: <@${botid}>`)
                })
                .catch(err => interaction.editReply(`${err}`));
    }
};
