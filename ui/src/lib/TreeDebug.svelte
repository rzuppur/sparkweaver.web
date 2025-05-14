<script lang="ts">
  import { store } from "./store";

  const treeString = store.treeString;
</script>

<div class="tree-debug">
  <pre>{$treeString}</pre>
</div>

<style>
  .tree-debug {
    pre {
      font-size: 13px;
      font-family: monospace;
      padding: var(--s-md);
      background: #080808;
      color: #afd;
    }
  }
</style>