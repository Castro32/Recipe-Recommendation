const express = require('express');
//const mysql = require('mysql');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const app = express();
require("dotenv").config();
const mongoose=require('mongoose')
const connectDB =require('./db')
const port = process.env.PORT || 5050;
const bodyParser = require("body-parser");
const UserInfo=require('./schema')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

// connect Database
connectDB(); 
/*
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "users"
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.post('/api/user-data', (req, res) => {
  const {
    Gender = "rather not say",
    Age ,
    Height,
    Weight ,
    Diet_Type,
    Active_Lifestyle = true,
    Fitness_Goal
  } = req.body;

  const sql = "INSERT INTO users (Gender, Age, Height, Weight, Diet_Type, Active_Lifestyle, Fitness_Goal) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [Gender, Age, Height, Weight, Diet_Type, Active_Lifestyle, Fitness_Goal];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error storing user data:', err);
      res.status(500).send('Error storing user data');
    } else {
      console.log('User data stored successfully');
      res.sendStatus(200);
    }
  });
});

app.get('/api/recommended-recipes', (req, res) => {
  const query = "SELECT * FROM recommended_recipes";
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching recommended recipes:', err);
      res.status(500).send('Error fetching recommended recipes');
    } else {
      res.json(results); // Send the fetched recommended recipes data as JSON response
    }
  });
});

async function recommendRecipes() {
  try {
    const users = await UserInfo.find();

    for (const userData of users) {
      const prompt = `
        Given the following user data:
        - Gender: ${userData.gender}
        - Age: ${userData.age}
        - Weight: ${userData.weight} lbs
        - Height: ${userData.height} inches
        - Fitness Goal: ${userData.fitness_goal}
        - Diet Type: ${userData.diet_type}

        Please recommend a recipe for each day of the week that aligns with the user's preferences and goals.
      `;

      try {
        // Call OpenAI API with optimized parameters (example, adjust as needed)
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500, // Allow for more detailed responses
            n: 7, // Generate recipes for each day of the week
            stop: null,
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Use environment variable for security
            },
          }
        );

        const recommendedRecipes = response.data.choices.map((choice) => choice.message.content);

        await UserInfo.updateOne(
          { _id: userData._id },
          { $set: { recommended_recipes: recommendedRecipes } }
        );

        console.log(`Recommended recipes updated for user ${userData._id}`);
      } catch (error) {
        console.error('Error recommending recipes for user', userData._id, error.message);
      }
    }
  } catch (error) {
    console.error('Error in recommendRecipes function:', error.message);
  }
}


cron.schedule('*/2 * * * *', () => {
  console.log('Running recipe recommendation');
  recommendRecipes();
});

app.listen(8082, () => {
  console.log('App is listening on port 8082');
});
