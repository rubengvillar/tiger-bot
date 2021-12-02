const { promisify } = require("util");
const glob = promisify(require("glob"));
const path = require("path");
var fs = require('fs');


module.exports = async () => {
    // var files = fs.readdirSync(`${path.dirname(require.main.filename)}${path.sep}commands\\**\\*.js`);
    // console.log(files)
    return await glob(`${process.cwd()}/commands/**/*.js`).then(
        (commands) => {
            return commands.map(commandFile => {
                let { name } = path.parse(commandFile);

                return {
                    name,
                    value: name.toLowerCase()
                }
            })
        }
    ).then(commands => commands);
}
