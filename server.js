const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const admin = require('firebase-admin');
require('dotenv').config();

//const { getFirestore, doc, setDoc, updateDoc, getDoc } = require('firebase/firestore');
const app = express();
const OPENAI_API_KEY = process.env.OA_API_KEY;

// Initialize Firebase Admin SDK
const serviceAccount = require('./native-functions-dd65b-firebase-adminsdk-1x0vr-19c118f2a5.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'default',
});
const db = admin.firestore();

// Parse form data
app.use(express.urlencoded({ extended: true }));


/*
app.post('/api/user-data', async (req, res) => {
  try {
    const db = 
    const { userData } = req.body;

    if (!userData) {
      return res.status(400).send('User data is required');
    }

    const userRef = doc(db, 'userdoc');
    
    // Define allowed fields and their validation rules
    const allowedFields = ['Gender', 'Age', 'Height', 'Weight', 'Diet_Type', 'Active_Lifestyle', 'Fitness_Goal'];
    const validations = {
      Gender: { required: true, maxLength: 20 },
      Age: { required: true, type: 'number' },
      Height: { type: 'number' },
      Weight: { type: 'number' },
      Diet_Type: { maxLength: 50 },
      Active_Lifestyle: { type: 'boolean' },
      Fitness_Goal: { maxLength: 100 }
    };

    // Validate and construct data object
    const data = {};
    for (const field of allowedFields) {
      if (userData.hasOwnProperty(field)) {
        const value = userData[field];
        const validation = validations[field];
        
        // Validate required fields
        if (validation.required && !value) {
          return res.status(400).send(`${field} is required`);
        }
        
        // Validate type
        if (validation.type && typeof value !== validation.type) {
          return res.status(400).send(`${field} must be of type ${validation.type}`);
        }
        
        // Validate max length
        if (validation.maxLength && value.length > validation.maxLength) {
          return res.status(400).send(`${field} has a max length of ${validation.maxLength}`);
        }

        // Set data
        data[field] = value;
      }
    }

    await setDoc(userRef, data);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error storing user data:', error);
    res.sendStatus(500);
  }
});

app.get('/api/user-data/:userId', async (req, res) => {
    try {
      const db = getFirestore();
      const userRef = doc(db, 'userdoc', req.params.userId);
      const docSnap = await getDoc(userRef);
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        res.json(userData);
      } else {
        res.status(404).send('User data not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.sendStatus(500);
    }
  });
  */

// Handle form submission
app.post('/api/user-data', async (req, res) => {
    try{
   // Destructure properties from req.body
   const { userData } = req.body;

   if (!userData) {
    return res.status(400).send('User data is required');
  }

   const allowedFields = ['Gender', 'Age', 'Height', 'Weight', 'Diet_Type', 'Active_Lifestyle', 'Fitness_Goal'];
   const validations = {
     Gender: { required: true, maxLength: 20 },
     Age: { required: true, type: 'number' },
     Height: { type: 'number' },
     Weight: { type: 'number' },
     Diet_Type: { maxLength: 50 },
     Active_Lifestyle: { type: 'boolean' },
     Fitness_Goal: { maxLength: 100 }
   };
   const userRef = db.collection('userdoc').doc()

       // Validate and construct data object
       const data = {};
       for (const field of allowedFields) {
         if (userData.hasOwnProperty(field)) {
           const value = userData[field];
           const validation = validations[field];
           
           // Validate required fields
           if (validation.required && !value) {
             return res.status(400).send(`${field} is required`);
           }
           
           // Validate type
           if (validation.type && typeof value !== validation.type) {
             return res.status(400).send(`${field} must be of type ${validation.type}`);
           }
           
           // Validate max length
           if (validation.maxLength && value.length > validation.maxLength) {
             return res.status(400).send(`${field} has a max length of ${validation.maxLength}`);
           }
   
           // Set data
           data[field] = value;
         }
         }
         console.log('user data', data)
            await userRef.set(data);
            res.sendStatus(200);
    } catch (error) {
        console.error('Error storing user data:', error);
        res.sendStatus(500);
        }
    });
   

/*const {
    Gender="rather not say", //
    Age=3,
    Height=170,
    Weight=70,
    Diet_Type="humbeger",
    Active_Lifestyle=true,
    Fitness_Goal="lose weight"
}= req.body; */

 

async function checkDbConnection() {
    try {
      const status = await admin.firestore().collection('userdoc').get();
      console.log('Firestore database connection OK');
    } catch (error) {
      console.error('Error connecting to Firestore:', error);
    }
  }
// Recipe recommendation function
async function recommendRecipes() {
  try {
    const usersSnapshot = await db.collection('userdoc').get({merge:true});
    usersSnapshot.forEach(async (doc) => {
        console.log('user data', doc.data())
      const userData = doc.data();
      const prompt = `
        Given the following user data:
        - Gender: ${userData.Gender}
        - Age: ${userData.Age}
        - Weight: ${userData.Weight} lbs
        - Height: ${userData.Height} inches
        - Active_Lifestyle: ${userData.Active_Lifestyle}
        - Diet_Type: ${userData.Diet_Type}
        - Fitness_Goal: ${userData.Fitness_Goal}

        Please recommend a recipe for each day of the week that aligns with the user's preferences and goals.
      `;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          n: 1,
          stop: null,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const recommendedRecipes = response.data.choices[0].message.content;
      const recipesRef = db.collection('recipes').doc(userData.userId);
      await recipesRef.set({ recipes: recommendedRecipes });
      console.log('Recipe recommendation successful', recommendedRecipes)
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Set up cron job to run recipe recommendation function every 1 minute
cron.schedule('*/9 * * * *', () => {
    console.log('Running recipe recommendation');
    recommendRecipes();
  });


async function recommendRecipesWithRetry() {
    const maxRetries = 3; // Maximum number of retries
    let retries = 0;
  
    while (retries < maxRetries) {
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
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
              },
            }
          );
    
        await recommendRecipes();
        console.log('Recipe recommendation successful');
        return; // Exit the loop if successful
      } catch (error) {
        console.error('Error recommending recipes:', error.message);
        retries++;
        console.log(`Retrying (${retries}/${maxRetries})...`);
        // Wait for some time before retrying (you can adjust this time interval)
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds
      }
    }

    console.error('Maximum retries exceeded. Unable to recommend recipes.');
  }
  
  // Modify your cron job to call the function with retry logic
  cron.schedule('0 0 * * *', recommendRecipesWithRetry);
  
async function startServer() {

    await checkDbConnection();
  
    app.listen(3000, () => {
      console.log(' App is listening on port 3000!'); 
    });
  
  }
  startServer();

  // Check connection on startup
  checkDbConnection();  
  
  // Check connection periodically
  setInterval(checkDbConnection, 60*1000);