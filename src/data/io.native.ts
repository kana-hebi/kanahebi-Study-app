import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
export async function importJson(maxBytes = 5000000): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain'], copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const a = result.assets[0];
  if ((a.size ?? 0) > maxBytes) throw new Error('ファイルが大きすぎます');
  const text = await new File(a.uri).text();
  if (text.length > maxBytes) throw new Error('ファイルが大きすぎます'); return text;
}
export async function exportJson(name: string, data: unknown) {
  const file = new File(Paths.cache, name); file.create({ overwrite: true }); file.write(JSON.stringify(data, null, 2));
  if (!await Sharing.isAvailableAsync()) throw new Error('この端末ではファイル共有が利用できません');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: name, UTI: 'public.json' });
}
