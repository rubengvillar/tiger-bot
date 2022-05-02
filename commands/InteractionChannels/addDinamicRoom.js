const { MessageEmbed, MessageSelectMenu, MessageActionRow, Permissions } = require("discord.js");
const getLocale = require("../../helpers/translate/getLocale");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            description: "Agrega una sala a la Sala dinamica seleccionada.",
            category: "Salas dinamicas",
            usage: "[agregarSalaDinamica]",
            options: [
                {
                    name: "room",
                    description: "Nombre de la sala Ej: AmongUs, Mesa.",
                    type: "STRING",
                    required: true
                },
                {
                    name: "emoji",
                    description: "Seleccione un emoji",
                    type: "STRING",
                    required: true
                },
                {
                    name: "userslimit",
                    description: "Usuarios maximos. Cero = Sin limite, Ej: 0,2,5,10",
                    type: "STRING",
                    required: true
                },
            ],
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD
            ]
            // default_permission: true
        });
    }

    async execute(interaction, {room, emoji, userslimit}) {
        // define translate:
        const translate = getLocale({
            interaction,
            client: this.client
        })

        // validate options:
        if (!(!!emoji.match(/<a?:.+?:\d+>/) || !!emoji.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g))) return interaction.editReply(translate('adddinamicroom.invalid.emoji'))
        if (!userslimit.match(/(\d\,?)+/)) return interaction.editReply('userslimit: En esta opcion solo admito numeros.')

        // usersLimit to array:
        let userLimit = userslimit.split(',')

        //filter awaits menus:
        let filter = (menu) => {return menu.user.id === interaction.user.id}

        // search dinamic rooms
        return this.client.database
                .collection('guilds')
                .doc(interaction.guild.id)
                .collection('reactionVoices')
                .get()
                // return all dinamic rooms:
                .then(async reactionVoices => {
                    if(reactionVoices.empty){
                        return interaction.editReply('No tengo registradas salas dinámicas.')
                    }
                    
                    if(reactionVoices.docs.lenght >= 24) return interaction.editReply('El maximo permitido es de 25 salas')

                    let messageChannelsDinamicsOptions = await reactionVoices.docs.map(doc => {
                        return {
                                label: `${doc.data().title}`,
                                description: `ID: ${doc.id}`,
                                value: doc.id,
                            }
                    })
                    return interaction.editReply({
                        content: translate('adddinamicroom.newroom', {
                            emoji,
                            room,
                            userLimit
                        }),
                        components: [
                            new MessageActionRow()
                            .addComponents([
                                new MessageSelectMenu()
                                    .addOptions(messageChannelsDinamicsOptions)
                                    .setCustomId('Menu_salas')
                                    .setPlaceholder('Seleccione a donde quiere agregar la sala')
                                    .setMinValues(1)
                                    .setMaxValues(1)
                            ])
                        ]
                    })
                    .then(msg => {
                        return msg.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
                    })
                    .then(async resp => {
                        return this.client.database
                            .collection('guilds')
                            .doc(interaction.guild.id)
                            .collection('reactionVoices')
                            .doc(resp.values[0])
                            .collection('reactions')
                            .add({
                                emoji,
                                category: room,
                                userLimit
                            })
                    })
                    .then(() => interaction.editReply({content: translate('adddinamicroom.success'), components: []}))
                })
                .catch(console.error)
    }
}
