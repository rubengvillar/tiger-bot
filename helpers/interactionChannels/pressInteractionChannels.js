const { MessageEmbed, Permissions } = require('discord.js');

const wait = require('util').promisify(setTimeout);
const createChannel = require('../createChannel');

module.exports = async (client, interaction) =>{
    if (!interaction.isButton()) return
    const { store, database } = client
    const { user, customId, guildId, channelId, message } = interaction
    let guild, userInteraction, userChannelCurrent;
    let interactionFind, categoryInteraction, textInteraction, voiceInteraction, tempInteractionChannels
    let name, size = 0, position;
    let permissions = {
        textChannel: [
            {
                id: client.user.id,
                allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS'],
            },
            {
                id: guildId,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: user.id,
                allow: ['VIEW_CHANNEL'],
            }
        ],
        voiceChannel: [
            {
                id: client.user.id,
                allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'CREATE_INSTANT_INVITE'],
            }
        ]
    }

    return interaction.deferReply({ ephemeral: false })
        .then(() => client.guilds.fetch(guildId))
        .then(guildFetch => {
            if (guildFetch === undefined) throw new Error('Servidor no encontrado...')
            guild = guildFetch
            return;
        })
        .then(()=> guild.members.cache.get(user.id))
        .then(userFetch => {
            if(userFetch === undefined) throw new Error('Usuario no encontrado')
            userInteraction = userFetch
            return;
        })
        .then(() => {
            return guild.channels.fetch(channelId).then(channel => {
                return guild.channels.fetch(channel.parentId)
            })
            .then(parentQuery => {
                position = parentQuery.rawPosition
            })
        })
        .then(() => {
            return guild.channels.cache.get(userInteraction.voice.channelId)
        })
        .then(userChannelCurrentFetch => {
            if(userChannelCurrentFetch === undefined) throw new Error('Debes estar conectado a un canal de voz. Para poder crear una sala.')
            userChannelCurrent = userChannelCurrentFetch
            return;
        })
        .then(() => {
            if (!userChannelCurrent.permissionsFor(client.user).has('MOVE_MEMBERS')){
                throw new Error(`No tengo permisos para moverte desde: <#${userInteraction.voice.channelId}>`)
            }
            return
        })
        .then(() => {
            return interaction.editReply({
                content: `${user}`,
                embeds: [new MessageEmbed()
                    .setTitle('Información')
                    .setDescription(`Voy a moverte en 3, 2, 1...`)
                    .setColor('GREEN')
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                ]
            });
        })
        .then(() =>{
            return interactionFind = store.getState().interactionChannels
                .filter(interactionStore => 
                    interactionStore.guildId === guild.id 
                    && interactionStore.channelId === channelId 
                    && interactionStore.interactionId === customId)[0]
        })
        .then(() => {
            if (!interactionFind) throw new Error('No se encontro la interaccion')
        })
        .then(() => {
            name = interactionFind.emoji.replace(/[^0-9]+/g,'').trim() === '' 
            ? `${interactionFind.emoji} ${interactionFind.category}` 
            : `${interactionFind.defaultEmoji} ${interactionFind.category}`
        })
        .then(() => {
            return tempInteractionChannels = store.getState().tempInteractionChannels.filter(tempChannels => 
                tempChannels.guildId === interactionFind.guildId 
                && tempChannels.channelId === interactionFind.channelId 
                && tempChannels.interactionId === interactionFind.interactionId)
        })
        .then(() => {
            let guildInfo = store.getState().guilds.filter(guildQuery => guildQuery.id === guild.id)[0]
            guild.roles.fetch(guildInfo.roleMute).then(role => {
                                    permissions.textChannel.push({
                                        id: role.id,
                                        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                                    })
                                    permissions.voiceChannel.push({
                                        id: role.id,
                                        deny: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK'],
                                    })
                                })
                                .catch(console.error);
        })
        .then(() => {
            if(interactionFind.viewRole != undefined) {
                permissions.voiceChannel.push({
                    id: interactionFind.viewRole,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL],
                })
                permissions.voiceChannel.push({
                    id: guildId,
                    deny: [ Permissions.FLAGS.VIEW_CHANNEL ]
                })
            }
        })
        .then(() => {
            console.log(tempInteractionChannels)
            if (!tempInteractionChannels.length) {
                return createChannel(guild, name, {
                    type: 'GUILD_CATEGORY',
                    position
                })
                .then(category => {
                    // console.log(category)
                    return categoryInteraction = category.id || tempInteractionChannels[0].categoryInteraction
                })
            } else {
                categoryInteraction = tempInteractionChannels[0].categoryInteraction
            }
        })
        .then(() => {
            for(let i=0; i<tempInteractionChannels.length; i++){
                // System.out.println(nombres[i] + " " + sueldos[i]);
                if(tempInteractionChannels[i].size>size){ // 
                    size = tempInteractionChannels[i].size || 0;
                }
            }
        })
        .then(() => {
            return createChannel(guild, `${name} ${size + 1}`, {
                parent: categoryInteraction,
                permissionOverwrites: permissions.textChannel,
            })
            .then(channel => textInteraction = channel)
        })
        .then(() => {
            // console.log(categoryInteraction)
            return  createChannel(guild, `${name} ${size + 1}`, {
                parent: categoryInteraction,
                type: 'GUILD_VOICE',
                permissionOverwrites: permissions.voiceChannel,
                userLimit: interactionFind.userLimit[0]
            })
            .then(channel => voiceInteraction = channel)
        })
        .then(() => {
            return database.collection('guilds').doc(interactionFind.guildId)
                .collection('InteractionTempChannels')
                .doc()
                .set({
                    ...interactionFind,
                    ownerId: user.id,
                    categoryInteraction: categoryInteraction || '',
                    textInteraction: textInteraction.id || '',
                    voiceInteraction: voiceInteraction.id || '',
                    size: size+1
                })
        })
        .then(() => {
            userInteraction.voice.setChannel(voiceInteraction)
        })
        // .then(() => {
        //     return createChannel(guild, name, {

        //     })
        // })
        .then(async () => {
            await wait(4000)
            return interaction.deleteReply()
        })
        .catch(async err => {
            console.log(err)
            await interaction.editReply({ 
            content: `${user}`,
            embeds: [
                new MessageEmbed()
                    .setTitle('Error')
                    .setDescription(`${err}`)
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setColor('YELLOW')
                ]
            })
            await wait(4000)
            return interaction.deleteReply()
        })
}
