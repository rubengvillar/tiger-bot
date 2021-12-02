const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const Command = require("../../Structures/Command");

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            aliases: ["pong"],
            category: "Manager",
            usage: "[setmute]",
            description: "configura el rol para los usuarios muteados o sancionados",
            options: [{
                name: "role",
                description: "Selecciona un rol que sera considerado para el mute o sancionado",
                type: "ROLE",
                required: true,
            }],
            default_permission: true
        });
    }

    async execute(interaction, [role]) {
        interaction.guild.roles.fetch(role)
        .then(async roleGuild => {
            if (roleGuild) return new Error('El rol no fue encontrado')
            return this.client.database.collection('guilds').doc(interaction.guild.id).update({
                roleMute: roleGuild.id
            })
        })
        .then(()=> {
            console.log(interaction.user)
            return interaction.editReply({
                content: '\u200b',
                embeds: [new MessageEmbed()
                    .setTitle('Rol mute o sancionado actualizado')
                    .setDescription(`El rol añadido es: <@&${role}>`)
                    .setFooter(`Solicitado por: ${interaction.user.username}#${interaction.user.duscriminator}`)
                    .setColor('GREEN')]
            });
        })
        .catch(error => interaction.editReply({
            content: '\u200b',
            embeds: [new MessageEmbed()
                .setTitle('Error al actualizar')
                .setDescription(`Error: ${error}
                Informe este error al area de soporte de ${this.client.user}`)
                .setFooter(`Solicitado por: ${interaction.user.username}#${interaction.user.duscriminator}`)
                .setColor('RED')]
        }));
    }
}
