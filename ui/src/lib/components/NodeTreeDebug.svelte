<script lang="ts">
  import { editorTreeString } from "$lib/services";
</script>

<div class="tree-debug">
  <pre>{$editorTreeString}</pre>
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
