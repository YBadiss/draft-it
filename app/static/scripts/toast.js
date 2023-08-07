import { createSignal } from "https://cdn.skypack.dev/solid-js";
import html from "https://cdn.skypack.dev/solid-js/html";

export let showToast = null;

export function ToastComponent(props) {
  const [toastMessage, setToastMessage] = createSignal("");
  showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  return html`
    <style>
      /* The snackbar - position it at the bottom and in the middle of the screen */
      #snackbar {
        visibility: visible;
        min-width: 250px; /* Set a default minimum width */
        margin-left: -125px; /* Divide value of min-width by 2 */
        background-color: #333; /* Black background color */
        color: #fff; /* White text color */
        text-align: center; /* Centered text */
        border-radius: 2px; /* Rounded borders */
        padding: 3px; /* Padding */
        position: fixed; /* Sit on top of the screen */
        z-index: 1; /* Add a z-index if needed */
        left: 50%; /* Center the snackbar */
        top: 1px; /* 30px from the top */
      }
    </style>
    ${() => { return toastMessage() !== "" ? html`<div id="snackbar">${toastMessage()}</div>` : ""}}
  `;
};