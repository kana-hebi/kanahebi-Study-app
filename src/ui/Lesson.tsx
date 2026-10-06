import React, { useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import Svg, { Ellipse, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { ContentPack, Diagram, LessonBlock } from '../domain/models';
import { Button, C, Card, s } from './kit';
function Vector({ diagram: d, width }: { diagram: Diagram; width: number | '100%' }) {
  return <Svg accessibilityLabel={d.title} accessibilityRole="image" width={width} height={typeof width === 'number' ? width * d.height / d.width : undefined} viewBox={`0 0 ${d.width} ${d.height}`} style={{ aspectRatio: d.width / d.height }}>
    {d.elements.map((e, i) => {
      const color = C[e.color ?? 'text'];
      if (e.type === 'text') return <SvgText key={i} x={e.x} y={e.y} fill={color} fontSize={e.size ?? 15} textAnchor={e.align ?? 'middle'}>{e.text}</SvgText>;
      const stroke = { stroke: color, strokeWidth: 2, strokeDasharray: 'dashed' in e && e.dashed ? '5 4' : undefined, fill: 'none' };
      if (e.type === 'line') return <Line key={i} {...stroke} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />;
      if (e.type === 'polyline') return <Polyline key={i} {...stroke} points={e.points.map(p => p.join(',')).join(' ')} />;
      if (e.type === 'rect') return <Rect key={i} {...stroke} x={e.x} y={e.y} width={e.width} height={e.height} rx={6} />;
      return <Ellipse key={i} {...stroke} cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} />;
    })}
  </Svg>;
}
export function DiagramView({ id, pack }: { id: string; pack: ContentPack }) {
  const [expanded, setExpanded] = useState(false);
  const d = pack.diagrams?.find(d => d.id === id);
  if (!d) return null;
  return <View style={{ gap: 12 }}><Text style={s.label}>{d.title}</Text><Vector diagram={d} width="100%" /><Text style={s.bodyMuted}>{d.description}</Text><Button title="図を拡大する" secondary small onPress={() => setExpanded(true)} />
    <Modal visible={expanded} animationType="fade" onRequestClose={() => setExpanded(false)}><View style={[s.root, { paddingTop: 48, paddingBottom: 32 }]}><View style={{ paddingHorizontal: 20, gap: 12 }}><Text style={s.cardTitle}>{d.title}</Text><Button title="図を閉じる" onPress={() => setExpanded(false)} /><Text style={s.caption}>左右・上下にスクロールできます。</Text></View><ScrollView contentContainerStyle={{ padding: 20 }}><ScrollView horizontal><Vector diagram={d} width={Math.max(640, d.width * 2)} /></ScrollView><Text style={s.body}>{d.description}</Text></ScrollView></View></Modal>
  </View>;
}
function Worked({ block: b, pack }: { block: Extract<LessonBlock, { type: 'worked' }>; pack: ContentPack }) {
  const [open, setOpen] = useState(false);
  return <Card accent={C.purple}><Text style={s.cardTitle}>{b.heading}</Text><Text style={s.body}>{b.prompt}</Text>{b.diagramId && <DiagramView id={b.diagramId} pack={pack} />}<Button title={open ? '例題の解き方を閉じる' : '例題の解き方を見る'} secondary small onPress={() => setOpen(!open)} />
    {open && <>{b.steps.map((step, i) => <View key={i} style={{ gap: 4 }}><Text style={s.label}>{i + 1}. 考える順序</Text><Text style={s.body}>{step}</Text></View>)}<Text style={[s.body, { color: C.mint, fontWeight: '600' }]}>答え：{b.answer}</Text></>}</Card>;
}
export function LessonBlocks({ blocks, pack }: { blocks: LessonBlock[]; pack: ContentPack }) {
  return <>{blocks.map((b, i) => {
    if (b.type === 'diagram') return <Card key={i}><DiagramView id={b.diagramId} pack={pack} /></Card>;
    if (b.type === 'worked') return <Worked key={i} block={b} pack={pack} />;
    if (b.type === 'paragraph') return <Card key={i}><Text style={s.cardTitle}>{b.heading}</Text><Text selectable style={s.body}>{b.body}</Text></Card>;
    return <Card key={i}><Text style={s.cardTitle}>{b.heading}</Text><Text style={s.caption}>表は横にスクロールできます。</Text><ScrollView horizontal><View>{[b.columns, ...b.rows].map((row, r) => <View key={r} style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: C.border, backgroundColor: r === 0 ? '#20313D' : 'transparent' }}>{row.map((cell, c) => <Text selectable key={c} style={[s.body, { width: 145, padding: 10, fontSize: 14, color: r === 0 ? C.mint : C.text, fontWeight: r === 0 ? '600' : 'normal' }]}>{cell}</Text>)}</View>)}</View></ScrollView></Card>;
  })}</>;
}
export function SourceNotes({ ids, pack }: { ids: string[]; pack: ContentPack }) {
  return <Card><Text style={s.label}>出典・事実確認</Text>{[...new Set(ids)].map(id => { const x = pack.sources.find(x => x.id === id); return x ? <View key={id} style={{ gap: 4 }}><Text style={s.bodyMuted}>{x.title}</Text><Text selectable style={s.caption}>{x.use}{x.url ? '\n' + x.url : ''}</Text></View> : null; })}</Card>;
}
