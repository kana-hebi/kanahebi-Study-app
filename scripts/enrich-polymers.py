#!/usr/bin/env python3
"""Attach original deep polymer content to the reproducible introductory pack.
Run through scripts/author-content.py (base authoring then this enrichment).
No external text, image, or exam question is embedded by this script.
"""
import json
from pathlib import Path
import runpy
ROOT=Path(__file__).resolve().parents[1]
p=json.loads((ROOT/'content/organic-polymer.json').read_text())
if p['manifest']['packVersion']!='0.1.0':
    raise SystemExit('Rebuild the base first: python scripts/author-content.py')
P=p['manifest']['packId']
N=lambda x: f'{P}.node.{x}'
D=lambda x: f'{P}.diagram.{x}'
ctx={'pack':p,'P':P,'N':N,'D':D}
for filename in ['polymer-diagrams.py','polymer-lessons.py','polymer-exercises.py']:
    ctx=runpy.run_path(str(ROOT/'content/authoring'/filename),init_globals=ctx)
p=ctx['pack']
p['manifest']['packVersion']='0.2.0'
p['manifest']['description']='大学受験向け有機化学の導入教材と、高分子の詳しい解説・図解・例題・多段階演習。解説と問題は独自作成し、一次資料で事実を確認。'
p['manifest']['requiredCapabilities']+=['render.lessonBlocks.v1','render.vectorDiagram.v1']
# Existing IDs and answers stay stable. The original recall items remain valid.
for node in p['nodes']:
    if node['lesson'].get('blocks'):
        node['lesson']['sourceIds']=list(dict.fromkeys(['polymer-original',*node['lesson']['sourceIds']]))
        for q in p['questions']:
            if node['id'] in q['nodeIds'] and q['sourceId']=='original':
                q['sourceIds']=node['lesson']['sourceIds'][:]
# Focused source provenance and reachability; no runtime downloads.
deep=[n for n in p['nodes'] if n['lesson'].get('blocks')]
deep_ids={n['id'] for n in deep}
new_questions=[q for q in p['questions'] if q['id'].startswith(P+'.q.poly-')]
report={'packVersion':'0.2.0','deepNodes':[n['id'] for n in deep],
 'diagramCount':len(p['diagrams']),'workedExamples':sum(b['type']=='worked' for n in deep for b in n['lesson']['blocks']),
 'newExercises':len(new_questions),
 'deepExercises':sum(any(n in deep_ids for n in q['nodeIds']) for q in p['questions']),
 'instructionalDiagrams':sum('.diagram.quiz-' not in d['id'] for d in p['diagrams']),
 'exerciseDiagrams':sum('.diagram.quiz-' in d['id'] for d in p['diagrams']),
 'newKinds':{k:sum(q['kind']==k for q in new_questions) for k in ['choice','text','numeric']},
 'newDifficulties':{str(k):sum(q['difficulty']==k for q in new_questions) for k in [1,2,3]},
 'method':'Original writing, original exact vector drawings and original exercises; links used only for fact checking and instructional scope.'}
(ROOT/'content/organic-polymer.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/POLYMER_CONTENT_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
titles={n['id']:n['title'] for n in p['nodes']}
lines=['# 有機・高分子カリキュラム（v0.2.0）','',
 '機械可読の正本は `content/organic-polymer.json`。この一覧は著作スクリプトから生成する参照用資料。現在地点はSTATUS.md。','',
 '13単元・123知識・365問。高分子40教材は詳しい解説・図解・例題を持ち、対象演習は既存分を含め232問。前提は推奨に使い、アクセスをロックしない。問題数はその知識に関連する問題の数で、複数知識の問題は複数行に数える。','']
for unit in p['units']:
    lines += [f"## Stage {unit['stage']}：{unit['title']}",'',unit['summary'],'',
              '| 知識ノード | 次の学習を助ける前提 | 問題数 | 詳しい教材 |',
              '|---|---|---|---|']
    for n in [n for n in p['nodes'] if n['unitId']==unit['id']]:
        prereq='、'.join(titles[x] for x in n['prerequisites']) or 'なし'
        count=sum(n['id'] in q['nodeIds'] for q in p['questions'])
        rich='解説・図・例題' if n['id'] in deep_ids else '導入'
        lines.append(f"| {n['title']} | {prereq} | {count} | {rich} |")
    lines.append('')
(ROOT/'docs/CURRICULUM.md').write_text(('\n'.join(lines)).rstrip()+'\n')
print(f"Polymer enrichment: {len(report['deepNodes'])} deep lessons, {report['diagramCount']} diagrams, {report['workedExamples']} worked examples, {report['newExercises']} new exercises")
