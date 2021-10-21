const { slashCommands } = require("../../helpers/SlashCommands");
const Event = require("../../Structures/Event");

module.exports = class extends (
    Event
) {
    constructor(...args) {
        super(...args, {
            once: true,
        });
    }

    async run(interaction) {
        slashCommands(this.client ,interaction)
    }
};
