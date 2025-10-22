<script lang="ts">
    import { TriangleAlert, Upload, File, X } from "@lucide/svelte";

    let uploadButton,
        clearButton: HTMLButtonElement | undefined = $state();

    let filename = $state("");
    let files: FileList | undefined = $state();
    let filesInput: HTMLInputElement | undefined = $state();

    async function upload() {
        console.log(files);
        const fd = new FormData();
        if (files) fd.append("file", files[0]);
        console.log(fd);
        await fetch("/api/upload", { method: "POST", body: fd });
    }

    function clear() {
        files = new DataTransfer().files;
    }

    $effect(() => {
        if (files) {
            console.log(files);
            if (files.length > 0) {
                filename = files[0].name;
                uploadButton!!.disabled = false;
                clearButton!!.disabled = false;
            } else {
                filename = "";
                uploadButton!!.disabled = true;
                clearButton!!.disabled = true;
            }
        } else {
            filename = "";
            uploadButton!!.disabled = true;
            clearButton!!.disabled = true;
        }
    });

    function drop(e: DragEvent) {
        // fixme unknown assert
        if ([...e.dataTransfer!!.items].some((item) => item.kind === "file")) {
            e.preventDefault();
        }
    }

    function dragOver(e: DragEvent) {
        const fileItems = [...e.dataTransfer!!.items].filter(
            (item) => item.kind === "file",
        );
        if (fileItems.length > 0) {
            e.preventDefault();
            e.dataTransfer!!.dropEffect = "copy";
        }
    }
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

    <div class="text-center *:mx-auto">
        <label
            for="upload"
            class="w-64 h-16 border-2 border-dotted border-ctp-lavender my-4 flex justify-center items-center"
            ondrop={drop}
            ondragover={dragOver}
        >
            <div class="flex gap-2 *:my-auto">
                <File class="ml-auto stroke-ctp-subtext0" />
                {#if filename == ""}
                    <p class="italic text-ctp-subtext0 text-sm mr-auto">
                        [select a file]
                    </p>
                {:else}
                    <p class="text-sm mr-auto">
                        {filename}
                    </p>
                {/if}
            </div>
            <input
                id="upload"
                type="file"
                bind:this={filesInput}
                bind:files
                class="hidden"
            />
        </label>

        <div class="flex gap-2 mx-auto justify-center items-center">
            <button
                class="flex gap-2 *:my-auto text-sm border-1 border-solid border-ctp-red bg-ctp-red text-ctp-crust font-bold px-3 py-2 hover:bg-transparent hover:text-ctp-text transition disabled:bg-transparent disabled:border-ctp-overlay0 disabled:border-dashed disabled:text-ctp-subtext0/40"
                onclick={upload}
                bind:this={uploadButton}
                disabled
            >
                <Upload /> upload
            </button>
            <button
                class="flex gap-2 *:my-auto text-sm border-1 border-solid border-ctp-lavender bg-ctp-lavender text-ctp-crust font-bold px-3 py-2 hover:bg-transparent hover:text-ctp-text transition disabled:bg-transparent disabled:border-ctp-overlay0 disabled:border-dashed disabled:text-ctp-subtext0/40"
                onclick={clear}
                bind:this={clearButton}
                disabled
            >
                <X />
            </button>
        </div>
    </div>
</div>
