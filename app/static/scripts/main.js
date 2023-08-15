import { createSignal, createEffect } from "https://cdn.skypack.dev/solid-js";
import { render } from "https://cdn.skypack.dev/solid-js/web";
import html from "https://cdn.skypack.dev/solid-js/html";
import { ToastComponent } from "./toast.js";
import { DashboardComponent } from "./dashboard.js";
import { DraftComponent } from "./draftView/draft.js";

var ws = null;
const newWebSocket = (localTeamId, setDraftData) => {
  ws = {
    // connection: new WebSocket(`wss://draughtitzv3uetb6-draught-it-v1.functions.fnc.fr-par.scw.cloud/ws/${localTeamId}`),
    connection: new WebSocket(`ws://localhost:8080/ws/${localTeamId}`),
    teamId: localTeamId,
  };
  ws.connection.onerror = (event) => {
    console.log(`WS connection failed: ${event.data}`);
  };
  ws.connection.onopen = () => {
    console.log("WS connection succefully opened");
  };
  ws.connection.onclose = () => {
    console.log("WS connection closed");
    if (ws) {
      console.log("Didn't ask for disconnect, reconnecting");
      newWebSocket(localTeamId, setDraftData);
    }
  };
  ws.connection.onmessage = (event) => {
    console.log("Received ws message");
    const data = JSON.parse(event.data);
    if (data.type === "draftUpdate") {
      const newDraftData = JSON.parse(data.content);
      console.log(`Updating draft data with ${newDraftData}`);
      setDraftData(null);
      setDraftData(newDraftData);
    } else if (data.type === "ping") {
      console.log("Sending pong");
      ws.connection.send(JSON.stringify({type: "pong"}));
    } else {
      console.log(`Unknown message: ${event.data}`);
    }
  };
};

const App = () => {
  const [draftData, setDraftData] = createSignal(null);
  const [localTeamId, setLocalTeamId] = createSignal(null);

  const backToDashboard = () => {
    setDraftData(null);
    setLocalTeamId(null);
  }
  createEffect(() => {
    if (ws !== null && localTeamId() !== ws.teamId) {
      console.log(`localTeamId changed from ${ws.teamId} to ${localTeamId()}, closing websocket`);
      const tempConnection = ws.connection;
      ws = null;
      tempConnection.close();
    }

    if (ws === null && localTeamId() !== null) {
      console.log(`New loacalTeamId ${localTeamId()}, openning websocket`);
      newWebSocket(localTeamId(), setDraftData);
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