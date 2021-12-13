// const { MessageMenu, MessageMenuOption } = require("discord-buttons");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const { addInteractionsChannels, removeInteractionsChannels, updateInteractionsChannels } = require("../redux/reducers/interactionsChannels");

module.exports = (client) => {
    client.guilds.cache.map(async guild => {
        const guildRef = await client.database.collection('guilds').doc(guild.id)
        const reactionVoiceRef = guildRef.collection('reactionVoices')
        reactionVoiceRef.onSnapshot((querySnapshot) => {
                querySnapshot.forEach(async (doc) => {
                    let reactionsRef = await reactionVoiceRef.doc(doc.id).collection('reactions')
                        .orderBy("category")
                    const guildCache = await client.guilds.cache.get(guild.id)

                    const channelFind = await guildCache.channels.cache.find(channel => channel.id === doc.data().channelID)

                    const message = await channelFind.messages.fetch(doc.id).then(async message => {

                        message.reactions.removeAll()
                        
                        await reactionsRef.onSnapshot(async snapshot => {
                            message.reactions.removeAll()
                            snapshot.docChanges().forEach((change) => {
                                if (change.type === "added") {
                                    let emoji = change.doc.data().emoji.replace(/[^0-9]+/g,'') != '' ? doc.data().defaultEmoji || '🙂' : change.doc.data().emoji
                                    client.store.dispatch(addInteractionsChannels({
                                        guildId: guildCache.id,
                                        channelId: doc.data().channelID,
                                        stream: doc.data().stream || false,
                                        interactionId: change.doc.id,
                                        ...change.doc.data(),
                                        defaultEmoji: change.doc.data().emoji.replace(/[^0-9]+/g,'') != '' ? doc.data().defaultEmoji || '🙂' : change.doc.data().emoji,
                                        styleName: doc.data().styleName ? 
                                        doc.data().styleName.replace('{interaction:emoji}', doc.data().defaultEmoji || '🙂').replace('{interaction:name}', change.doc.data().category)
                                        : `${emoji} | ${change.doc.data().category}`,
                                        viewRole: doc.data().viewRole || undefined
                                    }))
                                }

                                if (change.type === "modified") {
                                    client.store.dispatch(updateInteractionsChannels({
                                        guildId: guildCache.id,
                                        channelId: doc.data().channelID,
                                        stream: doc.data().stream || false,
                                        interactionId: change.doc.id,
                                        ...change.doc.data(),
                                        defaultEmoji: change.doc.data().emoji.replace(/[^0-9]+/g,'') != '' ? doc.data().defaultEmoji || '🙂' : change.doc.data().emoji,
                                        styleName: doc.data().styleName ? 
                                        doc.data().styleName.replace('{interaction:emoji}', doc.data().defaultEmoji || '🙂').replace('{interaction:name}', change.doc.data().category)
                                        : `${emoji} | ${change.doc.data().category}`,
                                        viewRole: doc.data().viewRole || undefined                                   
                                    }))
                                }

                                if (change.type === "removed") { 
                                    client.store.dispatch(removeInteractionsChannels({
                                        interactionId: change.doc.id,
                                        guildId: guildCache.id,
                                        channelId: doc.data().channelID
                                    }))
                                }
                            })
                            // let reactionText = ''
                            let msgEmbed = new MessageEmbed();
                            msgEmbed.setTitle(doc.data().title)
                                .setDescription(doc.data().description)
                                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                                .setColor(doc.data().color);

                            let x = 0
                            let buttonsRows = [];
                            const colors = [
                                'PRIMARY',
                                'SUCCESS',
                                'SECONDARY',
                                'DANGER',
                            ]
                            let c = 0;
                            for(let i = 0; snapshot.docs.length >= i; i++) {
                                if(snapshot.docs[i] != undefined) {
                                    if(buttonsRows[x] === undefined)
                                        buttonsRows[x] = new MessageActionRow()
                                    
                                    buttonsRows[x]
                                        .addComponents(
                                            new MessageButton()
                                                .setCustomId(snapshot.docs[i].id)
                                                .setEmoji(snapshot.docs[i].data().emoji)
                                                .setLabel(snapshot.docs[i].data().category)
                                                .setStyle(colors[c++ % colors.length])
                                        )
                                    if (buttonsRows[x].components.length > 4) x++
                                }
                            }
                        
                            msgEmbed.addField('Nota:','😄 \`Recuerda que primero tienes que estar conectado a un canal de voz.\`')
                            message.edit({
                                embeds: [ msgEmbed ],
                                components: buttonsRows
                            })                            
                        })
                    }).catch(err => {
                        reactionVoiceRef.doc(doc.id).delete().then(() => {
                            guildsRef.collection('deletedReactionVoices').doc(doc.id).set(doc.data())
                        }).catch(err => {
                            console.error(`error DB: ${err}`)
                        })
                        console.error('Message no encontrado', err)
                    })
            });
        })
    });
}
