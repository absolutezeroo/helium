import type {HabboCommunicationManager} from '@habbo/communication/HabboCommunicationManager';
import {getHelium} from './getHelium';

/**
 * @see source_nitro_react/src/api/nitro/GetCommunication.ts
 */
export const getCommunication = (): HabboCommunicationManager => getHelium().habboCommunication;
