const { MessageEmbed, MessageSelectMenu, MessageActionRow, Permissions } = require("discord.js");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            description: "Agrega una sala a la Sala dinamica seleccionada.",
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

    async execute(interaction, [stream]) {
        let filter = (menu) => {return menu.user.id === interaction.user.id}
        return this.client.database
                .collection('guilds')
                .doc(interaction.guild.id)
                .collection('reactionVoices')
                .get()
                .then(async reactionVoices => {
                    if(reactionVoices.empty){
                        return interaction.editReply('No tengo registradas salas dinámicas.')
                    }
                    let messageChannelsDinamicsOptions = await reactionVoices.docs.map(doc => {
                        return {
                                label: `${doc.data().title}`,
                                description: `ID: ${doc.id}`,
                                value: doc.id,
                            }
                    })
                    return interaction.editReply({
                        content: `Donde ${stream ? 'podran': 'no podran'} prender camara o compartir pantalla?`,
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
                                stream
                            }, { merge: true })
                    })
                    .then(() => interaction.editReply({content: 'El rol fue añadido con exito.', components: []}))
                })
                .catch(console.error)
    }
}
