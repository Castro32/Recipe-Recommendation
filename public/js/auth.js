const form = document.getElementById('register-form');
const signout = document.getElementById('signout');
function handleRegistration(event) {
    event.preventDefault(); // Prevent the form from submitting normally
  
    // Get form values
    const email = form['email'].value;
    const password = form['password'].value;
    const firstName = form['First_Name'].value;
    const lastName = form['Last_Name'].value;
    const phone = form['phone'].value;
 
  
  
    // Create user object
    const userdata= {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      role: 'user',
      last_login: Date.now()
    };
   
    // Create user with email and password
   
      auth.createUserWithEmailAndPassword(email, password)
      .then((credential) => {
        console.log(credential.user)
        if (credential && credential.user) {
      //  var user = auth.currentUser
        // Add additional user data to Firestore
        console.log("User created: ", credential.user.uid);
        db.collection("userdocs").doc(credential.user.uid).set(userdata)
          .then(() => {
            // Handle successful registration
            alert("Registration successful!");
            registerForm.reset();
            // Redirect to login page after successful registration
            window.location.href = 'login.html';
          })
          .catch((error) => {
            console.error("Error adding user data to Firestore: ", error);
            // Handle registration error
            const registerError = registerForm.querySelector('.error');
            registerError.textContent = err.message;
            alert("Registration failed. Please try again later.");
          });
      }
      }
      )
      .catch((error) => {
        console.error("Error creating user: ", error);
        // Handle registration error
        alert("Registration failed. Please try again later.");
      });

 
      
  }
  

  signout.addEventListener('click', () => {
    auth.signOut().then(() => {
      console.log('user signed out');
    });
  });