import { LoadingScreen } from './LoadingScreen';
import { HeliumApp } from './App';

// Show loading screen immediately (synchronous, before any async work)
const loadingScreen = new LoadingScreen();

const app = new HeliumApp(loadingScreen);

app.init().catch(console.error);
