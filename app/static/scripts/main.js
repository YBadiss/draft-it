import { createSignal, createEffect } from "https://cdn.skypack.dev/solid-js";
import { render } from "https://cdn.skypack.dev/solid-js/web";
import html from "https://cdn.skypack.dev/solid-js/html";
import { ToastComponent } from "./toast.js";
import { DashboardComponent } from "./dashboard.js";
import { DraftComponent } from "./draftView/draft.js";

const App = () => {
  const [draftData, setDraftData] = createSignal(null);
  const [localTeamId, setLocalTeamId] = createSignal(null);

  const backToDashboard = () => {
    setDraftData(null);
    setLocalTeamId(null);
  }

  let ws = null; 
  createEffect(() => {
    if (ws !== null && localTeamId() !== ws.teamId) {
      console.log(`localTeamId changed from ${ws.teamId} to ${localTeamId()}, closing websocket`);
      ws.connection.close();
      ws = null;
    }

    if (ws === null && localTeamId() !== null) {
      console.log(`New loacalTeamId ${localTeamId()}, openning websocket`);
      ws = {
        connection: new WebSocket(`wss://draughtitzv3uetb6-draught-it-v1.functions.fnc.fr-par.scw.cloud/ws/${localTeamId()}`),
        teamId: localTeamId(),
      };
      ws.connection.onmessage = function(event) {
        console.log("Received ws message");
        const data = JSON.parse(event.data);
        if (data.type === "draftUpdate") {
          const newDraftData = JSON.parse(data.content);
          console.log(`Updating draft data with ${newDraftData}`);
          setDraftData(null);
          setDraftData(newDraftData);
        } else {
          console.log(`Unknown message: ${event.data}`);
        }
      };
    }
  });

  return html`
    <div id="appView">
      ${ToastComponent()}
      ${
        () => {
          if (draftData() !== null) {
            return DraftComponent({draftData, setDraftData, backToDashboard, localTeamId});
          } else {
            return DashboardComponent({setDraftData, setLocalTeamId});
          }
        }
      }
    </div>
  `;
};
render(App, document.body);