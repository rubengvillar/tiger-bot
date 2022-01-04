// const { MessageMenu, MessageMenuOption } = require("discord-buttons");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const { addInteractionsChannels, removeInteractionsChannels, updateInteractionsChannels } = require("../redux/reducers/interactionsChannels");

module.exports = (client) => {
    client.guilds.cache.map(async guild => {
        const guildRef = await client.database.collection('guilds').doc(guild.id)
        const reactionVoiceRef = guildRef.collection('reactionVoices')
        reactionVoiceRef.onSnapshot((querySnapshot) => {
                querySnapshot.docChanges().forEach(async (queryChange) => {
                    let reactionsRef = await reactionVoiceRef.doc(queryChange.doc.id).collection('reactions')
                        .orderBy("category")
                    const guildCache = await client.guilds.cache.get(guild.id)

                    const channelFind = await guildCache.channels.cache.find(channel => channel.id === queryChange.doc.data().channelID)

                    await channelFind?.messages.fetch(queryChange.doc.id).then(async message => {

                        if(queryChange.type === 'added') {
                        message.reactions.removeAll()
                        
                        await reactionsRef.onSnapshot(async snapshot => {
                            message.reactions.removeAll()
                            snapshot.docChanges().forEach((change) => {
                                if (change.type === "added") {
                                    let emoji = change.doc.data().emoji.replace(/[^0-9]+/g,'') != '' ? queryChange.doc.data().defaultEmoji || '🙂' : change.doc.data().emoji
                                    client.store.dispatch(addInteractionsChannels({
                                        guildId: guildCache.id,
                                        channelId: queryChange.doc.data().channelID,
                                        stream: (typeof queryChange.doc.data().stream === Boolean) ? queryChange.doc.data().stream : false,
                                        interactionId: change.doc.id,
                                        ...change.doc.data(),
                                        defaultEmoji: change.doc.data().emoji.replace(/[^0-9]+/g,'') != '' ? queryChange.doc.data().defaultEmoji || '🙂' : change.doc.data().emoji,
                                        styleName: queryChange.doc.data().styleName ? 
                                        queryChange.doc.data().styleName.replace('{interaction:emoji}', emoji ||  queryChange.doc.data().defaultEmoji || '🙂').replace('{interaction:name}', change.doc.data().category)
                                        : `${emoji} | ${change.doc.data().category}`,
                                        viewRole: queryChange.doc.data().viewRole || undefined
                                    }))
                                }

                                if (change.type === "modified") {
                                    console.log(typeof queryChange.doc.data().stream === Boolean)
                                    let emoji = change.doc.data().emoji.replace(/[^0-9]+/g,'') != '' ? queryChange.doc.data().defaultEmoji || '🙂' : change.doc.data().emoji
                                    client.store.dispatch(updateInteractionsChannels({
                                        guildId: guildCache.id,
                                        channelId: queryChange.doc.data().channelID,
                                        stream: (typeof queryChange.doc.data().stream === Boolean) ? queryChange.doc.data().stream : false,
                                        interactionId: change.doc.id,
                                        ...change.doc.data(),
                                        defaultEmoji: change.doc.data().emoji.replace(/[^0-9]+/g,'') != '' ? queryChange.doc.data().defaultEmoji || '🙂' : change.doc.data().emoji,
                                        styleName: queryChange.doc.data().styleName ? 
                                        queryChange.doc.data().styleName.replace('{interaction:emoji}', emoji || queryChange.doc.data().defaultEmoji || '🙂').replace('{interaction:name}', change.doc.data().category)
                                        : `${emoji} | ${change.doc.data().category}`,
                                        viewRole: queryChange.doc.data().viewRole || undefined                                   
                                    }))
                                }

                                if (change.type === "removed") { 
                                    client.store.dispatch(removeInteractionsChannels({
                                        interactionId: change.doc.id,
                                        guildId: guildCache.id,
                                        channelId: queryChange.doc.data().channelID
                                    }))
                                }
                            })
                            
                            let msgEmbed = new MessageEmbed();
                            msgEmbed.setTitle(queryChange.doc.data().title)
                                .setDescription(queryChange.doc.data().description)
                                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                                .setColor(queryChange.doc.data().color)
                                .setImage(guild.bannerURL())
                                .setFooter(`Salas dinamicas para: ${guild}`)
                                .addField(`Pueden entrar:`, `<@&${queryChange.doc.data().viewRole || guild.id}>`, true)
                                .addField('Stream o Camara:', queryChange.doc.data().stream ? 'Si' : 'No', true)
                                .setTimestamp()

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
                        
                            msgEmbed.addField('Nota:', `😄 \`Recuerda que primero tienes que estar conectado a la sala de espera.\``)
                            message.edit({
                                embeds: [ msgEmbed ],
                                components: buttonsRows
                            })                            
                            })
                        }

                        if (queryChange.type === "modified") {
                            let data = client.store.getState().interactionChannels
                                .filter(interaction => interaction.guildId === guildCache.id && interaction.channelId === queryChange.doc.data().channelID)
                            /*
                            viewRole
                            styleName
                            channelID
                            stream
                            */
                            
                            data.forEach(interaction => {
                                client.store.dispatch(updateInteractionsChannels({
                                    ...interaction,
                                    viewRole: queryChange.doc.data().viewRole || null,
                                    styleName: queryChange.doc.data().styleName ? 
                                        queryChange.doc.data().styleName.replace('{interaction:emoji}', interaction.defaultEmoji || queryChange.doc.data().defaultEmoji || '🙂').replace('{interaction:name}', interaction.category)
                                        : `${interaction.emoji} | ${interaction.category}`,                            
                                    stream: queryChange.doc.data().stream || false,                                    
                                }))
                            })
                            
                            
                        }
                        if (queryChange.type === "removed") {
                            
                        }
                    }).catch(err => {
                        client.database.collection('Logs').doc(guild.id).collection('ReactionVoices').doc().set({
                            MessageReactions: {
                                id: queryChange.doc.id,
                                ...queryChange.doc.data(),
                            },
                            error: `${err}`
                        })
                        .catch(err => {
                            console.error(`error DB: ${err}`)
                        })
                    })
            });
        })
    });
}
