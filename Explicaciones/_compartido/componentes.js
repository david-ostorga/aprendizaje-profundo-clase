/* =====================================================================
   Componentes compartidos · Artefactos de estudio de Aprendizaje Profundo
   Todo vive bajo window.DL. Solo el orquestador edita este archivo.
   Requiere cargar antes _compartido/notacion.js (window.NOTACION).

   Inicialización automática (no hay que llamar nada):
     · tema claro/oscuro (#themeBtn), índice lateral (#toc[data-auto]),
       barra de progreso (#progress), menú móvil (#menuBtn, #scrim)
     · símbolos con explicación: <span class="sym" data-s="phi"></span>
     · derivaciones que se revelan: <ol class="deriv" data-revelar>
     · laboratorios declarativos: <div class="widget" data-pasos> con hijos .paso
     · navegación de la serie: <nav class="serie" data-actual="02"></nav>
     · leyenda de roles: <div class="leyenda-roles"></div>
     · tabla de notación: <div data-tabla-notacion data-grupo="..."></div>

   API para laboratorios propios (ver plantilla.html):
     DL.grafica(canvas, opciones, dibujar) · DL.control · DL.selector
     DL.pasos · DL.readout · DL.bucle · DL.rng · DL.fmt · DL.matriz
     DL.color · DL.alCambiarTema · DL.linspace · DL.relu · DL.sigmoide · DL.softmax
   ===================================================================== */
