const { MessageEmbed, MessageSelectMenu, MessageActionRow, Permissions } = require("discord.js");
const getLocale = require("../../helpers/translate/getLocale");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            description: "Muestra una lista de bots para saber si estan conectados a un canal de voz.",
            category: "Music",
            usage: "[music]",
            default_permission: true
        });
    }

    async execute(interaction) {
        const translate = getLocale(interaction, this.client)

        const messageEmbed = new MessageEmbed()
        .setTitle(translate('music.bots.title'))
        .setImage('https://firebasestorage.googleapis.com/v0/b/tigerbot-42285.appspot.com/o/images%2FMusicLogo.png?alt=media&token=0621c87c-d84e-409a-9411-7e478e6ca413')
        .setFooter(`Solicitado por ${interaction.user.tag}`,
        interaction.user.displayAvatarURL({ dynamic: true }))
        .setColor('#F4D03F')
        .setTimestamp()
        .addField('Añadir/quitar bot: ', 'Utiliza el comando `/addBotMusic` o `/removeBotMusic`')
        let description = ''
       this.client.database.collection('guilds').doc(interaction.guild.id).collection('musicBots').orderBy('nickname').get()
        .then(async queryBots => {
            if (queryBots.empty) {
                messageEmbed.setDescription('No tenemos registrados bots actualmente.')
                return interaction.editReply({
                    content: `${interaction.user}`,
                    embeds: [messageEmbed]
                });
            }
            await queryBots.forEach(async doc => {
                const botEncontrado = await interaction.guild.members.cache.get(doc.id)
                if (!botEncontrado) {
                    description += `⚫ <@${doc.id}> Algo salió mal con este bot.\n`;
                } else {
                    if (botEncontrado.voice.channel) {
                        description += `🔴 <@${doc.id}> Ocupado en <#${botEncontrado.voice.channel.id}>.\n`;
                    }
                    else {
                        description += `🟢 <@${doc.id}> Disponible.\n`;
                    }
                }
            });

            messageEmbed.setDescription(description);
            return interaction.editReply({
                content: `${interaction.user}`,
                embeds: [messageEmbed]
            });
        })
        .catch(error => console.log(error))

    }
}
