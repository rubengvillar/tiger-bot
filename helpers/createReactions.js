let reactions = []
const createReactions = async (interaction) =>{
    let reactionVoices = {
        category: '',
        emoji: '',
        userLimit: []
    }

    const filter = response => interaction.user.id === response.author.id;
    const answers = ['Si', 'No'];
    const addFilter = response => interaction.user.id === response.author.id && answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());;

    return await interaction.editReply({
            content: `${interaction.user}, Dime como se llamara la sala. Ejemplo: AmongUs, Mesa.`,
            embeds: []
        })
        .then(() => interaction.channel.awaitMessages({ filter, max: 1, time: 60_000 }))
        .then(collected =>{
            let msg = collected.first();
            reactionVoices.category = msg.content;
            return msg.delete();
        })
        .then(() => interaction.editReply(`${interaction.member}, Seleccione un emoji.`))
        .then(() => {
            return interaction.channel.awaitMessages({ filter, max: 1, time: 60_000 })
        })
        .then(collected => {
            let msg = collected.first();
            if (!(!!msg.content.match(/<a?:.+?:\d+>/) || !!msg.content.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g))) throw { message: 'El emoji enviado no era valido', type: 'validate' }
            reactionVoices.emoji = msg.content;
            return msg.delete();
        })
        .then(() => interaction.editReply(`Establese limites para crear canales. Ejemplo: \`2,4,5,6,8,10\` El 0 equivale a ilimitada. Cualquier otro valor sera tomada como invalida`))
        .then(() => interaction.channel.awaitMessages({ filter, max: 1, time: 60_000 }))
        .then(collected => {
            let msg = collected.first()
            reactionVoices.userLimit = msg.content.split(',');
            return msg.delete();
        })
        .then(() => reactions.push(reactionVoices))
        .then(() => interaction.editReply(`${interaction.member}, desea agregar mas botones? \`(si/no)\``))
        .then(() => interaction.channel.awaitMessages({ addFilter, max: 1, time: 60_000 }))
        .then(collected => {
            let msg = collected.first()
            msg.delete()
            if (msg.content.toLowerCase() === 'si' && reactions.length <= 25)
                return createReactions(interaction);
            
            return reactionVoices
        })
}

module.exports = createReactions
