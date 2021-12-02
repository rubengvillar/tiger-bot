const { MessageEmbed } = require('discord.js');

const wait = require('util').promisify(setTimeout);

module.exports = async (client, interaction) =>{
    if (!interaction.isButton()) return
    const { user, customId, guildId, channelId, message } = interaction
    const guildCache = await client.guilds.cache.get(guildId)
    const userCache = await guildCache.members.cache.get(user.id)
    const userChannelCurrent = await guildCache.channels.cache.get(userCache.voice.channelId)
    console.log(client.store.getState().interactionChannels)

    // pensando...
    await interaction.deferReply({ ephemeral: false }).catch(() => {});
    // comprobando permisos...
    if (userChannelCurrent === undefined) {
        await interaction.editReply({
            content: `${user}`,
            embeds: [new MessageEmbed()
            .setTitle('Información')
            .setDescription(`Necesito que te conectes a un canal de voz para poder moverte.`)
            .setColor('ORANGE')], ephemeral: true }).catch(() => {});
        await wait(5000)
        return await interaction
        .deleteReply()
        .catch(console.error)
    }

    if (!userChannelCurrent.permissionsFor(client.user).has('MOVE_MEMBERS')){
        await interaction.editReply({embeds: [new MessageEmbed()
            .setTitle('Información')
            .setDescription(`${user} No tengo permisos para moverte desde: <#${userCache.voice.channelId}>`)
            .setColor('ORANGE')], ephemeral: true }).catch(() => {});
        await wait(3000)
        return await interaction
        .deleteReply()
        .catch(console.error)
    }

    // aviso de que se lo va a mover
    await interaction.editReply({embeds: [new MessageEmbed()
        .setTitle('Información')
        .setDescription(`${user} \`Voy a moverte en 3, 2, 1...\``)
        .setColor('GREEN')], ephemeral: true }).catch(() => {});
    await wait(4000)
    await interaction
        .deleteReply()
        .catch(console.error)
}
