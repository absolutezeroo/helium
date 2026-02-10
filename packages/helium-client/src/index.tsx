import {render} from 'solid-js/web';
import {App} from './App';

const dispose = render(() => <App/>, document.getElementById('helium-ui')!);

// HMR: clean up old render tree before re-evaluating
if (import.meta.hot)
{
	import.meta.hot.dispose(() =>
	{
		dispose();
	});
}
