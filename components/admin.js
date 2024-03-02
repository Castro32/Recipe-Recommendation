

const db = firebase.firestore();

const settings = { timestampsInSnapshots: true };
db.settings(settings);

//check if firebase has been initialised 

if (!firebase.apps.length) {
  // Firebase has not been initialized
  throw new Error('Firebase must be initialized before using any Firebase services');
}

const adminresources = document.querySelectorAll('.admin');
const accdetails = document.querySelector('.account-details');
const setupUI = (user) => {
    if (user) {
      if(user.admin){
        adminresources.forEach(item => item.style.display = 'block');
      }
  //data  for the ccount details
      db.collection('userdocs').doc(user.uid).get().then(doc => {
        const html = `
        <div>Logged in as ${user.email}</div>
        <div>Hello there${doc.data()}</div>
        <div class="pink-text">${user.admin ? 'Admin' : ''}</div>
        `;
        accdetails.innerHTML = html;
      });
    }
    else {
      adminresources.forEach(item => item.style.display = 'none');
    }
    }


//admin role
const adminForm = document.querySelector('.admin-actions');
adminForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const adminEmail = adminForm['admin-email'].value;
  const addAdminRole = functions.httpsCallable('addAdminRole');
  addAdminRole({ email: adminEmail, }).then(result => {
    console.log(result);
  });
});

auth.onAuthStateChanged(user => {
  if (user) {
    user.getIdTokenResult()
    .then((idTokenResult) => {
       user.admin =(idTokenResult.claims.admin)
        console.log(user.admin)
          setupUI(user);
       //else show regular UI
      })
    .catch((error) => {
      console.log(error);
    });
      var uid = user.uid;
      console.log("user logged in", uid)
     

      // Fetch and display guides only when the user is logged in
      db.collection("userdocs").onSnapshot((querySnapshot) => {
          const userData = [];
          querySnapshot.forEach((doc) => {
              userData.push(doc.data());

              setupGuides(userData);
          });
          
          
      },(error) => {
        console.log(error.message);
        
    });



    }
    else {
      //setupUI();
      //setupGuides([]);
    }

    });