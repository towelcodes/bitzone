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
    teatowel powered <br />
    icons from lucide <br />
    see what powers bitzone
</footer>
