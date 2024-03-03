const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            writeConcern: { w: 'majority' }
        });
        console.log("Connected to DB");

    } catch (err) {
        console.error("An error occurred while connecting to the DB:", err.message);
    }
};

module.exports = connectDB;