import html from "https://cdn.skypack.dev/solid-js/html";
import { formatAmount } from "../utils.js"
import { FootballFieldComponent } from "./footballField.js";
import { PlayerTableComponent } from "./playerTable.js";

export function UserPicksComponent({user: {id, name, team, teamSize, maxTeamSize, credit}, highlightPosition, setHighlightPosition}) {
  const players = () => team().players;
  return html`
    <div id="userPicks${id}" class="column-3">
      <h2 class="user${id}">${name()} Picks</h2>
      <div id="teamId${id}" class="user${id}">Team ID: ${() => team().id}</div>
      <div id="teamSize${id}" class="user${id}">Team size: ${() => teamSize()}/${() => maxTeamSize()}</div>
      <div id="credit${id}" class="user${id}">Credit: ${() => formatAmount(credit())}</div>
      ${FootballFieldComponent({players, setHighlightPosition})}
      ${PlayerTableComponent({players, highlightPosition})}
    </div>
  `;
};
