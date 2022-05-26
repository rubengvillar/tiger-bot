module.exports = ({interaction, client}) =>{
    const { guild } = interaction
    const { preferredLocale } = guild
    const guildStore = client.store.getState().guilds.find(guildStore => guildStore.id === guild.id )
    const { guildLocale } = guildStore

    const translate = client.language.getFixedT(guildLocale || preferredLocale)
    return translate
}
