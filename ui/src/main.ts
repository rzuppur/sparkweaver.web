import { mount } from "svelte";
import "./app.css";
import "$lib/services";
import App from "./App.svelte";

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
