const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

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
    const query = "SELECT * FROM lusers";
    db.query(query, async (err, results) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return;
      }

      for (const userData of results) {
        const prompt = `
          Given the following user data:
          - Gender: ${userData.Gender}
          - Age: ${userData.Age}
          - Weight: ${userData.Weight} lbs
          - Height: ${userData.Height} inches
          - Fitness Goal: ${userData.Fitness_Goal}
          - Diet Type: ${userData.Diet_Type}

          Please recommend a recipe for each day of the week that aligns with the user's preferences and goals.
        `;

        try {
          const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 500,
              n: 1,
              stop: null,
              temperature: 0.7,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer  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', // Replace with your OpenAI API key
              },
            }
          );

          const recommendedRecipes = response.data.choices[0].message.content;

          const insertQuery = "INSERT INTO recommended_recipes (user_id, recipes) VALUES (?, ?)";
          const insertValues = [userData.User_ID, recommendedRecipes];
          db.query(insertQuery, insertValues, (err, result) => {
            if (err) {
              console.error('Error storing recommended recipes:', err);
            } else {
              console.log('Recommended recipes stored successfully for user:', userData.User_ID);
            }
          });
        } catch (error) {
          console.error('Error recommending recipes for user:', userData.User_ID, error.message);
        }
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

cron.schedule('*/2 * * * *', () => {
  console.log('Running recipe recommendation');
  recommendRecipes();
});

app.listen(8082, () => {
  console.log('App is listening on port 8082');
});
