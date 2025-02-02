class Config {
    constructor() {
        this.baseConfig = {
            PORT: process.env.PORT || 8000,
            HOST: process.env.HOST || '0.0.0.0',
            ENV: process.env.NODE_ENV || 'development',
        };
    }

    getBaseConfig() {
        return this.baseConfig;
    }
}

module.exports = { Config };
