const { MessageEmbed } = require("discord.js");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            description: "Muestra la ayuda de todos los comandos del bot.",
            category: "Utilidad",
            usage: "[help]",
            options: [{
                name: "command",
                description: "Mensione un comando",
                type: "STRING"
            }],
            default_permission: true
        });
    }

    async execute(interaction, [command]) {
        const embed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor(
                `${interaction.guild.name} - Menu de ayuda`,
                interaction.guild.iconURL({ dynamic: true })
            )
            .setThumbnail(this.client.user.displayAvatarURL())
            .setFooter(
                `Solicitado por ${interaction.member.user.username}`,
                interaction.member.displayAvatarURL({ dynamic: true })
            )
            .setTimestamp();

        if (command) {
            const cmd =
                this.client.globalCommands.get(command) ||
                this.client.globalCommands.get(this.client.aliases.get(command));

            if (!cmd)
                return interaction.editReply(
                    `Nombre del comando \`${command}\` no existe.`
                );

            embed.setAuthor(
                `${this.client.utils.capitalise(cmd.name)} Ayuda del comando.`,
                this.client.user.displayAvatarURL()
            );
            embed.setDescription(
                `**❯ Alias:** ${
                    cmd.aliases.length
                        ? cmd.aliases.map((alias) => `\`${alias}\``).join(" ")
                        : "Sin aliases"
                }
                **❯ Descripción:** ${cmd.description}
                **❯ Ejemplo:** ${cmd.example}
                **❯ Categoria:** ${cmd.category}
                **❯ Uso:** ${cmd.usage}`,
            );

            return interaction.editReply({content: "\u200b", embeds: [embed]});
        } else {
            embed.setDescription(
                `Estos son los comandos disponibles para ${interaction.guild.name}`
            );
            let categories = this.client.utils.removeDuplicates(
                this.client.globalCommands
                    .filter((cmd) => interaction.member.permissions.has(cmd.permUser))
                    .map((cmd) => cmd.category)
            );
            // if (!(message.member.hasPermission("MANAGE_GUILD"))) {
            //     categories = this.client.utils.removeDuplicates(
            //         this.client.commands
            //             .filter((cmd) => message.member.hasPermission(cmd.permUser))
            //             .map((cmd) => cmd.category)
            //     );
            // } else {
            //     categories = this.client.utils.removeDuplicates(
            //         this.client.commands.map((cmd) => cmd.category && message.member.hasPermission(cmd.permUser))
            //     );
            // }

            for (const category of categories) {
                embed.addField(
                    `**${this.client.utils.capitalise(category)}**`,
                    this.client.globalCommands
                        .filter((cmd) => cmd.category === category && interaction.member.permissions.has(cmd.permUser))
                        .map((cmd) => `\`${cmd.name}\``)
                        .join(" ")
                    + "\u200b"
                );
            }
            return interaction.editReply({content: "\u200b", embeds: [embed]});
        }
    }
};
