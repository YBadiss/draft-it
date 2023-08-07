import html from "https://cdn.skypack.dev/solid-js/html";
import h from "https://cdn.skypack.dev/solid-js/h";
import { PlayerTableComponent } from "./playerTable.js";
import { formatAmount } from "../utils.js"
import { showToast } from "../toast.js";

function CurrentUserComponent(currentUser, currentBooster) {
  const pickNumber = () => currentBooster().numberOfPicks - currentUser().remainingPicksInBooster() + 1;

  return h(
    "div",
    {
      class: `current-user user${currentUser().id}`,
    },
    () => `${currentUser().name()} turn - ${formatAmount(currentUser().credit())} - Pick #${pickNumber()}/${currentBooster().numberOfPicks}`,
  );
}

export function PlayerPickingComponent({boosters, currentBoosterId, currentUser, localUserId, playerOwnerId, highlightPosition}) {
  const currentBooster = () => boosters()[currentBoosterId()];
  const players = () => currentBooster().players;
  const onPlayerClick = (player) => {
    if (currentUser().id !== localUserId()) {
      showToast("Not your turn to pick");
    } else if (currentUser().credit() < player.marketValue) {
      showToast("Not enough credit to pick this player");
    } else {
      currentUser().pickPlayer(player);
    }
  };

  return html`
    <div class="column-3">
      <h1>Booster ${() => currentBoosterId() + 1}/${() => boosters().length}</h1>
      ${CurrentUserComponent(currentUser, currentBooster)}
      ${PlayerTableComponent({players, playerOwnerId, onPlayerClick, highlightPosition})}
    </div>
  `;
};
