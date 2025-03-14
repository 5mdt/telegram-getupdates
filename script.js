async function fetchUpdates() {
  const token = document.getElementById('token').value;
  if (!token) {
    alert("Please enter your Telegram Bot Token");
    return;
  }

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
  }
}

function displayResult(data) {
  const resultDiv = document.getElementById('result');

  // Pretty print the JSON
  resultDiv.textContent = JSON.stringify(data, null, 2);

  // Add syntax highlighting (basic)
  const formattedData = JSON.stringify(data, null, 2).replace(/(".*?"):/g, '<span class="json-key">$1:</span>')
                                                 .replace(/: ("[^"]*")/g, ': <span class="json-value">$1</span>');

  resultDiv.innerHTML = formattedData;
}
