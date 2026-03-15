<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="csrf-token" content="{{ csrf_token() }}"/>
<title>Menu Boards — Bench Apparel ERP</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<style>
:root { --red: #B90E0A; --red2: #8a0a07; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Barlow', sans-serif; background: #0f0f0f; color: #fff; min-height: 100vh; }

/* TOPBAR */
#topbar {
    display: flex; align-items: center; justify-content: space-between;
    background: #0d0d0d; border-bottom: 2px solid var(--red);
    padding: 0 24px; height: 54px;
    position: sticky; top: 0; z-index: 100;
}
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.brand-icon { width: 32px; height: 32px; background: var(--red); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 16px; color: #fff; }
.brand-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 2px; color: #fff; }
.brand-sub { font-size: 10px; color: var(--red); text-transform: uppercase; letter-spacing: 1px; margin-left: 4px; }
.topbar-right { display: flex; align-items: center; gap: 10px; }
.btn-new {
    display: flex; align-items: center; gap: 6px;
    background: var(--red); color: #fff; border: none;
    padding: 8px 18px; border-radius: 5px;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    cursor: pointer; text-decoration: none; transition: background .2s;
}
.btn-new:hover { background: #e01410; }
.search-wrap { position: relative; }
.search-wrap input {
    background: #1a1a1a; border: 1px solid #2a2a2a; color: #ccc;
    padding: 7px 12px 7px 34px; border-radius: 5px;
    font-family: 'Barlow', sans-serif; font-size: 13px; width: 220px;
    outline: none; transition: border .2s;
}
.search-wrap input:focus { border-color: var(--red); }
.search-wrap .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #555; font-size: 14px; }

/* MAIN */
#main { padding: 32px 24px; max-width: 1400px; margin: 0 auto; }

/* STATS BAR */
.stats-bar {
    display: flex; align-items: center; gap: 24px;
    margin-bottom: 28px; padding-bottom: 24px;
    border-bottom: 1px solid #1a1a1a;
}
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-val { font-size: 24px; font-weight: 700; color: #fff; }
.stat-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
.stat-sep { width: 1px; height: 36px; background: #1e1e1e; }

/* FILTER TABS */
.filter-tabs { display: flex; gap: 6px; margin-bottom: 24px; }
.ftab {
    padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px; cursor: pointer;
    border: 1px solid #2a2a2a; color: #555; background: transparent;
    transition: all .2s;
}
.ftab.on { background: var(--red); color: #fff; border-color: var(--red); }
.ftab:hover:not(.on) { border-color: #444; color: #aaa; }

/* GRID */
.section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #333; margin-bottom: 16px; }

#pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

/* PAGE CARD */
.page-card {
    background: #141414; border: 1px solid #1e1e1e;
    border-radius: 10px; overflow: hidden;
    transition: all .2s; cursor: pointer;
}
.page-card:hover { border-color: #333; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.4); }

.card-thumb {
    width: 100%; height: 160px; background: #1a1a1a;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; position: relative; border-bottom: 1px solid #1e1e1e;
}
.card-thumb img { width: 100%; height: 100%; object-fit: cover; }
.card-thumb .no-thumb {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    color: #2a2a2a;
}
.card-thumb .no-thumb span { font-size: 32px; }
.card-thumb .no-thumb p { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
.card-thumb-overlay {
    position: absolute; inset: 0; background: rgba(185,14,10,.85);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity .2s;
}
.card-thumb:hover .card-thumb-overlay { opacity: 1; }
.thumb-edit-btn {
    display: flex; align-items: center; gap: 6px;
    background: #fff; color: var(--red); border: none;
    padding: 8px 20px; border-radius: 5px;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 700;
    cursor: pointer; text-decoration: none;
}

.card-body { padding: 14px 16px; }
.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.card-name { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.card-menu-btn {
    background: transparent; border: none; color: #555; cursor: pointer;
    padding: 4px 6px; border-radius: 4px; font-size: 16px; line-height: 1;
    transition: all .2s;
}
.card-menu-btn:hover { background: #1e1e1e; color: #fff; }

.card-meta { display: flex; align-items: center; justify-content: space-between; }
.card-date { font-size: 11px; color: #444; }
.badge {
    padding: 3px 10px; border-radius: 20px;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
}
.badge-draft { background: #1e1e1e; color: #555; border: 1px solid #2a2a2a; }
.badge-published { background: rgba(34,197,94,.15); color: #22c55e; border: 1px solid rgba(34,197,94,.3); }

/* NEW PAGE CARD */
.new-page-card {
    background: transparent; border: 2px dashed #1e1e1e;
    border-radius: 10px; height: 260px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; cursor: pointer; transition: all .2s; text-decoration: none;
}
.new-page-card:hover { border-color: var(--red); }
.new-page-card .plus { font-size: 36px; color: #2a2a2a; transition: color .2s; }
.new-page-card p { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #333; transition: color .2s; }
.new-page-card:hover .plus,
.new-page-card:hover p { color: var(--red); }

/* EMPTY STATE */
.empty-state { grid-column: 1/-1; text-align: center; padding: 80px 0; }
.empty-state .empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 8px; }
.empty-state p { font-size: 14px; color: #333; }

/* DROPDOWN MENU */
.dropdown {
    position: absolute; background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 8px; padding: 4px; min-width: 160px;
    box-shadow: 0 8px 24px rgba(0,0,0,.5); z-index: 200;
    display: none;
}
.dropdown.show { display: block; }
.dd-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-radius: 5px;
    font-size: 13px; color: #aaa; cursor: pointer;
    transition: all .15s; border: none; background: transparent; width: 100%;
    text-align: left;
}
.dd-item:hover { background: #222; color: #fff; }
.dd-item.danger { color: #ef4444; }
.dd-item.danger:hover { background: rgba(239,68,68,.1); }
.dd-sep { height: 1px; background: #222; margin: 4px 0; }

/* MODAL */
.modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 500; opacity: 0; pointer-events: none; transition: opacity .2s;
}
.modal-overlay.show { opacity: 1; pointer-events: all; }
.modal {
    background: #141414; border: 1px solid #2a2a2a;
    border-radius: 10px; padding: 28px; width: 420px;
    transform: translateY(20px); transition: transform .2s;
}
.modal-overlay.show .modal { transform: translateY(0); }
.modal h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.modal p { font-size: 13px; color: #666; margin-bottom: 20px; }
.modal input {
    width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; color: #fff;
    padding: 10px 14px; border-radius: 6px; font-family: 'Barlow', sans-serif;
    font-size: 14px; outline: none; margin-bottom: 20px; transition: border .2s;
}
.modal input:focus { border-color: var(--red); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.modal-cancel {
    background: transparent; color: #aaa; border: 1px solid #2a2a2a;
    padding: 8px 18px; border-radius: 5px; cursor: pointer;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 700;
    text-transform: uppercase; transition: all .2s;
}
.modal-cancel:hover { border-color: #444; color: #fff; }
.modal-confirm {
    background: var(--red); color: #fff; border: none;
    padding: 8px 18px; border-radius: 5px; cursor: pointer;
    font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 700;
    text-transform: uppercase; transition: background .2s;
}
.modal-confirm:hover { background: #e01410; }
.modal-confirm.danger { background: #dc2626; }
.modal-confirm.danger:hover { background: #b91c1c; }

/* TOAST */
#toast {
    position: fixed; bottom: 24px; right: 24px;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-left: 3px solid var(--red);
    padding: 12px 20px; border-radius: 6px;
    font-size: 13px; font-weight: 600; color: #fff;
    transform: translateY(20px); opacity: 0;
    transition: all .3s; z-index: 999; pointer-events: none;
}
#toast.show { transform: translateY(0); opacity: 1; }
#toast.success { border-left-color: #22c55e; }

/* STATUSBAR */
#statusbar {
    background: var(--red); padding: 4px 24px;
    font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; bottom: 0;
}
</style>
</head>
<body>

<div id="topbar">
  <a href="/menu-boards" class="brand">
    <div class="brand-icon">B</div>
    <span class="brand-name">BENCH APPAREL</span>
    <span class="brand-sub">ERP</span>
  </a>
  <div class="topbar-right">
    <div class="search-wrap">
      <span class="search-icon">&#128269;</span>
      <input type="text" id="searchInput" placeholder="Search pages..."/>
    </div>
    <button class="btn-new" id="btnNewPage">+ New Page</button>
  </div>
</div>

<div id="main">

  <!-- STATS -->
  <div class="stats-bar">
    <div class="stat">
      <span class="stat-val" id="statTotal">{{ $pages->count() }}</span>
      <span class="stat-label">Total Pages</span>
    </div>
    <div class="stat-sep"></div>
    <div class="stat">
      <span class="stat-val" id="statPublished">{{ $pages->where('status','published')->count() }}</span>
      <span class="stat-label">Published</span>
    </div>
    <div class="stat-sep"></div>
    <div class="stat">
      <span class="stat-val" id="statDraft">{{ $pages->where('status','draft')->count() }}</span>
      <span class="stat-label">Drafts</span>
    </div>
    <div class="stat-sep"></div>
    <div class="stat">
      <span class="stat-val">{{ $pages->isNotEmpty() ? $pages->first()->updated_at->diffForHumans() : 'Never' }}</span>
      <span class="stat-label">Last Modified</span>
    </div>
  </div>

  <!-- FILTERS -->
  <div class="filter-tabs">
    <button class="ftab on" data-filter="all">All Pages</button>
    <button class="ftab" data-filter="published">Published</button>
    <button class="ftab" data-filter="draft">Drafts</button>
  </div>

  <div class="section-label">ERP Pages</div>

  <!-- GRID -->
  <div id="pages-grid">

    <!-- NEW PAGE CARD -->
    <div class="new-page-card" id="btnNewPageCard">
      <div class="plus">+</div>
      <p>Create New Page</p>
    </div>

    <!-- EXISTING PAGES -->
    @forelse($pages as $page)
    <div class="page-card" data-id="{{ $page->id }}" data-status="{{ $page->status }}" data-name="{{ strtolower($page->name) }}">
      <div class="card-thumb">
        @if($page->thumbnail)
          <img src="{{ $page->thumbnail }}" alt="{{ $page->name }}"/>
        @else
          <div class="no-thumb">
            <span>&#128196;</span>
            <p>No Preview</p>
          </div>
        @endif
        <div class="card-thumb-overlay">
          <a href="/builder/{{ $page->id }}" class="thumb-edit-btn">Edit Page</a>
        </div>
      </div>
      <div class="card-body">
        <div class="card-top">
          <span class="card-name">{{ $page->name }}</span>
          <div style="position:relative;">
            <button class="card-menu-btn" data-id="{{ $page->id }}">&#8942;</button>
            <div class="dropdown" id="dd-{{ $page->id }}">
              <a href="/builder/{{ $page->id }}" class="dd-item">&#9998; Edit</a>
              <button class="dd-item" data-action="rename" data-id="{{ $page->id }}" data-name="{{ $page->name }}">&#9000; Rename</button>
              <button class="dd-item" data-action="duplicate" data-id="{{ $page->id }}">&#10064; Duplicate</button>
              <button class="dd-item" data-action="toggle-status" data-id="{{ $page->id }}" data-status="{{ $page->status }}">
                {{ $page->status === 'draft' ? '&#9654; Publish' : '&#9632; Unpublish' }}
              </button>
              <div class="dd-sep"></div>
              <button class="dd-item danger" data-action="delete" data-id="{{ $page->id }}" data-name="{{ $page->name }}">&#128465; Delete</button>
            </div>
          </div>
        </div>
        <div class="card-meta">
          <span class="card-date">{{ $page->updated_at->format('M d, Y') }}</span>
          <span class="badge {{ $page->status === 'published' ? 'badge-published' : 'badge-draft' }}">
            {{ ucfirst($page->status) }}
          </span>
        </div>
      </div>
    </div>
    @empty
    <div class="empty-state">
      <div class="empty-icon">&#128196;</div>
      <h3>No pages yet</h3>
      <p>Click "New Page" to create your first ERP page.</p>
    </div>
    @endforelse

  </div>
</div>

<div id="statusbar">
  <span>Bench Apparel ERP &mdash; Menu Boards</span>
  <span id="stMsg">{{ $pages->count() }} page(s) total</span>
</div>

<!-- NEW PAGE MODAL -->
<div class="modal-overlay" id="modalNew">
  <div class="modal">
    <h3>Create New Page</h3>
    <p>Give your page a name to get started.</p>
    <input type="text" id="newPageName" placeholder="e.g. Inventory, Orders, Reports..."/>
    <div class="modal-actions">
      <button class="modal-cancel" id="modalNewCancel">Cancel</button>
      <button class="modal-confirm" id="modalNewConfirm">Create &amp; Open Builder</button>
    </div>
  </div>
</div>

<!-- RENAME MODAL -->
<div class="modal-overlay" id="modalRename">
  <div class="modal">
    <h3>Rename Page</h3>
    <p>Enter a new name for this page.</p>
    <input type="text" id="renameInput" placeholder="Page name..."/>
    <div class="modal-actions">
      <button class="modal-cancel" id="modalRenameCancel">Cancel</button>
      <button class="modal-confirm" id="modalRenameConfirm">Save</button>
    </div>
  </div>
</div>

<!-- DELETE MODAL -->
<div class="modal-overlay" id="modalDelete">
  <div class="modal">
    <h3>Delete Page</h3>
    <p id="deleteMsg">Are you sure you want to delete this page? This cannot be undone.</p>
    <div class="modal-actions">
      <button class="modal-cancel" id="modalDeleteCancel">Cancel</button>
      <button class="modal-confirm danger" id="modalDeleteConfirm">Delete</button>
    </div>
  </div>
</div>

<!-- TOAST -->
<div id="toast"></div>

<script>
(function () {

  var CSRF = document.querySelector('meta[name="csrf-token"]').content;

  /* ── TOAST ── */
  function toast(msg, type) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'show' + (type === 'success' ? ' success' : '');
    setTimeout(function () { el.className = ''; }, 2800);
  }

  /* ── MODAL HELPERS ── */
  function openModal(id) { document.getElementById(id).classList.add('show'); }
  function closeModal(id) { document.getElementById(id).classList.remove('show'); }

  /* ── DROPDOWN ── */
  var activeDropdown = null;

  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown.show').forEach(function (d) { d.classList.remove('show'); });
    activeDropdown = null;
  }

  document.querySelectorAll('.card-menu-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var id = btn.getAttribute('data-id');
      var dd = document.getElementById('dd-' + id);
      if (dd.classList.contains('show')) {
        closeAllDropdowns();
      } else {
        closeAllDropdowns();
        dd.classList.add('show');
        activeDropdown = dd;
      }
    });
  });

  document.addEventListener('click', closeAllDropdowns);

  /* ── NEW PAGE ── */
  function openNewModal() {
    document.getElementById('newPageName').value = '';
    openModal('modalNew');
    setTimeout(function () { document.getElementById('newPageName').focus(); }, 100);
  }

  document.getElementById('btnNewPage').addEventListener('click', openNewModal);
  document.getElementById('btnNewPageCard').addEventListener('click', openNewModal);
  document.getElementById('modalNewCancel').addEventListener('click', function () { closeModal('modalNew'); });

  document.getElementById('modalNewConfirm').addEventListener('click', function () {
    var name = document.getElementById('newPageName').value.trim();
    if (!name) { return; }

    fetch('/api/pages/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
      body: JSON.stringify({ name: name, html: '', css: '' })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        window.location.href = '/builder/' + data.page.id;
      }
    });
  });

  document.getElementById('newPageName').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { document.getElementById('modalNewConfirm').click(); }
  });

  /* ── RENAME ── */
  var renameId = null;

  document.querySelectorAll('[data-action="rename"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      renameId = btn.getAttribute('data-id');
      document.getElementById('renameInput').value = btn.getAttribute('data-name');
      closeAllDropdowns();
      openModal('modalRename');
      setTimeout(function () { document.getElementById('renameInput').focus(); }, 100);
    });
  });

  document.getElementById('modalRenameCancel').addEventListener('click', function () { closeModal('modalRename'); });

  document.getElementById('modalRenameConfirm').addEventListener('click', function () {
    var name = document.getElementById('renameInput').value.trim();
    if (!name || !renameId) { return; }

    fetch('/api/pages/' + renameId + '/rename', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
      body: JSON.stringify({ name: name })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        closeModal('modalRename');
        toast('Page renamed!', 'success');
        setTimeout(function () { location.reload(); }, 800);
      }
    });
  });

  /* ── DUPLICATE ── */
  document.querySelectorAll('[data-action="duplicate"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-id');
      closeAllDropdowns();

      fetch('/api/pages/' + id + '/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF }
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          toast('Page duplicated!', 'success');
          setTimeout(function () { location.reload(); }, 800);
        }
      });
    });
  });

  /* ── TOGGLE STATUS ── */
  document.querySelectorAll('[data-action="toggle-status"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-id');
      var current = btn.getAttribute('data-status');
      var next = current === 'draft' ? 'published' : 'draft';
      closeAllDropdowns();

      fetch('/api/pages/' + id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
        body: JSON.stringify({ status: next })
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          toast('Status updated to ' + next + '!', 'success');
          setTimeout(function () { location.reload(); }, 800);
        }
      });
    });
  });

  /* ── DELETE ── */
  var deleteId = null;

  document.querySelectorAll('[data-action="delete"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      deleteId = btn.getAttribute('data-id');
      var name = btn.getAttribute('data-name');
      document.getElementById('deleteMsg').textContent = 'Delete "' + name + '"? This cannot be undone.';
      closeAllDropdowns();
      openModal('modalDelete');
    });
  });

  document.getElementById('modalDeleteCancel').addEventListener('click', function () { closeModal('modalDelete'); });

  document.getElementById('modalDeleteConfirm').addEventListener('click', function () {
    if (!deleteId) { return; }

    fetch('/api/pages/' + deleteId, {
      method: 'DELETE',
      headers: { 'X-CSRF-TOKEN': CSRF }
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        closeModal('modalDelete');
        toast('Page deleted.');
        setTimeout(function () { location.reload(); }, 800);
      }
    });
  });

  /* ── SEARCH ── */
  document.getElementById('searchInput').addEventListener('input', function () {
    var q = this.value.toLowerCase().trim();
    document.querySelectorAll('.page-card').forEach(function (card) {
      var name = card.getAttribute('data-name') || '';
      card.style.display = name.includes(q) ? '' : 'none';
    });
  });

  /* ── FILTER TABS ── */
  document.querySelectorAll('.ftab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.ftab').forEach(function (t) { t.classList.remove('on'); });
      tab.classList.add('on');
      var filter = tab.getAttribute('data-filter');
      document.querySelectorAll('.page-card').forEach(function (card) {
        if (filter === 'all') {
          card.style.display = '';
        } else {
          card.style.display = card.getAttribute('data-status') === filter ? '' : 'none';
        }
      });
    });
  });

  /* ── CLOSE MODALS ON OVERLAY CLICK ── */
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { overlay.classList.remove('show'); }
    });
  });

}());
</script>

</body>
</html>