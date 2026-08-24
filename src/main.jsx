import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Buffer } from "buffer";
import process from "process";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";

window.Buffer = Buffer;
window.process = process;

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
