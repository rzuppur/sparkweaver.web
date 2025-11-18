import type { Node } from "$lib/model/node.model";
import { lsb, msb } from "$lib/util/data.util";
import type { Uint8Vector } from "$lib/util/vector.util";

abstract class NodeLink<T extends NodeLink<T>> {
  protected static nextId = 1;

  protected constructor(
    public readonly id: number, // Not serialized, used only to track links inside app
    public readonly outputId: number,
    public readonly inputId: number,
    public readonly outputIndex: number,
    public readonly inputIndex: number,
  ) {}

  public withOutputIndex(value: number): T {
    return new this.Ctor(this.id, this.outputId, this.inputId, value, this.inputIndex);
  }

  public withInputIndex(value: number): T {
    return new this.Ctor(this.id, this.outputId, this.inputId, this.outputIndex, value);
  }

  public serialize(target: Uint8Vector, nodes: Array<Node>): void {
    const outNodeIndex = nodes.findIndex(n => n.id === this.outputId);
    const inNodeIndex = nodes.findIndex(n => n.id === this.inputId);
    target.pushBack(lsb(outNodeIndex));
    target.pushBack(msb(outNodeIndex));
    target.pushBack(lsb(inNodeIndex));
    target.pushBack(msb(inNodeIndex));
    target.pushBack(lsb(this.outputIndex));
    target.pushBack(lsb(this.inputIndex));
  }

  private get Ctor() {
    return this.constructor as {
      new(id: number, outputId: number, inputId: number, outputIndex: number, inputIndex: number): T;
    };
  }
}

export class NodeLinkColor extends NodeLink<NodeLinkColor> {
  public static createNew(outputId: number, inputId: number, outputIndex: number, inputIndex: number): NodeLinkColor {
    return new NodeLinkColor(NodeLink.nextId++, outputId, inputId, outputIndex, inputIndex);
  }
}

export class NodeLinkTrigger extends NodeLink<NodeLinkTrigger> {
  public static createNew(outputId: number, inputId: number, outputIndex: number, inputIndex: number): NodeLinkTrigger {
    return new NodeLinkTrigger(NodeLink.nextId++, outputId, inputId, outputIndex, inputIndex);
  }
}
