if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered: ', registration);
      })
      .catch(registrationError => {
        console.log('ServiceWorker registration failed: ', registrationError);
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const obfuscateTheme = document.querySelector('.obfuscateTheme');
  const form = document.getElementById('activityForm');
  const newExecutantButton = document.querySelector('.newExecutant');
  const dynamicExecutants = document.querySelector('.boxDinamicAddExecutants');
  const livePreview = document.getElementById('livePreview');
  const saveButton = document.getElementById('saveButton');
  const startLivePreviewButton = document.getElementById('startLivePreview');

  // Load saved form data
  loadFormData();

  newExecutantButton.addEventListener('click', addExecutant);
  form.addEventListener('input', updateLivePreview);
  saveButton.addEventListener('click', saveAndShare);
  startLivePreviewButton.addEventListener('click', showLivePreview);

  function addExecutant() {
    const executantDiv = document.createElement('div');
    executantDiv.classList.add('executantEntry');

    const newInput = document.createElement('input');
    newInput.classList.add('executant');
    newInput.placeholder = `Nome:`;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Excluir';
    deleteButton.classList.add('deleteButton');
    deleteButton.addEventListener('click', () => {
      dynamicExecutants.removeChild(executantDiv);
      updateLivePreview();
    });

    executantDiv.appendChild(newInput);
    executantDiv.appendChild(deleteButton);
    dynamicExecutants.appendChild(executantDiv);
  }

  function updateLivePreview() {
    const executants = Array.from(document.querySelectorAll('.executant'))
      .map(input => input.value)
      .filter(value => value.trim() !== '')
      .join(', ');
    const date = document.getElementById('activityDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const description = document.getElementById('activityDescription').value;

    livePreview.innerHTML = `
      <button class="closeBtn" id="closeBtn">X</button>
      <h2>Pré visualização:</h2>
      <br>
      <br>
      <p><strong>Relatório de ${date}:</strong></p>
      <br>
      <p><strong>Executantes:</strong><br>${executants.toUpperCase()}</p>
      <br>
      <p><strong>Horários da atividade:</strong><br>De ${startTime} às ${endTime}</p>
      <br>
      <p><strong>Descrição:</strong><br>${description}</p>
    `;

    const closeBtn = document.getElementById('closeBtn');
    closeBtn.addEventListener('click', hideLivePreview);

    // Save form data to local storage
    saveFormData();
  }

  function showLivePreview() {
    obfuscateTheme.style.opacity = "10%";
    livePreview.classList.add('sartLivePreviewClass');
  }

  function hideLivePreview() {
    obfuscateTheme.style.opacity = "100%";
    livePreview.classList.remove('sartLivePreviewClass');
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
    if (!navigator.onLine) {
      const options = [
        { label: 'Salvar', action: saveToFile },
        { label: 'Copiar para área de transferência', action: copyToClipboard }
      ];
      showOfflineOptions(options);
      return;
    }

    const executants = Array.from(document.querySelectorAll('.executant'))
      .map(input => input.value)
      .filter(value => value.trim() !== '')
      .join(', ');
    const date = document.getElementById('activityDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const description = document.getElementById('activityDescription').value;

    const message = `
*Relatório de* ${date}:

*Executantes:*
${executants.toUpperCase()}

*Horários da atividade:*
De ${startTime} às ${endTime}

*Descrição:*
${description}
`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  function saveToFile() {
    const blob = new Blob([generateReport()], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'relatorio.txt';
    a.click();
  }

  function copyToClipboard() {
    const report = generateReport();
    navigator.clipboard.writeText(report)
      .then(() => alert('Relatório copiado para a área de transferência'))
      .catch(err => alert('Erro ao copiar relatório: ', err));
  }

  function generateReport() {
    const executants = Array.from(document.querySelectorAll('.executant'))
      .map(input => input.value)
      .filter(value => value.trim() !== '')
      .join(', ');
    const date = document.getElementById('activityDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const description = document.getElementById('activityDescription').value;

    return `
Relatório de ${date}:

Executantes:
${executants.toUpperCase()}

Horários da atividade:
De ${startTime} às ${endTime}

Descrição:
${description}
`;
  }

  function showOfflineOptions(options) {
    const modal = document.createElement('div');
    modal.classList.add('offline-modal');

    options.forEach(option => {
      const button = document.createElement('button');
      button.textContent = option.label;
      button.addEventListener('click', () => {
        option.action();
        document.body.removeChild(modal);
      });
      modal.appendChild(button);
    });

    document.body.appendChild(modal);
  }
});