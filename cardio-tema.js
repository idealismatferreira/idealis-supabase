/* =====================================================================
   IDEALIS · cardio-tema.js — Cardio temático (motor do cenário)
   Baixado só quando o cardio abre. Expõe window.CardioTema.criar(host, {blocos, exercicio, tema}).
   Gerado a partir do protótipo aprovado; não editar à mão sem atualizar o protótipo.
   ===================================================================== */
(function(){
'use strict';
if(window.CardioTema)return;
const CSS=".ct-host .cena{inset:0;z-index:0;overflow:hidden;transition:opacity .35s ease}\n.ct-host .cena.oculta{display:none}\n.ct-host .cena.trocando{opacity:0}\n.ct-host .ceu{position:absolute;inset:0;background:linear-gradient(to bottom,var(--k-c1) 0%,var(--k-c2) var(--mc,38%),var(--k-c3) var(--hz,55%),var(--k-c3) 100%)}\n.ct-host .ct-sol{position:absolute;left:0;top:0;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;pointer-events:none;will-change:transform;opacity:var(--k-solA,1);\n  background:radial-gradient(circle,var(--k-sol) 0 12%,rgba(255,236,200,.4) 15%,rgba(255,226,180,.12) 38%,rgba(255,220,170,0) 68%)}\n.ct-host .ct-sol.ct-lua{background:radial-gradient(circle,var(--k-sol) 0 9%,rgba(220,230,255,.24) 12%,rgba(200,210,255,.07) 30%,rgba(200,210,255,0) 58%)}\n.ct-host .nivel-A .ct-sol,.ct-host .nivel-B .ct-sol{transition:transform 2s linear}\n.ct-host .ct-faixa{position:absolute;left:0;top:0;display:flex;will-change:transform}\n.ct-host .ct-faixa.v{flex-direction:column}\n.ct-host .ct-faixa svg{display:block;flex:0 0 auto;overflow:visible}\n.ct-host .afunda{position:absolute;left:0;will-change:transform}\n.ct-host .afunda svg{display:block}\n.ct-host .nivel-A .afunda,.ct-host .nivel-B .afunda{transition:transform 2s linear}\n.ct-host .mundo{position:absolute;inset:0;transition:transform 2.4s cubic-bezier(.3,.7,.3,1)}\n.ct-host .mundo.subida{transform:rotate(-2.6deg) scale(1.09)}\n.ct-host .mundo.pico{transform:rotate(-3.4deg) scale(1.16)}\n.ct-host .mundo.descida{transform:rotate(1.8deg) scale(1.07)}\n.ct-host .mundo.zoom1{transform:scale(1.05)}\n.ct-host .mundo.zoom2{transform:scale(1.11)}\n.ct-host .sprites{position:absolute;inset:0}\n.ct-host .sprite{position:absolute;left:0;top:0;will-change:transform;pointer-events:none}\n.ct-host .sprite svg{display:block;overflow:visible}\n.ct-host .sprite.heroi{z-index:3}\n.ct-host .pp-mexe{animation:ct-ppmexe 3.4s ease-in-out infinite alternate}\n@keyframes ct-ppmexe{from{transform:translateX(-1.2px)}to{transform:translateX(1.4px)}}\n.ct-host .pp-pula{animation:ct-pppula 1.7s cubic-bezier(.3,0,.4,1) infinite}\n@keyframes ct-pppula{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}\n.ct-host .pp-bola{animation:ct-ppbola 1.7s ease-in-out infinite alternate}\n@keyframes ct-ppbola{from{transform:translate(0,0)}to{transform:translate(-34px,-4px)}}\n.ct-host .sprite.fixo{animation:ct-spIn .9s ease both}\n@keyframes ct-spIn{from{opacity:0}to{opacity:1}}\n.ct-host .reflexo{position:absolute;width:52px;pointer-events:none;opacity:.5;\n  background:repeating-linear-gradient(to bottom,var(--k-brilho) 0 1.5px,transparent 1.5px 6px);\n  -webkit-mask-image:linear-gradient(to right,transparent,#000 35%,#000 65%,transparent);mask-image:linear-gradient(to right,transparent,#000 35%,#000 65%,transparent)}\n.ct-host .nivel-A .reflexo{animation:ct-brilha 3.2s ease-in-out infinite}\n@keyframes ct-brilha{50%{opacity:.25}}\n.ct-host .aurora{position:absolute;left:-15%;right:-15%;pointer-events:none;opacity:calc(var(--k-aurora) * .7);transition:opacity 2s}\n.ct-host .cena.forte .aurora{opacity:var(--k-aurora)}\n.ct-host .aurora i{position:absolute;inset:0;border-radius:50%;transform:skewY(-10deg) scaleY(.62);\n  background:linear-gradient(to bottom,rgba(90,255,180,0) 18%,rgba(90,255,180,.5) 48%,rgba(110,160,255,.22) 70%,rgba(110,160,255,0) 100%)}\n.ct-host .aurora i+i{transform:skewY(8deg) scaleY(.46) translateY(28%);background:linear-gradient(to bottom,rgba(170,120,255,0) 10%,rgba(170,120,255,.34) 50%,rgba(90,255,180,.16) 72%,rgba(90,255,180,0) 100%)}\n.ct-host .nivel-A .aurora i{animation:ct-aurora 9s ease-in-out infinite alternate}\n.ct-host .nivel-A .aurora i+i{animation:ct-aurora2 12s ease-in-out infinite alternate}\n@keyframes ct-aurora{to{transform:skewY(-4deg) scaleY(.76) translateX(6%)}}\n@keyframes ct-aurora2{to{transform:skewY(3deg) scaleY(.56) translateY(22%) translateX(-5%)}}\n.ct-host .particulas{position:absolute;inset:0;pointer-events:none}\n.ct-host .p-folha,.ct-host .p-polen,.ct-host .p-neve{position:absolute;will-change:transform}\n.ct-host .p-folha{animation:ct-pfolha linear infinite}\n.ct-host .p-folha svg{display:block}\n@keyframes ct-pfolha{0%{transform:translate3d(0,0,0) rotate(0);opacity:0}8%{opacity:.9}90%{opacity:.85}100%{transform:translate3d(-170px,var(--queda,220px),0) rotate(430deg);opacity:0}}\n.ct-host .p-polen{width:3px;height:3px;border-radius:50%;background:var(--k-claro);animation:ct-ppolen ease-in-out infinite}\n@keyframes ct-ppolen{0%{transform:translate3d(0,0,0);opacity:0}30%{opacity:.7}100%{transform:translate3d(-70px,-90px,0);opacity:0}}\n.ct-host .p-neve{width:4px;height:4px;border-radius:50%;background:#fff;animation:ct-pneve linear infinite}\n@keyframes ct-pneve{0%{transform:translate3d(0,0,0);opacity:0}10%{opacity:.85}100%{transform:translate3d(var(--drift,-60px),var(--queda,240px),0);opacity:.15}}\n.ct-host .p-chuva{position:absolute;width:1.6px;height:24px;border-radius:1px;background:linear-gradient(to bottom,rgba(225,236,245,0),rgba(225,236,245,.78));will-change:transform;animation:ct-pchuva linear infinite}\n@keyframes ct-pchuva{from{transform:translate3d(0,0,0) rotate(8deg)}to{transform:translate3d(-60px,var(--queda,900px),0) rotate(8deg)}}\n.ct-host .p-vento{position:absolute;width:56px;height:1.6px;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0));will-change:transform;animation:ct-pvento linear infinite}\n.ct-host .p-vento.areia{height:2px;background:linear-gradient(90deg,rgba(232,200,150,0),rgba(232,200,150,.75),rgba(232,200,150,0))}\n@keyframes ct-pvento{from{transform:translate3d(0,0,0)}to{transform:translate3d(var(--dist,-500px),12px,0)}}\n.ct-host .p-nevoa{position:absolute;width:300px;height:80px;border-radius:50%;background:radial-gradient(closest-side,rgba(225,232,236,.4),rgba(225,232,236,0));will-change:transform;animation:ct-pnevoa ease-in-out infinite alternate}\n@keyframes ct-pnevoa{from{transform:translate3d(0,0,0)}to{transform:translate3d(-140px,6px,0)}}\n.ct-host .nevoa{position:absolute;inset:0;pointer-events:none}\n.ct-host .cena.pausada .particulas *,.ct-host .cena.pausada .aurora i,.ct-host .cena.pausada .sprite *{animation-play-state:paused}\n.ct-host .veucena,.ct-host .veuprev{position:absolute;inset:0;pointer-events:none}\n.ct-host .veuprev{background:rgba(4,6,7,.24);opacity:0;transition:opacity .6s}\n.cdover.f-prev .ct-host .veuprev,.cdover.f-fim .ct-host .veuprev{opacity:1}\n.cdover.f-count .ct-host .veuprev{opacity:.4}\n.ct-host .L-nuvem{fill:var(--k-nuvem)}\n.ct-host .L-longe{fill:var(--k-longe)}\n.ct-host .L-longe2{fill:var(--k-longe2)}\n.ct-host .L-longe-st{stroke:var(--k-longe)}\n.ct-host .L-mar{fill:var(--k-mar)}\n.ct-host .L-brilho{fill:var(--k-brilho)}\n.ct-host .L-areia{fill:var(--k-areia)}\n.ct-host .L-meio{fill:var(--k-meio)}\n.ct-host .L-perto{fill:var(--k-perto)}\n.ct-host .L-chao{fill:var(--k-chao)}\n.ct-host .L-caminho{fill:var(--k-caminho)}\n.ct-host .L-detalhe{fill:var(--k-detalhe)}\n.ct-host .L-detalhe-st{stroke:var(--k-detalhe)}\n.ct-host .L-frente{fill:var(--k-frente)}\n.ct-host .L-frente-st{stroke:var(--k-frente)}\n.ct-host .L-raiz{stroke:var(--k-detalhe)}\n.ct-host .L-onda{stroke:var(--k-chao)}\n.ct-host .L-flor{fill:var(--k-flor)}\n.ct-host .L-luz{opacity:var(--k-luz)}\n.ct-host .L-luzfarol{fill:#ffd98a;opacity:calc(var(--k-luz) * .45)}\n.ct-host .L-folha{fill:var(--k-folha)}\n.ct-host .L-estrela{fill:#fff;opacity:var(--k-estrela)}\n.ct-host .L-janela{fill:#ffd98a;opacity:var(--k-luz)}\n.ct-host .L-vidro{fill:var(--k-vidro)}\n.ct-host .L-ciclo{fill:var(--k-ciclo)}\n.ct-host .L-faixa{fill:var(--k-faixa)}\n.ct-host .L-faixa-st{stroke:var(--k-faixa)}\n.ct-host .L-neve{fill:var(--k-neve)}\n.ct-host .L-lagoa{fill:var(--k-lagoa)}\n.ct-host .L-arbusto{fill:var(--k-arbusto)}\n.ct-host .L-escada{fill:var(--k-escada)}\n.ct-host .L-farolA{fill:var(--k-claro)}\n.ct-host .L-farolB{fill:var(--k-toldo)}\n.ct-host .S-sil{fill:var(--k-sil)}\n.ct-host .S-sil-st{stroke:var(--k-sil)}\n.ct-host .S-claro{fill:var(--k-claro)}\n.ct-host .S-claro-st{stroke:var(--k-claro)}\n.ct-host .S-madeira{fill:var(--k-madeira)}\n.ct-host .S-flor{fill:var(--k-flor)}\n.ct-host .S-flor2{fill:var(--k-flor2)}\n.ct-host .S-caramelo{fill:var(--k-caramelo)}\n.ct-host .S-caramelo-st{stroke:var(--k-caramelo)}\n.ct-host .S-caramelo2{fill:var(--k-caramelo2)}\n.ct-host .S-capi{fill:var(--k-capi)}\n.ct-host .S-capi-st{stroke:var(--k-capi)}\n.ct-host .S-toldo{fill:var(--k-toldo)}\n.ct-host .S-toldo-st{stroke:var(--k-toldo)}\n.ct-host .S-ave-st{stroke:var(--k-ave)}\n.ct-host .S-luz{opacity:var(--k-luz)}\n.ct-host .S-neve{fill:var(--k-neve)}\n.ct-host .S-luzfarol{fill:#ffd98a;opacity:calc(var(--k-luz) * .5)}\n.ct-host .S-txt{fill:#f7efdf;font-family:var(--f-ui);font-weight:800;letter-spacing:.05em}\n.ct-host .corre .pA{animation:ct-pa .3s steps(1,end) infinite}\n.ct-host .corre .pB{animation:ct-pb .3s steps(1,end) infinite}\n.ct-host .pedal .pA{animation:ct-pa .42s steps(1,end) infinite}\n.ct-host .pedal .pB{animation:ct-pb .42s steps(1,end) infinite}\n@keyframes ct-pa{0%{opacity:1}50%{opacity:0}}\n@keyframes ct-pb{0%{opacity:0}50%{opacity:1}}\n.ct-host .corre .cao,.ct-host .anda .capi{animation:ct-bob .3s ease-in-out infinite alternate}\n.ct-host .anda .capi{animation-duration:.55s}\n@keyframes ct-bob{to{transform:translateY(-1.4px)}}\n.ct-host .asa{transform-box:fill-box;transform-origin:center;animation:ct-asa .5s ease-in-out infinite alternate}\n.ct-host .asa.d2{animation-delay:-.15s}\n.ct-host .asa.d3{animation-delay:-.3s}\n.ct-host .asa.d4{animation-delay:-.4s}\n@keyframes ct-asa{to{transform:scaleY(-.35)}}\n.ct-host .pas{transform-box:fill-box;transform-origin:center;animation:ct-gira 4s linear infinite}\n@keyframes ct-gira{to{transform:rotate(360deg)}}\n.ct-host .fumaca{animation:ct-fuma 3.2s ease-in-out infinite}\n@keyframes ct-fuma{0%{transform:translateY(4px);opacity:.2}50%{opacity:1}100%{transform:translateY(-6px);opacity:0}}\n.ct-host .chama{transform-box:fill-box;transform-origin:50% 100%;animation:ct-chama .35s ease-in-out infinite alternate}\n@keyframes ct-chama{to{transform:scaleY(1.1) scaleX(.94)}}\n.ct-host .flamula{transform-box:fill-box;transform-origin:0 50%;animation:ct-flamula 1s ease-in-out infinite alternate}\n@keyframes ct-flamula{to{transform:skewY(5deg) scaleX(.94)}}\n.ct-host .bica .corpo{transform-box:fill-box;transform-origin:30% 100%;animation:ct-bica 1.4s ease-in-out infinite}\n@keyframes ct-bica{0%,70%,100%{transform:rotate(0)}80%{transform:rotate(-14deg)}}\n.ct-host .nivel-C .sprite *{animation:none!important}\n.ct-host .cena{position:absolute}\n@media (prefers-reduced-motion:reduce){.ct-host .particulas *,.ct-host .reflexo,.ct-host .aurora i,.ct-host .sprite *{animation:none!important}.ct-host .mundo,.ct-host .ct-sol,.ct-host .cena,.ct-host .afunda{transition:none!important}}";
/* ---------- utilitários ---------- */
let HOST=null;
const $=id=>HOST?HOST.querySelector('#'+id):null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const TAU=Math.PI*2;
const f1=v=>Math.round(v*10)/10;
function rngDe(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function embaralhar(rng,arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));const t=arr[i];arr[i]=arr[j];arr[j]=t;}return arr;}
const h2r=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const r2h=a=>'#'+a.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
function misturar(a,b,t){const A=h2r(a),B=h2r(b);return r2h([lerp(A[0],B[0],t),lerp(A[1],B[1],t),lerp(A[2],B[2],t)]);}
function hexA(h,a){const c=h2r(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtCrono=s=>{s=Math.max(0,Math.ceil(s-1e-6));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const fmtDur=s=>s<60?s+'s':(s%60===0?(s/60)+' min':Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+' min');

const NIVEIS={
  aquecimento:{label:'Aquecimento',cor:'#54c8e0',zona:1},
  leve:{label:'Leve',cor:'#5ddb8b',zona:2},
  moderado:{label:'Moderado',cor:'#ffc247',zona:3},
  forte:{label:'Forte',cor:'#e57b7b',zona:4},
  maximo:{label:'Máximo',cor:'#c9414f',zona:5}};
const ZONAS=[1,2,3,4,5].map(z=>Object.values(NIVEIS).find(n=>n.zona===z));
const PCT={1:[.5,.6],2:[.6,.7],3:[.7,.8],4:[.8,.9],5:[.9,1]};
const IDADE=30, FCMAX=Math.round(208-0.7*IDADE);
const faixaBpm=z=>({de:Math.round(FCMAX*PCT[z][0]),ate:Math.round(FCMAX*PCT[z][1])});
const ALTURA={aquecimento:.30,leve:.46,moderado:.62,forte:.80,maximo:1};
const VELZ={1:.55,2:.8,3:1.05,4:1.45,5:1.85};
let BL=[],INI=[],TOTAL=0;
function papeis(bl){
  const z=bl.map(b=>NIVEIS[b.nivel].zona),max=Math.max.apply(null,z),iMax=z.lastIndexOf(max);
  return bl.map((b,i)=>{
    if(i===0)return 'partida';
    if(i===bl.length-1)return 'chegada';
    if(i===iMax&&max>=4)return 'climax';
    if(z[i]>z[i-1])return z[i]>=4?'desafio':'exploracao';
    if(z[i]<z[i-1])return 'alivio';
    return z[i]>=4?'desafio':'exploracao';
  });
}

/* ---------- máquinas e palavras de comando ---------- */
const MODS={esteira:'Esteira',bike:'Bike',eliptico:'Elíptico',escada:'Escada'};
/* exercício do Cardápio -> máquina + como a intensidade sobe. frase: qual banco de frases usar na esteira;
   marcha: como o boneco anda; incl: a intensidade sobe pela inclinação (só aí a cena inclina e aparecem subidas) */
const EXERCICIOS={
 caminhada:{nome:'Caminhada na Esteira',curto:'Caminhada',maq:'esteira',frase:'anda',marcha:'anda',incl:0},
 caminhada_incl:{nome:'Caminhada na Esteira com Inclinação',curto:'Caminhada inclinada',maq:'esteira',frase:'incl',marcha:'anda',incl:1},
 trote:{nome:'Trote na Esteira',curto:'Trote',maq:'esteira',frase:'trote',marcha:'trote',incl:0},
 bike_h:{nome:'Bicicleta Horizontal',curto:'Bike horizontal',maq:'bike'},
 bike_v:{nome:'Bicicleta Vertical',curto:'Bike vertical',maq:'bike'},
 eliptico:{nome:'Elíptico',curto:'Elíptico',maq:'eliptico'},
 escada:{nome:'Simulador Escada',curto:'Escada',maq:'escada'}};
function exercicioDoNome(n){
  n=String(n||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(/escada|stair/.test(n))return 'escada';
  if(/eliptic|transport/.test(n))return 'eliptico';
  if(/horizontal|reclinad/.test(n))return 'bike_h';
  if(/bicicleta|bike|spinning|ergometr/.test(n))return 'bike_v';
  if(/inclina/.test(n))return 'caminhada_incl';
  if(/trote|corrida|correr/.test(n))return 'trote';
  if(/esteira|caminhada/.test(n))return 'caminhada';
  return null;
}
const RITMO={esteira:1,bike:1.35,eliptico:1,escada:.42};
const CUE={partida:'Aquece',exploracao:'No ritmo',desafio:'Sobe!',climax:'Tudo!',alivio:'Respira',chegada:'Desacelera'};
const CUE_MOD={bike:{desafio:'Pedala!',climax:'Sprint!'},eliptico:{desafio:'Acelera!'}};

/* ---------- paletas (4 momentos do dia por cenário) ---------- */
const COMUM=[
 {claro:'#d8cbd6',madeira:'#5d4448',caramelo:'#9a6a4c',capi:'#6a4f45',toldo:'#b5506a',ave:'#2a2540',flor:'#d9a54a',folha:'#e0b05a',
  vidro:'#3a4a6a',ciclo:'#7a3b46',faixa:'#cfc7a8',neve:'#c9c8e0',lagoa:'#4f7fa8',arbusto:'#2e4a46',mar:'#3c5a86',brilho:'#f7c59a',areia:'#8c7a8a',estrela:0,aurora:0},
 {claro:'#f2f5f4',madeira:'#8a6142',caramelo:'#cf8f4e',capi:'#7d5a3c',toldo:'#e2533e',ave:'#1c2a33',flor:'#f3c832',folha:'#a8d060',
  vidro:'#9cc3d6',ciclo:'#c0453f',faixa:'#f1e3a0',neve:'#f2f7fb',lagoa:'#33c4c9',arbusto:'#4f7a3a',mar:'#1f8fb0',brilho:'#e6fbff',areia:'#e8d6a8',estrela:0,aurora:0},
 {claro:'#f4e7d6',madeira:'#8f6040',caramelo:'#d08a46',capi:'#86603e',toldo:'#e5603c',ave:'#2b2a2a',flor:'#f0b530',folha:'#e8a640',
  vidro:'#c9a98e',ciclo:'#b8473c',faixa:'#efd890',neve:'#f6ece0',lagoa:'#4fb3b3',arbusto:'#5c6e38',mar:'#3c7e94',brilho:'#ffe6b0',areia:'#e7c48a',estrela:0,aurora:0},
 {claro:'#e8b4aa',madeira:'#553440',caramelo:'#8e4e3e',capi:'#59393f',toldo:'#b2424f',ave:'#1d1428',flor:'#e08a3a',folha:'#f08a50',
  vidro:'#4a3a5e',ciclo:'#6e2f45',faixa:'#b9a37a',neve:'#e3b9c4',lagoa:'#5a5a8e',arbusto:'#3a2e44',mar:'#4a2f5c',brilho:'#ffb27a',areia:'#8a4f5a',estrela:0,aurora:0}];
const comOver=(base,over)=>base.map((k,i)=>Object.assign({},k,over[i]||{}));
const PAL_PARQUE=[
  {c1:'#15203f',c2:'#5a4f86',c3:'#f2a37c',sol:'#ffd7a3',nuvem:'#b98aa8',longe:'#5d5f8c',meio:'#3c4f6e',perto:'#253a45',chao:'#17262b',caminho:'#2c3b3e',detalhe:'#3d4e52',frente:'#0c1517',luz:.65},
  {c1:'#1f5a94',c2:'#5ea3cf',c3:'#bfe3e6',sol:'#fff3d1',nuvem:'#eaf4f7',longe:'#7aa3b4',meio:'#4a7f78',perto:'#2b5f4a',chao:'#1f4232',caminho:'#5c6b55',detalhe:'#77846a',frente:'#11281b',luz:0},
  {c1:'#2b4f8c',c2:'#d79a6a',c3:'#f4cf91',sol:'#ffe0a0',nuvem:'#f6d6b0',longe:'#9d8a8c',meio:'#6a7458',perto:'#3b5636',chao:'#2a3b23',caminho:'#6e6247',detalhe:'#85765a',frente:'#16240f',luz:.1},
  {c1:'#24173f',c2:'#a3416a',c3:'#f08446',sol:'#ffa05c',nuvem:'#d0627a',longe:'#6f3f63',meio:'#4a3052',perto:'#2b213d',chao:'#1b162c',caminho:'#2e2540',detalhe:'#3d3150',frente:'#0e0b19',luz:1}];
const PAL_ORLA=[
  {c1:'#172245',c2:'#6a5c95',c3:'#f6b088',sol:'#ffd9a6',nuvem:'#c296b0',longe:'#5b628f',mar:'#3c5a86',brilho:'#f7c59a',areia:'#8c7a8a',meio:'#3d4a6a',perto:'#22344a',chao:'#1d2733',caminho:'#8e8aa0',detalhe:'#2c3542',frente:'#0f151c',luz:.6},
  {c1:'#1665a6',c2:'#4fb0dc',c3:'#c5ecf0',sol:'#fff6d8',nuvem:'#f2fafc',longe:'#5f9a8f',mar:'#1f8fb0',brilho:'#e6fbff',areia:'#e8d6a8',meio:'#3f7a5a',perto:'#2c5a40',chao:'#2c3b3d',caminho:'#e9e6dc',detalhe:'#3c4c4e',frente:'#152224',luz:0},
  {c1:'#285a96',c2:'#e0a46e',c3:'#f8d79a',sol:'#ffe3a3',nuvem:'#f7d8b2',longe:'#8f7f74',mar:'#3c7e94',brilho:'#ffe6b0',areia:'#e7c48a',meio:'#6a6a48',perto:'#3e4f32',chao:'#343330',caminho:'#e8dcc0',detalhe:'#45433e',frente:'#1c1b18',luz:.15},
  {c1:'#221640',c2:'#b04466',c3:'#f58848',sol:'#ffa35e',nuvem:'#d4637a',longe:'#5e3557',mar:'#4a2f5c',brilho:'#ffb27a',areia:'#8a4f5a',meio:'#3d2747',perto:'#261b36',chao:'#1c1726',caminho:'#6d5a73',detalhe:'#2a2236',frente:'#0f0b16',luz:1}];
const PAL_SERRA=[
  {c1:'#131c35',c2:'#4a5a86',c3:'#e5a487',sol:'#ffd2a6',nuvem:'#a9a6c4',longe:'#4f5d86',meio:'#34466a',perto:'#1e2f3f',chao:'#1a2229',caminho:'#3a3b3f',detalhe:'#4a4950',frente:'#0b1216',luz:.5},
  {c1:'#1a5288',c2:'#5f9cc6',c3:'#cfe4e2',sol:'#fff4d6',nuvem:'#e8f1f1',longe:'#6c8fa6',meio:'#3f6b66',perto:'#24493b',chao:'#2c3426',caminho:'#6b5a44',detalhe:'#84705a',frente:'#10241a',luz:0},
  {c1:'#2b4c84',c2:'#c99772',c3:'#efd2a2',sol:'#ffe1a6',nuvem:'#f0dcc6',longe:'#87829a',meio:'#5b6a5a',perto:'#324a34',chao:'#33301f',caminho:'#7a6346',detalhe:'#8d775a',frente:'#142010',luz:.1},
  {c1:'#1d1638',c2:'#8e3f6e',c3:'#ea7d4c',sol:'#ff9c5e',nuvem:'#b56a8a',longe:'#5a3a64',meio:'#3c2a50',perto:'#22193a',chao:'#19142a',caminho:'#33283f',detalhe:'#42344f',frente:'#0c0918',luz:.9}];
const PAL_CIDADE=[
  {c1:'#1e2350',c2:'#7a4f86',c3:'#f29a6a',sol:'#fff1d6',nuvem:'#b07a98',longe:'#4a4470',meio:'#352f55',perto:'#221d38',chao:'#17142a',caminho:'#3a3550',detalhe:'#4a4462',frente:'#0e0c18',luz:.35,estrela:.1,vidro:'#6a5a8e'},
  {c1:'#141a40',c2:'#3d3f78',c3:'#b0627a',sol:'#f6f1e0',nuvem:'#5e5486',longe:'#2e2f58',meio:'#242447',perto:'#181834',chao:'#121226',caminho:'#2c2c48',detalhe:'#3a3a5a',frente:'#0a0a16',luz:.75,estrela:.45,vidro:'#3a3e6a'},
  {c1:'#0a0f26',c2:'#18224a',c3:'#3a3f6e',sol:'#eef0f6',nuvem:'#2e3560',longe:'#1c2242',meio:'#161b38',perto:'#10132a',chao:'#0c0f20',caminho:'#262a44',detalhe:'#343858',frente:'#06070f',luz:1,estrela:.9,vidro:'#232a4e'},
  {c1:'#070a1c',c2:'#121a3a',c3:'#2a2f58',sol:'#e4e8f2',nuvem:'#262c52',longe:'#181d3a',meio:'#121631',perto:'#0d1025',chao:'#0a0c1c',caminho:'#22263e',detalhe:'#2e3250',frente:'#05060d',luz:1,estrela:1,vidro:'#1e2446'}];
const PAL_CICLOVIA=[
  {c1:'#1a2448',c2:'#6a5a90',c3:'#f2a882',sol:'#ffd8a8',nuvem:'#c094ae',longe:'#5e5e8a',meio:'#45486e',perto:'#253a45',chao:'#1c2228',caminho:'#565a66',detalhe:'#3a3f48',frente:'#0d1114',luz:.55,vidro:'#8a7aa6',ciclo:'#7a3b46',faixa:'#d8cfc0'},
  {c1:'#1d5c98',c2:'#5aa6d2',c3:'#c4e4ea',sol:'#fff4d4',nuvem:'#eef6f8',longe:'#8aa6b8',meio:'#6f8696',perto:'#2f5e48',chao:'#2c3236',caminho:'#b9bcc0',detalhe:'#50565c',frente:'#121a1c',luz:0,vidro:'#b8d8e6',ciclo:'#c0453f',faixa:'#f4f1ea'},
  {c1:'#2c5089',c2:'#d89c6c',c3:'#f4d092',sol:'#ffe2a4',nuvem:'#f4d8b6',longe:'#a08c8c',meio:'#8a7a72',perto:'#3e5636',chao:'#343230',caminho:'#c4b8a6',detalhe:'#5a544c',frente:'#181612',luz:.12,vidro:'#e6c49a',ciclo:'#b8473c',faixa:'#f0e6d4'},
  {c1:'#241840',c2:'#a8446a',c3:'#f28848',sol:'#ffa25c',nuvem:'#d2647a',longe:'#6a3c60',meio:'#4e3456',perto:'#2b213d',chao:'#1c1828',caminho:'#4a3e56',detalhe:'#2e2638',frente:'#0e0b16',luz:1,vidro:'#c06a6e',ciclo:'#6e2f45',faixa:'#c8a8a0'}];
const PAL_ESTRADA=comOver(PAL_SERRA,[{caminho:'#3a3d48',faixa:'#c9b26a',detalhe:'#585a66'},{caminho:'#4a4d52',faixa:'#f1cf4a',detalhe:'#9aa0a6'},{caminho:'#4e4a46',faixa:'#efc850',detalhe:'#9a948a'},{caminho:'#2e2838',faixa:'#c9a050',detalhe:'#4a4258'}]);
const PAL_CAMPO=[
  {c1:'#1b2346',c2:'#6a5a8c',c3:'#f4ac7e',sol:'#ffd8a4',nuvem:'#c49aae',longe:'#6a6890',meio:'#4a5670',perto:'#26393a',chao:'#1d2a26',caminho:'#4a4446',detalhe:'#5e5658',frente:'#0e1512',luz:.5,flor:'#c9a24a'},
  {c1:'#2468a6',c2:'#62b0dc',c3:'#d2ecee',sol:'#fff6d6',nuvem:'#f4fafb',longe:'#8cb49c',meio:'#6a9a4c',perto:'#2e5a32',chao:'#2c4a26',caminho:'#a88a5e',detalhe:'#8a6e48',frente:'#13281a',luz:0,flor:'#f6c62c'},
  {c1:'#2e568e',c2:'#e0a46c',c3:'#f8d896',sol:'#ffe4a2',nuvem:'#f8dcb4',longe:'#a89a7e',meio:'#8a8a44',perto:'#44582e',chao:'#3a4220',caminho:'#b08a58',detalhe:'#8e6c44',frente:'#1a2010',luz:.1,flor:'#f2b52a'},
  {c1:'#241840',c2:'#a8446a',c3:'#f28848',sol:'#ffa25c',nuvem:'#d2647a',longe:'#6a4062',meio:'#5a3a4e',perto:'#2e2238',chao:'#221a2a',caminho:'#4e3a40',detalhe:'#3a2c38',frente:'#100c16',luz:.9,flor:'#e08a3a'}];
const PAL_NEVE=[
  {c1:'#18203f',c2:'#5c5a8e',c3:'#eaa38e',sol:'#ffd8b0',nuvem:'#b8a4c4',longe:'#5a6290',meio:'#344a66',perto:'#213547',chao:'#c9c4dc',caminho:'#a6a6c6',detalhe:'#8e8eb0',frente:'#1a2436',luz:.5,neve:'#d6d0e6'},
  {c1:'#1b5a96',c2:'#66a8d6',c3:'#dbeef4',sol:'#fffbea',nuvem:'#f6fbfc',longe:'#7e9cc0',meio:'#2e5a58',perto:'#1f4a40',chao:'#eef4f8',caminho:'#cddde8',detalhe:'#aec4d4',frente:'#173a34',luz:0,neve:'#f6fafc'},
  {c1:'#2c4f8a',c2:'#c99a86',c3:'#f2d8c2',sol:'#ffe8c4',nuvem:'#f4e0d2',longe:'#9a90ae',meio:'#3e5a52',perto:'#2a4a3e',chao:'#f2e6dc',caminho:'#d8c8c0',detalhe:'#bcaaa6',frente:'#1e332c',luz:.1,neve:'#f8eee4'},
  {c1:'#1e1638',c2:'#8a3e6e',c3:'#e8805a',sol:'#ffa268',nuvem:'#b46a8a',longe:'#5e3c6a',meio:'#32284a',perto:'#241c3c',chao:'#d6a8b8',caminho:'#b0889c',detalhe:'#946e86',frente:'#160f24',luz:.9,neve:'#ecc0ca'}];
const PAL_AURORA=[
  {c1:'#141a3c',c2:'#3e4a7e',c3:'#9e7a9a',sol:'#f4f1e4',nuvem:'#4a5480',longe:'#2e3a64',meio:'#1d2a44',perto:'#142134',chao:'#8a9ab8',caminho:'#6e7e9e',detalhe:'#5a6a8a',frente:'#0c1424',luz:.4,estrela:.3,aurora:.15,neve:'#b4c0da'},
  {c1:'#0b1230',c2:'#1e2e58',c3:'#3e5a7e',sol:'#eef0f4',nuvem:'#2e3a64',longe:'#22305a',meio:'#152238',perto:'#0f1a2c',chao:'#6e80a2',caminho:'#56688c',detalhe:'#46587c',frente:'#08101c',luz:.8,estrela:.75,aurora:.6,neve:'#94a8c8'},
  {c1:'#060b22',c2:'#11204a',c3:'#234a6a',sol:'#e8ecf4',nuvem:'#1e2c52',longe:'#1a2a4a',meio:'#10203a',perto:'#0b172a',chao:'#5a6e92',caminho:'#4a5c80',detalhe:'#3e5074',frente:'#060c18',luz:1,estrela:1,aurora:1,neve:'#8098bc'},
  {c1:'#050a1c',c2:'#0e1a3e',c3:'#1d3c5e',sol:'#e4e8f0',nuvem:'#18244a',longe:'#16243f',meio:'#0e1c34',perto:'#091426',chao:'#506488',caminho:'#425476',detalhe:'#36486a',frente:'#050a14',luz:1,estrela:1,aurora:.85,neve:'#7890b4'}];
const PAL_DUNAS=[
  {c1:'#1a2448',c2:'#6a5c92',c3:'#f6b088',sol:'#ffd8a6',nuvem:'#c49aae',longe:'#b49aa8',meio:'#9a8aa0',perto:'#7e6e8a',chao:'#6a5a74',caminho:'#8a7a90',detalhe:'#5a4a64',frente:'#2a2238',luz:.4,lagoa:'#4f7fa8',arbusto:'#3a4a4e',brilho:'#f7c59a'},
  {c1:'#1466a8',c2:'#48b2e0',c3:'#c8eef2',sol:'#fff8dc',nuvem:'#f6fcfd',longe:'#f2ece0',meio:'#e6dccb',perto:'#d6c8b0',chao:'#c8b898',caminho:'#e0d2b8',detalhe:'#b4a284',frente:'#6a5a40',luz:0,lagoa:'#2fc2c8',arbusto:'#4f7a3a',brilho:'#eafcff'},
  {c1:'#2a5a96',c2:'#e2a46c',c3:'#fad896',sol:'#ffe4a2',nuvem:'#f8dcb4',longe:'#f2d8b0',meio:'#e8c898',perto:'#d8b07e',chao:'#c49c6c',caminho:'#dcb88a',detalhe:'#a8804e',frente:'#5a4228',luz:.1,lagoa:'#3ea8a8',arbusto:'#5c6e38',brilho:'#ffe6b0'},
  {c1:'#241840',c2:'#b04466',c3:'#f58848',sol:'#ffa35e',nuvem:'#d4637a',longe:'#c47a7e',meio:'#a45e72',perto:'#864a66',chao:'#6e3c58',caminho:'#8a5068',detalhe:'#5a304a',frente:'#24142a',luz:.8,lagoa:'#5a5a8e',arbusto:'#3a2e44',brilho:'#ffb27a'}];
const PAL_PREDIO=[
  {c1:'#18224a',c2:'#64588e',c3:'#f2a680',sol:'#ffd8a6',nuvem:'#c296b0',longe:'#4e4c78',meio:'#3a3c62',perto:'#262a44',chao:'#1c1e30',caminho:'#48486a',detalhe:'#33364f',frente:'#0e0f1a',luz:.6,vidro:'#7a6a9a'},
  {c1:'#1a62a2',c2:'#56aedc',c3:'#cfeaf0',sol:'#fff6d8',nuvem:'#f2fafc',longe:'#7f9ab4',meio:'#6e8496',perto:'#3c4a58',chao:'#2c3440',caminho:'#8a96a4',detalhe:'#56606c',frente:'#141a20',luz:0,vidro:'#a6d2ea'},
  {c1:'#2a5290',c2:'#dca06a',c3:'#f8d696',sol:'#ffe2a2',nuvem:'#f6d8b4',longe:'#9e8a86',meio:'#8a7670',perto:'#4a4448',chao:'#34302e',caminho:'#a69886',detalhe:'#625a52',frente:'#181614',luz:.15,vidro:'#f0c88e'},
  {c1:'#221640',c2:'#ae4468',c3:'#f48848',sol:'#ffa35e',nuvem:'#d4637a',longe:'#5e3557',meio:'#48304e',perto:'#2a2038',chao:'#1e1828',caminho:'#4a3c56',detalhe:'#34283e',frente:'#0e0b16',luz:1,vidro:'#d0707a'}];
const PAL_ESCADARIA=comOver(PAL_SERRA,[{perto:'#2e3448',caminho:'#5a5a70',detalhe:'#1e2232',arbusto:'#2a3e3a'},{perto:'#56606a',caminho:'#aaa69c',detalhe:'#3a4048',arbusto:'#4f7a3a'},{perto:'#6a625a',caminho:'#b4a48e',detalhe:'#463e36',arbusto:'#5c6e38'},{perto:'#2e2638',caminho:'#4e4258',detalhe:'#1c1626',arbusto:'#3a2e44'}]);

/* ---------- climas (modificadores de paleta + partículas) ---------- */
const CLIMAS={
 limpo:{nome:'Céu limpo',curto:'Limpo',ico:'sol'},
 nublado:{nome:'Nublado',curto:'Nublado',ico:'nuvem',ceu:['#7c8794',.45],nuvens:1,sol:.15,estrela:.25},
 chuva:{nome:'Chuva fina',curto:'Chuva',ico:'chuva',ceu:['#4b5663',.58],terra:.18,luz:.35,nuvens:1,sol:0,estrela:.1,part:'chuva'},
 neblina:{nome:'Neblina',curto:'Neblina',ico:'nevoa',ceu:['#b9c3c9',.38],nevoa:.5,sol:.3,estrela:.3,part:'nevoa'},
 vento:{nome:'Ventania',curto:'Vento',ico:'vento',part:'vento',ventoNuvem:4},
 nevasca:{nome:'Nevasca',curto:'Nevasca',ico:'neve',ceu:['#9aa5b5',.4],nevoa:.3,sol:.2,estrela:.3,part:'nevasca'},
 areia:{nome:'Vento de areia',curto:'Areia',ico:'vento',ceu:['#d9b98c',.28],nevoa:.25,part:'areia',ventoNuvem:3}};
const PL=(t,p,o)=>Object.assign({t,s:'placa',p},o||{});
const EV=(t,s,o)=>Object.assign({t,s},o||{});

/* ---------- biblioteca de cenários (v0.3): 13 cenários, 4 máquinas, climas ----------
   por cenário: 3 partidas · 3 explorações · 6 desafios · 3 clímax · 2 alívios · 3 chegadas */
const CENARIOS=[
/* ===== ESTEIRA ===== */
{id:'parque',nome:'Parque da cidade',curto:'Parque',mod:'esteira',part:'folhas',amb:['passaros','cachorro'],paleta:PAL_PARQUE,
 climas:['limpo','limpo','nublado','chuva','neblina','vento'],
 camadas:[{t:'nuvens',f:.018,ceu:1,n:'A'},{t:'colinas',f:.055,n:'ABC'},{t:'copas',f:.2,n:'A'},{t:'arvores',f:.5,n:'ABC'},{t:'gramado',f:1,n:'ABC'},{t:'tufos',f:1.45,n:'A'}],
 ev:{partida:[EV('Portão do parque','portao',{k:'Portão'}),PL('Pista do lago','PISTA 3 km',{k:'Pista'}),EV('Bosque','passaros',{k:'Bosque'})],
  exploracao:[EV('Lago das garças','garca'),EV('Alameda dos ipês','ipe'),EV('Um caramelo','cachorro',{c:'Companhia'})],
  desafio:[PL('Pista de cooper','COOPER 400 m',{tr:'plano'}),EV('Vento contra','passaros',{tr:'plano'}),EV('Corrida do caramelo','cachorro',{tr:'plano'}),EV('Ponte do lago','ponte',{tr:'plano'}),PL('Volta do lago','VOLTA DO LAGO',{tr:'plano'}),PL('Reta da alameda','RETA 300 m',{tr:'plano'}),PL('Ladeira do coreto','CORETO ↑',{tr:'sobe'}),PL('Subida do bosque','BOSQUE ↑',{tr:'sobe'}),PL('Rampa do anfiteatro','ANFITEATRO ↑',{tr:'sobe'}),PL('Morro do parquinho','MORRO ↑',{tr:'sobe'})],
  climax:[PL('Reta final','FALTAM 200 m',{k:'Reta final',tr:'plano'}),PL('Último quilômetro','ÚLTIMO KM',{k:'Último km',tr:'plano'}),PL('Chegada no coreto','CORETO 100 m',{k:'Coreto',tr:'plano'}),PL('Subida do mirante','MIRANTE 100 m',{k:'Mirante',tr:'sobe'}),PL('Topo da colina','COLINA ↑',{k:'Colina',tr:'sobe'}),PL('Alto do parque','ALTO ↑',{k:'Alto',tr:'sobe'})],
  alivio:[EV('Sombra','banco'),EV('Bebedouro','bebedouro')],
  chegada:[EV('Banco do lago','banco',{k:'Lago'}),PL('Coreto','CORETO',{k:'Coreto'}),EV('Saída do parque','portao',{k:'Saída'})]}},
{id:'orla',nome:'Orla da praia',curto:'Orla',mod:'esteira',part:null,amb:['gaivotas','passaros'],paleta:PAL_ORLA,
 climas:['limpo','limpo','nublado','chuva','vento'],
 camadas:[{t:'nuvens',f:.018,ceu:1,n:'A'},{t:'ilhas',f:.04,n:'ABC'},{t:'mar',f:.07,n:'ABC',reflexo:1},{t:'praia',f:.22,n:'A'},{t:'palmeiras',f:.5,n:'ABC'},{t:'calcadao',f:1,n:'ABC'}],
 ev:{partida:[EV('Calçadão','quiosque',{k:'Calçadão'}),PL('Posto 6','POSTO 6',{k:'Posto 6'}),PL('Píer','PÍER',{k:'Píer'})],
  exploracao:[EV('Água de coco','quiosque'),EV('Gaivotas','gaivotas'),EV('Vôlei na areia','rede')],
  desafio:[PL('Vento no píer','PÍER',{tr:'plano'}),EV('Rumo ao farol','farol',{tr:'plano'}),PL('Areia fofa','AREIA FOFA',{tr:'plano'}),EV('Bando de gaivotas','gaivotas',{tr:'plano'}),EV('Trecho sem sombra',null,{tr:'plano'}),PL('Reta do calçadão','RETA 500 m',{tr:'plano'}),PL('Ladeira do mirante','MIRANTE ↑',{tr:'sobe'}),PL('Subida da pedra','PEDRA ↑',{tr:'sobe'}),PL('Rampa do forte','FORTE ↑',{tr:'sobe'}),PL('Morro da praia','MORRO ↑',{tr:'sobe'})],
  climax:[PL('Ponta da praia','PONTA 200 m',{k:'Ponta',tr:'plano'}),EV('Farol da barra','farol',{k:'Farol',tr:'plano'}),PL('Último posto','POSTO 1',{k:'Posto 1',tr:'plano'}),PL('Pedra do mirante','MIRANTE 100 m',{k:'Pedra',tr:'sobe'}),PL('Topo do morro','MORRO ↑',{k:'Morro',tr:'sobe'}),PL('Mirante do forte','FORTE ↑',{k:'Forte',tr:'sobe'})],
  alivio:[EV('Vento a favor','gaivotas'),EV('Sombra','banco')],
  chegada:[EV('Pôr do sol','banco',{k:'Pôr do sol'}),EV('Quiosque','quiosque',{k:'Quiosque'}),PL('Fim do calçadão','FIM',{k:'Fim'})]}},
{id:'serra',nome:'Trilha na serra',curto:'Trilha',mod:'esteira',part:'polen',amb:['passaros','capivara'],paleta:PAL_SERRA,
 climas:['limpo','limpo','nublado','chuva','neblina'],
 camadas:[{t:'montanhas2',f:.03,n:'A'},{t:'montanhas',f:.06,n:'ABC'},{t:'neblina',f:.09,n:'A'},{t:'cumeeira',f:.2,n:'A'},{t:'araucarias',f:.5,n:'ABC'},{t:'trilha',f:1,n:'ABC'},{t:'samambaias',f:1.45,n:'A'}],
 ev:{partida:[PL('Início da trilha','TRILHA 5 km',{k:'Trilha'}),PL('Portal da mata','PARQUE',{k:'Portal'}),EV('Neblina baixa',null,{k:'Neblina'})],
  exploracao:[EV('Capivara','capivara'),EV('Tucano','tucano'),EV('Ponte do riacho','ponte')],
  desafio:[EV('Raízes',null,{tr:'plano'}),EV('Trilha estreita',null,{tr:'plano'}),EV('Pinguela do rio','ponte',{tr:'plano'}),EV('Barro na trilha',null,{tr:'plano'}),PL('Cascalho','CASCALHO',{tr:'plano'}),EV('Nuvem de mosquitos',null,{tr:'plano'}),PL('Subida de pedra','SUBIDA ↑',{tr:'sobe'}),PL('Cachoeira','CACHOEIRA ↑',{tr:'sobe'}),PL('Ladeira das araucárias','ARAUCÁRIAS ↑',{tr:'sobe'}),EV('Morro do tucano','tucano',{tr:'sobe'})],
  climax:[PL('Reta da trilha','FALTAM 200 m',{k:'Reta',tr:'plano'}),PL('Portal do parque','PORTAL 100 m',{k:'Portal',tr:'plano'}),EV('Ponte pênsil','ponte',{k:'Ponte',tr:'plano'}),PL('O cume','CUME 100 m',{k:'Cume',tr:'sobe'}),PL('Pico da serra','PICO ↑',{k:'Pico',tr:'sobe'}),PL('Pedra grande','PEDRA 50 m',{k:'Pedra',tr:'sobe'})],
  alivio:[EV('Trecho plano','passaros'),EV('Mirante do vale','banco')],
  chegada:[PL('Vista do alto','CUME',{k:'Vista'}),EV('Refúgio','banco',{k:'Refúgio'}),PL('Descida ao vale','VALE',{k:'Vale'})]}},
{id:'cidade',nome:'Cidade à noite',curto:'Cidade',mod:'esteira',astro:'lua',solX:.24,part:null,amb:['passaros'],paleta:PAL_CIDADE,
 climas:['limpo','limpo','chuva','neblina'],
 camadas:[{t:'estrelas',f:.004,ceu:1,n:'AB'},{t:'skyline',f:.05,n:'ABC'},{t:'predios',f:.2,n:'AB'},{t:'arvores',f:.5,n:'ABC'},{t:'calcada',f:1,n:'ABC'}],
 ev:{partida:[PL('Avenida acesa','AV. CENTRAL',{k:'Avenida'}),EV('Praça da matriz','banco',{k:'Praça'}),PL('Centro iluminado','CENTRO',{k:'Centro'})],
  exploracao:[EV('Banca de revista','banca'),EV('Gato no muro','gato'),EV('Food truck','foodtruck')],
  desafio:[EV('Sinal verde','semaforo',{p:'verde',tr:'plano'}),PL('Túnel','TÚNEL',{tr:'plano'}),EV('Atravessa a avenida','semaforo',{p:'verde',tr:'plano'}),EV('Vento entre prédios','passaros',{tr:'plano'}),PL('Calçadão do centro','CALÇADÃO 400 m',{tr:'plano'}),PL('Ônibus chegando','PONTO',{tr:'plano'}),PL('Viaduto','VIADUTO ↑',{tr:'sobe'}),PL('Rua da ladeira','LADEIRA ↑',{tr:'sobe'}),PL('Rampa da passarela','PASSARELA ↑',{tr:'sobe'}),PL('Ladeira do centro','CENTRO ↑',{tr:'sobe'})],
  climax:[PL('Ponte estaiada','PONTE 200 m',{k:'Ponte',tr:'plano'}),PL('Reta final','FALTAM 200 m',{k:'Reta final',tr:'plano'}),PL('Última quadra','ÚLTIMA QUADRA',{k:'Última quadra',tr:'plano'}),PL('Mirante da cidade','MIRANTE ↑',{k:'Mirante',tr:'sobe'}),PL('Topo do viaduto','VIADUTO ↑',{k:'Viaduto',tr:'sobe'}),PL('Alto da colina','COLINA ↑',{k:'Colina',tr:'sobe'})],
  alivio:[EV('Praça','banco'),EV('Sinal vermelho','semaforo',{p:'vermelho'})],
  chegada:[EV('Lua cheia','banco',{k:'Lua'}),EV('Lanche da noite','foodtruck',{k:'Lanche'}),PL('Fim da avenida','FIM',{k:'Fim'})]}},
/* ===== BIKE ===== */
{id:'estrada',nome:'Estrada da serra',curto:'Serra',mod:'bike',part:null,amb:['passaros','ciclista'],paleta:PAL_ESTRADA,
 climas:['limpo','limpo','nublado','neblina','chuva'],
 camadas:[{t:'montanhas2',f:.03,n:'A'},{t:'montanhas',f:.06,n:'ABC'},{t:'neblina',f:.09,n:'A'},{t:'cumeeira',f:.2,n:'A'},{t:'araucarias',f:.5,n:'ABC'},{t:'asfalto',f:1,n:'ABC'}],
 ev:{partida:[PL('Pé da serra','SERRA 12 km',{k:'Serra'}),PL('Posto de estrada','POSTO',{k:'Posto'}),PL('Saída da cidade','ESTRADA',{k:'Estrada'})],
  exploracao:[EV('Araucárias','passaros'),EV('Outro ciclista','ciclista',{c:'Companhia'}),EV('Tucano','tucano')],
  desafio:[PL('Curva fechada','CURVA ↑'),PL('Rampa','RAMPA 8%'),EV('Vento contra','passaros',{c:'Firme!'}),
   PL('Serpentina','CURVAS ↑'),EV('Ultrapassagem','ciclista',{p:'ult',c:'Acelera!'}),PL('Rampa forte','RAMPA 12%',{c:'Firme!'})],
  climax:[PL('Alto da serra','TOPO 500 m',{k:'Topo'}),PL('Último grampo','GRAMPO ↑',{k:'Grampo'}),PL('Portal do topo','TOPO',{k:'Portal'})],
  alivio:[PL('Descida','DESCIDA',{c:'Solta'}),EV('Mirante','banco')],
  chegada:[EV('Mirante do topo','banco',{k:'Mirante'}),PL('Café da serra','CAFÉ',{k:'Café'}),PL('Vista do vale','VALE',{k:'Vale'})]}},
{id:'ciclovia',nome:'Ciclovia urbana',curto:'Ciclovia',mod:'bike',part:null,amb:['passaros','ciclista'],paleta:PAL_CICLOVIA,
 climas:['limpo','limpo','nublado','chuva','vento'],
 camadas:[{t:'nuvens',f:.018,ceu:1,n:'A'},{t:'skyline',f:.05,n:'ABC',ponte:1},{t:'predios',f:.2,n:'A'},{t:'arvores',f:.5,n:'ABC'},{t:'ciclovia',f:1,n:'ABC'}],
 ev:{partida:[PL('Ciclovia','CICLOVIA',{k:'Ciclovia'}),PL('Avenida','AVENIDA',{k:'Avenida'}),PL('Margem do rio','RIO',{k:'Rio'})],
  exploracao:[EV('Banca','banca'),EV('Outro ciclista','ciclista',{c:'Companhia'}),EV('Pombos','passaros')],
  desafio:[EV('Sinal verde','semaforo',{p:'verde'}),PL('Viaduto','VIADUTO ↑'),EV('Ultrapassagem','ciclista',{p:'ult',c:'Acelera!'}),
   PL('Rampa da ponte','PONTE ↑'),EV('Pelotão','ciclista',{c:'Acompanha!'}),EV('Vento do rio','passaros',{c:'Firme!'})],
  climax:[PL('Ponte estaiada','PONTE 200 m',{k:'Ponte'}),PL('Sprint final','FALTAM 300 m',{k:'Sprint'}),PL('Subida do parque','PARQUE ↑',{k:'Parque'})],
  alivio:[EV('Sinal vermelho','semaforo',{p:'vermelho'}),EV('Praça','banco')],
  chegada:[EV('Parque da orla','banco',{k:'Parque'}),PL('Bicicletário','BIKE',{k:'Bicicletário'}),EV('Sorveteria','foodtruck',{k:'Sorvete'})]}},
{id:'campo',nome:'Estrada no campo',curto:'Campo',mod:'bike',part:null,amb:['passaros','vaca'],paleta:PAL_CAMPO,
 climas:['limpo','limpo','nublado','chuva','vento'],
 camadas:[{t:'nuvens',f:.018,ceu:1,n:'A'},{t:'colinas',f:.055,n:'ABC',semCidade:1},{t:'plantacao',f:.2,n:'A'},{t:'cerca',f:.5,n:'ABC'},{t:'terra',f:1,n:'ABC'},{t:'tufos',f:1.45,n:'A'}],
 ev:{partida:[EV('Porteira','porteira',{k:'Porteira'}),PL('Estrada de chão','FAZENDA 8 km',{k:'Fazenda'}),EV('Amanhecer no pasto','vaca',{k:'Pasto'})],
  exploracao:[EV('Vacas no pasto','vaca'),EV('Girassóis',null),EV('Moinho','moinho')],
  desafio:[PL('Morro da fazenda','MORRO ↑'),PL('Estrada de terra','TERRA',{c:'Firme!'}),EV('Contra o vento','passaros'),
   PL('Cascalho','CASCALHO',{c:'Firme!'}),PL('Subida do cafezal','CAFEZAL ↑'),EV('Boiada na estrada','vaca',{c:'Desvia!'})],
  climax:[PL('Alto do morro','TOPO 100 m',{k:'Morro'}),EV('Torre do moinho','moinho',{k:'Moinho'}),PL('Mirante do vale','MIRANTE ↑',{k:'Mirante'})],
  alivio:[EV('Ipê florido','ipe'),EV('Celeiro','celeiro')],
  chegada:[EV('Porteira de casa','porteira',{k:'Casa'}),EV('Sede da fazenda','celeiro',{k:'Sede'}),EV('Pôr do sol no pasto','vaca',{k:'Pôr do sol'})]}},
/* ===== ELÍPTICO ===== */
{id:'neve',nome:'Montanha nevada',curto:'Neve',mod:'eliptico',part:'neve',amb:['passaros','raposa'],paleta:PAL_NEVE,
 climas:['limpo','limpo','nublado','nevasca','neblina'],
 camadas:[{t:'nuvens',f:.018,ceu:1,n:'A'},{t:'montanhasNeve',f:.05,n:'ABC'},{t:'pinheirosNeve',f:.2,n:'A',esc:.45},{t:'pinheirosNeve',f:.5,n:'ABC',esc:1},{t:'neve',f:1,n:'ABC'}],
 ev:{partida:[PL('Base da montanha','TRILHA 6 km',{k:'Base'}),PL('Teleférico','TELEFÉRICO',{k:'Teleférico'}),EV('Vila nevada','cabana',{k:'Vila'})],
  exploracao:[EV('Boneco de neve','boneco'),EV('Raposa','raposa'),EV('Pegadas na neve',null)],
  desafio:[PL('Encosta','ENCOSTA ↑'),PL('Neve funda','NEVE FUNDA',{c:'Firme!'}),EV('Vento gelado','passaros'),
   PL('Rampa de gelo','GELO ↑'),EV('Raposa em fuga','raposa',{c:'Acompanha!'}),PL('Trilha íngreme','ÍNGREME ↑')],
  climax:[PL('Crista','CRISTA 100 m',{k:'Crista'}),PL('Cume nevado','CUME ↑',{k:'Cume'}),EV('Bandeira do topo','bandeira',{k:'Bandeira'})],
  alivio:[EV('Pinhal',null),EV('Chocolate quente','cabana')],
  chegada:[EV('Refúgio','cabana',{k:'Refúgio'}),EV('Lareira','cabana',{k:'Lareira'}),EV('Boneco no fim','boneco',{k:'Boneco'})]}},
{id:'aurora',nome:'Aurora no gelo',curto:'Aurora',mod:'eliptico',astro:'lua',solX:.24,aurora:1,part:'neve',amb:['coruja'],paleta:PAL_AURORA,
 climas:['limpo','limpo','nevasca'],
 camadas:[{t:'estrelas',f:.004,ceu:1,n:'ABC'},{t:'montanhasNeve',f:.05,n:'ABC'},{t:'pinheirosNeve',f:.2,n:'A',esc:.45},{t:'pinheirosNeve',f:.5,n:'ABC',esc:1},{t:'neve',f:1,n:'ABC'}],
 ev:{partida:[PL('Noite gelada','TRILHA',{k:'Noite'}),EV('Acampamento','fogueira',{k:'Acampamento'}),PL('Lago escuro','LAGO',{k:'Lago'})],
  exploracao:[EV('Iglu','iglu'),EV('Coruja','coruja'),EV('Céu estrelado',null)],
  desafio:[EV('A aurora chegou',null),PL('Lago congelado','LAGO ↑'),EV('Vento polar',null,{c:'Firme!'}),
   PL('Colina de gelo','GELO ↑'),EV('Rastro da raposa','raposa',{c:'Acompanha!'}),EV('Aurora dançando',null,{c:'Acelera!'})],
  climax:[EV('Aurora no máximo',null,{k:'Aurora'}),EV('Estrela cadente',null,{k:'Estrela'}),PL('Topo da colina','TOPO ↑',{k:'Topo'})],
  alivio:[EV('Fogueira','fogueira'),EV('Silêncio',null)],
  chegada:[EV('Iglu','iglu',{k:'Iglu'}),EV('Fogueira acesa','fogueira',{k:'Fogueira'}),EV('Céu de estrelas',null,{k:'Estrelas'})]}},
{id:'dunas',nome:'Dunas dos Lençóis',curto:'Dunas',mod:'eliptico',part:null,amb:['passaros','buggy'],paleta:PAL_DUNAS,
 climas:['limpo','limpo','areia','nublado'],
 camadas:[{t:'nuvens',f:.018,ceu:1,n:'A'},{t:'dunas',f:.05,n:'ABC'},{t:'lagoas',f:.2,n:'AB'},{t:'dunasPerto',f:.5,n:'ABC'},{t:'areia',f:1,n:'ABC'}],
 ev:{partida:[PL('Entrada do parque','LENÇÓIS',{k:'Lençóis'}),EV('Primeira lagoa',null,{k:'Lagoa'}),EV('Trilha do buggy','buggy',{k:'Buggy'})],
  exploracao:[EV('Lagoa azul',null),EV('Garça','garca'),EV('Buggy','buggy')],
  desafio:[PL('Duna alta','DUNA ↑'),PL('Areia fofa','AREIA FOFA',{c:'Firme!'}),EV('Vento de areia',null),
   PL('Crista da duna','CRISTA ↑'),EV('Buggy apostando','buggy',{c:'Acelera!'}),EV('Sol a pino',null,{c:'Firme!'})],
  climax:[PL('Topo da duna','TOPO 50 m',{k:'Topo'}),PL('Duna gigante','DUNA ↑',{k:'Duna'}),PL('Mirante do pôr do sol','MIRANTE ↑',{k:'Mirante'})],
  alivio:[EV('Lagoa verde',null),EV('Descida da duna',null,{c:'Solta'})],
  chegada:[PL('Pôr do sol','MIRANTE',{k:'Pôr do sol'}),EV('Mergulho na lagoa',null,{k:'Lagoa'}),PL('Vila de pescadores','VILA',{k:'Vila'})]}},
/* ===== ESCADA (sobe na vertical) ===== */
{id:'predio',nome:'Arranha-céu',curto:'Prédio',mod:'escada',eixo:'y',solX:.2,colX:.6,andares:40,part:null,amb:['pombo','passaros'],paleta:PAL_PREDIO,
 climas:['limpo','limpo','nublado','chuva','neblina','vento'],
 camadas:[{t:'skylineBaixo',n:'ABC'},{t:'nuvensV',f:.07,n:'A'},{t:'torresLonge',f:.16,n:'A'},{t:'torreViz',f:.45,n:'AB'},{t:'fachada',f:1,n:'ABC'}],
 ev:{partida:[PL('Térreo','ANDAR {andar}',{k:'Térreo'}),PL('Portaria','PORTARIA',{k:'Portaria'}),PL('Escada de incêndio','SAÍDA ↑',{k:'Escada'})],
  exploracao:[EV('Pombos','pombo'),EV('Limpador de vidros','limpador'),EV('Varanda','vaso')],
  desafio:[PL('Lance rápido','ANDAR {andar}'),PL('Andar alto','ANDAR {andar}',{c:'Acelera!'}),EV('Vento no alto','passaros',{c:'Firme!'}),
   PL('Meio do prédio','ANDAR {andar}'),EV('Varandas acesas','vaso'),EV('Andaime','limpador',{c:'Firme!'})],
  climax:[PL('Último lance','ANDAR {andar}',{k:'Andar 40'}),PL('Cobertura','COBERTURA ↑',{k:'Cobertura'}),PL('Porta do terraço','TERRAÇO ↑',{k:'Terraço'})],
  alivio:[EV('Patamar','pombo'),EV('Vista da cidade',null)],
  chegada:[EV('Heliponto','heliponto',{k:'Heliponto'}),EV('Terraço','heliponto',{k:'Terraço'}),PL('Topo','TOPO',{k:'Topo'})]}},
{id:'farol',nome:'Farol',curto:'Farol',mod:'escada',eixo:'y',solX:.2,colX:.76,degraus:300,part:null,amb:['gaivotas','passaros'],paleta:PAL_ORLA,
 climas:['limpo','limpo','nublado','chuva','vento'],
 camadas:[{t:'marBaixo',n:'ABC'},{t:'nuvensV',f:.07,n:'A'},{t:'torreFarol',f:1,n:'ABC'}],
 ev:{partida:[PL('Porta do farol','DEGRAU {degrau}',{k:'Porta'}),PL('Rochedo','FAROL',{k:'Rochedo'}),PL('Base da torre','DEGRAU {degrau}',{k:'Base'})],
  exploracao:[EV('Gaivotas','gaivotas'),EV('Janela redonda',null),EV('Veleiro',null)],
  desafio:[PL('Espiral','DEGRAU {degrau}'),EV('Vento do mar','gaivotas',{c:'Firme!'}),PL('Meio do farol','DEGRAU {degrau}',{c:'Acelera!'}),
   PL('Degraus estreitos','DEGRAU {degrau}',{c:'Firme!'}),EV('Bando de gaivotas','gaivotas',{c:'Acompanha!'}),EV('Maresia',null)],
  climax:[PL('Rumo à lanterna','DEGRAU {degrau}',{k:'Lanterna'}),PL('Último giro','LANTERNA ↑',{k:'Último giro'}),PL('Galeria do topo','GALERIA ↑',{k:'Galeria'})],
  alivio:[EV('Patamar',null),EV('Brisa','gaivotas')],
  chegada:[EV('A lanterna','lanterna',{k:'Topo'}),EV('Luz acesa','lanterna',{k:'Luz'}),EV('Vista do mar',null,{k:'Mar'})]}},
{id:'escadaria',nome:'Escadaria da montanha',curto:'Montanha',mod:'escada',eixo:'y',solX:.2,colX:.7,degraus:600,part:null,amb:['passaros','cabra'],paleta:PAL_ESCADARIA,
 climas:['limpo','limpo','neblina','nublado','vento'],
 camadas:[{t:'valeBaixo',n:'ABC'},{t:'nuvensV',f:.07,n:'A'},{t:'encostaV',f:.45,n:'AB'},{t:'penhasco',f:1,n:'ABC'}],
 ev:{partida:[PL('Primeiro degrau','DEGRAU {degrau}',{k:'Base'}),PL('Portal de pedra','TRILHA',{k:'Portal'}),PL('Pé da montanha','DEGRAU {degrau}',{k:'Pé da montanha'})],
  exploracao:[EV('Cabra na pedra','cabra'),EV('Bromélias',null),EV('Nuvens abaixo',null)],
  desafio:[PL('Paredão','DEGRAU {degrau}'),PL('Degraus altos','DEGRAU {degrau}',{c:'Firme!'}),EV('Vento na encosta','passaros',{c:'Acelera!'}),
   PL('Lance íngreme','DEGRAU {degrau}'),EV('Cabra saltando','cabra',{c:'Acompanha!'}),EV('Acima das nuvens',null)],
  climax:[PL('Rumo ao cume','CUME ↑',{k:'Cume'}),PL('Últimos degraus','DEGRAU {degrau}',{k:'Últimos degraus'}),PL('Crista de pedra','CRISTA ↑',{k:'Crista'})],
  alivio:[EV('Platô',null),EV('Mirante','banco')],
  chegada:[EV('O cume','bandeira',{k:'Bandeira'}),EV('Mirante do topo','banco',{k:'Mirante'}),EV('Vista do vale',null,{k:'Vale'})]}}
];
const PARADAS=[0,.34,.68,1];
function paletaEm(cen,p){
  p=clamp(p,0,1);let i=0;while(i<2&&p>PARADAS[i+1])i++;
  const t=(p-PARADAS[i])/(PARADAS[i+1]-PARADAS[i]);
  const A=Object.assign({},COMUM[i],cen.paleta[i]),B=Object.assign({},COMUM[i+1],cen.paleta[i+1]);
  const o={};for(const k in A){o[k]=typeof A[k]==='number'?lerp(A[k],B[k],t):misturar(A[k],B[k]||A[k],t);}
  o.sil=misturar(o.perto,'#05080a',.3);
  o.caramelo2=misturar(o.caramelo,'#000000',.3);
  o.flor2=misturar(o.flor,o.perto,.45);
  o.longe2=misturar(o.longe,o.c3,.45);
  o.escada=misturar(o.perto,o.claro,.4);
  /* clima por cima do horário */
  const cl=CLIMAS[plano&&plano.clima]||CLIMAS.limpo,noite=cen.astro==='lua';
  if(cl.ceu){const alvo=noite?misturar(cl.ceu[0],'#0a0d14',.65):cl.ceu[0];for(const k of ['c1','c2','c3','nuvem'])o[k]=misturar(o[k],alvo,cl.ceu[1]);}
  if(noite){o.flor=misturar(o.flor,o.perto,.72);o.flor2=misturar(o.flor2,o.perto,.72);}
  if(cl.terra)for(const k of ['longe','longe2','meio','perto','chao','caminho','detalhe','frente','mar','sil','flor','flor2'])if(o[k])o[k]=misturar(o[k],'#0b1014',cl.terra);
  if(cl.nevoa){const nv=noite?'#4a5266':'#c3ccd1';o.longe=misturar(o.longe,nv,cl.nevoa);o.longe2=misturar(o.longe2,nv,Math.min(1,cl.nevoa*1.2));o.meio=misturar(o.meio,nv,cl.nevoa*.6);o.perto=misturar(o.perto,nv,cl.nevoa*.22);}
  if(cl.luz)o.luz=Math.min(1,o.luz+cl.luz);
  if(cl.estrela!=null)o.estrela*=cl.estrela;
  o.solA=cl.sol==null?1:cl.sol;
  return o;
}

/* sorteio: semente → cenário da máquina + um evento por bloco, sem repetir dentro da sessão */
function gerarPlano(seed,cenId){
  const rng=rngDe(seed);
  const pool=CENARIOS.filter(c=>c.mod===modAtual);
  const sorteado=pool[Math.floor(rng()*pool.length)];
  const cen=cenId?CENARIOS.find(c=>c.id===cenId):sorteado;
  const pap=papeis(BL),sacos={};
  const exP=EXERCICIOS[exAtual]||{},filtro=e=>cen.mod!=='esteira'||!e.tr||(exP.incl?e.tr==='sobe':e.tr!=='sobe');
  const eventos=pap.map(p=>{if(!sacos[p]||!sacos[p].length)sacos[p]=embaralhar(rng,cen.ev[p].filter(filtro));return sacos[p].shift();});
  const cls=cen.climas||['limpo'],clima=cls[Math.floor(rng()*cls.length)];
  return {seed,cen,papeis:pap,eventos,clima};
}
function textoPlaca(p,i){
  if(!p)return p;const prog=INI[i]/TOTAL,c=plano.cen;
  return p.replace('{andar}',String(Math.max(1,Math.round(prog*(c.andares||40))))).replace('{degrau}',String(Math.max(1,Math.round(prog*(c.degraus||300)))));
}
/* frases-motivo (planilha aprovada v1): [sobe, mantém] para exploração/desafio; texto único nos demais */
const MOTIVOS={"parque|partida|Portão do parque":"Começa leve, o parque acabou de abrir","parque|partida|Pista do lago":"Aquece no passo, a volta é longa","parque|partida|Bosque":"Passo leve pra ouvir os pássaros","parque|exploracao|Lago das garças":{"anda":["Aperta o passo, garças voando","No ritmo, sem assustar as garças"],"trote":["Acelera um pouco, garças voando","No ritmo, sem assustar as garças"],"incl":["Inclina um pouco, rumo ao lago","No ritmo, sem assustar as garças"]},"parque|exploracao|Alameda dos ipês":{"anda":["Aperta o passo sob os ipês","Mantém e curte os ipês"],"trote":["Acelera um pouco sob os ipês","Mantém e curte os ipês"],"incl":["Inclina um pouco na alameda","Mantém e curte os ipês"]},"parque|exploracao|Um caramelo":{"anda":["Aperta o passo, ele quer brincar","Mesmo ritmo, ele tá te seguindo"],"trote":["Acelera um pouco, ele quer brincar","Mesmo ritmo, ele tá te seguindo"],"incl":["Inclina um pouco, ele te segue","Mesmo ritmo, ele tá te seguindo"]},"parque|alivio|Sombra":"Reduz e aproveita a sombra","parque|alivio|Bebedouro":"Diminui, solta os ombros e respira","parque|chegada|Banco do lago":"Desacelera, o banco é seu","parque|chegada|Coreto":"Diminui o passo, chegou no coreto","parque|chegada|Saída do parque":"Desacelera, missão cumprida","orla|partida|Calçadão":"Começa leve, sente a brisa","orla|partida|Posto 6":"Aquece no passo até o próximo posto","orla|partida|Píer":"Passo leve, o mar tá calmo","orla|exploracao|Água de coco":{"anda":["Aperta o passo, o coco espera","No ritmo, o coco espera"],"trote":["Acelera um pouco, o coco espera","No ritmo, o coco espera"],"incl":["Inclina um pouco, o coco espera","No ritmo, o coco espera"]},"orla|exploracao|Gaivotas":{"anda":["Aperta o passo, acompanha o voo","Mesmo ritmo das gaivotas"],"trote":["Acelera um pouco com elas","Mesmo ritmo das gaivotas"],"incl":["Inclina um pouco, gaivotas acima","Mesmo ritmo das gaivotas"]},"orla|exploracao|Vôlei na areia":{"anda":["Aperta o passo, a bola vem!","No ritmo, o jogo tá bom"],"trote":["Acelera um pouco, a bola vem!","No ritmo, o jogo tá bom"],"incl":["Inclina um pouco, jogo rolando","No ritmo, o jogo tá bom"]},"orla|alivio|Vento a favor":"Reduz e deixa o vento empurrar","orla|alivio|Sombra":"Diminui e aproveita a sombra","orla|chegada|Pôr do sol":"Desacelera pra ver o sol sumir","orla|chegada|Quiosque":"Diminui, o coco é seu","orla|chegada|Fim do calçadão":"Desacelera, você chegou","serra|partida|Início da trilha":"Começa leve, a trilha é longa","serra|partida|Portal da mata":"Passo leve pra entrar na mata","serra|partida|Neblina baixa":"Aquece devagar, a neblina tá baixa","serra|exploracao|Capivara":{"anda":["Aperta o passo, ela tá olhando","No ritmo, ela é tranquila"],"trote":["Acelera um pouco, ela olha","No ritmo, ela é tranquila"],"incl":["Inclina um pouco, ela olha","No ritmo, ela é tranquila"]},"serra|exploracao|Tucano":{"anda":["Aperta o passo, tucano à vista","Mesmo ritmo, ele tá no galho"],"trote":["Acelera um pouco, tucano à vista","Mesmo ritmo, ele tá no galho"],"incl":["Inclina um pouco, tucano à vista","Mesmo ritmo, ele tá no galho"]},"serra|exploracao|Ponte do riacho":{"anda":["Aperta o passo na ponte","No ritmo pra atravessar o riacho"],"trote":["Acelera um pouco na ponte","No ritmo pra atravessar o riacho"],"incl":["Inclina um pouco depois da ponte","No ritmo pra atravessar o riacho"]},"serra|alivio|Trecho plano":"Reduz, o chão ficou plano","serra|alivio|Mirante do vale":"Diminui e olha o vale","serra|chegada|Vista do alto":"Desacelera e curte a vista","serra|chegada|Refúgio":"Diminui, o refúgio chegou","serra|chegada|Descida ao vale":"Desacelera na descida pro vale","cidade|partida|Avenida acesa":"Começa leve, a avenida é sua","cidade|partida|Praça da matriz":"Aquece na praça, sem pressa","cidade|partida|Centro iluminado":"Passo leve sob as luzes","cidade|exploracao|Banca de revista":{"anda":["Aperta o passo, a banca fecha","No ritmo, olha as capas"],"trote":["Acelera um pouco, banca fechando","No ritmo, olha as capas"],"incl":["Inclina um pouco, a rua sobe","No ritmo, olha as capas"]},"cidade|exploracao|Gato no muro":{"anda":["Aperta o passo, ele vai pular!","Passo firme, ele tá de olho"],"trote":["Acelera um pouco, ele vai pular!","Passo firme, ele tá de olho"],"incl":["Inclina um pouco, ele vai pular!","Passo firme, ele tá de olho"]},"cidade|exploracao|Food truck":{"anda":["Aperta o passo, a fila cresceu","No ritmo, o lanche é depois"],"trote":["Acelera um pouco, a fila cresceu","No ritmo, o lanche é depois"],"incl":["Inclina um pouco, lanche no alto","No ritmo, o lanche é depois"]},"cidade|alivio|Praça":"Reduz e respira na praça","cidade|alivio|Sinal vermelho":"Reduz e espera abrir","cidade|chegada|Lua cheia":"Desacelera e olha pra lua","cidade|chegada|Lanche da noite":"Diminui, o lanche é seu","cidade|chegada|Fim da avenida":"Desacelera, a cidade é sua","estrada|partida|Pé da serra":"Pedale leve, a serra começa aqui","estrada|partida|Posto de estrada":"Pedale leve até a estrada","estrada|partida|Saída da cidade":"Pedale leve, deixa a cidade pra trás","estrada|exploracao|Araucárias":["Pedale mais, a estrada abriu","Mesmo ritmo entre as araucárias"],"estrada|exploracao|Outro ciclista":["Pedale mais e cola nele","Mesmo ritmo, ele tá do lado"],"estrada|exploracao|Tucano":["Pedale mais pra ver o tucano","Mesmo ritmo, ele tá no galho"],"estrada|desafio|Curva fechada":["Pedale forte na curva!","Segura na curva!"],"estrada|desafio|Rampa":["Pedale forte, rampa!","Segura, a rampa continua"],"estrada|desafio|Vento contra":["Força contra o vento!","Firme, vento contra"],"estrada|desafio|Serpentina":["Pedale forte nas curvas!","Segura, mais curvas"],"estrada|desafio|Ultrapassagem":["Pedale forte e passa!","Segura, ele tá atrás"],"estrada|desafio|Rampa forte":["Força, 12% de rampa!","Firme, rampa de 12%"],"estrada|climax|Alto da serra":"Sprint até o topo!","estrada|climax|Último grampo":"Tudo no último grampo!","estrada|climax|Portal do topo":"Sprint até o portal!","estrada|alivio|Descida":"Alivia, deixa a bike rolar","estrada|alivio|Mirante":"Reduz o ritmo e olha o vale","estrada|chegada|Mirante do topo":"Desacelera e curte o mirante","estrada|chegada|Café da serra":"Reduz o ritmo, o café é seu","estrada|chegada|Vista do vale":"Pedale leve e olha o vale","ciclovia|partida|Ciclovia":"Pedale leve, a ciclovia é sua","ciclovia|partida|Avenida":"Pedale leve pela avenida","ciclovia|partida|Margem do rio":"Pedale leve na beira do rio","ciclovia|exploracao|Banca":["Pedale mais, passa a banca","Mesmo ritmo, olha as capas"],"ciclovia|exploracao|Outro ciclista":["Pedale mais e cola nele","Mesmo ritmo, pedalem juntos"],"ciclovia|exploracao|Pombos":["Pedale mais, os pombos voaram","Mesmo ritmo, sem assustar os pombos"],"ciclovia|desafio|Sinal verde":["Pedale, antes de fechar!","Segura, ainda tá verde"],"ciclovia|desafio|Viaduto":["Pedale forte no viaduto!","Segura até o topo"],"ciclovia|desafio|Ultrapassagem":["Pedale forte e passa!","Segura, ele tá atrás"],"ciclovia|desafio|Rampa da ponte":["Força na rampa!","Segura, ainda é rampa"],"ciclovia|desafio|Pelotão":["Acompanha o pelotão!","Não solta do pelotão!"],"ciclovia|desafio|Vento do rio":["Força contra o vento!","Firme, o vento continua"],"ciclovia|climax|Ponte estaiada":"Sprint pela ponte!","ciclovia|climax|Sprint final":"Sprint! Só 300 metros","ciclovia|climax|Subida do parque":"Tudo até o parque!","ciclovia|alivio|Sinal vermelho":"Reduz e espera abrir","ciclovia|alivio|Praça":"Reduz o ritmo e respira","ciclovia|chegada|Parque da orla":"Desacelera, chegou no parque","ciclovia|chegada|Bicicletário":"Pedale leve até estacionar","ciclovia|chegada|Sorveteria":"Reduz, o sorvete é seu","campo|partida|Porteira":"Pedale leve, abre a porteira","campo|partida|Estrada de chão":"Pedale leve, a fazenda tá longe","campo|partida|Amanhecer no pasto":"Pedale leve com o sol nascendo","campo|exploracao|Vacas no pasto":["Pedale mais, as vacas te olham","Mesmo ritmo, elas nem ligam"],"campo|exploracao|Girassóis":["Pedale mais entre os girassóis","Mesmo ritmo, curte o amarelo"],"campo|exploracao|Moinho":["Pedale mais, rápido como o moinho","Mesmo ritmo, igual ao moinho"],"campo|desafio|Morro da fazenda":["Pedale forte no morro!","Segura, o morro continua"],"campo|desafio|Estrada de terra":["Firme na terra!","Segura, ainda é terra"],"campo|desafio|Contra o vento":["Força contra o vento!","Firme, vento contra"],"campo|desafio|Cascalho":["Firme no cascalho!","Segura no cascalho"],"campo|desafio|Subida do cafezal":["Pedale forte no cafezal!","Segura até o topo"],"campo|desafio|Boiada na estrada":["Acelera, desvia da boiada!","Segura e desvia!"],"campo|climax|Alto do morro":"Sprint até o topo!","campo|climax|Torre do moinho":"Tudo até o moinho!","campo|climax|Mirante do vale":"Tudo até o mirante!","campo|alivio|Ipê florido":"Reduz e olha o ipê","campo|alivio|Celeiro":"Reduz o ritmo, chegou no celeiro","campo|chegada|Porteira de casa":"Desacelera, chegou em casa","campo|chegada|Sede da fazenda":"Reduz o ritmo, a sede é ali","campo|chegada|Pôr do sol no pasto":"Pedale leve pra ver o sol sumir","neve|partida|Base da montanha":"Começa leve, a montanha espera","neve|partida|Teleférico":"Aquece enquanto o teleférico sobe","neve|partida|Vila nevada":"Ritmo leve pela vila","neve|exploracao|Boneco de neve":["Acelera um pouco, passa o boneco","No ritmo, dá tchau pro boneco"],"neve|exploracao|Raposa":["Acelera um pouco, ela é rápida","No ritmo, sem assustar a raposa"],"neve|exploracao|Pegadas na neve":["Acelera e segue as pegadas","No ritmo, segue as pegadas"],"neve|desafio|Encosta":["Empurra forte na encosta!","Segura, ainda é encosta"],"neve|desafio|Neve funda":["Firme na neve funda!","Segura, a neve continua"],"neve|desafio|Vento gelado":["Força contra o vento!","Firme, vento gelado"],"neve|desafio|Rampa de gelo":["Acelera na rampa!","Segura no gelo"],"neve|desafio|Raposa em fuga":["Acelera, ela é rápida!","Não perde ela!"],"neve|desafio|Trilha íngreme":["Empurra forte, íngreme!","Segura, ainda é íngreme"],"neve|climax|Crista":"Tudo até a crista!","neve|climax|Cume nevado":"Tudo até o cume!","neve|climax|Bandeira do topo":"Tudo até a bandeira!","neve|alivio|Pinhal":"Reduz entre os pinheiros","neve|alivio|Chocolate quente":"Diminui, o chocolate tá quente","neve|chegada|Refúgio":"Desacelera, o refúgio é seu","neve|chegada|Lareira":"Diminui e chega na lareira","neve|chegada|Boneco no fim":"Desacelera, o boneco te espera","aurora|partida|Noite gelada":"Começa leve, a noite é longa","aurora|partida|Acampamento":"Aquece perto do fogo","aurora|partida|Lago escuro":"Ritmo leve na beira do lago","aurora|exploracao|Iglu":["Acelera um pouco até o iglu","No ritmo, o iglu é ali"],"aurora|exploracao|Coruja":["Acelera um pouco, ela te vê","No ritmo, a coruja te observa"],"aurora|exploracao|Céu estrelado":["Acelera sob as estrelas","No ritmo e olha pra cima"],"aurora|desafio|A aurora chegou":["Acelera, a aurora chegou!","Segura, ela tá dançando"],"aurora|desafio|Lago congelado":["Acelera firme no gelo!","Segura, ainda é gelo"],"aurora|desafio|Vento polar":["Força contra o vento!","Firme, vento polar"],"aurora|desafio|Colina de gelo":["Empurra forte na colina!","Segura, ainda é colina"],"aurora|desafio|Rastro da raposa":["Segue o rastro, acelera!","Não perde o rastro!"],"aurora|desafio|Aurora dançando":["Acelera no ritmo dela!","Segura junto com ela!"],"aurora|climax|Aurora no máximo":"Tudo! O céu acendeu","aurora|climax|Estrela cadente":"Tudo! Faz um pedido","aurora|climax|Topo da colina":"Tudo até o topo!","aurora|alivio|Fogueira":"Reduz e aquece as mãos","aurora|alivio|Silêncio":"Diminui e escuta o silêncio","aurora|chegada|Iglu":"Desacelera, o iglu é seu","aurora|chegada|Fogueira acesa":"Diminui e chega no fogo","aurora|chegada|Céu de estrelas":"Desacelera e olha o céu","dunas|partida|Entrada do parque":"Começa leve, as dunas te esperam","dunas|partida|Primeira lagoa":"Ritmo leve até a lagoa","dunas|partida|Trilha do buggy":"Aquece na trilha do buggy","dunas|exploracao|Lagoa azul":["Acelera um pouco até a lagoa","No ritmo, a lagoa é ali"],"dunas|exploracao|Garça":["Acelera um pouco, garça voando","No ritmo, sem assustar a garça"],"dunas|exploracao|Buggy":["Acelera, o buggy passou!","No ritmo, deixa ele passar"],"dunas|desafio|Duna alta":["Empurra forte na duna!","Segura, ainda é duna"],"dunas|desafio|Areia fofa":["Firme na areia fofa!","Segura, ainda é areia"],"dunas|desafio|Vento de areia":["Força contra o vento!","Firme, vento de areia"],"dunas|desafio|Crista da duna":["Acelera até a crista!","Segura na crista"],"dunas|desafio|Buggy apostando":["Acelera, ganha do buggy!","Não deixa ele passar!"],"dunas|desafio|Sol a pino":["Firme, mesmo no sol!","Segura no sol forte"],"dunas|climax|Topo da duna":"Tudo até o topo!","dunas|climax|Duna gigante":"Tudo na duna gigante!","dunas|climax|Mirante do pôr do sol":"Tudo até o mirante!","dunas|alivio|Lagoa verde":"Reduz e olha a lagoa","dunas|alivio|Descida da duna":"Alivia na descida da duna","dunas|chegada|Pôr do sol":"Desacelera pra ver o sol sumir","dunas|chegada|Mergulho na lagoa":"Diminui, a lagoa te espera","dunas|chegada|Vila de pescadores":"Desacelera, chegou na vila","predio|partida|Térreo":"Começa leve, são 40 andares","predio|partida|Portaria":"Ritmo leve, passa a portaria","predio|partida|Escada de incêndio":"Aquece nos primeiros degraus","predio|exploracao|Pombos":["Acelera um pouco, pombos voando","No ritmo, os pombos te olham"],"predio|exploracao|Limpador de vidros":["Acelera um pouco e acena!","No ritmo, ele tá trabalhando"],"predio|exploracao|Varanda":["Acelera um pouco, mais varandas","No ritmo, olha as plantas"],"predio|desafio|Lance rápido":["Sobe rápido esse lance!","Segura mais um lance"],"predio|desafio|Andar alto":["Acelera, andar alto!","Segura, ainda falta"],"predio|desafio|Vento no alto":["Força, o vento bateu!","Firme, o vento continua"],"predio|desafio|Meio do prédio":["Acelera, meio do prédio!","Segura, passou da metade"],"predio|desafio|Varandas acesas":["Sobe forte, luzes acesas!","Segura entre as varandas"],"predio|desafio|Andaime":["Firme, sobe o andaime!","Segura no andaime"],"predio|climax|Último lance":"Tudo! Último lance","predio|climax|Cobertura":"Tudo até a cobertura!","predio|climax|Porta do terraço":"Tudo até o terraço!","predio|alivio|Patamar":"Reduz no patamar e respira","predio|alivio|Vista da cidade":"Diminui e olha a cidade","predio|chegada|Heliponto":"Desacelera, você está no topo","predio|chegada|Terraço":"Diminui e curte o terraço","predio|chegada|Topo":"Desacelera, 40 andares feitos","farol|partida|Porta do farol":"Começa leve, são 300 degraus","farol|partida|Rochedo":"Ritmo leve até a torre","farol|partida|Base da torre":"Aquece nos primeiros degraus","farol|exploracao|Gaivotas":["Acelera um pouco com as gaivotas","No ritmo das gaivotas"],"farol|exploracao|Janela redonda":["Acelera um pouco até a janela","No ritmo, espia o mar"],"farol|exploracao|Veleiro":["Acelera um pouco, veleiro passando","No ritmo, olha o veleiro"],"farol|desafio|Espiral":["Sobe forte a espiral!","Segura na espiral"],"farol|desafio|Vento do mar":["Força, o vento bateu!","Firme, vento do mar"],"farol|desafio|Meio do farol":["Acelera, metade feita!","Segura, passou da metade"],"farol|desafio|Degraus estreitos":["Firme e rápido aqui!","Segura, ainda é estreito"],"farol|desafio|Bando de gaivotas":["Sobe com elas!","Não deixa elas fugirem!"],"farol|desafio|Maresia":["Força, vento do mar!","Firme, vento salgado"],"farol|climax|Rumo à lanterna":"Tudo até a lanterna!","farol|climax|Último giro":"Tudo! Luz logo ali","farol|climax|Galeria do topo":"Tudo até a galeria!","farol|alivio|Patamar":"Reduz no patamar e respira","farol|alivio|Brisa":"Diminui e sente a brisa","farol|chegada|A lanterna":"Desacelera, você acendeu o farol","farol|chegada|Luz acesa":"Diminui, a luz é sua","farol|chegada|Vista do mar":"Desacelera e olha o mar","escadaria|partida|Primeiro degrau":"Começa leve, são 600 degraus","escadaria|partida|Portal de pedra":"Ritmo leve pelo portal","escadaria|partida|Pé da montanha":"Aquece nos primeiros degraus","escadaria|exploracao|Cabra na pedra":["Acelera um pouco, a cabra subiu","No ritmo, ela te observa"],"escadaria|exploracao|Bromélias":["Acelera um pouco entre as bromélias","No ritmo, curte as bromélias"],"escadaria|exploracao|Nuvens abaixo":["Acelera um pouco, acima das nuvens","No ritmo, nuvens lá embaixo"],"escadaria|desafio|Paredão":["Sobe forte o paredão!","Segura no paredão"],"escadaria|desafio|Degraus altos":["Firme, degraus altos!","Segura, ainda são altos"],"escadaria|desafio|Vento na encosta":["Força contra o vento!","Firme, vento na encosta"],"escadaria|desafio|Lance íngreme":["Sobe forte, íngreme!","Segura, ainda é íngreme"],"escadaria|desafio|Cabra saltando":["Sobe com a cabra!","Não perde a cabra!"],"escadaria|desafio|Acima das nuvens":["Acelera acima das nuvens!","Segura acima das nuvens"],"escadaria|climax|Rumo ao cume":"Tudo até o cume!","escadaria|climax|Últimos degraus":"Tudo! Últimos degraus","escadaria|climax|Crista de pedra":"Tudo até a crista!","escadaria|alivio|Platô":"Reduz no platô e respira","escadaria|alivio|Mirante":"Diminui e olha o vale","escadaria|chegada|O cume":"Desacelera, a bandeira é sua","escadaria|chegada|Mirante do topo":"Diminui e curte o mirante","escadaria|chegada|Vista do vale":"Desacelera e olha o vale","parque|desafio|Pista de cooper":{"anda":["Passo rápido na reta!","Segura até a curva"],"trote":["Acelera, é a reta!","Segura até a curva"]},"parque|desafio|Vento contra":{"anda":["Passo firme no vento!","Firme, o vento continua"],"trote":["Força contra o vento!","Firme, o vento continua"]},"parque|desafio|Corrida do caramelo":{"anda":["Acelera o passo, caramelo!","Não deixa ele passar!"],"trote":["Corre, ele tá ganhando!","Não deixa ele passar!"]},"parque|desafio|Ponte do lago":{"anda":["Passo rápido na ponte!","Segura até atravessar"],"trote":["Acelera na ponte!","Segura até atravessar"]},"parque|desafio|Volta do lago":{"anda":["Passo rápido, volta inteira!","Segura a volta toda"],"trote":["Acelera, volta inteira!","Segura a volta toda"]},"parque|desafio|Reta da alameda":{"anda":["Passo rápido, reta longa!","Segura até o fim"],"trote":["Solta a passada, reta!","Segura até o fim"]},"parque|desafio|Ladeira do coreto":{"incl":["Sobe a ladeira, firme!","Segura até o coreto"]},"parque|desafio|Subida do bosque":{"incl":["Sobe forte no bosque!","Segura, ainda é subida"]},"parque|desafio|Rampa do anfiteatro":{"incl":["Encara a rampa, sobe!","Segura, ainda é rampa"]},"parque|desafio|Morro do parquinho":{"incl":["Sobe o morro, firme!","Segura, morro continua"]},"parque|climax|Reta final":{"anda":"Passo máximo, 200 metros!","trote":"Tudo! Só 200 metros"},"parque|climax|Último quilômetro":{"anda":"Passo máximo, último km!","trote":"Tudo no último km!"},"parque|climax|Chegada no coreto":{"anda":"Passo máximo, coreto ali!","trote":"Sprint até o coreto!"},"parque|climax|Subida do mirante":{"incl":"Tudo até o mirante!"},"parque|climax|Topo da colina":{"incl":"Tudo! Topo à vista"},"parque|climax|Alto do parque":{"incl":"Última subida, tudo!"},"orla|desafio|Vento no píer":{"anda":["Passo firme no vento!","Firme, o vento continua"],"trote":["Força contra o vento!","Firme, o vento continua"]},"orla|desafio|Rumo ao farol":{"anda":["Acelera o passo, farol!","Segura até o farol"],"trote":["Acelera rumo ao farol!","Segura até o farol"]},"orla|desafio|Areia fofa":{"anda":["Passo firme na areia!","Firme, ainda é areia"],"trote":["Empurra forte na areia!","Firme, ainda é areia"]},"orla|desafio|Bando de gaivotas":{"anda":["Acelera o passo, gaivotas!","Não deixa elas fugirem!"],"trote":["Corre com elas!","Não deixa elas fugirem!"]},"orla|desafio|Trecho sem sombra":{"anda":["Passo rápido, sombra perto!","Segura, sombra logo ali"],"trote":["Acelera até a sombra!","Segura, sombra logo ali"]},"orla|desafio|Reta do calçadão":{"anda":["Passo rápido na reta!","Segura até o posto"],"trote":["Solta a passada, reta!","Segura até o posto"]},"orla|desafio|Ladeira do mirante":{"incl":["Sobe a ladeira, forte!","Segura, a ladeira continua"]},"orla|desafio|Subida da pedra":{"incl":["Sobe firme na pedra!","Segura, ainda é pedra"]},"orla|desafio|Rampa do forte":{"incl":["Sobe a rampa, firme!","Segura até o forte"]},"orla|desafio|Morro da praia":{"incl":["Sobe o morro, forte!","Segura, morro continua"]},"orla|climax|Ponta da praia":{"anda":"Passo máximo, 200 metros!","trote":"Tudo! Só 200 metros"},"orla|climax|Farol da barra":{"anda":"Passo máximo, farol ali!","trote":"Tudo até o farol!"},"orla|climax|Último posto":{"anda":"Passo máximo, último posto!","trote":"Sprint até o posto!"},"orla|climax|Pedra do mirante":{"incl":"Tudo até a pedra!"},"orla|climax|Topo do morro":{"incl":"Tudo até o topo!"},"orla|climax|Mirante do forte":{"incl":"Tudo até o forte!"},"serra|desafio|Raízes":{"anda":["Passo firme nas raízes!","Firme, mais raízes"],"trote":["Acelera firme nas raízes!","Firme, mais raízes"]},"serra|desafio|Trilha estreita":{"anda":["Passo firme e rápido!","Segura, ainda é estreita"],"trote":["Firme e rápido aqui!","Segura, ainda é estreita"]},"serra|desafio|Pinguela do rio":{"anda":["Passo rápido na pinguela!","Segura até atravessar"],"trote":["Acelera na pinguela!","Segura até atravessar"]},"serra|desafio|Barro na trilha":{"anda":["Passo firme no barro!","Segura, ainda é barro"],"trote":["Força no barro!","Segura, ainda é barro"]},"serra|desafio|Cascalho":{"anda":["Passo rápido no cascalho!","Segura no cascalho"],"trote":["Acelera no cascalho!","Segura no cascalho"]},"serra|desafio|Nuvem de mosquitos":{"anda":["Acelera o passo, mosquitos!","Segura, ainda tem mosquito"],"trote":["Corre, mosquitos!","Segura, ainda tem mosquito"]},"serra|desafio|Subida de pedra":{"incl":["Sobe a pedra, forte!","Firme, ainda é pedra"]},"serra|desafio|Cachoeira":{"incl":["Sobe até a cachoeira!","Segura até a cachoeira"]},"serra|desafio|Ladeira das araucárias":{"incl":["Sobe entre as araucárias!","Segura, a ladeira continua"]},"serra|desafio|Morro do tucano":{"incl":["Sobe atrás do tucano!","Segura, topo à vista"]},"serra|climax|Reta da trilha":{"anda":"Passo máximo, 200 metros!","trote":"Tudo! Só 200 metros"},"serra|climax|Portal do parque":{"anda":"Passo máximo, portal ali!","trote":"Sprint até o portal!"},"serra|climax|Ponte pênsil":{"anda":"Passo máximo na ponte!","trote":"Tudo na ponte pênsil!"},"serra|climax|O cume":{"incl":"Tudo até o cume!"},"serra|climax|Pico da serra":{"incl":"Tudo! Pico à vista"},"serra|climax|Pedra grande":{"incl":"Tudo! Só 50 metros"},"cidade|desafio|Sinal verde":{"anda":["Passo rápido, sinal verde!","Segura, ainda tá verde"],"trote":["Acelera antes de fechar!","Segura, ainda tá verde"]},"cidade|desafio|Túnel":{"anda":["Passo rápido no túnel!","Segura até a luz"],"trote":["Acelera até a saída!","Segura até a luz"]},"cidade|desafio|Atravessa a avenida":{"anda":["Vai, o sinal abriu!","Segura até a calçada"],"trote":["Corre, o sinal abriu!","Segura até a calçada"]},"cidade|desafio|Vento entre prédios":{"anda":["Passo firme no vento!","Firme, o vento continua"],"trote":["Força contra o vento!","Firme, o vento continua"]},"cidade|desafio|Calçadão do centro":{"anda":["Passo rápido no calçadão!","Segura até a esquina"],"trote":["Solta a passada, calçadão!","Segura até a esquina"]},"cidade|desafio|Ônibus chegando":{"anda":["Apressa, o ônibus vem!","Segura, ele tá parando"],"trote":["Corre, o ônibus vem!","Segura, ele tá parando"]},"cidade|desafio|Viaduto":{"incl":["Sobe o viaduto, forte!","Segura até o topo"]},"cidade|desafio|Rua da ladeira":{"incl":["Sobe a ladeira, firme!","Segura, a ladeira continua"]},"cidade|desafio|Rampa da passarela":{"incl":["Sobe a passarela, firme!","Segura até o meio"]},"cidade|desafio|Ladeira do centro":{"incl":["Sobe forte, centro histórico!","Segura, ainda é ladeira"]},"cidade|climax|Ponte estaiada":{"anda":"Passo máximo na ponte!","trote":"Tudo pela ponte!"},"cidade|climax|Reta final":{"anda":"Passo máximo, 200 metros!","trote":"Tudo! Só 200 metros"},"cidade|climax|Última quadra":{"anda":"Passo máximo, última quadra!","trote":"Sprint na última quadra!"},"cidade|climax|Mirante da cidade":{"incl":"Tudo até o mirante!"},"cidade|climax|Topo do viaduto":{"incl":"Tudo até o topo!"},"cidade|climax|Alto da colina":{"incl":"Tudo até a colina!"}};
for(const c of CENARIOS)for(const p in c.ev)for(const e of c.ev[p]){const v=MOTIVOS[c.id+'|'+p+'|'+e.t];if(v)e.mv=v;}
/* direção do bloco atual: sobe / mantém, comparando a zona com a do bloco anterior */
function cueDe(ev,papel){
  const i=idxAtual;let v=ev.mv;
  if(v&&typeof v==='object'&&!Array.isArray(v)){const fr=(EXERCICIOS[exAtual]||{}).frase;v=v[fr]||v.anda||v.trote||v.incl;}
  if(Array.isArray(v)){const z=i>0?NIVEIS[BL[i].nivel].zona:0,zp=i>0?NIVEIS[BL[i-1].nivel].zona:0;return z>zp?v[0]:v[1];}
  return v||ev.c||((CUE_MOD[modAtual]||{})[papel])||CUE[papel];
}

/* ---------- ícones ---------- */
const ICO={
 partida:'<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>',
 exploracao:'<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z"/>',
 desafio:'<path d="M3 19 9.5 9l4 5.5 2.5-3.5L21 19Z"/><path d="M17 3v5M14.8 5.2 17 3l2.2 2.2"/>',
 climax:'<path d="M3 19 10 8l4 6 2-3 5 8Z"/><path d="M10 8V3l4.5 1.6L10 6.2"/>',
 alivio:'<path d="M3 8.5h10.5a2.8 2.8 0 1 0-2.8-2.8M3 15.5h14.5a2.8 2.8 0 1 1-2.8 2.8M3 12h7"/>',
 chegada:'<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 6.5V4M5.5 9.6 3.8 7.9M18.5 9.6l1.7-1.7"/>'};
const ico=n=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICO[n]+'</svg>';
const ICO_CLIMA={
 sol:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 nuvem:'<path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18Z"/>',
 chuva:'<path d="M7 14h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 14Z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>',
 nevoa:'<path d="M4 9h16M2 13h20M5 17h14"/>',
 vento:'<path d="M3 8.5h10.5a2.8 2.8 0 1 0-2.8-2.8M3 15.5h14.5a2.8 2.8 0 1 1-2.8 2.8M3 12h7"/>',
 neve:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>'};
const icoClima=n=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICO_CLIMA[n]+'</svg>';
const PIN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z"/><circle cx="12" cy="10" r="2.3"/></svg>';
const HEART='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff6b7d" d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 3.1c0 5.4-7.5 10-7.5 10Z"/></svg>';
const DADO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.6"/><g fill="currentColor" stroke="none"><circle cx="9" cy="9" r="1.4"/><circle cx="15" cy="15" r="1.4"/><circle cx="15" cy="9" r="1.4"/><circle cx="9" cy="15" r="1.4"/></g></svg>';
const LIVRO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 5.5c2.5-1 5.5-1 9 1 3.5-2 6.5-2 9-1V19c-2.5-1-5.5-1-9 1-3.5-2-6.5-2-9-1Z"/><path d="M12 6.5V20"/></svg>';
const I_PLAY='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
const I_PAUSA='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>';

/* ---------- peças de desenho ---------- */
function svgAbre(w,h){return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true" focusable="false">';}
function wrap(x,r,TW,fn){let s=fn(x);if(x-r<0)s+=fn(x+TW);if(x+r>TW)s+=fn(x-TW);return s;}
function periodico(rng,TW,n,kmin,kmax){
  const c=[];for(let i=0;i<n;i++){const k=Math.max(1,Math.round(lerp(kmin,kmax,n>1?i/(n-1):0))+(rng()<.5?0:1));c.push({k,a:Math.pow(.6,i)*(.7+.3*rng()),f:rng()*TAU});}
  const s=c.reduce((a,b)=>a+b.a,0);
  return x=>{let v=0;for(const q of c)v+=q.a*(.5+.5*Math.sin(TAU*q.k*x/TW+q.f));return v/s;};
}
function silhueta(fy,TW,h,passo){let d='M0 '+f1(h);for(let x=0;x<TW;x+=passo)d+=' L'+f1(x)+' '+f1(fy(x));return d+' L'+TW+' '+f1(fy(TW))+' L'+TW+' '+f1(h)+' Z';}
function nuvem(x,y,z){return '<ellipse cx="'+f1(x)+'" cy="'+f1(y)+'" rx="'+f1(z)+'" ry="'+f1(z*.34)+'"/><ellipse cx="'+f1(x-z*.5)+'" cy="'+f1(y+z*.06)+'" rx="'+f1(z*.55)+'" ry="'+f1(z*.26)+'"/><ellipse cx="'+f1(x+z*.55)+'" cy="'+f1(y+z*.05)+'" rx="'+f1(z*.6)+'" ry="'+f1(z*.24)+'"/><ellipse cx="'+f1(x+z*.08)+'" cy="'+f1(y-z*.2)+'" rx="'+f1(z*.46)+'" ry="'+f1(z*.32)+'"/>';}
function arvore(x,b,a,rng,flor){
  const R=a*.27,cy=b-a+R,tw=Math.max(2.4,a*.05);
  const tronco='<path d="M'+f1(x-tw*.6)+' '+f1(b)+' L'+f1(x-tw*.35)+' '+f1(cy+R*.3)+' L'+f1(x+tw*.35)+' '+f1(cy+R*.3)+' L'+f1(x+tw*.6)+' '+f1(b)+'Z"/>';
  let copa='<circle cx="'+f1(x)+'" cy="'+f1(cy)+'" r="'+f1(R)+'"/>';
  const n=4+Math.floor(rng()*3);
  for(let i=0;i<n;i++){const ang=Math.PI*(.95-.9*i/(n-1)),r=R*(.5+.25*rng());copa+='<circle cx="'+f1(x+Math.cos(ang)*R*.78)+'" cy="'+f1(cy-Math.sin(ang)*R*.55)+'" r="'+f1(r)+'"/>';}
  copa+='<circle cx="'+f1(x-R*.82)+'" cy="'+f1(cy+R*.28)+'" r="'+f1(R*.55)+'"/><circle cx="'+f1(x+R*.84)+'" cy="'+f1(cy+R*.24)+'" r="'+f1(R*.58)+'"/>';
  return flor?{s:tronco,f:copa}:{s:tronco+copa,f:''};
}
function poste(x,b,a,s){return '<rect x="'+f1(x-1.2*s)+'" y="'+f1(b-a)+'" width="'+f1(2.4*s)+'" height="'+f1(a)+'"/><path d="M'+f1(x-6*s)+' '+f1(b-a+6*s)+' Q'+f1(x)+' '+f1(b-a-3*s)+' '+f1(x+6*s)+' '+f1(b-a+6*s)+'Z"/>';}
function araucaria(x,b,a){
  const tw=Math.max(1.2,a*.035),top=b-a,cw=a*.36;
  let s='<rect x="'+f1(x-tw/2)+'" y="'+f1(top+a*.12)+'" width="'+f1(tw)+'" height="'+f1(a*.88)+'"/>';
  s+='<ellipse cx="'+f1(x)+'" cy="'+f1(top+a*.07)+'" rx="'+f1(cw)+'" ry="'+f1(a*.075)+'"/>';
  s+='<ellipse cx="'+f1(x)+'" cy="'+f1(top+a*.15)+'" rx="'+f1(cw*.78)+'" ry="'+f1(a*.06)+'"/>';
  s+='<ellipse cx="'+f1(x)+'" cy="'+f1(top+a*.24)+'" rx="'+f1(cw*.5)+'" ry="'+f1(a*.05)+'"/>';
  for(const sg of [-1,1])s+='<path d="M'+f1(x)+' '+f1(top+a*.36)+' Q'+f1(x+sg*cw*.6)+' '+f1(top+a*.24)+' '+f1(x+sg*cw*.94)+' '+f1(top+a*.06)+' L'+f1(x+sg*cw*.84)+' '+f1(top+a*.1)+' Q'+f1(x+sg*cw*.5)+' '+f1(top+a*.28)+' '+f1(x)+' '+f1(top+a*.41)+'Z"/>';
  return s;
}
function folhaPalma(x0,y0,ang,L){
  const ca=Math.cos(ang),sa=Math.sin(ang),droop=L*.4*Math.abs(ca);
  const tx=x0+ca*L,ty=y0+sa*L+droop,mx=x0+ca*L*.5,my=y0+sa*L*.5-L*.08,nx=-sa,ny=ca,w=L*.11;
  return '<path d="M'+f1(x0)+' '+f1(y0)+' Q'+f1(mx+nx*w)+' '+f1(my+ny*w)+' '+f1(tx)+' '+f1(ty)+' Q'+f1(mx-nx*w)+' '+f1(my-ny*w)+' '+f1(x0)+' '+f1(y0)+'Z"/>';
}
function palmeira(x,b,a,rng,k){
  const lean=(rng()-.5)*a*.32,tx=x+lean,ty=b-a,w0=Math.max(2,a*.045),w1=Math.max(1.2,a*.026),mx=x+lean*.35,my=b-a*.55;
  let s='<path d="M'+f1(x-w0)+' '+f1(b)+' Q'+f1(mx-w0)+' '+f1(my)+' '+f1(tx-w1)+' '+f1(ty)+' L'+f1(tx+w1)+' '+f1(ty)+' Q'+f1(mx+w0)+' '+f1(my)+' '+f1(x+w0)+' '+f1(b)+'Z"/>';
  const L=a*.34*(k||1);
  for(const g of [-172,-145,-118,-88,-60,-32,-8,152,28]){const ang=(g+(rng()-.5)*14)*Math.PI/180;s+=folhaPalma(tx,ty,ang,L*(.8+rng()*.35));}
  return s+'<circle cx="'+f1(tx)+'" cy="'+f1(ty+2)+'" r="'+f1(w1*2.2)+'"/>';
}
function pinheiro(x,b,a){
  const w=a*.42,tw=Math.max(1.4,a*.05);let s='<rect x="'+f1(x-tw/2)+'" y="'+f1(b-a*.18)+'" width="'+f1(tw)+'" height="'+f1(a*.18)+'"/>',n='';
  for(let i=0;i<3;i++){const ty=b-a+i*a*.26,by=ty+a*.42,ww=w*(.55+i*.25);
    s+='<path d="M'+f1(x)+' '+f1(ty)+' L'+f1(x+ww/2)+' '+f1(by)+' L'+f1(x-ww/2)+' '+f1(by)+'Z"/>';
    n+='<path d="M'+f1(x)+' '+f1(ty)+' L'+f1(x+ww*.2)+' '+f1(ty+a*.13)+' L'+f1(x+ww*.06)+' '+f1(ty+a*.11)+' L'+f1(x-ww*.08)+' '+f1(ty+a*.14)+' L'+f1(x-ww*.2)+' '+f1(ty+a*.12)+'Z"/>';}
  return {s,n};
}
function lance(xa,ya,xb,yb,s,nd){
  let r='<path d="M'+f1(xa)+' '+f1(ya)+' L'+f1(xb)+' '+f1(yb)+' L'+f1(xb)+' '+f1(yb+3.4*s)+' L'+f1(xa)+' '+f1(ya+3.4*s)+'Z"/>';
  for(let j=1;j<nd;j++){const t=j/nd,x=lerp(xa,xb,t),y=lerp(ya,yb,t);r+='<rect x="'+f1(x-2.6*s)+'" y="'+f1(y-1.4*s)+'" width="'+f1(5.2*s)+'" height="'+f1(1.6*s)+'"/>';}
  return r+'<path d="M'+f1(xa)+' '+f1(ya-12*s)+' L'+f1(xb)+' '+f1(yb-12*s)+' L'+f1(xb)+' '+f1(yb-10.6*s)+' L'+f1(xa)+' '+f1(ya-10.6*s)+'Z"/>';
}
function degraus(xa,ya,xb,yb,s){let r='';for(let j=0;j<=10;j++){const t=j/10,x=lerp(xa,xb,t),y=lerp(ya,yb,t);r+='<rect x="'+f1(x-6*s)+'" y="'+f1(y-2.4*s)+'" width="'+f1(12*s)+'" height="'+f1(4.4*s)+'" rx="'+f1(s)+'"/>';}return r;}
function graminha(TW,rng,y0){let bl='';for(let x=0;x<TW;x+=5+rng()*6){const hh=2+rng()*4;bl+='<path d="M'+f1(x)+' '+y0+' L'+f1(x+1.6)+' '+f1(y0-hh)+' L'+f1(x+3.2)+' '+y0+'Z"/>';}return bl;}

/* ---------- gerador de camadas (horizontais e verticais) ---------- */
function gerarCamada(def,rng){
  const W=C.W,bt=C.bt,chao=C.chao,band=C.band,s=C.esc;
  let top=0,h=0,TW=600,c='',left=0,wv=W,TH=0,afunda=0;
  switch(def.t){
  /* ----- céu ----- */
  case 'nuvens':{top=bt-60;h=band*.55+60;TW=Math.round(Math.max(700,W*2.6));
    const mt=!!(CLIMAS[plano.clima]||{}).nuvens,n=mt?9+Math.floor(rng()*3):4+Math.floor(rng()*3);let g='';
    for(let i=0;i<n;i++){const x=rng()*TW,y=14+rng()*(h*.5),z=(mt?40+rng()*50:26+rng()*40)*s;g+=wrap(x,z*1.3,TW,xx=>nuvem(xx,y,z));}
    c='<g class="L-nuvem" opacity="'+(mt?'.88':'.55')+'">'+g+'</g>';break;}
  case 'estrelas':{top=0;h=Math.max(40,chao-30);TW=Math.round(Math.max(700,W*2.2));let g='';const n=Math.round(TW*h/1500);
    for(let i=0;i<n;i++){g+='<circle cx="'+f1(rng()*TW)+'" cy="'+f1(Math.pow(rng(),1.5)*h)+'" r="'+f1(.5+rng()*1.1)+'" opacity="'+(.4+rng()*.6).toFixed(2)+'"/>';}
    c='<g class="L-estrela">'+g+'</g>';break;}
  /* ----- longe ----- */
  case 'colinas':{h=band*.7;top=chao+2-h;TW=Math.round(Math.max(700,W*2.2));
    const f=periodico(rng,TW,3,1,4),fy=x=>h-h*.1-f(x)*h*.55;let pr='';
    if(!def.semCidade)for(let k=0;k<2;k++){let x=TW*(.08+k*.42)+rng()*TW*.12;const n=5+Math.floor(rng()*5);
      for(let j=0;j<n;j++){const w=(9+rng()*15)*s,hh=h*.22+rng()*h*.3,y=fy(x+w/2)-hh;pr+='<rect x="'+f1(x)+'" y="'+f1(y)+'" width="'+f1(w)+'" height="'+f1(h-y)+'"/>';
        if(j===2)pr+='<rect x="'+f1(x+w/2-.7)+'" y="'+f1(y-hh*.35)+'" width="1.4" height="'+f1(hh*.35)+'"/>';x+=w+rng()*2*s;}}
    c='<g class="L-longe">'+pr+'<path d="'+silhueta(fy,TW,h,6)+'"/></g>';break;}
  case 'skyline':{h=band*.82;top=chao+2-h;TW=Math.round(Math.max(760,W*2.4));const base=h-h*.1;
    let g='<rect x="0" y="'+f1(base)+'" width="'+TW+'" height="'+f1(h-base)+'"/>',jl='',x=8*s;const fim=def.ponte?TW*.6:TW-8*s;
    while(x<fim){const w=(12+rng()*22)*s,hh=h*(.22+Math.pow(rng(),1.4)*.62),y=base-hh;if(x+w>fim)break;
      g+='<rect x="'+f1(x)+'" y="'+f1(y)+'" width="'+f1(w)+'" height="'+f1(hh+1)+'"/>';
      if(hh>h*.6&&rng()<.5)g+='<rect x="'+f1(x+w/2-.7)+'" y="'+f1(y-hh*.18)+'" width="1.4" height="'+f1(hh*.18)+'"/>';
      for(let yy=y+5*s;yy<base-4;yy+=7*s)for(let xx=x+3*s;xx<x+w-3*s;xx+=5*s)if(rng()<.28)jl+='<rect x="'+f1(xx)+'" y="'+f1(yy)+'" width="'+f1(2*s)+'" height="'+f1(2.6*s)+'"/>';
      x+=w+rng()*3*s;}
    if(def.ponte){const px=TW*.8,mh=h*.92,dy=base-h*.2;let cab='';
      g+='<path d="M'+f1(px-6*s)+' '+f1(base)+' L'+f1(px-1.5*s)+' '+f1(base-mh)+' L'+f1(px+1.5*s)+' '+f1(base-mh)+' L'+f1(px+6*s)+' '+f1(base)+'Z"/><rect x="'+f1(TW*.63)+'" y="'+f1(dy)+'" width="'+f1(TW*.34)+'" height="'+f1(3*s)+'"/>';
      for(let k=1;k<=7;k++){const t=k/8,yy=base-mh+8*s+k*3*s;cab+='M'+f1(px)+' '+f1(yy)+' L'+f1(px-t*TW*.16)+' '+f1(dy)+' M'+f1(px)+' '+f1(yy)+' L'+f1(px+t*TW*.16)+' '+f1(dy)+' ';}
      g+='<path class="L-longe-st" fill="none" stroke-width="'+f1(.9*s)+'" d="'+cab+'"/>';}
    c='<g class="L-longe">'+g+'</g><g class="L-janela">'+jl+'</g>';break;}
  case 'ilhas':{h=band*.46;top=C.seaTop+2-h;TW=Math.round(Math.max(700,W*2.4));
    const il=[],n=3+Math.floor(rng()*2);
    for(let i=0;i<n;i++)il.push({cx:(i+.2+rng()*.6)/n*TW,w:(90+rng()*170)*s,a:h*(.35+rng()*.6)});
    const fy=x=>{let m=0;for(const q of il){let d=Math.abs(x-q.cx);d=Math.min(d,TW-d);if(d<q.w/2)m=Math.max(m,q.a*Math.pow(Math.cos(Math.PI*d/q.w),1.5));}return h-m;};
    const al=il.reduce((a,b)=>b.a>a.a?b:a),fx=al.cx,ft=h-al.a;
    c='<path class="L-longe" d="'+silhueta(fy,TW,h,5)+'"/><rect class="L-longe" x="'+f1(fx-2.5*s)+'" y="'+f1(ft-16*s)+'" width="'+f1(5*s)+'" height="'+f1(17*s)+'"/><circle class="L-luzfarol" cx="'+f1(fx)+'" cy="'+f1(ft-15*s)+'" r="'+f1(9*s)+'"/><circle fill="#ffe6a8" class="L-luz" cx="'+f1(fx)+'" cy="'+f1(ft-15*s)+'" r="'+f1(2*s)+'"/>';break;}
  case 'montanhas2':{h=band*1.05;top=chao-h;TW=Math.round(Math.max(800,W*2.8));
    const f=periodico(rng,TW,4,2,7),fy=x=>h-Math.pow(f(x),1.3)*h*.85;c='<path class="L-longe2" d="'+silhueta(fy,TW,h,6)+'"/>';break;}
  case 'montanhas':{h=band*.98;top=chao+2-h;TW=Math.round(Math.max(760,W*2.3));
    const f=periodico(rng,TW,5,1,9),fy=x=>h-h*.05-Math.pow(f(x),1.7)*h*.92;c='<path class="L-longe" d="'+silhueta(fy,TW,h,5)+'"/>';break;}
  case 'montanhasNeve':{h=band*.98;top=chao+2-h;TW=Math.round(Math.max(760,W*2.3));
    const f=periodico(rng,TW,5,1,8),fy=x=>h-h*.05-Math.pow(f(x),1.6)*h*.92;
    const th=x=>h*.5+Math.sin(TAU*7*x/TW)*4*s+Math.sin(TAU*13*x/TW+1)*3*s;
    let d='M0 '+f1(Math.min(fy(0),th(0)));for(let x=5;x<TW;x+=5)d+=' L'+f1(x)+' '+f1(Math.min(fy(x),th(x)));d+=' L'+TW+' '+f1(Math.min(fy(TW),th(TW)));
    for(let x=TW;x>=0;x-=5)d+=' L'+f1(x)+' '+f1(th(x));d+='Z';
    c='<path class="L-longe" d="'+silhueta(fy,TW,h,5)+'"/><path class="L-neve" d="'+d+'"/>';break;}
  case 'dunas':{h=band*.6;top=chao+2-h;TW=Math.round(Math.max(760,W*2.3));
    const f=periodico(rng,TW,3,1,3),fy=x=>h-h*.08-f(x)*h*.75;c='<path class="L-longe" d="'+silhueta(fy,TW,h,6)+'"/>';break;}
  case 'neblina':{h=band*.5;top=chao-band*.62;TW=Math.round(Math.max(720,W*2.4));let g='';
    for(let i=0;i<6;i++){const x=rng()*TW,y=h*(.3+rng()*.55),rx=(120+rng()*150)*s,ry=(8+rng()*9)*s;g+=wrap(x,rx,TW,xx=>'<ellipse cx="'+f1(xx)+'" cy="'+f1(y)+'" rx="'+f1(rx)+'" ry="'+f1(ry)+'"/>');}
    c='<g class="L-nuvem" opacity=".3">'+g+'</g>';break;}
  case 'mar':{top=C.seaTop;h=chao+4-top;TW=Math.round(Math.max(600,W*1.6));let b='';const n=Math.round(TW/12);
    for(let i=0;i<n;i++){const y=Math.pow(rng(),1.5)*(h-6)+2,w=(4+rng()*20)*(.4+y/h);b+='<rect x="'+f1(rng()*(TW-30))+'" y="'+f1(y)+'" width="'+f1(w)+'" height="1.3" opacity="'+(.2+rng()*.45).toFixed(2)+'"/>';}
    c='<rect class="L-mar" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-brilho" x="0" y="0" width="'+TW+'" height="1.4" opacity=".55"/><g class="L-brilho">'+b+'</g>';break;}
  /* ----- meio ----- */
  case 'copas':{h=band*.46;top=chao+2-h;TW=Math.round(Math.max(640,W*1.9));const base=h*.66;
    let g='<rect x="0" y="'+f1(base)+'" width="'+TW+'" height="'+f1(h-base)+'"/>',x=0;
    while(x<TW){const r=(11+rng()*17)*s*(rng()<.15?1.5:1),cy=base-r*(.15+rng()*.45);g+=wrap(x,r,TW,xx=>'<circle cx="'+f1(xx)+'" cy="'+f1(cy)+'" r="'+f1(r)+'"/>');x+=r*(1+rng()*.6);}
    c='<g class="L-meio">'+g+'</g>';break;}
  case 'praia':{h=band*.4;top=chao+2-h;TW=Math.round(Math.max(640,W*1.9));const ay=h-15*s;
    let cc='<rect class="L-areia" x="0" y="'+f1(ay)+'" width="'+TW+'" height="'+f1(h-ay)+'"/>',g='',mg=h*.5,x=mg+rng()*20;
    while(x<TW-mg){if(rng()<.62){g+=palmeira(x,ay+2,h*.45+rng()*h*.42,rng,.7);}
      else{const z=(9+rng()*5)*s,cl=rng()<.5?'S-toldo':'S-claro';cc+='<rect class="L-meio" x="'+f1(x-.6)+'" y="'+f1(ay-z*1.3)+'" width="1.2" height="'+f1(z*1.3+2)+'"/><path class="'+cl+'" d="M'+f1(x-z)+' '+f1(ay-z*1.2)+' Q'+f1(x)+' '+f1(ay-z*2.2)+' '+f1(x+z)+' '+f1(ay-z*1.2)+'Z"/>';}
      x+=(50+rng()*110)*s;}
    c=cc+'<g class="L-meio">'+g+'</g>';break;}
  case 'cumeeira':{h=band*.62;top=chao+2-h;TW=Math.round(Math.max(680,W*2));
    const f=periodico(rng,TW,3,1,5),fy=x=>h-h*.22-f(x)*h*.38;let g='<path d="'+silhueta(fy,TW,h,6)+'"/>',x=rng()*30;
    while(x<TW){const a=(16+rng()*24)*s;g+=wrap(x,a*.4,TW,xx=>araucaria(xx,fy(xx)+2,a));x+=(18+rng()*40)*s;}
    c='<g class="L-meio">'+g+'</g>';break;}
  case 'predios':{h=band*.78;top=chao+2-h;TW=Math.round(Math.max(760,W*2.2));let g='',vd='',jl='',x=10*s;
    while(x<TW-10*s){const w=(30+rng()*44)*s;if(x+w>TW-10*s)break;const hh=h*(.35+rng()*.62),y=h-hh;
      g+='<rect x="'+f1(x)+'" y="'+f1(y)+'" width="'+f1(w)+'" height="'+f1(hh)+'"/>';
      if(rng()<.3)g+='<rect x="'+f1(x-2*s)+'" y="'+f1(y)+'" width="'+f1(w+4*s)+'" height="'+f1(3*s)+'"/>';
      for(let yy=y+7*s;yy<h-9*s;yy+=14*s)for(let xx=x+5*s;xx<x+w-7*s;xx+=11*s){const r='<rect x="'+f1(xx)+'" y="'+f1(yy)+'" width="'+f1(4.6*s)+'" height="'+f1(6.4*s)+'"/>';vd+=r;if(rng()<.45)jl+=r;}
      x+=w+(2+rng()*12)*s;}
    c='<rect class="L-meio" x="0" y="'+f1(h-6*s)+'" width="'+TW+'" height="'+f1(6*s)+'"/><g class="L-meio">'+g+'</g><g class="L-vidro">'+vd+'</g><g class="L-janela">'+jl+'</g>';break;}
  case 'plantacao':{h=band*.42;top=chao+2-h;TW=Math.round(Math.max(640,W*1.9));const t0=h*.52;let rows='',fl='',x=0;
    for(let k=1;k<5;k++)rows+='<rect x="0" y="'+f1(t0+(h-t0)*k/5)+'" width="'+TW+'" height="'+f1(1.4*s)+'"/>';
    while(x<TW){const len=(120+rng()*200)*s;if(rng()<.6){for(let xx=x;xx<Math.min(x+len,TW-5);xx+=(5+rng()*3)*s)fl+='<circle cx="'+f1(xx)+'" cy="'+f1(t0-2*s-rng()*4*s)+'" r="'+f1((2+rng()*1.2)*s)+'"/>';}x+=len+(20+rng()*40)*s;}
    c='<rect class="L-meio" x="0" y="'+f1(t0)+'" width="'+TW+'" height="'+f1(h-t0)+'"/><g class="L-detalhe" opacity=".35">'+rows+'</g><g class="L-flor">'+fl+'</g>';break;}
  case 'lagoas':{h=band*.46;top=chao+2-h;TW=Math.round(Math.max(640,W*1.9));
    const f=periodico(rng,TW,3,2,5),fy=x=>h-h*.1-f(x)*h*.6;let lg='',br='',x=rng()*60*s;
    while(x<TW-40*s){const len=Math.min((70+rng()*150)*s,TW-30*s-x);lg+='<rect x="'+f1(x)+'" y="'+f1(h-12*s)+'" width="'+f1(len)+'" height="'+f1(12*s)+'" rx="'+f1(6*s)+'"/>';
      br+='<rect x="'+f1(x+len*.15)+'" y="'+f1(h-10*s)+'" width="'+f1(len*.5)+'" height="1.2"/>';x+=len+(60+rng()*140)*s;}
    c='<path class="L-meio" d="'+silhueta(fy,TW,h,6)+'"/><g class="L-lagoa">'+lg+'</g><g class="L-brilho" opacity=".6">'+br+'</g>';break;}
  case 'pinheirosNeve':{const k=def.esc||1;h=band*(k<1?.5:1);top=chao+(k<1?2:8)-h;TW=Math.round(Math.max(700,W*(k<1?1.9:2.3)));
    const mg=h*.3;let g='',nv='',x=mg+rng()*20;
    while(x<TW-mg){const p=pinheiro(x,h,h*(.55+rng()*.45));g+=p.s;nv+=p.n;x+=(k<1?(14+rng()*26):(48+rng()*80))*s;}
    c='<g class="'+(k<1?'L-meio':'L-perto')+'">'+g+'</g><g class="L-neve" opacity=".92">'+nv+'</g>';break;}
  /* ----- perto ----- */
  case 'arvores':{h=band*.98;top=chao+8-h;TW=Math.round(Math.max(720,W*2.3));let g='',fl='',lz='',mg=h*.42,x=mg+rng()*30;
    while(x<TW-mg){
      if(rng()<.2){const a=h*.4;g+=poste(x,h,a,s);lz+='<circle cx="'+f1(x)+'" cy="'+f1(h-a+5*s)+'" r="'+f1(18*s)+'"/>';x+=(40+rng()*50)*s;continue;}
      const a=h*(.5+rng()*.45),t=arvore(x,h,a,rng,rng()<.18);g+=t.s;fl+=t.f;x+=(58+rng()*90)*s*(a/h+.3);}
    c='<defs><radialGradient id="gLuz"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".8"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient></defs><g class="L-perto">'+g+'</g><g class="L-flor">'+fl+'</g><g class="L-luz" fill="url(#gLuz)">'+lz+'</g>';break;}
  case 'palmeiras':{h=band*1.02;top=chao+8-h;TW=Math.round(Math.max(760,W*2.4));let g='',mg=h*.58,x=mg+rng()*30;
    while(x<TW-mg){g+=palmeira(x,h,h*(.62+rng()*.38),rng,1);x+=(105+rng()*130)*s;}
    c='<g class="L-perto">'+g+'</g>';break;}
  case 'araucarias':{h=band*1.02;top=chao+8-h;TW=Math.round(Math.max(760,W*2.3));let g='',mg=h*.4,x=mg+rng()*30;
    while(x<TW-mg){g+=araucaria(x,h,h*(.5+rng()*.5));
      if(rng()<.35){const px=x+(20+rng()*30)*s,r=(5+rng()*7)*s;g+='<ellipse cx="'+f1(px)+'" cy="'+f1(h-r*.35)+'" rx="'+f1(r)+'" ry="'+f1(r*.6)+'"/><ellipse cx="'+f1(px+r*.9)+'" cy="'+f1(h-r*.2)+'" rx="'+f1(r*.6)+'" ry="'+f1(r*.4)+'"/>';}
      x+=(55+rng()*95)*s;}
    c='<g class="L-perto">'+g+'</g>';break;}
  case 'cerca':{h=band*.95;top=chao+8-h;TW=Math.round(Math.max(760,W*2.3));const P=TW/Math.max(6,Math.round(TW/(44*s)));let g='';
    for(let x=0;x<TW-1;x+=P)g+='<rect x="'+f1(x)+'" y="'+f1(h-34*s)+'" width="'+f1(4*s)+'" height="'+f1(34*s)+'"/>';
    g+='<rect x="0" y="'+f1(h-29*s)+'" width="'+TW+'" height="'+f1(3*s)+'"/><rect x="0" y="'+f1(h-17*s)+'" width="'+TW+'" height="'+f1(3*s)+'"/>';
    const mg=h*.42;let x=mg+rng()*80*s;while(x<TW-mg){const t=arvore(x,h-2,h*(.6+rng()*.38),rng,false);g+=t.s;x+=(220+rng()*260)*s;}
    c='<g class="L-perto">'+g+'</g>';break;}
  case 'dunasPerto':{h=band*.5;top=chao+6-h;TW=Math.round(Math.max(760,W*2.2));
    const f=periodico(rng,TW,2,1,3),fy=x=>h-f(x)*h*.85;let ab='',x=40*s+rng()*40;
    while(x<TW-40*s){const r=(4+rng()*6)*s,y=fy(x)+r*.4;if(y<h-2)ab+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r)+'"/><circle cx="'+f1(x+r)+'" cy="'+f1(y+r*.2)+'" r="'+f1(r*.7)+'"/>';x+=(60+rng()*160)*s;}
    c='<path class="L-perto" d="'+silhueta(fy,TW,h,6)+'"/><g class="L-arbusto">'+ab+'</g>';break;}
  /* ----- chão ----- */
  case 'gramado':{top=chao-2;h=C.H-chao+2;TW=Math.round(Math.max(560,W*1.5));let det='',tx='';
    for(let i=0,n=Math.round(TW/26);i<n;i++)det+='<ellipse cx="'+f1(rng()*TW)+'" cy="'+f1(10+rng()*10)+'" rx="'+f1(1.5+rng()*3)+'" ry="'+f1(.8+rng())+'"/>';
    for(let i=0,m=Math.round(TW/18);i<m;i++)tx+='<rect x="'+f1(rng()*TW)+'" y="'+f1(30+rng()*(h*.45))+'" width="'+f1(6+rng()*16)+'" height="1.6"/>';
    c='<rect class="L-chao" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-perto" x="0" y="0" width="'+TW+'" height="6"/><g class="L-perto">'+graminha(TW,rng,6)+'</g><rect class="L-caminho" x="0" y="8" width="'+TW+'" height="'+f1(15*s)+'"/><g class="L-detalhe">'+det+'</g><g class="L-detalhe" opacity=".35">'+tx+'</g>';break;}
  case 'calcadao':{top=chao-2;h=C.H-chao+2;TW=Math.round(Math.max(560,W*1.5));const P=TW/Math.max(4,Math.round(TW/(64*s)));
    let d='M0 '+f1(18*s);for(let x=4;x<=TW;x+=4)d+=' L'+f1(x)+' '+f1(18*s+6*s*Math.sin(TAU*x/P));
    c='<rect class="L-chao" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-detalhe" x="0" y="0" width="'+TW+'" height="4"/><rect class="L-caminho" x="0" y="5" width="'+TW+'" height="'+f1(26*s)+'"/><path class="L-onda" d="'+d+'" fill="none" stroke-width="'+f1(5*s)+'"/><rect class="L-detalhe" x="0" y="'+f1(5+26*s)+'" width="'+TW+'" height="3"/>';break;}
  case 'trilha':{top=chao-2;h=C.H-chao+2;TW=Math.round(Math.max(560,W*1.5));
    const f=periodico(rng,TW,2,3,8),fy=x=>7+f(x)*4*s;let d='M0 '+f1(fy(0));
    for(let x=6;x<TW;x+=6)d+=' L'+f1(x)+' '+f1(fy(x));d+=' L'+TW+' '+f1(fy(TW))+' L'+TW+' '+f1(23*s)+' L0 '+f1(23*s)+'Z';
    let det='',rz='';
    for(let i=0,n=Math.round(TW/22);i<n;i++)det+='<ellipse cx="'+f1(rng()*TW)+'" cy="'+f1(11*s+rng()*10*s)+'" rx="'+f1((1.5+rng()*3.5)*s)+'" ry="'+f1((1+rng()*1.4)*s)+'"/>';
    for(let i=0,m=Math.round(TW/90);i<m;i++){const x=rng()*(TW-50),y=(14+rng()*6)*s;rz+='<path d="M'+f1(x)+' '+f1(y)+' q'+f1(10*s)+' '+f1(-5*s)+' '+f1(22*s)+' '+f1(-1*s)+' t'+f1(18*s)+' '+f1(3*s)+'"/>';}
    c='<rect class="L-chao" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-perto" x="0" y="0" width="'+TW+'" height="'+f1(6*s)+'"/><path class="L-caminho" d="'+d+'"/><g class="L-detalhe">'+det+'</g><g class="L-raiz" fill="none" stroke-width="'+f1(2.2*s)+'" stroke-linecap="round">'+rz+'</g>';break;}
  case 'calcada':{top=chao-2;h=C.H-chao+2;TW=Math.round(Math.max(560,W*1.5));const P=TW/Math.max(4,Math.round(TW/(30*s)));let jt='';
    for(let x=0;x<TW-1;x+=P)jt+='<rect x="'+f1(x)+'" y="6" width="1.2" height="'+f1(18*s)+'"/>';
    c='<rect class="L-chao" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-perto" x="0" y="0" width="'+TW+'" height="5"/><rect class="L-caminho" x="0" y="5" width="'+TW+'" height="'+f1(19*s)+'"/><g class="L-detalhe">'+jt+'</g><rect class="L-detalhe" x="0" y="'+f1(5+19*s)+'" width="'+TW+'" height="'+f1(4*s)+'"/>';break;}
  case 'ciclovia':{top=chao-2;h=C.H-chao+2;TW=Math.round(Math.max(560,W*1.5));const P=TW/Math.max(2,Math.round(TW/(170*s)));let gl='';const yl=4+10*s,cy=yl+13*s;
    for(let x=P*.5;x<TW;x+=P)gl+='<circle cx="'+f1(x-6*s)+'" cy="'+f1(cy)+'" r="'+f1(3.6*s)+'"/><circle cx="'+f1(x+6*s)+'" cy="'+f1(cy)+'" r="'+f1(3.6*s)+'"/><path d="M'+f1(x-6*s)+' '+f1(cy)+' L'+f1(x-s)+' '+f1(cy-6*s)+' L'+f1(x+4*s)+' '+f1(cy-6*s)+' L'+f1(x+6*s)+' '+f1(cy)+' M'+f1(x-s)+' '+f1(cy-6*s)+' L'+f1(x)+' '+f1(cy)+'"/>';
    c='<rect class="L-chao" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-perto" x="0" y="0" width="'+TW+'" height="4"/><rect class="L-caminho" x="0" y="4" width="'+TW+'" height="'+f1(10*s)+'"/><rect class="L-ciclo" x="0" y="'+f1(yl)+'" width="'+TW+'" height="'+f1(20*s)+'"/><rect class="L-faixa" x="0" y="'+f1(yl+20*s)+'" width="'+TW+'" height="'+f1(2*s)+'"/>';break;}
  case 'asfalto':{top=chao-2;h=C.H-chao+2;TW=Math.round(Math.max(560,W*1.5));const P=TW/Math.max(4,Math.round(TW/(44*s))),P2=TW/Math.max(4,Math.round(TW/(36*s)));let ds='',pt='';
    for(let x=0;x<TW-1;x+=P)ds+='<rect x="'+f1(x)+'" y="'+f1(4+11*s)+'" width="'+f1(22*s)+'" height="'+f1(2.2*s)+'"/>';
    for(let x=0;x<TW-1;x+=P2)pt+='<rect x="'+f1(x)+'" y="'+f1(4+26*s)+'" width="'+f1(3*s)+'" height="'+f1(12*s)+'"/>';
    c='<rect class="L-chao" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-perto" x="0" y="0" width="'+TW+'" height="4"/><rect class="L-caminho" x="0" y="4" width="'+TW+'" height="'+f1(24*s)+'"/><g class="L-faixa">'+ds+'</g><g class="L-detalhe">'+pt+'<rect x="0" y="'+f1(4+27*s)+'" width="'+TW+'" height="'+f1(4*s)+'"/></g>';break;}
  case 'terra':{top=chao-2;h=C.H-chao+2;TW=Math.round(Math.max(560,W*1.5));let pd='';
    for(let i=0,n=Math.round(TW/24);i<n;i++)pd+='<ellipse cx="'+f1(rng()*TW)+'" cy="'+f1(9*s+rng()*14*s)+'" rx="'+f1((1.4+rng()*2.6)*s)+'" ry="'+f1((.8+rng())*s)+'"/>';
    c='<rect class="L-chao" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-perto" x="0" y="0" width="'+TW+'" height="6"/><g class="L-perto">'+graminha(TW,rng,6)+'</g><rect class="L-caminho" x="0" y="7" width="'+TW+'" height="'+f1(18*s)+'"/><g class="L-detalhe-st" fill="none" stroke-width="1.3"><path d="M0 '+f1(7+6*s)+'H'+TW+'M0 '+f1(7+13*s)+'H'+TW+'"/></g><g class="L-detalhe">'+pd+'</g>';break;}
  case 'neve':{top=chao-2;h=C.H-chao+2;TW=Math.round(Math.max(560,W*1.5));let bm='';
    for(let i=0,n=Math.round(TW/40);i<n;i++)bm+='<ellipse cx="'+f1(rng()*TW)+'" cy="'+f1(28*s+rng()*h*.4)+'" rx="'+f1((14+rng()*30)*s)+'" ry="'+f1((2+rng()*3)*s)+'"/>';
    c='<rect class="L-chao" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-caminho" x="0" y="'+f1(6*s)+'" width="'+TW+'" height="'+f1(16*s)+'"/><g class="L-detalhe-st" fill="none" stroke-width="'+f1(1.3*s)+'"><path d="M0 '+f1(11*s)+'H'+TW+'M0 '+f1(16*s)+'H'+TW+'"/></g><g class="L-caminho" opacity=".5">'+bm+'</g>';break;}
  case 'areia':{top=chao-2;h=C.H-chao+2;TW=Math.round(Math.max(560,W*1.5));let rp='';const P=TW/Math.max(4,Math.round(TW/(60*s)));
    for(let k=0;k<6;k++){const y=(10+k*9)*s;let d='M0 '+f1(y+2*s*Math.sin(k));for(let x=4;x<=TW;x+=4)d+=' L'+f1(x)+' '+f1(y+2*s*Math.sin(TAU*x/P+k));rp+='<path d="'+d+'"/>';}
    c='<rect class="L-chao" x="0" y="0" width="'+TW+'" height="'+f1(h)+'"/><rect class="L-caminho" x="0" y="0" width="'+TW+'" height="'+f1(6*s)+'"/><g class="L-detalhe-st" fill="none" stroke-width="1.1" opacity=".55">'+rp+'</g>';break;}
  /* ----- frente ----- */
  case 'tufos':{h=Math.round(60*s);top=chao+18*s;TW=Math.round(Math.max(520,W*1.3));let g='',x=rng()*30;
    while(x<TW-44*s){const n=3+Math.floor(rng()*4);for(let j=0;j<n;j++){const bx=x+j*3.5*s,hh=(12+rng()*28)*s,ln=(rng()-.5)*10*s;
      g+='<path d="M'+f1(bx-2*s)+' '+h+' Q'+f1(bx+ln*.4)+' '+f1(h-hh*.6)+' '+f1(bx+ln)+' '+f1(h-hh)+' Q'+f1(bx+ln*.3+1)+' '+f1(h-hh*.5)+' '+f1(bx+2*s)+' '+h+'Z"/>';}
      x+=(40+rng()*90)*s;}
    c='<g class="L-frente">'+g+'</g>';break;}
  case 'samambaias':{h=Math.round(64*s);top=chao+16*s;TW=Math.round(Math.max(520,W*1.3));let g='',x=50*s+rng()*30;
    while(x<TW-50*s){const n=3+Math.floor(rng()*3);
      for(let j=0;j<n;j++){const ang=(-150+j*(120/(n-1))+(rng()-.5)*14)*Math.PI/180,L=(22+rng()*22)*s;
        const ex=x+Math.cos(ang)*L,ey=h+Math.sin(ang)*L*.9,cx=x+Math.cos(ang)*L*.45,cy=h+Math.sin(ang)*L*.95-6*s;
        g+='<path d="M'+f1(x)+' '+h+' Q'+f1(cx)+' '+f1(cy)+' '+f1(ex)+' '+f1(ey)+'"/>';
        for(let k=1;k<6;k++){const t=k/6,px=lerp(lerp(x,cx,t),lerp(cx,ex,t),t),py=lerp(lerp(h,cy,t),lerp(cy,ey,t),t),ll=(1-t)*6*s+2;
          g+='<path d="M'+f1(px)+' '+f1(py)+' l'+f1(-ll*.4)+' '+f1(-ll)+'M'+f1(px)+' '+f1(py)+' l'+f1(ll*.6)+' '+f1(-ll*.8)+'"/>';}}
      x+=(50+rng()*90)*s;}
    c='<g class="L-frente-st" fill="none" stroke-width="'+f1(2.2*s)+'" stroke-linecap="round">'+g+'</g>';break;}
  /* ===== verticais (escada): o mundo desce enquanto você sobe ===== */
  case 'nuvensV':{TH=Math.round(Math.max(C.H*1.3,760));let g='';
    const mtv=!!(CLIMAS[plano.clima]||{}).nuvens;for(let i=0;i<(mtv?10:6);i++){const x=rng()*W,y=rng()*TH,z=(mtv?40+rng()*50:26+rng()*40)*s;g+=nuvem(x,y,z);if(y-z<0)g+=nuvem(x,y+TH,z);if(y+z>TH)g+=nuvem(x,y-TH,z);}
    c='<g class="L-nuvem" opacity=".5">'+g+'</g>';break;}
  case 'skylineBaixo':{top=chao-band*.5;h=C.H-top+band*1.8+20;const base=band*.5;let g='<rect x="0" y="'+f1(base)+'" width="'+W+'" height="'+f1(h-base)+'"/>',jl='',x=0;
    while(x<W){const w=(12+rng()*22)*s,hh=band*(.12+rng()*.36),y=base-hh;g+='<rect x="'+f1(x)+'" y="'+f1(y)+'" width="'+f1(w)+'" height="'+f1(hh+1)+'"/>';
      for(let yy=y+5*s;yy<base-3;yy+=7*s)for(let xx=x+3*s;xx<x+w-3*s;xx+=5*s)if(rng()<.28)jl+='<rect x="'+f1(xx)+'" y="'+f1(yy)+'" width="'+f1(2*s)+'" height="'+f1(2.6*s)+'"/>';
      x+=w+rng()*3*s;}
    for(let i=0;i<140;i++)jl+='<rect x="'+f1(rng()*W)+'" y="'+f1(base+6+rng()*(h-base-10))+'" width="'+f1(2*s)+'" height="'+f1(2*s)+'"/>';
    c='<g class="L-longe">'+g+'</g><g class="L-janela">'+jl+'</g>';afunda=band*1.7;break;}
  case 'torresLonge':{left=Math.round(W*.26);wv=Math.round(W*.3);const fh=14*s;const N=Math.max(40,Math.round(Math.max(C.H*1.05,700)/fh));TH=Math.round(N*fh);const ff=TH/N;
    let g='<rect x="0" y="0" width="'+f1(wv*.38)+'" height="'+TH+'"/><rect x="'+f1(wv*.52)+'" y="0" width="'+f1(wv*.32)+'" height="'+TH+'"/>',jl='';
    for(let k=0;k<N;k++){const y=k*ff+4*s;for(let x=4*s;x<wv*.38-4*s;x+=7*s)if(rng()<.25)jl+='<rect x="'+f1(x)+'" y="'+f1(y)+'" width="'+f1(2.6*s)+'" height="'+f1(4*s)+'"/>';
      for(let x=wv*.52+4*s;x<wv*.84-4*s;x+=7*s)if(rng()<.25)jl+='<rect x="'+f1(x)+'" y="'+f1(y)+'" width="'+f1(2.6*s)+'" height="'+f1(4*s)+'"/>';}
    c='<g class="L-longe2">'+g+'</g><g class="L-janela" opacity=".7">'+jl+'</g>';break;}
  case 'torreViz':{left=0;wv=Math.round(W*.3);const fh=38*s;let N=Math.max(16,Math.round(Math.max(C.H,700)*1.1/fh));TH=Math.round(N*fh);const ff=TH/N;let vd='',jl='',ln='';
    for(let k=0;k<N;k++){const y=k*ff;ln+='<rect x="0" y="'+f1(y)+'" width="'+wv+'" height="'+f1(2*s)+'"/>';
      for(let x=8*s;x<wv-14*s;x+=18*s){const r='<rect x="'+f1(x)+'" y="'+f1(y+8*s)+'" width="'+f1(10*s)+'" height="'+f1(ff-16*s)+'"/>';vd+=r;if(rng()<.4)jl+=r;}}
    c='<rect class="L-meio" x="0" y="0" width="'+wv+'" height="'+TH+'"/><g class="L-vidro" opacity=".8">'+vd+'</g><g class="L-janela">'+jl+'</g><g fill="rgba(0,0,0,.18)">'+ln+'<rect x="'+f1(wv-8*s)+'" y="0" width="'+f1(8*s)+'" height="'+TH+'"/></g>';break;}
  case 'fachada':{left=Math.round(W*.5);wv=W-left+6;let N=Math.max(14,Math.round(Math.max(C.H,700)*1.1/(48*s)));if(N%2)N++;TH=Math.round(N*48*s);const fh=TH/N;
    const ex0=6*s,ex1=wv*.44;let g='<rect class="L-perto" x="0" y="0" width="'+wv+'" height="'+TH+'"/>',det='',vd='',jl='',es='';
    det+='<rect x="'+f1(ex1+5*s)+'" y="0" width="'+f1(3*s)+'" height="'+TH+'"/>';
    for(let k=0;k<N;k++){const y=k*fh,py=y+fh-7*s;
      det+='<rect x="0" y="'+f1(y)+'" width="'+wv+'" height="'+f1(3*s)+'"/>';
      for(let x=ex1+16*s;x<wv-14*s;x+=26*s){const r='<rect x="'+f1(x)+'" y="'+f1(y+10*s)+'" width="'+f1(15*s)+'" height="'+f1(fh-20*s)+'"/>';vd+=r;if(rng()<.5)jl+=r;}
      es+='<rect x="'+f1(ex0)+'" y="'+f1(py)+'" width="'+f1(ex1-ex0)+'" height="'+f1(3*s)+'"/><rect x="'+f1(ex0)+'" y="'+f1(py-13*s)+'" width="'+f1(ex1-ex0)+'" height="'+f1(1.4*s)+'"/><rect x="'+f1(ex0)+'" y="'+f1(py-13*s)+'" width="'+f1(1.6*s)+'" height="'+f1(13*s)+'"/><rect x="'+f1(ex1-1.6*s)+'" y="'+f1(py-13*s)+'" width="'+f1(1.6*s)+'" height="'+f1(13*s)+'"/>';
      const dir=k%2===0,xa=dir?ex0+8*s:ex1-8*s,xb=dir?ex1-8*s:ex0+8*s;
      es+=lance(xa,py,xb,py-fh,s,9);if(py-fh-14*s<0)es+=lance(xa,py+TH,xb,py-fh+TH,s,9);}
    c=g+'<g class="L-detalhe">'+det+'</g><g class="L-vidro">'+vd+'</g><g class="L-janela">'+jl+'</g><g class="L-escada">'+es+'</g>';break;}
  case 'marBaixo':{top=chao-band*.45;h=C.H-top+band*1.6+20;const hz=band*.15;
    const ix=W*(.12+rng()*.2),iw=W*.38,ia=band*.13;let d='M'+f1(ix-iw/2)+' '+f1(hz+1);for(let t=0;t<=1.0001;t+=.05)d+=' L'+f1(ix-iw/2+t*iw)+' '+f1(hz-ia*Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(t,1))),1.4));d+='Z';
    let sp='';for(let i=0;i<70;i++)sp+='<rect x="'+f1(rng()*W)+'" y="'+f1(hz+Math.pow(rng(),1.5)*(h-hz))+'" width="'+f1((4+rng()*20)*s)+'" height="1.3" opacity="'+(.2+rng()*.4).toFixed(2)+'"/>';
    const bx=W*(.3+rng()*.15),by=hz+band*.2;
    const barco='<path class="S-claro" d="M'+f1(bx)+' '+f1(by-22*s)+' L'+f1(bx+12*s)+' '+f1(by-3*s)+' L'+f1(bx)+' '+f1(by-3*s)+'Z"/><path class="S-sil" d="M'+f1(bx-10*s)+' '+f1(by-2*s)+' L'+f1(bx+16*s)+' '+f1(by-2*s)+' L'+f1(bx+12*s)+' '+f1(by+2*s)+' L'+f1(bx-7*s)+' '+f1(by+2*s)+'Z"/>';
    c='<path class="L-longe" d="'+d+'"/><rect class="L-mar" x="0" y="'+f1(hz)+'" width="'+W+'" height="'+f1(h-hz)+'"/><rect class="L-brilho" x="0" y="'+f1(hz)+'" width="'+W+'" height="1.4" opacity=".6"/><g class="L-brilho">'+sp+'</g>'+barco;afunda=band*1.5;break;}
  case 'torreFarol':{left=Math.round(W*.58);wv=Math.round(W*.4);let N=Math.max(16,Math.round(Math.max(C.H,700)*1.15/(46*s)));if(N%4)N+=4-N%4;TH=Math.round(N*46*s);const sb=TH/N;
    let st='',st2='',jn='',es='';
    for(let k=0;k<N;k++){const y=k*sb;if(k%2)st2+='<rect x="0" y="'+f1(y)+'" width="'+wv+'" height="'+f1(sb+.5)+'"/>';else st+='<rect x="0" y="'+f1(y)+'" width="'+wv+'" height="'+f1(sb+.5)+'"/>';
      if(k%4===1)jn+='<rect x="'+f1(wv*.6)+'" y="'+f1(y+sb*.2)+'" width="'+f1(9*s)+'" height="'+f1(sb*.6)+'" rx="'+f1(4.5*s)+'"/>';}
    for(let k=0;k<N/2;k++){const yb=k*2*sb+sb*1.7,yt=yb-sb*1.4;es+=lance(4*s,yb,wv-4*s,yt,s,11);if(yt-14*s<0)es+=lance(4*s,yb+TH,wv-4*s,yt+TH,s,11);}
    c='<g class="L-farolA">'+st+'</g><g class="L-farolB">'+st2+'</g><rect x="0" y="0" width="'+f1(wv*.16)+'" height="'+TH+'" fill="rgba(0,0,0,.22)"/><rect x="'+f1(wv*.86)+'" y="0" width="'+f1(wv*.14)+'" height="'+TH+'" fill="rgba(0,0,0,.12)"/><rect x="'+f1(wv*.3)+'" y="0" width="'+f1(wv*.1)+'" height="'+TH+'" fill="rgba(255,255,255,.08)"/><g class="L-vidro">'+jn+'</g><g class="L-janela">'+jn+'</g><g class="L-escada">'+es+'</g>';break;}
  case 'valeBaixo':{top=chao-band*.62;h=C.H-top+band*1.8+20;const hz=band*.62,f=periodico(rng,W,4,1,6),f2=periodico(rng,W,3,2,5);
    const fy=x=>hz-Math.pow(f(x),1.3)*band*.55,fy2=x=>hz+band*.06-f2(x)*band*.32;
    let d1='M0 '+f1(h),d2='M0 '+f1(h);for(let x=0;x<W;x+=6){d1+=' L'+f1(x)+' '+f1(fy(x));d2+=' L'+f1(x)+' '+f1(fy2(x));}
    d1+=' L'+W+' '+f1(fy(W))+' L'+W+' '+f1(h)+'Z';d2+=' L'+W+' '+f1(fy2(W))+' L'+W+' '+f1(h)+'Z';
    c='<path class="L-longe2" d="'+d1+'"/><path class="L-longe" d="'+d2+'"/>';afunda=band*1.6;break;}
  case 'encostaV':{left=0;wv=Math.round(W*.3);TH=Math.round(Math.max(C.H*1.1,720));const fe=periodico(rng,TH,3,2,5),ex=y=>wv*.35+fe(y)*wv*.55;
    let d='M0 0 L'+f1(ex(0))+' 0';for(let y=6;y<TH;y+=6)d+=' L'+f1(ex(y))+' '+f1(y);d+=' L'+f1(ex(TH))+' '+TH+' L0 '+TH+'Z';
    let pn='';for(let i=0,n=Math.round(TH/70);i<n;i++){const y=rng()*TH,x=ex(y)-4*s,a=(18+rng()*26)*s;pn+=pinheiro(x,y+2,a).s;if(y-a<0)pn+=pinheiro(x,y+2+TH,a).s;}
    c='<g class="L-meio"><path d="'+d+'"/>'+pn+'</g>';break;}
  case 'penhasco':{left=Math.round(W*.4);wv=W-left+6;let N=Math.max(8,Math.round(Math.max(C.H,700)*1.1/(84*s)));if(N%2)N++;TH=Math.round(N*84*s);const fh=TH/N;
    const fe=periodico(rng,TH,3,2,6),ex=y=>wv*.06+fe(y)*wv*.16;
    let d='M'+wv+' 0 L'+f1(ex(0))+' 0';for(let y=6;y<TH;y+=6)d+=' L'+f1(ex(y))+' '+f1(y);d+=' L'+f1(ex(TH))+' '+TH+' L'+wv+' '+TH+'Z';
    let ck='',stp='',pl='';
    for(let i=0,n=Math.round(TH/50);i<n;i++){const x=wv*(.25+rng()*.7),y=rng()*(TH-40*s),l=(10+rng()*24)*s;ck+='<path d="M'+f1(x)+' '+f1(y)+' l'+f1((rng()-.5)*8*s)+' '+f1(l*.5)+' l'+f1((rng()-.5)*8*s)+' '+f1(l*.5)+'"/>';}
    const xa0=wv*.3,xb0=wv*.84;
    for(let k=0;k<N;k++){const py=k*fh+fh-8*s,dir=k%2===0,xa=dir?xa0:xb0,xb=dir?xb0:xa0;
      stp+=degraus(xa,py,xb,py-fh,s);if(py-fh-8*s<0)stp+=degraus(xa,py+TH,xb,py-fh+TH,s);
      stp+='<rect x="'+f1(xa-13*s)+'" y="'+f1(py-2.4*s)+'" width="'+f1(26*s)+'" height="'+f1(5*s)+'" rx="'+f1(1.4*s)+'"/>';}
    for(let i=0,n=Math.round(TH/60);i<n;i++){const y=6*s+rng()*(TH-12*s),x=ex(y)+(4+rng()*10)*s,r=(3+rng()*5)*s;pl+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r)+'"/><circle cx="'+f1(x+r)+'" cy="'+f1(y+r*.3)+'" r="'+f1(r*.7)+'"/>';}
    c='<path class="L-perto" d="'+d+'"/><g class="L-detalhe-st" fill="none" stroke-width="'+f1(1.4*s)+'">'+ck+'</g><g class="L-caminho">'+stp+'</g><g class="L-arbusto">'+pl+'</g>';break;}
  }
  if(afunda){h=Math.round(h);return {af:1,top:Math.round(top),h,amt:afunda,svg:svgAbre(W,h)+c+'</svg>'};}
  if(TH){return {v:1,left,wv,TH,svg:svgAbre(wv,TH)+c+'</svg>'};}
  h=Math.max(4,Math.round(h));
  return {top:Math.round(top),h,TW,svg:svgAbre(TW,h)+c+'</svg>'};
}

/* ---------- bichos e objetos que entram em cena ---------- */
const CORES_CIC=[{camisa:'#2a9d8f',bike:'#f4c430',capacete:'#f4f1e6',short:'#1f2328'},{camisa:'#f4c430',bike:'#2b6cb0',capacete:'#e76f51',short:'#22262c'},
 {camisa:'#e76f51',bike:'#2a9d8f',capacete:'#1f2328',short:'#2a2d34'},{camisa:'#5b6ee1',bike:'#f08a2a',capacete:'#f4c430',short:'#1d2026'},{camisa:'#d6336c',bike:'#e9ecef',capacete:'#5b6ee1',short:'#22262c'}];
const PELES=['#d8a47a','#8d5a3b','#f0c8a0','#6b4226','#b98157'];
const HEROI_COR={camisa:'#ddff00',bike:'#00c9cc',capacete:'#f4f1e6',short:'#1f2328'};
/* pedalada: cinemática inversa da perna (quadril fixo, pé no pedal) em 12 quadros, interpolados pelo SVG */
let PERNAS=null;
function pernasCiclista(){
  if(PERNAS)return PERNAS;const Hp=[24,21],B=[32,42],cr=5.2,L1=13.5,L2=14.5;
  const q=fase=>{const out=[];for(let i=0;i<=12;i++){const th=i/12*TAU+fase,P=[B[0]+cr*Math.cos(th),B[1]+cr*Math.sin(th)];
    const dx=P[0]-Hp[0],dy=P[1]-Hp[1],d=Math.min(Math.hypot(dx,dy),L1+L2-.05),a=Math.atan2(dy,dx),ph=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));
    const k1=[Hp[0]+L1*Math.cos(a-ph),Hp[1]+L1*Math.sin(a-ph)],k2=[Hp[0]+L1*Math.cos(a+ph),Hp[1]+L1*Math.sin(a+ph)],K=k1[0]>k2[0]?k1:k2;
    out.push('M'+f1(Hp[0])+' '+f1(Hp[1])+' L'+f1(K[0])+' '+f1(K[1])+' L'+f1(P[0])+' '+f1(P[1]));}return out;};
  PERNAS={perto:q(0),longe:q(Math.PI)};return PERNAS;
}
/* ---------- pessoas: vetor leve (≈9 formas cada), cores sorteadas, escurecem à noite ---------- */
const PP_ROUPA=['#e76f51','#2a9d8f','#f4a261','#5b6ee1','#e9c46a','#d6336c','#8ecae6','#f1faee','#6a994e','#bc6c25','#9b5de5'];
const PP_CALCA=['#264653','#1d3557','#3d405b','#2b2d42','#5e503f','#6c757d','#463f3a','#7f5539'];
const PP_CABELO=['#1b1b1b','#2e1f17','#3b2a20','#6b4226','#a8743a','#d9b26f','#8a8a8a'];
function dimPessoas(){try{const p=paletaEm(plano.cen,progressoVisual());return clamp((p.luz||0)*.5+(plano.cen.astro==='lua'?.15:0),0,.6);}catch(e){return 0;}}
function pessoa(x,y,o){
  o=o||{};const R=Math.random,pk=a=>a[Math.floor(R()*a.length)],dm=o.dim!=null?o.dim:dimPessoas();
  const c=v=>dm>0?misturar(v,'#14131f',dm):v,n=v=>Math.round(v*10)/10;
  const roupa=c(o.roupa||pk(PP_ROUPA)),calca=c(pk(PP_CALCA)),pele=c(pk(PELES)),cab=c(pk(PP_CABELO)),sap=c('#1c1c22');
  const sc=(o.h||30)/30,pose=o.pose||'pe',senta=pose==='senta',pula=pose==='pula';
  const hip=senta?-8.5:-13.5,sh=hip-11,hy=n(sh-3.6),Y=v=>n(sh+v);
  const L=(d,cor,w)=>'<path d="'+d+'" fill="none" stroke="'+cor+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
  let g='';
  if(senta)g+=L('M-1.4 '+hip+'L6 '+hip+'L6.4 -.8M1.4 '+n(hip+.4)+'L8.2 '+n(hip+.4)+'L8.6 -.8',calca,3.2)+L('M6.2 -.6H8.6M8.4 -.6H10.8',sap,1.8);
  else if(pula)g+=L('M-1.8 '+hip+'L-3.6 -6.4L-1.6 -.8M1.8 '+hip+'L3.8 -6.8L2.8 -.8',calca,3.2)+L('M-1.8 -.6H.4M2.6 -.6H4.8',sap,1.8);
  else g+=L('M-1.7 '+hip+'L-2.2 -.8M1.7 '+hip+'L2.2 -.8',calca,3.2)+L('M-2.4 -.6H-.2M2 -.6H4.2',sap,1.8);
  const oE='-3.6 '+Y(1.4),oD='3.6 '+Y(1.4);let bE,bD,item='',jornal=o.item==='jornal';
  if(pose==='bracos'||pula){bE=oE+'L-5.2 '+Y(-3.4)+'L-5.6 '+Y(-8);bD=oD+'L5.2 '+Y(-3.4)+'L5.6 '+Y(-8);}
  else if(jornal){bE=oE+'L-1.6 '+Y(6)+'L6.4 '+Y(6.4);bD=oD+'L5.4 '+Y(5.2)+'L7.4 '+Y(4.2);}
  else if(o.item){bE=oE+'L-4.8 '+Y(5.4)+'L-5 '+Y(10);bD=oD+'L5 '+Y(5.6)+'L8.6 '+Y(5);
    item=o.item==='coco'?'<circle cx="10.2" cy="'+Y(4)+'" r="2.5" fill="'+c('#6a9a3a')+'"/><path d="M10.6 '+Y(1.6)+'L11.8 '+Y(-1.6)+'" stroke="'+c('#f4f1e6')+'" stroke-width=".7"/>'
      :o.item==='copo'?'<rect x="8.6" y="'+Y(2)+'" width="2.6" height="3.6" rx=".4" fill="'+c('#f1f1ea')+'"/>'
      :'<rect x="8.2" y="'+Y(3.6)+'" width="4.4" height="2.6" rx="1.1" fill="'+c('#e0a050')+'"/>';}
  else{bE=oE+'L-4.9 '+Y(5.4)+'L-5.2 '+Y(10);bD=oD+'L4.9 '+Y(5.4)+'L5.2 '+Y(10);}
  if(!jornal)g+=L('M'+bE,pele,2.1);
  g+='<path fill="'+roupa+'" d="M-4.4 '+Y(1.8)+'Q-4.4 '+sh+' -2.6 '+sh+'H2.6Q4.4 '+sh+' 4.4 '+Y(1.8)+'L4.7 '+n(hip+.8)+'H-4.7Z"/>';
  if(jornal)g+='<rect x="6" y="'+Y(.8)+'" width="6.4" height="8.6" rx=".6" fill="'+c('#ecebe2')+'"/><path d="M7.2 '+Y(3)+'h4M7.2 '+Y(4.8)+'h4M7.2 '+Y(6.6)+'h3" stroke="'+c('#9a9a94')+'" stroke-width=".7"/>'+L('M'+bE,pele,2.1);
  g+=L('M'+bD,pele,2.1)+item+'<circle cx="-3.7" cy="'+Y(1.9)+'" r="2" fill="'+roupa+'"/><circle cx="3.7" cy="'+Y(1.9)+'" r="2" fill="'+roupa+'"/>';
  g+='<circle cx=".4" cy="'+hy+'" r="3.5" fill="'+pele+'"/>';
  const est=o.cabelo||pk(['curto','curto','longo','coque','bone']);
  if(est==='bone'){const b=c(pk(PP_ROUPA));g+='<path fill="'+b+'" d="M-3.5 '+n(hy-.1)+'A3.8 3.7 0 0 1 4.1 '+n(hy-.1)+'Z"/>'+L('M3 '+n(hy-.4)+'H6.8',b,1.4);}
  else{g+='<path fill="'+cab+'" d="M-3.7 '+n(hy+1.2)+'A3.8 3.8 0 0 1 4 '+n(hy-1)+'L-.6 '+n(hy-.8)+'L-1.8 '+n(hy+1.8)+'Z"/>';
    if(est==='longo')g+='<path fill="'+cab+'" d="M-3.9 '+hy+'H-1.4V'+n(hy+6)+'H-3.6Z"/>';
    if(est==='coque')g+='<circle cx="-2.8" cy="'+n(hy-3)+'" r="1.8" fill="'+cab+'"/>';}
  return '<g transform="translate('+n(x)+' '+n(y)+') scale('+n(sc*(o.esq?-1:1))+' '+n(sc)+')"><g'+(o.anim?' class="'+o.anim+'"':'')+'>'+g+'</g></g>';
}
/* cachorros: trote calculado (pares diagonais), pata de apoio presa no chão, rabo abanando */
const RACAS={
 caramelo:{nome:'Caramelo',corpo:'#c98a4b',claro:'#f1d6ac',escuro:'#9a6234',rx:10,ry:4.8,a:6,b:6.4,orelha:'ponta',rabo:'enrolado',dur:.46},
 collie:{nome:'Border collie',corpo:'#25262b',claro:'#f4f1ea',escuro:'#141518',rx:10.6,ry:4.9,a:6.6,b:7,orelha:'meia',rabo:'longo',dur:.5},
 salsicha:{nome:'Salsicha',corpo:'#a24f2a',claro:'#d98a5c',escuro:'#6e3218',rx:13.5,ry:4.4,a:2.9,b:3.1,orelha:'caida',rabo:'fino',dur:.3}};
