module.exports = async ({guild, name = '' , options}) => {
    return await guild.channels.create(name, options)
}
