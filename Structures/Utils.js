const path = require("path");
const { promisify } = require("util");
const glob = promisify(require("glob"));
const Event = require("./Event.js");
const Command = require("./Command.js");
const getCommands = require("../helpers/getCommands.js");
const { addGuild, updateGuild, removeGuild } = require("../redux/reducers/guilds.js");
const { Permissions, MessageEmbed } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = class Util {
    constructor(client) {
        this.client = client;
    }

    isClass(input) {
        return (
            typeof input === "function" &&
            typeof input.prototype === "object" &&
            input.toString().substring(0, 5) === "class"
        );
    }

    get directory() {
        return `${path.dirname(require.main.filename)}${path.sep}`;
    }

    async loadCommands() {
        // console.log('Client Token:', this.client.token)
        // const clientId = this.client.user.id
        // const rest = new REST({ version: '9' }).setToken(this.client.token);
        getCommands()
            .then(async commandsNames => {
                this.client.commandsNames = commandsNames
            })
            .then(async () => {
                return await glob(`${this.directory}commands/**/*.js`).then(
                    async (commands) => {
                        let commandsList = []
                        commands.map(commandFile => {
                            delete require.cache[commandFile];
                            const { name } = path.parse(commandFile);
                            const File = require(commandFile);
                            
                            if (!this.isClass(File))
                                throw new TypeError(
                                    `Command ${name} doesn't export a class.`
                                );
                            const command = new File(this.client, name.toLowerCase());
                            if (!(command instanceof Command))
                                throw new TypeError(
                                    `Comamnd ${name} doesnt belong in Commands.`
                                );

                            this.client.globalCommands.set(command.name, command);
                            commandsList.push(command)
        
                            if (command.aliases.length) {
                                for (const alias of command.aliases) {
                                    this.client.aliases.set(alias, command.name);
                                }
                            }
                        })

                        this.client.guilds.cache.map(async guild => {
                            const guildRef = await this.client.database.collection('guilds').doc(guild.id).get()
                            // console.log(guildRef.data().guildLocale || guild.preferredLocale)
                            let commandsTemp = commandsList
                            commandsList = commandsTemp.map(command => {
                                // console.log(guild.name ,command.name, command.description)
                                // command.permissions.permissions.push({
                                //     id: guild.ownerId,
                                //     type: 'USER',
                                //     permission: true
                                // })
                                return command
                            })
                            // console.log(guildRef.data())
                            
                            // if (!guild.members.cache.get(this.client.user.id)?.permissions.has(Permissions.FLAGS.USE_APPLICATION_COMMANDS)) {
                            //     return guild.members.fetch(guild.ownerId)
                            //         .then(owner => {
                            //             owner.send({
                            //                 embeds: [
                            //                     new MessageEmbed()
                            //                         .setTitle(`Tiger bot: ${guild}`)
                            //                         .setColor('YELLOW')
                            //                         .setDescription(`No cuento con los permisos suficientes para crear comandos. Debes volver a invitarme. Expulsandome y volviendome a invitar`)
                            //                         .addField('Invitacion', `[Link](https://discord.com/oauth2/authorize?client_id=769224156562587648&permissions=1644971949559&guild_id=${guild.id}&scope=bot%20applications.commands)`, true)
                            //                 ]
                            //             })
                            //         })
                            // }
                            
                            // await rest.put(
                            //     Routes.applicationGuildCommands(clientId, guild.id),
                            //     { body: [] },
                            //     )
                            
                            // return rest.put(
                            //         Routes.applicationGuildCommands(clientId, guild.id),
                            //         { body: commandsList },
                            //     )
                            //         .catch(err => {
                            //             console.error('Errores',err)
                            //             return guild.members.fetch(guild.ownerId)
                            //             .then(owner => {
                            //                 owner.send({
                            //                     embeds: [
                            //                         new MessageEmbed()
                            //                             .setTitle(`Tiger bot: ${guild}`)
                            //                             .setColor('YELLOW')
                            //                             .setDescription(`No cuento con los permisos suficientes para crear comandos. Debes volver a invitarme. Expulsandome y volviendome a invitar`)
                            //                             .addField('Invitacion', `[Link](https://discord.com/oauth2/authorize?client_id=769224156562587648&permissions=1644971949559&guild_id=${guild.id}&scope=bot%20applications.commands)`, true)
                            //                             .addField('Servidor de soporte', `[Link](https://discord.gg/6235hfT87T)`, true)
                            //                     ]
                            //                 })
                            //             })
                            //         })
                            //     .catch(console.error)

                                
                            
                            await guild.commands.set([])
                                // .then(console.log)
                                .catch(console.error);
                            
                            // await this.client.application.commands.set(commandsList, guild.id)
                            //     .catch(console.error)
                            
                        });

                        return await this.client.application.commands.set(commandsList)
                            .then(loaded => console.log(`Comandos cargados`))
                            .catch(console.error);
                        
                        // return rest.put(
                        //     Routes.applicationCommands(clientId),
                        //     { body: commandsList },
                        // )
                        // .catch(console.error)
                        
                    }
                );
            })
    }

    loadEvents() {
    return new Promise((resolve, reject) => {
        glob(`${this.directory}events/**/*.js`).then((events) => {
            for (const eventFile of events) {
                delete require.cache[eventFile];
                const { name } = path.parse(eventFile);
                const File = require(eventFile);
                if (!this.isClass(File))
                    reject(
                        `Event ${name} doesn't export a class!`
                    );
                const event = new File(this.client, name);
                if (!(event instanceof Event))
                    reject(
                        `Event ${name} doesn't belong in Events`
                    );
                this.client.events.set(event.name, event);
                event.emitter[event.type](name, (...args) =>
                    event.run(...args)
                );
            }
            resolve()
        });
    })
        
    }

    formatBytes(bytes) {
        if (bytes === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${
            sizes[i]
        }`;
    }

    removeDuplicates(arr) {
        return [...new Set(arr)];
    }

    capitalise(string) {
        return string
            .split(" ")
            .map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
            .join(" ");
    }
    
    trimArray(arr, maxlen = 10) {
        if (arr.length > maxlen) {
            const len = arr.length - maxlen;
            arr = arr.slice(0, maxlen);
            arr.push(`${len} more..`);
        }
        return arr;
    }

    async loadGuilsInfo() {
        await this.client.database.collection('guilds').onSnapshot(async (docs) => {
            await docs.docChanges().forEach((change) => {
                    const guild = this.client.guilds.cache.get(change.doc.id)
                    if (guild === undefined) return
                    if (guild.id != change.doc.id) return
                    if (change.type === "added") {
                        this.client.store.dispatch(addGuild({
                            id: change.doc.id,
                            guildLocale: change.doc.data().preferredLocale || guild.preferredLocale,
                            ...change.doc.data(),
                        }))
                    }
                    if (change.type === "modified") {
                        this.client.store.dispatch(updateGuild({
                            id: change.doc.id,
                            guildLocale: change.doc.data().preferredLocale || guild.preferredLocale,
                            ...change.doc.data(),
                        }))
                    }
                    if (change.type === "removed") {
                        this.client.store.dispatch(removeGuild(change.doc.id))
                    }
            });
        });
    }
}
