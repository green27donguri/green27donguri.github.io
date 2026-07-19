import { readFile } from 'node:fs/promises';

const dataUrl = new URL('../data/works.json', import.meta.url);
const errors = [];
let data;

try {
  data = JSON.parse(await readFile(dataUrl, 'utf8'));
} catch (error) {
  console.error(`works.jsonを読み込めません: ${error.message}`);
  process.exit(1);
}

const groups = ['magazines', 'pr'];
const requiredFields = ['title', 'description', 'body', 'url', 'image', 'site'];
const seenUrls = new Map();

for (const group of groups) {
  const items = data[group];
  if (!Array.isArray(items)) {
    errors.push(`${group}: 配列がありません`);
    continue;
  }

  items.forEach((item, index) => {
    const label = `${group}[${index}]`;
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`${label}: オブジェクトではありません`);
      return;
    }

    for (const field of requiredFields) {
      if (typeof item[field] !== 'string' || item[field].trim() === '') {
        errors.push(`${label}.${field}: 空でない文字列が必要です`);
      }
    }

    if (group === 'pr' && item.kind !== 'PR') {
      errors.push(`${label}.kind: PR記事は "PR" にしてください`);
    }

    if (typeof item.url === 'string' && item.url.trim()) {
      try {
        const parsed = new URL(item.url);
        if (parsed.protocol !== 'https:') {
          errors.push(`${label}.url: https URLが必要です`);
        }
      } catch {
        errors.push(`${label}.url: 正しいURLではありません`);
      }

      if (seenUrls.has(item.url)) {
        errors.push(`${label}.url: ${seenUrls.get(item.url)} と重複しています`);
      } else {
        seenUrls.set(item.url, label);
      }
    }
  });
}

if (errors.length > 0) {
  console.error('works.jsonの検証に失敗しました:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`works.json OK: magazines ${data.magazines.length}件 / PR ${data.pr.length}件`);
