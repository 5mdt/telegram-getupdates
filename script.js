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
  resultDiv.textContent = JSON.stringify(data, null, 2);
}
