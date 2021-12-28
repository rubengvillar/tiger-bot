
module.exports = (client, interaction) => {
    if (!interaction.isSelectMenu()) return;
    const { customId, values } = interaction;
    const [ menu, channelId ] = customId.split('_')
    const channel = client.store.getState().tempInteractionChannels.filter(channel => channel.voiceInteraction === channelId)[0]
    if (!channel) return
    return interaction.deferReply({ ephemeral: true })
        .then(() => {
            if(menu != 'maxusers') return
            if(!channel) return
            return client.channels.fetch(channelId)
                .then(voiceChannel => voiceChannel.setUserLimit(values[0]))
                .then(() => interaction.editReply('Maximo de usuarios actualizado.'))
        })
        .catch(console.error)
}
