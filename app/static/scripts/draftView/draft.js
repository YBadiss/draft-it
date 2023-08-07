import html from "https://cdn.skypack.dev/solid-js/html";
import { createSignal } from "https://cdn.skypack.dev/solid-js";
import { UserPicksComponent } from "./userPicks.js";
import { PlayerPickingComponent } from "./playerPicking.js";
import { DraftRecapComponent } from "./draftRecap.js";
import { pickPlayerForTeamId } from "../service.js";

export function DraftComponent({draftData, setDraftData, backToDashboard, localTeamId}) {
  const boosters = () => draftData().boosters;
  const currentBoosterId = () => draftData().currentBoosterId;
  const currentNumberOfPicks = () => boosters()
    .slice(0, currentBoosterId() + 1)
    .reduce((acc, booster) => acc + booster.numberOfPicks, 0)
  const localUserId = () => {
    for (const [i, team] of draftData().teams.entries()) {
      if (team.id === localTeamId()) {
        return i + 1;
      }
    }
  };

  const newUser = (id) => {
    const name = () => localUserId() === id ? "Your" : "Oponnent";
    const team = () => draftData().teams[id - 1];
    const teamSize = () => team().players.length;
    const maxTeamSize = () => draftData().teamSize;
    const remainingPicksInBooster = () => currentNumberOfPicks() - teamSize();
    const credit = () => {
      return team()
        .players
        .reduce((result, player) => result - player.marketValue, draftData().credit);
    };
    const pickPlayer = (player) => {
      pickPlayerForTeamId(team().id, player.id)
      .then(newDraftData => {
        setDraftData(null);
        setDraftData(newDraftData);
      });
    };

    return {
      id,
      name,
      team,
      teamSize,
      maxTeamSize,
      remainingPicksInBooster,
      credit,
      pickPlayer,
    };
  };
  const users = [newUser(1), newUser(2)];
  const currentUser = () => {
    const minSize = Math.min(...users.map(u => u.teamSize()));
    const maxSize = Math.max(...users.map(u => u.teamSize()));
    if (minSize === maxSize) {
      // Each user will start a different booster
      return users[currentBoosterId() % users.length];
    } else {
      return users.filter(u => u.teamSize() === minSize)[0];
    }
  };
  const playerOwnerId = (player) => {
    for (const user of users) {
      if (user.team().players.map(p => p.id).includes(player.id)) return user.id;
    }
    return 0;
  }
  const [highlightPosition, setHighlightPosition] = createSignal(null);

  return html`
    <div id="draftView">
      <button id="backToDashboardButton" onClick=${backToDashboard}>Back to dashboard</button>
      <div class="row">
        ${UserPicksComponent({
          user: users.filter(u => u.id === localUserId())[0],
          highlightPosition,
          setHighlightPosition,
        })}
        ${(draftData().state === "IN_PROGRESS" ?
            PlayerPickingComponent({boosters, currentBoosterId, currentUser, localUserId, playerOwnerId, highlightPosition})
            : DraftRecapComponent()
          )}
        ${UserPicksComponent({
          user: users.filter(u => u.id !== localUserId())[0],
          highlightPosition,
          setHighlightPosition,
        })}
      </div>
    </div>
  `;
};
