let reactions = [];

const createReactions = async (message) => {
    let addReaction = false;
    let reactionsCreate = {
        emoji: '',
        category: ''
    }

    let messageBot = await message.channel.send(`Enviame un emoji o emoji que deseas que cree. Asegurate que sea un emoji agregado al server o por defecto.`);
    await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(collected =>{
            let msg = collected.first();
            reactionsCreate.emoji = msg.content;
            msg.delete();
        });

    messageBot.delete();

    messageBot = await message.channel.send(`Escribe el nombre del juego o sala?`);
    await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(collected =>{
            let msg = collected.first();
            reactionsCreate.category = msg.content;
            messageEmbed.setTitle(messageReaction.title);
            msg.delete();
        });
    messageBot.delete();
    
    messageBot = await message.channel.send(`Añadimos mas reacciones? \`SI/NO\``);
    await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(collected =>{
            let msg = collected.first();
            if (msg.content.toLowerCase() === 'no')
                addReaction = true
            msg.delete();
        });
    messageBot.delete();

    reactions.push(reactionsCreate)

    if(addReaction){
        return reactions ;
    }
    return createReaction(message)
}

exports = {
    createReactions
}
