const profiles = JSON.parse(localStorage.getItem('profiles')) || []; // Carrega perfis do localStorage

// Função para salvar perfis no localStorage
function saveProfiles() {
  localStorage.setItem('profiles', JSON.stringify(profiles));
}

document.getElementById('createProfile').addEventListener('submit', function(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const bio = document.getElementById('bio').value;

  const profile = { id: generateRandomId(), name, bio, images: [] };
  profiles.push(profile);
  document.getElementById('createProfile').reset();
  saveProfiles(); // Salva os perfis atualizados no localStorage
  displayProfiles();
});

document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const imageInput = document.getElementById('imageUpload');
  const file = imageInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const image = {
      src: e.target.result,
      ratings: 0 // Inicialmente sem avaliação
    };
    const notificationSong = new Audio('https://rateme.social/audio/send.mp3');

    if (profiles.length > 0) {
      profiles[profiles.length - 1].images.push(image);
      saveProfiles();
      displayProfiles();
    notificationSong.play();
    } else {
      alert('Crie um perfil antes de fazer upload de imagens.');
    }
  };
  reader.readAsDataURL(file);
  imageInput.value = ''; // Limpar o input
});

function displayProfiles() {
  const profilesList = document.getElementById('profilesList');
  profilesList.innerHTML = '';

  profiles.forEach((profile) => {
    const profileDiv = document.createElement('div');
    profileDiv.classList.add('profile');

    const profileInfo = document.createElement('div');
    profileInfo.innerHTML = `<h3>${profile.name} (ID: ${profile.id}, Avaliação Total: ${calculateTotalRating(profile).toFixed(2)})</h3><p>${profile.bio}</p>`;

    profileDiv.appendChild(profileInfo);

    profile.images.forEach((image) => {
      const imgContainer = document.createElement('div');
      imgContainer.classList.add('image-container');

      const imgElement = document.createElement('img');
      imgElement.src = image.src;
      imgElement.classList.add('uploaded-image');

      // Adiciona a avaliação de estrelas
      const ratingDiv = document.createElement('div');
      const starContainer = createStarRating(profile, image); // Passa o perfil e a imagem para a função

      const ratingDisplay = document.createElement('span');
      ratingDisplay.classList.add('rating-display');
      ratingDisplay.innerText = (image.ratings).toFixed(2); // Exibe a avaliação em formato 0.00

      ratingDiv.appendChild(starContainer);
      ratingDiv.appendChild(ratingDisplay);
      imgContainer.appendChild(imgElement);
      imgContainer.appendChild(ratingDiv);
      profileDiv.appendChild(imgContainer);
    });

    profilesList.appendChild(profileDiv);
  });
}

function calculateTotalRating(profile) {
  return profile.images.reduce((acc, image) => acc + image.ratings, 0);
}

function generateRandomId() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Gera um ID de 6 dígitos
}

function createStarRating(profile, image) {
  const starContainer = document.createElement('div');
  starContainer.classList.add('star-container');

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.classList.add('star');
    star.dataset.value = (i * 0.01).toFixed(2); // Cada estrela representa 0.01
    star.innerHTML = '&#9733;'; // Estrela preenchida

    // Define a cor da estrela com base na avaliação atual
    star.style.color = image.ratings >= (i * 0.01) ? '#ff6f61' : '#ccc';

    star.addEventListener('click', function() {
      image.ratings = parseFloat(this.dataset.value); // Salva a avaliação na imagem
      saveProfiles(); // Salva os perfis atualizados no localStorage
      displayProfiles(); // Atualiza a visualização
      playNotificationSound(image.ratings); // Toca o som de notificação
    });

    starContainer.appendChild(star);
  }

  return starContainer;
}

function playNotificationSound(rating) {
  const sound1 = new Audio('https://rateme.social/audio/star1.mp3');
  const sound2 = new Audio('https://rateme.social/audio/star2.mp3');
  const sound3 = new Audio('https://rateme.social/audio/star3.mp3');
  const sound4 = new Audio('https://rateme.social/audio/star4.mp3');
  const sound5 = new Audio('https://rateme.social/audio/star5.mp3');

  if (rating <= 0.01) {
    sound1.play();
  } else if (rating <= 0.02) {
    sound2.play();
  } else if (rating <= 0.03) {
    sound3.play();
  } else if (rating <= 0.04) {
    sound4.play();
  } else {
    sound5.play();
  }
}

// Exibir perfis ao carregar a página
displayProfiles();

document.getElementById('createProfile').addEventListener('submit', function(event) {
  event.preventDefault(); // Evita o envio do formulário
  document.getElementById('profileSection').style.display = 'none'; // Esconde o formulário de perfil
  // Aqui você pode adicionar a lógica para processar os dados do formulário, se necessário.
});

document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Evita o envio do formulário
  document.getElementById('uploadSection').style.display = 'none'; // Esconde o formulário de upload
  // Aqui você pode adicionar a lógica para processar os dados do formulário, se necessário.
});