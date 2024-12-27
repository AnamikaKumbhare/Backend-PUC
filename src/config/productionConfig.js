const { DevConfig } = require("./devConfig");

class DeveloperConfig extends DevConfig {
    constructor() {
        super();
        this.developerConfig = {
            ...this.getDevConfig(),
            FEATURE_FLAG: 'on', 
        };
    }

    getDeveloperConfig() {
        return this.developerConfig;
    }
}

module.exports = { DeveloperConfig };
