const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed, Permissions } = require("discord.js");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            aliases: ["pong"],
            category: "Manager",
            usage: "/message",
            description: "Crea un mensaje como si el propio server lo enviara.",
            options: [
                {
                    name: "title",
                    description: "Titulo del mensaje",
                    type: "STRING",
                    required: true,
                },
                {
                name: "mension",
                description: "Seleccione el rol que mensionare",
                type: "ROLE",
                required: true,
                },
                {
                    name: "channel",
                    description: "Seleccione el canal al que sera enviado el mensaje",
                    type: "CHANNEL",
                    required: true,
                },
                {
                    name: "color",
                    description: "Selected embed message buttons color",
                    type: "STRING",
                    required: true,
                    choices: [
                        {
                            name: 'AQUA',
                            value: 'AQUA'
                        },
                        {
                            name: 'GREEN',
                            value: 'GREEN'
                        },
                        {
                            name: 'BLUE',
                            value: 'BLUE'
                        },
                        {
                            name: 'DARK_BLUE',
                            value: 'DARK_BLUE'
                        },
                        {
                            name: 'PURPLE',
                            value: 'PURPLE'
                        },
                        {
                            name: 'LUMINOUS_VIVID_PINK',
                            value: 'LUMINOUS_VIVID_PINK'
                        },
                        {
                            name: 'GOLD',
                            value: 'GOLD'
                        },
                        {
                            name: 'ORANGE',
                            value: 'ORANGE'
                        },
                        {
                            name: 'RED',
                            value: 'RED'
                        },
                        {
                            name: 'GREY',
                            value: 'GREY'
                        },
                        {
                            name: 'DARKER_GREY',
                            value: 'DARKER_GREY'
                        },
                        {
                            name: 'LIGHT_GREY',
                            value: 'LIGHT_GREY'
                        },
                        {
                            name: 'NAVY',
                            value: 'NAVY'
                        },
                        {
                            name: 'YELLOW',
                            value: 'YELLOW'
                        },
                        {
                            name: 'BLACK',
                            value: 'BLACK'
                        },
                        {
                            name: 'WHITE',
                            value: 'WHITE'
                        },
                        {
                            name: 'GREYPLE',
                            value: 'GREYPLE'
                        },
                        {
                            name: 'FUSCHIA',
                            value: 'FUSCHIA'
                        },
                        {
                            name: 'RANDOM',
                            value: 'RANDOM'
                        },
                    ]
                }
            ],
            permBot: [
                Permissions.FLAGS.MANAGE_WEBHOOKS,
                Permissions.FLAGS.SEND_MESSAGES,
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.READ_MESSAGE_HISTORY
            ],
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD
            ],
            default_permission: true
        });
    }

    async execute(interaction, {title, mension, channel, color} ) {
        let isChannel = {}
        let description = ''
        let webhook = {}
        const filter = response => interaction.user.id === response.author.id;

        return interaction.editReply('Comprobare la información enviada.')
            // comprobar titulo
            .then(() => {
                if(typeof title != 'string') throw { type: 'validate', message: 'Title no es valido'}
                return
            })
            .then(() => {
                return interaction.guild.roles.cache.get(mension)
            })
            .then(mensionCache => {
                if (!mensionCache) throw {
                    type: 'validate',
                    message: '<:mention:658538492019867683> No es un rol valido'
                }
                return
            })
            .then(() => interaction.guild.channels.cache.get(channel))
            .then(channelCache => {
                if(!(channelCache.type === 'GUILD_TEXT')) throw {
                    type: 'validate',
                    message: '<:channel:585783907841212418> Debes seleccionar un canal de texto.'
                }
                return isChannel = channelCache
            })
            .then(() => interaction.editReply({
                content: `Mensaje previo`,
                embeds: [new MessageEmbed()
                    .setTitle(title)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .setFooter(`Solicitado por ${interaction.member.displayName}`)
                    .setColor(color)
                    .setTimestamp()
                ]
            }))
            .then(() => interaction.channel.send('Ahora envie la descripcion del mensaje.'))
            .then(() => interaction.channel.awaitMessages({ filter, max: 1, time: 60_000 }))
            .then(collected => description = collected.first().content)
            .then(() => {
                return isChannel.createWebhook(interaction.guild.name, {
                    avatar: interaction.guild.iconURL({ dynamic: true }),
                    reason: `Anuncio de: ${interaction.member}`
                })
            })
            .then(hook => webhook = hook)
            .then(() => {
                return webhook.send({
                    content: `<@&${mension}>`,
                    embeds: [
                        new MessageEmbed()
                            .setTitle(title)
                            .setDescription(description)
                            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                            .setFooter(`Solicitado por ${interaction.member.displayName}`)
                            .setColor(color)
                            .setTimestamp()
                        ]
                })
            })
            .then(() => {
                webhook.delete()
            })
            .then(() => interaction.editReply({
                content: 'El mensaje fue enviado',
                embeds: []
            }))
    }
}
