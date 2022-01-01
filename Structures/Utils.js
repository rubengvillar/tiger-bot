const path = require("path");
const { promisify } = require("util");
const glob = promisify(require("glob"));
const Event = require("./Event.js");
const Command = require("./Command.js");
const getCommands = require("../helpers/getCommands.js");
const { addGuild, updateGuild, removeGuild } = require("../redux/reducers/guilds.js");
const { Permissions } = require("discord.js");

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
        getCommands()
            .then(async commandsNames => {
                this.client.commandsNames = commandsNames
            })
            .then(async () => {
                return await glob(`${this.directory}commands/**/*.js`).then(
                    (commands) => {
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
        
                        this.client.on("ready", ()=>{
                            
                            this.client.guilds.cache.map(async guild => {
                                // let commandsTemp = commandsList
                                // commandsTemp.map(command => {
                                //     console.log(guild.name ,command.name, 'addOwner')
                                //     command.permissions.permissions.push({
                                //         id: guild.ownerId,
                                //         type: 'USER',
                                //         permission: true
                                //     })
                                //     return command
                                // })
                                if (!guild.members.cache.get(this.client.user.id).permissions.has(Permissions.FLAGS.USE_APPLICATION_COMMANDS)) return console.log(`Sin permisos`)
                                await this.client.application.commands.set(commandsList, guild.id)
                                    .then(console.log)
                                    .catch(console.error);
                                // await guild.commands.set(commandsList)
                                //     // .then(() => guild.commands.permissions.fetch())
                                //     // .then(permissions => console.log(guild.name, permissions))
                                //     .catch(console.error)
                                
                                // await this.client.application.commands.set(commandsList, guild.id)
                                //     .catch(console.error)
                                
                            });

                            // Register for all the guilds the bot is in
                            // this.client.application.commands.set(arrayOfSlashCommands);
                        })
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
                            ...change.doc.data(),
                            guildLocale: change.doc.data().preferredLocale || guild.preferredLocale
                        }))
                    }
                    if (change.type === "modified") {
                        this.client.store.dispatch(updateGuild({
                            id: change.doc.id,
                            ...change.doc.data(),
                            guildLocale: change.doc.data().preferredLocale || guild.preferredLocale
                        }))
                    }
                    if (change.type === "removed") {
                        this.client.store.dispatch(removeGuild(change.doc.id))
                    }
            });
        });
    }
}
