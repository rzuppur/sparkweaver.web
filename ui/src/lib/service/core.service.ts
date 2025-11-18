import createModule, { type MainModule } from "$assets/core";
import { logBus } from "$lib/bus/log.bus";
import { CoreState } from "$lib/model/core.model";
import { NodeCategory, NodeConfig } from "$lib/model/nodeConfig.model";
import { coreStorePrivate as store } from "$lib/store/core.store";
import { editorStore } from "$lib/store/editor.store";
import { clamp } from "$lib/util/math.util";
import type { Uint8Vector } from "$lib/util/vector.util";

/**
 * @class CoreService
 * @description Runs SparkWeaver core using WebAssembly, does simulation of the node tree.
 */
class CoreService {
  private readonly TARGET_TICK_LENGTH_MS = 24;
  private readonly MAXIMUM_CATCHUP_TICKS = 10;

  private nextTick = 0;
  private module: MainModule | undefined;
  private lastBuiltTree: Uint8Vector | undefined;

  constructor() {
    // Load WebAssembly core and start simulation loop
    createModule().then(module => {
      this.setModule(module);
      this.buildTree();
      this.simulationLoop();
    }).catch((reason) => {
      this.setModule(undefined);
      logBus.writeError(`core: ${reason}`);
    });

    // Track tree changes
    editorStore.project.subscribe((project) => {
      if (project) {
        if (!this.lastBuiltTree || !project.tree.equalTo(this.lastBuiltTree)) this.buildTree();
      } else this.reset();
    });
  }

  private reset(): void {
    if (store.stateValue > CoreState.READY) store.setState(CoreState.READY);
    store.resetData();
    this.lastBuiltTree = undefined;
  }

  private setModule(module: MainModule | undefined): void {
    this.module = module;
    if (!this.module) {
      store.setState(CoreState.ERROR);
      return;
    }

    using configs = this.module.getNodeConfigs();
    const nodeConfigs: Array<NodeConfig> = [];

    for (let i = 0; i < configs.size(); i++) {
      const config = configs.get(i);
      if (config) {
        const params: NodeConfig["params"] = [];
        for (let j = 0; j < config.params_count; j++) {
          const param = config.params.get(j);
          if (param) params.push({
            name: typeof param.name === "string" ? param.name : "",
            min: param.min,
            max: param.max,
            defaultValue: param.default_value,
          });
        }
        nodeConfigs.push(new NodeConfig(
          config.type_id,
          typeof config.name === "string" ? config.name : "",
          params,
          config.color_inputs_max,
          config.trigger_inputs_max,
          config.color_outputs,
          config.trigger_outputs,
        ));
      }
    }

    store.setConfigs(nodeConfigs);
    store.setState(CoreState.READY);
  }

  public buildTree(): void {
    if (!this.module || !editorStore.projectValue) return;
    logBus.writeDebug("core: buildTree");
    this.lastBuiltTree = editorStore.projectValue.tree.clone();

    // Construct C++ byte vector
    using vector = new this.module.VectorUint8();
    for (const byte of editorStore.projectValue.tree.get()) {
      vector.push_back(byte);
    }

    // Build tree in core
    const result = this.module.build(vector);
    if (result === "OK") {
      // Run the first simulation tick
      this.runSimulationTick();

      // Load available triggers
      const triggers: Array<number> = [];
      using triggerIds = this.module.listExternalTriggers();
      for (let i = 0; i < triggerIds.size(); i++) { triggers.push(triggerIds.get(i)!); }

      // Find DMX outputs
      const outputs = editorStore.nodesValue
        .filter(n => n.category === NodeCategory.DS)
        .map(n => ({
          address: n.params[0].value,
          count: editorStore.colorLinksValue.filter(l => l.inputId === n.id).length,
        }));

      // Sync state to store
      store.setData({ ...store.dataValue, tick: 0, outputs, triggers });
      if (store.stateValue < CoreState.PAUSED) store.setState(CoreState.RUNNING);

    } else {
      logBus.writeError(`core: ${result}`);
      store.setState(CoreState.ERROR);
    }
  }

  private simulationLoop(): void {
    if (store.stateValue === CoreState.RUNNING && this.module) {
      const timeLeftToTick = this.nextTick - performance.now();
      if (timeLeftToTick <= 0) {
        const dataUpdate = store.dataValue;
        let ticksToRun = Math.ceil(-1 * timeLeftToTick / this.TARGET_TICK_LENGTH_MS);
        if (ticksToRun > 1) {
          if (ticksToRun > this.MAXIMUM_CATCHUP_TICKS) this.nextTick = performance.now() - (this.MAXIMUM_CATCHUP_TICKS - 1) * this.TARGET_TICK_LENGTH_MS;
        }
        ticksToRun = clamp(1, ticksToRun, this.MAXIMUM_CATCHUP_TICKS);
        while (ticksToRun--) {
          dataUpdate.dmxData = Array.from(this.module.tick());
          dataUpdate.tick += 1;
          this.nextTick += this.TARGET_TICK_LENGTH_MS;
        }
        store.setData(dataUpdate);
        this.nextTick = clamp(0, this.nextTick, performance.now() + this.TARGET_TICK_LENGTH_MS * 2);
      }
    } else {
      this.nextTick = performance.now() + this.TARGET_TICK_LENGTH_MS;
    }

    requestAnimationFrame(this.simulationLoop.bind(this));
  }

  private runSimulationTick(): void {
    if (!this.module) return;
    const dmxData = Array.from(this.module.tick());
    store.setData({ ...store.dataValue, tick: ++store.dataValue.tick, dmxData });
  }

  public stepSimulation(): void {
    if (store.stateValue === CoreState.PAUSED) {
      this.runSimulationTick();
    }
  }

  public stopSimulation(): void {
    if (store.stateValue === CoreState.RUNNING) {
      store.setState(CoreState.PAUSED);
    }
  }

  public runSimulation(): void {
    if (store.stateValue === CoreState.PAUSED) {
      store.setState(CoreState.RUNNING);
    }
  }

  public triggerExternalTrigger(id: number): void {
    this.module?.triggerExternalTrigger(id);
  }
}

export const coreService = new CoreService();