(function(){
  "use strict";

  var DL = window.DL = window.DL || {};

  /* ---------------- serie de artefactos ---------------- */
  DL.SERIE = [
    {id:"00", archivo:"00_matematicas.html",      titulo:"Matemáticas y notación"},
    {id:"01", archivo:"01_repaso_ml.html",        titulo:"Intro y repaso de ML"},
    {id:"02", archivo:"02_redes_neuronales.html", titulo:"Redes neuronales"},
    {id:"03", archivo:"03_entrenamiento1.html",   titulo:"Entrenamiento 1: pérdidas y optimizadores"},
    {id:"04", archivo:"04_entrenamiento2.html",   titulo:"Entrenamiento 2: backprop, inicialización y desempeño"},
    {id:"05", archivo:"05_regularizacion.html",   titulo:"Regularización"}
  ];

  /* ---------------- utilidades numéricas ---------------- */
  DL.fmt = function(x, d){
    if(d === undefined) d = 3;
    if(x === null || x === undefined || isNaN(x)) return "—";
    if(!isFinite(x)) return x > 0 ? "∞" : "−∞";
    var s = Math.abs(x) >= 1e5 || (Math.abs(x) > 0 && Math.abs(x) < Math.pow(10, -d))
      ? x.toExponential(2) : x.toFixed(d);
    return s.replace(/^-/, "−");
  };
  DL.linspace = function(a, b, n){
    var out = []; for(var i=0;i<n;i++) out.push(a + (b-a)*i/(n-1)); return out;
  };
  DL.relu = function(z){ return z > 0 ? z : 0; };
  DL.sigmoide = function(z){ return 1/(1+Math.exp(-z)); };
  DL.softmax = function(z){
    var m = Math.max.apply(null, z), e = z.map(function(v){ return Math.exp(v-m); });
    var s = e.reduce(function(a,b){ return a+b; }, 0);
    return e.map(function(v){ return v/s; });
  };
  /* generador aleatorio con semilla (mulberry32) + normal estándar */
  DL.rng = function(semilla){
    var a = (semilla === undefined ? 1234 : semilla) >>> 0;
    function u(){
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    return {
      u: u,
      normal: function(m, s){
        var u1 = u() || 1e-12, u2 = u();
        return (m||0) + (s===undefined?1:s) * Math.sqrt(-2*Math.log(u1)) * Math.cos(2*Math.PI*u2);
      },
      entero: function(n){ return Math.floor(u()*n); }
    };
  };

  /* ---------------- colores y tema ---------------- */
  DL.color = function(nombre){
    if(!nombre) return "#888";
    if(nombre[0] === "#" || nombre.indexOf("rgb") === 0 || nombre.indexOf("hsl") === 0) return nombre;
    var v = getComputedStyle(document.documentElement).getPropertyValue("--" + nombre.replace(/^--/, "")).trim();
    return v || nombre;
  };
  function hexARgb(h){
    h = h.replace("#", "");
    if(h.length === 3) h = h.split("").map(function(c){ return c+c; }).join("");
    var n = parseInt(h, 16); return [(n>>16)&255, (n>>8)&255, n&255];
  }
  DL.mezclar = function(c1, c2, t){
    var a = hexARgb(DL.color(c1)), b = hexARgb(DL.color(c2));
    return "rgb(" + [0,1,2].map(function(i){ return Math.round(a[i] + (b[i]-a[i])*t); }).join(",") + ")";
  };
  var temaListeners = [];
  DL.alCambiarTema = function(fn){ temaListeners.push(fn); };
  function avisarTema(){ temaListeners.forEach(function(fn){ try{ fn(); }catch(e){ console.error(e); } }); }

  /* se aplica en cuanto carga el script, para evitar un parpadeo de tema */
  try{ var temaGuardado = localStorage.getItem("dl-tema"); if(temaGuardado) document.documentElement.setAttribute("data-theme", temaGuardado); }catch(e){}

  function initTema(){
    var root = document.documentElement;
    var btn = document.getElementById("themeBtn");
    if(btn) btn.addEventListener("click", function(){
      var cur = root.getAttribute("data-theme");
      var oscuro = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var sig = oscuro ? "light" : "dark";
      root.setAttribute("data-theme", sig);
      try{ localStorage.setItem("dl-tema", sig); }catch(e){}
      avisarTema();
    });
    try{ window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", avisarTema); }catch(e){}
  }

  /* ---------------- índice lateral, progreso, menú ---------------- */
  function textoTitulo(h){
    if(h.getAttribute("data-toc")) return h.getAttribute("data-toc");
    var c = h.cloneNode(true); var n = c.querySelector(".num"); if(n) n.remove();
    return c.textContent.trim();
  }
  function initToc(){
    var toc = document.getElementById("toc");
    if(!toc) return;
    if(toc.hasAttribute("data-auto")){
      var html = '<p class="toc-title">Contenido</p>';
      if(document.getElementById("inicio")) html += '<a href="#inicio">Inicio</a>';
      var n2 = 0;
      document.querySelectorAll("main h2[id], main h3[id]").forEach(function(h){
        if(h.getAttribute("data-toc") === "no") return;
        var t = textoTitulo(h);
        if(h.tagName === "H2"){ n2++; html += '<a href="#'+h.id+'">'+n2+' · '+t+'</a>'; }
        else html += '<a class="sub" href="#'+h.id+'">'+(h.classList.contains("lab") ? "◆ " : "")+t+'</a>';
      });
      toc.innerHTML = html;
    }
    var scrim = document.getElementById("scrim"), menuBtn = document.getElementById("menuBtn");
    var crumb = document.getElementById("crumb"), prog = document.getElementById("progress");
    function cerrar(){ toc.classList.remove("open"); if(scrim) scrim.classList.remove("on"); }
    if(menuBtn) menuBtn.addEventListener("click", function(){
      toc.classList.toggle("open"); if(scrim) scrim.classList.toggle("on", toc.classList.contains("open"));
    });
    if(scrim) scrim.addEventListener("click", cerrar);
    var links = Array.prototype.slice.call(toc.querySelectorAll("a"));
    links.forEach(function(a){ a.addEventListener("click", function(){ if(window.innerWidth <= 860) cerrar(); }); });
    var objetivos = links.map(function(a){ return document.getElementById(a.getAttribute("href").slice(1)); });
    var crumbBase = crumb ? crumb.textContent : "";
    function alDesplazar(){
      var y = window.scrollY, h = document.body.scrollHeight - window.innerHeight;
      if(prog) prog.style.width = (h > 0 ? Math.min(100, y/h*100) : 0) + "%";
      var mejor = 0;
      for(var i=0;i<objetivos.length;i++){ if(objetivos[i] && objetivos[i].getBoundingClientRect().top <= 120) mejor = i; }
      links.forEach(function(a,i){ a.classList.toggle("active", i===mejor); });
      if(crumb && links[mejor]) crumb.textContent = mejor === 0 ? crumbBase : crumbBase + " · " + links[mejor].textContent.replace(/^\d+\s·\s|^◆\s/, "");
    }
    window.addEventListener("scroll", alDesplazar, {passive:true});
    window.addEventListener("resize", alDesplazar);
    alDesplazar();
  }

  /* ---------------- símbolos con explicación emergente ---------------- */
  var ROLES = {
    param:{t:"parámetro aprendible", c:"r-param"},
    dato:{t:"dato observado", c:"r-dato"},
    hiper:{t:"hiperparámetro", c:"r-hiper"},
    calc:{t:"cantidad calculada", c:"r-calc"},
    op:{t:"operador / notación", c:""}
  };
  DL.ROLES = ROLES;
  function enMatematicas(){ return /00_matematicas\.html$/.test(location.pathname); }
  DL.enlaceSimbolo = function(clave){ return (enMatematicas() ? "" : "00_matematicas.html") + "#sym-" + clave; };

  function initSimbolos(){
    var N = window.NOTACION || {};
    var pop = document.createElement("div"); pop.id = "sym-pop"; pop.setAttribute("role", "tooltip");
    document.body.appendChild(pop);
    var ocultarT = null, actual = null;
    function mostrar(el){
      clearTimeout(ocultarT);
      var k = el.getAttribute("data-s"), e = N[k];
      if(!e) return;
      var rol = ROLES[e.rol] || ROLES.op;
      pop.innerHTML =
        '<div class="sp-h"><span class="sp-s '+rol.c+'">'+e.s+'</span><span class="sp-n">'+e.n+'</span>'+
        '<span class="sp-rol '+rol.c+'">'+rol.t+'</span></div>'+
        '<div class="sp-l"><b>Se lee:</b> '+e.l+'</div>'+
        '<div class="sp-l">'+e.d+'</div>'+
        '<a href="'+DL.enlaceSimbolo(k)+'">Ver en la tabla de notación →</a>';
      var r = el.getBoundingClientRect();
      pop.classList.add("on");
      var pw = pop.offsetWidth, ph = pop.offsetHeight;
      var left = Math.max(8, Math.min(window.scrollX + r.left + r.width/2 - pw/2, window.scrollX + document.documentElement.clientWidth - pw - 8));
      var top = window.scrollY + r.bottom + 8;
      if(r.bottom + ph + 16 > window.innerHeight) top = window.scrollY + r.top - ph - 8;
      pop.style.left = left + "px"; pop.style.top = top + "px";
      actual = el;
    }
    function ocultar(){ ocultarT = setTimeout(function(){ pop.classList.remove("on"); actual = null; }, 160); }
    pop.addEventListener("mouseenter", function(){ clearTimeout(ocultarT); });
    pop.addEventListener("mouseleave", ocultar);
    document.addEventListener("click", function(ev){
      if(!ev.target.closest(".sym") && !ev.target.closest("#sym-pop")){ pop.classList.remove("on"); actual = null; }
    });
    DL.activarSimbolos = function(raiz){
      (raiz || document).querySelectorAll(".sym[data-s]").forEach(function(el){
        if(el.__sym) return; el.__sym = true;
        var k = el.getAttribute("data-s"), e = N[k];
        if(!e){ console.warn("[DL] símbolo sin entrada en notacion.js:", k); el.classList.add("sym-falta"); return; }
        if(!el.innerHTML.trim()) el.innerHTML = e.s;
        if(/^[A-Za-z]{2,}/.test(el.textContent.trim()) || /^(E\[|P\()/.test(el.textContent.trim())) el.classList.add("recto");
        var rol = ROLES[e.rol];
        if(rol && rol.c && !/\br-/.test(el.className)) el.classList.add(rol.c);
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", e.n + ": " + e.d);
        el.addEventListener("mouseenter", function(){ mostrar(el); });
        el.addEventListener("mouseleave", ocultar);
        el.addEventListener("focus", function(){ mostrar(el); });
        el.addEventListener("blur", ocultar);
        el.addEventListener("click", function(ev){ ev.stopPropagation(); if(actual === el && pop.classList.contains("on")){ pop.classList.remove("on"); actual = null; } else mostrar(el); });
      });
    };
    DL.activarSimbolos();
  }

  /* ---------------- leyenda de roles ---------------- */
  function initLeyendas(){
    document.querySelectorAll(".leyenda-roles").forEach(function(el){
      if(el.innerHTML.trim()) return;
      el.innerHTML = ["param","dato","hiper","calc"].map(function(r){
        return '<span><i style="background:var(--r-'+r+')"></i>'+ROLES[r].t+'</span>';
      }).join("");
    });
  }

  /* ---------------- tabla de notación ---------------- */
  function initTablaNotacion(){
    var N = window.NOTACION || {};
    document.querySelectorAll("[data-tabla-notacion]").forEach(function(el){
      var grupo = el.getAttribute("data-grupo");
      var claves = Object.keys(N).filter(function(k){ return !grupo || N[k].g === grupo; });
      var filas = claves.map(function(k){
        var e = N[k], rol = ROLES[e.rol] || ROLES.op;
        return '<tr id="sym-'+k+'"><td class="s-col '+rol.c+'">'+e.s+'</td><td><strong>'+e.n+'</strong><br><span style="color:var(--text-3);font-size:12.5px">'+rol.t+'</span></td>'+
               '<td>'+e.l+'</td><td>'+e.d+(e.ej ? '<br><span style="color:var(--text-3)">Ejemplo: '+e.ej+'</span>' : '')+'</td></tr>';
      }).join("");
      el.innerHTML = '<div class="scroll"><table class="tbl"><tr><th>Símbolo</th><th>Nombre</th><th>Se lee</th><th>Qué significa en el curso</th></tr>'+filas+'</table></div>';
    });
  }

  /* ---------------- derivaciones que se revelan paso a paso ---------------- */
  function initDerivaciones(){
    document.querySelectorAll("ol.deriv[data-revelar]").forEach(function(ol){
      var pasos = Array.prototype.slice.call(ol.children);
      var n = 1;
      var ctrl = document.createElement("div"); ctrl.className = "deriv-ctrl";
      ctrl.innerHTML = '<button class="btn primary">Siguiente paso →</button><button class="btn">Mostrar todo</button><button class="btn">Ocultar</button><span class="pill"></span>';
      ol.parentNode.insertBefore(ctrl, ol.nextSibling);
      var b = ctrl.querySelectorAll("button"), pill = ctrl.querySelector(".pill");
      function render(){
        pasos.forEach(function(li, i){ li.classList.toggle("oculto", i >= n); });
        b[0].disabled = n >= pasos.length; pill.textContent = "paso " + n + " de " + pasos.length;
      }
      b[0].addEventListener("click", function(){ if(n < pasos.length){ n++; render(); } });
      b[1].addEventListener("click", function(){ n = pasos.length; render(); });
      b[2].addEventListener("click", function(){ n = 1; render(); });
      render();
    });
  }

  /* ---------------- laboratorio paso a paso ---------------- */
  /* DL.pasos(widget, {total, render(i), reproducir:true, ms:900})
     i va de 0 (estado inicial) a total-1. Crea los botones en .widget-foot. */
  DL.pasos = function(widget, cfg){
    var foot = widget.querySelector(".widget-foot");
    if(!foot){ foot = document.createElement("div"); foot.className = "widget-foot"; widget.appendChild(foot); }
    foot.innerHTML = "";
    function boton(t, cls){ var x = document.createElement("button"); x.className = "btn" + (cls ? " "+cls : ""); x.textContent = t; foot.appendChild(x); return x; }
    var prev = boton("← Anterior"), next = boton("Siguiente →", "primary");
    var play = cfg.reproducir ? boton("Reproducir") : null;
    var reset = boton("Reiniciar");
    var pill = document.createElement("span"); pill.className = "pill"; foot.appendChild(pill);
    var i = 0, timer = null;
    function parar(){ if(timer){ clearInterval(timer); timer = null; if(play) play.textContent = "Reproducir"; } }
    function ir(k){
      i = Math.max(0, Math.min(cfg.total - 1, k));
      cfg.render(i);
      prev.disabled = i === 0; next.disabled = i === cfg.total - 1;
      pill.textContent = (cfg.etiqueta || "paso") + " " + i + " / " + (cfg.total - 1);
      if(i === cfg.total - 1) parar();
    }
    prev.addEventListener("click", function(){ parar(); ir(i-1); });
    next.addEventListener("click", function(){ parar(); ir(i+1); });
    reset.addEventListener("click", function(){ parar(); ir(0); });
    if(play) play.addEventListener("click", function(){
      if(timer){ parar(); return; }
      if(i === cfg.total - 1) ir(0);
      play.textContent = "Pausa";
      timer = setInterval(function(){ ir(i+1); }, cfg.ms || 900);
    });
    ir(0);
    return {ir: ir, actual: function(){ return i; }, parar: parar};
  };
  function initPasosDeclarativos(){
    document.querySelectorAll(".widget[data-pasos]").forEach(function(w){
      var pasos = w.querySelectorAll(".paso");
      DL.pasos(w, {total: pasos.length, render: function(i){
        pasos.forEach(function(p, j){ p.classList.toggle("on", j === i); });
      }});
    });
  }

  /* ---------------- controles ---------------- */
  /* DL.control(contenedor, {etiqueta, min, max, paso, valor, formato, alCambiar}) */
  DL.control = function(cont, o){
    var d = document.createElement("div"); d.className = "ctrl";
    var fmt = o.formato || function(v){ return DL.fmt(v, 2); };
    d.innerHTML = '<label><span>'+o.etiqueta+'</span><span class="v"></span></label><input type="range">';
    var inp = d.querySelector("input"), v = d.querySelector(".v");
    inp.min = o.min; inp.max = o.max; inp.step = o.paso || (o.max - o.min)/100; inp.value = o.valor;
    inp.setAttribute("aria-label", d.querySelector("label span").textContent);
    function upd(){ var x = parseFloat(inp.value); v.textContent = fmt(x); if(o.alCambiar) o.alCambiar(x); }
    inp.addEventListener("input", upd);
    cont.appendChild(d);
    v.textContent = fmt(parseFloat(inp.value));
    return {
      valor: function(){ return parseFloat(inp.value); },
      fijar: function(x, silencioso){ inp.value = x; v.textContent = fmt(parseFloat(inp.value)); if(!silencioso && o.alCambiar) o.alCambiar(parseFloat(inp.value)); },
      el: d
    };
  };
  /* DL.selector(contenedor, {opciones:[{v,t}], valor, alCambiar}) */
  DL.selector = function(cont, o){
    var d = document.createElement("div"); d.className = "selrow";
    var val = o.valor;
    o.opciones.forEach(function(op){
      var b = document.createElement("button"); b.textContent = op.t; b.type = "button";
      if(op.v === val) b.classList.add("sel");
      b.addEventListener("click", function(){
        val = op.v; d.querySelectorAll("button").forEach(function(x){ x.classList.remove("sel"); });
        b.classList.add("sel"); if(o.alCambiar) o.alCambiar(val);
      });
      d.appendChild(b);
    });
    cont.appendChild(d);
    return {valor: function(){ return val; }, el: d};
  };
  /* DL.readout(el, [["etiqueta", valor], ...]) */
  DL.readout = function(el, filas){
    el.classList.add("readout");
    el.innerHTML = filas.map(function(f){ return '<div class="row"><span>'+f[0]+'</span><span>'+f[1]+'</span></div>'; }).join("");
  };
  /* DL.bucle(fnPaso, ms) → {iniciar, parar, corriendo} ; fnPaso devuelve false para detenerse */
  DL.bucle = function(fn, ms){
    var t = null;
    var api = {
      iniciar: function(){ if(t) return; t = setInterval(function(){ if(fn() === false) api.parar(); }, ms || 60); },
      parar: function(){ if(t){ clearInterval(t); t = null; } },
      corriendo: function(){ return !!t; }
    };
    return api;
  };
  /* DL.matriz(valores2D, {titulo, forma, clase:function(i,j)->"hl"|"hl2"|"ok"|"dim"|"", dec}) → HTML */
  DL.matriz = function(M, o){
    o = o || {};
    var cols = M[0].length, celdas = "";
    M.forEach(function(fila, i){ fila.forEach(function(x, j){
      var c = o.clase ? o.clase(i, j) : "";
      celdas += '<div class="cell '+(c||"")+'">'+(typeof x === "number" ? DL.fmt(x, o.dec === undefined ? 2 : o.dec) : x)+'</div>';
    }); });
    return '<div class="mat">'+(o.titulo ? '<div class="cap">'+o.titulo+'</div>' : '')+
      '<div class="grid" style="grid-template-columns:repeat('+cols+',auto)">'+celdas+'</div>'+
      (o.forma ? '<span class="dimtag">'+o.forma+'</span>' : '')+'</div>';
  };

  /* ---------------- gráficas en canvas ---------------- */
  /* DL.grafica(canvas, {x:[min,max], y:[min,max], alto:300, etiquetaX, etiquetaY, ejes:true}, dibujar(g))
     dibujar se vuelve a llamar solo al cambiar el tema o el tamaño; llama g.redibujar() tras mover un control. */
  DL.grafica = function(canvas, o, dibujar){
    var g = {canvas: canvas, ctx: canvas.getContext("2d"), o: o};
    var PAD = o.margen || {l:46, r:14, t:14, b:38};
    var cache = {};
    canvas.style.height = (o.alto || 300) + "px";
    function medir(){
      var dpr = window.devicePixelRatio || 1;
      var w = canvas.clientWidth || 600, h = o.alto || 300;
      canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
      g.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.W = w; g.H = h; cache = {};
    }
    g.sx = function(x){ return PAD.l + (x - o.x[0])/(o.x[1]-o.x[0]) * (g.W - PAD.l - PAD.r); };
    g.sy = function(y){ return g.H - PAD.b - (y - o.y[0])/(o.y[1]-o.y[0]) * (g.H - PAD.t - PAD.b); };
    g.inv = function(px, py){
      return {x: o.x[0] + (px - PAD.l)/(g.W - PAD.l - PAD.r)*(o.x[1]-o.x[0]),
              y: o.y[0] + (g.H - PAD.b - py)/(g.H - PAD.t - PAD.b)*(o.y[1]-o.y[0])};
    };
    function estilo(e, defColor){
      e = e || {};
      var c = g.ctx;
      c.strokeStyle = c.fillStyle = DL.color(e.color || defColor || "text");
      c.lineWidth = e.ancho || 2;
      c.setLineDash(e.guiones ? [6, 5] : []);
      c.globalAlpha = e.alfa === undefined ? 1 : e.alfa;
      return e;
    }
    function fin(){ g.ctx.setLineDash([]); g.ctx.globalAlpha = 1; }
    function recortar(){ var c = g.ctx; c.save(); c.beginPath(); c.rect(PAD.l, PAD.t, g.W-PAD.l-PAD.r, g.H-PAD.t-PAD.b); c.clip(); }
    function ticks(a, b){
      var rango = b - a, paso = Math.pow(10, Math.floor(Math.log10(rango/5)));
      [1,2,5,10].some(function(m){ if(rango/(paso*m) <= 7){ paso *= m; return true; } return false; });
      var out = []; for(var v = Math.ceil(a/paso)*paso; v <= b + 1e-9; v += paso) out.push(Math.abs(v) < 1e-12 ? 0 : v);
      return out;
    }
    g.limpiar = function(){ g.ctx.clearRect(0, 0, g.W, g.H); };
    g.ejes = function(e){
      e = e || {};
      var c = g.ctx, tx = e.ticksX || ticks(o.x[0], o.x[1]), ty = e.ticksY || ticks(o.y[0], o.y[1]);
      c.lineWidth = 1; c.setLineDash([]); c.globalAlpha = 1;
      c.font = "11px ui-sans-serif, system-ui, sans-serif";
      c.strokeStyle = DL.color("border"); c.fillStyle = DL.color("text-3");
      c.textAlign = "center"; c.textBaseline = "top";
      tx.forEach(function(v){ var X = g.sx(v); c.beginPath(); c.moveTo(X, PAD.t); c.lineTo(X, g.H-PAD.b); c.stroke(); c.fillText(e.fmtX ? e.fmtX(v) : DL.fmt(v, e.decX === undefined ? (Math.abs(v)%1 ? 1 : 0) : e.decX), X, g.H-PAD.b+5); });
      c.textAlign = "right"; c.textBaseline = "middle";
      ty.forEach(function(v){ var Y = g.sy(v); c.beginPath(); c.moveTo(PAD.l, Y); c.lineTo(g.W-PAD.r, Y); c.stroke(); c.fillText(e.fmtY ? e.fmtY(v) : DL.fmt(v, e.decY === undefined ? (Math.abs(v)%1 ? 1 : 0) : e.decY), PAD.l-6, Y); });
      c.strokeStyle = DL.color("text-3");
      if(o.y[0] <= 0 && o.y[1] >= 0){ c.beginPath(); c.moveTo(PAD.l, g.sy(0)); c.lineTo(g.W-PAD.r, g.sy(0)); c.stroke(); }
      if(o.x[0] <= 0 && o.x[1] >= 0){ c.beginPath(); c.moveTo(g.sx(0), PAD.t); c.lineTo(g.sx(0), g.H-PAD.b); c.stroke(); }
      c.fillStyle = DL.color("text-2"); c.font = "italic 12.5px ui-serif, Georgia, serif";
      if(o.etiquetaX){ c.textAlign = "right"; c.textBaseline = "bottom"; c.fillText(o.etiquetaX, g.W-PAD.r, g.H-PAD.b-4); }
      if(o.etiquetaY){ c.textAlign = "left"; c.textBaseline = "top"; c.fillText(o.etiquetaY, PAD.l+5, PAD.t+3); }
    };
    g.funcion = function(f, e){
      e = estilo(e, "accent"); recortar();
      var c = g.ctx, a = e.x ? e.x[0] : o.x[0], b = e.x ? e.x[1] : o.x[1], n = e.muestras || 400, inicio = true;
      c.beginPath();
      for(var i=0;i<=n;i++){
        var x = a + (b-a)*i/n, y = f(x);
        if(!isFinite(y)){ inicio = true; continue; }
        if(inicio){ c.moveTo(g.sx(x), g.sy(y)); inicio = false; } else c.lineTo(g.sx(x), g.sy(y));
      }
      c.stroke(); c.restore(); fin();
    };
    g.polilinea = function(pts, e){
      e = estilo(e, "accent"); recortar();
      var c = g.ctx; c.beginPath();
      pts.forEach(function(p, i){ if(i) c.lineTo(g.sx(p[0]), g.sy(p[1])); else c.moveTo(g.sx(p[0]), g.sy(p[1])); });
      c.stroke(); c.restore(); fin();
    };
    g.puntos = function(pts, e){
      e = estilo(e, "accent"); recortar();
      var c = g.ctx, r = e.radio || 4;
      var col = c.fillStyle;
      pts.forEach(function(p){
        c.beginPath(); c.arc(g.sx(p[0]), g.sy(p[1]), r, 0, 2*Math.PI);
        if(e.hueco){ c.fillStyle = DL.color("surface"); c.fill(); c.stroke(); c.fillStyle = col; } else c.fill();
        /* aro: borde de contraste para puntos sobre mapas de calor */
        if(e.aro){ c.save(); c.strokeStyle = DL.color("surface"); c.lineWidth = 2.5; c.setLineDash([]); c.stroke(); c.restore(); }
      });
      c.restore(); fin();
    };
    g.linea = function(x1, y1, x2, y2, e){
      e = estilo(e, "text-3"); recortar();
      var c = g.ctx; c.beginPath(); c.moveTo(g.sx(x1), g.sy(y1)); c.lineTo(g.sx(x2), g.sy(y2)); c.stroke();
      c.restore(); fin();
    };
    g.vertical = function(x, e){ g.linea(x, o.y[0], x, o.y[1], e); };
    g.horizontal = function(y, e){ g.linea(o.x[0], y, o.x[1], y, e); };
    g.flecha = function(x1, y1, x2, y2, e){
      e = estilo(e, "accent");
      var c = g.ctx, X1 = g.sx(x1), Y1 = g.sy(y1), X2 = g.sx(x2), Y2 = g.sy(y2);
      var ang = Math.atan2(Y2-Y1, X2-X1), L = e.punta || 9;
      c.beginPath(); c.moveTo(X1, Y1); c.lineTo(X2, Y2); c.stroke();
      c.setLineDash([]);
      c.beginPath(); c.moveTo(X2, Y2);
      c.lineTo(X2 - L*Math.cos(ang-0.4), Y2 - L*Math.sin(ang-0.4));
      c.lineTo(X2 - L*Math.cos(ang+0.4), Y2 - L*Math.sin(ang+0.4));
      c.closePath(); c.fill(); fin();
    };
    g.rect = function(x, y, w, h, e){
      e = estilo(e, "accent"); recortar();
      var c = g.ctx, X = g.sx(Math.min(x, x+w)), Y = g.sy(Math.max(y, y+h));
      var Wp = Math.abs(g.sx(x+w) - g.sx(x)), Hp = Math.abs(g.sy(y+h) - g.sy(y));
      if(e.relleno){ c.globalAlpha = e.alfa === undefined ? 0.18 : e.alfa; c.fillRect(X, Y, Wp, Hp); c.globalAlpha = 1; }
      if(e.borde !== false) c.strokeRect(X, Y, Wp, Hp);
      c.restore(); fin();
    };
    g.texto = function(x, y, s, e){
      e = e || {};
      var c = g.ctx;
      c.fillStyle = DL.color(e.color || "text-2");
      c.font = (e.negrita ? "600 " : "") + (e.italica ? "italic " : "") + (e.tam || 12) + "px " + (e.serif ? "ui-serif, Georgia, serif" : "ui-sans-serif, system-ui, sans-serif");
      c.textAlign = e.alinear || "left"; c.textBaseline = e.base || "middle";
      c.fillText(s, g.sx(x) + (e.dx || 0), g.sy(y) + (e.dy || 0));
    };
    /* mapa de calor de f(x,y); {res:px por celda, log:bool, clave:string para reutilizar el cálculo} */
    g.mapaCalor = function(f, e){
      e = e || {};
      var res = e.res || 4, key = "mc:" + (e.clave || "") + ":" + res;
      var x0 = PAD.l, y0 = PAD.t, w = g.W - PAD.l - PAD.r, h = g.H - PAD.t - PAD.b;
      var nx = Math.ceil(w/res), ny = Math.ceil(h/res);
      if(!cache[key] || !e.clave){
        var vals = [], mn = Infinity, mx = -Infinity;
        for(var j=0;j<ny;j++) for(var i=0;i<nx;i++){
          var p = g.inv(x0 + (i+.5)*res, y0 + (j+.5)*res), v = f(p.x, p.y);
          if(e.log) v = Math.log(Math.max(v, 1e-12));
          vals.push(v); if(isFinite(v)){ mn = Math.min(mn, v); mx = Math.max(mx, v); }
        }
        cache[key] = {vals: vals, mn: mn, mx: mx};
      }
      var C = cache[key], c = g.ctx, bajo = e.colorBajo || "surface", alto = e.colorAlto || "accent";
      var pal = []; for(var q=0;q<=32;q++) pal.push(DL.mezclar(bajo, alto, q/32));
      for(var jj=0;jj<ny;jj++) for(var ii=0;ii<nx;ii++){
        var t = (C.vals[jj*nx+ii] - C.mn)/((C.mx - C.mn) || 1);
        c.fillStyle = pal[Math.max(0, Math.min(32, Math.round(t*32)))];
        c.fillRect(x0 + ii*res, y0 + jj*res, res + 0.5, res + 0.5);
      }
    };
    /* curvas de nivel de f(x,y) en los valores de "niveles" (marching squares) */
    g.contornos = function(f, niveles, e){
      e = estilo(e, "text-3"); e.ancho || (g.ctx.lineWidth = 1);
      recortar();
      var n = e.malla || 70, xs = DL.linspace(o.x[0], o.x[1], n+1), ys = DL.linspace(o.y[0], o.y[1], n+1);
      var key = "ct:" + (e.clave || "") + ":" + n, V;
      if(e.clave && cache[key]) V = cache[key];
      else { V = []; for(var j=0;j<=n;j++){ V.push([]); for(var i=0;i<=n;i++) V[j].push(f(xs[i], ys[j])); } if(e.clave) cache[key] = V; }
      var SEG = {1:[[3,2]],2:[[2,1]],3:[[3,1]],4:[[0,1]],5:[[3,2],[0,1]],6:[[0,2]],7:[[3,0]],8:[[3,0]],9:[[0,2]],10:[[3,0],[2,1]],11:[[0,1]],12:[[3,1]],13:[[2,1]],14:[[3,2]]};
      var c = g.ctx;
      niveles.forEach(function(lv){
        c.beginPath();
        for(var j=0;j<n;j++) for(var i=0;i<n;i++){
          var bl = V[j][i], br = V[j][i+1], tr = V[j+1][i+1], tl = V[j+1][i];
          var caso = (tl>=lv?8:0) | (tr>=lv?4:0) | (br>=lv?2:0) | (bl>=lv?1:0);
          if(!SEG[caso]) continue;
          var P = function(ed){
            var a, b, va, vb;
            if(ed===0){ a=[xs[i],ys[j+1]]; b=[xs[i+1],ys[j+1]]; va=tl; vb=tr; }
            else if(ed===1){ a=[xs[i+1],ys[j]]; b=[xs[i+1],ys[j+1]]; va=br; vb=tr; }
            else if(ed===2){ a=[xs[i],ys[j]]; b=[xs[i+1],ys[j]]; va=bl; vb=br; }
            else { a=[xs[i],ys[j]]; b=[xs[i],ys[j+1]]; va=bl; vb=tl; }
            var t = (lv - va)/((vb - va) || 1e-12);
            return [g.sx(a[0] + (b[0]-a[0])*t), g.sy(a[1] + (b[1]-a[1])*t)];
          };
          SEG[caso].forEach(function(s){ var p = P(s[0]), q = P(s[1]); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); });
        }
        c.stroke();
      });
      c.restore(); fin();
    };
    /* eventos de puntero en coordenadas de datos: fn({tipo:"down"|"move"|"up", x, y}) */
    g.alPuntero = function(fn){
      var abajo = false;
      function ev(tipo, e){ var r = canvas.getBoundingClientRect(), p = g.inv(e.clientX - r.left, e.clientY - r.top); fn({tipo: tipo, x: p.x, y: p.y, abajo: abajo}); }
      canvas.addEventListener("pointerdown", function(e){ abajo = true; canvas.setPointerCapture(e.pointerId); ev("down", e); });
      canvas.addEventListener("pointermove", function(e){ ev("move", e); });
      canvas.addEventListener("pointerup", function(e){ abajo = false; ev("up", e); });
    };
    g.redibujar = function(){ g.limpiar(); if(o.ejes !== false) g.ejes(o.opcionesEjes); dibujar(g); };
    medir();
    if(window.ResizeObserver){
      var ultimoW = canvas.clientWidth;
      new ResizeObserver(function(){ if(canvas.clientWidth !== ultimoW){ ultimoW = canvas.clientWidth; medir(); g.redibujar(); } }).observe(canvas);
    }
    DL.alCambiarTema(function(){ cache = {}; g.redibujar(); });
    g.redibujar();
    return g;
  };

  /* ---------------- navegación de la serie ---------------- */
  function initSerie(){
    document.querySelectorAll("nav.serie[data-actual]").forEach(function(nav){
      var id = nav.getAttribute("data-actual"), k = -1;
      DL.SERIE.forEach(function(s, i){ if(s.id === id) k = i; });
      var html = "";
      if(k > 0) html += '<a class="ant" href="'+DL.SERIE[k-1].archivo+'"><span class="sl">← Anterior</span><span class="st">'+DL.SERIE[k-1].titulo+'</span></a>';
      if(k >= 0 && k < DL.SERIE.length-1) html += '<a class="sig" href="'+DL.SERIE[k+1].archivo+'"><span class="sl">Siguiente →</span><span class="st">'+DL.SERIE[k+1].titulo+'</span></a>';
      html += '<div class="serie-lista">' + DL.SERIE.map(function(s){
        return '<a href="'+s.archivo+'" class="'+(s.id===id?"aqui":"")+'">'+s.id+' · '+s.titulo+'</a>';
      }).join("") + '</div>';
      nav.innerHTML = html;
    });
  }

  /* ---------------- resaltado mínimo de Python ---------------- */
  function initCodigo(){
    var KW = "class|def|return|for|in|if|elif|else|with|import|from|as|None|True|False|not|is|and|or|lambda|while|self";
    var RE = new RegExp("(#[^\\n]*)|(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*')|\\b("+KW+")\\b|\\b(\\d+\\.?\\d*)\\b", "g");
    document.querySelectorAll("code.py").forEach(function(b){
      var s = b.textContent.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      b.innerHTML = s.replace(RE, function(m, com, str, kw, num){
        if(com) return '<span class="c">'+com+'</span>';
        if(str) return '<span class="s">'+str+'</span>';
        if(kw) return '<span class="k">'+kw+'</span>';
        if(num) return '<span class="n">'+num+'</span>';
        return m;
      });
    });
  }

  /* ---------------- notación dentro de etiquetas en MAYÚSCULAS ----------------
     text-transform: uppercase convierte σ en Σ, x en X, f₂ en F₂: cambia el significado.
     Envuelve cada «palabra» con notación (griega, sub/superíndices, ∂ ∇) en un span que
     anula la transformación. Corre después de que cada laboratorio pinte su contenido. */
  var NOTA = /[Ͱ-Ͽἀ-῿⁰-ₜ²³¹ᵢ-ᵪ∂∇‖]/;
  var PALABRA = /[^\s,;:]*[Ͱ-Ͽἀ-῿⁰-ₜ²³¹ᵢ-ᵪ∂∇‖][^\s,;:]*/g;
  DL.protegerMayusculas = function(raiz){
    (raiz || document.body).querySelectorAll("*").forEach(function(el){
      if(el.closest("script,style,canvas,.dl-recto")) return;
      if(getComputedStyle(el).textTransform !== "uppercase") return;
      el.querySelectorAll("sub,sup").forEach(function(s){
        s.style.textTransform = "none";
        /* la letra pegada antes del subíndice (f en f_k, x en x²) también es notación */
        var prev = s.previousSibling;
        if(prev && prev.nodeType === 3 && /(^|[\s(·=,])[A-Za-z]$/.test(prev.nodeValue)){
          var letra = prev.nodeValue.slice(-1);
          prev.nodeValue = prev.nodeValue.slice(0, -1);
          var sp = document.createElement("span"); sp.className = "dl-recto"; sp.style.textTransform = "none"; sp.textContent = letra;
          s.parentNode.insertBefore(sp, s);
        }
      });
      var nodos = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while(w.nextNode()){
        var t0 = w.currentNode;
        if(NOTA.test(t0.nodeValue) && !t0.parentNode.closest(".dl-recto")) nodos.push(t0);
      }
      nodos.forEach(function(t){
        var f = document.createElement("span");
        f.innerHTML = t.nodeValue.replace(/&/g,"&amp;").replace(/</g,"&lt;")
          .replace(PALABRA, function(m){ return '<span class="dl-recto" style="text-transform:none">' + m + '</span>'; });
        t.parentNode.replaceChild(f, t);
      });
    });
  };

  function init(){
    initTema(); initTablaNotacion(); initSerie(); initToc(); initSimbolos();
    initLeyendas(); initDerivaciones(); initPasosDeclarativos(); initCodigo();
    DL.protegerMayusculas();
    /* los laboratorios terminan de pintar después; segunda pasada al cargar todo */
    window.addEventListener("load", function(){ setTimeout(function(){ DL.protegerMayusculas(); }, 50); });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