let CAO_RACA='caramelo';
try{const v=localStorage.getItem('ct-cao');if(RACAS[v])CAO_RACA=v;}catch(e){}
function caoSVG(raca){
  const R=RACAS[raca]||RACAS.caramelo,N=16,G=29.2,TAU=Math.PI*2,f=v=>Math.round(v*10)/10;
  const cx=22,baseY=G-R.a-R.b-R.ry*.55,fx=cx+R.rx*.68,hx=cx-R.rx*.66;
  const pernas=[{x:fx,ph:0,fr:1,perto:1},{x:hx,ph:.5,fr:0,perto:1},{x:fx+.8,ph:.5,fr:1,perto:0},{x:hx+.8,ph:0,fr:0,perto:0}];
  const quadro=q=>pernas.map(L=>{const t=TAU*(q+L.ph),th=.3*Math.sin(t)+(L.fr?.02:.06),dob=.85*Math.max(0,Math.cos(t));
    const a1=th+(L.fr?0:.32),a2=th-(L.fr?dob:dob*.85)-(L.fr?0:.5);
    const kx=Math.sin(a1)*R.a,ky=Math.cos(a1)*R.a,px=kx+Math.sin(a2)*R.b,py=ky+Math.cos(a2)*R.b;return {kx,ky,px,py};});
  const V=[[],[],[],[]],bob=[];
  for(let i=0;i<=N;i++){const q=(i%N)/N,Q=quadro(q),low=Math.max(...Q.map(o=>o.py));
    const ay=G-1-low;bob.push(f(ay-(baseY+R.ry*.55)));
    Q.forEach((o,j)=>{const L=pernas[j];V[j].push('M'+f(L.x)+' '+f(ay)+'L'+f(L.x+o.kx)+' '+f(ay+o.ky)+'L'+f(L.x+o.px)+' '+f(ay+o.py));});}
  const an=v=>'<animate attributeName="d" dur="'+R.dur+'s" repeatCount="indefinite" values="'+v.join(';')+'"/>';
  const perna=(j,cor,w)=>'<path d="'+V[j][0]+'" fill="none" stroke="'+cor+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round">'+an(V[j])+'</path>';
  const lw=raca==='salsicha'?2.4:2.3,by=baseY,hy=by-R.ry*.9,hxx=cx+R.rx+1.6;
  let cab='<ellipse cx="'+f(hxx)+'" cy="'+f(hy)+'" rx="3.6" ry="3.3" fill="'+R.corpo+'"/>'
    +'<path d="M'+f(hxx+1.6)+' '+f(hy-.4)+'h3.4a1.5 1.5 0 0 1 0 3h-3.4Z" fill="'+(raca==='collie'?R.claro:R.corpo)+'"/>'
    +'<circle cx="'+f(hxx+5.1)+'" cy="'+f(hy+.3)+'" r=".8" fill="#1b1b1b"/><circle cx="'+f(hxx+.9)+'" cy="'+f(hy-.9)+'" r=".55" fill="#1b1b1b"/>';
  if(raca==='collie')cab+='<path d="M'+f(hxx+.6)+' '+f(hy-3.1)+'l.5 3.4h1.2l.1-3.3Z" fill="'+R.claro+'"/>';
  if(R.orelha==='ponta')cab+='<path d="M'+f(hxx-2.6)+' '+f(hy-1.6)+'l.6-4.6 3 3.2Z" fill="'+R.escuro+'"/>';
  else if(R.orelha==='meia')cab+='<path d="M'+f(hxx-2.6)+' '+f(hy-1.8)+'l.4-3.8 2.4.6 .2 1.2Z" fill="'+R.escuro+'"/>';
  else cab+='<path d="M'+f(hxx-2.2)+' '+f(hy-2.2)+'q-1.6 2.6-.6 5.2l2.4-.6q.2-2.6-.4-4.6Z" fill="'+R.escuro+'"/>';
  const tx=cx-R.rx+.8,ty=by-R.ry*.5;let rabo;
  if(R.rabo==='enrolado')rabo='<path d="M'+f(tx)+' '+f(ty)+'q-4-2-2.6-6.2q1.8-2.2 3.2.2" fill="none" stroke="'+R.corpo+'" stroke-width="2.4" stroke-linecap="round"/>';
  else if(R.rabo==='longo')rabo='<path d="M'+f(tx)+' '+f(ty)+'q-5 1-7.6 4.2" fill="none" stroke="'+R.corpo+'" stroke-width="2.6" stroke-linecap="round"/><circle cx="'+f(tx-7.6)+'" cy="'+f(ty+4.2)+'" r="1.4" fill="'+R.claro+'"/>';
  else rabo='<path d="M'+f(tx)+' '+f(ty)+'q-3.4-.6-5.4-3.2" fill="none" stroke="'+R.corpo+'" stroke-width="1.5" stroke-linecap="round"/>';
  rabo='<g>'+rabo+'<animateTransform attributeName="transform" type="rotate" values="-14 '+f(tx)+' '+f(ty)+';16 '+f(tx)+' '+f(ty)+';-14 '+f(tx)+' '+f(ty)+'" dur=".42s" repeatCount="indefinite"/></g>';
  const corpo='<ellipse cx="'+cx+'" cy="'+f(by)+'" rx="'+R.rx+'" ry="'+R.ry+'" fill="'+R.corpo+'"/>'
    +'<ellipse cx="'+f(cx+R.rx*.45)+'" cy="'+f(by+R.ry*.45)+'" rx="'+f(R.rx*.42)+'" ry="'+f(R.ry*.55)+'" fill="'+R.claro+'"/>'
    +'<path d="M'+f(cx+R.rx*.55)+' '+f(by-R.ry*.6)+'L'+f(hxx-1)+' '+f(hy+.6)+'" stroke="'+R.corpo+'" stroke-width="4.4" stroke-linecap="round"/>'
    +'<ellipse cx="'+f(hx+.6)+'" cy="'+f(by+R.ry*.35)+'" rx="'+f(R.a*.55)+'" ry="'+f(R.ry*.85)+'" fill="'+R.corpo+'"/>'
    +'<ellipse cx="'+f(fx-.2)+'" cy="'+f(by+R.ry*.35)+'" rx="'+f(R.a*.42)+'" ry="'+f(R.ry*.75)+'" fill="'+R.corpo+'"/>';
  const g='<g>'+rabo+corpo+cab+'<animateTransform attributeName="transform" type="translate" values="'+bob.map(b=>'0 '+b).join(';')+'" dur="'+R.dur+'s" repeatCount="indefinite"/></g>';
  const pc=raca==='collie'?R.claro:R.escuro;
  return '<svg viewBox="0 0 46 30">'+perna(2,R.escuro,lw)+perna(3,R.escuro,lw)+g+perna(0,raca==='collie'?R.corpo:R.corpo,lw)+perna(1,R.corpo,lw)
    +(raca==='collie'?'':'')+'</svg>';
}
const SPR={
 garca:()=>({w:40,h:62,svg:'<svg viewBox="0 0 40 62"><path class="S-claro-st" d="M16 31c-2.4-6.2 2.6-9.4 1.6-15.2C17 12.6 14.4 11 11.6 11.6" fill="none" stroke-width="3.2" stroke-linecap="round"/><circle class="S-claro" cx="10.4" cy="12.4" r="3.4"/><path fill="#e2a83e" d="M7.6 11.6 .6 13.4 7.8 14.2Z"/><path class="S-claro" d="M12.5 33.5C13 27 20 25 27 26.5c5 1 9.5 2.4 12.5.5-1.6 4.6-6 8.6-12.6 9.4-7.3.8-14.6 1.2-14.4-2.9Z"/><path class="S-sil-st" d="M21.5 36.5 20.6 61M25 36.5 26.8 61" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'}),
 cachorro:o=>({w:46,h:30,rel:1.32,esq:1,ac:1,svg:caoSVG(o.raca||(o.ev?'caramelo':Object.keys(RACAS)[Math.floor(Math.random()*3)]))}),
 banco:()=>{const dm=dimPessoas(),R=Math.random;return {w:56,h:28,svg:'<svg viewBox="0 0 56 28"><g class="S-sil"><rect x="5" y="15" width="3" height="13"/><rect x="48" y="15" width="3" height="13"/><rect x="5" y="2" width="2.4" height="14"/><rect x="48.6" y="2" width="2.4" height="14"/></g><g class="S-madeira"><rect x="2" y="3" width="52" height="3.5" rx="1"/><rect x="2" y="9" width="52" height="3.5" rx="1"/><rect x="0" y="15" width="56" height="4" rx="1"/></g>'+(R()<.6?pessoa(15,28,{pose:'senta',h:40,dim:dm}):'')+(R()<.25?pessoa(35,28,{pose:'senta',h:40,dim:dm}):'')+'</svg>'};},
 placa:o=>({w:100,h:54,svg:'<svg viewBox="0 0 100 54"><rect class="S-sil" x="40" y="22" width="4.5" height="32"/><path class="S-madeira" d="M4 4H84L95 13.5 84 23H4Z"/><text x="44" y="17" text-anchor="middle" font-size="9" class="S-txt">'+esc(o.p||'')+'</text></svg>'}),
 bebedouro:()=>({w:26,h:40,svg:'<svg viewBox="0 0 26 40"><path class="S-sil" d="M9 15H17V40H9ZM5 10.5H21V15.5H5Z"/><path d="M13 10.5C13 5 18.5 2.8 23 6" fill="none" stroke="#a7dcf2" stroke-width="1.6" stroke-linecap="round" opacity=".9"/></svg>'}),
 portao:()=>({w:124,h:80,svg:'<svg viewBox="0 0 124 80"><g class="S-sil"><rect x="6" y="12" width="11" height="68"/><rect x="107" y="12" width="11" height="68"/><rect x="3" y="7" width="17" height="6"/><rect x="104" y="7" width="17" height="6"/></g><path class="S-madeira" d="M15 25Q62 6 109 25V35Q62 17 15 35Z"/><text x="62" y="25" text-anchor="middle" font-size="8.5" class="S-txt">PARQUE</text></svg>'}),
 ipe:()=>({w:80,h:100,svg:'<svg viewBox="0 0 80 100"><path class="S-sil" d="M37 100 38 64C33 55 26 51 19 49l1.5-2.5C28 48.5 34 53 39 59c2-9 8-15 16-18l1.5 2.5C49 47 44 53 42 63l1 37Z"/><g class="S-flor"><circle cx="21" cy="42" r="14"/><circle cx="39" cy="30" r="19"/><circle cx="58" cy="40" r="15"/><circle cx="47" cy="15" r="12"/><circle cx="27" cy="22" r="11"/><circle cx="64" cy="27" r="9"/></g><g class="S-flor2" opacity=".6"><circle cx="30" cy="38" r="4"/><circle cx="50" cy="31" r="3.4"/><circle cx="38" cy="18" r="3"/><circle cx="56" cy="46" r="3.2"/><circle cx="20" cy="46" r="2.8"/></g></svg>'}),
 passaros:()=>({w:96,h:30,ceu:1,abs:-26,svg:'<svg viewBox="0 0 96 30"><g class="S-ave-st" fill="none" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><g class="asa"><path d="M4 16Q9 10 14 16Q19 10 24 16"/></g><g class="asa d2"><path d="M30 8Q34 3 38 8Q42 3 46 8"/></g><g class="asa d3"><path d="M52 22Q57 16 62 22Q67 16 72 22"/></g><g class="asa d4"><path d="M76 12Q80 7 84 12Q88 7 92 12"/></g></g></svg>'}),
 gaivotas:()=>({w:110,h:36,ceu:1,abs:-30,svg:'<svg viewBox="0 0 110 36"><g class="S-claro-st" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><g class="asa"><path d="M4 18Q11 10 18 18Q25 10 32 18"/></g><g class="asa d2"><path d="M42 8Q48 2 54 8Q60 2 66 8"/></g><g class="asa d3"><path d="M74 24Q81 16 88 24Q95 16 102 24"/></g></g></svg>'}),
 quiosque:()=>{const dm=dimPessoas(),R=Math.random;return {w:96,h:72,svg:'<svg viewBox="0 0 96 72"><defs><clipPath id="qcl"><path d="M6 25 18 8H78L90 25Z"/></clipPath></defs><g class="S-sil"><rect x="16" y="25" width="3.4" height="47"/><rect x="77" y="25" width="3.4" height="47"/></g><path class="S-toldo" d="M6 25 18 8H78L90 25Z"/><g class="S-claro" clip-path="url(#qcl)"><rect x="24" y="0" width="10" height="30"/><rect x="45" y="0" width="10" height="30"/><rect x="66" y="0" width="10" height="30"/></g><g fill="#5f8a3a"><circle cx="24" cy="44.5" r="4"/><circle cx="32" cy="44.5" r="4"/><circle cx="66" cy="44.5" r="4"/></g>'+pessoa(48,66,{anim:'pp-mexe',dim:dm})+'<rect class="S-madeira" x="12" y="48" width="72" height="16" rx="2"/><text x="48" y="59" text-anchor="middle" font-size="7.5" class="S-txt">ÁGUA DE COCO</text>'+pessoa(88,72,{esq:1,item:'coco',dim:dm})+(R()<.65?pessoa(8,72,{item:R()<.5?'coco':null,dim:dm}):'')+'</svg>'};},
 rede:()=>{const dm=dimPessoas(),R=Math.random;return {w:100,h:58,svg:'<svg viewBox="0 0 100 58"><g class="S-sil"><rect x="4" y="12" width="3" height="46"/><rect x="93" y="12" width="3" height="46"/></g><g class="S-sil-st" stroke-width=".9" fill="none" opacity=".9"><path d="M7 14H93M7 21H93M7 28H93"/><path d="M15 14V28M23 14V28M31 14V28M39 14V28M47 14V28M55 14V28M63 14V28M71 14V28M79 14V28M87 14V28"/></g><g class="pp-bola"><circle class="S-claro" cx="64" cy="5" r="3.6"/></g>'+pessoa(28,58,{pose:'pula',anim:'pp-pula',dim:dm})+pessoa(76,58,{esq:1,pose:'bracos',dim:dm})+'</svg>'};},
 farol:()=>({w:46,h:116,svg:'<svg viewBox="0 0 46 116"><circle class="S-luzfarol" cx="23" cy="25" r="17"/><path class="S-claro" d="M13 108 16.5 34H29.5L33 108Z"/><path class="S-toldo" d="M14.2 82 15.1 64H30.9L31.8 82ZM15.7 50 16.2 40H29.8L30.3 50Z"/><rect class="S-sil" x="15" y="20" width="16" height="13"/><path class="S-sil" d="M13 20 23 9 33 20Z"/><rect fill="#ffe6a6" class="S-luz" x="17.5" y="23" width="11" height="7"/><rect class="S-sil" x="7" y="106" width="32" height="10"/></svg>'}),
 capivara:()=>({w:66,h:38,rel:-.18,cls:'anda',svg:'<svg viewBox="0 0 66 38"><g class="capi"><path class="S-capi" d="M15 12C15 7 21 5 27 6l22 1c10 1 14 8 13 15-1 6-6 8-11 8H23c-8 0-13-3-14-7l-4.4-1.6c-2.8-1-3-5-1-6.8l4.8-2.8c2.2-1.2 4.6-1 6.6.2Z"/><ellipse class="S-capi" cx="16.5" cy="7.4" rx="2.4" ry="3"/><circle fill="#141414" cx="10.6" cy="15" r="1.1"/></g><g class="S-capi-st" stroke-width="4.2" stroke-linecap="round" fill="none"><path d="M23 29V36M31 29V36M47 29V36M55 29V36"/></g></svg>'}),
 tucano:()=>({w:48,h:46,galho:1,svg:'<svg viewBox="0 0 48 46"><path class="S-sil-st" d="M0 36Q20 31 48 38" stroke-width="3.6" fill="none" stroke-linecap="round"/><path fill="#121416" d="M21 34c-6.5-2-7.5-11-4.5-17 2.1-5 8.1-6 11.1-3 3 4 2 15-3 20Z"/><path fill="#121416" d="M22.6 33 18.6 44 24 35Z"/><path fill="#f2ede0" d="M18.4 18c-1 3 0 6.2 3 7.2 2-3 3-7.2 1-10.2Z"/><path fill="#ff8a1f" d="M23 14c6-4 16-4 23 .2-7 1.8-15 3.8-21 3.8Z"/><circle fill="#6fc6f0" cx="22" cy="15" r="1.8"/><circle fill="#101010" cx="22" cy="15" r=".8"/></svg>'}),
 ponte:()=>({w:132,h:38,svg:'<svg viewBox="0 0 132 38"><path class="S-claro" opacity=".35" d="M0 30H132V38H0Z"/><g class="S-sil"><rect x="3" y="7" width="3" height="15"/><rect x="35" y="4" width="3" height="13"/><rect x="64.5" y="3" width="3" height="12"/><rect x="94" y="4" width="3" height="13"/><rect x="126" y="7" width="3" height="15"/></g><path class="S-madeira" d="M0 18Q66 8 132 18V24Q66 14 0 24Z"/><path class="S-sil-st" d="M0 8Q66-2 132 8" stroke-width="2.6" fill="none"/></svg>'}),
 banca:()=>{const dm=dimPessoas(),R=Math.random;return {w:70,h:56,svg:'<svg viewBox="0 0 70 56"><rect class="S-sil" x="4" y="10" width="62" height="46"/><rect class="S-toldo" x="0" y="3" width="70" height="10" rx="1.5"/><text x="35" y="10.6" text-anchor="middle" font-size="6.5" class="S-txt">BANCA</text><g opacity=".85"><rect x="10" y="19" width="9" height="12" fill="#e9c46a"/><rect x="21" y="19" width="9" height="12" fill="#e76f51"/><rect x="32" y="19" width="9" height="12" fill="#2a9d8f"/><rect x="43" y="19" width="9" height="12" fill="#f4f1de"/><rect x="54" y="19" width="7" height="12" fill="#8ecae6"/></g><rect class="S-madeira" x="8" y="35" width="54" height="5"/>'+pessoa(63,56,{esq:1,item:'jornal',dim:dm})+'</svg>'};},
 gato:()=>({w:150,h:64,svg:'<svg viewBox="0 0 150 64"><rect class="S-madeira" x="0" y="30" width="150" height="34"/><rect class="S-sil" x="-2" y="26" width="154" height="6" rx="1.5"/><g stroke="rgba(0,0,0,.28)" stroke-width="1"><path d="M0 40H150M0 50H150M0 60H150M18 32v8M48 32v8M78 32v8M108 32v8M138 32v8M33 40v10M63 40v10M93 40v10M123 40v10M18 50v10M48 50v10M78 50v10M108 50v10M138 50v10"/></g><g transform="translate(14 8)"><path fill="#4f8a3a" d="M10 18C5 15 3 9 4 3c3 3 6 8 6 15ZM10 18c1-6 4-10 9-12-1 5-4 9-9 12Z"/><path fill="#c46a46" d="M3 18h14l-2 8H5Z"/></g><g transform="translate(64 -9) scale(1.6)"><path fill="#121018" d="M22 22c-1-6 0-10 3-12l-1-4 3 2.4 3-2.4-.6 4.2c2.4 2 3 6 2 11.8Z"/><path d="M30 21c3 1 4.6 4.6 3.6 10" fill="none" stroke="#121018" stroke-width="2.2" stroke-linecap="round"/><circle cx="25.4" cy="11.6" r=".95" fill="#ffd84a"/><circle cx="28.4" cy="11.6" r=".95" fill="#ffd84a"/></g></svg>'}),
 foodtruck:()=>{const dm=dimPessoas(),R=Math.random;return {w:96,h:58,svg:'<svg viewBox="0 0 96 58"><defs><clipPath id="ftjan"><rect x="16" y="18" width="40" height="14" rx="1.5"/></clipPath></defs><rect class="S-toldo" x="4" y="12" width="78" height="34" rx="5"/><path class="S-toldo" d="M82 22h7l5 10v14H82Z"/><rect class="S-sil" x="16" y="18" width="40" height="14" rx="1.5"/><rect fill="#ffe6a6" class="S-luz" x="16" y="18" width="40" height="14" rx="1.5"/><g clip-path="url(#ftjan)">'+pessoa(34,50,{anim:'pp-mexe',dim:dm})+'</g><path class="S-claro" d="M12 14h48l-3 6H15Z"/><text x="36" y="42" text-anchor="middle" font-size="7" class="S-txt">LANCHES</text><circle fill="#141414" cx="22" cy="48" r="7"/><circle fill="#141414" cx="72" cy="48" r="7"/><circle class="S-claro" cx="22" cy="48" r="2.4"/><circle class="S-claro" cx="72" cy="48" r="2.4"/>'+pessoa(8,56,{item:R()<.5?'copo':null,dim:dm})+pessoa(64,56,{esq:1,item:'lanche',dim:dm})+'</svg>'};},
 semaforo:o=>{const vm=o.p==='vermelho';return {w:24,h:80,svg:'<svg viewBox="0 0 24 80"><rect class="S-sil" x="10.5" y="34" width="3" height="46"/><rect fill="#15181c" x="4" y="0" width="16" height="36" rx="3.4"/>'+(vm?'<circle cx="12" cy="8" r="9.5" fill="#ff4a4a" opacity=".28"/>':'<circle cx="12" cy="28" r="9.5" fill="#45e07a" opacity=".28"/>')+'<circle cx="12" cy="8" r="4.2" fill="'+(vm?'#ff4a4a':'#4a2424')+'"/><circle cx="12" cy="18" r="4.2" fill="#4a4224"/><circle cx="12" cy="28" r="4.2" fill="'+(vm?'#1f3a26':'#45e07a')+'"/></svg>'};},
 ciclista:o=>{const ult=o.p==='ult',P=pernasCiclista(),cor=o.heroi?HEROI_COR:CORES_CIC[Math.floor(Math.random()*CORES_CIC.length)],pele=o.heroi?'#c68d63':PELES[Math.floor(Math.random()*PELES.length)],dur='.62s';
   const anim=v=>'<animate data-k="pe" attributeName="d" dur="'+dur+'" repeatCount="indefinite" values="'+v.join(';')+'"/>';
   const roda=cx=>'<circle cx="'+cx+'" cy="42" r="10.5" fill="none" stroke="#15171b" stroke-width="2.6"/><g stroke="#545a64" stroke-width=".8"><path d="M'+cx+' 32V52M'+(cx-10)+' 42H'+(cx+10)+'M'+(cx-7)+' 35l14 14M'+(cx+7)+' 35l-14 14"/><animateTransform data-k="roda" attributeName="transform" type="rotate" from="0 '+cx+' 42" to="360 '+cx+' 42" dur=".5s" repeatCount="indefinite"/></g>';
   return {w:66,h:54,rel:ult?.55:1.18,esq:ult?0:1,ac:ult?0:1,svg:'<svg viewBox="0 0 66 54">'+roda(13)+roda(53)
    +'<path d="'+P.longe[0]+'" fill="none" stroke="'+misturar(cor.short,'#000000',.35)+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+anim(P.longe)+'</path>'
    +'<path d="M13 42 25 28H45L53 42M25 28 32 42H45V28M45 28 42 22H49M25 28 23 24" fill="none" stroke="'+cor.bike+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'
    +'<g><path d="M32 42H37.2M32 42H26.8" stroke="#2a2d34" stroke-width="1.8" stroke-linecap="round"/><animateTransform data-k="pe" attributeName="transform" type="rotate" from="0 32 42" to="360 32 42" dur="'+dur+'" repeatCount="indefinite"/></g>'
    +'<path fill="#262a30" d="M19 22h9v2.6h-9Z"/><path d="M24 21 38 13" stroke="'+cor.camisa+'" stroke-width="5.4" stroke-linecap="round"/><path d="M37 14 44 23" stroke="'+pele+'" stroke-width="2.4" stroke-linecap="round"/>'
    +'<circle fill="'+pele+'" cx="41" cy="9" r="4.2"/><path fill="'+cor.capacete+'" d="M36.4 8.4a5 5 0 0 1 9.4-1.6l-1 1.4Z"/>'
    +'<path d="'+P.perto[0]+'" fill="none" stroke="'+cor.short+'" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">'+anim(P.perto)+'</path></svg>'};},
 porteira:()=>({w:96,h:46,svg:'<svg viewBox="0 0 96 46"><g class="S-madeira"><rect x="4" y="2" width="7" height="44"/><rect x="85" y="2" width="7" height="44"/><rect x="11" y="10" width="74" height="4"/><rect x="11" y="20" width="74" height="4"/><rect x="11" y="30" width="74" height="4"/><path d="M12 33 82 10l1.6 3.6-70 23Z"/></g></svg>'}),
 vaca:()=>({w:64,h:42,svg:'<svg viewBox="0 0 64 42"><g class="S-sil"><rect x="19" y="27" width="3.4" height="15"/><rect x="26" y="27" width="3.4" height="15"/><rect x="44" y="27" width="3.4" height="15"/><rect x="51" y="27" width="3.4" height="15"/></g><path class="S-claro" d="M16 12h34c6 0 9 4 9 9v3c0 3-2 5-5 5H18c-4 0-6-2-6-5v-6Z"/><path class="S-claro" d="M16 13l-6-3c-4-1-8 1-9 5l-.5 4c0 2 2 4 4 4h6l5-4Z"/><g fill="#1d1b1f"><path d="M24 13c4 0 6 3 5 7-2 3-6 3-8 1-1-3 0-7 3-8Z"/><path d="M40 16c3-1 6 1 6 4s-3 5-6 4c-2-1-3-6 0-8Z"/><circle cx="6" cy="16" r="1"/></g><path fill="#f2b8b8" d="M.6 18c0 2 1.6 3.6 3.6 3.6L6 19Z"/><path class="S-sil-st" d="M59 18c3 2 4 7 2 12M10 9 7 5M14 9l1-4" fill="none" stroke-width="1.6" stroke-linecap="round"/></svg>'}),
 celeiro:()=>({w:96,h:80,svg:'<svg viewBox="0 0 96 80"><path class="S-toldo" d="M8 34 18 14 48 4 78 14 88 34V80H8Z"/><path class="S-sil" d="M4 36 18 12 48 1 78 12 92 36 88 37 76 16 48 6 20 16 8 37Z"/><rect class="S-claro" x="34" y="48" width="28" height="32"/><path class="S-toldo-st" d="M34 48 62 80M62 48 34 80" stroke-width="2.4"/><rect class="S-claro" x="42" y="22" width="12" height="12"/></svg>'}),
 moinho:()=>{let pas='';for(let i=0;i<8;i++)pas+='<path transform="rotate('+(i*45)+' 30 26)" d="M30 26 29 6 33 7Z"/>';
   return {w:60,h:110,svg:'<svg viewBox="0 0 60 110"><g class="S-sil-st" stroke-width="2" fill="none" stroke-linecap="round"><path d="M21 110 28 30M39 110 32 30M23 92h14M24.6 72h10.8M26.2 52h7.6M21 110l16-38M39 110 23 72"/></g><path class="S-sil" d="M33 23h13l4 3-4 3H33Z"/><g class="pas S-claro">'+pas+'<circle cx="30" cy="26" r="3"/></g></svg>'};},
 boneco:()=>({w:42,h:60,svg:'<svg viewBox="0 0 42 60"><g class="S-neve"><circle cx="21" cy="47" r="13"/><circle cx="21" cy="27" r="9.5"/><circle cx="21" cy="12.5" r="7"/></g><g class="S-sil-st" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M12 26 2 19M30 26l10-8"/></g><path fill="#16141c" d="M13 7h16v2.4H13ZM15.5 0h11v7.4h-11Z"/><path fill="#d9433b" d="M13.5 18h15v3.4h-15ZM24 20h3.4v8H24Z"/><path fill="#f08a2a" d="M21 12.4l8 1.6-8 1.2Z"/><g fill="#16141c"><circle cx="18.6" cy="10.6" r=".9"/><circle cx="23" cy="10.6" r=".9"/><circle cx="21" cy="25" r="1"/><circle cx="21" cy="30" r="1"/></g></svg>'}),
 raposa:()=>({w:60,h:34,rel:-.2,cls:'anda',svg:'<svg viewBox="0 0 60 34"><g class="capi"><path fill="#e07a36" d="M14 14c2-3 6-4 10-4h16c5 0 8 3 8 7v2c0 3-2 5-6 5H22c-5 0-8-2-9-5L4 17c-1.4-.6-1.4-2.6 0-3.2L12 11Z"/><path fill="#e07a36" d="M47 15c6-4 12-3 13 1-2 4-7 6-12 5Z"/><path fill="#f4efe6" d="M57 15.6c1.6.6 2.6 1.6 3 2.4-1 1.8-2.6 2.8-4.6 3.2Z"/><path fill="#e07a36" d="M11 11.6 12.4 5 16 10.6Z"/><path fill="#f4efe6" d="M4 17l6-1.6 2.6 2.6c-3 .8-6 .4-8.6-1Z"/><circle fill="#141414" cx="11" cy="13.2" r=".9"/><circle fill="#141414" cx="3.4" cy="15.6" r=".9"/></g><g stroke="#3a2418" stroke-width="2.6" stroke-linecap="round"><path d="M20 23v9M27 23v9M38 23v9M44 23v9"/></g></svg>'}),
 cabana:()=>({w:96,h:84,svg:'<svg viewBox="0 0 96 84"><g class="fumaca"><circle class="S-claro" opacity=".45" cx="70" cy="10" r="5"/><circle class="S-claro" opacity=".35" cx="74" cy="2" r="6.5"/></g><rect class="S-sil" x="64" y="12" width="9" height="20"/><path class="S-madeira" d="M10 40H86V84H10Z"/><g class="S-sil-st" stroke-width="1" opacity=".5"><path d="M10 48H86M10 56H86M10 64H86M10 72H86"/></g><path class="S-sil" d="M4 44 48 15 92 44Z"/><path class="S-neve" d="M2 44 48 13 94 44 90 45.5 48 18.5 6 45.5Z"/><rect class="S-sil" x="20" y="54" width="18" height="16"/><rect fill="#ffd27a" class="S-luz" x="21.5" y="55.5" width="15" height="13"/><rect class="S-sil" x="56" y="54" width="18" height="30"/></svg>'}),
 iglu:()=>({w:74,h:42,svg:'<svg viewBox="0 0 74 42"><path class="S-neve" d="M4 42C4 18 20 4 37 4s33 14 33 38Z"/><g class="S-sil-st" stroke-width="1" fill="none" opacity=".25"><path d="M8 32H66M14 21H60M24 12H50M24 42V32M44 32V21M32 21V12M54 42V32"/></g><path fill="#1a1626" d="M50 42V33c0-3 3-6 6-6s6 3 6 6v9Z"/><path fill="#ffb25a" class="S-luz" d="M51.4 42V33.4c0-2.6 2-4.6 4.6-4.6s4.6 2 4.6 4.6V42Z"/></svg>'}),
 coruja:()=>({w:32,h:54,svg:'<svg viewBox="0 0 32 54"><rect class="S-madeira" x="11" y="30" width="10" height="24"/><path class="S-claro" d="M16 4c7 0 11 6 11 13 0 8-5 13-11 13S5 25 5 17C5 10 9 4 16 4Z"/><g fill="#141414" opacity=".5"><circle cx="11" cy="21" r=".9"/><circle cx="16" cy="24" r=".9"/><circle cx="21" cy="21" r=".9"/></g><circle fill="#f6c431" cx="12" cy="13" r="3"/><circle fill="#f6c431" cx="20" cy="13" r="3"/><circle fill="#141414" cx="12" cy="13" r="1.4"/><circle fill="#141414" cx="20" cy="13" r="1.4"/><path fill="#3a3530" d="M16 15l-1.6 2.4h3.2Z"/></svg>'}),
 fogueira:()=>{const dm=dimPessoas(),R=Math.random;return {w:46,h:44,svg:'<svg viewBox="0 0 46 44"><circle fill="#ffb24a" opacity=".22" cx="23" cy="26" r="20"/><g class="chama"><path fill="#ff7a2a" d="M23 6c6 7 10 12 10 19a10 10 0 0 1-20 0c0-5 3-8 5-11 1 3 3 4 4 4-1-4 0-8 1-12Z"/><path fill="#ffd25a" d="M23 18c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 3-7 0 1.4 1 2.4 2 2.4Z"/></g><g class="S-madeira"><rect x="6" y="35" width="34" height="5" rx="2.5" transform="rotate(-12 23 37)"/><rect x="6" y="35" width="34" height="5" rx="2.5" transform="rotate(12 23 37)"/></g>'+pessoa(0,44,{pose:'senta',h:32,dim:.5})+pessoa(46,44,{pose:'senta',esq:1,h:32,dim:.5})+'</svg>'};},
 buggy:()=>({w:86,h:46,rel:1.7,esq:1,svg:'<svg viewBox="0 0 86 46"><path class="S-sil-st" d="M26 22 34 4H56L62 20" fill="none" stroke-width="2.6"/><path class="S-toldo" d="M6 26c0-4 3-7 7-7h52c6 0 12 3 14 9l1 4H6Z"/><circle fill="#2a2522" cx="44" cy="12" r="5"/><circle fill="#16141a" cx="20" cy="34" r="10"/><circle fill="#16141a" cx="68" cy="34" r="10"/><circle class="S-claro" cx="20" cy="34" r="3.4"/><circle class="S-claro" cx="68" cy="34" r="3.4"/></svg>'}),
 pombo:()=>({w:28,h:22,cls:'bica',svg:'<svg viewBox="0 0 28 22"><g class="corpo"><path fill="#8b909c" d="M6 12c0-4 4-7 10-7 5 0 9 3 10 7l2 1-2 1c-1 4-5 6-10 6S6 17 6 12Z"/><path fill="#5d8a80" d="M9 9c1-3 3-5 5-5s3 2 3 4c-2 1-5 2-8 1Z"/><circle fill="#8b909c" cx="9" cy="6" r="3.6"/><path fill="#e0a83a" d="M5.6 6 2.6 7 5.8 7.6Z"/><circle fill="#141414" cx="8.4" cy="5.4" r=".8"/></g><path stroke="#c86a6a" stroke-width="1.4" d="M13 19v3M17 19v3"/></svg>'}),
 limpador:()=>({w:90,h:96,svg:'<svg viewBox="0 0 90 96"><g class="S-sil-st" stroke-width="1.4"><path d="M12 0V72M78 0V72"/></g><rect class="S-toldo" x="4" y="72" width="82" height="9" rx="1.5"/><rect class="S-sil" x="4" y="66" width="82" height="2"/><rect class="S-sil" x="4" y="66" width="2" height="8"/><rect class="S-sil" x="84" y="66" width="2" height="8"/><circle fill="#2a2a30" cx="44" cy="52" r="5"/><path fill="#e2a83e" d="M38 48a6 6 0 0 1 12 0Z"/><path class="S-claro" d="M38 57h12l2 15H36Z"/><path class="S-sil-st" stroke-width="2.4" d="M50 60l10-10M58 46l6 6" stroke-linecap="round"/></svg>'}),
 vaso:()=>({w:34,h:40,svg:'<svg viewBox="0 0 34 40"><g fill="#4f8a3a"><path d="M17 22C10 18 6 10 8 2c4 4 8 10 9 20Z"/><path d="M17 22c2-8 6-14 13-16-1 7-6 13-13 16Z"/><path d="M17 22c-4-4-11-5-15-2 4 3 10 4 15 2Z"/></g><path fill="#c46a46" d="M7 22h20l-3 18H10Z"/><rect fill="#a65636" x="6" y="21" width="22" height="4" rx="1"/></svg>'}),
 heliponto:()=>({w:150,h:70,svg:'<svg viewBox="0 0 150 70"><rect class="S-sil" x="0" y="52" width="150" height="18"/><g class="S-sil-st" stroke-width="1.6"><path d="M0 40H150M10 40v12M40 40v12M70 40v12M100 40v12M130 40v12"/></g><circle cx="98" cy="22" r="20" fill="#20242a"/><circle cx="98" cy="22" r="17" fill="none" stroke="#f4c430" stroke-width="2"/><path d="M90 12v20M106 12v20M90 22h16" stroke="#f4f1e6" stroke-width="3.2" fill="none"/><rect class="S-sil" x="96.5" y="42" width="3" height="10"/><circle fill="#ff4a4a" cx="8" cy="36" r="2.4"/></svg>'}),
 lanterna:()=>({w:96,h:96,svg:'<svg viewBox="0 0 96 96"><circle fill="#ffe2a0" opacity=".3" cx="48" cy="42" r="40"/><path class="S-toldo" d="M30 26c0-10 8-18 18-18s18 8 18 18Z"/><rect class="S-sil" x="46.5" y="1" width="3" height="8"/><rect class="S-sil" x="28" y="26" width="40" height="4"/><rect fill="#ffe6a6" x="32" y="30" width="32" height="28"/><g class="S-sil-st" stroke-width="2"><path d="M42 30v28M54 30v28"/></g><rect class="S-sil" x="20" y="58" width="56" height="5"/><g class="S-sil-st" stroke-width="1.6"><path d="M20 58V48M76 58V48M20 48H76M30 48v10M40 48v10M56 48v10M66 48v10"/></g><rect class="S-claro" x="26" y="63" width="44" height="33"/></svg>'}),
 cabra:()=>({w:50,h:44,svg:'<svg viewBox="0 0 50 44"><path class="S-sil" d="M0 44 6 34h40l4 10Z"/><path class="S-claro" d="M14 18c0-3 3-5 7-5h14c4 0 7 2 7 6v4c0 3-2 5-5 5H19c-3 0-5-2-5-5Z"/><path class="S-claro" d="M15 19 9 14c-2-2-2-6 1-7l4-1 4 6Z"/><path class="S-sil-st" d="M12 7c2-4 6-5 9-3M11 8c1-3 4-5 7-4" fill="none" stroke-width="1.6" stroke-linecap="round"/><circle fill="#141414" cx="11.5" cy="10" r=".9"/><g class="S-sil-st" stroke-width="2.6" stroke-linecap="round"><path d="M19 27v8M25 27v8M35 27v8M40 27v8"/></g></svg>'}),
 bandeira:()=>({w:54,h:74,svg:'<svg viewBox="0 0 54 74"><path class="S-sil" d="M0 74 8 62h36l10 12Z"/><rect class="S-sil" x="14" y="4" width="2.6" height="60"/><path class="S-toldo flamula" d="M16.6 5c8-2 14 3 22 1s10-3 14-2v18c-4-1-7 0-14 2s-14-3-22-1Z"/></svg>'})
};

