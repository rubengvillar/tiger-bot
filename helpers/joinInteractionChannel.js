module.exports = (client, oldState, newState) => {
    const { guild, channelId, id } = newState
    if(channelId != null && channelId != oldState.channelId) {
        const tempChannel = client.store.getState().tempInteractionChannels.filter(tempChannel => tempChannel.voiceInteraction ===  channelId && tempChannel.guildId === guild.id)[0]
        if (tempChannel != undefined) return guild.channels.fetch(tempChannel.textInteraction)
            .then(textChannel => {
                return textChannel.permissionOverwrites
                    .create(id, {
                        'VIEW_CHANNEL': true,
                    }, { reason: 'Join interaction channel' })
            })
            .catch(console.error)
    }
}
