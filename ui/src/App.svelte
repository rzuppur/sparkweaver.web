<script lang="ts">
  import RouteProject from "$lib/routes/RouteProject.svelte";
  import RouteProjects from "$lib/routes/RouteProjects.svelte";
  import { currentRoute } from "$lib/services";
</script>

{#if $currentRoute.path === "project"}
  <RouteProject></RouteProject>
{:else if $currentRoute.path === "projects"}
  <RouteProjects></RouteProjects>
{/if}