/* ---------- motor do cenário ---------- */
const C={W:0,H:0,bt:0,chao:0,band:0,esc:1,seaTop:0,base:64,eixo:'x',camadas:[],afunda:[],sprites:[],vel:0,velAlvo:0,raf:0,tUlt:0,
  fpsN:0,fpsT:0,fps:0,warm:0,baixos:0,tPal:0,ambT:0,ambProx:20,fix:null,forte:false};
function estimarFaixa(){
  const H=C.H,comp=H<=700;let bt,chao;
  if(C.fix&&C.fix.H===H){bt=C.fix.bt;chao=C.fix.chao;}else{bt=(comp?211:244);chao=H-(comp?334:380);}
  if(chao-bt<130)bt=chao-130;
  C.bt=bt;C.chao=chao;C.band=chao-bt;C.esc=clamp(C.band/219,.72,1.25);C.base=64*C.esc*(RITMO[modAtual]||1);C.seaTop=chao-C.band*.34;
}
function classeCena(){return 'cena nivel-'+nivel+(modo==='classico'?' oculta':'')+(fase==='run'&&!relogio.rodando?' pausada':'')+(C.forte?' forte':'');}
function montarCena(){
  const el=$('cena'),r=HOST.getBoundingClientRect(),cen=plano.cen;
  C.W=Math.round(r.width);C.H=Math.round(r.height);C.eixo=cen.eixo||'x';estimarFaixa();
  el.innerHTML='';el.className=classeCena();C.camadas=[];C.afunda=[];C.sprites=[];
  const rng=rngDe((plano.seed^0x9e3779b9)>>>0);
  el.insertAdjacentHTML('beforeend','<div class="ceu"></div><div class="ct-sol'+(cen.astro==='lua'?' ct-lua':'')+'" id="sol"></div>');
  if(cen.aurora)el.insertAdjacentHTML('beforeend','<div class="aurora" style="top:'+Math.round(C.bt-60)+'px;height:'+Math.round(C.band*.8)+'px"><i></i><i></i></div>');
  const mundo=document.createElement('div');mundo.className='mundo';mundo.id='mundo';
  mundo.style.transformOrigin=C.eixo==='y'?'60% 50%':'50% '+C.chao+'px';
  const cl=CLIMAS[plano.clima]||CLIMAS.limpo,lista=cen.camadas.slice();
  if(cl.nuvens&&C.eixo==='x'&&!lista.some(d=>d.t==='nuvens'))lista.unshift({t:'nuvens',f:.018,ceu:1,n:'AB'});
  for(const def of lista){
    if(def.n.indexOf(nivel)<0&&!(cl.nuvens&&nivel==='B'&&def.t.indexOf('nuvens')===0))continue;
    const fv=(def.t==='nuvens'||def.t==='nuvensV')&&cl.ventoNuvem?def.f*cl.ventoNuvem:def.f;
    const L=gerarCamada(def,rng);
    const fx=document.createElement('div');
    if(L.af){fx.className='afunda';fx.style.top=L.top+'px';fx.style.height=L.h+'px';fx.style.width=C.W+'px';fx.innerHTML=L.svg;mundo.appendChild(fx);C.afunda.push({el:fx,amt:L.amt});continue;}
    if(L.v){fx.className='ct-faixa v';fx.style.left=L.left+'px';fx.style.width=L.wv+'px';fx.style.height=(L.TH*2)+'px';fx.innerHTML=L.svg+L.svg;
      const cam={el:fx,f:fv,th:L.TH,y:rng()*L.TH,v:1};fx.style.transform='translate3d(0,'+(cam.y-L.TH).toFixed(1)+'px,0)';mundo.appendChild(fx);C.camadas.push(cam);continue;}
    fx.className='ct-faixa';fx.style.top=L.top+'px';fx.style.height=L.h+'px';fx.style.width=(L.TW*2)+'px';fx.innerHTML=L.svg+L.svg;
    const cam={el:fx,f:fv,tw:L.TW,x:rng()*L.TW};
    fx.style.transform='translate3d('+(-cam.x).toFixed(1)+'px,0,0)';
    (def.ceu?el:mundo).appendChild(fx);C.camadas.push(cam);
    if(def.reflexo){const rf=document.createElement('div');rf.className='reflexo';rf.style.left=f1(C.W*(cen.solX||.76)-26)+'px';rf.style.top=f1(C.seaTop)+'px';rf.style.height=f1(C.chao-C.seaTop)+'px';mundo.appendChild(rf);}
  }
  const sp=document.createElement('div');sp.className='sprites';sp.id='sprites';mundo.appendChild(sp);
  el.appendChild(mundo);criarHeroi();
  if(cl.nevoa){const nv=document.createElement('div');nv.className='nevoa';const cc=cen.astro==='lua'?'90,100,125':'214,222,227',a=cl.nevoa*.7;
    nv.style.background='linear-gradient(to bottom,rgba('+cc+',0) '+Math.max(0,C.bt-20)+'px,rgba('+cc+','+(a*.6).toFixed(2)+') '+Math.round(C.chao-C.band*.35)+'px,rgba('+cc+','+a.toFixed(2)+') '+C.chao+'px,rgba('+cc+',0) '+(C.chao+70)+'px)';el.appendChild(nv);}
  const box=document.createElement('div');box.className='particulas';
  if(nivel==='A'&&cen.part)addParticulas(box,cen.part,1);
  if(cl.part&&nivel!=='C')addParticulas(box,cl.part,nivel==='A'?1:.5);
  if(box.childElementCount)el.appendChild(box);
  const v=document.createElement('div');v.className='veucena';const bt=C.bt,ch=C.chao;
  const vt=C.eixo==='y'?[.78,.5]:[.62,.34];v.style.background='linear-gradient(to bottom,rgba(4,6,7,'+vt[0]+') 0px,rgba(4,6,7,'+vt[1]+') '+Math.max(1,bt-60)+'px,rgba(4,6,7,.07) '+(bt+10)+'px,rgba(4,6,7,.04) '+(ch-40)+'px,rgba(4,6,7,.4) '+(ch+14)+'px,rgba(4,6,7,.8) '+(ch+90)+'px,rgba(4,6,7,.9) '+C.H+'px)';
  el.appendChild(v);el.insertAdjacentHTML('beforeend','<div class="veuprev"></div>');
}
function addParticulas(box,tipo,m){
  const qtd={folhas:9,neve:16,polen:12,chuva:64,vento:14,nevasca:90,areia:22,nevoa:4}[tipo]||10,n=Math.max(1,Math.round(qtd*m)),R=Math.random;
  for(let i=0;i<n;i++){const d=document.createElement('div');let dur=6;
    if(tipo==='folhas'){d.className='p-folha';d.style.left=(10+R()*95)+'%';d.style.top=(C.bt-30)+'px';d.style.setProperty('--queda',(C.band+60)+'px');dur=6+R()*6;
      d.innerHTML='<svg viewBox="0 0 12 8" width="11" height="7"><path class="L-folha" d="M0 4Q6-3 12 4Q6 11 0 4Z"/></svg>';}
    else if(tipo==='polen'){d.className='p-polen';d.style.left=(10+R()*90)+'%';d.style.top=(C.bt+30+R()*C.band*.75)+'px';dur=5+R()*5;}
    else if(tipo==='neve'||tipo==='nevasca'){d.className='p-neve';const z=(tipo==='nevasca'?2.6+R()*3.4:2+R()*3);d.style.width=d.style.height=z.toFixed(1)+'px';
      if(tipo==='neve'){d.style.left=(10+R()*95)+'%';d.style.top=(C.bt-30)+'px';d.style.setProperty('--queda',(C.band+60)+'px');dur=5+R()*5;}
      else{d.style.left=(R()*130)+'%';d.style.top=(C.bt-30)+'px';d.style.setProperty('--queda',(C.band+70)+'px');d.style.setProperty('--drift',(-90-R()*90).toFixed(0)+'px');dur=1.6+R()*1.2;}}
    else if(tipo==='chuva'){d.className='p-chuva';d.style.left=(R()*120)+'%';d.style.top=(C.bt-50)+'px';d.style.setProperty('--queda',(C.band+90)+'px');dur=.42+R()*.3;}
    else if(tipo==='vento'||tipo==='areia'){d.className='p-vento'+(tipo==='areia'?' areia':'');d.style.left='100%';d.style.top=(C.bt+R()*(C.band+60))+'px';d.style.setProperty('--dist',(-(C.W+160))+'px');dur=tipo==='areia'?.5+R()*.5:.7+R()*.7;}
    else if(tipo==='nevoa'){d.className='p-nevoa';d.style.left=(R()*80-10)+'%';d.style.top=(C.chao-C.band*(.15+R()*.5))+'px';dur=16+R()*10;}
    d.style.animationDuration=dur.toFixed(2)+'s';d.style.animationDelay=(-R()*dur).toFixed(2)+'s';box.appendChild(d);}
}
function aplicarPaleta(p){
  const el=$('cena');if(!el)return;const pal=paletaEm(plano.cen,p);let s='';
  for(const k in pal)s+='--k-'+k+':'+(typeof pal[k]==='number'?pal[k].toFixed(3):pal[k])+';';
  s+='--hz:'+(C.chao/C.H*100).toFixed(1)+'%;--mc:'+(C.bt/C.H*100).toFixed(1)+'%;';
  el.style.cssText=s;
  const sol=$('sol'),cen=plano.cen;
  if(sol){const sx=C.W*(cen.solX||.76),q=clamp(p,0,1),alt=cen.astro==='lua'?(.25+.75*q):Math.sin(q*Math.PI);
    sol.style.transform='translate3d('+f1(sx)+'px,'+f1(C.chao-8-alt*C.band*.8)+'px,0)';}
  for(const a of C.afunda)a.el.style.transform='translate3d(0,'+f1(clamp(p,0,1)*a.amt)+'px,0)';
}
function progressoVisual(){if(fase==='run')return clamp(pos()/TOTAL,0,1);if(fase==='fim')return 1;return .03;}
function criarSprite(tipo,o,evento){
  const fn=SPR[tipo];if(!fn)return null;const d=fn(Object.assign({ev:!!evento},o||{})),k=C.esc,w=d.w*k,h=d.h*k,vert=C.eixo==='y';
  const el=document.createElement('div');el.className='sprite'+(d.cls?' '+d.cls:'');el.style.width=f1(w)+'px';el.style.height=f1(h)+'px';
  el.innerHTML=d.svg.replace('<svg ','<svg width="100%" height="100%" ');
  let x,y,f;
  if(d.ceu){y=C.bt+10+Math.random()*C.band*.22;f=.16;x=C.W+10;}
  else if(vert){f=1;x=(plano.cen.colX||.6)*C.W-w/2;y=-h-10;}
  else if(d.galho){y=C.chao-C.band*.38-h;f=.5;x=d.esq?-w-10:C.W+10;}
  else{y=C.chao+9*k-h;f=1;x=d.esq?-w-10:C.W+10;}
  if(nivel==='C'){if(d.ceu)x=C.W*.3;else if(vert)y=C.bt+C.band*.32-h/2;else x=C.W*.62-w/2;el.classList.add('fixo');}
  const sp={el,w,h,x,y,f,rel:d.rel||0,abs:(d.abs||0)*k,ceu:!!d.ceu,evento:!!evento,tipo,esq:!!d.esq,
    ac:(d.ac&&!vert&&nivel!=='C')?{st:0,t:0,alvo:C.heroi?Math.max(6,C.heroi.x-w*1.08-Math.random()*C.W*.04):C.W*(.16+Math.random()*.14),dur:evento?22:10}:null};
  el.style.transform='translate3d('+f1(x)+'px,'+f1(y)+'px,0)';
  const box=$('sprites');if(!box)return null;box.appendChild(el);
  if(nivel==='C'||(fase==='run'&&!relogio.rodando)){const sv=el.querySelector('svg');try{sv.pauseAnimations();}catch(e){}}
  C.sprites.push(sp);return sp;
}
/* companheiro (ciclista, caramelo): entra pela esquerda em ~2 s, pedala junto e depois fica para trás.
   Não depende da velocidade da cena, então sempre aparece e nunca some pela direita. */
