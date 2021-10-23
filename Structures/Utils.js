const path = require("path");
const { promisify } = require("util");
const glob = promisify(require("glob"));
const Event = require("./Event.js");
const Command = require("./Command.js");

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

                    // if (command.aliases.length) {
                    //     for (const alias of command.aliases) {
                    //         this.client.aliases.set(alias, command.name);
                    //     }
                    // }
                })

                this.client.on("ready", ()=>{
                    this.client.guilds.cache.map(guild => {
                        guild.commands.set(commandsList)
                    });
                    // Register for all the guilds the bot is in
                    // this.client.application.commands.set(arrayOfSlashCommands);
                })
            }
        );
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
}
