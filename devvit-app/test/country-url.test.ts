import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countryPageUrl } from '../src/client/country-url.ts';

// Expected slugs are the live canadavisatracker.com paths (all return 200).
const cases: [string, string][] = [
  ['India', 'india'],
  ['Canada', 'canada'],
  ['Andorra', 'andorra'], // no IRCC data
  ['China (People&rsquo;s Republic of)', 'china-people-s-republic-of'],
  ['Côte d&rsquo;Ivoire', 'c-te-d-ivoire'],
  ['Türkiye', 't-rkiye'],
  ['St. Lucia', 'st-lucia'],
];

for (const [name, slug] of cases) {
  test(`${name} links to /processing-times/${slug}/`, () => {
    assert.equal(countryPageUrl(name), `https://canadavisatracker.com/processing-times/${slug}/`);
  });
}
