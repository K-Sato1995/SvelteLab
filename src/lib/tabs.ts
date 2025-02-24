import { get, writable } from 'svelte/store';
import { expand_path_to_file } from './stores/expanded_paths';
import { mobile_showing, showing_files } from './stores/mobile_showing_store';

const { subscribe: subscribe_tabs, update: update_tabs } = writable(new Set<string>());
export const tabs = { subscribe: subscribe_tabs };

const { subscribe: subscribe_current_tab, set: set_current_tab } = writable('');
export const current_tab = { subscribe: subscribe_current_tab };

export function open_file(path: string) {
	set_current_tab(path);
	update_tabs(($tabs) => $tabs.add(path));
	expand_path_to_file(path);
	mobile_showing.show_code();
	showing_files.set(false);
}

export function close_file(path: string) {
	update_tabs(($tabs) => {
		const $current_tab = get(current_tab);
		const tabs_array = [...$tabs];
		if (path === $current_tab) {
			const tab_index_to_open = tabs_array.findIndex((p) => p === $current_tab) - 1;
			let next_tab = tabs_array.at(tab_index_to_open) || '';
			next_tab = next_tab !== $current_tab ? next_tab : '';
			set_current_tab(next_tab);
		}
		$tabs.delete(path);
		return $tabs;
	});
}

export function close_all_subpath(path: string) {
	update_tabs(($tabs) => {
		[...$tabs].forEach((tab) => {
			if (tab.startsWith(path)) {
				$tabs.delete(tab);
			}
		});
		return $tabs;
	});
}

export function rename_tab(old_path: string, new_path: string) {
	update_tabs(($tabs) => {
		if ($tabs.has(old_path)) {
			$tabs.delete(old_path);
			$tabs.add(new_path);
		}
		return $tabs;
	});
}

export function close_all_tabs() {
	update_tabs(($tabs) => {
		$tabs.clear();
		return $tabs;
	});
	set_current_tab('');
}
