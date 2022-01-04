module.exports.slashCommands = async (client, interaction) => {
    if (!interaction.isCommand()) return
    await interaction.deferReply({ ephemeral: false }).catch(() => {});

    const cmd = client.globalCommands.get(interaction.commandName);
    if (!cmd)
        return interaction.editReply({ content: "An error has occured ", ephemeral: true }).catch(() => {});
    
    const args = {};
    for (let option of interaction.options.data) {
        if (option.type === "SUB_COMMAND") {            
            if (option.name) args.push(option.name);
            option.options?.forEach((x) => {
                if (x.value) args.push(x.value);
            });
        } else args[option.name] = option.value;
    }

    interaction.member = await interaction.guild.members.cache.get(interaction.user.id);
    interaction.channel = await interaction.guild.channels.cache.get(interaction.channelId);    
    
    try {
        interaction.channel.guild.members.fetch(client.user.id)
            .then(bot => {
                if (!bot.permissions.has(cmd.permBot))
                    return (bot.hasPermission('SEND_MESSAGES')) ? interaction.editReply(`Necesito los siguiente permisos \`${cmd.permBot.join(", ")}\``) : true;
                if (!interaction.member.permissions.has(cmd.permUser)) return interaction.editReply(`"❌ Permisos insuficientes... ${cmd.permUser.join(", ")}"`);
                return cmd.execute(interaction, args);
            })
            .catch(console.error)
        
    } catch (error) {
		console.error(error);
		await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
};
