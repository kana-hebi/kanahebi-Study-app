import React from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
export const C = { bg: '#0C141C', card: '#16222E', border: '#293C4B', text: '#F0F5F8', muted: '#99ACBA', mint: '#89E1CB', purple: '#B7B2EF', red: '#FFA7A7', gold: '#F0CE8C' };
export function Button({ title, onPress, secondary, disabled, small }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; small?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, small && s.smallButton, disabled && { opacity: .4 }, pressed && { opacity: .72 }]}><Text style={[s.buttonText, secondary && { color: C.text }]}>{title}</Text></Pressable>;
}
export function Card({ children, accent }: { children: React.ReactNode; accent?: string }) { return <View style={[s.card, accent ? { borderLeftColor: accent, borderLeftWidth: 3 } : undefined]}>{children}</View>; }
export function Tag({ children, color = C.muted }: { children: React.ReactNode; color?: string }) { return <View style={[s.tag, { borderColor: color + '66' }]}><Text style={{ color, fontSize: 11 }}>{children}</Text></View>; }
export function Heading({ title, detail }: { title: string; detail?: string }) { return <View style={{ marginBottom: 14 }}><Text style={s.heading}>{title}</Text>{detail && <Text style={s.bodyMuted}>{detail}</Text>}</View>; }
export function ProgressBar({ value }: { value: number }) { return <View style={s.progress}><View style={[s.progressFill, { width: `${Math.max(0, Math.min(1, value)) * 100}%` }]} /></View>; }
export function Filters({ options, selected, onChange }: { options: { id: string; label: string }[]; selected: string; onChange: (id: string) => void }) {
  return <View style={s.chips}>{options.map(o => <Pressable key={o.id} accessibilityRole="button" onPress={() => onChange(o.id)} style={[s.chip, o.id === selected && s.chipActive]}><Text style={{ color: o.id === selected ? C.bg : C.muted, fontSize: 13 }}>{o.label}</Text></Pressable>)}</View>;
}
export const notify = (msg: string) => { if (Platform.OS === 'web') window.alert(msg); else Alert.alert('学習室', msg); };
export function confirm(title: string, body: string, action: () => void) { if (Platform.OS === 'web') { if (window.confirm(`${title}\n${body}`)) action(); }
  else Alert.alert(title, body, [{ text: 'キャンセル', style: 'cancel' }, { text: '実行する', onPress: action }]); }
export const stateLabels = { unseen: '未確認', learning: '学習中', unstable: '要確認', stable: '安定', mastered: '定着' };
export const modeLabels = { course: 'コース学習', free: '自由学習', review: '復習', diagnostic: '理解度チェック', exam: '総合演習' };
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg }, container: { padding: 20, gap: 12, paddingBottom: 40, width: '100%', maxWidth: 650, alignSelf: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderColor: C.border },
  brandMark: { width: 34, height: 34, borderRadius: 11, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }, brand: { color: C.text, fontSize: 16, fontWeight: '700' }, topSub: { color: C.muted, fontSize: 10, marginTop: 3 },
  heading: { color: C.text, fontSize: 24, fontWeight: '700', lineHeight: 34 }, body: { color: C.text, fontSize: 15, lineHeight: 26 }, bodyMuted: { color: C.muted, fontSize: 13, lineHeight: 22 }, caption: { color: C.muted, fontSize: 11, lineHeight: 19 },
  label: { color: C.mint, fontSize: 13, lineHeight: 23, fontWeight: '700', marginTop: 4 }, card: { backgroundColor: C.card, borderRadius: 17, borderWidth: 1, borderColor: C.border, padding: 19, gap: 12 }, cardTitle: { color: C.text, fontSize: 18, fontWeight: '600', lineHeight: 28 },
  button: { minHeight: 48, borderRadius: 11, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12 }, secondary: { backgroundColor: '#20313D', borderWidth: 1, borderColor: '#385062' }, smallButton: { minHeight: 44, paddingHorizontal: 13, paddingVertical: 9 }, buttonText: { color: C.bg, fontSize: 14, fontWeight: '600' },
  tag: { borderWidth: 1, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4, alignSelf: 'flex-start' }, row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  hero: { paddingVertical: 20, gap: 14 }, heroTitle: { color: C.text, fontSize: 33, fontWeight: '700', lineHeight: 47 }, eyebrow: { color: C.mint, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  statRow: { flexDirection: 'row', gap: 9 }, stat: { flex: 1, paddingVertical: 17, paddingHorizontal: 9, backgroundColor: C.card, borderRadius: 13, gap: 6, alignItems: 'center' }, statNumber: { color: C.text, fontSize: 30, fontWeight: '600' }, bigResult: { color: C.mint, fontSize: 64, fontWeight: '600' },
  progress: { height: 5, backgroundColor: '#2A3C4A', borderRadius: 4, overflow: 'hidden', marginVertical: 8 }, progressFill: { height: 5, backgroundColor: C.mint }, sectionTitle: { color: C.text, fontSize: 17, fontWeight: '600', marginTop: 14, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#435B6D', backgroundColor: '#111D27', color: C.text, padding: 14, fontSize: 16, borderRadius: 11, minHeight: 49 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { paddingHorizontal: 12, paddingVertical: 11, minHeight: 43, borderWidth: 1, borderColor: C.border, borderRadius: 10, justifyContent: 'center' }, chipActive: { backgroundColor: C.mint, borderColor: C.mint },
  listItem: { borderWidth: 1, borderColor: C.border, padding: 16, borderRadius: 12, gap: 9, backgroundColor: '#121F29' }, listTitle: { color: C.text, fontSize: 15, fontWeight: '500', lineHeight: 24 }, stepNumber: { color: C.mint, fontSize: 20, fontWeight: '700', marginRight: 7 },
  question: { color: C.text, fontSize: 19, fontWeight: '500', lineHeight: 32, marginBottom: 12 }, answerChoice: { padding: 16, minHeight: 55, backgroundColor: '#1D2E3B', borderWidth: 1, borderColor: '#395163', borderRadius: 12 }, correctChoice: { borderColor: C.mint, backgroundColor: '#203D3A' },
  nav: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 12, paddingBottom: 9, borderTopWidth: 1, borderColor: C.border, backgroundColor: '#101D27' }, navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 45 }, navDot: { height: 4, width: 22, borderRadius: 5, backgroundColor: '#3B4A56' }, navText: { color: C.muted, fontSize: 11, fontWeight: '600' },
});
