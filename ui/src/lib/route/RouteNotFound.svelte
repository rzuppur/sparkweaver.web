<script lang="ts">
  import { routeStore } from "$lib/store/route.store";
</script>

<div class="not-found">
  <div class="not-found-container">
    <h1>Page not found</h1>
    {#if $routeStore?.params?.path}
      <p>Could not find page</p>
      <!-- @formatter:off -->
      <code>{$routeStore.params.path}{#if $routeStore.params.params}?{$routeStore.params.params}{/if}</code>
      <!-- @formatter:on -->
    {/if}
  </div>
</div>


<style>
  .not-found {
    background: #111;
    padding: var(--s-md);
    display: grid;
    grid-template-columns: 1fr minmax(0, 700px) 1fr;
    align-items: start;
    grid-template-rows: auto;
    align-content: start;
    row-gap: var(--s-md);
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;

    .not-found-container {
      grid-column: 2 / 3;
      text-align: center;

      h1 {
        font-size: 32px;
        font-weight: 400;
        letter-spacing: -0.02em;
        line-height: 1.3;
        margin-top: var(--s-lg);
        margin-bottom: var(--s-lg);
      }

      p {
        line-height: 1.2;
        font-size: 13px;
        letter-spacing: 0.03em;
        opacity: 0.8;
      }

      code {
        font-family: monospace;
        font-size: 13px;
        opacity: 0.4;
        letter-spacing: 0.02em;
      }
    }
  }
</style>
