import html from "https://cdn.skypack.dev/solid-js/html";
import { formatAmount } from "../utils.js"

function PlayerRow({player, playerOwnerId, onPlayerClick, highlightPosition}) {
  const onClick = () => playerOwnerId(player) === 0 ? onPlayerClick(player) : null;
  const rowClass = () => {
    if (playerOwnerId(player) !== 0) {
      return `pickedByUser${playerOwnerId(player)}`;
    } else if (highlightPosition() === player.position) {
      return "playerHighlight";
    } else {
      return "";
    }
  };
  return html`
    <tr onClick=${onClick} class=${rowClass}>
      <td>${() => player.name}</td>
      <td>${() => player.age}</td>
      <td>${() => player.position}</td>
      <td>${() => player.clubName}</td>
      <td>${() => formatAmount(player.marketValue)}</td>
    </tr>
  `;
};

export function PlayerTableComponent({players, playerOwnerId, onPlayerClick, highlightPosition}) {
  return html`
    <table>
      <tbody>
        ${() => players().map((player) => PlayerRow({
          player,
          playerOwnerId: playerOwnerId || (() => 0),
          onPlayerClick: onPlayerClick || (() => null),
          highlightPosition: highlightPosition || (() => null),
        }))}
      </tbody>
    </table>
  `;
};
