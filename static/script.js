document.addEventListener("DOMContentLoaded", () => {
  let picksUser1 = [];
  let picksUser2 = [];
  let currentPlayer = 1;

  // Helper function to check if a player has already been picked
  const isPlayerPicked = (playerId) => {
    return picksUser1.includes(playerId) || picksUser2.includes(playerId);
  };

  // Helper function to switch the current player indicator
  const switchCurrentPlayer = () => {
    currentPlayer = currentPlayer === 1 ? 2 : 1; // Toggle between 1 and 2
    const currentPlayerElement = document.getElementById("currentPlayer");

    if (currentPlayer === 1) {
      currentPlayerElement.textContent = "User 1";
      currentPlayerElement.classList.remove("user2");
      currentPlayerElement.classList.add("user1");
    } else if (currentPlayer === 2) {
      currentPlayerElement.textContent = "User 2";
      currentPlayerElement.classList.remove("user1");
      currentPlayerElement.classList.add("user2");
    }
  };

  // Event listener for row clicks
  const onRowClick = (event) => {
    const row = event.target.parentNode;
    const playerId = parseInt(row.dataset.playerId, 10);

    if (isPlayerPicked(playerId)) {
      alert("This player has already been picked.");
      return;
    }

    if (currentPlayer === 1) {
      if (picksUser1.length >= 5) {
        alert("User 1 has reached the maximum picks.");
        return;
      }
      picksUser1.push(playerId);
      row.style.backgroundColor = "red";
    } else if (currentPlayer === 2) {
      if (picksUser2.length >= 5) {
        alert("User 2 has reached the maximum picks.");
        return;
      }
      picksUser2.push(playerId);
      row.style.backgroundColor = "blue";
    }

    switchCurrentPlayer();

    // Check if both users have finished picking
    if (picksUser1.length >= 5 && picksUser2.length >= 5) {
      alert("Both users have completed their picks.");
    }
  };

  // Fetch data from the server
  fetch("http://localhost:8000/draft")
    .then(response => response.json())
    .then(data => {
      const players = data.boosters[0].players;

      // Create and populate the table
      const table = document.getElementById("playersTable");

      players.forEach(player => {
        const row = table.insertRow();
        row.dataset.playerId = player.id; // Store the player ID as a data attribute
        row.addEventListener("click", onRowClick);

        const nameCell = row.insertCell();
        const ageCell = row.insertCell();
        const positionCell = row.insertCell();
        const nationalityCell = row.insertCell();
        const marketValueCell = row.insertCell();

        nameCell.textContent = player.name;
        ageCell.textContent = player.age;
        positionCell.textContent = player.position;
        nationalityCell.textContent = player.nationality.join(", ");
        marketValueCell.textContent = player.marketValue.toLocaleString();
      });
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
});
