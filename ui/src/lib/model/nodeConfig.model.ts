import { coreConsts } from "$lib/model/core.model";
import { inRange } from "$lib/util/math.util";

export enum NodeCategory {
  NONE,
  SR,
  TR,
  FX,
  MX,
  DS,
}

export interface NodeConfigParam {
  readonly name: string,
  readonly min: number,
  readonly max: number,
  readonly defaultValue: number,
}

export class NodeConfig {
  public readonly category: NodeCategory;

  constructor(
    public readonly typeId: number,
    public readonly name: string,
    public readonly params: Array<NodeConfigParam>,
    public readonly colorInputsMax: number,
    public readonly triggerInputsMax: number,
    public readonly colorOutputs: boolean,
    public readonly triggerOutputs: boolean,
  ) {
    if (inRange(typeId, coreConsts.TYPE_RANGE_SR)) this.category = NodeCategory.SR;
    else if (inRange(typeId, coreConsts.TYPE_RANGE_TR)) this.category = NodeCategory.TR;
    else if (inRange(typeId, coreConsts.TYPE_RANGE_FX)) this.category = NodeCategory.FX;
    else if (inRange(typeId, coreConsts.TYPE_RANGE_MX)) this.category = NodeCategory.MX;
    else if (inRange(typeId, coreConsts.TYPE_RANGE_DS)) this.category = NodeCategory.DS;
    else this.category = NodeCategory.NONE;
  }

  public get colorOutputsMax(): number {
    if (this.colorOutputs) return coreConsts.MAXIMUM_CONNECTIONS;
    return 0;
  }

  public get triggerOutputsMax(): number {
    if (this.triggerOutputs) return coreConsts.MAXIMUM_CONNECTIONS;
    return 0;
  }
}
