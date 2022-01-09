const { MessageEmbed, MessageSelectMenu, MessageActionRow, Permissions } = require("discord.js");
const getLocale = require("../../helpers/translate/getLocale");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            description: "Personaliza como creare las salas variables existentes {interaction:emoji} y {interaction:name}",
            category: "Salas dinamicas",
            usage: "[estiloSalaDinamica]",
            example: '〔{interaction:emoji}〕{interaction:name}',
            options: [
                {
                    name: "style",
                    description: "variables disponibles: {interaction:name} o {interaction:emoji}",
                    type: "STRING",
                    required: true
                }
            ],
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD
            ]
            // default_permission: true
        });
    }

    async execute( interaction, {style} ) {
        const translate = getLocale({
            interaction,
            client: this.client
        })
        
        let filter = (menu) => {return menu.user.id === interaction.user.id}
        return this.client.database
                .collection('guilds')
                .doc(interaction.guild.id)
                .collection('reactionVoices')
                .get()
                .then(async reactionVoices => {
                    if(reactionVoices.empty){
                        throw {
                            type: 'validate',
                            message: translate('notdinamicrooms')
                        }
                    }
                    let messageChannelsDinamicsOptions = await reactionVoices.docs.map(doc => {
                        return {
                                label: `${doc.data().title}`,
                                description: `ID: ${doc.id}`,
                                value: doc.id,
                            }
                    })
                    return interaction.editReply({
                        content: `A que salas le queres cambiar el estilo?`,
                        components: [
                            new MessageActionRow()
                            .addComponents([
                                new MessageSelectMenu()
                                    .addOptions(messageChannelsDinamicsOptions)
                                    .setCustomId('role_channels_dinamics')
                                    .setPlaceholder('Seleccione donde quiere cambiar esta opción.')
                                    .setMinValues(1)
                                    .setMaxValues(1)
                            ])
                        ]
                    })
                    .then(msg => {
                        return msg.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000, max: 1 })
                    })
                    .then(async resp => {
                        return this.client.database
                            .collection('guilds')
                            .doc(interaction.guild.id)
                            .collection('reactionVoices')
                            .doc(resp.values[0])
                            .set({
                                styleName: style
                            }, { merge: true })
                    })
                    .then(() => interaction.editReply({content: 'Ahora las salas dinamicas se veran con el estilo de tu server.', components: []}))
                })
                .catch(err => {
                    if (err.type === 'validate') return interaction.editReply(err.message)
                    console.log(err)
                })
    }
}
