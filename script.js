// Function to fetch updates from Telegram API
async function fetchUpdates() {
  const token = document.getElementById('token').value;
  if (!token) {
    alert("Please enter your Telegram Bot Token");
    return;
  }

  // Show the loading indicator
  document.getElementById('loading').style.display = 'block';

  const url = `https://api.telegram.org/bot${token}/getUpdates`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch updates');
    }

    const data = await response.json();
    displayResult(data);
  } catch (error) {
    alert(error.message);
  } finally {
    // Hide the loading indicator
    document.getElementById('loading').style.display = 'none';
  }
}

// Function to display the result (formatted JSON)
function displayResult(data) {
  const resultDiv = document.getElementById('result');

  // Pretty print the JSON
  resultDiv.textContent = JSON.stringify(data, null, 2);

  // Add enhanced syntax highlighting
  const formattedData = JSON.stringify(data, null, 2)
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1":</span>') // Highlight keys
    .replace(/: ("[^"]*")/g, ': <span class="json-value">$1</span>') // Highlight string values
    .replace(/: (\d+)/g, ': <span class="json-number">$1</span>') // Highlight numbers
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>') // Highlight booleans
    .replace(/: null/g, ': <span class="json-null">null</span>'); // Highlight null values

  resultDiv.innerHTML = formattedData;
}

// Function to clear the result section
function clearResult() {
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = '';
}

// Function to save token with a custom name in localStorage
function saveToken() {
  const token = document.getElementById('token').value;

  if (!token) {
    alert("Please enter a token to save.");
    return;
  }

  // Prompt the user for the token name
  const storageName = prompt("Enter a name for your token:", "default-token");

  if (storageName === null || storageName.trim() === "") {
    alert("Token name is required!");
    return;
  }

  // Save the token with the provided name
  localStorage.setItem(storageName, token);
  alert(`Token saved with the name "${storageName}".`);

  // Refresh the list of saved tokens after saving
  loadSavedTokens();
}


// Function to load selected token from localStorage
function loadSelectedToken(storageName) {
  const savedToken = localStorage.getItem(storageName);

  if (savedToken) {
    document.getElementById('token').value = savedToken;
    alert(`Token loaded for "${storageName}".`);
  }
}

// Function to remove a token from localStorage
function removeToken(storageName) {
  localStorage.removeItem(storageName);
  alert(`Token "${storageName}" removed.`);

  // Refresh the list of saved tokens after removing
  loadSavedTokens();
}

// Function to load all saved tokens from localStorage and display them
function loadSavedTokens() {
  const tokensList = document.getElementById('tokensList');
  tokensList.innerHTML = ''; // Clear current list

  // Iterate over all items in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const storageName = localStorage.key(i);
    const savedToken = localStorage.getItem(storageName);

    if (savedToken) {
      const listItem = document.createElement('li');

      const tokenName = document.createElement('span');
      tokenName.classList.add('token-name');
      tokenName.textContent = `${storageName} `;

      const buttonContainer = document.createElement('div'); // Container for buttons
      const loadButton = document.createElement('button');
      loadButton.textContent = `Load`;
      loadButton.onclick = () => loadSelectedToken(storageName);

      const removeButton = document.createElement('button');
      removeButton.textContent = `Remove`;
      removeButton.onclick = () => removeToken(storageName);

      buttonContainer.appendChild(loadButton);
      buttonContainer.appendChild(removeButton);

      listItem.appendChild(tokenName);
      listItem.appendChild(buttonContainer); // Add the container with buttons

      tokensList.appendChild(listItem);
    }
  }
}


// Load saved tokens on page load
document.addEventListener('DOMContentLoaded', loadSavedTokens);
