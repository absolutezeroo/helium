import {render} from 'solid-js/web';
import {App} from './App';
import {ModuleProvider} from './bridge';
import type {ModuleRegistry} from '@/modules/core';

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
