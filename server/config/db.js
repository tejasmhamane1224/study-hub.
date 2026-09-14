const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
        console.error('CRITICAL: MONGODB_URI environment variable is missing!');
        throw new Error('Database configuration missing. Please configure MONGODB_URI in Vercel settings.');
    }

    try {
        const db = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        throw err;
    }
};

module.exports = connectDB;
