import { NodeParam } from "$lib/NodeParam.svelte.js";
import { coreService, editorService } from "$lib/services";
import type { NodeType } from "$lib/services/coreService";
import { get } from "svelte/store";

type AnchorPosition = [x: number, y: number, w: number, h: number];

export type AnchorType = "color" | "trigger";

const OUTPUTS_UNLIMITED = 32;

export class Node {
  protected _colorInputs: Array<Node> = $state([]);
  protected _colorOutputs: Array<Node> = $state([]);
  protected _triggerInputs: Array<Node> = $state([]);
  protected _triggerOutputs: Array<Node> = $state([]);

  protected colorInputAnchorPositions: Array<AnchorPosition> = $state([]);
  protected colorOutputAnchorPositions: Array<AnchorPosition> = $state([]);
  protected triggerInputAnchorPositions: Array<AnchorPosition> = $state([]);
  protected triggerOutputAnchorPositions: Array<AnchorPosition> = $state([]);

  private animationFrameId?: number;
  private static nextUid = 0;

  public element?: HTMLElement = $state();
  public label: string | undefined = $state(undefined);

  public readonly params: ReadonlyArray<NodeParam> = $state([]);
  public readonly nodeType: NodeType;
  public readonly uid: number;

  constructor(
    public readonly typeId: number,
    public readonly name: string,
    public readonly maxColorInputs: number,
    public readonly maxTriggerInputs: number,
    public readonly enableColorOutputs: boolean,
    public readonly enableTriggerOutputs: boolean,
    params: ReadonlyArray<NodeParam>,
  ) {
    this.uid = Node.nextUid++;
    this.params = params;
    this.nodeType = get(coreService.nodeTypes).find(nt => nt.type_id === this.typeId)!;
    this.updateAnchorPositions();
  }

  public destroy(): void {
    if (this.animationFrameId !== undefined) window.cancelAnimationFrame(this.animationFrameId);
    this._colorInputs.forEach(n => n.removeColorOutput(this));
    this._colorOutputs.forEach(n => n.removeColorInput(this));
    this._triggerInputs.forEach(n => n.removeTriggerOutput(this));
    this._triggerOutputs.forEach(n => n.removeTriggerInput(this));
  }

  public clone(): Node {
    const params = this
      .params.map(p => new NodeParam(p.name, p.min, p.max, p.defaultValue))
      .map((p, i) => {
        p.value = this.params[i].value;
        return p;
      });
    const node = new Node(
      this.typeId,
      this.name,
      this.maxColorInputs,
      this.maxTriggerInputs,
      this.enableColorOutputs,
      this.enableTriggerOutputs,
      params,
    );
    if (this.label) node.label = this.label;
    return node;
  }

  private getAnchorPositions(query: string): Array<AnchorPosition> {
    if (!this.element) return [];
    const anchors = Array.from(this.element.querySelectorAll<HTMLElement>(query));
    return anchors.map(a => [
      a.offsetLeft,
      a.offsetTop,
      a.offsetWidth,
      a.offsetHeight,
    ]);
  }

  private static diffAnchorPositions(a: Array<AnchorPosition>, b: Array<AnchorPosition>): boolean {
    return a.length !== b.length ||
      a.some((p, i) =>
        p[0] !== b[i][0] ||
        p[1] !== b[i][1] ||
        p[2] !== b[i][2] ||
        p[3] !== b[i][3]);
  }

  protected getColorOutputAnchorPosition(to: Node): AnchorPosition | undefined {
    const index = this.colorOutputs.indexOf(to);
    if (index >= 0) {
      return this.colorOutputAnchorPositions.at(index);
    }
  }

  protected getTriggerOutputAnchorPosition(to: Node): AnchorPosition | undefined {
    const index = this.triggerOutputs.indexOf(to);
    if (index >= 0) {
      return this.triggerOutputAnchorPositions.at(index);
    }
  }

