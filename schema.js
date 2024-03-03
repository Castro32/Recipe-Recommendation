const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    // User ID (generated automatically on insert)
    _id: mongoose.Schema.Types.ObjectId,
 
    // Basic Information
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer not to say'], // Optional: Allow customization
        required: true,
    },
    age: {
        type: Number,
        min: 1, // Ensure valid age range
        max: 120,
        required: true,
    },
    diet_type: String,
    activity_lifestyle: String, // Add this line
    medical_history: Boolean,
    medical_details_choice: String,
    weight: {
        type: Number,
        min: 1,
        required: true,
    },
    height: {
        type: Number,
        min: 1,
        required: true,
    },
    fitness_goal: String,
    recommended_recipes: [String] // Array of recommended recipes
});


module.exports = mongoose.model('UserInfo', userSchema);