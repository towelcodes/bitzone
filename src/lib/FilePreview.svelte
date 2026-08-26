<script lang="ts">
    import { PUBLIC_BASE_URL } from "$env/static/public";
    import type { Snippet } from "svelte";

    interface Props {
        contentType: string;
        file: string;
        raw?: string;
        download_button: Snippet;
    }

    let { contentType, file, raw, download_button }: Props = $props();
</script>

<div class="bg-ctp-crust rounded px-4 py-4">
    <div class="max-w-2xl mx-auto">
        {#if contentType.startsWith("image")}
            <img src={raw} alt="" class="max-h-[32em] mx-auto" />
        {:else if contentType.startsWith("video")}
            <video width="320" height="240" class="mx-auto" controls>
                <source src={raw} type={contentType} />
                your browser does not support previewing this video type.
            </video>
        {:else if contentType.startsWith("audio")}
            <audio controls class="mx-auto">
                <source src={raw} type={contentType} />
                your browser does not support previewing this audio type.
            </audio>
        {:else if contentType === "text/plain"}
            <iframe src={raw} class="w-full h-[32em] rounded"></iframe>
            <!-- {:else if contentType === "application/pdf"}
            <iframe
                src={`http://docs.google.com/gview?url=${PUBLIC_BASE_URL}/u/${file}&embedded=true`}
                class="w-full h-[32em] rounded"
            ></iframe> -->
        {:else}
            <div class="w-full text-center">
                <div class="flex flex-col">
                    <div class="grow flex items-center justify-center py-4">
                        <div
                            class="rounded-full bg-ctp-mantle w-20 h-20 text-4xl font-bold flex items-center justify-center"
                        >
                            <h1 class="text-ctp-maroon">?</h1>
                        </div>
                    </div>
                </div>

                <h3 class="text-ctp-subtext0 mb-2">
                    this file type can't be previewed yet.
                </h3>
                <div class="[&_button]:mx-auto my-4">
                    {@render download_button()}
                </div>
            </div>
        {/if}
    </div>
</div>
