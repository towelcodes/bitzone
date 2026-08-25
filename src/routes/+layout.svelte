<script lang="ts">
    import { PUBLIC_REPO_URL } from "$env/static/public";
    import "../app.css";
    import faviconDark from "$lib/assets/favicon-dark.svg";
    import faviconLight from "$lib/assets/favicon-light.svg";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={faviconDark} media="(prefers-color-scheme: dark)" />
    <link
        rel="icon"
        href={faviconLight}
        media="(prefers-color-scheme: light)"
    />
</svelte:head>

<div class="mt-4 md:mx-0 mx-2">
    {@render children?.()}
</div>
