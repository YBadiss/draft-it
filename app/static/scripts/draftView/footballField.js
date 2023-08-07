import h from "https://cdn.skypack.dev/solid-js/h";
import html from "https://cdn.skypack.dev/solid-js/html";

const PLAYER_POSITIONS = [
  "GK",
  "RB",
  "CB",
  "LB",
  "DM",
  "RM",
  "CM",
  "LM",
  "AM",
  "RW",
  "LW",
  "CF",
];

function PlayerPositionComponent({position, players, setHighlightPosition}) {
  const playersForPosition = () => players().filter(player => player.position === position);
  return h(
    "div",
    {
      class: `${position.toLowerCase()}-position`,
      onMouseover: () => setHighlightPosition(position),
      onMouseout: () => setHighlightPosition(null),
    },
    () => `${position}: ${playersForPosition().length}`
  );
};

export function FootballFieldComponent({players, setHighlightPosition}) {
  return html`
    <div class="footballField">
      <img src="field.png" decoding="async" width="100%" height="100%" data-file-width="452" data-file-height="684">
      <div>
        ${() => PLAYER_POSITIONS.map(position => PlayerPositionComponent({position, players, setHighlightPosition}))}
      </div>
    </div>
  `;
};
