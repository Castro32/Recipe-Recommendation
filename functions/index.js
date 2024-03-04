const { onRequest } = require("firebase-functions/v2/https");
const admin = require('firebase-admin');
admin.initializeApp();
const {setGlobalOptions} = require("firebase-functions/v2/options");
setGlobalOptions({maxInstances: 10});
const functions = require('firebase-functions');

const db = admin.firestore();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cors({origin: true}));

app.use(cors({origin: true}));
exports.addminrole = onRequest(async (req, res) => {
    // Check if the request is authenticated
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(403).send('Unauthorized');
    }

    const idToken = req.headers.authorization.split('Bearer ')[1];

    try {
        // Verify the ID token to get the user's UID and custom claims
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check if the user has the 'admin' custom claim
        if (decodedToken.admin !== true) {
            return res.status(403).send('Unauthorized');
        }

        // Admin-specific logic
        const email = req.query.email;
        const customClaims = {
            admin: true
        };

        // Add custom claim to make the user an admin
        await admin.auth().setCustomUserClaims(uid, customClaims);

        return res.send({
            message: `Success! ${decodedToken.email} has been made an admin`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

exports.isAdmin = functions.https.onCall(async (data, context) => {
    const email = data.email;
    const idToken = data.idToken;
    const adminEmail = 'oumaoduor5827@gmail.com'; 
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (email === adminEmail && decodedToken.admin === true) {
        return { isAdmin: true };
      } else {
        return { isAdmin: false };
      }
    } catch (error) {
      console.error('Error verifying ID token:', error);
      throw new functions.https.HttpsError('invalid-argument', 'Invalid ID token');
    }
  });

