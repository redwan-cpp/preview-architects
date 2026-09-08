import { writeFile, readFile } from 'node:fs/promises';
const env = Object.fromEntries(
  (await readFile('.env', 'utf8')).split(/\r?\n/)
    .map(l => /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(l)).filter(Boolean)
    .map(m => [m[1], m[2]])
);
const KEY = env.UNSPLASH_ACCESS_KEY;
const H = { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' };
const SET = [
  ['a', 'brutalist concrete building facade', 'landscape'],
  ['b', 'concrete stair architecture interior', 'portrait'],
  ['c', 'industrial hall steel roof structure', 'landscape'],
  ['d', 'modern tower facade grid', 'portrait'],
  ['e', 'stone chapel minimal architecture', 'landscape'],
  ['f', 'timber structure architecture frame', 'landscape'],
  ['g', 'concrete texture wall architecture', 'portrait'],
  ['h', 'glass facade reflection building', 'landscape'],
];
const credits = [];
for (const [id, q, o] of SET) {
  const u = new URL('https://api.unsplash.com/search/photos');
  u.searchParams.set('query', q); u.searchParams.set('orientation', o);
  u.searchParams.set('per_page', '5'); u.searchParams.set('content_filter', 'high');
  const r = await fetch(u, { headers: H });
  const p = (await r.json()).results?.[0];
  if (!p) { console.error('miss', id); continue; }
  const src = new URL(p.urls.raw);
  src.searchParams.set('w', '1600'); src.searchParams.set('q', '76'); src.searchParams.set('fm', 'jpg');
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
  await writeFile(`proto/img/${id}.jpg`, buf);
  await fetch(p.links.download_location, { headers: H }).catch(() => {});
  credits.push({ id, photographer: p.user.name, desc: p.alt_description ?? q });
  console.log(`${(buf.length/1024).toFixed(0)}KB ${id}  ${p.user.name}  — ${p.alt_description ?? q}`);
}
await writeFile('proto/credits.json', JSON.stringify(credits, null, 2));
