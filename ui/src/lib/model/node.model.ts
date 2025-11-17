import { coreConsts } from "$lib/model/core.model";
import { NodeCategory, type NodeConfig } from "$lib/model/nodeConfig.model";
import { NodeParam } from "$lib/model/nodeParam.model";
import { lsb } from "$lib/util/data.util";
import { inRange } from "$lib/util/math.util";
import type { Uint8Vector } from "$lib/util/vector.util";

export enum NodeLinkType {
  COLOR,
  TRIGGER,
}

export enum NodeLinkLocation {
  INPUT,
  OUTPUT,
}

export class Node {
  private static nextId = 1;

  public readonly category: NodeCategory;

  private constructor(
    public readonly id: number, // Not serialized, used only to track nodes inside app
    public readonly config: NodeConfig,
    public readonly params: ReadonlyArray<NodeParam>,
    public readonly label: string,
  ) {
    // Set node category
    if (inRange(config.typeId, coreConsts.TYPE_RANGE_SR)) this.category = NodeCategory.SR;
    else if (inRange(config.typeId, coreConsts.TYPE_RANGE_TR)) this.category = NodeCategory.TR;
    else if (inRange(config.typeId, coreConsts.TYPE_RANGE_FX)) this.category = NodeCategory.FX;
    else if (inRange(config.typeId, coreConsts.TYPE_RANGE_MX)) this.category = NodeCategory.MX;
    else if (inRange(config.typeId, coreConsts.TYPE_RANGE_DS)) this.category = NodeCategory.DS;
    else this.category = NodeCategory.NONE;
  }

  /**
   * @description Create a new node.
   * @param nodeConfig
   * @param setParams Optionally set parameter values
   * @param label Optionally set node label
   */
  public static createNew(nodeConfig: NodeConfig, setParams?: Array<number>, label: string = ""): Node {
    if (setParams && setParams.length !== nodeConfig.params.length) throw new RangeError("Invalid params length");
    const params: NodeParam[] = [];
    for (let i = 0; i < nodeConfig.params.length; i++) {
      const p = nodeConfig.params[i];
      params.push(new NodeParam(p, setParams ? setParams[i] : p.defaultValue));
    }

    return new Node(
      Node.nextId++,
      nodeConfig,
      params,
      label,
    );
  }


  /**
   * @description Create a duplicate with new ID.
   */
  public createDuplicate(): Node {
    return new Node(
      Node.nextId++,
      this.config,
      this.params.map(p => p.createDuplicate()),
      this.label,
    );
  }

  public withLabel(value: string): Node {
    return new Node(
      this.id,
      this.config,
      this.params,
      value,
    );
  }

  public withParam(index: number, value: number): Node {
    return new Node(
      this.id,
      this.config,
      this.params.map((p, i) => i === index ? p.withValue(value) : p),
      this.label,
    );
  }

  /**
   * @description Serialize to node tree bytes.
   * @param target
   */
  public serialize(target: Uint8Vector): void {
    target.pushBack(lsb(this.config.typeId));
    for (const param of this.params) {
      param.serialize(target);
    }
  }
}
