<script lang="ts">
    import { X } from "@lucide/svelte";
    import { page } from "$app/state";
    const error = page.error;
</script>

<div class="flex items-center justify-center w-full h-full">
    <div class="bg-ctp-crust rounded px-8 py-4 relative min-w-sm">
        <h1 class="font-display text-ctp-maroon text-7xl absolute -top-10">
            {error?.message.toLowerCase()}
        </h1>
        <div class="flex flex-col">
            <div class="grow flex items-center justify-center py-12">
                <div class="rounded-full bg-ctp-mantle px-4 py-4">
                    <X class="w-16 h-16 text-ctp-maroon" />
                </div>
            </div>
        </div>
        <div class="font-sans text-center max-w-lg">
            The file at this address may have been deleted or your link may have
            expired.
        </div>
        <div
            class="my-6 rounded-sm bg-ctp-surface0 font-mono px-2 text-center w-min text-nowrap mx-auto text-ctp-subtext0"
        >
            {page.status}
            {error?.message}
        </div>
    </div>
</div>
