<script lang="ts">
  import { coreConsts } from "$lib/model/core.model";
  import { editorService } from "$lib/service/editor.service";
  import { coreStore } from "$lib/store/core.store";
  import { editorStore } from "$lib/store/editor.store";
  import { uiStore } from "$lib/store/ui.store";
  import { estimateTime } from "$lib/util/dmx.util";

  interface Props {
    nodeId: number;
  }

  let { nodeId }: Props = $props();

  const coreData = coreStore.data;
  const editorNodes = editorStore.nodes;
  const editorActiveId = editorStore.activeId;
  const editorColorLinks = editorStore.colorLinks;

  const node = $derived($editorNodes.find(n => n.id === nodeId));
  const nodeConfig = $derived(node?.config);

  const nodeSummary = $derived.by(() => {
    if (!node) return "";
    const inputsCount = $editorColorLinks.filter(l => l.inputId === nodeId).length;
    switch (nodeConfig?.typeId) {
      case coreConsts.TYPE_DS_DMX_RGB:
        if (inputsCount > 1) {
          return `${node.params[0].value.toString(10).padStart(3, "0")}-${Math.min(512, (node.params[0].value + 2) + (inputsCount - 1) * 3).toString(10).padStart(3, "0")}`;
        }
        return `${node.params[0].value.toString(10).padStart(3, "0")}-${Math.min(512, node.params[0].value + 2).toString(10).padStart(3, "0")}`;
      case coreConsts.TYPE_FX_BREATHE:
        return `${estimateTime(node.params[0].value)} +${Math.round(360 * (node.params[1].value % node.params[0].value) / node.params[0].value)}° ${Math.round((node.params[2].value / 255) * 100)}%`;
      case coreConsts.TYPE_FX_PULSE:
        return `${estimateTime(node.params[0].value)} - ${estimateTime(node.params[1].value)} - ${estimateTime(node.params[2].value)}`;
      case coreConsts.TYPE_FX_STROBE:
        return `${estimateTime(node.params[0].value)}`;
      case coreConsts.TYPE_SR_COLOR:
        return `${node.params[0].value}, ${node.params[1].value}, ${node.params[2].value}`;
      case coreConsts.TYPE_SR_TRIGGER:
        return `#${node.params[0].value.toFixed(0).padStart(3, "0")}`;
      case coreConsts.TYPE_TR_CHANCE:
        return `${Math.round(100 * node.params[0].value / 65535)}%`;
      case coreConsts.TYPE_TR_CYCLE:
        return `${estimateTime(node.params[0].value)}`;
      case coreConsts.TYPE_TR_DELAY:
        return `${estimateTime(node.params[0].value)}`;
      case coreConsts.TYPE_TR_RANDOM:
        return `${estimateTime(node.params[0].value)}-${estimateTime(node.params[1].value)}`;
      case coreConsts.TYPE_TR_SEQUENCE:
        return `${node.params[0].value ? "random" : "sequential"}`;
      default:
        return null;
    }
  });

  function selectNode(event: MouseEvent | KeyboardEvent): void {
    if ("key" in event && event.key !== "Enter") return;
    editorService.selectNode(nodeId);
  }
</script>

{#if node}
  <div class="header" onclick={selectNode} onkeydown={selectNode} role="button" tabindex="0">
    {#if $uiStore.has("debug")}
      <code>{node.id}</code>
    {/if}
    {#if node.config.typeId === coreConsts.TYPE_SR_COLOR}
      {@const red = node.params.find(p => p.config.name === "red")?.value}
      {@const green = node.params.find(p => p.config.name === "green")?.value}
      {@const blue = node.params.find(p => p.config.name === "blue")?.value}
      <div class="color-preview" style:background-color={`rgb(${red ?? 0}, ${green ?? 0}, ${blue ?? 0})`}></div>
    {/if}
    {#if node.config.typeId === coreConsts.TYPE_DS_DMX_RGB}
      {@const address = node.params.find(p => p.config.name === "address")?.value}
      {@const red = $coreData.dmxData.at(address ?? 0)}
      {@const green = $coreData.dmxData.at((address ?? 0) + 1)}
      {@const blue = $coreData.dmxData.at((address ?? 0) + 2)}
      <div class="color-preview" style:background-color={`rgb(${red ?? 0}, ${green ?? 0}, ${blue ?? 0})`}></div>
    {/if}
    <div class="name">{$editorActiveId === nodeId ? node.config.name : node.label || node.config.name}</div>
    {#if nodeSummary}
      <div class="summary">{nodeSummary}</div>
    {/if}
  </div>
{/if}

<style>
  .header {
    padding: 0 var(--s-md);
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    background: var(--header-color);
    height: var(--s-lg);
    gap: var(--s-sm);

    --header-color: oklch(0.25 0 0);
    --header-color-focus: oklch(0.3 0 0);

    :global(.type-source) & {
      --header-color: oklch(0.3 0.05 260);
      --header-color-focus: oklch(0.35 0.05 260);
    }

    :global(.type-trigger) & {
      --header-color: oklch(0.3 0.05 60);
      --header-color-focus: oklch(0.35 0.05 60);
    }

    :global(.type-effect) & {
      --header-color: oklch(0.3 0.05 120);
      --header-color-focus: oklch(0.35 0.05 120);
    }

    :global(.type-mix) & {
      --header-color: oklch(0.3 0.05 300);
      --header-color-focus: oklch(0.35 0.05 300);
    }

    :global(.type-destination) & {
      --header-color: oklch(0.3 0.05 190);
      --header-color-focus: oklch(0.35 0.05 260);
    }

    &:hover,
    &:focus-visible {
      background: var(--header-color-focus);
    }

    .color-preview {
      flex: 0 0 auto;
      width: var(--s-smp);
      height: var(--s-smp);
      border-radius: 50%;
      outline: 1px solid #fff1;
      margin-top: -1px;
    }

    .name {
      font-size: 13px;
      line-height: 1.2;
      letter-spacing: 0.01em;
      min-width: 0;
      display: block;
      white-space: nowrap;
      flex: 1 1 auto;
      margin-top: -3px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .summary {
      text-align: right;
      font-size: 11px;
      opacity: 0.6;
      line-height: 1.2;
      letter-spacing: 0.01em;
      min-width: 0;
      display: block;
      white-space: nowrap;
      flex: 0 0 auto;
      margin-top: -3px;
    }
  }
</style>
