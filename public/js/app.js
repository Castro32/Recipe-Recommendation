document.getElementById('resetPassword').addEventListener('click', function() {
    var email = document.getElementById('email').value;

    if (!firebase.apps.length) {
      // Firebase has not been initialized
      throw new Error('Firebase must be initialized before using any Firebase services');
    }

    auth.sendPasswordResetEmail(email).then(function() {
      // Password reset email sent.
      alert('Password reset email sent.');
    }).catch(function(error) {
      // An error happened.
      console.error('Error sending password reset email:', error);
    });
  }
);