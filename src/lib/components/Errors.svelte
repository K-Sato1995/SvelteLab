<script lang="ts">
	import type { SvelteError } from '$lib/types';
	import { svelte_compiler } from '$lib/workers';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { Warning } from 'svelte/types/compiler/interfaces';
	import ErrorIcon from '~icons/material-symbols/error-circle-rounded-outline';
	import WarningIcon from '~icons/material-symbols/warning-outline-rounded';

	export let code = '';
	export let warnings = [] as Warning[];
	export let error: SvelteError | null = null;

	onMount(() => {
		const handler = (e: any) => {
			warnings = e.data?.result?.warnings ?? [];
			error = e.data?.result?.error;
		};
		svelte_compiler.addEventListener('message', handler);
		return () => {
			svelte_compiler.removeEventListener('message', handler);
		};
	});

	function parse(code: string) {
		warnings = [];
		error = null;
		svelte_compiler.postMessage({
			type: 'compile',
			id: '',
			source: code,
			options: {},
			return_ast: true
		});
	}

	$: parse(code);
</script>

<ul>
	{#if error}
		<li class="error" transition:slide={{ delay: 250, duration: 250 }}>
			<ErrorIcon />{error.message} at {error.start?.line}:{error.start?.column}
		</li>
	{/if}

	{#each warnings as warning}
		<li class="warning" transition:slide={{ delay: 250, duration: 250 }}>
			<WarningIcon />{warning.message}
			{#if warning.start}
				at {warning.start?.line}:{warning.start?.column}
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		position: absolute;
		inset: 0;
		top: auto;
		color: var(--sk-back-1);
		font-size: var(--sk-text-xs);
		margin: 0;
		padding: 0;
	}
	li {
		padding: 0.3em;
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.5em;
		border-top: 1px solid var(--sk-back-4);
	}
	li :global(svg) {
		font-size: var(--sk-text-m);
	}
	.warning {
		background-color: #e2aa53;
	}
	.error {
		background-color: #ff5555;
	}
</style>
