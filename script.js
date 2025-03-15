// Mock data
const mockData = {
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "message_id": 1,
        "from": {
          "id": 111111111,
          "is_bot": false,
          "first_name": "John",
          "last_name": "Doe",
          "username": "johndoe",
          "language_code": "en"
        },
        "chat": {
          "id": 111111111,
          "first_name": "John",
          "last_name": "Doe",
          "username": "johndoe",
          "type": "private"
        },
        "date": 1632328992,
        "text": "Hello, this is a test message!"
      }
    },
    {
      "update_id": 123456790,
      "my_chat_member": {
        "chat": {
          "id": 111111111,
          "first_name": "John",
          "last_name": "Doe",
          "username": "johndoe",
          "type": "private"
        },
        "from": {
          "id": 111111111,
          "is_bot": false,
          "first_name": "John",
          "last_name": "Doe",
          "username": "johndoe",
          "language_code": "en"
        },
        "date": 1632328992,
        "new_chat_member": {
          "status": "administrator",
          "user": {
            "id": 111111111,
            "first_name": "John",
            "last_name": "Doe",
            "username": "johndoe"
          }
        }
      }
    }
  ]
};

// Function to validate the Telegram bot token format using regex
function validateToken(token) {
  const tokenPattern = /^[0-9]*:[0-9a-zA-Z_-]{35,36}$/;  // Basic Telegram bot token regex pattern
  return tokenPattern.test(token);
}

// Function to display mock data in both JSON and Card views
function displayMockData() {
  const resultDiv = document.getElementById('result');
  const cardsContainer = document.getElementById('cardsContainer');

  // Display mock data in JSON view
  resultDiv.textContent = JSON.stringify(mockData, null, 2);
  const formattedData = JSON.stringify(mockData, null, 2)
    .replace(/"([^"]+)":/g, '<span class="data-key">"$1":</span>') // Highlight keys
    .replace(/: ("[^"]*")/g, ': <span class="data-value">$1</span>') // Highlight string values
    .replace(/: (\d+)/g, ': <span class="data-number">$1</span>') // Highlight numbers
    .replace(/: (true|false)/g, ': <span class="data-boolean">$1</span>') // Highlight booleans
    .replace(/: null/g, ': <span class="data-null">null</span>'); // Highlight null values
  resultDiv.innerHTML = formattedData;

  // Display mock data in Cards view
  cardsContainer.innerHTML = ''; // Clear previous cards
  const events = mockData.result;  // Assuming events are in 'result' key
  events.forEach(event => {
    const card = document.createElement('div');
    card.classList.add('card');

    const title = document.createElement('h4');
    title.textContent = `Event ID: ${event.update_id}`;

    let messageContent = "No message";
    let footerContent = "Unknown sender";

    if (event.message) {
      messageContent = event.message.text || "No text content";
      footerContent = `From: ${event.message.from.username}`;
    } else if (event.my_chat_member) {
      messageContent = `Chat changed: ${event.my_chat_member.new_chat_member.status}`;
      footerContent = `From: ${event.my_chat_member.from.username}`;
    }

    const message = document.createElement('p');
    message.textContent = messageContent;

    const footer = document.createElement('div');
    footer.classList.add('card-footer');
    footer.textContent = footerContent;

    const showDataButton = document.createElement('button');
    showDataButton.textContent = "🔎 Show Data";
    showDataButton.setAttribute('aria-labelledby', 'showDataLabel');
    showDataButton.setAttribute('aria-describedby', 'showDataDescription');
    showDataButton.onclick = () => toggleJsonData(card, event);

    const jsonSection = document.createElement('div');
    jsonSection.classList.add('json-section');
    jsonSection.style.display = 'none';
    jsonSection.innerHTML = `<pre>${highlightJsonSyntax(event)}</pre>`;

    card.appendChild(title);
    card.appendChild(message);
    card.appendChild(footer);
    card.appendChild(showDataButton);
    card.appendChild(jsonSection);

    cardsContainer.appendChild(card);
  });

  document.getElementById('result-section').style.display = 'block';
  document.getElementById('json-view').style.display = 'block';
  document.getElementById('cards-view').style.display = 'block';
}

// Function to fetch updates from Telegram API
// Function to fetch updates from Telegram API
async function fetchUpdates() {
  const token = document.getElementById('token').value;


  // Validate token format
  if (!validateToken(token)) {
    alert("Invalid token format.");
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
    // Show error message on UI
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = `Error: ${error.message}`;
    resultDiv.style.color = 'red';
  } finally {
    // Hide the loading indicator after request completes
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

    // Create the "Show Data" button with aria-labelledby and aria-describedby
    const showDataButton = document.createElement('button');
    showDataButton.textContent = "🔎 Show Data";
    showDataButton.setAttribute('aria-labelledby', 'showDataLabel');
    showDataButton.setAttribute('aria-describedby', 'showDataDescription');
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
  return jsonStr
    .replace(/"([^"]+)":/g, '<span class="data-key">"$1":</span>') // Highlight keys
    .replace(/: ("[^"]*")/g, ': <span class="data-value">$1</span>') // Highlight string values
    .replace(/: (\d+)/g, ': <span class="data-number">$1</span>') // Highlight numbers
    .replace(/: (true|false)/g, ': <span class="data-boolean">$1</span>') // Highlight booleans
    .replace(/: null/g, ': <span class="data-null">null</span>'); // Highlight null values
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

  // Check if a token with the same name already exists in localStorage
  if (localStorage.getItem(storageName)) {
    alert("A token with that name already exists!");
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

      const buttonContainer = document.createElement('div');
      const loadButton = document.createElement('button');
      loadButton.textContent = `🚚 Load`;
      loadButton.setAttribute('data-token-name', storageName);
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

    // Get the load button that was clicked
    const loadButton = document.querySelector(`[data-token-name="${storageName}"]`);

    // Change the button color to indicate it's been selected
    loadButton.classList.add('button-success');
    setTimeout(() => {
      loadButton.classList.remove('button-success');
      loadButton.style.transition = 'background-color 1s ease-out';
    }, 1000);  // 1 seconds
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
