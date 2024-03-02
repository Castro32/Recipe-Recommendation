


const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const modal = document.getElementById('modal');

openModalBtn.addEventListener('click', () => {
  modal.classList.remove('hidden'); // Remove hidden class to show modal
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden'); // Add hidden class to hide modal
});


// Handle form submission
document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault();

  const reportTitle = document.getElementById("task-title").value;
  const reportDescription = document.getElementById("task-description").value;
  const taskItems = Array.from(document.querySelectorAll("#task-list input")).map(input => input.value);

  db.collection("reports").add({
    title: reportTitle,
    description: reportDescription,
    taskItems: taskItems,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    console.log("Report created successfully!");
    // Close the modal or perform any other necessary actions
    modal.classList.add('hidden');

  })
  .catch((error) => {
    console.error("Error creating report: ", error);
  });
});

// Fetch reports from Firestore
db.collection("reports").orderBy("createdAt", "desc").onSnapshot((querySnapshot) => {
  const reports = document.querySelector(".reports");

  querySnapshot.forEach((doc) => {
    const report = doc.data();
    const reportElement = document.createElement("div");
    reportElement.innerHTML = `
      <h2>${report.title}</h2>
      <p>${report.description}</p>
      <ul>
        ${report.taskItems.map(task => `<li>${task}</li>`).join("")}
      </ul>
    `;
    reports.appendChild(reportElement);
  });
});
