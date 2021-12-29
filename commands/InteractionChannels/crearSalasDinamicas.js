const { MessageEmbed, Permissions } = require("discord.js");
const Command = require("../../Structures/Command");
const createChannel = require("../../helpers/createChannel");
const createReactions = require("../../helpers/createReactions");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            category: "Salas dinamicas",
            description: "Crea canales y para que la gente pueda crear salas tanto para juegos como privadas.",
            usage: "[channelsInteractions]",
            options: [
                {
                    name: "categoria",
                    description: "Nombre de la categoria.",
                    type: "STRING",
                    required: true,
                },
                {
                    name: "gestion",
                    description: "Establese el rol que tendra permisos sobre estas salas. Por ejemplo: soporte.",
                    type: "ROLE",
                    required: true
                },
                {
                    name: "emoji",
                    description: "Establece un emoji de discord por defecto. Se utiliza en caso que la sala no tenga uno por defecto.",
                    type: "STRING",
                    required: true
                },
                {
                    name: "descripcion",
                    description: "Envia una breve descripcion",
                    type: "ROLE",
                    required: true
                },
                {
                    name: "viewrole",
                    description: "Establece quienes podran ver las salas.",
                    type: "ROLE",
                    required: false
                },
                {
                    name: "color",
                    description: "Color del embed",
                    type: "STRING",
                    choices: [
                        {
                            name: 'Verde agua',
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
                            name: 'Amarillo',
                            value: 'YELLOW'
                        },
                        {
                            name: 'Negro',
                            value: 'BLACK'
                        },
                        {
                            name: 'Blanco',
                            value: 'WHITE'
                        },
                        {
                            name: 'GREYPLE (Default)',
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
                Permissions.FLAGS.MANAGE_CHANNELS,
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_WEBHOOKS,
                Permissions.FLAGS.VIEW_CHANNEL,
                Permissions.FLAGS.READ_MESSAGE_HISTORY
            ],
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD
            ]
        });
    }

    async execute(interaction, [title, roleGestion ,emoji, description,  viewRole, color,]) {
        const guildStore = this.client.store.getState().guilds.filter(guild => guild.id === interaction.guild.id)[0]
        const errorEmbed = new MessageEmbed()
            .setTitle('Opción no valida')
            .setColor('ORANGE')
        let resultados = {}
        let Reactions = []
        let configInteractionChannel = {
            channelID: '',
            panelID: '',
            emoji: '',
            color: '',
            viewRole: '',
            title: '',
            description: '',
            permissions: {
                textChannel: [
                    {
                        id: interaction.guild.id,
                        deny: [
                            Permissions.FLAGS.SEND_MESSAGES,
                            Permissions.FLAGS.SPEAK,
                            Permissions.FLAGS.ADD_REACTIONS,
                        ]
                    }
                ],
                voiceChannel: [
                    {
                        id: interaction.guild.id,
                        deny: [
                            Permissions.FLAGS.SPEAK,
                            Permissions.FLAGS.STREAM,
                        ]
                    }
                ],
                PanelChannel: [
                    {
                        id: interaction.guild.id,
                        deny: [
                            Permissions.FLAGS.VIEW_CHANNEL
                        ]
                    },
                    {
                        id: roleGestion,
                        allow: [
                            Permissions.FLAGS.VIEW_CHANNEL
                        ]
                    }
                ]
            }
        }

        let selectColor = color || 'RANDOM'

        if (emoji.replace(/[^0-9]+/g,'') != '' || emoji.replace(/[^A-Z]+/g,'') != '' || emoji.replace(/[^a-z]+/g,'') != '') 
            return interaction.editReply({
                content: `${interaction.member}`,
                embeds: [
                    errorEmbed.setDescription('El emoji enviado no pertence a los emojis por defecto de discord.')
                ]
            })
        
        const dinamicEmbed = new MessageEmbed()
            .setTitle('Canales de interacción')
            .setDescription(
                `Los **canales de interaccion** son canales que responden a **botones**. De tal manera voy a crear una categoria con: **Panel de control, Creador de canales, Sala de espera.**`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setColor('YELLOW')

        interaction.editReply({embeds: [ dinamicEmbed ]})
                .then(() => {
                    return createReactions(interaction)
                })
                .then(reactions => Reactions = reactions)
                .then(() => {
                    return createChannel(interaction.guild, `${emoji} | ${title}`, {
                        type: 'GUILD_CATEGORY',
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [
                                    Permissions.FLAGS.SEND_MESSAGES,
                                    Permissions.FLAGS.SPEAK,
                                    Permissions.FLAGS.STREAM,
                                    Permissions.FLAGS.ADD_REACTIONS,
                                ]
                            },{
                                id: this.client.user.id,
                                allow: [
                                    Permissions.FLAGS.SEND_MESSAGES,
                                    Permissions.FLAGS.SPEAK,
                                    Permissions.FLAGS.STREAM,
                                    Permissions.FLAGS.ADD_REACTIONS,
                                ]
                            }
                        ]
                    })
                })
                .then(category => {
                    return createChannel(interaction.guild, '🎛️ Panel de Control', {
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [
                                    Permissions.FLAGS.SPEAK,
                                    Permissions.FLAGS.STREAM,
                                    Permissions.FLAGS.ADD_REACTIONS,
                                    Permissions.FLAGS.VIEW_CHANNEL
                                ]
                            },{
                                id: this.client.user.id,
                                allow: [
                                    Permissions.FLAGS.VIEW_CHANNEL,
                                    Permissions.FLAGS.SEND_MESSAGES,
                                    Permissions.FLAGS.SPEAK,
                                    Permissions.FLAGS.STREAM,
                                    Permissions.FLAGS.ADD_REACTIONS,
                                ]
                            },
                            {
                                id: roleGestion,
                                allow: [
                                    Permissions.FLAGS.VIEW_CHANNEL,
                                    Permissions.FLAGS.SEND_MESSAGES,
                                ]
                            }
                        ]
                    })
                    .then( panel => {
                        return createChannel(interaction.guild, '📲 Creador de canales', {
                            parent: category.id
                        })
                        .then(interactor =>{
                            return {panel, interactor, category}
                        })
                    })
                    .then(channels => {
                        return createChannel(interaction.guild, '⏳ Sala de espera', {
                            type: 'GUILD_VOICE',
                            parent: category.id
                        })
                        .then(awaiting => {
                            return { awaiting,  ...channels}
                        })
                    })
                })
                .then(result => {
                    return result.interactor.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`Selecciona una sala de: ${title}`)
                                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                                .setImage(interaction.guild.bannerURL())
                                .setDescription(`${description}`)
                                .addField('Uso: ',`Para crear una sala conectese a ${result.awaiting} y presione el boton de la sala que quiere crear.`)
                                .setColor(selectColor)
                            ]
                    })
                    .then(msgInteractor => {
                        return result.panel.send({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle(`Panel de control de: ${title}`)
                                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                                    .setDescription(`Estas opciones estan en desarrollo pronto estaran listas.`)
                                    .setColor(selectColor)
                                ]
                        })
                        .then(() => ({...result, msgInteractor }))
                    })
                })
                .then(result => resultados = result)
                .then(() => 
                    this.client.database.collection('guilds').doc(interaction.guild.id)
                        .collection('reactionVoices')
                            .doc(resultados.msgInteractor.id)
                            .set({
                                channelID: resultados.interactor.id,
                                color: selectColor,
                                title: title,
                                roleGestion: roleGestion || null,
                                description: description,
                                awaiting: resultados.awaiting.id,
                                panel: resultados.panel.id,
                                category: resultados.category.id,
                                viewRole: viewRole
                            })
                )
                .then(() => {
                    return this.client.database.collection('guilds')
                        .doc(interaction.guild.id)
                        .collection('reactionVoices')
                        .doc(resultados.msgInteractor.id).collection('reactions')
                })
                .then(reactionVoicesRef => {
                    console.log(Reactions)
                    Reactions.map(reaction => {
                        reactionVoicesRef.add(reaction)
                    })
                })
                .then(result => {
                    return interaction.editReply({
                        content: 'Salas dinamicas',
                        embeds: [
                            dinamicEmbed
                                .setColor('GREEN')
                                .addField('Canales creados:',`${result.awaiting}, ${result.panel}, ${result.interactor}. Dentro de la categoría **${result.category}**`) ]})
                })
                .then(() => {
                    console.log(result)
                })
                .catch(err => {
                    switch (err.type) {
                        case 'validate':
                            return interaction.editReply({
                                embeds: [errorEmbed.setDescription(`${err.message}`)] })
                        default:
                            console.error(`Guild: ${interaction.guild}, ${err}`)
                    }
                    
                })
    }
}
