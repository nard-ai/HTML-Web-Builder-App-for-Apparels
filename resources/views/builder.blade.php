<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="csrf-token" content="{{ csrf_token() }}"/>
<title>{{ isset($page) && $page ? $page->name . ' -- ' : 'New Page -- ' }}Bench ERP Builder</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/grapesjs/0.21.7/css/grapes.min.css"/>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
/* ── VARIABLES ─────────────────────────────────────────────── */
:root{
    --red:#B90E0A;--red2:#8a0a07;
    --topbar-h:50px;--subbar-h:38px;--statusbar-h:24px;
    --left-w:180px;--right-w:260px;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Barlow',sans-serif;background:#111;color:#fff;height:100vh;overflow:hidden;}

/* ── TOP BAR ─────────────────────────────────────────────── */
#topbar{
    display:flex;align-items:center;justify-content:space-between;
    background:#0d0d0d;border-bottom:2px solid var(--red);
    padding:0 18px;height:var(--topbar-h);
    position:fixed;top:0;left:0;right:0;z-index:999;gap:8px;
}
.brand{display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0;}
.brand-icon{width:28px;height:28px;background:var(--red);border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:14px;color:#fff;}
.brand-name{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;color:#fff;}
.back-btn{display:flex;align-items:center;gap:5px;color:#555;font-size:12px;text-decoration:none;padding:5px 10px;border:1px solid #222;border-radius:4px;transition:all .2s;margin-left:8px;flex-shrink:0;}
.back-btn:hover{border-color:var(--red);color:var(--red);}
.page-title{font-size:13px;font-weight:600;color:#aaa;padding:4px 12px;background:#1a1a1a;border-radius:4px;border:1px solid #222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;}
.dev-btns{display:flex;gap:2px;border:1px solid #252525;border-radius:4px;padding:3px;flex-shrink:0;}
.dev-btns button{background:transparent;border:none;padding:4px 10px;color:#555;border-radius:3px;cursor:pointer;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;}
.dev-btns button.on,.dev-btns button:hover{background:var(--red);color:#fff;}
.actions{display:flex;align-items:center;gap:6px;flex-shrink:0;}
.actions button{display:flex;align-items:center;gap:5px;padding:6px 12px;font-family:'Barlow',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border:none;border-radius:4px;cursor:pointer;transition:all .2s;}
.btn-g{background:transparent;color:#aaa;border:1px solid #2a2a2a!important;}
.btn-g:hover{border-color:var(--red)!important;color:var(--red);}
.btn-r{background:var(--red);color:#fff;}
.btn-r:hover{background:#e01410;}
.btn-pub{background:#16a34a;color:#fff;}
.btn-pub:hover{background:#15803d;}
.sep{width:1px;height:22px;background:#2a2a2a;margin:0 2px;}

/* Hamburger — hidden on desktop */
#mob-menu-btn{
    display:none;background:transparent;border:1px solid #2a2a2a;
    border-radius:4px;color:#aaa;padding:6px 10px;cursor:pointer;
    font-size:16px;line-height:1;flex-shrink:0;
}

/* Mobile dropdown menu */
#mob-actions{
    display:none;position:fixed;
    top:var(--topbar-h);left:0;right:0;
    background:#0d0d0d;border-bottom:1px solid #1a1a1a;
    padding:10px 14px;z-index:1005;
    flex-wrap:wrap;gap:6px;
}
#mob-actions.open{display:flex;}
#mob-actions button{
    display:flex;align-items:center;gap:5px;
    padding:7px 12px;font-family:'Barlow',sans-serif;
    font-size:11px;font-weight:700;text-transform:uppercase;
    letter-spacing:1px;border:none;border-radius:4px;cursor:pointer;transition:all .2s;
}

/* ── SUB BAR ─────────────────────────────────────────────── */
#sub-bar{
    display:flex;height:var(--subbar-h);
    position:fixed;top:var(--topbar-h);left:0;right:0;
    z-index:997;background:#0a0a0a;border-bottom:1px solid #1a1a1a;
}
.sub-left{width:var(--left-w);display:flex;border-right:1px solid #1a1a1a;flex-shrink:0;}
.sub-tab{flex:1;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#444;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;}
.sub-tab.on{color:var(--red);border-color:var(--red);}
.sub-tab:hover:not(.on){color:#888;}
.sub-center{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;font-size:11px;color:#333;}
.sub-right{width:var(--right-w);display:flex;border-left:1px solid #1a1a1a;flex-shrink:0;}

/* ── MAIN WRAP ─────────────────────────────────────────────── */
#wrap{
    display:flex;
    height:calc(100vh - var(--topbar-h) - var(--subbar-h) - var(--statusbar-h));
    margin-top:calc(var(--topbar-h) + var(--subbar-h));
}

/* ── LEFT PANEL ────────────────────────────────────────────── */
#left{
    width:var(--left-w);background:#0f0f0f;
    border-right:1px solid #1a1a1a;
    display:flex;flex-direction:column;
    overflow:hidden;flex-shrink:0;
    transition:transform .3s ease;
}
.left-content{flex:1;overflow-y:auto;}
.left-content::-webkit-scrollbar{width:3px;}
.left-content::-webkit-scrollbar-thumb{background:var(--red);border-radius:2px;}

/* Mobile panel header (shown only on mobile) */
.mob-panel-header{
    display:none;align-items:center;justify-content:space-between;
    padding:10px 12px;border-bottom:1px solid #1a1a1a;
    background:#0a0a0a;flex-shrink:0;
}
.mob-panel-tabs{display:flex;gap:2px;background:#1a1a1a;border-radius:4px;padding:2px;}
.mob-panel-tab{padding:5px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;border-radius:3px;cursor:pointer;border:none;background:transparent;}
.mob-panel-tab.on{background:var(--red);color:#fff;}
.mob-close-btn{background:transparent;border:none;color:#555;font-size:20px;cursor:pointer;padding:2px 6px;line-height:1;}
.mob-close-btn:hover{color:#fff;}

/* ── CANVAS ─────────────────────────────────────────────────── */
#canvas-wrap{flex:1;display:flex;flex-direction:column;background:#181818;overflow:hidden;}
#gjs{flex:1;overflow:hidden;}

/* ── RIGHT PANEL ───────────────────────────────────────────── */
#right{
    width:var(--right-w);background:#0f0f0f;
    border-left:1px solid #1a1a1a;
    display:flex;flex-direction:column;
    overflow:hidden;flex-shrink:0;
    transition:transform .3s ease;
}
.right-content{flex:1;overflow-y:auto;}
.right-content::-webkit-scrollbar{width:3px;}
.right-content::-webkit-scrollbar-thumb{background:var(--red);border-radius:2px;}

/* ── STATUS BAR ────────────────────────────────────────────── */
#statusbar{
    background:var(--red);padding:3px 16px;font-size:10px;
    font-weight:700;letter-spacing:1px;text-transform:uppercase;
    display:flex;align-items:center;justify-content:space-between;
    position:fixed;bottom:0;left:0;right:0;z-index:999;
    height:var(--statusbar-h);
}

/* ── PANEL SHOW/HIDE ────────────────────────────────────────── */
.ps{display:none;}.ps.on{display:block;}

/* ── FLOATING ACTION BUTTONS ────────────────────────────────── */
#mob-fab{
    display:none;position:fixed;
    bottom:34px;right:14px;z-index:996;
    flex-direction:column;gap:8px;
}
.fab-btn{
    width:46px;height:46px;border-radius:50%;border:none;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    box-shadow:0 3px 14px rgba(0,0,0,.6);transition:all .2s;
}
.fab-btn:active{transform:scale(0.9);}
.fab-blocks{background:var(--red);color:#fff;}
.fab-styles{background:#1c1c1c;color:#fff;border:1px solid #333;}

/* ── OVERLAY ────────────────────────────────────────────────── */
#panel-overlay{
    display:none;position:fixed;inset:0;
    background:rgba(0,0,0,.55);z-index:1000;
}
#panel-overlay.open{display:block;}

/* ── GRAPEJS OVERRIDES ──────────────────────────────────────── */
.gjs-pn-panels{display:none!important;}
.gjs-editor{background:transparent;}
.gjs-cv-canvas{top:0!important;left:0!important;width:100%!important;height:100%!important;}
.gjs-blocks-c{display:flex;flex-wrap:wrap;padding:6px;gap:5px;}
.gjs-block{background:#181818;border:1px solid #222;border-radius:4px;color:#666;font-size:10px;transition:all .2s;cursor:grab;width:calc(50% - 3px);}
.gjs-block:hover{background:#222;border-color:var(--red);color:#fff;}
.gjs-sm-sector-title{background:#0a0a0a;color:#fff;border-bottom:1px solid #1a1a1a;padding:7px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;}
.gjs-sm-sector{border-bottom:1px solid #151515;}
.gjs-sm-label{color:#fff;font-size:10px;}
.gjs-sm-unit{color:#fff;}
.gjs-sm-property input,.gjs-sm-property select,.gjs-sm-property textarea{color:#fff!important;}
.gjs-sm-property input::placeholder{color:rgba(255,255,255,0.4)!important;}
.gjs-field{background:#151515;border:1px solid #222;color:#ccc;border-radius:3px;}
.gjs-field:focus{border-color:var(--red);}
.gjs-layer{background:#0f0f0f;border-bottom:1px solid #151515;color:#666;}
.gjs-layer:hover{background:#151515;}
.gjs-layer.gjs-selected{background:#151515;border-left:2px solid var(--red);}
.gjs-toolbar{background:var(--red)!important;}
.gjs-toolbar-item:hover{background:var(--red2)!important;}
.gjs-badge{background:var(--red)!important;}
.gjs-hovered{outline:2px solid rgba(185,14,10,0.4)!important;}
.gjs-selected{outline:2px solid var(--red)!important;}
.gjs-resizer-h{background:var(--red)!important;}
.gjs-trt-header{background:#0a0a0a;color:#555;font-size:9px;padding:7px 10px;font-weight:700;text-transform:uppercase;}
.gjs-label{color:#fff;font-size:10px;}
.gjs-input{background:#151515;border:1px solid #222;color:#ccc;}

/* ══════════════════════════════════════════════════════════════
   TABLET  ≤1024px
   Right panel becomes a slide-in drawer from the right side.
   Left panel stays visible but narrower.
══════════════════════════════════════════════════════════════ */
@media(max-width:1024px){
    :root{--left-w:160px;--right-w:260px;}

    /* Hide less important top-bar items */
    .page-title{display:none;}
    .actions #bUndo,
    .actions #bRedo,
    .actions #bCode,
    .actions #bExp,
    .actions .sep{display:none;}

    /* Right panel: off-canvas, slides in from right */
    #right{
        position:fixed;top:0;right:0;bottom:var(--statusbar-h);
        width:var(--right-w);
        transform:translateX(100%);
        z-index:1002;
        border-left:2px solid var(--red);
    }
    #right.panel-open{transform:translateX(0);}
    #right .mob-panel-header{display:flex;}

    /* Show FAB for styles only on tablet */
    #mob-fab{display:flex;}
    .fab-blocks{display:none;}
}

/* ══════════════════════════════════════════════════════════════
   MOBILE  ≤768px
   Both panels off-canvas. Topbar stripped to essentials.
══════════════════════════════════════════════════════════════ */
@media(max-width:768px){
    :root{--topbar-h:48px;--subbar-h:34px;}

    /* Strip topbar */
    .brand-name{display:none;}
    .back-btn{margin-left:0;}
    .dev-btns{display:none;}
    .actions{display:none;}
    #mob-menu-btn{display:flex;}

    /* Strip sub-bar to center only */
    .sub-left{display:none;}
    .sub-right{display:none;}
    .sub-center{font-size:10px;justify-content:flex-start;padding-left:12px;color:#555;}

    /* Left panel: off-canvas left */
    #left{
        position:fixed;
        top:0;left:0;bottom:var(--statusbar-h);
        width:82vw;max-width:300px;
        transform:translateX(-100%);
        z-index:1002;
        border-right:2px solid var(--red);
    }
    #left.panel-open{transform:translateX(0);}
    #left .mob-panel-header{display:flex;}

    /* Right panel: off-canvas right */
    #right{
        position:fixed;
        top:0;right:0;bottom:var(--statusbar-h);
        width:82vw;max-width:300px;
        transform:translateX(100%);
        z-index:1002;
        border-left:2px solid var(--red);
    }
    #right.panel-open{transform:translateX(0);}
    #right .mob-panel-header{display:flex;}

    /* Both FABs visible */
    #mob-fab{display:flex;}
    .fab-blocks{display:flex!important;}
    .fab-styles{display:flex!important;}

    /* Status bar */
    #statusbar{font-size:9px;padding:2px 10px;}
    #statusbar span:first-child{display:none;}
}

/* ══════════════════════════════════════════════════════════════
   SMALL MOBILE  ≤480px
══════════════════════════════════════════════════════════════ */
@media(max-width:480px){
    :root{--topbar-h:46px;}
    .fab-btn{width:42px;height:42px;}
    #mob-actions{padding:8px 10px;}
}
</style>

{{-- Blade → JS --}}
<script>
window.ERP_PAGE_ID     = "{{ isset($page) && $page ? $page->id : '' }}";
window.ERP_PAGE_NAME   = "{{ isset($page) && $page ? addslashes($page->name) : 'Untitled' }}";
window.ERP_HAS_CONTENT = "{{ isset($page) && $page && $page->html ? 'yes' : 'no' }}";
</script>
</head>
<body>

{{-- ══ TOP BAR ══════════════════════════════════════════════════ --}}
<div id="topbar">

    <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">
        <a href="/menu-boards" class="brand">
            <div class="brand-icon">B</div>
            <span class="brand-name">BENCH</span>
        </a>
        <a href="/menu-boards" class="back-btn">← Back</a>
        <span class="page-title">{{ isset($page) && $page ? $page->name : 'New Page' }}</span>
    </div>

    <div class="dev-btns">
        <button id="dDsk" class="on">Desktop</button>
        <button id="dTab">Tablet</button>
        <button id="dMob">Mobile</button>
    </div>

    <div class="actions">
        <button class="btn-g" id="bUndo">Undo</button>
        <button class="btn-g" id="bRedo">Redo</button>
        <div class="sep"></div>
        <button class="btn-g" id="bCode">Code</button>
        <button class="btn-g" id="bPrev">Preview</button>
        <button class="btn-g" id="bExp">Export</button>
        <button class="btn-pub" id="bPublish">Publish</button>
        <button class="btn-r" id="bSave">Save</button>
    </div>

    {{-- Hamburger (mobile only) --}}
    <button id="mob-menu-btn" aria-label="Open menu">☰</button>
</div>

{{-- ══ MOBILE DROPDOWN MENU ══════════════════════════════════════ --}}
<div id="mob-actions">
    {{-- Device switcher --}}
    <div class="dev-btns" id="mob-dev-btns" style="width:100%;margin-bottom:4px;">
        <button id="mbDsk" class="on">Desktop</button>
        <button id="mbTab">Tablet</button>
        <button id="mbMob">Mobile</button>
    </div>
    <div style="width:100%;height:1px;background:#1a1a1a;"></div>
    <button class="btn-g" id="mbPrev">Preview</button>
    <button class="btn-g" id="mbCode">Code</button>
    <button class="btn-g" id="mbExp">Export</button>
    <button class="btn-pub" id="mbPublish">Publish</button>
    <button class="btn-r" id="mbSave">Save</button>
</div>

{{-- ══ SUB BAR ══════════════════════════════════════════════════ --}}
<div id="sub-bar">
    <div class="sub-left">
        <div class="sub-tab on" id="stBlocks">Blocks</div>
        <div class="sub-tab" id="stLayers">Layers</div>
    </div>
    <div class="sub-center">
        <strong style="color:#bbb;">{{ isset($page) && $page ? $page->name : 'New Page' }}</strong>
        <span>— Drag blocks to build</span>
    </div>
    <div class="sub-right">
        <div class="sub-tab on" id="rtStyles">Styles</div>
        <div class="sub-tab" id="rtProps">Properties</div>
    </div>
</div>

{{-- ══ MAIN LAYOUT ══════════════════════════════════════════════ --}}
<div id="wrap">

    {{-- Left panel --}}
    <div id="left">
        <div class="mob-panel-header">
            <div class="mob-panel-tabs">
                <button class="mob-panel-tab on" data-target="pBlocks">Blocks</button>
                <button class="mob-panel-tab" data-target="pLayers">Layers</button>
            </div>
            <button class="mob-close-btn" data-closes="left">✕</button>
        </div>
        <div class="left-content">
            <div id="pBlocks" class="ps on"><div id="gjs-blocks"></div></div>
            <div id="pLayers" class="ps"><div id="gjs-layers"></div></div>
        </div>
    </div>

    {{-- Canvas --}}
    <div id="canvas-wrap"><div id="gjs"></div></div>

    {{-- Right panel --}}
    <div id="right">
        <div class="mob-panel-header">
            <div class="mob-panel-tabs">
                <button class="mob-panel-tab on" data-target="rStyles">Styles</button>
                <button class="mob-panel-tab" data-target="rProps">Properties</button>
            </div>
            <button class="mob-close-btn" data-closes="right">✕</button>
        </div>
        <div class="right-content">
            <div id="rStyles" class="ps on"><div id="gjs-styles"></div></div>
            <div id="rProps" class="ps"><div id="gjs-traits"></div></div>
        </div>
    </div>

</div>

{{-- ══ OVERLAY ══════════════════════════════════════════════════ --}}
<div id="panel-overlay"></div>

{{-- ══ FLOATING BUTTONS ═════════════════════════════════════════ --}}
<div id="mob-fab">
    {{-- Styles button --}}
    <button class="fab-btn fab-styles" id="fab-styles" title="Styles / Properties">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
    </button>
    {{-- Blocks button --}}
    <button class="fab-btn fab-blocks" id="fab-blocks" title="Blocks / Layers">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
    </button>
</div>

{{-- ══ STATUS BAR ═══════════════════════════════════════════════ --}}
<div id="statusbar">
    <span>Bench Apparel ERP — Web Builder</span>
    <span id="stMsg">Loading...</span>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/grapesjs/0.21.7/grapes.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="{{ asset('js/erp-builder.js') }}"></script>

<script>
/* ══════════════════════════════════════════════════════════════════
   RESPONSIVE PANEL CONTROLLER
   Handles: FABs, overlay, hamburger menu, mobile panel tabs,
            mirrored action buttons, resize cleanup
══════════════════════════════════════════════════════════════════ */
(function(){
    'use strict';

    var leftEl   = document.getElementById('left');
    var rightEl  = document.getElementById('right');
    var overlay  = document.getElementById('panel-overlay');
    var hamburger= document.getElementById('mob-menu-btn');
    var mobMenu  = document.getElementById('mob-actions');

    /* ── Breakpoint helpers ──────────────────────────────────── */
    function isMobile(){ return window.innerWidth <= 768; }
    function isTablet(){ return window.innerWidth > 768 && window.innerWidth <= 1024; }

    /* ── Open / close panels ─────────────────────────────────── */
    function openPanel(el){
        el.classList.add('panel-open');
        overlay.classList.add('open');
    }
    function closePanel(el){
        el.classList.remove('panel-open');
        if(!leftEl.classList.contains('panel-open') && !rightEl.classList.contains('panel-open')){
            overlay.classList.remove('open');
        }
    }
    function closeAll(){
        leftEl.classList.remove('panel-open');
        rightEl.classList.remove('panel-open');
        overlay.classList.remove('open');
    }

    /* ── FAB: Blocks ─────────────────────────────────────────── */
    document.getElementById('fab-blocks').addEventListener('click', function(){
        if(leftEl.classList.contains('panel-open')){
            closePanel(leftEl);
        } else {
            closePanel(rightEl);
            openPanel(leftEl);
        }
    });

    /* ── FAB: Styles ─────────────────────────────────────────── */
    document.getElementById('fab-styles').addEventListener('click', function(){
        if(rightEl.classList.contains('panel-open')){
            closePanel(rightEl);
        } else {
            closePanel(leftEl);
            openPanel(rightEl);
        }
    });

    /* ── Overlay click ───────────────────────────────────────── */
    overlay.addEventListener('click', closeAll);

    /* ── Mobile close buttons (✕ inside panels) ──────────────── */
    document.querySelectorAll('.mob-close-btn').forEach(function(btn){
        btn.addEventListener('click', function(){
            var closes = btn.getAttribute('data-closes');
            if(closes === 'left')  closePanel(leftEl);
            if(closes === 'right') closePanel(rightEl);
        });
    });

    /* ── Mobile panel tabs (Blocks/Layers, Styles/Properties) ── */
    document.querySelectorAll('#left .mob-panel-tab').forEach(function(tab){
        tab.addEventListener('click', function(){
            document.querySelectorAll('#left .mob-panel-tab').forEach(function(t){ t.classList.remove('on'); });
            tab.classList.add('on');
            var target = tab.getAttribute('data-target');
            document.querySelectorAll('#pBlocks,#pLayers').forEach(function(p){ p.classList.remove('on'); });
            var el = document.getElementById(target);
            if(el) el.classList.add('on');
        });
    });
    document.querySelectorAll('#right .mob-panel-tab').forEach(function(tab){
        tab.addEventListener('click', function(){
            document.querySelectorAll('#right .mob-panel-tab').forEach(function(t){ t.classList.remove('on'); });
            tab.classList.add('on');
            var target = tab.getAttribute('data-target');
            document.querySelectorAll('#rStyles,#rProps').forEach(function(p){ p.classList.remove('on'); });
            var el = document.getElementById(target);
            if(el) el.classList.add('on');
        });
    });

    /* ── Hamburger ───────────────────────────────────────────── */
    hamburger.addEventListener('click', function(e){
        e.stopPropagation();
        mobMenu.classList.toggle('open');
    });
    document.addEventListener('click', function(e){
        if(!hamburger.contains(e.target) && !mobMenu.contains(e.target)){
            mobMenu.classList.remove('open');
        }
    });

    /* ── Mobile action buttons mirror desktop ─────────────────── */
    var mirrors = {
        mbPrev:'bPrev', mbCode:'bCode', mbExp:'bExp',
        mbPublish:'bPublish', mbSave:'bSave'
    };
    Object.keys(mirrors).forEach(function(mobId){
        var mob  = document.getElementById(mobId);
        var desk = document.getElementById(mirrors[mobId]);
        if(mob && desk){
            mob.addEventListener('click', function(){
                desk.click();
                mobMenu.classList.remove('open');
            });
        }
    });

    /* ── Mobile device switcher mirrors desktop ───────────────── */
    [['mbDsk','dDsk'],['mbTab','dTab'],['mbMob','dMob']].forEach(function(pair){
        var mob  = document.getElementById(pair[0]);
        var desk = document.getElementById(pair[1]);
        if(mob && desk){
            mob.addEventListener('click', function(){
                document.querySelectorAll('#mob-dev-btns button').forEach(function(b){ b.classList.remove('on'); });
                mob.classList.add('on');
                desk.click();
                mobMenu.classList.remove('open');
            });
        }
    });

    /* ── Clean up panel states on resize ─────────────────────── */
    window.addEventListener('resize', function(){
        /* Desktop: reset any off-canvas state */
        if(window.innerWidth > 1024){
            closeAll();
        }
    });

})();
</script>
</body>
</html>cd /var/www/miserp-menu-board