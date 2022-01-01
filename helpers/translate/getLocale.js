module.exports = (interaction, client) =>{
    const { guild } = interaction
        const { preferredLocale } = guild
        const guildStore = client.store.getState().guilds.filter(guildStore => guildStore.id === guild.id )[0]
        const { guildLocale } = guildStore
        const translate = client.language.getFixedT(guildLocale)
        return translate
}
