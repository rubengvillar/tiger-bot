module.exports.slashCommands = async (client, interaction) => {
    if (!interaction.isCommand()) return
    await interaction.deferReply({ ephemeral: false }).catch(() => {});

    const cmd = client.globalCommands.get(interaction.commandName);
    if (!cmd)
        return interaction.editReply({ content: "An error has occured ", ephemeral: true });

    const args = [];

    for (let option of interaction.options.data) {
        if (option.type === "SUB_COMMAND") {
            if (option.name) args.push(option.name);
            option.options?.forEach((x) => {
                if (x.value) args.push(x.value);
            });
        } else if (option.value) args.push(option.value);
    }
    interaction.member = interaction.guild.members.cache.get(interaction.user.id);
    try {
        cmd.execute(interaction, args);
    } catch (error) {
		console.error(error);
		await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
};
