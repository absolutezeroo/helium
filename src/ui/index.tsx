import {render} from 'solid-js/web';
import type {ModuleRegistry} from '@/modules/core';
import {App} from './App';
import {ModuleProvider} from './bridge';

export function mountUI(container: HTMLElement, registry: ModuleRegistry): () => void
{
	return render(() => (
		<ModuleProvider registry={registry}>
			<App/>
		</ModuleProvider>
	), container);
}

export {App} from './App';
export * from './components';
