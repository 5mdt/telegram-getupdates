// Function to fetch updates from Telegram API
async function fetchUpdates() {
  const token = document.getElementById('token').value;
  if (!token) {
    alert("Please enter your Telegram Bot Token");
    return;
  }

  // Show the loading indicator
  document.getElementById('loading').style.display = 'block';

  // Hide results before the request is made
  document.getElementById('result-section').style.display = 'none';

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

// Function to display the result in both JSON and Card view
function displayResult(data) {
  const resultDiv = document.getElementById('result');
  const cardsContainer = document.getElementById('cardsContainer');

  // Pretty print the JSON/YAML in the existing view
  resultDiv.textContent = JSON.stringify(data, null, 2);

  // Add enhanced syntax highlighting for both JSON and YAML (already present)
  const formattedData = JSON.stringify(data, null, 2)
    .replace(/"([^"]+)":/g, '<span class="data-key">"$1":</span>') // Highlight keys
    .replace(/: ("[^"]*")/g, ': <span class="data-value">$1</span>') // Highlight string values
    .replace(/: (\d+)/g, ': <span class="data-number">$1</span>') // Highlight numbers
    .replace(/: (true|false)/g, ': <span class="data-boolean">$1</span>') // Highlight booleans
    .replace(/: null/g, ': <span class="data-null">null</span>'); // Highlight null values

  resultDiv.innerHTML = formattedData;

  // Now, create cards view for the events
  cardsContainer.innerHTML = ''; // Clear previous cards

  const events = data.result;  // Assuming events are in 'result' key
  events.forEach(event => {
    const card = document.createElement('div');
    card.classList.add('card');

    const title = document.createElement('h4');
    title.textContent = `Event ID: ${event.update_id}`;

    // Check if the event has a message and handle accordingly
    let messageContent = "No message";
    let footerContent = "Unknown sender";

    if (event.message) {
      messageContent = event.message.text || "No text content";
      footerContent = `From: ${event.message.from.username}`;
    } else if (event.my_chat_member) {
      messageContent = `Chat changed: ${event.my_chat_member.new_chat_member.status}`;
      footerContent = `From: ${event.my_chat_member.from.username}`;
    } else if (event.new_chat_participant) {
      messageContent = `New participant: ${event.new_chat_participant.first_name}`;
      footerContent = `From: ${event.message ? event.message.from.username : "Unknown"}`;
    } else if (event.new_chat_member) {
      messageContent = `New member: ${event.new_chat_member.first_name}`;
      footerContent = `From: ${event.message ? event.message.from.username : "Unknown"}`;
    }

    const message = document.createElement('p');
    message.textContent = messageContent;

    const footer = document.createElement('div');
    footer.classList.add('card-footer');
    footer.textContent = footerContent;

    // Create the "Show Data" button
    const showDataButton = document.createElement('button');
    showDataButton.textContent = "🔎 Show Data";
    showDataButton.onclick = () => toggleJsonData(card, event);

    // Create a div for the JSON data (initially hidden)
    const jsonSection = document.createElement('div');
    jsonSection.classList.add('json-section');
    jsonSection.style.display = 'none';
    jsonSection.innerHTML = `<pre>${highlightJsonSyntax(event)}</pre>`;  // Pretty-print JSON with syntax highlighting

    // Append all elements to the card
    card.appendChild(title);
    card.appendChild(message);
    card.appendChild(footer);
    card.appendChild(showDataButton);
    card.appendChild(jsonSection);

    cardsContainer.appendChild(card);
  });

  // Show both views
  document.getElementById('result-section').style.display = 'block';
  document.getElementById('json-view').style.display = 'block';
  document.getElementById('cards-view').style.display = 'block';
}

// Function to toggle the visibility of JSON data when clicking the "Show Data" button
function toggleJsonData(card, event) {
  const jsonSection = card.querySelector('.json-section');

  // Toggle the visibility of the JSON section
  if (jsonSection.style.display === 'none') {
    jsonSection.style.display = 'block';
  } else {
    jsonSection.style.display = 'none';
  }
}

// Function to apply syntax highlighting to JSON data
function highlightJsonSyntax(jsonData) {
  let jsonStr = JSON.stringify(jsonData, null, 2);

  // Apply the same syntax highlighting rules as we did for the full JSON view
  jsonStr = jsonStr
    .replace(/"([^"]+)":/g, '<span class="data-key">"$1":</span>') // Highlight keys
    .replace(/: ("[^"]*")/g, ': <span class="data-value">$1</span>') // Highlight string values
    .replace(/: (\d+)/g, ': <span class="data-number">$1</span>') // Highlight numbers
    .replace(/: (true|false)/g, ': <span class="data-boolean">$1</span>') // Highlight booleans
    .replace(/: null/g, ': <span class="data-null">null</span>'); // Highlight null values

  return jsonStr;
}


// Function to toggle the visibility of JSON data when clicking the "Show Data" button
function toggleJsonData(card, event) {
  const jsonSection = card.querySelector('.json-section');

  // Toggle the visibility of the JSON section
  if (jsonSection.style.display === 'none') {
    jsonSection.style.display = 'block';
  } else {
    jsonSection.style.display = 'none';
  }
}


// Function to convert JSON to YAML
function jsonToYaml(json) {
  let yaml = '';
  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const value = json[key];
      if (typeof value === 'object' && value !== null) {
        yaml += `${key}:\n${indentObject(value, 2)}`;
      } else {
        yaml += `${key}: ${value}\n`;
      }
    }
  }
  return yaml;
}

