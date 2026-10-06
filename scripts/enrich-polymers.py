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
report={'packVersion':'0.2.0','deepNodes':[n['id'] for n in p['nodes'] if n['lesson'].get('blocks')],
 'diagramCount':len(p['diagrams']),'workedExamples':sum(b['type']=='worked' for n in p['nodes'] for b in n['lesson'].get('blocks',[])),
 'newExercises':sum(q['id'].startswith(P+'.q.poly-') for q in p['questions']),
 'method':'Original writing, original exact vector drawings and original exercises; links used only for fact checking and instructional scope.'}
(ROOT/'content/organic-polymer.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/POLYMER_CONTENT_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f"Polymer enrichment: {len(report['deepNodes'])} deep lessons, {report['diagramCount']} diagrams, {report['workedExamples']} worked examples, {report['newExercises']} new exercises")
