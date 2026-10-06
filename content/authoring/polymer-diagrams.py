"""Original bounded vector drawings, not imported SVG/HTML or web assets."""
pack['diagrams']=[]
def T(x,y,text,color='text',size=15,align='middle'):return dict(type='text',x=x,y=y,text=text,color=color,size=size,align=align)
def L(x1,y1,x2,y2,color='text',dashed=False):return dict(type='line',x1=x1,y1=y1,x2=x2,y2=y2,color=color,dashed=dashed)
def PL(points,color='text',dashed=False):return dict(type='polyline',points=points,color=color,dashed=dashed)
def R(x,y,w,h,color='muted'):return dict(type='rect',x=x,y=y,width=w,height=h,color=color)
def E(x,y,rx,ry,color='muted'):return dict(type='ellipse',cx=x,cy=y,rx=rx,ry=ry,color=color)
def arrow(x,y1,y2,color='mint'):
 return [L(x,y1,x,y2,color),PL([[x-5,y2-7],[x,y2],[x+5,y2-7]],color)]
def brackets(x1,x2,y1,y2):
 return [PL([[x1+8,y1],[x1,y1],[x1,y2],[x1+8,y2]],'mint'),PL([[x2-8,y1],[x2,y1],[x2,y2],[x2-8,y2]],'mint'),T(min(x2+10,312),y2+5,'n','mint')]
def diagram(key,title,desc,height,elements,sourceIds=('polymer-original',)):
 pack['diagrams'].append(dict(id=D(key),title=title,description=desc,width=320,height=height,elements=elements,sourceIds=list(sourceIds)))
def vinyl(key,title,left,right,upper='',lower='',desc=''):
 e=[T(92,72,left),T(215,72,right),L(120,63,185,63),L(120,69,185,69)]
 if upper:e += [L(215,49,215,32),T(215,22,upper,'gold')]
 if lower:e += [L(215,82,215,98),T(215,118,lower,'gold')]
 e+=arrow(150,127,155)+[T(85,211,left),T(215,211,right),L(28,205,56,205),L(112,205,185,205),L(241,205,293,205)]
 if upper:e += [L(215,189,215,174),T(215,165,upper,'gold')]
 if lower:e += [L(215,220,215,239),T(215,259,lower,'gold')]
 e+=brackets(42,278,159,268)+[T(150,293,'C=Cの結合次数が1つ下がる','muted',14)]
 diagram(key,title,desc or '上が単量体、下が繰返し単位。二重結合の2個の炭素を主鎖へ入れ、側基は同じ炭素につけたまま残す。末端は省略。',305,e)
