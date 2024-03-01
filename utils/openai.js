const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const OPENAI_API_KEY = process.env.OA_API_KEY;

// Initialize Firebase Admin SDK
const serviceAccount = require('../native-functions-dd65b-firebase-adminsdk-1x0vr-19c118f2a5.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: '',
});
const db = admin.firestore();

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Handle form submission
app.post('/api/user-data', async (req, res) => {
  const userData = req.body;
  try {
    const userRef = db.collection('users').doc(userData.userId);
    await userRef.set(userData);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error storing user data:', error);
    res.sendStatus(500);
  }
});

// Recipe recommendation function
async function recommendRecipes() {
  try {
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(async (doc) => {
      const userData = doc.data();
      const prompt = `
        Given the following user data:
        - Gender: ${userData.gender}
        - Age: ${userData.age}
        - Weight: ${userData.weight} lbs
        - Height: ${userData.height} inches
        - Active Lifestyle: ${userData.activeLifestyle}
        - Diet Type: ${userData.dietType}
        - Fitness Goal: ${userData.fitnessGoal}

        Please recommend a recipe for each day of the week that aligns with the user's preferences and goals.
      `;

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

      const recommendedRecipes = response.data.choices[0].message.content;
      const recipesRef = db.collection('recipes').doc(userData.userId);
      await recipesRef.set({ recipes: recommendedRecipes });
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Set up cron job to run recipe recommendation function every day at midnight
cron.schedule('0 0 * * *', recommendRecipes);

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});