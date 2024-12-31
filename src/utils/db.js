const mongoose = require('mongoose');

const connectToMongoDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error('MONGO_URI is not defined in the environment variables');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('MongoDB connection successful');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = { connectToMongoDB };