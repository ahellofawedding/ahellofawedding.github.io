let bingoData = {};

document.addEventListener('DOMContentLoaded', async () => {
    bingoData = await fetchJSON();
    populateParticipants();
});

async function fetchJSON() {
    // Replace with your JSON URL
    const response = await fetch('master.json');
    return await response.json();
}

function renderJSON() {
    const jsonDisplay = document.getElementById('jsonDisplay');
    jsonDisplay.textContent = JSON.stringify(bingoData, null, 2);
}

document.addEventListener('DOMContentLoaded', async () => {
    bingoData = await fetchJSON();
    populateParticipants();
    renderJSON(); // Call this function to initially render the JSON
});

function populateParticipants() {
    const participantSelect = document.getElementById('participantSelect');
    participantSelect.innerHTML = '';
    Object.keys(bingoData).forEach(participant => {
        let option = document.createElement('option');
        option.value = participant;
        option.textContent = participant;
        participantSelect.appendChild(option);
    });
}

function addParticipant() {
    const participantName = prompt("Enter the name of the new participant:");
    if (participantName && !bingoData[participantName]) {
        bingoData[participantName] = { type: "person", freespaces: [], squares: {} };
        populateParticipants();
    } else {
        alert("Participant already exists or invalid name.");
    }
    renderJSON();
}

function deleteParticipant() {
    const participantSelect = document.getElementById('participantSelect');
    const participantName = participantSelect.value;
    if (participantName && confirm(`Are you sure you want to delete ${participantName}?`)) {
        delete bingoData[participantName];
        populateParticipants();
    }
    renderJSON();
}

function addFreespace() {
    const freespaceInput = document.getElementById('freespaceInput');
    const participantSelect = document.getElementById('participantSelect');
    if (freespaceInput.value) {
        bingoData[participantSelect.value].freespaces.push(freespaceInput.value);
        freespaceInput.value = '';
    }
    renderJSON();
}

function deleteFreespace() {
    const participantSelect = document.getElementById('participantSelect');
    const participant = bingoData[participantSelect.value];
    const freespace = prompt("Enter the freespace to delete:");
    if (freespace && participant.freespaces.includes(freespace)) {
        participant.freespaces = participant.freespaces.filter(f => f !== freespace);
    }
    renderJSON();
}

function addSquare() {
    const squareNameInput = document.getElementById('squareNameInput');
    const participantSelect = document.getElementById('participantSelect');
    if (squareNameInput.value) {
        bingoData[participantSelect.value].squares[squareNameInput.value] = [];
        squareNameInput.value = '';
    }
    renderJSON();
}

function deleteSquare() {
    const participantSelect = document.getElementById('participantSelect');
    const squareName = prompt("Enter the name of the square to delete:");
    const participant = bingoData[participantSelect.value];
    if (squareName && participant.squares[squareName]) {
        delete participant.squares[squareName];
    }
    renderJSON();
}

function addInteraction() {
    const interactionInput = document.getElementById('interactionInput');
    const participantSelect = document.getElementById('participantSelect');
    const squareName = prompt("Enter the square name to add interactions:");
    if (squareName && interactionInput.value && bingoData[participantSelect.value].squares[squareName]) {
        bingoData[participantSelect.value].squares[squareName] = interactionInput.value.split(',').map(s => s.trim());
        interactionInput.value = '';
    }
    renderJSON();
}

function removeInteraction() {
    const participantSelect = document.getElementById('participantSelect');
    const squareName = prompt("Enter the square name to remove interactions:");
    if (squareName && bingoData[participantSelect.value].squares[squareName]) {
        bingoData[participantSelect.value].squares[squareName] = [];
    }
    renderJSON();
}

function downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bingoData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "bingoData.json");
    dlAnchorElem.click();
}
