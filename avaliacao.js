/* =====================================================================
   IDEALIS · AVALIAÇÃO DA JORNADA DA DOR
   Carregado SOB DEMANDA pelo index.html (não entra no bundle principal).

   Por que separado: esta tela custaria ~2,4s no boot de TODOS os alunos
   por causa de algo que cada um abre 3x a cada 8 semanas. Aqui o custo
   é pago só por quem abre, sentado em casa.

   Expõe: window.AvaliacaoDor = { Componente, MapaCorporal, ... }

   Depende do index.html: React, useState, useEffect, uid, todayISO,
   enviarAvaliacao, lerRascunho, salvarRascunho, limparRascunho,
   NOME_REGIAO_DOR, TopBar.
   ===================================================================== */
(function(){
"use strict";
var e = React.createElement;
var useState = React.useState, useEffect = React.useEffect;

/* ---------------------------------------------------------------------
   1. GEOMETRIA DO CORPO — blocos anatômicos

   Cada região É a forma visível. Sem clipPath, sem formas com folga,
   sem gradiente de volume, sem emboss, sem blend mode. O que se vê é
   o que se toca — e renderiza rápido em celular fraco.

   Os `id` são os mesmos gravados em avaliacao_regioes.regiao e
   dores.regiao. Não renomear sem migrar o banco.
   --------------------------------------------------------------------- */
var CABECA = "M80,4 C90,4 97,11 97,22 C97,30 94,35 89,37 L71,37 C66,35 63,30 63,22 C63,11 70,4 80,4 Z";

var REG_FRENTE = [
  { id:"pescoco", nome:"Pescoço", cx:80, cy:52,
    d:"M69,40 C69,37 71,36 80,36 C89,36 91,37 91,40 L92,62 C92,65 89,66 80,66 C71,66 68,65 68,62 Z" },
  { id:"ombro_d", nome:"Ombro direito", cx:42, cy:88,
    d:"M56,70 C46,73 38,80 34,90 C31,97 30,105 31,112 L46,108 C45,98 47,87 52,79 Z" },
  { id:"ombro_e", nome:"Ombro esquerdo", cx:118, cy:88,
    d:"M104,70 C114,73 122,80 126,90 C129,97 130,105 129,112 L114,108 C115,98 113,87 108,79 Z" },
  { id:"peitoral", nome:"Peito", cx:80, cy:90,
    d:"M60,70 C68,67 92,67 100,70 C102,82 102,96 100,108 C90,111 70,111 60,108 C58,96 58,82 60,70 Z" },
  { id:"abdome", nome:"Barriga", cx:80, cy:134,
    d:"M61,112 C70,109 90,109 99,112 C100,128 99,146 97,158 C90,161 70,161 63,158 C61,146 60,128 61,112 Z" },
  { id:"braco_d", nome:"Braço direito", cx:34, cy:134,
    d:"M31,116 L45,112 C43,128 40,142 37,155 L24,158 C25,144 27,129 31,116 Z" },
  { id:"braco_e", nome:"Braço esquerdo", cx:126, cy:134,
    d:"M129,116 L115,112 C117,128 120,142 123,155 L136,158 C135,144 133,129 129,116 Z" },
  { id:"cotovelo_d", nome:"Cotovelo direito", cx:28, cy:171,
    d:"M36,159 L23,162 C22,170 21,176 21,182 L34,180 C34,173 35,166 36,159 Z" },
  { id:"cotovelo_e", nome:"Cotovelo esquerdo", cx:132, cy:171,
    d:"M124,159 L137,162 C138,170 139,176 139,182 L126,180 C126,173 125,166 124,159 Z" },
  { id:"antebraco_d", nome:"Antebraço direito", cx:26, cy:196,
    d:"M34,184 L21,185 C20,193 19,200 18,207 L32,205 C32,198 33,191 34,184 Z" },
  { id:"antebraco_e", nome:"Antebraço esquerdo", cx:134, cy:196,
    d:"M126,184 L139,185 C140,193 141,200 142,207 L128,205 C128,198 127,191 126,184 Z" },
  { id:"mao_d", nome:"Punho / mão dir.", cx:24, cy:221,
    d:"M32,209 L18,210 C17,217 16,223 16,226 C16,231 19,233 24,232 C29,231 31,227 31,219 C31,215 32,212 32,209 Z" },
  { id:"mao_e", nome:"Punho / mão esq.", cx:136, cy:221,
    d:"M128,209 L142,210 C143,217 144,223 144,226 C144,231 141,233 136,232 C131,231 129,227 129,219 C129,215 128,212 128,209 Z" },
  { id:"quadril", nome:"Quadril", cx:80, cy:175,
    d:"M62,162 C70,159 90,159 98,162 C101,170 102,180 101,188 C90,191 70,191 59,188 C58,180 59,170 62,162 Z" },
  { id:"coxa_d", nome:"Coxa direita", cx:67, cy:222,
    d:"M59,192 L78,192 C78,210 77,232 76,250 L57,250 C56,232 57,210 59,192 Z" },
  { id:"coxa_e", nome:"Coxa esquerda", cx:93, cy:222,
    d:"M101,192 L82,192 C82,210 83,232 84,250 L103,250 C104,232 103,210 101,192 Z" },
  { id:"joelho_d", nome:"Joelho direito", cx:67, cy:264,
    d:"M57,252 L76,252 C76,262 76,270 76,274 L57,274 C57,266 57,259 57,252 Z" },
  { id:"joelho_e", nome:"Joelho esquerdo", cx:93, cy:264,
    d:"M103,252 L84,252 C84,262 84,270 84,274 L103,274 C103,266 103,259 103,252 Z" },
  { id:"perna_d", nome:"Perna direita", cx:67, cy:304,
    d:"M57,276 L76,276 C76,294 75,316 74,332 L59,332 C58,316 57,294 57,276 Z" },
  { id:"perna_e", nome:"Perna esquerda", cx:93, cy:304,
    d:"M103,276 L84,276 C84,294 85,316 86,332 L101,332 C102,316 103,294 103,276 Z" },
  { id:"torn_d", nome:"Tornozelo direito", cx:65, cy:340,
    d:"M59,334 L74,334 C74,340 74,344 73,346 L56,346 C56,342 58,338 59,334 Z" },
  { id:"torn_e", nome:"Tornozelo esquerdo", cx:95, cy:340,
    d:"M101,334 L86,334 C86,340 86,344 87,346 L104,346 C104,342 102,338 101,334 Z" },
  { id:"pe_d", nome:"Pé direito", cx:64, cy:352,
    d:"M56,348 L73,348 C72,352 68,354 62,354 C56,354 54,352 55,350 C55,349 55,348 56,348 Z" },
  { id:"pe_e", nome:"Pé esquerdo", cx:96, cy:352,
    d:"M104,348 L87,348 C88,352 92,354 98,354 C104,354 106,352 105,350 C105,349 105,348 104,348 Z" },
  /* virilha DEPOIS da coxa: em SVG o último desenhado ganha o toque na
     área de sobreposição, e é ele que queremos no canto interno. */
  { id:"virilha_d", nome:"Virilha / adutor D", cx:71, cy:197,
    d:"M64,188 C70,187 76,188 79,190 C79,197 78,203 77,207 C71,208 66,207 63,205 C62,199 62,192 64,188 Z" },
  { id:"virilha_e", nome:"Virilha / adutor E", cx:89, cy:197,
    d:"M96,188 C90,187 84,188 81,190 C81,197 82,203 83,207 C89,208 94,207 97,205 C98,199 98,192 96,188 Z" }
];

var REG_COSTAS = [
  { id:"cervical", nome:"Nuca / cervical", cx:80, cy:52,
    d:"M69,40 C69,37 71,36 80,36 C89,36 91,37 91,40 L92,62 C92,65 89,66 80,66 C71,66 68,65 68,62 Z" },
  { id:"trapezio_d", nome:"Trapézio direito", cx:56, cy:84,
    d:"M56,70 C46,73 38,80 34,90 C31,97 30,105 31,112 L46,108 L78,97 L78,68 C70,67 62,68 56,70 Z" },
  { id:"trapezio_e", nome:"Trapézio esquerdo", cx:104, cy:84,
    d:"M104,70 C114,73 122,80 126,90 C129,97 130,105 129,112 L114,108 L82,97 L82,68 C90,67 98,68 104,70 Z" },
  { id:"toracica", nome:"Meio das costas", cx:80, cy:116,
    d:"M66,99 L94,99 C94,111 93,123 92,132 C86,135 74,135 68,132 C67,123 66,111 66,99 Z" },
  { id:"escapula_d", nome:"Escápula direita", cx:57, cy:116,
    d:"M47,100 L64,99 C64,111 65,123 66,132 C60,134 55,133 52,132 C50,123 48,111 47,100 Z" },
  { id:"escapula_e", nome:"Escápula esquerda", cx:103, cy:116,
    d:"M113,100 L96,99 C96,111 95,123 94,132 C100,134 105,133 108,132 C110,123 112,111 113,100 Z" },
  { id:"lombar", nome:"Lombar", cx:80, cy:148,
    d:"M53,134 C64,137 96,137 107,134 C106,144 104,154 102,160 C90,163 70,163 58,160 C56,154 54,144 53,134 Z" },
  { id:"braco_pd", nome:"Braço direito", cx:34, cy:134,
    d:"M31,116 L45,112 C43,128 40,142 37,155 L24,158 C25,144 27,129 31,116 Z" },
  { id:"braco_pe", nome:"Braço esquerdo", cx:126, cy:134,
    d:"M129,116 L115,112 C117,128 120,142 123,155 L136,158 C135,144 133,129 129,116 Z" },
  { id:"mao_pd", nome:"Punho / mão dir.", cx:25, cy:200,
    d:"M37,158 L24,160 C21,178 17,204 16,222 C16,229 19,232 24,231 C29,230 31,226 32,218 C34,198 36,176 37,158 Z" },
  { id:"mao_pe", nome:"Punho / mão esq.", cx:135, cy:200,
    d:"M123,158 L136,160 C139,178 143,204 144,222 C144,229 141,232 136,231 C131,230 129,226 128,218 C126,198 124,176 123,158 Z" },
  { id:"gluteo_d", nome:"Glúteo direito", cx:67, cy:180,
    d:"M59,162 L78,162 C79,174 79,188 78,198 C70,201 60,200 57,196 C56,185 57,172 59,162 Z" },
  { id:"gluteo_e", nome:"Glúteo esquerdo", cx:93, cy:180,
    d:"M101,162 L82,162 C81,174 81,188 82,198 C90,201 100,200 103,196 C104,185 103,172 101,162 Z" },
  { id:"post_coxa_d", nome:"Atrás da coxa D", cx:67, cy:226,
    d:"M57,200 L78,200 C78,216 77,236 76,250 L57,250 C56,234 56,216 57,200 Z" },
  { id:"post_coxa_e", nome:"Atrás da coxa E", cx:93, cy:226,
    d:"M103,200 L82,200 C82,216 83,236 84,250 L103,250 C104,234 104,216 103,200 Z" },
  { id:"poplitea_d", nome:"Atrás do joelho D", cx:67, cy:264,
    d:"M57,252 L76,252 C76,262 76,270 76,274 L57,274 C57,266 57,259 57,252 Z" },
  { id:"poplitea_e", nome:"Atrás do joelho E", cx:93, cy:264,
    d:"M103,252 L84,252 C84,262 84,270 84,274 L103,274 C103,266 103,259 103,252 Z" },
  { id:"panturr_d", nome:"Panturrilha D", cx:67, cy:304,
    d:"M57,276 L76,276 C76,294 75,316 74,332 L59,332 C58,316 57,294 57,276 Z" },
  { id:"panturr_e", nome:"Panturrilha E", cx:93, cy:304,
    d:"M103,276 L84,276 C84,294 85,316 86,332 L101,332 C102,316 103,294 103,276 Z" },
  { id:"calc_d", nome:"Calcanhar D", cx:65, cy:344,
    d:"M59,334 L74,334 C74,340 74,344 73,347 C72,352 68,354 62,354 C56,354 54,352 55,347 C56,342 58,338 59,334 Z" },
  { id:"calc_e", nome:"Calcanhar E", cx:95, cy:344,
    d:"M101,334 L86,334 C86,340 86,344 87,347 C88,352 92,354 98,354 C104,354 106,352 105,347 C104,342 102,338 101,334 Z" }
];

var TODAS = REG_FRENTE.concat(REG_COSTAS);
var NOME = {}; TODAS.forEach(function(r){ NOME[r.id]=r.nome; });

/* escala de dor — tons menos saturados que o vermelho clássico:
   público com risco de hipervigilância não precisa de alarme visual */
function corDor(v){
  if(v==null) return null;
  if(v===0) return null;
  if(v<=3) return "#3fa38a";
  if(v<=6) return "#e0b93c";
  if(v<=8) return "#e0803c";
  return "#d1495b";
}

/* ---------------------------------------------------------------------
   2. MAPA CORPORAL
   Uma vista por vez. Dois corpos lado a lado em tela de celular ficam
   pequenos demais para tocar com precisão, e renderizar um só corta o
   DOM pela metade.
   --------------------------------------------------------------------- */
function MapaCorporal(p){
  var vista = p.vista || "frente";
  var regioes = vista==="frente" ? REG_FRENTE : REG_COSTAS;
  var notas = p.notas || {};
  /* regiões que o aluno JÁ acompanha (dores.ativa = true).
     Destaque por CONTORNO, nunca por preenchimento: o fill já é a
     escala 0-10, e pintar aqui faria a região parecer "nota alta"
     antes de ela tocar em nada. */
  var acomp = {};
  (p.acompanhadas||[]).forEach(function(k){ acomp[k]=true; });

  function fill(r){
    var n = notas[r.id];
    var c = corDor(n);
    if(c) return c;
    return p.ativa===r.id ? "var(--surface-2)" : "var(--surface)";
  }

  return e("div",{className:"mapawrap"},
    e("div",{className:"mapatabs"},
      e("button",{type:"button", className:vista==="frente"?"on":"",
        onClick:function(){ p.onVista("frente"); }},"Frente"),
      e("button",{type:"button", className:vista==="costas"?"on":"",
        onClick:function(){ p.onVista("costas"); }},"Costas")
    ),
    e("svg",{viewBox:"0 0 160 380", className:"mapasvg", role:"img",
      "aria-label":"Mapa corporal, vista "+vista},
      e("path",{d:CABECA, fill:"var(--surface)", stroke:"var(--line)", strokeWidth:1.2}),
      regioes.map(function(r){
        var marcada = notas[r.id]!=null && notas[r.id]>0;
        var ativa = p.ativa===r.id;
        var segue = !!acomp[r.id] && !marcada;
        return e("g",{key:r.id},
          e("path",{d:r.d, fill:fill(r),
            stroke: ativa ? "var(--cyan)" : (segue ? "var(--cyan)" : "var(--line)"),
            strokeWidth: ativa ? 2 : (segue ? 1.8 : 1.2),
            strokeDasharray: (segue && !ativa) ? "4 3" : null,
            strokeLinejoin:"round",
            style:{cursor:"pointer"},
            onClick:function(){ p.onPick(r.id, vista); }},
            e("title",null, r.nome + (segue ? " — você já acompanha" : ""))),
          marcada ? e("text",{x:r.cx, y:r.cy+4, textAnchor:"middle",
            fontSize:11, fontWeight:800, fill:"#0b0f10",
            style:{pointerEvents:"none"}}, notas[r.id]) : null,
          segue ? e("circle",{cx:r.cx, cy:r.cy, r:3.2, fill:"var(--cyan)",
            style:{pointerEvents:"none"}}) : null
        );
      })
    )
  );
}

/* ---------------------------------------------------------------------
   2b. MAPA (2D ou 3D)

   O 3D é uma CAMADA DE ENTRADA por cima do mesmo vocabulário de
   regiões. Se o aparelho não tiver WebGL, se o módulo não baixar ou se
   o contexto se perder, cai no SVG sem avisar nada de errado — o
   questionário nunca pode travar por causa disso.

   Aliases: no 2D o braço visto de frente (braco_d) e de costas
   (braco_pd) são dois slugs para o MESMO braço, herança de ter duas
   silhuetas. No 3D existe um braço só. Estes pares resolvem para a
   versão de frente, MAS se o aluno já acompanha a versão legada, o
   toque devolve o slug legado — assim reutiliza a linha que já existe
   em `dores` e o histórico de check-ins não se parte em dois.
   --------------------------------------------------------------------- */
var ALIAS_3D = { braco_pd:"braco_d", braco_pe:"braco_e",
                 mao_pd:"mao_d",     mao_pe:"mao_e" };

var CHAVE_3D = "idealis_mapa3d";
function pref3D(){
  try{ return window.localStorage.getItem(CHAVE_3D) !== "0"; }catch(err){ return true; }
}
function setPref3D(v){
  try{ window.localStorage.setItem(CHAVE_3D, v ? "1" : "0"); }catch(err){}
}

var _mod3d = null;
/* Carregador do módulo 3D.

   ARMADILHA DOS ES MODULES: um erro de REDE no grafo de import (o
   three não existe, veio 404) dispara `error` no <script>, mas um erro
   de EXECUÇÃO dentro do módulo não dispara nada — ele vai para o
   window.onerror e este Promise ficaria pendurado para sempre, e o
   mapa ficaria em 2D sem ninguém saber por quê. O timeout abaixo
   existe para transformar esse silêncio em diagnóstico. */
function carregarManequim3D(){
  if(window.ManequimDor && window.ManequimDor.pronto) return Promise.resolve(window.ManequimDor);
  if(_mod3d) return _mod3d;
  _mod3d = new Promise(function(ok, falha){
    var fechado = false;
    function encerrar(erro, mod){
      if(fechado) return;
      fechado = true;
      if(erro){ _mod3d = null; console.warn("[mapa3d] " + erro.message); falha(erro); }
      else ok(mod);
    }
    var relogio = setTimeout(function(){
      encerrar(new Error("manequim3d.js não respondeu em 15s — confira se manequim3d.js e three.*.min.js estão publicados na raiz"));
    }, 15000);
    var el = document.createElement("script");
    el.type = "module";
    el.src = "manequim3d.js?v=2";
    el.onload = function(){
      clearTimeout(relogio);
      if(window.ManequimDor && window.ManequimDor.pronto) encerrar(null, window.ManequimDor);
      else encerrar(new Error("manequim3d.js carregou sem expor ManequimDor"));
    };
    el.onerror = function(){
      clearTimeout(relogio);
      encerrar(new Error("não consegui baixar manequim3d.js ou algum import dele (three.module.min.js)"));
    };
    document.body.appendChild(el);
  });
  return _mod3d;
}

function MapaCorpo(p){
  var s3 = useState(pref3D()); var quer3d=s3[0], setQuer3d=s3[1];
  var sm = useState(null);     var mod=sm[0], setMod=sm[1];
  var sq = useState(false);    var quebrou=sq[0], setQuebrou=sq[1];

  useEffect(function(){
    if(!quer3d || quebrou || mod) return;
    var vivo = true;
    carregarManequim3D()
      .then(function(m){
        if(!vivo) return;
        if(m.suportado()) setMod(m);
        else { console.warn("[mapa3d] este aparelho não tem WebGL — seguindo no desenho 2D"); setQuebrou(true); }
      })
      .catch(function(){ if(vivo) setQuebrou(true); });
    return function(){ vivo = false; };
  },[quer3d, quebrou]);

  /* no 3D o braço é um só: resolve o alias antes de devolver ao pai */
  function pick3d(id, vista){
    var legado = null;
    (p.acompanhadas||[]).forEach(function(k){ if(ALIAS_3D[k]===id) legado=k; });
    p.onPick(legado || id, legado ? (REG_COSTAS.some(function(r){ return r.id===legado; }) ? "costas" : "frente") : vista);
  }

  var usando3d = quer3d && !quebrou && mod;
  var podeAlternar = !quebrou;

  return e("div",{className:"mapawrap"},
    usando3d
      ? e(mod.Manequim3D,{ notas:p.notas, ativa:p.ativa,
          acompanhadas:(p.acompanhadas||[]).map(function(k){ return ALIAS_3D[k]||k; }),
          nomeDe:function(k){ return NOME[k]||k; },
          onPick:pick3d, onErro:function(){ setQuebrou(true); } })
      : e(MapaCorporal,{ vista:p.vista, onVista:p.onVista, notas:p.notas,
          ativa:p.ativa, acompanhadas:p.acompanhadas, onPick:p.onPick }),
    podeAlternar ? e("button",{type:"button", className:"mapaswitch",
        onClick:function(){ var n=!quer3d; setQuer3d(n); setPref3D(n); }},
        usando3d ? "Prefiro o desenho simples" : "Ver em 3D") : null,
    (p.acompanhadas||[]).length>0
      ? e("div",{className:"mapalegenda"},
          e("span",{className:"mlponto"}),
          "em destaque, o que você já acompanha")
      : null
  );
}

/* ---------------------------------------------------------------------
   3. INSTRUMENTOS

   ⚠️ MATHEUS: revise os 14 itens de mecanismo e as 8 red flags antes de
   publicar. Escrevi com base na literatura de classificação de dor
   (nociceptiva / neuropática / nociplástica), mas a redação final é sua
   decisão clínica.
   --------------------------------------------------------------------- */
var MECANISMO = [
  // N = nociceptiva
  {id:"N1", txt:"A dor piora com movimentos ou posições específicas"},
  {id:"N2", txt:"A dor melhora quando você descansa a região"},
  {id:"N3", txt:"Você consegue apontar o lugar exato da dor"},
  {id:"N4", txt:"A dor começou depois de um esforço, pancada ou lesão"},
  {id:"N5", txt:"A intensidade da dor combina com o quanto você se esforça"},
  // P = neuropática
  {id:"P1", txt:"A dor queima, formiga ou dá choque"},
  {id:"P2", txt:"Você sente dormência ou perda de sensibilidade na região"},
  {id:"P3", txt:"A dor desce pelo braço ou pela perna"},
  {id:"P4", txt:"Um toque leve na pele já incomoda"},
  {id:"P5", txt:"A dor piora à noite, sem relação com o que você fez no dia"},
  // S = nociplástica / sensibilização
  {id:"S1", txt:"A dor muda de lugar ou aparece em várias regiões"},
  {id:"S2", txt:"Dias de estresse ou sono ruim pioram a dor"},
  {id:"S3", txt:"A dor continua mesmo depois de você parar a atividade"},
  {id:"S4", txt:"Barulho, luz forte ou cheiros também te incomodam mais que antes"}
];

var RED_FLAGS = [
  {id:"rf_peso",     txt:"Perdi peso sem querer nos últimos meses"},
  {id:"rf_febre",    txt:"Tive febre junto com a dor"},
  {id:"rf_noturna",  txt:"A dor me acorda toda noite e não passa com posição"},
  {id:"rf_trauma",   txt:"A dor começou depois de uma queda ou acidente forte"},
  {id:"rf_forca",    txt:"Notei perda de força em um braço ou perna"},
  {id:"rf_esfincter",txt:"Tive alteração para controlar xixi ou intestino"},
  {id:"rf_cancer",   txt:"Já tive câncer"},
  {id:"rf_corticoide",txt:"Uso corticoide há bastante tempo"}
];

/* ---------------------------------------------------------------------
   4. PEÇAS DE INTERFACE
   --------------------------------------------------------------------- */
function Escala(p){
  return e("div",{className:"avescala"},
    e("div",{className:"avesctopo"},
      e("span",{className:"avesclab"},p.rotulo),
      p.valor!=null ? e("span",{className:"avescval"},p.valor) : null),
    e("div",{className:"avescbtns"},
      [0,1,2,3,4,5,6,7,8,9,10].map(function(n){
        return e("button",{key:n, type:"button",
          className:"avescbtn"+(p.valor===n?" on":""),
          onClick:function(){ p.onChange(n); }}, n);
      })),
    e("div",{className:"avescanc"},
      e("span",null,p.min||"Nada"),
      e("span",null,p.max||"Máximo"))
  );
}

function Passo(p){
  return e("div",{className:"avpasso"},
    e("div",{className:"avptit"},p.titulo),
    p.sub ? e("div",{className:"avpsub"},p.sub) : null,
    p.children);
}

/* ---------------------------------------------------------------------
   5. COMPONENTE PRINCIPAL
   --------------------------------------------------------------------- */
function Avaliacao(props){
  var studentId = props.studentId;
  var momento = props.momento || "extra";
  var onSair = props.onSair;
  // concluir tem destino próprio: a jornada acabou, volta ao início do app
  var onConcluir = props.onConcluir || props.onSair;
  var flash = props.flash;
  /* dores que o aluno JÁ acompanha, vindas do index.html. Aceita
     ["lombar"] ou [{regiao:"lombar"}]. Ausente = sem destaque, e o
     questionário funciona igual. */
  var acompanhadas = (props.doresAtivas||[]).map(function(d){
    return (typeof d === "string") ? d : (d && d.regiao);
  }).filter(Boolean);

  var rasc = lerRascunho(studentId, momento) || {};
  var st = useState(rasc.etapa || 0); var etapa=st[0], setEtapa=st[1];
  var sv = useState(rasc.vista || "frente"); var vista=sv[0], setVista=sv[1];
  var sn = useState(rasc.notas || {}); var notas=sn[0], setNotas=sn[1];
  var sVi = useState(rasc.vistas || {}); var vistas=sVi[0], setVistas=sVi[1];
  var sa = useState(null); var ativa=sa[0], setAtiva=sa[1];
  var si = useState(rasc.indices || []); var indices=si[0], setIndices=si[1];
  var sd = useState(rasc.detalhes || {}); var detalhes=sd[0], setDetalhes=sd[1];
  var sp = useState(rasc.psfs || [{nome:"",nota:null}]); var psfs=sp[0], setPsfs=sp[1];
  var sf = useState(rasc.flags || []); var flags=sf[0], setFlags=sf[1];
  var se = useState(false); var enviando=se[0], setEnviando=se[1];
  var ser = useState(""); var erro=ser[0], setErro=ser[1];

  /* rascunho a cada mudança: 8 minutos de trabalho não podem morrer
     porque o app foi para segundo plano */
  useEffect(function(){
    salvarRascunho(studentId, momento, {
      etapa:etapa, vista:vista, notas:notas, vistas:vistas,
      indices:indices, detalhes:detalhes, psfs:psfs, flags:flags
    });
  },[etapa,vista,notas,vistas,indices,detalhes,psfs,flags]);

  var marcadas = Object.keys(notas).filter(function(k){ return notas[k]>0; });

  function pick(id, v){
    setAtiva(id);
    setVistas(function(m){ var n={}; for(var k in m) n[k]=m[k]; n[id]=v; return n; });
  }
  function setNota(id, n){
    setNotas(function(m){ var o={}; for(var k in m) o[k]=m[k];
      if(n===0){ delete o[id]; } else { o[id]=n; } return o; });
    setAtiva(null);
  }
  function toggleIndice(id){
    setIndices(function(a){
      if(a.indexOf(id)>=0) return a.filter(function(x){ return x!==id; });
      if(a.length>=2) return a;          // máximo 2 dores índice
      return a.concat([id]);
    });
  }
  function setDet(id, campo, valor){
    setDetalhes(function(m){
      var o={}; for(var k in m) o[k]=Object.assign({},m[k]);
      o[id]=o[id]||{mecanismo:{}};
      if(campo==="mec"){ o[id].mecanismo=Object.assign({},o[id].mecanismo); }
      else o[id][campo]=valor;
      return o;
    });
  }
  function setMec(id, item, resp){
    setDetalhes(function(m){
      var o={}; for(var k in m) o[k]=Object.assign({},m[k]);
      o[id]=o[id]||{mecanismo:{}};
      o[id].mecanismo=Object.assign({},o[id].mecanismo);
      o[id].mecanismo[item]=resp;
      return o;
    });
  }

  /* etapas: 0 mapa · 1 escolha das índice · 2..n detalhe de cada · PSFS · flags · revisão */
  var ETAPA_MAPA=0, ETAPA_INDICE=1;
  var ETAPA_DET_INI=2;
  var nDet = indices.length;
  var ETAPA_PSFS = ETAPA_DET_INI + nDet;
  var ETAPA_FLAGS = ETAPA_PSFS + 1;
  var ETAPA_FIM = ETAPA_FLAGS + 1;
  var total = ETAPA_FIM + 1;

  function podeAvancar(){
    if(etapa===ETAPA_MAPA) return marcadas.length>0;
    if(etapa===ETAPA_INDICE) return indices.length>0;
    if(etapa>=ETAPA_DET_INI && etapa<ETAPA_PSFS){
      var id=indices[etapa-ETAPA_DET_INI]; var d=detalhes[id]||{};
      return d.temporalidade && d.dor_agora!=null && d.sofrimento!=null && d.limitacao!=null;
    }
    if(etapa===ETAPA_PSFS) return psfs.some(function(a){ return a.nome.trim() && a.nota!=null; });
    return true;
  }

  async function enviar(){
    setEnviando(true); setErro("");
    var payload={
      id: uid(),
      momento: momento,
      data: todayISO(),
      regioes: marcadas.map(function(id){
        return {regiao:id, vista:(vistas[id]||"frente"), intensidade:notas[id]};
      }),
      dores: indices.map(function(id){
        var d=detalhes[id]||{};
        return {regiao:id, vista:(vistas[id]||"frente"),
          temporalidade:d.temporalidade, dor_agora:d.dor_agora,
          sofrimento:d.sofrimento, limitacao:d.limitacao,
          mecanismo:d.mecanismo||{}};
      }),
      red_flags: flags,
      psfs: psfs.filter(function(a){ return a.nome.trim() && a.nota!=null; })
                .map(function(a){ return {nome:a.nome.trim(), nota:a.nota, dores:[]}; })
    };
    var r = await enviarAvaliacao(payload);
    setEnviando(false);
    if(r && r.ok){
      limparRascunho(studentId, momento);
      setEtapa(total);           // tela de confirmação
    } else {
      setErro((r&&r.erro) ? String(r.erro) : "Não consegui enviar. Tente de novo.");
    }
  }

  /* ----- tela final ----- */
  if(etapa>=total){
    return e("div",{className:"screen"},
      e("div",{className:"avfim"},
        e("div",{className:"avfimico"},"✅"),
        e("div",{className:"avfimtit"},"Avaliação enviada"),
        e("div",{className:"avfimtxt"},
          "Obrigado por responder com calma. O Matheus vai olhar isso antes do próximo ajuste."),
        e("button",{className:"btn", onClick:onConcluir},"Voltar ao início")));
  }

  /* ----- corpo ----- */
  var conteudo=null;

  if(etapa===ETAPA_MAPA){
    conteudo = e(Passo,{titulo:"Onde está doendo?",
      sub: acompanhadas.length>0
        ? "As regiões em destaque são as que você já acompanha — se ainda incomodam, toque nelas de novo. Marque também o que for novo."
        : "Toque nas regiões que incomodam e dê uma nota de 0 a 10. Se não dói em lugar nenhum, é só avançar."},
      e(MapaCorpo,{vista:vista, onVista:setVista, notas:notas, ativa:ativa,
        acompanhadas:acompanhadas, onPick:pick}),
      ativa ? e("div",{className:"avnota"},
        e("div",{className:"avnotatit"},NOME[ativa]),
        e(Escala,{rotulo:"Quanto incomoda", valor:notas[ativa]!=null?notas[ativa]:null,
          min:"Nada", max:"Muito", onChange:function(n){ setNota(ativa,n); }}),
        e("button",{className:"avnotafechar", onClick:function(){ setAtiva(null); }},"fechar")
      ) : null,
      marcadas.length>0 ? e("div",{className:"avresumo"},
        marcadas.map(function(id){
          return e("span",{key:id, className:"avchip",
            style:{borderColor:corDor(notas[id]), color:corDor(notas[id])}},
            NOME[id]+" "+notas[id]);
        })) : null
    );
  }

  else if(etapa===ETAPA_INDICE){
    conteudo = e(Passo,{titulo:"Qual mais atrapalha o seu dia?",
      sub:"Escolha até 2. São essas que vamos acompanhar de perto."},
      e("div",{className:"avlista"},
        marcadas.map(function(id){
          var on=indices.indexOf(id)>=0;
          var cheio = indices.length>=2 && !on;
          return e("button",{key:id, type:"button",
            className:"avopt"+(on?" on":"")+(cheio?" off":""),
            onClick:function(){ if(!cheio) toggleIndice(id); }},
            e("span",{className:"avoptn"},notas[id]),
            e("span",null,NOME[id]));
        }))
    );
  }

  else if(etapa>=ETAPA_DET_INI && etapa<ETAPA_PSFS){
    var id = indices[etapa-ETAPA_DET_INI];
    var d = detalhes[id]||{mecanismo:{}};
    conteudo = e(Passo,{titulo:NOME[id], sub:"Algumas perguntas sobre essa dor."},
      e("div",{className:"avbloco"},
        e("div",{className:"avlab"},"Há quanto tempo?"),
        e("div",{className:"avdupla"},
          e("button",{type:"button", className:"avopt"+(d.temporalidade==="aguda"?" on":""),
            onClick:function(){ setDet(id,"temporalidade","aguda"); }},"Menos de 3 meses"),
          e("button",{type:"button", className:"avopt"+(d.temporalidade==="cronica"?" on":""),
            onClick:function(){ setDet(id,"temporalidade","cronica"); }},"3 meses ou mais"))
      ),
      e(Escala,{rotulo:"Dor agora", valor:d.dor_agora!=null?d.dor_agora:null,
        min:"Sem dor", max:"Pior dor", onChange:function(n){ setDet(id,"dor_agora",n); }}),
      e(Escala,{rotulo:"O quanto isso te incomoda", valor:d.sofrimento!=null?d.sofrimento:null,
        min:"Nada", max:"Muito", onChange:function(n){ setDet(id,"sofrimento",n); }}),
      e(Escala,{rotulo:"O quanto atrapalha o que você faz", valor:d.limitacao!=null?d.limitacao:null,
        min:"Nada", max:"Muito", onChange:function(n){ setDet(id,"limitacao",n); }}),
      e("div",{className:"avbloco"},
        e("div",{className:"avlab"},"Como é essa dor?"),
        e("div",{className:"avpsub2"},"Não existe resposta certa. Se não souber, marque “Não sei”."),
        MECANISMO.map(function(m){
          var r=(d.mecanismo||{})[m.id];
          return e("div",{key:m.id, className:"avmec"},
            e("div",{className:"avmectxt"},m.txt),
            e("div",{className:"avmecbtns"},
              [["sim","Sim"],["nao","Não"],["naosei","Não sei"]].map(function(o){
                return e("button",{key:o[0], type:"button",
                  className:"avmecbtn"+(r===o[0]?" on":""),
                  onClick:function(){ setMec(id,m.id,o[0]); }}, o[1]);
              })));
        }))
    );
  }

  else if(etapa===ETAPA_PSFS){
    conteudo = e(Passo,{titulo:"O que você quer voltar a fazer?",
      sub:"Escreva até 3 atividades do seu dia e dê uma nota de 0 a 10 para o quanto consegue fazer hoje."},
      psfs.map(function(a,i){
        return e("div",{key:i, className:"avbloco"},
          e("input",{className:"avinput", value:a.nome,
            placeholder:"Ex: subir escada sem parar",
            onChange:function(ev){ var v=ev.target.value;
              setPsfs(function(l){ var n=l.slice(); n[i]=Object.assign({},n[i],{nome:v}); return n; }); }}),
          a.nome.trim() ? e(Escala,{rotulo:"Consigo fazer hoje", valor:a.nota,
            min:"Não consigo", max:"Como antes",
            onChange:function(n){ setPsfs(function(l){ var x=l.slice();
              x[i]=Object.assign({},x[i],{nota:n}); return x; }); }}) : null);
      }),
      psfs.length<3 ? e("button",{className:"avadd",
        onClick:function(){ setPsfs(psfs.concat([{nome:"",nota:null}])); }},"+ outra atividade") : null
    );
  }

  else if(etapa===ETAPA_FLAGS){
    /* red flags SILENCIOSAS: o aluno marca e não recebe alerta nenhum.
       Nem policy de SELECT ele tem nessa tabela. */
    conteudo = e(Passo,{titulo:"Mais algumas informações",
      sub:"Marque o que se aplica. Serve para o Matheus te acompanhar melhor."},
      e("div",{className:"avlista"},
        RED_FLAGS.map(function(f){
          var on=flags.indexOf(f.id)>=0;
          return e("button",{key:f.id, type:"button", className:"avopt"+(on?" on":""),
            onClick:function(){
              setFlags(on ? flags.filter(function(x){ return x!==f.id; })
                          : flags.concat([f.id])); }},
            e("span",{className:"avcheck"},on?"✓":""),
            e("span",null,f.txt));
        }))
    );
  }

  else if(etapa===ETAPA_FIM){
    conteudo = e(Passo,{titulo:"Tudo certo?",
      sub:"Confira o que você registrou antes de enviar."},
      e("div",{className:"avrev"},
        e("div",{className:"avrevlin"},
          e("b",null,marcadas.length),
          " ",(marcadas.length===1?"região marcada":"regiões marcadas")),
        e("div",{className:"avrevlin"},
          e("b",null,indices.length),
          " ",(indices.length===1?"dor acompanhada":"dores acompanhadas"),": ",
          indices.map(function(x){ return NOME[x]; }).join(" · ")),
        e("div",{className:"avrevlin"},
          e("b",null,psfs.filter(function(a){ return a.nome.trim(); }).length),
          " atividades registradas")),
      erro ? e("div",{className:"loginerro"},erro) : null,
      e("button",{className:"btn avenviar", disabled:enviando, onClick:enviar},
        enviando ? "Enviando…" : "Enviar avaliação")
    );
  }

  return e(React.Fragment,null,
    e("div",{className:"avtopo"},
      e("button",{className:"iconbtn", onClick:function(){
        if(etapa===0){ onSair(); } else { setEtapa(etapa-1); }
      }},"‹"),
      e("div",{className:"avprog"},
        e("div",{className:"avprogbar", style:{width:Math.round((etapa/total)*100)+"%"}})),
      e("button",{className:"avsair", onClick:onSair},"Sair")),
    e("div",{className:"screen avscreen"},
      conteudo,
      etapa<ETAPA_FIM ? e("div",{className:"avnav"},
        e("button",{className:"btn", disabled:!podeAvancar(),
          onClick:function(){ setEtapa(etapa+1); window.scrollTo(0,0); }},
          "Continuar")) : null,
      e("div",{className:"avsalvo"},"Suas respostas ficam salvas neste aparelho.")
    ));
}

window.AvaliacaoDor = {
  Componente: Avaliacao,
  MapaCorporal: MapaCorporal,
  MapaCorpo: MapaCorpo,
  REGIOES: TODAS,
  NOME: NOME,
  MECANISMO: MECANISMO,
  RED_FLAGS: RED_FLAGS
};
})();
