module.exports = (client, oldState, newState) => {
    const { guild, channelId, id } = oldState
    if(oldState.channelId != null && channelId != newState.channelId) {
        const tempChannel = client.store.getState().tempInteractionChannels.filter(tempChannel => tempChannel.voiceInteraction ===  channelId && tempChannel.guildId === guild.id)[0]
        let voiceChannelQuery, textChannelQuery, categoryChannelQuery;
        if (tempChannel === undefined) return
        
        guild.channels.fetch(tempChannel.voiceInteraction)
            .then(voiceChannel => {
                if (voiceChannel.members.size <= 0) {
                    guild.channels.fetch(tempChannel.textInteraction)
                        .then(textChannel => textChannelQuery = textChannel)
                        .then(() => guild.channels.fetch(tempChannel.categoryInteraction))
                        .then(category => categoryChannelQuery = category)
                        .then(() => {
                            return voiceChannel.delete()
                        })
                        .then(() => {
                            return textChannelQuery.delete()
                        })
                        .then(() => {
                            return client.database.collection('guilds').doc(guild.id).collection('InteractionTempChannels').doc(tempChannel.id).delete();
                        })
                        .then(() => {
                            setTimeout(async ()=>{
                                let channels = client.store.getState().tempInteractionChannels
                                    .filter(tempChannelQuery => {
                                        console.log('TempChannels: ',tempChannelQuery.interactionId, tempChannel.interactionId)
                                        return tempChannelQuery.interactionId === tempChannel.interactionId
                                    })
                                if (channels.length <= 0) {
                                    return categoryChannelQuery.delete()
                                        .catch(error => console.error(error))
                                }
                            }, 5000)
                        })
                        .catch(console.error)
                } else {
                    return guild.channels.fetch(tempChannel.textInteraction)
                        .then(textInteraction=>{
                            textInteraction.permissionOverwrites.delete(id, 'Left interaction channel')
                        })
                    
                }
            })
            .catch(console.error)
        // setTimeout(async ()=>{
        //     const sizeChannels = await oldState.guild.channels.cache.filter(categoryCurrent => categoryCurrent.parentID === channel.data().parent).size
        //     if (sizeChannels <= 0) {
        //         await categoryChannel.delete()
        //             .catch(error => console.error(error))
        //         client.db.collection('guilds').doc(oldState.guild.id).collection('categoryChannels').doc(channel.data().parent).delete()
        //             .catch(error => console.error(error));
        //     }
        // }, 5000)
    }
}
