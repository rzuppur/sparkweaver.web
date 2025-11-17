<script lang="ts">
  import type { NodeParam } from "$lib/model/nodeParam.model";
  import { editorService } from "$lib/service/editor.service";
  import { editorStore } from "$lib/store/editor.store";
  import { clamp } from "$lib/util/math.util";
  import { untrack } from "svelte";

  interface Props {
    nodeId: number;
    param: NodeParam;
    index: number;
  }

  let { nodeId, param, index }: Props = $props();

  const editorNodes = editorStore.nodes;
  const node = $derived($editorNodes.find(n => n.id === nodeId));

  let valueMirror = $state(0);

  $effect(() => {
    const p = node && node.params.at(index);
    if (p && p.value !== untrack(() => valueMirror)) {
      valueMirror = p.value;
    }
  });

  function setParam(): void {
    if (valueMirror === undefined) return;
    editorService.setNodeParameter(nodeId, index, clamp(param.config.min, Math.floor(valueMirror), param.config.max));
  }
</script>


<div class="param">
  <div class="param-name">{param.config.name}</div>
  <div class="param-value">
    <input
      type="range"
      bind:value={valueMirror} onchange={setParam}
      min={param.config.min}
      max={param.config.max}
      step="1"
    />
    <input
      type="number"
      bind:value={valueMirror} onchange={setParam}
      min={param.config.min}
      max={param.config.max}
      step="1"
    />
  </div>
</div>

<style>
  .param {
    display: flex;
    flex-direction: column;
    gap: var(--s-xsp);

    .param-name {
      font-size: 11px;
      opacity: 0.6;
      line-height: 1;
      letter-spacing: 0.01em;
      min-width: 0;
      display: block;
      white-space: nowrap;
      flex: 0 0 auto;
      margin-bottom: -3px;
    }

    .param-value {
      display: grid;
      gap: var(--s-md);
      grid-template-columns: 1fr 58px;

      input {
        min-width: 0;
        width: 100%;
        display: block;
      }
    }
  }
</style>
