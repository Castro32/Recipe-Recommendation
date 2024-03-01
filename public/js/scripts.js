const openModalBtn = document.getElementById('open-modal-btn');
const modal = document.getElementById('modal');

openModalBtn.addEventListener('click', () => {
  modal.classList.remove('hidden'); // Remove hidden class to show modal
});
