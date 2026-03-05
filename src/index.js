// src/index.js
import './index.css';
import { createRoot } from 'react-dom/client';
import App from './App';
import { loadRuntimeConfig } from './bootstrap';
import Rox from 'rox-browser';
import { setFlagsSnapshot, primeFlags, evaluateAllForImpressions } from './flags';

(async () => {
  console.log('[FM] boot');
  try {
    const { envKey } = await loadRuntimeConfig();

    const options = {
      fetchFunction: window.fetch.bind(window),
      impressionHandler: (data, evalDetails) => {
        try {
          console.log('[FM] impression', {
            flag: data.name,
            value: data.value,
            targeting: data.targeting,
            experiment: data.experiment,
            details: evalDetails
          });
        } catch {}
      },
      configurationFetchedHandler: (status) => {
        try {
          console.log('[FM] config fetched:', status);
          setFlagsSnapshot('fetched');
          evaluateAllForImpressions();
        } catch (e) {
          console.warn('[FM] configurationFetchedHandler error', e);
        }
      },
      onError: (err) => {
        console.warn('[FM] SDK onError:', err?.message || err);
      }
    };

    await Rox.setup(envKey, options);
    primeFlags();
    setFlagsSnapshot('ready');
    evaluateAllForImpressions();

    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
  } catch (e) {
    console.error('[FM] init failed', e);
    document.body.innerHTML = '<pre>Feature flags config failed to load.</pre>';
  }
})();