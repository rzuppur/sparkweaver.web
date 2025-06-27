import { BluetoothService } from "$lib/services/bluetoothService";
import { CoreService } from "$lib/services/coreService";
import { EditorService } from "$lib/services/editorService";
import { ProjectService } from "$lib/services/projectService";
import { RouterService } from "$lib/services/routerService";
import { UiService } from "$lib/services/uiService";

export const bluetoothService = new BluetoothService();
export const coreService = new CoreService();
export const editorService = new EditorService();
export const projectService = new ProjectService();
export const routerService = new RouterService();
export const uiService = new UiService();

bluetoothService.inject(uiService);
coreService.inject(editorService, uiService);
editorService.inject(coreService, projectService, uiService);
projectService.inject(editorService, routerService);
routerService.inject(projectService);
uiService.inject();

bluetoothService.init();
coreService.init();
editorService.init();
projectService.init();
routerService.init();
uiService.init();

export const bluetoothState = bluetoothService.state;
export const bluetoothPwNeedsChanging = bluetoothService.pwNeedsChanging;

export const coreNodeTypes = coreService.nodeTypes;
export const coreSimulationDmxData = coreService.simulationDmxData;
export const coreSimulationState = coreService.simulationState;
export const coreSimulationTick = coreService.simulationTick;
export const coreSimulationOutputs = coreService.simulationOutputs;
export const coreReady = coreService.ready;

export const editorNodes = editorService.nodes;
export const editorSelected = editorService.selected;
export const editorSelection = editorService.selection;
export const editorTreeString = editorService.treeString;

export const projectsList = projectService.projectsList;
export const projectCurrent = projectService.currentProject;
export const projectUnsaved = projectService.unsavedChanges;

export const currentRoute = routerService.route;

export const uiToolbarsVisible = uiService.toolbarsVisible;
