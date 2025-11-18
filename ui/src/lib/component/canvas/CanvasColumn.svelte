<script lang="ts">
  import CanvasNode from "$lib/component/canvas/node/CanvasNode.svelte";
  import type { NodeCategory } from "$lib/model/nodeConfig.model";
  import { editorService } from "$lib/service/editor.service";
  import { coreStore } from "$lib/store/core.store";
  import { editorStore } from "$lib/store/editor.store";

  interface Props {
    title: string;
    category: NodeCategory;
  }

  let { title, category }: Props = $props();

  const configs = coreStore.configs;
  const editorNodes = editorStore.nodes;
  const editorSelection = editorStore.selection;

  const categoryConfigs = $derived($configs.filter(n => n.category === category));
  const categoryNodes = $derived($editorNodes.filter(n => n.category === category));

  function addNode(typeId: number): void {
    editorService.addNewNode(typeId);
  }
</script>

<div class="column type-{title.toLocaleLowerCase()}">
  <div class="column-title">{title}</div>
  {#each categoryNodes as node (node.id)}
    <CanvasNode {node}></CanvasNode>
  {/each}
  <div>
    {#each categoryConfigs as nodeConfig (nodeConfig.typeId)}
      <button type="button" onclick={() => addNode(nodeConfig.typeId)} class="add-button" disabled={!!($editorSelection.outputId || $editorSelection.inputId)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
        </svg>
        <span class="button-label">{nodeConfig.name}</span>
      </button>
    {/each}
  </div>
  <div class="column-footer"></div>
</div>

<style>
  .column {
    display: flex;
    flex-direction: column;
    gap: var(--s-sm);

    .column-title {
      flex: 1 1 auto;
      font-size: 24px;
      line-height: 1;
      white-space: nowrap;
      letter-spacing: -0.04em;
      color: #555;
      margin-bottom: var(--s-sm);
    }

    .add-button {
      height: 32px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: var(--s-xsp);
      justify-content: start;
      text-align: start;
      background: transparent;
      border-radius: var(--s-sm);

      svg {
        width: 20px;
        height: 20px;
        display: block;
        fill: #fff;
        flex: 0 0 auto;
      }

      .button-label,
      svg {
        opacity: 0.6;
      }

      &:hover {
        background: #fff1;

        .button-label,
        svg {
          opacity: 0.8;
        }
      }
    }

    .column-footer {
      flex: 2 1 auto;
    }
  }
</style>
