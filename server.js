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
const admin = require('firebase-admin');
// Initialize Firebase Admin SDK
const serviceAccount = require('./native-functions-dd65b-firebase-adminsdk-1x0vr-19c118f2a5.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  ignoreUndefinedProperties: true, 
  databaseURL: 'default',
});
const db = admin.firestore();


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


 // const {name, age, gender, height, weight, goal} = req.body;
  // Create new user object
  const user = new UserInfo({
    _id: new mongoose.Types.ObjectId(),  
    gender: req.body.gender,
    age: req.body.age,
    diet_type: req.body.diet_type,
    activity_lifestyle: req.body.activity_lifestyle,
    medical_history: req.body.medical_history, 
    medical_details: req.body.medical_details,
    weight: req.body.weight,
    height: req.body.height,
    fitness_goal: req.body.fitness_goal
  });

  try {
      
  const savedUser = await user.save(); 
  
    // Send success response 
 //   res.sendStatus(201);
    
    console.log('User data stored successfully', savedUser._id);
  res.status(201).json({ message: "User created successfully", user: savedUser });
  // Get user details
//const userDetails = await UserInfo.findById(savedUser._id);

//console.log('User details:', userDetails);
  // Recommend recipes
//const recipes = await recommendRecipes(userDetails);


  // Save recipes
 // await db.collection('recipes').add({
  //  userId: userDetails._id,
  //  recipes
  //});

  //console.log('Recipes saved to Firestore');

  } catch (error) {

    // Send error response
    res.status(500).send('Error storing user data');

    console.error('Error storing user data:', error); 
  }
});

app.get('/api/user-info', async (req, res) => {
  try {
    const users = await UserInfo.find();
    console.log('User data:', users);
    res.json(users);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).send('Error fetching user data');
  }
});

async function recommendRecipes() {
  try {
    const users = await UserInfo.find();
    console.log('Users:', users)

    for (const userData of users) {
      const prompt = `Please recommend 7 recipes, one for each day of the week, that meet the following preferences:
      - Gender: ${userData.gender}  
      - Age: ${userData.age}
      - Weight: ${userData.weight} lbs  
      - Height: ${userData.height} inches
      - Goal: ${userData.fitness_goal} 
      - Diet: ${userData.diet_type}
      
      For each recipe, include the:
      - Recipe name
      - Ingredient list with quantities and units 
      - Step-by-step instructions
      - Health benefits      
    `;

      try {
        // Call OpenAI API with optimized parameters (example, adjust as needed)
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500, 
            n: 7, 
            stop: null,
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OA_API_KEY}`, // Use environment variable for security
            },
          }
        );
        const recommendedRecipes =  response.data.choices[0].message.content;

  
        const recipesRef = db.collection('recipes').doc();
        await recipesRef.set({ recipes: recommendedRecipes });
        console.log('Recipe recommendation successful', recommendedRecipes)
      } catch (error) {
        console.error('Error recommending recipes for user', userData._id, error.message);
      }
    }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
/*
        await recipeSchema.updateOne(
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
*/


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
