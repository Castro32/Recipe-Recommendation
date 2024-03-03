

const firebaseConfig = {
  apiKey: "AIzaSyCpd0Mwy_BudiA-z3KMsfrqw3nt3Gy7h6M",
  authDomain: "native-functions-dd65b.firebaseapp.com",
  projectId: "native-functions-dd65b",
  storageBucket: "native-functions-dd65b.appspot.com",
  messagingSenderId: "773232537571",
  appId: "1:773232537571:web:68ab00cedad20c66397ad6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const functions = firebase.functions();
const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const settings = { timestampsInSnapshots: true };
db.settings(settings);


// Reference messages collection
var messagesRef = firebase.database().ref('messages');

// Listen for form submit
document.getElementById('contactForm').addEventListener('submit', submitForm);

// Submit form
function submitForm(e){
  e.preventDefault();

  // Get values
  var name = getInputVal('name');

  var email = getInputVal('email');

  var message = getInputVal('message');

  // Save message
  saveMessage(name,  email, message);

  // Show alert
  document.querySelector('.alert').style.display = 'block';

  // Hide alert after 3 seconds
  setTimeout(function(){
    document.querySelector('.alert').style.display = 'none';
  },3000);

  // Clear form
  document.getElementById('contactForm').reset();
}

// Function to get get form values
function getInputVal(id){
  return document.getElementById(id).value;
}

// Save message to firebase
function saveMessage(name, phone, message){
  var newMessageRef = messagesRef.push();
  newMessageRef.set({
    name: name,
    email:email,
    message:message
  });
}