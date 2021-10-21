const { isBoolean } = require("util");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Command {
    constructor(client, name, options = {}) {
        this.client = client;
        this.name = options.name || name;
        this.aliases = options.aliases || [];
        this.description = options.data.description || "No se proporciono una descripcion.";
        this.example = options.example || "No se a proporcionado un ejemplo";
        this.category = options.category || "Otros.";
        this.usage = options.usage || "No se proporciono un uso";
        this.permBot = options.permBot || [];
        this.permUser = options.permUser || [];
        this.permChannel = options.permChannel || [];
        this.data = new SlashCommandBuilder()
		    .setName(options.data.name)
		    .setDescription(options.data.description)
            .setDefaultPermission(typeof options.data.default_permission === 'boolean' ? options.data.default_permission : true),
        this.type = options.type || 'USER'
    }
};