# Replacement of CH by C when both substituents are attached is intentional.
vinyl('pe','エチレンからPEへ','CH₂','CH₂')
vinyl('pp','プロペンからPPへ','CH₂','CH',lower='CH₃')
vinyl('pvc','塩化ビニルからPVCへ','CH₂','CH',lower='Cl')
vinyl('ps','スチレンからPSへ','CH₂','CH',lower='C₆H₅',desc='ビニル基のC=Cが重合する。金色のフェニル基C₆H₅は側基であり、芳香環を主鎖へほどく反応ではない。')
vinyl('ptfe','テトラフルオロエチレンからPTFEへ','CF₂','CF₂')
vinyl('pan','アクリロニトリルからPANへ','CH₂','CH',lower='C≡N')
vinyl('pmma','メタクリル酸メチルからPMMAへ','CH₂','C',upper='CH₃',lower='COOCH₃',desc='MMAの置換炭素はCHではなくC。CH₃とCOOCH₃の2個の側基を残す。側基のエステルは主鎖の連結点ではない。')
vinyl('pvac','酢酸ビニルからPVAcへ','CH₂','CH',lower='OCOCH₃',desc='CH₂=CH−O−CO−CH₃が酢酸ビニル。主鎖は炭素、エステルは側基にある。CH₂=CH−COOCH₃とは別物。')
e=[T(24,65,'R'),T(85,65,'C'),T(85,25,'O'),L(81,33,81,45),L(88,33,88,45),L(39,59,68,59),T(135,65,'O','gold'),T(173,65,'H','gold'),L(101,59,118,59),L(145,59,160,59),R(115,42,73,37,'gold'),T(70,111,'H','gold'),T(104,111,'O'),T(150,111,'R′'),L(78,105,92,105),L(115,105,137,105),R(53,88,29,35,'gold')]+arrow(240,74,145)+[T(241,167,'−H₂O','gold'),T(30,233,'R'),T(90,233,'C'),T(90,190,'O'),L(85,198,85,214),L(93,198,93,214),T(165,233,'O','mint'),T(237,233,'R′'),L(45,227,74,227),L(106,227,150,227),L(181,227,220,227),T(150,276,'エステル結合：C(=O)−O','mint')]
diagram('ester','エステル結合でつながる場所','金色で囲んだ酸側のOHとアルコール側のHが水になる。アルコールのOはエステルに残る。R・R′は分子の残りを表す。',295,e,('polymer-original','rsc-condensation'))
e=[T(25,65,'R'),T(88,65,'C'),T(88,25,'O'),L(84,33,84,45),L(92,33,92,45),L(40,59,72,59),T(141,65,'OH','gold'),L(104,59,122,59),R(119,42,48,37,'gold'),T(70,111,'H','gold'),T(109,111,'NH'),T(166,111,'R′'),L(79,105,90,105),L(127,105,148,105),R(52,88,31,35,'gold')]+arrow(240,74,145)+[T(242,167,'−H₂O','gold'),T(25,233,'R'),T(87,233,'C'),T(87,190,'O'),L(83,198,83,214),L(91,198,91,214),T(163,233,'NH','mint'),T(246,233,'R′'),L(41,227,71,227),L(103,227,140,227),L(186,227,229,227),T(152,276,'アミド結合：C(=O)−NH','mint')]
diagram('amide','アミド結合をつくる脱水','COOHのOHとNH₂のHが水になる。結合のNが残り、CO−NHとなる。ペプチド結合も同じ連結構造。',295,e,('polymer-original','rsc-condensation'))
# Condensed formulas keep bonds between glyphs instead of drawing over groups.
def segments(key,title,parts,desc,labels=None):
 e=[T(160,75,'−'+'−'.join(parts)+'−','text',14)]
 e+=brackets(13,306,42,101)
 if labels:
  e += [T(160,143+i*26,line,'muted',14) for i,line in enumerate(labels)]
 diagram(key,title,desc,155+(len(labels or [])*26),e)
