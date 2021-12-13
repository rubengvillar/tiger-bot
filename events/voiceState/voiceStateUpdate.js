const joinInteractionChannel = require("../../helpers/joinInteractionChannel");
const leftReactionVoices = require("../../helpers/leftInteractionChannel");
const Event = require("../../Structures/Event");

module.exports = class extends (
    Event
) {
    async run(oldState, newState) {
        leftReactionVoices(this.client, oldState, newState);
        joinInteractionChannel(this.client, oldState, newState);
    }
}
