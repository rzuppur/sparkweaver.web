import createModule, { type MainModule } from "$assets/core";
import { TYPE_DS_RANGE } from "$lib/consts";
import type { EditorService } from "$lib/services/editorService";
import type { UiService } from "$lib/services/uiService";
import { inRange, Uint8Vector } from "$lib/utils";
import { get, readonly, writable } from "svelte/store";

interface NodeParam {
  name: string;
  min: number;
  max: number;
  default_value: number;
}

interface NodeType {
  type_id: number;
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

export interface DmxOutput {
  address: number;
  count: number;
}

export class CoreService {
  private readonly targetTickTime = 24;
  private readonly maximumCatchupTicks = 10;
  private nextTick = performance.now() + this.targetTickTime;

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

  private readonly _externalTriggers = writable<Array<number>>([]);
  public readonly externalTriggers = readonly(this._externalTriggers);

  private editorService!: EditorService;
  private uiService!: UiService;

  public inject(
    editorService: EditorService,
    uiService: UiService,
  ): void {
    this.editorService = editorService;
    this.uiService = uiService;
  }

  public init(): void {
    createModule().then(module => {
      this.module = module;
      this.parseNodeTypes();
      this._ready.set(true);
    }).catch((reason) => {
      this.module = undefined;
      this.uiService.alertError(reason.toString());
    });

    this.simulationLoop();
  }

  private parseNodeTypes(): void {
    if (!this.module) return;
    using configs = this.module.getNodeConfigs();
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
          type_id: config.type_id,
          name: typeof config.name === "string" ? config.name : "",
          params,
        });
      }
    }

    this._nodeTypes.set(nodeTypes);
  }

  public buildTree(tree: Uint8Vector): void {
    if (!this.module) return;
    using vector = new this.module.VectorUint8();
    for (const byte of tree.get()) {
      vector.push_back(byte);
    }
    const result = this.module.build(vector);
    if (result === "OK") {
      this._simulationOutputs.set(get(this.editorService.nodes).filter(n => inRange(n.typeId, TYPE_DS_RANGE)).map(n => {
        return { address: n.params[0].value, count: n.colorInputs.length };
      }));
      this.runSimulationTick();
      this._simulationTick.set(0);
      this._simulationState.set(CoreSimulationState.PAUSED);
    } else {
      this.uiService.alertError(result);
      this._simulationState.set(CoreSimulationState.ERROR);
    }

    const externalTriggers: Array<number> = [];
    using triggerIds = this.module.listExternalTriggers();
    for (let i = 0; i < triggerIds.size(); i++) {
      externalTriggers.push(triggerIds.get(i)!);
    }
    this._externalTriggers.set(externalTriggers);
  }

  private simulationLoop(): void {
    if (get(this.simulationState) === CoreSimulationState.RUNNING) {
      if (this.module && performance.now() >= this.nextTick) {
        let ticksToRun = Math.max(0, Math.ceil((performance.now() - this.nextTick) / this.targetTickTime));
        if (ticksToRun > this.maximumCatchupTicks) {
          this.nextTick += this.targetTickTime * (ticksToRun - this.maximumCatchupTicks);
          ticksToRun = this.maximumCatchupTicks;
        }
        while (ticksToRun) {
          const data = this.module.tick();
          this._simulationTick.update(t => ++t);
          if (ticksToRun === 1) {
            this._simulationDmxData.set(Array.from(data));
          }
          this.nextTick += this.targetTickTime;
          --ticksToRun;
        }
      }
    } else {
      this.nextTick = performance.now() + this.targetTickTime;
    }
    setTimeout(this.simulationLoop.bind(this), Math.max(0, this.nextTick - performance.now()));
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

  public triggerExternalTrigger(id: number): void {
    this.module?.triggerExternalTrigger(id);
  }
}
