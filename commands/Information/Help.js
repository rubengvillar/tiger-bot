const { MessageEmbed } = require("discord.js");
const getLocale = require("../../helpers/translate/getLocale");
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

    async execute(interaction, { command }) {
        const translate = getLocale(interaction, this.client)

        const embed = new MessageEmbed()
            .setColor("BLUE")
            .setAuthor(
                `${interaction.guild.name} - ${translate('help.title')}`,
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
                    translate("help.command.existed", { command })
                );

            embed.setAuthor(
                translate('help.command.title', { command: this.client.utils.capitalise(cmd.name) }),
                this.client.user.displayAvatarURL()
            );
            embed.setDescription(
                translate('help.command.description', 
                    { 
                        description: cmd.description,
                        example: cmd.example,
                        category: cmd.category,
                        usage: cmd.usage
                    })
            );

            return interaction.editReply({content: "\u200b", embeds: [embed]});
        } else {
            embed.setDescription(
                translate('help.description', {guild: interaction.guild.name })
            );
            embed.addField('SlashCommands', `${translate('help.slashcommands')} \`/\``)
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
                        .map((cmd) => `\`/${cmd.name}\``)
                        .join(" ")
                    + "\u200b"
                );
            }
            return interaction.editReply({content: "\u200b", embeds: [embed]});
        }
    }
};
