const { isBoolean } = require("util");
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class Command {
    constructor(client, name, properties = {}) {
        this.client = client;
        this.name = properties.name || name;
        this.aliases = properties.aliases || [];
        this.description = properties.description || "No se proporciono una descripcion.";
        this.example = properties.example || "No se a proporcionado un ejemplo";
        this.category = properties.category || "Otros.";
        this.usage = properties.usage || "No se proporciono un uso";
        this.permBot = properties.permBot || [];
        this.permUser = properties.permUser || [];
        this.permChannel = properties.permChannel || [];
        this.type = properties.type || 'CHAT_INPUT';
        this.options = properties.options || [];
        this.permissions = properties.permissions || { permissions: [] };
        // this.default_permission = properties.default_permission || false;
    }
};
