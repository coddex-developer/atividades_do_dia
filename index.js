const numberVersion = 46

let getTags = []

const toggleMenu = document.getElementById("nav");

toggleMenu.addEventListener("click", function () {
  toggleMenu.classList.toggle("action");
});


const CACHE_NAME = `offline-cache-v${numberVersion}`;


import tags from "./tags.js";
const selectTag = document.querySelectorAll("#selectTag");
const display = document.querySelector("#display");

function createOptions(el) {
  selectTag.forEach(sltg => {
    const option = document.createElement("option");
    option.textContent = el;
    sltg.appendChild(option);
  });
}

function addTagToDisplay(tagName) {
  // Cria o item de tag no display
  const tagItem = document.createElement("div");
  tagItem.classList.add("tag-item");

  // Cria o nome da tag
  const tagNameElement = document.createElement("span");
  tagNameElement.textContent = tagName;
  tagItem.appendChild(tagNameElement);

  // Cria o botão X para excluir
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "X";
  deleteButton.classList.add("delete-button");
  deleteButton.id = tagName;
  tagItem.appendChild(deleteButton);

  // Adiciona o item ao display
  display.appendChild(tagItem);

  // Evento de exclusão
  deleteButton.addEventListener("click", (event) => {
    display.removeChild(tagItem);
    const btnDeletTarget = event.currentTarget.id
    const tagIndex = getTags.indexOf(btnDeletTarget);
    if (tagIndex !== -1) {
        getTags.splice(tagIndex, 1);
    }
  });
}

// Adiciona as opções no select
tags.forEach(tag => {
  createOptions(tag);
});

// Adiciona a funcionalidade de mostrar e excluir as tags selecionadas

