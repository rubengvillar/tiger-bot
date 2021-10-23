const { glob } = require("glob");
const { promisify } = require("util");
const { Client } = require("discord.js");

const globPromise = promisify(glob);

module.exports = class {
    constructor(client) {
        this.client = client;
    }
}
