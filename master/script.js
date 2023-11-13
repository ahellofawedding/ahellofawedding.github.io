// Global variable for storing bingo data
let bingoData = {};

document.addEventListener('DOMContentLoaded', async function() {
  bingoData = await fetchJSON();
  populateParticipants();
  loadFromURL(true);
});

async function fetchJSON() {
    const response = await fetch('master.json');
    const data = await response.json();
    return data;
}

function populateParticipants() {
  const participantsContainer = document.getElementById('participantsContainer');
  Object.keys(bingoData).forEach(participant => {
      const button = document.createElement('button');
      button.textContent = participant;
      button.value = participant;
      button.classList.add('participant-button');
      button.onclick = () => button.classList.toggle('selected');
      let participantType = bingoData[participant].type;
      console.log(document.getElementById(participantType))
      if (document.getElementById(participantType) == null) {
        const typeContainer = document.createElement('div');
        typeContainer.setAttribute("id", participantType);
        typeContainer.innerHTML = `<p style="font-size: 0.2em">((${participantType}s))</p>`;
        participantsContainer.appendChild(typeContainer)
      }
      document.getElementById(participantType).appendChild(button);
  });
}

function getSelectedParticipants() {
    const select = document.getElementById('participants');
    return Array.from(select.selectedOptions).map(opt => opt.value);
}

// Shuffle array using Fisher-Yates shuffle
function shuffleArray(array, seed) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed) * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
    seed++;
  }
}

// Initialize a seeded random number generator
function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function selectParticipants() {
  const yourName = document.getElementById('seed').value;
  const buttons = document.querySelectorAll('.participant-button');
  buttons.forEach(button => {
      if (button.value.toLowerCase() === yourName.toLowerCase()) {
          button.classList.remove('selected');
      }
  });
}

async function generateBingo(urlLoaded = false) {
  const table = document.getElementById("bingoTable");
  table.innerHTML = ""; // Clear previous board

  selectParticipants();

  const selectedParticipants = Array.from(document.querySelectorAll('.participant-button.selected')).map(button => button.value);
  const yourName = document.getElementById('seed').value;
  const { validFreespaces, validSquares } = await getBingoLists(selectedParticipants);

  // Use yourName as seed for shuffling
  let seed = generateSeedFromName(yourName);

  document.getElementById("generate").style = "display: none";
  const titleDiv = document.createElement("p");
  titleDiv.innerHTML = "(<span class='seed'>" + yourName + "</span>\'s Board)";
  document.getElementById("title").appendChild(titleDiv);

  shuffleArray(validFreespaces, seed);
  shuffleArray(validSquares, seed);

  // Create table headers and populate the table
  const headerRow = document.createElement("tr");
  table.appendChild(headerRow);

  let freeSpaced = false;
  // Generate each row
  for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
      const rowElement = document.createElement("tr");

      // Initialize each column
      for (let colIndex = 0; colIndex < 5; colIndex++) {
          const cellElement = document.createElement("td");

          // Check if current cell is the middle cell (Free Space)
          if (rowIndex === 2 && colIndex === 2 && !freeSpaced) {
              cellElement.innerHTML = validFreespaces.length > 0 ? validFreespaces[0] + "<br><span style='font-size: 10px'> (Free Space)</span>" : "<span style='font-size: 10px'>Free Space</span>";
              cellElement.classList.add('marked'); // Mark the free space
              freeSpaced = true;
          } else {
              // Assign a square value to the cell
              const squareIndex = rowIndex * 5 + colIndex - (freeSpaced ? 1 : 0);
              if (squareIndex < validSquares.length) {
                  cellElement.textContent = validSquares[squareIndex];
              }
          }

          // Add click event listener for marking cells
          cellElement.addEventListener('click', function () {
              this.classList.toggle('marked');
              updateURL();
          });

          rowElement.appendChild(cellElement);
      }
      table.appendChild(rowElement);
  }

  // If not loaded from URL, call loadFromURL
  if (!urlLoaded) {
      loadFromURL();
  }
}

function generateSeedFromName(seedInput) {
  seed = 1;
  const somePrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
  // Iterate through each character of seedInput
  for (let index = 0; index < seedInput.length; index++) {
    // Get the character code of the current character and add it to sum
    const characterCode = seedInput.charCodeAt(index);
    seed += (seed * somePrimes[index % somePrimes.length]) * characterCode * (index + 1);
    console.log(seed)
  }

  return seed;
}