// Helper function to indent objects for YAML formatting
function indentObject(obj, indentLevel) {
  let indented = '';
  const indent = ' '.repeat(indentLevel);
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        indented += `${indent}${key}:\n${indentObject(value, indentLevel + 2)}`;
      } else {
        indented += `${indent}${key}: ${value}\n`;
      }
    }
  }
  return indented;
}

// Function to toggle YAML data view on button click
function toggleYamlData(card, data) {
  // Check if YAML data already exists
  let yamlSection = card.querySelector('.yaml-section');

  if (!yamlSection) {
    // If no YAML data, create and display it inside the 'result' div
    yamlSection = document.createElement('div');
    yamlSection.classList.add('yaml-section');
    yamlSection.id = 'result';  // Set ID to 'result'
    yamlSection.innerHTML = jsonToYaml(data);  // Add the YAML-formatted content
    card.appendChild(yamlSection);
  } else {
    // If YAML data already exists, toggle its visibility
    yamlSection.style.display = yamlSection.style.display === 'none' ? 'block' : 'none';
  }
}


// Function to toggle between JSON and Cards view
function toggleView(view) {
  if (view === 'json') {
    document.getElementById('json-view').style.display = 'block';
    document.getElementById('cards-view').style.display = 'none';
  } else {
    document.getElementById('json-view').style.display = 'none';
    document.getElementById('cards-view').style.display = 'block';
  }
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
      loadButton.textContent = `🚚 Load`;
      loadButton.onclick = () => loadSelectedToken(storageName);

      const removeButton = document.createElement('button');
      removeButton.textContent = `🗑️ Remove`;
      removeButton.onclick = () => removeToken(storageName);

      buttonContainer.appendChild(loadButton);
      buttonContainer.appendChild(removeButton);

      listItem.appendChild(tokenName);
      listItem.appendChild(buttonContainer); // Add the container with buttons

      tokensList.appendChild(listItem);
    }
  }

  // If there are no saved tokens, hide the saved tokens section
  const savedTokensSection = document.getElementById('saved-tokens-section');
  if (localStorage.length === 0) {
    savedTokensSection.style.display = 'none';
  } else {
    savedTokensSection.style.display = 'block';
  }
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

// Load saved tokens on page load
document.addEventListener('DOMContentLoaded', loadSavedTokens);
