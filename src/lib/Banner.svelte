<script lang="ts">
    import discordIcon from "$lib/assets/discord.svg";
    import Button from "./Button.svelte";
    import { Folder, LogIn } from "@lucide/svelte";

    interface User {
        displayName: string;
        avatarUrl?: string;
    }

    interface Props {
        user: User | null;
    }

    let { user }: Props = $props();
</script>

<nav>
    <div class="flex gap-2 w-min md:gap-0 justify-around hover:cursor-default md:w-3/4 mx-auto">
        <a class="flex gap-2 items-center px-2 rounded bg-ctp-surface0 clicky no-underline" href="/">
            <Folder class="stroke-ctp-mauve" />
            <div class="font-sans text-ctp-mauve text-2xl">
                files<span class="text-ctp-subtext0 text-lg">.towel.codes</span>
            </div>
        </a>

        <div class="px-2 flex gap-2 items-center">
            {#if user}
                <div class="bg-ctp-surface0 rounded px-2 py-1 flex gap-2 items-center">
                    <img
                        src={user.avatarUrl}
                        alt=""
                        class="w-6 h-6 rounded-full"
                    />
                    {user.displayName}
                </div>

                <div class="bg-ctp-surface0 rounded px-2 py-1 flex gap-2 items-center text-ctp-subtext0 clicky">
                    <a href="/auth/logout" class="no-underline hover:text-ctp-text">
                        <span class="hidden md:inline">
                            Log out
                        </span>
                    </a>
                </div>
            {:else}
                <div class="bg-ctp-surface0 rounded px-2 py-1 flex gap-2 items-center clicky">
                    <LogIn/>
                    <a href="/auth" class="no-underline">
                        <span class="hidden md:inline">
                            Login with Discord
                        </span>
                    </a>
                </div>
            {/if}
        </div>
    </div>
</nav>
