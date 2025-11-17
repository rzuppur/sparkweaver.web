import type { NodeConfigParam } from "$lib/model/nodeConfig.model";
import { isUnsignedShort, lsb, msb } from "$lib/util/data.util";
import type { Uint8Vector } from "$lib/util/vector.util";

export class NodeParam {
  constructor(
    public readonly config: NodeConfigParam,
    public readonly value: number,
  ) {
    if (!isUnsignedShort(value)) throw new Error("value is not u16");
    if (value < this.config.min || value > this.config.max) throw new Error("value is out of range");
  }

  public createDuplicate(): NodeParam {
    return new NodeParam(
      this.config,
      this.value,
    );
  }

  public withValue(value: number): NodeParam {
    return new NodeParam(
      this.config,
      value,
    );
  }

  public serialize(target: Uint8Vector): void {
    target.pushBack(lsb(this.value));
    target.pushBack(msb(this.value));
  }
}
