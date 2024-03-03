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
*/


app.post('/api/user-data', async (req, res) => {
  const newUser = new UserInfo(req.body);
  const userId=newUser._id;

  try {
    
    await newUser.save();
    console.log('User data stored successfully');
    res.sendStatus(201); 
  } catch (err) {
    console.error('Error storing user data:', err);
    res.status(500).send('Error storing user data');
  }
});

app.get('/api/user-info', async (req, res) => {
  try {
    const users = await UserInfo.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).send('Error fetching user data');
  }
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

mongoose.connection.once('open',()=>{
  console.log(`Connected Successfully to the Database: ${mongoose.connection.name}`)
  app.listen(port, () => {
    console.log(`app is running at localhost:${port}`);
  });
  })
/*const express = require('express');
const mysql = require('mysql'); 
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "baro"
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

app.post('/api/user-data', (req, res) => {
  // Log the user payload
  console.log("User Payload:", req.body);

  const {
    gender,
    age,
    diet_type,
    activity_lifestyle,
    medical_history,
    medical_details,
    medical_details_choice,
    weight,
    height,
    fitness_goal,
  } = req.body;

  const sql = "INSERT INTO cas (gender, age, diet_type, activity_lifestyle, medical_history, medical_details, medical_details_choice, weight, height, fitness_goal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [gender, age, diet_type, activity_lifestyle, medical_history, medical_details, medical_details_choice, weight, height, fitness_goal];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error storing user data:', err);
      res.status(500).send('Error storing user data');
    } else {
    //  console.log("User created:", result);

      // Construct user details object
      const userDetails = {
        id: result.insertId,
        gender,
        age,
        diet_type,
        activity_lifestyle,
        medical_history,
        medical_details,
        medical_details_choice,
        weight,
        height,
        fitness_goal
      };
      app.get('/api/user-data', (req, res) => {
        db.query("SELECT * FROM users", (err, result) => {
          if (err) {
            console.error('Error getting user data:', err);
            res.status(500).send('Error getting user data');
          } else {
            console.log("User data:", result);
            return res.status(200).json({ message: "User data retrieved successfully", users: result });
          }
        }
      )})
      
       console.log("User created:", userDetails);
      return res.status(201).json({ message: "User created successfully", user: userDetails });  
    }
  });
});


const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
*/
