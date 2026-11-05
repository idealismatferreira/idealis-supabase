/* =====================================================================
   IDEALIS · cardio-tema.js v5 — Cardio temático, visão de costas
   Baixado só quando o cardio abre. Expõe window.CardioTema.criar(host, {blocos, exercicio, tema}).
   Cérebro (sorteio, papéis, frases, ícones, API) = o mesmo do v4.
   Motor de desenho = protótipo "Cardio de Costas" aprovado (4 máquinas, 13 cenários, climas).
   Referência completa: doc do Projeto claude/cardio-tematico-referencia.md.
   ===================================================================== */
(function(){
'use strict';
if(window.CardioTema)return;
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

/* ---------- níveis, papéis, máquinas ---------- */
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
/* papeis v3: partida só se começar leve; chegada só se o último bloco DESCER de zona */
function papeis(bl){
  const z=bl.map(b=>NIVEIS[b.nivel].zona),max=Math.max.apply(null,z),iMax=z.lastIndexOf(max);
  return bl.map((b,i)=>{
    if(i===0&&z[0]<=2)return 'partida';
    if(i>0&&i===bl.length-1&&z[i]<z[i-1])return 'chegada';
    if(i===iMax&&max>=4)return 'climax';
    if(i===0)return z[0]>=4?'desafio':'exploracao';
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
{id:'parque',nome:'Parque da cidade',curto:'Parque',mod:'esteira',part:'folhas',amb:['passaros','cachorro'],
 climas:['limpo','limpo','nublado','chuva','neblina','vento'],
 ev:{partida:[EV('Portão do parque','portao',{k:'Portão'}),PL('Pista do lago','PISTA 3 km',{k:'Pista'}),EV('Bosque','passaros',{k:'Bosque'})],
  exploracao:[EV('Lago das garças','garca'),EV('Alameda dos ipês','ipe'),EV('Um caramelo','cachorro',{c:'Companhia'})],
  desafio:[PL('Pista de cooper','COOPER 400 m',{tr:'plano'}),EV('Vento contra','passaros',{tr:'plano'}),EV('Corrida do caramelo','cachorro',{tr:'plano'}),EV('Ponte do lago','ponte',{tr:'plano'}),PL('Volta do lago','VOLTA DO LAGO',{tr:'plano'}),PL('Reta da alameda','RETA 300 m',{tr:'plano'}),PL('Ladeira do coreto','CORETO ↑',{tr:'sobe'}),PL('Subida do bosque','BOSQUE ↑',{tr:'sobe'}),PL('Rampa do anfiteatro','ANFITEATRO ↑',{tr:'sobe'}),PL('Morro do parquinho','MORRO ↑',{tr:'sobe'})],
  climax:[PL('Reta final','FALTAM 200 m',{k:'Reta final',tr:'plano'}),PL('Último quilômetro','ÚLTIMO KM',{k:'Último km',tr:'plano'}),PL('Chegada no coreto','CORETO 100 m',{k:'Coreto',tr:'plano'}),PL('Subida do mirante','MIRANTE 100 m',{k:'Mirante',tr:'sobe'}),PL('Topo da colina','COLINA ↑',{k:'Colina',tr:'sobe'}),PL('Alto do parque','ALTO ↑',{k:'Alto',tr:'sobe'})],
  alivio:[EV('Sombra','banco'),EV('Bebedouro','bebedouro')],
  chegada:[EV('Banco do lago','banco',{k:'Lago'}),PL('Coreto','CORETO',{k:'Coreto'}),EV('Saída do parque','portao',{k:'Saída'})]}},
{id:'orla',nome:'Orla da praia',curto:'Orla',mod:'esteira',part:null,amb:['gaivotas','passaros'],
 climas:['limpo','limpo','nublado','chuva','vento'],
 ev:{partida:[EV('Calçadão','quiosque',{k:'Calçadão'}),PL('Posto 6','POSTO 6',{k:'Posto 6'}),PL('Píer','PÍER',{k:'Píer'})],
  exploracao:[EV('Água de coco','quiosque'),EV('Gaivotas','gaivotas'),EV('Vôlei na areia','rede')],
  desafio:[PL('Vento no píer','PÍER',{tr:'plano'}),EV('Rumo ao farol','farol',{tr:'plano'}),PL('Areia fofa','AREIA FOFA',{tr:'plano'}),EV('Bando de gaivotas','gaivotas',{tr:'plano'}),EV('Trecho sem sombra',null,{tr:'plano'}),PL('Reta do calçadão','RETA 500 m',{tr:'plano'}),PL('Ladeira do mirante','MIRANTE ↑',{tr:'sobe'}),PL('Subida da pedra','PEDRA ↑',{tr:'sobe'}),PL('Rampa do forte','FORTE ↑',{tr:'sobe'}),PL('Morro da praia','MORRO ↑',{tr:'sobe'})],
  climax:[PL('Ponta da praia','PONTA 200 m',{k:'Ponta',tr:'plano'}),EV('Farol da barra','farol',{k:'Farol',tr:'plano'}),PL('Último posto','POSTO 1',{k:'Posto 1',tr:'plano'}),PL('Pedra do mirante','MIRANTE 100 m',{k:'Pedra',tr:'sobe'}),PL('Topo do morro','MORRO ↑',{k:'Morro',tr:'sobe'}),PL('Mirante do forte','FORTE ↑',{k:'Forte',tr:'sobe'})],
  alivio:[EV('Vento a favor','gaivotas'),EV('Sombra','banco')],
  chegada:[EV('Pôr do sol','banco',{k:'Pôr do sol'}),EV('Quiosque','quiosque',{k:'Quiosque'}),PL('Fim do calçadão','FIM',{k:'Fim'})]}},
{id:'serra',nome:'Trilha na serra',curto:'Trilha',mod:'esteira',part:'polen',amb:['passaros','capivara'],
 climas:['limpo','limpo','nublado','chuva','neblina'],
 ev:{partida:[PL('Início da trilha','TRILHA 5 km',{k:'Trilha'}),PL('Portal da mata','PARQUE',{k:'Portal'}),EV('Neblina baixa',null,{k:'Neblina'})],
  exploracao:[EV('Capivara','capivara'),EV('Tucano','tucano'),EV('Ponte do riacho','ponte')],
  desafio:[EV('Raízes',null,{tr:'plano'}),EV('Trilha estreita',null,{tr:'plano'}),EV('Pinguela do rio','ponte',{tr:'plano'}),EV('Barro na trilha',null,{tr:'plano'}),PL('Cascalho','CASCALHO',{tr:'plano'}),EV('Nuvem de mosquitos',null,{tr:'plano'}),PL('Subida de pedra','SUBIDA ↑',{tr:'sobe'}),PL('Cachoeira','CACHOEIRA ↑',{tr:'sobe'}),PL('Ladeira das araucárias','ARAUCÁRIAS ↑',{tr:'sobe'}),EV('Morro do tucano','tucano',{tr:'sobe'})],
  climax:[PL('Reta da trilha','FALTAM 200 m',{k:'Reta',tr:'plano'}),PL('Portal do parque','PORTAL 100 m',{k:'Portal',tr:'plano'}),EV('Ponte pênsil','ponte',{k:'Ponte',tr:'plano'}),PL('O cume','CUME 100 m',{k:'Cume',tr:'sobe'}),PL('Pico da serra','PICO ↑',{k:'Pico',tr:'sobe'}),PL('Pedra grande','PEDRA 50 m',{k:'Pedra',tr:'sobe'})],
  alivio:[EV('Trecho plano','passaros'),EV('Mirante do vale','banco')],
  chegada:[PL('Vista do alto','CUME',{k:'Vista'}),EV('Refúgio','banco',{k:'Refúgio'}),PL('Descida ao vale','VALE',{k:'Vale'})]}},
{id:'cidade',nome:'Cidade à noite',curto:'Cidade',mod:'esteira',astro:'lua',solX:.24,part:null,amb:['passaros'],
 climas:['limpo','limpo','chuva','neblina'],
 ev:{partida:[PL('Avenida acesa','AV. CENTRAL',{k:'Avenida'}),EV('Praça da matriz','banco',{k:'Praça'}),PL('Centro iluminado','CENTRO',{k:'Centro'})],
  exploracao:[EV('Banca de revista','banca'),EV('Gato no muro','gato'),EV('Food truck','foodtruck')],
  desafio:[EV('Sinal verde','semaforo',{p:'verde',tr:'plano'}),PL('Túnel','TÚNEL',{tr:'plano'}),EV('Atravessa a avenida','semaforo',{p:'verde',tr:'plano'}),EV('Vento entre prédios','passaros',{tr:'plano'}),PL('Calçadão do centro','CALÇADÃO 400 m',{tr:'plano'}),PL('Ônibus chegando','PONTO',{tr:'plano'}),PL('Viaduto','VIADUTO ↑',{tr:'sobe'}),PL('Rua da ladeira','LADEIRA ↑',{tr:'sobe'}),PL('Rampa da passarela','PASSARELA ↑',{tr:'sobe'}),PL('Ladeira do centro','CENTRO ↑',{tr:'sobe'})],
  climax:[PL('Ponte estaiada','PONTE 200 m',{k:'Ponte',tr:'plano'}),PL('Reta final','FALTAM 200 m',{k:'Reta final',tr:'plano'}),PL('Última quadra','ÚLTIMA QUADRA',{k:'Última quadra',tr:'plano'}),PL('Mirante da cidade','MIRANTE ↑',{k:'Mirante',tr:'sobe'}),PL('Topo do viaduto','VIADUTO ↑',{k:'Viaduto',tr:'sobe'}),PL('Alto da colina','COLINA ↑',{k:'Colina',tr:'sobe'})],
  alivio:[EV('Praça','banco'),EV('Sinal vermelho','semaforo',{p:'vermelho'})],
  chegada:[EV('Lua cheia','banco',{k:'Lua'}),EV('Lanche da noite','foodtruck',{k:'Lanche'}),PL('Fim da avenida','FIM',{k:'Fim'})]}},
/* ===== BIKE ===== */
{id:'estrada',nome:'Estrada da serra',curto:'Serra',mod:'bike',part:null,amb:['passaros','ciclista'],
 climas:['limpo','limpo','nublado','neblina','chuva'],
 ev:{partida:[PL('Pé da serra','SERRA 12 km',{k:'Serra'}),PL('Posto de estrada','POSTO',{k:'Posto'}),PL('Saída da cidade','ESTRADA',{k:'Estrada'})],
  exploracao:[EV('Araucárias','passaros'),EV('Outro ciclista','ciclista',{c:'Companhia'}),EV('Tucano','tucano')],
  desafio:[PL('Curva fechada','CURVA ↑'),PL('Rampa','RAMPA 8%'),EV('Vento contra','passaros',{c:'Firme!'}),
   PL('Serpentina','CURVAS ↑'),EV('Ultrapassagem','ciclista',{p:'ult',c:'Acelera!'}),PL('Rampa forte','RAMPA 12%',{c:'Firme!'})],
  climax:[PL('Alto da serra','TOPO 500 m',{k:'Topo'}),PL('Último grampo','GRAMPO ↑',{k:'Grampo'}),PL('Portal do topo','TOPO',{k:'Portal'})],
  alivio:[PL('Descida','DESCIDA',{c:'Solta'}),EV('Mirante','banco')],
  chegada:[EV('Mirante do topo','banco',{k:'Mirante'}),PL('Café da serra','CAFÉ',{k:'Café'}),PL('Vista do vale','VALE',{k:'Vale'})]}},
{id:'ciclovia',nome:'Ciclovia urbana',curto:'Ciclovia',mod:'bike',part:null,amb:['passaros','ciclista'],
 climas:['limpo','limpo','nublado','chuva','vento'],
 ev:{partida:[PL('Ciclovia','CICLOVIA',{k:'Ciclovia'}),PL('Avenida','AVENIDA',{k:'Avenida'}),PL('Margem do rio','RIO',{k:'Rio'})],
  exploracao:[EV('Banca','banca'),EV('Outro ciclista','ciclista',{c:'Companhia'}),EV('Pombos','passaros')],
  desafio:[EV('Sinal verde','semaforo',{p:'verde'}),PL('Viaduto','VIADUTO ↑'),EV('Ultrapassagem','ciclista',{p:'ult',c:'Acelera!'}),
   PL('Rampa da ponte','PONTE ↑'),EV('Pelotão','ciclista',{c:'Acompanha!'}),EV('Vento do rio','passaros',{c:'Firme!'})],
  climax:[PL('Ponte estaiada','PONTE 200 m',{k:'Ponte'}),PL('Sprint final','FALTAM 300 m',{k:'Sprint'}),PL('Subida do parque','PARQUE ↑',{k:'Parque'})],
  alivio:[EV('Sinal vermelho','semaforo',{p:'vermelho'}),EV('Praça','banco')],
  chegada:[EV('Parque da orla','banco',{k:'Parque'}),PL('Bicicletário','BIKE',{k:'Bicicletário'}),EV('Sorveteria','foodtruck',{k:'Sorvete'})]}},
{id:'campo',nome:'Estrada no campo',curto:'Campo',mod:'bike',part:null,amb:['passaros','vaca'],
 climas:['limpo','limpo','nublado','chuva','vento'],
 ev:{partida:[EV('Porteira','porteira',{k:'Porteira'}),PL('Estrada de chão','FAZENDA 8 km',{k:'Fazenda'}),EV('Amanhecer no pasto','vaca',{k:'Pasto'})],
  exploracao:[EV('Vacas no pasto','vaca'),EV('Girassóis',null),EV('Moinho','moinho')],
  desafio:[PL('Morro da fazenda','MORRO ↑'),PL('Estrada de terra','TERRA',{c:'Firme!'}),EV('Contra o vento','passaros'),
   PL('Cascalho','CASCALHO',{c:'Firme!'}),PL('Subida do cafezal','CAFEZAL ↑'),EV('Boiada na estrada','vaca',{c:'Desvia!'})],
  climax:[PL('Alto do morro','TOPO 100 m',{k:'Morro'}),EV('Torre do moinho','moinho',{k:'Moinho'}),PL('Mirante do vale','MIRANTE ↑',{k:'Mirante'})],
  alivio:[EV('Ipê florido','ipe'),EV('Celeiro','celeiro')],
  chegada:[EV('Porteira de casa','porteira',{k:'Casa'}),EV('Sede da fazenda','celeiro',{k:'Sede'}),EV('Pôr do sol no pasto','vaca',{k:'Pôr do sol'})]}},
/* ===== ELÍPTICO ===== */
{id:'neve',nome:'Montanha nevada',curto:'Neve',mod:'eliptico',part:'neve',amb:['passaros','raposa'],
 climas:['limpo','limpo','nublado','nevasca','neblina'],
 ev:{partida:[PL('Base da montanha','TRILHA 6 km',{k:'Base'}),PL('Teleférico','TELEFÉRICO',{k:'Teleférico'}),EV('Vila nevada','cabana',{k:'Vila'})],
  exploracao:[EV('Boneco de neve','boneco'),EV('Raposa','raposa'),EV('Pegadas na neve',null)],
  desafio:[PL('Encosta','ENCOSTA ↑'),PL('Neve funda','NEVE FUNDA',{c:'Firme!'}),EV('Vento gelado','passaros'),
   PL('Rampa de gelo','GELO ↑'),EV('Raposa em fuga','raposa',{c:'Acompanha!'}),PL('Trilha íngreme','ÍNGREME ↑')],
  climax:[PL('Crista','CRISTA 100 m',{k:'Crista'}),PL('Cume nevado','CUME ↑',{k:'Cume'}),EV('Bandeira do topo','bandeira',{k:'Bandeira'})],
  alivio:[EV('Pinhal',null),EV('Chocolate quente','cabana')],
  chegada:[EV('Refúgio','cabana',{k:'Refúgio'}),EV('Lareira','cabana',{k:'Lareira'}),EV('Boneco no fim','boneco',{k:'Boneco'})]}},
{id:'aurora',nome:'Aurora no gelo',curto:'Aurora',mod:'eliptico',astro:'lua',solX:.24,aurora:1,part:'neve',amb:['coruja'],
 climas:['limpo','limpo','nevasca'],
 ev:{partida:[PL('Noite gelada','TRILHA',{k:'Noite'}),EV('Acampamento','fogueira',{k:'Acampamento'}),PL('Lago escuro','LAGO',{k:'Lago'})],
  exploracao:[EV('Iglu','iglu'),EV('Coruja','coruja'),EV('Céu estrelado',null)],
  desafio:[EV('A aurora chegou',null),PL('Lago congelado','LAGO ↑'),EV('Vento polar',null,{c:'Firme!'}),
   PL('Colina de gelo','GELO ↑'),EV('Rastro da raposa','raposa',{c:'Acompanha!'}),EV('Aurora dançando',null,{c:'Acelera!'})],
  climax:[EV('Aurora no máximo',null,{k:'Aurora'}),EV('Estrela cadente',null,{k:'Estrela'}),PL('Topo da colina','TOPO ↑',{k:'Topo'})],
  alivio:[EV('Fogueira','fogueira'),EV('Silêncio',null)],
  chegada:[EV('Iglu','iglu',{k:'Iglu'}),EV('Fogueira acesa','fogueira',{k:'Fogueira'}),EV('Céu de estrelas',null,{k:'Estrelas'})]}},
{id:'dunas',nome:'Dunas dos Lençóis',curto:'Dunas',mod:'eliptico',part:null,amb:['passaros','buggy'],
 climas:['limpo','limpo','areia','nublado'],
 ev:{partida:[PL('Entrada do parque','LENÇÓIS',{k:'Lençóis'}),EV('Primeira lagoa',null,{k:'Lagoa'}),EV('Trilha do buggy','buggy',{k:'Buggy'})],
  exploracao:[EV('Lagoa azul',null),EV('Garça','garca'),EV('Buggy','buggy')],
  desafio:[PL('Duna alta','DUNA ↑'),PL('Areia fofa','AREIA FOFA',{c:'Firme!'}),EV('Vento de areia',null),
   PL('Crista da duna','CRISTA ↑'),EV('Buggy apostando','buggy',{c:'Acelera!'}),EV('Sol a pino',null,{c:'Firme!'})],
  climax:[PL('Topo da duna','TOPO 50 m',{k:'Topo'}),PL('Duna gigante','DUNA ↑',{k:'Duna'}),PL('Mirante do pôr do sol','MIRANTE ↑',{k:'Mirante'})],
  alivio:[EV('Lagoa verde',null),EV('Descida da duna',null,{c:'Solta'})],
  chegada:[PL('Pôr do sol','MIRANTE',{k:'Pôr do sol'}),EV('Mergulho na lagoa',null,{k:'Lagoa'}),PL('Vila de pescadores','VILA',{k:'Vila'})]}},
/* ===== ESCADA (sobe na vertical) ===== */
{id:'predio',nome:'Arranha-céu',curto:'Prédio',mod:'escada',eixo:'y',solX:.2,colX:.6,andares:40,part:null,amb:['pombo','passaros'],
 climas:['limpo','limpo','nublado','chuva','neblina','vento'],
 ev:{partida:[PL('Térreo','ANDAR {andar}',{k:'Térreo'}),PL('Portaria','PORTARIA',{k:'Portaria'}),PL('Escada de incêndio','SAÍDA ↑',{k:'Escada'})],
  exploracao:[EV('Pombos','pombo'),EV('Limpador de vidros','limpador'),EV('Varanda','vaso')],
  desafio:[PL('Lance rápido','ANDAR {andar}'),PL('Andar alto','ANDAR {andar}',{c:'Acelera!'}),EV('Vento no alto','passaros',{c:'Firme!'}),
   PL('Meio do prédio','ANDAR {andar}'),EV('Varandas acesas','vaso'),EV('Andaime','limpador',{c:'Firme!'})],
  climax:[PL('Último lance','ANDAR {andar}',{k:'Andar 40'}),PL('Cobertura','COBERTURA ↑',{k:'Cobertura'}),PL('Porta do terraço','TERRAÇO ↑',{k:'Terraço'})],
  alivio:[EV('Patamar','pombo'),EV('Vista da cidade',null)],
  chegada:[EV('Heliponto','heliponto',{k:'Heliponto'}),EV('Terraço','heliponto',{k:'Terraço'}),PL('Topo','TOPO',{k:'Topo'})]}},
{id:'farol',nome:'Farol',curto:'Farol',mod:'escada',eixo:'y',solX:.2,colX:.76,degraus:300,part:null,amb:['gaivotas','passaros'],
 climas:['limpo','limpo','nublado','chuva','vento'],
 ev:{partida:[PL('Porta do farol','DEGRAU {degrau}',{k:'Porta'}),PL('Rochedo','FAROL',{k:'Rochedo'}),PL('Base da torre','DEGRAU {degrau}',{k:'Base'})],
  exploracao:[EV('Gaivotas','gaivotas'),EV('Golfinhos','golfinhos'),EV('Veleiro',null)],
  desafio:[EV('Ondas no rochedo','ondas'),EV('Vento do mar','gaivotas',{c:'Firme!'}),PL('Meio do farol','DEGRAU {degrau}',{c:'Acelera!'}),
   PL('Degraus estreitos','DEGRAU {degrau}',{c:'Firme!'}),EV('Bando de gaivotas','gaivotas',{c:'Acompanha!'}),EV('Maresia',null)],
  climax:[PL('Rumo à lanterna','DEGRAU {degrau}',{k:'Lanterna'}),PL('Último giro','LANTERNA ↑',{k:'Último giro'}),PL('Galeria do topo','GALERIA ↑',{k:'Galeria'})],
  alivio:[EV('Patamar',null),EV('Brisa','gaivotas')],
  chegada:[EV('A lanterna','lanterna',{k:'Topo'}),EV('Luz acesa','lanterna',{k:'Luz'}),EV('Vista do mar',null,{k:'Mar'})]}},
{id:'escadaria',nome:'Escadaria da montanha',curto:'Montanha',mod:'escada',eixo:'y',solX:.2,colX:.7,degraus:600,part:null,amb:['passaros','cabra'],
 climas:['limpo','limpo','neblina','nublado','vento'],
 ev:{partida:[PL('Primeiro degrau','DEGRAU {degrau}',{k:'Base'}),PL('Portal de pedra','TRILHA',{k:'Portal'}),PL('Pé da montanha','DEGRAU {degrau}',{k:'Pé da montanha'})],
  exploracao:[EV('Cabra na pedra','cabra'),EV('Bromélias',null),EV('Nuvens abaixo',null)],
  desafio:[PL('Paredão','DEGRAU {degrau}'),PL('Degraus altos','DEGRAU {degrau}',{c:'Firme!'}),EV('Vento na encosta','passaros',{c:'Acelera!'}),
   PL('Lance íngreme','DEGRAU {degrau}'),EV('Cabra saltando','cabra',{c:'Acompanha!'}),EV('Acima das nuvens',null)],
  climax:[PL('Rumo ao cume','CUME ↑',{k:'Cume'}),PL('Últimos degraus','DEGRAU {degrau}',{k:'Últimos degraus'}),PL('Crista de pedra','CRISTA ↑',{k:'Crista'})],
  alivio:[EV('Platô',null),EV('Mirante','banco')],
  chegada:[EV('O cume','bandeira',{k:'Bandeira'}),EV('Mirante do topo','banco',{k:'Mirante'}),EV('Vista do vale',null,{k:'Vale'})]}}
];

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
const MOTIVOS={"farol|exploracao|Golfinhos":["Acelera um pouco, golfinhos à vista","No ritmo, olha os golfinhos"],"farol|desafio|Ondas no rochedo":["Sobe forte, onda batendo!","Segura, as ondas batem"],"parque|partida|Portão do parque":"Começa leve, o parque acabou de abrir","parque|partida|Pista do lago":"Aquece no passo, a volta é longa","parque|partida|Bosque":"Passo leve pra ouvir os pássaros","parque|exploracao|Lago das garças":{"anda":["Aperta o passo antes delas voarem","No ritmo, sem assustar as garças"],"trote":["Acelera antes das garças voarem","No ritmo, sem assustar as garças"],"incl":["Inclina a esteira pra ver o lago melhor","No ritmo, sem assustar as garças"]},"parque|exploracao|Alameda dos ipês":{"anda":["Aperta o passo, a sombra ajuda","Mantém e curte os ipês"],"trote":["Acelera, a sombra dos ipês ajuda","Mantém e curte os ipês"],"incl":["Inclina a esteira, a alameda começa a subir","Mantém e curte os ipês"]},"parque|exploracao|Um caramelo":{"anda":["Aperta o passo, ele quer brincar","Mesmo ritmo, ele tá te seguindo"],"trote":["Acelera um pouco, ele quer brincar","Mesmo ritmo, ele tá te seguindo"],"incl":["Inclina a esteira e leva ele morro acima","Mesmo ritmo, ele tá te seguindo"]},"parque|alivio|Sombra":"Reduz e aproveita a sombra","parque|alivio|Bebedouro":"Diminui, solta os ombros e respira","parque|chegada|Banco do lago":"Desacelera, o banco é seu","parque|chegada|Coreto":"Diminui o passo, chegou no coreto","parque|chegada|Saída do parque":"Desacelera, missão cumprida","orla|partida|Calçadão":"Começa leve, sente a brisa","orla|partida|Posto 6":"Aquece no passo até o próximo posto","orla|partida|Píer":"Passo leve, o mar tá calmo","orla|exploracao|Água de coco":{"anda":["Aperta o passo, o coco espera","No ritmo, o coco espera"],"trote":["Acelera um pouco, o coco espera","No ritmo, o coco espera"],"incl":["Inclina a esteira, o quiosque fica no alto","No ritmo, o coco espera"]},"orla|exploracao|Gaivotas":{"anda":["Aperta o passo, acompanha o voo","Mesmo ritmo das gaivotas"],"trote":["Acelera, acompanha as gaivotas","Mesmo ritmo das gaivotas"],"incl":["Inclina a esteira pra ver melhor as gaivotas!","Mesmo ritmo das gaivotas"]},"orla|exploracao|Vôlei na areia":{"anda":["Aperta o passo, a bola vem!","No ritmo, o jogo tá bom"],"trote":["Acelera um pouco, a bola vem!","No ritmo, o jogo tá bom"],"incl":["Inclina a esteira, vê o jogo do alto","No ritmo, o jogo tá bom"]},"orla|alivio|Vento a favor":"Reduz e deixa o vento empurrar","orla|alivio|Sombra":"Diminui e aproveita a sombra","orla|chegada|Pôr do sol":"Desacelera pra ver o sol sumir","orla|chegada|Quiosque":"Diminui, o coco é seu","orla|chegada|Fim do calçadão":"Desacelera, você chegou","serra|partida|Início da trilha":"Começa leve, a trilha é longa","serra|partida|Portal da mata":"Passo leve pra entrar na mata","serra|partida|Neblina baixa":"Aquece devagar, a neblina tá baixa","serra|exploracao|Capivara":{"anda":["Aperta o passo antes dela mergulhar","No ritmo, ela é tranquila"],"trote":["Acelera antes dela mergulhar","No ritmo, ela é tranquila"],"incl":["Inclina a esteira pra ver a capivara melhor","No ritmo, ela é tranquila"]},"serra|exploracao|Tucano":{"anda":["Aperta o passo antes dele voar","Mesmo ritmo, ele tá no galho"],"trote":["Acelera antes do tucano voar","Mesmo ritmo, ele tá no galho"],"incl":["Inclina a esteira, o tucano tá no alto","Mesmo ritmo, ele tá no galho"]},"serra|exploracao|Ponte do riacho":{"anda":["Aperta o passo, a ponte balança","No ritmo pra atravessar o riacho"],"trote":["Acelera, a ponte balança!","No ritmo pra atravessar o riacho"],"incl":["Inclina a esteira, depois da ponte é subida","No ritmo pra atravessar o riacho"]},"serra|alivio|Trecho plano":"Reduz, o chão ficou plano","serra|alivio|Mirante do vale":"Diminui e olha o vale","serra|chegada|Vista do alto":"Desacelera e curte a vista","serra|chegada|Refúgio":"Diminui, o refúgio chegou","serra|chegada|Descida ao vale":"Desacelera na descida pro vale","cidade|partida|Avenida acesa":"Começa leve, a avenida é sua","cidade|partida|Praça da matriz":"Aquece na praça, sem pressa","cidade|partida|Centro iluminado":"Passo leve sob as luzes","cidade|exploracao|Banca de revista":{"anda":["Aperta o passo, a banca fecha","No ritmo, olha as capas"],"trote":["Acelera um pouco, banca fechando","No ritmo, olha as capas"],"incl":["Inclina a esteira, a rua da banca sobe","No ritmo, olha as capas"]},"cidade|exploracao|Gato no muro":{"anda":["Aperta o passo, ele vai pular!","Passo firme, ele tá de olho"],"trote":["Acelera um pouco, ele vai pular!","Passo firme, ele tá de olho"],"incl":["Inclina a esteira e sobe atrás do gato","Passo firme, ele tá de olho"]},"cidade|exploracao|Food truck":{"anda":["Aperta o passo, a fila cresceu","No ritmo, o lanche é depois"],"trote":["Acelera um pouco, a fila cresceu","No ritmo, o lanche é depois"],"incl":["Inclina a esteira, o lanche tá no alto","No ritmo, o lanche é depois"]},"cidade|alivio|Praça":"Reduz e respira na praça","cidade|alivio|Sinal vermelho":"Reduz e espera abrir","cidade|chegada|Lua cheia":"Desacelera e olha pra lua","cidade|chegada|Lanche da noite":"Diminui, o lanche é seu","cidade|chegada|Fim da avenida":"Desacelera, a cidade é sua","estrada|partida|Pé da serra":"Pedale leve, a serra começa aqui","estrada|partida|Posto de estrada":"Pedale leve até a estrada","estrada|partida|Saída da cidade":"Pedale leve, deixa a cidade pra trás","estrada|exploracao|Araucárias":["Pedale mais, a estrada abriu","Mesmo ritmo entre as araucárias"],"estrada|exploracao|Outro ciclista":["Pedale mais e cola nele","Mesmo ritmo, ele tá do lado"],"estrada|exploracao|Tucano":["Pedale mais pra ver o tucano","Mesmo ritmo, ele tá no galho"],"estrada|desafio|Curva fechada":["Pedale forte na curva!","Segura na curva!"],"estrada|desafio|Rampa":["Pedale forte, rampa!","Segura, a rampa continua"],"estrada|desafio|Vento contra":["Força contra o vento!","Firme, vento contra"],"estrada|desafio|Serpentina":["Pedale forte nas curvas!","Segura, mais curvas"],"estrada|desafio|Ultrapassagem":["Pedale forte e passa!","Segura, ele tá atrás"],"estrada|desafio|Rampa forte":["Força, 12% de rampa!","Firme, rampa de 12%"],"estrada|climax|Alto da serra":"Sprint até o topo!","estrada|climax|Último grampo":"Tudo no último grampo!","estrada|climax|Portal do topo":"Sprint até o portal!","estrada|alivio|Descida":"Alivia, deixa a bike rolar","estrada|alivio|Mirante":"Reduz o ritmo e olha o vale","estrada|chegada|Mirante do topo":"Desacelera e curte o mirante","estrada|chegada|Café da serra":"Reduz o ritmo, o café é seu","estrada|chegada|Vista do vale":"Pedale leve e olha o vale","ciclovia|partida|Ciclovia":"Pedale leve, a ciclovia é sua","ciclovia|partida|Avenida":"Pedale leve pela avenida","ciclovia|partida|Margem do rio":"Pedale leve na beira do rio","ciclovia|exploracao|Banca":["Pedale mais, a banca vai fechar","Mesmo ritmo, olha as capas"],"ciclovia|exploracao|Outro ciclista":["Pedale mais e cola nele","Mesmo ritmo, pedalem juntos"],"ciclovia|exploracao|Pombos":["Pedale mais, voa com os pombos","Mesmo ritmo, sem assustar os pombos"],"ciclovia|desafio|Sinal verde":["Pedale, antes de fechar!","Segura, ainda tá verde"],"ciclovia|desafio|Viaduto":["Pedale forte no viaduto!","Segura até o topo"],"ciclovia|desafio|Ultrapassagem":["Pedale forte e passa!","Segura, ele tá atrás"],"ciclovia|desafio|Rampa da ponte":["Força na rampa!","Segura, ainda é rampa"],"ciclovia|desafio|Pelotão":["Acompanha o pelotão!","Não solta do pelotão!"],"ciclovia|desafio|Vento do rio":["Força contra o vento!","Firme, o vento continua"],"ciclovia|climax|Ponte estaiada":"Sprint pela ponte!","ciclovia|climax|Sprint final":"Sprint! Só 300 metros","ciclovia|climax|Subida do parque":"Tudo até o parque!","ciclovia|alivio|Sinal vermelho":"Reduz e espera abrir","ciclovia|alivio|Praça":"Reduz o ritmo e respira","ciclovia|chegada|Parque da orla":"Desacelera, chegou no parque","ciclovia|chegada|Bicicletário":"Pedale leve até estacionar","ciclovia|chegada|Sorveteria":"Reduz, o sorvete é seu","campo|partida|Porteira":"Pedale leve, abre a porteira","campo|partida|Estrada de chão":"Pedale leve, a fazenda tá longe","campo|partida|Amanhecer no pasto":"Pedale leve com o sol nascendo","campo|exploracao|Vacas no pasto":["Pedale mais, a boiada tá vindo","Mesmo ritmo, elas nem ligam"],"campo|exploracao|Girassóis":["Pedale mais entre os girassóis","Mesmo ritmo, curte o amarelo"],"campo|exploracao|Moinho":["Pedale mais, rápido como o moinho","Mesmo ritmo, igual ao moinho"],"campo|desafio|Morro da fazenda":["Pedale forte no morro!","Segura, o morro continua"],"campo|desafio|Estrada de terra":["Força na terra!","Segura, ainda é terra"],"campo|desafio|Contra o vento":["Força contra o vento!","Firme, vento contra"],"campo|desafio|Cascalho":["Força no cascalho!","Segura no cascalho"],"campo|desafio|Subida do cafezal":["Pedale forte no cafezal!","Segura até o topo"],"campo|desafio|Boiada na estrada":["Acelera, desvia da boiada!","Segura e desvia!"],"campo|climax|Alto do morro":"Sprint até o topo!","campo|climax|Torre do moinho":"Tudo até o moinho!","campo|climax|Mirante do vale":"Tudo até o mirante!","campo|alivio|Ipê florido":"Reduz e olha o ipê","campo|alivio|Celeiro":"Reduz o ritmo, chegou no celeiro","campo|chegada|Porteira de casa":"Desacelera, chegou em casa","campo|chegada|Sede da fazenda":"Reduz o ritmo, a sede é ali","campo|chegada|Pôr do sol no pasto":"Pedale leve pra ver o sol sumir","neve|partida|Base da montanha":"Começa leve, a montanha espera","neve|partida|Teleférico":"Aquece enquanto o teleférico sobe","neve|partida|Vila nevada":"Ritmo leve pela vila","neve|exploracao|Boneco de neve":["Acelera um pouco, passa o boneco","No ritmo, dá tchau pro boneco"],"neve|exploracao|Raposa":["Acelera um pouco, ela é rápida","No ritmo, sem assustar a raposa"],"neve|exploracao|Pegadas na neve":["Acelera e segue as pegadas","No ritmo, segue as pegadas"],"neve|desafio|Encosta":["Empurra forte na encosta!","Segura, ainda é encosta"],"neve|desafio|Neve funda":["Empurra na neve funda!","Segura, a neve continua"],"neve|desafio|Vento gelado":["Força contra o vento!","Firme, vento gelado"],"neve|desafio|Rampa de gelo":["Acelera na rampa!","Segura no gelo"],"neve|desafio|Raposa em fuga":["Acelera, ela é rápida!","Não perde ela!"],"neve|desafio|Trilha íngreme":["Empurra forte, íngreme!","Segura, ainda é íngreme"],"neve|climax|Crista":"Tudo até a crista!","neve|climax|Cume nevado":"Tudo até o cume!","neve|climax|Bandeira do topo":"Tudo até a bandeira!","neve|alivio|Pinhal":"Reduz entre os pinheiros","neve|alivio|Chocolate quente":"Diminui, o chocolate tá quente","neve|chegada|Refúgio":"Desacelera, o refúgio é seu","neve|chegada|Lareira":"Diminui e chega na lareira","neve|chegada|Boneco no fim":"Desacelera, o boneco te espera","aurora|partida|Noite gelada":"Começa leve, a noite é longa","aurora|partida|Acampamento":"Aquece perto do fogo","aurora|partida|Lago escuro":"Ritmo leve na beira do lago","aurora|exploracao|Iglu":["Acelera um pouco até o iglu","No ritmo, o iglu é ali"],"aurora|exploracao|Coruja":["Acelera antes da coruja voar","No ritmo, a coruja te observa"],"aurora|exploracao|Céu estrelado":["Acelera, a aurora vem aí","No ritmo e olha pra cima"],"aurora|desafio|A aurora chegou":["Acelera, a aurora chegou!","Segura, ela tá dançando"],"aurora|desafio|Lago congelado":["Acelera firme no gelo!","Segura, ainda é gelo"],"aurora|desafio|Vento polar":["Força contra o vento!","Firme, vento polar"],"aurora|desafio|Colina de gelo":["Empurra forte na colina!","Segura, ainda é colina"],"aurora|desafio|Rastro da raposa":["Segue o rastro, acelera!","Não perde o rastro!"],"aurora|desafio|Aurora dançando":["Acelera no ritmo dela!","Segura junto com ela!"],"aurora|climax|Aurora no máximo":"Tudo! O céu acendeu","aurora|climax|Estrela cadente":"Tudo! Faz um pedido","aurora|climax|Topo da colina":"Tudo até o topo!","aurora|alivio|Fogueira":"Reduz e aquece as mãos","aurora|alivio|Silêncio":"Diminui e escuta o silêncio","aurora|chegada|Iglu":"Desacelera, o iglu é seu","aurora|chegada|Fogueira acesa":"Diminui e chega no fogo","aurora|chegada|Céu de estrelas":"Desacelera e olha o céu","dunas|partida|Entrada do parque":"Começa leve, as dunas te esperam","dunas|partida|Primeira lagoa":"Ritmo leve até a lagoa","dunas|partida|Trilha do buggy":"Aquece na trilha do buggy","dunas|exploracao|Lagoa azul":["Acelera um pouco até a lagoa","No ritmo, a lagoa é ali"],"dunas|exploracao|Garça":["Acelera antes da garça voar","No ritmo, sem assustar a garça"],"dunas|exploracao|Buggy":["Acelera, o buggy passou!","No ritmo, deixa ele passar"],"dunas|desafio|Duna alta":["Empurra forte na duna!","Segura, ainda é duna"],"dunas|desafio|Areia fofa":["Empurra na areia fofa!","Segura, ainda é areia"],"dunas|desafio|Vento de areia":["Força contra o vento!","Firme, vento de areia"],"dunas|desafio|Crista da duna":["Acelera até a crista!","Segura na crista"],"dunas|desafio|Buggy apostando":["Acelera, ganha do buggy!","Não deixa ele passar!"],"dunas|desafio|Sol a pino":["Acelera, foge do sol!","Segura no sol forte"],"dunas|climax|Topo da duna":"Tudo até o topo!","dunas|climax|Duna gigante":"Tudo na duna gigante!","dunas|climax|Mirante do pôr do sol":"Tudo até o mirante!","dunas|alivio|Lagoa verde":"Reduz e olha a lagoa","dunas|alivio|Descida da duna":"Alivia na descida da duna","dunas|chegada|Pôr do sol":"Desacelera pra ver o sol sumir","dunas|chegada|Mergulho na lagoa":"Diminui, a lagoa te espera","dunas|chegada|Vila de pescadores":"Desacelera, chegou na vila","predio|partida|Térreo":"Começa leve, são 40 andares","predio|partida|Portaria":"Ritmo leve, passa a portaria","predio|partida|Escada de incêndio":"Aquece nos primeiros degraus","predio|exploracao|Pombos":["Acelera, os pombos sobem junto","No ritmo, os pombos te olham"],"predio|exploracao|Limpador de vidros":["Acelera um pouco e acena!","No ritmo, ele tá trabalhando"],"predio|exploracao|Varanda":["Acelera até a próxima varanda","No ritmo, olha as plantas"],"predio|desafio|Lance rápido":["Sobe rápido esse lance!","Segura mais um lance"],"predio|desafio|Andar alto":["Acelera, vista no alto!","Segura, ainda falta"],"predio|desafio|Vento no alto":["Força, o vento bateu!","Firme, o vento continua"],"predio|desafio|Meio do prédio":["Acelera, já é metade!","Segura, passou da metade"],"predio|desafio|Varandas acesas":["Sobe forte, vizinhos olhando!","Segura entre as varandas"],"predio|desafio|Andaime":["Firme, sobe o andaime!","Segura no andaime"],"predio|climax|Último lance":"Tudo! Último lance","predio|climax|Cobertura":"Tudo até a cobertura!","predio|climax|Porta do terraço":"Tudo até o terraço!","predio|alivio|Patamar":"Reduz no patamar e respira","predio|alivio|Vista da cidade":"Diminui e olha a cidade","predio|chegada|Heliponto":"Desacelera, você está no topo","predio|chegada|Terraço":"Diminui e curte o terraço","predio|chegada|Topo":"Desacelera, 40 andares feitos","farol|partida|Porta do farol":"Começa leve, são 300 degraus","farol|partida|Rochedo":"Ritmo leve até a torre","farol|partida|Base da torre":"Aquece nos primeiros degraus","farol|exploracao|Gaivotas":["Acelera um pouco com as gaivotas","No ritmo das gaivotas"],"farol|exploracao|Janela redonda":["Acelera um pouco até a janela","No ritmo, espia o mar"],"farol|exploracao|Veleiro":["Acelera pra ver o veleiro","No ritmo, olha o veleiro"],"farol|desafio|Espiral":["Sobe forte a espiral!","Segura na espiral"],"farol|desafio|Vento do mar":["Força, o vento bateu!","Firme, vento do mar"],"farol|desafio|Meio do farol":["Acelera, metade feita!","Segura, passou da metade"],"farol|desafio|Degraus estreitos":["Rápido nos degraus estreitos!","Segura, ainda é estreito"],"farol|desafio|Bando de gaivotas":["Sobe com elas!","Não deixa elas fugirem!"],"farol|desafio|Maresia":["Força, vento do mar!","Firme, vento salgado"],"farol|climax|Rumo à lanterna":"Tudo até a lanterna!","farol|climax|Último giro":"Tudo! Luz logo ali","farol|climax|Galeria do topo":"Tudo até a galeria!","farol|alivio|Patamar":"Reduz no patamar e respira","farol|alivio|Brisa":"Diminui e sente a brisa","farol|chegada|A lanterna":"Desacelera, você acendeu o farol","farol|chegada|Luz acesa":"Diminui, a luz é sua","farol|chegada|Vista do mar":"Desacelera e olha o mar","escadaria|partida|Primeiro degrau":"Começa leve, são 600 degraus","escadaria|partida|Portal de pedra":"Ritmo leve pelo portal","escadaria|partida|Pé da montanha":"Aquece nos primeiros degraus","escadaria|exploracao|Cabra na pedra":["Acelera um pouco, a cabra subiu","No ritmo, ela te observa"],"escadaria|exploracao|Bromélias":["Acelera até as bromélias","No ritmo, curte as bromélias"],"escadaria|exploracao|Nuvens abaixo":["Acelera e passa das nuvens","No ritmo, nuvens lá embaixo"],"escadaria|desafio|Paredão":["Sobe forte o paredão!","Segura no paredão"],"escadaria|desafio|Degraus altos":["Força, degraus altos!","Segura, ainda são altos"],"escadaria|desafio|Vento na encosta":["Força contra o vento!","Firme, vento na encosta"],"escadaria|desafio|Lance íngreme":["Sobe forte, íngreme!","Segura, ainda é íngreme"],"escadaria|desafio|Cabra saltando":["Sobe com a cabra!","Não perde a cabra!"],"escadaria|desafio|Acima das nuvens":["Acelera, rompe as nuvens!","Segura acima das nuvens"],"escadaria|climax|Rumo ao cume":"Tudo até o cume!","escadaria|climax|Últimos degraus":"Tudo! Últimos degraus","escadaria|climax|Crista de pedra":"Tudo até a crista!","escadaria|alivio|Platô":"Reduz no platô e respira","escadaria|alivio|Mirante":"Diminui e olha o vale","escadaria|chegada|O cume":"Desacelera, a bandeira é sua","escadaria|chegada|Mirante do topo":"Diminui e curte o mirante","escadaria|chegada|Vista do vale":"Desacelera e olha o vale","parque|desafio|Pista de cooper":{"anda":["Passo rápido na reta!","Segura até a curva"],"trote":["Acelera, é a reta!","Segura até a curva"]},"parque|desafio|Vento contra":{"anda":["Passo forte no vento!","Firme, o vento continua"],"trote":["Força contra o vento!","Firme, o vento continua"]},"parque|desafio|Corrida do caramelo":{"anda":["Acelera o passo, caramelo!","Não deixa ele passar!"],"trote":["Corre, ele tá ganhando!","Não deixa ele passar!"]},"parque|desafio|Ponte do lago":{"anda":["Passo rápido na ponte!","Segura até atravessar"],"trote":["Acelera na ponte!","Segura até atravessar"]},"parque|desafio|Volta do lago":{"anda":["Passo rápido, volta inteira!","Segura a volta toda"],"trote":["Acelera, volta inteira!","Segura a volta toda"]},"parque|desafio|Reta da alameda":{"anda":["Passo rápido, reta longa!","Segura até o fim"],"trote":["Abre a passada, reta!","Segura até o fim"]},"parque|desafio|Ladeira do coreto":{"incl":["Sobe a ladeira, firme!","Segura até o coreto"]},"parque|desafio|Subida do bosque":{"incl":["Sobe forte no bosque!","Segura, ainda é subida"]},"parque|desafio|Rampa do anfiteatro":{"incl":["Encara a rampa, sobe!","Segura, ainda é rampa"]},"parque|desafio|Morro do parquinho":{"incl":["Sobe o morro, firme!","Segura, morro continua"]},"parque|climax|Reta final":{"anda":"Passo máximo, 200 metros!","trote":"Tudo! Só 200 metros"},"parque|climax|Último quilômetro":{"anda":"Passo máximo, último km!","trote":"Tudo no último km!"},"parque|climax|Chegada no coreto":{"anda":"Passo máximo, coreto ali!","trote":"Sprint até o coreto!"},"parque|climax|Subida do mirante":{"incl":"Tudo até o mirante!"},"parque|climax|Topo da colina":{"incl":"Tudo! Topo à vista"},"parque|climax|Alto do parque":{"incl":"Última subida, tudo!"},"orla|desafio|Vento no píer":{"anda":["Passo forte no vento!","Firme, o vento continua"],"trote":["Força contra o vento!","Firme, o vento continua"]},"orla|desafio|Rumo ao farol":{"anda":["Acelera o passo, farol!","Segura até o farol"],"trote":["Acelera rumo ao farol!","Segura até o farol"]},"orla|desafio|Areia fofa":{"anda":["Passo forte na areia!","Firme, ainda é areia"],"trote":["Empurra forte na areia!","Firme, ainda é areia"]},"orla|desafio|Bando de gaivotas":{"anda":["Acelera o passo, gaivotas!","Não deixa elas fugirem!"],"trote":["Corre com elas!","Não deixa elas fugirem!"]},"orla|desafio|Trecho sem sombra":{"anda":["Passo rápido, sombra perto!","Segura, sombra logo ali"],"trote":["Acelera até a sombra!","Segura, sombra logo ali"]},"orla|desafio|Reta do calçadão":{"anda":["Passo rápido na reta!","Segura até o posto"],"trote":["Abre a passada, reta!","Segura até o posto"]},"orla|desafio|Ladeira do mirante":{"incl":["Sobe a ladeira, forte!","Segura, a ladeira continua"]},"orla|desafio|Subida da pedra":{"incl":["Sobe firme na pedra!","Segura, ainda é pedra"]},"orla|desafio|Rampa do forte":{"incl":["Sobe a rampa, firme!","Segura até o forte"]},"orla|desafio|Morro da praia":{"incl":["Sobe o morro, forte!","Segura, morro continua"]},"orla|climax|Ponta da praia":{"anda":"Passo máximo, 200 metros!","trote":"Tudo! Só 200 metros"},"orla|climax|Farol da barra":{"anda":"Passo máximo, farol ali!","trote":"Tudo até o farol!"},"orla|climax|Último posto":{"anda":"Passo máximo, último posto!","trote":"Sprint até o posto!"},"orla|climax|Pedra do mirante":{"incl":"Tudo até a pedra!"},"orla|climax|Topo do morro":{"incl":"Tudo até o topo!"},"orla|climax|Mirante do forte":{"incl":"Tudo até o forte!"},"serra|desafio|Raízes":{"anda":["Passo forte nas raízes!","Firme, mais raízes"],"trote":["Acelera firme nas raízes!","Firme, mais raízes"]},"serra|desafio|Trilha estreita":{"anda":["Passo rápido na trilha!","Segura, ainda é estreita"],"trote":["Acelera na trilha estreita!","Segura, ainda é estreita"]},"serra|desafio|Pinguela do rio":{"anda":["Passo rápido na pinguela!","Segura até atravessar"],"trote":["Acelera na pinguela!","Segura até atravessar"]},"serra|desafio|Barro na trilha":{"anda":["Passo forte no barro!","Segura, ainda é barro"],"trote":["Força no barro!","Segura, ainda é barro"]},"serra|desafio|Cascalho":{"anda":["Passo rápido no cascalho!","Segura no cascalho"],"trote":["Acelera no cascalho!","Segura no cascalho"]},"serra|desafio|Nuvem de mosquitos":{"anda":["Acelera o passo, mosquitos!","Segura, ainda tem mosquito"],"trote":["Corre, mosquitos!","Segura, ainda tem mosquito"]},"serra|desafio|Subida de pedra":{"incl":["Sobe a pedra, forte!","Firme, ainda é pedra"]},"serra|desafio|Cachoeira":{"incl":["Sobe até a cachoeira!","Segura até a cachoeira"]},"serra|desafio|Ladeira das araucárias":{"incl":["Sobe entre as araucárias!","Segura, a ladeira continua"]},"serra|desafio|Morro do tucano":{"incl":["Sobe atrás do tucano!","Segura, topo à vista"]},"serra|climax|Reta da trilha":{"anda":"Passo máximo, 200 metros!","trote":"Tudo! Só 200 metros"},"serra|climax|Portal do parque":{"anda":"Passo máximo, portal ali!","trote":"Sprint até o portal!"},"serra|climax|Ponte pênsil":{"anda":"Passo máximo na ponte!","trote":"Tudo na ponte pênsil!"},"serra|climax|O cume":{"incl":"Tudo até o cume!"},"serra|climax|Pico da serra":{"incl":"Tudo! Pico à vista"},"serra|climax|Pedra grande":{"incl":"Tudo! Só 50 metros"},"cidade|desafio|Sinal verde":{"anda":["Passo rápido, sinal verde!","Segura, ainda tá verde"],"trote":["Acelera antes de fechar!","Segura, ainda tá verde"]},"cidade|desafio|Túnel":{"anda":["Passo rápido no túnel!","Segura até a luz"],"trote":["Acelera até a saída!","Segura até a luz"]},"cidade|desafio|Atravessa a avenida":{"anda":["Vai, o sinal abriu!","Segura até a calçada"],"trote":["Corre, o sinal abriu!","Segura até a calçada"]},"cidade|desafio|Vento entre prédios":{"anda":["Passo forte no vento!","Firme, o vento continua"],"trote":["Força contra o vento!","Firme, o vento continua"]},"cidade|desafio|Calçadão do centro":{"anda":["Passo rápido no calçadão!","Segura até a esquina"],"trote":["Abre a passada, calçadão!","Segura até a esquina"]},"cidade|desafio|Ônibus chegando":{"anda":["Apressa, o ônibus vem!","Segura, ele tá parando"],"trote":["Corre, o ônibus vem!","Segura, ele tá parando"]},"cidade|desafio|Viaduto":{"incl":["Sobe o viaduto, forte!","Segura até o topo"]},"cidade|desafio|Rua da ladeira":{"incl":["Sobe a ladeira, firme!","Segura, a ladeira continua"]},"cidade|desafio|Rampa da passarela":{"incl":["Sobe a passarela, firme!","Segura até o meio"]},"cidade|desafio|Ladeira do centro":{"incl":["Sobe forte a ladeira!","Segura, ainda é ladeira"]},"cidade|climax|Ponte estaiada":{"anda":"Passo máximo na ponte!","trote":"Tudo pela ponte!"},"cidade|climax|Reta final":{"anda":"Passo máximo, 200 metros!","trote":"Tudo! Só 200 metros"},"cidade|climax|Última quadra":{"anda":"Passo máximo, última quadra!","trote":"Sprint na última quadra!"},"cidade|climax|Mirante da cidade":{"incl":"Tudo até o mirante!"},"cidade|climax|Topo do viaduto":{"incl":"Tudo até o topo!"},"cidade|climax|Alto da colina":{"incl":"Tudo até a colina!"}};
/* frases v4 */
for(const c of CENARIOS)for(const p in c.ev)for(const e of c.ev[p]){const v=MOTIVOS[c.id+'|'+p+'|'+e.t];if(v)e.mv=v;}
/* direção do bloco atual: sobe / mantém, comparando a zona com a do bloco anterior */
function cueDe(ev,papel){
  const i=idxAtual;let v=ev.mv;
  if(v&&typeof v==='object'&&!Array.isArray(v)){const fr=(EXERCICIOS[exAtual]||{}).frase;v=v[fr]||v.anda||v.trote||v.incl;}
  if(Array.isArray(v)){const z=i>0?NIVEIS[BL[i].nivel].zona:1,zp=i>0?NIVEIS[BL[i-1].nivel].zona:0;return z>zp?v[0]:v[1];}
  return v||ev.c||((CUE_MOD[modAtual]||{})[papel])||CUE[papel];
}

/* ---------- ícones ---------- */

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

const CSS=".ct-host .cena{position:absolute;inset:0;z-index:0;overflow:hidden;background:#0b0f10;transition:opacity .35s ease}\n.ct-host .cena.oculta{display:none}\n.ct-host .cena.trocando{opacity:0}\n.ct-host .ct-svg{position:absolute;inset:0;overflow:hidden}\n.ct-host .ct-svg>svg{position:absolute;inset:0;width:100%;height:100%;display:block}\n.ct-host .ct-vinheta{position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(4,6,7,.78) 0%,rgba(4,6,7,.5) 20%,rgba(4,6,7,.07) 28.4%,rgba(4,6,7,.04) 51%,rgba(4,6,7,.4) 57.3%,rgba(4,6,7,.8) 66.4%,rgba(4,6,7,.9) 100%)}\n.ct-host .veuprev{position:absolute;inset:0;pointer-events:none;background:rgba(4,6,7,.24);opacity:0;transition:opacity .6s}\n.cdover.f-prev .ct-host .veuprev,.cdover.f-fim .ct-host .veuprev{opacity:1}\n.cdover.f-count .ct-host .veuprev{opacity:.4}";

/* ==================== MOTOR DE COSTAS (protótipo aprovado) ==================== */
const MOTOR=(()=>{
const NS='http://www.w3.org/2000/svg',TAU=Math.PI*2,RD=Math.PI/180,f=v=>Math.round(v*10)/10;
const reduz=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let Z=3,CESC='predio',AUTO=true;
const H={camisa:'#ddff00',short:'#1f2328',tenis:'#00c9cc',pele:'#c68d63',cabelo:'#2e1f17'};
const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const circ=(x,y,r)=>'M'+f(x-r)+' '+f(y)+'a'+f(r)+' '+f(r)+' 0 1 0 '+f(2*r)+' 0a'+f(r)+' '+f(r)+' 0 1 0 '+f(-2*r)+' 0';
const hsh=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const pp=p=>f(p[0])+' '+f(p[1]);
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ---------- passada de subida (1 un ≈ 3 cm; degrau de 18 cm × 28,5 cm) ---------- */
const EH=6,ER=9.5,L1E=15.2,L2E=14.8,LMAX=29.85,ANK=2.4,TS=.15,TE=.85,TORSO=16.5,UA=10,FA=9.2;
const sstep=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const ikE=(hx,hy,ax,ay,s)=>{let dx=ax-hx,dy=ay-hy,d=Math.hypot(dx,dy);const m=L1E+L2E-.04;if(d>m){dx*=m/d;dy*=m/d;d=m;}
  const ph=Math.acos(Math.max(-1,Math.min(1,(L1E*L1E+d*d-L2E*L2E)/(2*L1E*d)))),ux=dx/d,uy=dy/d,a=-ph*s;
  return {kx:hx+L1E*(ux*Math.cos(a)-uy*Math.sin(a)),ky:hy+L1E*(ux*Math.sin(a)+uy*Math.cos(a)),ax:hx+dx,ay:hy+dy,d};};
/* sequência de pisadas: reta infinita ou zigue-zague (lance de N degraus + patamar com meia-volta) */
function trajReta(){return i=>({x:i*ER+2.7,y:-i*EH,d:1});}
function trajZig(N,XL){const XR=XL+(N-1)*ER,M=N+2,FH=N*EH;
  const P=i=>{const fl=Math.floor(i/M),j=i-fl*M,d=fl%2?-1:1,xs=d>0?XL:XR,y0=-fl*FH;
    if(j<N-1)return {x:xs+d*(j*ER+2.7),y:y0-(j+1)*EH,d,fl};
    const yl=y0-N*EH,b=xs+d*(N-1)*ER;
    if(j===N-1)return {x:b+d*2.7,y:yl,d,fl};if(j===N)return {x:b+d*9.6,y:yl,d,fl};return {x:b+d*6.6,y:yl,d:-d,fl};};
  P.N=N;P.M=M;P.FH=FH;P.XL=XL;P.XR=XR;return P;}
function segQ(a,b){const dx=Math.abs(b.x-a.x)/2,sub=a.y-b.y;return {x:(a.x+b.x)/2,y:(a.y+b.y)/2-Math.min(31.4,Math.sqrt(29.8*29.8-dx*dx)-sub/2+ANK)};}
function quadrilE(P,S){const n=Math.floor(S),t=S-n,p=P(n),a=segQ(P(n-1),p),b=segQ(p,P(n+1)),x=a.x+(b.x-a.x)*t,ay=p.y-ANK;
  /* o quadril sobe cedo: a perna de apoio estica até ~80% do passo (pêndulo invertido) e o resto é avanço */
  const D0=Math.hypot(a.x-p.x,a.y-ay),D1=Math.hypot(b.x-p.x,b.y-ay),D=D0+(D1-D0)*sstep(t/.8),dx=x-p.x;
  return {x,y:ay-Math.sqrt(Math.max(1,D*D-dx*dx))};}
/* pé apoiado: calcanhar sobe (gira na ponta) só o necessário para a perna alcançar */
const rotE=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
function peApoio(p,Q){const d=p.d,bx=p.x+5.5*d,by=p.y;
  const ank=th=>{const [rx,ry]=rotE(5.2*d,ANK,d*th);return [bx-rx,by-ry];};
  const dist=th=>{const [x,y]=ank(th);return Math.hypot(x-Q.x,y-Q.y);};
  let th=0;if(dist(0)>LMAX){let lo=0,hi=1.05;for(let k=0;k<14;k++){const m=(lo+hi)/2;dist(m)>LMAX?lo=m:hi=m;}th=hi;}
  const [ax,ay]=ank(th);return {ax,ay,th,d};}
function pes(P,S){const n=Math.floor(S),t=S-n,a=((n%2)+2)%2,Q=quadrilE(P,S),F={};
  F[a]=peApoio(P(n),Q);const b=1-a,p0=P(n-1),p1=P(n+1);
  if(t<TS)F[b]=peApoio(p0,Q);
  else if(t>TE)F[b]=peApoio(p1,Q);
  else{const u=(t-TS)/(TE-TS),L=peApoio(p0,quadrilE(P,n+TS)),A1x=p1.x,A1y=p1.y-ANK,sobe=Math.max(0,L.ay-A1y),
      ex=sstep((u-.18)/.82),ey=1-Math.pow(1-u,2.2),lift=2.2+.25*sobe;
    const dd=p0.d===p1.d?p0.d:p0.d*Math.cos(Math.PI*sstep(u));
    F[b]={ax:L.ax+(A1x-L.ax)*ex,ay:L.ay+(A1y-L.ay)*ey-lift*Math.sin(Math.PI*u),th:L.th*Math.pow(1-u,3)-(sobe>2?.17:.07)*Math.sin(Math.PI*u),d:dd};}
  return {F,Q,n,t};}
/* pontos do tênis (linha central e sola) */
function tenis(A){const dd=A.d,pt=(u,v)=>{const [x,y]=rotE(u*dd,v,(dd>=0?1:-1)*A.th);return [A.ax+x,A.ay+y];};
  return {lin:[pt(-1.1,.9),pt(5.1,.9)],sola:[pt(-2.6,ANK),pt(5.2,ANK)]};}

function base(P,S){const n=Math.floor(S),t=S-n,a=segQ(P(n-1),P(n)),b=segQ(P(n),P(n+1));return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}
const ZE={1:{lean:5,arm:17,cot:28},3:{lean:7,arm:24,cot:42},5:{lean:10,arm:33,cot:72}};
const PASSOS={1:1.1,3:1.7,5:2.4};

/* ---------- câmera atrás do aluno, no enquadramento da tela em pé (390 × 844) ---------- */
const CAM={f:302,D:155,U:4.6,cx:195,cy:402},KC=CAM.f/CAM.D,VPY=CAM.cy-CAM.f*EH/ER;
const nariz=z=>z*EH/ER;
function camCostas(P,S){const b=base(P,S),z=b.x-CAM.D,Y=-b.y+CAM.U;
  return {z,Y,f:CAM.f,D:CAM.D,vel:PASSOS[Z]*ER,pr:(X,Yw,zw)=>{const zc=Math.max(1,zw-z);return [CAM.cx+CAM.f*X/zc,CAM.cy-CAM.f*(Yw-Y)/zc];}};}
function poseCostas(P,S,c){const z=ZE[Z],{F,Q}=pes(P,S),ln=z.lean*RD,O={},P2=(X,Y,zz)=>pp(c.pr(X,Y,zz));
  const Yh=-Q.y,zh=Q.x,Ys=Yh+Math.cos(ln)*TORSO,zs=zh+Math.sin(ln)*TORSO;
  const pernas=[0,1].map(j=>{const A=F[j],X=j?3.5:-3.5,k=ikE(Q.x,Q.y,A.ax,A.ay,1),T=tenis(A);
    return {zA:A.ax,qa:[X*1.05,Yh,zh],kn:[X,-k.ky,k.kx],an:[X*.95,-k.ay,k.ax],T,X:X*.95};}).sort((a,b)=>b.zA-a.zA);
  pernas.forEach((L,i)=>{const nm='L'+i,m=v=>L.qa.map((q,u)=>q+(L.kn[u]-q)*v);
    O['p'+nm]='M'+P2(...L.qa)+'L'+P2(...L.kn)+'L'+P2(...L.an);
    O['c'+nm]='M'+P2(...L.qa)+'L'+P2(...m(.46));
    O['s'+nm]='M'+P2(L.X,-L.T.sola[0][1],L.T.sola[0][0])+'L'+P2(L.X,-L.T.sola[1][1],L.T.sola[1][0]);
    O['t'+nm]='M'+P2(L.X,-L.T.lin[0][1],L.T.lin[0][0])+'L'+P2(L.X,-L.T.lin[1][1],L.T.lin[1][0]);});
  O.sho='M'+[[-5.4,Yh+2.8],[5.4,Yh+2.8],[6.1,Yh-2.2],[1.2,Yh-3.8],[-1.2,Yh-3.8],[-6.1,Yh-2.2]].map(q=>P2(q[0],q[1],zh)).join('L')+'Z';
  O.tor='M'+P2(-5,Yh+1.6,zh+.2)+'L'+P2(-7.5,Ys-2,zs)+'Q'+P2(-7.6,Ys+1.6,zs)+' '+P2(-4.8,Ys+1.7,zs)+'L'+P2(4.8,Ys+1.7,zs)
    +'Q'+P2(7.6,Ys+1.6,zs)+' '+P2(7.5,Ys-2,zs)+'L'+P2(5,Yh+1.6,zh+.2)+'Z';
  /* braço: a mesma cor sempre; só a camada muda (atrás do tronco quando a mão vai à frente) */
  for(const j of [0,1]){const sg=j?1:-1,al=(j?1:-1)*z.arm*Math.cos(Math.PI*S)*RD,b=al+z.cot*RD,
      sh=[sg*7.1,Ys-1.8,zs],co=[sg*9.3,sh[1]-Math.cos(al)*UA,zs+Math.sin(al)*UA],mo=[sg*9.8,co[1]-Math.cos(b)*FA*.86,co[2]+Math.sin(b)*FA*.86],
      ma=[sg*9.9,co[1]-Math.cos(b)*FA*1.08,co[2]+Math.sin(b)*FA*1.08],pm=c.pr(...ma),rm=CAM.f*1.55/(ma[2]-c.z);
    const d='M'+P2(...sh)+'L'+P2(...co)+'L'+P2(...mo),mao=circ(pm[0],pm[1],rm),adiante=mo[2]>zs+1.5;
    O['bT'+j]=adiante?d:'M0 0';O['mT'+j]=adiante?mao:'M0 0';O['bF'+j]=adiante?'M0 0':d;O['mF'+j]=adiante?'M0 0':mao;}
  O.pesc='M'+P2(0,Ys+1,zs)+'L'+P2(0,Ys+3.4,zs+.3);
  const hc=c.pr(0,Ys+6.6,zs+Math.sin(ln)*6.6+.4),r=CAM.f*4.5/(zs-c.z);
  O.ore=circ(hc[0]-r*.97,hc[1]+r*.14,r*.26)+circ(hc[0]+r*.97,hc[1]+r*.14,r*.26);
  O.cab=circ(hc[0],hc[1],r);O.cabelo=circ(hc[0],hc[1]-r*.16,r*1.01);
  return O;}
const MANGA='#c6e600',COSTAS=[['bT0',MANGA,3.3*KC],['mT0',H.pele,0],['bT1',MANGA,3.3*KC],['mT1',H.pele,0],
  ['pL0',H.pele,4.3*KC],['cL0',H.short,6*KC],['sL0','#1b2026',3.8*KC],['tL0',H.tenis,3.8*KC],
  ['pL1',H.pele,4.3*KC],['cL1',H.short,6*KC],['sL1','#1b2026',3.8*KC],['tL1',H.tenis,3.8*KC],
  ['sho',H.short,0],['tor',H.camisa,0],['pesc',H.pele,3.4*KC],['bF0',MANGA,3.3*KC],['mF0',H.pele,0],['bF1',MANGA,3.3*KC],['mF1',H.pele,0],
  ['ore',H.pele,0],['cab',H.pele,0],['cabelo',H.cabelo,0]];
function heroi(pai,partes){const g=el('g',{},pai),m={};for(const [k,c,w] of partes)m[k]=w?el('path',{fill:'none',stroke:c,'stroke-width':f(w),'stroke-linecap':'round','stroke-linejoin':'round'},g):el('path',{fill:c},g);
  return {g,set:O=>{for(const k in m)if(O[k])m[k].setAttribute('d',O[k]);}};}

/* ---------- cenários ---------- */
const PE={
  predio:{deg:'#7d879c',esp:'#3b4357',quina:'#cfd5e1',corr:'#a7b0c3',ceu:['#0c1230','#222b55','#4b3f6e']},
  farol:{deg:'#d8cfb9',esp:'#a3987f',quina:'#f6f1e6',ceu:['#5fb0e0','#b4def2','#e8f5f9'],terra:'#4f5a60',terra2:'#7d898e',queda:1.6,rocha:'#3f484d'},
  montanha:{deg:'#aca393',esp:'#857c6f',quina:'#e0d8c9',ceu:['#86bce2','#c8e1ee','#f4ebdc'],terra:'#4e6d3a',terra2:'#8aa36a',queda:1.25,rocha:'#6d6a5f'}};
const terr=(X,z)=>nariz(z)-(PE[CESC].queda||0)*Math.max(0,Math.abs(X)-28);
let svg=null;let L={},O={};
function montaCena(){O={};const cen=PE[CESC],c=CESC;
  let s='<defs><linearGradient id="cg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="844"><stop offset="0" stop-color="'+cen.ceu[0]+'"/><stop offset=".45" stop-color="'+cen.ceu[1]+'"/><stop offset=".6" stop-color="'+cen.ceu[2]+'"/></linearGradient>'
    +(cen.terra?'<linearGradient id="tg" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="844"><stop offset="0" stop-color="'+cen.terra2+'"/><stop offset=".55" stop-color="'+cen.terra+'"/></linearGradient>':'')
    +'<radialGradient id="luz"><stop offset="0" stop-color="#ffd98a" stop-opacity=".42"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>'
    +'<radialGradient id="luzv"><stop offset="0" stop-color="#ff4a3d" stop-opacity=".7"/><stop offset="1" stop-color="#ff4a3d" stop-opacity="0"/></radialGradient>'
    +'<radialGradient id="nv"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>'
    +'<linearGradient id="rk" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="844"><stop offset="0" stop-color="#a7a398"/><stop offset=".5" stop-color="#857f72"/><stop offset="1" stop-color="#6e695e"/></linearGradient></defs>'
    +'<rect width="390" height="844" fill="url(#cg)"/>';
  if(c==='predio'){s+='<g id="est">';for(let i=0;i<60;i++)s+='<circle cx="'+f(196+hsh(i)*194)+'" cy="'+f(hsh(i+50)*380)+'" r="'+f(.5+hsh(i+90)*.8)+'" fill="#ffffff" opacity="'+f(.3+hsh(i+7)*.55)+'"/>';s+='</g>';
    s+='<circle cx="334" cy="116" r="13" fill="#f4efd9"/><circle cx="328" cy="112" r="12" fill="#1a2148"/>';
    s+='<path fill="#1a2040" d="M196 402V368h12v-10h8v10h10v-28h14v28h10v-16h12v16h16v-38h10v38h12v-20h14v20h12v-12h12v12h12v-24h10v24h14V402Z"/><rect x="196" y="402" width="194" height="442" fill="#121733"/>';
    for(let i=0;i<120;i++){const y=403+Math.pow(hsh(i+3),1.5)*441;s+='<circle cx="'+f(198+hsh(i+11)*192)+'" cy="'+f(y)+'" r="'+f(.5+(y-402)/150)+'" fill="'+(hsh(i+5)<.7?'#ffd98a':'#ffffff')+'" opacity=".7"/>';}
    s+='<rect width="195.6" height="844" fill="#262d45"/>';}
  else if(c==='farol')s+='<rect y="402" width="390" height="442" fill="#2f86b8"/><path d="M0 409H390M0 424H390M0 448H390" stroke="#5aa6d1" stroke-width="1.2" opacity=".6"/><g id="horiz"></g>'
      +'<path d="M128 96q5-3.6 10 0q5-3.6 10 0M250 80q4-3 8 0q4-3 8 0" fill="none" stroke="#2c3e4a" stroke-width="1.4" stroke-linecap="round"/>';
  else s+='<path fill="#9fb4c9" d="M0 402V348L36 318L64 340L104 286L140 330L170 312L196 340L224 306L256 326L292 278L330 322L358 300L390 330V402Z"/>'
      +'<path fill="#c3d0db" d="M104 286L92 301L100 298L108 304L114 296ZM292 278L280 293L288 290L296 296L302 289Z"/>'
      +'<rect y="420" width="390" height="424" fill="#a9bccb"/><path fill="#93a9bb" d="M0 470Q60 450 120 466T240 460T390 470V844H0Z"/><path fill="#ffffff" opacity=".88" d="M-10 406Q30 390 70 400T150 396T230 402T310 394T400 400V428H-10Z"/><g id="horiz"></g>';
  svg.innerHTML=s;
  L={horiz:svg.querySelector('#horiz')};const g=el('g',{},svg);
  /* crista (farol e montanha) e céu acima do telhado (prédio) acompanham o fim da escada */
  O.crista=cen.terra?el('path',{fill:'url(#tg)'},g):null;O.cume=c==='montanha'?el('path',{fill:'url(#rk)'},g):c==='farol'?el('path',{fill:'url(#tg)'},g):null;O.cumeS=c==='montanha'?el('path',{fill:'#5f5a50',opacity:.35},g):null;
  O.teto=c==='predio'?el('path',{fill:'url(#cg)'},g):null;
  O.det1=el('path',{fill:c==='predio'?'#ffd98a':cen.rocha,opacity:c==='predio'?.85:.9},g);
  O.det2=el('path',{fill:c==='predio'?'#353d5c':'none',stroke:c==='predio'?'none':'#3f6a2a','stroke-width':1.2,'stroke-linecap':'round'},g);
  O.laje=el('path',{fill:'#1d2338'},g);
  L.dest=el('g',{},g);O.fim=el('path',{fill:cen.esp},g);O.tr=el('path',{fill:cen.deg},g);O.ri=el('path',{fill:cen.esp},g);
  O.no=el('path',{fill:'none',stroke:cen.quina,'stroke-width':1.1},g);
  O.nevoa=c!=='montanha'?el('ellipse',{rx:60,ry:20,fill:'url(#nv)'},g):null;
  O.post=el('path',{fill:'none',stroke:cen.corr||'none','stroke-width':1.4},g);O.rail=el('path',{fill:'none',stroke:cen.corr||'none','stroke-width':2.2,'stroke-linecap':'round'},g);
  L.objF=el('g',{},svg);O.h=heroi(svg,COSTAS);L.objN=el('g',{},svg);}

function quadroCena(c){const W=28,zE=E-c.z,pe=c.pr(0,YEND,E),de=CAM.f*W/zE;
  const kA=Math.floor((c.z+58)/ER),kB=Math.min(KEND,Math.floor((c.z+(QUAL==='A'?1150:650))/ER));let tr='',ri='',no='';
  for(let k=kB;k>=kA;k--){const z0=k*ER,Y0=(k-1)*EH,Y1=k*EH,a=c.pr(-W,Y0,z0),b=c.pr(W,Y0,z0),e=c.pr(W,Y1,z0),g=c.pr(-W,Y1,z0);
    ri+='M'+pp(a)+'L'+pp(b)+'L'+pp(e)+'L'+pp(g)+'Z';no+='M'+pp(g)+'L'+pp(e);
    if(Y1<c.Y)tr+='M'+pp(g)+'L'+pp(e)+'L'+pp(c.pr(W,Y1,z0+(k===KEND?40:ER)))+'L'+pp(c.pr(-W,Y1,z0+(k===KEND?40:ER)))+'Z';}
  O.tr.setAttribute('d',tr);O.ri.setAttribute('d',ri);O.no.setAttribute('d',no);
  /* trecho distante até o topo: uma faixa só, do último degrau desenhado até o fim da escada */
  O.fim.setAttribute('d',kB<KEND?'M'+pp(c.pr(-W,kB*EH,kB*ER))+'L'+pp(c.pr(W,kB*EH,kB*ER))+'L'+f(pe[0]+de)+' '+f(pe[1])+'L'+f(pe[0]-de)+' '+f(pe[1])+'Z':'M0 0');
  if(O.nevoa){O.nevoa.setAttribute('cx',f(pe[0]));O.nevoa.setAttribute('cy',f(pe[1]+4));O.nevoa.setAttribute('opacity',f(Math.min(1,zE/2500)*(CESC==='predio'?.25:.6)*100)/100);}
  if(O.crista){const q=PE[CESC].queda,xl=pe[0]-de,xr=pe[0]+de;
    O.crista.setAttribute('d','M-10 '+f(pe[1]+q*(xl+10))+'L'+f(xl)+' '+f(pe[1])+'L'+f(xr)+' '+f(pe[1])+'L400 '+f(pe[1]+q*(400-xr))+'V860H-10Z');
    /* cume de granito: os últimos ~14% da subida viram rocha, com um domo baixo no topo; tudo na perspectiva real, cresce sozinho conforme o aluno chega */
    if(O.cume&&CESC==='farol'){const dw=de*4.5,dh=de*FAROL_H/28,y0=pe[1]+q*dw,yc=2*(pe[1]-dh)-pe[1]-q*dw;
      O.cume.setAttribute('d','M'+f(xl-dw)+' '+f(y0)+'Q'+f(pe[0])+' '+f(yc)+' '+f(xr+dw)+' '+f(y0)+'L'+f(xr)+' '+f(pe[1])+'L'+f(xl)+' '+f(pe[1])+'Z');}
    else if(O.cume){const zr=Math.max(c.z+30,E-Math.max(500,.14*LTOT)),Ps=c.pr(-W,nariz(zr),zr),Pd=c.pr(W,nariz(zr),zr),dw=de*5,dh=de*1.7,y0=pe[1]+q*dw,yc=2*(pe[1]-dh)-pe[1]-q*dw;
      const sl=(P_,x)=>P_[1]+q*Math.abs(P_[0]-x);
      O.cume.setAttribute('d','M'+f(xl-dw)+' '+f(y0)+'Q'+f(pe[0])+' '+f(yc)+' '+f(xr+dw)+' '+f(y0)+'L400 '+f(pe[1]+q*(400-xr))+'L400 '+f(sl(Pd,400))+'L'+pp(Pd)+'L'+pp(Ps)+'L-10 '+f(sl(Ps,-10))+'L-10 '+f(pe[1]+q*(xl+10))+'Z');
      O.cumeS.setAttribute('d','M'+f(pe[0])+' '+f(pe[1]-dh)+'Q'+f(xr+dw*.6)+' '+f(pe[1]-dh*.7)+' '+f(xr+dw)+' '+f(y0)+'L400 '+f(pe[1]+q*(400-xr))+'L400 '+f(sl(Pd,400))+'L'+pp(Pd)+'L'+f(pe[0])+' '+f(pe[1])+'Z');}}
  let d1='',d2='',lj='',po='',ra='';
  if(CESC==='predio'){const XW=-30,PERTO=6,TOPO=YEND+22;
    /* céu acima do telhado: o topo da fachada é uma linha que vai até o horizonte */
    const pn=c.pr(XW,TOPO,c.z+PERTO);let tt;
    if(pn[1]<-10){const t=(-10-pn[1])/(CAM.cy-pn[1]),xt=pn[0]+t*(CAM.cx-pn[0]);tt='M'+f(xt)+' -10L'+CAM.cx+' '+CAM.cy+'L195.6 '+CAM.cy+'L195.6 -10Z';}
    else tt='M'+pp(pn)+'L'+CAM.cx+' '+CAM.cy+'L195.6 '+CAM.cy+'L195.6 -10L-10 -10L-10 '+f(pn[1])+'Z';
    O.teto.setAttribute('d',tt);
    for(let ci=Math.floor((c.z+420)/60);ci>=Math.floor((c.z+PERTO-30)/60);ci--){const za=ci*60+14,zb=za+30;if(zb-c.z<=PERTO)continue;
      const z0=Math.max(za,c.z+PERTO),zc=zb-c.z,ymin=c.Y-(844-CAM.cy+30)*zc/CAM.f,ymax=Math.min(TOPO-50,c.Y+(CAM.cy+30)*zc/CAM.f);
      for(let r=Math.floor((ymin-78)/100);r*100+34<=ymax;r++){const Y0=r*100+34;
        const qd='M'+pp(c.pr(XW,Y0,z0))+'L'+pp(c.pr(XW,Y0+44,z0))+'L'+pp(c.pr(XW,Y0+44,zb))+'L'+pp(c.pr(XW,Y0,zb))+'Z';
        hsh(ci*31+r*17)<.5?d1+=qd:d2+=qd;}}
    const r0=Math.floor((c.Y-2400)/100),r1=Math.min(Math.floor(TOPO/100),Math.ceil((c.Y+2400)/100));
    for(let r=r0;r<=r1;r++)lj+='M'+pp(c.pr(XW,r*100-8,c.z+PERTO))+'L'+pp(c.pr(XW,r*100,c.z+PERTO))+'L'+CAM.cx+' '+CAM.cy+'Z';
    lj+='M'+pp(c.pr(XW,TOPO-6,c.z+PERTO))+'L'+pp(c.pr(XW,TOPO,c.z+PERTO))+'L'+CAM.cx+' '+CAM.cy+'Z';
    const k0=kA+(kA%2?1:0);for(let k=kB-(kB%2);k>=k0;k-=2){const z0=k*ER+1,Y=k*EH;po+='M'+pp(c.pr(27,Y,z0))+'L'+pp(c.pr(27,Y+30,z0));}
    ra='M'+pp(c.pr(27,k0*EH+30,k0*ER+1))+'L'+pp(c.pr(27,YEND+30,E))+'M'+pp(c.pr(-27,k0*EH+28,k0*ER+1))+'L'+pp(c.pr(-27,YEND+28,E));}
  else{const q=PE[CESC].queda;for(let r=Math.floor((Math.min(c.z+720,E-10))/14);r>=Math.floor((c.z+40)/14);r--){const zz=r*14+7;
    for(const sd of [-1,1]){const h=hsh(r*7+(sd>0?3:0)),X=sd*(33+h*h*200),Y=nariz(zz)-q*(Math.abs(X)-28),p=c.pr(X,Y,zz),sc=CAM.f/(zz-c.z);
      if(p[1]>860||p[0]<-30||p[0]>420)continue;
      if(hsh(r*13+(sd>0?5:1))<.45){const rx=sc*(1.6+h*3.2),ry=rx*.5;d1+='M'+f(p[0]-rx)+' '+f(p[1])+'a'+f(rx)+' '+f(ry)+' 0 1 0 '+f(2*rx)+' 0a'+f(rx)+' '+f(ry)+' 0 1 0 '+f(-2*rx)+' 0';}
      else{const a=sc*2.4;d2+='M'+f(p[0]-a*.6)+' '+f(p[1])+'l'+f(-a*.3)+' '+f(-a)+'M'+f(p[0])+' '+f(p[1])+'l0 '+f(-a*1.2)+'M'+f(p[0]+a*.6)+' '+f(p[1])+'l'+f(a*.3)+' '+f(-a);}}}}
  O.det1.setAttribute('d',d1);O.det2.setAttribute('d',d2);O.laje.setAttribute('d',lj);O.post.setAttribute('d',po);O.rail.setAttribute('d',ra);}

/* ---------- progresso: o topo fica no fim da escada e cresce conforme o cardio avança ---------- */
let DUR=20,LTOT=0,H0=0,S0=3,SFIM=0,KEND=0,E=0,YEND=0,chegou=0,tCheg=0,ff=0,ffVel=0;
const TOT={predio:40,farol:300,montanha:600},W_CUME=28*1.7,FAROL_H=24,FAROL_K=.75;
function plano(){H0=base(P,S0).x;LTOT=Math.max(1,distDe(TTOT))*ER;KEND=Math.round((H0+LTOT+10)/ER);E=KEND*ER;YEND=KEND*EH;SFIM=(H0+LTOT-2.7)/ER+.5;}
const progZ=z=>Math.max(0,Math.min(1,(z-H0)/LTOT));
const progresso=()=>progZ(base(P,S).x);
const DEST={
  predio:{s0:.2,s1:.6,svg:()=>'<path d="M-58 -12V-70H-40V-96H-22V-118H22V-96H40V-70H58V-12Z" fill="#2b3247" stroke="#ffd27a" stroke-width="2.4"/><path d="M-48 -24H48M-48 -40H48M-48 -56H48M-30 -82H30M-12 -106H12M-32 -12V-70M-12 -12V-118M12 -12V-118M32 -12V-70" stroke="#ffd27a" stroke-width="1.4" opacity=".55"/>'+'<circle cx="0" cy="-286" r="20" fill="url(#luzv)" class="pisca"/><path d="M0 -118V-286M-7 -160H7M-5 -210H5M-3 -250H3" stroke="#aab3c6" stroke-width="2.6"/><circle cx="0" cy="-288" r="4.2" fill="#ff4a3d" class="pisca"/>'
    +'<path d="M-34 -10V-44H-12V-10M-31 -10l-2 8M-15 -10l2 8" fill="#5a6378" stroke="#5a6378" stroke-width="1.6"/><rect x="10" y="-38" width="28" height="28" fill="#2b3247"/><rect x="18" y="-30" width="9" height="20" fill="#ffd27a"/>'
    +'<rect x="-46" y="-12" width="92" height="12" fill="#3a4152"/><rect x="-46" y="-12" width="92" height="2" fill="#7d879c"/>'},
  farol:{s0:.06,s1:.36,svg:()=>'<circle cx="0" cy="-596" r="70" fill="url(#luz)"/><path d="M-70 0L-46 -560H46L70 0Z" fill="#f7f4ec"/><path d="M-63 -150H63L60 -215H-60ZM-55 -330H55L52 -395H-52Z" fill="#d4433a"/>'
    +'<path d="M-15 0V-34A15 15 0 0 1 15 -34V0Z" fill="#2b2f33"/><rect x="-6" y="-270" width="12" height="20" rx="6" fill="#2b2f33"/><rect x="-5" y="-460" width="10" height="18" rx="5" fill="#2b2f33"/>'
    +'<rect x="-58" y="-572" width="116" height="12" fill="#2b2f33"/><path d="M-58 -572V-586M-30 -572V-586M0 -572V-586M30 -572V-586M58 -572V-586M-58 -586H58" stroke="#2b2f33" stroke-width="2.4"/>'
    +'<rect x="-30" y="-630" width="60" height="58" fill="#ffd977"/><path d="M-10 -630V-572M10 -630V-572" stroke="#c9a54a" stroke-width="2"/><path d="M-36 -630L0 -672L36 -630Z" fill="#2b2f33"/><path d="M0 -672V-690" stroke="#2b2f33" stroke-width="2.4"/>'},
  /* no cume: só o marco de pedras e a bandeira (o topo de rocha é o próprio morro, desenhado em perspectiva) */
  montanha:{s0:.1,s1:.3,svg:()=>'<path d="M-16 0Q-18 -7 -9 -8Q-14 -14 -5 -16Q-7 -22 2 -22Q11 -21 7 -15Q16 -14 13 -7Q18 -5 16 0Z" fill="#8f8b80"/><path d="M-9 -8Q0 -10 7 -15M-5 -16Q2 -17 7 -15" stroke="#6f6b62" stroke-width="1.2" fill="none"/>'
    +'<path d="M0 -20V-96" stroke="#3d3a33" stroke-width="2.6"/><g class="tremula"><path d="M0 -96Q18 -100 38 -90Q20 -84 0 -74Z" fill="#d4433a"/></g>'+'<rect x="-30" y="-10" width="24" height="10" rx="2" fill="'+MOSTARDA+'"/>'+TXT(-18,-2.6,'1.308 m',5,PRETO,800,21,8)}};
/* prédio e farol: o topo tem o tamanho real e só cresce pela perspectiva; de longe, só a luz (antena / lanterna) aparece com um tamanho mínimo */
const FAROLETE={predio:{y:288,z:20,svg:'<circle r="20" fill="url(#luzv)"/><circle r="4.2" fill="#ff4a3d"/>',min:.45,pisca:1},farol:{y:600*FAROL_K+FAROL_H,z:40,svg:'<circle r="60" fill="url(#luz)"/><circle r="9" fill="#fff4c4"/>',min:.3}};
function criaDestino(){const d=DEST[CESC],fl=FAROLETE[CESC];
  if(fl)novo(fl.svg,0,YEND+fl.y,E+fl.z,{dest:1,sfn:zc=>Math.max(CAM.f/zc,fl.min),upd:o=>{if(fl.pisca)o.mul=(o.t%1.4)<.7?1:.15;else o.mul=.85+.15*Math.sin(o.t*2.4);}});
  return novo(d.svg(),0,YEND+(CESC==='montanha'?W_CUME:CESC==='farol'?FAROL_H:0),E+(CESC==='farol'?40:CESC==='montanha'?4:20),{dest:1,k:CESC==='farol'?FAROL_K:1,sfn:zc=>{if(fl)return CAM.f/zc;const p=progresso();return Math.max(CAM.f/zc,d.s0+(d.s1-d.s0)*p);},
  upd:o=>{const tm=o.tm||(o.tm=o.g.querySelector('.tremula')||1);if(tm!==1)tm.setAttribute('transform','skewY('+f(Math.sin(o.t*5)*4)+')');const pis=o.g.querySelectorAll('.pisca');if(pis.length){const on=(o.t%1.4)<.7;pis.forEach(e=>e.setAttribute('opacity',on?1:.15));}}});}

/* ---------- elementos: figuras planas posicionadas no mundo, escaladas pela distância ---------- */
/* texto de placa que sempre cabe: monospace tem largura de 0,62 em por letra; se passar de maxW, a letra encolhe;
   se encolher demais e houver espaço no texto, quebra em 2 linhas (respeitando maxH). y = linha de base de 1 linha. */
const MOSTARDA='#e1ad01',PRETO='#0b0b0b',LW=.62;
const TXT=(x,y,t,tam,cor,peso,maxW,maxH)=>{t=String(t);const un=s=>'<text x="'+x+'" y="'+'§Y'+'" font-size="'+'§S'+'" font-weight="'+(peso||800)+'" text-anchor="middle" fill="'+cor+'" font-family="JetBrains Mono,monospace">'+s+'</text>';
  const cy=y-.35*tam,n=t.length;let s=tam;
  if(maxW&&n*s*LW>maxW)s=maxW/(n*LW);
  const sp=t.indexOf(' ')>0||t.lastIndexOf(' ')>0;
  if(maxW&&s<tam*.72&&sp){let k=t.indexOf(' ',Math.floor(t.length/2));if(k<0)k=t.lastIndexOf(' ');const a=t.slice(0,k),b=t.slice(k+1),m=Math.max(a.length,b.length);let s2=Math.min(tam,maxW/(m*LW));
    if(maxH)s2=Math.min(s2,maxH/2.3);
    if(s2>s*1.12){const r=(yy,w)=>un(w).replace('§Y',f(yy)).replace('§S',f(s2));return r(cy-.2*s2,a)+r(cy+.9*s2,b);}}
  if(maxH&&s>maxH*.8)s=maxH*.8;
  return un(t).replace('§Y',f(cy+.35*s)).replace('§S',f(s));};
const SPR={
  placaParede:(t,ev)=>ev?'<rect x="-15" y="-12" width="30" height="12" rx="1.4" fill="'+MOSTARDA+'"/>'+TXT(0,-4.2,t,4.6,PRETO,800,27,10)
    :'<rect x="-10" y="-7.5" width="20" height="7.5" rx="1" fill="'+MOSTARDA+'"/>'+TXT(0,-2.4,t,3.4,PRETO,800,17.5,6),
  marcoPedra:(t,ev)=>'<path d="M-2.6 0V-13h5.2V0Z" fill="#9a9483"/><path d="M-2.6 -13h5.2" stroke="#b9b3a2" stroke-width=".8"/>'
    +(ev?'<rect x="-13" y="-25" width="26" height="11" rx="1.4" fill="'+MOSTARDA+'"/>'+TXT(0,-17.6,t,4.2,PRETO,800,23,9):'<rect x="-7.5" y="-20.5" width="15" height="7.5" rx="1" fill="'+MOSTARDA+'"/>'+TXT(0,-15.2,t,3.8,PRETO,800,13,6)),
  marcoMadeira:(t,ev)=>'<rect x="-.9" y="-22" width="1.8" height="22" fill="#6b4a2b"/>'
    +(ev?'<path d="M-15 -30h26l4 4-4 4h-26Z" fill="'+MOSTARDA+'"/>'+TXT(-2,-24.4,t,4.2,PRETO,800,23,6.5):'<path d="M-10.5 -24.5h17.5l3 3.2-3 3.2h-17.5Z" fill="'+MOSTARDA+'"/>'+TXT(-1.8,-19.8,t,3.4,PRETO,800,15,5)),
  pombo:()=>'<ellipse cx="0" cy="-3" rx="3.4" ry="2.2" fill="#c3c8d1"/><path d="M3 -3.4l3 -1-.3 2Z" fill="#7d838e"/><circle cx="-3" cy="-4.9" r="1.45" fill="#aeb4be"/><path d="M-4.4 -5l-1.3 .45 1.3 .35Z" fill="#e0b25a"/>'
    +'<path d="M-2.4 -3.7q.8 1.3 2 .8" stroke="#6fa38c" stroke-width=".7" fill="none"/><path d="M-.6 -1v1M.9 -1v1" stroke="#c46a5a" stroke-width=".5"/><g transform="translate(0 -3.6)"><g class="asa"><path d="M-1 0q2.2 -3.4 4.8 -1.8q-1.6 1.6-4.8 1.8Z" fill="#e2e6ec"/></g></g>',
  gaivota:()=>'<g class="asa"><path d="M0 -.6Q-3.8 -4.4 -9.4 -2Q-5.2 -.4 0 1.6Q5.2 -.4 9.4 -2Q3.8 -4.4 0 -.6Z" fill="#e3e8ec" stroke="#56636b" stroke-width=".45"/><path d="M-9.4 -2l-1.5 .7-.4-1.2ZM9.4 -2l1.5 .7.4-1.2Z" fill="#2e3439"/></g><ellipse cx="0" cy=".3" rx=".95" ry="1.5" fill="#ffffff" stroke="#8a969c" stroke-width=".3"/>',
  passaro:()=>'<g class="asa"><path d="M-5 -1.6Q-2.4 -2.6 0 0Q2.4 -2.6 5 -1.6" stroke="'+(CESC==='predio'?'#e6eaf2':'#26303a')+'" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>',
  limpador:()=>'<circle cx="0" cy="-12" r="26" fill="url(#luz)"/><path d="M-12 -260V-11M12 -260V-11" stroke="#c3cad8" stroke-width=".5"/><rect x="-15" y="-3" width="30" height="3" fill="#6d7891"/><rect x="11.5" y="-13.5" width="3.4" height="2.6" fill="#fff3c4"/><path d="M-15 -3V-11H15V-3M-15 -7H15" stroke="#c3cad8" stroke-width=".6" fill="none"/>'
    +'<rect x="-5.6" y="-10" width="2.2" height="7" fill="#2a63c9"/><rect x="-2.6" y="-10" width="2.2" height="7" fill="#2a63c9"/><rect x="-6" y="-18.5" width="6" height="9.5" rx="1.6" fill="#4b9bff"/>'
    +'<circle cx="-3" cy="-21.2" r="2.4" fill="#c68d63"/><path d="M-5.6 -21.6a2.6 2.6 0 0 1 5.2 0Z" fill="#ffd23f"/><g class="braco"><path d="M-.6 -16.5l4 -5" stroke="#4b9bff" stroke-width="1.7" stroke-linecap="round"/><circle cx="3.6" cy="-22" r="1" fill="#c68d63"/></g>'
    +'<rect x="6" y="-6" width="3.6" height="3" fill="#e05a3a"/><path d="M8 -12v6M5.6 -12h4.8" stroke="#2b2f33" stroke-width=".7"/>',
  andaime:()=>'<rect x="-11" y="-96" width="9" height="96" fill="#ff7a1a" opacity=".5"/><path d="M-11 0V-96M7 0V-96M-11 -32H7M-11 -64H7M-11 -96H7M-11 0L7 -32L-11 -64L7 -96" stroke="#ffcf3a" stroke-width="1.3" fill="none"/>'
    +'<rect x="-12" y="-33.4" width="20" height="1.8" fill="#8a6239"/><rect x="-12" y="-65.4" width="20" height="1.8" fill="#8a6239"/><rect x="-1" y="-68" width="3.4" height="2.6" fill="#e05a3a"/>',
  varanda:(luz)=>'<rect x="-9" y="-26" width="13" height="24" fill="'+(luz?'#ffd27a':'#353d5c')+'"/><rect x="-17" y="-2" width="34" height="2.6" fill="#3a4152"/><rect x="-17" y="-11" width="34" height="9" fill="#9fd3ff" opacity=".3" stroke="#c3cad8" stroke-width=".5"/>'
    +'<rect x="-14" y="-10.5" width="5" height="4" fill="#b55a3a"/><circle cx="-11.5" cy="-13" r="3.3" fill="#3f8a4a"/><circle cx="-9" cy="-15" r="2.6" fill="#4ea65a"/><rect x="9" y="-10.5" width="4.6" height="3.6" fill="#b55a3a"/><circle cx="11.3" cy="-12.6" r="2.8" fill="#3f8a4a"/>',
  gota:()=>'<circle r="2" fill="#ffffff" opacity=".9"/>',
  veleiro:()=>'<path d="M-9 0h18l-3 3h-12Z" fill="#7a3b2a"/><path d="M0 -1V-22L9 -2Z" fill="#ffffff"/><path d="M-1 -2V-18L-8 -2Z" fill="#f2efe6"/>',
  cabra:()=>'<path d="M-13 3Q-12 -7 -3 -8.4Q7 -9.4 12 -3L13 3Z" fill="#7d776c"/><path d="M-9 -6Q-2 -9 6 -7" stroke="#948d80" stroke-width="1" fill="none"/><g class="pulo">'
    +'<path d="M-4.4 -12.6v4.6M-2.2 -12.6v4.8M2.6 -12.6v4.6M4.6 -12.6v4.4" stroke="#d8cfbe" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="0" cy="-15.6" rx="6.6" ry="3.7" fill="#efe9dd"/>'
    +'<path d="M-6.4 -17l-1.8 -1.4" stroke="#efe9dd" stroke-width="1.1" stroke-linecap="round"/><path d="M4.4 -17.6l2.8 -5" stroke="#efe9dd" stroke-width="2.8" stroke-linecap="round"/>'
    +'<ellipse cx="8.6" cy="-23.4" rx="2.5" ry="1.6" fill="#efe9dd" transform="rotate(25 8.6 -23.4)"/><path d="M7.2 -25q-1.6 -3.4 -4.2 -3.4M8 -25.2q-.6 -3.6 -3 -4.2" stroke="#6b5a45" stroke-width=".85" fill="none" stroke-linecap="round"/>'
    +'<path d="M9.6 -22.2l-.4 2.2" stroke="#d8cfbe" stroke-width=".9"/><circle cx="8.7" cy="-24" r=".35" fill="#222"/></g>',
  bromelia:()=>{let s='';for(let i=0;i<7;i++){const a=(-75+i*25)*RD,x=Math.sin(a)*7,y=-Math.cos(a)*7-1;s+='<path d="M0 0Q'+f(x*.4-.9)+' '+f(y*.5)+' '+f(x)+' '+f(y)+'Q'+f(x*.4+.9)+' '+f(y*.5)+' 0 0Z" fill="'+(i%2?'#3e7d3a':'#5aa04a')+'"/>';}
    return s+'<path d="M-1.2 -1L0 -11L1.2 -1Z" fill="#e2384d"/><circle cx="0" cy="-11" r="1" fill="#ffd23f"/>';},
  nuvem:()=>'<g opacity=".93"><ellipse cx="0" cy="-8" rx="32" ry="8" fill="#ffffff"/><ellipse cx="-14" cy="-13" rx="14" ry="9.5" fill="#ffffff"/><ellipse cx="10" cy="-15" rx="16" ry="11" fill="#ffffff"/><ellipse cx="0" cy="-5.5" rx="36" ry="5" fill="#e3ecf3"/></g>',
  golfinho:()=>'<path d="M-10 0Q-4 -5.4 4 -4.4Q9.4 -3.6 11.6 -1Q8.4 -.2 4 .6Q-2.6 1.4 -10 0Z" fill="#5d7f96"/><path d="M-6 .4Q0 1.6 6 .2" stroke="#b9cbd6" stroke-width="1" fill="none"/><path d="M-1 -4.8l2.6 -4 1.2 3.8Z" fill="#4c6a80"/><path d="M-10 0l-3.4 -2.8.7 2.8-.7 2.6Z" fill="#4c6a80"/><circle cx="7.6" cy="-2.4" r=".45" fill="#1b2730"/>',
  espuma:()=>'<g fill="#f2fbff" opacity=".88"><circle cx="0" cy="-6" r="6"/><circle cx="-6.5" cy="-3" r="4"/><circle cx="6.5" cy="-4" r="4.6"/><circle cx="-2" cy="-13" r="3.6"/><circle cx="4" cy="-14.5" r="2.6"/><circle cx="-8" cy="-11" r="1.6"/><circle cx="9" cy="-12" r="1.4"/></g>',
  banco:()=>'<path d="M-8 -5V0M8 -5V0M-8 -13V-7M8 -13V-7" stroke="#5a3e22" stroke-width="1.3"/><rect x="-10.5" y="-7" width="21" height="2.2" fill="#8a6239"/><rect x="-10.5" y="-13.4" width="21" height="2.2" fill="#8a6239"/><rect x="2" y="-11" width="5" height="4" rx="1" fill="#d4433a"/>',
  portal:(t)=>'<path d="M-43 40V-62h10V40ZM33 40V-62h10V40Z" fill="#8f877a"/><path d="M-43 -40h10M-43 -18h10M-43 4h10M33 -40h10M33 -18h10M33 4h10" stroke="#766f63" stroke-width="1"/>'
    +'<path d="M-48 -62Q0 -80 48 -62V-72Q0 -90 -48 -72Z" fill="#9c9486"/><path d="M-30 -66l1 -9M-12 -71l.6 -9M6 -72l-.4 -9M24 -68l-1 -9" stroke="#7e776a" stroke-width="1"/>'
    +'<rect x="-13" y="-92" width="26" height="9" rx="1.2" fill="'+MOSTARDA+'"/>'+TXT(0,-85.6,t,4.4,PRETO,800,23,7.4)};

let OBJ=[],seq=0,ordem='',CAMA=null;const feitos=new Set();
function novo(spr,X,Y,z,ex){const o=Object.assign({X,Y,z,vx:0,vy:0,vz:0,t:0,id:seq++},ex||{});
  o.g=el('g',{opacity:0},o.dest?L.dest:(o.tela?L.horiz:L.objF));o.g.innerHTML=spr;o.asa=o.g.querySelector('.asa');o.braco=o.g.querySelector('.braco');o.pulo=o.g.querySelector('.pulo');OBJ.push(o);return o;}
function objetos(c,dt){const vel=c.vel;
  for(let i=OBJ.length-1;i>=0;i--){const o=OBJ[i];o.t+=dt;if(o.upd)o.upd(o,dt,vel);
    o.X+=o.vx*dt;o.Y+=o.vy*dt;o.z+=o.vz*dt;let x,y,s;
    if(o.tela){x=o.X;y=o.Y;s=o.sc;}
    else{const zc=o.z-c.z;if(zc<10||(zc>9500&&!o.dest)){o.g.remove();OBJ.splice(i,1);continue;}const p=c.pr(o.X,o.Y,o.z);x=p[0];y=p[1];s=o.sfn?o.sfn(zc):c.f/zc;o.zc=zc;
      if(o.limX)x=Math.max(60,Math.min(330,x));
      if(y-s*120>900||x+s*60<-60||x-s*60>450){if(zc<c.D){o.g.remove();OBJ.splice(i,1);continue;}}}
    if(o.vida!=null&&o.t>o.vida){o.g.remove();OBJ.splice(i,1);continue;}
    const op=(QUAL==='C'?1:Math.min(1,o.t/.9))*(o.vida!=null?Math.max(0,Math.min(1,(o.vida-o.t)/.6)):1)*(o.tela?1:Math.max(0,Math.min(1,(o.zc-22)/45)))*(o.mul==null?1:o.mul)*(c.oculto&&!o.tela&&!o.dest&&c.oculto(o.z,y)?0:1);
    o.g.setAttribute('opacity',op.toFixed(2));
    const k=s*(o.k||1);o.g.setAttribute('transform','translate('+f(x)+' '+f(y)+') scale('+(o.esp?-k:k).toFixed(3)+' '+k.toFixed(3)+')'+(o.rot?' rotate('+f(o.rot)+')':''));
    if(o.asa&&o.bat)o.asa.setAttribute('transform','scale(1 '+(o.plana?(.62+.38*Math.cos(o.t*o.bat)):Math.cos(o.t*o.bat)).toFixed(2)+')');
    if(o.giro){o.pas=o.pas||o.g.querySelector('.pas');if(o.pas)o.pas.setAttribute('transform','rotate('+f(o.t*70)+')');}
    if(o.braco)o.braco.setAttribute('transform','rotate('+f(28*Math.sin(o.t*6))+' -.6 -16.5)');
    if(o.pulo){const ph=(o.t*.8)%1,h=ph<.45?Math.sin(ph/.45*Math.PI)*11:0;o.pulo.setAttribute('transform','translate('+f(ph<.45?-2+ph/.45*4:2)+' '+f(-h)+')');}}
  const vis=OBJ.filter(o=>!o.tela&&!o.dest).sort((a,b)=>b.zc-a.zc),k=vis.map(o=>o.id+(o.zc<c.D-4?'n':'f')).join(',');
  if(k!==ordem){ordem=k;for(const o of vis)(o.zc<c.D-4?L.objN:L.objF).appendChild(o.g);}}

/* marcos que aparecem sempre: andar na parede, degrau no rochedo, altitude na trilha */
const alt=k=>(1200+k*.18).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' m';
function marcos(c){const z0=c.z+70,z1=Math.min(c.z+760,E-30),T=TOT[CESC],passo=CESC==='predio'?1:CESC==='farol'?10:20;
  for(let n=Math.max(passo,Math.ceil(((z0-H0)/LTOT)*T/passo)*passo);n<T;n+=passo){const z=H0+n/T*LTOT;if(z>z1)break;const key='m'+n;if(feitos.has(key))continue;feitos.add(key);
    if(CESC==='predio')novo(SPR.placaParede('ANDAR '+n),-29.5,nariz(z)+31,z,{k:1.5});
    else novo(CESC==='farol'?SPR.marcoPedra(String(n)):SPR.marcoMadeira(alt(n)),34,terr(34,z),z,{k:1.5});}}

/* eventos de cada cenário (os mesmos do app) e o elemento que cada um põe na cena */
const EVS={
  predio:{partida:[['Térreo','placa','ANDAR {andar}'],['Portaria','placa','PORTARIA'],['Escada de incêndio','placa','SAÍDA ↑']],
    exploracao:[['Pombos','pombo'],['Limpador de vidros','limpador'],['Varanda','varanda']],
    desafio:[['Lance rápido','placa','ANDAR {andar}'],['Andar alto','placa','ANDAR {andar}'],['Vento no alto','vento'],['Meio do prédio','placa','ANDAR {andar}'],['Varandas acesas','varandas'],['Andaime','andaime']],
    climax:[['Último lance','placa','ANDAR {andar}'],['Cobertura','placa','COBERTURA ↑'],['Porta do terraço','placa','TERRAÇO ↑']],
    alivio:[['Patamar','pombo'],['Vista da cidade',null]],
    chegada:[['Heliponto','placa','HELIPONTO'],['Terraço','placa','TERRAÇO'],['Topo','placa','TOPO']]},
  farol:{partida:[['Porta do farol','placa','DEGRAU {degrau}'],['Rochedo','placa','FAROL'],['Base da torre','placa','DEGRAU {degrau}']],
    exploracao:[['Gaivotas','gaivotas'],['Golfinhos','golfinhos',null,1],['Veleiro','veleiro',null,1]],
    desafio:[['Ondas no rochedo','ondas',null,1],['Vento do mar','ventoMar'],['Meio do farol','placa','DEGRAU {degrau}'],['Degraus estreitos','placa','DEGRAU {degrau}'],['Bando de gaivotas','bando'],['Maresia','maresia',null,1]],
    climax:[['Rumo à lanterna','placa','DEGRAU {degrau}'],['Último giro','placa','LANTERNA ↑'],['Galeria do topo','placa','GALERIA ↑']],
    alivio:[['Patamar',null],['Brisa','gaivotas']],
    chegada:[['A lanterna','placa','LANTERNA'],['Luz acesa','placa','LUZ ACESA'],['Vista do mar','veleiro',null,1]]},
  montanha:{partida:[['Primeiro degrau','placa','DEGRAU {degrau}'],['Portal de pedra','portal','TRILHA'],['Pé da montanha','placa','DEGRAU {degrau}']],
    exploracao:[['Cabra na pedra','cabra'],['Bromélias','bromelias',null,1],['Nuvens abaixo','nuvens',null,1]],
    desafio:[['Paredão','placa','DEGRAU {degrau}'],['Degraus altos','placa','DEGRAU {degrau}'],['Vento na encosta','vento'],['Lance íngreme','placa','DEGRAU {degrau}'],['Cabra saltando','cabraSalta'],['Acima das nuvens','nuvens',null,1]],
    climax:[['Rumo ao cume','placa','CUME ↑'],['Últimos degraus','placa','DEGRAU {degrau}'],['Crista de pedra','placa','CRISTA ↑']],
    alivio:[['Platô',null],['Mirante','banco']],
    chegada:[['O cume','placa','CUME'],['Mirante do topo','banco'],['Vista do vale','nuvens',null,1]]}};
const ROT={partida:'Partida',exploracao:'Exploração',desafio:'Desafio',climax:'Clímax',alivio:'Alívio',chegada:'Chegada'};
const ICO={partida:'<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>',exploracao:'<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z"/>',
  desafio:'<path d="M3 19 9.5 9l4 5.5 2.5-3.5L21 19Z"/><path d="M17 3v5M14.8 5.2 17 3l2.2 2.2"/>',climax:'<path d="M3 19 10 8l4 6 2-3 5 8Z"/><path d="M10 8V3l4.5 1.6L10 6.2"/>',
  alivio:'<path d="M3 8.5h10.5a2.8 2.8 0 1 0-2.8-2.8M3 15.5h14.5a2.8 2.8 0 1 1-2.8 2.8M3 12h7"/>',chegada:'<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 6.5V4M5.5 9.6 3.8 7.9M18.5 9.6l1.7-1.7"/>'};
const MOT={};
Object.assign(MOT,{'farol|exploracao|Golfinhos':['Acelera um pouco, golfinhos à vista','No ritmo, olha os golfinhos'],'farol|desafio|Ondas no rochedo':['Sobe forte, onda batendo!','Segura, as ondas batem']});
function frase(papel,nome){let v=MOT[(CESC==='montanha'?'escadaria':CESC)+'|'+papel+'|'+nome];if(v&&typeof v==='object'&&!Array.isArray(v))v=v[EX]||v.anda||v.trote||v.incl;return Array.isArray(v)?v[0]:(v||ROT[papel]);}

function poeElemento(spr,placa){const c=CAMA;if(!c||!spr)return;sujo=true;const z0=c.z+290,vel=PASSOS[Z]*ER;if(z0>E-40&&spr!=='veleiro'&&spr!=='golfinhos')return;
  const lado=()=>Math.random()<.5?-1:1;
  switch(spr){
    case 'placa':{const pz=progZ(z0),t=placa.replace('{andar}',String(Math.max(1,Math.round(pz*40)))).replace('{degrau}',String(Math.max(1,Math.round(pz*TOT[CESC]))));
      if(CESC==='predio')novo(SPR.placaParede(t,1),-29.5,nariz(z0)+33,z0,{k:1.6});else if(CESC==='farol')novo(SPR.marcoPedra(t,1),-35,terr(35,z0),z0,{k:1.6});else novo(SPR.marcoMadeira(t,1),-35,terr(35,z0),z0,{k:1.6});break;}
    case 'pombo':for(let i=0;i<3;i++)novo(SPR.pombo(),27+rnd(-.4,.4),0,z0+i*9,{k:2.7,esp:Math.random()<.5,upd:(o,dt,v)=>{o.Y=o.voa?o.Y:nariz(o.z)+31;
      if(!o.voa&&o.zc<CAM.D+22){o.voa=1;o.bat=24;o.vy=rnd(14,20);o.vx=rnd(8,16);o.vz=v*rnd(.6,.9);o.vida=o.t+3.6;}}});break;
    case 'limpador':novo(SPR.limpador(),-27,nariz(z0)+68,z0,{k:1.5});break;
    case 'andaime':novo(SPR.andaime(),-24,nariz(z0)-30,z0,{k:1.3});break;
    case 'varanda':novo(SPR.varanda(1),-30,nariz(z0)+80,z0,{k:1.4});break;
    case 'varandas':[[0,80,1],[60,130,1],[120,82,0],[170,134,1]].forEach(([dz,dy,l])=>novo(SPR.varanda(l),-30,nariz(z0+dz)+dy,z0+dz,{k:1.4}));break;
    case 'vento':case 'ventoMar':rajada('vento',3.6);
      if(spr==='ventoMar')poeElemento('gaivotas');else poeElemento('passaros');break;
    case 'passaros':for(let i=0;i<5;i++)novo(SPR.passaro(),rnd(-90,90),nariz(z0)+rnd(105,150),z0+rnd(-30,50),{k:1.8,plana:1,bat:rnd(10,14),vz:vel*.45,vx:rnd(-4,4)});break;
    case 'gaivotas':case 'bando':for(let i=0,n=spr==='bando'?8:3;i<n;i++){const sd=lado();novo(SPR.gaivota(),sd*rnd(40,120),nariz(z0)+rnd(110,170),z0+rnd(-40,40),{k:2,plana:1,bat:rnd(4,6),vz:vel*.35,vx:sd*rnd(-2,2),
      upd:o=>{o.vy=3*Math.sin(o.t*1.3+o.id);}});}break;
    case 'veleiro':novo(SPR.veleiro(),rnd(330,360),410,0,{tela:1,sc:2,vx:-5,vida:45});break;
    case 'maresia':for(let i=0;i<26;i++){const sd=lado(),X=sd*rnd(30,62),z=c.z+rnd(110,330);novo(SPR.gota(),X,terr(X,z)+rnd(0,3),z,{vy:rnd(6,14),vz:-vel*.25,vx:sd*rnd(2,6),vida:rnd(1.8,2.8)});}break;
    case 'cabra':{const sd=lado(),X=sd*rnd(37,45),o=novo(SPR.cabra(),X,terr(X,z0),z0,{k:2,esp:sd>0});o.pulo=null;break;}
    case 'cabraSalta':{const sd=lado(),X=sd*rnd(37,45);novo(SPR.cabra(),X,terr(X,z0),z0,{k:2,esp:sd>0});break;}
    case 'bromelias':for(let i=0;i<8;i++){const sd=i%2?1:-1,X=sd*rnd(34,40),z=z0+i*16;novo(SPR.bromelia(),X,terr(X,z),z,{k:2.1});}break;
    case 'nuvens':for(let i=0;i<6;i++){const sd=i%2?1:-1,X=sd*rnd(85,200),z=z0+i*50-40;novo(SPR.nuvem(),X*1.6,terr(X,z)+rnd(16,40),z,{k:3.2,vx:sd*rnd(1,3)});}break;
    case 'golfinhos':for(let i=0;i<2;i++){const dir=i?-1:1,x0=dir>0?rnd(6,30):rnd(360,384);novo(SPR.golfinho(),x0,418+i*8,0,{tela:1,sc:2.6,esp:dir<0,vx:dir*rnd(9,13),vida:18,fase:i*.45,y0:418+i*8,
      upd:o=>{const ph=(o.t*.55+o.fase)%1,u=ph/.5;if(ph<.5){o.mul=1;o.Y=o.y0-Math.sin(u*Math.PI)*22;o.rot=(o.esp?1:-1)*(-38+76*u);}else o.mul=0;}});}break;
    case 'ondas':for(let i=0;i<9;i++)setTimeout(()=>{const C2=CAMA;if(!C2)return;const sd=lado(),X=sd*rnd(64,130),z=C2.z+rnd(170,300);
      novo(SPR.espuma(),X,terr(X,z)-4,z,{vida:1.5,upd:o=>{o.k=.8+o.t*2.2;}});},i*650);break;
    case 'banco':novo('<g>'+bancoLado(BANCO_V)+'</g>',44,terr(44,z0),z0,{k:1.9,esp:1});break;
    case 'portal':novo(SPR.portal(placa),0,nariz(z0),z0);break;}}

/* ==================== BIKE: estrada vista de costas (pseudo-3D, 1 un ≈ 3 cm) ==================== */
const BKB={f:283,D:120,H:67,cx:195,cy:312,SEG:40,N:150},BKE={f:283,D:112,H:64,cx:195,cy:312,SEG:40,N:150};let BK=BKB;
const VELB={1:167,3:231,5:296},RPM={1:70,3:85,5:98}; /* ≈18, 25 e 32 km/h */
let QUAL='B',DISTV=0,SV=3,sujo=true,tC=0;
let DIST=0,BGX=0,AGORA=0,OVR=[],FLG=new Map(),thHeroi=0,LTOTB=0,DESV=0,DESVa=0;
const rl=()=>PB[CESC].RL-DESV;
const PB={
  estrada:{RL:52,curva:.42,morro:.035,ceu:['#6fa9d8','#c3def0','#eef0e4'],chao:'#6f9a52',
    faixas:[[-3000,-122,'#5f8f3e','#578639'],[-122,-104,'#a39c88','#968f7c'],[-104,104,'#4b5056','#474c52'],[104,122,'#a39c88','#968f7c'],[122,3000,'#5f8f3e','#578639']],
    linhas:[[-100,3,'#f2f2ee'],[100,3,'#f2f2ee'],[-3.4,1.9,'#f2c230'],[3.4,1.9,'#f2c230']],trilho:124},
  ciclovia:{RL:22,curva:.12,morro:0,ceu:['#79b4e2','#cde4f0','#f5ecdc'],chao:'#8c8f94',
    faixas:[[-3000,-520,'#8e9196','#888b90'],[-520,-90,'#4b4f56','#474b52'],[-90,-74,'#c9ccd1','#c1c4c9'],[-74,-46,'#d9d6cf','#d0cdc6'],[-46,46,'#c0473d','#b6423a'],[46,66,'#d9d6cf','#d0cdc6'],[66,84,'#6c9a4a','#64914a'],[84,3000,'#3a83b5','#367cad']],
    linhas:[[-43,1.6,'#ffffff'],[43,1.6,'#ffffff'],[0,1.4,'#ffffff',1],[-200,2.2,'#e6e6e6',1],[-310,2.2,'#e6e6e6',1],[-420,2.2,'#e6e6e6',1]]},
  campo:{RL:24,curva:.24,morro:.022,ceu:['#8cbbe0','#f3dcc0','#ffe2a8'],chao:'#7cab4d',
    faixas:[[-3000,-84,'#7cab4d','#73a147'],[-84,-64,'#5f8f3e','#58863a'],[-64,-30,'#b98a5a','#b08354'],[-30,-18,'#a2734a','#9a6d46'],[-18,-6,'#b98a5a','#b08354'],[-6,6,'#6f9a45','#699342'],
      [6,18,'#b98a5a','#b08354'],[18,30,'#a2734a','#9a6d46'],[30,64,'#b98a5a','#b08354'],[64,84,'#5f8f3e','#58863a'],[84,3000,'#7cab4d','#73a147']],linhas:[],cerca:90}};

/* perfil da estrada: curvas e morros suaves + o que os eventos pedem (entra aos poucos lá na frente) */
function rd(i){const p=PB[CESC];let c=p.curva*Math.sin(i*.019+1.3)*Math.sin(i*.0071+.4),s=p.morro*Math.sin(i*.011+.7)*Math.sin(i*.0043+2.1)+(MAQ==='esteira'?INCa*(1+.9*Math.sin(i*.021+.5)):0);
  for(const o of OVR){if(i<o.i0||i>o.i1)continue;const u=(i-o.i0)/(o.i1-o.i0),env=Math.sin(Math.PI*u),w=Math.min(1,(AGORA-o.t0)/1.1);
    c+=(o.c||0)*w*(o.cf?o.cf(u):env);s+=(o.s||0)*w*(o.sf?o.sf(u):env);}
  return {c,s};}
function forma(o){const b=Math.floor((DIST-BK.D)/BK.SEG);o.i0=o.z0!=null?Math.floor(o.z0/BK.SEG)-10:b+60;o.i1=o.i0+o.len;o.t0=AGORA;OVR.push(o);OVR=OVR.filter(v=>v.i1>b-5);}
function marca_(i0,n,tipo){for(let i=i0;i<i0+n;i++)FLG.set(i,tipo);}

/* A estrada é uma curva contínua: posição e direção são integradas trecho a trecho e medidas a partir da câmera
   (sem "zerar" a cada trecho), os pontos de desenho ficam presos em z fixos do mundo e o primeiro ponto anda junto
   com a câmera. Assim nada pula de um quadro para o outro perto da tela. */
function camBike(){const SEG=BK.SEG,N=QUAL==='A'?BK.N:90,cz=(QUAL==='C'?DISTV:DIST)-BK.D,uc=cz/SEG,b=Math.floor(uc),fr=uc-b,NB=N+3;
  const Xb=new Float64Array(NB),Hb=new Float64Array(NB),Yb=new Float64Array(NB),Cb=new Float64Array(NB),Sb=new Float64Array(NB);
  for(let n=0;n<NB;n++){const r=rd(b+n);Cb[n]=r.c;Sb[n]=r.s;if(n){Xb[n]=Xb[n-1]+Hb[n-1]+Cb[n-1]/2;Hb[n]=Hb[n-1]+Cb[n-1];Yb[n]=Yb[n-1]+Sb[n-1]*SEG;}}
  const Xc=Cb[0]*fr*fr/2,Hc=Cb[0]*fr,Yc=Sb[0]*SEG*fr;
  /* além do último trecho desenhado o chão fica plano: antes a inclinação era esticada até o destino (lá longe) e ele
     aparecia flutuando acima do horizonte, principalmente na esteira com inclinação e nas estradas com morro */
  const ev=u=>{let n=Math.floor(u)-b;if(n<0)n=0;if(n>NB-2){const m=NB-2,t=u-(b+m);return [Xb[m]+Hb[m]*t-Xc-Hc*(u-uc),Yb[m]+Sb[m]*SEG*Math.min(t,1)-Yc];}
    const t=u-(b+n);return [Xb[n]+Hb[n]*t+Cb[n]*t*t/2-Xc-Hc*(u-uc),Yb[n]+Sb[n]*SEG*t-Yc];};
  const pD=ev(uc+BK.D/SEG),sh=pD[0]/BK.D,camY=pD[1]+BK.H;
  const evz=zc=>{const q=ev(uc+zc/SEG);return [q[0]-sh*zc,q[1]];};
  const P=[];const add=(zc,k,syn)=>{const q=evz(zc);P.push({zc,x:q[0],y:q[1],k,syn});};
  add(5,b,1);
  for(let i=b+1;i<=b+N;i++){const zc=i*SEG-cz;if(zc<=6)continue;const step=zc<1600?1:zc<3600?2:4;if(i%step)continue;add(zc,i,0);}
  const c={z:cz,Y:camY,f:BK.f,D:BK.D,vel:velM(),P,
    pr:(Xr,Yr,zw)=>{const zc=Math.max(1,zw-cz),q=evz(zc);return [BK.cx+BK.f*(q[0]+Xr-rl())/zc,BK.cy-BK.f*(q[1]+Yr-camY)/zc];},
    oculto:(zw,sy)=>{const zc=zw-cz;for(let j=1;j<P.length;j++)if(P[j].zc>=zc){const m=P[j-1].maxy;return m!=null&&sy>m+4;}return false;}};
  return c;}

/* ---------- ciclista visto de costas (local: origem no ponto onde a roda toca o chão) ---------- */
const CORH={camisa:H.camisa,manga:MANGA,short:H.short,tenis:H.tenis,capacete:'#f2f4f7',quadro:'#00c9cc',luva:'#2b3036'};
function montaCiclista(pai,cor){const g=el('g',{},pai),P={};
  const L=[['bar','#2b3036',1.4,1],['mgE',cor.manga,3.3,1],['mgD',cor.manga,3.3,1],['maE',cor.luva,0,0],['maD',cor.luva,0,0],
    ['pnE',H.pele,4.2,1],['pnD',H.pele,4.2,1],['coE',cor.short,5.6,1],['coD',cor.short,5.6,1],['soE','#1b2026',3.7,1],['soD','#1b2026',3.7,1],['teE',cor.tenis,3.7,1],['teD',cor.tenis,3.7,1],
    ['sel','#16191d',0,0],['sho',cor.short,0,0],['tor',cor.camisa,0,0],['pes',H.pele,3,1],['cab',H.pele,0,0],['cap',cor.capacete,0,0],['vt','#2b3036',.8,1],
    ['qd',cor.quadro,1.6,1],['rd','#1c2126',2.9,1],['ar','#8b9096',.7,1],['lz','#ff3b30',0,0]];
  for(const [k,c,w,s] of L)P[k]=s?el('path',{fill:'none',stroke:c,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'},g):el('path',{fill:c},g);
  const fixo={bar:'M-9.4 -39.8H9.4',mgE:'M-7.1 -45.2L-9.9 -42.2L-9 -40.2',mgD:'M7.1 -45.2L9.9 -42.2L9 -40.2',maE:circ(-9,-39.8,1.5),maD:circ(9,-39.8,1.5),
    sel:'M-3.4 -32.6Q-3.4 -34 0 -34Q3.4 -34 3.4 -32.6Q0 -31.4 -3.4 -32.6Z',sho:'M-5.6 -37L5.6 -37L6.3 -32.2L1.4 -30.4L-1.4 -30.4L-6.3 -32.2Z',
    tor:'M-5.2 -36.4L-7.6 -44.6Q-7.7 -47.6 -4.8 -47.8L4.8 -47.8Q7.7 -47.6 7.6 -44.6L5.2 -36.4Z',pes:'M0 -47.6V-49.6',cab:circ(0,-52.4,4.2),
    cap:'M-5.5 -51.6Q-5.8 -58.8 0 -59Q5.8 -58.8 5.5 -51.6Q0 -50.4 -5.5 -51.6Z',vt:'M-2.6 -57.8V-52.4M0 -58.4V-51.8M2.6 -57.8V-52.4',
    qd:'M-1.3 -11.5L-.8 -30.4M1.3 -11.5L.8 -30.4',rd:'M0 -1.4V-21.8',ar:'M0 -3V-20.2M-.9 -11.5H.9',lz:'M-1 -28.4h2v1.9h-2Z'};
  for(const k in fixo)P[k].setAttribute('d',fixo[k]);
  return {g,set(th){for(const j of [0,1]){const a=th+j*Math.PI,pz=6+5.7*Math.sin(a),py=9+5.7*Math.cos(a),az=pz-1.4,ay=py+2.5,k=ikE(0,-34,az,-ay,1),
      sg=j?1:-1,hx=sg*3.6,kx=sg*4.8,ax=sg*5.3,n=j?'D':'E';
    P['pn'+n].setAttribute('d','M'+hx+' -34L'+kx+' '+f(k.ky)+'L'+ax+' '+f(-ay));
    P['co'+n].setAttribute('d','M'+hx+' -34L'+f(hx+(kx-hx)*.46)+' '+f(-34+(k.ky+34)*.46));
    P['te'+n].setAttribute('d','M'+ax+' '+f(-ay+.4)+'L'+ax+' '+f(-ay+2.2));P['so'+n].setAttribute('d','M'+ax+' '+f(-ay+2.3)+'L'+ax+' '+f(-ay+3));}}};}
const CORES_OUTROS=[{camisa:'#ff6b5c',manga:'#e85a4c',capacete:'#1d2228',quadro:'#f2f4f7'},{camisa:'#4b9bff',manga:'#3d87e6',capacete:'#ffffff',quadro:'#ff9f1a'},
  {camisa:'#ffffff',manga:'#e6e8eb',capacete:'#ff3b30',quadro:'#1d2228'},{camisa:'#ff9f1a',manga:'#e88c10',capacete:'#ffffff',quadro:'#4b9bff'},{camisa:'#b36bff',manga:'#9d57e6',capacete:'#1d2228',quadro:'#c8ccd2'},{camisa:'#2ec27e',manga:'#26a86c',capacete:'#ffffff',quadro:'#2b3036'}];
const corOutro=i=>Object.assign({short:'#1f2328',tenis:'#f2f4f7',luva:'#2b3036'},CORES_OUTROS[i%CORES_OUTROS.length]);

/* ---------- cenário da bike ---------- */
function fundoBike(){const c=CESC;let s='';const FX=FUNDOE[c]||FUNDOL[c];if(FX)return FX()+'<rect y="304" width="390" height="40" fill="'+PB[c].chao+'"/>';
  const rep=d=>'<path d="'+d+'"/><path transform="translate(390 0)" d="'+d+'"/>';
  if(c==='estrada'){
    s+='<g id="para"><g fill="#9db3c6">'+rep('M0 312V262L30 244L62 258L98 226L132 250L170 232L206 254L242 222L280 248L318 230L352 252L390 262V312Z')+'</g>'
      +'<g fill="#7d9a7a">'+rep('M0 312V284L40 270L80 280L120 262L160 278L205 266L250 282L292 268L340 280L390 284V312Z')+'</g>'
      +'<g fill="#ffffff" opacity=".35">'+rep('M0 300Q100 290 195 298T390 296V312H0Z')+'</g></g>';}
  else if(c==='ciclovia'){
    let p='';for(let x=0;x<390;x+=13){const h=18+hsh(x)*70+(hsh(x+7)>.85?40:0);p+='M'+x+' 312V'+f(312-h)+'h'+f(9+hsh(x+3)*5)+'V312Z';}
    s+='<g id="para"><g fill="#a8b4c4">'+rep(p)+'</g><g fill="#8e9bad">'+rep('M0 312V296h20v-6h18v6h26v-10h14v10h30v-8h22v8h40v-12h16v12h30v-6h24v6h30v-9h20v9h40v-5h16v5h44V312Z')+'</g></g>';}
  else{
    s+='<g id="para"><g fill="#9fbf7a">'+rep('M0 312V286Q50 268 100 280T200 274T300 282T390 286V312Z')+'</g><g fill="#86a865">'+rep('M0 312V296Q60 286 120 294T240 290T390 296V312Z')+'</g>'
      +'<g fill="#5d7d45">'+rep('M58 292v-8M58 284a6 6 0 1 1 .1 0M210 290v-9M210 281a7 7 0 1 1 .1 0M330 293v-7M330 286a5 5 0 1 1 .1 0')+'</g></g>';}
  return s+'<rect y="304" width="390" height="40" fill="'+PB[c].chao+'"/>';}
function montaBike(){const cen=PB[CESC];
  let s='<defs><linearGradient id="cg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="330"><stop offset="0" stop-color="'+cen.ceu[0]+'"/><stop offset=".7" stop-color="'+cen.ceu[1]+'"/><stop offset="1" stop-color="'+cen.ceu[2]+'"/></linearGradient>'
    +'<radialGradient id="luz"><stop offset="0" stop-color="#ffd98a" stop-opacity=".42"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>'
    +'<radialGradient id="luzv"><stop offset="0" stop-color="#ff4a3d" stop-opacity=".7"/><stop offset="1" stop-color="#ff4a3d" stop-opacity="0"/></radialGradient>'
    +'<linearGradient id="nb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".45" stop-color="#f4f6f8" stop-opacity=".72"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>'
    +'<radialGradient id="sl"><stop offset="0" stop-color="#fff2c0" stop-opacity=".75"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>'
    +'<radialGradient id="lu"><stop offset="0" stop-color="#f6f1dc" stop-opacity=".35"/><stop offset="1" stop-color="#f6f1dc" stop-opacity="0"/></radialGradient></defs>'
    +'<rect width="390" height="844" fill="url(#cg)"/>'+fundoBike();
  svg.innerHTML=s;L={horiz:null};O={};O.para=svg.querySelector('#para');
  L.dest=el('g',{},svg);const gr=el('g',{},svg);
  /* uma camada contínua por faixa do chão (sem emendas) + a faixa escura alternada por cima */
  O.fx=cen.faixas.map(st=>({a:el('path',{fill:st[2]},gr),b:el('path',{fill:st[3]||st[2]},gr)}));O.grFlg=el('g',{},gr);
  O.casc=el('path',{fill:'#99938a'},gr);O.ln=cen.linhas.map(L_=>el('path',{fill:L_[2]},gr));O.zeb=el('path',{fill:'#ffffff'},gr);
  O.post=el('path',{fill:'none',stroke:cen.cerca?'#7a5a3a':'#8a8f96','stroke-width':1.6},svg);
  O.rail=el('path',{fill:'none',stroke:cen.cerca?'#9c7a54':'#c3c8cf','stroke-width':cen.cerca?1:2.4,'stroke-linejoin':'round'},svg);
  montaExtrasEst();L.objF=el('g',{},svg);
  const hg=el('g',{},svg);O.heroi=MAQ==='esteira'?montaCorredor(hg,CORC,BKE.D):MAQ==='eliptico'?(CESC==='dunas'?montaCorredor(hg,CORC,BKE.D,{bastao:1,bone:1}):montaEsquiador(hg,CORE,BKE.D)):montaCiclista(hg,CORH);O.heroiG=hg;L.objN=el('g',{},svg);L.horiz=el('g',{},svg);}
function quadroBike(c,dt){const P=c.P,cen=PB[CESC],fz=BK.f,Rl=rl();
  for(const q of P){q.s=fz/q.zc;q.sx=BK.cx+fz*(q.x-Rl)/q.zc;q.sy=BK.cy-fz*(q.y-c.Y)/q.zc;}
  /* trechos visíveis: o alto de um morro esconde o que vem logo atrás dele (corte exato na linha do morro) */
  const runs=[];let run=null,maxy=1e9;
  for(let j=0;j<P.length-1;j++){const A=P[j],B=P[j+1];A.maxy=maxy;
    if(B.sy>=maxy){run=null;continue;}
    let near={y:A.sy,x:A.sx,s:A.s,k:A.k,syn:A.syn,zc:A.zc};
    if(A.sy>maxy){const t=(maxy-B.sy)/(A.sy-B.sy);near={y:maxy,x:B.sx+(A.sx-B.sx)*t,s:B.s+(A.s-B.s)*t,k:A.k,syn:1,zc:A.zc};run=null;}
    if(!run){run=[near];runs.push(run);}
    run.push({y:B.sy,x:B.sx,s:B.s,k:B.k,syn:B.syn,zc:B.zc});maxy=B.sy;}
  P[P.length-1].maxy=maxy;
  /* linhas onduladas (calçadão): subdivide cada trecho com a perspectiva certa (1/z linear na tela) para a onda sair redonda */
  const densa=sc=>{const out=[sc[0]];for(let m=1;m<sc.length;m++){const A=sc[m-1],B=sc[m];if(B.zc-A.zc>30&&A.zc<1700)for(let t=1;t<4;t++){const zc=A.zc+(B.zc-A.zc)*t/4,u=(1/zc-1/A.zc)/(1/B.zc-1/A.zc);
      out.push({x:A.x+(B.x-A.x)*u,y:A.y+(B.y-A.y)*u,s:fz/zc,zc,k:A.k});}out.push(B);}return out;};
  const poly=(sc,X0,X1,o)=>{if(o)sc=densa(sc);const dx=q=>o?o(q):0;let d='M'+f(sc[0].x+(X0+dx(sc[0]))*sc[0].s)+' '+f(sc[0].y);for(let m=1;m<sc.length;m++)d+='L'+f(sc[m].x+(X0+dx(sc[m]))*sc[m].s)+' '+f(sc[m].y);
    for(let m=sc.length-1;m>=0;m--)d+='L'+f(sc[m].x+(X1+dx(sc[m]))*sc[m].s)+' '+f(sc[m].y);return d+'Z';};
  const spans=(r,ok)=>{const out=[];let cur=null;for(let m=0;m<r.length-1;m++){if(ok(r[m])){if(!cur){cur=[r[m]];out.push(cur);}cur.push(r[m+1]);}else cur=null;}return out;};
  const escura=q=>(Math.floor(q.k/2)&1)===1;
  cen.faixas.forEach((st,i)=>{let A='',Bd='';for(const r of runs){A+=poly(r,st[0],st[1]);if(st[3]&&st[3]!==st[2])for(const sp of spans(r,escura))Bd+=poly(sp,st[0],st[1]);}
    O.fx[i].a.setAttribute('d',A);O.fx[i].b.setAttribute('d',Bd);});
  const FT=cen.flg||{},tapa=q=>{const t=FLG.get(q.k);return !!(t&&FT[t]&&FT[t].tapa);};
  if(O.flg)for(const F of O.flg){let d='';for(const r of runs)for(const sp of spans(r,q=>FLG.get(q.k)===F.t&&(!F.par||escura(q))))d+=poly(sp,F.X0,F.X1);F.el.setAttribute('d',d);}
  const cw=cen.cascW||60;let cs='',zb='';for(const r of runs){for(const sp of spans(r,q=>FLG.get(q.k)==='cascalho'))cs+=poly(sp,-cw,cw);
    for(const sp of spans(r,q=>FLG.get(q.k)==='faixa'))for(let xx=-40;xx<40;xx+=13)zb+=poly(sp,xx,xx+7);}
  O.casc.setAttribute('d',cs);O.zeb.setAttribute('d',zb);
  cen.linhas.forEach((L_,i)=>{let d='';const w=L_[1]/2,on=L_[4]?q=>L_[4]*Math.sin(TAU*(c.z+q.zc)/L_[5])*Math.max(0,Math.min(1,(1700-q.zc)/500)):null;
    for(const r of runs)for(const sp of spans(r,q=>!(L_[3]&&escura(q))&&!tapa(q)))d+=poly(sp,L_[0]-w,L_[0]+w,on);O.ln[i].setAttribute('d',d);});
  /* guard-rail (serra) e cerca (campo): postes presos em pontos fixos do mundo, corrimão contínuo */
  let po='',ra='';const xr=cen.trilho||cen.cerca;
  if(xr){const hp=cen.cerca?26:20,hr=cen.cerca?22:17;
    for(const r of runs){const lim=r.filter(q=>q.zc<3400);if(lim.length<2)continue;
      for(const sd of cen.cerca?[-1,1]:[1]){for(const q of lim)if(!q.syn&&q.k%2===0)po+='M'+f(q.x+sd*xr*q.s)+' '+f(q.y)+'V'+f(q.y-hp*q.s);
        ra+='M'+lim.map(q=>f(q.x+sd*xr*q.s)+' '+f(q.y-hr*q.s)).join('L');if(cen.cerca)ra+='M'+lim.map(q=>f(q.x+sd*xr*q.s)+' '+f(q.y-(hr-9)*q.s)).join('L');}}}
  O.post.setAttribute('d',po);O.rail.setAttribute('d',ra);
  if(O.fpost){let fp='',fr='';for(const t in FT){const xr2=FT[t].rail;if(!xr2)continue;for(const r of runs)for(const sp of spans(r,q=>FLG.get(q.k)===t))for(const sd of [-1,1]){
      for(const q of sp)if(!q.syn)fp+='M'+f(q.x+sd*xr2*q.s)+' '+f(q.y)+'V'+f(q.y-16*q.s);fr+='M'+sp.map(q=>f(q.x+sd*xr2*q.s)+' '+f(q.y-15*q.s)).join('L');}}
    O.fpost.setAttribute('d',fp);O.frail.setAttribute('d',fr);}
  O.para.setAttribute('transform','translate('+f(((BGX%390)+390)%390-390)+' 0)');
  const sw=MAQ==='esteira'||MAQ==='eliptico'?0:(Z===5?2.2:Z===3?1.1:.7)*Math.sin(thHeroi);
  O.heroi.set(thHeroi,MAQ==='esteira'?gaitHeroi():MAQ==='eliptico'?GAIT.nordico:null);O.heroiG.setAttribute('transform','translate('+BK.cx+' '+f(BK.cy+fz*BK.H/BK.D)+') scale('+(fz/BK.D).toFixed(3)+') rotate('+f(sw)+')');}

/* ---------- elementos da bike ---------- */
const SPRB={
  /* araucária real: tronco reto e alto; andares de galhos que saem quase na horizontal e sobem nas pontas,
     cada ponta com um tufo redondo e denso; os de baixo são mais longos; céu aparece entre os tufos */
  araucaria:(sd=0)=>{const R=v=>hsh(sd*7.13+v),H=250*(1+(R(1)-.5)*.3),tr='#5a4230';
    let br='',t0='',t1='',t2='';const tufo=(x,y,r)=>{t0+=elp(x,y,r*1.08,r*.92);t1+=elp(x-r*.15,y-r*.18,r*.82,r*.7);t2+=elp(x-r*.32,y-r*.38,r*.36,r*.3);};
    const nA=4+Math.floor(R(2)*2),base=H*(.5+R(3)*.08);
    for(let a=0;a<nA;a++){const u=a/(nA-1),y=-base-(H-base)*u,L=(1-u*.72)*H*(.34+R(4+a)*.06);
      for(const sg of [-1,1]){const n=a%2?1:2;for(let b=0;b<n;b++){const l=L*(b?.6:1)*(1+(R(10+a*4+b+(sg>0?2:0))-.5)*.3),xe=sg*l,ye=y-l*(.18+.14*u)-(b?6:0);
        br+='M0 '+f(y)+'Q'+f(sg*l*.55)+' '+f(y-l*.02)+' '+f(xe)+' '+f(ye);
        tufo(xe,ye-6,13+R(20+a+b)*5+(1-u)*3);if(!b&&l>40&&QUAL==='A')tufo(xe*.62,ye+l*.06-4,10+R(30+a)*3);}}}
    tufo(0,-H-4,14);tufo(-9,-H+8,11);tufo(9,-H+6,11);
    const nos='M0 '+f(-H*.3)+'l-8 -4M0 '+f(-H*.4)+'l7 -4';
    return '<path d="M-5.5 0L-2.6 '+f(-H)+'H2.6L5.5 0Z" fill="'+tr+'"/><path d="'+nos+'" stroke="'+tr+'" stroke-width="2"/><path d="'+br+'" stroke="'+tr+'" stroke-width="3" fill="none" stroke-linecap="round"/>'
      +'<path d="'+t0+'" fill="#1f4322"/><path d="'+t1+'" fill="#2f5e2d"/>'+(QUAL==='A'?'<path d="'+t2+'" fill="#4a7d3c"/>':'');},
  arvore:(cor,sd=0)=>copa(cor||'#4e8a3e',1+(hsh(sd*3.1+7)-.5)*.26,[[0,-128,60],[-40,-110,40],[40,-112,42],[-26,-152,40],[26,-154,40],[0,-172,34],[-54,-132,30],[54,-134,30]],90,'#6b4a2b',sd),
  ipe:(sd=0)=>copa('#944394',1+(hsh(sd*2.9+5)-.5)*.24,[[0,-150,54],[-40,-128,36],[40,-132,38],[-24,-176,34],[26,-178,34],[0,-194,26],[-56,-150,26],[56,-152,26]],100,'#5e4430',sd),
  poste:(sd)=>'<rect x="-2" y="-240" width="4" height="240" fill="#5d636b"/><path d="M0 -236h'+(sd*-40)+'" stroke="#5d636b" stroke-width="4"/><rect x="'+(sd>0?-46:34)+'" y="-240" width="12" height="5" rx="2" fill="#fff4c4"/>',
  predio:(h,cor)=>{let a='',d='';for(let y=-h+20;y<-20;y+=34)for(let x=-70;x<70;x+=30){const r='M'+x+' '+y+'h16v20h-16Z';if(hsh(x*3+y)<.3)a+=r;else d+=r;}return '<rect x="-84" y="'+(-h)+'" width="168" height="'+h+'" fill="'+cor+'"/><path d="'+d+'" fill="#9fb0c4"/><path d="'+a+'" fill="#ffe2a6"/>';},
  placa:(t,cor)=>'<rect x="-2.5" y="-110" width="5" height="110" fill="#8a8f96"/><rect x="-48" y="-150" width="96" height="44" rx="5" fill="'+MOSTARDA+'" stroke="'+PRETO+'" stroke-width="2.4"/>'+TXT(0,-121,t,17,PRETO,800,84,34),
  placaEv:(t)=>'<rect x="-2.5" y="-110" width="5" height="110" fill="#8a8f96"/><rect x="-56" y="-156" width="112" height="50" rx="5" fill="'+MOSTARDA+'" stroke="'+PRETO+'" stroke-width="2"/>'+TXT(0,-124,t,18,PRETO,800,98,40),
  aviso:(ic)=>'<rect x="-2.5" y="-100" width="5" height="100" fill="#8a8f96"/><path d="M0 -158L32 -126L0 -94L-32 -126Z" fill="'+MOSTARDA+'" stroke="'+PRETO+'" stroke-width="3"/>'
    +({curva:'<path d="M-6 -106V-124Q-6 -138 8 -138" stroke="#10161a" stroke-width="5" fill="none"/><path d="M6 -146l10 8-10 8Z" fill="#10161a"/>',
       serp:'<path d="M-2 -104Q-14 -114 -2 -124Q10 -134 -2 -144" stroke="#10161a" stroke-width="5" fill="none"/><path d="M-10 -146l8 -8 4 11Z" fill="#10161a"/>',
       boi:'<path d="M-16 -122h26l4 -6h6l-2 8-4 2v10h-4v-8h-18v8h-4Z" fill="#10161a"/>'}[ic]||TXT(0,-120,ic,15,PRETO,800,36,20)),
  km:(t)=>'<rect x="-9" y="-46" width="18" height="46" rx="3" fill="'+MOSTARDA+'" stroke="'+PRETO+'" stroke-width="2"/>'+TXT(0,-32,'KM',7,PRETO,800,13)+TXT(0,-18,t,10,PRETO,800,13,14),
  tucano:()=>SPRB.arvore('#4e8a3e',9)+'<path d="M0 -86Q-22 -94 -50 -92" stroke="#6b4a2b" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M-42 -93l-5 -9" stroke="#6b4a2b" stroke-width="2.4"/>'
    +'<g transform="translate(-30 -93) scale(2.3)"><path d="M1 0l-1 3M3 0l1 3" stroke="#2b2b2b" stroke-width="1"/><ellipse cx="2" cy="-8" rx="4.6" ry="7.6" fill="#141618"/><path d="M5 -3l4 5-2 1Z" fill="#141618"/><path d="M4.6 -2.6l3.4 3.6" stroke="#d4433a" stroke-width="1.4"/>'
    +'<ellipse cx="-.6" cy="-12.6" rx="3.4" ry="3.6" fill="#ffffff"/><ellipse cx="-.4" cy="-10" rx="2.4" ry="1.6" fill="#ffd23f"/><circle cx=".6" cy="-16.4" r="3.8" fill="#141618"/>'
    +'<path d="M-2.4 -18Q-15 -20 -18 -14.6Q-11 -13.2 -2.4 -14.6Z" fill="#ff9f1a"/><path d="M-2.4 -14.6Q-10 -13.4 -18 -14.6L-17.4 -13Q-10 -11.6 -2.4 -13.2Z" fill="#e8501a"/><path d="M-18 -14.6l-1.4 .4 .6 1.2Z" fill="#141618"/>'
    +'<circle cx="-1" cy="-17" r="1.5" fill="#3aa6e8"/><circle cx="-1" cy="-17" r=".6" fill="#141618"/></g>',
  posto:()=>'<rect x="-150" y="-140" width="300" height="20" fill="#e8eaee"/><rect x="-150" y="-124" width="300" height="5" fill="#d4433a"/><rect x="-120" y="-120" width="10" height="120" fill="#c8ccd2"/><rect x="110" y="-120" width="10" height="120" fill="#c8ccd2"/>'
    +'<rect x="-50" y="-58" width="20" height="58" rx="3" fill="#d4433a"/><rect x="30" y="-58" width="20" height="58" rx="3" fill="#d4433a"/><rect x="-48" y="-52" width="16" height="12" fill="#e8f0f7"/><rect x="32" y="-52" width="16" height="12" fill="#e8f0f7"/>'+TXT(0,-126,'POSTO',14,'#10161a',800,90),
  mirante:()=>'<rect x="-90" y="-36" width="180" height="8" fill="#8a6239"/><path d="M-90 -28V0M-30 -28V0M30 -28V0M90 -28V0M-90 -64V-36M-45 -64V-36M0 -64V-36M45 -64V-36M90 -64V-36M-92 -64H92M-92 -50H92" stroke="#6b4a2b" stroke-width="4"/>'
    +'<path d="M50 -36V-72" stroke="#3d3a33" stroke-width="3"/><rect x="42" y="-84" width="18" height="12" rx="3" fill="#3d3a33"/>',
  portal:(t)=>'<rect x="-150" y="-180" width="22" height="180" fill="#8f877a"/><rect x="128" y="-180" width="22" height="180" fill="#8f877a"/><rect x="-162" y="-216" width="324" height="40" rx="4" fill="#6b4a2b"/><rect x="-150" y="-208" width="300" height="24" rx="3" fill="'+MOSTARDA+'"/>'+TXT(0,-190,t,18,PRETO,800,286,19),
  torre:()=>'<path d="M-30 0L-4 -420H4L30 0Z" fill="none" stroke="#d4433a" stroke-width="5"/><path d="M-26 -60H26M-22 -130H22M-18 -200H18M-14 -270H14M-10 -340H10M-26 -60L22 -130M-22 -130L18 -200M-18 -200L14 -270M-14 -270L10 -340" stroke="#e8eaee" stroke-width="3"/><circle cx="0" cy="-426" r="6" fill="#ff4a3d"/>',
  cafe:(t)=>'<rect x="-80" y="-80" width="160" height="80" fill="#8a6239"/><path d="M-96 -78L0 -130L96 -78Z" fill="#5a3e22"/><rect x="-20" y="-56" width="40" height="56" fill="#ffd27a"/><rect x="-62" y="-60" width="28" height="22" fill="#ffd27a"/><rect x="34" y="-60" width="28" height="22" fill="#ffd27a"/>'+TXT(0,-92,t||'CAFÉ',15,'#ffffff',800,110),
  carro:(cor)=>'<rect x="-31" y="-34" width="62" height="28" rx="6" fill="'+cor+'"/><path d="M-24 -34L-18 -50H18L24 -34Z" fill="'+cor+'"/><path d="M-19 -36L-15 -47H15L19 -36Z" fill="#2b3a4a"/><rect x="-28" y="-26" width="12" height="5" rx="2" fill="#ff3b30"/><rect x="16" y="-26" width="12" height="5" rx="2" fill="#ff3b30"/><rect x="-10" y="-16" width="20" height="6" fill="#e8eaee"/><rect x="-30" y="-8" width="10" height="8" fill="#16191d"/><rect x="20" y="-8" width="10" height="8" fill="#16191d"/>',
  banca:()=>'<rect x="-60" y="-90" width="120" height="90" fill="#2e7d4f"/><rect x="-66" y="-100" width="132" height="14" fill="#24653f"/><rect x="-50" y="-76" width="100" height="50" fill="#f4efe3"/><g fill="#d4433a"><rect x="-46" y="-72" width="14" height="20"/><rect x="-6" y="-72" width="14" height="20"/></g><g fill="#4b9bff"><rect x="-26" y="-72" width="14" height="20"/><rect x="14" y="-72" width="14" height="20"/></g><rect x="32" y="-72" width="14" height="20" fill="#ffc72c"/>'+TXT(0,-89,'BANCA',10,'#ffffff',800,60),
  semaforo:(cor)=>'<rect x="-3" y="-200" width="6" height="200" fill="#3d4148"/><rect x="-14" y="-248" width="28" height="60" rx="5" fill="#1d2025"/><circle cx="0" cy="-236" r="8" fill="'+(cor==='vermelho'?'#ff3b30':'#4a2422')+'"/><circle cx="0" cy="-218" r="8" fill="#4a3d1a"/><circle cx="0" cy="-200" r="8" fill="'+(cor==='verde'?'#2ee86b':'#1b3a26')+'"/>'
    +(cor==='verde'?'<circle cx="0" cy="-200" r="22" fill="#2ee86b" opacity=".22"/>':'<circle cx="0" cy="-236" r="22" fill="#ff3b30" opacity=".22"/>'),
  ponte:()=>{let c='';for(let i=0;i<9;i++){c+='M0 -940L'+(-90-i*70)+' -150M0 -940L'+(90+i*70)+' -150';}return '<path d="'+c+'" stroke="#e8eaee" stroke-width="2.4" fill="none"/><path d="M-60 0L-10 -980H10L60 0L30 0L0 -560L-30 0Z" fill="#dfe3e8"/><rect x="-800" y="-170" width="1600" height="26" fill="#9aa3ad"/><rect x="-800" y="-150" width="1600" height="8" fill="#7b838d"/>';},
  baixoPonte:()=>'<rect x="-1400" y="-220" width="2800" height="34" fill="#8e969f"/><rect x="-1400" y="-190" width="2800" height="6" fill="#6f7780"/><rect x="-110" y="-190" width="26" height="190" fill="#9aa3ad"/><rect x="84" y="-190" width="26" height="190" fill="#9aa3ad"/>',
  praca:()=>SPRB.arvore('#4e8a3e',seq)+'<g transform="translate(60 0)"><path d="M-14 -6V0M14 -6V0" stroke="#5a3e22" stroke-width="2.4"/><rect x="-18" y="-10" width="36" height="4" fill="#8a6239"/><rect x="-18" y="-20" width="36" height="4" fill="#8a6239"/></g>',
  sorvete:()=>'<rect x="-50" y="-70" width="100" height="70" rx="6" fill="#ff8fb8"/><rect x="-56" y="-82" width="112" height="16" rx="5" fill="#ffffff"/><rect x="-34" y="-58" width="68" height="28" fill="#fff4f8"/><path d="M0 -120L-10 -96H10Z" fill="#e0a45a"/><circle cx="0" cy="-124" r="10" fill="#ffd1e3"/>'+TXT(0,-71,'SORVETE',10,'#c2185b',800,100),
  bicicletario:()=>'<path d="M-60 0V-30Q-60 -38 -52 -38H-40Q-32 -38 -32 -30V0M-10 0V-30Q-10 -38 -2 -38H10Q18 -38 18 -30V0M40 0V-30Q40 -38 48 -38H60Q68 -38 68 -30V0" stroke="#5d636b" stroke-width="3" fill="none"/><circle cx="-46" cy="-14" r="13" fill="none" stroke="#2b3036" stroke-width="3"/><circle cx="4" cy="-14" r="13" fill="none" stroke="#2b3036" stroke-width="3"/>',
  vaca:(cor)=>'<ellipse cx="0" cy="-34" rx="34" ry="16" fill="'+(cor||'#f4f1ea')+'"/><path d="M-24 -22v22M-12 -22v22M14 -22v22M26 -22v22" stroke="'+(cor?'#5a3e2a':'#d8d2c6')+'" stroke-width="6" stroke-linecap="round"/>'
    +(cor?'':'<path d="M-14 -46q8 6 4 16q-10 2 -12 -8ZM10 -44q10 2 8 12q-8 4 -12 -4Z" fill="#2b2b2b"/>')+'<path d="M30 -42l14 -6q8 4 6 14l-10 6q-8 -2 -10 -14Z" fill="'+(cor||'#f4f1ea')+'"/><path d="M42 -50l4 -6M48 -48l6 -4" stroke="#d8cfbe" stroke-width="2.4"/><ellipse cx="50" cy="-30" rx="5" ry="4" fill="#e8a8a0"/><path d="M-34 -36q-8 6 -6 18" stroke="'+(cor||'#e6e0d4')+'" stroke-width="3" fill="none"/>',
  girassois:()=>{let s='';for(let i=0;i<12;i++){const x=-110+i*20+(i%2)*4,h=40+(i%3)*8;s+='<path d="M'+x+' 0V'+(-h)+'" stroke="#3f7a2a" stroke-width="3"/><path d="M'+(x-1)+' '+(-h*.5)+'l-9 -5" stroke="#4e8a3e" stroke-width="5" stroke-linecap="round"/><circle cx="'+x+'" cy="'+(-h)+'" r="11" fill="#ffc72c"/><circle cx="'+x+'" cy="'+(-h)+'" r="5" fill="#6b4a2b"/>';}return s;},
  moinho:()=>'<path d="M-36 0L-8 -320H8L36 0" fill="none" stroke="#9aa3ad" stroke-width="5"/><path d="M-30 -60H30M-24 -130H24M-18 -200H18M-12 -270H12M-30 -60L24 -130M-24 -130L18 -200M-18 -200L12 -270" stroke="#b9c0c8" stroke-width="3"/>'
    +'<g transform="translate(0 -330)"><g class="pas">'+(()=>{let s='';for(let i=0;i<16;i++){const a=i*Math.PI/8;s+='<path d="M0 0L'+f(Math.cos(a)*62)+' '+f(Math.sin(a)*62)+'" stroke="#e8eaee" stroke-width="7"/>';}return s;})()+'<circle r="62" fill="none" stroke="#c8ccd2" stroke-width="2"/></g><circle r="8" fill="#5d636b"/></g>',
  porteira:(t)=>'<rect x="-104" y="-80" width="12" height="80" fill="#6b4a2b"/><rect x="92" y="-80" width="12" height="80" fill="#6b4a2b"/><path d="M92 -10L150 -40M92 -30L150 -60M92 -50L150 -80M92 -70L150 -96M150 -100V-30" stroke="#8a6239" stroke-width="5"/>'
    +'<rect x="-110" y="-110" width="220" height="16" fill="#5a3e22"/>'+(t?'<rect x="-50" y="-140" width="100" height="26" rx="3" fill="'+MOSTARDA+'"/>'+TXT(0,-122,t,13,PRETO,800,92,22):''),
  celeiro:()=>'<rect x="-110" y="-120" width="220" height="120" fill="#b83a2e"/><path d="M-124 -116L-70 -176H70L124 -116Z" fill="#7a2620"/><rect x="-36" y="-80" width="72" height="80" fill="#f4efe3"/><path d="M-36 -80L36 0M36 -80L-36 0" stroke="#b83a2e" stroke-width="5"/><rect x="-14" y="-150" width="28" height="22" fill="#f4efe3"/>',
  cafezal:()=>{let s='';for(let i=0;i<9;i++)s+='<ellipse cx="'+(-120+i*30)+'" cy="-16" rx="16" ry="18" fill="'+(i%2?'#2f6b2c':'#3a7a33')+'"/><circle cx="'+(-124+i*30)+'" cy="-20" r="2" fill="#d4433a"/><circle cx="'+(-116+i*30)+'" cy="-12" r="2" fill="#d4433a"/>';return s;},
  sede:()=>'<rect x="-170" y="-110" width="340" height="110" fill="#f4efe3"/><path d="M-190 -104L0 -190L190 -104Z" fill="#c4553a"/><rect x="-170" y="-30" width="340" height="8" fill="#c8bfa8"/>'
    +'<rect x="-130" y="-80" width="40" height="50" fill="#5a3e22"/><rect x="-40" y="-90" width="80" height="90" fill="#7a5a3a"/><rect x="90" y="-80" width="40" height="50" fill="#5a3e22"/><path d="M-180 -40H180" stroke="#8a6239" stroke-width="4"/>'
    +'<g transform="translate(250 0)">'+'<rect x="-8" y="-150" width="16" height="150" fill="#6b4a2b"/><circle cx="0" cy="-200" r="90" fill="#4e8a3e"/><circle cx="-60" cy="-160" r="50" fill="#447c37"/><circle cx="60" cy="-166" r="56" fill="#5a9a46"/></g>',
  nuvemB:()=>'<g opacity=".9"><ellipse cx="0" cy="-8" rx="60" ry="14" fill="#ffffff"/><ellipse cx="-24" cy="-20" rx="28" ry="16" fill="#ffffff"/><ellipse cx="20" cy="-24" rx="30" ry="20" fill="#ffffff"/></g>'};
const fmtKm=n=>String(n);
const hx=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const esc=(c,k)=>{const n=parseInt(c.slice(1),16);return hx((n>>16)*(1-k),((n>>8)&255)*(1-k),(n&255)*(1-k));};
const elp=(cx,cy,rx,ry)=>'M'+f(cx-rx)+' '+f(cy)+'a'+f(rx)+' '+f(ry)+' 0 1 0 '+f(2*rx)+' 0a'+f(rx)+' '+f(ry)+' 0 1 0 '+f(-2*rx)+' 0';
/* copa cheia em 3 tons (sombra, base, luz) num caminho por tom: poucos elementos, leve para o celular */
function copa(c1,k,B,ht,tr,sd=0){const R=v=>hsh(sd*5.71+v),tons=[c1,esc(c1,.08),clara(c1,.08)],cc=tons[Math.floor(R(1)*3)],c0=esc(cc,.25),c2=clara(cc,.22);
  const kk=k*(1+(R(2)-.5)*.44),sx=1+(R(3)-.5)*.3,th=ht*(1+(R(4)-.5)*.3),dy=ht-th;let a='',b='',l='';
  const BB=B.map(([x,y,r],i)=>[x*sx+(R(10+i)-.5)*14,y+dy+(R(20+i)-.5)*12,r*(1+(R(30+i)-.5)*.3)]).filter((q,i)=>i<5||R(40+i)>.25);
  for(const [x,y,r] of BB){a+=elp(x,y,r,r);b+=elp(x-4,y-6,r*.8,r*.8);}for(const [x,y,r] of BB.slice(0,6))l+=elp(x-10,y-14,r*.42,r*.42);
  return '<g transform="scale('+f(kk)+')"><path d="M-7 0L-5 -'+f(th)+'H5L7 0Z" fill="'+tr+'"/><path d="M0 -'+f(th-18)+'l-22 -26M0 -'+f(th-10)+'l20 -24" stroke="'+tr+'" stroke-width="5"/>'
    +'<path d="'+a+'" fill="'+c0+'"/><path d="'+b+'" fill="'+cc+'"/><path d="'+l+'" fill="'+c2+'"/></g>';}
const clara=(c,k)=>{const n=parseInt(c.slice(1),16),m=v=>v+(255-v)*k;return hx(m(n>>16),m((n>>8)&255),m(n&255));};
function marcosBike(c){const SEG=BK.SEG,b=Math.floor(c.z/SEG),cen=CESC;
  for(let i=b+8;i<b+(QUAL==='A'?BK.N:90)-6;i++){const z=i*SEG;
    for(const sd of [-1,1]){const h=hsh(i*5+(sd>0?2:0)+(cen.length*31));if(i%3||(QUAL!=='A'&&hsh(i*11+(sd>0?1:0))<.5))continue;const key='a'+i+sd;if(feitos.has(key))continue;
      if(cen==='estrada'){if(h<.42){feitos.add(key);novo(SPRB.araucaria(i*2+(sd>0?1:0)),sd*(150+h*420),0,z);}else if(h<.5){feitos.add(key);novo(SPRB.arvore(null,i),sd*(160+h*300),0,z);}}
      else if(cen==='ciclovia'){if(sd>0&&i%9===0){feitos.add(key);novo(SPRB.poste(1),58,0,z);}else if(sd<0&&i%9===0){feitos.add(key);novo(SPRB.poste(-1),-62,0,z);}
        else if(sd<0&&h<.35){feitos.add(key);novo(SPRB.arvore(['#4e8a3e','#5a9a46','#447c37'][i%3],i),-Math.max(82,4+(.62+hsh(i*1.9)*.22)*117)+(hsh(i*3.3)-.5)*8,0,z,{k:.62+hsh(i*1.9)*.22});}else if(sd<0&&h>.8){feitos.add(key);novo(SPRB.predio(200+hsh(i)*500,['#9aa6b6','#b7aea2','#8e9fb0','#c9bba8'][i%4]),-640-h*200,0,z);}}
      else{if(h<.14){feitos.add(key);novo(SPRB.arvore(['#4e8a3e','#5a9a46','#447c37'][i%3],i),sd*(140+h*900),0,z);}}}}
  /* placa de km: a cada 1 km de pedal (≈ 2,4 min na zona 3) */
  const kmU=1000/.03;for(let k=Math.ceil((c.z+300)/kmU);k*kmU<c.z+BK.N*SEG-200&&k*kmU<LTOTB;k++){const key='km'+k;if(feitos.has(key))continue;feitos.add(key);novo(SPRB.km(fmtKm(k)),cen==='ciclovia'?60:cen==='estrada'?134:116,0,k*kmU,{k:1});}
  /* carros na avenida da ciclovia */
  if(cen==='ciclovia'&&Math.random()<.012)novo(SPRB.carro(['#e8eaee','#2b3036','#d4433a','#4b9bff','#9aa3ad'][Math.floor(Math.random()*5)]),[-300,-360,-420][Math.floor(Math.random()*3)],0,c.z+40,{vz:VELB[Z]*rnd(1.5,2.3),k:1.1});}
function outroCiclista(X,z,ex){const o=novo('',X,0,z,Object.assign({th:Math.random()*6},ex||{}));o.cic=montaCiclista(o.g,corOutro(seq));const u0=o.upd;
  o.upd=(oo,dt,vel)=>{oo.th+=dt*RPM[Z]/60*TAU*(oo.vz>vel?1.15:.95);oo.cic.set(oo.th);if(u0)u0(oo,dt,vel);};return o;}
function poeBike(spr,placa,ev){const c=CAMA;if(!c||!spr)return;if(QUAL==='C'&&!poeBike.c){const keep=DIST;DIST=DISTV-zSp()+210;poeBike.c=1;poeBike(spr,placa,ev);poeBike.c=0;DIST=keep;sujo=true;return;}const z0=DIST+zSp(),vel=velM(),cen=CESC,lado=()=>Math.random()<.5?-1:1,dirP=PB[cen].dirP||(cen==='ciclovia'?60:118);
  if(z0>LTM()-200&&spr!=='placa'&&!/^(sol|lua|neblina|mosquitos|por-do-sol|aurora\d|estrela|vento-gelado|vento-areia|mirante-sol)$/.test(spr))return;
  if(ev&&ev[4]==='sobe')forma({z0,s:.06,len:100});
  if(MAQ==='esteira'&&poeEst(spr,placa,z0,vel))return;
  if(MAQ==='eliptico'&&(poeEli(spr,placa,z0,vel)||poeEst(spr,placa,z0,vel)))return;
  switch(spr){
    case 'placa':novo(SPRB.placaEv(placa),dirP+10,0,z0);break;
    case 'aviso-curva':novo(SPRB.aviso('curva'),dirP,0,z0);forma({z0,c:2.6*lado(),len:70});break;
    case 'aviso-serp':novo(SPRB.aviso('serp'),dirP,0,z0);forma({z0,c:2.4,len:120,cf:u=>Math.sin(u*Math.PI*4)*Math.sin(Math.PI*u)});break;
    case 'grampo':novo(SPRB.aviso('curva'),dirP,0,z0);forma({z0,c:4.2*lado(),len:60});break;
    case 'rampa':novo(SPRB.aviso(placa||'8%'),dirP,0,z0);forma({z0,s:placa==='12%'?.12:.08,len:120});break;
    case 'subida':novo(SPRB.placaEv(placa),dirP+10,0,z0);forma({z0,s:.07,len:110});break;
    case 'descida':novo(SPRB.placaEv('DESCIDA'),dirP+10,0,z0);forma({z0,s:-.07,len:110});break;
    case 'crista':novo(SPRB.placaEv(placa),dirP+10,0,z0);forma({z0,s:.09,len:90,sf:u=>u<.7?Math.sin(u/.7*Math.PI/2):Math.cos((u-.7)/.3*Math.PI/2)});break;
    case 'vento':rajada('vento',3.6);
      for(let i=0;i<4;i++)novo(SPR.passaro(),rnd(-120,120),rnd(170,260),z0+rnd(-100,200),{k:3,plana:1,bat:rnd(10,14),vz:vel*.6,vx:rnd(-8,8)});break;
    case 'passaros':for(let i=0;i<5;i++)novo(SPR.passaro(),rnd(-160,160),rnd(170,280),z0+rnd(-100,300),{k:3,plana:1,bat:rnd(10,14),vz:vel*.6,vx:rnd(-8,8)});break;
    case 'araucarias':for(let i=0;i<8;i++){const sd=i%2?1:-1;novo(SPRB.araucaria(seq+i),sd*rnd(140,240),0,z0+i*90);}break;
    case 'tucano':novo(SPRB.tucano(),178,0,z0);break;
    case 'companhia':outroCiclista(-30,DIST-40,{vz:vel*1.2,upd:(o,dt,v)=>{if(o.zc>BK.D+70&&o.t<26)o.vz=v;else if(o.t>=26)o.vz=v*1.25;}});break;
    case 'ultrapassa':{const W=cen==='estrada'?30:44;outroCiclista(PB[cen].RL+(cen==='estrada'?34:10),DIST+900,{vz:vel*.72,upd:(o)=>{if(o.zc<BK.D+340&&o.zc>BK.D-100)DESVa=W;}});break;}
    case 'pelotao':for(let i=0;i<6;i++)outroCiclista(PB[cen].RL+[-44,-44,-4,-4,24,-24][i]*(cen==='estrada'?1.2:1),DIST+1000+[0,60,110,170,230,300][i],{vz:vel*.7,upd:(o,dt,v)=>{if(o.zc<BK.D+260&&o.t<28)o.vz=v;else if(o.t>=28)o.vz=v*1.3;}});break;
    case 'posto':novo(SPRB.posto(),dirP+190,0,z0);break;
    case 'mirante':novo(SPRB.mirante(),-210,0,z0);break;
    case 'portal':novo(SPRB.portal(placa),0,0,z0);break;
    case 'banca':novo(SPRB.banca(),-128,0,z0,{k:.9});break;
    case 'pombos':for(let i=0;i<5;i++)novo(SPR.pombo(),rnd(-30,30),0,DIST+1400+i*24,{k:2.4,esp:Math.random()<.5,upd:(o,dt,v)=>{if(!o.voa&&o.zc<BK.D+150){o.voa=1;o.bat=24;o.vy=rnd(40,70);o.vx=rnd(-60,60);o.vz=v*.9;o.vida=o.t+2.6;}}});break;
    case 'sinal-verde':case 'sinal-vermelho':novo(SPRB.semaforo(spr==='sinal-verde'?'verde':'vermelho'),56,0,z0);marca_(Math.floor(z0/BK.SEG)-2,2,'faixa');break;
    case 'viaduto':novo(SPRB.placaEv('VIADUTO ↑'),dirP+10,0,z0);forma({z0,s:.07,len:90,sf:u=>Math.sin(u*Math.PI*2)});break;
    case 'ponte':novo(SPRB.baixoPonte(),0,0,z0);novo(SPRB.ponte(),-300,0,z0+60,{k:.9});break;
    case 'praca':novo(SPRB.praca(),-170,0,z0);break;
    case 'vacas':for(let i=0;i<5;i++){const sd=lado();novo(SPRB.vaca(i%3===1?'#8a5a3a':null),sd*rnd(150,420),0,z0+i*110,{k:1.1,esp:Math.random()<.5});}break;
    case 'boiada':for(let i=0;i<6;i++){const sd=i%2?1:-1,o=novo(SPRB.vaca(i%3===1?'#8a5a3a':null),rnd(-40,40),0,DIST+2000+i*35,{k:1.1,esp:sd<0});o.upd=(oo,dt)=>{if(oo.zc<BK.D+520)oo.vx=sd*95;};}novo(SPRB.aviso('boi'),dirP,0,DIST+1500);break;
    case 'girassois':for(let i=0;i<7;i++)novo(SPRB.girassois(),(i%2?1:-1)*rnd(150,230),0,z0+i*70,{k:1});break;
    case 'moinho':novo(SPRB.moinho(),-260,0,z0,{giro:1});break;
    case 'cascalho':novo(SPRB.placaEv('CASCALHO'),dirP+10,0,z0);marca_(Math.floor(z0/BK.SEG),40,'cascalho');break;
    case 'cafezal':for(let i=0;i<6;i++)novo(SPRB.cafezal(),(i%2?1:-1)*rnd(160,240),0,z0+i*80);novo(SPRB.placaEv('CAFEZAL ↑'),dirP+10,0,z0-60);forma({z0,s:.08,len:110});break;
    case 'ipe':novo(SPRB.ipe(seq),-150,0,z0);break;
    case 'celeiro':novo(SPRB.celeiro(),280,0,z0);break;
    case 'porteira':novo(SPRB.porteira(placa),0,0,z0);break;
    case 'sorvete':novo(SPRB.sorvete(),-124,0,z0);break;
    case 'bicicletario':novo(SPRB.bicicletario(),-150,0,z0);break;
    case 'cafe':novo(SPRB.cafe(),dirP+120,0,z0);break;}}
const EVSB={
  estrada:{partida:[['Pé da serra','placa','SERRA 12 km'],['Posto de estrada','posto'],['Saída da cidade','placa','ESTRADA']],
    exploracao:[['Araucárias','araucarias'],['Outro ciclista','companhia'],['Tucano','tucano']],
    desafio:[['Curva fechada','aviso-curva'],['Rampa','rampa','8%'],['Vento contra','vento'],['Serpentina','aviso-serp'],['Ultrapassagem','ultrapassa'],['Rampa forte','rampa','12%']],
    climax:[['Alto da serra','crista','TOPO 500 m'],['Último grampo','grampo'],['Portal do topo','portal','ALTO DA SERRA']],
    alivio:[['Descida','descida'],['Mirante','mirante']],
    chegada:[['Mirante do topo','mirante'],['Café da serra','cafe'],['Vista do vale','passaros']]},
  ciclovia:{partida:[['Ciclovia','placa','CICLOVIA'],['Avenida','placa','AVENIDA'],['Margem do rio','passaros']],
    exploracao:[['Banca','banca'],['Outro ciclista','companhia'],['Pombos','pombos']],
    desafio:[['Sinal verde','sinal-verde'],['Viaduto','viaduto'],['Ultrapassagem','ultrapassa'],['Rampa da ponte','subida','PONTE ↑'],['Pelotão','pelotao'],['Vento do rio','vento']],
    climax:[['Ponte estaiada','ponte'],['Sprint final','placa','FALTAM 300 m'],['Subida do parque','subida','PARQUE ↑']],
    alivio:[['Sinal vermelho','sinal-vermelho'],['Praça','praca']],
    chegada:[['Parque da orla','praca'],['Bicicletário','bicicletario'],['Sorveteria','sorvete']]},
  campo:{partida:[['Porteira','porteira','FAZENDA'],['Estrada de chão','placa','FAZENDA 8 km'],['Amanhecer no pasto','passaros']],
    exploracao:[['Vacas no pasto','vacas'],['Girassóis','girassois'],['Moinho','moinho']],
    desafio:[['Morro da fazenda','subida','MORRO ↑'],['Estrada de terra','placa','TERRA'],['Contra o vento','vento'],['Cascalho','cascalho'],['Subida do cafezal','cafezal'],['Boiada na estrada','boiada']],
    climax:[['Alto do morro','crista','TOPO 100 m'],['Torre do moinho','moinho'],['Mirante do vale','placa','MIRANTE ↑']],
    alivio:[['Ipê florido','ipe'],['Celeiro','celeiro']],
    chegada:[['Porteira de casa','porteira','CASA'],['Sede da fazenda','celeiro'],['Pôr do sol no pasto','vacas']]}};
const DESTB={
  estrada:{s0:.06,s1:.32,svg:()=>SPRB.torre().replace('<path','<g transform="translate(120 0)"><path')+'</g>'+SPRB.portal('ALTO DA SERRA')},
  ciclovia:{s0:.07,s1:.34,svg:()=>SPRB.ponte()},
  campo:{s0:.07,s1:.36,svg:()=>'<path d="M-700 40Q-300 -90 0 -90Q300 -90 700 40Z" fill="#86a865"/>'+'<g transform="translate(0 -88)">'+SPRB.sede()+'</g>'+'<g transform="translate(-300 -40) scale(.7)">'+SPRB.moinho()+'</g>'}};
function criaDestinoBike(){const d=DESTB[CESC];return destBaliza(novo(d.svg(),0,0,LTOTB+300,{dest:1,limX:1,sfn:destSfn(d,LTOTB)}));}

/* ==================== ESTEIRA: caminhada e trote vistos de costas (mesma estrada contínua da bike) ==================== */
/* velocidade (km/h) e tempo de uma passada completa (2 passos), por exercício e zona.
   cadência: caminhada 104–122 passos/min, trote 166–174 passos/min (faixas usuais em adultos) */
const EXS={anda:{nome:'Caminhada',kmh:{1:4.5,3:5.5,5:6.5},T:{1:1.15,3:1.06,5:.98}},
  incl:{nome:'Inclinada',kmh:{1:4,3:4.8,5:5.5},T:{1:1.18,3:1.1,5:1.05},inc:{1:.04,3:.08,5:.12}},
  trote:{nome:'Trote',kmh:{1:6,3:8.5,5:10.5},T:{1:.95,3:.72,5:.69}}};
let EX='anda',INCa=0,LTOTE=0,gB=0;
const VE=()=>EXS[EX].kmh[Z]/3.6/.03;
const correndo=()=>EX==='trote'&&Z>=3;
const velM=()=>MAQ==='esteira'?VE():MAQ==='eliptico'?VEL_EL():VELB[Z];
const zSp=()=>MAQ==='esteira'||MAQ==='eliptico'?Math.max(700,velM()*11):2600;
const LTM=()=>MAQ==='esteira'?LTOTE:MAQ==='eliptico'?LTOTEL:LTOTB;

/* ---------- corredor visto de costas: perna por cinemática (quadril, joelho, tornozelo), projetada em 3D ---------- */
const GAIT={anda:{amp:21,off:2,kSt:10,kSw:60,kc:.73,kw:.12,lean:3,eb:24,aamp:.8,voo:0,pa:0,base:3.1},
  corre:{amp:28,off:6,kSt:24,kSw:100,kc:.7,kw:.15,lean:7,eb:88,aamp:1,voo:1.6,pa:.18,base:2.4}};
const mixG=(a,b,t)=>{const o={};for(const k in a)o[k]=a[k]+(b[k]-a[k])*t;return o;};
const gaitHeroi=()=>{const g=mixG(GAIT.anda,GAIT.corre,gB);g.lean+=INCa*60;return g;};
const L1C=15.2,L2C=14.8,PEC=5.4,ANC=2.2;
const bumpC=(q,c,w)=>{let d=Math.abs(q-c);d=Math.min(d,1-d);return Math.exp(-(d/w)*(d/w));};
function pernaC(q,G){const th=(G.off+G.amp*Math.cos(TAU*(q-.85)))*RD,k=(4+G.kSt*bumpC(q,.12,.09)+G.kSw*bumpC(q,G.kc,G.kw))*RD;
  const kz=Math.sin(th)*L1C,kd=Math.cos(th)*L1C,a=th-k,az=kz+Math.sin(a)*L2C,ad=kd+Math.cos(a)*L2C,pa=a-G.pa*Math.sin(TAU*q);
  const ux=Math.cos(pa),ud=-Math.sin(pa),nx=Math.sin(pa),nd=Math.cos(pa);
  const hz=az+nx*ANC-ux*1.7,hd=ad+nd*ANC-ud*1.7,tz=az+nx*ANC*.5+ux*PEC,td=ad+nd*ANC*.5+ud*PEC;
  return {th,kz,kd,az,ad,hz,hd,tz,td,sz:nx*1,sd:nd*1};}
const CORC={camisa:H.camisa,manga:MANGA,short:H.short,tenis:H.tenis,pele:H.pele,cabelo:H.cabelo};
function montaCorredor(pai,cor,Dp,op){op=op||{};const g=el('g',{},pai),m={};
  const mk=(k,c,w)=>{m[k]=w?el('path',{fill:'none',stroke:c,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'},g):el('path',{fill:c},g);};
  for(const j of [0,1]){mk('bT'+j,cor.manga,3.4);mk('mT'+j,cor.pele,0);}
  for(const j of [0,1]){mk('pn'+j,cor.pele,4.2);mk('co'+j,cor.short,6.2);mk('so'+j,'#1b2026',3.9);mk('te'+j,cor.tenis,3.5);}
  mk('sho',cor.short,0);mk('tor',cor.camisa,0);if(op.bastao)for(const j of [0,1])mk('v'+j,'#d9dee6',1.3);mk('pesc',cor.pele,3.4);
  for(const j of [0,1]){mk('bF'+j,cor.manga,3.4);mk('mF'+j,cor.pele,0);}
  mk('ore',cor.pele,0);mk('cab',cor.pele,0);mk('cabelo',cor.cabelo,0);if(op.bone)mk('bone','#f4f1e6',0);
  const Hc=BKE.H,PJ=(x,y,z)=>{const k=Dp/(Dp+z);return [x*k,(Hc-y)*k-Hc];},P2=(x,y,z)=>pp(PJ(x,y,z));
  return {g,set(th,G){G=G||GAIT.anda;const q=((th/TAU)%1+1)%1,A=pernaC(q,G),B=pernaC((q+.5)%1,G);
    let hip=Math.max(A.hd,A.td,B.hd,B.td)+.9;if(G.voo)hip+=G.voo*Math.max(0,Math.sin(TAU*2*q-.6));
    const yH=hip,px=-1.1*Math.cos(TAU*(q-.1)),rp=.8*Math.cos(TAU*(q-.85)),ln=G.lean*RD,O={};
    const Ys=yH+Math.cos(ln)*16.5,zs=Math.sin(ln)*16.5,rs=(1+.4*gB)*Math.cos(TAU*(q-.85));
    const pernas=[[A,-1],[B,1]].map(([L,sg])=>{const hx=px+sg*3.4,hz=-sg*rp,fx=px*.4+sg*G.base;
      return {zA:L.az,hip:[hx,yH,hz],kn:[px*.7+sg*3.3,yH-L.kd,hz+L.kz],an:[fx,yH-L.ad,hz+L.az],he:[fx,yH-L.hd,hz+L.hz],to:[fx+sg*.4,yH-L.td,hz+L.tz],L};}).sort((a,b)=>b.zA-a.zA);
    pernas.forEach((p,i)=>{const t=v=>p.hip.map((a,u)=>a+(p.kn[u]-a)*v);
      O['pn'+i]='M'+P2(...p.hip)+'L'+P2(...p.kn)+'L'+P2(...p.an);O['co'+i]='M'+P2(...p.hip)+'L'+P2(...t(.46));
      const so=(v)=>[v[0],v[1]-p.L.sd*.9,v[2]+p.L.sz*.9];
      O['so'+i]='M'+P2(...so(p.he))+'L'+P2(...so(p.to));O['te'+i]='M'+P2(...p.he)+'L'+P2(...p.to);});
    O.sho='M'+[[-5.6,yH+2.8,0],[5.6,yH+2.8,0],[6.3,yH-2.4,-rp],[1.2,yH-4,0],[-1.2,yH-4,0],[-6.3,yH-2.4,rp]].map(v=>P2(v[0]+px,v[1],v[2])).join('L')+'Z';
    const sx=px*.5;
    O.tor='M'+P2(sx-5,yH+1.6,rp*.3)+'L'+P2(sx-7.4,Ys-2,zs-rs)+'Q'+P2(sx-7.5,Ys+1.6,zs-rs)+' '+P2(sx-4.8,Ys+1.7,zs-rs*.6)+'L'+P2(sx+4.8,Ys+1.7,zs+rs*.6)
      +'Q'+P2(sx+7.5,Ys+1.6,zs+rs)+' '+P2(sx+7.4,Ys-2,zs+rs)+'L'+P2(sx+5,yH+1.6,-rp*.3)+'Z';
    for(const j of [0,1]){const sg=j?1:-1,thO=(j?A:B).th,al=G.aamp*thO,b=al+G.eb*RD,zsh=zs+sg*rs,
        sh=[sx+sg*7,Ys-1.8,zsh],co=[sx+sg*8.4,sh[1]-Math.cos(al)*10,zsh+Math.sin(al)*10],
        mo=[sx+sg*(8.4-1.4*gB),co[1]-Math.cos(b)*8,co[2]+Math.sin(b)*8],ma=[sx+sg*(8.4-1.6*gB),co[1]-Math.cos(b)*9.6,co[2]+Math.sin(b)*9.6],
        pm=PJ(...ma),rm=1.6*Dp/(Dp+ma[2]),d='M'+P2(...sh)+'L'+P2(...co)+'L'+P2(...mo),mao=circ(pm[0],pm[1],rm),adiante=mo[2]>zsh+1.5;
      O['bT'+j]=adiante?d:'M0 0';O['mT'+j]=adiante?mao:'M0 0';O['bF'+j]=adiante?'M0 0':d;O['mF'+j]=adiante?'M0 0':mao;
      if(op.bastao){const ap=Math.max(0,Math.sin(al*1.6));O['v'+j]='M'+P2(ma[0],ma[1]+1.4,ma[2])+'L'+P2(ma[0]+sg*2,ap*3,ma[2]-15-6*ap);}}
    O.pesc='M'+P2(sx,Ys+1,zs)+'L'+P2(sx,Ys+3.4,zs+.3);
    const hc=PJ(sx,Ys+6.6,zs+Math.sin(ln)*6.6+.4),r=4.5*Dp/(Dp+zs);
    O.ore=circ(hc[0]-r*.97,hc[1]+r*.14,r*.26)+circ(hc[0]+r*.97,hc[1]+r*.14,r*.26);O.cab=circ(hc[0],hc[1],r);O.cabelo=circ(hc[0],hc[1]-r*.16,r*1.01);if(op.bone)O.bone='M'+f(hc[0]-r*1.06)+' '+f(hc[1]-r*.05)+'A'+f(r*1.06)+' '+f(r*1.12)+' 0 0 1 '+f(hc[0]+r*1.06)+' '+f(hc[1]-r*.05)+'Z';
    for(const k in m)if(O[k])m[k].setAttribute('d',O[k]);}};}
const PELES=['#c68d63','#8d5a3b','#e0b48f','#5e3b26'],CABELOS=['#2e1f17','#141210','#7a4a22','#c9a46a'];
const corCorredor=i=>{const o={camisa:['#ff6b5c','#4b9bff','#ffffff','#b36bff','#ff9f1a','#2ec27e'][i%6],manga:null,short:['#1f2328','#2b3a55','#3a3a3a'][i%3],tenis:['#f2f4f7','#ff3b30','#1d2228'][i%3],pele:PELES[(i*3+1)%4],cabelo:CABELOS[(i*5+2)%4]};o.manga=o.pele;return o;};
function outroCorredor(X,z,ex){const o=novo('',X,0,z,Object.assign({th:Math.random()*6},ex||{}));o.run=montaCorredor(o.g,corCorredor(seq),1e4);const u0=o.upd;
  o.upd=(oo,dt,vel)=>{oo.th+=dt*TAU/.7;oo.run.set(oo.th,GAIT.corre);if(u0)u0(oo,dt,vel);};return o;}

/* ---------- cenários da esteira ---------- */
Object.assign(PB,{
  parque:{RL:10,curva:.22,morro:.012,ceu:['#7db6e3','#cfe6f2','#f2efe2'],chao:'#6aa44a',dirP:70,marco:54,cascW:32,
    faixas:[[-3000,-330,'#4f93bd','#4a8cb5'],[-330,-300,'#c9b98f','#c0b087'],[-300,-38,'#71ad4f','#6aa44a'],[-38,-32,'#dcd6c8','#d3cdbf'],[-32,32,'#c4785a','#bb7254'],[32,38,'#dcd6c8','#d3cdbf'],[38,3000,'#71ad4f','#6aa44a']],
    linhas:[[0,1.3,'#f3ece0',1]],
    flg:{madeira:{c:[[-330,-36,'#4f93bd'],[36,330,'#4f93bd'],[-36,36,'#a37b52'],[-36,36,'#8b6644',1]],rail:36,tapa:1},sombra:{c:[[-140,140,'#0b2a12',0,.26]]}}},
  orla:{RL:-14,curva:.1,morro:0,ceu:['#5fb0e6','#bfe3f5','#f6efdc'],chao:'#9fb7c4',dirP:-138,marco:-84,cascW:60,
    faixas:[[-3000,-300,'#2a7fb3','#2779ab'],[-300,-268,'#6bbad2','#64b2ca'],[-268,-254,'#eef7f7','#e6f0f0'],[-254,-70,'#ecd9aa','#e6d2a2'],[-70,-62,'#c8c2b4','#c1bbad'],[-62,62,'#f4f1ea','#efebe3'],
      [62,70,'#c8c2b4','#c1bbad'],[70,104,'#c0473d','#b6423a'],[104,112,'#d9d6cf','#d0cdc6'],[112,360,'#43474e','#3f434a'],[360,3000,'#b9b4aa','#b2ada3']],
    linhas:[[-42,10,'#34373b',0,4.5,170],[-14,10,'#34373b',0,4.5,170],[14,10,'#34373b',0,4.5,170],[42,10,'#34373b',0,4.5,170],[236,2,'#f2f2ee',1]],
    flg:{areia:{c:[[-62,62,'#ead6a4'],[-36,30,'#dcc592',1]],tapa:1},sombra:{c:[[-200,62,'#0b2a12',0,.22]]}}},
  serra:{RL:0,curva:.38,morro:.03,ceu:['#79acd6','#c6dde9','#eaeee6'],chao:'#2f5527',dirP:44,marco:30,cascW:22,
    faixas:[[-3000,-34,'#3d6a31','#38632d'],[-34,-20,'#5c8a3f','#56833b'],[-20,20,'#9a7552','#91704d'],[20,34,'#5c8a3f','#56833b'],[34,3000,'#3d6a31','#38632d']],
    linhas:[[0,9,'#a8845f']],
    flg:{madeira:{c:[[-420,-24,'#4f8fb0'],[24,420,'#4f8fb0'],[-24,24,'#a37b52'],[-24,24,'#8b6644',1]],rail:24,tapa:1},
      pinguela:{c:[[-520,520,'#4f8fb0'],[-60,60,'#6fa9c4',1],[-7,7,'#7a5534']],tapa:1},barro:{c:[[-22,22,'#6e4f36'],[-14,10,'#56402c',1]],tapa:1}}},
  cidade:{RL:12,curva:.08,morro:.01,ceu:['#0b1030','#1d2550','#3a3266'],chao:'#1d212b',dirP:60,marco:66,cascW:48,noite:1,
    faixas:[[-3000,-340,'#232733','#20242f'],[-340,-58,'#2c3039','#292d36'],[-58,-50,'#8c8f96','#84878e'],[-50,50,'#5f636c','#585c65'],[50,58,'#2f4a32','#2c452f'],[58,3000,'#262a33','#23272f']],
    linhas:[[-150,2,'#d9d9d0',1],[-250,2,'#d9d9d0',1]],
    flg:{faixa:{c:[[-58,700,'#2c3039']]}}}});

/* fundo de cada cenário: faixas que se repetem a cada 390 px sem degrau na emenda */
const FUNDOE={
  parque:()=>{let sk='',cp='',cp2='';for(let x=-30;x<420;x+=14){const u=((x%390)+390)%390,h=16+hsh(u)*46+(hsh(u+5)>.86?34:0);sk+='M'+x+' 304V'+f(304-h)+'h'+f(9+hsh(u+3)*4)+'V304Z';}
    for(let x=-30;x<430;x+=17){const u=((x%390)+390)%390;cp+=elp(x,296-hsh(u)*6,13+hsh(u+1)*5,11+hsh(u+2)*5);cp2+=elp(x+8,302,11+hsh(u+7)*4,8);}
    return '<g id="para"><g fill="#b6c5d4">'+rep2(sk)+'</g><g fill="#5f9150">'+rep2(cp)+'</g><g fill="#4f8443">'+rep2(cp2)+'</g></g>';},
  orla:()=>'<g id="para"><g fill="#6f8fa3">'+rep2('M6 312Q30 262 62 284Q84 236 118 270Q140 286 160 312ZM-30 312Q-10 296 6 312Z')+'</g>'
    +'<g fill="#c9cfd6">'+rep2((()=>{let p='';for(let x=196;x<390;x+=13){const h=26+hsh(x)*60;p+='M'+x+' 312V'+f(312-h)+'h10V312Z';}return p;})())+'</g>'
    +'<g fill="#e6e9ec">'+rep2('M200 312v-14h22v14ZM250 312v-20h16v20ZM300 312v-12h28v12ZM350 312v-18h20v18Z')+'</g></g>',
  serra:()=>{let pin='';for(let x=-30;x<430;x+=9){const u=((x%390)+390)%390,h=14+hsh(u)*20;pin+='M'+f(x-6)+' 306L'+x+' '+f(306-h)+'L'+f(x+6)+' 306Z';}
    return '<g id="para"><g fill="#9db3c6">'+rep2('M0 300V250L34 232L70 250L104 214L140 242L176 222L212 248L248 210L286 240L322 220L356 246L390 250V300Z')+'</g>'
      +'<g fill="#ffffff" opacity=".4">'+rep2('M0 286Q100 274 195 284T390 282V300H0Z')+'</g><g fill="#2f5527">'+rep2(pin)+'</g></g>';},
  cidade:()=>{let st='';for(let i=0;i<70;i++)st+=circ(hsh(i)*390,hsh(i+50)*250,.5+hsh(i+90)*.8);let sk='',jn='';
    for(let x=-30;x<420;x+=15){const u=((x%390)+390)%390,h=24+hsh(u)*80+(hsh(u+9)>.85?50:0),w=11+hsh(u+3)*3;sk+='M'+x+' 306V'+f(306-h)+'h'+f(w)+'V306Z';
      for(let y=306-h+5;y<300;y+=7)for(let xx=x+2;xx<x+w-2;xx+=4)if(hsh(xx*3.1+y*1.7+u)>.62)jn+='M'+f(xx)+' '+f(y)+'h1.8v2.2h-1.8Z';}
    return '<g id="est" fill="#ffffff" opacity=".6"><path d="'+st+'"/></g><circle cx="300" cy="120" r="16" fill="#f4efd9"/><circle cx="300" cy="120" r="34" fill="#f4efd9" opacity=".12"/>'
      +'<g id="para"><g fill="#171c38">'+rep2(sk)+'</g><g fill="#ffd98a" opacity=".85">'+rep2(jn)+'</g></g>';}};
const rep2=d=>'<path d="'+d+'"/><path transform="translate(390 0)" d="'+d+'"/>';

/* ---------- elementos da esteira (unidade do mundo: 1 ≈ 3 cm; origem no chão) ---------- */
/* banco de parque de lado, virado para a pista (o boneco o vê pelo lado que se senta). ângulo aprovado: B (3/4 curto, m=1); m=0 e m=2 ficam guardados.
   Projeção oblíqua: u = fundo (encosto → assento, aponta para a pista), v = comprimento (afasta rumo ao horizonte), h = altura. */
const BANCO_V=1;
function bancoLado(m){const [fx,fy,L]=[[.12,.07,17],[.3,.15,21],[.5,.22,30]][m],a=-L/2,b=L/2,P=(u,v,h)=>[u+v*fx,-h-v*fy],
  pt=q=>{const p=P(q[0],q[1],q[2]);return f(p[0])+' '+f(p[1]);},quad=(q,c)=>'<path d="M'+q.map(pt).join('L')+'Z" fill="'+c+'"/>',
  lin=(p,q,w,c)=>'<path d="M'+pt(p)+'L'+pt(q)+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round" fill="none"/>',
  W='#8a6239',WL='#a87b48',D='#4f361e',fr=(v)=>lin([0,v,0],[-1.8,v,13.4],1.25,D)+lin([7,v,0],[7,v,6.4],1.25,D)+lin([-.6,v,9.3],[6.8,v,9.3],1.1,D);
  const p0=P(3.5,0,0),sh='<ellipse cx="'+f(p0[0])+'" cy="'+f(p0[1]+.6)+'" rx="'+f(9+Math.abs(L*fx)/2)+'" ry="2.6" fill="#000" opacity=".16"/>';
  let s=sh+fr(b);
  if(m===2)s+=fr(0);
  s+=quad([[-1.2,a,7.6],[-1.2,b,7.6],[-1.2-1.4,b,10.4],[-1.2-1.4,a,10.4]],W)+quad([[-1.6,a,11],[-1.6,b,11],[-1.2-1.7,b,13.6],[-1.2-1.7,a,13.6]],W);
  s+=quad([[-.6,a,6.4],[-.6,b,6.4],[7.6,b,6.4],[7.6,a,6.4]],WL)+quad([[7.6,a,6.4],[7.6,b,6.4],[7.6,b,5.1],[7.6,a,5.1]],W);
  s+=fr(a);
  return s;}
/* gente parada (quiosque, vôlei): figura chapada e barata, sem animação. 4 caminhos por pessoa (pele, roupa de cima, short, cabelo
   + chinelo), 5 quando segura um coco. Altura ≈ 57 un (1,70 m). costas = vista de trás (o cabelo cobre a cabeça toda).
   Os retângulos giram no mesmo sentido do circ() (anti-horário): com sentidos opostos, onde se sobrepõem vira buraco. */
function gente(o){const R=(x,y,w,h)=>'M'+x+' '+y+'v'+h+'h'+w+'v'+(-h)+'Z',c=o.coco,reg=o.regata;
  let pele=R(-5.6,-27,4,26)+R(1.6,-27,4,26)+R(-1.6,-50,3.2,5)+circ(0,-53.5,5);
  pele+=R(-10.6,-45,2.8,17)+circ(-9.2,-28,1.7);if(!c)pele+=R(7.8,-45,2.8,17)+circ(9.2,-28,1.7);
  const cam='M-8.2 -46Q0 -48.2 8.2 -46L7 -28H-7Z'+(reg?'':'M-8.2 -46L-11.2 -44.6L-10.8 -40H-7.7ZM8.2 -46L11.2 -44.6L10.8 -40H7.7Z');
  const sh='M-7 -29H7L6.4 -19H0.7L0 -22.5L-0.7 -19H-6.4Z';
  const cab=(o.costas?circ(0,-54,5.3):'M-5.3 -53.6Q-5.4 -59.8 0 -59.8Q5.4 -59.8 5.3 -53.6Q3.4 -57 0 -57.2Q-3.4 -57 -5.3 -53.6Z')+(o.rabo?'M-1.6 -56Q0 -47 2.4 -44.6Q3 -50 1.6 -56Z':'')+R(-6.4,-1.4,5,1.4)+R(1.4,-1.4,5,1.4);
  return '<g transform="translate('+(o.x||0)+' 0)'+(o.h&&o.h!==1?' scale('+o.h+')':'')+'"><path d="'+pele+'" fill="'+o.pele+'"/>'
    +(c?'<path d="M9.4 -44.4L10.6 -36.6L4.6 -48.6" stroke="'+o.pele+'" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="'+circ(3.4,-50.4,3.6)+'" fill="#6f9a2e"/><path d="M2.4 -53.6L0.6 -57" stroke="#ffffff" stroke-width=".8"/>':'')
    +'<path d="'+cam+'" fill="'+o.cam+'"/><path d="'+sh+'" fill="'+o.sh+'"/><path d="'+cab+'" fill="'+o.cab+'"/></g>';}
const SPRE={
  lampiao:()=>'<rect x="-1.6" y="-118" width="3.2" height="118" fill="#2f4a3a"/><rect x="-5" y="-6" width="10" height="6" fill="#2f4a3a"/><path d="M-6 -134h12" stroke="#2f4a3a" stroke-width="2.4"/><circle cx="0" cy="-126" r="7.5" fill="#fff6d8" stroke="#2f4a3a" stroke-width="1.4"/>',
  posteOrla:()=>'<rect x="-2" y="-200" width="4" height="200" fill="#c3c8cf"/><path d="M0 -198q0 -10 -16 -10h-12" stroke="#c3c8cf" stroke-width="3.4" fill="none"/><rect x="-36" y="-212" width="14" height="5" rx="2" fill="#fff4c4"/>',
  posteN:()=>'<circle cx="-30" cy="-262" r="70" fill="url(#luz)"/><rect x="-2" y="-260" width="4" height="260" fill="#3d4148"/><path d="M0 -258q0 -12 -18 -12h-10" stroke="#3d4148" stroke-width="4" fill="none"/><rect x="-38" y="-274" width="16" height="6" rx="2" fill="#fff0c0"/>',
  pato:()=>'<ellipse cx="0" cy="0" rx="10" ry="1.6" fill="#ffffff" opacity=".35"/><ellipse cx="0" cy="-3" rx="6" ry="3" fill="#8a7a62"/><path d="M-6 -3l-3 -2 1 3Z" fill="#6b5e4a"/><circle cx="5" cy="-7" r="2.4" fill="#2f7a4a"/><path d="M7 -7.2l3.2 .7-3.2.8Z" fill="#f2a12a"/>',
  garca:()=>'<path d="M-2 0V-14M2 0V-14" stroke="#e0a43a" stroke-width="1.2"/><ellipse cx="0" cy="-19" rx="9" ry="5.5" fill="#ffffff"/><path d="M-9 -19l-6 4 6 -1Z" fill="#eef0f2"/><path d="M5 -21Q9 -30 6 -36" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="7.5" cy="-37" rx="3" ry="2.2" fill="#ffffff"/><path d="M10 -37.6l8 1.2-8 .8Z" fill="#f2c230"/><circle cx="8" cy="-37.6" r=".5" fill="#111"/>',
  garcaVoo:()=>'<g class="asa"><path d="M0 -.6Q-5 -6 -14 -3Q-7 -.6 0 2Q7 -.6 14 -3Q5 -6 0 -.6Z" fill="#ffffff" stroke="#c9d1d6" stroke-width=".4"/></g><path d="M0 0l7 -1" stroke="#ffffff" stroke-width="1.6"/><path d="M7 -1l3 .3" stroke="#f2c230" stroke-width=".8"/>',
  ipeA:(sd=0)=>copa('#f2c230',1+(hsh(sd*2.3+4)-.5)*.24,[[0,-150,54],[-40,-128,36],[40,-132,38],[-24,-176,34],[26,-178,34],[0,-194,26],[-56,-150,26],[56,-152,26]],100,'#5e4430',sd),
  /* cachorro caramelo visto de trás: pernas de trás alternam, rabo abana */
  cao:()=>'<g class="pA"><path d="M-4 -9V-.8" stroke="#b9772f" stroke-width="3.2" stroke-linecap="round"/></g><g class="pB"><path d="M4 -9V-.8" stroke="#b9772f" stroke-width="3.2" stroke-linecap="round"/></g>'
    +'<g class="corpo"><ellipse cx="0" cy="-19" rx="4.6" ry="4.2" fill="#c98236"/><path d="M-4.4 -21l-2.6 -4.6 4 1.6ZM4.4 -21l2.6 -4.6 -4 1.6Z" fill="#a8672a"/><ellipse cx="0" cy="-12" rx="7.2" ry="6.6" fill="#d18a3c"/><ellipse cx="0" cy="-9.5" rx="3.6" ry="2.6" fill="#e7b57d"/>'
    +'<g class="rabo"><path d="M0 -16.5Q1 -22 4 -25" stroke="#c98236" stroke-width="2.6" fill="none" stroke-linecap="round"/></g></g>',
  coreto:()=>'<rect x="-84" y="-14" width="168" height="14" fill="#d9d3c4"/><rect x="-24" y="-6" width="48" height="6" fill="#c8c1b0"/><path d="M-70 -14V-108M-24 -14V-112M24 -14V-112M70 -14V-108" stroke="#f4efe6" stroke-width="5"/>'
    +'<path d="M-76 -40H76M-76 -32H76" stroke="#f4efe6" stroke-width="2"/><path d="M-94 -106L0 -168L94 -106Z" fill="#c4553a"/><path d="M-94 -106H94" stroke="#9a3f2a" stroke-width="5"/><circle cx="0" cy="-172" r="5" fill="#e8c35a"/>',
  bebedouro:()=>'<rect x="-5" y="-34" width="10" height="34" rx="2" fill="#8a9097"/><rect x="-9" y="-38" width="18" height="6" rx="3" fill="#a9b0b8"/><path d="M2 -38q4 -7 8 -2" stroke="#9fd3ff" stroke-width="1.4" fill="none"/>',
  coqueiro:(sd=0)=>{const R=v=>hsh(sd*4.31+v),Ht=210*(1+(R(1)-.5)*.3),lx=(R(2)-.5)*60,tx=lx,ty=-Ht;let fo='',fl='',co='';
    for(let i=0;i<8;i++){const a=(-170+i*24+(R(3+i)-.5)*12)*RD,L=56+R(10+i)*16,ex=tx+Math.cos(a)*L,ey=ty+Math.sin(a)*L*.55+22,mx=tx+Math.cos(a)*L*.5,my=ty+Math.sin(a)*L*.5-10;
      fo+='M'+f(tx)+' '+f(ty)+'Q'+f(mx)+' '+f(my-6)+' '+f(ex)+' '+f(ey)+'Q'+f(mx)+' '+f(my+6)+' '+f(tx)+' '+f(ty)+'Z';if(i%2)fl+='M'+f(tx)+' '+f(ty)+'Q'+f(mx)+' '+f(my-3)+' '+f(ex)+' '+f(ey);}
    for(let i=0;i<3;i++)co+=circ(tx-4+i*4,ty+5,3.2);
    return '<path d="M-4 0Q'+f(lx*.2)+' '+f(-Ht*.5)+' '+f(tx-2)+' '+f(ty)+'L'+f(tx+2)+' '+f(ty)+'Q'+f(lx*.2+5)+' '+f(-Ht*.5)+' 4 0Z" fill="#8a6a45"/><path d="'+co+'" fill="#6b7a2a"/><path d="'+fo+'" fill="#2f7a3a"/><path d="'+fl+'" stroke="#4e9a46" stroke-width="2" fill="none"/>';},
  guardasol:(cor)=>'<path d="M0 0V-62" stroke="#e8e2d4" stroke-width="2"/><path d="M-36 -58Q0 -86 36 -58Z" fill="'+cor+'"/><path d="M-12 -58Q-6 -78 0 -78Q6 -78 12 -58Z" fill="#ffffff" opacity=".85"/><rect x="10" y="-14" width="20" height="3" fill="#3a83b5"/><path d="M12 -11l-4 11M28 -11l3 11M10 -14l-8 -14" stroke="#e8e2d4" stroke-width="1.6"/>',
  quiosque:()=>'<rect x="-60" y="-70" width="120" height="70" fill="#f4efe3"/><rect x="-60" y="-36" width="120" height="6" fill="#2e8b57"/><path d="M-82 -66L0 -102L82 -66Z" fill="#2e8b57"/><rect x="-44" y="-62" width="88" height="22" fill="#ffd27a"/>'+'<path d="'+circ(8,-52.6,4.6)+'" fill="#a8714c"/><path d="M3.2 -53Q3 -58.2 8 -58.2Q13 -58.2 12.8 -53Q11 -55.6 8 -55.8Q5 -55.6 3.2 -53Z" fill="#1d1a18"/><path d="M-1 -40Q-1 -46.6 5 -47.2H11Q17 -46.6 17 -40Z" fill="#ffffff"/>'
    +'<path d="'+circ(-30,-26,5)+circ(-18,-26,5)+circ(22,-26,5)+'" fill="#6f9a2e"/>'+TXT(0,-74,'COCO GELADO',9,'#ffffff',800,64)
    +gente({x:-22,costas:1,pele:'#c68a5e',cam:'#3a83b5',sh:'#2b2f33',cab:'#2a1d15'})+gente({x:38,h:.95,coco:1,pele:'#e9b48c',cam:'#e46a5a',sh:'#e8e2d4',cab:'#5a3a22'}),
  postoSV:(t)=>'<path d="M-24 0L-14 -70M24 0L14 -70M-20 -30H20M-17 -52H17" stroke="#e8e2d4" stroke-width="4"/><rect x="-26" y="-104" width="52" height="36" fill="#f2f2ee"/><path d="M-30 -104L0 -122L30 -104Z" fill="#d4433a"/><rect x="-22" y="-98" width="44" height="14" fill="#9fd3ff" opacity=".7"/>'
    +'<rect x="-32" y="-148" width="64" height="20" rx="2" fill="'+MOSTARDA+'" stroke="'+PRETO+'" stroke-width="1"/>'+TXT(0,-133,t,12,PRETO,800,58,17)+'<path d="M0 -122V-128" stroke="#e8e2d4" stroke-width="3"/>',
  pier:()=>'<rect x="-420" y="-30" width="840" height="10" fill="#8a6239"/><path d="'+(()=>{let p='';for(let x=-410;x<420;x+=40)p+='M'+x+' -20V0';return p;})()+'" stroke="#5a3e22" stroke-width="6"/><path d="M-420 -46H420" stroke="#8a6239" stroke-width="2.4"/>'
    +'<path d="'+(()=>{let p='';for(let x=-410;x<420;x+=40)p+='M'+x+' -46V-30';return p;})()+'" stroke="#8a6239" stroke-width="2"/>',
  rede:()=>gente({x:-24,h:.975,regata:1,pele:'#8d5a3b',cam:'#3a83b5',sh:'#ffd23f',cab:'#1d1a18'})+'<path d="M-62 0V-84M62 0V-84" stroke="#e8e2d4" stroke-width="3"/><rect x="-62" y="-84" width="124" height="5" fill="#ffffff"/><path d="'+(()=>{let p='';for(let x=-56;x<62;x+=8)p+='M'+x+' -79V-58';for(let y=-74;y<-56;y+=6)p+='M-62 '+y+'H62';return p;})()+'" stroke="#f4f4f4" stroke-width=".6" opacity=".8"/>'
    +gente({x:30,h:1.06,costas:1,regata:1,rabo:1,pele:'#e3a77f',cam:'#d4433a',sh:'#2b2f33',cab:'#6b4226'})+'<ellipse cx="54" cy="-.4" rx="7" ry="1.6" fill="#000" opacity=".15"/><circle cx="54" cy="-6" r="6" fill="#ffd23f"/><path d="M48.4 -6.6Q54 -4 59.6 -6.6M54 -12Q51.6 -6 54 0" stroke="#3a83b5" stroke-width="1" fill="none"/>',
  farolE:()=>'<path d="M-180 0Q-130 -66 -40 -76Q46 -82 130 -44Q160 -22 186 0Z" fill="#5d6a70"/><path d="M-40 -76Q46 -82 130 -44Q60 -60 -30 -64Z" fill="#7a878d"/>'
    +'<path d="M-22 -66L-14 -290H14L22 -66Z" fill="#f4f4f0"/><path d="M-20.4 -120H20.4L19 -152H-19ZM-17 -204H17L15.6 -236H-15.6Z" fill="#d4433a"/><rect x="-16" y="-310" width="32" height="20" fill="#2b3036"/><rect x="-12" y="-308" width="24" height="14" fill="#fff4c4"/><path d="M-20 -310L0 -330L20 -310Z" fill="#d4433a"/><circle cx="0" cy="-300" r="44" fill="url(#luz)"/>',
  capivara:()=>'<ellipse cx="0" cy="-12" rx="18" ry="9" fill="#8a6a48"/><path d="M-14 -16Q-8 -20 6 -20" stroke="#9c7b56" stroke-width="2" fill="none"/><path d="M13 -17q11 -2 13 6q-4 4 -13 2Z" fill="#7a5c3e"/><circle cx="21" cy="-14" r="1" fill="#1b1b1b"/><path d="M16 -20l2 -3 2.4 3Z" fill="#6b4f35"/><path d="M-12 -4v4M-6 -4v4M8 -4v4M13 -4v4" stroke="#6b4f35" stroke-width="3.2" stroke-linecap="round"/>',
  samambaia:(sd=0)=>{let a='',b='';for(let i=0;i<9;i++){const an=(-78+i*19.5+(hsh(sd+i)-.5)*10)*RD,L=18+hsh(sd*2+i)*9,ex=Math.sin(an)*L,ey=-Math.cos(an)*L*.9;
      const fr='M0 0Q'+f(ex*.3-2)+' '+f(ey*.6)+' '+f(ex)+' '+f(ey)+'Q'+f(ex*.3+2)+' '+f(ey*.5)+' 0 0Z';if(i%2)a+=fr;else b+=fr;}
    return '<path d="'+a+'" fill="#3f7d34"/><path d="'+b+'" fill="#5a9a46"/>';},
  rocha:()=>'<path d="M-26 0Q-30 -16 -12 -22Q4 -30 20 -18Q30 -8 26 0Z" fill="#8a8a82"/><path d="M-12 -22Q4 -30 20 -18Q8 -20 -4 -16Z" fill="#a3a39a"/>',
  raiz:()=>'<path d="M-30 -1Q-14 -4 0 -1.6Q12 0 30 -2.6" stroke="#5a3e28" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-6 -2Q0 -5 8 -2" stroke="#6b4a30" stroke-width="2" fill="none"/>',
  poca:()=>'<ellipse cx="0" cy="-1" rx="14" ry="3" fill="#7d9fb8" opacity=".85"/><ellipse cx="-3" cy="-1.6" rx="6" ry="1" fill="#c6dde9" opacity=".7"/>',
  cachoeira:()=>'<path d="M-130 0V-200Q-60 -232 0 -222Q60 -234 130 -200V0Z" fill="#6d6a5f"/><path d="M-130 -150Q-80 -170 -40 -150M60 -180Q100 -196 130 -176" stroke="#4e7d3a" stroke-width="10" fill="none" stroke-linecap="round"/>'
    +'<path d="M-30 -216Q0 -222 30 -218V0H-30Z" fill="#dff3fb"/><g class="agua"><path d="M-22 -214V0M-8 -218V0M8 -218V0M22 -214V0" stroke="#a9dcef" stroke-width="3.4" stroke-dasharray="18 12"/></g>'
    +'<ellipse cx="0" cy="0" rx="70" ry="10" fill="#bfe6f3"/><ellipse cx="0" cy="-10" rx="56" ry="16" fill="#ffffff" opacity=".55"/>',
  pontePensil:()=>'<path d="M-46 0V-124M46 0V-124" stroke="#6b4a2b" stroke-width="7"/><path d="M-54 -122H54" stroke="#5a3e22" stroke-width="6"/><path d="M-46 -116Q-60 -60 -46 -26M46 -116Q60 -60 46 -26" stroke="#c9b48a" stroke-width="2" fill="none"/>',
  refugio:()=>SPRB.cafe('REFÚGIO')+'<path d="M50 -110V-136h12V-104" fill="#5a4a3e"/><g fill="#e8eaee" opacity=".5"><circle cx="58" cy="-146" r="7"/><circle cx="64" cy="-160" r="9"/><circle cx="58" cy="-178" r="11"/></g>',
  gatoMuro:()=>'<rect x="-70" y="-42" width="140" height="42" fill="#5a4a48"/><path d="M-70 -28H70M-70 -14H70M-35 -42V-28M0 -28V-14M35 -42V-28M-20 -14V0M20 -14V0" stroke="#4a3c3a" stroke-width="1.2"/>'
    +'<g transform="translate(18 -42) scale(1.3)"><path d="M-6 0Q-8 -10 -4 -14Q0 -16 4 -14Q8 -10 6 0Z" fill="#14151a"/><circle cx="0" cy="-17" r="4.4" fill="#14151a"/><path d="M-3.6 -20l-1 -4 3 2.4ZM3.6 -20l1 -4 -3 2.4Z" fill="#14151a"/>'
    +'<circle cx="-1.6" cy="-17.4" r=".95" fill="#d8ff3a"/><circle cx="1.6" cy="-17.4" r=".95" fill="#d8ff3a"/><g class="rabo"><path d="M6 -1Q14 -2 12 -10" stroke="#14151a" stroke-width="1.8" fill="none" stroke-linecap="round"/></g></g>',
  foodtruck:()=>'<rect x="-80" y="-86" width="160" height="70" rx="8" fill="#e85a4c"/><rect x="-56" y="-74" width="92" height="34" fill="#ffd98a"/><path d="M-62 -76h104l-8 -12h-88Z" fill="#f4efe3"/><circle cx="-50" cy="-12" r="10" fill="#1d2025"/><circle cx="50" cy="-12" r="10" fill="#1d2025"/>'
    +'<path d="M-90 -110Q0 -96 90 -110" stroke="#4a4a4a" stroke-width=".8" fill="none"/><g fill="#ffe08a">'+(()=>{let s='';for(let i=0;i<9;i++){const x=-80+i*20,y=-110+Math.sin(i/8*Math.PI)*12;s+='<circle cx="'+x+'" cy="'+f(y)+'" r="2.4"/>';}return s;})()+'</g>'+TXT(0,-46,'LANCHES',11,'#ffffff',800,70)+'<circle cx="-10" cy="-58" r="50" fill="url(#luz)"/>',
  onibus:()=>'<rect x="-44" y="-108" width="88" height="100" rx="6" fill="#e8e8e0"/><rect x="-44" y="-40" width="88" height="10" fill="#2e7d4f"/><rect x="-36" y="-98" width="72" height="44" rx="3" fill="#1b2633"/><rect x="-30" y="-106" width="60" height="7" fill="#111"/>'+TXT(0,-100.6,'CENTRO',6,'#ffb02e',800,56)
    +'<rect x="-40" y="-26" width="10" height="7" rx="2" fill="#ff3b30"/><rect x="30" y="-26" width="10" height="7" rx="2" fill="#ff3b30"/><circle cx="-35" cy="-22" r="14" fill="#ff3b30" opacity=".28"/><circle cx="35" cy="-22" r="14" fill="#ff3b30" opacity=".28"/><rect x="-40" y="-8" width="12" height="8" fill="#16191d"/><rect x="28" y="-8" width="12" height="8" fill="#16191d"/>',
  ponto:()=>'<rect x="-34" y="-84" width="68" height="6" fill="#c3c8cf"/><rect x="-32" y="-78" width="3" height="78" fill="#8a8f96"/><rect x="29" y="-78" width="3" height="78" fill="#8a8f96"/><rect x="-28" y="-74" width="56" height="50" fill="#9fd3ff" opacity=".25"/><rect x="-24" y="-30" width="48" height="4" fill="#8a6239"/>'
    +'<rect x="36" y="-112" width="22" height="18" rx="2" fill="#2e7d4f"/>'+TXT(47,-100,'BUS',7,'#ffffff',800,19)+'<rect x="45" y="-94" width="3" height="94" fill="#8a8f96"/>',
  carroF:(cor)=>'<circle cx="-22" cy="-23" r="22" fill="#fff8d8" opacity=".22"/><circle cx="22" cy="-23" r="22" fill="#fff8d8" opacity=".22"/><rect x="-31" y="-34" width="62" height="28" rx="6" fill="'+cor+'"/><path d="M-24 -34L-18 -50H18L24 -34Z" fill="'+cor+'"/><path d="M-19 -36L-15 -47H15L19 -36Z" fill="#1b2633"/>'
    +'<rect x="-28" y="-27" width="12" height="6" rx="2" fill="#fff8d8"/><rect x="16" y="-27" width="12" height="6" rx="2" fill="#fff8d8"/><rect x="-30" y="-8" width="10" height="8" fill="#16191d"/><rect x="20" y="-8" width="10" height="8" fill="#16191d"/>',
  carroN:(cor)=>SPRB.carro(cor)+'<circle cx="-22" cy="-23" r="14" fill="#ff3b30" opacity=".3"/><circle cx="22" cy="-23" r="14" fill="#ff3b30" opacity=".3"/>',
  predioN:(h,sd)=>{let a='',d='';for(let y=-h+20;y<-20;y+=30)for(let x=-70;x<70;x+=26){const r='M'+x+' '+y+'h14v18h-14Z';if(hsh(x*3+y+sd*7)<.34)a+=r;else d+=r;}
    return '<rect x="-84" y="'+(-h)+'" width="168" height="'+h+'" fill="'+['#1e2440','#232a48','#1a2038','#28243f'][sd%4]+'"/><path d="'+d+'" fill="#2a3150"/><path d="'+a+'" fill="#ffd98a"/>';},
  tunelBoca:()=>'<path fill-rule="evenodd" d="M-500 0V-300H500V0ZM-96 0V-120Q-96 -206 0 -206Q96 -206 96 -120V0Z" fill="#6f747c"/><path d="M-96 -120Q-96 -206 0 -206Q96 -206 96 -120" stroke="#ffd27a" stroke-width="3" fill="none"/><rect x="-60" y="-252" width="120" height="26" rx="3" fill="#2e7d4f"/>'+TXT(0,-234,'TÚNEL',13,'#ffffff',800,110),
  tunelParede:(sd)=>'<rect x="'+(sd>0?0:-260)+'" y="-210" width="260" height="210" fill="#2b3038"/><rect x="'+(sd>0?0:-14)+'" y="-150" width="14" height="10" fill="#ffd27a"/><rect x="'+(sd>0?0:-260)+'" y="-30" width="260" height="6" fill="#ffd27a" opacity=".55"/>',
  tunelTeto:()=>'<rect x="-400" y="-260" width="800" height="70" fill="#22262d"/><rect x="-30" y="-196" width="60" height="6" fill="#fff0c0"/>',
  borboleta:(cor)=>'<g class="asa"><path d="M0 0Q-7 -9 -9 -2Q-8 3 0 0ZM0 0Q7 -9 9 -2Q8 3 0 0Z" fill="'+cor+'"/></g><path d="M0 -3V2" stroke="#1d1d1d" stroke-width=".9"/>',
  /* efeitos de tela (coordenadas da tela 390 × 844) */
  neblina:()=>'<rect x="-20" y="190" width="430" height="360" fill="url(#nb)"/>',
  sol:()=>'<circle cx="330" cy="120" r="180" fill="url(#sl)"/><rect x="-20" y="-20" width="430" height="900" fill="#fff6d8" opacity=".1"/>',
  porDoSol:()=>'<rect x="-20" y="-20" width="430" height="900" fill="#ff9a3c" opacity=".12"/>',
  lua:()=>'<circle cx="300" cy="150" r="120" fill="url(#lu)"/><circle cx="300" cy="150" r="30" fill="#f6f1dc"/><circle cx="292" cy="142" r="6" fill="#e2dcc2"/><circle cx="310" cy="160" r="4" fill="#e2dcc2"/>',
  mosquitos:()=>{let s='';for(let i=0;i<34;i++)s+=circ((hsh(i)-.5)*120,(hsh(i+40)-.5)*90,.9+hsh(i+80)*.9);return '<path d="'+s+'" fill="#1d1f1a" opacity=".7"/>';}};

/* anda do cachorro: pernas e rabo pelo próprio relógio do objeto */
function caoAnda(o,dt,corre){o.ph=(o.ph||0)+dt*(corre?15:5);if(!o.pa){o.pa=o.g.querySelector('.pA');o.pb=o.g.querySelector('.pB');o.rb=o.g.querySelector('.rabo');o.cp=o.g.querySelector('.corpo');}
  const s=Math.sin(o.ph);o.pa.setAttribute('transform','translate(0 '+f(-Math.max(0,s)*2.6)+')');o.pb.setAttribute('transform','translate(0 '+f(-Math.max(0,-s)*2.6)+')');
  o.cp.setAttribute('transform','translate(0 '+f(-Math.abs(Math.cos(o.ph))*(corre?1.4:.5))+')');o.rb.setAttribute('transform','rotate('+f(Math.sin(o.t*15)*28)+' 0 -16.5)');}

function montaExtrasEst(){const fl=PB[CESC].flg||{};O.flg=[];const gr=O.grFlg;
  for(const t in fl)for(const sp of fl[t].c)O.flg.push({t,X0:sp[0],X1:sp[1],par:sp[3],el:el('path',Object.assign({fill:sp[2]},sp[4]?{opacity:sp[4]}:{}),gr)});
  O.fpost=el('path',{fill:'none',stroke:'#6b4a2b','stroke-width':1.8},svg);O.frail=el('path',{fill:'none',stroke:'#8a6239','stroke-width':1.6,'stroke-linejoin':'round'},svg);}

function marcosEst(c){const SEG=BK.SEG,b=Math.floor(c.z/SEG),cen=CESC,NN=QUAL==='A'?BK.N:90,P_=PB[cen];
  const ok=(i,sd)=>QUAL==='A'||hsh(i*11+(sd>0?1:0))>=(cen==='serra'?.5:.45);
  for(let i=b+4;i<b+NN-6;i++){const z=i*SEG;
    for(const sd of [-1,1]){const key='e'+i+sd;if(feitos.has(key))continue;feitos.add(key);const h=hsh(i*5+(sd>0?2:0)+cen.length*31),h2=hsh(i*7.7+(sd>0?3:1));
      if(cen==='parque'){if(i%10===(sd<0?0:5))novo(SPRE.lampiao(),sd*44,0,z);
        else if(sd<0){if(i%2===0&&h<.42&&ok(i,sd))novo(SPRB.arvore(['#4e8a3e','#5a9a46','#447c37'][i%3],i),fora(-1,-82-h2*190,.75+h2*.35,125),0,z,{k:.75+h2*.35});else if(h>.95)novo('<g>'+bancoLado(BANCO_V)+'</g>',-88,0,z,{k:2.6});else if(h>.86&&h<.9)novo(SPRE.pato(),-360-h2*300,0,z,{k:2.2});}
        else if(i%2===0&&h<.5&&ok(i,sd))novo(h2<.12?SPRB.ipe(i):h2>.9?SPRE.ipeA(i):SPRB.arvore(['#4e8a3e','#5a9a46','#447c37'][i%3],i),fora(1,72+h2*380,.75+h2*.4,125),0,z,{k:.75+h2*.4});}
      else if(cen==='orla'){if(sd>0){if(i%8===0)novo(SPRE.posteOrla(),66,0,z);else if(i%5===2&&ok(i,sd))novo(SPRB.predio(260+hsh(i)*520,['#e8dcc8','#cfd8e3','#f0e2d0','#d6e4dc'][i%4]),430+h2*110,0,z,{k:1.25});}
        else{if(h<.3&&ok(i,sd))novo(SPRE.coqueiro(i),-100-h2*50,0,z);else if(h>.7&&h<.8)novo(SPRE.guardasol(['#ff6b5c','#ffc72c','#4b9bff','#2ec27e'][i%4]),-150-h2*90,0,z);else if(h>.975)novo(SPRE.quiosque(),-150,0,z);}}
      else if(cen==='serra'){const h3=hsh(i*3.3+(sd>0?7:5));if(h3<.3&&QUAL==='A')novo(SPRB.arvore(['#2f5f2a','#355f2c','#2a5426'][i%3],i+500),sd*(360+h3*700),0,z,{k:1.3+h3});
        if(i%2===0&&h<.34&&ok(i,sd))novo(SPRB.araucaria(i*2+(sd>0?1:0)),fora(sd,sd*(60+h2*280),.8+h2*.3,145),0,z,{k:.8+h2*.3});
        else if(h<.7&&ok(i,sd))novo(SPRB.arvore(['#3f7a35','#4e8a3e','#2f6b2c'][i%3],i),fora(sd,sd*(48+h2*240),.7+h2*.4,125),0,z,{k:.7+h2*.4});
        else if(h>.72&&h<.92)novo(SPRE.samambaia(i*3+(sd>0?1:0)),sd*(56+h2*12),0,z,{k:1.3});else if(h>.97)novo(SPRE.rocha(),fora(sd,sd*(40+h2*40),1+h2,38,12),0,z,{k:1+h2});}
      else if(cen==='cidade'){if(sd<0){if(i%6===0)novo(SPRE.posteN(),-54,0,z,{esp:1});}
        else{if(i%5===0)novo(SPRE.predioN(260+hsh(i)*520,i),196+h2*30,0,z,{k:1.25});else if(i%5===3&&h<.6&&ok(i,sd))novo(SPRB.arvore('#2f5a3a',i),104,0,z,{k:.66});}}}}
  /* marco de distância a cada 250 m */
  const mU=250/.03;for(let k=Math.ceil((c.z+300)/mU);k*mU<c.z+NN*SEG-200&&k*mU<LTOTE;k++){const key='m'+k;if(feitos.has(key))continue;feitos.add(key);novo(SPRB.km(String(k*.25).replace('.',',')),P_.marco,0,k*mU,{k:1.2});}
  /* trânsito: na orla e na cidade, carros nos dois sentidos */
  if((cen==='cidade'||cen==='orla')&&Math.random()<.014){const ida=Math.random()<.5,cor=['#e8eaee','#2b3036','#d4433a','#4b9bff','#9aa3ad'][Math.floor(Math.random()*5)];
    if(cen==='cidade')ida?novo(SPRE.carroN(cor),[-215,-255][Math.floor(Math.random()*2)],0,c.z+40,{vz:VE()+rnd(300,420),k:1.1}):novo(SPRE.carroF(cor),[-280,-310][Math.floor(Math.random()*2)],0,c.z+3600,{vz:-rnd(300,420),k:1.1});
    else ida?novo(SPRB.carro(cor),[180,210][Math.floor(Math.random()*2)],0,c.z+40,{vz:VE()+rnd(300,420),k:1.1}):novo(SPRE.carroF(cor),[290,320][Math.floor(Math.random()*2)],0,c.z+3600,{vz:-rnd(300,420),k:1.1});}}

/* elementos que só a esteira tem; devolve true quando tratou o evento */
function poeEst(spr,placa,z0,vel){const cen=CESC,RL=PB[cen].RL,lado=()=>Math.random()<.5?-1:1;
  switch(spr){
    case 'portao':novo(SPRB.portal(placa),0,0,z0);return 1;
    case 'garca':novo(SPRE.garca(),-312,0,z0,{k:2.4});novo(SPRE.garca(),-336,0,z0+50,{k:2.4,esp:1});for(let i=0;i<2;i++)novo(SPRE.garcaVoo(),rnd(-220,-90),rnd(110,170),z0+rnd(0,200),{k:3.2,plana:1,bat:rnd(5,7),vz:vel*.4,vx:rnd(10,20)});return 1;
    case 'ipes':for(let i=0;i<8;i++){const sd=i%2?1:-1;novo(i%4<2?SPRB.ipe(seq+i):SPRE.ipeA(seq+i),fora(sd,sd*rnd(64,110),.9,125),0,z0+Math.floor(i/2)*120,{k:rnd(.8,1)});}return 1;
    case 'caramelo':{const o=novo(SPRE.cao(),RL+22,0,DIST+520,{k:1.1});o.upd=(oo,dt,v)=>{if(!oo.junto&&oo.zc<BK.D+46){oo.junto=1;oo.t0=oo.t;}
      const ac=oo.junto&&oo.t-oo.t0>22;oo.vz=oo.junto?(ac?v*1.6:v*(1+.06*Math.sin(oo.t*.8))):0;caoAnda(oo,dt,oo.junto);};return 1;}
    case 'corrida-caramelo':{const o=novo(SPRE.cao(),RL+20,0,DIST-10,{k:1.1,vz:vel*1.45});o.upd=(oo,dt)=>caoAnda(oo,dt,1);return 1;}
    case 'ponte-lago':case 'ponte-riacho':marca_(Math.floor(z0/BK.SEG),cen==='serra'?10:14,'madeira');return 1;
    case 'pensil':marca_(Math.floor(z0/BK.SEG),16,'madeira');novo(SPRE.pontePensil(),0,0,z0);return 1;
    case 'pinguela':marca_(Math.floor(z0/BK.SEG),6,'pinguela');return 1;
    case 'volta':novo(SPRB.placaEv(placa),PB[cen].dirP+10,0,z0);forma({z0,c:2.4*lado(),len:80});return 1;
    case 'coreto':novo(SPRE.coreto(),-200,0,z0+(placa?200:0));if(placa)novo(SPRB.placaEv(placa),PB[cen].dirP+10,0,z0);return 1;
    case 'banco':novo('<g>'+bancoLado(BANCO_V)+'</g>',-88,0,z0,{k:2.6});return 1;
    case 'sombra':for(let i=0;i<6;i++){const sd=i%2?1:-1;novo(cen==='orla'?SPRE.coqueiro(seq+i):SPRB.arvore('#447c37',seq+i),fora(sd*(cen==='orla'&&sd>0?-1:1),sd*(cen==='orla'?rnd(70,90):rnd(46,64))*(cen==='orla'&&sd>0?-1.6:1),cen==='orla'?1:1.1,cen==='orla'?78:125),0,z0+Math.floor(i/2)*90,{k:cen==='orla'?1:1.1});}
      marca_(Math.floor(z0/BK.SEG)-1,8,'sombra');return 1;
    case 'bebedouro':novo(SPRE.bebedouro(),52,0,z0,{k:1.3});return 1;
    case 'quiosque':novo(SPRE.quiosque(),-160,0,z0);return 1;
    case 'posto-sv':novo(SPRE.postoSV(placa||'POSTO 6'),-210,0,z0);return 1;
    case 'pier':novo(SPRE.pier(),-860,0,z0+300);novo(SPRB.placaEv('PÍER'),-128,0,z0);return 1;
    case 'vento-favor':rajada('vento',3.2,.6);
    case 'gaivotas':for(let i=0;i<6;i++)novo(SPR.gaivota(),rnd(-260,60),rnd(170,270),z0+rnd(-100,300),{k:2.8,plana:1,bat:rnd(5,8),vz:vel*.4,vx:rnd(-10,10)});return 1;
    case 'rede':novo(SPRE.rede(),-220,0,z0);return 1;
    case 'farol':novo(SPRE.farolE(),-1400,0,z0+3400,{k:1.4});return 1;
    case 'farol-perto':novo(SPRE.farolE(),-640,0,z0+900);return 1;
    case 'areia':novo(SPRB.placaEv(placa),PB[cen].dirP+10,0,z0);marca_(Math.floor(z0/BK.SEG)+2,24,'areia');return 1;
    case 'sol':novo(SPRE.sol(),0,0,0,{tela:1,sc:1,vida:12});return 1;
    case 'por-do-sol':novo(SPRE.porDoSol(),0,0,0,{tela:1,sc:1,vida:10});novo('<g>'+bancoLado(BANCO_V)+'</g>',-120,0,z0,{k:2.6});return 1;
    case 'neblina':novo(SPRE.neblina(),0,0,0,{tela:1,sc:1,vida:16});return 1;
    case 'lua':novo(SPRE.lua(),0,0,0,{tela:1,sc:1,vida:10});return 1;
    case 'mosquitos':{const o=novo(SPRE.mosquitos(),195,470,0,{tela:1,sc:1,vida:9});o.upd=(oo)=>{oo.X=195+Math.sin(oo.t*2.1)*40+Math.sin(oo.t*5.3)*8;oo.Y=440+Math.cos(oo.t*1.7)*30;oo.rot=Math.sin(oo.t*3)*8;};return 1;}
    case 'capivara':novo(SPRE.capivara(),-62,0,z0,{k:1.8});novo(SPRE.capivara(),-92,0,z0+40,{k:1.1,esp:1});return 1;
    case 'tucano':novo(SPRB.tucano(),cen==='serra'?96:178,0,z0);return 1;
    case 'raizes':for(let i=0;i<9;i++)novo(SPRE.raiz(),rnd(-6,6),0,z0+i*55,{k:.8,esp:Math.random()<.5});return 1;
    case 'estreita':for(let i=0;i<14;i++){const sd=i%2?1:-1;novo(SPRE.samambaia(seq+i),sd*rnd(18,24),0,z0+Math.floor(i/2)*45,{k:1.6});}return 1;
    case 'barro':marca_(Math.floor(z0/BK.SEG),12,'barro');for(let i=0;i<4;i++)novo(SPRE.poca(),rnd(-10,10),0,z0+30+i*110,{k:1});return 1;
    case 'pedras':for(let i=0;i<6;i++){const sd=i%2?1:-1;novo(SPRE.rocha(),sd*rnd(26,50),0,z0+i*60,{k:rnd(1,1.8)});}novo(SPRB.placaEv(placa),PB[cen].dirP+10,0,z0);return 1;
    case 'cachoeira':novo(SPRE.cachoeira(),-280,0,z0+200,{upd:(o)=>{o.ag=o.ag||o.g.querySelector('.agua');o.ag.setAttribute('stroke-dashoffset',f(-o.t*70));}});novo(SPRB.placaEv(placa),PB[cen].dirP+10,0,z0);return 1;
    case 'refugio':novo(SPRE.refugio(),-170,0,z0);return 1;
    case 'gato':{const o=novo(SPRE.gatoMuro(),124,0,z0);o.upd=(oo)=>{oo.rb=oo.rb||oo.g.querySelector('.rabo');oo.rb.setAttribute('transform','rotate('+f(Math.sin(oo.t*2.2)*14)+' 6 -1)');};return 1;}
    case 'foodtruck':novo(SPRE.foodtruck(),cen==='cidade'?-150:(cen==='orla'?-150:110),0,z0);return 1;
    case 'banca':novo(SPRB.banca(),126,0,z0,{k:.9});return 1;
    case 'praca':novo(SPRB.praca(),cen==='cidade'?150:-90,0,z0);return 1;
    case 'onibus':{const zp=z0+120;novo(SPRE.ponto(),-112,0,zp);novo(SPRE.onibus(),-190,0,DIST-30,{vz:vel+rnd(250,320),upd:(o)=>{if(o.z>=zp+40){o.z=zp+40;o.vz=0;}}});return 1;}
    case 'tunel':{const Lt=440;novo(SPRE.tunelBoca(),0,0,z0);for(let k=40;k<Lt;k+=40){novo(SPRE.tunelParede(1),70,0,z0+k);novo(SPRE.tunelParede(-1),-70,0,z0+k);if(k%80===0)novo(SPRE.tunelTeto(),0,0,z0+k);}return 1;}
    case 'borboleta':for(let i=0;i<3;i++)novo(SPRE.borboleta(['#ffc72c','#ff8fb8','#4b9bff'][i]),RL+rnd(-40,40),rnd(30,70),DIST+rnd(150,400),{k:.85,bat:rnd(16,22),vz:vel*.85,vx:rnd(-12,12)});return 1;
    case 'corredor':outroCorredor(RL-24,DIST-14,{vz:vel*1.35});return 1;}
  return 0;}

const EVSE={
  parque:{partida:[['Portão do parque','portao','PARQUE DA CIDADE'],['Pista do lago','placa','PISTA 3 km'],['Bosque','passaros']],
    exploracao:[['Lago das garças','garca'],['Alameda dos ipês','ipes'],['Um caramelo','caramelo']],
    desafio:[['Pista de cooper','placa','COOPER 400 m',0,'plano'],['Vento contra','vento',0,0,'plano'],['Corrida do caramelo','corrida-caramelo',0,0,'plano'],['Ponte do lago','ponte-lago',0,0,'plano'],['Volta do lago','volta','VOLTA DO LAGO',0,'plano'],['Reta da alameda','placa','RETA 300 m',0,'plano'],
      ['Ladeira do coreto','coreto','CORETO ↑',0,'sobe'],['Subida do bosque','placa','BOSQUE ↑',0,'sobe'],['Rampa do anfiteatro','placa','ANFITEATRO ↑',0,'sobe'],['Morro do parquinho','placa','MORRO ↑',0,'sobe']],
    climax:[['Reta final','placa','FALTAM 200 m',0,'plano'],['Último quilômetro','placa','ÚLTIMO KM',0,'plano'],['Chegada no coreto','coreto','CORETO 100 m',0,'plano'],['Subida do mirante','placa','MIRANTE 100 m',0,'sobe'],['Topo da colina','placa','COLINA ↑',0,'sobe'],['Alto do parque','placa','ALTO ↑',0,'sobe']],
    alivio:[['Sombra','sombra'],['Bebedouro','bebedouro']],
    chegada:[['Banco do lago','banco'],['Coreto','coreto'],['Saída do parque','portao','SAÍDA']]},
  orla:{partida:[['Calçadão','quiosque'],['Posto 6','posto-sv','POSTO 6'],['Píer','pier',0,1]],
    exploracao:[['Água de coco','quiosque'],['Gaivotas','gaivotas'],['Vôlei na areia','rede']],
    desafio:[['Vento no píer','vento',0,0,'plano'],['Rumo ao farol','farol',0,0,'plano'],['Areia fofa','areia','AREIA FOFA',1,'plano'],['Bando de gaivotas','gaivotas',0,0,'plano'],['Trecho sem sombra','sol',0,1,'plano'],['Reta do calçadão','placa','RETA 500 m',0,'plano'],
      ['Ladeira do mirante','placa','MIRANTE ↑',0,'sobe'],['Subida da pedra','placa','PEDRA ↑',0,'sobe'],['Rampa do forte','placa','FORTE ↑',0,'sobe'],['Morro da praia','placa','MORRO ↑',0,'sobe']],
    climax:[['Ponta da praia','placa','PONTA 200 m',0,'plano'],['Farol da barra','farol-perto',0,0,'plano'],['Último posto','posto-sv','POSTO 1',0,'plano'],['Pedra do mirante','placa','MIRANTE 100 m',0,'sobe'],['Topo do morro','placa','MORRO ↑',0,'sobe'],['Mirante do forte','placa','FORTE ↑',0,'sobe']],
    alivio:[['Vento a favor','vento-favor'],['Sombra','sombra']],
    chegada:[['Pôr do sol','por-do-sol'],['Quiosque','quiosque'],['Fim do calçadão','placa','FIM']]},
  serra:{partida:[['Início da trilha','placa','TRILHA 5 km'],['Portal da mata','portao','PARQUE'],['Neblina baixa','neblina',0,1]],
    exploracao:[['Capivara','capivara'],['Tucano','tucano'],['Ponte do riacho','ponte-riacho']],
    desafio:[['Raízes','raizes',0,1,'plano'],['Trilha estreita','estreita',0,1,'plano'],['Pinguela do rio','pinguela',0,0,'plano'],['Barro na trilha','barro',0,1,'plano'],['Cascalho','cascalho',0,0,'plano'],['Nuvem de mosquitos','mosquitos',0,1,'plano'],
      ['Subida de pedra','pedras','SUBIDA ↑',0,'sobe'],['Cachoeira','cachoeira','CACHOEIRA ↑',0,'sobe'],['Ladeira das araucárias','araucarias',0,0,'sobe'],['Morro do tucano','tucano',0,0,'sobe']],
    climax:[['Reta da trilha','placa','FALTAM 200 m',0,'plano'],['Portal do parque','portao','PORTAL 100 m',0,'plano'],['Ponte pênsil','pensil',0,0,'plano'],['O cume','placa','CUME 100 m',0,'sobe'],['Pico da serra','placa','PICO ↑',0,'sobe'],['Pedra grande','pedras','PEDRA 50 m',0,'sobe']],
    alivio:[['Trecho plano','passaros'],['Mirante do vale','mirante']],
    chegada:[['Vista do alto','mirante'],['Refúgio','refugio'],['Descida ao vale','descida']]},
  cidade:{partida:[['Avenida acesa','placa','AV. CENTRAL'],['Praça da matriz','praca'],['Centro iluminado','placa','CENTRO']],
    exploracao:[['Banca de revista','banca'],['Gato no muro','gato'],['Food truck','foodtruck']],
    desafio:[['Sinal verde','sinal-verde',0,0,'plano'],['Túnel','tunel',0,1,'plano'],['Atravessa a avenida','sinal-verde',0,0,'plano'],['Vento entre prédios','vento',0,0,'plano'],['Calçadão do centro','placa','CALÇADÃO 400 m',0,'plano'],['Ônibus chegando','onibus',0,0,'plano'],
      ['Viaduto','viaduto',0,0,'sobe'],['Rua da ladeira','placa','LADEIRA ↑',0,'sobe'],['Rampa da passarela','placa','PASSARELA ↑',0,'sobe'],['Ladeira do centro','placa','CENTRO ↑',0,'sobe']],
    climax:[['Ponte estaiada','ponte',0,0,'plano'],['Reta final','placa','FALTAM 200 m',0,'plano'],['Última quadra','placa','ÚLTIMA QUADRA',0,'plano'],['Mirante da cidade','placa','MIRANTE ↑',0,'sobe'],['Topo do viaduto','viaduto',0,0,'sobe'],['Alto da colina','placa','COLINA ↑',0,'sobe']],
    alivio:[['Praça','praca'],['Sinal vermelho','sinal-vermelho']],
    chegada:[['Lua cheia','lua'],['Lanche da noite','foodtruck'],['Fim da avenida','placa','FIM']]}};
/* caminhada inclinada só sorteia as subidas; caminhada e trote, só os trechos planos (como no app) */
const evsE=()=>{const o={};for(const c in EVSE){o[c]={};for(const p in EVSE[c])o[c][p]=EVSE[c][p].filter(e=>!e[4]||(EX==='incl'?e[4]==='sobe':e[4]!=='sobe'));}return o;};
/* SIMULAÇÃO (só teste, #destreal=1): destino em escala real (perspectiva pura) + luz pequena visível de longe */
const DREAL=false;
/* escala do destino: o tamanho "de leitura" (s0→s1) cresce de forma suave até bater com a perspectiva real exatamente na chegada.
   Antes era max(perspectiva, tamanho de leitura): o destino ficava parado em ~0,4 e, a ~700 un da chegada, a perspectiva assumia de
   repente e ele crescia 1,7× e descia ~25 px em ~10 s (o "baixou"). Agora o ganho começa a ~2.500 un e vai com t². */
function destSfn(d,fim){return DREAL?(zc=>BK.f/zc):(zc=>{const sL=d.s0+(d.s1-d.s0)*Math.max(0,Math.min(1,DIST/fim)),zE=300+BK.D,pE=BK.f/zE,t=Math.max(0,Math.min(1,(2500-zc)/(2500-zE)));return Math.max(BK.f/zc,sL*(1+Math.max(0,pE/sL-1)*t*t));});}
function destBaliza(o){if(!DREAL)return o;const bb=o.g.getBBox(),topo=-bb.y;novo('<circle r="60" fill="url(#luz)"/><circle r="9" fill="#fff4c4"/>',0,topo+8,o.z,{dest:1,limX:1,sfn:zc=>Math.max(BK.f/zc,.3)});return o;}
/* posição dos objetos: nada sólido invade o caminho nem passa por dentro do boneco.
   w = meia-largura da copa/objeto (em unidades do sprite, medida na varredura de todos os objetos); min = folga do caminho.
   fora(lado, X, k, w, min) devolve um X que tem pelo menos min + k·w de distância do centro. */
const fora=(lado,X,k,w,min)=>lado*Math.max(Math.abs(X),(min==null?24:min)+k*w);
const DESTE={
  parque:{s0:.08,s1:.4,svg:()=>SPRE.coreto()+'<g transform="translate(-170 0)">'+SPRB.arvore('#4e8a3e',3)+'</g><g transform="translate(170 0)">'+SPRB.ipe(5)+'</g>'},
  /* sem sol próprio: o sol do céu já faz o pôr do sol (e some na chuva); um sol aqui ficava na frente dos prédios do fundo */
  orla:{s0:.07,s1:.36,svg:()=>SPRE.farolE()},
  serra:{s0:.07,s1:.36,svg:()=>'<path d="M-640 40L-220 -280L-40 -200L240 -360L660 40Z" fill="#7d8f9e"/><path d="M240 -360L200 -300L250 -310L290 -290Z" fill="#9aa5ae"/>'+'<g transform="translate(0 6)">'+SPRE.refugio()+'</g>'},
  /* sem o halo de luz em volta da ponte: ele ficava na frente dos prédios do fundo, como um raio de sol */
  cidade:{s0:.07,s1:.34,svg:()=>SPRB.ponte()}};
function criaDestinoEst(){const d=DESTE[CESC];return destBaliza(novo(d.svg(),0,0,LTOTE+300,{dest:1,limX:1,sfn:destSfn(d,LTOTE)}));}

/* ---------- partículas leves: desenhadas dentro da cena, no mesmo quadro (2 caminhos no total).
   Medido: como camada animada à parte, custavam +10 a 15 pontos de CPU; aqui ficam quase de graça. ---------- */
const PART={neve:'neve',aurora:'neve',dunas:'areia',estrada:'polen',ciclovia:'poeira',campo:'polen',predio:'bokeh',farol:'spray',montanha:'polen',parque:'folhas',orla:'spray',serra:'luz',cidade:'bokeh'};
const PTC={neve:['#ffffff','#ffffff',.85],areia:['#e6d3a8','#f2e6c8',.6],polen:['#fff2b8','#fff7d6',.75],poeira:['#ffffff','#ffffff',.6],bokeh:['#ffd68c','#ffe6b0',.16],spray:['#f4fbff','#ffffff',.8],luz:['#fff1c2','#fff8e0',.7],folhas:['#a957a9','#f2c230',.95]};
let PT=[],ptG=null,partR=1;
function partMonta(){PT=[];ptG=null;if(QUAL==='C'||reduz)return;const tipo=PART[CESC];if(!tipo)return;const c=PTC[tipo],cor=tipo==='folhas'||tipo==='bokeh';
  const bk0=tipo==='bokeh';ptG={tipo,cor:cor&&!bk0,a:el('path',{fill:c[0],opacity:cor?c[2]:c[2]*.4},svg),b:el('path',{fill:c[1],opacity:c[2]},svg)};
  const n=QUAL==='A'?16:12,fo=tipo==='folhas',bk=tipo==='bokeh';
  for(let i=0;i<n;i++)PT.push({a:rnd(0,TAU),r0:rnd(14,70),t:Math.random(),d:(bk?5.2:fo?3.8:3)*rnd(.8,1.25),sz:bk?rnd(6,10):fo?rnd(4.5,6.5):tipo==='luz'||tipo==='neve'?rnd(1.6,2.6):rnd(1.2,2.2),
    rot:fo?rnd(-9,9):0,sw:fo||tipo==='neve'?rnd(12,26):0,cai:fo?rnd(80,180):tipo==='neve'?rnd(140,240):tipo==='spray'?-rnd(15,60):0,k:i%2});}
function partQuadro(dt){if(!ptG)return;const vx=195,vy=MAQ==='escada'?211:312,R=560;let A='',B='';
  for(const p of PT){p.t+=dt*partR/p.d;if(p.t>=1){p.t-=1;p.a=rnd(0,TAU);}const t=p.t,rr=p.r0+(R-p.r0)*t*t,x=vx+Math.cos(p.a)*rr+Math.sin(t*TAU*1.5)*p.sw,y=vy+Math.sin(p.a)*rr*.8+p.cai*t,r=p.sz*(.35+1.5*t*t);
    let d;if(ptG.tipo==='folhas'){const an=p.rot*t,c=Math.cos(an),s=Math.sin(an),L=r,W=r*.45;d='M'+f(x+c*L)+' '+f(y+s*L)+'L'+f(x-s*W)+' '+f(y+c*W)+'L'+f(x-c*L)+' '+f(y-s*L)+'L'+f(x+s*W)+' '+f(y-c*W)+'Z';}
    else if(ptG.tipo==='bokeh'){A+=circ(x,y,r);B+=circ(x,y,r*.55);continue;}
    else d=circ(x,y,r);
    if(ptG.cor?p.k:(t>.12&&t<.88))B+=d;else A+=d;}
  ptG.a.setAttribute('d',A);ptG.b.setAttribute('d',B);}
function partRitmo(){const ref=MAQ==='bike'?VELB[3]:MAQ==='esteira'?EXS[EX].kmh[3]/3.6/.03:MAQ==='eliptico'?ELI[eliTipo()].kmh[3]/3.6/.03:PASSOS[3],v=ff?ffVel:(MAQ==='escada'?PASSOS[Z]:velM());
  partR=Math.max(.6,Math.min(2.6,Math.pow(v/ref,.75)));}

/* ---------- céu que passa o dia: amanhecer → dia → tarde dourada → pôr do sol (noite na cidade e no prédio),
   as mesmas paletas da versão 2D, levadas pelo progresso do cardio ---------- */
const PALS={"PARQUE": [{"c1": "#15203f", "c2": "#5a4f86", "c3": "#f2a37c", "sol": "#ffd7a3", "nuvem": "#b98aa8"}, {"c1": "#1f5a94", "c2": "#5ea3cf", "c3": "#bfe3e6", "sol": "#fff3d1", "nuvem": "#eaf4f7"}, {"c1": "#2b4f8c", "c2": "#d79a6a", "c3": "#f4cf91", "sol": "#ffe0a0", "nuvem": "#f6d6b0"}, {"c1": "#24173f", "c2": "#a3416a", "c3": "#f08446", "sol": "#ffa05c", "nuvem": "#d0627a"}], "ORLA": [{"c1": "#172245", "c2": "#6a5c95", "c3": "#f6b088", "sol": "#ffd9a6", "nuvem": "#c296b0"}, {"c1": "#1665a6", "c2": "#4fb0dc", "c3": "#c5ecf0", "sol": "#fff6d8", "nuvem": "#f2fafc"}, {"c1": "#285a96", "c2": "#e0a46e", "c3": "#f8d79a", "sol": "#ffe3a3", "nuvem": "#f7d8b2"}, {"c1": "#221640", "c2": "#b04466", "c3": "#f58848", "sol": "#ffa35e", "nuvem": "#d4637a"}], "SERRA": [{"c1": "#131c35", "c2": "#4a5a86", "c3": "#e5a487", "sol": "#ffd2a6", "nuvem": "#a9a6c4"}, {"c1": "#1a5288", "c2": "#5f9cc6", "c3": "#cfe4e2", "sol": "#fff4d6", "nuvem": "#e8f1f1"}, {"c1": "#2b4c84", "c2": "#c99772", "c3": "#efd2a2", "sol": "#ffe1a6", "nuvem": "#f0dcc6"}, {"c1": "#1d1638", "c2": "#8e3f6e", "c3": "#ea7d4c", "sol": "#ff9c5e", "nuvem": "#b56a8a"}], "CIDADE": [{"c1": "#1e2350", "c2": "#7a4f86", "c3": "#f29a6a", "sol": "#fff1d6", "nuvem": "#b07a98", "estrela": 0.1}, {"c1": "#141a40", "c2": "#3d3f78", "c3": "#b0627a", "sol": "#f6f1e0", "nuvem": "#5e5486", "estrela": 0.45}, {"c1": "#0a0f26", "c2": "#18224a", "c3": "#3a3f6e", "sol": "#eef0f6", "nuvem": "#2e3560", "estrela": 0.9}, {"c1": "#070a1c", "c2": "#121a3a", "c3": "#2a2f58", "sol": "#e4e8f2", "nuvem": "#262c52", "estrela": 1.0}], "CICLOVIA": [{"c1": "#1a2448", "c2": "#6a5a90", "c3": "#f2a882", "sol": "#ffd8a8", "nuvem": "#c094ae"}, {"c1": "#1d5c98", "c2": "#5aa6d2", "c3": "#c4e4ea", "sol": "#fff4d4", "nuvem": "#eef6f8"}, {"c1": "#2c5089", "c2": "#d89c6c", "c3": "#f4d092", "sol": "#ffe2a4", "nuvem": "#f4d8b6"}, {"c1": "#241840", "c2": "#a8446a", "c3": "#f28848", "sol": "#ffa25c", "nuvem": "#d2647a"}], "CAMPO": [{"c1": "#1b2346", "c2": "#6a5a8c", "c3": "#f4ac7e", "sol": "#ffd8a4", "nuvem": "#c49aae"}, {"c1": "#2468a6", "c2": "#62b0dc", "c3": "#d2ecee", "sol": "#fff6d6", "nuvem": "#f4fafb"}, {"c1": "#2e568e", "c2": "#e0a46c", "c3": "#f8d896", "sol": "#ffe4a2", "nuvem": "#f8dcb4"}, {"c1": "#241840", "c2": "#a8446a", "c3": "#f28848", "sol": "#ffa25c", "nuvem": "#d2647a"}], "NEVE": [{"c1": "#18203f", "c2": "#5c5a8e", "c3": "#eaa38e", "sol": "#ffd8b0", "nuvem": "#b8a4c4"}, {"c1": "#1b5a96", "c2": "#66a8d6", "c3": "#dbeef4", "sol": "#fffbea", "nuvem": "#f6fbfc"}, {"c1": "#2c4f8a", "c2": "#c99a86", "c3": "#f2d8c2", "sol": "#ffe8c4", "nuvem": "#f4e0d2"}, {"c1": "#1e1638", "c2": "#8a3e6e", "c3": "#e8805a", "sol": "#ffa268", "nuvem": "#b46a8a"}], "AURORA": [{"c1": "#141a3c", "c2": "#3e4a7e", "c3": "#9e7a9a", "sol": "#f4f1e4", "nuvem": "#4a5480", "estrela": 0.3, "aurora": 0.15}, {"c1": "#0b1230", "c2": "#1e2e58", "c3": "#3e5a7e", "sol": "#eef0f4", "nuvem": "#2e3a64", "estrela": 0.75, "aurora": 0.6}, {"c1": "#060b22", "c2": "#11204a", "c3": "#234a6a", "sol": "#e8ecf4", "nuvem": "#1e2c52", "estrela": 1.0, "aurora": 1.0}, {"c1": "#050a1c", "c2": "#0e1a3e", "c3": "#1d3c5e", "sol": "#e4e8f0", "nuvem": "#18244a", "estrela": 1.0, "aurora": 0.85}], "DUNAS": [{"c1": "#1a2448", "c2": "#6a5c92", "c3": "#f6b088", "sol": "#ffd8a6", "nuvem": "#c49aae"}, {"c1": "#1466a8", "c2": "#48b2e0", "c3": "#c8eef2", "sol": "#fff8dc", "nuvem": "#f6fcfd"}, {"c1": "#2a5a96", "c2": "#e2a46c", "c3": "#fad896", "sol": "#ffe4a2", "nuvem": "#f8dcb4"}, {"c1": "#241840", "c2": "#b04466", "c3": "#f58848", "sol": "#ffa35e", "nuvem": "#d4637a"}]};
const PALDE={neve:'NEVE',aurora:'AURORA',dunas:'DUNAS',parque:'PARQUE',orla:'ORLA',serra:'SERRA',cidade:'CIDADE',estrada:'SERRA',ciclovia:'CICLOVIA',campo:'CAMPO',predio:'CIDADE',farol:'ORLA',montanha:'SERRA'};
const NOITE={cidade:1,predio:1,aurora:1},SOLDIR={orla:-1};
const mixC=(a,b,t)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);return hx((A>>16)+((B>>16)-(A>>16))*t,((A>>8)&255)+(((B>>8)&255)-((A>>8)&255))*t,(A&255)+((B&255)-(A&255))*t);};
const PARADAS_C=[0,.34,.68,1],TINT_A=[.2,0,.1,.2],TINT_N=[.06,.12,.18,.22];
function paletaC(p){const L=PALS[PALDE[CESC]];p=Math.max(0,Math.min(1,p));let i=0;while(i<2&&p>PARADAS_C[i+1])i++;const t=(p-PARADAS_C[i])/(PARADAS_C[i+1]-PARADAS_C[i]),A=L[i],B=L[i+1],o={};
  for(const k of ['c1','c2','c3','sol','nuvem'])o[k]=mixC(A[k],B[k],t);o.c1=mixC(o.c1,o.c2,.14);
  const TA=NOITE[CESC]?TINT_N:TINT_A;o.ta=TA[i]+(TA[i+1]-TA[i])*t;const sombra=[.45,0,.1,.45];o.tc=mixC(mixC(A.c2,'#1c1626',sombra[i]),mixC(B.c2,'#1c1626',sombra[i+1]),t);o.est=(A.estrela||0)+((B.estrela||0)-(A.estrela||0))*t;return o;}
let CEU=null,NUVX=0;
function ceuMonta(){const esc=MAQ==='escada',H0=esc?402:312,noite=!!NOITE[CESC],defs=svg.querySelector('defs');
  const gr=document.createElementNS(NS,'radialGradient');gr.id='solg';gr.innerHTML='<stop offset="0" stop-opacity=".75"/><stop offset=".35" stop-opacity=".28"/><stop offset="1" stop-opacity="0"/>';defs.appendChild(gr);
  const tg=document.createElementNS(NS,'linearGradient');tg.id='tng';tg.setAttribute('gradientUnits','userSpaceOnUse');tg.setAttribute('x1',0);tg.setAttribute('x2',0);tg.setAttribute('y1',H0-150);tg.setAttribute('y2',H0-10);
  tg.innerHTML='<stop offset="0" stop-opacity="0"/><stop offset="1" stop-opacity="1"/>';defs.appendChild(tg);
  const ceuR=svg.querySelector('rect[fill="url(#cg)"]'),g=el('g',{}),nv=el('g',{});ceuR.after(g);g.after(nv);
  const sg=el('circle',{r:90,fill:'url(#solg)'},g),sd=el('circle',{r:17},g);if(noite)g.setAttribute('display','none');
  /* nuvens grandes (160–260 px), em 2 tons, numa faixa que se repete a cada 390 px */
  let a='',b='';const sd0=CESC.length*3.7;
  for(let k=0;k<3;k++){const cx=40+k*130+hsh(sd0+k)*40,cy=(esc?90:70)+hsh(sd0+k+9)*(esc?150:120),W=80+hsh(sd0+k+3)*50,Hh=W*.2;
    for(const dx of [0,390,-390]){const x=cx+dx;b+=elp(x,cy+Hh*.55,W,Hh*.9);a+=elp(x,cy,W*.92,Hh)+elp(x-W*.38,cy-Hh*.7,W*.36,Hh*1.25)+elp(x+W*.12,cy-Hh*1.1,W*.42,Hh*1.6)+elp(x+W*.52,cy-Hh*.45,W*.3,Hh*1.05);}}
  const nb=el('path',{d:b},nv),na=el('path',{d:a},nv);nv.setAttribute('opacity',noite?.45:.92);
  let gl=null;if(CESC==='farol'||CESC==='orla'){gl=el('path',{});if(esc){const hz=svg.querySelector('#horiz');hz.after(gl);}else svg.insertBefore(gl,L.objF);}
  const tr=el('rect',{x:-20,y:H0-150,width:430,height:1000,fill:'url(#tng)'});
  (!esc&&L.horiz?svg.insertBefore(tr,L.horiz):svg.appendChild(tr));
  CEU={esc,H0,noite,stops:[...svg.querySelectorAll('#cg stop')],gs:[...gr.querySelectorAll('stop')],ts:[...tg.querySelectorAll('stop')],gl,g,sg,sd,nv,na,nb,tr,est:svg.querySelector('#est')};
  const so=CEU.stops;if(esc){so[1].setAttribute('offset','.3');so[2].setAttribute('offset','.47');}else{so[1].setAttribute('offset','.58');so[2].setAttribute('offset','.95');}
  ceuCor(true);ceuQuadro(0);}
let ceuP=-1;
function ceuCor(forca){if(!CEU)return;const p=M().prog();if(!forca&&Math.abs(p-ceuP)<.002)return;ceuP=p;const o=climaPal(paletaC(p)),C=CEU;
  C.stops[0].setAttribute('stop-color',o.c1);C.stops[1].setAttribute('stop-color',o.c2);C.stops[2].setAttribute('stop-color',o.c3);
  C.na.setAttribute('fill',o.nuvem);C.nb.setAttribute('fill',mixC(o.nuvem,o.c2,.35));
  for(const s of C.ts)s.setAttribute('stop-color',o.tc);C.tr.setAttribute('opacity',f(o.ta*100)/100);
  if(C.est)C.est.setAttribute('opacity',f((C.noite?.25+.75*o.est:0)*100)/100);
  if(!C.noite){const dir=SOLDIR[CESC]||1,sn=Math.sin(Math.PI*p),x=195-dir*150*Math.cos(Math.PI*p),y=C.H0-12-(C.H0-108)*sn;
    C.sd.setAttribute('cx',f(x));C.sd.setAttribute('cy',f(y));C.sd.setAttribute('fill',o.sol);C.sg.setAttribute('cx',f(x));C.sg.setAttribute('cy',f(y));C.sg.setAttribute('r',f(90+90*(1-sn)));
    for(const s of C.gs)s.setAttribute('stop-color',mixC(o.sol,o.c3,.3));
    /* reflexo do sol no mar quando ele está baixo */
    if(C.gl){const am=CESC==='orla'&&x>150?0:Math.max(0,1-sn*1.5);let d='';if(am>.02)for(let k=0;k<9;k++){const yy=C.H0+3+k*k*1.8,w=(26-k*1.6)*(.6+.4*hsh(k+1));d+='M'+f(x-w)+' '+f(yy)+'h'+f(2*w)+'v'+f(1.4+k*.35)+'h'+f(-2*w)+'Z';}
      C.gl.setAttribute('d',d);C.gl.setAttribute('fill',mixC(o.sol,'#ffffff',.2));C.gl.setAttribute('opacity',f(am*80)/100);}}climaCor(o);}
function ceuQuadro(dt){if(!CEU)return;auroraQuadro(dt);NUVX+=dt*4*(CL?CL.vn:1);const px=(MAQ==='escada'?0:BGX*.22)-NUVX;CEU.nv.setAttribute('transform','translate('+f(((px%390)+390)%390-390)+' 0)');
  if(CEU.nv2){const q=px*1.35;CEU.nv2.setAttribute('transform','translate('+f(((q%390)+390)%390-390)+' 0)');}}

/* ==================== ELÍPTICO: esqui cross-country (neve e aurora) e caminhada nórdica (dunas), vistos de costas ==================== */
/* O elíptico alterna braço e perna sem impacto: o esqui em passo diagonal é o gesto mais parecido (boneco A aprovado).
   Ciclo por zona: 1,1 s / 0,9 s / 0,75 s (55 / 67 / 80 ciclos por minuto, faixa de um elíptico real). Velocidade da cena: esqui 8/11/14 km/h, nórdica 5/6/7 km/h. */
const ELI={esqui:{kmh:{1:8,3:11,5:14},T:{1:1.1,3:.9,5:.75}},nordico:{kmh:{1:5,3:6,5:7},T:{1:1.25,3:1,5:.85}}};
const eliTipo=()=>CESC==='dunas'?'nordico':'esqui';
const VEL_EL=()=>ELI[eliTipo()].kmh[Z]/3.6/.03;
let LTOTEL=0,AURa=.3,AURt=.3;
GAIT.nordico=Object.assign({},GAIT.anda,{aamp:1.25,eb:18,lean:6});

/* esquiador visto de costas: esqui desliza no trilho, calcanhar sobe no impulso, joelho sempre dobrado,
   tronco a 15°, braço oposto à perna finca o bastão atrás */
function ikS(hz,hy,az,ay){let dz=az-hz,dy=ay-hy,d=Math.hypot(dz,dy);const m=L1C+L2C-.05;if(d>m){dz*=m/d;dy*=m/d;d=m;}
  const ph=Math.acos(Math.max(-1,Math.min(1,(L1C*L1C+d*d-L2C*L2C)/(2*L1C*d)))),uz=dz/d,uy=dy/d;
  const c1={z:hz+L1C*(uz*Math.cos(ph)-uy*Math.sin(ph)),y:hy+L1C*(uz*Math.sin(ph)+uy*Math.cos(ph))},c2={z:hz+L1C*(uz*Math.cos(-ph)-uy*Math.sin(-ph)),y:hy+L1C*(uz*Math.sin(-ph)+uy*Math.cos(-ph))};
  return c1.z>c2.z?c1:c2;}
const CORE={jaqueta:H.camisa,manga:MANGA,calca:'#1f2328',bota:'#2b3036',esqui:'#00c9cc',bastao:'#d9dee6',pele:H.pele,gorro:'#00c9cc',pompom:'#f4f1e6'};
function montaEsquiador(pai,cor,Dp){const g=el('g',{},pai),m={};
  const mk=(k,c,w)=>{m[k]=w?el('path',{fill:'none',stroke:c,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'},g):el('path',{fill:c},g);};
  for(const j of [0,1])mk('ski'+j,cor.esqui,1.9);
  for(const j of [0,1]){mk('bT'+j,cor.manga,3.4);mk('mT'+j,'#2b3036',0);}
  for(const j of [0,1]){mk('pn'+j,cor.calca,4.6);mk('co'+j,cor.calca,6.2);mk('bo'+j,cor.bota,3.8);}
  mk('sho',cor.calca,0);mk('tor',cor.jaqueta,0);for(const j of [0,1])mk('v'+j,cor.bastao,1.3);mk('pesc',cor.pele,3.4);
  for(const j of [0,1]){mk('bF'+j,cor.manga,3.4);mk('mF'+j,'#2b3036',0);}
  mk('cab',cor.pele,0);mk('gor',cor.gorro,0);mk('pom',cor.pompom,0);
  const Hc=BKE.H,PJ=(x,y,z)=>{const k=Dp/(Dp+z);return [x*k,(Hc-y)*k-Hc];},P2=(x,y,z)=>pp(PJ(x,y,z));
  return {g,set(th){const q=((th/TAU)%1+1)%1,yH=27+.9*Math.cos(TAU*2*q),ln=15*RD,O={},Ys=yH+Math.cos(ln)*16.5,zs=Math.sin(ln)*16.5;
    const L=[[q,-1],[(q+.5)%1,1]].map(([ph,sg])=>{const s=Math.sin(TAU*ph),zf=12*s,tras=Math.max(0,(-s-.35)/.65),ay=2.6+1.6*tras,k=ikS(0,yH,zf,ay),x=sg*3.5;
      return {sg,zf,tras,ph,hip:[sg*3.4,yH,0],kn:[sg*3.6,k.y,k.z],an:[x,ay,zf],x};}).sort((a,b)=>b.zf-a.zf);
    L.forEach((p,i)=>{const lev=p.tras*2.2,y0=.5;
      O['ski'+i]='M'+P2(p.x,y0+lev,p.zf-24)+'L'+P2(p.x,y0+lev*.4,p.zf+2)+'L'+P2(p.x,y0,p.zf+32)+'Q'+P2(p.x,y0+.2,p.zf+37)+' '+P2(p.x,y0+2.6,p.zf+38.5);
      O['pn'+i]='M'+P2(...p.hip)+'L'+P2(...p.kn)+'L'+P2(...p.an);O['co'+i]='M'+P2(...p.hip)+'L'+P2(...p.hip.map((a,u)=>a+(p.kn[u]-a)*.5));
      O['bo'+i]='M'+P2(p.x,p.an[1]-1.4,p.zf-1.5)+'L'+P2(p.x,p.an[1]-1.6,p.zf+3.2);});
    O.sho='M'+[[-5.8,yH+3.2],[5.8,yH+3.2],[6.4,yH-2.4],[1.2,yH-4],[-1.2,yH-4],[-6.4,yH-2.4]].map(v=>P2(v[0],v[1],0)).join('L')+'Z';
    O.tor='M'+P2(-5.4,yH+1.6,.3)+'L'+P2(-7.8,Ys-2,zs)+'Q'+P2(-7.9,Ys+1.8,zs)+' '+P2(-4.8,Ys+1.9,zs)+'L'+P2(4.8,Ys+1.9,zs)+'Q'+P2(7.9,Ys+1.8,zs)+' '+P2(7.8,Ys-2,zs)+'L'+P2(5.4,yH+1.6,.3)+'Z';
    for(const j of [0,1]){const sg=j?1:-1,so=Math.sin(TAU*(j?q:(q+.5)%1)),al=(56*so+8)*RD,b=al+28*RD,
        sh=[sg*7.2,Ys-1.8,zs],co=[sg*8.8,sh[1]-Math.cos(al)*10,zs+Math.sin(al)*10],ma=[sg*9.2,co[1]-Math.cos(b)*9.2,co[2]+Math.sin(b)*9.2],
        pa=(al/RD*.42-24)*RD,lg=Math.min(44,ma[1]/Math.max(.25,Math.cos(pa))),tip=[ma[0]+sg*2.2,Math.max(0,ma[1]-Math.cos(pa)*lg),ma[2]+Math.sin(pa)*lg],
        pm=PJ(...ma),rm=1.7*Dp/(Dp+ma[2]),d='M'+P2(...sh)+'L'+P2(...co)+'L'+P2(...ma),mao=circ(pm[0],pm[1],rm),adiante=ma[2]>zs+1.5;
      O['bT'+j]=adiante?d:'M0 0';O['mT'+j]=adiante?mao:'M0 0';O['bF'+j]=adiante?'M0 0':d;O['mF'+j]=adiante?'M0 0':mao;
      O['v'+j]='M'+P2(ma[0],ma[1]+1.6,ma[2])+'L'+P2(...tip);}
    O.pesc='M'+P2(0,Ys+1,zs)+'L'+P2(0,Ys+3.2,zs+.4);
    const hc=PJ(0,Ys+6.2,zs+1.8),r=4.5*Dp/(Dp+zs+1.8);
    O.cab=circ(hc[0],hc[1],r);O.gor='M'+f(hc[0]-r*1.04)+' '+f(hc[1]+r*.3)+'A'+f(r*1.04)+' '+f(r*1.1)+' 0 0 1 '+f(hc[0]+r*1.04)+' '+f(hc[1]+r*.3)+'Z';
    O.pom=circ(hc[0],hc[1]-r*1.05,r*.38);
    for(const k in m)if(O[k])m[k].setAttribute('d',O[k]);}};}

/* ---------- cenários do elíptico ---------- */
Object.assign(PB,{
  neve:{RL:-10,curva:.3,morro:.03,ceu:['#6fa2d8','#c6dcee','#eef4f8'],chao:'#e8eef4',dirP:74,marco:56,cascW:40,
    faixas:[[-3000,-48,'#eef3f8','#e8eef4'],[-48,-40,'#dfe7f0','#d9e1eb'],[-40,40,'#f7f9fc','#f1f4f8'],[40,48,'#dfe7f0','#d9e1eb'],[48,3000,'#eef3f8','#e8eef4']],
    linhas:[[-13.5,2.6,'#c3d1e1'],[-6.5,2.6,'#c3d1e1'],[6.5,2.6,'#c3d1e1'],[13.5,2.6,'#c3d1e1']],
    flg:{gelo:{c:[[-40,40,'#cfe3f2'],[-30,20,'#e9f4fb',1]],tapa:1},funda:{c:[[-46,46,'#fbfcfe'],[-30,34,'#eef3f9',1]],tapa:1}}},
  aurora:{RL:-10,curva:.22,morro:.02,ceu:['#0b1230','#1e2e58','#3e5a7e'],chao:'#7f90b2',dirP:74,marco:56,cascW:40,
    faixas:[[-3000,-48,'#8c9dbe','#8697b8'],[-48,-40,'#7f90b2','#7a8bad'],[-40,40,'#a3b2cf','#9dadca'],[40,48,'#7f90b2','#7a8bad'],[48,3000,'#8c9dbe','#8697b8']],
    linhas:[[-13.5,2.6,'#7888aa'],[-6.5,2.6,'#7888aa'],[6.5,2.6,'#7888aa'],[13.5,2.6,'#7888aa']],
    flg:{gelo:{c:[[-40,40,'#6f8fbf'],[-30,20,'#9fc4e8',1]],tapa:1},lago:{c:[[-700,-50,'#2f4468'],[50,700,'#2f4468'],[-520,-120,'#4a6a96',1],[150,560,'#4a6a96',1]]}}},
  dunas:{RL:0,curva:.18,morro:.06,ceu:['#3f8fd0','#a8d8ee','#f2ece0'],chao:'#ece3cf',dirP:72,marco:40,cascW:24,
    faixas:[[-3000,-60,'#f3ecdd','#eee6d5'],[-60,-22,'#ebe1cc','#e6dbc5'],[-22,22,'#e0d1b4','#dacbad'],[22,60,'#ebe1cc','#e6dbc5'],[60,3000,'#f3ecdd','#eee6d5']],
    linhas:[[-36,1.8,'#d6c6a6'],[-28,1.8,'#d6c6a6']],
    flg:{lagoaE:{c:[[-760,-66,'#2fc2c8'],[-90,-66,'#f8f3e8'],[-520,-200,'#5fd6d6',1]]},lagoaD:{c:[[66,760,'#2fc2c8'],[66,90,'#f8f3e8'],[220,560,'#5fd6d6',1]]},
      lagoaV:{c:[[-760,-66,'#36b78f'],[66,760,'#36b78f'],[-90,-66,'#f8f3e8'],[66,90,'#f8f3e8']]},fofa:{c:[[-22,22,'#efe5cf'],[-22,22,'#e3d3b2',1]],tapa:1}}}});

const pinheiros=(sd,neve,noite)=>{const R=v=>hsh(sd*3.7+v),Hh=150*(1+(R(1)-.5)*.4),tr=noite?'#2a2a30':'#5a4230',v1=noite?'#1b2b3a':'#2f5a46',v2=noite?'#24384a':'#3a6b54',nv=noite?'#c8d4ea':'#ffffff';
  let a='',b='',c='';const n=4;for(let i=0;i<n;i++){const y=-Hh*(.22+i*.2),w=Hh*(.34-i*.07),h=Hh*.3;a+='M'+f(-w)+' '+f(y)+'L0 '+f(y-h)+'L'+f(w)+' '+f(y)+'Z';b+='M0 '+f(y-h)+'L'+f(w)+' '+f(y)+'L'+f(w*.2)+' '+f(y-h*.15)+'Z';
    if(neve)c+='M'+f(-w*.62)+' '+f(y-h*.38)+'L0 '+f(y-h)+'L'+f(w*.62)+' '+f(y-h*.38)+'Q'+f(w*.3)+' '+f(y-h*.3)+' '+f(w*.1)+' '+f(y-h*.4)+'Q'+f(-w*.25)+' '+f(y-h*.28)+' '+f(-w*.62)+' '+f(y-h*.38)+'Z';}
  return '<rect x="-4" y="'+f(-Hh*.24)+'" width="8" height="'+f(Hh*.24)+'" fill="'+tr+'"/><path d="'+a+'" fill="'+v1+'"/><path d="'+b+'" fill="'+v2+'"/>'+(neve?'<path d="'+c+'" fill="'+nv+'"/>':'');};
const SPRL={
  pinheiro:(sd,noite)=>pinheiros(sd,1,noite),
  estaca:()=>'<rect x="-1.6" y="-44" width="3.2" height="44" fill="#ff7a1a"/><rect x="-1.6" y="-44" width="3.2" height="8" fill="#ffffff"/>',
  monteNeve:(noite)=>'<path d="M-40 0Q-30 -16 -6 -18Q20 -20 40 0Z" fill="'+(noite?'#9aaacb':'#f4f7fb')+'"/><path d="M-6 -18Q20 -20 40 0Q16 -8 -6 -18Z" fill="'+(noite?'#8494b6':'#dfe7f0')+'"/>',
  boneco:()=>'<ellipse cx="0" cy="-14" rx="16" ry="14" fill="#f7f9fc"/><circle cx="0" cy="-36" r="11" fill="#f7f9fc"/><circle cx="0" cy="-54" r="8" fill="#f7f9fc"/><path d="M-9 -45h18" stroke="#d4433a" stroke-width="4"/><path d="M6 -45l3 12" stroke="#d4433a" stroke-width="3.4"/>'
    +'<path d="M0 -54l9 2-9 2Z" fill="#ff8a1a"/><circle cx="-3" cy="-57" r="1.2" fill="#1b1b1b"/><circle cx="3" cy="-57" r="1.2" fill="#1b1b1b"/><rect x="-7" y="-70" width="14" height="10" fill="#1d2228"/><rect x="-10" y="-61" width="20" height="2.4" fill="#1d2228"/>'
    +'<path d="M-10 -38L-26 -48M10 -38L24 -50" stroke="#6b4a2b" stroke-width="2"/><circle cx="0" cy="-36" r="1.3" fill="#1b1b1b"/><circle cx="0" cy="-30" r="1.3" fill="#1b1b1b"/>',
  raposa:()=>'<path d="M-16 -10Q-6 -16 8 -14Q14 -13 16 -9Q10 -6 -10 -6Z" fill="#d9662b"/><path d="M14 -14l6 -3 3 3-3 3-6 1Z" fill="#d9662b"/><path d="M19 -17l1 -5 2 4Z" fill="#b8501f"/><path d="M22 -12l3 .6" stroke="#1b1b1b" stroke-width="1"/>'
    +'<path d="M-16 -10Q-28 -12 -32 -6Q-26 -3 -16 -7Z" fill="#d9662b"/><path d="M-32 -6Q-29 -4 -26 -5" stroke="#ffffff" stroke-width="2" fill="none"/><path d="M8 -12Q10 -8 16 -9Z" fill="#f4efe6"/>'
    +'<g class="pA"><path d="M-10 -7v7M8 -8v8" stroke="#3a2a22" stroke-width="2.2" stroke-linecap="round"/></g><g class="pB"><path d="M-6 -7v7M12 -8v8" stroke="#3a2a22" stroke-width="2.2" stroke-linecap="round"/></g>',
  pegadas:()=>{let s='';for(let i=0;i<10;i++)s+=elp((i%2?4:-4),-i*16,1.8,4.2);return '<path d="'+s+'" fill="#c9d6e4"/>';},
  cabana:(fumo)=>'<rect x="-70" y="-74" width="140" height="74" fill="#7a5233"/><path d="M-70 -50H70M-70 -26H70" stroke="#5e3e26" stroke-width="2"/><path d="M-90 -70L0 -132L90 -70Z" fill="#5a3a24"/><path d="M-94 -70L0 -134L94 -70L82 -66L0 -122L-82 -66Z" fill="#f7f9fc"/>'
    +'<rect x="-46" y="-56" width="26" height="22" fill="#ffd27a"/><rect x="20" y="-56" width="26" height="22" fill="#ffd27a"/><rect x="-12" y="-44" width="24" height="44" fill="#4a2e1a"/><rect x="40" y="-140" width="14" height="36" fill="#6d6a6a"/>'
    +(fumo?'<g fill="#e8eaee" opacity=".55"><circle cx="47" cy="-152" r="8"/><circle cx="54" cy="-168" r="10"/><circle cx="48" cy="-188" r="12"/></g>':'')+'<circle cx="-33" cy="-45" r="40" fill="url(#luz)"/>',
  teleferico:()=>'<path d="M-60 0L-12 -330H12L60 0" fill="none" stroke="#5d636b" stroke-width="5"/><path d="M-44 -110H44M-30 -200H30M-20 -280H20" stroke="#5d636b" stroke-width="3"/><path d="M-40 -330H40" stroke="#3d4148" stroke-width="6"/>'
    +'<path d="M-900 -300L-40 -326M40 -326L900 -350" stroke="#2b3036" stroke-width="1.6"/><g class="cab"><path d="M0 -324V-296" stroke="#2b3036" stroke-width="2"/><rect x="-18" y="-296" width="36" height="30" rx="6" fill="#d4433a"/><rect x="-12" y="-290" width="24" height="12" fill="#cfe6f5"/></g>',
  bandeira:()=>'<path d="M0 0V-110" stroke="#3d3a33" stroke-width="3"/><g class="tremula"><path d="M0 -110Q22 -114 46 -102Q24 -94 0 -84Z" fill="#d4433a"/></g><path d="M-20 0Q0 -14 20 0Z" fill="#f4f7fb"/>',
  iglu:()=>'<path d="M-60 0A60 54 0 0 1 60 0Z" fill="#e6eef8"/><path d="M-58 -14H58M-50 -28H50M-36 -42H36M-30 0V-14M0 0V-14M30 0V-14M-15 -14V-28M15 -14V-28M-30 -28V-42M0 -28V-42M30 -28V-42" stroke="#b4c4da" stroke-width="1.4"/>'
    +'<path d="M-16 0A16 18 0 0 1 16 0Z" fill="#ffb15c"/><circle cx="0" cy="-8" r="34" fill="url(#luz)"/>',
  fogueira:()=>'<circle cx="0" cy="-12" r="70" fill="url(#luz)"/><path d="M-16 0L14 -6M-14 -6L16 0" stroke="#5a3a24" stroke-width="4" stroke-linecap="round"/><g class="chama"><path d="M-8 -2Q-10 -14 0 -26Q10 -14 8 -2Z" fill="#ff9a2e"/><path d="M-4 -2Q-5 -10 0 -17Q5 -10 4 -2Z" fill="#ffe08a"/></g>'
    +'<path d="M-60 0L-36 -40L-12 0Z" fill="#c0473d"/><path d="M-36 -40L-28 0H-44Z" fill="#8e2f28"/><path d="M40 0L62 -34L84 0Z" fill="#2e7d4f"/>',
  coruja:()=>pinheiros(seq,1,1)+'<path d="M0 -70Q-20 -74 -40 -72" stroke="#2a2a30" stroke-width="3.4"/><g transform="translate(-32 -72) scale(1.6)"><ellipse cx="0" cy="-9" rx="6" ry="8" fill="#8a7a62"/><circle cx="0" cy="-17" r="5.4" fill="#8a7a62"/>'
    +'<path d="M-5 -21l-1 -4 3 2ZM5 -21l1 -4-3 2Z" fill="#6b5e4a"/><circle cx="-2.2" cy="-17.4" r="2" fill="#ffd23f"/><circle cx="2.2" cy="-17.4" r="2" fill="#ffd23f"/><circle cx="-2.2" cy="-17.4" r=".8" fill="#111"/><circle cx="2.2" cy="-17.4" r=".8" fill="#111"/><path d="M0 -15.6l-1 1.4h2Z" fill="#e0a43a"/></g>',
  cadente:()=>'<path d="M0 0L-70 -26" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".9"/><path d="M-30 -11L-70 -26" stroke="#9fd3ff" stroke-width="1" opacity=".6"/><circle r="2.4" fill="#ffffff"/>',
  duna:(sd)=>{const R=v=>hsh(sd*2.9+v),w=200+R(1)*260,h=60+R(2)*80,cx=(R(3)-.5)*w*.3;return '<path d="M'+f(-w)+' 0Q'+f(-w*.4)+' '+f(-h*1.1)+' '+f(cx)+' '+f(-h)+'Q'+f(w*.5)+' '+f(-h*.9)+' '+f(w)+' 0Z" fill="#f6efe0"/><path d="M'+f(cx)+' '+f(-h)+'Q'+f(w*.5)+' '+f(-h*.9)+' '+f(w)+' 0Q'+f(w*.3)+' '+f(-h*.2)+' '+f(cx+w*.1)+' '+f(-h*.86)+'Z" fill="#e4d4b6"/>';},
  restinga:()=>'<path d="M-10 0Q-12 -10 -4 -12Q0 -18 6 -12Q12 -10 10 0Z" fill="#7a9a4a"/><path d="M-4 -12Q0 -16 4 -12" stroke="#5f7a38" stroke-width="1" fill="none"/>',
  buggy:()=>'<path d="M-36 -24h72l-6 -20h-60Z" fill="#ffc72c"/><path d="M-30 -44L-22 -74H22L30 -44" fill="none" stroke="#2b3036" stroke-width="3"/><rect x="-40" y="-26" width="80" height="10" rx="3" fill="#2b3036"/>'
    +'<rect x="-44" y="-20" width="16" height="20" rx="4" fill="#1d2025"/><rect x="28" y="-20" width="16" height="20" rx="4" fill="#1d2025"/><rect x="-36" y="-30" width="8" height="5" fill="#ff3b30"/><rect x="28" y="-30" width="8" height="5" fill="#ff3b30"/>'
    +'<circle cx="-10" cy="-52" r="6" fill="#8d5a3b"/><circle cx="12" cy="-52" r="6" fill="#c68d63"/><g fill="#ebe1cc" opacity=".55"><circle cx="-44" cy="-4" r="14"/><circle cx="44" cy="-4" r="14"/><circle cx="-56" cy="-14" r="10"/><circle cx="56" cy="-14" r="10"/></g>',
  vila:()=>{let s='';for(let i=0;i<3;i++){const x=-120+i*110;s+='<rect x="'+(x-30)+'" y="-44" width="60" height="44" fill="#d9c7a4"/><path d="M'+(x-42)+' -40L'+x+' -84L'+(x+42)+' -40Z" fill="#9a7a44"/><rect x="'+(x-8)+'" y="-26" width="16" height="26" fill="#5a3e22"/>';}
    return s+'<path d="M140 0q30 10 60 0l-6 -12h-48Z" fill="#2e7d9c"/><path d="M170 -12V-60L196 -14Z" fill="#f4efe6"/>';}};

const FUNDOL={
  neve:()=>{let pin='';for(let x=-30;x<430;x+=10){const u=((x%390)+390)%390,h=14+hsh(u)*22;pin+='M'+f(x-6)+' 306L'+x+' '+f(306-h)+'L'+f(x+6)+' 306Z';}
    return '<g id="para"><g fill="#c9d6e6">'+rep2('M0 300V230L40 196L80 222L120 176L160 214L200 188L240 222L280 168L320 206L360 184L390 230V300Z')+'</g>'
      +'<g fill="#ffffff">'+rep2('M120 176L104 196L116 192L126 200L136 190ZM280 168L262 190L276 186L286 194L298 184ZM40 196L28 210L40 206L52 210Z')+'</g>'
      +'<g fill="#a9bcd2">'+rep2('M0 304V264L50 244L100 262L150 240L200 258L250 236L300 256L350 242L390 264V304Z')+'</g><g fill="#2f5a46">'+rep2(pin)+'</g></g>';},
  aurora:()=>{let st='',pin='';for(let i=0;i<90;i++)st+=circ(hsh(i)*390,hsh(i+50)*280,.5+hsh(i+90)*.8);for(let x=-30;x<430;x+=10){const u=((x%390)+390)%390,h=14+hsh(u)*22;pin+='M'+f(x-6)+' 306L'+x+' '+f(306-h)+'L'+f(x+6)+' 306Z';}
    return '<g id="est" fill="#ffffff"><path d="'+st+'"/></g><g id="aur"></g><circle cx="80" cy="110" r="14" fill="#f4f1e4"/><circle cx="80" cy="110" r="30" fill="#f4f1e4" opacity=".12"/>'
      +'<g id="para"><g fill="#2c3a5e">'+rep2('M0 300V236L44 206L84 230L126 190L166 222L206 198L246 230L290 182L330 214L366 196L390 236V300Z')+'</g>'
      +'<g fill="#8a9cc4">'+rep2('M126 190L110 210L122 206L132 214L142 204ZM290 182L272 204L286 200L296 208L308 198Z')+'</g><g fill="#141f33">'+rep2(pin)+'</g></g>';},
  dunas:()=>'<g id="para"><g fill="#efe4cc">'+rep2('M0 304V280Q50 262 100 276T200 270T300 278T390 280V304Z')+'</g><g fill="#3cc4c8">'+rep2('M30 300h60v3h-60ZM190 298h90v4h-90ZM330 300h40v3h-40Z')+'</g>'
    +'<g fill="#e3d4b4">'+rep2('M0 304V292Q60 284 120 290T240 288T390 292V304Z')+'</g></g>'};

/* aurora boreal: 3 cortinas que ondulam; a intensidade sobe com os eventos */
let AURg=null;
function auroraMonta(){AURg=null;const g=svg.querySelector('#aur');if(!g)return;const defs=svg.querySelector('defs');
  const gr=document.createElementNS(NS,'linearGradient');gr.id='aug';gr.setAttribute('x1',0);gr.setAttribute('x2',0);gr.setAttribute('y1',0);gr.setAttribute('y2',1);
  gr.innerHTML='<stop offset="0" stop-color="#b06bff" stop-opacity="0"/><stop offset=".35" stop-color="#8a6bff" stop-opacity=".35"/><stop offset=".7" stop-color="#5dffb0" stop-opacity=".6"/><stop offset="1" stop-color="#5dffb0" stop-opacity="0"/>';defs.appendChild(gr);
  AURg={g,p:[0,1,2].map(()=>el('path',{fill:'url(#aug)'},g)),t:0};AURa=.3;AURt=.3;}
function auroraQuadro(dt){if(!AURg)return;AURg.t+=dt;AURa+=(AURt-AURa)*Math.min(1,dt*.6);const t=AURg.t;
  AURg.p.forEach((p,k)=>{let top='',bot='';const y0=60+k*38,amp=14+k*6;for(let x=-20;x<=410;x+=26){const yt=y0+amp*Math.sin(x*.018+t*(.35+k*.12)+k*2)+8*Math.sin(x*.05-t*.8),yb=yt+110+26*Math.sin(x*.03+t*.5+k);
      top+=(x===-20?'M':'L')+x+' '+f(yt);bot='L'+x+' '+f(yb)+bot;}p.setAttribute('d',top+bot+'Z');});
  AURg.g.setAttribute('opacity',f(AURa*100*(CL&&CL.cl.aur!=null?CL.cl.aur:1))/100);}

function marcosEli(c){const SEG=BK.SEG,b=Math.floor(c.z/SEG),cen=CESC,NN=QUAL==='A'?BK.N:90,P_=PB[cen],noite=cen==='aurora';
  const ok=(i,sd)=>QUAL==='A'||hsh(i*11+(sd>0?1:0))>=.45;
  for(let i=b+4;i<b+NN-6;i++){const z=i*SEG;
    for(const sd of [-1,1]){const key='l'+i+sd;if(feitos.has(key))continue;feitos.add(key);const h=hsh(i*5+(sd>0?2:0)+cen.length*31),h2=hsh(i*7.7+(sd>0?3:1));
      if(cen==='neve'||cen==='aurora'){if(i%2===0&&h<(noite?.38:.5)&&ok(i,sd))novo(SPRL.pinheiro(i*2+(sd>0?1:0),noite),fora(sd,sd*(56+h2*380),.75+h2*.5,70),0,z,{k:.75+h2*.5});
        else if(h>.86&&h<.93)novo(SPRL.monteNeve(noite),fora(sd,sd*(50+h2*120),1+h2,45,44),0,z,{k:1+h2});else if(sd>0&&i%12===0)novo(SPRL.estaca(),46,0,z);}
      else{if(i%3===0&&h<.5&&ok(i,sd))novo(SPRL.duna(i*2+(sd>0?1:0)),sd*(170+h2*700),0,z,{k:.8+h2*1.4});else if(h>.9)novo(SPRL.restinga(),sd*(40+h2*90),0,z,{k:.75});
        if(sd<0&&i%45===7&&!FLG.has(i)){marca_(i,10+Math.floor(h2*8),h2<.4?'lagoaE':h2<.75?'lagoaD':'lagoaV');}}}}
  const mU=250/.03;for(let k=Math.ceil((c.z+300)/mU);k*mU<c.z+NN*SEG-200&&k*mU<LTOTEL;k++){const key='m'+k;if(feitos.has(key))continue;feitos.add(key);novo(SPRB.km(String(k*.25).replace('.',',')),P_.marco,0,k*mU,{k:1.2});}}

function poeEli(spr,placa,z0,vel){const cen=CESC,RL=PB[cen].RL,noite=cen==='aurora',dP=PB[cen].dirP;
  const anda=(o,dt,corre)=>{o.ph=(o.ph||0)+dt*(corre?16:6);if(!o.pa){o.pa=o.g.querySelector('.pA');o.pb=o.g.querySelector('.pB');}const s=Math.sin(o.ph);if(o.pa){o.pa.setAttribute('transform','translate('+f(s*1.5)+' 0)');o.pb.setAttribute('transform','translate('+f(-s*1.5)+' 0)');}};
  switch(spr){
    case 'portao':novo(SPRB.portal(placa),0,0,z0);return 1;
    case 'teleferico':{const o=novo(SPRL.teleferico(),260,0,z0+200);o.upd=(oo,dt)=>{oo.cb=oo.cb||oo.g.querySelector('.cab');const x=((oo.t*40)%900)-450;oo.cb.setAttribute('transform','translate('+f(x)+' '+f(-x*.028)+')');};novo(SPRB.placaEv(placa),dP+10,0,z0);return 1;}
    case 'cabana':novo(SPRL.cabana(1),-200,0,z0);return 1;
    case 'chocolate':novo(SPRL.cabana(1),-150,0,z0);novo(SPRB.placaEv('CHOCOLATE'),dP+10,0,z0-80);return 1;
    case 'boneco':novo(SPRL.boneco(),-72,0,z0,{k:1.2});return 1;
    case 'raposa':{const o=novo(SPRL.raposa(),-120,0,z0,{k:1.6});o.upd=(oo,dt)=>{if(oo.zc<BK.D+240&&!oo.foi){oo.foi=1;oo.vx=-90;}anda(oo,dt,oo.foi);};return 1;}
    case 'raposa-fuga':{const o=novo(SPRL.raposa(),RL+40,0,DIST+120,{k:1.6,vz:vel*1.35,vx:-6});o.upd=(oo,dt)=>anda(oo,dt,1);return 1;}
    case 'pegadas':for(let i=0;i<5;i++)novo(SPRL.pegadas(),-58+(i%2)*6,0,z0+i*170,{k:1.4});novo(SPRL.raposa(),-140,0,z0+900,{k:1.6,vx:-30});return 1;
    case 'funda':novo(SPRB.placaEv(placa),dP+10,0,z0);marca_(Math.floor(z0/BK.SEG)+2,22,'funda');return 1;
    case 'gelo':novo(SPRB.placaEv(placa),dP+10,0,z0);marca_(Math.floor(z0/BK.SEG)+2,20,'gelo');return 1;
    case 'vento-gelado':rajada('gelo',3.8);sujo=true;return 1;
    case 'bandeira':novo(SPRL.bandeira(),-95,0,z0,{k:1.2,upd:(o)=>{o.tm=o.tm||o.g.querySelector('.tremula');o.tm.setAttribute('transform','skewY('+f(Math.sin(o.t*5)*4)+')');}});return 1;
    case 'pinhal':for(let i=0;i<12;i++){const sd=i%2?1:-1;novo(SPRL.pinheiro(seq+i,noite),fora(sd,sd*rnd(50,90),1.1,70),0,z0+Math.floor(i/2)*70,{k:rnd(.9,1.3)});}return 1;
    case 'fogueira':{const o=novo(SPRL.fogueira(),-110,0,z0);o.upd=(oo)=>{oo.ch=oo.ch||oo.g.querySelector('.chama');oo.ch.setAttribute('transform','scale(1 '+f(.85+.2*Math.sin(oo.t*13)+.08*Math.sin(oo.t*29))+')');};return 1;}
    case 'iglu':novo(SPRL.iglu(),-150,0,z0);return 1;
    case 'coruja':novo(SPRL.coruja(),96,0,z0);return 1;
    case 'lago':novo(SPRB.placaEv(placa),dP+10,0,z0);marca_(Math.floor(z0/BK.SEG)+2,30,'lago');return 1;
    case 'estrela':for(let i=0;i<(placa==='muitas'?3:1);i++)setTimeout(()=>novo(SPRL.cadente(),rnd(220,360),rnd(40,140),0,{tela:1,sc:1,vida:1.3,vx:-rnd(220,300),vy:rnd(70,110)}),i*900);return 1;
    case 'aurora1':AURt=.6;return 1;case 'aurora2':AURt=.85;return 1;case 'aurora3':AURt=1;novo(SPRL.cadente(),330,80,0,{tela:1,sc:1,vida:1.3,vx:-260,vy:90});return 1;
    case 'lagoa':marca_(Math.floor(z0/BK.SEG),16,placa==='verde'?'lagoaV':placa==='dir'?'lagoaD':'lagoaE');return 1;
    case 'mergulho':marca_(Math.floor(z0/BK.SEG),16,'lagoaE');for(let i=0;i<4;i++)novo(SPR.espuma(),-160+i*24,0,z0+60+i*12,{k:3});return 1;
    case 'garca':novo(SPRE.garca(),-110,0,z0+40,{k:2.4});marca_(Math.floor(z0/BK.SEG),14,'lagoaE');return 1;
    case 'buggy':{const o=novo(SPRL.buggy(),-32,0,DIST-20,{vz:vel*2.2,k:1});return 1;}
    case 'buggy-aposta':{const o=novo(SPRL.buggy(),-32,0,DIST-20,{vz:vel*1.1,k:1});o.upd=(oo,dt,v)=>{oo.vz=oo.t<8?v*1.05:v*2.4;};return 1;}
    case 'vento-areia':rajada('areia',3.8);novo(SPRE.sol(),0,0,0,{tela:1,sc:1,vida:6,mul:.5});return 1;
    case 'fofa':novo(SPRB.placaEv(placa),dP+10,0,z0);marca_(Math.floor(z0/BK.SEG)+2,22,'fofa');return 1;
    case 'vila':novo(SPRL.vila(),-262,0,z0);return 1;
    case 'mirante-sol':novo(SPRB.placaEv(placa),dP+10,0,z0);novo(SPRE.porDoSol(),0,0,0,{tela:1,sc:1,vida:10});return 1;}
  return 0;}

const EVSL={
  neve:{partida:[['Base da montanha','placa','TRILHA 6 km'],['Teleférico','teleferico','TELEFÉRICO'],['Vila nevada','cabana']],
    exploracao:[['Boneco de neve','boneco'],['Raposa','raposa'],['Pegadas na neve','pegadas',0,1]],
    desafio:[['Encosta','subida','ENCOSTA ↑'],['Neve funda','funda','NEVE FUNDA'],['Vento gelado','vento-gelado'],['Rampa de gelo','gelo','GELO ↑'],['Raposa em fuga','raposa-fuga'],['Trilha íngreme','subida','ÍNGREME ↑']],
    climax:[['Crista','crista','CRISTA 100 m'],['Cume nevado','crista','CUME ↑'],['Bandeira do topo','bandeira']],
    alivio:[['Pinhal','pinhal',0,1],['Chocolate quente','chocolate']],
    chegada:[['Refúgio','cabana'],['Lareira','cabana'],['Boneco no fim','boneco']]},
  aurora:{partida:[['Noite gelada','placa','TRILHA'],['Acampamento','fogueira'],['Lago escuro','lago','LAGO']],
    exploracao:[['Iglu','iglu'],['Coruja','coruja'],['Céu estrelado','estrela','muitas',1]],
    desafio:[['A aurora chegou','aurora1',0,1],['Lago congelado','gelo','LAGO ↑'],['Vento polar','vento-gelado',0,1],['Colina de gelo','subida','GELO ↑'],['Rastro da raposa','raposa-fuga'],['Aurora dançando','aurora2',0,1]],
    climax:[['Aurora no máximo','aurora3',0,1],['Estrela cadente','estrela',0,1],['Topo da colina','crista','TOPO ↑']],
    alivio:[['Fogueira','fogueira'],['Silêncio',null]],
    chegada:[['Iglu','iglu'],['Fogueira acesa','fogueira'],['Céu de estrelas','estrela','muitas',1]]},
  dunas:{partida:[['Entrada do parque','portao','LENÇÓIS'],['Primeira lagoa','lagoa',0,1],['Trilha do buggy','buggy']],
    exploracao:[['Lagoa azul','lagoa','dir',1],['Garça','garca'],['Buggy','buggy']],
    desafio:[['Duna alta','subida','DUNA ↑'],['Areia fofa','fofa','AREIA FOFA'],['Vento de areia','vento-areia',0,1],['Crista da duna','crista','CRISTA ↑'],['Buggy apostando','buggy-aposta'],['Sol a pino','sol',0,1]],
    climax:[['Topo da duna','crista','TOPO 50 m'],['Duna gigante','subida','DUNA ↑'],['Mirante do pôr do sol','mirante-sol','MIRANTE ↑']],
    alivio:[['Lagoa verde','lagoa','verde',1],['Descida da duna','descida',0,1]],
    chegada:[['Pôr do sol','mirante-sol','MIRANTE'],['Mergulho na lagoa','mergulho',0,1],['Vila de pescadores','vila']]}};
const DESTL={
  neve:{s0:.08,s1:.38,svg:()=>'<path d="M-560 40L-160 -240L0 -180L220 -300L620 40Z" fill="#dfe8f2"/><path d="M220 -300L180 -250L230 -258L270 -240Z" fill="#ffffff"/>'+SPRL.cabana(1)+'<g transform="translate(120 0)">'+SPRL.bandeira()+'</g>'},
  aurora:{s0:.08,s1:.38,svg:()=>SPRL.iglu()+'<g transform="translate(130 0)">'+SPRL.fogueira()+'</g>'},
  /* duna um tom mais escura que o céu do horizonte: de longe a placa do mirante parecia solta no ar */
  dunas:{s0:.07,s1:.34,svg:()=>'<path d="M-700 40Q-300 -150 0 -160Q300 -150 700 40Z" fill="#eadcbe"/><path d="M0 -160Q300 -150 700 40Q300 -40 60 -140Z" fill="#d6c099"/>'+'<g transform="translate(0 -150)">'+SPRB.placaEv('MIRANTE')+'</g>'}};
function criaDestinoEli(){const d=DESTL[CESC];return destBaliza(novo(d.svg(),0,0,LTOTEL+300,{dest:1,limX:1,sfn:destSfn(d,LTOTEL),
  upd:o=>{const ch=o.ch||(o.ch=o.g.querySelector('.chama')||1);if(ch!==1)ch.setAttribute('transform','scale(1 '+f(.85+.2*Math.sin(o.t*13))+')');const tm=o.tm||(o.tm=o.g.querySelector('.tremula')||1);if(tm!==1)tm.setAttribute('transform','skewY('+f(Math.sin(o.t*5)*4)+')');}}));}

/* ---------- climas: as variações da versão 2D (nublado, chuva fina, neblina, ventania, nevasca, vento de areia)
   levadas ao formato de costas. Tudo vale para as 4 máquinas e os 13 cenários.
   Ideia de custo: o clima é uma camada por cima da cena (3 retângulos com degradê + 1 faixa de nuvens + 2 caminhos de partículas),
   sem mexer nos sprites. Muda o céu, a luz, a névoa, o brilho do sol e o tipo de partícula. ---------- */
const CLIMAS={
  limpo:{nome:'Céu limpo'},
  nublado:{nome:'Nublado',ceu:['#7c8794',.5],nuvens:1,sol:.12,estrela:.25,terra:.06},
  chuva:{nome:'Chuva fina',ceu:['#4b5663',.62],terra:.24,nuvens:2,sol:0,estrela:.1,chuva:1},
  neblina:{nome:'Neblina',ceu:['#b9c3c9',.4],nevoa:.62,sol:.3,estrela:.3,terra:.04,wisp:1},
  vento:{nome:'Ventania',vento:1,vn:4},
  nevasca:{nome:'Nevasca',ceu:['#9aa5b5',.5],nevoa:.46,sol:.2,estrela:.3,terra:.05,nevasca:1,aur:.35},
  areia:{nome:'Vento de areia',ceu:['#d9b98c',.8],nevoa:.4,sol:.35,areia:1,vn:3,fog:'#d9b98c'}};
const CLIM_CEN={parque:['limpo','nublado','chuva','neblina','vento'],orla:['limpo','nublado','chuva','vento'],serra:['limpo','nublado','chuva','neblina'],cidade:['limpo','chuva','neblina'],
  estrada:['limpo','nublado','neblina','chuva'],ciclovia:['limpo','nublado','chuva','vento'],campo:['limpo','nublado','chuva','vento'],
  neve:['limpo','nublado','nevasca','neblina'],aurora:['limpo','nevasca'],dunas:['limpo','nublado','areia'],
  predio:['limpo','nublado','chuva','neblina','vento'],farol:['limpo','nublado','chuva','vento'],montanha:['limpo','neblina','nublado','vento']};
let CLI='limpo',CL=null;

/* mistura as cores do céu com a cor do clima (como na versão 2D) */
function climaPal(o){const cl=CLIMAS[CLI];if(!cl||!cl.ceu||!CEU)return o;
  const alvo=CEU.noite?mixC(cl.ceu[0],'#0a0d14',.65):cl.ceu[0];
  for(const k of ['c1','c2','c3','nuvem'])o[k]=mixC(o[k],alvo,cl.ceu[1]);return o;}

function climaLimpa(){rajadaLimpa();if(CL){for(const e of CL.els)if(e.parentNode)e.parentNode.removeChild(e);}if(CEU){CEU.nv2=null;CEU.g.setAttribute('opacity',1);}CL=null;}

function climaMonta(){climaLimpa();if(!CEU)return;const cl=CLIMAS[CLI];
  if(CLI==='limpo'||!cl){ceuCor(true);return;}
  const C=CEU,H0=C.H0,defs=svg.querySelector('defs'),els=[],noite=C.noite;
  CL={cl,els,vn:cl.vn||1,t:0};
  const grad=(id,y1,y2,stops)=>{const g=document.createElementNS(NS,'linearGradient');g.id=id;g.setAttribute('gradientUnits','userSpaceOnUse');g.setAttribute('x1',0);g.setAttribute('x2',0);g.setAttribute('y1',y1);g.setAttribute('y2',y2);
    g.innerHTML=stops;defs.appendChild(g);els.push(g);return g;};
  /* 1) massa de nuvens extra (nublado e chuva): faixa grande e baixa, em dois tons, que anda um pouco mais rápido que as nuvens do fundo */
  if(cl.nuvens){const nv2=el('g',{},null);let a='',b='';const n=8,sd=CESC.length*5.3,topo=cl.nuvens>1?-6:4,alt=(cl.nuvens>1?.46:.34)*H0;
    for(let k=0;k<n;k++){const bx=k*(390/n)+hsh(sd+k)*18,cy=topo+hsh(sd+k+4)*alt,rx=58+hsh(sd+k+8)*46,ry=15+hsh(sd+k+12)*17;
      for(const dx of [0,390,-390]){const x=bx+dx;b+=elp(x+6,cy+ry*.55,rx*1.02,ry*.95);a+=elp(x,cy,rx,ry)+elp(x-rx*.45,cy+ry*.1,rx*.55,ry*.8)+elp(x+rx*.5,cy+ry*.15,rx*.5,ry*.75);}}
    C.nv.after(nv2);els.push(nv2);
    CL.nb2=el('path',{d:b},nv2);CL.na2=el('path',{d:a},nv2);C.nv2=nv2;}
  /* 2) chão mais escuro (chuva, nublado): sem camada extra, escurece o degradê de cor que já existe (#tng) */
  /* 3) névoa: forte no horizonte, some aos poucos para perto; esconde o fundo e os objetos distantes */
  if(cl.nevoa){const g=grad('fgg',H0-170,H0+380,'<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".26" stop-color="#fff" stop-opacity="1"/><stop offset=".42" stop-color="#fff" stop-opacity=".55"/><stop offset=".68" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>');
    CL.fgS=[...g.querySelectorAll('stop')];
    const fg=el('rect',{x:-20,y:H0-170,width:430,height:1000,fill:'url(#fgg)',opacity:cl.nevoa});C.tr.parentNode.insertBefore(fg,C.tr);els.push(fg);CL.fg=fg;}
  /* 4) faixas de névoa que passam devagar (neblina) */
  if(cl.wisp){const g=el('g',{},null);let d='';for(let k=0;k<5;k++)for(const dx of [0,390,-390])d+=elp(k*80+hsh(k+3)*30+dx,H0-40+hsh(k+9)*130,90+hsh(k+5)*60,13+hsh(k+7)*10);
    CL.wp=el('path',{d,opacity:.3},g);C.tr.parentNode.insertBefore(g,C.tr);els.push(g);CL.wg=g;}
  /* 5) partículas do clima: 2 caminhos (fundo e perto) */
  const tipo=cl.chuva?'chuva':cl.vento?'vento':cl.nevasca?'nevasca':cl.areia?'areia':null;
  if(tipo&&!reduz){const A=QUAL==='A',nA=tipo==='chuva'?(A?110:56):tipo==='nevasca'?(A?70:46):tipo==='vento'?(A?28:18):(A?44:30),nB=tipo==='chuva'?(A?60:28):tipo==='nevasca'?(A?50:30):tipo==='vento'?(A?16:10):(A?24:16);
    const fio=tipo==='vento'||tipo==='areia';
    const cor={chuva:noite?['#9fb0cc','#c4d0e4']:['#d3e2ee','#eef5fa'],nevasca:['#ffffff','#ffffff']}[tipo];
    const op={chuva:[.42,.7],nevasca:[.7,.92]}[tipo],ln=tipo==='nevasca';
    const mk=(n,perto)=>{const arr=[];for(let i=0;i<n;i++)arr.push(fio?fioNovo(tipo,perto,true):climaNova(tipo,perto,true));return arr;};
    let pa,pb;if(fio){[pa,pb]=fioPaths(tipo,noite);}else{
    pa=el('path',ln?{fill:cor[0],opacity:op[0]}:{fill:'none',stroke:cor[0],'stroke-width':1,'stroke-linecap':'round',opacity:op[0]});
    pb=el('path',ln?{fill:cor[1],opacity:op[1]}:{fill:'none',stroke:cor[1],'stroke-width':1.6,'stroke-linecap':'round',opacity:op[1]});}
    svg.appendChild(pa);svg.appendChild(pb);els.push(pa,pb);
    CL.P={tipo,pa,pb,a:mk(nA,0),b:mk(nB,1),d:0,fio};
    if(tipo==='vento'&&CESC!=='orla'&&CESC!=='farol'){const pl=el('path',{fill:CESC==='predio'||CESC==='cidade'?'#e8e4d8':'#c9a227',opacity:.95},svg);els.push(pl);CL.P.pl=pl;
      CL.P.c=[];for(let i=0;i<(A?8:5);i++)CL.P.c.push({x:rnd(0,480),y:rnd(H0-40,H0+420),vx:-rnd(300,460),vy:rnd(-30,60),r:rnd(1.8,3.2),ph:rnd(0,TAU)});}}
  ceuCor(true);climaQuadro(0);}

/* uma partícula do clima. longe = menor e mais lenta; perto = maior e mais rápida */
function climaNova(tipo,perto,ini){const H0=CEU.H0,k=perto?1:0;let p;
  if(tipo==='chuva'){const v=perto?rnd(900,1100):rnd(560,680);p={x:rnd(-30,470),y:0,vx:-v*.2,vy:v,len:perto?rnd(20,30):rnd(10,16),yd:perto?rnd(H0+160,840):rnd(H0-8,H0+110)};p.y=ini?rnd(-30,p.yd):rnd(-60,-4);}
  else{const r=perto?rnd(2.2,3.6):rnd(1.2,2.2),v=perto?rnd(170,250):rnd(100,160);p={x:rnd(-30,470),y:0,vx:-v*.55,vy:v,r,ph:rnd(0,TAU),yd:perto?rnd(H0+200,860):rnd(H0-20,H0+150)};p.y=ini?rnd(-20,p.yd):rnd(-30,-4);}
  p.k=k;return p;}

function climaQuadro(dt){ventoQuadro(dt);if(!CL)return;const P=CL.P;CL.t+=dt;
  if(P&&!(QUAL==='C'&&P.d)){P.d=1;const rec=(p)=>{const ln=P.tipo!=='nevasca';
      p.x+=p.vx*dt;p.y+=p.vy*dt;if(P.tipo==='nevasca')p.x+=Math.sin(CL.t*1.6+p.ph)*26*dt;
      if(p.y>p.yd||p.x<-70){const n=climaNova(P.tipo,p.k,false);Object.assign(p,n);}};
    const seg=(arr)=>{let d='';for(const p of arr){if(dt)rec(p);
        if(P.tipo==='nevasca')d+=circ(p.x,p.y,p.r);
        else{const m=Math.hypot(p.vx,p.vy),ux=p.vx/m,uy=p.vy/m;d+='M'+f(p.x)+' '+f(p.y)+'L'+f(p.x-ux*p.len)+' '+f(p.y-uy*p.len);}}return d;};
    if(P.fio){P.pa.setAttribute('d',fioD(P.a,dt));P.pb.setAttribute('d',fioD(P.b,dt));}else{P.pa.setAttribute('d',seg(P.a));P.pb.setAttribute('d',seg(P.b));}
    if(P.c){let d='';for(const q of P.c){if(dt){q.x+=q.vx*dt;q.y+=(q.vy+Math.sin(CL.t*6+q.ph)*60)*dt;if(q.x<-30){q.x=rnd(430,560);q.y=rnd(CEU.H0-40,CEU.H0+420);}}
        const a=CL.t*7+q.ph,ca=Math.cos(a)*q.r,sa=Math.sin(a)*q.r*.5;d+='M'+f(q.x+ca)+' '+f(q.y+sa)+'L'+f(q.x-sa)+' '+f(q.y+ca*.5)+'L'+f(q.x-ca)+' '+f(q.y-sa)+'L'+f(q.x+sa)+' '+f(q.y-ca*.5)+'Z';}
      P.pl.setAttribute('d',d);}}
  if(CL.wg&&dt){const x=-((CL.t*7)%390);CL.wg.setAttribute('transform','translate('+f(x)+' 0)');}}

/* chamado no fim de ceuCor: cores da névoa e brilho do sol de acordo com o clima e a hora */
function climaCor(o){if(!CL)return;const cl=CL.cl,C=CEU,noite=C.noite;
  if(CL.na2){CL.na2.setAttribute('fill',mixC(o.nuvem,noite?'#1a2030':'#59636f',cl.nuvens>1?.45:.3));CL.nb2.setAttribute('fill',mixC(o.nuvem,noite?'#10151f':'#46505b',cl.nuvens>1?.62:.5));
    const q=cl.nuvens>1?.96:.85;CL.na2.setAttribute('opacity',noite?.55:q);CL.nb2.setAttribute('opacity',noite?.5:q);}
  if(cl.terra){const ta=o.ta,w=cl.terra/(ta+cl.terra+1e-6),col=mixC(o.tc,'#0b1014',w);for(const s of C.ts)s.setAttribute('stop-color',col);C.tr.setAttribute('opacity',f((1-(1-ta)*(1-cl.terra))*100)/100);}
  const fc=noite?mixC(o.c2,'#3a4258',.55):cl.fog?mixC(o.c3,cl.fog,.75):mixC(o.c3,'#dde4e8',.62);
  if(CL.fgS)for(const s of CL.fgS)s.setAttribute('stop-color',fc);
  if(CL.wp)CL.wp.setAttribute('fill',fc);
  if(!noite){const sa=cl.sol==null?1:cl.sol;C.g.setAttribute('opacity',sa);if(C.gl)C.gl.setAttribute('opacity',f(+C.gl.getAttribute('opacity')*sa*100)/100);}
  if(C.est&&cl.estrela!=null)C.est.setAttribute('opacity',f(+C.est.getAttribute('opacity')*cl.estrela*100)/100);}

/* ---------- vento: fios curtos e delicados + balanço leve da câmera ----------
   Vale para tudo que é vento: clima Ventania e Vento de areia, Nevasca (só o balanço) e as rajadas dos eventos
   (Vento contra, Vento no píer, Vento entre prédios, Vento do rio, Contra o vento, Vento no alto, Vento do mar, Vento na encosta,
   Vento gelado, Vento polar, Vento de areia, Vento a favor).
   Fio: traço curto e um pouco curvo que nasce, cresce, ondula e some (o comprimento segue um seno da vida dele, então não precisa
   de opacidade por fio). Tudo cabe em 2 caminhos (longe e perto), como a chuva: 2 atributos por quadro.
   Antes eram linhas retas de 50–170 px que cruzavam a tela em 0,2 s (parecia risco, não vento). */
let VT=0,RJ=null,BAL=0;
/* cor pensada para aparecer sobre o chão de cada lugar: branco sobre grama/asfalto/água; azul-acinzentado sobre neve;
   areia mais escura sobre areia clara */
function fioPaths(tipo,noite){const ar=tipo==='areia'||CESC==='dunas',gl=tipo==='gelo'||CESC==='neve'||CESC==='aurora';
  const c=ar?['#a8844c','#b8955a']:gl?(noite?['#c9d6ea','#dfe8f6']:['#8fa6c2','#a3b7d0']):noite?['#cdd6e6','#e3e9f3']:['#ffffff','#ffffff'];
  const w=ar?[.95,1.35]:[.85,1.25],o=ar?[.55,.75]:gl?[.55,.75]:noite?[.45,.65]:[.65,.85];
  return [0,1].map(i=>el('path',{fill:'none',stroke:c[i],'stroke-width':w[i],'stroke-linecap':'round','stroke-linejoin':'round',opacity:o[i]}));}
function fioNovo(tipo,perto,ini){const H0=CEU?CEU.H0:312,ar=tipo==='areia',v=perto?rnd(380,520):rnd(230,320);
  const p={tipo,k:perto?1:0,vx:-v*(ar?1.3:1),vy:rnd(6,26),life:perto?rnd(.8,1.2):rnd(1.1,1.7),age:0,
    len:ar?(perto?rnd(10,18):rnd(6,11)):(perto?rnd(24,42):rnd(13,24)),amp:ar?rnd(.4,1):rnd(1.4,3),ph:rnd(0,TAU),
    x:rnd(30,450),y:ar?(perto?rnd(H0+60,800):rnd(H0-40,H0+150)):(perto?rnd(H0+80,780):rnd(H0-150,H0+150)),cu:!ar&&Math.random()<(perto?.35:.15)};
  p.age=ini?rnd(0,p.life):0;return p;}
function fioD(arr,dt){let d='';for(const p of arr){
    if(dt){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.age>p.life||p.x<-40)Object.assign(p,fioNovo(p.tipo,p.k,false));}
    const e=Math.sin(Math.PI*Math.min(1,p.age/p.life)),L=p.len*e;if(L<1.5)continue;
    const m=Math.hypot(p.vx,p.vy),ux=p.vx/m,uy=p.vy/m,tx=p.x-ux*L,ty=p.y-uy*L,w=p.amp*Math.sin(VT*6+p.ph)*e;
    d+='M'+f(tx)+' '+f(ty)+'Q'+f((tx+p.x)/2-uy*w)+' '+f((ty+p.y)/2+ux*w)+' '+f(p.x)+' '+f(p.y);
    if(p.cu&&e>.45){const r=2.2+p.k*1.4;d+='q'+f(-r*1.3)+' '+f(-r*.2)+' '+f(-r*1.2)+' '+f(-r*1.4)+'q'+f(.1)+' '+f(-r*.9)+' '+f(r*.9)+' '+f(-r*.8);}}
  return d;}
/* rajada de evento: os mesmos fios por alguns segundos, entrando e saindo devagar (opacidade do grupo), mais o balanço */
function rajada(tipo,dur,forca){if(reduz||!CEU||QUAL==='C')return;tipo=tipo||'vento';dur=dur||3.4;forca=forca==null?1:forca;
  if(RJ&&RJ.tipo===tipo){RJ.dur=Math.max(RJ.dur,RJ.t+dur);RJ.forca=Math.max(RJ.forca,forca);return;}
  rajadaLimpa();const A=QUAL==='A',g=el('g',{opacity:0},svg),[pa,pb]=fioPaths(tipo,CEU.noite);g.appendChild(pa);g.appendChild(pb);
  const n=tipo==='areia'?(A?36:24):(A?20:13),mk=(k,perto)=>{const a=[];for(let i=0;i<k;i++)a.push(fioNovo(tipo,perto,true));return a;};
  RJ={tipo,g,pa,pb,a:mk(n,0),b:mk(Math.round(n*.55),1),t:0,dur,forca,e:0};}
function rajadaLimpa(){if(RJ&&RJ.g.parentNode)RJ.g.parentNode.removeChild(RJ.g);RJ=null;}
/* balanço da câmera: tremor pequeno e de frequência média (1–3 Hz), em sopros. É um transform CSS no <svg> inteiro: a GPU só
   reposiciona a imagem que já foi desenhada (não redesenha nada a mais). Escala de até 1,022 para a borda não aparecer.
   Desligado no nível C e em "reduzir movimento". Ventania 1 · areia 0,75 · nevasca 0,5 · rajada de evento 1 (a favor 0,6). */
function ventoQuadro(dt){VT+=dt;
  if(RJ){RJ.t+=dt;const r=RJ,e=Math.min(1,r.t/.5)*Math.min(1,Math.max(0,(r.dur-r.t)/.9));
    if(r.t>r.dur)rajadaLimpa();else{r.g.setAttribute('opacity',f(e*100)/100);r.pa.setAttribute('d',fioD(r.a,dt));r.pb.setAttribute('d',fioD(r.b,dt));r.e=e;}}
  const cl=CL&&CL.cl,base=cl?(cl.vento?1:cl.areia?.75:cl.nevasca?.5:0):0;
  const sopro=.45+.55*Math.max(0,Math.sin(VT*.55)*Math.sin(VT*.21+1.3));
  let I=Math.max(base*sopro,RJ?RJ.e*RJ.forca:0);if(reduz||QUAL==='C')I=0;
  const cena=svg;if(I<.01){if(BAL){cena.style.transform='';cena.style.willChange='';BAL=0;}return;}
  if(!BAL){cena.style.willChange='transform';cena.style.transformOrigin='50% 50%';}BAL=I;
  const x=1.5*I*(Math.sin(VT*7.9)+.5*Math.sin(VT*17.3+1))/1.5,y=.6*I*Math.sin(VT*11.2+2),a=.3*I*(Math.sin(VT*6.4+.5)+.4*Math.sin(VT*15.7))/1.4;
  cena.style.transform='translate('+f(x)+'px,'+f(y)+'px) rotate('+(Math.round(a*100)/100)+'deg) scale('+(1+.022*Math.min(1,I+.3)).toFixed(3)+')';}



/* ---------- máquinas: cada uma sabe montar a cena, andar, desenhar e pôr elementos ----------
   v5: a distância percorrida vem do relógio do app (TL), não de uma velocidade solta.
   distDe(t) soma, bloco a bloco, segundos × velocidade da zona do bloco. Assim o destino chega
   exatamente quando o cardio termina, mesmo com pausa, anterior/próximo ou minimizar. */
const P=trajReta();let S=S0,MAQ='esteira',tAmb=8,tUI=0;
let BLZ=[],TTOT=1,TL=0,TA=0,ROD=false,FASE='prev';
function vZ(z){return MAQ==='bike'?VELB[z]:MAQ==='esteira'?EXS[EX].kmh[z]/3.6/.03:MAQ==='eliptico'?ELI[eliTipo()].kmh[z]/3.6/.03:PASSOS[z];}
function distDe(t){let d=0,a=0;for(const b of BLZ){const u=Math.min(b.seg,Math.max(0,t-a));d+=u*vZ(b.z);a+=b.seg;if(t<=a)break;}return d;}
const MAQS={
  escada:{cens:[['predio','Prédio'],['farol','Farol'],['montanha','Montanha']],monta:montaCena,plano,cam:()=>camCostas(P,QUAL==='C'?SV:S),
    avanca(dt){S=Math.min(SFIM,S0+distDe(TL));return S>=SFIM-.01;},prog:()=>progresso(),irPara(p){S=S0+p*(SFIM-S0);},
    quadro(c){O.h.set(poseCostas(P,QUAL==='C'?SV:S,c));quadroCena(c);},marcos,poe:poeElemento,destino:criaDestino,EVS:()=>EVS,rotulo:'da subida',
    CHEG:{predio:'Terraço',farol:'A lanterna',montanha:'O cume'},amb:{predio:['pombo','passaros'],farol:['gaivotas','gaivotas','passaros'],montanha:['passaros','cabra','bromelias']},
    ffIni(){ffVel=Math.max(PASSOS[Z],(SFIM-S)/14);}},
  esteira:{cens:[['parque','Parque'],['orla','Orla'],['serra','Trilha'],['cidade','Cidade à noite']],monta:montaBike,plano(){LTOTE=Math.max(1,distDe(TTOT));},cam:camBike,
    avanca(dt){AGORA+=dt;gB+=((correndo()?1:0)-gB)*Math.min(1,dt*3);if(QUAL!=='C')thHeroi+=dt*TAU/EXS[EX].T[Z];INCa+=((EX==='incl'?EXS.incl.inc[Z]:0)-INCa)*Math.min(1,dt*.7);
      DESV+=(DESVa-DESV)*Math.min(1,dt*2.2);DESVa=0;const nd=Math.min(LTOTE,distDe(TL)),dz=Math.max(0,nd-DIST);DIST=nd;BGX-=BK.f*.5*rd(Math.floor(DIST/BK.SEG)).c/BK.SEG*(dz/BK.SEG);
      if(DIST>=LTOTE){DIST=LTOTE;return true;}return false;},prog:()=>Math.max(0,Math.min(1,DIST/LTOTE)),irPara(p){DIST=p*LTOTE;OVR=[];FLG.clear();},
    quadro:quadroBike,marcos:marcosEst,poe:poeBike,destino:criaDestinoEst,EVS:evsE,rotulo:'do percurso',
    CHEG:{parque:'Coreto',orla:'Pôr do sol',serra:'Refúgio',cidade:'Fim da avenida'},amb:{parque:['passaros','corredor','borboleta'],orla:['gaivotas','corredor'],serra:['passaros','borboleta'],cidade:['corredor']},
    ffIni(){ffVel=Math.max(VE(),(LTOTE-DIST)/14);}},
  eliptico:{cens:[['neve','Neve'],['aurora','Aurora'],['dunas','Dunas']],monta:montaBike,plano(){LTOTEL=Math.max(1,distDe(TTOT));},cam:camBike,
    avanca(dt){AGORA+=dt;if(QUAL!=='C')thHeroi+=dt*TAU/ELI[eliTipo()].T[Z];DESV+=(DESVa-DESV)*Math.min(1,dt*2.2);DESVa=0;const nd=Math.min(LTOTEL,distDe(TL)),dz=Math.max(0,nd-DIST);DIST=nd;BGX-=BK.f*.5*rd(Math.floor(DIST/BK.SEG)).c/BK.SEG*(dz/BK.SEG);
      if(DIST>=LTOTEL){DIST=LTOTEL;return true;}return false;},prog:()=>Math.max(0,Math.min(1,DIST/LTOTEL)),irPara(p){DIST=p*LTOTEL;OVR=[];FLG.clear();},
    quadro:quadroBike,marcos:marcosEli,poe:poeBike,destino:criaDestinoEli,EVS:()=>EVSL,rotulo:'do percurso',
    CHEG:{neve:'Refúgio',aurora:'Iglu',dunas:'Pôr do sol'},amb:{neve:['passaros','raposa'],aurora:['coruja','estrela'],dunas:['passaros','buggy']},
    ffIni(){ffVel=Math.max(VEL_EL(),(LTOTEL-DIST)/14);}},
  bike:{cens:[['estrada','Serra'],['ciclovia','Ciclovia'],['campo','Campo']],monta:montaBike,plano(){LTOTB=Math.max(1,distDe(TTOT));},cam:camBike,
    avanca(dt){AGORA+=dt;if(QUAL!=='C')thHeroi+=dt*RPM[Z]/60*TAU;DESV+=(DESVa-DESV)*Math.min(1,dt*2.2);DESVa=0;const nd=Math.min(LTOTB,distDe(TL)),dz=Math.max(0,nd-DIST);DIST=nd;BGX-=BK.f*.5*rd(Math.floor(DIST/BK.SEG)).c/BK.SEG*(dz/BK.SEG);
      if(DIST>=LTOTB){DIST=LTOTB;return true;}return false;},prog:()=>Math.max(0,Math.min(1,DIST/LTOTB)),irPara(p){DIST=p*LTOTB;OVR=[];FLG.clear();},
    quadro:quadroBike,marcos:marcosBike,poe:poeBike,destino:criaDestinoBike,EVS:()=>EVSB,rotulo:'do percurso',
    CHEG:{estrada:'Mirante do topo',ciclovia:'Parque da orla',campo:'Sede da fazenda'},amb:{estrada:['passaros','araucarias'],ciclovia:['pombos','passaros'],campo:['passaros','vacas']},
    ffIni(){ffVel=Math.max(VELB[Z],(LTOTB-DIST)/14);}}};

const M=()=>MAQS[MAQ];
/* zonas 2 e 4: o protótipo só tinha 1, 3 e 5; os valores do meio são a média dos vizinhos */
function preZ(o){if(!o||o[1]==null||o[3]==null||o[5]==null)return;
  const mix=(a,b)=>{if(typeof a==='number')return (a+b)/2;const r={};for(const k in a)r[k]=typeof a[k]==='number'?(a[k]+b[k])/2:a[k];return r;};
  if(o[2]==null)o[2]=mix(o[1],o[3]);if(o[4]==null)o[4]=mix(o[3],o[5]);}
[ZE,PASSOS,VELB,RPM].forEach(preZ);for(const k in EXS)for(const q in EXS[k])preZ(EXS[k][q]);for(const k in ELI)for(const q in ELI[k])preZ(ELI[k][q]);

function limpa(){DISTV=DIST;SV=S;sujo=true;for(const o of OBJ)o.g.remove();OBJ=[];ordem='';feitos.clear();CAMA=M().cam();M().destino();}
function reinicia(){BK=MAQ==='bike'?BKB:BKE;DISTV=DIST;SV=S;sujo=true;tC=0;M().monta();M().plano();OBJ=[];ordem='';feitos.clear();CAMA=M().cam();M().destino();
  if(CLIM_CEN[CESC].indexOf(CLI)<0)CLI='limpo';ceuMonta();climaMonta();auroraMonta();quadro(0);partMonta();}
/* posição exata no tempo t (início, troca de máquina, anterior/próximo, voltar do minimizado) */
function salta(t){TL=TA=Math.max(0,Math.min(TTOT,t));
  if(MAQ==='escada')S=Math.min(SFIM,S0+distDe(TL));
  else{const L=MAQ==='bike'?LTOTB:MAQ==='eliptico'?LTOTEL:LTOTE;DIST=Math.min(L,distDe(TL));}
  chegou=0;limpa();ceuCor(true);quadro(0);}
function quadro(dt){
  if(ROD&&dt){TL=Math.min(TTOT,TL+dt);TL+=(Math.min(TTOT,TA)-TL)*Math.min(1,dt*1.2);}
  if(ROD&&dt&&!chegou&&M().avanca(dt))chegou=1;
  let desenha=true;if(QUAL==='C'){tC+=dt;desenha=sujo||tC>=2;if(desenha){tC=0;sujo=false;}}
  if(desenha){const c=M().cam();CAMA=c;M().quadro(c,dt);if(QUAL!=='C'||!OBJ.length)M().marcos(c);objetos(c,QUAL==='C'?0:dt);partQuadro(dt);climaQuadro(QUAL==='C'?0:dt);ceuQuadro(QUAL==='C'?2:dt);}
  tUI-=dt;if(tUI<=0||!dt){tUI=.2;partRitmo();ceuCor();}
  if(ROD&&dt&&QUAL!=='C'&&!chegou){tAmb-=dt;if(tAmb<=0){const amb=M().amb[CESC];if(amb&&amb.length)M().poe(amb[Math.floor(Math.random()*amb.length)]);tAmb=QUAL==='A'?rnd(9,13):rnd(13,19);}}}
/* laço: 60 q/s no A, 30 no B; prévia, contagem e fim a 20 q/s (só céu, nuvens e clima mexem) */
let RAF=0,ult=0,fpsN=0,fpsT=0,AO_FPS=null;
function loop(t){RAF=requestAnimationFrame(loop);if(!ult){ult=t;return;}
  const corre=FASE==='run'&&ROD,lim=corre?(QUAL==='A'?1000/62:1000/31):1000/21;
  if(t-ult<lim*.92)return;
  const dt=Math.min(QUAL==='A'?.05:.08,(t-ult)/1000);ult=t;
  if(document.hidden)return;
  quadro(dt);
  if(corre&&AO_FPS){if(!fpsT)fpsT=t;fpsN++;if(t-fpsT>=1000){AO_FPS(Math.round(fpsN*1000/(t-fpsT)));fpsN=0;fpsT=t;}}else{fpsN=0;fpsT=0;}}
function ligar(){if(RAF||!svg)return;ult=0;fpsN=0;fpsT=0;RAF=requestAnimationFrame(loop);}
function desligar(){if(RAF)cancelAnimationFrame(RAF);RAF=0;}
/* elemento do evento do bloco: procura pelo nome na tabela do cenário (todos os papéis) */
let EVOBJ=null;
function acha(nome,papel){const E=(M().EVS()[CESC])||{};const l=E[papel]||[];let e=l.find(x=>x[0]===nome);
  if(!e)for(const p in E){e=E[p].find(x=>x[0]===nome);if(e)break;}return e;}
const API={
  /* o: {maq, cen, cli, ex, qual, blocos:[{z,seg}], t, fase, rod, z, aoFps} */
  montar(host,o){if(svg)API.destruir();
    svg=el('svg',{viewBox:'0 0 390 844',preserveAspectRatio:'xMidYMid slice','aria-hidden':'true',focusable:'false'},host);
    MAQ=o.maq;CESC=o.cen;CLI=o.cli||'limpo';EX=o.ex||'anda';QUAL=reduz?'C':(o.qual||'B');AO_FPS=o.aoFps||null;
    BLZ=(o.blocos||[]).map(b=>({z:Math.max(1,Math.min(5,b.z|0)),seg:Math.max(1,+b.seg||1)}));TTOT=BLZ.reduce((a,b)=>a+b.seg,0)||1;
    Z=o.z||(BLZ[0]?BLZ[0].z:1);FASE=o.fase||'prev';ROD=!!o.rod;
    S=S0;DIST=0;AGORA=0;BGX=0;DESV=0;DESVa=0;OVR=[];FLG.clear();thHeroi=0;gB=0;INCa=0;chegou=0;tAmb=QUAL==='A'?8:12;EVOBJ=null;
    reinicia();if(o.t>0)salta(o.t);
    if(FASE==='run'&&!ROD)desligar();else ligar();},
  fase(f,rod){FASE=f;ROD=f==='run'&&!!rod;
    if(f==='fim'){salta(TTOT);desligar();return;}
    if(f==='run'&&!ROD){quadro(0);desligar();return;}
    ligar();},
  tempo(t){t=Math.max(0,Math.min(TTOT,+t||0));TA=t;if(Math.abs(t-TL)>3)salta(t);},
  zona(z){Z=Math.max(1,Math.min(5,z|0));sujo=true;partRitmo();
    /* nível C: a cena fica parada e só avança na troca de bloco (pula para onde o aluno está) */
    if(QUAL==='C'&&svg){DISTV=DIST;SV=S;limpa();ceuCor(true);quadro(0);}},
  evento(nome,papel){if(!svg||!CAMA)return false;const e=acha(nome,papel);EVOBJ=null;if(!e||!e[1])return false;
    const n0=seq;try{M().poe(e[1],e[2],e);}catch(err){console.warn('[cardio-tema] evento',nome,err);return false;}
    EVOBJ=OBJ.filter(x=>x.id>=n0);if(!RAF)quadro(0);return EVOBJ.length>0;},
  naTela(){if(!EVOBJ||!EVOBJ.length)return null;return EVOBJ.some(x=>OBJ.includes(x));},
  qualidade(q){if(!svg)return;QUAL=reduz?'C':q;const t=TL;reinicia();salta(t);desligar();if(!(FASE==='run'&&!ROD))ligar();},
  destruir(){desligar();try{rajadaLimpa();}catch(e){}if(svg){svg.style.transform='';svg.remove();}svg=null;CAMA=null;OBJ=[];EVOBJ=null;AO_FPS=null;}
};
return API;
})();


/* ==================== ESTADO E API ==================== */
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
  /* v5: B é o padrão (30 q/s); A só em aparelho forte. iPhone começa no B e sobe nada sozinho. */
  if((mem||4)>=8&&cores>=8)return {n:'A',motivo:hw};
  return {n:'B',motivo:hw};
}
/* mede os quadros por segundo enquanto o cardio roda; 3 s seguidos abaixo de 70% da meta → desce um nível */
let warm=0,baixos=0;
function aoMedirFps(fps){
  if(nivelModo!=='auto'||document.hidden||fase!=='run'||!relogio.rodando)return;
  warm++;if(warm<3)return;
  const alvo=nivel==='A'?60:30;
  if(fps<alvo*.7)baixos++;else baixos=0;
  if(baixos>=3){baixos=0;warm=0;setNivel(nivel==='A'?'B':'C',true,'média de '+fps+' q/s');}
}
function setNivel(n,auto,motivo){
  if(n===nivel||!HOST)return;
  const ant=nivel;nivel=n;MOTOR.qualidade(n);
  if(auto)console.info('[cardio-tema] qualidade '+ant+' → '+n+' ('+motivo+')');
}

/* ---------- estado (alimentado pelo app a cada 250 ms) ---------- */
const relogio={rodando:false};let POS=0;
const DET=detectar();
let nivelModo='auto',nivel=DET.n,exAtual='caminhada',modAtual='esteira';
let fase='prev',modo='historia',idxAtual=-1,plano=null,evNaTela=false,BAT=null,BATFN=null;
/* ids do protótipo de costas: só a escadaria da montanha tem nome interno diferente. O log continua com o id do app. */
const CEN_MOTOR={escadaria:'montanha'};
const EX_MOTOR={caminhada:'anda',caminhada_incl:'incl',trote:'trote'};
function paramsMotor(){
  return {maq:modAtual,cen:CEN_MOTOR[plano.cen.id]||plano.cen.id,cli:plano.clima,ex:EX_MOTOR[exAtual]||'anda',qual:nivel,
    blocos:BL.map(b=>({z:NIVEIS[b.nivel].zona,seg:b.seg})),t:fase==='run'||fase==='fim'?POS:0,
    fase,rod:relogio.rodando,z:idxAtual>=0?NIVEIS[BL[idxAtual].nivel].zona:1,aoFps:aoMedirFps};
}
function cenaEl(){return HOST?HOST.querySelector('.cena'):null;}
function montarMotor(){const c=cenaEl();if(!c)return;const box=c.querySelector('.ct-svg');MOTOR.montar(box,paramsMotor());}
function classeCena(){return 'cena'+(modo==='classico'?' oculta':'');}
/* troca de bloco: zona nova e, se o bloco acabou de começar, o elemento do evento entra na cena */
function trocarBlocoCena(i,decorrido){
  idxAtual=i;const b=BL[i],n=NIVEIS[b.nivel],ev=plano.eventos[i],papel=plano.papeis[i];
  MOTOR.zona(n.zona);
  evNaTela=false;
  if(ev&&decorrido<20)evNaTela=MOTOR.evento(ev.t,papel);
}

/* ---------- API ---------- */
function atualizar(s){
  if(!HOST||!plano||!s)return;
  const f=s.fase;POS=Math.max(0,+s.pos||0);
  const rod=f==='run'&&!s.pausado;
  const mudouFase=f!==fase,mudouRod=rod!==relogio.rodando;
  fase=f;relogio.rodando=rod;
  if(f==='prev'||f==='count')idxAtual=-1;
  if(f==='run'&&s.idx>=0&&s.idx<BL.length&&s.idx!==idxAtual)trocarBlocoCena(s.idx,Math.max(0,+s.decorrido||0));
  if(f==='run'||f==='fim')MOTOR.tempo(POS);
  if(mudouFase||mudouRod)MOTOR.fase(f,rod);
  const el=cenaEl();
  if(el){const cls=classeCena()+(el.classList.contains('trocando')?' trocando':'');if(el.className!==cls)el.className=cls;}
}
function destruir(){
  try{MOTOR.destruir();}catch(e){}
  try{if(BAT&&BATFN)BAT.removeEventListener('levelchange',BATFN);}catch(e){}
  if(HOST){HOST.innerHTML='';HOST.classList.remove('ct-host');}
  HOST=null;plano=null;
}
function tema(){return plano?{seed:plano.seed,cen:plano.cen.id,clima:plano.clima,exercicio:exAtual}:null;}
function info(){if(!plano)return null;const cl=CLIMAS[plano.clima]||CLIMAS.limpo,ex=EXERCICIOS[exAtual];
  return {cenario:plano.cen.nome,clima:cl.nome,climaIco:icoClima(cl.ico),exercicio:exAtual,exNome:ex.nome,exCurto:ex.curto,maquina:modAtual};}
/* texto do evento do bloco i: título + frase-motivo (a direção sobe/mantém é a do bloco i) */
function evento(i){
  if(!plano||i<0||i>=BL.length)return null;
  const ev=plano.eventos[i],p=plano.papeis[i],ant=idxAtual;idxAtual=i;let m;try{m=cueDe(ev,p);}finally{idxAtual=ant;}
  return {titulo:ev.t,motivo:m,papel:p,icone:ico(p)};
}
/* o nome do evento vale enquanto o elemento está na tela (sem elemento: 22 s) */
function eventoNaTela(desde){
  if(!evNaTela||nivel==='C')return desde<22;
  const r=MOTOR.naTela();return r==null?desde<22:r;
}
function trocarPlanoCena(np){
  const el=cenaEl();if(el)el.classList.add('trocando');
  plano=np;
  setTimeout(()=>{if(!HOST)return;montarMotor();
    if(fase==='run'&&idxAtual>=0){const i=idxAtual;idxAtual=-1;trocarBlocoCena(i,99);}
    requestAnimationFrame(()=>{const e3=cenaEl();if(e3)e3.classList.remove('trocando');});},320);
}
function sortear(){
  if(!plano)return null;const outros=CENARIOS.filter(c=>c.id!==plano.cen.id&&c.mod===modAtual);if(!outros.length)return tema();
  const cen=outros[Math.floor(Math.random()*outros.length)];
  trocarPlanoCena(gerarPlano(Math.floor(Math.random()*999983)+1,cen.id));return tema();
}
function trocarExercicio(id){
  if(!plano||!EXERCICIOS[id]||id===exAtual)return tema();
  exAtual=id;modAtual=EXERCICIOS[id].maq;
  trocarPlanoCena(gerarPlano(Math.floor(Math.random()*999983)+1));return tema();
}
const I_ZONAS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 19v-5M9.3 19V9M14.6 19v-7M20 19V5"/></svg>';
const I_TEMA='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 19 9 9.5l4 5.5 2.6-3.4L21.5 19Z"/><circle cx="16.5" cy="6" r="2.2"/></svg>';
/* CSS do cenário + a fonte das placas (JetBrains Mono 800), baixada só quando o cardio abre */
function injetarCSS(){
  if(document.getElementById('ct-css'))return;
  const st=document.createElement('style');st.id='ct-css';st.textContent=CSS;document.head.appendChild(st);
  try{if(!document.getElementById('ct-fonte')){const l=document.createElement('link');l.id='ct-fonte';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap';document.head.appendChild(l);}}catch(e){}
}
/* cria o cenário dentro de `host`. Exercício fora do temático → null (o app segue no clássico, sem perguntar). */
function criar(host,o){
  o=o||{};
  const presc=exercicioDoNome(o.exercicio),t0=o.tema||{};
  if(!host||!presc||!o.blocos||!o.blocos.length)return null;
  const ex=(t0.exercicio&&EXERCICIOS[t0.exercicio])?t0.exercicio:presc;
  if(HOST)destruir();
  injetarCSS();
  HOST=host;host.classList.add('ct-host');
  BL=o.blocos.map(b=>({rotulo:b.rotulo||'',nivel:NIVEIS[b.nivel]?b.nivel:'moderado',seg:Math.max(1,+b.seg||1)}));
  INI=[];TOTAL=0;for(const b of BL){INI.push(TOTAL);TOTAL+=b.seg;}
  exAtual=ex;modAtual=EXERCICIOS[ex].maq;
  fase='prev';idxAtual=-1;relogio.rodando=false;POS=0;evNaTela=false;warm=0;baixos=0;
  const t=o.tema||{};
  plano=gerarPlano(t.seed||(Math.floor(Math.random()*999983)+1),(t.cen&&CENARIOS.some(c=>c.id===t.cen&&c.mod===modAtual))?t.cen:null);
  if(t.clima&&CLIMAS[t.clima])plano.clima=t.clima;
  host.innerHTML='<div class="cena"><div class="ct-svg"></div><div class="ct-vinheta"></div><div class="veuprev"></div></div>';
  try{montarMotor();}catch(e){console.warn('[cardio-tema] erro ao montar o motor',e);destruir();return null;}
  try{if(navigator.getBattery)navigator.getBattery().then(bt=>{if(!HOST)return;BAT=bt;BATFN=()=>{if(nivelModo==='auto'&&bt.level<=.2&&!bt.charging&&nivel!=='C')setNivel('C',true,'bateria em '+Math.round(bt.level*100)+'%');};BATFN();bt.addEventListener('levelchange',BATFN);}).catch(()=>{});}catch(e){}
  return {
    atualizar,destruir,tema,info,evento,sortear,trocarExercicio,
    naTela:desde=>eventoNaTela(desde),
    prescrito:()=>presc,
    nivel:()=>nivel
  };
}
window.CardioTema={versao:5,criar,reconhece:n=>!!exercicioDoNome(n),exercicio:n=>exercicioDoNome(n),
  exercicios:Object.keys(EXERCICIOS).map(id=>({id,nome:EXERCICIOS[id].nome,curto:EXERCICIOS[id].curto})),
  icones:{zonas:I_ZONAS,tema:I_TEMA,dado:DADO,pin:PIN}};

})();
