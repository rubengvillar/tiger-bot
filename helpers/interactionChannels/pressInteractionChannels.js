const { MessageEmbed, Permissions, MessageActionRow, MessageButton, Emoji, MessageSelectMenu } = require('discord.js');

const wait = require('util').promisify(setTimeout);
const createChannel = require('../createChannel');

module.exports = async (client, interaction) =>{
    if (!interaction.isButton()) return
    let hilo
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

    interactionFind = store.getState().interactionChannels
                .filter(interactionStore => 
                    interactionStore.guildId === guildId
                    && interactionStore.channelId === channelId 
                    && interactionStore.interactionId === customId)[0]
    
    if (!interactionFind) return
    
    return hilo = await interaction.deferReply({ ephemeral: false })
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
            if(userChannelCurrentFetch === undefined) throw { error: new Error('Debes estar conectado a un canal de voz. Para poder crear una sala.') }
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
            if (!interactionFind) return
        })
        .then(() => {
            name = interactionFind.emoji.replace(/[^0-9]+/g,'').trim() === '' 
            ? `${interactionFind.emoji} | ${interactionFind.category}` 
            : `${interactionFind.defaultEmoji} | ${interactionFind.category}`
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
                                    if (role.id === undefined) return
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
            let denyPermissions = [Permissions.FLAGS.VIEW_CHANNEL]
            if (!interactionFind.stream) denyPermissions.push(Permissions.FLAGS.STREAM)
            if(interactionFind.viewRole != undefined) {
                permissions.voiceChannel.push({
                    id: interactionFind.viewRole,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL],
                })
                permissions.voiceChannel.push({
                    id: guildId,
                    deny: denyPermissions
                })
            }
        })
        .then(() => {
            if (!tempInteractionChannels.length) {
                return createChannel(guild, interactionFind.styleName, {
                    type: 'GUILD_CATEGORY',
                    position
                })
                .then(category => {
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
            return createChannel(guild, `${interactionFind.styleName} ${size + 1}`, {
                parent: categoryInteraction,
                permissionOverwrites: permissions.textChannel,
            })
            .then(channel => textInteraction = channel)
        })
        .then(() => {
            // console.log(categoryInteraction)
            return  createChannel(guild, `${interactionFind.styleName} ${size + 1}`, {
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
                    viewRole: interactionFind.viewRole === undefined ? interaction.guild.id : interactionFind.viewRole,
                    size: size+1
                })
        })
        .then(() => {
            userInteraction.voice.setChannel(voiceInteraction)
        })
        .then(() => {
            const optionsUserLimit = interactionFind.userLimit
                .map(limit => ({
                    label: `${limit === '0' ? 'Sin limite de' : limit} usuarios.`,
                    // description: '8 usuarios',
                    value: limit,
                }))
            textInteraction.send({
                tts: true,
                content: `${user}. Este canal de texto permanece oculto para quienes no estan en el canal de voz.`,
                embeds: [new MessageEmbed()
                    .setTitle(`Sala Dinamica: ${name}`)
                    .setDescription('Ahora cuento con multiples opciones.')
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .addField('Emoji', interactionFind.emoji, true)
                    .addField('Nombre', interactionFind.category, true)
                    .addField('Pueden entrar', `<@&${interactionFind.viewRole === undefined ? interaction.guild.id : interactionFind.viewRole}>`, true)
                    .addField('Stream o Camara: ', `${interactionFind.stream ? 'Si' : 'No'}`, true)
                    .setColor('RANDOM')
                ],
                components: [
                    // new MessageActionRow()
                    //     .addComponents([
                    //         new MessageButton()
                    //             .setCustomId('lock')
                    //             .setEmoji('🔐')
                    //             .setLabel('Cerrar')
                    //             .setStyle('DANGER'),
                    //         new MessageButton()
                    //             .setCustomId('claim')
                    //             .setEmoji('585789630800986114')
                    //             .setLabel('Reclamar')
                    //             .setStyle('SECONDARY'),
                    //         new MessageButton()
                    //             .setCustomId('block')
                    //             .setEmoji('464520569560498197')
                    //             .setLabel('Bloquear')
                    //             .setStyle('SECONDARY'),
                    //         new MessageButton()
                    //             .setCustomId('unblock')
                    //             .setEmoji('658538493470965787')
                    //             .setLabel('Desbloquar')
                    //             .setStyle('SECONDARY'),
                    //     ]),
                    new MessageActionRow()
                        .addComponents([
                            new MessageSelectMenu()
                                .setCustomId(`maxusers_${voiceInteraction.id}`)
                                .setPlaceholder('Cambia la cantidad de usuarios que pueden entrar.')
                                .addOptions(optionsUserLimit),
                        ])
                ]
            })
        })
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
