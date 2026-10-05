export function importJson(maxBytes = 5000000): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json';
    input.oncancel = () => { input.remove(); resolve(null); };
    input.onchange = async () => { try { const file = input.files?.[0];
      if (!file) resolve(null); else if (file.size > maxBytes) reject(new Error('ファイルが大きすぎます')); else resolve(await file.text());
    } catch (e) { reject(e); } finally { input.remove(); } };
    input.click();
  });
}
export async function exportJson(name: string, data: unknown) {
  const a = document.createElement('a'), url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
