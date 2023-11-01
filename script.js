// on page load, run loadFromURL
document.addEventListener('DOMContentLoaded', function() {
  loadFromURL(true);
});

// Fetch the JSON file containing the Bingo choices
async function fetchJSON() {
  const response = await fetch('squares.json');
  const data = await response.json();
  return data;
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

// Generate Bingo board
async function generateBingo(urlLoaded = false) {
  const table = document.getElementById("bingoTable");
  table.innerHTML = "";  // Clear previous board

  // Initialize the seed variable to store the sum of character codes
  let seed = 0;

  // Fetch the seedInput value from the input element
  var seedInput = document.getElementById("seed").value;
  seedInput.toLowerCase();

  // Iterate through each character of seedInput
  for (let index = 0; index < seedInput.length; index++) {
    // Get the character code of the current character and add it to sum
    const characterCode = seedInput.charCodeAt(index);
    seed += characterCode;
  }

  if (seedInput.length > 0) {
    document.getElementById("generate").style = "display: none";
    titleDiv = document.createElement("p");
    titleDiv.innerHTML = "(<span class='seed'>" + seedInput + "</span>\'s Board)";
    document.getElementById("title").appendChild(titleDiv);
  }

  const data = await fetchJSON();
  const { freespace, columns } = data;

  // Create table headers
  const headerRow = document.createElement("tr");
  Object.keys(columns).forEach(key => {
    const header = document.createElement("th");
    header.textContent = key;
    headerRow.appendChild(header);
  });
  table.appendChild(headerRow);

  // Shuffle each column's choices and take the first 5 elements
  for(const [key, choices] of Object.entries(columns)) {
    shuffleArray(choices, seed);
    seed++;
  }

  // Generate each row
for(let rowIndex = 0; rowIndex < 5; rowIndex++) {
  updateURL();
  const rowElement = document.createElement("tr");

  let colIndex = 0;  // Initialize column index
  for(const [key, choices] of Object.entries(columns)) {
    const cellElement = document.createElement("td");

    // Check if current cell is the middle cell (3-2)
    if (rowIndex === 2 && colIndex === 2) {
      cellElement.textContent = freespace;  // Set the content to 'freespace'
      cellElement.classList.add('marked');  // Add 'marked' class
    } else {
      cellElement.textContent = choices[rowIndex];
    }

    // Adding click event listener to toggle 'marked' class
    cellElement.addEventListener('click', function() {
      this.classList.toggle('marked');
      updateURL();
    });

    rowElement.appendChild(cellElement);
    colIndex++;  // Increment column index
  }
  table.appendChild(rowElement);
}

  if (!urlLoaded) {
    loadFromURL();
    return;
  }
}

// Update URL based on marked cells
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
  const seedValue = document.getElementById("seed").value;
  history.pushState(null, null, `?seed=${seedValue}&marked=${markedString}`);
}

// Load marked cells from URL
async function loadFromURL(initial = false) {
  const urlParams = new URLSearchParams(window.location.search);
  const markedString = urlParams.get('marked');
  const seedFromURL = urlParams.get('seed');
  if (seedFromURL) {
    console.log("Loading from URL");
    document.getElementById("seed").value = seedFromURL;
  }
  
  if (urlParams.size == 0) {
    return;
  }
  
    const markedIndexes = markedString.split(',');
    if (initial) {
      await generateBingo(true); 
    } // Wait for the board to be generated
    if (markedIndexes.length == 0) {
      return;
    }
    loadFromURLHelper(markedIndexes);
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


