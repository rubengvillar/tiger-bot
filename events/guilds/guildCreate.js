const firebase = require("../../data/firebase");
const Event = require("../../Structures/Event");

module.exports = class extends (
    Event
) {
    constructor(...args) {
        super(...args);
    }

    async run(gData) {
        firebase.collection("guilds").doc(gData.id).set({
            guildID: gData.id,
            guildName: gData.name,
            guildOwnerID: gData.ownerId,
            guildMemberCount: gData.memberCount,
            prefix: "#",
        })
        .then(()=>{
            const commandsList = this.client.globalCommands
            return gData.commands.set(commandsList)
        })
        .catch(console.error)
    }
};