selectTag.forEach(sltg => {
  sltg.addEventListener("change", (event) => {
    const selectedTag = event.target.value;
    
    // Verifica se a tag já foi adicionada
    if (selectedTag && !Array.from(display.children).some(child => child.textContent.includes(selectedTag))) {
      addTagToDisplay(selectedTag);
      getTags.push(selectedTag).toString()
      return
    } 
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const versionDisplay = document.getElementById('versionDisplay');
  versionDisplay.textContent = `CoddeX`;

  const monthNames = [
    "/01/", "/02/", "/03/", "/04/", "/05/", "/06/",
    "/07/", "/08/", "/09/", "/10/", "/11/", "/12/"
  ];

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered: ', registration);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                const updateNotification = document.createElement('div');
                updateNotification.className = 'update-notification';
                updateNotification.innerHTML = `
                <div class="boxVersionAlert">
                <h3>Nova versão disponível!</h3>
                <p>✓ Correções e melhorias</p>
                <p>✓ Função para acesso OffLine</p>
                <p>✓ Menu de navegação para suporte</p>
                <p>✓ Opção de instalação de app em disposistivos compativeis</p>
                <button id="reloadButton">Atualizar Agora</button>
                </div>
                `;
                document.body.appendChild(updateNotification);

                document.getElementById('reloadButton').addEventListener('click', () => {
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                  newWorker.postMessage({ action: 'skipWaiting' });
                });
              }
            });
          });
        })
        .catch(registrationError => {
          console.log('ServiceWorker registration failed: ', registrationError);
        });

      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.action === 'update') {
          window.location.reload();
        }
      });
    });
  }

  // Resto do seu código existente...

  const obfuscateTheme = document.querySelector('.obfuscateTheme');
  const form = document.getElementById('activityForm');
  const newExecutantButton = document.querySelector('.newExecutant');
  const dynamicExecutants = document.querySelector('.boxDinamicAddExecutants');
  const livePreview = document.getElementById('livePreview');
  const saveButton = document.getElementById('saveButton');
  const startLivePreviewButton = document.getElementById('startLivePreviewButton');

  loadFormData();

  newExecutantButton.addEventListener('click', addExecutant);
  form.addEventListener('input', updateLivePreview);
  saveButton.addEventListener('click', saveAndShare);

  function addExecutant() {
    const executantDiv = document.createElement('div');
    executantDiv.classList.add('executantEntry');

    const newInput = document.createElement('input');
    newInput.classList.add('executant');
    newInput.placeholder = `Nome:`;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.innerHTML = `<i class="bi bi-trash3"></i>`;
    deleteButton.classList.add('deleteButton');
    deleteButton.addEventListener('click', () => {
      dynamicExecutants.removeChild(executantDiv);
      updateLivePreview();
    });

    executantDiv.appendChild(newInput);
    executantDiv.appendChild(deleteButton);
    dynamicExecutants.appendChild(executantDiv);
  }

  function formatDate(dateInput) {
    const date = new Date(dateInput + 'T00:00:00');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = monthNames[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day} ${month} ${year}`;
  }

  function updateLivePreview() {
    const executants = Array.from(document.querySelectorAll('.executant'))
      .map(input => input.value)
      .filter(value => value.trim() !== '')
      .join(', ');

    const dateInput = document.getElementById('activityDate').value;
    const formattedDate = formatDate(dateInput);

    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const description = document.getElementById('activityDescription').value;

    livePreview.innerHTML = `
            <button class="closeBtn" id="closeBtn">X</button>
            <h2>Pré visualização:</h2>
            <br>
            <br>
            <p><strong>Relatório de ${formattedDate}:</strong></p>
            <br>
            <p><strong>Executantes:</strong>
            <br>
            ${executants.toUpperCase()}</p>
            <br>
            <p><strong>Horários da atividade:</strong>
            <br>
            De ${startTime} às ${endTime}</p>
            <br>
            <strong>Tags:</strong>
            <p>${getTags.join(", ")}</p>
            <br>
            <strong>Descrição:</strong>
            <br>
            <p class="textLive">${description}</p>
        `;

    const closeBtn = document.getElementById('closeBtn');

    startLivePreviewButton.addEventListener('click', () => {
      obfuscateTheme.style.opacity = "0%";
      obfuscateTheme.style.display = 'none'
      livePreview.classList.add('sartLivePreviewClass');
    });

    closeBtn.addEventListener('click', () => {
      obfuscateTheme.style.opacity = "100%";
      obfuscateTheme.style.display = 'block'
      livePreview.classList.remove('sartLivePreviewClass');
    });
  }

  function saveFormData() {
    const formData = {
      executants: Array.from(document.querySelectorAll('.executant')).map(input => input.value),
      date: document.getElementById('activityDate').value,
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      description: document.getElementById('activityDescription').value
    };
    localStorage.setItem('formData', JSON.stringify(formData));
  }

  function loadFormData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      const formData = JSON.parse(savedData);
      document.getElementById('activityDate').value = formData.date;
      document.getElementById('startTime').value = formData.startTime;
      document.getElementById('endTime').value = formData.endTime;
      document.getElementById('activityDescription').value = formData.description;

      formData.executants.forEach((executant, index) => {
        if (index < 2) {
          document.querySelectorAll('.executant')[index].value = executant;
        } else {
          addExecutant();
          dynamicExecutants.lastChild.querySelector('.executant').value = executant;
        }
      });
      updateLivePreview();
    }
  }

  function saveAndShare() {
    const executants = Array.from(document.querySelectorAll('.executant'))
      .map(input => input.value)
      .filter(value => value.trim() !== '')
      .join(', ');

    const dateInput = document.getElementById('activityDate').value;
    const formattedDate = formatDate(dateInput);

    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const description = document.getElementById('activityDescription').value;

    const message = `
*Relatório de* ${formattedDate}:

*Executantes:*
${executants.toUpperCase()}

*Horários da atividade:*
De ${startTime} às ${endTime}

*Tags:*
${getTags.join(", ")}

*Descrição:*
${description}
        `;

    if (navigator.share) {
      navigator.share({
        title: 'Relatório de Atividade',
        text: message,
      })
        .catch(error => console.log('Error sharing:', error));
    } else {
      copyToClipboard(message);
      alert('Relatório copiado para a área de transferência');
    }
  }

  function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  const menu = document.getElementById("menu")
  const installButton = document.createElement('li');
  installButton.className = "btnDownload"
  installButton.innerHTML = `<i class="bi bi-download"></i> <span>Baixar App</span>`;
  menu.appendChild(installButton)

  installButton.addEventListener('click', () => {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the deferredPrompt variable, since it can only be used once.
      deferredPrompt = null;
    });
  });
});

document.getElementById("sobre").addEventListener('click', () => {
  alert(`Este aplicativo permite que você organize e registre seu dia de forma prática e eficiente. Com ele, você pode descrever suas atividades diárias por meio de um formatador de texto intuitivo, facilitando o acompanhamento e o salvamento das informações de maneira clara e organizada.

Caso tenha dúvidas ou encontre algum problema, envie seu feedback. Sua opinião é muito importante para melhorarmos ainda mais o aplicativo!`)
})