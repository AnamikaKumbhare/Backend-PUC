class Config {
    constructor() {
        this.baseConfig = {
            PORT: process.env.PORT || 3000,
            HOST: process.env.HOST || 'localhost',
            ENV: process.env.NODE_ENV || 'development',
        };
    }

    getBaseConfig() {
        return this.baseConfig;
    }
}

module.exports = { Config };