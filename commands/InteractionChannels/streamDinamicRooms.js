const { MessageEmbed, MessageSelectMenu, MessageActionRow, Permissions } = require("discord.js");
const getLocale = require("../../helpers/translate/getLocale");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            description: "Permitir que puedan prender camara a partir en todas las salas dinamicas seleccionadas.",
            category: "Salas dinamicas",
            usage: "[streamSalaDinamica]",
            options: [
                {
                    name: "stream",
                    description: "Pueden o no prender camara en una sala.",
                    type: "BOOLEAN",
                    required: true
                }
            ],
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD
            ]
            // default_permission: true
        });
    }

    async execute(interaction, {stream}) {
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
                        content: translate('streamdinamicroom.content', { context: `${stream}`} ),
                        components: [
                            new MessageActionRow()
                            .addComponents([
                                new MessageSelectMenu()
                                    .addOptions(messageChannelsDinamicsOptions)
                                    .setCustomId('role_channels_dinamics')
                                    .setPlaceholder(translate('selectroom'))
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
                                stream
                            }, { merge: true })
                    })
                    .then(() => interaction.editReply({content: translate('streamdinamicroom.success', { context: `${stream}`} ), components: []}))
                })
                .catch(err => {
                    console.log(err)
                    if (err.type === 'validate') return interaction.editReply(err.message)
                    console.log(err)
                })
    }
}
