import 'solid-devtools';
import {render} from 'solid-js/web';
import {App} from './App';

export function mountUI(container: HTMLElement): () => void {
    return render(() => <App/>, container);
}

export {App} from './App';
export * from './stores';
export * from './components';
export {uiBridge} from './uiBridge';
