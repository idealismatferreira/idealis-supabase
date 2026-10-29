/* =====================================================================
   IDEALIS · TOUR GUIADO DE PRIMEIRO ACESSO  (tour.js)
   Baixado só quando precisa (oferecer o tour ou tocar no "?").
   O personal fala em balões e mostra o app de uma aluna fictícia, a Ana:
   enquanto o exemplo aparece, o app conversa com um banco de demonstração
   em memória e com uma memória própria, então NADA do aluno é lido ou
   alterado. No fim, volta pro app real do aluno.
   Estado no banco: public.aluno_tours (uma linha por aluno e tour).
   ===================================================================== */
(function(){
"use strict";
if(window.TourIdealis) return;
var TOUR_ID='inicial', TOUR_VERSAO=1, MAX_OFERTAS=2;
var CTX=null;                     /* {alunoId, nome, treinador, sb} vindo do app */
var SIM={};                       /* banco de exemplo da Ana */
SIM.FOTO_ANA='data:image/jpeg;base64,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';

/* ---------- estilo ---------- */
(function(){
  var st=document.createElement('style'); st.id='tour-idealis-css';
  st.textContent="/* ===== camada do tour (só na simulação) ===== */\n.stv-veil{position:fixed;inset:0;z-index:2147483000;background:transparent}\n.stv-spot{position:fixed;z-index:2147483001;pointer-events:none;border-radius:16px;\n  box-shadow:0 0 0 200vmax rgba(3,7,8,.78);outline:1.5px solid rgba(113,252,255,.5);\n  transition:left .5s cubic-bezier(.3,1,.4,1),top .5s cubic-bezier(.3,1,.4,1),width .5s cubic-bezier(.3,1,.4,1),\n    height .5s cubic-bezier(.3,1,.4,1),border-radius .5s,box-shadow .5s,outline-color .5s}\n/* tela inteira: sem véu nem contorno enquanto a pessoa olha a tela */\n.stv-spot.stv-inteira{transition:none;box-shadow:0 0 0 200vmax rgba(3,7,8,0);outline-color:transparent}\n.stv-spot.stv-inteira::after{display:none}\n.stv-ctl{transition:opacity .3s ease}\n.stv-tip.stv-vendo .stv-ctl{visibility:hidden;opacity:0}\n.stv-spot.tap::after{content:'';position:absolute;inset:-5px;border:2px solid #ddff00;border-radius:inherit;\n  animation:stvpul 1.5s ease-out infinite}\n.stv-tip{position:fixed;z-index:2147483002;left:12px;right:12px;max-width:420px;margin:0 auto;\n  display:grid;gap:10px;font-family:'Sora',system-ui,-apple-system,sans-serif;color:#eaf4f4;\n  transition:top .3s cubic-bezier(.3,1.1,.4,1);-webkit-font-smoothing:antialiased}\n/* controles do tour: progresso, capítulo, tempo, sair e a ação do passo */\n.stv-ctl{background:#121a1c;border:1px solid rgba(0,201,204,.45);border-radius:18px;padding:12px 14px;\n  box-shadow:0 18px 40px rgba(0,0,0,.5)}\n/* a fala do Matheus: foto + balão claro (o app é escuro, então a fala nunca se confunde com ele) */\n.stv-fala{display:flex;align-items:center;gap:10px}\n.stv-av,.stv-mfoto{flex:none;display:grid;place-items:center;border-radius:50%;overflow:hidden;background:#1b2527;\n  color:#ddff00;font-weight:800}\n.stv-av{width:58px;height:58px;border:3px solid #ddff00;box-shadow:0 0 0 3px #0b0f10;\n  animation:stvmola .6s cubic-bezier(.2,1.6,.4,1) both}\n.stv-av img,.stv-mfoto img{width:100%;height:100%;object-fit:cover;display:block}\n.stv-bal{position:relative;flex:1;min-width:0;background:#f2f7f7;color:#0b1416;border-radius:18px;padding:11px 14px 12px;\n  box-shadow:0 10px 24px rgba(0,0,0,.45);transform-origin:0 50%;animation:stvcresce .45s .28s cubic-bezier(.2,1.4,.4,1) both}\n.stv-bal::before{content:'';position:absolute;left:-8px;top:50%;margin-top:-8px;border-right:9px solid #f2f7f7;\n  border-top:8px solid transparent;border-bottom:8px solid transparent}\n.stv-nm{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#0a7f81;margin-bottom:2px}\n.stv-bal .stv-tit{font-size:15.5px;font-weight:800;color:#0b1416;margin-bottom:2px}\n.stv-bal .stv-tx{font-size:14px;line-height:1.45;font-weight:600;color:#0b1416}\n.stv-tip.nudge{animation:stvshake .35s}\n.stv-tip button{font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}\n.stv-tip button:focus-visible{outline:2px solid #71fcff;outline-offset:2px}\n/* barra proporcional ao TEMPO: a largura de cada fatia é a duração do capítulo */\n.stv-caps{display:flex;gap:4px;margin-bottom:10px}\n.stv-caps i{flex-shrink:1;flex-basis:0;min-width:8px;height:5px;border-radius:3px;background:rgba(255,255,255,.15);\n  position:relative;overflow:hidden}\n.stv-caps i.at{background:rgba(0,201,204,.35)}\n.stv-caps i b{position:absolute;left:0;top:0;bottom:0;background:#ddff00;border-radius:3px;transition:width .45s ease}\n.stv-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}\n.stv-capl{display:flex;align-items:baseline;gap:8px;font-size:11px;font-weight:700;letter-spacing:.07em;\n  text-transform:uppercase;color:#71fcff}\n.stv-capl span{color:#93a4a6;letter-spacing:0;text-transform:none;font-weight:500;font-variant-numeric:tabular-nums}\n.stv-sair{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px;border-radius:999px;\n  border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#eaf4f4;font-size:13px;font-weight:600;white-space:nowrap}\n.stv-sair svg{width:14px;height:14px;flex:none}\n.stv-demo{display:inline-block;font-size:11px;font-weight:600;color:#ddff00;background:rgba(221,255,0,.1);\n  border:1px solid rgba(221,255,0,.4);border-radius:999px;padding:2px 9px;margin-bottom:8px}\n.stv-tit{font-size:16.5px;font-weight:700;margin-bottom:4px;text-wrap:balance}\n.stv-tx{font-size:14px;line-height:1.55;color:#cfdcdd}\n\n/* \"Toque em…\": a ação do passo, grande e no centro */\n.stv-cta{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:52px;margin-top:4px;\n  padding:12px 14px;border-radius:14px;border:2px solid #ddff00;background:rgba(221,255,0,.1);color:#ddff00;\n  font-size:16px;font-weight:800;line-height:1.25;text-align:center;animation:stvglow 1.8s ease-in-out infinite}\n.stv-seta{display:grid;place-items:center;width:30px;height:30px;flex:none;border-radius:50%;background:#ddff00;color:#0b0f10}\n.stv-seta svg{width:18px;height:18px;display:block;animation:stvbob 1s ease-in-out infinite}\n.stv-tip.acima .stv-seta{transform:rotate(180deg)}\n.stv-pular{background:none;border:0;color:#93a4a6;font-size:13px;font-weight:600;padding:10px 6px}\n.stv-pular.stv-centro{display:block;margin:4px auto -4px}\n.stv-ft{display:flex;align-items:center;gap:8px;margin-top:4px}\n.stv-go{margin-left:auto;height:44px;padding:0 22px;border-radius:999px;border:0;background:#ddff00;color:#0b0f10;\n  font-weight:800;font-size:14.5px}\n\n/* boas-vindas */\n.stv-tip.stv-boas .stv-wel{background:#121a1c;border:1px solid rgba(221,255,0,.45);border-radius:20px;padding:24px 20px 14px;\n  text-align:center;box-shadow:0 18px 40px rgba(0,0,0,.5)}\n.stv-mfoto{width:96px;height:96px;border:3px solid #ddff00;box-shadow:0 0 0 4px #121a1c;font-size:36px;\n  animation:stvmola .6s cubic-bezier(.2,1.6,.4,1) both}\n.stv-wbal{position:relative;margin-top:16px;background:#f2f7f7;color:#0b1416;border-radius:18px;padding:13px 16px;\n  font-size:15.5px;line-height:1.45;font-weight:600;text-wrap:balance;transform-origin:50% 0;\n  animation:stvcresce .45s .28s cubic-bezier(.2,1.4,.4,1) both}\n.stv-wbal::before{content:'';position:absolute;top:-8px;left:50%;margin-left:-8px;border-bottom:9px solid #f2f7f7;\n  border-left:8px solid transparent;border-right:8px solid transparent}\n.stv-wbal b{display:block;font-size:19px;font-weight:800;margin-bottom:2px}\n.stv-tip.stv-boas .stv-anacard{padding-top:18px}\n.stv-wel{display:flex;flex-direction:column;align-items:center}\n.stv-wtit{margin-top:8px;font-size:22px;font-weight:800;line-height:1.2;letter-spacing:-.01em;text-wrap:balance}\n.stv-wtx{margin-top:10px;font-size:14px;line-height:1.55;color:#cfdcdd;max-width:330px}\n.stv-go.stv-big{margin:20px 0 0;width:100%;height:52px;font-size:16px}\n.stv-wel .stv-pular{margin-top:6px}\n/* apresentação da Ana */\n.stv-ana{width:96px;height:96px;border-radius:50%;overflow:hidden;display:grid;place-items:center;\n  border:3px solid #00c9cc;background:linear-gradient(135deg,#00c9cc,#71fcff);color:#04191a;font-size:38px;font-weight:800}\n.stv-ana img{width:100%;height:100%;object-fit:cover;display:block}\n.stv-anome{margin-top:12px;font-size:20px;font-weight:800}\n.stv-wel .stv-demo{margin:6px 0 0}\n\n/* comemoração (usa o card do app) */\n.stv-cel{z-index:2147483004}\n\n@keyframes stvpul{from{opacity:.95;transform:scale(1)}to{opacity:0;transform:scale(1.06)}}\n@keyframes stvbob{50%{transform:translateY(-3px)}}\n@keyframes stvglow{0%,100%{box-shadow:0 0 0 0 rgba(221,255,0,0)}50%{box-shadow:0 0 0 5px rgba(221,255,0,.14)}}\n@keyframes stvshake{20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}\n@media (prefers-reduced-motion:reduce){.stv-spot,.stv-tip{transition:none}.stv-av,.stv-bal,.stv-mfoto,.stv-wbal{animation:none}\n  .stv-spot.tap::after,.stv-seta svg,.stv-cta,.stv-tip.nudge{animation:none}}\n@keyframes stvmola{from{opacity:0;transform:translateY(40px) scale(.7)}}\n@keyframes stvcresce{from{opacity:0;transform:scale(.4)}}\n/* confirmação de saída */\n.stv-conf{animation:stvcresce .25s cubic-bezier(.2,1.3,.4,1)}\n.stv-ctit{font-size:16px;font-weight:800;text-align:center;padding:6px 4px 10px;text-wrap:balance}\n.stv-conf .stv-ft{margin-top:6px}\n.stv-sairok{background:#ff6b6b;color:#1a0505}\n.stv-tip[hidden]{display:none}\n/* aviso de última oferta na boas-vindas */\n.stv-ultima{margin-top:12px;padding:9px 12px;border-radius:12px;background:rgba(221,255,0,.08);\n  border:1px solid rgba(221,255,0,.35);color:#eaf4f4;font-size:13px;line-height:1.45;text-wrap:balance}\n.stv-ultima b,.stv-wbal b{font-weight:800}\n.stv-q{display:inline-grid;place-items:center;width:21px;height:21px;border-radius:50%;border:1.5px solid #0a7f81;\n  color:#0a7f81;font-weight:800;font-size:12.5px;line-height:1;vertical-align:1px}\n.stv-ultima .stv-q{border-color:#ddff00;color:#ddff00}\n";
  document.head.appendChild(st);
})();

/* =====================================================================
   BANCO DE EXEMPLO DA ANA (o mesmo da simulação aprovada)
   ===================================================================== */
var BANCO=(function(){
/* ---------- datas relativas a hoje ---------- */
function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
var HOJE = new Date(); HOJE.setHours(12,0,0,0);
function dia(off){ var d=new Date(HOJE); d.setDate(d.getDate()+off); return d; }
function isoOff(off){ return iso(dia(off)); }
function segunda(d){ var x=new Date(d); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; }

var n=0; function id(p){ n++; return 'sim-'+p+'-'+String(n).padStart(5,'0'); }

/* ---------- catálogo (mesma tabela public.cardapio) ---------- */
var CARD = [
  {id:9101, exercicio:'Leg 45 Meio Sumô',              grupos:['Quadríceps','Glúteos']},
  {id:9102, exercicio:'Remada baixa',                  grupos:['Costas']},
  {id:9103, exercicio:'Elevação pélvica',              grupos:['Glúteos']},
  {id:9104, exercicio:'Supino reto com halteres',      grupos:['Peitoral']},
  {id:9105, exercicio:'Puxada frontal',                grupos:['Costas']},
  {id:9106, exercicio:'Desenvolvimento com halteres',  grupos:['Deltoides']},
  {id:9107, exercicio:'Cadeira extensora',             grupos:['Quadríceps']},
  {id:9108, exercicio:'Mesa flexora',                  grupos:['Posteriores']},
  {id:9109, exercicio:'Abdominal supra',               grupos:['Abdômen']}
].map(function(c){ return {id:c.id, exercicio:c.exercicio, grupos:c.grupos,
  /* o vídeo do Leg 45 Meio Sumô entra depois, vindo do cardápio real */
  video_url:null, arquivado_em:null}; });

/* prescrição de cada sessão: [cardapio_id, séries, descanso, carga inicial F1, carga F2 (lista por sessão), reps alvo] */
var PLANO = {
  A:[ [9101,'4 × 8 a 10','90'], [9102,'3 × 10 a 12','60'], [9103,'3 × 10 a 12','60'] ],
  B:[ [9104,'3 × 8 a 12','90'], [9105,'3 × 10 a 12','60'], [9106,'3 × 10 a 12','60'] ],
  C:[ [9107,'3 × 10 a 12','90'], [9108,'3 × 10 a 12','60'], [9109,'3 × 15 a 20','45'] ]
};
function nomeCard(cid){ for(var i=0;i<CARD.length;i++) if(CARD[i].id===cid) return CARD[i].exercicio; return ''; }
function topo(series){ var m=String(series).match(/(\d+)\s*$/); return m?parseInt(m[1],10):10; }
function nSeries(series){ return parseInt(String(series),10)||3; }

/* ---------- tabelas ---------- */
var T = {}, ALUNO, USER, sessao={user:null};
SIM.tabelas = T;
function construir(QUEM){
Object.keys(T).forEach(function(k){ delete T[k]; });
Object.assign(T, {
  perfis:[], alunos:[], fases:[], treinos:[], exercicios:[], logs:[], sessoes:[],
  relatos:[], acessos:[], modalidades:[], vw_alunos_segmentados:[], vw_planejamento_doc:[],
  academias:[], aluno_academias:[], v_semana_atual:[], dores:[], avaliacoes:[],
  checkins_semanais:[], correcoes:[], cardapio:CARD, metodos:[],
  treino_semaforo:[], treino_retrospectiva:[]
});
ALUNO = QUEM==='julia' ? 'sim-aluno-julia' : 'sim-aluno-ana';
USER  = QUEM==='julia' ? 'sim-user-julia'  : 'sim-user-ana';
SIM.alunoId = ALUNO; SIM.quem = QUEM;
sessao.user = {id:USER, email:QUEM+'@exemplo.com'};
T.perfis.push({user_id:USER, papel:'aluno', aluno_id:ALUNO});
T.v_semana_atual.push({semana:6, dias_corridos:38, inicio:isoOff(-38)});

function criarTreinos(faseId, sufixo){
  var out={};
  ['A','B','C'].forEach(function(L,i){
    var tid=id('tr');
    T.treinos.push({id:tid, aluno_id:ALUNO, nome:'Treino '+L, ordem:i, concluido_data:null, fase_id:faseId, eh_cardio:false});
    out[L]={id:tid, exs:PLANO[L].map(function(p,j){
      var eid=id('ex');
      T.exercicios.push({id:eid, treino_id:tid, nome:nomeCard(p[0]), series:p[1], cardapio_id:p[0], ordem:j,
        done_date:null, descanso:p[2], filmar:false, observacao:null, metodo:null, cardio:null,
        isometria:null, grupo:null, audio_url:null});
      return {id:eid, cid:p[0], series:p[1]};
    })};
  });
  return out;
}

if(QUEM==='julia'){
  /* aluna nova: plano pronto, nenhum dado ainda */
  T.alunos.push({id:ALUNO, nome:'Julia Martins', foto_url:'', academia:'', nascimento:'1997-03-21', fc_max:null});
  var fj1=id('fase'), fj2=id('fase');
  T.fases.push({id:fj1, aluno_id:ALUNO, nome:'Adaptação', objetivo:'Aprender os movimentos e criar o hábito de treinar.', inicio:isoOff(0), fim:isoOff(27)});
  T.fases.push({id:fj2, aluno_id:ALUNO, nome:'Hipertrofia', objetivo:'Ganhar massa muscular com progressão de carga.', inicio:isoOff(28), fim:isoOff(69)});
  criarTreinos(fj1);
  var pj=id('plan');
  T.vw_planejamento_doc.push(
    {planejamento_id:pj, aluno_id:ALUNO, titulo:'Planejamento', data_emissao:isoOff(-1), duracao_semanas:10, fase_id:fj1, posicao:1, fase_nome:'Adaptação', inicio:isoOff(0), fim:isoOff(27), objetivo:'Aprender os movimentos e criar o hábito de treinar.', metodos:'Séries tradicionais\nFoco em técnica', observacao:'', categoria:'', categoria_cor:'', situacao:'ativa', dias_restantes:27},
    {planejamento_id:pj, aluno_id:ALUNO, titulo:'Planejamento', data_emissao:isoOff(-1), duracao_semanas:10, fase_id:fj2, posicao:2, fase_nome:'Hipertrofia', inicio:isoOff(28), fim:isoOff(69), objetivo:'Ganhar massa muscular com progressão de carga.', metodos:'', observacao:'', categoria:'', categoria_cor:'', situacao:'futura', dias_restantes:null}
  );
} else {
  /* ===== ANA: 2 meses de Idealis, dor no joelho direito que melhorou ===== */
  T.alunos.push({id:ALUNO, nome:'Ana Ribeiro', foto_url:(SIM.FOTO_ANA||''), academia:'', nascimento:'1993-08-14', fc_max:null});
  var f1=id('fase'), f2=id('fase'), f3=id('fase');
  T.fases.push({id:f1, aluno_id:ALUNO, nome:'Adaptação', objetivo:'Aprender os movimentos e reduzir a dor no joelho.', inicio:isoOff(-58), fim:isoOff(-31)});
  T.fases.push({id:f2, aluno_id:ALUNO, nome:'Hipertrofia', objetivo:'Ganhar massa muscular com progressão de carga e técnica sólida nos exercícios principais.', inicio:isoOff(-30), fim:isoOff(12)});
  T.fases.push({id:f3, aluno_id:ALUNO, nome:'Força', objetivo:'Subir as cargas principais com menos repetições.', inicio:isoOff(13), fim:isoOff(40)});
  var tr1=criarTreinos(f1), tr2=criarTreinos(f2);

  /* agenda: terça, quinta e sábado, de ontem para trás, em C-B-A.
     O mais recente é sempre o C, então o "Próximo" do app cai no A. */
  var datas=[], letras=['C','B','A'], g=0;
  for(var off=-1; off>=-58; off--){
    var dw=dia(off).getDay();
    if(dw===2||dw===4||dw===6){ datas.unshift({off:off, L:letras[g%3]}); g++; }
  }
  var falta={}; [3,9,15].forEach(function(i){ if(datas[i]) falta[datas[i].off]=1; });
  datas=datas.filter(function(x){ return !falta[x.off]; });

  /* progressão por FASE: [início F1, fim F1, início F2, fim F2, degrau].
     Dentro de cada fase a carga sobe em degraus; as duas últimas sessões
     da fase 2 ficam no valor final (é o que o app usa para sugerir subir). */
  var PROG = { 9101:[50,75,80,110,5], 9102:[30,37.5,40,45,2.5], 9103:[30,45,45,60,5],
               9104:[8,10,10,14,2],      9105:[30,35,37.5,42.5,2.5], 9106:[6,8,8,10,2],
               9107:[20,30,30,40,5]   ,  9108:[20,25,25,35,5],    9109:[0,0,0,0,1] };
  /* dor no Leg 45 Meio Sumô (joelho D): sobe no fim da fase 1, cai ao longo da fase 2 */
  var DOR = { f1:[2,3,4,5], f2:[5,4,3,2,1,0] };
  function interp(a,b,i,N,passo,segurarFim){
    if(N<=1) return b;
    var M = segurarFim ? Math.max(1,N-2) : N-1;      // sessões até chegar ao topo
    var t = Math.min(1, i/M), v=a+(b-a)*t;
    return Math.round(v/passo)*passo;
  }
  var total={};
  datas.forEach(function(x){ var f=x.off>=-30?2:1; total[x.L+f]=(total[x.L+f]||0)+1; });
  var k_={};
  datas.forEach(function(x){
    var data=isoOff(x.off), fase=x.off>=-30?2:1;
    var tr=(fase===2?tr2:tr1)[x.L];
    var chave=x.L+fase, idx=(k_[chave]=(k_[chave]||0)+1)-1, N=total[chave], deFim=N-1-idx;
    var dur = 46 + ((x.off*7)%9+9)%9 + (x.L==='A'?6:0);
    T.sessoes.push({id:id('ses'), aluno_id:ALUNO, treino_id:tr.id, data:data, origem:'manual', duracao:dur});
    T.acessos.push({id:id('ace'), aluno_id:ALUNO, treino_id:tr.id, data:data, vezes:1});
    tr.exs.forEach(function(ex){
      var k=ex.cid, P=PROG[k];
      var c = fase===1 ? interp(P[0],P[1],idx,N,P[4],false) : interp(P[2],P[3],idx,N,P[4],true);
      var ns=nSeries(ex.series), tp=topo(ex.series);
      /* só Leg 45 Meio Sumô e elevação pélvica fecham a faixa duas vezes seguidas:
         são os dois que o app vai sugerir subir */
      var fecha = fase===2 && ((k===9101||k===9103) ? deFim<=1 : deFim===0);
      var dl = fase===1 ? DOR.f1 : DOR.f2;
      var dorS = (k===9101) ? dl[Math.round(Math.min(1, idx/Math.max(1,N-1))*(dl.length-1))] : 0;
      for(var s=1; s<=ns; s++){
        var reps = fecha ? tp : tp-1-((s+idx)%3);
        var esf = 6 + ((s+idx)%3);                       // 6-8, nunca 9
        T.logs.push({id:id('log'), exercicio_id:ex.id, data:data,
          carga: c? (String(c).replace('.',',')+'kg') : '', reps:String(k===9109?18:reps),
          intensidade:esf, dor:dorS, dor_local:(dorS>=1?'joelho':null), dor_lado:(dorS>=1?'d':null),
          variante:null, serie:s, extra:null});
      }
    });
  });

  /* dor acompanhada + check-ins semanais (média caindo) */
  var dorId=id('dor');
  T.dores.push({id:dorId, aluno_id:ALUNO, regiao:'joelho_d', vista:'frente', apelido:'', ativa:true});
  T.avaliacoes.push({id:id('av'), aluno_id:ALUNO, momento:'D0', data:isoOff(-56), status:'respondida'});
  T.avaliacoes.push({id:id('av'), aluno_id:ALUNO, momento:'D28', data:isoOff(-34), status:'respondida'});
  var medias=[6,6,5,5,4,3,2,2];
  for(var w=8; w>=1; w--){
    var ref=iso(segunda(dia(-7*w)));
    T.checkins_semanais.push({id:id('chk'), aluno_id:ALUNO, dor_id:dorId, semana_ref:ref,
      dor_media:medias[8-w], limitacao:Math.max(0,medias[8-w]-1)});
  }

  /* correção do Matheus na remada, ainda não vista */
  T.correcoes.push({id:id('cor'), aluno_id:ALUNO, cardapio_id:9102, exercicio_nome:'Remada baixa',
    exercicio_chave:'remada baixa',
    texto:'Procura sempre remar com os cotovelos até a linha do corpo.',
    audio_url:null, treino_id:tr2.A.id, criado_em:dia(-4).toISOString(), editada_em:null, vista_em:null, arquivada_em:null});

  /* planejamento (view vw_planejamento_doc): uma linha por fase */
  var pl=id('plan');
  T.vw_planejamento_doc.push(
    {planejamento_id:pl, aluno_id:ALUNO, titulo:'Planejamento', data_emissao:isoOff(-59), duracao_semanas:14, fase_id:f1, posicao:1, fase_nome:'Adaptação', inicio:isoOff(-58), fim:isoOff(-31), objetivo:'Aprender os movimentos e reduzir a dor no joelho.', metodos:'Séries tradicionais\nCadência controlada', observacao:'', categoria:'', categoria_cor:'', situacao:'encerrada', dias_restantes:null},
    {planejamento_id:pl, aluno_id:ALUNO, titulo:'Planejamento', data_emissao:isoOff(-59), duracao_semanas:14, fase_id:f2, posicao:2, fase_nome:'Hipertrofia', inicio:isoOff(-30), fim:isoOff(12), objetivo:'Ganhar massa muscular com progressão de carga e técnica sólida nos exercícios principais.', metodos:'Progressão dupla\nDescanso de 60 a 90s', observacao:'', categoria:'', categoria_cor:'', situacao:'ativa', dias_restantes:12},
    {planejamento_id:pl, aluno_id:ALUNO, titulo:'Planejamento', data_emissao:isoOff(-59), duracao_semanas:14, fase_id:f3, posicao:3, fase_nome:'Força', inicio:isoOff(13), fim:isoOff(40), objetivo:'Subir as cargas principais com menos repetições.', metodos:'', observacao:'', categoria:'', categoria_cor:'', situacao:'futura', dias_restantes:null}
  );
}
} /* fim de construir */
SIM.carregar = construir;

/* ---------- cliente falso: mesma API que o app usa ---------- */
function copia(o){ return JSON.parse(JSON.stringify(o)); }
function Query(tabela){
  this.t=tabela; this.f=[]; this.ord=[]; this.rg=null; this.op='select'; this.dados=null; this.opts={}; this.um=false;
}
Query.prototype.select=function(){ return this; };
Query.prototype.eq=function(k,v){ this.f.push(function(r){ return r[k]===v || String(r[k])===String(v); }); return this; };
Query.prototype.in=function(k,arr){ this.f.push(function(r){ return (arr||[]).some(function(v){ return String(v)===String(r[k]); }); }); return this; };
Query.prototype.order=function(cols,o){
  var asc=!(o && o.ascending===false), self=this;
  String(cols).split(',').forEach(function(c){ self.ord.push({c:c.trim(), asc:asc}); });
  return this;
};
Query.prototype.range=function(a,b){ this.rg=[a,b]; return this; };
Query.prototype.limit=function(x){ this.rg=[0,x-1]; return this; };
Query.prototype.maybeSingle=function(){ this.um=true; return this; };
Query.prototype.single=function(){ this.um=true; return this; };
Query.prototype.upsert=function(d,o){ this.op='upsert'; this.dados=d; this.opts=o||{}; return this; };
Query.prototype.insert=function(d){ this.op='upsert'; this.dados=d; this.opts={ignoreDuplicates:true}; return this; };
Query.prototype.update=function(d){ this.op='update'; this.dados=d; return this; };
Query.prototype.delete=function(){ this.op='delete'; return this; };
Query.prototype._run=function(){
  var tab = T[this.t] = T[this.t] || [], self=this;
  var passa=function(r){ return self.f.every(function(fn){ return fn(r); }); };
  if(this.op==='select'){
    var rows=tab.filter(passa).map(copia);
    if(this.ord.length) rows.sort(function(a,b){
      for(var i=0;i<self.ord.length;i++){
        var o=self.ord[i], x=a[o.c], y=b[o.c];
        if(x==y) continue;
        if(x==null) return 1; if(y==null) return -1;
        var c = (x<y?-1:1); return o.asc?c:-c;
      }
      return 0;
    });
    if(this.rg) rows=rows.slice(this.rg[0], this.rg[1]+1);
    if(this.um) return {data:rows[0]||null, error:null};
    return {data:rows, error:null};
  }
  if(this.op==='upsert'){
    var lista=Array.isArray(this.dados)?this.dados:[this.dados];
    var chaves=this.opts.onConflict ? String(this.opts.onConflict).split(',').map(function(s){return s.trim();}) : ['id'];
    lista.forEach(function(d){
      var ja=tab.find(function(r){ return chaves.every(function(k){ return String(r[k])===String(d[k]); }); });
      if(ja){ if(!self.opts.ignoreDuplicates) Object.assign(ja, copia(d)); }
      else tab.push(copia(d));
    });
    return {data:null, error:null};
  }
  if(this.op==='update'){
    var dd=this.dados; tab.filter(passa).forEach(function(r){ Object.assign(r, copia(dd)); });
    return {data:null, error:null};
  }
  if(this.op==='delete'){
    T[this.t]=tab.filter(function(r){ return !passa(r); });
    return {data:null, error:null};
  }
  return {data:null, error:null};
};
Query.prototype.then=function(ok,falha){
  var self=this;
  return new Promise(function(res){ setTimeout(function(){ res(self._run()); }, 25); }).then(ok,falha);
};

var ouvintes=[];
var cliente={
  from:function(t){ return new Query(t); },
  rpc:function(nome,args){
    var r={data:null, error:null};
    if(nome==='salvar_avaliacao') r.data={ok:true, avaliacao_id:id('av')};
    if(nome==='audios_expirados') r.data=[];
    return Promise.resolve(r);
  },
  storage:{ from:function(){ return {
    upload:function(){ return Promise.resolve({data:{}, error:null}); },
    remove:function(){ return Promise.resolve({data:[], error:null}); },
    getPublicUrl:function(p){ return {data:{publicUrl:'about:blank#'+p}}; }
  }; } },
  auth:{
    getSession:function(){ return Promise.resolve({data:{session:sessao}, error:null}); },
    onAuthStateChange:function(cb){ ouvintes.push(cb); return {data:{subscription:{unsubscribe:function(){}}}}; },
    signInWithPassword:function(){ return Promise.resolve({data:{session:sessao}, error:null}); },
    signOut:function(){ return Promise.resolve({error:null}); },
    refreshSession:function(){ return Promise.resolve({data:{session:sessao}, error:null}); },
    startAutoRefresh:function(){},
    stopAutoRefresh:function(){}
  }
};

return {cliente:cliente, CARD:CARD};
})();
var cliente=BANCO.cliente, CARD=BANCO.CARD;

/* =====================================================================
   ENTRAR / SAIR DO EXEMPLO
   ===================================================================== */
var MEM=null, LS_DONO=null, LS_DESC=null, FETCH_REAL=null;
/* memória própria do exemplo: o app da Ana nunca encosta no cache do aluno */
function instalarMemoria(){
  var dados={};
  /* leva junto só as preferências visuais do aluno (tema, cartão de instalar) */
  try{ ['idealis_tema_v1','idealis_instalar_v1'].forEach(function(k){
    var v=window.localStorage.getItem(k); if(v!=null) dados[k]=v; }); }catch(e){}
  var mem={
    getItem:function(k){ k=String(k); return Object.prototype.hasOwnProperty.call(dados,k)?dados[k]:null; },
    setItem:function(k,v){ dados[String(k)]=String(v); },
    removeItem:function(k){ delete dados[String(k)]; },
    clear:function(){ dados={}; },
    key:function(i){ return Object.keys(dados)[i]||null; }
  };
  Object.defineProperty(mem,'length',{get:function(){ return Object.keys(dados).length; }});
  var o=window; while(o && !Object.prototype.hasOwnProperty.call(o,'localStorage')) o=Object.getPrototypeOf(o);
  LS_DONO=o||null; LS_DESC=o?Object.getOwnPropertyDescriptor(o,'localStorage'):null;
  try{ Object.defineProperty(window,'localStorage',{value:mem, configurable:true, writable:false}); }
  catch(e){ console.warn('[tour] não deu pra separar a memória do exemplo', e); return false; }
  if(window.localStorage!==mem){ restaurarMemoria(); return false; }
  MEM=mem; return true;
}
function restaurarMemoria(){
  try{
    if(LS_DONO===window && LS_DESC) Object.defineProperty(window,'localStorage',LS_DESC);
    else delete window.localStorage;
  }catch(e){ console.warn('[tour] erro ao devolver a memória do aluno', e); }
  MEM=null;
}
/* sem rede externa no exemplo (ex.: backup em planilha do Apps Script) */
function bloquearRede(){
  FETCH_REAL=window.fetch;
  window.fetch=function(url){
    var u=String(url && url.url || url || '');
    if(/^https?:/i.test(u) && u.indexOf(location.origin)!==0)
      return Promise.reject(new TypeError('Failed to fetch (tour)'));
    return FETCH_REAL.apply(this, arguments);
  };
}
function liberarRede(){ if(FETCH_REAL){ window.fetch=FETCH_REAL; FETCH_REAL=null; } }
/* vídeo e músculos de verdade do Leg 45 Meio Sumô, se o cardápio tiver */
async function buscarExemploReal(){
  if(!CTX || !CTX.sb) return;
  try{
    var r=await Promise.race([
      CTX.sb.from('cardapio').select('exercicio,grupos,video_url').ilike('exercicio','%meio sum%').limit(1),
      dormir(2500).then(function(){ return null; })
    ]);
    var c=r && r.data && r.data[0];
    if(!c) return;
    CARD.forEach(function(x){ if(x.id===9101){
      if(c.video_url) x.video_url=c.video_url;
      if(c.grupos && c.grupos.length) x.grupos=c.grupos;
    }});
  }catch(e){}
}
function naTelaInicial(){ return $('.duplobtn') || $('.fasecard'); }
async function entrarDemo(){
  if(!window.__idealisTrocarBanco || !window.__idealisRemontar) return false;
  await buscarExemploReal();
  if(!instalarMemoria()) return false;
  bloquearRede();
  try{ CTX.sb.auth.stopAutoRefresh(); }catch(e){}
  SIM.carregar('ana');
  T.demo=true; window.__idealisDemo=true;
  window.__idealisTrocarBanco(cliente);
  window.scrollTo(0,0);
  window.__idealisRemontar();
  await dormir(150);
  await esperar(naTelaInicial, 10000);
  await dormir(400);
  return true;
}
async function sairDemo(){
  if(!T.demo) return true;
  window.__idealisTrocarBanco(null);
  restaurarMemoria();
  liberarRede();
  T.demo=false; window.__idealisDemo=false;
  try{ CTX.sb.auth.startAutoRefresh(); }catch(e){}
  window.scrollTo(0,0);
  window.__idealisRemontar();
  await dormir(150);
  await esperar(naTelaInicial, 10000);
  await dormir(400);
  if(PENDENTE){ var p=PENDENTE; PENDENTE=null; enviar(p); }
  return true;
}

/* =====================================================================
   MOTOR DO TOUR (o mesmo da simulação aprovada)
   ===================================================================== */
var CAPS = ['Início','Treino','Agenda','Progresso','Plano','Dor','Você'];

/* ---------- utilidades ---------- */
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function txt(e){ return (e && e.textContent || '').replace(/\s+/g,' ').trim(); }
function comTexto(sel, t){ return $$(sel).filter(function(e){ return txt(e).indexOf(t)>=0; })[0] || null; }
function campo(lab){ return $$('.sheet .field').filter(function(f){ var l=f.querySelector('.reglab'); return l && txt(l).indexOf(lab)===0; })[0] || null; }
function botaoN(f, n){ return f ? ($$('.scale button', f).filter(function(b){ return txt(b)===String(n); })[0] || null) : null; }
function atalho(i){ return $$('.duplobtn .agbtn')[i] || null; }
function dormir(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function esperar(fn, ms){
  var fim=Date.now()+(ms||3000);
  return new Promise(function(ok){
    (function tenta(){
      var v=null; try{ v=fn(); }catch(e){}
      if(v && (!Array.isArray(v) || v.length)) return ok(v);
      if(Date.now()>fim) return ok(null);
      setTimeout(tenta, 80);
    })();
  });
}
function hojeISO(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function faseAtual(){
  var h=hojeISO(), fs=(SIM.tabelas&&SIM.tabelas.fases)||[];
  return (fs.filter(function(f){ return f.inicio<=h && f.fim>=h; })[0]||{}).id || null;
}
function nav(v){ if(window.__idealisNav) window.__idealisNav(v); }
/* fora do exemplo, a home é a do próprio aluno */
function irHome(){ nav({name:'student', studentId: T.demo ? SIM.alunoId : CTX.alunoId}); }
function irFase(){ nav({name:'student', studentId:SIM.alunoId, faseId:faseAtual()}); }
/* digita num campo controlado pelo React (o setter nativo + evento input) */
function digitar(el, texto){
  var set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
  var rapido=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return new Promise(function(ok){
    var i=rapido?texto.length:0;
    (function passo(){
      i=Math.min(texto.length, i+2);
      set.call(el, texto.slice(0,i)); el.dispatchEvent(new Event('input',{bubbles:true}));
      if(i<texto.length) setTimeout(passo, 28); else ok();
    })();
  });
}
async function abrirLeg(){
  var r=await esperar(function(){ return $('.exrow'); }, 3000);
  if(r && r.classList.contains('recolhido')){ var t=$('.extgl', r); if(t) t.click(); await dormir(250); }
}
async function expandirTreinoA(){
  if($('.crcard')){ var v=$('.topbar .iconbtn'); if(v) v.click(); }
  var tr=await esperar(function(){ return $('.treino.proximo'); }, 3000);
  if(tr && !$('.trwrap.aberto')){ tr.click(); await dormir(200); }
}
async function noTreino(){
  if(!$('.trwrap') && !$('.exrow')) irFase();
  await esperar(function(){ return $('.treino.proximo'); }, 3000);
}
async function naHome(){
  /* o descanso que ficou rodando do treino cobriria o topo das telas seguintes */
  var rt=$('.rtrunning'); if(rt){ rt.click(); await dormir(150); }
  if(!$('.duplobtn')){ irHome(); await esperar(function(){ return $('.duplobtn'); }, 3000); }
  window.scrollTo(0,0);
}

/* ---------- roteiro ---------- */
var TEXTO_RELATO='Senti o joelho direito na descida da 1ª série, mas passou rápido.';
var STEPS = [
  /* boas-vindas: aparece por cima do app do próprio aluno, antes de trocar para a Ana.
     (julia:true = passo no app REAL do aluno; o resto roda no app de exemplo) */
  {c:0, julia:true, boasvindas:true, pre:naHome, tit:'Boas-vindas ao meu app!',
    tx:'Quer conhecer as funcionalidades em um tour guiado?', sub:'Leva uns {min} minutos.', btn:'Bora!', acao:'ana'},
  /* resposta ao "Bora!": já no app da Ana, antes do primeiro destaque */
  {c:0, apresenta:true, pre:naHome, tx:'Pra iniciar, vou usar o app da Ana, uma aluna fictícia de exemplo.', btn:'Vamos lá'},
  {c:0, ver:true, pre:naHome, spot:'.fasecard', tap:'.fasecard', tx:'Os treinos ficam dentro da fase.', hint:'Toque na fase'},

  {c:1, ver:true, pre:noTreino, spot:'.treino.proximo', tap:'.treino.proximo', tx:'O app marca qual é o próximo treino da sequência.', hint:'Toque no Treino A'},
  {c:1, pre:expandirTreinoA, spot:'.trwrap.aberto .trabas', tit:'Chegou correção',
    tx:'Quando você me manda vídeo da execução e eu corrijo algum exercício do seu treino, a correção fica destacada aqui, antes de você entrar no treino.'},
  {c:1, pre:expandirTreinoA, spot:'.trwrap.aberto .trab.principal', tap:'.trwrap.aberto .trab.principal', tx:'Agora sim, bora treinar.', hint:'Toque em Acessar treino'},
  {c:1, ver:true, opcional:true, aguarda:3500, spot:'.dlg.retro2', tap:'.dlg.retro2 .rtopt', tit:'Como o joelho reagiu?', tx:'Quem acompanha uma dor responde isto ao abrir o treino: como a região ficou depois do anterior.', hint:'Toque na 1ª opção'},
  {c:1, opcional:true, spot:'.dlg.retro2', tap:'.dlg.retro2 .dlgacts .btn:not(.ghost)', tx:'Um toque e pronto. A resposta chega pra mim.', hint:'Toque em Enviar'},
  {c:1, ver:true, opcional:true, spot:'.ptwrap', tit:'Dá pra subir a carga',
    tx:'Do mesmo jeito que faço com meus alunos de personal, criei uma fórmula que calcula se você pode tentar aumentar o peso, com base nas repetições, no peso, no esforço e na dor dos treinos anteriores.'},
  /* LOTE_TOUR_TRILHA: começar o treino pelo botão novo (pula se ele não estiver na tela) */
  {c:1, opcional:true, spot:'.btiniciar', tap:'.btiniciar', espera:700, tit:'Bora começar',
    tx:'Chegou na academia? Toque aqui e o relógio do treino começa a contar. Se esquecer, ele liga sozinho na primeira série.', hint:'Toque em Iniciar treino'},
  {c:1, pre:abrirLeg, spot:function(){ var r=$('.exrow'), v=r&&$('.vidthumb',r); return v?[r.firstElementChild, v]:null; }, opcional:true,
    tx:'Aqui tem o vídeo da execução e, no canto, o bonequinho com o músculo que trabalha.'},
  /* LOTE_TOUR_TRILHA: a trilha substituiu as pílulas da última sessão (cai nelas se o app for antigo) */
  {c:1, pre:abrirLeg, spot:function(){ var r=$('.exrow'); return r?[$('.tlwrap',r)||$('.exlast',r), $('button.reg',r)].filter(Boolean):null; }, tap:'.exrow button.reg',
    tit:'As séries numa trilha', tx:'Cada série mostra o que a Ana fez da última vez. Terminou uma série, é só tocar em “Terminei”: ela fica marcada e o descanso começa. Pra anotar a carga do dia, use o Registrar Carga.', hint:'Toque em Registrar Carga'},
  {c:1, ver:true, spot:function(){ return campo('Repetições'); }, tap:'.sheet .repbump .bump.plus', tx:'Carga e repetições já vêm da última vez neste equipamento. Hoje a Ana fez uma repetição a mais.', hint:'Toque em +1'},
  {c:1, spot:function(){ return campo('Esforço'); }, tap:function(){ return botaoN(campo('Esforço'),8); }, tit:'Esforço, se quiser', tx:'10 é quando não sairia nem mais uma repetição.', hint:'Toque no 8'},
  {c:1, spot:function(){ return campo('Dor'); }, tap:function(){ return botaoN(campo('Dor'),1); }, tit:'Dor, se tiver', tx:'Vale a dor na articulação, não o ardor do músculo trabalhando.', hint:'Toque no 1'},
  {c:1, spot:'.sheet .dorbox', tap:function(){ return comTexto('.sheet .dorchip','Joelho'); }, tx:'Doeu? Diga onde. Se não souber, pode pular.', hint:'Toque em Joelho'},
  {c:1, pre:async function(){ var b=await esperar(function(){ return comTexto('.sheet .dorlado','Dir'); },1500); if(b && !b.classList.contains('sel')) b.click(); await dormir(150); },
    spot:'.sheet .btnfeita', tap:'.sheet .btnfeita', tx:'A Ana marcou o lado direito. Agora é só registrar: a série fica marcada e o descanso começa a contar.', hint:'Toque em Registrar e contar descanso'},
  /* o descanso começa a contar no topo: um passo só pra ver ele correndo */
  {c:1, spot:'.rtrunning', aguarda:2500, opcional:true, tit:'O descanso já começou',
    tx:'Ele conta aqui em cima, no tempo que eu prescrevi. Quando o mínimo acaba, fica verde-limão e você já pode fazer a próxima série.'},
  /* LOTE_TOUR_TRILHA: a série marcada aparece na trilha; tocar nela desfaz */
  {c:1, opcional:true, pre:abrirLeg, spot:'.exrow .tlmini.feita', tit:'Tocou errado?',
    tx:'A 1ª série ficou marcada na trilha, com a carga de hoje. Se marcar sem querer, é só tocar nela que desfaz. A carga registrada continua salva.'},
    {c:1, pre:async function(){ await abrirLeg(); }, spot:'.exrow button.mini.rel', tap:'.exrow button.mini.rel', tx:'Sentiu algo? Dá pra me deixar uma observação em cada exercício.', hint:'Toque no lápis'},
  {c:1, ver:true, pre:async function(){ var t=await esperar(function(){ return $('.sheet textarea'); },2500); if(t && !t.value) await digitar(t, TEXTO_RELATO); },
    spot:'.sheet .rlwrap', tap:'.sheet .rlbtns .ok', tx:'Só eu leio. Se quiser, toque em “Manter fixo pra mim” pra você mesmo poder consultar depois.', hint:'Toque em Salvar'},
  {c:1, spot:'.fimbox', tap:'.fimbox', tx:'Fez tudo? Hora de fechar o treino.', hint:'Toque em Finalizar Treino'},
  {c:1, ver:true, opcional:true, spot:'.sheet .semwrap', tap:'.sheet .sembtn.verde', tx:'Pra quem acompanha alguma dor: um toque pra contar como a dor se comportou hoje.', hint:'Toque em Tranquilo'},
  {c:1, spot:'.sheet .rlwrap', tap:'.sheet .rlbtns .ok', tx:'A anotação do Leg 45 Meio Sumô já chegou pra mim.', hint:'Toque em Está tudo certo'},
  {c:1, ver:true, aguarda:3000, spot:'.cel2acts', tap:'.cel2link', tx:'Treino fechado. Dá até pra compartilhar nos Stories.', hint:'Toque em Voltar ao Início'},

  {c:2, ver:true, pre:naHome, spot:function(){ return atalho(0); }, tap:function(){ return atalho(0); }, tx:'Agora os atalhos da home, da esquerda pra direita. Primeiro, a agenda.', hint:'Toque na agenda'},
  {c:2, ver:true, spot:'.faixa', tx:'Cada linha é uma semana, e o padrão da Ana aparece sozinho. Quanto mais forte a cor, mais forte ela treinou naquele dia.'},

  {c:3, pre:naHome, spot:function(){ return atalho(1); }, tap:function(){ return atalho(1); }, tx:'Depois, o progresso.', hint:'Toque no progresso'},
  {c:3, ver:true, spot:'.pgcard.clicavel', tap:'.pgcard.clicavel', espera:900, tx:'Tudo que a Ana levantou nesta fase, em coisas que dá pra imaginar.', hint:'Toque pra trocar a comparação'},
  {c:3, spot:function(){ var t=comTexto('.secaotit','aumentar'); return t?[t].concat($$('.progaviso'),$$('.progcard')):null; }, tx:'A mesma sugestão de carga do treino, reunida aqui.'},
  {c:3, spot:function(){ var t=comTexto('.secaotit','evoluiu'); return t?[t].concat($$('.evbar').slice(0,3)):null; }, tx:'E o que já subiu desde o começo da fase. O Leg 45 Meio Sumô foi de 80 pra 110 kg, com a dor no joelho caindo junto.'},

  {c:4, pre:naHome, spot:function(){ return atalho(2); }, tap:function(){ return atalho(2); }, tx:'Agora o planejamento.', hint:'Toque no plano'},
  {c:4, ver:true, spot:function(){ return [$('.pjest.ativa'), $('.pjest.fut')]; }, tx:'Aqui fica o planejamento que eu montei: onde a Ana está e o que vem depois.'},

  {c:5, pre:naHome, spot:function(){ return atalho(3); }, tap:function(){ return atalho(3); }, tx:'Por último, a dor. A bolinha avisa que tem tarefa da semana.', hint:'Toque na dor'},
  {c:5, ver:true, spot:function(){ return [$('.dortarefa'), comTexto('.secaotit','acompanha')].concat($$('.dorcard')); }, tx:'O check-in da semana leva 1 minuto. Embaixo ficam as regiões que a Ana acompanha. Parou de doer? É só tocar em "não sinto mais".'},
  {c:6, tit:'Esse é o app', tx:'Agora vamos para o seu, botar a mão na massa?', btn:'Bora!', acao:'julia'},

  /* de volta ao app real do aluno */
  {c:6, ver:true, julia:true, pre:naHome, spot:'.fasecard', tit:'Agora é com você, {nome}', tx:'Seu primeiro treino já está montado. Pega firme! 💪', btn:'Concluir tour', ultimo:true}
];
var I_JULIA = STEPS.length-1;

/* TEMPO ESTIMADO DE CADA PASSO: leitura a ~200 palavras/min (0,3 s por
   palavra) + tempo de achar e tocar o botão. A barra e o "falta ~X min"
   saem desta conta, então refletem tempo, não quantidade de passos. */
function palavras(t){ return String(t||'').replace(/<[^>]+>/g,'').trim().split(/\s+/).filter(Boolean).length; }
/* TELA INTEIRA: num passo que abre uma tela nova, a fala entra com a tela
   toda à mostra (sem véu); só depois o foco fecha no alvo e aparecem os
   controles ("Toque em…"). Tocar na tela adianta. */
var VER_MS = 1600;
var PESO, PESO_TOTAL, PESO_CAP, MIN_TOTAL;
function recalcular(){
  PESO = STEPS.map(function(st){
    if(st.boasvindas) return 0;
    return 1.5 + 0.3*(palavras(st.tit)+palavras(st.tx)+palavras(st.hint)) + (st.tap?2.5:1) + (st.ver ? VER_MS/1000 : 0);
  });
  PESO_TOTAL = PESO.reduce(function(a,b){ return a+b; }, 0);
  PESO_CAP = CAPS.map(function(_,c){ return STEPS.reduce(function(a,st,i){ return a+(st.c===c?PESO[i]:0); }, 0); });
  /* "uns X minutos": arredonda pra baixo (o "uns" já diz que é aproximado) */
  MIN_TOTAL = Math.max(1, Math.floor(PESO_TOTAL/60));
}
recalcular();
function faltaTexto(i){
  var resto=0; for(var k=i;k<STEPS.length;k++) resto+=PESO[k];
  var m=Math.round(resto/60);
  return m<1 ? 'falta menos de 1 min' : 'falta ~'+m+' min';
}

/* ---------- camada ---------- */
var veil=document.createElement('div'); veil.className='stv-veil'; veil.hidden=true;
var spot=document.createElement('div'); spot.className='stv-spot'; spot.hidden=true;
var tip=document.createElement('div'); tip.className='stv-tip'; tip.hidden=true;
tip.setAttribute('role','dialog'); tip.setAttribute('aria-live','polite');
document.body.appendChild(veil); document.body.appendChild(spot); document.body.appendChild(tip);

var T={on:false, i:0, busy:true, el:null, ult:null};
/* durante o tour o aluno não digita nada: campo que ganhar foco sozinho
   (autoFocus do app) perde o foco na hora, senão o teclado do celular
   abre e cobre a tela inteira */
document.addEventListener('focusin', function(e){
  var el=e.target;
  if(T.on && el && el.matches && el.matches('textarea, select, [contenteditable="true"], input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=range]):not([type=submit])')
     ){ el.blur(); }
}, true);
function resolver(x){
  if(!x) return null;
  if(typeof x==='function') return x();
  return $(x);
}
function alvos(st){
  var a=resolver(st.spot);
  if(!a) return null;
  if(!Array.isArray(a)) a=[a];
  a=a.filter(Boolean);
  return a.length?a:null;
}
function retangulo(els){
  var x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;
  els.forEach(function(e){ var b=e.getBoundingClientRect(); if(!b.width&&!b.height) return;
    x1=Math.min(x1,b.left); y1=Math.min(y1,b.top); x2=Math.max(x2,b.right); y2=Math.max(y2,b.bottom); });
  return x2<x1?null:{x:x1,y:y1,w:x2-x1,h:y2-y1};
}
var SETA='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var X='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
/* quem fala no tour: o treinador do app (no multitenant, o personal do tenant) */
function falante(){
  var t=(CTX && CTX.treinador) || {};
  return { nome: t.nome || 'Matheus', foto: t.foto || '' };
}
function avatar(cls){
  var f=falante();
  return '<span class="'+cls+'">'+(f.foto?'<img src="'+f.foto+'" alt="">':'<b>'+f.nome.charAt(0)+'</b>')+'</span>';
}
/* a fala do tour: foto + balão claro, fora do visual escuro do app, pra não
   ser confundida com o app de verdade */
function fala(st, txt){
  return '<div class="stv-fala">'+avatar('stv-av')+
    '<div class="stv-bal"><div class="stv-nm">'+falante().nome+'</div>'+
    (st.tit?'<div class="stv-tit">'+st.tit.replace(', {nome}', CTX.nome ? ', '+CTX.nome : '')+'</div>':'')+
    '<div class="stv-tx">'+txt+'</div></div></div>';
}
function balao(st){
  if(st.boasvindas){
    return '<div class="stv-wel">'+avatar('stv-mfoto')+
      '<div class="stv-wbal"><b>'+st.tit+'</b> '+st.tx+'</div>'+
      '<div class="stv-wtx">'+st.sub.replace('{min}', MIN_TOTAL)+'</div>'+
      (REG.adiamentos>=1 && !T.rever ? '<div class="stv-ultima">Essa é a última vez que o tour aparece sozinho. Depois, é só tocar no <span class="stv-q">?</span> lá em cima.</div>' : '')+
      '<button class="stv-go stv-big" data-t="next">'+st.btn+'</button>'+
      '<button class="stv-pular" data-t="sairja">Agora não</button></div>';
  }
  if(st.apresenta){
    var al=((SIM.tabelas&&SIM.tabelas.alunos)||[])[0]||{};
    var foto=al.foto_url ? '<img src="'+al.foto_url+'" alt="">' : '<span>'+String(al.nome||'A').charAt(0)+'</span>';
    return fala({}, st.tx)+
      '<div class="stv-wel stv-anacard"><div class="stv-ana">'+foto+'</div>'+
      '<div class="stv-anome">'+(al.nome||'Ana')+'</div><div class="stv-demo">Aluna fictícia</div>'+
      '<button class="stv-go stv-big" data-t="next">'+st.btn+'</button>'+
      '<button class="stv-pular" data-t="sair">Sair do tour</button></div>';
  }
  var c=st.c, i0=STEPS.indexOf(st), feito=0;
  for(var k=0;k<i0;k++) if(STEPS[k].c===c) feito+=PESO[k];
  /* cada capítulo ocupa na barra a fatia de TEMPO que ele leva */
  var caps=CAPS.map(function(_,i){
    var pct = i<c ? 100 : (i===c ? Math.round(100*feito/(PESO_CAP[c]||1)) : 0);
    return '<i class="'+(i===c?'at':'')+'" style="flex-grow:'+(PESO_CAP[i]||0.01).toFixed(1)+'"><b style="width:'+pct+'%"></b></i>';
  }).join('');
  var podePular = c<CAPS.length-1;
  var cab='<div class="stv-caps">'+caps+'</div>'+
    '<div class="stv-head"><div class="stv-capl">'+CAPS[c]+'<span>'+faltaTexto(i0)+'</span></div>'+
    (st.ultimo?'':'<button class="stv-sair" data-t="sair">'+X+'Sair do tour</button>')+'</div>';
  var pe;
  if(st.tap){
    pe='<button class="stv-cta" data-t="cta"><span class="stv-seta">'+SETA+'</span><span>'+st.hint+'</span></button>'+
       (podePular && !st.ultimo?'<button class="stv-pular stv-centro" data-t="cap">Pular capítulo</button>':'');
  }else{
    pe='<div class="stv-ft">'+(podePular?'<button class="stv-pular" data-t="cap">Pular capítulo</button>':'')+
       '<button class="stv-go" data-t="next">'+(st.btn||'Próximo')+'</button></div>';
  }
  return fala(st, st.tx)+'<div class="stv-ctl">'+cab+pe+'</div>';
}
function posiciona(forcar){
  if(!T.on) return;
  var st=STEPS[T.i], H=window.innerHeight, W=window.innerWidth;
  var els=T.el, r=els?retangulo(els):null;
  spot.classList.toggle('tap', !!st.tap);
  if(r){
    var pad=6, R={x:r.x-pad, y:r.y-pad, w:r.w+pad*2, h:r.h+pad*2};
    var chave=[R.x,R.y,R.w,R.h].map(Math.round).join(',');
    if(chave===T.ult && !forcar) return;
    T.ult=chave;
    if(!T.vendo){ spot.style.left=R.x+'px'; spot.style.top=R.y+'px'; spot.style.width=R.w+'px'; spot.style.height=R.h+'px'; }
    var th=tip.offsetHeight, below=H-(R.y+R.h)-12, above=R.y-12, top;
    if(below>=th+4) top=R.y+R.h+12;
    else if(above>=th+4) top=R.y-th-12;
    else{
      /* o destaque é alto demais: o balão pode cobrir parte dele, mas nunca
         o botão que a pessoa precisa tocar */
      var alvoTap=st.tap?resolver(st.tap):null, A=alvoTap?alvoTap.getBoundingClientRect():null;
      if(A && H-A.bottom-12>=th+4) top=A.bottom+12;
      else if(A && A.top-12>=th+4) top=A.top-th-12;
      else top = below>above ? H-th-10 : 10;
    }
    top=Math.max(8, Math.min(H-th-8, top));
    tip.style.top=top+'px';
    tip.classList.toggle('acima', top+th/2 < R.y+R.h/2);
  }else{
    if(T.ult==='centro' && !forcar) return;
    T.ult='centro';
    spot.style.left=(W/2)+'px'; spot.style.top=(H/2)+'px'; spot.style.width='0px'; spot.style.height='0px';
    tip.style.top=Math.max(8,(H-tip.offsetHeight)/2)+'px';
    tip.classList.remove('acima');
  }
}
(function loop(){ if(T.on && !T.busy) posiciona(false); requestAnimationFrame(loop); })();
window.addEventListener('resize', function(){ posiciona(true); });

/* ---------- o que fica gravado no aluno (tabela aluno_tours) ---------- */
var REG={situacao:null, adiamentos:0, passo:null};
var PENDENTE=null;
function gravar(o){
  Object.assign(REG,o);
  if(!CTX || !CTX.sb || !CTX.alunoId) return;
  var linha={aluno_id:CTX.alunoId, tour:TOUR_ID, versao:TOUR_VERSAO, situacao:REG.situacao,
    adiamentos:REG.adiamentos, passo:REG.passo, atualizado_em:new Date().toISOString()};
  /* durante o exemplo o login real está guardado: grava ao voltar pro app do aluno */
  if(T.demo){ PENDENTE=linha; return; }
  enviar(linha);
}
function enviar(linha){
  try{
    CTX.sb.from('aluno_tours').upsert(linha, {onConflict:'aluno_id,tour'}).then(function(r){
      if(r && r.error) console.warn('[tour] não gravou em aluno_tours:', r.error.message);
    }, function(e){ console.warn('[tour] não gravou em aluno_tours', e); });
  }catch(e){ console.warn('[tour] não gravou em aluno_tours', e); }
}
/* regra: abre sozinho se não concluiu/pulou e ainda tem oferta (máx. 2) */
function deveOferecer(){ return REG.situacao!=='concluido' && REG.situacao!=='pulado' && REG.adiamentos<MAX_OFERTAS; }
function status(){}

async function vai(i){
  T.on=true; T.busy=true; T.i=i; T.el=null; T.ult=null;
  var st=STEPS[i];
  if(!!st.julia===!!T.demo){ return trocar(st.julia?'julia':'ana', i); }
  status();
  veil.hidden=false;
  if(st.pre){ try{ await st.pre(); }catch(e){ console.warn('[tour] pre', e); } }
  var els=null;
  if(st.spot){
    els=await esperar(function(){ return alvos(st); }, st.aguarda||3000);
    if(!els){
      console.warn('[tour] alvo não apareceu no passo '+(i+1)+(st.opcional?' (opcional, pulando)':''));
      return proximo();
    }
    try{ els[0].scrollIntoView({block:'center', behavior:'smooth'}); }catch(e){}
    await dormir(380);
  }
  T.el=els;
  tip.classList.remove('stv-confirma');
  tip.classList.toggle('stv-boas', !!(st.boasvindas || st.apresenta));
  tip.innerHTML=balao(st);
  var ver = !!(st.ver && els && VER_MS>0);
  T.vendo = ver;
  if(ver){
    spot.classList.add('stv-inteira');
    spot.style.left='0px'; spot.style.top='0px';
    spot.style.width=window.innerWidth+'px'; spot.style.height=window.innerHeight+'px'; spot.style.borderRadius='0px';
    tip.classList.add('stv-vendo');
  }
  spot.hidden=false;
  tip.hidden=false;
  posiciona(true);
  if(ver){
    await pausaVer(VER_MS);
    if(T.i!==i || !T.on) return;
    T.vendo=false; void spot.offsetWidth;
    spot.classList.remove('stv-inteira'); spot.style.borderRadius='';
    posiciona(true);
    tip.classList.remove('stv-vendo');
  }
  T.busy=false;
}
var pularVer=null;
function pausaVer(ms){
  return new Promise(function(ok){
    var t=setTimeout(fim, ms);
    function fim(){ clearTimeout(t); pularVer=null; ok(); }
    pularVer=fim;
  });
}
function proximo(){
  var st=STEPS[T.i];
  if(st.acao==='julia') return trocar('julia', I_JULIA);
  if(st.acao==='ana') return trocar('ana', T.i+1);
  if(st.ultimo) return fim('concluido');
  if(T.i<STEPS.length-1) return vai(T.i+1);
  fim('concluido');
}
function pulaCap(){
  var c=STEPS[T.i].c;
  for(var j=T.i+1;j<STEPS.length;j++) if(STEPS[j].c>c) return vai(j);
  fim('pulado');
}
/* troca de app SEM recarregar a página: 'ana' entra no app de exemplo,
   'julia' volta pro app real do aluno */
async function religar(quem){
  T.busy=true; spot.hidden=true; tip.hidden=true;
  $$('.stv-cel').forEach(function(e){ e.remove(); });
  return quem==='ana' ? entrarDemo() : sairDemo();
}
async function trocar(quem, passo){
  veil.hidden=false;
  var ok=await religar(quem);
  if(!ok){
    /* não deu pra abrir o exemplo neste aparelho: encerra sem contar nada */
    T.on=false; T.busy=true; veil.hidden=true; spot.hidden=true; tip.hidden=true; T.rever=false;
    if(window.__idealisFlash) window.__idealisFlash('Não deu pra abrir o tour agora');
    return;
  }
  if(passo==null){ T.busy=true; veil.hidden=true; return; }
  vai(passo);
}
async function fim(como){
  T.on=false; T.busy=true; veil.hidden=true; spot.hidden=true; tip.hidden=true;
  var rever=T.rever, passo=T.i+1; T.rever=false;
  /* saiu no meio do exemplo: primeiro volta pro app real do aluno */
  if(T.demo){ veil.hidden=false; await sairDemo(); veil.hidden=true; }
  /* rever pelo "?" não mexe na contagem; só um "concluído" fica registrado */
  if(como==='concluido') gravar({situacao:'concluido', passo:null});
  else if(como==='pulado' && !rever) gravar({situacao:'pulado', passo:passo});
  /* o tour sempre termina na tela inicial do aluno */
  await naHome();
  if(como==='concluido') celebrar();
  else if(como==='pulado' && window.__idealisFlash) window.__idealisFlash('Tour encerrado');
}
/* comemoração: o MESMO card e o MESMO confete do fim de treino do app */
function celebrar(){
  var nome=(CTX && CTX.nome) || '';
  var cores=['#ddff00','#00c9cc','#71fcff','#6ee89a','#ffa45c','#a2feff'], pecas='';
  for(var i=0;i<64;i++){
    pecas+='<span style="left:'+(Math.random()*100).toFixed(1)+'%;background:'+cores[i%cores.length]+
      ';width:'+(5+Math.random()*5).toFixed(1)+'px;height:'+(8+Math.random()*8).toFixed(1)+'px;animation-delay:'+
      (Math.random()*0.9).toFixed(2)+'s;animation-duration:'+(1.1+Math.random()*1.1).toFixed(2)+'s;--giro:'+
      Math.round(Math.random()*720-360)+'deg"></span>';
  }
  var w=document.createElement('div'); w.className='celebra stv-cel';
  w.innerHTML='<div class="confetes" aria-hidden="true">'+pecas+'</div>'+
    '<div class="cel2card" role="dialog" aria-label="Tour concluído">'+
      '<div class="cel2ico" aria-hidden="true">🎉</div>'+
      '<div class="cel2eyebrow">Tour concluído</div>'+
      '<div class="cel2tit">Bom treino'+(nome?', '+nome:'')+'!</div>'+
      '<p class="cel2sub">Agora você já sabe onde fica tudo. Seu primeiro treino está te esperando.</p>'+
      '<div class="cel2acts"><button class="cel2btn pri" type="button">Bora treinar</button></div></div>';
  document.body.appendChild(w);
  if(navigator.vibrate) try{ navigator.vibrate([180,80,180]); }catch(e){}
  w.querySelector('.cel2btn').addEventListener('click', function(){ w.remove(); });
}

tip.addEventListener('click', function(e){
  var b=e.target.closest('[data-t]'); if(!b || !T.on || T.busy) return;
  var a=b.getAttribute('data-t');
  if(a==='next') proximo(); else if(a==='cap') pulaCap(); else if(a==='sairja') adiar();
  else if(a==='fimadia') fim('adiado');
  /* "Sair do tour" pede confirmação dentro do próprio balão (o visualizador
     não mostra confirm() do navegador) */
  else if(a==='sair'){
    tip.classList.add('stv-confirma');
    tip.innerHTML='<div class="stv-ctl stv-conf" role="alertdialog" aria-label="Sair do tour">'+
      '<div class="stv-ctit">Tem certeza que deseja sair do tour?</div>'+
      '<div class="stv-ft"><button class="stv-pular" data-t="fica">Continuar o tour</button>'+
      '<button class="stv-go stv-sairok" data-t="sairok">Sair</button></div></div>';
    posiciona(true);
  }
  else if(a==='fica'){ tip.classList.remove('stv-confirma'); tip.innerHTML=balao(STEPS[T.i]); posiciona(true); }
  else if(a==='sairok'){ tip.classList.remove('stv-confirma'); fim('pulado'); }
  else if(a==='cta') acionar();
});
/* "Agora não" na boas-vindas: conta o adiamento e diz o que vai acontecer */
function adiar(){
  /* veio pelo "?": não é oferta, então só fecha, sem contar nem avisar */
  if(T.rever){ fim('fechou'); return; }
  var n=REG.adiamentos+1;
  gravar({situacao:'adiado', adiamentos:n});
  var txt, ajuda=null;
  if(n<2){ txt='<b>Sem problema!</b> O tour vai aparecer mais uma vez na próxima vez que você abrir o app.'; }
  else { txt='<b>Combinado!</b> Quando quiser ver, é só tocar no <span class="stv-q">?</span> aqui em cima.'; ajuda=$('.tbtour'); }
  tip.classList.add('stv-boas');
  tip.innerHTML='<div class="stv-wel">'+avatar('stv-mfoto')+'<div class="stv-wbal">'+txt+'</div>'+
    '<button class="stv-go stv-big" data-t="fimadia">Entendi</button></div>';
  T.el = ajuda ? [ajuda] : null; T.ult=null;
  spot.classList.toggle('tap', false);
  posiciona(true);
}
/* o toque no destaque OU no botão "Toque em…" faz a mesma coisa */
function acionar(){
  var st=STEPS[T.i], el=resolver(st.tap);
  if(!el) return;
  T.busy=true; el.click();
  setTimeout(function(){ if(T.on) proximo(); }, (st.espera||0)+250);
}
veil.addEventListener('click', function(e){
  if(pularVer){ pularVer(); return; }
  if(!T.on || T.busy) return;
  var st=STEPS[T.i], x=e.clientX, y=e.clientY;
  var dentro=function(el){ if(!el) return false; var b=el.getBoundingClientRect();
    return x>=b.left-4 && x<=b.right+4 && y>=b.top-4 && y<=b.bottom+4; };
  if(st.tap){
    var el=resolver(st.tap);
    if(dentro(el)){ acionar(); return; }
  }
  /* durante um passo de leitura, o toque no destaque não faz nada além de
     sacudir o balão: o aluno não sai do roteiro sem querer */
  tip.classList.remove('nudge'); void tip.offsetWidth; tip.classList.add('nudge');
});


/* ---------- API pro app ---------- */
window.TourIdealis={
  versao:TOUR_VERSAO,
  /* abre sozinho na home do aluno, se a regra deixar (máx. 2 ofertas) */
  oferecer:async function(ctx){
    if(T.on) return false;
    CTX=ctx;
    var r=ctx.registro||{};
    REG={situacao:r.situacao||null, adiamentos:r.adiamentos||0, passo:r.passo||null};
    if(!deveOferecer()) return false;
    /* só com fase montada (o fim do tour mostra o primeiro treino) */
    if(!(await esperar(function(){ return $('.fasecard'); }, 5000))) return false;
    await dormir(600);
    /* se o aluno já saiu da tela inicial, não interrompe: fica pra próxima */
    if(T.on || !$('.duplobtn')) return false;
    vai(0);
    return true;
  },
  /* botão "?": abre a mesma pergunta inicial; não mexe na contagem de ofertas */
  rever:function(ctx){
    if(T.on) return;
    CTX=ctx; T.rever=true;
    vai(0);
  },
  ativo:function(){ return !!T.on; },
  /* diagnóstico (console): TourIdealis._estado() */
  _estado:function(){ return {T:T, STEPS:STEPS, resolver:resolver, REG:REG}; }
};
})();
