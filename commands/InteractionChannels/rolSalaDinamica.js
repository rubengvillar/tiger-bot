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
            options: [
                {
                    name: "rol",
                    description: "Selecciona un rol para que Solo puedan ver una sala los que tengan el rol.",
                    type: "ROLE",
                    required: true
                },
            ],
            permUser: [
                Permissions.FLAGS.MANAGE_GUILD
            ]
            // default_permission: true
        });
    }

    async execute(interaction, [role]) {
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
                        content: `Rol a agregar: ${role}, Donde deseas agregarlo?`,
                        components: [
                            new MessageActionRow()
                            .addComponents([
                                new MessageSelectMenu()
                                    .addOptions(messageChannelsDinamicsOptions)
                                    .setCustomId('role_channels_dinamics')
                                    .setPlaceholder('Seleciona donde queres agregar el rol.')
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
                                viewRole: role
                            }, { merge: true })
                    })
                    .then(() => interaction.editReply({content: 'El rol fue añadido con exito.', components: []}))
                })
                .catch(console.error)
    }
}
