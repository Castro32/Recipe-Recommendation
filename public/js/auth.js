function handleRegistration(event) {
    event.preventDefault(); // Prevent the form from submitting normally
  
    // Get form values
    const firstName = document.getElementById('First_Name').value;
    const lastName = document.getElementById('Last_Name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const registerForm = document.getElementById('register-form');
    const signout = document.getElementById('signout');
  
    // Create user object
    const userdata= {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      role: 'user',
      profilePicture: '',
      last_login: Date.now()
    };
   
    // Create user with email and password
   
      auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        var user = auth.currentUser
        // Add additional user data to Firestore
        console.log("User created: ", userCredential.user.uid);

        db.collection("userdocs").doc(userCredential.user.uid).set(userdata)
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
      })
      .catch((error) => {
        console.error("Error creating user: ", error);
        // Handle registration error
        alert("Registration failed. Please try again later.");
      });

      signout.addEventListener('click', () => {
        auth.signOut().then(() => {
          console.log('user signed out');
        });
      });
      
  }
  