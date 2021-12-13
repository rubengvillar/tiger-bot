const { addTempInteractionChannel, updateTempInteractionChannel, removeTempInteractionChannel } = require("../redux/reducers/tempInteractionChannels");

module.exports = client => {
    client.guilds.cache.map(async guild => {
        let guildRef, tempChannels;
        
        guildRef = await client.database.collection('guilds').doc(guild.id)
        tempChannels = await guildRef.collection('InteractionTempChannels')

        tempChannels.onSnapshot(querySnapshot => {
            querySnapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    client.store.dispatch(addTempInteractionChannel({
                        id: change.doc.id,
                        ...change.doc.data(),
                        guidlId: guild.id
                    }))
                }

                if (change.type === "modified") {
                    client.store.dispatch(updateTempInteractionChannel({
                        id: change.doc.id,
                        ...change.doc.data(),
                        guidlId: guild.id
                    }))
                }

                if (change.type === "removed") {
                    client.store.dispatch(removeTempInteractionChannel({
                        interactionId: change.doc.data().interactionId,
                        voiceInteraction: change.doc.data().voiceInteraction
                    }))
                }
            })
        })
    })
}
