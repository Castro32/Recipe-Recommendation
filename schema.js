const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    // User ID (generated automatically on insert)
    _id: mongoose.Schema.Types.ObjectId,
 
    // Basic Information
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer not to say'],
        required: true,
    },
    age: {
        type: Number,
        min: 1, 
        max: 120,
        required: true,
    },
    diet_type: String,
    activity_lifestyle: String, 
    medical_history: {
        type: String
      },
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
});


module.exports = mongoose.model('UserInfo', userSchema);


///recommended Recipees Schema
//should contain ingredients and instructions to cook it 
/*const recipeSchema = new mongoose.Schema({

    name: {
      type: String,
      required: true 
    },
  
    ingredients: [{
      name: {
        type: String,
        required: true
      },
      quantity: { 
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['cups', 'grams', 'ounces']
      }
    }],
  
    instructions: [{
      stepNumber: {
        type: Number,
        required: true  
      },
      text: {
        type: String, 
        required: true
      }
    }],
  
    benefits: [{
      benefit: {
        type: String,
        required: true
      },
      description: String 
    }],
  
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch','dinner'] 
    } 
  
  },
  {
     timestamps: true  
  });
  
  module.exports = mongoose.model('Recipe', recipeSchema);
  */