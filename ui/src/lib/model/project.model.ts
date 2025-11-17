import { logBus } from "$lib/bus/log.bus";
import { coreConsts } from "$lib/model/core.model";
import { Node } from "$lib/model/node.model";
import type { NodeConfig } from "$lib/model/nodeConfig.model";
import { NodeLinkColor, NodeLinkTrigger } from "$lib/model/nodeLink.model";
import { ArrayReader } from "$lib/util/arrayReader.util";
import { getId } from "$lib/util/data.util";
import { timestampNow } from "$lib/util/date.util";
import { Uint8Vector } from "$lib/util/vector.util";

type ProjectNodeLabels = { [key: number]: string };

function isProjectNodeLabels(value: unknown): value is ProjectNodeLabels {
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).every(([k, v]) => Number.isFinite(Number(k)) && typeof v === "string");
}

export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly tree: Uint8Vector,
    public readonly created: number,
    public readonly modified: number,
    public readonly labels: ProjectNodeLabels,
  ) {
  }

  public static createNew(): Project {
    return new Project(
      getId(),
      "New project",
      new Uint8Vector([
        coreConsts.TREE_VERSION,
        coreConsts.TYPE_SR_COLOR, 0xFF, 0x00, 0xFF, 0x00, 0xFF, 0x00,
        coreConsts.TYPE_DS_DMX_RGB, 0x01, 0x00,
        coreConsts.COMMAND_COLOR_LINKS, 0x01, 0x00,
        0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
      ]),
      timestampNow(),
      timestampNow(),
      {},
    );
  }

  public static createFromStorage(storage: unknown): Project | null {
    if (
      storage && typeof storage === "object" &&
      "id" in storage && typeof storage.id === "string" &&
      "name" in storage && typeof storage.name === "string" &&
      "tree" in storage && typeof storage.tree === "string" &&
      "created" in storage && typeof storage.created === "number" && Number.isFinite(storage.created) &&
      "modified" in storage && typeof storage.modified === "number" && Number.isFinite(storage.modified)
    ) {
      return new Project(
        storage.id,
        storage.name,
        Uint8Vector.fromString(storage.tree),
        storage.created,
        storage.modified,
        "labels" in storage && isProjectNodeLabels(storage.labels) ? storage.labels : {},
      );
    }
    return null;
  }

  public static createFromJson(text: string): Project | null {
    try {
      const project = JSON.parse(text);
      if (
        project && typeof project === "object" &&
        "name" in project && typeof project.name === "string" &&
        "tree" in project && typeof project.tree === "string" &&
        "labels" in project && isProjectNodeLabels(project.labels)
      ) {
        return new Project(
          getId(),
          project.name,
          Uint8Vector.fromString(project.tree),
          timestampNow(),
          timestampNow(),
          project.labels,
        );
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * @description Create identical deep copy.
   */
  public clone(): Project {
    return new Project(
      this.id,
      this.name,
      this.tree.clone(),
      this.created,
      this.modified,
      { ...this.labels },
    );
  }

  /**
   * @description Create a new copy with updated ID, name and timestamps.
   */
  public duplicate(): Project {
    return new Project(
      getId(),
      `${this.name} (Copy)`,
      this.tree.clone(),
      timestampNow(),
      timestampNow(),
      { ...this.labels },
    );
  }

  public withName(value: string): Project {
    return new Project(
      this.id,
      value,
      this.tree,
      this.created,
      this.modified,
      this.labels,
    );
  }

  public withTree(value: Uint8Vector): Project {
    return new Project(
      this.id,
      this.name,
      value,
      this.created,
      this.modified,
      this.labels,
    );
  }

  public withModified(value: number): Project {
    return new Project(
      this.id,
      this.name,
      this.tree,
      this.created,
      value,
      this.labels,
    );
  }

  public withLabels(value: ProjectNodeLabels): Project {
    return new Project(
      this.id,
      this.name,
      this.tree,
      this.created,
      this.modified,
      value,
    );
  }

  public labelsDiff(otherLabels: Project["labels"]): boolean {
    return JSON.stringify(this.labels) !== JSON.stringify(otherLabels);
  }

  public diff(other: Project): boolean {
    return this.id !== other.id ||
      this.name !== other.name ||
      !this.tree.equalTo(other.tree) ||
      this.created !== other.created ||
      this.modified !== other.modified ||
      this.labelsDiff(other.labels);
  }

  public deserialize(nodeConfigs: Array<NodeConfig>): [Array<Node>, Array<NodeLinkColor>, Array<NodeLinkTrigger>] {
    const nodes: Array<Node> = [];
    const colorLinks: Array<NodeLinkColor> = [];
    const triggerLinks: Array<NodeLinkTrigger> = [];
    const migrations = new Set<number>();
    const reader = new ArrayReader(this.tree.get());

    // Check version
    if (!reader.hasByte()) throw new Error("Tree is empty");
    const version = reader.readByte();
    if (version !== coreConsts.TREE_VERSION) {
      if (version < coreConsts.TREE_VERSION) {
        for (let v = version; v < coreConsts.TREE_VERSION; v++) migrations.add(v);
        logBus.writeInfo(`project: Migrating tree from v${version} to v${coreConsts.TREE_VERSION}`);
      } else throw new Error("Incompatible tree version");
    }

    // Parse commands
    while (reader.hasByte()) {
      const command = reader.readByte();

      if (migrations.has(2) && command >= 0xFC) {
        if (!reader.hasBytes(4)) throw new Error(`Link incomplete @ ${reader.position()}`);

        const from_node_index = reader.readShort();
        const to_node_index = reader.readShort();
        if (from_node_index >= nodes.length || to_node_index >= nodes.length)
          throw new Error(`Link index out of range @ ${reader.position()}`);

        const nodeInput = nodes[from_node_index];
        const nodeOutput = nodes[to_node_index];

        if (command === 0xFC) { // Color input
          const existingOutputs = colorLinks.filter(l => l.outputId === nodeOutput.id);
          const existingInputs = colorLinks.filter(l => l.inputId === nodeInput.id);
          colorLinks.push(new NodeLinkColor(nodeOutput.id, nodeInput.id, existingOutputs.length, existingInputs.length));
        } else if (command === 0xFD) { // Trigger input
          if (nodeOutput.config.typeId === coreConsts.TYPE_MX_ADD || nodeInput.config.typeId === coreConsts.TYPE_MX_ADD ||
            nodeOutput.config.typeId === coreConsts.TYPE_MX_SUBTRACT || nodeInput.config.typeId === coreConsts.TYPE_MX_SUBTRACT) {
            logBus.writeWarning(`Could not convert trigger links @ ${reader.position()}`);
          } else {
            const existingOutputs = triggerLinks.filter(l => l.outputId === nodeOutput.id);
            const existingInputs = triggerLinks.filter(l => l.inputId === nodeInput.id);
            triggerLinks.push(new NodeLinkTrigger(nodeOutput.id, nodeInput.id, existingOutputs.length, existingInputs.length));
          }
        } // Outputs are ignored, not 100% accurate migration

      } else if (command === coreConsts.COMMAND_COLOR_LINKS || command == coreConsts.COMMAND_TRIGGER_LINKS) {
        // Get links count
        if (!reader.hasShort()) throw new Error(`Links missing length @ ${reader.position()}`);
        const count = reader.readShort();

        // Read links
        for (let i = 0; i < count; i++) {
          if (!reader.hasBytes(6)) throw new Error(`Link incomplete @ ${reader.position()}`);
          const out_node_index = reader.readShort();
          const in_node_index = reader.readShort();
          const out_index = reader.readByte();
          const in_index = reader.readByte();
          if (out_node_index >= nodes.length || in_node_index >= nodes.length)
            throw new Error(`Link index out of range @ ${reader.position()}`);

          // Make link
          const nodeOut = nodes[out_node_index];
          const nodeIn = nodes[in_node_index];
          if (command == coreConsts.COMMAND_COLOR_LINKS)
            colorLinks.push(new NodeLinkColor(nodeOut.id, nodeIn.id, out_index, in_index));
          else
            triggerLinks.push(new NodeLinkTrigger(nodeOut.id, nodeIn.id, out_index, in_index));
        }

      } else {
        // Find corresponding node config
        const config = nodeConfigs.find(c => c.typeId === command);
        if (!config) throw new Error(`Unknown command @ ${reader.position()}`);

        // Read params
        const params = [];
        let paramsCount = config.params.length;
        if (migrations.has(1) && config.typeId === coreConsts.TYPE_FX_PULSE) paramsCount = 3;
        for (let i = 0; i < paramsCount; i++) {
          if (!reader.hasShort()) throw new Error(`Missing parameter @ ${reader.position()}`);
          params.push(reader.readShort());
        }
        if (migrations.has(1) && config.typeId === coreConsts.TYPE_FX_PULSE) params.push(0);

        // Make node
        nodes.push(Node.createNew(config, params, this.labels[nodes.length] || ""));
      }
    }

    return [nodes, colorLinks, triggerLinks];
  }

  public toJson(): string {
    return JSON.stringify({
      name: this.name,
      tree: this.tree.toJSON(),
      labels: this.labels,
    });
  }
}
