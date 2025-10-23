<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<footer class="text-ctp-subtext0 text-xs font-pixel text-center">
    bitzone is open source
</footer>
