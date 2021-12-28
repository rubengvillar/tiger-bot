const { MessageEmbed, MessageSelectMenu, MessageActionRow, Permissions } = require("discord.js");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            description: "Agrega una sala a la Sala dinamica seleccionada.",
            category: "Salas dinamicas",
            usage: "[agregarSalaDinamica]",
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD
            ]
            // default_permission: true
        });
    }

    async execute(interaction, ) {
        let filter = (menu) => {return menu.user.id === interaction.user.id}
        let reactionVoiceSelect

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
                        content: `De donde queres eliminar salas?`,
                        components: [
                            new MessageActionRow()
                            .addComponents([
                                new MessageSelectMenu()
                                    .addOptions(messageChannelsDinamicsOptions)
                                    .setCustomId('Menu_salas')
                                    .setPlaceholder('Salas dinamicas')
                                    .setMinValues(1)
                                    .setMaxValues(1)
                            ])
                        ]
                    })
                    .then(msg => {
                        return msg.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
                    })
                    .then(async resp => {
                        reactionVoiceSelect = resp.values[0]
                        return this.client.database
                            .collection('guilds')
                            .doc(interaction.guild.id)
                            .collection('reactionVoices')
                            .doc(resp.values[0])
                            .collection('reactions')
                            .get()
                    })
                    .then(async reactions => {
                        let reactionOptions = await reactions.docs.map(doc => {
                            let emoji = doc.data().emoji.replace(/\D/g, '') || doc.data().emoji;

                            return  {
                                label: `${doc.data().category}`,
                                description: `Limites de usuarios: ${doc.data().userLimit.join(', ')}`,
                                value: doc.id,
                                emoji: emoji
                            }
                        })
                        return interaction.editReply(
                            {content: 'Elegi las reacciones a eliminar.',
                            components: [new MessageActionRow()
                            .addComponents([new MessageSelectMenu()
                                .addOptions(reactionOptions)
                                .setCustomId('reacciones')
                                .setMinValues(1)
                                .setMaxValues(reactionOptions.length)
                            ])]
                        })
                    })
                    .then(msg => msg.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 }))
                    .then(async selectValues => {
                        await selectValues.values.forEach(element => {
                            return this.client.database
                                .collection('guilds')
                                .doc(interaction.guild.id)
                                .collection('reactionVoices')
                                .doc(reactionVoiceSelect)
                                .collection('reactions')
                                .doc(element)
                                .delete()
                                
                    })                      
                })
                
        })
        .then(() => interaction.editReply({
            content: '🗑️ - Las reacciones seleccionadas fueron borradas.',
            components: []
        }))
        .catch(console.error)
    }
}
