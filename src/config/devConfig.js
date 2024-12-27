// devConfig.js
const { Config } = require("./config");

class DevConfig extends Config {
    constructor() {
        super();
        this.devConfig = {
            ...this.getBaseConfig(),
            DEBUG: true,
        };
    }

    getDevConfig() {
        return this.devConfig;
    }
}

module.exports = { DevConfig };
