import createModule, { type MainModule } from "$assets/core";
import { editorService } from "$lib/services/editorService";
import { uiService } from "$lib/services/uiService";
import { get, readonly, writable } from "svelte/store";

interface NodeParam {
  name: string;
  min: number;
  max: number;
  default_value: number;
}

interface NodeType {
  title: string;
  name: string;
  params: Array<NodeParam>;
  max_color_inputs: number;
  max_trigger_inputs: number;
  enable_color_outputs: boolean;
  enable_trigger_outputs: boolean;
}

export enum CoreSimulationState {
  UNINITIALIZED,
  PAUSED,
  RUNNING,
  ERROR,
}

interface DmxOutput {
  type: "RGB";
  address: number;
}

class CoreService {
  private module: MainModule | undefined;

  private readonly _nodeTypes = writable<Array<NodeType>>([]);
  public readonly nodeTypes = readonly(this._nodeTypes);

  private readonly _ready = writable<boolean>(false);
  public readonly ready = readonly(this._ready);

  private readonly _simulationDmxData = writable<Array<number>>(Array(513).fill(0));
  public readonly simulationDmxData = readonly(this._simulationDmxData);

  private readonly _simulationState = writable<CoreSimulationState>(CoreSimulationState.UNINITIALIZED);
  public readonly simulationState = readonly(this._simulationState);

  private readonly _simulationTick = writable<number>(0);
  public readonly simulationTick = readonly(this._simulationTick);

  private readonly _simulationOutputs = writable<Array<DmxOutput>>([]);
  public readonly simulationOutputs = readonly(this._simulationOutputs);

  constructor() {
    createModule().then(module => {
      this.module = module;
      this.parseNodeTypes();
      this._ready.set(true);
    }).catch((reason) => {
      this.module = undefined;
      uiService.alertError(reason.toString());
    });

    window.setInterval(() => {
      if (get(this.simulationState) === CoreSimulationState.RUNNING) {
        this.runSimulationTick();
      }
    }, 24);
  }

  private parseNodeTypes(): void {
    if (!this.module) return;
    const configs = this.module.getNodeConfigs();
    const nodeTypes: Array<NodeType> = [];

    for (let i = 0; i < configs.size(); i++) {
      const config = configs.get(i);
      if (config) {
        const params: Array<NodeParam> = [];
        for (let j = 0; j < config.params_count; j++) {
          const param = config.params.get(j);
          if (param) params.push({
            ...param,
            name: typeof param.name === "string" ? param.name : "",
          });
        }
        nodeTypes.push({
          ...config,
          name: typeof config.name === "string" ? config.name : "",
          title: typeof config.title === "string" ? config.title : "",
          params,
        });
      }
    }

    configs.delete();
    this._nodeTypes.set(nodeTypes);
  }

  public buildTree(treeString: string): void {
    if (!this.module) return;
    const result = this.module.build(treeString);
    if (result === "OK") {
      const outputs: Array<DmxOutput> = [];
      for (const [command, params] of editorService.treeStringToParts(treeString)) {
        if (command === "DsDmxRgb" && params.length) {
          outputs.push({ address: params[0], type: "RGB" });
        }
      }
      this._simulationOutputs.set(outputs);
      this.runSimulationTick();
      this._simulationTick.set(0);
      this._simulationState.set(CoreSimulationState.PAUSED);
    } else {
      uiService.alertError(result);
      this._simulationState.set(CoreSimulationState.ERROR);
    }
  }

  private runSimulationTick(): void {
    if (!this.module) return;
    this._simulationDmxData.set(Array.from(this.module.tick()));
    this._simulationTick.update(t => ++t);
  }

  public stepSimulation(): void {
    if (get(this.simulationState) === CoreSimulationState.PAUSED) {
      this.runSimulationTick();
    }
  }

  public stopSimulation(): void {
    if (get(this.simulationState) === CoreSimulationState.RUNNING) {
      this._simulationState.set(CoreSimulationState.PAUSED);
    }
  }

  public runSimulation(): void {
    if (get(this.simulationState) === CoreSimulationState.PAUSED) {
      this._simulationState.set(CoreSimulationState.RUNNING);
    }
  }
}

export const coreService = new CoreService();
export const coreNodeTypes = coreService.nodeTypes;
export const coreSimulationDmxData = coreService.simulationDmxData;
export const coreSimulationState = coreService.simulationState;
export const coreSimulationTick = coreService.simulationTick;
export const coreSimulationOutputs = coreService.simulationOutputs;
export const coreReady = coreService.ready;
