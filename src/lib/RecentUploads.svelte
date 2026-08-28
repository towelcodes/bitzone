<script lang="ts">
    import { File, X } from "@lucide/svelte";
    import { fade, slide } from "svelte/transition";
    import { onMount } from "svelte";

    let { uploads = $bindable([]) } = $props();

    let hovered: string | undefined = $state();

    onMount(() => {
        const stored = window.localStorage.getItem("recentUploads");
        if (stored) {
            uploads = JSON.parse(stored);
        }
    });

    function remove(key: string) {
        uploads = uploads.filter((u) => u !== key);
        window.localStorage.setItem("recentUploads", JSON.stringify(uploads));
    }
</script>

{#if uploads.length > 0}
    <div transition:fade={{ duration: 200 }}>
        <h2 class="text-ctp-subtext0 italic text-sm mb-4 mt-8">
            recent uploads
        </h2>
        <div class="flex gap-2 flex-wrap">
            {#each uploads as upload (upload)}
                <div
                    role="listitem"
                    class="relative flex items-center gap-2 rounded border-2 border-ctp-mantle px-3 py-1 text-sm"
                    onmouseenter={() => (hovered = upload)}
                    onmouseleave={() => (hovered = undefined)}
                    transition:slide={{ duration: 200 }}
                >
                    <a
                        href={`/v/${upload}`}
                        class="flex items-center gap-2 no-underline"
                    >
                        <File class="stroke-ctp-subtext0" />
                        {upload}
                    </a>
                    {#if hovered === upload}
                        <button
                            class="absolute -top-2 -right-2 rounded-full bg-ctp-surface1 p-0.5 transition hover:bg-ctp-red hover:text-ctp-crust"
                            onclick={() => remove(upload)}
                            aria-label="remove from recent uploads"
                        >
                            <X class="w-3 h-3" />
                        </button>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
{/if}