  private updateAnchorPositions(): void {
    // Color input
    if (this.element && this.colorInputAnchorsCount) {
      const positions = this.getAnchorPositions(".input .anchor.color");
      if (Node.diffAnchorPositions(positions, this.colorInputAnchorPositions)) {
        this.colorInputAnchorPositions = positions;
      }
    } else if (Node.diffAnchorPositions([], this.colorInputAnchorPositions)) {
      this.colorInputAnchorPositions = [];
    }

    // Color output
    if (this.element && this.colorOutputAnchorsCount) {
      const positions = this.getAnchorPositions(".output .anchor.color");
      if (Node.diffAnchorPositions(positions, this.colorOutputAnchorPositions)) {
        this.colorOutputAnchorPositions = positions;
      }
    } else if (Node.diffAnchorPositions([], this.colorOutputAnchorPositions)) {
      this.colorOutputAnchorPositions = [];
    }

    // Trigger input
    if (this.element && this.triggerInputAnchorsCount) {
      const positions = this.getAnchorPositions(".input .anchor.trigger");
      if (Node.diffAnchorPositions(positions, this.triggerInputAnchorPositions)) {
        this.triggerInputAnchorPositions = positions;
      }
    } else if (Node.diffAnchorPositions([], this.triggerInputAnchorPositions)) {
      this.triggerInputAnchorPositions = [];
    }

    // Trigger output
    if (this.element && this.triggerOutputAnchorsCount) {
      const positions = this.getAnchorPositions(".output .anchor.trigger");
      if (Node.diffAnchorPositions(positions, this.triggerOutputAnchorPositions)) {
        this.triggerOutputAnchorPositions = positions;
      }
    } else if (Node.diffAnchorPositions([], this.triggerOutputAnchorPositions)) {
      this.triggerOutputAnchorPositions = [];
    }

    // Reschedule
    this.animationFrameId = window.requestAnimationFrame(this.updateAnchorPositions.bind(this));
  }

  protected static getCablePath(from: AnchorPosition, to: AnchorPosition): string {
    const x1 = from[0] + from[2] / 2;
    const y1 = from[1] + from[3] / 2;
    const x2 = to[0] + to[2] / 2;
    const y2 = to[1] + to[3] / 2;

    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const tension = Math.min(distance * 0.2, 100);
    const angle = Math.atan2(deltaY, deltaX);
    const cp1OffsetX = tension * Math.cos(angle);
    const cp1OffsetY = tension * Math.sin(angle);
    const gravity = Math.min(distance * 0.2, 20);
    const cp1x = x1 + cp1OffsetX;
    const cp1y = y1 + cp1OffsetY + gravity;
    const cp2x = x2 - cp1OffsetX;
    const cp2y = y2 - cp1OffsetY + gravity;

    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  }

  public colorLines = $derived.by<Array<[number, number, string]>>(() => {
    const lines: Array<[number, number, string]> = [];
    for (const [index, inputPosition] of this.colorInputAnchorPositions.entries()) {
      const otherSide = this._colorInputs.at(index);
      if (!otherSide) continue;
      const outputPosition = otherSide.getColorOutputAnchorPosition(this);
      if (!outputPosition) continue;
      lines.push([this.uid, otherSide.uid, Node.getCablePath(outputPosition, inputPosition)]);
    }
    return lines;
  });

  public triggerLines = $derived.by<Array<[number, number, string]>>(() => {
    const lines: Array<[number, number, string]> = [];
    for (const [index, inputPosition] of this.triggerInputAnchorPositions.entries()) {
      const otherSide = this._triggerInputs.at(index);
      if (!otherSide) continue;
      const outputPosition = otherSide.getTriggerOutputAnchorPosition(this);
      if (!outputPosition) continue;
      lines.push([this.uid, otherSide.uid, Node.getCablePath(outputPosition, inputPosition)]);
    }
    return lines;
  });

  public addColorInput(node: Node): void {
    if (node.uid === this.uid) throw new Error("Cannot connect to itself");
    if (this.colorInputs.includes(node)) throw new Error("Already connected");
    if (node.hasDependency(this)) throw new Error(`Circular color dependency ${node.name} => ${this.name}`);
    if (this._colorInputs.length >= this.maxColorInputs) throw new Error("too many inputs");
    this._colorInputs.push(node);
  }

  public addColorOutput(node: Node): void {
    if (node.uid === this.uid) throw new Error("Cannot connect to itself");
    if (this.colorOutputs.includes(node)) throw new Error("Already connected");
    if (this.hasDependency(node)) throw new Error(`Circular color dependency ${this.name} => ${node.name}`);
    if (!this.enableColorOutputs) throw new Error("color outputs are disabled");
    if (this._colorOutputs.length >= OUTPUTS_UNLIMITED) throw new Error("too many outputs");
    this._colorOutputs.push(node);
  }

