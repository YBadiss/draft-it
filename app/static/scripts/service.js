export const getWsInfo = () => {
  return fetch("/ws")
    .then(response => response.json())
    .catch(error => {
      console.error("Error fetching data:", error);
    });
}

export const newDraft = () => {
  return fetch("/draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({competitionId: "FR1"}),
  })
  .then(response => response.json())
  .catch(error => {
    console.error("Error fetching data:", error);
  });
};

export const loadDraftForTeamId = (teamId) => {
  return fetch(`/draft?teamId=${teamId}`)
    .then(response => response.json())
    .catch(error => {
      console.error("Error fetching data:", error);
    });
};

export const pickPlayerForTeamId = (teamId, playerId) => {
  return fetch("/draft/pick", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({teamId, playerId}),
  })
  .then(response => response.json())
  .catch(error => {
    console.error("Error fetching data:", error);
  });
}