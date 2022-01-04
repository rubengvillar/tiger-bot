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
            description: "Añade bot de musica.",
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
        if (!bot.user.bot)
            return interaction.editReply('🎶 Deberias mensionar un bot de musica.');

        const musicBot = {
            name: bot.user.username,
            nickname: bot.nickname,
            discriminator: bot.user.discriminator,
            avatar: bot.user.avatar,
            bot: bot.user.bot
        };

        this.client.database.collection('guilds').doc(interaction.guild.id)
            .collection('musicBots').doc(botId).set(musicBot)
                .then(()=> {
                    return interaction.editReply(`El bot fue agregado con exito: <@${botId}>`)
                });
    }
};
