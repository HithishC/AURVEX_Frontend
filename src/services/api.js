// The only module the UI uses to reach data.
import { mockAdapter } from './mockAdapter.js';
import { apiAdapter } from './apiAdapter.js';

export const isDemo = import.meta.env.VITE_DATA_SOURCE !== 'api';
export const api = isDemo ? mockAdapter : apiAdapter;
