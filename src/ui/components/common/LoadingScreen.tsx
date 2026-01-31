import {Component} from 'solid-js';
import {connectionStore} from '../../stores';

export const LoadingScreen: Component = () => {
    const statusText = () => {
        const state = connectionStore.state();
        switch (state) {
            case 'connecting':
                return 'Connecting to server...';
            case 'connected':
                return 'Authenticating...';
            default:
                return 'Loading...';
        }
    };

    return (
        <div class="loading-screen">
            <div class="loading-content">
                <div class="loading-logo">
                    <h1>Helium</h1>
                </div>
                <div class="loading-spinner"></div>
                <div class="loading-status">{statusText()}</div>
            </div>
        </div>
    );
};