function moverCompanheiro(sp,dt,g){
  const a=sp.ac;if(g<1)return 0;a.t+=dt;
  if(a.st===0){const d=a.alvo-sp.x,v=Math.max(70*C.esc,d*1.5);if(d<=v*dt){a.st=1;a.t=0;return d/dt;}return v;}
  if(a.st===1){const alvo=a.alvo+Math.sin(a.t*.6)*9*C.esc;if(a.t>a.dur){a.st=2;a.t=0;}return (alvo-sp.x)*2;}
  return -(24+a.t*30)*C.esc;
}
/* ciclista principal: é o aluno. Fica sempre na tela nas cenas de bike, a cadência acompanha a zona */
const CADENCIA={1:1.0,2:.86,3:.75,4:.64,5:.55};
/* corredor (você, na esteira): marcha calculada por cinemática — quadril, joelho e tornozelo por quadro,
   o pé de apoio fica sempre no chão (isso cria o sobe e desce natural). Caminha nas zonas 1–2, trota da 3 em diante. */
const HEROI_PE={camisa:'#ddff00',short:'#1f2328',tenis:'#00c9cc',pele:'#c68d63',cabelo:'#2e1f17'};
const CAD_PE={1:1.12,2:1.0,3:.74,4:.66,5:.6};
function corredorSVG(corre){
  const N=24,G=59,L1=11.8,L2=11.6,PE=4.4,TR=14.5,RD=Math.PI/180,f=v=>Math.round(v*10)/10,TAU=Math.PI*2;
  const bump=(q,c,w)=>{let d=Math.abs(q-c);d=Math.min(d,1-d);return Math.exp(-(d/w)*(d/w));};
  const P=corre?{amp:30,off:7,kSt:22,kSw:105,kc:.7,kw:.15,lean:10,eb:95,aamp:1.05,voo:1.6}
               :{amp:21,off:2,kSt:10,kSw:60,kc:.73,kw:.12,lean:3,eb:24,aamp:.8,voo:0};
  const perna=q=>{const th=(P.off+P.amp*Math.cos(TAU*(q-.85)))*RD,k=(4+P.kSt*bump(q,.12,.09)+P.kSw*bump(q,P.kc,P.kw))*RD;
    const kx=Math.sin(th)*L1,ky=Math.cos(th)*L1,a=th-k,ax=kx+Math.sin(a)*L2,ay=ky+Math.cos(a)*L2;
    const pa=a-(corre?.18:0)*Math.sin(TAU*q);return {th,kx,ky,ax,ay,tx:ax+Math.cos(pa)*PE,ty:ay-Math.sin(pa)*PE};};
  const V={pA:[],pB:[],cA:[],cB:[],tA:[],tB:[],bA:[],bB:[],tor:[],cin:[],cab:[],cabelo:[]};
  for(let i=0;i<=N;i++){
    const q=(i%N)/N,A=perna(q),B=perna((q+.5)%1);
    let hy=G-1.3-Math.max(A.ay,A.ty,B.ay,B.ty);
    if(corre)hy-=P.voo*Math.max(0,Math.sin(TAU*2*q-.6));
    const hx=19,ln=P.lean*RD,sx=hx+Math.sin(ln)*TR,sy=hy-Math.cos(ln)*TR,cx=sx+Math.sin(ln)*5.4+.4,cy=sy-Math.cos(ln)*5.4;
    const leg=L=>'M'+f(hx)+' '+f(hy)+'L'+f(hx+L.kx)+' '+f(hy+L.ky)+'L'+f(hx+L.ax)+' '+f(hy+L.ay);
    const coxa=L=>'M'+f(hx)+' '+f(hy)+'L'+f(hx+L.kx*.42)+' '+f(hy+L.ky*.42);
    const ten=L=>'M'+f(hx+L.ax-.6)+' '+f(hy+L.ay+.3)+'L'+f(hx+L.tx)+' '+f(hy+L.ty);
    const braco=L=>{const ang=-P.aamp*L.th+ln*.6,ex=sx+Math.sin(ang)*8.4,ey=sy+Math.cos(ang)*8.4,b=ang+P.eb*RD;
      return 'M'+f(sx)+' '+f(sy+1)+'L'+f(ex)+' '+f(ey)+'L'+f(ex+Math.sin(b)*7.4)+' '+f(ey+Math.cos(b)*7.4);};
    V.pA.push(leg(A));V.pB.push(leg(B));V.cA.push(coxa(A));V.cB.push(coxa(B));V.tA.push(ten(A));V.tB.push(ten(B));
    V.bA.push(braco(A));V.bB.push(braco(B));
    V.tor.push('M'+f(hx)+' '+f(hy-.8)+'L'+f(sx)+' '+f(sy+1.4));
    V.cin.push('M'+f(hx)+' '+f(hy-.2)+'L'+f(hx+Math.sin(ln)*3.2)+' '+f(hy-Math.cos(ln)*3.2));
    V.cab.push('M'+f(cx-4)+' '+f(cy)+'a4 4 0 1 0 8 0a4 4 0 1 0 -8 0');
    V.cabelo.push('M'+f(cx-4.2)+' '+f(cy+.8)+'a4.2 4.4 0 0 1 8 -2.2L'+f(cx+.4)+' '+f(cy-1.6)+'L'+f(cx-2.4)+' '+f(cy+2.2)+'Z');
  }
  const H=HEROI_PE,esc=c=>misturar(c,'#000000',.28);
  const an=k=>'<animate data-k="pe" attributeName="d" dur="1s" repeatCount="indefinite" values="'+V[k].join(';')+'"/>';
  const L=(k,cor,w)=>'<path d="'+V[k][0]+'" fill="none" stroke="'+cor+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round">'+an(k)+'</path>';
  const Fp=(k,cor)=>'<path d="'+V[k][0]+'" fill="'+cor+'">'+an(k)+'</path>';
  return '<svg viewBox="0 0 40 60">'
    +L('bB',esc(H.pele),2.8)
    +L('pB',esc(H.pele),3.7)+L('cB',esc(H.short),4.6)+L('tB',esc(H.tenis),3)
    +L('tor',H.camisa,7.6)+L('cin',H.short,7.4)
    +L('pA',H.pele,3.7)+L('cA',H.short,4.6)+L('tA',H.tenis,3)
    +L('bA',H.pele,2.8)
    +Fp('cab',H.pele)+Fp('cabelo',H.cabelo)+'</svg>';
}
function criarHeroi(){
  C.heroi=null;
  const mod=plano.cen.mod;
  if((mod!=='bike'&&mod!=='esteira')||C.eixo==='y')return;
  const box=$('sprites');if(!box)return;
  const z0=fase==='run'&&idxAtual>=0?NIVEIS[BL[idxAtual].nivel].zona:1;
  const correZ=z=>(EXERCICIOS[exAtual]||{}).marcha==='trote'&&z>=2;
  const d=mod==='bike'?SPR.ciclista({heroi:1}):{w:40,h:60,svg:corredorSVG(correZ(z0))},k=C.esc*(mod==='bike'?1.06:1.12),w=d.w*k,h=d.h*k;
  const el=document.createElement('div');el.className='sprite heroi';el.style.width=f1(w)+'px';el.style.height=f1(h)+'px';
  el.innerHTML=d.svg.replace('<svg ','<svg width="100%" height="100%" ');
  const x=C.W*.46-w/2,y=C.chao+9*C.esc-h;
  el.style.transform='translate3d('+f1(x)+'px,'+f1(y)+'px,0)';box.appendChild(el);
  C.heroi={el,x,w,mod,corre:mod==='esteira'?correZ(z0):null};
  cadenciaHeroi(fase==='run'&&idxAtual>=0?NIVEIS[BL[idxAtual].nivel].zona:1);
  if(nivel==='C'||fase==='fim'||(fase==='run'&&!relogio.rodando)){try{el.querySelector('svg').pauseAnimations();}catch(e){}}
}
function cadenciaHeroi(z){
  const H=C.heroi;if(!H)return;
  if(H.mod==='esteira'){const corre=(EXERCICIOS[exAtual]||{}).marcha==='trote'&&z>=2;
    if(corre!==H.corre){H.corre=corre;const pausado=nivel==='C'||fase==='fim'||(fase==='run'&&!relogio.rodando);
      H.el.innerHTML=corredorSVG(corre).replace('<svg ','<svg width="100%" height="100%" ');
      if(pausado){try{H.el.querySelector('svg').pauseAnimations();}catch(e){}}}
    H.el.querySelectorAll('[data-k="pe"]').forEach(a=>a.setAttribute('dur',(CAD_PE[z]||.74)+'s'));return;}const c=CADENCIA[z]||.75,r=.5*VELZ[3]/(VELZ[z]||VELZ[3]);
  H.el.querySelectorAll('[data-k="pe"]').forEach(a=>a.setAttribute('dur',c+'s'));
  H.el.querySelectorAll('[data-k="roda"]').forEach(a=>a.setAttribute('dur',r.toFixed(2)+'s'));
}
function animarHeroi(on){const H=C.heroi;if(!H)return;try{const sv=H.el.querySelector('svg');(on&&nivel!=='C')?sv.unpauseAnimations():sv.pauseAnimations();}catch(e){}}
function limparSprites(){for(const s of C.sprites)s.el.remove();C.sprites=[];}
function ligarLoop(){if(C.raf||nivel==='C'||modo==='classico'||minimizado)return;C.tUlt=0;C.raf=requestAnimationFrame(loop);}
function desligarLoop(){if(C.raf)cancelAnimationFrame(C.raf);C.raf=0;}
function loop(t){
  C.raf=requestAnimationFrame(loop);
  if(!C.tUlt){C.tUlt=t;return;}
  const alvo=nivel==='B'?1/31:1/62;let dt=(t-C.tUlt)/1000;
  if(dt<alvo*.92)return;
  C.tUlt=t;dt=Math.min(dt,.1);
  C.fpsN++;C.fpsT+=dt;if(C.fpsT>=1){C.fps=Math.round(C.fpsN/C.fpsT);C.fpsN=0;C.fpsT=0;aoMedirFps(C.fps);}
  C.vel+=(C.velAlvo-C.vel)*(1-Math.exp(-dt/1.3));
  const g=C.vel*C.base,vert=C.eixo==='y';
  for(const L of C.camadas){
    if(L.v){L.y=(L.y+g*L.f*dt)%L.th;L.el.style.transform='translate3d(0,'+(L.y-L.th).toFixed(1)+'px,0)';}
    else{L.x=(L.x+g*L.f*dt)%L.tw;L.el.style.transform='translate3d('+(-L.x).toFixed(1)+'px,0,0)';}
  }
  for(let i=C.sprites.length-1;i>=0;i--){
    const sp=C.sprites[i];let vx,vy;
    if(vert){vx=sp.abs;vy=sp.ceu?g*.15:g*sp.f;}
    else if(sp.ac){vx=moverCompanheiro(sp,dt,g);vy=0;}
    else{vx=-g*sp.f*(1-sp.rel)+sp.abs;if(sp.esq&&g>1)vx=Math.max(vx,40*C.esc);vy=0;}
    sp.x+=vx*dt;sp.y+=vy*dt;
    if((vx<0&&sp.x<-sp.w-30)||(vx>0&&sp.x>C.W+30)||(vy>0&&sp.y>C.H+20)){sp.el.remove();C.sprites.splice(i,1);continue;}
    sp.el.style.transform='translate3d('+sp.x.toFixed(1)+'px,'+sp.y.toFixed(1)+'px,0)';
  }
  if(nivel==='A'&&(fase==='run'||fase==='prev')&&C.vel>.2){
    C.ambT+=dt;
    if(C.ambT>C.ambProx){C.ambT=0;C.ambProx=18+Math.random()*22;
      if(C.sprites.length<2){const am=plano.cen.amb,tipo=am[Math.floor(Math.random()*am.length)];if(!C.sprites.some(x=>x.tipo===tipo))criarSprite(tipo,{},false);}}
  }
}

