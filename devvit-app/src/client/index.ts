import { navigateTo } from '@devvit/web/client';
import { countryPageUrl } from './country-url.js';

// Exposed for the plain-script webroot/app.js.
(globalThis as any).openCountryPage = (name: string) => navigateTo(countryPageUrl(name));
