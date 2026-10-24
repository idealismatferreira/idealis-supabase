/* historico.js · Histórico do exercício na montagem do treino (App Idealis e Dashboard)
   v1 · 24/10/2026

   Lê a view vw_historico_exercicio_aluno (1 consulta por aluno, SEMPRE com
   filtro de aluno_id) e decide o que mostrar: o selo (novo, volta, sem
   registro...) e o ⚠️ de dor ou dificuldade.

   Código puro: sem React, sem Supabase, sem DOM. Os dois apps carregam ESTE
   arquivo para as regras não divergirem (mesma lição do normAcc).
   Mudou regra? Muda aqui, sobe o ?v= nos dois apps. */
(function(g){
  'use strict';

  /* Multitenant: estes valores viram configuração por treinador. */
  var CONFIG = {
    // dor >= 3/10 acende o ⚠️ (Silbernagel et al., 2007: 0 a 2 = zona segura)
    dorAlerta: 3,
    // o ⚠️ apaga quando as últimas N sessões registradas ficaram abaixo do corte (a view manda 5)
    janelaResolvida: 3,
    anamnese: {
      // tipos de ocorrência que acendem o ⚠️ (ids de ocorrencia_tipos)
      tiposAlerta: ['dor', 'incomodo', 'inseguranca', 'tecnica', 'equipamento', 'adaptacao', 'lesao'],
      // entrada SEM tipo: acende só nestas seções (Preferências fica de fora)
      secoesAlertaSemTipo: ['Dor/Pat', 'Dif. Exerc']
    }
  };

  var normAcc = function(t){ return (t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim(); };
  var maior = function(a,b){ return a==null ? b : (b==null ? a : (a>b ? a : b)); };
  var menor = function(a,b){ return a==null ? b : (b==null ? a : (a<b ? a : b)); };
  var mescla = function(base, extra){ var o={}, k; for(k in base) o[k]=base[k]; for(k in (extra||{})) o[k]=extra[k]; return o; };

  /* ---------- casamento: a MESMA regra das correções (corrCasa) ----------
     cardapio_id quando os DOIS lados têm; senão, o nome normalizado.
     String() porque bigint chega como número ou como texto, conforme o driver. */
  function casa(row, ex){
    var id = (ex && ex.cardapioId!=null) ? ex.cardapioId : null;
    if(row.cardapio_id!=null && id!=null) return String(row.cardapio_id)===String(id);
    var k = normAcc(ex && ex.nome);
    return !!k && (row.chaves||[]).indexOf(k)>=0;
  }
  function casaEx(a, b){
    if(a.cardapioId!=null && b.cardapioId!=null) return String(a.cardapioId)===String(b.cardapioId);
    var ka=normAcc(a.nome), kb=normAcc(b.nome);
    return !!ka && ka===kb;
  }

  /* Junta as linhas da view que casam com o exercício. Mais de uma linha é
     normal: "Supino reto" digitado à mão numa fase antiga + Supino Reto do
     Cardápio hoje. */
  function juntar(rows, ex){
    var rs=(rows||[]).filter(function(r){ return casa(r,ex); });
    if(!rs.length) return null;
    var h={ refs:[], nome:null, primeiro_feito:null, ultimo_feito:null, sessoes:0, sessoes_com_registro:0,
      fases_feitas:0, ultima_prescricao:null, fases_prescritas:[], dor_max:null, dor_max_em:null,
      dor_max_local:null, dor_max_lado:null, dores_recentes:[], anamnese:[], correcoes_ativas:0,
      ultima_correcao_em:null, feito_por_fase:null };
    var dias={}, fases={}, temFases=false;
    rs.forEach(function(r){
      h.refs.push(r.ref);
      if(!h.nome || r.cardapio_id!=null) h.nome=r.nome;
      h.primeiro_feito=menor(h.primeiro_feito, r.primeiro_feito);
      h.ultimo_feito=maior(h.ultimo_feito, r.ultimo_feito);
      h.sessoes+=r.sessoes||0; h.sessoes_com_registro+=r.sessoes_com_registro||0; h.fases_feitas+=r.fases_feitas||0;
      h.ultima_prescricao=maior(h.ultima_prescricao, r.ultima_prescricao);
      (r.fases_prescritas||[]).forEach(function(f){ if(h.fases_prescritas.indexOf(f)<0) h.fases_prescritas.push(f); });
      if(r.dor_max!=null && (h.dor_max==null || r.dor_max>h.dor_max || (r.dor_max===h.dor_max && r.dor_max_em>h.dor_max_em))){
        h.dor_max=r.dor_max; h.dor_max_em=r.dor_max_em; h.dor_max_local=r.dor_max_local; h.dor_max_lado=r.dor_max_lado;
      }
      (r.dores_recentes||[]).forEach(function(d){
        var cur=dias[d.data];
        if(!cur || (d.dor!=null && (cur.dor==null || d.dor>cur.dor))) dias[d.data]={data:d.data, dor:d.dor};
      });
      (r.anamnese||[]).forEach(function(a){ if(!h.anamnese.some(function(x){ return x.id===a.id; })) h.anamnese.push(a); });
      h.correcoes_ativas+=r.correcoes_ativas||0;
      h.ultima_correcao_em=maior(h.ultima_correcao_em, r.ultima_correcao_em);
      if(r.feito_por_fase){
        temFases=true;
        r.feito_por_fase.forEach(function(f){
          var c=fases[f.fase];
          fases[f.fase] = c ? {fase:f.fase, primeiro:menor(c.primeiro,f.primeiro), ultimo:maior(c.ultimo,f.ultimo), sessoes:c.sessoes+(f.sessoes||0)}
                            : {fase:f.fase, primeiro:f.primeiro, ultimo:f.ultimo, sessoes:f.sessoes||0};
        });
      }
    });
    h.dores_recentes=Object.keys(dias).map(function(k){ return dias[k]; })
      .sort(function(a,b){ return b.data.localeCompare(a.data); }).slice(0,5);
    if(temFases) h.feito_por_fase=Object.keys(fases).map(function(k){ return fases[k]; })
      .sort(function(a,b){ return String(b.ultimo).localeCompare(String(a.ultimo)); });
    return h;
  }

  /* Execução ANTES da fase que está sendo montada. alvo = {id, inicio} (ou só o id).
     A fase alvo não conta, nem o que veio depois do início dela: montar a fase
     atual não pode transformar o que entrou nela em "já feito". */
  function execucaoAntes(h, alvo){
    if(!h) return null;
    var a = (alvo && typeof alvo==='object') ? alvo : (alvo ? {id:alvo} : null);
    if(!h.feito_por_fase){        // view v1 (sem o recorte por fase): aproxima pelo total
      if(!h.ultimo_feito) return null;
      if(a && a.inicio && String(h.primeiro_feito)>=String(a.inicio)) return null;
      return {primeiro:h.primeiro_feito, ultimo:h.ultimo_feito, sessoes:h.sessoes, fases:h.fases_feitas};
    }
    var fs=h.feito_por_fase.filter(function(f){
      if(!a) return true;
      if(f.fase===a.id) return false;
      return !a.inicio || String(f.primeiro)<String(a.inicio);
    });
    if(!fs.length) return null;
    var o={primeiro:null, ultimo:null, sessoes:0, fases:0};
    fs.forEach(function(f){
      o.primeiro=menor(o.primeiro,f.primeiro); o.ultimo=maior(o.ultimo,f.ultimo);
      o.sessoes+=f.sessoes||0; if(f.fase!=='sem-fase') o.fases++;
    });
    return o;
  }

  /* Fase de referência para "fase anterior": a imediatamente antes da alvo
     (pelo início). Sem fase alvo (treino antigo sem fase), vale a fase que
     cobre hoje ou a última que já começou. */
  function faseAnterior(fases, alvo, hoje){
    var fs=(fases||[]).slice().sort(function(a,b){ return String(a.inicio).localeCompare(String(b.inicio)); });
    if(alvo){
      var antes=fs.filter(function(f){ return f.id!==alvo.id && String(f.inicio)<String(alvo.inicio); });
      return antes.length ? antes[antes.length-1] : null;
    }
    var cobre=fs.filter(function(f){ return f.inicio<=hoje && (!f.fim || f.fim>=hoje); });
    if(cobre.length) return cobre[cobre.length-1];
    var ja=fs.filter(function(f){ return f.inicio<=hoje; });
    return ja.length ? ja[ja.length-1] : null;
  }

  /* contexto da montagem
     fases: [{id, inicio, fim}] do aluno
     exerciciosDaFase(faseId) -> [{cardapioId, nome}] (o app e o Dashboard já têm em memória) */
  function contexto(fases, exerciciosDaFase, alvoId, hoje){
    var alvo=null, inicioDe={};
    (fases||[]).forEach(function(f){ inicioDe[f.id]=f.inicio; if(f.id===alvoId) alvo=f; });
    var ant=faseAnterior(fases, alvo, hoje);
    return { alvoId: alvo ? alvo.id : null, alvo: alvo, ant: ant, inicioDe: inicioDe,
             exAnt: ant ? (exerciciosDaFase(ant.id)||[]) : [] };
  }

  /* Selo. ctx = { alvoId, naFaseAnterior }
     "Retorno" usa a PRESCRIÇÃO da fase anterior, não a data do último
     registro: ela existe mesmo quando a fase anterior acabou de começar. */
  function selo(h, ctx){
    var c=ctx||{};
    var alvo=c.alvo || (c.alvoId ? {id:c.alvoId} : null);
    if(execucaoAntes(h, alvo)) return c.naFaseAnterior ? 'recente' : 'retorno';
    // prescrito antes (fase já iniciada, que não é a alvo e começou antes dela), nunca feito
    var outras=((h && h.fases_prescritas)||[]).filter(function(f){
      if(alvo && f===alvo.id) return false;
      if(alvo && alvo.inicio && c.inicioDe && c.inicioDe[f]) return String(c.inicioDe[f])<String(alvo.inicio);
      return true;
    });
    if(outras.length) return 'sem_registro';
    if(c.naFaseAnterior) return 'planejado';
    return 'novo';
  }

  function anamneseAcende(a, C){
    var cfg=C.anamnese||{};
    if(a.tipo_id) return (cfg.tiposAlerta||[]).indexOf(a.tipo_id)>=0;
    return (cfg.secoesAlertaSemTipo||[]).indexOf(a.secao_id)>=0;
  }

  /* ⚠️: null (sem símbolo) ou {nivel:'ativo'|'apagado', motivos:[...]} */
  function alerta(h, cfg){
    var C=mescla(CONFIG, cfg);
    if(!h) return null;
    var corte=function(d){ return d && d.dor!=null && d.dor>=C.dorAlerta; };
    var todas=h.dores_recentes||[];
    var rec=todas.slice(0, C.janelaResolvida);
    var motivos=[];
    if(h.dor_max!=null && h.dor_max>=C.dorAlerta){
      motivos.push({tipo:'dor', ativo:rec.some(corte), dor:h.dor_max, em:h.dor_max_em,
        local:h.dor_max_local, lado:h.dor_max_lado});
    }
    (h.anamnese||[]).forEach(function(a){
      if(!anamneseAcende(a, C)) return;
      // a anamnese é foto do passado: apaga quando o aluno já fez N sessões
      // registradas DEPOIS dela, todas abaixo do corte (tolerância demonstrada)
      var desde=a.data || String(a.criado_em||'').slice(0,10);
      var depois=todas.filter(function(d){ return desde && d.data>desde; });
      var tolerou=depois.length>=C.janelaResolvida && !depois.slice(0,C.janelaResolvida).some(corte);
      motivos.push({tipo:'anamnese', ativo:!tolerou, secao:a.secao||'', tipoNome:a.tipo||'',
        texto:a.texto||'', data:a.data||null, dataTexto:a.data_texto||''});
    });
    if(h.correcoes_ativas>0) motivos.push({tipo:'correcao', ativo:true, n:h.correcoes_ativas, em:h.ultima_correcao_em});
    if(!motivos.length) return null;
    return { nivel: motivos.some(function(m){ return m.ativo; }) ? 'ativo' : 'apagado', motivos: motivos };
  }

  /* ---------- textos (iguais nos dois apps; sem travessão) ---------- */
  var REGIAO_SERIE = { cervical:'Cervical / Nuca', ombro:'Ombro', cotovelo:'Cotovelo', punho:'Punho / Mão',
    toracica:'Torácica', lombar:'Lombar', quadril:'Quadril', joelho:'Joelho', tornozelo:'Tornozelo / Pé', outro:'Outro' };
  var LADO = { e:'esq.', d:'dir.', ambos:'ambos' };

  function fmtData(iso){ if(!iso) return ''; var p=String(iso).slice(0,10).split('-'); return p.length===3 ? p[2]+'/'+p[1]+'/'+p[0].slice(2) : String(iso); }
  function diasEntre(iso, hoje){
    var a=Date.parse(String(iso).slice(0,10)+'T00:00:00'), b=Date.parse(String(hoje).slice(0,10)+'T00:00:00');
    return (isNaN(a)||isNaN(b)) ? null : Math.round((b-a)/86400000);
  }
  function tempoRelativo(iso, hoje){
    var d=diasEntre(iso, hoje); if(d==null) return '';
    if(d<=0) return 'hoje';
    if(d===1) return 'ontem';
    if(d<14) return 'há '+d+' dias';
    if(d<60){ var s=Math.round(d/7); return 'há '+s+' semanas'; }
    if(d<365){ var m=Math.round(d/30.44); return m<=1 ? 'há 1 mês' : 'há '+m+' meses'; }
    var y=Math.floor(d/365); return y===1 ? 'há 1 ano' : 'há '+y+' anos';
  }
  /* {txt, tom}: tom = novo | retorno | neutro | mudo */
  function rotuloSelo(s, antes, hoje){
    if(s==='novo') return {txt:'novo', tom:'novo'};
    if(s==='retorno') return {txt:'volta · '+tempoRelativo(antes && antes.ultimo, hoje), tom:'retorno'};
    if(s==='sem_registro') return {txt:'prescrito, sem registro', tom:'neutro'};
    if(s==='recente') return {txt:'feito '+tempoRelativo(antes && antes.ultimo, hoje), tom:'mudo'};
    return {txt:'', tom:'mudo'};
  }
  function textoMotivo(m, opts){
    var o=opts||{}, rl=o.regiaoLabel||function(k){ return REGIAO_SERIE[k]||k; };
    var C=mescla(CONFIG, o.config);
    if(m.tipo==='dor'){
      var onde=m.local ? ' · '+rl(m.local)+(m.lado ? ' ('+(LADO[m.lado]||m.lado)+')' : '') : '';
      return 'Dor '+m.dor+'/10'+onde+' · '+fmtData(m.em)+(m.ativo ? '' : ' · últimas '+C.janelaResolvida+' sessões abaixo de '+C.dorAlerta+'/10');
    }
    if(m.tipo==='anamnese'){
      var rot=[m.secao, m.tipoNome].filter(Boolean).join(' · ');
      var quando=m.data ? fmtData(m.data) : (m.dataTexto||'');
      return 'Anamnese'+(rot ? ' · '+rot : '')+': '+m.texto+(quando ? ' ('+quando+')' : '')+
        (m.ativo ? '' : ' · já fez '+C.janelaResolvida+' sessões depois, abaixo de '+C.dorAlerta+'/10');
    }
    if(m.tipo==='correcao') return m.n===1 ? '1 correção de execução ativa' : m.n+' correções de execução ativas';
    return '';
  }
  function textoAntes(antes){
    if(!antes) return '';
    var t=antes.sessoes===1 ? '1 sessão' : antes.sessoes+' sessões';
    if(antes.fases>1) t+=' em '+antes.fases+' fases';
    return t+' · último '+fmtData(antes.ultimo);
  }

  /* tudo de uma vez, para a tela */
  function info(rows, ctx, ex, hoje, cfg){
    if(!rows || !ctx) return null;
    var h=juntar(rows, ex);
    var naAnt=(ctx.exAnt||[]).some(function(x){ return casaEx(x, ex); });
    var s=selo(h, {alvoId:ctx.alvoId, alvo:ctx.alvo, inicioDe:ctx.inicioDe, naFaseAnterior:naAnt});
    var antes=execucaoAntes(h, ctx.alvo || ctx.alvoId);
    return { h:h, selo:s, antes:antes, rotulo:rotuloSelo(s, antes, hoje), alerta:alerta(h, cfg) };
  }

  /* resumo da fase: exs = exercícios da fase alvo [{cardapioId, nome}] (repetidos são juntados) */
  function resumo(rows, ctx, exs, hoje, cfg){
    var r={novos:[], retornos:[], semRegistro:[], alertas:[]}, vistos=[];
    (exs||[]).forEach(function(ex){
      if(!ex || !normAcc(ex.nome)) return;
      if(vistos.some(function(v){ return casaEx(v, ex); })) return;
      vistos.push(ex);
      var i=info(rows, ctx, ex, hoje, cfg); if(!i) return;
      var nome=String(ex.nome).trim();
      if(i.selo==='novo') r.novos.push(nome);
      else if(i.selo==='retorno') r.retornos.push({nome:nome, ultimo:i.antes && i.antes.ultimo});
      else if(i.selo==='sem_registro') r.semRegistro.push(nome);
      if(i.alerta) r.alertas.push({nome:nome, nivel:i.alerta.nivel});
    });
    return r;
  }
  /* mensagem pro aluno: SÓ novos e retornos. O ⚠️ fica com o treinador:
     avisar "esse doeu" aumenta a expectativa de dor (nocebo; Colloca e Benedetti, 2007). */
  function mensagem(res, primeiroNome){
    var linhas=['Oi'+(primeiroNome ? ', '+primeiroNome : '')+'! Fase nova liberada no app 💪'];
    if(res.novos.length) linhas.push('Novidades: '+res.novos.join(', '));
    if(res.retornos.length) linhas.push('De volta: '+res.retornos.map(function(x){ return x.nome; }).join(', '));
    if(!res.novos.length && !res.retornos.length) linhas.push('Mesmos exercícios, com ajustes.');
    linhas.push('Qualquer dúvida me chama.');
    return linhas.join('\n');
  }

  g.HistoricoExercicio = {
    versao: 1, CONFIG: CONFIG,
    normAcc: normAcc, casa: casa, casaEx: casaEx, juntar: juntar,
    execucaoAntes: execucaoAntes, faseAnterior: faseAnterior, contexto: contexto,
    selo: selo, alerta: alerta, info: info, resumo: resumo, mensagem: mensagem,
    rotuloSelo: rotuloSelo, textoMotivo: textoMotivo, textoAntes: textoAntes,
    tempoRelativo: tempoRelativo, fmtData: fmtData, REGIAO_SERIE: REGIAO_SERIE
  };
})(typeof window!=='undefined' ? window : globalThis);