/* ---------- qualidade: detecção + rebaixamento automático ---------- */
function detectar(){
  const mem=navigator.deviceMemory,cores=navigator.hardwareConcurrency||4;
  let reduz=false;try{reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  const eco=!!(navigator.connection&&navigator.connection.saveData);
  const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const hw=(mem?mem+' GB, ':'')+cores+' núcleos';
  if(reduz)return {n:'C',motivo:'"reduzir movimento" ligado'};
  if(eco)return {n:'C',motivo:'economia de dados ligada'};
  if(mem!=null&&mem<=2)return {n:'C',motivo:hw};
  if(ios)return {n:'A',motivo:'iPhone/iPad'};
  if((mem||4)>=6&&cores>=8)return {n:'A',motivo:hw};
  return {n:'B',motivo:hw};
}
function aoMedirFps(fps){
  if(nivelModo!=='auto'||document.hidden||!(fase==='run'||fase==='prev'))return;
  C.warm++;if(C.warm<3)return;
  const alvo=nivel==='A'?60:30;
  if(fps<alvo*.7)C.baixos++;else C.baixos=0;
  if(C.baixos>=3){C.baixos=0;C.warm=0;setNivel(nivel==='A'?'B':'C',true,'média de '+fps+' fps');}
}
function setNivel(n,auto,motivo){
  if(n===nivel||!HOST)return;
  const ant=nivel;nivel=n;reconstruir();
  if(auto)console.info('[cardio-tema] qualidade '+ant+' → '+n+' ('+motivo+')');
}

function classeInclinacao(p){
  if(C.eixo==='y')return p==='desafio'?' zoom1':(p==='climax'?' zoom2':'');
  if(plano&&plano.cen.mod==='esteira'){const ev=idxAtual>=0?plano.eventos[idxAtual]:null;
    if(!(EXERCICIOS[exAtual]||{}).incl)return '';
    return ev&&ev.tr==='sobe'?(p==='climax'?' pico':' subida'):(p==='alivio'?' descida':'');}
  return p==='desafio'?' subida':(p==='climax'?' pico':(p==='alivio'?' descida':''));
}


/* ---------- estado (alimentado pelo app a cada 250 ms) ---------- */
const relogio={rodando:false};let POS=0;
function pos(){return POS;}
const DET=detectar();
let nivelModo='auto',nivel=DET.n,exAtual='caminhada',modAtual='esteira';
let fase='prev',modo='historia',minimizado=false,idxAtual=-1,blocoRealIni=0,plano=null;
let RO=null,rzT=0,BAT=null,BATFN=null;

function reconstruir(){if(!HOST)return;desligarLoop();montarCena();aplicarPaleta(progressoVisual());restaurarEstadoCena();ligarLoop();}
/* faixa do cenário: entre o "Bloco X de Y" e o arco da zona, medidos na tela real */
function medirFaixa(){
  if(!HOST)return;const ov=HOST.parentElement;if(!ov)return;
  const sub=ov.querySelector('.cdsub'),base=ov.querySelector('.cdbase');if(!sub||!base)return;
  const cd=HOST.getBoundingClientRect(),a=sub.getBoundingClientRect(),z=base.getBoundingClientRect();
  if(!a.height||!z.height)return;
  const bt=Math.round(a.bottom-cd.top+6),chao=Math.round(z.top-cd.top-26);
  if(Math.abs(bt-C.bt)>16||Math.abs(chao-C.chao)>16){C.fix={H:C.H,bt,chao};reconstruir();}
}
function restaurarEstadoCena(){
  const m=$('mundo');if(!m)return;
  if(fase==='run'&&idxAtual>=0){
    m.className='mundo'+classeInclinacao(plano.papeis[idxAtual]);
    C.velAlvo=relogio.rodando?VELZ[NIVEIS[BL[idxAtual].nivel].zona]:0;C.vel=C.velAlvo;
    const ev=plano.eventos[idxAtual];C.evSp=(ev.s&&performance.now()-blocoRealIni<20000)?criarSprite(ev.s,{p:textoPlaca(ev.p,idxAtual)},true):null;
  }else C.vel=C.velAlvo;
}
function trocarBlocoCena(i,decorrido){
  idxAtual=i;blocoRealIni=performance.now()-decorrido*1000;
  const b=BL[i],n=NIVEIS[b.nivel],ev=plano.eventos[i],papel=plano.papeis[i];
  C.velAlvo=relogio.rodando?VELZ[n.zona]:0;
  C.forte=papel==='desafio'||papel==='climax';
  const m=$('mundo');if(m)m.className='mundo'+classeInclinacao(papel);
  if(nivel==='C'){limparSprites();aplicarPaleta(INI[i]/TOTAL);}
  C.evSp=(ev.s&&decorrido<20)?criarSprite(ev.s,{p:textoPlaca(ev.p,i)},true):null;
  cadenciaHeroi(n.zona);
}
function animarSprites(on){if(!HOST)return;HOST.querySelectorAll('#sprites svg').forEach(sv=>{try{(on&&nivel!=='C')?sv.unpauseAnimations():sv.pauseAnimations();}catch(e){}});}
function onVis(){C.tUlt=0;}

/* ---------- API ---------- */
function atualizar(s){
  if(!HOST||!plano||!s)return;
  const f=s.fase;POS=Math.max(0,+s.pos||0);
  const rod=f==='run'&&!s.pausado;
  if(f!==fase){
    fase=f;
    if(f==='prev'){idxAtual=-1;C.forte=false;limparSprites();const m=$('mundo');if(m)m.className='mundo';aplicarPaleta(.03);C.velAlvo=.45;cadenciaHeroi(1);animarHeroi(true);}
    else if(f==='count'){C.velAlvo=VELZ[1]*.7;}
    else if(f==='run'){C.warm=0;C.baixos=0;setTimeout(medirFaixa,80);}
    else if(f==='fim'){idxAtual=-1;C.forte=false;const m=$('mundo');if(m)m.className='mundo';aplicarPaleta(1);C.velAlvo=.12;animarHeroi(false);}
  }
  if(rod!==relogio.rodando){
    relogio.rodando=rod;
    if(f==='run'&&idxAtual>=0)C.velAlvo=rod?VELZ[NIVEIS[BL[idxAtual].nivel].zona]:0;
    if(f==='run'||f==='fim')animarSprites(rod);
  }
  if(f==='run'&&s.idx>=0&&s.idx<BL.length&&s.idx!==idxAtual)trocarBlocoCena(s.idx,Math.max(0,+s.decorrido||0));
  const el=$('cena');
  if(el){const cls=classeCena()+(el.classList.contains('trocando')?' trocando':'');if(el.className!==cls)el.className=cls;}
  if(nivel!=='C'&&!document.hidden){const agora=performance.now(),iv=nivel==='A'?2000:5000;if(agora-C.tPal>=iv){C.tPal=agora;aplicarPaleta(progressoVisual());}}
}
function destruir(){
  desligarLoop();
  try{if(RO)RO.disconnect();}catch(e){}RO=null;clearTimeout(rzT);
  document.removeEventListener('visibilitychange',onVis);
  try{if(BAT&&BATFN)BAT.removeEventListener('levelchange',BATFN);}catch(e){}
  if(HOST){HOST.innerHTML='';HOST.classList.remove('ct-host');}
  HOST=null;plano=null;C.sprites=[];C.camadas=[];C.afunda=[];C.heroi=null;C.evSp=null;
}
function injetarCSS(){
  if(document.getElementById('ct-css'))return;
  const st=document.createElement('style');st.id='ct-css';st.textContent=CSS;document.head.appendChild(st);
}
/* cria o cenário dentro de `host`. Exercício fora do temático → null (o app segue no clássico, sem perguntar). */
function criar(host,o){
  o=o||{};
  const ex=exercicioDoNome(o.exercicio);
  if(!host||!ex||!o.blocos||!o.blocos.length)return null;
  if(HOST)destruir();
  injetarCSS();
  HOST=host;host.classList.add('ct-host');
  BL=o.blocos.map(b=>({rotulo:b.rotulo||'',nivel:NIVEIS[b.nivel]?b.nivel:'moderado',seg:Math.max(1,+b.seg||1)}));
  INI=[];TOTAL=0;for(const b of BL){INI.push(TOTAL);TOTAL+=b.seg;}
  exAtual=ex;modAtual=EXERCICIOS[ex].maq;
  fase='prev';idxAtual=-1;relogio.rodando=false;POS=0;
  Object.assign(C,{fix:null,forte:false,sprites:[],camadas:[],afunda:[],heroi:null,evSp:null,warm:0,baixos:0,tPal:0,ambT:0,ambProx:20});
  const t=o.tema||{};
  plano=gerarPlano(t.seed||(Math.floor(Math.random()*999983)+1),(t.cen&&CENARIOS.some(c=>c.id===t.cen&&c.mod===modAtual))?t.cen:null);
  if(t.clima&&CLIMAS[t.clima])plano.clima=t.clima;
  host.innerHTML='<div class="cena" id="cena"></div>';
  montarCena();aplicarPaleta(.03);C.velAlvo=.45;C.vel=.45;ligarLoop();
  document.addEventListener('visibilitychange',onVis);
  try{RO=new ResizeObserver(()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(!HOST)return;C.fix=null;reconstruir();if(fase==='run')medirFaixa();},220);});RO.observe(host);}catch(e){}
  try{if(navigator.getBattery)navigator.getBattery().then(bt=>{if(!HOST)return;BAT=bt;BATFN=()=>{if(nivelModo==='auto'&&bt.level<=.2&&!bt.charging&&nivel!=='C')setNivel('C',true,'bateria em '+Math.round(bt.level*100)+'%');};BATFN();bt.addEventListener('levelchange',BATFN);}).catch(()=>{});}catch(e){}
  return {
    atualizar,destruir,
    tema:()=>plano?{seed:plano.seed,cen:plano.cen.id,clima:plano.clima,exercicio:exAtual}:null,
    nivel:()=>nivel
  };
}
window.CardioTema={versao:1,criar,reconhece:n=>!!exercicioDoNome(n),exercicio:n=>exercicioDoNome(n)};

})();