  public addTriggerInput(node: Node): void {
    if (node.uid === this.uid) throw new Error("Cannot connect to itself");
    if (this.triggerInputs.includes(node)) throw new Error("Already connected");
    if (node.hasDependency(this)) throw new Error(`Circular trigger dependency ${node.name} => ${this.name}`);
    if (this._triggerInputs.length >= this.maxTriggerInputs) throw new Error("too many inputs");
    this._triggerInputs.push(node);
  }

  public addTriggerOutput(node: Node): void {
    if (node.uid === this.uid) throw new Error("Cannot connect to itself");
    if (this.triggerOutputs.includes(node)) throw new Error("Already connected");
    if (this.hasDependency(node)) throw new Error(`Circular trigger dependency ${this.name} => ${node.name}`);
    if (!this.enableTriggerOutputs) throw new Error("trigger outputs are disabled");
    if (this._triggerOutputs.length >= OUTPUTS_UNLIMITED) throw new Error("too many outputs");
    this._triggerOutputs.push(node);
  }

  protected removeColorInput(node: Node): void {
    this._colorInputs = this._colorInputs.filter(n => n.uid !== node.uid);
  }

  protected removeColorOutput(node: Node): void {
    this._colorOutputs = this._colorOutputs.filter(n => n.uid !== node.uid);
  }

  protected removeTriggerInput(node: Node): void {
    this._triggerInputs = this._triggerInputs.filter(n => n.uid !== node.uid);
  }

  protected removeTriggerOutput(node: Node): void {
    this._triggerOutputs = this._triggerOutputs.filter(n => n.uid !== node.uid);
  }

  public get hasFreeColorInputs(): boolean {
    return this._colorInputs.length < this.maxColorInputs;
  }

  public get hasFreeColorOutputs(): boolean {
    return this.enableColorOutputs && this._colorOutputs.length < OUTPUTS_UNLIMITED;
  }

  public get hasFreeTriggerInputs(): boolean {
    return this._triggerInputs.length < this.maxTriggerInputs;
  }

  public get hasFreeTriggerOutputs(): boolean {
    return this.enableTriggerOutputs && this._triggerOutputs.length < OUTPUTS_UNLIMITED;
  }

  public get colorInputAnchorsCount(): number {
    const existing = this._colorInputs.length;
    if (existing < this.maxColorInputs) return existing + 1;
    return existing;
  }

  public get colorOutputAnchorsCount(): number {
    const existing = this._colorOutputs.length;
    if (this.enableColorOutputs && existing < OUTPUTS_UNLIMITED) return existing + 1;
    return existing;
  }

  public get triggerInputAnchorsCount(): number {
    const existing = this._triggerInputs.length;
    if (existing < this.maxTriggerInputs) return existing + 1;
    return existing;
  }

  public get triggerOutputAnchorsCount(): number {
    const existing = this._triggerOutputs.length;
    if (this.enableTriggerOutputs && existing < OUTPUTS_UNLIMITED) return existing + 1;
    return existing;
  }

  public get colorInputs(): ReadonlyArray<Node> {
    return this._colorInputs;
  }

  public get colorOutputs(): ReadonlyArray<Node> {
    return this._colorOutputs;
  }

  public get triggerInputs(): ReadonlyArray<Node> {
    return this._triggerInputs;
  }

  public get triggerOutputs(): ReadonlyArray<Node> {
    return this._triggerOutputs;
  }

  protected hasDependency(node: Node): boolean {
    if (this._colorInputs.includes(node)) return true;
    if (this._triggerInputs.includes(node)) return true;
    return this._colorInputs.some(n => n.hasDependency(node)) || this._triggerInputs.some(n => n.hasDependency(node));
  }

  public static connectColor(from: Node, to: Node): void {
    from.addColorOutput(to);
    to.addColorInput(from);
  }

  public static disconnectColor(from: Node, to: Node): void {
    from.removeColorOutput(to);
    to.removeColorInput(from);
    editorService.triggerNodesUpdate();
  }

  public static connectTrigger(from: Node, to: Node): void {
    from.addTriggerOutput(to);
    to.addTriggerInput(from);
  }

  public static disconnectTrigger(from: Node, to: Node): void {
    from.removeTriggerOutput(to);
    to.removeTriggerInput(from);
    editorService.triggerNodesUpdate();
  }
}
