const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const saveBtn = document.getElementById('save-btn');
const liveText = document.getElementById('live-text');
const notesList = document.getElementById('notes-list');
const toggle = document.getElementById('dark-mode-toggle');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = true;

let finalTranscript = '';

recognition.onresult = (event) => {
  let interim = '';
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript + ' ';
    } else {
      interim += event.results[i][0].transcript;
    }
  }
  liveText.innerText = finalTranscript + interim;
};

recognition.onerror = (e) => {
  console.error('Speech recognition error:', e.error);
};

recognition.onend = () => {
  console.warn('Speech recognition ended.');
  startBtn.disabled = false;
  stopBtn.disabled = true;
  document.body.classList.remove('listening');
  stopWave();
};

startBtn.onclick = () => {
  recognition.start();
  finalTranscript = ''; // clear previous transcript
  startBtn.disabled = true;
  stopBtn.disabled = false;
  document.body.classList.add('listening');
  drawWave(); // optional sine wave animation
};

stopBtn.onclick = () => {
  recognition.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  document.body.classList.remove('listening');
  stopWave();
};

saveBtn.onclick = () => {
  const text = liveText.innerText.trim();
  if (text) {
    const notes = JSON.parse(localStorage.getItem('voiceNotes') || '[]');
    notes.push(text);
    localStorage.setItem('voiceNotes', JSON.stringify(notes));
    renderNotes();
    liveText.innerText = '';
    finalTranscript = '';
  }
};

function renderNotes() {
  notesList.innerHTML = '';
  const notes = JSON.parse(localStorage.getItem('voiceNotes') || '[]');

  notes.forEach((note, index) => {
    const li = document.createElement('li');

    // Create editable span for note content
    const textSpan = document.createElement('span');
    textSpan.textContent = note;
    textSpan.contentEditable = false;
    textSpan.style.display = 'inline-block';
    textSpan.style.width = '80%';
    textSpan.style.wordWrap = 'break-word';

    // Create Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';

    editBtn.onclick = () => {
      const isEditing = textSpan.isContentEditable;

      if (isEditing) {
        // Save changes
        notes[index] = textSpan.innerText.trim();
        localStorage.setItem('voiceNotes', JSON.stringify(notes));
        editBtn.textContent = 'Edit';
        textSpan.contentEditable = false;
      } else {
        // Start editing
        textSpan.contentEditable = true;
        textSpan.focus();
        editBtn.textContent = 'Save';
      }
    };

    // Create Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => {
      notes.splice(index, 1);
      localStorage.setItem('voiceNotes', JSON.stringify(notes));
      renderNotes();
    };

    // Append everything to list item
    li.appendChild(textSpan);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    notesList.appendChild(li);
  });
}


function applyTheme() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark-mode', isDark);
  toggle.checked = isDark;
}

toggle.addEventListener('change', () => {
  localStorage.setItem('darkMode', toggle.checked);
  applyTheme();
});

applyTheme(); // On load
window.onload = renderNotes;

// 🌊 Simple sine wave animation (optional, not mic reactive)
const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
let waveAnimation;

function drawWave() {
  const width = canvas.width = canvas.offsetWidth;
  const height = canvas.height = 50;

  let t = 0;

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3f51b5';

    for (let x = 0; x < width; x++) {
      let y = height / 2 + Math.sin(x * 0.04 + t) * 10;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
    t += 0.05;
    waveAnimation = requestAnimationFrame(animate);
  }

  animate();
}

function stopWave() {
  cancelAnimationFrame(waveAnimation);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// for the pwA

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
