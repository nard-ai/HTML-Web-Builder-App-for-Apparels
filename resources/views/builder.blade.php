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
:root{--red:#B90E0A;--red2:#8a0a07;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Barlow',sans-serif;background:#111;color:#fff;height:100vh;overflow:hidden;}
#topbar{display:flex;align-items:center;justify-content:space-between;background:#0d0d0d;border-bottom:2px solid var(--red);padding:0 18px;height:50px;position:fixed;top:0;left:0;right:0;z-index:999;}
.brand{display:flex;align-items:center;gap:8px;text-decoration:none;}
.brand-icon{width:28px;height:28px;background:var(--red);border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:14px;color:#fff;}
.brand-name{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;color:#fff;}
.back-btn{display:flex;align-items:center;gap:5px;color:#555;font-size:12px;text-decoration:none;padding:5px 10px;border:1px solid #222;border-radius:4px;transition:all .2s;margin-left:8px;}
.back-btn:hover{border-color:var(--red);color:var(--red);}
.page-title{font-size:13px;font-weight:600;color:#aaa;padding:4px 12px;background:#1a1a1a;border-radius:4px;border:1px solid #222;}
.dev-btns{display:flex;gap:2px;border:1px solid #252525;border-radius:4px;padding:3px;}
.dev-btns button{background:transparent;border:none;padding:4px 10px;color:#555;border-radius:3px;cursor:pointer;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;}
.dev-btns button.on,.dev-btns button:hover{background:var(--red);color:#fff;}
.actions{display:flex;align-items:center;gap:6px;}
.actions button{display:flex;align-items:center;gap:5px;padding:6px 12px;font-family:'Barlow',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border:none;border-radius:4px;cursor:pointer;transition:all .2s;}
.btn-g{background:transparent;color:#aaa;border:1px solid #2a2a2a!important;}
.btn-g:hover{border-color:var(--red)!important;color:var(--red);}
.btn-r{background:var(--red);color:#fff;}
.btn-r:hover{background:#e01410;}
.btn-pub{background:#16a34a;color:#fff;}
.btn-pub:hover{background:#15803d;}
.sep{width:1px;height:22px;background:#2a2a2a;margin:0 2px;}
#sub-bar{display:flex;height:38px;position:fixed;top:50px;left:0;right:0;z-index:998;background:#0a0a0a;border-bottom:1px solid #1a1a1a;}
.sub-left{width:180px;display:flex;border-right:1px solid #1a1a1a;flex-shrink:0;}
.sub-tab{flex:1;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#444;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;}
.sub-tab.on{color:var(--red);border-color:var(--red);}
.sub-tab:hover:not(.on){color:#888;}
.sub-center{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;font-size:11px;color:#333;}
.sub-right{width:260px;display:flex;border-left:1px solid #1a1a1a;flex-shrink:0;}
#wrap{display:flex;height:calc(100vh - 88px);margin-top:88px;}
#left{width:180px;background:#0f0f0f;border-right:1px solid #1a1a1a;display:flex;flex-direction:column;overflow:hidden;flex-shrink:0;}
.left-content{flex:1;overflow-y:auto;}
.left-content::-webkit-scrollbar{width:3px;}
.left-content::-webkit-scrollbar-thumb{background:var(--red);border-radius:2px;}
#canvas-wrap{flex:1;display:flex;flex-direction:column;background:#181818;overflow:hidden;}
#gjs{flex:1;overflow:hidden;}
#right{width:260px;background:#0f0f0f;border-left:1px solid #1a1a1a;display:flex;flex-direction:column;overflow:hidden;flex-shrink:0;}
.right-content{flex:1;overflow-y:auto;}
.right-content::-webkit-scrollbar{width:3px;}
.right-content::-webkit-scrollbar-thumb{background:var(--red);border-radius:2px;}
#statusbar{background:var(--red);padding:3px 16px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;display:flex;align-items:center;justify-content:space-between;position:fixed;bottom:0;left:0;right:0;z-index:999;}
.ps{display:none;}.ps.on{display:block;}
.gjs-pn-panels{display:none!important;}
.gjs-editor{background:transparent;}
.gjs-cv-canvas{top:0!important;left:0!important;width:100%!important;height:100%!important;}
.gjs-blocks-c{display:flex;flex-wrap:wrap;padding:6px;gap:5px;}
.gjs-block{background:#181818;border:1px solid #222;border-radius:4px;color:#666;font-size:10px;transition:all .2s;cursor:grab;width:calc(50% - 3px);}
.gjs-block:hover{background:#222;border-color:var(--red);color:#fff;}
.gjs-sm-sector-title{background:#0a0a0a;color:#ffffff;border-bottom:1px solid #1a1a1a;padding:7px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;}
.gjs-sm-sector{border-bottom:1px solid #151515;}
.gjs-sm-label{color:#ffffff;font-size:10px;}
.gjs-sm-unit{color:#ffffff;}
.gjs-sm-property input,.gjs-sm-property select,.gjs-sm-property textarea{color:#ffffff!important;}
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
.gjs-label{color:#ffffff;font-size:10px;}
.gjs-input{background:#151515;border:1px solid #222;color:#ccc;}
</style>

{{-- Pass Laravel data to JS safely via window object — NOT via div in head --}}
<script>
window.ERP_PAGE_ID   = "{{ isset($page) && $page ? $page->id : '' }}";
window.ERP_PAGE_NAME = "{{ isset($page) && $page ? addslashes($page->name) : 'Untitled' }}";
window.ERP_HAS_CONTENT = "{{ isset($page) && $page && $page->html ? 'yes' : 'no' }}";
</script>

</head>
<body>

<div id="topbar">
  <div style="display:flex;align-items:center;gap:6px;">
    <a href="/menu-boards" class="brand">
      <div class="brand-icon">B</div>
      <span class="brand-name">BENCH</span>
    </a>
    <a href="/menu-boards" class="back-btn">Back</a>
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
</div>

<div id="sub-bar">
  <div class="sub-left">
    <div class="sub-tab on" id="stBlocks">Blocks</div>
    <div class="sub-tab" id="stLayers">Layers</div>
  </div>
  <div class="sub-center">
    <strong style="color:#bbb;">{{ isset($page) && $page ? $page->name : 'New Page' }}</strong>
    <span>-- Drag blocks to build</span>
  </div>
  <div class="sub-right">
    <div class="sub-tab on" id="rtStyles">Styles</div>
    <div class="sub-tab" id="rtProps">Properties</div>
  </div>
</div>

<div id="wrap">
  <div id="left">
    <div class="left-content">
      <div id="pBlocks" class="ps on"><div id="gjs-blocks"></div></div>
      <div id="pLayers" class="ps"><div id="gjs-layers"></div></div>
    </div>
  </div>
  <div id="canvas-wrap"><div id="gjs"></div></div>
  <div id="right">
    <div class="right-content">
      <div id="rStyles" class="ps on"><div id="gjs-styles"></div></div>
      <div id="rProps" class="ps"><div id="gjs-traits"></div></div>
    </div>
  </div>
</div>

<div id="statusbar">
  <span>Bench Apparel ERP -- Web Builder</span>
  <span id="stMsg">Loading...</span>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/grapesjs/0.21.7/grapes.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="{{ asset('js/erp-builder.js') }}"></script>
</body>
</html>