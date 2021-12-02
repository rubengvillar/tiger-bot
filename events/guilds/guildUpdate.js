const Event = require("../../Structures/Event");

module.exports = class extends (
    Event
) {
    constructor(...args) {
        super(...args, {
            once: false,
        });
    }

    async run(oldGuild, newGuild) {
        if (oldGuild.name === newGuild.name) return
        this.client.database.firestore().collection('guilds').doc(newGuild.id)
            .set({
                guildName: newGuild.name
            }, { merge: true });
    }
}