segments('pet','PETの繰返し単位',['O','CH₂CH₂','O','CO','p-C₆H₄','CO'],'両端の結合は次の単位へ続く。COはC(=O)の略、p-C₆H₄はpara位置でつながるベンゼン環。主鎖中に2個のエステル連結部をもつ。', ['酸：HOOC−p-C₆H₄−COOH','ジオール：HO−CH₂CH₂−OH','単位：C₁₀H₈O₄、式量192'])
segments('nylon66','ナイロン66の繰返し単位',['NH','(CH₂)₆','NH','CO','(CH₂)₄','CO'],'COはC(=O)。単位境界を越えたCO−NHもアミド結合。ジアミン由来6炭素と酸由来6炭素を色ではなく構造から数える。',['ジアミン：H₂N−(CH₂)₆−NH₂','酸：HOOC−(CH₂)₄−COOH','単位：C₁₂H₂₂N₂O₂、式量226'])
segments('nylon6','ナイロン6の繰返し単位',['NH','(CH₂)₅','CO'],'ε-カプロラクタムの環を開くと、この単位が連なる。カルボニル炭素1個とCH₂の炭素5個で計6個。NHとCOは隣の単位とも結合する。',['単位：C₆H₁₁NO、式量113','加水分解後：H₂N(CH₂)₅COOH'])
diagram('finite-chain','有限鎖は「分子数−鎖数」で数える','青緑のAは二価酸、紫のBはジオールの1分子。6分子を一本につなぐ結合は5個。各エステル結合をつくるたびに水1分子が外れ、両末端にCOOHとOHが残る。',238,[T(160,26,'二価酸3分子＋ジオール3分子','muted',14)]+[R(18+i*49,55,38,37,'mint' if i%2==0 else 'purple') for i in range(6)]+[T(37+i*49,81,'A' if i%2==0 else 'B','mint' if i%2==0 else 'purple') for i in range(6)]+[L(57+i*49,73,66+i*49,73,'gold') for i in range(5)]+[T(37,126,'COOH','mint',14),T(283,126,'OH','purple',14),T(160,164,'結合5個 → 脱離するH₂Oは5分子','gold',14),T(160,199,'6個の分子が1本の鎖へ','text',16)])
e=[T(160,23,'鎖同士をつながない（熱可塑性）','mint',14)]
for y in [55,88,121]:e+=[PL([[22,y],[62,y-9],[102,y+7],[142,y-6],[182,y+9],[222,y-5],[299,y+2]],'mint')]
e += [T(160,165,'鎖同士を共有結合でつなぐ（網目）','gold',14)]
for y in [201,240,279]:e += [PL([[22,y],[62,y-9],[102,y+7],[142,y-6],[182,y+9],[222,y-5],[299,y+2]],'purple')]
for x,y1,y2 in [(62,192,231),(142,195,234),(222,235,274),(102,247,286)]:e += [L(x,y1,x,y2,'gold')]
e += [T(160,323,'架橋で鎖のすべりを制限する','muted',14)]
diagram('network','線状の鎖と架橋した網目','上は独立した鎖、下の金色は鎖間の共有結合を模式化したもの。網目では鎖が分子として自由にすべり抜けにくい。縮合か付加かと、熱可塑か熱硬化かは別の分類。',343,e)
e=[T(160,25,'鎖がそろう領域と乱れた領域','muted',14),R(16,45,143,125,'mint')]
for y in [68,91,114,137]:e += [PL([[27,y],[140,y],[140,y+10],[27,y+10]],'mint')]
for y in [64,107,145]:e += [PL([[171,y],[207,y+14],[230,y-5],[259,y+15],[292,y+4]],'purple')]
e += [T(85,203,'結晶領域','mint'),T(235,203,'非晶領域','purple'),T(160,243,'実際の鎖は領域をまたいで連なる','muted',13)]
diagram('crystal','結晶領域・非晶領域の模式図','鎖の並びを比較する模式図であり、実際の原子配列や結晶の大きさを描いたものではない。分岐や側基は規則的な並び方に影響する。高分子試料は部分的に結晶化することが多い。',264,e)
diagram('hbond','アミド間の水素結合','点線は共有結合ではなく、別の鎖のC=OのOとH−NのHとの水素結合。主鎖のアミド結合と、鎖間の水素結合を区別する。鎖の残りは省略した模式図。',280,[T(65,55,'C'),T(65,96,'O','mint'),L(61,62,61,76),L(69,62,69,76),T(235,55,'N'),T(235,96,'H','purple'),L(235,62,235,76),L(84,49,217,49),L(18,49,48,49),L(252,49,301,49),T(65,214,'N'),T(65,172,'H','purple'),L(65,178,65,193),T(235,214,'C'),T(235,172,'O','mint'),L(231,178,231,193),L(239,178,239,193),L(84,208,217,208),L(18,208,48,208),L(252,208,301,208),L(65,105,65,150,'gold',True),L(235,105,235,150,'gold',True),T(160,257,'点線：鎖間の水素結合','gold',14)])
diagram('vinylon','PVAc → PVA → ビニロン','酢酸ビニルの付加重合後、側基のエステルをけん化する。PVAのOHの一部をホルムアルデヒドでアセタール化する。炭素からなる主鎖は保たれる。すべての市販PVA繊維が同じ処理・水溶性ではない。',365,[T(160,34,'PVAc：［CH₂−CH(OCOCH₃)］ₙ','text',15)]+arrow(160,55,89)+[T(160,117,'側基のけん化','gold'),T(160,161,'PVA：［CH₂−CH(OH)］ₙ','mint',16)]+arrow(160,183,217)+[T(160,245,'HCHOで一部のOHをアセタール化','gold',14),T(160,287,'C−OH   ＋   HO−C','text',16),T(160,327,'C−O−CH₂−O−C ＋ H₂O','mint',16)],('polymer-original','kuraray-pva','kuraray-vinylon'))
diagram('pva-acetal','PVAの隣接したOHをアセタール化','PVA主鎖上の1,3-位置関係にある2個のOHとHCHOが反応し、環状アセタールをつくる模式図。1回の反応でOHを2個消費する。鎖内の環形成と鎖間の架橋は同じではなく、全反応を架橋と呼ばない。',220,[T(68,55,'CH'),T(160,55,'CH₂'),T(252,55,'CH'),L(90,48,133,48),L(186,48,231,48),L(68,69,68,125),L(252,69,252,125),T(68,151,'O','mint'),T(252,151,'O','mint'),T(160,181,'CH₂','gold'),L(81,156,133,174),L(187,174,239,156),T(160,212,'酸触媒、HCHO由来のCH₂','muted',13)])
diagram('rubber-repeat','イソプレンの1,4重合','元の1番・4番の炭素が次の単位とつながり、2番・3番間に二重結合が残る。cis/trans配置を省略した結合の位置だけの図。天然ゴムでは主にcis配置。',227,[T(45,86,'CH₂'),T(118,86,'C'),T(207,86,'CH'),T(285,86,'CH₂'),L(68,80,101,80),L(133,76,183,76),L(133,84,183,84),L(230,80,262,80),T(118,35,'CH₃','gold'),L(118,43,118,62)]+brackets(15,308,21,109)+[T(160,156,'C=Cは繰返し単位に1個残る','mint',15),T(160,193,'すべての二重結合が消えるわけではない','muted',13)])
diagram('rubber-elastic','伸ばしたゴムが戻るしくみ','金色は少数の架橋点、青緑は柔軟な鎖の模式図。引張りで鎖が伸びた配置になり、力を除くと多様な曲がった配置へ戻ろうとする。主鎖のC−C結合自体を切って伸ばすわけではない。',262,[T(160,23,'引張り前：曲がった鎖','muted',14),PL([[20,66],[52,44],[90,91],[125,38],[168,82],[205,46],[258,86],[298,61]],'mint'),L(92,84,92,113,'gold'),L(253,81,253,112,'gold')]+arrow(160,117,150)+[T(160,176,'引張り後：同じ鎖が配向','muted',14),PL([[20,212],[58,202],[99,216],[140,203],[179,215],[220,205],[259,217],[298,207]],'mint'),L(99,214,99,240,'gold'),L(259,215,259,240,'gold')])
diagram('copolymer','共重合体とブレンド','AとBは異なる単量体由来の部分。共重合体は同じ鎖へ化学的に組み込まれる。ブレンドではAだけの鎖とBだけの鎖を混ぜる。PETは高校では2種の原料からつくる縮合高分子として扱うため、この模式図とSBRの分類を混同しない。',256,[T(160,24,'同じ鎖：共重合体','mint',15),T(160,63,'A − A − B − A − B − B','text',18),T(160,105,'異なる鎖の混合：ブレンド','purple',15),T(160,146,'A − A − A − A − A','mint',18),T(160,185,'B − B − B − B − B','purple',18),T(160,230,'つながり方を見て区別する','muted',14)])
diagram('ion-exchange','H型陽イオン交換樹脂とCa²⁺','SO₃⁻は樹脂に固定される。Ca²⁺1個を受け取るには、H⁺1個をもつ交換サイトが2個必要。陰イオンはこの模式図では省略。',270,[R(12,22,125,198,'purple'),T(73,50,'樹脂（固定）','purple',14),T(77,99,'SO₃⁻','text',17),T(77,171,'SO₃⁻','text',17),T(169,99,'H⁺','gold',18),T(169,171,'H⁺','gold',18),T(265,137,'Ca²⁺','mint',20),L(122,92,147,92,'gold',True),L(122,164,147,164,'gold',True),L(199,131,232,131,'mint'),PL([[205,124],[198,131],[205,138]],'mint'),T(158,250,'Ca²⁺ 1 mol ↔ H⁺ 2 mol','mint',16)])
e=[T(160,24,'α型：主鎖と分岐（デンプン）','gold',14),T(160,64,'G − G − G − G − G','gold',17),L(160,75,160,109,'gold'),T(160,130,'G − G','gold',17),T(160,172,'β型：直鎖（セルロース）','mint',14),T(160,212,'G − G − G − G − G','mint',17),T(160,250,'Gはグルコース残基。環は省略','muted',13)]
diagram('polysaccharide','デンプンとセルロースの結合','デンプンの直鎖部は主にα-1,4、分岐部はα-1,6。セルロースはβ-1,4。α/βは単なる鎖の長さではなく結合の立体配置の違いで、模式図の記号だけから立体構造を読むものではない。',273,e,('polymer-original','sanwa-starch','tokyo-cellulose'))
diagram('cellulose-oh','セルロースのOHと置換','グルコース残基1個あたりの遊離OHは3個。青緑はOH、金色はアセチル化後のOCOCH₃を模式化。骨格のグリコシド結合は維持される。原子配置や結合角を示す図ではない。',276,[R(85,40,150,49,'purple'),T(160,71,'C₆H₇O₂','purple',18),T(38,123,'OH','mint'),T(160,123,'OH','mint'),T(283,123,'OH','mint'),L(101,89,43,103),L(160,89,160,103),L(219,89,277,103),T(160,161,'(C₆H₇O₂)(OH)₃','mint',18)]+arrow(160,177,206)+[T(160,235,'完全置換：(C₆H₇O₂)(OCOCH₃)₃','gold',14)])
diagram('protein-levels','配列・折りたたみ・加水分解','上はアミノ酸残基の一次構造、中央は同じ鎖の折りたたみを模式化。変性では高次構造が変化してもペプチド結合が全部切れるとは限らない。下の加水分解では主鎖の共有結合を切る。',307,[T(160,23,'一次構造：アミノ酸の順序','mint',14),T(160,61,'Ala − Gly − Ser − Val','text',18),T(160,103,'高次構造：折りたたみ','purple',14),PL([[29,150],[67,122],[108,172],[147,120],[190,177],[231,124],[290,152]],'purple'),T(160,208,'変性 ≠ 全ペプチド結合の切断','gold',14),T(160,253,'完全加水分解：アミノ酸へ','mint',14),T(160,287,'Ala ＋ Gly ＋ Ser ＋ Val','text',16)])
diagram('dna','DNAの鎖内結合と塩基対','線は糖−リン酸の共有結合の骨格、横の点線は塩基間の水素結合を模式化。DNAは逆向きの2本鎖。ヌクレオチド中の糖・塩基・リン酸と、2本鎖を結ぶ塩基対を別々に見る。',321,[T(40,23,"5′",'mint'),T(280,23,"3′",'purple'),L(40,39,40,273,'mint'),L(280,39,280,273,'purple'),T(85,83,'A','mint',20),T(237,83,'T','purple',20),L(110,72,208,72,'gold',True),L(110,81,208,81,'gold',True),T(85,171,'G','mint',20),T(237,171,'C','purple',20),L(110,155,208,155,'gold',True),L(110,164,208,164,'gold',True),L(110,173,208,173,'gold',True),L(40,74,68,74,'mint'),L(40,163,68,163,'mint'),L(252,74,280,74,'purple'),L(252,163,280,163,'purple'),T(40,296,"3′",'mint'),T(280,296,"5′",'purple'),T(160,245,'A−T：2本、G−C：3本','gold',15)],('polymer-original','nhgri-base','nhgri-nucleotide'))
diagram('recovery','切る結合を選んで単量体を戻す','逆算のための官能基の模式図。酸性または中性の完全加水分解後の形を示す。アルカリ性ならCOOHではなくCOO⁻の塩になるので、条件で生成物を区別する。',277,[T(160,29,'エステル：R−CO−O−R′','text',18),T(160,70,'COとOの間を切る','gold',15)]+arrow(160,82,110)+[T(160,143,'R−COOH ＋ HO−R′','mint',18),T(160,187,'アミド：R−CO−NH−R′','text',18),T(160,223,'R−COOH ＋ H₂N−R′','purple',18),T(160,262,'小分子の加水分解を鎖へ繰り返す','muted',13)])
diagram('pla','乳酸の自己縮合とPLA','乳酸はOHとCOOHを両方もつので、1種類の単量体でも縮合重合できる。実際の工業製造ではラクチドの開環重合も使われる。式は結合の理解のための模式的な自己縮合。',267,[T(160,35,'乳酸：HO−CH(CH₃)−COOH','text',18)]+arrow(160,57,93)+[T(160,119,'OHとCOOHで連結、脱水','gold',15),T(66,181,'O'),T(159,181,'CH'),T(261,181,'CO'),L(79,174,135,174),L(182,174,241,174),L(23,174,51,174),L(278,174,305,174),T(159,224,'CH₃','gold'),L(159,190,159,202)]+brackets(34,296,143,239))
# Exercise diagrams preserve the supplied structure but omit answer-revealing
# polymer/monomer names, reaction labels and conclusions from instructional figures.
import copy
quizDescriptions={
 'pe':'繰返し部分は−CH₂−CH₂−。両端は隣の単位へ続く。',
 'pp':'繰返し部分は−CH₂−CH(CH₃)−。CH₃は側基。',
 'pvc':'繰返し部分は−CH₂−CHCl−。Clは側基。',
 'ps':'繰返し部分は−CH₂−CH(C₆H₅)−。C₆H₅は側基。',
 'ptfe':'繰返し部分は−CF₂−CF₂−。末端は省略。',
 'pan':'繰返し部分は−CH₂−CH(C≡N)−。C≡Nは側基。',
 'pmma':'繰返し部分は−CH₂−C(CH₃)(COOCH₃)−。2種類の側基をもつ。',
 'pvac':'繰返し部分は−CH₂−CH(OCOCH₃)−。OCOCH₃は側基。',
 'pet':'繰返し部分は−O−CH₂CH₂−O−CO−p-C₆H₄−CO−。COはC(=O)の略。',
 'nylon66':'繰返し部分は−NH−(CH₂)₆−NH−CO−(CH₂)₄−CO−。COはC(=O)。',
 'nylon6':'繰返し部分は−NH−(CH₂)₅−CO−。COはC(=O)。',
 'rubber-repeat':'繰返し部分は−CH₂−C(CH₃)=CH−CH₂−。立体配置はこの図では省略。',
}
for key,desc in quizDescriptions.items():
 original=next(d for d in pack['diagrams'] if d['id']==D(key));d=copy.deepcopy(original);d['id']=D('quiz-'+key);d['title']='演習用：繰返し構造';d['description']=desc+' 括弧は鎖の繰返し境界。'
 if key in ['pe','pp','pvc','ps','ptfe','pan','pmma','pvac']:
  d['elements']=[e for e in d['elements'] if (e['type']=='text' and 159<=e['y']<280) or (e['type']=='line' and min(e['y1'],e['y2'])>=159) or (e['type']=='polyline' and min(pt[1] for pt in e['points'])>=159)]
  for e in d['elements']:
   if e['type']=='text':e['y']-=145
   elif e['type']=='line':e['y1']-=145;e['y2']-=145
   else:e['points']=[[x,y-145] for x,y in e['points']]
  d['height']=140
 elif key in ['pet','nylon66','nylon6']:
  d['elements']=[e for e in d['elements'] if e['type']!='text' or e['y']<135];d['height']=130
 else:
  d['elements']=[e for e in d['elements'] if e['type']!='text' or e['y']<145];d['height']=140
 pack['diagrams'].append(d)
for key in ['ester','amide']:
 original=next(d for d in pack['diagrams'] if d['id']==D(key));d=copy.deepcopy(original);d['id']=D('quiz-'+key);d['title']='演習用：連結構造';d['description']='RとR′は残りの原子団。C=Oと、その隣の原子を読む。'
 d['elements']=[e for e in d['elements'] if (e['type']=='text' and 185<=e['y']<270) or (e['type']=='line' and min(e['y1'],e['y2'])>=185)]
 for e in d['elements']:
  if e['type']=='text':e['y']-=170
  else:e['y1']-=170;e['y2']-=170
 d['height']=110;pack['diagrams'].append(d)
original=next(d for d in pack['diagrams'] if d['id']==D('network'));d=copy.deepcopy(original);d['id']=D('quiz-network');d['title']='演習用：2種類の鎖の配置';d['description']='上の構造Aと下の構造Bを比較する。金色の線は鎖間の共有結合を示す。'
for e in d['elements']:
 if e['type']=='text':e['text']='構造A' if e['y']==23 else '構造B' if e['y']==165 else '金色の線：鎖間の共有結合'
pack['diagrams'].append(d)
