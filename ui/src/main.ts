import { bluetoothService } from "$lib/service/bluetooth.service";
import { coreService } from "$lib/service/core.service";
import { editorService } from "$lib/service/editor.service";
import { projectsService } from "$lib/service/projects.service";
import { routerService } from "$lib/service/router.service";
import { uiService } from "$lib/service/ui.service";

import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const services = {
  bluetoothService,
  coreService,
  editorService,
  projectsService,
  routerService,
  uiService,
};

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
