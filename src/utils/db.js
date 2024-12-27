const mongoose = require('mongoose');

const connectToMongoDB = () => {
    const uri = process.env.MONGO_URI; 

    if (!uri) {
        console.error('MONGO_URI is not defined in the environment variables');
        process.exit(1); 
    }

    mongoose
        .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB connection successful'))
        .catch(err => {
            console.error('MongoDB connection error:', err);
            process.exit(1); 
        });
};

module.exports = { connectToMongoDB };
