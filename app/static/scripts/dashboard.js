import html from "https://cdn.skypack.dev/solid-js/html";
import { createSignal } from "https://cdn.skypack.dev/solid-js";
import { showToast } from "./toast.js";
import { newDraft, loadDraftForTeamId } from "./service.js";

const getPreviousDraftLocalStorage = () => {
  return JSON.parse(localStorage.getItem("draftTeamIds") || "[]");
}

const setPreviousDraftLocalStorage = (previousDrafts) => {
  localStorage.setItem("draftTeamIds", JSON.stringify(previousDrafts));
}

function PreviousDraftsRow({draftTeamId, setDraftData}) {
  const onLoadDraft = (teamId) => {
    return loadDraftForTeamId(teamId).then(data => setDraftData(data, teamId));
  };

  return html`
    <tr>
      <td onClick=${() => onLoadDraft(draftTeamId)}>${draftTeamId}</td>
    </tr>
  `;
};

function PreviousDraftsTable({previousDrafts, setDraftData}) {
  return html`
    <table id="previousDrafts">
      <tbody>
        ${() => previousDrafts().map((draftTeamId) => PreviousDraftsRow({draftTeamId, setDraftData}))}
      </tbody>
    </table>
  `;
};

export function DashboardComponent({setDraftData, setLocalTeamId}) {
  const [previousDrafts, setPreviousDrafts] = createSignal(getPreviousDraftLocalStorage());

  const _setDraftData = (data, teamId) => {
    if (!previousDrafts().includes(teamId)) {
      const newDrafts = previousDrafts().concat([teamId]);
      setPreviousDraftLocalStorage(newDrafts)
      setPreviousDrafts(newDrafts);
    }
    setLocalTeamId(teamId);
    setDraftData(data);
    showToast(`Load draft for teamId ${teamId}`);
  };
  const onNewDraft = () => {
    return newDraft().then(data => _setDraftData(data, data.teams[0].id));
  };
  const onLoadDraft = () => {
    const loadDraftTeamIdInput = document.getElementById("loadDraftTeamId");
    const teamId = loadDraftTeamIdInput.value;
    return loadDraftForTeamId(teamId).then(data => _setDraftData(data, teamId));
  };

  return html`
    <div id="dashboardView">
      <div class="row">
        <div class="column-2">
          <button id="newDraftButton" onClick=${() => onNewDraft()}>New Draft</button>
        </div>
        <div class="column-2">
          <div>
            <input id="loadDraftTeamId">
            <button id="loadDraftButton" onClick=${() => onLoadDraft()}>Load Draft</button>
          </div>
          ${PreviousDraftsTable({previousDrafts, setDraftData: _setDraftData})}
        </div>
      </div>
    </div>
  `;
};
