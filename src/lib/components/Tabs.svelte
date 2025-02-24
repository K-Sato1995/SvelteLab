<script lang="ts">
	import { get_file_icon } from '$lib/file_icons';
	import { close_all_tabs, close_file, current_tab, open_file, tabs } from '$lib/tabs';
	import { onDestroy, SvelteComponentTyped, type ComponentType } from 'svelte';
	import Close from '~icons/material-symbols/close-rounded';
	import Routes from '~icons/material-symbols/alt-route';
	import Lib from '~icons/material-symbols/local-library';
	import Folder from '~icons/material-symbols/folder';
	import Vim from '~icons/file-icons/macvim';
	import { editor_config } from '$lib/stores/editor_config_store';

	const base_icons = {
		routes: Routes,
		lib: Lib
	} as Record<string, ComponentType<SvelteComponentTyped>>;

	onDestroy(() => {
		//close the tabs when we unmount the component
		close_all_tabs();
	});

	const button_refs: Record<string, HTMLButtonElement> = {};

	$: $current_tab && button_refs[$current_tab]?.scrollIntoView();
</script>

<section class="wrapper">
	<ul role="tablist">
		{#each [...$tabs] as path}
			{@const route_arr = path.split('/').slice(1)}
			{@const main_folder = route_arr.length > 2 ? route_arr[1] : null}
			{@const route =
				route_arr.length > 1
					? `/${(route_arr.slice(2, route_arr.length - 1) ?? []).join('/')}`
					: ''}
			{@const file_name = route_arr.at(-1)}
			<li role="tab" aria-selected={path === $current_tab}>
				<button
					bind:this={button_refs[path]}
					on:click={() => {
						open_file(path);
					}}
					on:auxclick={() => {
						close_file(path);
					}}
				>
					<svelte:component this={get_file_icon(file_name || '')} />
					{file_name}
					{#if route}
						<small>
							{#if main_folder}
								{@const main_icon = base_icons[main_folder]}
								{#if !main_icon}
									<Folder />
									{main_folder}
								{:else}
									<svelte:component this={main_icon} />
								{/if}
							{/if}
							{route}
						</small>
					{/if}
				</button>
				<button
					title="Close {file_name}"
					on:click={() => {
						close_file(path);
					}}
				>
					<Close />
				</button>
			</li>
		{/each}
	</ul>
	<section class="configs">
		{#if $editor_config.vim}
			<button
				on:click={() => {
					editor_config.toggle_vim();
				}}
			>
				<Vim />
			</button>
		{/if}
	</section>
</section>

<style>
	.wrapper {
		display: grid;
		width: 100%;
		grid-template-columns: 1fr max-content;
	}
	.configs {
		grid-column: -1;
		height: 100%;
		display: flex;
		align-items: center;
	}
	.configs :global(svg) {
		height: 3rem !important;
	}
	ul {
		display: flex;
		background-color: var(--sk-back-1);
		border-bottom: 1px solid var(--sk-back-4);
		margin: 0;
		list-style: none;
		overflow-x: auto;
		--sb-size: 0.5rem;
	}
	li {
		padding: 0.5em;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
	}
	ul button {
		display: flex;
		align-items: center;
		gap: 0.5em;
		width: max-content;
	}
	li[aria-selected='true']::after {
		content: '';
		position: absolute;
		background-color: var(--sk-theme-1);
		right: 1px;
		left: 1px;
		bottom: 0;
		top: calc(100% - 3px);
	}
	small {
		opacity: 0.5;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.inactive {
		opacity: 0.5;
	}
</style>