function updateURL() {
  const table = document.getElementById("bingoTable");
  const rows = table.querySelectorAll("tr");
  let markedIndexes = [];
  rows.forEach((row, i) => {
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, j) => {
      if (cell.classList.contains('marked')) {
        markedIndexes.push(`${i}-${j}`);
      }
    });
  });
  const markedString = markedIndexes.join(',');

  const yourName = document.getElementById("seed").value;
  const selectedParticipants = Array.from(document.querySelectorAll('.participant-button.selected')).map(button => button.value);

  const queryParams = new URLSearchParams();
  queryParams.set('seed', yourName);
  queryParams.set('participants', selectedParticipants.join(','));
  queryParams.set('marked', markedString);

  history.pushState(null, null, `?${queryParams.toString()}`);
}

async function loadFromURL(initial = false) {
  const urlParams = new URLSearchParams(window.location.search);
  const markedString = urlParams.get('marked');
  const seedFromURL = urlParams.get('seed');
  const participantsFromURL = urlParams.get('participants');

  if (seedFromURL) {
    document.getElementById("seed").value = seedFromURL;
  }
  
  if (participantsFromURL) {
    const participantsArray = participantsFromURL.split(',');
    const buttons = document.querySelectorAll('.participant-button');
    buttons.forEach(button => {
      button.classList.toggle('selected', participantsArray.includes(button.value));
    });
  }

  if (initial && (seedFromURL || participantsFromURL)) {
    await generateBingo(true); 
  }

  if (markedString) {
    const markedIndexes = markedString.split(',');
    loadFromURLHelper(markedIndexes);
  }
}

function loadFromURLHelper(markedIndexes) {
  const table = document.getElementById("bingoTable");
  markedIndexes.forEach(index => {
    const [i, j] = index.split('-').map(Number);
    const row = table.querySelectorAll("tr")[i];
    if (!row) {
        console.log(`Row at index ${i} is undefined.`);
        return;
    }
    const cell = row.querySelectorAll("td")[j];
    if (!cell) {
        console.log(`Cell at index ${j} is undefined.`);
        return;
    }
    cell.classList.add('marked');
    updateURL();
  });
}

function spawnHearts() {
  // Define the number of hearts you want to spawn
  const numHearts = 20;

  // Get center of the window
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < numHearts; i++) {
    // Create a new heart element
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤';

    // Generate random end x, y positions within the window's dimensions
    const endX = Math.random() * window.innerWidth;
    const endY = Math.random() * window.innerHeight;

    // Generate random size for heart
    const size = Math.random() * 20 + 10; // Random size between 10px and 30px

    // Apply styles
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = `${centerX - size / 2}px`; // Start from center
    heart.style.top = `${centerY - size / 2}px`; // Start from center
    heart.style.animationDuration = Math.random() * 3 + 2 + 's'; // Duration between 2 and 5 seconds

    // Append heart to the body
    document.body.appendChild(heart);

    // Use CSS transitions to move and fade out the heart
    setTimeout(() => {
      heart.style.left = `${endX}px`;
      heart.style.top = `${endY}px`;
      heart.style.opacity = '0';
    }, 1000);

    // Remove heart after transition ends
    heart.addEventListener('transitionend', function() {
      document.body.removeChild(heart);
    });
  }
}


async function getBingoLists(participants) {
  console.log(participants)
    let validFreespaces = [];
    let validSquares = [];

    participants.forEach(participant => {
        if (bingoData[participant]) {
            // Process freespaces for the participant
            bingoData[participant].freespaces.forEach(freespace => {
                validFreespaces.push(`${participant} ${freespace.charAt(0).toLowerCase() + freespace.slice(1)}`);
            });

            // Process squares for the participant
            Object.entries(bingoData[participant].squares).forEach(([square, requiredParticipants]) => {
                if (requiredParticipants.length === 0 || requiredParticipants.every(p => participants.includes(p))) {
                    validSquares.push(`${participant} ${square.charAt(0).toLowerCase() + square.slice(1)}`);
                }
            });
        }
    });

    console.log(validSquares)
    return { validFreespaces, validSquares };
}