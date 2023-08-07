document.addEventListener("DOMContentLoaded", () => {
  let playersMap = {};
  let initialCredit = 0;
  let teamSize = 0;
  let boostersData = []; // To store the data for all boosters
  let numberOfBoosters = 0;
  let hoveredPosition = null;

  let user1 = {
    id: 1,
    teamId: "",
    picks: [],
    credit: 0,
    remainingPicks: 0,
    backgroundColor: "pink",
  };
  let user2 = {
    id: 2,
    number: "",
    picks: [],
    credit: 0,
    remainingPicks: 0,
    backgroundColor: "lightblue",
  };
  const users = [user1, user2];
  let currentUser = user1;
  let loggedInUser = null;

  const groupBy = (array, keyFn) => {
    return array.reduce(function(accumulator, value) {
      const key = keyFn(value);
      (accumulator[key] = accumulator[key] || []).push(value);
      return accumulator;
    }, {});
  };

  const formatAmount = (amount) => {
    const divider = amount >= 1_000_000 ? 1_000_000 : 100_000;
    const unit = amount >= 1_000_000 ? "M" : "k";
    const roundedAmount =  (amount / divider).toFixed(amount % divider > 0 ? 1 : 0);
    return `${roundedAmount}${unit}`;
  };

  const showToast = (message) => {
    // Get the snackbar DIV
    var snackbar = document.getElementById("snackbar");

    // Add the "show" class to DIV
    snackbar.className = "show";
    snackbar.textContent = message;

    // After 3 seconds, remove the show class from DIV
    setTimeout(() => {
      snackbar.className = snackbar.className.replace("show", "");
    }, 2000);
  }

  const pickPlayer = (user, playerId) => {
    user.picks.push(playerId);
    return fetch("/draft/pick", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"teamId": user.teamId, "playerId": playerId}),
    })
    .then(response => response.json())
    .catch(error => {
      console.error("Error fetching data:", error);
    });
  }

  // Event listener for row clicks
  const onPickPlayer = async (event) => {
    const row = event.target.parentNode;
    const playerId = parseInt(row.dataset.playerId, 10);
    const marketValue = playersMap[playerId].marketValue;

    const isPlayerPicked = users.reduce((accumulator, user) => {
      return accumulator || user.picks.includes(playerId);
    }, false);

    if (isPlayerPicked) {
      showToast("This player has already been picked.");
    }
    else if (currentUser.credit < marketValue) {
      showToast("Not enough credit to pick this player.");
    } else {
      await pickPlayer(currentUser, playerId);
    }
    update();
  };

  const onMouseOverPosition = (event) => {
    const position = event.target;
    hoveredPosition = position.id.slice(0, 2).toUpperCase();
    update();
  };

  const onMouseOutPosition = () => {
    hoveredPosition = null;
    update();
  };

  const update = () => {
    const updateView = () => {
      const updatePlayerSelectionView = () => {

        if (boostersData.length === 0) {
          document.getElementById("playerSelection").style.display = "none";
          document.getElementById("draftReport").style.display = "block";

          users.forEach(user => {
            const allMarketValues = user.picks.map(playerId => playersMap[playerId].marketValue);
            const averageMarketValue = allMarketValues.reduce((sum, value) => sum + value) / allMarketValues.length;
            const maxMarketValue = Math.max(...allMarketValues);
            const minMarketValue = Math.min(...allMarketValues);

            document.getElementById(`averageMarketValueUser${user.id}`).textContent = formatAmount(averageMarketValue);
            document.getElementById(`highestMarketValueUser${user.id}`).textContent = formatAmount(maxMarketValue);
            document.getElementById(`lowestMarketValueUser${user.id}`).textContent = formatAmount(minMarketValue);
          });
        } else {
          document.getElementById("playerSelection").style.display = "block";
          document.getElementById("draftReport").style.display = "none";
          const table = document.getElementById("playersTable");
          table.innerHTML = ""; // Clear existing table
          
          const boosterTitle = document.getElementById("boosterTitle");
          boosterTitle.textContent = `Booster #${numberOfBoosters - boostersData.length + 1}/${numberOfBoosters}`

          const currentUserElement = document.getElementById("currentUser");
          currentUserElement.textContent = `User ${currentUser.id} - ${formatAmount(currentUser.credit)} - Pick #${boostersData[0].numberOfPicks - currentUser.remainingPicks + 1}/${boostersData[0].numberOfPicks}`;
          currentUserElement.className = "";
          currentUserElement.classList.add(`user${currentUser.id}`);
    
          boostersData[0].players.forEach(player => {
            const row = table.insertRow();
            row.dataset.playerId = player.id; // Store the player ID as a data attribute
    
            const nameCell = row.insertCell();
            const ageCell = row.insertCell();
            const positionCell = row.insertCell();
            const clubCell = row.insertCell();
            const marketValueCell = row.insertCell();
    
            nameCell.textContent = player.name;
            ageCell.textContent = player.age;
            positionCell.textContent = player.position;
            clubCell.textContent = player.clubName;
            marketValueCell.textContent = formatAmount(player.marketValue);
    
            if (hoveredPosition === player.position) {
              row.style.backgroundColor = "lightgreen";
            }
            users.forEach(user => {
              if (user.picks.includes(player.id)) {
                row.style.backgroundColor = user.backgroundColor;
              }
            });

            if (getPreviousDrafts().includes(currentUser.teamId)) {
              row.addEventListener("click", onPickPlayer);
            }
          });
        }
      };
    
      const updateUserPicksView = () => {
        // Helper function to add a row to the table
        const addRowToTable = (table, player) => {
          const row = table.insertRow();
          const nameCell = row.insertCell();
          const ageCell = row.insertCell();
          const positionCell = row.insertCell();
          const clubCell = row.insertCell();
          const marketValueCell = row.insertCell();
    
          nameCell.textContent = player.name;
          ageCell.textContent = player.age;
          positionCell.textContent = player.position;
          clubCell.textContent = player.clubName;
          marketValueCell.textContent = formatAmount(player.marketValue);

          if (hoveredPosition === player.position) {
            row.style.backgroundColor = "lightgreen";
          }
        };
    
        const updateUserTable = (user) => {
          const pickTable = document.getElementById(`pickTableUser${user.id}`);
      
          pickTable.innerHTML = ""; // Clear existing table
      
          user.picks.forEach(playerId => {
            const player = playersMap[playerId];
            addRowToTable(pickTable, player);
          });
      
          const creditElementUser = document.getElementById(`creditUser${user.id}`);
          creditElementUser.textContent = "Credit: " + formatAmount(user.credit);
      
          const teamSizeElement = document.getElementById(`teamSizeUser${user.id}`);
          teamSizeElement.textContent = `Team size: ${user.picks.length}/${teamSize}`;

          const teamIdElement = document.getElementById(`teamIdUser${user.id}`);
          teamIdElement.textContent = `Team ID: ${user.teamId}`;
        };

        const updateUserFootbalField = (user) => {
          const groupedPlayerIds = groupBy(user.picks, (playerId) => {
            const player = playersMap[playerId];
            return player.position;
          });
          for (const [position, playerIds] of Object.entries(groupedPlayerIds)) {
            const positionElement = document.getElementById(`${position.toLowerCase()}User${user.id}`);
            positionElement.textContent = `${position}: ${playerIds.length}`;
          }
        }
    
        users.forEach(updateUserTable);
        users.forEach(updateUserFootbalField);
      };

      updatePlayerSelectionView();
      updateUserPicksView();
    };

    const updateValues = () => {
      users.forEach(user => {
        user.picks.sort((playerIdA, playerIdB) => {
          const playerA = playersMap[playerIdA];
          const playerB = playersMap[playerIdB];
          return playerB.position.localeCompare(playerA.position);
        });
      });

      if (boostersData.length > 0) {
        const currentBoosterPlayers = boostersData[0].players;

        const updateUserValues = (user) => {
          user.credit = initialCredit;
          user.remainingPicks = boostersData[0].numberOfPicks;
          user.picks.forEach(playerId => {
            const player = playersMap[playerId];
      
            user.credit -= player.marketValue;
            if (currentBoosterPlayers.includes(player)) {
              user.remainingPicks -= 1;
            }
          });
        };
        users.forEach(updateUserValues);

        const noRemainingPicks = users.reduce((accumulator, user) => {
          return accumulator && user.remainingPicks <= 0
        }, true);

        if (noRemainingPicks) {
          boostersData.shift();
          if (boostersData.length > 0) {
            showToast("Moving on to next booster.");
          }
          updateValues();
        } else {
          const minRemainingPicks = Math.min(...users.map(u => u.remainingPicks));
          const maxRemainingPicks = Math.max(...users.map(u => u.remainingPicks));
          if (minRemainingPicks === maxRemainingPicks) {
            // Each user will start a different booster
            currentUser = users[boostersData.length % users.length];
          } else {
            currentUser = users.filter(u => u.remainingPicks === maxRemainingPicks)[0];
          }
        }
      }
    };

    updateValues();
    updateView();
  };

  const initFootballFields = () => {
    users.forEach(user => {
      const playerPositions = document.getElementById(`playerPositionsUser${user.id}`);
      Array.prototype.slice.call(playerPositions.children).forEach(child => {
        child.removeEventListener("mouseover", onMouseOverPosition);
        child.addEventListener("mouseover", onMouseOverPosition);
        child.removeEventListener("mouseout", onMouseOutPosition);
        child.addEventListener("mouseout", onMouseOutPosition);
      });
    })
  }

  const initDraftView = () => {
    document.getElementById("dashboardView").style.display = "none";
    document.getElementById("draftView").style.display = "block";

    const leaveDraftButton = document.getElementById("leaveDraftButton");
    leaveDraftButton.removeEventListener("click", initDashboard);
    leaveDraftButton.addEventListener("click", initDashboard);
    initFootballFields();
  };

  const initDraft = (draft, teamId) => {
    numberOfBoosters = draft.boosters.length;
    boostersData = draft.boosters;
    boostersData.forEach(booster => {
      booster.players.forEach(player => playersMap[player.id] = player);
    });
    initialCredit = draft.credit;
    teamSize = draft.teamSize;
    draft.teams.forEach((team, index) => {
      users[index].teamId = team.id;
      users[index].picks = team.players.map(p => p.id);
    });
    loggedInUser = users.filter(u => u.teamId === teamId)[0];
    addDraftsToPrevious(teamId);
  };

  const getPreviousDrafts = () => {
    return JSON.parse(localStorage.getItem("draftTeamIds") || "[]");
  }

  const addDraftsToPrevious = (teamId) => {
    const draftTeamIds = getPreviousDrafts();
    if (!draftTeamIds.includes(teamId)) {
      draftTeamIds.push(teamId);
    }
    localStorage.setItem("draftTeamIds", JSON.stringify(draftTeamIds));
  }

  const newDraft = () => {
    fetch("/draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"competitionId": "FR1"}),
    })
    .then(response => response.json())
    .then(data => {
      // You've initiated the draft, you're the user1
      initDraft(data, data.teams[0].id);
    })
    .then(initDraftView)
    .then(update)
    .catch(error => {
      console.error("Error fetching data:", error);
    });
  };

  const loadDraftForTeamId = (teamId) => {
    fetch(`/draft?teamId=${teamId}`)
    .then(response => response.json())
    .then(data => {
      initDraft(data, teamId);
    })
    .then(initDraftView)
    .then(update)
    .catch(error => {
      console.error("Error fetching data:", error);
    });
  };

  const loadDraft = () => {
    const loadDraftTeamIdInput = document.getElementById("loadDraftTeamId");
    const teamId = loadDraftTeamIdInput.value;
    loadDraftForTeamId(teamId);
  };

  const initDashboard = () => {
    document.getElementById("dashboardView").style.display = "block";
    document.getElementById("draftView").style.display = "none";

    const newDraftButton = document.getElementById("newDraftButton");
    newDraftButton.removeEventListener("click", newDraft);
    newDraftButton.addEventListener("click", newDraft);

    const loadDraftButton = document.getElementById("loadDraftButton");
    loadDraftButton.removeEventListener("click", loadDraft);
    loadDraftButton.addEventListener("click", loadDraft);

    const previousDraftsTable = document.getElementById("previousDrafts");
    previousDraftsTable.innerHTML = ""; // Clear existing table
    getPreviousDrafts().forEach(draftTeamId => {
      const row = previousDraftsTable.insertRow();
      const teamIdCell = row.insertCell();
      teamIdCell.textContent = draftTeamId;
      row.addEventListener("click", () => loadDraftForTeamId(draftTeamId));
    });
  };

  initDashboard();
});