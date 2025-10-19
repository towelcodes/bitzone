<script lang="ts">
    import { TriangleAlert, Upload } from "@lucide/svelte";

    let files: FileList | undefined = $state();
    async function upload() {
        console.log(files);
        const fd = new FormData();
        if (files) fd.append("file", files[0]);
        console.log(fd);
        await fetch("/api/upload", { method: "POST", body: fd });
    }

    $effect(() => {
        if (files) {
            console.log(files);
        }
    });
</script>

<div class="font-mono p-8">
    <nav class="flex *:my-auto gap-4 m-4 mb-8">
        <h1
            class="bg-ctp-red text-ctp-crust italic font-bold rounded px-2 py-0.5 w-min text-lg"
        >
            bitzone
        </h1>

        <span class="text-ctp-subtext0 italic"> free file uploads </span>
    </nav>

    <div class="my-4">
        <div class="border-2 rounded border-ctp-red relative p-4">
            <div
                class="absolute bg-bg italic text-ctp-red -top-2.5 text-sm px-1 flex gap-1 *:my-auto"
            >
                <TriangleAlert class="h-4" />
                <div>instance rules</div>
            </div>

            <ul class="text-sm">
                <li>do not upload nsfw or illegal content.</li>
                <li>this service is for personal use only.</li>
                <li>
                    accept that your content may disappear at any time for any
                    reason.
                </li>
            </ul>
        </div>
        <span class="text-xs text-ctp-subtext0 italic">
            don't like these rules? <a href="https://github.com"
                >host your own!</a
            >
        </span>
    </div>

    <div>
        <input type="file" bind:files />

        <button
            class="flex gap-2 *:my-auto text-sm bg-ctp-red text-ctp-crust font-bold px-3 py-2"
            onclick={upload}
        >
            <Upload /> upload a file
        </button>
    </div>
</div>
