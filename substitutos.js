/* substitutos.js · Exercícios Substitutos (Cardápio, Dashboard e App Idealis)
   v1 · 12/11/2026

   Duas coisas moram aqui, e em mais nenhum lugar:
   1. A regra das SUGESTÕES AUTOMÁTICAS de substituto: a mesma do "Substituir"
      do App (LOTE_SUBST_V1/V2), copiada do brief do App de nov/2026.
   2. As regras dos FIXOS (tabela cardapio_substitutos): ordem, arquivado,
      sem vídeo e a trava do isométrico.

   Código puro: sem React, sem Supabase, sem DOM. Os três apps carregam ESTE
   arquivo (cópia verbatim, no padrão do historico.js) para as regras não
   divergirem. Mudou regra? Muda aqui, sobe o ?v= nos três apps.

   Uso:
     var S   = window.SubstitutosExercicio;
     var cat = linhasDoCardapio.map(S.deCardapio);      // formato da regra
     var res = S.similaresDe(cat, idDoExercicio, idsJaFixados);
     S.rotuloTier(item.tier, res.temCat);               // "Mesmo movimento"...
     var fx  = S.fixosDe(linhasSubst, cat, idDoExercicio);
     fx.filter(S.visivelNoApp);                         // o que o App mostra
*/
(function(g){
  'use strict';

  /* ======================================================================
     1. REGRA DAS SUGESTÕES AUTOMÁTICAS — idêntica à do App. Não editar só aqui.
     Única diferença de escrita (não de comportamento): os caracteres especiais
     das regex vão por código \uXXXX em vez de literais, para não se perderem
     quando o arquivo passa por editor ou chat.
       /[̀-ͯ]/  = /[̀-ͯ]/  do App (acentos combinantes)
       /["'“”]/ = /["'“”]/ do App (aspas retas e curvas)
     ====================================================================== */
  const normAcc = (t)=>(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();

  const SUBST_GRUPOS_FORA=['Zona Terapêutica','Melhor Idade','Funcional','Aeróbios','Yoga','Coordenação','Pliométricos','Inferiores','Superiores','Cardio'];
  const SUBST_CAT_FORA=['Em casa','Principais - Academia','Dores no joelho'];
  const SUBST_LEVE=['alongamento','ativacao','mobilizacao','mobilidade'];
  function substTag(v){
    return normAcc(String(v||'')).replace(/["'“”]/g,'').replace(/\s+/g,' ').trim()
      .split(' ').map(w=>w.replace(/s$/,'').replace(/e$/,'')).join(' ');
  }
  const SUBST_G_FORA=new Set(SUBST_GRUPOS_FORA.map(substTag));
  const SUBST_C_FORA=new Set(SUBST_CAT_FORA.map(substTag));
  const SUBST_LEVE_T=SUBST_LEVE.map(substTag);
  function substVals(v){ return String(v||'').split('|').map(x=>x.trim()).filter(Boolean); }
  function substInfo(c){
    const grupos=substVals(c.grupo).map(substTag).filter(g=>g && !SUBST_G_FORA.has(g));
    const cats=substVals(c.cat).map(substTag).filter(Boolean);
    const leve=cats.concat([substTag(c.nome)]).some(k=>k.split(' ').some(w=>SUBST_LEVE_T.indexOf(w)>=0));
    return {grupos, cats, equip:substVals(c.equip), leve};
  }
  /* {orig, gOrig, temCat, itens:[{c, tier(1|2), gC, equip}], semGrupo?} */
  function similaresDe(catalogo, origId, idsFora){
    const lista=catalogo||[];
    const orig=lista.find(c=>c && String(c.id)===String(origId))||null;
    if(!orig) return {orig:null, gOrig:[], temCat:false, itens:[]};
    const eqT=new Set(); lista.forEach(c=>substVals(c && c.equip).forEach(e=>eqT.add(substTag(e))));
    const catOk=(k)=>!!k && !SUBST_C_FORA.has(k) && !eqT.has(k);
    const io=substInfo(orig);
    const gO=new Set(io.grupos), cO=new Set(io.cats.filter(catOk));
    if(!gO.size) return {orig, gOrig:[], temCat:false, itens:[], semGrupo:true};
    const fora=new Set((idsFora||[]).map(String)); fora.add(String(orig.id));
    const itens=[];
    lista.forEach(c=>{
      if(!c || c.id==null || !c.nome || c.arquivado || fora.has(String(c.id))) return;
      if(c.iso && !orig.iso) return;
      const ic=substInfo(c);
      if(ic.leve && !io.leve) return;
      const gC=ic.grupos.filter(g=>gO.has(g)).length;
      if(!gC) return;
      const cC=ic.cats.filter(k=>catOk(k) && cO.has(k)).length;
      itens.push({c, tier:cC>0?1:2, gC, equip:ic.equip});
    });
    itens.sort((a,b)=>(a.tier-b.tier)||(b.gC-a.gC)||String(a.c.nome).localeCompare(String(b.c.nome),'pt'));
    return {orig, gOrig:Array.from(gO), temCat:cO.size>0, itens};
  }

  /* Tier 1: "Mesmo movimento". Tier 2: "Muda o estímulo" quando o original
     tem Categoria (temCat), ou "Mesmo músculo" quando não tem. */
  function rotuloTier(tier, temCat){
    if(tier===1) return 'Mesmo movimento';
    return temCat ? 'Muda o estímulo' : 'Mesmo músculo';
  }

  /* ======================================================================
     2. ADAPTADOR: linha de public.cardapio -> formato da regra
     {id, nome, grupo, cat, equip, iso, arquivado} (+ video, que a regra ignora)
     Um lugar só: grupos (text[]) vira texto com ' | ', igual ao App.
     ====================================================================== */
  function deCardapio(row){
    const r=row||{};
    return {
      id: r.id,
      nome: r.exercicio,
      grupo: Array.isArray(r.grupos) ? r.grupos.filter(Boolean).join(' | ') : String(r.grupos||''),
      cat: r.subgrupo||'',
      equip: r.equipamento||'',
      iso: r.isometrico===true,
      arquivado: !!r.arquivado_em,
      video: r.video_url||''
    };
  }

  /* ======================================================================
     3. VÍDEO — o mesmo ytId do App
     ====================================================================== */
  function ytId(url){
    const u=String(url||'').trim();
    if(!u) return null;
    let m=u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);        if(m) return m[1];
    m=u.match(/[?&]v=([A-Za-z0-9_-]{6,})/);                 if(m) return m[1];
    m=u.match(/youtube\.com\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,})/); if(m) return m[1];
    return null;
  }
  function thumbYT(url){ const id=ytId(url); return id ? 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg' : null; }
  // "Sem vídeo" = sem URL nenhuma. Link que não é do YouTube conta como vídeo (só não tem thumb).
  function temVideo(c){ return !!String((c && c.video)||'').trim(); }

  /* ======================================================================
     4. FIXOS
     ====================================================================== */
  /* Pode fixar `cand` como substituto de `orig`? (os dois no formato da regra)
     Mão única: fixar B em A não diz nada sobre fixar A em B.
     Isométrico só pode ser fixo de isométrico: é a mesma trava das sugestões
     (c.iso && !orig.iso), e o App registra isométrico em tempo, não em reps. */
  function podeFixar(orig, cand){
    if(!orig || !cand) return {ok:false, motivo:'exercício não encontrado'};
    if(String(orig.id)===String(cand.id)) return {ok:false, motivo:'é o próprio exercício'};
    if(cand.arquivado) return {ok:false, motivo:'arquivado'};
    if(cand.iso && !orig.iso) return {ok:false, motivo:'isométrico só pode ser fixo de outro isométrico'};
    return {ok:true, motivo:''};
  }

  /* Linhas de cardapio_substitutos de um exercício, na ordem do App, já com o
     exercício do catálogo pendurado. Ordem: `ordem`, desempate por id da linha.
     -> [{linha, c|null, existe, arquivado, semVideo}] */
  function fixosDe(linhas, catalogo, origId){
    const porId=new Map(); (catalogo||[]).forEach(c=>{ if(c && c.id!=null) porId.set(String(c.id), c); });
    return (linhas||[])
      .filter(l=>l && String(l.cardapio_id)===String(origId))
      .sort((a,b)=>((a.ordem==null?1e9:a.ordem)-(b.ordem==null?1e9:b.ordem)) || (Number(a.id)||0)-(Number(b.id)||0))
      .map(l=>{
        const c=porId.get(String(l.substituto_id))||null;
        return {linha:l, c, existe:!!c, arquivado:!!(c && c.arquivado), semVideo:!c || !temVideo(c)};
      });
  }
  /* O App mostra o fixo se ele existe e não está arquivado. Sem vídeo aparece
     (com o selo), porque foi escolha do treinador. Indisponível no dia (já no
     treino de hoje, dor relatada) é regra do App, fica lá. */
  function visivelNoApp(f){ return !!(f && f.existe && !f.arquivado); }

  /* Grupos em comum para exibir no cartão (nomes como estão no cadastro). */
  function gruposEmComum(c, res){
    const gO=new Set((res && res.gOrig)||[]);
    return substVals(c && c.grupo).filter(gr=>gO.has(substTag(gr)));
  }

  /* Chips "O que está livre aí?": equipamentos das sugestões, com contagem.
     Junta grafias diferentes do mesmo equipamento pela chave substTag. */
  function contarEquip(itens){
    const m=new Map();
    (itens||[]).forEach(it=>{
      const vistos=new Set();
      (it.equip||[]).forEach(e=>{
        const k=substTag(e); if(!k || vistos.has(k)) return; vistos.add(k);
        if(!m.has(k)) m.set(k,{chave:k, nome:e, n:0});
        m.get(k).n++;
      });
    });
    return Array.from(m.values()).sort((a,b)=>(b.n-a.n)||String(a.nome).localeCompare(String(b.nome),'pt'));
  }
  /* chaves vazias = sem filtro; senão, fica quem usa QUALQUER um dos marcados */
  function filtrarPorEquip(itens, chaves){
    const sel=new Set(chaves||[]);
    if(!sel.size) return itens||[];
    return (itens||[]).filter(it=>(it.equip||[]).some(e=>sel.has(substTag(e))));
  }

  const api={
    versao:1,
    // regra (idêntica ao App)
    normAcc, substTag, substVals, substInfo, similaresDe,
    SUBST_GRUPOS_FORA, SUBST_CAT_FORA, SUBST_LEVE,
    rotuloTier,
    // adaptador e vídeo
    deCardapio, ytId, thumbYT, temVideo,
    // fixos
    podeFixar, fixosDe, visivelNoApp, gruposEmComum, contarEquip, filtrarPorEquip
  };
  g.SubstitutosExercicio=api;
  if(typeof module!=='undefined' && module.exports) module.exports=api;
})(typeof window!=='undefined' ? window : globalThis);