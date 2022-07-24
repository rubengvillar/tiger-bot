const fetch = require('node-fetch')
const Command = require("../../Structures/Command");
const getLocale = require("../../helpers/translate/getLocale");
const { MessageEmbed } = require("discord.js");
const moment = require('moment');

module.exports = class extends (
    Command
) {
    constructor(...args) {
        super(...args, {
            category: "Users",
            usage: "/vote",
            description: "Muestra si votaste o no.",
        });
    }

    async execute(interaction) {
        const translate = getLocale({
            interaction,
            client: this.client
        })

        const member = interaction
        const { user } = member
        const botId = this.client.user.id
        const userId = user.id

        // const urlApi = `https://top.gg/api/bots/769224156562587648/check?userId=${userId}`
        const urlApi = `https://top.gg/api/bots/${botId}/check?userId=${userId}`
        const options = {
            headers: {
                Authorization: process.env.TOPGG_SECRET_KEY
            }

        }

        const voted = new MessageEmbed()
            .setTitle(`${member.user.username}#${member.user.discriminator}`)
            .setThumbnail(member.user.avatarURL({ dynamic: true }))

        return fetch(urlApi, options)
            .then(resp => resp.json())
            .then(resp => {
                if (resp.error) throw new error('No he podido obtener la informacion.');
                if (resp.voted) {
                    return interaction.editReply({ 
                        embeds: [voted
                            .setDescription('Gracias por haber votado por mi!')
                            .setColor('GREEN')
                        ]
                    })
                } else {
                    return interaction.editReply({ 
                        embeds: [voted.setDescription('Aun no has votado.').setColor('DARK_ORANGE')
                        .addField('Votame en:', `(Link)[https://top.gg/bot/769224156562587648/vote]`)
                    ]
                    })
                }
            })
            .catch(err => interaction.editReply({
                embeds: [new MessageEmbed()
                    .setTitle('No pude realizar la consulta')
                    .setDescription('No pude obtener la información de voto.')
                    .setColor('YELLOW')
                    .setTimestamp()]
            })
            )

    }
};
