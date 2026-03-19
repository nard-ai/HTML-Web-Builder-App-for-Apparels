



(function () {
    'use strict';

    var editor = null;

    // Read page data from window variables injected by Blade
    var PAGE_ID     = window.ERP_PAGE_ID    || '';
    var PAGE_NAME   = window.ERP_PAGE_NAME  || 'Untitled';
    var HAS_CONTENT = window.ERP_HAS_CONTENT || 'no';
    var csrfEl = document.querySelector('meta[name="csrf-token"]');
    var CSRF   = csrfEl ? csrfEl.content : '';

    /* --------------------------------------------------
       HTML BUILDER helpers (for default dashboard)
    -------------------------------------------------- */
    function t(tag, attrs, inner) {
        var s = '<' + tag;
        var keys = Object.keys(attrs);
        for (var i = 0; i < keys.length; i++) {
            s += ' ' + keys[i] + '="' + attrs[keys[i]] + '"';
        }
        return s + '>' + (inner || '') + '</' + tag + '>';
    }

    var RED = '#B90E0A';

    function kpi(label, val, sub, subColor, borderColor) {
        return t('div', { style: 'background:#fff;border-radius:10px;padding:20px;border-top:4px solid ' + borderColor + ';box-shadow:0 2px 8px rgba(0,0,0,.06);font-family:Barlow,sans-serif;' },
            t('div', { style: 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;margin-bottom:10px;' }, label) +
            t('div', { style: 'font-size:28px;font-weight:700;color:#1a1a1a;' }, val) +
            t('div', { style: 'font-size:12px;color:' + subColor + ';margin-top:6px;' }, sub)
        );
    }

    function oRow(id, name, amt, stLabel, stBg, stColor) {
        return t('tr', { style: 'border-bottom:1px solid #f5f5f5;' },
            t('td', { style: 'padding:12px 20px;color:' + RED + ';font-weight:600;' }, id) +
            t('td', { style: 'padding:12px 10px;color:#333;' }, name) +
            t('td', { style: 'padding:12px 10px;color:#333;font-weight:600;' }, 'PHP ' + amt) +
            t('td', { style: 'padding:12px 10px;' },
                t('span', { style: 'background:' + stBg + ';color:' + stColor + ';padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;' }, stLabel)
            )
        );
    }

    function pRow(label, amt, pct) {
        return t('div', { style: 'margin-bottom:16px;' },
            t('div', { style: 'display:flex;justify-content:space-between;margin-bottom:6px;' },
                t('span', { style: 'font-size:13px;color:#333;font-weight:500;' }, label) +
                t('span', { style: 'font-size:13px;font-weight:700;color:#1a1a1a;' }, 'PHP ' + amt)
            ) +
            t('div', { style: 'background:#f0f0f0;border-radius:99px;height:6px;' },
                t('div', { style: 'background:' + RED + ';height:6px;border-radius:99px;width:' + pct + '%;' }, '')
            )
        );
    }

    function bCol(name, val, trend, tColor, isLast) {
        var border = isLast ? '' : 'border-right:1px solid #f0f0f0;';
        return t('div', { style: 'padding:20px;text-align:center;' + border },
            t('div', { style: 'font-size:10px;font-weight:700;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;' }, name) +
            t('div', { style: 'font-size:22px;font-weight:700;color:' + RED + ';' }, 'PHP ' + val) +
            t('div', { style: 'font-size:11px;color:' + tColor + ';margin-top:4px;' }, trend)
        );
    }

    function sideLink(label, active) {
        var style = active
            ? 'display:flex;align-items:center;gap:10px;padding:10px 16px;background:' + RED + ';color:#fff;text-decoration:none;font-size:13px;font-weight:600;'
            : 'display:flex;align-items:center;gap:10px;padding:10px 16px;color:#555;text-decoration:none;font-size:13px;border-bottom:1px solid #f5f5f5;';
        return t('a', { href: '#', style: style }, label);
    }

    var DASH =
        t('div', { style: 'font-family:Barlow,sans-serif;background:#f5f5f5;min-height:100vh;' },
            t('nav', { style: 'background:' + RED + ';padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(185,14,10,.4);' },
                t('div', { style: 'display:flex;align-items:center;gap:12px;' },
                    t('div', { style: 'background:rgba(255,255,255,.2);border-radius:6px;padding:6px 14px;font-weight:800;color:#fff;font-size:17px;letter-spacing:2px;' }, 'BENCH') +
                    t('span', { style: 'color:rgba(255,255,255,.6);font-size:13px;font-weight:500;' }, 'Enterprise Resource Planning')
                ) +
                t('div', { style: 'display:flex;align-items:center;gap:16px;' },
                    t('span', { style: 'color:rgba(255,255,255,.8);font-size:13px;cursor:pointer;' }, 'Notifications') +
                    t('div', { style: 'display:flex;align-items:center;gap:8px;cursor:pointer;' },
                        t('div', { style: 'width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;' }, 'A') +
                        t('span', { style: 'color:#fff;font-size:13px;font-weight:600;' }, 'Admin')
                    )
                )
            ) +
            t('div', { style: 'display:flex;min-height:calc(100vh - 56px);' },
                t('aside', { style: 'width:220px;background:#fff;border-right:1px solid #e5e5e5;padding:16px 0;flex-shrink:0;' },
                    t('div', { style: 'padding:0 16px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#bbb;' }, 'Main Menu') +
                    sideLink('Dashboard', true) +
                    sideLink('Inventory', false) +
                    sideLink('Orders', false) +
                    sideLink('Employees', false) +
                    sideLink('Reports', false) +
                    sideLink('Branches', false) +
                    sideLink('Payroll', false) +
                    t('a', { href: '#', style: 'display:flex;align-items:center;gap:10px;padding:10px 16px;color:#555;text-decoration:none;font-size:13px;' }, 'Settings')
                ) +
                t('main', { style: 'flex:1;padding:24px;overflow-y:auto;' },
                    t('div', { style: 'margin-bottom:24px;' },
                        t('h1', { style: 'font-size:26px;font-weight:700;color:#1a1a1a;margin-bottom:4px;' }, 'Dashboard') +
                        t('p', { style: 'color:#888;font-size:13px;' }, 'Welcome back, Admin - February 27, 2026')
                    ) +
                    t('div', { style: 'display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;' },
                        kpi('Total Revenue', 'PHP 4.2M', '+ 12.4% vs last month', '#22c55e', RED) +
                        kpi('Orders Today', '348', '+ 8.1% vs yesterday', '#22c55e', '#1a1a1a') +
                        kpi('Low Stock Items', '27', 'Needs restocking', '#f59e0b', '#f59e0b') +
                        kpi('Active Employees', '1,240', 'Across 45 branches', '#888', '#3b82f6')
                    ) +
                    t('div', { style: 'display:grid;grid-template-columns:1.6fr 1fr;gap:16px;margin-bottom:24px;' },
                        t('div', { style: 'background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;' },
                            t('div', { style: 'padding:16px 20px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;' },
                                t('span', { style: 'font-weight:700;font-size:14px;color:#1a1a1a;' }, 'Recent Orders') +
                                t('span', { style: 'font-size:12px;color:' + RED + ';cursor:pointer;font-weight:600;' }, 'View All')
                            ) +
                            t('table', { style: 'width:100%;border-collapse:collapse;font-size:13px;' },
                                t('thead', {},
                                    t('tr', { style: 'background:#fafafa;' },
                                        t('th', { style: 'padding:10px 20px;text-align:left;font-weight:700;color:#888;font-size:11px;text-transform:uppercase;' }, 'Order ID') +
                                        t('th', { style: 'padding:10px;text-align:left;font-weight:700;color:#888;font-size:11px;text-transform:uppercase;' }, 'Customer') +
                                        t('th', { style: 'padding:10px;text-align:left;font-weight:700;color:#888;font-size:11px;text-transform:uppercase;' }, 'Amount') +
                                        t('th', { style: 'padding:10px;text-align:left;font-weight:700;color:#888;font-size:11px;text-transform:uppercase;' }, 'Status')
                                    )
                                ) +
                                t('tbody', {},
                                    oRow('#BA-9201', 'Maria Santos', '2,450', 'Completed', '#dcfce7', '#16a34a') +
                                    oRow('#BA-9200', 'Juan dela Cruz', '1,200', 'Processing', '#fef9c3', '#ca8a04') +
                                    oRow('#BA-9199', 'Ana Reyes', '3,800', 'Completed', '#dcfce7', '#16a34a') +
                                    oRow('#BA-9198', 'Pedro Gomez', '950', 'Cancelled', '#fee2e2', '#dc2626') +
                                    oRow('#BA-9197', 'Liza Macaraeg', '5,100', 'Shipped', '#dbeafe', '#2563eb')
                                )
                            )
                        ) +
                        t('div', { style: 'background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.06);' },
                            t('div', { style: 'padding:16px 20px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;' },
                                t('span', { style: 'font-weight:700;font-size:14px;color:#1a1a1a;' }, 'Top Products') +
                                t('span', { style: 'font-size:12px;color:' + RED + ';cursor:pointer;font-weight:600;' }, 'View All')
                            ) +
                            t('div', { style: 'padding:16px;' },
                                pRow('Classic Polo Shirt', '890K', 82) +
                                pRow('Slim Fit Chinos', '640K', 64) +
                                pRow('Casual T-Shirt', '510K', 51) +
                                pRow('Denim Jacket', '430K', 43) +
                                pRow('Printed Shorts', '310K', 31)
                            )
                        )
                    ) +
                    t('div', { style: 'background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;' },
                        t('div', { style: 'padding:16px 20px;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:14px;color:#1a1a1a;' }, 'Branch Performance - February 2026') +
                        t('div', { style: 'display:grid;grid-template-columns:repeat(5,1fr);' },
                            bCol('SM Mall of Asia', '1.2M', '+ 18%', '#22c55e', false) +
                            bCol('BGC', '980K', '+ 9%', '#22c55e', false) +
                            bCol('Cebu', '750K', '+ 2%', '#f59e0b', false) +
                            bCol('Davao', '620K', '+ 14%', '#22c55e', false) +
                            bCol('Online Store', '650K', '+ 34%', '#22c55e', true)
                        )
                    )
                )
            )
        );

    /* --------------------------------------------------
       CHART CONFIG — stored as JSON in data attribute
       This survives GrapeJS HTML save/load perfectly
    -------------------------------------------------- */
    var CHARTJS = 'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js';

    function chartHtml(title, subtitle, badge, cfgObj) {
        // Store config as base64 to avoid any quote escaping issues in HTML attributes
        var cfgJson = JSON.stringify(cfgObj);
        var cfgB64  = btoa(unescape(encodeURIComponent(cfgJson)));
        return '<div data-gjs-type="chart-widget" data-cfg="' + cfgB64 + '" ' +
            'style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.06);font-family:Barlow,sans-serif;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
            '<div>' +
            '<div style="font-size:14px;font-weight:700;color:#1a1a1a;">' + title + '</div>' +
            '<div style="font-size:12px;color:#888;">' + subtitle + '</div>' +
            '</div>' +
            '<span style="background:#fee2e2;color:#B90E0A;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">' + badge + '</span>' +
            '</div>' +
            '<canvas style="max-height:280px;"></canvas>' +
            '</div>';
    }

    /* --------------------------------------------------
       BLOCKS
    -------------------------------------------------- */
    var BLOCKS = [
        { id: 'kpi', label: 'KPI Card', category: 'ERP', content: '<div data-erp="kpi" style="background:#fff;border-radius:10px;padding:20px;border-top:4px solid #B90E0A;box-shadow:0 2px 8px rgba(0,0,0,.06);font-family:Barlow,sans-serif;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:10px;">Metric Label</div><div style="font-size:28px;font-weight:700;color:#1a1a1a;">PHP 0</div><div style="font-size:12px;color:#22c55e;margin-top:6px;">+0% vs last period</div></div>' },
        { id: 'dtable', label: 'Data Table', category: 'ERP', content: '<div style="background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;font-family:Barlow,sans-serif;"><div style="padding:16px 20px;border-bottom:1px solid #f0f0f0;font-weight:700;color:#1a1a1a;">Table Title</div><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#fafafa;"><th style="padding:10px 20px;text-align:left;font-size:11px;color:#888;font-weight:700;">Col A</th><th style="padding:10px;text-align:left;font-size:11px;color:#888;font-weight:700;">Col B</th><th style="padding:10px;text-align:left;font-size:11px;color:#888;font-weight:700;">Status</th></tr></thead><tbody><tr><td style="padding:12px 20px;color:#B90E0A;font-weight:600;">#ID-001</td><td style="padding:12px 10px;color:#333;">Sample Row</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">Active</span></td></tr></tbody></table></div>' },
        { id: 'prog', label: 'Progress Bar', category: 'ERP', content: '<div data-erp="prog" style="font-family:Barlow,sans-serif;padding:4px 0;"><span style="font-size:13px;color:#333;font-weight:500;">Label</span><span style="font-size:13px;font-weight:700;color:#1a1a1a;">75%</span></div><div style="background:#f0f0f0;border-radius:99px;height:8px;"><div style="background:#B90E0A;height:8px;border-radius:99px;width:75%;"></div></div></div>' },
        { id: 'badge-g', label: 'Badge Active', category: 'ERP', content: '<span style<div style="font-family:Barlow,sans-serif;padding:4px 0;">="background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:Barlow,sans-serif;">Active</span>' },
        { id: 'badge-r', label: 'Badge Cancelled', category: 'ERP', content: '<span style="background:#fee2e2;color:#dc2626;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:Barlow,sans-serif;">Cancelled</span>' },
        { id: 'badge-y', label: 'Badge Processing', category: 'ERP', content: '<span style="background:#fef<button data-erp="btn-red" style="background:#B90E0A;color:#fff;border:none;border-radius:6px;9c3;color:#ca8a04;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:Barlow,sans-serif;">Processing</span>' },
        { id: 'btn-red', label: 'Red Button', category: 'ERP', content: 'padding:10px 22px;font-size:14px;font-weight:600;cursor:pointer;font-family:Barlow,sans-serif;">Save Changes</button>' },
        { id: 'btn-out', label: 'Outline Button', category: 'ERP', content: '<button data-erp="btn-out" style="background:transparent;color:#B90E0A;border:2px solid #B90E0A;border-radius:6px;padding:9px 22px;font-size:14px;font-weight:600;cursor:pointer;font-family:Barlow,sans-serif;">Cancel</button>' },
        { id: 'topnav', label: 'Top Nav', category: 'ERP', content: '<nav style="background:#B90E0A;padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between;font-family:Barlow,sans-serif;"><div style="font-weight:800;color:#fff;font-size:18px;letter-spacing:2px;">BENCH ERP</div><div style="display:flex;gap:20px;"><a href="#" style="color:rgba(255,255,255,.85);font-size:13px;text-decoration:none;">Dashboard</a><a href="#" style="color:rgba(255,255,255,.85);font-size:13px;text-decoration:none;">Inventory</a></div></nav>' },
        { id: 'sidebar', label: 'Sidebar Nav', category: 'ERP', content: '<aside style="width:220px;background:#fff;border-right:1px solid #e5e5e5;padding:16px 0;font-family:Barlow,sans-serif;min-height:400px;"><a href="#" style="display:block;padding:10px 16px;background:#B90E0A;color:#fff;text-decoration:none;font-size:13px;font-weight:600;">Dashboard</a><a href="#" style="display:block;padding:10px 16px;color:#555;text-decoration:none;font-size:13px;border-bottom:1px solid #f0f0f0;">Inventory</a><a href="#" style="display:block;padding:10px 16px;color:#555;text-decoration:none;font-size:13px;">Orders</a></aside>' },
        { id: 'sec-hdr', label: 'Section Header', category: 'ERP', content: '<div data-erp="sec-hdr" style="margin-bottom:20px;font-family:Barlow,sans-serif;"><h2 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">Section Title</h2><p style="color:#888;font-size:13px;margin:0;">Subtitle here</p></div>' },
        { id: 'form-in', label: 'Form Input', category: 'ERP', content: '<div data-erp="form-in" style="margin-bottom:16px;font-family:Barlow,sans-serif;"><label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;margin-bottom:6px;">Field Label</label><input type="text" placeholder="Enter value..." style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:13px;font-family:Barlow,sans-serif;outline:none;" /></div>' },
        { id: 'form-sel', label: 'Form Select', category: 'ERP', content: '<div data-erp="form-sel" style="margin-bottom:16px;font-family:Barlow,sans-serif;"><label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;margin-bottom:6px;">Select Label</label><select style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:13px;font-family:Barlow,sans-serif;outline:none;background:#fff;"><option>Option 1</option><option>Option 2</option></select></div>' },
        { id: 'alert-w', label: 'Warning Alert', category: 'ERP', content: '<div data-erp="alert-w" style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:14px 16px;font-family:Barlow,sans-serif;"><div style="font-weight:700;font-size:13px;color:#854d0e;">Warning</div><div style="font-size:12px;color:#a16207;margin-top:2px;">Alert message goes here.</div></div>' },
        { id: 'alert-e', label: 'Error Alert', category: 'ERP', content: '<div data-erp="alert-e" style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:14px 16px;font-family:Barlow,sans-serif;"><div style="font-weight:700;font-size:13px;color:#991b1b;">Error</div><div style="font-size:12px;color:#b91c1c;margin-top:2px;">Error message goes here.</div></div>' },
        { id: 'card', label: 'Card', category: 'Layout', content: '<div data-erp="card" style="background:#fff;border-radius:10px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.06);font-family:Barlow,sans-serif;"><h3 style="font-size:16px;font-weight:700;color:#1a1a1a;margin:0 0 8px;">Card Title</h3><p style="font-size:13px;color:#666;line-height:1.6;">Card description here.</p></div>' },
        { id: 'col2', label: '2 Columns', category: 'Layout', content: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-family:Barlow,sans-serif;"><div style="background:#f5f5f5;padding:20px;border-radius:8px;min-height:80px;"><p style="color:#555;">Column 1</p></div><div style="background:#f5f5f5;padding:20px;border-radius:8px;min-height:80px;"><p style="color:#555;">Column 2</p></div></div>' },
        { id: 'col3', label: '3 Columns', category: 'Layout', content: '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;font-family:Barlow,sans-serif;"><div style="background:#f5f5f5;padding:20px;border-radius:8px;min-height:80px;"><p style="color:#555;">Col 1</p></div><div style="background:#f5f5f5;padding:20px;border-radius:8px;min-height:80px;"><p style="color:#555;">Col 2</p></div><div style="background:#f5f5f5;padding:20px;border-radius:8px;min-height:80px;"><p style="color:#555;">Col 3</p></div></div>' },
        { id: 'img', label: 'Image', category: 'Basic', content: '<img data-erp="img" src="https://placehold.co/600x300/B90E0A/ffffff?text=Bench+Apparel" alt="img" style="max-width:100%;border-radius:8px;display:block;"/>' },
        { id: 'txt', label: 'Text', category: 'Basic', content: '<p data-erp="txt" style="font-family:Barlow,sans-serif;font-size:14px;color:#333;line-height:1.6;">Click to edit this text.</p>' },
        { id: 'h2', label: 'Heading', category: 'Basic', content: '<h2 data-erp="h2" style="font-family:Barlow,sans-serif;font-size:24px;font-weight:700;color:#1a1a1a;">Your Heading</h2>' },
        
        { id: 'hr', label: 'Divider', category: 'Basic', content: '<hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;"/>' },
        // ─────────────────────────────────────────────────────────────────
//  Paste this object into your BLOCKS array
//  Matches your existing simple inline content format (like kpi, card, etc.)
//  Place it right after your last block, before the closing ];
// ─────────────────────────────────────────────────────────────────

{
    id: 'carousel',
    label: 'Product Carousel',
    category: 'Components',
    content: (function () {

        // ── SVG icons (inline, no external deps) ──────────────────
        var svgPrev = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="display:block;pointer-events:none;"><path d="M19 12H5M10 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/><\/svg>';
        var svgNext = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="display:block;pointer-events:none;"><path d="M5 12h14M14 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/><\/svg>';
        var svgHeart = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="display:block;pointer-events:none;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-linecap="round" stroke-linejoin="round"/><\/svg>';

        // ── Product data ───────────────────────────────────────────
        var CARDS = [
            { no: '01', col: 'STREETWEAR', name: 'Premium Hoodie',  price: '₱1,299', bg: '#D8D3CC' },
            { no: '02', col: 'ESSENTIALS', name: 'Classic Tee',     price: '₱599',   bg: '#C8C3BC' },
            { no: '03', col: 'OUTERWEAR',  name: 'Denim Jacket',    price: '₱2,499', bg: '#B8B3AC' },
            { no: '04', col: 'BOTTOMS',    name: 'Cargo Pants',     price: '₱1,799', bg: '#A8A39C' },
            { no: '05', col: 'ESSENTIALS', name: 'Polo Shirt',      price: '₱699',   bg: '#C0BBB4' },
            { no: '06', col: 'OUTERWEAR',  name: 'Bomber Jacket',   price: '₱2,999', bg: '#B0ABA4' },
            { no: '07', col: 'BOTTOMS',    name: 'Chino Shorts',    price: '₱849',   bg: '#CCCAB8' },
            { no: '08', col: 'STREETWEAR', name: 'Graphic Tee',     price: '₱699',   bg: '#BDB9A8' },
        ];

        var TOTAL = CARDS.length;

        // ── Build one card ─────────────────────────────────────────
        function mkCard(c) {
            return (
                '<div class="lc-card" style="flex-shrink:0;width:calc(100% / 4);padding:0 8px;cursor:pointer;transition:transform .55s cubic-bezier(.25,.46,.45,.94),opacity .35s ease;">' +
                    '<div style="position:relative;aspect-ratio:3/4;background:' + c.bg + ';overflow:hidden;margin-bottom:14px;">' +
                        '<span style="position:absolute;top:12px;left:12px;font-size:10px;font-weight:500;letter-spacing:.18em;color:#1A1614;opacity:.35;z-index:1;">' + c.no + '</span>' +
                        '<div class="lc-ov" style="position:absolute;inset:0;background:rgba(26,22,20,.42);display:flex;align-items:flex-end;justify-content:space-between;padding:16px;z-index:2;opacity:0;transition:opacity .3s ease;">' +
                            '<button style="font-size:10px;font-weight:600;letter-spacing:.14em;padding:9px 16px;background:#F5F0E8;color:#1A1614;border:none;cursor:pointer;">ADD TO BAG</button>' +
                            '<button style="width:36px;height:36px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;flex-shrink:0;">' + svgHeart + '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;padding:0 2px;">' +
                        '<div>' +
                            '<p style="font-size:9px;letter-spacing:.18em;color:#7A7068;margin:0 0 3px;font-family:Barlow,sans-serif;">' + c.col + '</p>' +
                            '<h4 style="font-size:13px;font-weight:500;color:#1A1614;margin:0;font-family:Barlow,sans-serif;">' + c.name + '</h4>' +
                        '</div>' +
                        '<p style="font-size:15px;font-style:italic;color:#B90E0A;margin:0;margin-top:2px;flex-shrink:0;font-family:Georgia,serif;">' + c.price + '</p>' +
                    '</div>' +
                '</div>'
            );
        }

        // Triple cards for seamless infinite loop
        var trackHtml = '';
        for (var p = 0; p < 3; p++) {
            for (var i = 0; i < CARDS.length; i++) {
                trackHtml += mkCard(CARDS[i]);
            }
        }

        // ── HTML ───────────────────────────────────────────────────
        var html =
            '<div id="lc-root" style="background:#F5F0E8;padding:40px 0 28px;overflow:hidden;position:relative;font-family:Barlow,sans-serif;">' +

                // Header row
                '<div style="padding:0 32px;margin-bottom:24px;display:flex;align-items:flex-end;justify-content:space-between;">' +
                    '<div>' +
                        '<p style="font-size:10px;letter-spacing:.24em;color:#7A7068;margin:0 0 8px;">— LATEST DROPS</p>' +
                        '<div style="display:flex;align-items:center;gap:18px;">' +
                            '<h2 style="font-size:clamp(1.8rem,3.5vw,2.8rem);font-weight:900;letter-spacing:.04em;color:#1A1614;margin:0;line-height:1;font-family:Barlow,sans-serif;">NEW ARRIVALS</h2>' +
                            // Arrows beside title
                            '<div style="display:flex;gap:6px;">' +
                                '<button id="lc-prev" style="width:38px;height:38px;border:1px solid rgba(26,22,20,.2);background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#1A1614;transition:background .22s,border-color .22s,color .22s;">'+svgPrev+'</button>' +
                                '<button id="lc-next" style="width:38px;height:38px;border:1px solid rgba(26,22,20,.2);background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#1A1614;transition:background .22s,border-color .22s,color .22s;">'+svgNext+'</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    // Counter + paused label
                    '<div style="display:flex;align-items:center;gap:12px;padding-bottom:3px;">' +
                        '<span id="lc-paused" style="font-size:10px;letter-spacing:.16em;color:#7A7068;display:none;">PAUSED</span>' +
                        '<span id="lc-counter" style="font-size:11px;letter-spacing:.18em;color:#7A7068;">01 / 08</span>' +
                    '</div>' +
                '</div>' +

                // Viewport
                '<div style="overflow:hidden;padding:0 32px;">' +
                    '<div id="lc-track" style="display:flex;will-change:transform;">' +
                        trackHtml +
                    '</div>' +
                '</div>' +

                // Progress bar + dots
                '<div style="display:flex;align-items:center;gap:16px;padding:20px 32px 0;">' +
                    '<div style="flex:1;max-width:320px;height:1px;background:rgba(26,22,20,.1);overflow:hidden;">' +
                        '<div id="lc-bar" style="height:100%;background:#1A1614;width:0%;transition:width .85s cubic-bezier(.87,0,.13,1);"></div>' +
                    '</div>' +
                    '<div id="lc-dots" style="display:flex;gap:5px;align-items:center;"></div>' +
                '</div>' +

                // Timer line
                '<div style="margin:12px 32px 0;height:1px;background:rgba(26,22,20,.07);overflow:hidden;">' +
                    '<div id="lc-timer" style="height:100%;width:100%;background:#B90E0A;opacity:.65;transform:scaleX(0);transform-origin:left center;"></div>' +
                '</div>' +

            '</div>';

        // ── Script ─────────────────────────────────────────────────
        var js =
            '<script>' +
            '(function(){' +
            'var DELAY=4000,VISIBLE=4,TOTAL='+TOTAL+',cur='+TOTAL+',paused=false,tmr=null,raf=null;' +
            'var track=document.getElementById("lc-track");' +
            'var bar=document.getElementById("lc-bar");' +
            'var dots=document.getElementById("lc-dots");' +
            'var ctr=document.getElementById("lc-counter");' +
            'var psd=document.getElementById("lc-paused");' +
            'var tim=document.getElementById("lc-timer");' +
            'var prev=document.getElementById("lc-prev");' +
            'var next=document.getElementById("lc-next");' +

            // Arrow hover fill
            '[prev,next].forEach(function(b){if(!b)return;' +
            'b.onmouseenter=function(){b.style.background="#1A1614";b.style.borderColor="#1A1614";b.style.color="#F5F0E8";};' +
            'b.onmouseleave=function(){b.style.background="transparent";b.style.borderColor="rgba(26,22,20,.2)";b.style.color="#1A1614";};});' +

            'function cw(){return track.parentElement.offsetWidth/VISIBLE;}' +
            'function getX(){var m=(track.style.transform||"").match(/translateX\\(([^)]+)px\\)/);return m?parseFloat(m[1]):0;}' +
            'function ease(t){return t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1;}' +

            // slideTo
            'function go(idx,snap){' +
            'var tgt=-(idx*cw());' +
            'if(raf){cancelAnimationFrame(raf);raf=null;}' +
            'if(snap){track.style.transform="translateX("+tgt+"px)";fix(idx);return;}' +
            'var sx=getX(),d=tgt-sx,st=null;' +
            'function step(ts){if(!st)st=ts;var p=Math.min((ts-st)/850,1);' +
            'track.style.transform="translateX("+(sx+d*ease(p))+"px)";' +
            'if(p<1)raf=requestAnimationFrame(step);else fix(idx);}' +
            'raf=requestAnimationFrame(step);}' +

            // seamless loop fix
            'function fix(idx){var n=idx;' +
            'if(idx>=TOTAL*2)n=idx-TOTAL;' +
            'if(idx<TOTAL)n=idx+TOTAL;' +
            'if(n!==idx){track.style.transform="translateX("+(-(n*cw()))+"px)";cur=n;}' +
            'ui();}' +

            // update UI
            'function ui(){var d=((cur%TOTAL)+TOTAL)%TOTAL;' +
            'if(bar)bar.style.width=((d+1)/TOTAL*100)+"%";' +
            'if(ctr)ctr.textContent=(d+1<10?"0"+(d+1):d+1)+" / "+(TOTAL<10?"0"+TOTAL:TOTAL);' +
            'if(psd)psd.style.display=paused?"inline":"none";' +
            'mkDots(d);}' +

            // dots
            'function mkDots(a){if(!dots)return;dots.innerHTML="";' +
            'for(var i=0;i<TOTAL;i++){var b=document.createElement("button");' +
            'b.style.cssText="height:6px;border-radius:3px;border:none;cursor:pointer;padding:0;background:"+(i===a?"#1A1614":"rgba(26,22,20,.2)")+";width:"+(i===a?"22px":"6px")+";transition:all .4s cubic-bezier(.87,0,.13,1);";' +
            '(function(x){b.onclick=function(){jump(x);};})(i);' +
            'dots.appendChild(b);}}' +

            // timer bar
            'function runTim(){if(!tim)return;' +
            'tim.style.transition="none";tim.style.transform="scaleX(0)";' +
            'if(paused)return;void tim.offsetWidth;' +
            'tim.style.transition="transform "+DELAY+"ms linear";tim.style.transform="scaleX(1)";}' +

            // auto advance
            'function sched(){clearTimeout(tmr);tmr=setTimeout(function(){if(!paused){cur++;go(cur);sched();runTim();}},DELAY);}' +
            'function jump(i){cur=TOTAL+i;go(cur);clearTimeout(tmr);sched();runTim();}' +

            // arrows
            'prev&&prev.addEventListener("click",function(){cur--;go(cur);clearTimeout(tmr);sched();runTim();});' +
            'next&&next.addEventListener("click",function(){cur++;go(cur);clearTimeout(tmr);sched();runTim();});' +

            // card hover
            'var cards=track.querySelectorAll(".lc-card");' +
            'cards.forEach(function(card){' +
            'card.addEventListener("mouseenter",function(){' +
            'paused=true;clearTimeout(tmr);runTim();' +
            'card.style.transform="scale(1.055) translateY(-12px)";card.style.zIndex="10";card.style.position="relative";' +
            'var ov=card.querySelector(".lc-ov");if(ov)ov.style.opacity="1";' +
            'cards.forEach(function(c){if(c!==card)c.style.opacity=".48";});' +
            'ui();});' +
            'card.addEventListener("mouseleave",function(){' +
            'paused=false;' +
            'card.style.transform="";card.style.zIndex="";card.style.position="";' +
            'var ov=card.querySelector(".lc-ov");if(ov)ov.style.opacity="0";' +
            'cards.forEach(function(c){c.style.opacity="1";});' +
            'ui();sched();runTim();});});' +

            // resize
            'window.addEventListener("resize",function(){go(cur,true);});' +

            // init
            'go(cur,true);sched();runTim();ui();' +
            '})();' +
            '<\/script>';

        return html + js;

    })()
},

        // ── LOGIN TEMPLATES ──────────────────────────────────────────────

        {
            id: 'login-minimal',
            label: 'Login: Minimal',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:#fafaf8;display:flex;align-items:center;justify-content:center;font-family:\'Georgia\',serif;">' +
                '<div style="width:100%;max-width:400px;padding:40px;">' +
                '<div style="margin-bottom:48px;">' +
                '<div style="width:40px;height:3px;background:#1a1a1a;margin-bottom:20px;"></div>' +
                '<h1 style="font-size:28px;font-weight:400;color:#1a1a1a;margin:0 0 6px;letter-spacing:-0.5px;">Welcome back</h1>' +
                '<p style="font-size:14px;color:#999;margin:0;font-family:\'Helvetica Neue\',sans-serif;font-weight:300;">Sign in to your account</p>' +
                '</div>' +
                '<div style="margin-bottom:24px;">' +
                '<label style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Email address</label>' +
                '<input type="email" placeholder="you@example.com" style="width:100%;padding:14px 0;border:none;border-bottom:1.5px solid #e0e0e0;background:transparent;font-size:15px;color:#1a1a1a;outline:none;font-family:\'Helvetica Neue\',sans-serif;box-sizing:border-box;transition:border-color .2s;" onfocus="this.style.borderColor=\'#1a1a1a\'" onblur="this.style.borderColor=\'#e0e0e0\'"/>' +
                '</div>' +
                '<div style="margin-bottom:36px;">' +
                '<label style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Password</label>' +
                '<input type="password" placeholder="••••••••" style="width:100%;padding:14px 0;border:none;border-bottom:1.5px solid #e0e0e0;background:transparent;font-size:15px;color:#1a1a1a;outline:none;font-family:\'Helvetica Neue\',sans-serif;box-sizing:border-box;" />' +
                '</div>' +
                '<button style="width:100%;padding:16px;background:#1a1a1a;color:#fafaf8;border:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:500;">Sign In</button>' +
                '<div style="text-align:center;margin-top:28px;">' +
                '<a href="#" style="font-size:13px;color:#999;text-decoration:none;font-family:\'Helvetica Neue\',sans-serif;">Forgot password?</a>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-dark',
            label: 'Login: Dark Luxury',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:linear-gradient(135deg,#0a0a0a 0%,#111827 50%,#0a0a0a 100%);display:flex;align-items:center;justify-content:center;font-family:\'Helvetica Neue\',sans-serif;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:-200px;left:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(185,14,10,0.12) 0%,transparent 70%);pointer-events:none;"></div>' +
                '<div style="position:absolute;bottom:-150px;right:-150px;width:500px;height:500px;background:radial-gradient(circle,rgba(185,14,10,0.08) 0%,transparent 70%);pointer-events:none;"></div>' +
                '<div style="width:100%;max-width:420px;padding:48px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;backdrop-filter:blur(20px);position:relative;z-index:1;">' +
                '<div style="text-align:center;margin-bottom:40px;">' +
                '<div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:#B90E0A;border-radius:12px;margin-bottom:20px;">' +
                '<span style="color:#fff;font-weight:800;font-size:20px;letter-spacing:1px;">B</span></div>' +
                '<h1 style="font-size:24px;font-weight:600;color:#fff;margin:0 0 6px;letter-spacing:-0.3px;">Bench Apparel ERP</h1>' +
                '<p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0;">Authorized access only</p>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<label style="display:block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:8px;">Email</label>' +
                '<input type="email" placeholder="admin@bench.com" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" />' +
                '</div>' +
                '<div style="margin-bottom:28px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                '<label style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5);">Password</label>' +
                '<a href="#" style="font-size:12px;color:#B90E0A;text-decoration:none;">Forgot?</a>' +
                '</div>' +
                '<input type="password" placeholder="••••••••" style="width:100%;padding:13px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" />' +
                '</div>' +
                '<button style="width:100%;padding:14px;background:linear-gradient(135deg,#B90E0A,#8a0a07);color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:0.5px;box-shadow:0 4px 24px rgba(185,14,10,0.35);">Sign In to ERP</button>' +
                '<div style="display:flex;align-items:center;gap:12px;margin:24px 0;">' +
                '<div style="flex:1;height:1px;background:rgba(255,255,255,0.08);"></div>' +
                '<span style="font-size:11px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1px;">Secure</span>' +
                '<div style="flex:1;height:1px;background:rgba(255,255,255,0.08);"></div>' +
                '</div>' +
                '<p style="text-align:center;font-size:12px;color:rgba(255,255,255,0.25);margin:0;">Protected by enterprise-grade encryption</p>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-split',
            label: 'Login: Split Screen',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;display:grid;grid-template-columns:1fr 1fr;font-family:\'Helvetica Neue\',sans-serif;">' +
                '<div style="background:linear-gradient(160deg,#B90E0A 0%,#6b0806 100%);display:flex;flex-direction:column;justify-content:space-between;padding:48px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:0;right:0;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,0.05);transform:translate(30%,-30%);"></div>' +
                '<div style="position:absolute;bottom:0;left:0;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.05);transform:translate(-30%,30%);"></div>' +
                '<div style="position:relative;">' +
                '<div style="display:inline-flex;align-items:center;gap:10px;">' +
                '<div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;">' +
                '<span style="color:#fff;font-weight:800;font-size:16px;">B</span></div>' +
                '<span style="color:#fff;font-weight:700;font-size:18px;letter-spacing:1px;">BENCH ERP</span>' +
                '</div>' +
                '</div>' +
                '<div style="position:relative;">' +
                '<h2 style="font-size:36px;font-weight:700;color:#fff;margin:0 0 16px;line-height:1.2;">Manage everything from one place</h2>' +
                '<p style="font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;margin:0 0 32px;">Inventory, orders, employees, payroll — all in your Bench Apparel command center.</p>' +
                '<div style="display:flex;gap:24px;">' +
                '<div><div style="font-size:24px;font-weight:700;color:#fff;">45+</div><div style="font-size:12px;color:rgba(255,255,255,0.6);">Branches</div></div>' +
                '<div><div style="font-size:24px;font-weight:700;color:#fff;">1,240</div><div style="font-size:12px;color:rgba(255,255,255,0.6);">Employees</div></div>' +
                '<div><div style="font-size:24px;font-weight:700;color:#fff;">PHP 4.2M</div><div style="font-size:12px;color:rgba(255,255,255,0.6);">Monthly Rev</div></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;justify-content:center;background:#fafaf8;padding:48px;">' +
                '<div style="width:100%;max-width:360px;">' +
                '<h1 style="font-size:28px;font-weight:700;color:#1a1a1a;margin:0 0 8px;">Welcome back</h1>' +
                '<p style="font-size:14px;color:#888;margin:0 0 36px;">Enter your credentials to continue</p>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Email Address</label>' +
                '<input type="email" placeholder="you@bench.com" style="width:100%;padding:12px 16px;border:1.5px solid #e5e5e5;border-radius:8px;font-size:14px;color:#1a1a1a;outline:none;box-sizing:border-box;background:#fff;transition:border-color .2s;" onfocus="this.style.borderColor=\'#B90E0A\'" onblur="this.style.borderColor=\'#e5e5e5\'"/>' +
                '</div>' +
                '<div style="margin-bottom:28px;">' +
                '<label style="display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Password</label>' +
                '<input type="password" placeholder="••••••••" style="width:100%;padding:12px 16px;border:1.5px solid #e5e5e5;border-radius:8px;font-size:14px;color:#1a1a1a;outline:none;box-sizing:border-box;background:#fff;" />' +
                '</div>' +
                '<button style="width:100%;padding:14px;background:#B90E0A;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:0.5px;">Sign In</button>' +
                '<div style="text-align:center;margin-top:20px;">' +
                '<a href="#" style="font-size:13px;color:#B90E0A;text-decoration:none;font-weight:500;">Forgot password?</a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-glassmorphism',
            label: 'Login: Glassmorphism',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:linear-gradient(135deg,#1a0505 0%,#2d0808 30%,#0a0a1a 70%,#000 100%);display:flex;align-items:center;justify-content:center;font-family:\'Helvetica Neue\',sans-serif;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:15%;left:10%;width:350px;height:350px;background:rgba(185,14,10,0.25);border-radius:50%;filter:blur(80px);pointer-events:none;animation:pulse 4s ease-in-out infinite alternate;"></div>' +
                '<div style="position:absolute;bottom:10%;right:10%;width:280px;height:280px;background:rgba(100,10,10,0.3);border-radius:50%;filter:blur(60px);pointer-events:none;"></div>' +
                '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;height:400px;background:rgba(185,14,10,0.08);border-radius:50%;filter:blur(100px);pointer-events:none;"></div>' +
                '<style>@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}</style>' +
                '<div style="width:100%;max-width:420px;padding:44px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:24px;backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);box-shadow:0 32px 64px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.1);position:relative;z-index:2;animation:float 6s ease-in-out infinite;">' +
                '<div style="text-align:center;margin-bottom:36px;">' +
                '<div style="display:inline-flex;width:64px;height:64px;background:linear-gradient(135deg,rgba(185,14,10,0.8),rgba(100,10,10,0.9));border-radius:18px;align-items:center;justify-content:center;margin-bottom:18px;box-shadow:0 8px 32px rgba(185,14,10,0.4);border:1px solid rgba(185,14,10,0.5);">' +
                '<span style="color:#fff;font-weight:900;font-size:24px;">B</span></div>' +
                '<h1 style="font-size:22px;font-weight:600;color:#fff;margin:0 0 6px;letter-spacing:-0.2px;">Sign in to Bench ERP</h1>' +
                '<p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0;">Your enterprise control center</p>' +
                '</div>' +
                '<div style="margin-bottom:14px;">' +
                '<input type="email" placeholder="Email address" style="width:100%;padding:14px 18px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-size:14px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;transition:all .2s;" onfocus="this.style.background=\'rgba(255,255,255,0.1)\';this.style.borderColor=\'rgba(185,14,10,0.6)\'" onblur="this.style.background=\'rgba(255,255,255,0.07)\';this.style.borderColor=\'rgba(255,255,255,0.12)\'"/>' +
                '</div>' +
                '<div style="margin-bottom:24px;">' +
                '<input type="password" placeholder="Password" style="width:100%;padding:14px 18px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:12px;color:#fff;font-size:14px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" />' +
                '</div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">' +
                '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">' +
                '<input type="checkbox" style="width:16px;height:16px;accent-color:#B90E0A;"/>' +
                '<span style="font-size:13px;color:rgba(255,255,255,0.5);">Remember me</span>' +
                '</label>' +
                '<a href="#" style="font-size:13px;color:rgba(185,14,10,0.8);text-decoration:none;">Forgot password?</a>' +
                '</div>' +
                '<button style="width:100%;padding:15px;background:linear-gradient(135deg,#B90E0A,#8a0a07);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(185,14,10,0.4);letter-spacing:0.3px;transition:transform .1s;" onmouseover="this.style.transform=\'scale(1.01)\'" onmouseout="this.style.transform=\'scale(1)\'">Access Dashboard</button>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-brutalist',
            label: 'Login: Brutalist',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:#f0ede6;display:flex;align-items:stretch;font-family:\'Courier New\',monospace;position:relative;">' +
                '<div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,0,0,0.04) 39px,rgba(0,0,0,0.04) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,0,0,0.04) 39px,rgba(0,0,0,0.04) 40px);pointer-events:none;"></div>' +
                '<div style="margin:auto;width:100%;max-width:480px;padding:40px;position:relative;">' +
                '<div style="background:#fff;border:3px solid #1a1a1a;box-shadow:8px 8px 0 #B90E0A;padding:40px;">' +
                '<div style="border-bottom:3px solid #1a1a1a;padding-bottom:20px;margin-bottom:32px;">' +
                '<div style="display:flex;align-items:center;gap:12px;">' +
                '<div style="width:40px;height:40px;background:#B90E0A;display:flex;align-items:center;justify-content:center;">' +
                '<span style="color:#fff;font-weight:900;font-size:18px;">B</span></div>' +
                '<div>' +
                '<div style="font-size:18px;font-weight:900;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;">BENCH ERP</div>' +
                '<div style="font-size:10px;color:#B90E0A;letter-spacing:3px;text-transform:uppercase;">Enterprise System</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#666;margin-bottom:6px;">// ACCESS TERMINAL</div>' +
                '<h1 style="font-size:32px;font-weight:900;color:#1a1a1a;margin:0 0 32px;text-transform:uppercase;line-height:1;letter-spacing:-1px;">SIGN IN_</h1>' +
                '<div style="margin-bottom:20px;">' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666;margin-bottom:6px;">USER.EMAIL</div>' +
                '<input type="email" placeholder="user@bench.com" style="width:100%;padding:12px;border:2px solid #1a1a1a;background:#f0ede6;font-size:14px;color:#1a1a1a;outline:none;font-family:\'Courier New\',monospace;box-sizing:border-box;" onfocus="this.style.background=\'#fff\'" onblur="this.style.background=\'#f0ede6\'"/>' +
                '</div>' +
                '<div style="margin-bottom:28px;">' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666;margin-bottom:6px;">AUTH.PASSWORD</div>' +
                '<input type="password" placeholder="••••••••••••" style="width:100%;padding:12px;border:2px solid #1a1a1a;background:#f0ede6;font-size:14px;color:#1a1a1a;outline:none;font-family:\'Courier New\',monospace;box-sizing:border-box;" />' +
                '</div>' +
                '<button style="width:100%;padding:16px;background:#1a1a1a;color:#f0ede6;border:3px solid #1a1a1a;font-size:14px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:4px;font-family:\'Courier New\',monospace;box-shadow:4px 4px 0 #B90E0A;transition:all .1s;" onmouseover="this.style.background=\'#B90E0A\';this.style.boxShadow=\'4px 4px 0 #1a1a1a\'" onmouseout="this.style.background=\'#1a1a1a\';this.style.boxShadow=\'4px 4px 0 #B90E0A\'">EXECUTE LOGIN</button>' +
                '<div style="margin-top:20px;font-size:11px;color:#999;text-align:center;letter-spacing:1px;">// FORGOT PASSWORD? CONTACT SYSADMIN</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-editorial',
            label: 'Login: Editorial',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;display:grid;grid-template-rows:auto 1fr auto;background:#fff;font-family:\'Georgia\',\'Times New Roman\',serif;">' +
                '<header style="border-bottom:2px solid #1a1a1a;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:16px;">' +
                '<div style="width:2px;height:32px;background:#B90E0A;"></div>' +
                '<div>' +
                '<div style="font-size:18px;font-weight:700;color:#1a1a1a;letter-spacing:3px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;">BENCH</div>' +
                '<div style="font-size:10px;color:#888;letter-spacing:2px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-top:2px;">Enterprise Resource Planning</div>' +
                '</div>' +
                '</div>' +
                '<div style="font-size:12px;color:#888;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">RESTRICTED ACCESS</div>' +
                '</header>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;min-height:0;">' +
                '<div style="background:#f7f5f0;border-right:2px solid #1a1a1a;padding:64px 48px;display:flex;flex-direction:column;justify-content:center;">' +
                '<div style="font-size:11px;color:#B90E0A;letter-spacing:3px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:16px;">Vol. 01 — 2026</div>' +
                '<h1 style="font-size:52px;font-weight:400;color:#1a1a1a;margin:0 0 24px;line-height:1.1;letter-spacing:-2px;">The Future<br/>of Retail<br/><em>Management.</em></h1>' +
                '<p style="font-size:15px;color:#666;line-height:1.8;margin:0 0 32px;max-width:320px;">Connecting every branch, every employee, every transaction — in real time.</p>' +
                '<div style="display:flex;gap:0;border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:20px 0;">' +
                '<div style="flex:1;border-right:1px solid #ddd;padding-right:20px;">' +
                '<div style="font-size:28px;font-weight:300;color:#1a1a1a;">45</div>' +
                '<div style="font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-top:4px;">Branches</div>' +
                '</div>' +
                '<div style="flex:1;padding-left:20px;">' +
                '<div style="font-size:28px;font-weight:300;color:#1a1a1a;">1,240</div>' +
                '<div style="font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-top:4px;">Employees</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:64px 48px;display:flex;flex-direction:column;justify-content:center;">' +
                '<h2 style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#888;font-family:\'Helvetica Neue\',sans-serif;margin:0 0 36px;font-weight:400;">Sign In</h2>' +
                '<div style="margin-bottom:24px;">' +
                '<label style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:10px;font-family:\'Helvetica Neue\',sans-serif;font-weight:500;">Email</label>' +
                '<input type="email" placeholder="your@bench.com" style="width:100%;padding:0 0 12px;border:none;border-bottom:1px solid #1a1a1a;font-size:16px;color:#1a1a1a;outline:none;background:transparent;font-family:\'Georgia\',serif;box-sizing:border-box;" />' +
                '</div>' +
                '<div style="margin-bottom:36px;">' +
                '<label style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:10px;font-family:\'Helvetica Neue\',sans-serif;font-weight:500;">Password</label>' +
                '<input type="password" placeholder="••••••••" style="width:100%;padding:0 0 12px;border:none;border-bottom:1px solid #1a1a1a;font-size:16px;color:#1a1a1a;outline:none;background:transparent;font-family:\'Georgia\',serif;box-sizing:border-box;" />' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:16px;">' +
                '<button style="flex:1;padding:16px;background:#1a1a1a;color:#fff;border:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:500;">Sign In</button>' +
                '<a href="#" style="font-size:12px;color:#B90E0A;text-decoration:none;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;white-space:nowrap;">Reset Password</a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<footer style="border-top:1px solid #e5e5e5;padding:16px 48px;display:flex;justify-content:space-between;font-size:11px;color:#aaa;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">' +
                '<span>BENCH APPAREL CORPORATION</span>' +
                '<span>SECURE LOGIN &mdash; 256-BIT ENCRYPTION</span>' +
                '</footer>' +
                '</div>';
            })()
        },


        {
            id: 'login-neon',
            label: 'Login: Neon Cyber',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:#050510;display:flex;align-items:center;justify-content:center;font-family:\'Helvetica Neue\',sans-serif;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(185,14,10,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(185,14,10,0.07) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;"></div>' +
                '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(185,14,10,0.15) 0%,transparent 65%);pointer-events:none;"></div>' +
                '<div style="width:100%;max-width:440px;padding:44px;background:rgba(5,5,16,0.95);border:1px solid rgba(185,14,10,0.4);border-radius:4px;position:relative;z-index:2;box-shadow:0 0 40px rgba(185,14,10,0.15),0 0 80px rgba(185,14,10,0.08),inset 0 0 40px rgba(185,14,10,0.03);">' +
                '<div style="position:absolute;top:-1px;left:20px;width:60px;height:2px;background:#B90E0A;box-shadow:0 0 12px #B90E0A;"></div>' +
                '<div style="position:absolute;bottom:-1px;right:20px;width:60px;height:2px;background:#B90E0A;box-shadow:0 0 12px #B90E0A;"></div>' +
                '<div style="text-align:center;margin-bottom:36px;">' +
                '<div style="font-size:11px;letter-spacing:6px;text-transform:uppercase;color:rgba(185,14,10,0.7);margin-bottom:16px;">// SYSTEM ACCESS //</div>' +
                '<h1 style="font-size:28px;font-weight:700;color:#fff;margin:0 0 4px;letter-spacing:4px;text-transform:uppercase;text-shadow:0 0 20px rgba(185,14,10,0.5);">BENCH ERP</h1>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:2px;">ENTERPRISE CONTROL SYSTEM</div>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<div style="font-size:10px;letter-spacing:3px;color:rgba(185,14,10,0.8);text-transform:uppercase;margin-bottom:8px;">USER_ID</div>' +
                '<input type="email" placeholder="enter.credentials@bench.com" style="width:100%;padding:12px 16px;background:rgba(185,14,10,0.06);border:1px solid rgba(185,14,10,0.3);color:#fff;font-size:13px;outline:none;font-family:\'Courier New\',monospace;box-sizing:border-box;letter-spacing:1px;transition:all .2s;" onfocus="this.style.borderColor=\'#B90E0A\';this.style.boxShadow=\'0 0 12px rgba(185,14,10,0.2)\'" onblur="this.style.borderColor=\'rgba(185,14,10,0.3)\';this.style.boxShadow=\'none\'"/>' +
                '</div>' +
                '<div style="margin-bottom:28px;">' +
                '<div style="font-size:10px;letter-spacing:3px;color:rgba(185,14,10,0.8);text-transform:uppercase;margin-bottom:8px;">AUTH_KEY</div>' +
                '<input type="password" placeholder="••••••••••••••••" style="width:100%;padding:12px 16px;background:rgba(185,14,10,0.06);border:1px solid rgba(185,14,10,0.3);color:#fff;font-size:13px;outline:none;font-family:\'Courier New\',monospace;box-sizing:border-box;letter-spacing:1px;" />' +
                '</div>' +
                '<button style="width:100%;padding:14px;background:transparent;color:#B90E0A;border:1px solid #B90E0A;font-size:12px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:4px;font-family:\'Courier New\',monospace;position:relative;overflow:hidden;transition:all .2s;box-shadow:0 0 20px rgba(185,14,10,0.2);" onmouseover="this.style.background=\'rgba(185,14,10,0.15)\';this.style.boxShadow=\'0 0 30px rgba(185,14,10,0.4)\'" onmouseout="this.style.background=\'transparent\';this.style.boxShadow=\'0 0 20px rgba(185,14,10,0.2)\'">[ AUTHENTICATE ]</button>' +
                '<div style="margin-top:24px;display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,0.2);font-family:\'Courier New\',monospace;letter-spacing:1px;">' +
                '<span>SYS.VER 4.2.1</span><span>256-BIT ENC</span><span>SECURE NODE</span>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-card-float',
            label: 'Login: Floating Card',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:linear-gradient(160deg,#f8f4f0 0%,#f0ebe4 100%);display:flex;align-items:center;justify-content:center;font-family:\'Helvetica Neue\',Arial,sans-serif;padding:40px;box-sizing:border-box;">' +
                '<div style="width:100%;max-width:400px;">' +
                '<div style="text-align:center;margin-bottom:32px;">' +
                '<div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:0;">' +
                '<div style="width:44px;height:44px;background:#B90E0A;border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(185,14,10,0.3);">' +
                '<span style="color:#fff;font-weight:900;font-size:20px;">B</span></div>' +
                '<div style="text-align:left;">' +
                '<div style="font-size:16px;font-weight:800;color:#1a1a1a;letter-spacing:1px;">BENCH</div>' +
                '<div style="font-size:10px;color:#999;letter-spacing:1px;text-transform:uppercase;margin-top:1px;">Apparel ERP</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:24px;padding:40px;box-shadow:0 24px 64px rgba(0,0,0,0.1),0 8px 24px rgba(0,0,0,0.06);">' +
                '<h2 style="font-size:22px;font-weight:700;color:#1a1a1a;margin:0 0 4px;text-align:center;">Good to see you</h2>' +
                '<p style="font-size:13px;color:#aaa;text-align:center;margin:0 0 32px;">Sign in to manage your operations</p>' +
                '<div style="display:flex;gap:8px;margin-bottom:20px;">' +
                '<button style="flex:1;padding:11px;background:#f5f5f5;border:none;border-radius:10px;font-size:13px;color:#555;cursor:pointer;font-weight:500;">Google</button>' +
                '<button style="flex:1;padding:11px;background:#f5f5f5;border:none;border-radius:10px;font-size:13px;color:#555;cursor:pointer;font-weight:500;">Microsoft</button>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">' +
                '<div style="flex:1;height:1px;background:#f0f0f0;"></div>' +
                '<span style="font-size:12px;color:#ccc;">or</span>' +
                '<div style="flex:1;height:1px;background:#f0f0f0;"></div>' +
                '</div>' +
                '<div style="margin-bottom:14px;">' +
                '<input type="email" placeholder="Email address" style="width:100%;padding:14px 16px;border:1.5px solid #f0f0f0;border-radius:12px;font-size:14px;color:#1a1a1a;outline:none;box-sizing:border-box;background:#fafafa;transition:all .2s;" onfocus="this.style.borderColor=\'#B90E0A\';this.style.background=\'#fff\'" onblur="this.style.borderColor=\'#f0f0f0\';this.style.background=\'#fafafa\'"/>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<input type="password" placeholder="Password" style="width:100%;padding:14px 16px;border:1.5px solid #f0f0f0;border-radius:12px;font-size:14px;color:#1a1a1a;outline:none;box-sizing:border-box;background:#fafafa;" />' +
                '</div>' +
                '<button style="width:100%;padding:15px;background:#B90E0A;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(185,14,10,0.25);transition:all .15s;" onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 12px 28px rgba(185,14,10,0.35)\'" onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'0 8px 20px rgba(185,14,10,0.25)\'">Continue</button>' +
                '<div style="text-align:center;margin-top:20px;">' +
                '<a href="#" style="font-size:13px;color:#aaa;text-decoration:none;">Forgot password?</a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-bold-type',
            label: 'Login: Bold Typography',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:#fff;display:grid;grid-template-columns:1.2fr 0.8fr;font-family:\'Helvetica Neue\',sans-serif;">' +
                '<div style="padding:60px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid #f0f0f0;">' +
                '<div style="margin-bottom:16px;">' +
                '<span style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B90E0A;font-weight:700;">Bench Apparel</span>' +
                '</div>' +
                '<h1 style="font-size:72px;font-weight:900;color:#1a1a1a;margin:0;line-height:0.9;letter-spacing:-4px;text-transform:uppercase;">SIGN<br/>INTO<br/><span style="color:#B90E0A;-webkit-text-stroke:2px #B90E0A;-webkit-text-fill-color:transparent;">YOUR</span><br/>ERP.</h1>' +
                '<p style="font-size:15px;color:#888;margin:32px 0 0;max-width:340px;line-height:1.7;">The enterprise resource planning system for all Bench Apparel operations across the Philippines.</p>' +
                '</div>' +
                '<div style="background:#fafaf8;padding:60px;display:flex;flex-direction:column;justify-content:center;">' +
                '<div style="margin-bottom:40px;">' +
                '<div style="font-size:24px;font-weight:800;color:#1a1a1a;margin-bottom:6px;">Hello.</div>' +
                '<div style="font-size:14px;color:#aaa;">Enter your credentials below</div>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<label style="display:block;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">Email</label>' +
                '<input type="email" placeholder="ex. ADMIN-001" style="width:100%;padding:14px 0;border:none;border-bottom:2px solid #1a1a1a;background:transparent;font-size:16px;font-weight:500;color:#1a1a1a;outline:none;box-sizing:border-box;transition:border-color .2s;" onfocus="this.style.borderColor=\'#B90E0A\'" onblur="this.style.borderColor=\'#1a1a1a\'"/>' +
                '</div>' +
                '<div style="margin-bottom:36px;">' +
                '<label style="display:block;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">Password</label>' +
                '<input type="password" placeholder="••••••••" style="width:100%;padding:14px 0;border:none;border-bottom:2px solid #1a1a1a;background:transparent;font-size:16px;font-weight:500;color:#1a1a1a;outline:none;box-sizing:border-box;" />' +
                '</div>' +
                '<button style="width:100%;padding:18px;background:#1a1a1a;color:#fff;border:none;font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all .2s;" onmouseover="this.style.background=\'#B90E0A\'" onmouseout="this.style.background=\'#1a1a1a\'">ENTER</button>' +
                '<a href="#" style="display:block;text-align:center;margin-top:20px;font-size:12px;color:#aaa;text-decoration:none;letter-spacing:1px;">RESET PASSWORD</a>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-sidebar-brand',
            label: 'Login: Brand Sidebar',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;display:flex;font-family:\'Helvetica Neue\',sans-serif;">' +
                '<div style="width:80px;background:#B90E0A;display:flex;flex-direction:column;align-items:center;padding:28px 0;gap:0;flex-shrink:0;">' +
                '<div style="width:44px;height:44px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:auto;">' +
                '<span style="color:#fff;font-weight:900;font-size:18px;">B</span></div>' +
                '<div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:600;">Bench Apparel</div>' +
                '<div style="margin-top:auto;width:32px;height:32px;background:rgba(255,255,255,0.15);border-radius:50%;"></div>' +
                '</div>' +
                '<div style="flex:1;background:#0f0f0f;display:flex;align-items:center;justify-content:center;padding:60px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(185,14,10,0.12) 0%,transparent 70%);pointer-events:none;"></div>' +
                '<div style="width:100%;max-width:380px;position:relative;z-index:1;">' +
                '<div style="margin-bottom:40px;">' +
                '<h1 style="font-size:32px;font-weight:700;color:#fff;margin:0 0 8px;letter-spacing:-0.5px;">Access Dashboard</h1>' +
                '<p style="font-size:14px;color:rgba(255,255,255,0.4);margin:0;">Enter your credentials to continue to Bench ERP</p>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">' +
                '<div style="margin-bottom:16px;">' +
                '<label style="display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:8px;">Email Address</label>' +
                '<input type="email" placeholder="admin@bench.com.ph" style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;outline:none;box-sizing:border-box;transition:border-color .2s;" onfocus="this.style.borderColor=\'rgba(185,14,10,0.6)\'" onblur="this.style.borderColor=\'rgba(255,255,255,0.1)\'"/>' +
                '</div>' +
                '<div style="margin-bottom:24px;">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
                '<label style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);">Password</label>' +
                '<a href="#" style="font-size:11px;color:#B90E0A;text-decoration:none;letter-spacing:1px;">RESET</a>' +
                '</div>' +
                '<input type="password" placeholder="••••••••" style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;outline:none;box-sizing:border-box;" />' +
                '</div>' +
                '<button style="width:100%;padding:14px;background:#B90E0A;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:1px;text-transform:uppercase;transition:opacity .2s;" onmouseover="this.style.opacity=\'0.9\'" onmouseout="this.style.opacity=\'1\'">Sign In</button>' +
                '</div>' +
                '<div style="margin-top:24px;display:flex;align-items:center;gap:8px;">' +
                '<div style="width:8px;height:8px;background:#22c55e;border-radius:50%;box-shadow:0 0 8px #22c55e;"></div>' +
                '<span style="font-size:12px;color:rgba(255,255,255,0.3);">All systems operational</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-retro',
            label: 'Login: Retro Warm',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:#f5e6d0;display:flex;align-items:center;justify-content:center;font-family:\'Georgia\',serif;padding:40px;box-sizing:border-box;">' +
                '<div style="width:100%;max-width:440px;">' +
                '<div style="background:#1a0f0a;border-radius:4px;overflow:hidden;box-shadow:0 32px 80px rgba(26,15,10,0.4);">' +
                '<div style="background:#B90E0A;padding:32px 40px;text-align:center;position:relative;">' +
                '<div style="position:absolute;inset:0;opacity:0.1;background-image:repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.5) 10px,rgba(255,255,255,0.5) 11px);"></div>' +
                '<div style="position:relative;">' +
                '<div style="display:inline-block;border:3px solid rgba(255,255,255,0.4);padding:6px 20px;margin-bottom:12px;">' +
                '<span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:6px;text-transform:uppercase;">BENCH</span>' +
                '</div>' +
                '<div style="font-size:10px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:4px;">Enterprise Resource Planning</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:40px;">' +
                '<div style="text-align:center;margin-bottom:32px;">' +
                '<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8a6a50;margin-bottom:8px;">Welcome Back</div>' +
                '<div style="width:40px;height:1px;background:#8a6a50;margin:0 auto;"></div>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<label style="display:block;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#8a6a50;margin-bottom:8px;">Email Address</label>' +
                '<input type="email" placeholder="your@bench.com" style="width:100%;padding:13px 16px;background:#2a1a10;border:1px solid #3a2a1a;color:#f5e6d0;font-size:14px;outline:none;font-family:\'Georgia\',serif;box-sizing:border-box;transition:border-color .2s;" onfocus="this.style.borderColor=\'#B90E0A\'" onblur="this.style.borderColor=\'#3a2a1a\'"/>' +
                '</div>' +
                '<div style="margin-bottom:28px;">' +
                '<label style="display:block;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#8a6a50;margin-bottom:8px;">Password</label>' +
                '<input type="password" placeholder="••••••••" style="width:100%;padding:13px 16px;background:#2a1a10;border:1px solid #3a2a1a;color:#f5e6d0;font-size:14px;outline:none;font-family:\'Georgia\',serif;box-sizing:border-box;" />' +
                '</div>' +
                '<button style="width:100%;padding:15px;background:#B90E0A;color:#fff;border:none;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;cursor:pointer;font-family:\'Georgia\',serif;transition:all .2s;box-shadow:0 4px 16px rgba(185,14,10,0.3);" onmouseover="this.style.background=\'#8a0a07\'" onmouseout="this.style.background=\'#B90E0A\'">Sign In</button>' +
                '<div style="text-align:center;margin-top:20px;">' +
                '<a href="#" style="font-size:12px;color:#8a6a50;text-decoration:none;letter-spacing:1px;">Forgot your password?</a>' +
                '</div>' +
                '<div style="margin-top:32px;padding-top:24px;border-top:1px solid #2a1a10;text-align:center;">' +
                '<div style="font-size:10px;letter-spacing:2px;color:#4a3a2a;text-transform:uppercase;">Bench Apparel Corporation &mdash; All Rights Reserved</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'login-centered-clean',
            label: 'Login: Clean Centered',
            category: 'Login Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:\'Helvetica Neue\',Arial,sans-serif;padding:40px;box-sizing:border-box;">' +
                '<div style="text-align:center;margin-bottom:40px;">' +
                '<div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#B90E0A;border-radius:16px;margin-bottom:16px;box-shadow:0 8px 24px rgba(185,14,10,0.25);">' +
                '<span style="color:#fff;font-weight:900;font-size:22px;">B</span></div>' +
                '<h1 style="font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 4px;">Bench Apparel ERP</h1>' +
                '<p style="font-size:13px;color:#aaa;margin:0;">Sign in to your workspace</p>' +
                '</div>' +
                '<div style="width:100%;max-width:380px;background:#fff;border-radius:16px;padding:36px;box-shadow:0 4px 24px rgba(0,0,0,0.07),0 1px 4px rgba(0,0,0,0.04);">' +
                '<div style="margin-bottom:16px;">' +
                '<label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:6px;">Email address</label>' +
                '<input type="email" placeholder="admin@bench.com" style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;color:#1a1a1a;outline:none;box-sizing:border-box;background:#fff;transition:border-color .15s;" onfocus="this.style.borderColor=\'#B90E0A\'" onblur="this.style.borderColor=\'#e5e7eb\'"/>' +
                '</div>' +
                '<div style="margin-bottom:8px;">' +
                '<label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:6px;">Password</label>' +
                '<input type="password" placeholder="••••••••" style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;color:#1a1a1a;outline:none;box-sizing:border-box;background:#fff;" />' +
                '</div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">' +
                '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;">' +
                '<input type="checkbox" style="accent-color:#B90E0A;width:14px;height:14px;"/>' +
                '<span style="font-size:12px;color:#6b7280;">Remember me</span>' +
                '</label>' +
                '<a href="#" style="font-size:12px;color:#B90E0A;text-decoration:none;font-weight:500;">Forgot password?</a>' +
                '</div>' +
                '<button style="width:100%;padding:12px;background:#B90E0A;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s;" onmouseover="this.style.background=\'#a00d09\'" onmouseout="this.style.background=\'#B90E0A\'">Sign in</button>' +
                '</div>' +
                '<div style="margin-top:24px;text-align:center;">' +
                '<div style="display:flex;align-items:center;justify-content:center;gap:6px;">' +
                '<div style="width:6px;height:6px;background:#22c55e;border-radius:50%;"></div>' +
                '<span style="font-size:12px;color:#9ca3af;">Secure connection established</span>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },


        // ── PRINTABLE TEMPLATES ──────────────────────────────────────────

        {
            id: 'print-simple-invoice',
            label: 'Print: Simple Invoice',
            category: 'Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#fff;padding:60px;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#1a1a1a;margin:0 auto;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;">' +
                '<div>' +
                '<div style="font-size:32px;font-weight:800;color:#1a1a1a;letter-spacing:1px;">BENCH</div>' +
                '<div style="font-size:11px;color:#999;letter-spacing:1px;margin-top:2px;">APPAREL CORPORATION</div>' +
                '<div style="margin-top:16px;font-size:12px;color:#666;line-height:1.8;">' +
                '123 Bench Avenue, Makati City<br/>Metro Manila, Philippines 1200<br/>+63 2 8888 0000' +
                '</div>' +
                '</div>' +
                '<div style="text-align:right;">' +
                '<div style="font-size:28px;font-weight:300;color:#999;letter-spacing:4px;text-transform:uppercase;">INVOICE</div>' +
                '<div style="margin-top:12px;font-size:12px;color:#666;line-height:2;">' +
                '<div><span style="color:#999;">Invoice No: </span><strong>#INV-2026-0042</strong></div>' +
                '<div><span style="color:#999;">Date: </span><strong>March 4, 2026</strong></div>' +
                '<div><span style="color:#999;">Due Date: </span><strong>March 18, 2026</strong></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="height:1px;background:#e5e5e5;margin-bottom:32px;"></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:40px;">' +
                '<div>' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:8px;">Bill To</div>' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Maria Santos</div>' +
                '<div style="font-size:12px;color:#666;line-height:1.8;">45 Rizal Street, Quezon City<br/>Metro Manila 1100<br/>maria.santos@email.com</div>' +
                '</div>' +
                '<div>' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;margin-bottom:8px;">Ship To</div>' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Same as billing</div>' +
                '<div style="font-size:12px;color:#666;line-height:1.8;">45 Rizal Street, Quezon City<br/>Metro Manila 1100</div>' +
                '</div>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;margin-bottom:32px;">' +
                '<thead><tr style="background:#f8f8f8;border-bottom:2px solid #e5e5e5;">' +
                '<th style="padding:12px 16px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:600;">Description</th>' +
                '<th style="padding:12px 16px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:600;">Qty</th>' +
                '<th style="padding:12px 16px;text-align:right;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:600;">Unit Price</th>' +
                '<th style="padding:12px 16px;text-align:right;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:600;">Total</th>' +
                '</tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:14px 16px;font-size:13px;">Classic Polo Shirt (White, L)</td><td style="padding:14px 16px;text-align:center;font-size:13px;color:#666;">3</td><td style="padding:14px 16px;text-align:right;font-size:13px;color:#666;">PHP 899</td><td style="padding:14px 16px;text-align:right;font-size:13px;font-weight:600;">PHP 2,697</td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:14px 16px;font-size:13px;">Slim Fit Chinos (Navy, 32)</td><td style="padding:14px 16px;text-align:center;font-size:13px;color:#666;">2</td><td style="padding:14px 16px;text-align:right;font-size:13px;color:#666;">PHP 1,299</td><td style="padding:14px 16px;text-align:right;font-size:13px;font-weight:600;">PHP 2,598</td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:14px 16px;font-size:13px;">Casual T-Shirt (Black, M)</td><td style="padding:14px 16px;text-align:center;font-size:13px;color:#666;">5</td><td style="padding:14px 16px;text-align:right;font-size:13px;color:#666;">PHP 499</td><td style="padding:14px 16px;text-align:right;font-size:13px;font-weight:600;">PHP 2,495</td></tr>' +
                '</tbody>' +
                '</table>' +
                '<div style="display:flex;justify-content:flex-end;margin-bottom:40px;">' +
                '<div style="width:240px;">' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;"><span style="color:#666;">Subtotal</span><span>PHP 7,790</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;"><span style="color:#666;">VAT (12%)</span><span>PHP 934.80</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:12px 0;font-size:15px;font-weight:700;"><span>Total</span><span>PHP 8,724.80</span></div>' +
                '</div>' +
                '</div>' +
                '<div style="height:1px;background:#e5e5e5;margin-bottom:24px;"></div>' +
                '<div style="font-size:11px;color:#aaa;line-height:1.8;text-align:center;">Thank you for your business. Payment is due within 14 days.<br/>For inquiries, contact accounts@bench.com.ph</div>' +
                '</div>';
            })()
        },

        {
            id: 'print-simple-report',
            label: 'Print: Simple Report',
            category: 'Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#fff;padding:60px;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#1a1a1a;margin:0 auto;">' +
                '<div style="border-bottom:2px solid #1a1a1a;padding-bottom:24px;margin-bottom:36px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-end;">' +
                '<div>' +
                '<div style="font-size:11px;color:#999;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Bench Apparel Corporation</div>' +
                '<h1 style="font-size:28px;font-weight:700;color:#1a1a1a;margin:0;">Monthly Sales Report</h1>' +
                '</div>' +
                '<div style="text-align:right;font-size:12px;color:#666;line-height:1.8;">' +
                '<div>Period: February 2026</div><div>Generated: March 4, 2026</div><div>Branch: All Branches</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:36px;">' +
                '<div style="background:#f8f8f8;padding:16px;border-left:3px solid #1a1a1a;"><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Total Revenue</div><div style="font-size:20px;font-weight:700;">PHP 4.2M</div><div style="font-size:11px;color:#666;margin-top:4px;">+12.4% vs Jan</div></div>' +
                '<div style="background:#f8f8f8;padding:16px;border-left:3px solid #555;"><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Orders</div><div style="font-size:20px;font-weight:700;">8,420</div><div style="font-size:11px;color:#666;margin-top:4px;">+8.1% vs Jan</div></div>' +
                '<div style="background:#f8f8f8;padding:16px;border-left:3px solid #888;"><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Avg Order</div><div style="font-size:20px;font-weight:700;">PHP 499</div><div style="font-size:11px;color:#666;margin-top:4px;">+3.2% vs Jan</div></div>' +
                '<div style="background:#f8f8f8;padding:16px;border-left:3px solid #bbb;"><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Returns</div><div style="font-size:20px;font-weight:700;">142</div><div style="font-size:11px;color:#666;margin-top:4px;">1.7% return rate</div></div>' +
                '</div>' +
                '<h3 style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#666;margin:0 0 12px;">Branch Performance</h3>' +
                '<table style="width:100%;border-collapse:collapse;margin-bottom:32px;font-size:13px;">' +
                '<thead><tr style="border-bottom:2px solid #1a1a1a;"><th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;">Branch</th><th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;">Revenue</th><th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;">Orders</th><th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;">Growth</th><th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#999;">Status</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:11px 12px;font-weight:600;">SM Mall of Asia</td><td style="padding:11px 12px;text-align:right;">PHP 1,200,000</td><td style="padding:11px 12px;text-align:right;">2,140</td><td style="padding:11px 12px;text-align:right;color:#16a34a;">+18%</td><td style="padding:11px 12px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;">ABOVE TARGET</span></td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:11px 12px;font-weight:600;">BGC High Street</td><td style="padding:11px 12px;text-align:right;">PHP 980,000</td><td style="padding:11px 12px;text-align:right;">1,860</td><td style="padding:11px 12px;text-align:right;color:#16a34a;">+9%</td><td style="padding:11px 12px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;">ABOVE TARGET</span></td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:11px 12px;font-weight:600;">Cebu IT Park</td><td style="padding:11px 12px;text-align:right;">PHP 750,000</td><td style="padding:11px 12px;text-align:right;">1,420</td><td style="padding:11px 12px;text-align:right;color:#ca8a04;">+2%</td><td style="padding:11px 12px;"><span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;">ON TARGET</span></td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:11px 12px;font-weight:600;">Davao Abreeza</td><td style="padding:11px 12px;text-align:right;">PHP 620,000</td><td style="padding:11px 12px;text-align:right;">1,180</td><td style="padding:11px 12px;text-align:right;color:#16a34a;">+14%</td><td style="padding:11px 12px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;">ABOVE TARGET</span></td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:11px 12px;font-weight:600;">Online Store</td><td style="padding:11px 12px;text-align:right;">PHP 650,000</td><td style="padding:11px 12px;text-align:right;">1,820</td><td style="padding:11px 12px;text-align:right;color:#16a34a;">+34%</td><td style="padding:11px 12px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;">ABOVE TARGET</span></td></tr>' +
                '</tbody></table>' +
                '<div style="border-top:1px solid #e5e5e5;padding-top:20px;display:flex;justify-content:space-between;font-size:11px;color:#aaa;">' +
                '<span>Bench Apparel Corporation &mdash; Confidential</span><span>Page 1 of 1</span>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'print-simple-memo',
            label: 'Print: Simple Memo',
            category: 'Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#fff;padding:72px;box-sizing:border-box;font-family:\'Georgia\',\'Times New Roman\',serif;color:#1a1a1a;margin:0 auto;">' +
                '<div style="text-align:center;margin-bottom:48px;">' +
                '<div style="font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#1a1a1a;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:4px;">BENCH APPAREL CORPORATION</div>' +
                '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;font-family:\'Helvetica Neue\',sans-serif;">Internal Memorandum</div>' +
                '<div style="width:60px;height:2px;background:#1a1a1a;margin:16px auto 0;"></div>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;margin-bottom:40px;font-size:13px;">' +
                '<tr style="border-bottom:1px solid #e5e5e5;"><td style="padding:10px 0;font-family:\'Helvetica Neue\',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;width:100px;">TO:</td><td style="padding:10px 0;font-weight:600;">All Branch Managers, Regional Directors</td></tr>' +
                '<tr style="border-bottom:1px solid #e5e5e5;"><td style="padding:10px 0;font-family:\'Helvetica Neue\',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;">FROM:</td><td style="padding:10px 0;font-weight:600;">Office of the President, Bench Apparel Corp.</td></tr>' +
                '<tr style="border-bottom:1px solid #e5e5e5;"><td style="padding:10px 0;font-family:\'Helvetica Neue\',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;">DATE:</td><td style="padding:10px 0;">March 4, 2026</td></tr>' +
                '<tr style="border-bottom:1px solid #e5e5e5;"><td style="padding:10px 0;font-family:\'Helvetica Neue\',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;">RE:</td><td style="padding:10px 0;font-weight:600;">Q1 2026 Performance Review &amp; Q2 Targets</td></tr>' +
                '</table>' +
                '<div style="font-size:14px;line-height:2;color:#333;margin-bottom:28px;">' +
                '<p style="margin:0 0 20px;">This memorandum serves to communicate the results of our first quarter performance review and to outline the strategic targets for the second quarter of fiscal year 2026.</p>' +
                '<p style="margin:0 0 20px;">We are pleased to report that overall revenue for Q1 2026 reached <strong>PHP 12.6 million</strong>, representing a <strong>14.2% increase</strong> over the same period last year. This achievement reflects the continued dedication of our teams across all branches and departments.</p>' +
                '<p style="margin:0 0 20px;">The following directives are effective immediately and must be acknowledged by all receiving parties no later than March 15, 2026:</p>' +
                '</div>' +
                '<ol style="font-size:14px;line-height:2;color:#333;margin:0 0 28px;padding-left:24px;">' +
                '<li style="margin-bottom:12px;">All branch managers are required to submit their Q2 target proposals through the ERP system by March 20, 2026.</li>' +
                '<li style="margin-bottom:12px;">Inventory reconciliation must be completed and verified before end of business on March 31, 2026.</li>' +
                '<li style="margin-bottom:12px;">Staff performance evaluations for Q1 are due in HR no later than March 25, 2026.</li>' +
                '</ol>' +
                '<div style="font-size:14px;line-height:2;color:#333;margin-bottom:60px;">' +
                '<p style="margin:0;">Should you have any questions regarding this memorandum, please direct your inquiries to your respective regional director or contact the Office of the President directly.</p>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;">' +
                '<div><div style="border-top:1px solid #1a1a1a;padding-top:12px;font-size:12px;"><div style="font-weight:700;">Prepared by</div><div style="color:#666;margin-top:4px;">Operations Department</div></div></div>' +
                '<div><div style="border-top:1px solid #1a1a1a;padding-top:12px;font-size:12px;"><div style="font-weight:700;">Approved by</div><div style="color:#666;margin-top:4px;">Office of the President</div></div></div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'print-creative-invoice',
            label: 'Print: Creative Invoice',
            category: 'Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#fff;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#1a1a1a;margin:0 auto;overflow:hidden;">' +
                '<div style="background:#B90E0A;padding:48px 56px 40px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>' +
                '<div style="position:absolute;bottom:-80px;right:120px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>' +
                '<div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div>' +
                '<div style="font-size:36px;font-weight:900;color:#fff;letter-spacing:2px;line-height:1;">BENCH</div>' +
                '<div style="font-size:10px;color:rgba(255,255,255,0.6);letter-spacing:3px;margin-top:4px;">APPAREL CORPORATION</div>' +
                '</div>' +
                '<div style="text-align:right;">' +
                '<div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:4px;">INVOICE</div>' +
                '<div style="font-size:32px;font-weight:300;color:#fff;margin-top:4px;">#0042</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:32px;">' +
                '<div><div style="font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Issue Date</div><div style="font-size:13px;color:#fff;font-weight:600;">March 4, 2026</div></div>' +
                '<div><div style="font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Due Date</div><div style="font-size:13px;color:#fff;font-weight:600;">March 18, 2026</div></div>' +
                '<div><div style="font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Amount Due</div><div style="font-size:13px;color:#fff;font-weight:700;">PHP 8,724.80</div></div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:40px 56px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:36px;">' +
                '<div style="background:#f8f8f8;padding:20px;border-radius:4px;">' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:10px;font-weight:700;">Billed To</div>' +
                '<div style="font-size:14px;font-weight:700;margin-bottom:4px;">Maria Santos</div>' +
                '<div style="font-size:12px;color:#666;line-height:1.8;">45 Rizal Street<br/>Quezon City, Metro Manila<br/>maria@email.com</div>' +
                '</div>' +
                '<div style="background:#f8f8f8;padding:20px;border-radius:4px;">' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:10px;font-weight:700;">From</div>' +
                '<div style="font-size:14px;font-weight:700;margin-bottom:4px;">Bench Apparel Corp.</div>' +
                '<div style="font-size:12px;color:#666;line-height:1.8;">123 Bench Ave, Makati<br/>Metro Manila 1200<br/>accounts@bench.com.ph</div>' +
                '</div>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;margin-bottom:28px;">' +
                '<thead><tr style="border-bottom:2px solid #1a1a1a;">' +
                '<th style="padding:10px 0;text-align:left;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:600;">Item</th>' +
                '<th style="padding:10px 0;text-align:center;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:600;">Qty</th>' +
                '<th style="padding:10px 0;text-align:right;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:600;">Rate</th>' +
                '<th style="padding:10px 0;text-align:right;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#999;font-weight:600;">Amount</th>' +
                '</tr></thead><tbody>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:14px 0;"><div style="font-size:13px;font-weight:600;">Classic Polo Shirt</div><div style="font-size:11px;color:#999;margin-top:2px;">White, Size L</div></td><td style="padding:14px 0;text-align:center;font-size:13px;color:#666;">3</td><td style="padding:14px 0;text-align:right;font-size:13px;color:#666;">PHP 899</td><td style="padding:14px 0;text-align:right;font-size:13px;font-weight:700;">PHP 2,697</td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:14px 0;"><div style="font-size:13px;font-weight:600;">Slim Fit Chinos</div><div style="font-size:11px;color:#999;margin-top:2px;">Navy, Size 32</div></td><td style="padding:14px 0;text-align:center;font-size:13px;color:#666;">2</td><td style="padding:14px 0;text-align:right;font-size:13px;color:#666;">PHP 1,299</td><td style="padding:14px 0;text-align:right;font-size:13px;font-weight:700;">PHP 2,598</td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:14px 0;"><div style="font-size:13px;font-weight:600;">Casual T-Shirt</div><div style="font-size:11px;color:#999;margin-top:2px;">Black, Size M</div></td><td style="padding:14px 0;text-align:center;font-size:13px;color:#666;">5</td><td style="padding:14px 0;text-align:right;font-size:13px;color:#666;">PHP 499</td><td style="padding:14px 0;text-align:right;font-size:13px;font-weight:700;">PHP 2,495</td></tr>' +
                '</tbody></table>' +
                '<div style="display:grid;grid-template-columns:1fr auto;gap:32px;align-items:end;">' +
                '<div style="font-size:12px;color:#aaa;line-height:1.8;padding-right:32px;">Payment is due within 14 days of invoice date. Please reference invoice number on all payments. Bank transfer details available upon request.</div>' +
                '<div style="background:#1a1a1a;color:#fff;padding:24px 28px;min-width:200px;">' +
                '<div style="display:flex;justify-content:space-between;gap:24px;font-size:12px;margin-bottom:8px;color:#999;"><span>Subtotal</span><span>PHP 7,790</span></div>' +
                '<div style="display:flex;justify-content:space-between;gap:24px;font-size:12px;margin-bottom:16px;color:#999;padding-bottom:12px;border-bottom:1px solid #333;"><span>VAT 12%</span><span>PHP 934.80</span></div>' +
                '<div style="display:flex;justify-content:space-between;gap:24px;font-size:16px;font-weight:700;"><span>TOTAL</span><span>PHP 8,724.80</span></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'print-creative-id',
            label: 'Print: ID Card Sheet',
            category: 'Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#f0f0f0;padding:48px;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;margin:0 auto;">' +
                '<div style="text-align:center;margin-bottom:32px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;">Bench Apparel Corporation &mdash; Employee ID Cards &mdash; Print Sheet</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">' +
                '<div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.12);">' +
                '<div style="background:linear-gradient(135deg,#B90E0A,#6b0806);padding:20px 20px 40px;position:relative;">' +
                '<div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.08);"></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div><div style="font-size:14px;font-weight:900;color:#fff;letter-spacing:2px;">BENCH</div><div style="font-size:8px;color:rgba(255,255,255,0.6);letter-spacing:1px;">APPAREL CORP.</div></div>' +
                '<div style="font-size:8px;background:rgba(255,255,255,0.2);color:#fff;padding:3px 8px;border-radius:3px;letter-spacing:1px;">EMPLOYEE</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:0 20px 20px;margin-top:-24px;position:relative;">' +
                '<div style="width:52px;height:52px;background:#e5e5e5;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);margin-bottom:10px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#999;">MS</div>' +
                '<div style="font-size:15px;font-weight:700;color:#1a1a1a;">Maria Santos</div>' +
                '<div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:2px;">Senior Sales Associate</div>' +
                '<div style="font-size:10px;color:#999;margin-top:2px;">SM Mall of Asia Branch</div>' +
                '<div style="margin-top:12px;display:flex;justify-content:space-between;font-size:9px;color:#aaa;border-top:1px solid #f0f0f0;padding-top:10px;">' +
                '<span>ID: BA-2021-0042</span><span>Valid: 2026</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.12);">' +
                '<div style="background:linear-gradient(135deg,#1a1a1a,#333);padding:20px 20px 40px;position:relative;">' +
                '<div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div><div style="font-size:14px;font-weight:900;color:#fff;letter-spacing:2px;">BENCH</div><div style="font-size:8px;color:rgba(255,255,255,0.5);letter-spacing:1px;">APPAREL CORP.</div></div>' +
                '<div style="font-size:8px;background:rgba(185,14,10,0.8);color:#fff;padding:3px 8px;border-radius:3px;letter-spacing:1px;">MANAGER</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:0 20px 20px;margin-top:-24px;position:relative;">' +
                '<div style="width:52px;height:52px;background:#e5e5e5;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);margin-bottom:10px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#999;">JC</div>' +
                '<div style="font-size:15px;font-weight:700;color:#1a1a1a;">Juan dela Cruz</div>' +
                '<div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:2px;">Branch Manager</div>' +
                '<div style="font-size:10px;color:#999;margin-top:2px;">BGC High Street Branch</div>' +
                '<div style="margin-top:12px;display:flex;justify-content:space-between;font-size:9px;color:#aaa;border-top:1px solid #f0f0f0;padding-top:10px;">' +
                '<span>ID: BA-2019-0018</span><span>Valid: 2026</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.12);">' +
                '<div style="background:linear-gradient(135deg,#1e3a5f,#0f2040);padding:20px 20px 40px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div><div style="font-size:14px;font-weight:900;color:#fff;letter-spacing:2px;">BENCH</div><div style="font-size:8px;color:rgba(255,255,255,0.5);letter-spacing:1px;">APPAREL CORP.</div></div>' +
                '<div style="font-size:8px;background:rgba(255,255,255,0.15);color:#fff;padding:3px 8px;border-radius:3px;letter-spacing:1px;">EMPLOYEE</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:0 20px 20px;margin-top:-24px;">' +
                '<div style="width:52px;height:52px;background:#e5e5e5;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.15);margin-bottom:10px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#999;">AR</div>' +
                '<div style="font-size:15px;font-weight:700;color:#1a1a1a;">Ana Reyes</div>' +
                '<div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:2px;">Visual Merchandiser</div>' +
                '<div style="font-size:10px;color:#999;margin-top:2px;">Cebu IT Park Branch</div>' +
                '<div style="margin-top:12px;display:flex;justify-content:space-between;font-size:9px;color:#aaa;border-top:1px solid #f0f0f0;padding-top:10px;">' +
                '<span>ID: BA-2022-0071</span><span>Valid: 2026</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.12);display:flex;align-items:center;justify-content:center;border:2px dashed #ddd;">' +
                '<div style="text-align:center;padding:20px;color:#ccc;">' +
                '<div style="font-size:28px;margin-bottom:8px;">+</div>' +
                '<div style="font-size:11px;letter-spacing:1px;">Add Employee</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="text-align:center;margin-top:24px;font-size:10px;color:#aaa;letter-spacing:1px;">Cut along card edges &mdash; Laminate before issuing</div>' +
                '</div>';
            })()
        },

        {
            id: 'print-creative-certificate',
            label: 'Print: Certificate',
            category: 'Printable',
            content: (function(){
                return '<div style="width:794px;height:560px;background:#fff;box-sizing:border-box;font-family:\'Georgia\',serif;margin:0 auto;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;inset:16px;border:1px solid #d4a853;pointer-events:none;z-index:2;"></div>' +
                '<div style="position:absolute;inset:22px;border:3px solid #B90E0A;pointer-events:none;z-index:2;"></div>' +
                '<div style="position:absolute;top:16px;left:16px;width:60px;height:60px;border-right:1px solid #d4a853;border-bottom:1px solid #d4a853;pointer-events:none;z-index:3;"></div>' +
                '<div style="position:absolute;top:16px;right:16px;width:60px;height:60px;border-left:1px solid #d4a853;border-bottom:1px solid #d4a853;pointer-events:none;z-index:3;"></div>' +
                '<div style="position:absolute;bottom:16px;left:16px;width:60px;height:60px;border-right:1px solid #d4a853;border-top:1px solid #d4a853;pointer-events:none;z-index:3;"></div>' +
                '<div style="position:absolute;bottom:16px;right:16px;width:60px;height:60px;border-left:1px solid #d4a853;border-top:1px solid #d4a853;pointer-events:none;z-index:3;"></div>' +
                '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(185,14,10,0.04) 0%,transparent 60%);pointer-events:none;"></div>' +
                '<div style="position:relative;z-index:1;padding:56px 80px;text-align:center;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;">' +
                '<div style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:#B90E0A;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Bench Apparel Corporation</div>' +
                '<div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#999;margin-bottom:20px;font-family:\'Helvetica Neue\',sans-serif;">Proudly Presents This</div>' +
                '<h1 style="font-size:36px;font-weight:400;color:#1a1a1a;margin:0 0 6px;letter-spacing:2px;">Certificate of Achievement</h1>' +
                '<div style="width:80px;height:2px;background:linear-gradient(90deg,transparent,#d4a853,transparent);margin:16px auto;"></div>' +
                '<div style="font-size:13px;color:#888;margin-bottom:12px;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">This certificate is proudly awarded to</div>' +
                '<h2 style="font-size:40px;font-weight:400;color:#B90E0A;margin:0 0 4px;letter-spacing:1px;font-style:italic;">Maria Santos</h2>' +
                '<div style="width:200px;height:1px;background:#d4a853;margin:12px auto;"></div>' +
                '<p style="font-size:13px;color:#555;line-height:1.8;margin:0 0 28px;max-width:460px;margin-left:auto;margin-right:auto;">In recognition of outstanding sales performance and exceptional dedication to customer service excellence during the First Quarter of 2026</p>' +
                '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:20px;align-items:end;margin-top:8px;">' +
                '<div><div style="border-top:1px solid #1a1a1a;padding-top:8px;font-size:11px;color:#999;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">Branch Manager</div></div>' +
                '<div style="text-align:center;"><div style="width:52px;height:52px;background:linear-gradient(135deg,#B90E0A,#6b0806);border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:18px;letter-spacing:1px;">B</span></div></div>' +
                '<div><div style="border-top:1px solid #1a1a1a;padding-top:8px;font-size:11px;color:#999;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">Regional Director</div></div>' +
                '</div>' +
                '<div style="font-size:10px;color:#ccc;margin-top:16px;letter-spacing:2px;font-family:\'Helvetica Neue\',sans-serif;">MARCH 2026 &mdash; NO. CRT-2026-0042</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'print-modern-payslip',
            label: 'Print: Modern Payslip',
            category: 'Printable',
            content: (function(){
                return '<div style="width:794px;min-height:560px;background:#fff;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;margin:0 auto;overflow:hidden;">' +
                '<div style="display:grid;grid-template-columns:280px 1fr;">' +
                '<div style="background:#1a1a1a;padding:40px 32px;min-height:560px;">' +
                '<div style="margin-bottom:36px;">' +
                '<div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:2px;">BENCH</div>' +
                '<div style="font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:2px;margin-top:2px;">APPAREL CORPORATION</div>' +
                '</div>' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:16px;font-weight:700;">Employee Details</div>' +
                '<div style="margin-bottom:8px;"><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;">Full Name</div><div style="font-size:13px;font-weight:600;color:#fff;">Maria Santos</div></div>' +
                '<div style="margin-bottom:8px;"><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;">Employee ID</div><div style="font-size:13px;color:#fff;">BA-2021-0042</div></div>' +
                '<div style="margin-bottom:8px;"><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;">Position</div><div style="font-size:13px;color:#fff;">Senior Sales Associate</div></div>' +
                '<div style="margin-bottom:8px;"><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;">Department</div><div style="font-size:13px;color:#fff;">Retail Operations</div></div>' +
                '<div style="margin-bottom:8px;"><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;">Branch</div><div style="font-size:13px;color:#fff;">SM Mall of Asia</div></div>' +
                '<div style="height:1px;background:rgba(255,255,255,0.1);margin:24px 0;"></div>' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:16px;font-weight:700;">Pay Period</div>' +
                '<div style="margin-bottom:8px;"><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;">Period</div><div style="font-size:13px;color:#fff;">February 2026</div></div>' +
                '<div style="margin-bottom:8px;"><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;">Pay Date</div><div style="font-size:13px;color:#fff;">March 5, 2026</div></div>' +
                '<div style="margin-bottom:8px;"><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;">Days Worked</div><div style="font-size:13px;color:#fff;">23 of 24 days</div></div>' +
                '</div>' +
                '<div style="padding:40px 40px 40px 36px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">' +
                '<h1 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0;text-transform:uppercase;letter-spacing:1px;">Payslip</h1>' +
                '<div style="font-size:11px;color:#aaa;letter-spacing:1px;">Ref: PS-2026-02-0042</div>' +
                '</div>' +
                '<div style="background:#f8f8f8;padding:20px;border-radius:8px;margin-bottom:20px;">' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:12px;font-weight:700;">Earnings</div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="color:#555;">Basic Salary</span><span style="font-weight:600;">PHP 18,000</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="color:#555;">Sales Commission</span><span style="font-weight:600;">PHP 4,200</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="color:#555;">Transportation Allowance</span><span style="font-weight:600;">PHP 1,500</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;"><span style="color:#555;">Meal Allowance</span><span style="font-weight:600;">PHP 800</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:10px 0 0;border-top:2px solid #e0e0e0;margin-top:4px;font-size:14px;font-weight:700;"><span>Total Earnings</span><span>PHP 24,500</span></div>' +
                '</div>' +
                '<div style="background:#f8f8f8;padding:20px;border-radius:8px;margin-bottom:20px;">' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#1a1a1a;margin-bottom:12px;font-weight:700;">Deductions</div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="color:#555;">SSS Contribution</span><span style="font-weight:600;color:#dc2626;">PHP 900</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="color:#555;">PhilHealth</span><span style="font-weight:600;color:#dc2626;">PHP 400</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;"><span style="color:#555;">Pag-IBIG</span><span style="font-weight:600;color:#dc2626;">PHP 200</span></div>' +
                '<div style="display:flex;justify-content:space-between;padding:10px 0 0;border-top:2px solid #e0e0e0;margin-top:4px;font-size:14px;font-weight:700;"><span>Total Deductions</span><span style="color:#dc2626;">PHP 1,500</span></div>' +
                '</div>' +
                '<div style="background:#B90E0A;padding:20px 24px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:4px;">Net Take-Home Pay</div><div style="font-size:24px;font-weight:800;color:#fff;">PHP 23,000</div></div>' +
                '<div style="text-align:right;font-size:11px;color:rgba(255,255,255,0.6);line-height:1.8;"><div>BDO Savings Account</div><div>****-****-4291</div></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'print-modern-report',
            label: 'Print: Modern Dashboard Report',
            category: 'Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#0f0f0f;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;margin:0 auto;color:#fff;padding:48px;overflow:hidden;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;">' +
                '<div>' +
                '<div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:8px;">Bench Apparel Corporation</div>' +
                '<h1 style="font-size:32px;font-weight:800;color:#fff;margin:0;letter-spacing:-1px;">Executive Summary</h1>' +
                '<p style="font-size:13px;color:rgba(255,255,255,0.4);margin:6px 0 0;">February 2026 &mdash; All Branches</p>' +
                '</div>' +
                '<div style="text-align:right;">' +
                '<div style="display:inline-block;background:#B90E0A;color:#fff;padding:6px 16px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Confidential</div>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:8px;">Generated March 4, 2026</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px;">' +
                '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;">' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;">Total Revenue</div>' +
                '<div style="font-size:24px;font-weight:700;color:#fff;">PHP 4.2M</div>' +
                '<div style="font-size:11px;color:#22c55e;margin-top:6px;">+12.4%</div>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;">' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;">Total Orders</div>' +
                '<div style="font-size:24px;font-weight:700;color:#fff;">8,420</div>' +
                '<div style="font-size:11px;color:#22c55e;margin-top:6px;">+8.1%</div>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:20px;">' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;">Avg Order</div>' +
                '<div style="font-size:24px;font-weight:700;color:#fff;">PHP 499</div>' +
                '<div style="font-size:11px;color:#22c55e;margin-top:6px;">+3.2%</div>' +
                '</div>' +
                '<div style="background:rgba(185,14,10,0.15);border:1px solid rgba(185,14,10,0.3);border-radius:8px;padding:20px;">' +
                '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;">Net Profit</div>' +
                '<div style="font-size:24px;font-weight:700;color:#fff;">PHP 1.1M</div>' +
                '<div style="font-size:11px;color:#22c55e;margin-top:6px;">+18.7%</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:24px;">' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;font-weight:600;">Branch Performance</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="font-size:12px;color:rgba(255,255,255,0.6);width:100px;flex-shrink:0;">SM MOA</div><div style="flex:1;background:rgba(255,255,255,0.08);border-radius:2px;height:6px;"><div style="background:#B90E0A;height:6px;border-radius:2px;width:88%;"></div></div><div style="font-size:11px;color:rgba(255,255,255,0.5);width:60px;text-align:right;flex-shrink:0;">PHP 1.2M</div></div>' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="font-size:12px;color:rgba(255,255,255,0.6);width:100px;flex-shrink:0;">BGC</div><div style="flex:1;background:rgba(255,255,255,0.08);border-radius:2px;height:6px;"><div style="background:#B90E0A;height:6px;border-radius:2px;width:72%;"></div></div><div style="font-size:11px;color:rgba(255,255,255,0.5);width:60px;text-align:right;flex-shrink:0;">PHP 980K</div></div>' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="font-size:12px;color:rgba(255,255,255,0.6);width:100px;flex-shrink:0;">Online</div><div style="flex:1;background:rgba(255,255,255,0.08);border-radius:2px;height:6px;"><div style="background:#22c55e;height:6px;border-radius:2px;width:48%;"></div></div><div style="font-size:11px;color:rgba(255,255,255,0.5);width:60px;text-align:right;flex-shrink:0;">PHP 650K</div></div>' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="font-size:12px;color:rgba(255,255,255,0.6);width:100px;flex-shrink:0;">Cebu</div><div style="flex:1;background:rgba(255,255,255,0.08);border-radius:2px;height:6px;"><div style="background:#f59e0b;height:6px;border-radius:2px;width:55%;"></div></div><div style="font-size:11px;color:rgba(255,255,255,0.5);width:60px;text-align:right;flex-shrink:0;">PHP 750K</div></div>' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="font-size:12px;color:rgba(255,255,255,0.6);width:100px;flex-shrink:0;">Davao</div><div style="flex:1;background:rgba(255,255,255,0.08);border-radius:2px;height:6px;"><div style="background:#3b82f6;height:6px;border-radius:2px;width:45%;"></div></div><div style="font-size:11px;color:rgba(255,255,255,0.5);width:60px;text-align:right;flex-shrink:0;">PHP 620K</div></div>' +
                '</div>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:24px;">' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;font-weight:600;">Top Products</div>' +
                '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);"><div><div style="font-size:12px;color:#fff;font-weight:600;">Classic Polo Shirt</div><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;">2,840 units sold</div></div><div style="font-size:13px;font-weight:700;color:#22c55e;">PHP 890K</div></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);"><div><div style="font-size:12px;color:#fff;font-weight:600;">Slim Fit Chinos</div><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;">1,620 units sold</div></div><div style="font-size:13px;font-weight:700;color:#22c55e;">PHP 640K</div></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.05);"><div><div style="font-size:12px;color:#fff;font-weight:600;">Casual T-Shirt</div><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;">2,100 units sold</div></div><div style="font-size:13px;font-weight:700;color:#22c55e;">PHP 510K</div></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:12px;color:#fff;font-weight:600;">Denim Jacket</div><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;">890 units sold</div></div><div style="font-size:13px;font-weight:700;color:#22c55e;">PHP 430K</div></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:20px;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:1px;">BENCH APPAREL CORPORATION &mdash; CONFIDENTIAL</span>' +
                '<div style="display:flex;gap:8px;align-items:center;"><div style="width:6px;height:6px;background:#B90E0A;border-radius:50%;"></div><span style="font-size:10px;color:rgba(255,255,255,0.2);">Page 1 of 1</span></div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'print-modern-letterhead',
            label: 'Print: Modern Letterhead',
            category: 'Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#fff;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;margin:0 auto;overflow:hidden;display:flex;flex-direction:column;">' +
                '<div style="display:grid;grid-template-columns:8px 1fr;height:8px;"><div style="background:#B90E0A;"></div><div style="background:#1a1a1a;"></div></div>' +
                '<div style="padding:40px 56px 28px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0f0f0;">' +
                '<div style="display:flex;align-items:center;gap:14px;">' +
                '<div style="width:48px;height:48px;background:#B90E0A;border-radius:10px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:20px;">B</span></div>' +
                '<div><div style="font-size:20px;font-weight:800;color:#1a1a1a;letter-spacing:2px;">BENCH</div><div style="font-size:9px;letter-spacing:2px;color:#999;text-transform:uppercase;margin-top:1px;">Apparel Corporation</div></div>' +
                '</div>' +
                '<div style="text-align:right;font-size:11px;color:#999;line-height:1.9;">' +
                '<div style="font-weight:600;color:#555;font-size:12px;">Head Office</div>' +
                '<div>123 Bench Avenue, Makati City</div>' +
                '<div>Metro Manila, Philippines 1200</div>' +
                '<div>+63 2 8888 0000</div>' +
                '<div>www.bench.com.ph</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:40px 56px;flex:1;">' +
                '<div style="font-size:12px;color:#999;margin-bottom:32px;line-height:1.8;">' +
                '<div>March 4, 2026</div>' +
                '<div style="margin-top:16px;font-size:13px;color:#1a1a1a;font-weight:600;">Maria Santos</div>' +
                '<div style="color:#666;">45 Rizal Street, Quezon City</div>' +
                '<div style="color:#666;">Metro Manila 1100</div>' +
                '</div>' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px;">Re: Q1 2026 Performance Recognition</div>' +
                '<div style="font-size:14px;line-height:2;color:#444;">' +
                '<p style="margin:0 0 18px;">Dear Ms. Santos,</p>' +
                '<p style="margin:0 0 18px;">We write to formally recognize your outstanding contribution to the growth and success of the SM Mall of Asia branch during the first quarter of fiscal year 2026. Your dedication to delivering exceptional customer service and consistently exceeding your monthly sales targets has not gone unnoticed.</p>' +
                '<p style="margin:0 0 18px;">Your sales figures for Q1 2026 placed you among the top five performers company-wide, achieving <strong>142% of your assigned quarterly target</strong>. This remarkable performance directly contributed to the branch surpassing its Q1 revenue goal by PHP 220,000.</p>' +
                '<p style="margin:0 0 18px;">In recognition of your achievement, the management is pleased to award you with the <strong>Q1 2026 Top Performer Award</strong> along with the corresponding incentive of <strong>PHP 15,000</strong>, which will be reflected in your March payslip.</p>' +
                '<p style="margin:0 0 36px;">We look forward to your continued excellence and wish you continued success in the coming quarters. Please do not hesitate to reach out to your branch manager should you have any questions.</p>' +
                '<p style="margin:0 0 6px;">Sincerely,</p>' +
                '<p style="margin:0 0 48px;color:#999;">Human Resources Department</p>' +
                '<div style="border-top:1px solid #1a1a1a;padding-top:12px;width:200px;">' +
                '<div style="font-size:13px;font-weight:700;">HR Director</div>' +
                '<div style="font-size:12px;color:#999;margin-top:2px;">Bench Apparel Corporation</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:20px 56px;border-top:1px solid #f0f0f0;display:grid;grid-template-columns:8px 1fr;gap:0;">' +
                '<div style="background:#B90E0A;"></div>' +
                '<div style="padding-left:16px;display:flex;justify-content:space-between;font-size:10px;color:#bbb;align-items:center;">' +
                '<span>BENCH APPAREL CORPORATION &mdash; OFFICIAL CORRESPONDENCE</span>' +
                '<span>Page 1</span>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },





        // ── CORPORATE / PROFESSIONAL LOGIN TEMPLATES ────────────────────

        {
            id: 'login-corp-classic',
            label: 'Login: Corporate Classic',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#f0f2f5;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;flex-direction:column;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 40px;height:56px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;background:#B90E0A;border-radius:6px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:13px;">B</span></div><span style="font-size:14px;font-weight:700;color:#1a1a1a;letter-spacing:1px;">BENCH APPAREL ERP</span></div>' +
                '<span style="font-size:11px;color:#aaa;letter-spacing:1px;">ENTERPRISE SYSTEM v3.2</span>' +
                '</div>' +
                '<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:40px;">' +
                '<div style="display:grid;grid-template-columns:420px 360px;gap:0;box-shadow:0 8px 40px rgba(0,0,0,0.12);border-radius:16px;overflow:hidden;">' +
                '<div style="background:#1a1a1a;padding:48px 44px;display:flex;flex-direction:column;justify-content:space-between;">' +
                '<div><div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#555;margin-bottom:20px;">Welcome back</div>' +
                '<h2 style="font-size:28px;font-weight:800;color:#fff;line-height:1.3;margin:0 0 12px;">Sign in to your<br/>workspace</h2>' +
                '<p style="font-size:13px;color:#666;line-height:1.7;margin:0;">Access the Bench Apparel enterprise platform. Your session is encrypted and monitored for security.</p></div>' +
                '<div style="border-top:1px solid #2a2a2a;padding-top:20px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
                '<div style="background:#222;border-radius:8px;padding:12px;"><div style="font-size:18px;font-weight:800;color:#B90E0A;">1,240</div><div style="font-size:10px;color:#555;margin-top:2px;text-transform:uppercase;letter-spacing:1px;">Employees</div></div>' +
                '<div style="background:#222;border-radius:8px;padding:12px;"><div style="font-size:18px;font-weight:800;color:#fff;">14</div><div style="font-size:10px;color:#555;margin-top:2px;text-transform:uppercase;letter-spacing:1px;">Branches</div></div>' +
                '</div></div>' +
                '</div>' +
                '<div style="background:#fff;padding:48px 40px;">' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Sign In</div>' +
                '<div style="font-size:12px;color:#aaa;margin-bottom:28px;">Use your company credentials</div>' +
                '<div style="margin-bottom:16px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Email Address</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div style="margin-bottom:8px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Password</label><input type="password" placeholder="••••••••••" style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;font-size:12px;"><label style="display:flex;align-items:center;gap:6px;color:#555;cursor:pointer;"><input type="checkbox" style="accent-color:#B90E0A;" />Remember me</label><a href="#" style="color:#B90E0A;text-decoration:none;font-weight:500;">Forgot password?</a></div>' +
                '<button style="width:100%;padding:13px;background:#B90E0A;border:none;border-radius:8px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:16px;">Sign In</button>' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="flex:1;height:1px;background:#e5e7eb;"></div><span style="font-size:11px;color:#bbb;">or continue with</span><div style="flex:1;height:1px;background:#e5e7eb;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;font-size:12px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:500;"><span style="font-size:14px;">G</span>Google</button>' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;font-size:12px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:500;"><span style="font-size:14px;">⊞</span>Microsoft</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-corp-announcements',
            label: 'Login: Corp + Announcements',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:40px;">' +
                '<div style="display:grid;grid-template-columns:500px 340px;gap:20px;width:100%;max-width:860px;">' +
                '<div style="background:#fff;border-radius:16px;padding:44px;box-shadow:0 4px 24px rgba(0,0,0,0.07);">' +
                '<div style="display:flex;align-items:center;gap:12px;margin-bottom:36px;"><div style="width:40px;height:40px;background:#B90E0A;border-radius:9px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:16px;">B</span></div><div><div style="font-size:15px;font-weight:800;color:#1a1a1a;letter-spacing:1px;">BENCH APPAREL</div><div style="font-size:10px;color:#aaa;letter-spacing:2px;text-transform:uppercase;">Enterprise Platform</div></div></div>' +
                '<h2 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0 0 6px;">Good morning 👋</h2>' +
                '<p style="font-size:13px;color:#aaa;margin:0 0 28px;">Please sign in to continue.</p>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Work Email</label><input type="email" placeholder="name@bench.com.ph" style="width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:20px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Password</label><input type="password" placeholder="••••••••••" style="width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:13px;background:#B90E0A;border:none;border-radius:8px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;margin-bottom:14px;">Sign In to ERP</button>' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><div style="flex:1;height:1px;background:#f0f0f0;"></div><span style="font-size:11px;color:#bbb;">SSO</span><div style="flex:1;height:1px;background:#f0f0f0;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;font-weight:600;"><span style="color:#ea4335;font-weight:900;font-size:13px;">G</span>Google</button>' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:8px;background:#fff;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;font-weight:600;"><span style="color:#00a1f1;font-weight:900;font-size:13px;">⊞</span>Microsoft</button>' +
                '</div>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<div style="background:#1a1a1a;border-radius:16px;padding:20px;">' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:10px;">📢 Company Bulletin</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="background:#222;border-radius:8px;padding:12px;border-left:3px solid #B90E0A;"><div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:3px;">March Payroll</div><div style="font-size:11px;color:#666;line-height:1.5;">Processing begins March 5. Submit all DTR corrections by March 3.</div><div style="font-size:10px;color:#444;margin-top:5px;">HR Department · 2 days ago</div></div>' +
                '<div style="background:#222;border-radius:8px;padding:12px;border-left:3px solid #3b82f6;"><div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:3px;">New ERP Module</div><div style="font-size:11px;color:#666;line-height:1.5;">Inventory module v2.1 launches March 10. Training on March 8.</div><div style="font-size:10px;color:#444;margin-top:5px;">IT Department · 3 days ago</div></div>' +
                '<div style="background:#222;border-radius:8px;padding:12px;border-left:3px solid #22c55e;"><div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:3px;">Employee of the Month</div><div style="font-size:11px;color:#666;line-height:1.5;">Congratulations to Maria Santos, SM MOA for February 2026! 🎉</div><div style="font-size:10px;color:#444;margin-top:5px;">HR Department · 5 days ago</div></div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin-bottom:10px;">System Status</div>' +
                '<div style="display:flex;flex-direction:column;gap:7px;font-size:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#555;">ERP Core</span><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Operational</span></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#555;">Payroll Module</span><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Operational</span></div>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#555;">HR Module</span><span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Maintenance</span></div>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-corp-minimal-pro',
            label: 'Login: Corporate Minimal Pro',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#fff;font-family:\'Helvetica Neue\',Arial,sans-serif;display:grid;grid-template-columns:1fr 480px;">' +
                '<div style="background:#f8f9fa;display:flex;flex-direction:column;justify-content:space-between;padding:48px;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:15px;">B</span></div><span style="font-size:15px;font-weight:800;color:#1a1a1a;letter-spacing:1px;">BENCH APPAREL</span></div>' +
                '<div><div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B90E0A;margin-bottom:16px;">Enterprise Resource Planning</div>' +
                '<h1 style="font-size:40px;font-weight:900;color:#1a1a1a;line-height:1.15;margin:0 0 20px;">One platform.<br/>Every branch.<br/>All teams.</h1>' +
                '<p style="font-size:15px;color:#888;line-height:1.7;max-width:440px;margin:0;">Manage HR, payroll, inventory, and operations across all Bench Apparel locations from a single secure dashboard.</p>' +
                '</div>' +
                '<div style="display:flex;gap:32px;font-size:13px;color:#aaa;">' +
                '<div><div style="font-size:20px;font-weight:800;color:#1a1a1a;">1,240+</div><div style="margin-top:2px;">Employees</div></div>' +
                '<div><div style="font-size:20px;font-weight:800;color:#1a1a1a;">14</div><div style="margin-top:2px;">Branches</div></div>' +
                '<div><div style="font-size:20px;font-weight:800;color:#1a1a1a;">99.9%</div><div style="margin-top:2px;">Uptime</div></div>' +
                '</div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;justify-content:center;padding:60px 56px;">' +
                '<div style="width:100%;">' +
                '<h2 style="font-size:24px;font-weight:800;color:#1a1a1a;margin:0 0 6px;">Sign in</h2>' +
                '<p style="font-size:13px;color:#aaa;margin:0 0 32px;">Enter your company credentials below</p>' +
                '<div style="margin-bottom:16px;"><label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#555;margin-bottom:8px;">Email</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:13px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;transition:border-color .2s;" /></div>' +
                '<div style="margin-bottom:28px;"><label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#555;margin-bottom:8px;">Password</label><input type="password" placeholder="••••••••••••" style="width:100%;padding:13px 16px;border:2px solid #e5e7eb;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:14px;background:#1a1a1a;border:none;border-radius:10px;font-size:15px;color:#fff;cursor:pointer;font-weight:700;margin-bottom:12px;">Continue</button>' +
                '<div style="text-align:center;font-size:12px;color:#aaa;margin-bottom:20px;"><a href="#" style="color:#B90E0A;text-decoration:none;font-weight:500;">Forgot password?</a> · <a href="#" style="color:#aaa;text-decoration:none;">Help</a></div>' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="flex:1;height:1px;background:#e5e7eb;"></div><span style="font-size:11px;color:#ccc;">SSO Options</span><div style="flex:1;height:1px;background:#e5e7eb;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:11px;border:2px solid #e5e7eb;border-radius:10px;background:#fff;font-size:13px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;"><span style="background:linear-gradient(135deg,#ea4335,#fbbc05,#34a853,#4285f4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;font-size:14px;">G</span>Google</button>' +
                '<button style="padding:11px;border:2px solid #e5e7eb;border-radius:10px;background:#fff;font-size:13px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;"><span style="color:#00a1f1;font-weight:900;font-size:14px;">⊞</span>Microsoft</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-corp-tiled',
            label: 'Login: Corporate Tiled Split',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#1a1a1a;font-family:\'Helvetica Neue\',Arial,sans-serif;display:grid;grid-template-columns:1fr 1fr;">' +
                '<div style="padding:52px;display:flex;flex-direction:column;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:34px;height:34px;background:#B90E0A;border-radius:7px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div><span style="font-size:14px;font-weight:800;color:#fff;letter-spacing:1px;">BENCH ERP</span></div>' +
                '<div>' +
                '<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B90E0A;margin-bottom:12px;">March 2026</div>' +
                '<h2 style="font-size:32px;font-weight:900;color:#fff;line-height:1.25;margin:0 0 20px;">Welcome back.<br/>Let\'s get to work.</h2>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
                '<div style="background:#222;border-radius:10px;padding:16px;border-top:3px solid #B90E0A;"><div style="font-size:20px;font-weight:800;color:#fff;">95.5%</div><div style="font-size:10px;color:#555;margin-top:3px;text-transform:uppercase;letter-spacing:1px;">Attendance</div></div>' +
                '<div style="background:#222;border-radius:10px;padding:16px;border-top:3px solid #3b82f6;"><div style="font-size:20px;font-weight:800;color:#fff;">PHP 22.4M</div><div style="font-size:10px;color:#555;margin-top:3px;text-transform:uppercase;letter-spacing:1px;">March Payroll</div></div>' +
                '<div style="background:#222;border-radius:10px;padding:16px;border-top:3px solid #22c55e;"><div style="font-size:20px;font-weight:800;color:#fff;">14</div><div style="font-size:10px;color:#555;margin-top:3px;text-transform:uppercase;letter-spacing:1px;">Open Roles</div></div>' +
                '<div style="background:#222;border-radius:10px;padding:16px;border-top:3px solid #f59e0b;"><div style="font-size:20px;font-weight:800;color:#fff;">8</div><div style="font-size:10px;color:#555;margin-top:3px;text-transform:uppercase;letter-spacing:1px;">Pending Approvals</div></div>' +
                '</div></div>' +
                '<div style="font-size:11px;color:#333;">© 2026 Bench Apparel Corporation</div>' +
                '</div>' +
                '<div style="background:#fff;display:flex;align-items:center;justify-content:center;padding:52px;">' +
                '<div style="width:100%;max-width:340px;">' +
                '<h3 style="font-size:20px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">Sign in</h3>' +
                '<p style="font-size:13px;color:#aaa;margin:0 0 28px;">Access your ERP account</p>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Email</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:12px 14px;border:2px solid #f0f0f0;border-radius:9px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:20px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Password</label><input type="password" placeholder="••••••••••" style="width:100%;padding:12px 14px;border:2px solid #f0f0f0;border-radius:9px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:13px;background:#B90E0A;border:none;border-radius:9px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;margin-bottom:12px;">Sign In</button>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="flex:1;height:1px;background:#f0f0f0;"></div><span style="font-size:11px;color:#ccc;">or</span><div style="flex:1;height:1px;background:#f0f0f0;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;"><span style="color:#ea4335;font-weight:900;">G</span>Google</button>' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;"><span style="color:#00a1f1;font-weight:900;">⊞</span>Microsoft</button>' +
                '</div>' +
                '<div style="text-align:center;margin-top:16px;font-size:12px;"><a href="#" style="color:#B90E0A;text-decoration:none;">Forgot password?</a></div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },


        // ── CREATIVE / EDITORIAL LOGIN TEMPLATES ────────────────────────

        {
            id: 'login-editorial-magazine',
            label: 'Login: Editorial Magazine',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#f5f0e8;font-family:Georgia,serif;display:grid;grid-template-columns:1fr 440px;">' +
                '<div style="padding:56px;display:flex;flex-direction:column;justify-content:space-between;">' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;letter-spacing:3px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;">BENCH APPAREL</div>' +
                '<div>' +
                '<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B90E0A;margin-bottom:14px;font-family:\'Helvetica Neue\',sans-serif;">Enterprise Platform</div>' +
                '<h1 style="font-size:64px;font-weight:400;color:#1a1a1a;line-height:1.05;margin:0 0 24px;font-style:italic;">The Future<br/>of Retail<br/><em style="color:#B90E0A;">Operations.</em></h1>' +
                '<p style="font-size:15px;color:#888;line-height:1.8;max-width:440px;margin:0;font-family:\'Helvetica Neue\',sans-serif;">Powering Bench Apparel\'s 14 branches with one intelligent, unified platform.</p>' +
                '</div>' +
                '<div style="display:flex;gap:32px;">' +
                '<div style="border-top:2px solid #1a1a1a;padding-top:12px;font-family:\'Helvetica Neue\',sans-serif;"><div style="font-size:24px;font-weight:800;color:#1a1a1a;">FY2026</div><div style="font-size:11px;color:#aaa;margin-top:2px;letter-spacing:1px;text-transform:uppercase;">Current Year</div></div>' +
                '<div style="border-top:2px solid #B90E0A;padding-top:12px;font-family:\'Helvetica Neue\',sans-serif;"><div style="font-size:24px;font-weight:800;color:#B90E0A;">v3.2</div><div style="font-size:11px;color:#aaa;margin-top:2px;letter-spacing:1px;text-transform:uppercase;">ERP Version</div></div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#fff;display:flex;align-items:center;justify-content:center;padding:64px 52px;">' +
                '<div style="width:100%;">' +
                '<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#aaa;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Sign In</div>' +
                '<h3 style="font-size:28px;font-weight:400;color:#1a1a1a;margin:0 0 32px;font-style:italic;">Welcome back</h3>' +
                '<div style="margin-bottom:20px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Email</div><input type="email" placeholder="name@bench.com.ph" style="width:100%;padding:0 0 12px;border:none;border-bottom:2px solid #1a1a1a;font-size:15px;outline:none;background:transparent;box-sizing:border-box;font-family:Georgia,serif;" /></div>' +
                '<div style="margin-bottom:32px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Password</div><input type="password" placeholder="••••••••••" style="width:100%;padding:0 0 12px;border:none;border-bottom:2px solid #1a1a1a;font-size:15px;outline:none;background:transparent;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:14px;background:#1a1a1a;border:none;font-size:13px;color:#fff;cursor:pointer;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;font-family:\'Helvetica Neue\',sans-serif;">Enter Platform</button>' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="flex:1;height:1px;background:#e5e7eb;"></div><span style="font-size:10px;color:#bbb;letter-spacing:1px;font-family:\'Helvetica Neue\',sans-serif;">OR SIGN IN WITH</span><div style="flex:1;height:1px;background:#e5e7eb;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:11px;border:1.5px solid #e5e7eb;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;text-transform:uppercase;background:#fff;"><span style="color:#ea4335;font-weight:900;">G</span>Google</button>' +
                '<button style="padding:11px;border:1.5px solid #e5e7eb;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;text-transform:uppercase;background:#fff;"><span style="color:#00a1f1;font-weight:900;">⊞</span>Microsoft</button>' +
                '</div>' +
                '<div style="text-align:center;margin-top:20px;font-size:12px;color:#aaa;font-family:\'Helvetica Neue\',sans-serif;"><a href="#" style="color:#B90E0A;text-decoration:none;">Forgot password</a></div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-editorial-poster',
            label: 'Login: Editorial Poster',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#1a1a1a;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:stretch;">' +
                '<div style="flex:1;padding:52px;display:flex;flex-direction:column;justify-content:space-between;background:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.03) 39px,rgba(255,255,255,0.03) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.03) 39px,rgba(255,255,255,0.03) 40px);">' +
                '<div style="font-size:12px;font-weight:700;color:#fff;letter-spacing:3px;text-transform:uppercase;">BENCH APPAREL CORP.</div>' +
                '<div>' +
                '<div style="font-size:80px;font-weight:900;color:#B90E0A;line-height:0.9;margin-bottom:8px;">ERP</div>' +
                '<div style="font-size:13px;letter-spacing:4px;text-transform:uppercase;color:#444;margin-bottom:20px;">Enterprise Resource Planning</div>' +
                '<div style="width:60px;height:3px;background:#B90E0A;margin-bottom:20px;"></div>' +
                '<p style="font-size:14px;color:#555;line-height:1.7;max-width:380px;margin:0;">Unified operations management for HR, payroll, inventory &amp; more. Built for Bench.</p>' +
                '</div>' +
                '<div style="font-size:10px;color:#333;letter-spacing:2px;text-transform:uppercase;">© 2026 Bench Apparel Corp. · All Rights Reserved</div>' +
                '</div>' +
                '<div style="width:420px;background:#fff;display:flex;align-items:center;justify-content:center;padding:52px 48px;">' +
                '<div style="width:100%;">' +
                '<div style="width:40px;height:4px;background:#B90E0A;margin-bottom:24px;"></div>' +
                '<h2 style="font-size:26px;font-weight:900;color:#1a1a1a;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Sign In</h2>' +
                '<p style="font-size:13px;color:#aaa;margin:0 0 32px;letter-spacing:1px;text-transform:uppercase;font-size:10px;">Use your company account</p>' +
                '<div style="margin-bottom:16px;"><label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#333;margin-bottom:8px;">Email</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:12px 16px;border:2px solid #f0f0f0;border-radius:0;font-size:13px;outline:none;box-sizing:border-box;border-left:3px solid #B90E0A;" /></div>' +
                '<div style="margin-bottom:24px;"><label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#333;margin-bottom:8px;">Password</label><input type="password" placeholder="••••••••••" style="width:100%;padding:12px 16px;border:2px solid #f0f0f0;border-radius:0;font-size:13px;outline:none;box-sizing:border-box;border-left:3px solid #1a1a1a;" /></div>' +
                '<button style="width:100%;padding:14px;background:#B90E0A;border:none;font-size:13px;color:#fff;cursor:pointer;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">Access Platform</button>' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><div style="flex:1;height:1px;background:#f0f0f0;"></div><span style="font-size:9px;color:#ccc;letter-spacing:2px;text-transform:uppercase;">SSO Login</span><div style="flex:1;height:1px;background:#f0f0f0;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:10px;border:2px solid #f0f0f0;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:700;letter-spacing:1px;background:#fff;"><span style="color:#ea4335;">G</span>GOOGLE</button>' +
                '<button style="padding:10px;border:2px solid #f0f0f0;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:700;letter-spacing:1px;background:#fff;"><span style="color:#00a1f1;">⊞</span>MSFT</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-editorial-fashion',
            label: 'Login: Editorial Fashion',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#faf7f4;font-family:\'Helvetica Neue\',Arial,sans-serif;display:grid;grid-template-columns:1fr 1fr;">' +
                '<div style="background:#2c1810;display:flex;flex-direction:column;justify-content:space-between;padding:52px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(45deg,rgba(185,14,10,0.04),rgba(185,14,10,0.04) 1px,transparent 1px,transparent 20px);"></div>' +
                '<div style="position:relative;"><div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;">Bench Apparel</div><div style="font-size:15px;font-weight:800;color:#fff;letter-spacing:2px;">ENTERPRISE</div></div>' +
                '<div style="position:relative;">' +
                '<div style="font-size:72px;font-weight:900;color:#fff;line-height:0.9;margin-bottom:16px;">BENCH<br/><span style="color:#B90E0A;">ERP</span></div>' +
                '<div style="width:40px;height:2px;background:#B90E0A;margin-bottom:16px;"></div>' +
                '<p style="font-size:13px;color:rgba(255,255,255,0.4);line-height:1.7;margin:0;">Fashion-forward operations management for the modern retail enterprise.</p>' +
                '</div>' +
                '<div style="position:relative;display:flex;gap:20px;">' +
                '<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;"><div style="font-size:16px;font-weight:800;color:#fff;">14</div><div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:1px;margin-top:2px;text-transform:uppercase;">Stores</div></div>' +
                '<div style="border-top:1px solid rgba(185,14,10,0.5);padding-top:12px;"><div style="font-size:16px;font-weight:800;color:#B90E0A;">1,240</div><div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:1px;margin-top:2px;text-transform:uppercase;">Staff</div></div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#fff;display:flex;align-items:center;justify-content:center;padding:60px 52px;">' +
                '<div style="width:100%;max-width:340px;">' +
                '<div style="width:32px;height:32px;background:#B90E0A;border-radius:7px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div>' +
                '<h2 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">Welcome back</h2>' +
                '<p style="font-size:13px;color:#aaa;margin:0 0 28px;">Sign in to your ERP account</p>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:6px;">Email</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:24px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:6px;">Password</label><input type="password" placeholder="••••••••••" style="width:100%;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:13px;background:#2c1810;border:none;border-radius:8px;font-size:13px;color:#fff;cursor:pointer;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Sign In</button>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="flex:1;height:1px;background:#f0f0f0;"></div><span style="font-size:10px;color:#ccc;letter-spacing:1px;">SSO</span><div style="flex:1;height:1px;background:#f0f0f0;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:12px;color:#555;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;background:#fff;"><span style="color:#ea4335;">G</span>Google</button>' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:12px;color:#555;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;background:#fff;"><span style="color:#00a1f1;">⊞</span>Microsoft</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },


        // ── FUTURISTIC / TECH LOGIN TEMPLATES ───────────────────────────

        {
            id: 'login-tech-terminal',
            label: 'Login: Tech Terminal',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#030712;font-family:\'Courier New\',monospace;display:flex;align-items:center;justify-content:center;padding:40px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse at 20% 50%,rgba(185,14,10,0.06) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(59,130,246,0.04) 0%,transparent 60%);pointer-events:none;"></div>' +
                '<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.008) 2px,rgba(255,255,255,0.008) 4px);pointer-events:none;"></div>' +
                '<div style="width:100%;max-width:480px;position:relative;z-index:1;">' +
                '<div style="border:1px solid rgba(185,14,10,0.3);border-radius:2px;padding:32px;">' +
                '<div style="border-bottom:1px solid rgba(185,14,10,0.2);padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div style="display:flex;gap:6px;"><div style="width:10px;height:10px;border-radius:50%;background:#B90E0A;opacity:0.8;"></div><div style="width:10px;height:10px;border-radius:50%;background:#444;"></div><div style="width:10px;height:10px;border-radius:50%;background:#444;"></div></div>' +
                '<span style="font-size:10px;color:rgba(185,14,10,0.7);letter-spacing:2px;">BENCH-ERP v3.2.1</span>' +
                '</div>' +
                '<div style="margin-bottom:24px;">' +
                '<div style="font-size:10px;color:#B90E0A;margin-bottom:4px;letter-spacing:1px;">// AUTHENTICATION REQUIRED</div>' +
                '<div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;line-height:1.2;">ACCESS_TERMINAL<br/><span style="color:#B90E0A;">BENCH_APPAREL.ERP</span></div>' +
                '</div>' +
                '<div style="margin-bottom:14px;"><div style="font-size:10px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">// USER_EMAIL</div><div style="border:1px solid rgba(185,14,10,0.3);padding:10px 14px;display:flex;align-items:center;gap:8px;background:rgba(185,14,10,0.04);"><span style="color:#B90E0A;font-size:11px;">›</span><input type="email" placeholder="user@bench.com.ph" style="background:transparent;border:none;outline:none;color:#fff;font-size:12px;flex:1;font-family:\'Courier New\',monospace;letter-spacing:1px;" /></div></div>' +
                '<div style="margin-bottom:24px;"><div style="font-size:10px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">// USER_PASS</div><div style="border:1px solid rgba(185,14,10,0.3);padding:10px 14px;display:flex;align-items:center;gap:8px;background:rgba(185,14,10,0.04);"><span style="color:#B90E0A;font-size:11px;">›</span><input type="password" placeholder="••••••••••••••••" style="background:transparent;border:none;outline:none;color:#fff;font-size:12px;flex:1;font-family:\'Courier New\',monospace;" /></div></div>' +
                '<button style="width:100%;padding:13px;background:rgba(185,14,10,0.15);border:1px solid rgba(185,14,10,0.5);color:#B90E0A;cursor:pointer;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;font-family:\'Courier New\',monospace;margin-bottom:14px;">[ AUTHENTICATE ]</button>' +
                '<div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:14px;">' +
                '<div style="font-size:9px;color:#333;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">// SSO_PROVIDERS</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:9px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#666;cursor:pointer;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:\'Courier New\',monospace;display:flex;align-items:center;justify-content:center;gap:6px;">[ G ] GOOGLE</button>' +
                '<button style="padding:9px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#666;cursor:pointer;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:\'Courier New\',monospace;display:flex;align-items:center;justify-content:center;gap:6px;">[ ⊞ ] MSFT</button>' +
                '</div></div>' +
                '<div style="margin-top:20px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.04);font-size:9px;color:#2a2a2a;letter-spacing:1px;line-height:1.8;">' +
                '<div>STATUS: <span style="color:#22c55e;">ONLINE</span> · <span style="color:#555;">ENCRYPTED CONNECTION · TLS 1.3</span></div>' +
                '<div>UPTIME: <span style="color:#555;">99.97% · LAST INCIDENT: 47 DAYS AGO</span></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-tech-hud',
            label: 'Login: Tech HUD Interface',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#050a14;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:40px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;width:600px;height:600px;border-radius:50%;border:1px solid rgba(185,14,10,0.08);top:50%;left:50%;transform:translate(-50%,-50%);"></div>' +
                '<div style="position:absolute;width:800px;height:800px;border-radius:50%;border:1px solid rgba(185,14,10,0.04);top:50%;left:50%;transform:translate(-50%,-50%);"></div>' +
                '<div style="position:absolute;width:400px;height:400px;border-radius:50%;border:1px solid rgba(59,130,246,0.06);top:50%;left:50%;transform:translate(-50%,-50%);"></div>' +
                '<div style="position:absolute;top:20px;left:24px;font-size:10px;color:rgba(185,14,10,0.4);letter-spacing:2px;text-transform:uppercase;font-family:\'Courier New\',monospace;">SYS: BENCH-ERP · NODE: ACTIVE · ENC: ON</div>' +
                '<div style="position:absolute;top:20px;right:24px;font-size:10px;color:rgba(255,255,255,0.15);letter-spacing:2px;font-family:\'Courier New\',monospace;">2026.03.04 · 09:41:32</div>' +
                '<div style="position:absolute;bottom:20px;left:24px;font-size:9px;color:rgba(255,255,255,0.1);font-family:\'Courier New\',monospace;">© BENCH APPAREL CORP. · ENTERPRISE SUITE v3.2</div>' +
                '<div style="width:100%;max-width:440px;position:relative;z-index:1;">' +
                '<div style="text-align:center;margin-bottom:28px;">' +
                '<div style="width:56px;height:56px;border:2px solid rgba(185,14,10,0.5);border-radius:12px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;background:rgba(185,14,10,0.08);"><span style="color:#B90E0A;font-weight:900;font-size:22px;">B</span></div>' +
                '<div style="font-size:13px;font-weight:700;color:#fff;letter-spacing:3px;text-transform:uppercase;">BENCH APPAREL ERP</div>' +
                '<div style="font-size:10px;color:rgba(185,14,10,0.6);letter-spacing:2px;margin-top:3px;text-transform:uppercase;font-family:\'Courier New\',monospace;">Identity Verification Required</div>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px;">' +
                '<div style="margin-bottom:14px;"><div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Access Email</div><input type="email" placeholder="user@bench.com.ph" style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:13px;outline:none;box-sizing:border-box;border-radius:8px;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div style="margin-bottom:20px;"><div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Passphrase</div><input type="password" placeholder="••••••••••••" style="width:100%;padding:11px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:13px;outline:none;box-sizing:border-box;border-radius:8px;" /></div>' +
                '<button style="width:100%;padding:13px;background:linear-gradient(135deg,#B90E0A,#7a0806);border:none;border-radius:8px;font-size:13px;color:#fff;cursor:pointer;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">Authenticate</button>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="flex:1;height:1px;background:rgba(255,255,255,0.06);"></div><span style="font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;">or use SSO</span><div style="flex:1;height:1px;background:rgba(255,255,255,0.06);"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:rgba(255,255,255,0.5);cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;"><span style="color:#ea4335;">G</span>Google</button>' +
                '<button style="padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:rgba(255,255,255,0.5);cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;"><span style="color:#00a1f1;">⊞</span>Microsoft</button>' +
                '</div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px;text-align:center;">' +
                '<div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.15);border-radius:8px;padding:10px;"><div style="font-size:9px;color:rgba(34,197,94,0.7);letter-spacing:1px;text-transform:uppercase;">Status</div><div style="font-size:11px;font-weight:700;color:#22c55e;margin-top:2px;">Online</div></div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px;"><div style="font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;">Users</div><div style="font-size:11px;font-weight:700;color:#fff;margin-top:2px;">248</div></div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:10px;"><div style="font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;">Uptime</div><div style="font-size:11px;font-weight:700;color:#fff;margin-top:2px;">99.9%</div></div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-tech-gradient-anim',
            label: 'Login: Tech Animated Gradient',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:40px;position:relative;overflow:hidden;background:#0a0a0a;">' +
                '<div style="position:absolute;top:-20%;left:-10%;width:60%;height:60%;border-radius:50%;background:radial-gradient(circle,rgba(185,14,10,0.15) 0%,transparent 70%);animation:pulse1 4s ease-in-out infinite alternate;"></div>' +
                '<div style="position:absolute;bottom:-20%;right:-10%;width:50%;height:50%;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%);animation:pulse2 5s ease-in-out infinite alternate;"></div>' +
                '<style>@keyframes pulse1{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.1) translate(3%,3%)}}@keyframes pulse2{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.15) translate(-3%,-3%)}}</style>' +
                '<div style="width:100%;max-width:420px;position:relative;z-index:1;">' +
                '<div style="text-align:center;margin-bottom:32px;">' +
                '<div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:99px;padding:8px 16px;margin-bottom:20px;">' +
                '<div style="width:6px;height:6px;background:#22c55e;border-radius:50%;"></div>' +
                '<span style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:1px;">All Systems Operational</span>' +
                '</div>' +
                '<div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:rgba(185,14,10,0.7);margin-bottom:8px;">Bench Apparel</div>' +
                '<h1 style="font-size:28px;font-weight:900;color:#fff;margin:0;letter-spacing:1px;">Enterprise Platform</h1>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;">' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);margin-bottom:8px;">Email</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:24px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.3);margin-bottom:8px;">Password</label><input type="password" placeholder="••••••••••••" style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:14px;background:linear-gradient(135deg,#B90E0A 0%,#dc2626 100%);border:none;border-radius:10px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;letter-spacing:1px;margin-bottom:16px;box-shadow:0 4px 20px rgba(185,14,10,0.4);">Sign In</button>' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><div style="flex:1;height:1px;background:rgba(255,255,255,0.06);"></div><span style="font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:1px;">or</span><div style="flex:1;height:1px;background:rgba(255,255,255,0.06);"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:11px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(255,255,255,0.6);cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;"><span style="color:#ea4335;font-weight:900;">G</span>Google</button>' +
                '<button style="padding:11px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(255,255,255,0.6);cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;"><span style="color:#00a1f1;font-weight:900;">⊞</span>Microsoft</button>' +
                '</div></div>' +
                '<div style="text-align:center;margin-top:16px;"><a href="#" style="font-size:12px;color:rgba(255,255,255,0.3);text-decoration:none;">Forgot password?</a></div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-tech-split-anim',
            label: 'Login: Tech Split + Live Stats',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#060b16;font-family:\'Helvetica Neue\',Arial,sans-serif;display:grid;grid-template-columns:1fr 420px;">' +
                '<div style="padding:52px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 60%,rgba(185,14,10,0.12) 0%,transparent 60%);pointer-events:none;"></div>' +
                '<div style="position:relative;display:flex;align-items:center;gap:12px;"><div style="width:34px;height:34px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div><span style="font-size:13px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;">Bench ERP</span></div>' +
                '<div style="position:relative;">' +
                '<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(185,14,10,0.7);margin-bottom:14px;font-family:\'Courier New\',monospace;">// LIVE SYSTEM STATUS</div>' +
                '<h2 style="font-size:34px;font-weight:900;color:#fff;line-height:1.2;margin:0 0 28px;">Operations<br/>at a Glance</h2>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:12px;color:rgba(255,255,255,0.6);">Total Employees Online</div><div style="font-size:22px;font-weight:800;color:#fff;margin-top:2px;">248 <span style="font-size:11px;color:#22c55e;font-weight:400;">/ 1,240</span></div></div><div style="width:40px;height:40px;border-radius:8px;background:rgba(34,197,94,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;">✅</div></div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:12px;color:rgba(255,255,255,0.6);">Pending Payroll Approvals</div><div style="font-size:22px;font-weight:800;color:#f59e0b;margin-top:2px;">8 <span style="font-size:11px;color:rgba(255,255,255,0.3);font-weight:400;">items</span></div></div><div style="width:40px;height:40px;border-radius:8px;background:rgba(245,158,11,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;">⏳</div></div>' +
                '<div style="background:rgba(185,14,10,0.08);border:1px solid rgba(185,14,10,0.2);border-radius:10px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:12px;color:rgba(255,255,255,0.6);">Open Job Positions</div><div style="font-size:22px;font-weight:800;color:#B90E0A;margin-top:2px;">14 <span style="font-size:11px;color:rgba(255,255,255,0.3);font-weight:400;">open</span></div></div><div style="width:40px;height:40px;border-radius:8px;background:rgba(185,14,10,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;">📋</div></div>' +
                '</div></div>' +
                '<div style="position:relative;font-size:10px;color:rgba(255,255,255,0.15);letter-spacing:1px;font-family:\'Courier New\',monospace;">BENCH APPAREL CORP. · ENTERPRISE PLATFORM 2026</div>' +
                '</div>' +
                '<div style="background:#fff;display:flex;align-items:center;justify-content:center;padding:48px 44px;">' +
                '<div style="width:100%;">' +
                '<h3 style="font-size:20px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">Sign In</h3>' +
                '<p style="font-size:12px;color:#aaa;margin:0 0 28px;letter-spacing:1px;">Enterprise Access Portal</p>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Email</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:20px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Password</label><input type="password" placeholder="••••••••••" style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:13px;background:#060b16;border:none;border-radius:8px;font-size:13px;color:#fff;cursor:pointer;font-weight:700;letter-spacing:1px;margin-bottom:12px;">Access Platform</button>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="flex:1;height:1px;background:#f0f0f0;"></div><span style="font-size:10px;color:#ccc;">SSO</span><div style="flex:1;height:1px;background:#f0f0f0;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;background:#fff;"><span style="color:#ea4335;">G</span>Google</button>' +
                '<button style="padding:10px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;background:#fff;"><span style="color:#00a1f1;">⊞</span>Microsoft</button>' +
                '</div>' +
                '<div style="text-align:center;margin-top:16px;"><a href="#" style="font-size:12px;color:#B90E0A;text-decoration:none;font-weight:500;">Forgot password?</a></div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },


        // ── MOBILE-FIRST / APP-LIKE LOGIN TEMPLATES ─────────────────────

        {
            id: 'login-mobile-card',
            label: 'Login: Mobile App Card',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:linear-gradient(160deg,#B90E0A 0%,#7a0806 40%,#1a0202 100%);font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:flex-end;justify-content:center;padding-bottom:0;">' +
                '<div style="width:100%;max-width:420px;">' +
                '<div style="padding:48px 32px 28px;text-align:center;">' +
                '<div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:16px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:26px;">B</span></div>' +
                '<h1 style="font-size:24px;font-weight:800;color:#fff;margin:0 0 6px;">Bench ERP</h1>' +
                '<p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0;">Enterprise Management Platform</p>' +
                '</div>' +
                '<div style="background:#fff;border-radius:28px 28px 0 0;padding:32px 28px 40px;">' +
                '<h2 style="font-size:20px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">Welcome back</h2>' +
                '<p style="font-size:13px;color:#aaa;margin:0 0 24px;">Sign in to your account</p>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Email</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:14px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:14px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:24px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Password</label><input type="password" placeholder="••••••••••" style="width:100%;padding:14px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:14px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:16px;background:linear-gradient(135deg,#B90E0A,#dc2626);border:none;border-radius:14px;font-size:15px;color:#fff;cursor:pointer;font-weight:700;margin-bottom:16px;box-shadow:0 6px 20px rgba(185,14,10,0.35);">Sign In</button>' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><div style="flex:1;height:1px;background:#e5e7eb;"></div><span style="font-size:12px;color:#bbb;">or</span><div style="flex:1;height:1px;background:#e5e7eb;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' +
                '<button style="padding:13px;border:1.5px solid #e5e7eb;border-radius:12px;background:#fff;font-size:13px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;"><span style="color:#ea4335;font-weight:900;font-size:15px;">G</span>Google</button>' +
                '<button style="padding:13px;border:1.5px solid #e5e7eb;border-radius:12px;background:#fff;font-size:13px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;"><span style="color:#00a1f1;font-weight:900;font-size:15px;">⊞</span>Microsoft</button>' +
                '</div>' +
                '<div style="text-align:center;"><a href="#" style="font-size:13px;color:#B90E0A;text-decoration:none;font-weight:500;">Forgot password?</a></div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-mobile-otp',
            label: 'Login: Mobile OTP / PIN',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:32px;">' +
                '<div style="width:100%;max-width:360px;">' +
                '<div style="text-align:center;margin-bottom:32px;">' +
                '<div style="width:70px;height:70px;background:linear-gradient(135deg,#B90E0A,#7a0806);border-radius:20px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(185,14,10,0.3);"><span style="color:#fff;font-weight:900;font-size:28px;">B</span></div>' +
                '<h1 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">Bench ERP</h1>' +
                '<p style="font-size:13px;color:#aaa;margin:0;">Kiosk Access Terminal</p>' +
                '</div>' +
                '<div style="background:#fff;border-radius:20px;padding:28px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
                '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:13px;font-weight:600;color:#1a1a1a;margin-bottom:4px;">Enter Employee ID + PIN</div><div style="font-size:11px;color:#aaa;">4–6 digit security PIN</div></div>' +
                '<div style="margin-bottom:16px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Employee ID</label><input type="text" placeholder="BA-2021-0042" style="width:100%;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:10px;font-size:14px;text-align:center;letter-spacing:3px;outline:none;box-sizing:border-box;font-weight:700;" /></div>' +
                '<div style="margin-bottom:20px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">PIN</label><div style="display:flex;justify-content:center;gap:10px;">' +
                '<input type="password" maxlength="1" style="width:48px;height:52px;border:2px solid #e5e7eb;border-radius:10px;font-size:22px;text-align:center;outline:none;font-weight:700;" />' +
                '<input type="password" maxlength="1" style="width:48px;height:52px;border:2px solid #e5e7eb;border-radius:10px;font-size:22px;text-align:center;outline:none;font-weight:700;" />' +
                '<input type="password" maxlength="1" style="width:48px;height:52px;border:2px solid #B90E0A;border-radius:10px;font-size:22px;text-align:center;outline:none;font-weight:700;box-shadow:0 0 0 3px rgba(185,14,10,0.1);" />' +
                '<input type="password" maxlength="1" style="width:48px;height:52px;border:2px solid #e5e7eb;border-radius:10px;font-size:22px;text-align:center;outline:none;font-weight:700;" />' +
                '</div></div>' +
                '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">1</button>' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">2</button>' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">3</button>' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">4</button>' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">5</button>' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">6</button>' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">7</button>' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">8</button>' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">9</button>' +
                '<div></div>' +
                '<button style="padding:16px;background:#f8fafc;border:1.5px solid #e5e7eb;border-radius:12px;font-size:20px;font-weight:700;color:#1a1a1a;cursor:pointer;">0</button>' +
                '<button style="padding:16px;background:#fee2e2;border:1.5px solid #fca5a5;border-radius:12px;font-size:16px;font-weight:700;color:#B90E0A;cursor:pointer;">⌫</button>' +
                '</div>' +
                '<button style="width:100%;padding:15px;background:#B90E0A;border:none;border-radius:12px;font-size:15px;color:#fff;cursor:pointer;font-weight:700;box-shadow:0 4px 16px rgba(185,14,10,0.3);">Time In / Out</button>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-mobile-fullscreen',
            label: 'Login: Mobile Fullscreen Immersive',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#0d0d0d;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:300px;height:300px;background:radial-gradient(circle,rgba(185,14,10,0.2) 0%,transparent 70%);pointer-events:none;"></div>' +
                '<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:400px;height:200px;background:radial-gradient(ellipse,rgba(185,14,10,0.1) 0%,transparent 70%);pointer-events:none;"></div>' +
                '<div style="width:100%;max-width:380px;position:relative;z-index:1;">' +
                '<div style="text-align:center;margin-bottom:40px;">' +
                '<div style="width:80px;height:80px;border:2px solid rgba(185,14,10,0.4);border-radius:22px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background:rgba(185,14,10,0.1);"><span style="color:#B90E0A;font-weight:900;font-size:32px;">B</span></div>' +
                '<h1 style="font-size:26px;font-weight:900;color:#fff;margin:0 0 6px;letter-spacing:1px;">BENCH ERP</h1>' +
                '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:99px;padding:4px 12px;"><div style="width:5px;height:5px;background:#22c55e;border-radius:50%;"></div><span style="font-size:10px;color:#22c55e;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Online · Secure</span></div>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<input type="email" placeholder="Email address" style="width:100%;padding:16px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#fff;font-size:15px;outline:none;box-sizing:border-box;" />' +
                '<input type="password" placeholder="Password" style="width:100%;padding:16px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#fff;font-size:15px;outline:none;box-sizing:border-box;" />' +
                '<button style="width:100%;padding:17px;background:linear-gradient(135deg,#B90E0A,#7a0806);border:none;border-radius:14px;font-size:16px;color:#fff;cursor:pointer;font-weight:800;letter-spacing:1px;box-shadow:0 8px 28px rgba(185,14,10,0.4);">Sign In</button>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:12px;margin:20px 0;">' +
                '<div style="flex:1;height:1px;background:rgba(255,255,255,0.08);"></div>' +
                '<span style="font-size:12px;color:rgba(255,255,255,0.2);">or continue with</span>' +
                '<div style="flex:1;height:1px;background:rgba(255,255,255,0.08);"></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;">' +
                '<button style="padding:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:rgba(255,255,255,0.7);cursor:pointer;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;"><span style="color:#ea4335;font-weight:900;font-size:16px;">G</span>Google</button>' +
                '<button style="padding:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:rgba(255,255,255,0.7);cursor:pointer;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;"><span style="color:#00a1f1;font-weight:900;font-size:16px;">⊞</span>Microsoft</button>' +
                '</div>' +
                '<div style="text-align:center;"><a href="#" style="font-size:13px;color:rgba(255,255,255,0.3);text-decoration:none;">Forgot your password?</a></div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-mobile-announcements',
            label: 'Login: Mobile + Announcements',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#f0f2f5;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:20px;">' +
                '<div style="width:100%;max-width:400px;display:flex;flex-direction:column;gap:14px;">' +
                '<div style="background:#fff;border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.07);">' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:22px;"><div style="width:40px;height:40px;background:#B90E0A;border-radius:10px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:16px;">B</span></div><div><div style="font-size:14px;font-weight:800;color:#1a1a1a;">Bench Apparel</div><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Enterprise Platform</div></div></div>' +
                '<h2 style="font-size:18px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">Sign In</h2>' +
                '<p style="font-size:12px;color:#aaa;margin:0 0 20px;">Enter your company credentials</p>' +
                '<div style="margin-bottom:12px;"><input type="email" placeholder="Email address" style="width:100%;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:14px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:16px;"><input type="password" placeholder="Password" style="width:100%;padding:13px 16px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:14px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:14px;background:#B90E0A;border:none;border-radius:12px;font-size:15px;color:#fff;cursor:pointer;font-weight:700;margin-bottom:14px;">Sign In</button>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="flex:1;height:1px;background:#f0f0f0;"></div><span style="font-size:11px;color:#bbb;">SSO</span><div style="flex:1;height:1px;background:#f0f0f0;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:11px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;"><span style="color:#ea4335;font-weight:900;">G</span>Google</button>' +
                '<button style="padding:11px;border:1.5px solid #e5e7eb;border-radius:10px;background:#fff;font-size:12px;color:#333;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:600;"><span style="color:#00a1f1;font-weight:900;">⊞</span>Microsoft</button>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:20px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.05);">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin-bottom:12px;">📢 Company Updates</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="display:flex;gap:10px;align-items:flex-start;padding:10px;background:#f9fafb;border-radius:10px;"><div style="width:6px;height:6px;background:#B90E0A;border-radius:50%;margin-top:5px;flex-shrink:0;"></div><div><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Payroll Processing</div><div style="font-size:11px;color:#888;margin-top:1px;line-height:1.4;">Submit DTR corrections by March 3. Payroll closes March 5.</div></div></div>' +
                '<div style="display:flex;gap:10px;align-items:flex-start;padding:10px;background:#f9fafb;border-radius:10px;"><div style="width:6px;height:6px;background:#22c55e;border-radius:50%;margin-top:5px;flex-shrink:0;"></div><div><div style="font-size:12px;font-weight:700;color:#1a1a1a;">🏆 Employee of the Month</div><div style="font-size:11px;color:#888;margin-top:1px;line-height:1.4;">Congratulations to Maria Santos, SM MOA! February 2026.</div></div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>'
        },


        // ── ADDITIONAL MIXED LOGIN TEMPLATES ────────────────────────────

        {
            id: 'login-dark-announcements',
            label: 'Login: Dark + Announcements',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#0a0a0a;font-family:\'Helvetica Neue\',Arial,sans-serif;display:grid;grid-template-columns:1fr 400px;">' +
                '<div style="padding:52px;display:flex;flex-direction:column;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:34px;height:34px;background:#B90E0A;border-radius:7px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div><span style="font-size:13px;font-weight:700;color:#fff;letter-spacing:2px;">BENCH ERP</span></div>' +
                '<div>' +
                '<div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(185,14,10,0.7);margin-bottom:12px;">📢 Company Bulletin</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;max-width:560px;">' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-left:3px solid #B90E0A;border-radius:8px;padding:14px 16px;"><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:4px;">🚨 Urgent: March Payroll Deadline</div><div style="font-size:12px;color:#555;line-height:1.6;">All branch managers must submit final attendance reports by <strong style="color:#888;">March 3, 2026 at 5:00 PM</strong>. Late submissions will delay payroll release.</div><div style="font-size:10px;color:#333;margin-top:6px;">HR Department · Today</div></div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-left:3px solid #3b82f6;border-radius:8px;padding:14px 16px;"><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:4px;">🆕 ERP System Update</div><div style="font-size:12px;color:#555;line-height:1.6;">The inventory and HR modules will undergo scheduled maintenance on <strong style="color:#888;">March 8, 10 PM–2 AM</strong>. Plan accordingly.</div><div style="font-size:10px;color:#333;margin-top:6px;">IT Department · Yesterday</div></div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-left:3px solid #22c55e;border-radius:8px;padding:14px 16px;"><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:4px;">🎉 Q1 Performance Results</div><div style="font-size:12px;color:#555;line-height:1.6;">Overall Q1 performance exceeded targets by 14%. Full results will be presented at the March 15 leadership meeting.</div><div style="font-size:10px;color:#333;margin-top:6px;">Management · 2 days ago</div></div>' +
                '</div></div>' +
                '<div style="font-size:10px;color:#222;letter-spacing:1px;text-transform:uppercase;">© 2026 Bench Apparel Corporation</div>' +
                '</div>' +
                '<div style="background:#111;border-left:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;padding:48px 44px;">' +
                '<div style="width:100%;">' +
                '<div style="width:44px;height:44px;background:#B90E0A;border-radius:10px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:18px;">B</span></div>' +
                '<h3 style="font-size:22px;font-weight:800;color:#fff;margin:0 0 4px;">Sign in</h3>' +
                '<p style="font-size:13px;color:#444;margin:0 0 28px;">Use your company credentials</p>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#444;margin-bottom:6px;">Email</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:22px;"><label style="display:block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:#444;margin-bottom:6px;">Password</label><input type="password" placeholder="••••••••••" style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:13px;background:#B90E0A;border:none;border-radius:8px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;margin-bottom:14px;">Sign In</button>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="flex:1;height:1px;background:rgba(255,255,255,0.06);"></div><span style="font-size:10px;color:#333;">or SSO</span><div style="flex:1;height:1px;background:rgba(255,255,255,0.06);"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#666;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;"><span style="color:#ea4335;">G</span>Google</button>' +
                '<button style="padding:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#666;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;"><span style="color:#00a1f1;">⊞</span>Microsoft</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
        },

        {
            id: 'login-frosted-anim',
            label: 'Login: Frosted Glass Animated',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:40px;position:relative;overflow:hidden;background:#1a0505;">' +
                '<div style="position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(185,14,10,0.3) 0%,transparent 70%);top:-100px;left:-100px;"></div>' +
                '<div style="position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(185,14,10,0.15) 0%,transparent 70%);bottom:-80px;right:-80px;"></div>' +
                '<div style="position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.03) 0%,transparent 70%);top:40%;left:40%;transform:translate(-50%,-50%);"></div>' +
                '<div style="width:100%;max-width:420px;position:relative;z-index:1;">' +
                '<div style="text-align:center;margin-bottom:28px;">' +
                '<div style="width:60px;height:60px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);"><span style="color:#fff;font-weight:900;font-size:24px;">B</span></div>' +
                '<div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:2px;">BENCH APPAREL</div>' +
                '<div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:3px;text-transform:uppercase;margin-top:3px;">Enterprise Platform</div>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.08);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.15);border-radius:24px;padding:32px;">' +
                '<h3 style="font-size:18px;font-weight:700;color:#fff;margin:0 0 4px;">Welcome back</h3>' +
                '<p style="font-size:12px;color:rgba(255,255,255,0.4);margin:0 0 24px;">Sign in to continue to the ERP</p>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.4);margin-bottom:6px;">Email</label><input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:22px;"><label style="display:block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.4);margin-bottom:6px;">Password</label><input type="password" placeholder="••••••••••" style="width:100%;padding:12px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:13px;background:rgba(185,14,10,0.9);border:1px solid rgba(185,14,10,0.5);border-radius:10px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;margin-bottom:14px;backdrop-filter:blur(10px);">Sign In</button>' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><div style="flex:1;height:1px;background:rgba(255,255,255,0.08);"></div><span style="font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:1px;">or</span><div style="flex:1;height:1px;background:rgba(255,255,255,0.08);"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<button style="padding:11px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(255,255,255,0.6);cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;"><span style="color:#ea4335;font-weight:900;">G</span>Google</button>' +
                '<button style="padding:11px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(255,255,255,0.6);cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px;"><span style="color:#00a1f1;font-weight:900;">⊞</span>Microsoft</button>' +
                '</div></div>' +
                '</div>' +
                '</div>'
        },


        {
            id: 'login-forgot-password',
            label: 'Login: Forgot Password',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#fff;font-family:\'Helvetica Neue\',Arial,sans-serif;display:grid;grid-template-columns:1fr 580px;">' +

                // LEFT PANEL
                '<div style="background:#fff;padding:64px 72px;display:flex;flex-direction:column;justify-content:center;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#B90E0A;margin-bottom:28px;">BENCH APPAREL</div>' +
                '<h1 style="font-size:72px;font-weight:900;color:#1a1a1a;line-height:0.92;margin:0 0 24px;text-transform:uppercase;letter-spacing:-2px;">' +
                'WHERE<br/>FASHION<br/><span style="color:transparent;-webkit-text-stroke:3px #B90E0A;">MEETS</span><br/>SMART<br/>BUSINESS' +
                '</h1>' +
                '<p style="font-size:14px;color:#888;line-height:1.7;max-width:380px;margin:0;">Manage production, inventory, and operations with the power of Bench Apparel ERP.</p>' +
                '</div>' +

                // RIGHT PANEL
                '<div style="background:#f5f4f0;display:flex;align-items:center;justify-content:center;padding:64px 72px;">' +
                '<div style="width:100%;">' +

                // Heading
                '<h2 style="font-size:36px;font-weight:900;color:#1a1a1a;margin:0 0 6px;letter-spacing:-0.5px;">Reset.</h2>' +
                '<p style="font-size:13px;color:#999;margin:0 0 40px;">Enter your work email and we\'ll send you a reset link.</p>' +

                // Email field
                '<div style="margin-bottom:24px;">' +
                '<label style="display:block;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#1a1a1a;margin-bottom:10px;">EMAIL ADDRESS</label>' +
                '<input type="email" placeholder="you@bench.com.ph" style="width:100%;padding:0 0 12px;border:none;border-bottom:1.5px solid #1a1a1a;background:transparent;font-size:15px;color:#1a1a1a;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" />' +
                '</div>' +

                // Submit button
                '<button style="width:100%;padding:18px;background:#1a1a1a;border:none;font-size:12px;color:#fff;cursor:pointer;font-weight:900;letter-spacing:4px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:20px;">SEND RESET LINK</button>' +

                // Back to login
                '<div style="text-align:center;">' +
                '<a href="#" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#aaa;text-decoration:none;">← BACK TO LOGIN</a>' +
                '</div>' +

                '</div>' +
                '</div>' +

                '</div>'
        },

        {
            id: 'login-reset-password',
            label: 'Login: Reset Password (New PW)',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#fff;font-family:\'Helvetica Neue\',Arial,sans-serif;display:grid;grid-template-columns:1fr 580px;">' +

                // LEFT PANEL
                '<div style="background:#fff;padding:64px 72px;display:flex;flex-direction:column;justify-content:center;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#B90E0A;margin-bottom:28px;">BENCH APPAREL</div>' +
                '<h1 style="font-size:72px;font-weight:900;color:#1a1a1a;line-height:0.92;margin:0 0 24px;text-transform:uppercase;letter-spacing:-2px;">' +
                'WHERE<br/>FASHION<br/><span style="color:transparent;-webkit-text-stroke:3px #B90E0A;">MEETS</span><br/>SMART<br/>BUSINESS' +
                '</h1>' +
                '<p style="font-size:14px;color:#888;line-height:1.7;max-width:380px;margin:0;">Manage production, inventory, and operations with the power of Bench Apparel ERP.</p>' +
                '</div>' +

                // RIGHT PANEL
                '<div style="background:#f5f4f0;display:flex;align-items:center;justify-content:center;padding:64px 72px;">' +
                '<div style="width:100%;">' +

                '<h2 style="font-size:36px;font-weight:900;color:#1a1a1a;margin:0 0 6px;letter-spacing:-0.5px;">New Password.</h2>' +
                '<p style="font-size:13px;color:#999;margin:0 0 40px;">Choose a strong password for your account.</p>' +

                // New password
                '<div style="margin-bottom:28px;">' +
                '<label style="display:block;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#1a1a1a;margin-bottom:10px;">NEW PASSWORD</label>' +
                '<input type="password" placeholder="••••••••••••" style="width:100%;padding:0 0 12px;border:none;border-bottom:1.5px solid #1a1a1a;background:transparent;font-size:15px;color:#1a1a1a;outline:none;box-sizing:border-box;" />' +
                '</div>' +

                // Confirm password
                '<div style="margin-bottom:12px;">' +
                '<label style="display:block;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#1a1a1a;margin-bottom:10px;">CONFIRM PASSWORD</label>' +
                '<input type="password" placeholder="••••••••••••" style="width:100%;padding:0 0 12px;border:none;border-bottom:1.5px solid #1a1a1a;background:transparent;font-size:15px;color:#1a1a1a;outline:none;box-sizing:border-box;" />' +
                '</div>' +

                // Password strength indicator
                '<div style="margin-bottom:32px;">' +
                '<div style="display:flex;gap:4px;margin-bottom:6px;">' +
                '<div style="flex:1;height:3px;background:#B90E0A;border-radius:2px;"></div>' +
                '<div style="flex:1;height:3px;background:#B90E0A;border-radius:2px;"></div>' +
                '<div style="flex:1;height:3px;background:#B90E0A;border-radius:2px;"></div>' +
                '<div style="flex:1;height:3px;background:#e5e7eb;border-radius:2px;"></div>' +
                '</div>' +
                '<div style="font-size:10px;color:#888;letter-spacing:1px;text-transform:uppercase;">Strong password</div>' +
                '</div>' +

                '<button style="width:100%;padding:18px;background:#1a1a1a;border:none;font-size:12px;color:#fff;cursor:pointer;font-weight:900;letter-spacing:4px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:20px;">SET NEW PASSWORD</button>' +

                '<div style="text-align:center;">' +
                '<a href="#" style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#aaa;text-decoration:none;">← BACK TO LOGIN</a>' +
                '</div>' +

                '</div>' +
                '</div>' +

                '</div>'
        },

        {
            id: 'login-reset-success',
            label: 'Login: Reset Password Success',
            category: 'Login Pages',
            content: '<div style="min-height:100vh;background:#fff;font-family:\'Helvetica Neue\',Arial,sans-serif;display:grid;grid-template-columns:1fr 580px;">' +

                // LEFT PANEL
                '<div style="background:#fff;padding:64px 72px;display:flex;flex-direction:column;justify-content:center;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#B90E0A;margin-bottom:28px;">BENCH APPAREL</div>' +
                '<h1 style="font-size:72px;font-weight:900;color:#1a1a1a;line-height:0.92;margin:0 0 24px;text-transform:uppercase;letter-spacing:-2px;">' +
                'WHERE<br/>FASHION<br/><span style="color:transparent;-webkit-text-stroke:3px #B90E0A;">MEETS</span><br/>SMART<br/>BUSINESS' +
                '</h1>' +
                '<p style="font-size:14px;color:#888;line-height:1.7;max-width:380px;margin:0;">Manage production, inventory, and operations with the power of Bench Apparel ERP.</p>' +
                '</div>' +

                // RIGHT PANEL
                '<div style="background:#f5f4f0;display:flex;align-items:center;justify-content:center;padding:64px 72px;">' +
                '<div style="width:100%;text-align:center;">' +

                // Success icon
                '<div style="width:72px;height:72px;background:#1a1a1a;border-radius:50%;margin:0 auto 28px;display:flex;align-items:center;justify-content:center;">' +
                '<span style="color:#fff;font-size:28px;">✓</span>' +
                '</div>' +

                '<h2 style="font-size:36px;font-weight:900;color:#1a1a1a;margin:0 0 10px;letter-spacing:-0.5px;">All done.</h2>' +
                '<p style="font-size:13px;color:#999;margin:0 0 12px;line-height:1.7;">Your password has been reset successfully.<br/>You can now sign in with your new credentials.</p>' +

                // Email hint
                '<div style="display:inline-block;background:#fff;border:1.5px solid #e5e7eb;border-radius:8px;padding:10px 20px;margin-bottom:36px;">' +
                '<span style="font-size:12px;color:#555;font-weight:600;">you@bench.com.ph</span>' +
                '</div>' +

                '<button style="width:100%;padding:18px;background:#1a1a1a;border:none;font-size:12px;color:#fff;cursor:pointer;font-weight:900;letter-spacing:4px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:20px;">GO TO LOGIN</button>' +

                '<div style="font-size:11px;color:#ccc;letter-spacing:1px;">Didn\'t request this? <a href="#" style="color:#B90E0A;text-decoration:none;font-weight:700;">Contact IT Support</a></div>' +

                '</div>' +
                '</div>' +

                '</div>'
        },

        // ── HR FORMS ─────────────────────────────────────────────────────

        {
            id: 'hr-form-onboarding',
            label: 'HR Form: New Employee Onboarding',
            category: 'HR Forms',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;padding:32px;">' +
                '<div style="max-width:800px;margin:0 auto;">' +
                '<div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);margin-bottom:20px;">' +
                '<div style="background:linear-gradient(135deg,#B90E0A,#7a0806);padding:28px 32px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:6px;">Bench Apparel Corporation</div><h1 style="font-size:22px;font-weight:800;color:#fff;margin:0;">New Employee Onboarding Form</h1><p style="font-size:12px;color:rgba(255,255,255,0.6);margin:4px 0 0;">Please complete all fields before your first day</p></div>' +
                '<div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:10px 16px;text-align:center;"><div style="font-size:10px;color:rgba(255,255,255,0.6);letter-spacing:1px;">FORM REF</div><div style="font-size:14px;font-weight:700;color:#fff;">HR-OB-2026</div></div>' +
                '</div>' +
                '<div style="padding:28px 32px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Personal Information</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Last Name *</label><input type="text" placeholder="Santos" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">First Name *</label><input type="text" placeholder="Maria" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Middle Name</label><input type="text" placeholder="Dela Cruz" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Date of Birth *</label><input type="date" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Civil Status *</label><select style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;background:#fff;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;"><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option></select></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Mobile Number *</label><input type="tel" placeholder="+63 9XX XXX XXXX" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '</div>' +
                '<div style="margin-bottom:20px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Home Address *</label><input type="text" placeholder="Street, Barangay, City, Province" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin:24px 0 16px;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Employment Details</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Position *</label><input type="text" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Branch *</label><select style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;background:#fff;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;"><option>SM Mall of Asia</option><option>BGC High Street</option><option>Cebu IT Park</option><option>Davao Abreeza</option></select></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Start Date *</label><input type="date" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '</div>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin:24px 0 16px;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Government IDs</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">SSS Number</label><input type="text" placeholder="XX-XXXXXXX-X" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">PhilHealth Number</label><input type="text" placeholder="XX-XXXXXXXXX-X" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:6px;">TIN Number</label><input type="text" placeholder="XXX-XXX-XXX" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;font-family:\'Helvetica Neue\',sans-serif;" /></div>' +
                '</div>' +
                '<div style="display:flex;justify-content:flex-end;gap:10px;">' +
                '<button style="padding:11px 24px;background:#f3f4f6;border:none;border-radius:8px;font-size:13px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">Save Draft</button>' +
                '<button style="padding:11px 28px;background:#B90E0A;border:none;border-radius:8px;font-size:13px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:700;">Submit Form</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-form-leave',
            label: 'HR Form: Leave Application',
            category: 'HR Forms',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:32px;">' +
                '<div style="width:100%;max-width:580px;">' +
                '<div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
                '<div style="background:#1a1a1a;padding:24px 28px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><h1 style="font-size:18px;font-weight:800;color:#fff;margin:0;">Leave Application</h1><p style="font-size:11px;color:#666;margin:3px 0 0;letter-spacing:1px;">BENCH APPAREL CORPORATION</p></div>' +
                '<div style="background:#B90E0A;color:#fff;padding:5px 12px;border-radius:5px;font-size:10px;font-weight:700;letter-spacing:1px;">HR-LA-2026</div>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Employee Name</label><input type="text" placeholder="Full Name" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Employee ID</label><input type="text" placeholder="BA-XXXX-XXXX" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Position</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Branch</label><select style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;background:#fff;box-sizing:border-box;"><option>SM Mall of Asia</option><option>BGC</option><option>Cebu</option><option>Davao</option></select></div>' +
                '</div>' +
                '<div style="margin-bottom:16px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px;">Leave Type *</label><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">' +
                '<label style="border:1.5px solid #e5e7eb;border-radius:8px;padding:12px;cursor:pointer;text-align:center;transition:all .15s;"><input type="radio" name="leave_type" style="display:none;" /><div style="font-size:18px;margin-bottom:4px;">🏖️</div><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Vacation</div><div style="font-size:10px;color:#aaa;margin-top:1px;">VL</div></label>' +
                '<label style="border:1.5px solid #B90E0A;border-radius:8px;padding:12px;cursor:pointer;text-align:center;background:#fff5f5;"><input type="radio" name="leave_type" checked style="display:none;" /><div style="font-size:18px;margin-bottom:4px;">🤒</div><div style="font-size:12px;font-weight:700;color:#B90E0A;">Sick Leave</div><div style="font-size:10px;color:#B90E0A;margin-top:1px;">SL</div></label>' +
                '<label style="border:1.5px solid #e5e7eb;border-radius:8px;padding:12px;cursor:pointer;text-align:center;"><input type="radio" name="leave_type" style="display:none;" /><div style="font-size:18px;margin-bottom:4px;">🚨</div><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Emergency</div><div style="font-size:10px;color:#aaa;margin-top:1px;">EL</div></label>' +
                '</div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Date From *</label><input type="date" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Date To *</label><input type="date" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '</div>' +
                '<div style="background:#f8fafc;border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;justify-content:space-between;font-size:13px;">' +
                '<span style="color:#555;">Total Days Requested:</span><span style="font-weight:700;color:#1a1a1a;">— days</span>' +
                '</div>' +
                '<div style="margin-bottom:16px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Reason</label><textarea placeholder="Brief reason for leave..." rows="3" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:#555;">' +
                '<div style="font-weight:700;margin-bottom:8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#888;">Leave Balance</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;">' +
                '<div style="background:#fff;border-radius:6px;padding:8px;"><div style="font-size:16px;font-weight:700;color:#1a1a1a;">7</div><div style="font-size:10px;color:#aaa;">VL remaining</div></div>' +
                '<div style="background:#fff;border-radius:6px;padding:8px;"><div style="font-size:16px;font-weight:700;color:#1a1a1a;">9</div><div style="font-size:10px;color:#aaa;">SL remaining</div></div>' +
                '<div style="background:#fff;border-radius:6px;padding:8px;"><div style="font-size:16px;font-weight:700;color:#1a1a1a;">3</div><div style="font-size:10px;color:#aaa;">EL remaining</div></div>' +
                '</div></div>' +
                '<div style="display:flex;gap:10px;">' +
                '<button style="flex:1;padding:12px;background:#f3f4f6;border:none;border-radius:8px;font-size:13px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">Cancel</button>' +
                '<button style="flex:2;padding:12px;background:#B90E0A;border:none;border-radius:8px;font-size:13px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:700;">Submit Application</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-form-overtime',
            label: 'HR Form: Overtime Request',
            category: 'HR Forms',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:32px;">' +
                '<div style="width:100%;max-width:540px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
                '<div style="background:linear-gradient(90deg,#1a1a1a,#333);padding:20px 28px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><h1 style="font-size:17px;font-weight:800;color:#fff;margin:0;">Overtime Request Form</h1><p style="font-size:11px;color:#666;margin:3px 0 0;">Bench Apparel Corporation — HR-OT-2026</p></div>' +
                '<div style="font-size:22px;">⏰</div>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Employee Name</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Employee ID</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Department</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Immediate Supervisor</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '</div>' +
                '<div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:14px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:12px;">OT Schedule</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;color:#6b7280;margin-bottom:5px;">Date</label><input type="date" style="width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;background:#fff;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;color:#6b7280;margin-bottom:5px;">Start Time</label><input type="time" style="width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;background:#fff;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;color:#6b7280;margin-bottom:5px;">End Time</label><input type="time" style="width:100%;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;background:#fff;" /></div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;margin-bottom:14px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center;">' +
                '<div><div style="font-size:11px;color:#9a3412;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">OT Hours</div><div style="font-size:20px;font-weight:800;color:#ea580c;">—</div></div>' +
                '<div><div style="font-size:11px;color:#9a3412;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">OT Rate</div><div style="font-size:20px;font-weight:800;color:#ea580c;">x1.25</div></div>' +
                '<div><div style="font-size:11px;color:#9a3412;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Est. Pay</div><div style="font-size:20px;font-weight:800;color:#ea580c;">—</div></div>' +
                '</div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Purpose / Work to be Accomplished *</label><textarea rows="3" placeholder="Describe the tasks to be completed during overtime..." style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '<div style="border-top:1px solid #f3f4f6;padding-top:16px;margin-bottom:20px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:10px;">Approvals Required</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="background:#f9fafb;border-radius:7px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;font-size:12px;"><span style="font-weight:600;">Immediate Supervisor</span><span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">PENDING</span></div>' +
                '<div style="background:#f9fafb;border-radius:7px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;font-size:12px;"><span style="font-weight:600;">HR Department</span><span style="background:#f3f4f6;color:#9ca3af;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">AWAITING</span></div>' +
                '</div></div>' +
                '<button style="width:100%;padding:13px;background:#B90E0A;border:none;border-radius:8px;font-size:14px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:700;">Submit OT Request</button>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-form-expense',
            label: 'HR Form: Expense Reimbursement',
            category: 'HR Forms',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;padding:32px;">' +
                '<div style="max-width:700px;margin:0 auto;">' +
                '<div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
                '<div style="background:#B90E0A;padding:22px 28px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><h1 style="font-size:18px;font-weight:800;color:#fff;margin:0;">Expense Reimbursement Form</h1><p style="font-size:11px;color:rgba(255,255,255,0.6);margin:3px 0 0;">Bench Apparel Corporation &mdash; HR-ER-2026</p></div>' +
                '<div style="font-size:28px;">🧾</div>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:20px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Employee Name</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Department</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Date Filed</label><input type="date" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '</div>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:10px;">Expense Items</div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">' +
                '<thead><tr style="background:#f9fafb;"><th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e5e7eb;">Date</th><th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e5e7eb;">Description</th><th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e5e7eb;">Category</th><th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e5e7eb;">Amount</th><th style="padding:10px 12px;text-align:center;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e5e7eb;">Receipt</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 12px;"><input type="date" style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;width:110px;outline:none;" /></td><td style="padding:10px 12px;"><input type="text" placeholder="e.g. Transportation to training" style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;width:100%;outline:none;box-sizing:border-box;" /></td><td style="padding:10px 12px;"><select style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;outline:none;background:#fff;"><option>Transport</option><option>Meals</option><option>Supplies</option><option>Other</option></select></td><td style="padding:10px 12px;text-align:right;"><input type="number" placeholder="0.00" style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;width:80px;outline:none;text-align:right;" /></td><td style="padding:10px 12px;text-align:center;"><input type="checkbox" style="accent-color:#B90E0A;" /></td></tr>' +
                '<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 12px;"><input type="date" style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;width:110px;outline:none;" /></td><td style="padding:10px 12px;"><input type="text" style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;width:100%;outline:none;box-sizing:border-box;" /></td><td style="padding:10px 12px;"><select style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;outline:none;background:#fff;"><option>Transport</option><option>Meals</option><option>Supplies</option><option>Other</option></select></td><td style="padding:10px 12px;text-align:right;"><input type="number" placeholder="0.00" style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;width:80px;outline:none;text-align:right;" /></td><td style="padding:10px 12px;text-align:center;"><input type="checkbox" style="accent-color:#B90E0A;" /></td></tr>' +
                '<tr><td style="padding:10px 12px;"><input type="date" style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;width:110px;outline:none;" /></td><td style="padding:10px 12px;"><input type="text" style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;width:100%;outline:none;box-sizing:border-box;" /></td><td style="padding:10px 12px;"><select style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;outline:none;background:#fff;"><option>Transport</option><option>Meals</option><option>Supplies</option><option>Other</option></select></td><td style="padding:10px 12px;text-align:right;"><input type="number" placeholder="0.00" style="border:1px solid #e5e7eb;border-radius:5px;padding:5px 8px;font-size:11px;width:80px;outline:none;text-align:right;" /></td><td style="padding:10px 12px;text-align:center;"><input type="checkbox" style="accent-color:#B90E0A;" /></td></tr>' +
                '</tbody></table>' +
                '<div style="display:flex;justify-content:flex-end;margin-bottom:20px;">' +
                '<div style="background:#1a1a1a;color:#fff;padding:14px 20px;border-radius:10px;text-align:right;min-width:200px;"><div style="font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Total Reimbursement</div><div style="font-size:22px;font-weight:800;">PHP 0.00</div></div>' +
                '</div>' +
                '<div style="margin-bottom:16px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Purpose / Notes</label><textarea rows="2" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '<div style="display:flex;gap:10px;">' +
                '<button style="flex:1;padding:12px;background:#f3f4f6;border:none;border-radius:8px;font-size:13px;color:#555;cursor:pointer;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;">Save Draft</button>' +
                '<button style="flex:2;padding:12px;background:#B90E0A;border:none;border-radius:8px;font-size:13px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">Submit for Approval</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-form-performance',
            label: 'HR Form: Performance Evaluation',
            category: 'HR Forms',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;padding:32px;">' +
                '<div style="max-width:720px;margin:0 auto;">' +
                '<div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
                '<div style="background:linear-gradient(135deg,#B90E0A 0%,#1a1a1a 100%);padding:24px 28px;">' +
                '<h1 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 4px;">Performance Evaluation Form</h1>' +
                '<p style="font-size:11px;color:rgba(255,255,255,0.5);margin:0;">Q1 2026 &mdash; Bench Apparel Corporation</p>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Employee Name</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Evaluator / Manager</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Position</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Review Period</label><input type="text" placeholder="Q1 2026 (Jan–Mar)" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '</div>' +
                '<div style="background:#f8fafc;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:11px;color:#6b7280;display:flex;gap:16px;">' +
                '<div><strong>1</strong> = Poor</div><div><strong>2</strong> = Below Expectations</div><div><strong>3</strong> = Meets Expectations</div><div><strong>4</strong> = Exceeds Expectations</div><div><strong>5</strong> = Outstanding</div>' +
                '</div>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:12px;">Performance Criteria</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">' +
                '<div style="background:#f9fafb;border-radius:8px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Job Knowledge</div><div style="font-size:11px;color:#aaa;margin-top:1px;">Understanding of role, skills, and responsibilities</div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">1</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">2</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">3</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #B90E0A;border-radius:6px;background:#B90E0A;font-size:12px;font-weight:700;cursor:pointer;color:#fff;">4</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">5</button>' +
                '</div></div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Attendance &amp; Punctuality</div><div style="font-size:11px;color:#aaa;margin-top:1px;">Timeliness and reliability in showing up for work</div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">1</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">2</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">3</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">4</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #B90E0A;border-radius:6px;background:#B90E0A;font-size:12px;font-weight:700;cursor:pointer;color:#fff;">5</button>' +
                '</div></div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Customer Service</div><div style="font-size:11px;color:#aaa;margin-top:1px;">Quality of interaction with customers and clients</div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">1</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">2</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #B90E0A;border-radius:6px;background:#B90E0A;font-size:12px;font-weight:700;cursor:pointer;color:#fff;">3</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">4</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">5</button>' +
                '</div></div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Teamwork &amp; Collaboration</div><div style="font-size:11px;color:#aaa;margin-top:1px;">Works effectively with team members</div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">1</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">2</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">3</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #B90E0A;border-radius:6px;background:#B90E0A;font-size:12px;font-weight:700;cursor:pointer;color:#fff;">4</button>' +
                '<button style="width:32px;height:32px;border:1.5px solid #e5e7eb;border-radius:6px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#555;">5</button>' +
                '</div></div>' +
                '</div>' +
                '<div style="background:#1a1a1a;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
                '<span style="font-size:13px;font-weight:600;color:#fff;">Overall Rating</span>' +
                '<span style="font-size:24px;font-weight:900;color:#B90E0A;">4.0 / 5.0</span>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Strengths</label><textarea rows="3" placeholder="Key strengths observed..." style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:12px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Areas for Improvement</label><textarea rows="3" placeholder="Recommended development areas..." style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:12px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '</div>' +
                '<div style="display:flex;gap:10px;">' +
                '<button style="flex:1;padding:12px;background:#f3f4f6;border:none;border-radius:8px;font-size:13px;color:#555;cursor:pointer;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;">Save Draft</button>' +
                '<button style="flex:2;padding:12px;background:#B90E0A;border:none;border-radius:8px;font-size:13px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">Submit Evaluation</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-form-incident',
            label: 'HR Form: Incident / Misconduct Report',
            category: 'HR Forms',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;padding:32px;">' +
                '<div style="max-width:680px;margin:0 auto;">' +
                '<div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
                '<div style="background:#1a1a1a;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><h1 style="font-size:17px;font-weight:800;color:#fff;margin:0;">Incident / Misconduct Report</h1><p style="font-size:11px;color:#555;margin:3px 0 0;letter-spacing:1px;">BENCH APPAREL — STRICTLY CONFIDENTIAL</p></div>' +
                '<div style="background:#ef4444;color:#fff;padding:5px 12px;border-radius:5px;font-size:10px;font-weight:700;letter-spacing:1px;">CONFIDENTIAL</div>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="background:#fee2e2;border:1px solid #fca5a5;border-left:3px solid #ef4444;border-radius:7px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#b91c1c;">⚠ This form is for reporting workplace incidents, policy violations, or misconduct. All submissions are confidential and will be reviewed by the HR Department.</div>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:10px;">Reporter Information</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Your Name (or Anonymous)</label><input type="text" placeholder="Leave blank to report anonymously" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Date of Incident</label><input type="date" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '</div>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:10px;">Person Involved</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:18px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Name</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Position</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Branch</label><select style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;background:#fff;box-sizing:border-box;"><option>SM MOA</option><option>BGC</option><option>Cebu</option><option>Davao</option></select></div>' +
                '</div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px;">Type of Incident</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">' +
                '<label style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><input type="checkbox" style="accent-color:#B90E0A;" /><span>Misconduct / Insubordination</span></label>' +
                '<label style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><input type="checkbox" style="accent-color:#B90E0A;" /><span>Theft / Fraud</span></label>' +
                '<label style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><input type="checkbox" style="accent-color:#B90E0A;" /><span>Harassment / Bullying</span></label>' +
                '<label style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><input type="checkbox" style="accent-color:#B90E0A;" /><span>Safety Violation</span></label>' +
                '<label style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><input type="checkbox" style="accent-color:#B90E0A;" /><span>Policy Violation</span></label>' +
                '<label style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><input type="checkbox" style="accent-color:#B90E0A;" /><span>Other</span></label>' +
                '</div></div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Full Description of Incident *</label><textarea rows="5" placeholder="Describe what happened in detail. Include date, time, location, what was said or done, and any witnesses." style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '<div style="margin-bottom:20px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Witnesses (if any)</label><input type="text" placeholder="Names of witnesses separated by comma" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<button style="width:100%;padding:13px;background:#ef4444;border:none;border-radius:8px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">Submit Report to HR</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-form-jobapp',
            label: 'HR Form: Job Application',
            category: 'HR Forms',
            content: (function(){
                return '<div style="min-height:100vh;background:#f8fafc;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:linear-gradient(135deg,#B90E0A,#7a0806);padding:40px 48px;text-align:center;">' +
                '<div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:2px;">BENCH APPAREL</div>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Join Our Team &mdash; Application Form</div>' +
                '</div>' +
                '<div style="max-width:700px;margin:0 auto;padding:32px 24px;">' +
                '<div style="background:#fff;border-radius:14px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.07);margin-bottom:16px;">' +
                '<div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:16px;">Position Applied For</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Position *</label><input type="text" placeholder="e.g. Sales Associate" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Preferred Branch</label><select style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;background:#fff;box-sizing:border-box;"><option>No Preference</option><option>SM Mall of Asia</option><option>BGC High Street</option><option>Cebu IT Park</option><option>Davao Abreeza</option></select></div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:14px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.07);margin-bottom:16px;">' +
                '<div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:16px;">Personal Information</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:14px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Last Name *</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">First Name *</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Date of Birth *</label><input type="date" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Email *</label><input type="email" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Mobile *</label><input type="tel" placeholder="+63" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Civil Status</label><select style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;background:#fff;box-sizing:border-box;"><option>Single</option><option>Married</option></select></div>' +
                '</div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Address *</label><input type="text" placeholder="Full address" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:14px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.07);margin-bottom:16px;">' +
                '<div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:16px;">Education &amp; Experience</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Highest Education</label><select style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;background:#fff;box-sizing:border-box;"><option>High School Graduate</option><option>Vocational</option><option>College Graduate</option><option>Post-Graduate</option></select></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">School / University</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '</div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Relevant Work Experience</label><textarea rows="3" placeholder="List previous relevant work experience..." style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '</div>' +
                '<button style="width:100%;padding:14px;background:#B90E0A;border:none;border-radius:10px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;box-shadow:0 4px 16px rgba(185,14,10,0.3);">Submit Application</button>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-form-complaint',
            label: 'HR Form: Employee Complaint',
            category: 'HR Forms',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:32px;">' +
                '<div style="width:100%;max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
                '<div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:22px 28px;">' +
                '<h1 style="font-size:17px;font-weight:800;color:#fff;margin:0 0 3px;">Employee Complaint Form</h1>' +
                '<p style="font-size:11px;color:#555;margin:0;">Bench Apparel — HR Department — Confidential</p>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:3px solid #3b82f6;border-radius:7px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#1e40af;">ℹ All complaints are handled confidentially. Retaliation against any employee who files a complaint in good faith is strictly prohibited.</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Your Name</label><input type="text" placeholder="Optional — may remain anonymous" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Date Submitted</label><input type="date" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '</div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px;">Nature of Complaint</label><div style="display:flex;flex-direction:column;gap:7px;">' +
                '<label style="display:flex;align-items:center;gap:9px;padding:10px 13px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;font-size:13px;"><input type="radio" name="complaint" style="accent-color:#B90E0A;" /><span>Workplace Harassment or Bullying</span></label>' +
                '<label style="display:flex;align-items:center;gap:9px;padding:10px 13px;border:1.5px solid #B90E0A;border-radius:7px;cursor:pointer;font-size:13px;background:#fff5f5;"><input type="radio" name="complaint" checked style="accent-color:#B90E0A;" /><span>Unfair Treatment / Discrimination</span></label>' +
                '<label style="display:flex;align-items:center;gap:9px;padding:10px 13px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;font-size:13px;"><input type="radio" name="complaint" style="accent-color:#B90E0A;" /><span>Unsafe Working Conditions</span></label>' +
                '<label style="display:flex;align-items:center;gap:9px;padding:10px 13px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;font-size:13px;"><input type="radio" name="complaint" style="accent-color:#B90E0A;" /><span>Payroll / Compensation Issue</span></label>' +
                '<label style="display:flex;align-items:center;gap:9px;padding:10px 13px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;font-size:13px;"><input type="radio" name="complaint" style="accent-color:#B90E0A;" /><span>Other Concern</span></label>' +
                '</div></div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Person the Complaint Is Against (if applicable)</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Full Description of Complaint *</label><textarea rows="5" placeholder="Please describe the situation in detail. Include specific dates, incidents, and impact on you or others." style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '<div style="margin-bottom:20px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Desired Resolution</label><textarea rows="2" placeholder="What outcome are you hoping for?" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '<button style="width:100%;padding:13px;background:#1a1a1a;border:none;border-radius:8px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">Submit Complaint</button>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-form-transfer',
            label: 'HR Form: Branch Transfer Request',
            category: 'HR Forms',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:32px;">' +
                '<div style="width:100%;max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">' +
                '<div style="background:#B90E0A;padding:22px 28px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.08);"></div>' +
                '<h1 style="font-size:17px;font-weight:800;color:#fff;margin:0 0 3px;position:relative;">Branch Transfer Request</h1>' +
                '<p style="font-size:11px;color:rgba(255,255,255,0.6);margin:0;position:relative;">Bench Apparel Corporation — HR-BTR-2026</p>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Employee Name</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Employee ID</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Position</label><input type="text" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Date Filed</label><input type="date" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;" /></div>' +
                '</div>' +
                '<div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:16px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:12px;">Transfer Details</div>' +
                '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;">' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Current Branch</label><select style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;background:#fff;box-sizing:border-box;"><option>SM Mall of Asia</option><option>BGC High Street</option><option>Cebu IT Park</option><option>Davao Abreeza</option></select></div>' +
                '<div style="text-align:center;font-size:20px;color:#B90E0A;margin-top:16px;">→</div>' +
                '<div><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Requested Branch</label><select style="width:100%;padding:10px 12px;border:1.5px solid #B90E0A;border-radius:7px;font-size:13px;outline:none;background:#fff5f5;box-sizing:border-box;"><option>BGC High Street</option><option>SM Mall of Asia</option><option>Cebu IT Park</option><option>Davao Abreeza</option></select></div>' +
                '</div>' +
                '<div style="margin-top:12px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Requested Effective Date</label><input type="date" style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;background:#fff;" /></div>' +
                '</div>' +
                '<div style="margin-bottom:14px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px;">Reason for Transfer Request</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:10px;">' +
                '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><input type="radio" name="reason" style="accent-color:#B90E0A;" /><span>Personal / Family reasons</span></label>' +
                '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1.5px solid #B90E0A;background:#fff5f5;border-radius:7px;cursor:pointer;"><input type="radio" name="reason" checked style="accent-color:#B90E0A;" /><span>Proximity to residence</span></label>' +
                '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><input type="radio" name="reason" style="accent-color:#B90E0A;" /><span>Career growth opportunity</span></label>' +
                '<label style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:7px;cursor:pointer;"><input type="radio" name="reason" style="accent-color:#B90E0A;" /><span>Other</span></label>' +
                '</div></div>' +
                '<div style="margin-bottom:20px;"><label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:5px;">Additional Details</label><textarea rows="3" placeholder="Provide any additional context for your request..." style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:7px;font-size:13px;outline:none;box-sizing:border-box;resize:none;font-family:\'Helvetica Neue\',sans-serif;"></textarea></div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:11px;color:#666;">' +
                '<div style="font-weight:700;margin-bottom:6px;font-size:10px;letter-spacing:1px;text-transform:uppercase;">Approval Flow</div>' +
                '<div style="display:flex;gap:0;align-items:center;">' +
                '<div style="text-align:center;flex:1;"><div style="width:28px;height:28px;background:#B90E0A;border-radius:50%;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">1</div><div style="font-size:10px;color:#555;">Supervisor</div></div>' +
                '<div style="flex:1;height:2px;background:#e5e7eb;"></div>' +
                '<div style="text-align:center;flex:1;"><div style="width:28px;height:28px;background:#e5e7eb;border-radius:50%;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:11px;font-weight:700;">2</div><div style="font-size:10px;color:#aaa;">HR Dept</div></div>' +
                '<div style="flex:1;height:2px;background:#e5e7eb;"></div>' +
                '<div style="text-align:center;flex:1;"><div style="width:28px;height:28px;background:#e5e7eb;border-radius:50%;margin:0 auto 4px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:11px;font-weight:700;">3</div><div style="font-size:10px;color:#aaa;">Branch Mgr</div></div>' +
                '</div></div>' +
                '<button style="width:100%;padding:13px;background:#B90E0A;border:none;border-radius:8px;font-size:14px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">Submit Transfer Request</button>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        // ── HR SCREEN / UI PAGES ─────────────────────────────────────────

        {
            id: 'hr-screen-directory',
            label: 'HR Screen: Employee Directory',
            category: 'HR Screens',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,0.05);">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:32px;height:32px;background:#B90E0A;border-radius:7px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:13px;">B</span></div><span style="font-size:14px;font-weight:700;color:#1a1a1a;">Employee Directory</span></div>' +
                '<button style="padding:7px 16px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;">+ Add Employee</button>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">' +
                '<div style="flex:1;min-width:240px;background:#fff;border:1.5px solid #e5e7eb;border-radius:9px;padding:10px 14px;display:flex;align-items:center;gap:8px;"><span style="color:#aaa;font-size:14px;">🔍</span><input placeholder="Search by name, ID, or role..." style="border:none;outline:none;font-size:13px;flex:1;font-family:\'Helvetica Neue\',sans-serif;color:#1a1a1a;" /></div>' +
                '<select style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:13px;outline:none;background:#fff;font-family:\'Helvetica Neue\',sans-serif;color:#555;cursor:pointer;"><option>All Branches</option><option>SM MOA</option><option>BGC</option><option>Cebu</option><option>Davao</option></select>' +
                '<select style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:13px;outline:none;background:#fff;font-family:\'Helvetica Neue\',sans-serif;color:#555;cursor:pointer;"><option>All Roles</option><option>Manager</option><option>Sales Associate</option><option>Cashier</option></select>' +
                '<select style="padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:13px;outline:none;background:#fff;font-family:\'Helvetica Neue\',sans-serif;color:#555;cursor:pointer;"><option>All Status</option><option>Active</option><option>On Leave</option><option>Probation</option></select>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;">' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#B90E0A,#7a0806);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;">MS</div>' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;">Maria Santos</div><div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:1px;">Sr. Sales Assoc.</div><div style="font-size:10px;color:#aaa;margin-top:1px;">SM MOA</div>' +
                '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #f3f4f6;display:flex;justify-content:center;gap:5px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;">ACTIVE</span><span style="background:#f3f4f6;color:#6b7280;padding:2px 7px;border-radius:20px;font-size:9px;">FT</span></div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#0f2040);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;">JC</div>' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;">Juan dela Cruz</div><div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:1px;">Branch Manager</div><div style="font-size:10px;color:#aaa;margin-top:1px;">BGC</div>' +
                '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #f3f4f6;display:flex;justify-content:center;gap:5px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;">ACTIVE</span><span style="background:#f3f4f6;color:#6b7280;padding:2px 7px;border-radius:20px;font-size:9px;">FT</span></div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#064e3b,#022c22);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;">AR</div>' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;">Ana Reyes</div><div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:1px;">Visual Merch.</div><div style="font-size:10px;color:#aaa;margin-top:1px;">Cebu</div>' +
                '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #f3f4f6;display:flex;justify-content:center;gap:5px;"><span style="background:#fef9c3;color:#ca8a04;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;">ON LEAVE</span></div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#4c1d95,#2e1065);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;">PG</div>' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;">Pedro Gomez</div><div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:1px;">Stock Clerk</div><div style="font-size:10px;color:#aaa;margin-top:1px;">Davao</div>' +
                '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #f3f4f6;display:flex;justify-content:center;gap:5px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;">ACTIVE</span><span style="background:#f3f4f6;color:#6b7280;padding:2px 7px;border-radius:20px;font-size:9px;">PT</span></div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#92400e,#451a03);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:16px;">LT</div>' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;">Lisa Tan</div><div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:1px;">HR Coordinator</div><div style="font-size:10px;color:#aaa;margin-top:1px;">Head Office</div>' +
                '<div style="margin-top:10px;padding-top:10px;border-top:1px solid #f3f4f6;display:flex;justify-content:center;gap:5px;"><span style="background:#fef9c3;color:#ca8a04;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;">PROBATION</span></div></div>' +
                '</div>' +
                '<div style="text-align:center;margin-top:16px;font-size:12px;color:#aaa;">Showing 5 of 1,240 employees &nbsp;·&nbsp; <a href="#" style="color:#B90E0A;text-decoration:none;font-weight:500;">Load more</a></div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-screen-profile',
            label: 'HR Screen: Employee Profile',
            category: 'HR Screens',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:54px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:8px;"><a href="#" style="font-size:13px;color:#aaa;text-decoration:none;">← Employees</a><span style="color:#e5e7eb;">/</span><span style="font-size:13px;color:#1a1a1a;font-weight:600;">Maria Santos</span></div>' +
                '<div style="display:flex;gap:8px;"><button style="padding:7px 14px;background:#f3f4f6;border:none;border-radius:7px;font-size:12px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Edit Profile</button><button style="padding:7px 14px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">Print 201 File</button></div>' +
                '</div>' +
                '<div style="padding:24px 28px;display:grid;grid-template-columns:280px 1fr;gap:20px;">' +
                '<div style="display:flex;flex-direction:column;gap:14px;">' +
                '<div style="background:#fff;border-radius:14px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#B90E0A,#7a0806);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:22px;">MS</div>' +
                '<div style="font-size:16px;font-weight:800;color:#1a1a1a;">Maria Santos</div>' +
                '<div style="font-size:12px;color:#B90E0A;font-weight:600;margin-top:2px;">Sr. Sales Associate</div>' +
                '<div style="font-size:11px;color:#aaa;margin-top:2px;">SM Mall of Asia</div>' +
                '<span style="display:inline-block;background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;margin-top:10px;">ACTIVE</span>' +
                '</div>' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin-bottom:12px;font-weight:600;">Quick Info</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;font-size:12px;">' +
                '<div style="display:flex;justify-content:space-between;"><span style="color:#888;">Employee ID</span><span style="font-weight:700;color:#1a1a1a;">BA-2021-0042</span></div>' +
                '<div style="display:flex;justify-content:space-between;"><span style="color:#888;">Date Hired</span><span style="font-weight:600;color:#1a1a1a;">Mar 1, 2021</span></div>' +
                '<div style="display:flex;justify-content:space-between;"><span style="color:#888;">Employment</span><span style="font-weight:600;color:#1a1a1a;">Regular / FT</span></div>' +
                '<div style="display:flex;justify-content:space-between;"><span style="color:#888;">Years in Company</span><span style="font-weight:600;color:#1a1a1a;">5 yrs 3 mos</span></div>' +
                '<div style="display:flex;justify-content:space-between;"><span style="color:#888;">Basic Salary</span><span style="font-weight:700;color:#B90E0A;">PHP 18,000</span></div>' +
                '</div></div>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:14px;">' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:14px;">Personal Information</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;font-size:12px;">' +
                '<div><div style="color:#aaa;margin-bottom:2px;">Full Name</div><div style="font-weight:600;color:#1a1a1a;">Maria Dela Cruz Santos</div></div>' +
                '<div><div style="color:#aaa;margin-bottom:2px;">Date of Birth</div><div style="font-weight:600;color:#1a1a1a;">April 12, 1998</div></div>' +
                '<div><div style="color:#aaa;margin-bottom:2px;">Civil Status</div><div style="font-weight:600;color:#1a1a1a;">Single</div></div>' +
                '<div><div style="color:#aaa;margin-bottom:2px;">Mobile</div><div style="font-weight:600;color:#1a1a1a;">+63 917 123 4567</div></div>' +
                '<div><div style="color:#aaa;margin-bottom:2px;">Email</div><div style="font-weight:600;color:#1a1a1a;">maria@email.com</div></div>' +
                '<div><div style="color:#aaa;margin-bottom:2px;">Address</div><div style="font-weight:600;color:#1a1a1a;">45 Rizal St., QC</div></div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:14px;">Government IDs</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;font-size:12px;">' +
                '<div><div style="color:#aaa;margin-bottom:2px;">SSS</div><div style="font-weight:600;color:#1a1a1a;">06-1234567-8</div></div>' +
                '<div><div style="color:#aaa;margin-bottom:2px;">PhilHealth</div><div style="font-weight:600;color:#1a1a1a;">12-345678901-2</div></div>' +
                '<div><div style="color:#aaa;margin-bottom:2px;">Pag-IBIG</div><div style="font-weight:600;color:#1a1a1a;">1234-5678-9012</div></div>' +
                '<div><div style="color:#aaa;margin-bottom:2px;">TIN</div><div style="font-weight:600;color:#1a1a1a;">123-456-789</div></div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:14px;">Performance Snapshot</div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#B90E0A;">4.9</div><div style="font-size:10px;color:#aaa;margin-top:2px;">Latest Rating</div></div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#1a1a1a;">7</div><div style="font-size:10px;color:#aaa;margin-top:2px;">VL Remaining</div></div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#22c55e;">98%</div><div style="font-size:10px;color:#aaa;margin-top:2px;">Attendance</div></div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:20px;font-weight:800;color:#1a1a1a;">0</div><div style="font-size:10px;color:#aaa;margin-top:2px;">Warnings</div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-screen-payroll',
            label: 'HR Screen: Payroll Processing',
            category: 'HR Screens',
            content: (function(){
                return '<div style="min-height:100vh;background:#0d0d0d;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#fff;">' +
                '<div style="background:#111;border-bottom:1px solid #1f1f1f;padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:34px;height:34px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div><span style="font-size:14px;font-weight:700;">Payroll Processing</span></div>' +
                '<div style="display:flex;gap:8px;"><span style="display:inline-flex;align-items:center;gap:6px;background:#fef9c3;color:#92400e;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:700;">⏳ March 2026 — DRAFT</span><button style="padding:7px 14px;background:#22c55e;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">Run Payroll</button></div>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:22px;">' +
                '<div style="background:linear-gradient(135deg,#B90E0A,#7a0806);border-radius:12px;padding:18px;"><div style="font-size:10px;color:rgba(255,255,255,0.6);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Gross Payroll</div><div style="font-size:24px;font-weight:800;">PHP 22.4M</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;">1,240 employees</div></div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px;"><div style="font-size:10px;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Deductions</div><div style="font-size:24px;font-weight:800;color:#ef4444;">PHP 1.86M</div><div style="font-size:11px;color:#555;margin-top:4px;">SSS + PhilHealth + Pag-IBIG</div></div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px;"><div style="font-size:10px;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Net Pay</div><div style="font-size:24px;font-weight:800;color:#22c55e;">PHP 20.54M</div><div style="font-size:11px;color:#555;margin-top:4px;">Pay date: Mar 5, 2026</div></div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px;"><div style="font-size:10px;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Status</div><div style="font-size:14px;font-weight:700;color:#f59e0b;margin-top:8px;">⏳ Draft</div><div style="font-size:11px;color:#555;margin-top:4px;">Awaiting final approval</div></div>' +
                '</div>' +
                '<div style="background:#111;border:1px solid #1f1f1f;border-radius:14px;overflow:hidden;">' +
                '<div style="padding:16px 20px;border-bottom:1px solid #1f1f1f;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:14px;font-weight:700;">Payroll Ledger</span>' +
                '<div style="display:flex;gap:8px;"><input placeholder="Search employee..." style="padding:7px 12px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;color:#fff;font-size:12px;outline:none;font-family:\'Helvetica Neue\',sans-serif;width:200px;" /><select style="padding:7px 12px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;color:#aaa;font-size:12px;outline:none;"><option>All Branches</option><option>SM MOA</option><option>BGC</option></select></div>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="border-bottom:1px solid #1f1f1f;"><th style="padding:11px 20px;text-align:left;font-size:10px;letter-spacing:1px;color:#555;font-weight:600;text-transform:uppercase;">Employee</th><th style="padding:11px;text-align:left;font-size:10px;letter-spacing:1px;color:#555;font-weight:600;text-transform:uppercase;">Branch</th><th style="padding:11px;text-align:right;font-size:10px;letter-spacing:1px;color:#555;font-weight:600;text-transform:uppercase;">Basic</th><th style="padding:11px;text-align:right;font-size:10px;letter-spacing:1px;color:#555;font-weight:600;text-transform:uppercase;">Allowances</th><th style="padding:11px;text-align:right;font-size:10px;letter-spacing:1px;color:#555;font-weight:600;text-transform:uppercase;">Deductions</th><th style="padding:11px;text-align:right;font-size:10px;letter-spacing:1px;color:#555;font-weight:600;text-transform:uppercase;">Net Pay</th><th style="padding:11px;text-align:center;font-size:10px;letter-spacing:1px;color:#555;font-weight:600;text-transform:uppercase;">Status</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:12px 20px;"><div style="font-weight:600;color:#fff;">Maria Santos</div><div style="font-size:10px;color:#555;margin-top:1px;">BA-2021-0042</div></td><td style="padding:12px;color:#888;">SM MOA</td><td style="padding:12px;text-align:right;color:#fff;">PHP 18,000</td><td style="padding:12px;text-align:right;color:#22c55e;">+PHP 2,300</td><td style="padding:12px;text-align:right;color:#ef4444;">-PHP 1,500</td><td style="padding:12px;text-align:right;font-weight:700;color:#fff;">PHP 18,800</td><td style="padding:12px;text-align:center;"><span style="background:#1c3a1c;color:#22c55e;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">READY</span></td></tr>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:12px 20px;"><div style="font-weight:600;color:#fff;">Juan dela Cruz</div><div style="font-size:10px;color:#555;margin-top:1px;">BA-2019-0018</div></td><td style="padding:12px;color:#888;">BGC</td><td style="padding:12px;text-align:right;color:#fff;">PHP 32,000</td><td style="padding:12px;text-align:right;color:#22c55e;">+PHP 5,000</td><td style="padding:12px;text-align:right;color:#ef4444;">-PHP 2,100</td><td style="padding:12px;text-align:right;font-weight:700;color:#fff;">PHP 34,900</td><td style="padding:12px;text-align:center;"><span style="background:#1c3a1c;color:#22c55e;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">READY</span></td></tr>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:12px 20px;"><div style="font-weight:600;color:#fff;">Ana Reyes</div><div style="font-size:10px;color:#555;margin-top:1px;">BA-2022-0071</div></td><td style="padding:12px;color:#888;">Cebu</td><td style="padding:12px;text-align:right;color:#fff;">PHP 22,000</td><td style="padding:12px;text-align:right;color:#22c55e;">+PHP 1,500</td><td style="padding:12px;text-align:right;color:#ef4444;">-PHP 1,600</td><td style="padding:12px;text-align:right;font-weight:700;color:#fff;">PHP 21,900</td><td style="padding:12px;text-align:center;"><span style="background:#3a2800;color:#f59e0b;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">REVIEW</span></td></tr>' +
                '</tbody></table></div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-screen-leave-calendar',
            label: 'HR Screen: Leave Calendar',
            category: 'HR Screens',
            content: (function(){
                return '<div style="min-height:100vh;background:#f8fafc;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:32px;height:32px;background:#B90E0A;border-radius:7px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:13px;">B</span></div><span style="font-size:14px;font-weight:700;color:#1a1a1a;">Leave Management</span></div>' +
                '<div style="display:flex;gap:8px;"><button style="padding:7px 14px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:7px;font-size:12px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">← Feb</button><button style="padding:7px 14px;background:#1a1a1a;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;">March 2026</button><button style="padding:7px 14px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:7px;font-size:12px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Apr →</button></div>' +
                '</div>' +
                '<div style="padding:20px 28px;display:grid;grid-template-columns:1fr 320px;gap:20px;">' +
                '<div style="background:#fff;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">' +
                '<div style="display:grid;grid-template-columns:repeat(7,1fr);background:#f9fafb;border-bottom:1px solid #f3f4f6;">' +
                '<div style="padding:12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;">Sun</div><div style="padding:12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;">Mon</div><div style="padding:12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;">Tue</div><div style="padding:12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;">Wed</div><div style="padding:12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;">Thu</div><div style="padding:12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;">Fri</div><div style="padding:12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#aaa;">Sat</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(7,1fr);grid-auto-rows:80px;">' +
                '<div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:11px;color:#ccc;">23</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:11px;color:#ccc;">24</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:11px;color:#ccc;">25</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:11px;color:#ccc;">26</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:11px;color:#ccc;">27</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:11px;color:#ccc;">28</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">1</span></div>' +
                '<div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">2</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">3</span></div><div style="border:1px solid #f3f4f6;padding:8px;background:#fff5f5;"><span style="font-size:12px;color:#B90E0A;font-weight:800;">4</span><div style="background:#B90E0A;color:#fff;border-radius:3px;padding:2px 4px;font-size:9px;margin-top:2px;font-weight:700;">A. Reyes VL</div></div><div style="border:1px solid #f3f4f6;padding:8px;background:#fff5f5;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">5</span><div style="background:#B90E0A;color:#fff;border-radius:3px;padding:2px 4px;font-size:9px;margin-top:2px;font-weight:700;">A. Reyes VL</div></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">6</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">7</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">8</span></div>' +
                '<div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">9</span></div><div style="border:1px solid #f3f4f6;padding:8px;background:#eff6ff;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">10</span><div style="background:#3b82f6;color:#fff;border-radius:3px;padding:2px 4px;font-size:9px;margin-top:2px;font-weight:700;">M. Santos VL</div></div><div style="border:1px solid #f3f4f6;padding:8px;background:#eff6ff;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">11</span><div style="background:#3b82f6;color:#fff;border-radius:3px;padding:2px 4px;font-size:9px;margin-top:2px;font-weight:700;">M. Santos VL</div></div><div style="border:1px solid #f3f4f6;padding:8px;background:#eff6ff;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">12</span><div style="background:#3b82f6;color:#fff;border-radius:3px;padding:2px 4px;font-size:9px;margin-top:2px;font-weight:700;">M. Santos VL</div></div><div style="border:1px solid #f3f4f6;padding:8px;background:#f0fdf4;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">13</span><div style="background:#22c55e;color:#fff;border-radius:3px;padding:2px 4px;font-size:9px;margin-top:2px;font-weight:700;">J. Cruz SL</div></div><div style="border:1px solid #f3f4f6;padding:8px;background:#f0fdf4;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">14</span><div style="background:#22c55e;color:#fff;border-radius:3px;padding:2px 4px;font-size:9px;margin-top:2px;font-weight:700;">J. Cruz SL</div></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">15</span></div>' +
                '<div style="border:1px solid #f3f4f6;padding:8px;"></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">17</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">18</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">19</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">20</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">21</span></div><div style="border:1px solid #f3f4f6;padding:8px;"><span style="font-size:12px;color:#1a1a1a;font-weight:700;">22</span></div>' +
                '</div></div>' +
                '<div style="display:flex;flex-direction:column;gap:14px;">' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:12px;">On Leave This Week</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#fee2e2;border-radius:8px;"><div style="width:30px;height:30px;border-radius:50%;background:#B90E0A;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:700;">AR</div><div><div style="font-size:12px;font-weight:600;">Ana Reyes</div><div style="font-size:10px;color:#B90E0A;">Vacation Leave · Mar 4–5</div></div></div>' +
                '<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#f0fdf4;border-radius:8px;"><div style="width:30px;height:30px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;font-weight:700;">JC</div><div><div style="font-size:12px;font-weight:600;">Jose Cruz</div><div style="font-size:10px;color:#16a34a;">Sick Leave · Mar 5–6</div></div></div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:12px;">Pending Approvals</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="border:1px solid #f3f4f6;border-radius:8px;padding:10px;"><div style="font-size:12px;font-weight:600;margin-bottom:4px;">Maria Santos</div><div style="font-size:11px;color:#aaa;margin-bottom:8px;">Vacation · Mar 10–14 · 5 days</div><div style="display:flex;gap:6px;"><button style="flex:1;padding:5px;background:#dcfce7;border:none;border-radius:5px;color:#16a34a;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Approve</button><button style="flex:1;padding:5px;background:#fee2e2;border:none;border-radius:5px;color:#dc2626;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Decline</button></div></div>' +
                '</div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<div style="flex:1;display:flex;align-items:center;gap:6px;font-size:11px;color:#555;"><div style="width:10px;height:10px;background:#B90E0A;border-radius:2px;"></div>Vacation</div>' +
                '<div style="flex:1;display:flex;align-items:center;gap:6px;font-size:11px;color:#555;"><div style="width:10px;height:10px;background:#22c55e;border-radius:2px;"></div>Sick</div>' +
                '<div style="flex:1;display:flex;align-items:center;gap:6px;font-size:11px;color:#555;"><div style="width:10px;height:10px;background:#3b82f6;border-radius:2px;"></div>Emergency</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-screen-recruitment',
            label: 'HR Screen: Job Posting / Recruitment',
            category: 'HR Screens',
            content: (function(){
                return '<div style="min-height:100vh;background:#f8fafc;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:32px;height:32px;background:#B90E0A;border-radius:7px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:13px;">B</span></div><span style="font-size:14px;font-weight:700;color:#1a1a1a;">Recruitment</span></div>' +
                '<div style="display:flex;gap:8px;"><button style="padding:7px 14px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:7px;font-size:12px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">View Applications</button><button style="padding:7px 16px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;">+ Post New Job</button></div>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:22px;">' +
                '<div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #B90E0A;"><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Open Positions</div><div style="font-size:24px;font-weight:800;color:#1a1a1a;">14</div><div style="font-size:11px;color:#B90E0A;margin-top:2px;">3 urgent</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #3b82f6;"><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Total Applicants</div><div style="font-size:24px;font-weight:800;color:#1a1a1a;">284</div><div style="font-size:11px;color:#3b82f6;margin-top:2px;">+42 this week</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #f59e0b;"><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Interviews This Week</div><div style="font-size:24px;font-weight:800;color:#1a1a1a;">12</div><div style="font-size:11px;color:#f59e0b;margin-top:2px;">4 today</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #22c55e;"><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Hired This Month</div><div style="font-size:24px;font-weight:800;color:#1a1a1a;">8</div><div style="font-size:11px;color:#22c55e;margin-top:2px;">Goal: 12</div></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 340px;gap:18px;">' +
                '<div><div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:12px;">Active Job Postings</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="background:#fff;border-radius:12px;padding:16px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:14px;font-weight:700;color:#1a1a1a;">Sales Associate</span><span style="background:#fee2e2;color:#B90E0A;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;">URGENT</span></div><div style="font-size:12px;color:#888;">SM Mall of Asia &bull; Full-time &bull; PHP 16,000–18,000</div><div style="font-size:11px;color:#aaa;margin-top:3px;">Posted Mar 1 &bull; 48 applicants</div></div>' +
                '<div style="display:flex;gap:6px;"><button style="padding:6px 12px;background:#f3f4f6;border:none;border-radius:6px;font-size:11px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">View</button><button style="padding:6px 12px;background:#1a1a1a;border:none;border-radius:6px;font-size:11px;color:#fff;cursor:pointer;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;">Pipeline</button></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:16px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="font-size:14px;font-weight:700;color:#1a1a1a;">Branch Manager</span><span style="background:#fee2e2;color:#B90E0A;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;">URGENT</span></div><div style="font-size:12px;color:#888;">Davao Abreeza &bull; Full-time &bull; PHP 45,000–55,000</div><div style="font-size:11px;color:#aaa;margin-top:3px;">Posted Feb 20 &bull; 22 applicants</div></div>' +
                '<div style="display:flex;gap:6px;"><button style="padding:6px 12px;background:#f3f4f6;border:none;border-radius:6px;font-size:11px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">View</button><button style="padding:6px 12px;background:#1a1a1a;border:none;border-radius:6px;font-size:11px;color:#fff;cursor:pointer;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;">Pipeline</button></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:16px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Visual Merchandiser</div><div style="font-size:12px;color:#888;">BGC High Street &bull; Full-time &bull; PHP 22,000–26,000</div><div style="font-size:11px;color:#aaa;margin-top:3px;">Posted Feb 28 &bull; 31 applicants</div></div>' +
                '<div style="display:flex;gap:6px;"><button style="padding:6px 12px;background:#f3f4f6;border:none;border-radius:6px;font-size:11px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">View</button><button style="padding:6px 12px;background:#1a1a1a;border:none;border-radius:6px;font-size:11px;color:#fff;cursor:pointer;font-weight:600;font-family:\'Helvetice Neue\',sans-serif;">Pipeline</button></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:16px 20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Cashier</div><div style="font-size:12px;color:#888;">Cebu IT Park &bull; Part-time &bull; PHP 12,000–14,000</div><div style="font-size:11px;color:#aaa;margin-top:3px;">Posted Mar 2 &bull; 67 applicants</div></div>' +
                '<div style="display:flex;gap:6px;"><button style="padding:6px 12px;background:#f3f4f6;border:none;border-radius:6px;font-size:11px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">View</button><button style="padding:6px 12px;background:#1a1a1a;border:none;border-radius:6px;font-size:11px;color:#fff;cursor:pointer;font-weight:600;font-family:\'Helvetica Neue\',sans-serif;">Pipeline</button></div>' +
                '</div>' +
                '</div></div>' +
                '<div><div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:12px;">Today\'s Interviews</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="background:#fff;border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:11px;font-weight:700;color:#B90E0A;background:#fee2e2;padding:2px 8px;border-radius:20px;">10:00 AM</span><span style="font-size:10px;color:#aaa;">1st Interview</span></div>' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;">Jenny Dela Rosa</div><div style="font-size:11px;color:#888;margin-top:1px;">Team Leader — BGC Branch</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:11px;font-weight:700;color:#f59e0b;background:#fffbeb;padding:2px 8px;border-radius:20px;">2:00 PM</span><span style="font-size:10px;color:#aaa;">Final Interview</span></div>' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;">Marco Reyes</div><div style="font-size:11px;color:#888;margin-top:1px;">Visual Merch — BGC Branch</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:11px;font-weight:700;color:#3b82f6;background:#eff6ff;padding:2px 8px;border-radius:20px;">4:30 PM</span><span style="font-size:10px;color:#aaa;">1st Interview</span></div>' +
                '<div style="font-size:13px;font-weight:700;color:#1a1a1a;">Cathy Lim</div><div style="font-size:11px;color:#888;margin-top:1px;">Cashier — Cebu Branch</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        

        // ── PROFILE MODAL TEMPLATES ───────────────────────────────────────
// Paste these inside your BLOCKS array in erp-builder.js
// Suggested location: after the HR Screens section
// ─────────────────────────────────────────────────────────────────

         {
            id: 'profile-modal-1',
            label: 'Profile Modal: Clean Card',
            category: 'Profile Modal',
            content: '<div class="min-h-screen bg-black/50 flex items-center justify-center p-5">' +
                '<div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">' +
                '<div class="bg-gradient-to-br from-[#B90E0A] to-[#7a0806] px-7 pt-6 pb-14">' +
                '<div class="flex justify-between items-start">' +
                '<div><p class="text-[10px] font-bold tracking-[2px] text-white/60 uppercase">Employee Profile</p>' +
                '<p class="text-[11px] text-white/50 mt-1">HR-00142 · Active</p></div>' +
                '<button class="bg-white/20 text-white w-7 h-7 rounded-full text-sm">✕</button>' +
                '</div></div>' +
                '<div class="px-7 pb-6 -mt-11">' +
                '<div class="flex items-end gap-4 mb-5">' +
                '<div class="w-20 h-20 rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] border-4 border-white flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0">MS</div>' +
                '<div class="pb-1"><p class="text-lg font-extrabold text-gray-900">Maria Santos</p>' +
                '<p class="text-xs font-semibold text-[#B90E0A]">Sr. Sales Associate</p>' +
                '<p class="text-[11px] text-gray-400 mt-0.5">SM Mall of Asia Branch</p></div>' +
                '</div>' +
                '<div class="grid grid-cols-2 gap-3 mb-5">' +
                '<div class="bg-gray-50 rounded-xl p-3"><p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Employee ID</p><p class="text-sm font-semibold text-gray-900">HR-00142</p></div>' +
                '<div class="bg-gray-50 rounded-xl p-3"><p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Department</p><p class="text-sm font-semibold text-gray-900">Retail Operations</p></div>' +
                '<div class="bg-gray-50 rounded-xl p-3"><p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date Hired</p><p class="text-sm font-semibold text-gray-900">March 15, 2021</p></div>' +
                '<div class="bg-gray-50 rounded-xl p-3"><p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Employment Type</p><p class="text-sm font-semibold text-gray-900">Full-Time</p></div>' +
                '<div class="bg-gray-50 rounded-xl p-3"><p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p><p class="text-xs font-semibold text-gray-900">m.santos@bench.com.ph</p></div>' +
                '<div class="bg-gray-50 rounded-xl p-3"><p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p><p class="text-sm font-semibold text-gray-900">+63 917 123 4567</p></div>' +
                '</div>' +
                '<div class="flex items-center justify-between pt-4 border-t border-gray-100">' +
                '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">● ACTIVE</span>' +
                '<div class="flex gap-2">' +
                '<button class="px-4 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">Edit</button>' +
                '<button class="px-4 py-2 bg-[#B90E0A] rounded-lg text-xs font-semibold text-white">View Full Profile</button>' +
                '</div></div>' +
                '</div></div></div>'
        },
 
        {
            id: 'profile-modal-2',
            label: 'Profile Modal: Dark Sidebar',
            category: 'Profile Modal',
            content: '<div class="min-h-screen bg-black/60 flex items-center justify-center p-5">' +
                '<div class="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex">' +
                '<div class="w-48 bg-[#1a1a1a] p-6 flex flex-col items-center shrink-0">' +
                '<div class="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-xl mb-3 border-2 border-[#333]">MS</div>' +
                '<p class="text-sm font-bold text-white text-center leading-tight">Maria Santos</p>' +
                '<p class="text-[10px] text-[#B90E0A] font-semibold mt-1 text-center">Sr. Sales Associate</p>' +
                '<div class="w-full h-px bg-[#2a2a2a] my-4"></div>' +
                '<span class="bg-green-600 text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-wider">ACTIVE</span>' +
                '<div class="mt-5 w-full">' +
                '<p class="text-[9px] text-[#555] uppercase tracking-widest font-bold mb-2">Quick Links</p>' +
                '<a href="#" class="block text-[#aaa] text-[11px] py-2 border-b border-[#222]">📄 201 File</a>' +
                '<a href="#" class="block text-[#aaa] text-[11px] py-2 border-b border-[#222]">💰 Payslips</a>' +
                '<a href="#" class="block text-[#aaa] text-[11px] py-2 border-b border-[#222]">📅 Attendance</a>' +
                '<a href="#" class="block text-[#aaa] text-[11px] py-2">⭐ Performance</a>' +
                '</div></div>' +
                '<div class="flex-1 p-6">' +
                '<div class="flex justify-between items-center mb-5">' +
                '<div><p class="text-base font-extrabold text-gray-900">Employee Details</p>' +
                '<p class="text-[11px] text-gray-400 mt-0.5">HR-00142 · SM Mall of Asia</p></div>' +
                '<button class="text-gray-400 text-lg">✕</button></div>' +
                '<p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">Personal Information</p>' +
                '<div class="grid grid-cols-2 gap-3 mb-5">' +
                '<div><p class="text-[10px] text-gray-400 mb-0.5">Full Name</p><p class="text-xs font-semibold text-gray-900">Maria Santos</p></div>' +
                '<div><p class="text-[10px] text-gray-400 mb-0.5">Date of Birth</p><p class="text-xs font-semibold text-gray-900">June 12, 1995</p></div>' +
                '<div><p class="text-[10px] text-gray-400 mb-0.5">Email</p><p class="text-xs font-semibold text-gray-900">m.santos@bench.com.ph</p></div>' +
                '<div><p class="text-[10px] text-gray-400 mb-0.5">Phone</p><p class="text-xs font-semibold text-gray-900">+63 917 123 4567</p></div>' +
                '</div>' +
                '<p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">Employment Details</p>' +
                '<div class="grid grid-cols-2 gap-3 mb-5">' +
                '<div><p class="text-[10px] text-gray-400 mb-0.5">Position</p><p class="text-xs font-semibold text-gray-900">Sr. Sales Associate</p></div>' +
                '<div><p class="text-[10px] text-gray-400 mb-0.5">Branch</p><p class="text-xs font-semibold text-gray-900">SM Mall of Asia</p></div>' +
                '<div><p class="text-[10px] text-gray-400 mb-0.5">Date Hired</p><p class="text-xs font-semibold text-gray-900">March 15, 2021</p></div>' +
                '<div><p class="text-[10px] text-gray-400 mb-0.5">SSS No.</p><p class="text-xs font-semibold text-gray-900">34-5678901-2</p></div>' +
                '</div>' +
                '<div class="flex gap-2 pt-4 border-t border-gray-100">' +
                '<button class="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">Edit Profile</button>' +
                '<button class="flex-1 py-2 bg-[#B90E0A] rounded-lg text-xs font-semibold text-white">Full Profile →</button>' +
                '</div></div></div></div>'
        },
 
        {
            id: 'profile-modal-3',
            label: 'Profile Modal: Bottom Sheet',
            category: 'Profile Modal',
            content: '<div class="min-h-screen bg-black/40 flex items-end justify-center">' +
                '<div class="bg-white w-full max-w-2xl rounded-t-3xl shadow-2xl overflow-hidden">' +
                '<div class="flex justify-center pt-3 pb-1"><div class="w-10 h-1 bg-gray-200 rounded-full"></div></div>' +
                '<div class="px-6 py-4 flex items-center gap-4 border-b border-gray-100">' +
                '<div class="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-lg shrink-0">MS</div>' +
                '<div class="flex-1"><p class="text-base font-extrabold text-gray-900">Maria Santos</p>' +
                '<p class="text-xs text-[#B90E0A] font-semibold">Sr. Sales Associate · SM Mall of Asia</p></div>' +
                '<span class="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[10px] font-bold">ACTIVE</span>' +
                '<button class="text-gray-400 text-lg ml-2">✕</button></div>' +
                '<div class="flex border-b border-gray-100">' +
                '<button class="flex-1 py-3 text-xs font-bold text-[#B90E0A] border-b-2 border-[#B90E0A] bg-transparent">Overview</button>' +
                '<button class="flex-1 py-3 text-xs font-semibold text-gray-400 bg-transparent">Employment</button>' +
                '<button class="flex-1 py-3 text-xs font-semibold text-gray-400 bg-transparent">Documents</button>' +
                '<button class="flex-1 py-3 text-xs font-semibold text-gray-400 bg-transparent">History</button>' +
                '</div>' +
                '<div class="grid grid-cols-3 gap-4 p-6 border-b border-gray-50">' +
                '<div class="text-center p-4 bg-red-50 rounded-2xl"><p class="text-xl font-black text-[#B90E0A]">3.5</p><p class="text-[10px] text-gray-500 mt-1">Yrs Tenure</p></div>' +
                '<div class="text-center p-4 bg-green-50 rounded-2xl"><p class="text-xl font-black text-green-600">98%</p><p class="text-[10px] text-gray-500 mt-1">Attendance</p></div>' +
                '<div class="text-center p-4 bg-blue-50 rounded-2xl"><p class="text-xl font-black text-blue-600">4.8</p><p class="text-[10px] text-gray-500 mt-1">Performance</p></div>' +
                '</div>' +
                '<div class="grid grid-cols-2 gap-3 p-6 pb-4">' +
                '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-sm">📧</div><div><p class="text-[9px] text-gray-400">Email</p><p class="text-xs font-semibold text-gray-900">m.santos@bench.com.ph</p></div></div>' +
                '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-sm">📱</div><div><p class="text-[9px] text-gray-400">Phone</p><p class="text-xs font-semibold text-gray-900">+63 917 123 4567</p></div></div>' +
                '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-sm">🏢</div><div><p class="text-[9px] text-gray-400">Department</p><p class="text-xs font-semibold text-gray-900">Retail Operations</p></div></div>' +
                '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm shadow-sm">📅</div><div><p class="text-[9px] text-gray-400">Date Hired</p><p class="text-xs font-semibold text-gray-900">March 15, 2021</p></div></div>' +
                '</div>' +
                '<div class="flex gap-3 px-6 pb-6">' +
                '<button class="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">Message</button>' +
                '<button class="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">Edit</button>' +
                '<button class="flex-1 py-3 bg-[#B90E0A] rounded-xl text-xs font-bold text-white">View Full Profile</button>' +
                '</div></div></div>'
        },
 
        {
            id: 'profile-modal-4',
            label: 'Profile Modal: Corporate Full',
            category: 'Profile Modal',
            content: '<div class="min-h-screen bg-black/50 flex items-center justify-center p-5">' +
                '<div class="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">' +
                '<div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">' +
                '<div class="flex items-center gap-2">' +
                '<div class="w-7 h-7 bg-[#B90E0A] rounded-lg flex items-center justify-center text-white font-black text-xs">B</div>' +
                '<span class="text-sm font-bold text-gray-800">Bench Apparel ERP</span>' +
                '<span class="text-gray-300 mx-2">|</span>' +
                '<span class="text-xs text-gray-500">Employee Profile</span></div>' +
                '<div class="flex items-center gap-2">' +
                '<button class="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">Edit</button>' +
                '<button class="px-3 py-1.5 bg-[#B90E0A] rounded-lg text-xs font-semibold text-white">Print 201</button>' +
                '<button class="text-gray-400 text-lg ml-2">✕</button></div></div>' +
                '<div class="bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex items-center gap-5 border-b border-gray-100">' +
                '<div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0">MS</div>' +
                '<div class="flex-1">' +
                '<div class="flex items-center gap-3 mb-1">' +
                '<p class="text-xl font-extrabold text-gray-900">Maria Santos</p>' +
                '<span class="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">ACTIVE</span>' +
                '<span class="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">FULL-TIME</span></div>' +
                '<p class="text-sm text-[#B90E0A] font-semibold">Sr. Sales Associate · Retail Operations</p>' +
                '<p class="text-xs text-gray-400 mt-0.5">SM Mall of Asia · HR-00142</p></div>' +
                '<div class="text-right shrink-0"><p class="text-[10px] text-gray-400">Date Hired</p><p class="text-sm font-bold text-gray-900">March 15, 2021</p><p class="text-[10px] text-gray-400 mt-1">3 yrs 10 mos</p></div></div>' +
                '<div class="grid grid-cols-3 divide-x divide-gray-100">' +
                '<div class="p-5"><p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Personal</p>' +
                '<div class="space-y-3">' +
                '<div><p class="text-[10px] text-gray-400">Email</p><p class="text-xs font-semibold text-gray-800">m.santos@bench.com.ph</p></div>' +
                '<div><p class="text-[10px] text-gray-400">Mobile</p><p class="text-xs font-semibold text-gray-800">+63 917 123 4567</p></div>' +
                '<div><p class="text-[10px] text-gray-400">Birthday</p><p class="text-xs font-semibold text-gray-800">June 12, 1995</p></div>' +
                '<div><p class="text-[10px] text-gray-400">Civil Status</p><p class="text-xs font-semibold text-gray-800">Single</p></div>' +
                '</div></div>' +
                '<div class="p-5"><p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Government IDs</p>' +
                '<div class="space-y-3">' +
                '<div><p class="text-[10px] text-gray-400">SSS</p><p class="text-xs font-semibold text-gray-800">34-5678901-2</p></div>' +
                '<div><p class="text-[10px] text-gray-400">PhilHealth</p><p class="text-xs font-semibold text-gray-800">12-345678901-3</p></div>' +
                '<div><p class="text-[10px] text-gray-400">Pag-IBIG</p><p class="text-xs font-semibold text-gray-800">1234-5678-9012</p></div>' +
                '<div><p class="text-[10px] text-gray-400">TIN</p><p class="text-xs font-semibold text-gray-800">123-456-789-000</p></div>' +
                '</div></div>' +
                '<div class="p-5"><p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Performance</p>' +
                '<div class="space-y-2.5">' +
                '<div><div class="flex justify-between mb-1"><span class="text-[10px] text-gray-500">Attendance</span><span class="text-[10px] font-bold text-gray-800">98%</span></div><div class="w-full bg-gray-100 rounded-full h-1.5"><div class="bg-green-500 h-1.5 rounded-full w-[98%]"></div></div></div>' +
                '<div><div class="flex justify-between mb-1"><span class="text-[10px] text-gray-500">Sales Target</span><span class="text-[10px] font-bold text-gray-800">112%</span></div><div class="w-full bg-gray-100 rounded-full h-1.5"><div class="bg-[#B90E0A] h-1.5 rounded-full w-full"></div></div></div>' +
                '<div><div class="flex justify-between mb-1"><span class="text-[10px] text-gray-500">Performance</span><span class="text-[10px] font-bold text-gray-800">4.8/5</span></div><div class="w-full bg-gray-100 rounded-full h-1.5"><div class="bg-blue-500 h-1.5 rounded-full w-[96%]"></div></div></div>' +
                '<div class="pt-3 border-t border-gray-100 mt-2"><p class="text-[10px] text-gray-400">Direct Manager</p><p class="text-xs font-semibold text-gray-800">Juan dela Cruz</p></div>' +
                '</div></div></div>' +
                '<div class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">' +
                '<p class="text-[10px] text-gray-400">Last updated: March 18, 2026</p>' +
                '<a href="#" class="text-xs text-[#B90E0A] font-semibold">View Complete 201 File →</a>' +
                '</div></div></div>'
        },
 
        {
            id: 'profile-modal-5',
            label: 'Profile Modal: Dark Overlay',
            category: 'Profile Modal',
            content: '<div class="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-5">' +
                '<div class="bg-[#111] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/5">' +
                '<div class="flex items-center justify-between px-5 py-4 border-b border-white/5">' +
                '<div class="flex items-center gap-2">' +
                '<div class="w-6 h-6 bg-[#B90E0A] rounded flex items-center justify-center text-white font-black text-xs">B</div>' +
                '<span class="text-[10px] font-bold text-white/30 uppercase tracking-widest">Employee Profile</span></div>' +
                '<button class="text-white/30 text-lg">✕</button></div>' +
                '<div class="p-5 flex items-center gap-4 border-b border-white/5">' +
                '<div class="relative shrink-0">' +
                '<div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B90E0A] to-[#5a0604] flex items-center justify-center text-white font-black text-xl">MS</div>' +
                '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111]"></div></div>' +
                '<div class="flex-1">' +
                '<p class="text-base font-extrabold text-white">Maria Santos</p>' +
                '<p class="text-xs text-[#B90E0A] font-semibold mt-0.5">Sr. Sales Associate</p>' +
                '<p class="text-[11px] text-white/30 mt-0.5">SM Mall of Asia · HR-00142</p></div>' +
                '<div class="text-right shrink-0">' +
                '<span class="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">ACTIVE</span>' +
                '<p class="text-[10px] text-white/20 mt-1.5">Full-Time</p></div></div>' +
                '<div class="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">' +
                '<div class="p-4 text-center"><p class="text-lg font-black text-white">3.5</p><p class="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">Yrs Tenure</p></div>' +
                '<div class="p-4 text-center"><p class="text-lg font-black text-green-400">98%</p><p class="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">Attendance</p></div>' +
                '<div class="p-4 text-center"><p class="text-lg font-black text-[#B90E0A]">4.8</p><p class="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">Rating</p></div>' +
                '</div>' +
                '<div class="p-5 grid grid-cols-2 gap-4 border-b border-white/5">' +
                '<div><p class="text-[9px] text-white/25 uppercase tracking-wider mb-1">Email</p><p class="text-xs font-medium text-white/60">m.santos@bench.com.ph</p></div>' +
                '<div><p class="text-[9px] text-white/25 uppercase tracking-wider mb-1">Phone</p><p class="text-xs font-medium text-white/60">+63 917 123 4567</p></div>' +
                '<div><p class="text-[9px] text-white/25 uppercase tracking-wider mb-1">Department</p><p class="text-xs font-medium text-white/60">Retail Operations</p></div>' +
                '<div><p class="text-[9px] text-white/25 uppercase tracking-wider mb-1">Date Hired</p><p class="text-xs font-medium text-white/60">March 15, 2021</p></div>' +
                '<div><p class="text-[9px] text-white/25 uppercase tracking-wider mb-1">SSS No.</p><p class="text-xs font-medium text-white/60">34-5678901-2</p></div>' +
                '<div><p class="text-[9px] text-white/25 uppercase tracking-wider mb-1">Manager</p><p class="text-xs font-medium text-white/60">Juan dela Cruz</p></div>' +
                '</div>' +
                '<div class="flex gap-2 p-4">' +
                '<button class="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white/40">Message</button>' +
                '<button class="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white/40">Edit</button>' +
                '<button class="flex-1 py-2.5 bg-[#B90E0A] rounded-xl text-xs font-semibold text-white">View Profile →</button>' +
                '</div></div></div>'
        },
    

// ─────────────────────────────────────────────────────────────────
// END OF PROFILE MODAL BLOCKS
// ─────────────────────────────────────────────────────────────────



    {
            id: 'motion-landing-1',
            label: 'Motion: Bold Product Launch',
            category: 'Motion Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:#0a0a0a;overflow:hidden;font-family:\'Helvetica Neue\',Arial,sans-serif;position:relative;">' +
 
                // ── Animated gradient background
                '<style>' +
                '@keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}' +
                '@keyframes floatA{0%,100%{transform:translateY(0px) rotate(-12deg)}50%{transform:translateY(-28px) rotate(-8deg)}}' +
                '@keyframes floatB{0%,100%{transform:translateY(0px) rotate(8deg)}50%{transform:translateY(-20px) rotate(12deg)}}' +
                '@keyframes slideUp{0%{opacity:0;transform:translateY(60px)}100%{opacity:1;transform:translateY(0)}}' +
                '@keyframes slideLeft{0%{opacity:0;transform:translateX(-60px)}100%{opacity:1;transform:translateX(0)}}' +
                '@keyframes slideRight{0%{opacity:0;transform:translateX(60px)}100%{opacity:1;transform:translateX(0)}}' +
                '@keyframes particle{0%{transform:translateY(100vh) scale(0);opacity:0}20%{opacity:.6}80%{opacity:.3}100%{transform:translateY(-100px) scale(1.2);opacity:0}}' +
                '@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}' +
                '.ml1-hero{background:linear-gradient(135deg,#0a0a0a 0%,#1a0505 40%,#B90E0A 100%);background-size:300% 300%;animation:gradShift 8s ease infinite;}' +
                '.ml1-float-a{animation:floatA 4s ease-in-out infinite;}' +
                '.ml1-float-b{animation:floatB 5s ease-in-out infinite;}' +
                '.ml1-slide-up{opacity:0;animation:slideUp .8s ease forwards;}' +
                '.ml1-slide-left{opacity:0;animation:slideLeft .8s ease forwards;}' +
                '.ml1-slide-right{opacity:0;animation:slideRight .8s ease forwards;}' +
                '.ml1-d1{animation-delay:.1s}.ml1-d2{animation-delay:.3s}.ml1-d3{animation-delay:.5s}.ml1-d4{animation-delay:.7s}.ml1-d5{animation-delay:.9s}' +
                '.ml1-btn{background:#B90E0A;color:#fff;border:none;padding:16px 40px;font-size:14px;font-weight:800;letter-spacing:2px;text-transform:uppercase;border-radius:4px;cursor:pointer;animation:pulse 2s ease infinite;}' +
                '.ml1-btn:hover{background:#e01410;}' +
                '.ml1-particle{position:absolute;border-radius:50%;pointer-events:none;}' +
                '.ml1-reveal{opacity:0;transform:translateY(40px);transition:opacity .7s ease,transform .7s ease;}' +
                '.ml1-reveal.visible{opacity:1;transform:translateY(0);}' +
                '</style>' +
 
                // Particle layer
                '<div id="ml1-particles" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;"></div>' +
 
                // Hero section
                '<section class="ml1-hero" style="min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;padding:40px 24px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;max-width:1100px;width:100%;">' +
 
                // Left text
                '<div>' +
                '<div class="ml1-slide-left ml1-d1" style="font-size:11px;font-weight:700;letter-spacing:4px;color:#B90E0A;text-transform:uppercase;margin-bottom:16px;">New Collection 2026</div>' +
                '<h1 id="ml1-typewriter" class="ml1-slide-left ml1-d2" style="font-size:72px;font-weight:900;color:#fff;line-height:1;margin:0 0 24px;text-transform:uppercase;letter-spacing:-2px;"></h1>' +
                '<p class="ml1-slide-left ml1-d3" style="font-size:16px;color:rgba(255,255,255,0.5);line-height:1.7;margin-bottom:36px;max-width:420px;">Bold. Uncompromising. Made for those who refuse to blend in. Experience fashion that speaks before you do.</p>' +
                '<div class="ml1-slide-left ml1-d4" style="display:flex;gap:14px;flex-wrap:wrap;">' +
                '<button class="ml1-btn">Shop Now</button>' +
                '<button style="background:transparent;color:#fff;border:2px solid rgba(255,255,255,0.2);padding:16px 40px;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:4px;cursor:pointer;">View Lookbook</button>' +
                '</div>' +
                '<div class="ml1-slide-up ml1-d5" style="display:flex;gap:32px;margin-top:48px;">' +
                '<div><div style="font-size:28px;font-weight:900;color:#fff;">1,240+</div><div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;">Employees</div></div>' +
                '<div style="width:1px;background:rgba(255,255,255,0.1);"></div>' +
                '<div><div style="font-size:28px;font-weight:900;color:#fff;">48</div><div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;">Branches</div></div>' +
                '<div style="width:1px;background:rgba(255,255,255,0.1);"></div>' +
                '<div><div style="font-size:28px;font-weight:900;color:#fff;">30+</div><div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;">Years</div></div>' +
                '</div></div>' +
 
                // Right floating product image
                '<div style="display:flex;align-items:center;justify-content:center;position:relative;">' +
                '<div class="ml1-float-a" style="width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(185,14,10,0.3),transparent 70%);display:flex;align-items:center;justify-content:center;">' +
                '<div style="width:240px;height:240px;background:linear-gradient(135deg,#B90E0A,#7a0806);border-radius:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 40px 80px rgba(185,14,10,0.4);font-size:80px;">👕</div>' +
                '</div>' +
                '<div class="ml1-float-b" style="position:absolute;bottom:20px;right:20px;width:80px;height:80px;background:linear-gradient(135deg,#fff,#f0f0f0);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 12px 32px rgba(0,0,0,0.3);">🧥</div>' +
                '<div class="ml1-float-a" style="position:absolute;top:30px;left:10px;width:60px;height:60px;background:rgba(185,14,10,0.2);border:1px solid rgba(185,14,10,0.4);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;">✨</div>' +
                '</div>' +
                '</div></section>' +
 
                // Features section with scroll reveal
                '<section style="background:#0f0f0f;padding:80px 24px;">' +
                '<div style="max-width:1100px;margin:0 auto;">' +
                '<h2 class="ml1-reveal" style="font-size:42px;font-weight:900;color:#fff;text-align:center;margin-bottom:60px;text-transform:uppercase;letter-spacing:-1px;">Why <span style="color:#B90E0A;">Bench</span></h2>' +
                '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">' +
                '<div class="ml1-reveal" style="background:#1a1a1a;border:1px solid #222;border-radius:16px;padding:32px;text-align:center;">' +
                '<div style="font-size:40px;margin-bottom:16px;">🎯</div>' +
                '<h3 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 10px;">Premium Quality</h3>' +
                '<p style="font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6;margin:0;">Every piece crafted with precision and care for lasting excellence.</p>' +
                '</div>' +
                '<div class="ml1-reveal" style="background:#1a1a1a;border:1px solid #222;border-radius:16px;padding:32px;text-align:center;">' +
                '<div style="font-size:40px;margin-bottom:16px;">🚀</div>' +
                '<h3 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 10px;">Fast Delivery</h3>' +
                '<p style="font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6;margin:0;">Nationwide shipping to all 48 branches and direct to your door.</p>' +
                '</div>' +
                '<div class="ml1-reveal" style="background:#1a1a1a;border:1px solid #222;border-radius:16px;padding:32px;text-align:center;">' +
                '<div style="font-size:40px;margin-bottom:16px;">💎</div>' +
                '<h3 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 10px;">Exclusive Designs</h3>' +
                '<p style="font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6;margin:0;">Limited collections you won\'t find anywhere else in the market.</p>' +
                '</div>' +
                '</div></div></section>' +
 
                // JS: particles + typewriter + scroll reveal
                '<script>' +
                '(function(){' +
                // Particles
                'var pc=document.getElementById("ml1-particles");' +
                'var colors=["rgba(185,14,10,0.4)","rgba(255,255,255,0.1)","rgba(185,14,10,0.2)"];' +
                'for(var i=0;i<25;i++){' +
                '(function(i){' +
                'var p=document.createElement("div");' +
                'p.className="ml1-particle";' +
                'var sz=Math.random()*12+4;' +
                'p.style.cssText="width:"+sz+"px;height:"+sz+"px;left:"+Math.random()*100+"%;background:"+colors[Math.floor(Math.random()*colors.length)]+";animation:particle "+(Math.random()*8+6)+"s linear "+(Math.random()*6)+"s infinite;";' +
                'pc.appendChild(p);' +
                '})(i);}' +
                // Typewriter
                'var words=["DEFINE\\nBOLD.","WEAR\\nPOWER.","BE\\nBENCH."];' +
                'var wi=0,ci=0,del=false;' +
                'var el=document.getElementById("ml1-typewriter");' +
                'function type(){' +
                'var w=words[wi];' +
                'if(!del){el.innerHTML=w.substring(0,ci+1).replace("\\n","<br>");ci++;' +
                'if(ci===w.length){del=true;setTimeout(type,2000);return;}}' +
                'else{el.innerHTML=w.substring(0,ci-1).replace("\\n","<br>");ci--;' +
                'if(ci===0){del=false;wi=(wi+1)%words.length;}}' +
                'setTimeout(type,del?60:120);}' +
                'type();' +
                // Scroll reveal
                'var reveals=document.querySelectorAll(".ml1-reveal");' +
                'function checkReveal(){reveals.forEach(function(r){var rect=r.getBoundingClientRect();if(rect.top<window.innerHeight-80)r.classList.add("visible");});}' +
                'window.addEventListener("scroll",checkReveal);checkReveal();' +
                '})();' +
                '<\/script>' +
                '</div>';
            })()
        },
 
        {
            id: 'motion-landing-2',
            label: 'Motion: Neon Tech Hero',
            category: 'Motion Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:#050510;overflow:hidden;font-family:\'Helvetica Neue\',Arial,sans-serif;position:relative;">' +
 
                '<style>' +
                '@keyframes gradNeon{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}' +
                '@keyframes floatNeon{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.02)}}' +
                '@keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(185,14,10,0.3),0 0 60px rgba(185,14,10,0.1)}50%{box-shadow:0 0 40px rgba(185,14,10,0.6),0 0 100px rgba(185,14,10,0.2)}}' +
                '@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}' +
                '@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}' +
                '@keyframes neonSlideUp{0%{opacity:0;transform:translateY(80px)}100%{opacity:1;transform:translateY(0)}}' +
                '@keyframes neonParticle{0%{transform:translate(0,0);opacity:.8}100%{transform:translate(var(--tx),var(--ty));opacity:0}}' +
                '@keyframes borderAnim{0%{background-position:0% 50%}100%{background-position:200% 50%}}' +
                '.neon-hero{background:linear-gradient(135deg,#050510,#0d0520,#100510);background-size:400% 400%;animation:gradNeon 12s ease infinite;}' +
                '.neon-float{animation:floatNeon 6s ease-in-out infinite;}' +
                '.neon-glow{animation:glowPulse 3s ease-in-out infinite;}' +
                '.neon-su{opacity:0;animation:neonSlideUp .9s cubic-bezier(.16,1,.3,1) forwards;}' +
                '.neon-d1{animation-delay:.1s}.neon-d2{animation-delay:.25s}.neon-d3{animation-delay:.4s}.neon-d4{animation-delay:.55s}.neon-d5{animation-delay:.7s}' +
                '.neon-reveal{opacity:0;transform:translateY(50px);transition:all .8s cubic-bezier(.16,1,.3,1);}' +
                '.neon-reveal.vis{opacity:1;transform:translateY(0);}' +
                '.neon-card{background:rgba(255,255,255,0.02);border:1px solid rgba(185,14,10,0.2);border-radius:16px;padding:28px;transition:all .3s;cursor:default;}' +
                '.neon-card:hover{border-color:rgba(185,14,10,0.6);background:rgba(185,14,10,0.05);transform:translateY(-4px);}' +
                '.cursor-blink{animation:blink 1s step-end infinite;}' +
                '.neon-btn{position:relative;background:transparent;border:none;padding:0;cursor:pointer;}' +
                '.neon-btn-inner{background:linear-gradient(90deg,#B90E0A,#ff2020,#B90E0A);background-size:200%;animation:borderAnim 3s linear infinite;color:#fff;padding:15px 38px;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;border-radius:4px;display:block;}' +
                '</style>' +
 
                // Scanline effect
                '<div style="position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:100;overflow:hidden;">' +
                '<div style="position:absolute;width:100%;height:2px;background:rgba(185,14,10,0.03);animation:scanline 4s linear infinite;"></div>' +
                '</div>' +
 
                // Grid background
                '<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(185,14,10,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(185,14,10,0.05) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;"></div>' +
 
                // Particle canvas
                '<canvas id="neon-canvas" style="position:absolute;inset:0;pointer-events:none;z-index:0;"></canvas>' +
 
                // Hero
                '<section class="neon-hero" style="min-height:100vh;display:flex;align-items:center;padding:60px 24px;position:relative;z-index:1;">' +
                '<div style="max-width:1100px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;">' +
 
                '<div>' +
                '<div class="neon-su neon-d1" style="display:inline-flex;align-items:center;gap:8px;background:rgba(185,14,10,0.1);border:1px solid rgba(185,14,10,0.3);padding:6px 14px;border-radius:20px;margin-bottom:24px;">' +
                '<div style="width:6px;height:6px;background:#B90E0A;border-radius:50%;animation:glowPulse 1.5s infinite;"></div>' +
                '<span style="font-size:10px;font-weight:700;color:#B90E0A;letter-spacing:2px;text-transform:uppercase;">System Online</span>' +
                '</div>' +
                '<h1 class="neon-su neon-d2" style="font-size:64px;font-weight:900;color:#fff;line-height:1.05;margin:0 0 8px;text-transform:uppercase;letter-spacing:-2px;">' +
                'BENCH<br><span style="color:#B90E0A;">ERP</span> <span id="neon-tw" style="color:#fff;"></span><span class="cursor-blink" style="color:#B90E0A;">|</span>' +
                '</h1>' +
                '<p class="neon-su neon-d3" style="font-size:15px;color:rgba(255,255,255,0.45);line-height:1.8;margin:20px 0 36px;max-width:440px;">Next-generation enterprise resource planning. Real-time data. Intelligent automation. Built for the modern retail operation.</p>' +
                '<div class="neon-su neon-d4" style="display:flex;gap:12px;flex-wrap:wrap;">' +
                '<button class="neon-btn"><span class="neon-btn-inner">Get Started</span></button>' +
                '<button style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.1);padding:15px 38px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:4px;cursor:pointer;">Watch Demo</button>' +
                '</div>' +
                '<div class="neon-su neon-d5" style="display:flex;gap:0;margin-top:48px;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">' +
                '<div style="flex:1;padding:16px;text-align:center;border-right:1px solid rgba(255,255,255,0.06);"><div style="font-size:22px;font-weight:900;color:#B90E0A;">99.9%</div><div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;margin-top:2px;">Uptime</div></div>' +
                '<div style="flex:1;padding:16px;text-align:center;border-right:1px solid rgba(255,255,255,0.06);"><div style="font-size:22px;font-weight:900;color:#B90E0A;">48</div><div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;margin-top:2px;">Branches</div></div>' +
                '<div style="flex:1;padding:16px;text-align:center;"><div style="font-size:22px;font-weight:900;color:#B90E0A;">1,240+</div><div style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;margin-top:2px;">Users</div></div>' +
                '</div></div>' +
 
                // Right dashboard mockup
                '<div class="neon-float neon-glow" style="background:rgba(255,255,255,0.02);border:1px solid rgba(185,14,10,0.2);border-radius:20px;padding:20px;overflow:hidden;">' +
                '<div style="display:flex;gap:6px;margin-bottom:16px;"><div style="width:10px;height:10px;border-radius:50%;background:#B90E0A;"></div><div style="width:10px;height:10px;border-radius:50%;background:#333;"></div><div style="width:10px;height:10px;border-radius:50%;background:#333;"></div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">' +
                '<div style="background:rgba(185,14,10,0.1);border:1px solid rgba(185,14,10,0.2);border-radius:10px;padding:14px;"><div style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;">Revenue</div><div style="font-size:20px;font-weight:900;color:#fff;margin-top:4px;">₱2.4M</div><div style="font-size:9px;color:#22c55e;margin-top:2px;">↑ 12.4%</div></div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px;"><div style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;">Orders</div><div style="font-size:20px;font-weight:900;color:#fff;margin-top:4px;">1,847</div><div style="font-size:9px;color:#22c55e;margin-top:2px;">↑ 8.1%</div></div>' +
                '</div>' +
                '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:14px;margin-bottom:10px;">' +
                '<div style="font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Sales Trend</div>' +
                '<div style="display:flex;align-items:flex-end;gap:4px;height:50px;">' +
                '<div style="flex:1;background:rgba(185,14,10,0.3);border-radius:2px 2px 0 0;height:40%;"></div>' +
                '<div style="flex:1;background:rgba(185,14,10,0.4);border-radius:2px 2px 0 0;height:60%;"></div>' +
                '<div style="flex:1;background:rgba(185,14,10,0.5);border-radius:2px 2px 0 0;height:45%;"></div>' +
                '<div style="flex:1;background:rgba(185,14,10,0.6);border-radius:2px 2px 0 0;height:80%;"></div>' +
                '<div style="flex:1;background:rgba(185,14,10,0.7);border-radius:2px 2px 0 0;height:65%;"></div>' +
                '<div style="flex:1;background:#B90E0A;border-radius:2px 2px 0 0;height:100%;"></div>' +
                '</div></div>' +
                '<div style="display:flex;flex-direction:column;gap:6px;">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.02);border-radius:8px;padding:8px 12px;"><span style="font-size:10px;color:rgba(255,255,255,0.5);">SM Mall of Asia</span><span style="font-size:10px;color:#22c55e;font-weight:700;">Active</span></div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.02);border-radius:8px;padding:8px 12px;"><span style="font-size:10px;color:rgba(255,255,255,0.5);">BGC Branch</span><span style="font-size:10px;color:#22c55e;font-weight:700;">Active</span></div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.02);border-radius:8px;padding:8px 12px;"><span style="font-size:10px;color:rgba(255,255,255,0.5);">Cebu Branch</span><span style="font-size:10px;color:#f59e0b;font-weight:700;">Syncing</span></div>' +
                '</div></div>' +
                '</div></section>' +
 
                // Features
                '<section style="background:#070712;padding:80px 24px;position:relative;z-index:1;">' +
                '<div style="max-width:1100px;margin:0 auto;">' +
                '<h2 class="neon-reveal" style="font-size:40px;font-weight:900;color:#fff;text-align:center;margin-bottom:12px;text-transform:uppercase;">Powerful <span style="color:#B90E0A;">Features</span></h2>' +
                '<p class="neon-reveal" style="text-align:center;color:rgba(255,255,255,0.3);font-size:14px;margin-bottom:48px;">Everything you need to run your retail operation.</p>' +
                '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">' +
                '<div class="neon-card neon-reveal"><div style="font-size:28px;margin-bottom:12px;">📊</div><h3 style="font-size:15px;font-weight:800;color:#fff;margin:0 0 8px;">Real-time Analytics</h3><p style="font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;margin:0;">Live dashboards across all branches with instant KPI tracking.</p></div>' +
                '<div class="neon-card neon-reveal"><div style="font-size:28px;margin-bottom:12px;">👥</div><h3 style="font-size:15px;font-weight:800;color:#fff;margin:0 0 8px;">HR Management</h3><p style="font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;margin:0;">Complete employee lifecycle from onboarding to payroll.</p></div>' +
                '<div class="neon-card neon-reveal"><div style="font-size:28px;margin-bottom:12px;">📦</div><h3 style="font-size:15px;font-weight:800;color:#fff;margin:0 0 8px;">Inventory Control</h3><p style="font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;margin:0;">Stock tracking, transfers, and automated reorder alerts.</p></div>' +
                '</div></div></section>' +
 
                '<script>' +
                '(function(){' +
                // Typewriter
                'var words=["SYSTEM","PLATFORM","SOLUTION","SUITE"];var wi=0,ci=0,del=false;' +
                'var el=document.getElementById("neon-tw");' +
                'function type(){if(!el)return;var w=words[wi];' +
                'if(!del){el.textContent=w.substring(0,ci+1);ci++;if(ci===w.length){del=true;setTimeout(type,1800);return;}}' +
                'else{el.textContent=w.substring(0,ci-1);ci--;if(ci===0){del=false;wi=(wi+1)%words.length;}}' +
                'setTimeout(type,del?50:100);}type();' +
                // Canvas particles
                'var canvas=document.getElementById("neon-canvas");' +
                'if(canvas){var ctx=canvas.getContext("2d");canvas.width=window.innerWidth;canvas.height=window.innerHeight;' +
                'var pts=[];for(var i=0;i<60;i++)pts.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+.5});' +
                'function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);pts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle="rgba(185,14,10,0.5)";ctx.fill();});' +
                'pts.forEach(function(a,i){pts.slice(i+1).forEach(function(b){var d=Math.hypot(a.x-b.x,a.y-b.y);if(d<120){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle="rgba(185,14,10,"+(1-d/120)*.15+")";ctx.lineWidth=.5;ctx.stroke();}});});' +
                'requestAnimationFrame(draw);}draw();}' +
                // Scroll reveal
                'var revs=document.querySelectorAll(".neon-reveal");' +
                'function chk(){revs.forEach(function(r){if(r.getBoundingClientRect().top<window.innerHeight-60)r.classList.add("vis");});}' +
                'window.addEventListener("scroll",chk);chk();' +
                '})();' +
                '<\/script>' +
                '</div>';
            })()
        },
 
        {
            id: 'motion-landing-3',
            label: 'Motion: Minimal Fashion Hero',
            category: 'Motion Pages',
            content: (function(){
                return '<div style="min-height:100vh;background:#fafaf8;overflow:hidden;font-family:\'Helvetica Neue\',Arial,sans-serif;position:relative;">' +
 
                '<style>' +
                '@keyframes gradLight{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}' +
                '@keyframes floatImg{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-16px) rotate(-1deg)}}' +
                '@keyframes fadeSlideUp{0%{opacity:0;transform:translateY(40px)}100%{opacity:1;transform:translateY(0)}}' +
                '@keyframes fadeSlideRight{0%{opacity:0;transform:translateX(-40px)}100%{opacity:1;transform:translateX(0)}}' +
                '@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}' +
                '@keyframes bubbleRise{0%{transform:translateY(0) scale(1);opacity:.4}100%{transform:translateY(-100vh) scale(1.5);opacity:0}}' +
                '@keyframes lineDraw{0%{width:0}100%{width:100%}}' +
                '.mf-grad{background:linear-gradient(135deg,#fafaf8,#fff5f5,#fafaf8);background-size:300%;animation:gradLight 10s ease infinite;}' +
                '.mf-float{animation:floatImg 5s ease-in-out infinite;}' +
                '.mf-su{opacity:0;animation:fadeSlideUp .9s cubic-bezier(.16,1,.3,1) forwards;}' +
                '.mf-sr{opacity:0;animation:fadeSlideRight .9s cubic-bezier(.16,1,.3,1) forwards;}' +
                '.mf-d1{animation-delay:.1s}.mf-d2{animation-delay:.3s}.mf-d3{animation-delay:.5s}.mf-d4{animation-delay:.7s}.mf-d5{animation-delay:.9s}.mf-d6{animation-delay:1.1s}' +
                '.mf-reveal{opacity:0;transform:translateY(30px);transition:all .7s cubic-bezier(.16,1,.3,1);}' +
                '.mf-reveal.vis{opacity:1;transform:translateY(0);}' +
                '.mf-line{display:block;height:2px;background:#1a1a1a;animation:lineDraw 1s cubic-bezier(.16,1,.3,1) .8s forwards;width:0;}' +
                '.mf-tag{display:inline-block;background:#1a1a1a;color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:2px;}' +
                '.mf-btn-primary{background:#1a1a1a;color:#fff;border:none;padding:16px 44px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all .2s;}' +
                '.mf-btn-primary:hover{background:#B90E0A;}' +
                '.mf-btn-outline{background:transparent;color:#1a1a1a;border:1.5px solid #1a1a1a;padding:15px 44px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all .2s;}' +
                '.mf-btn-outline:hover{background:#1a1a1a;color:#fff;}' +
                '.mf-bubble{position:absolute;border-radius:50%;pointer-events:none;}' +
                '.mf-product-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.06);transition:all .3s;cursor:pointer;}' +
                '.mf-product-card:hover{transform:translateY(-8px);box-shadow:0 12px 40px rgba(0,0,0,0.12);}' +
                '</style>' +
 
                // Bubble layer
                '<div id="mf-bubbles" style="position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;"></div>' +
 
                // Nav
                '<nav class="mf-grad" style="position:sticky;top:0;z-index:100;padding:0 40px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,0,0,0.06);backdrop-filter:blur(8px);">' +
                '<div style="font-size:22px;font-weight:900;color:#1a1a1a;letter-spacing:-1px;">BENCH</div>' +
                '<div style="display:flex;gap:32px;">' +
                '<a href="#" style="font-size:12px;font-weight:600;color:#555;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">Collection</a>' +
                '<a href="#" style="font-size:12px;font-weight:600;color:#555;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">About</a>' +
                '<a href="#" style="font-size:12px;font-weight:600;color:#555;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">Stores</a>' +
                '</div>' +
                '<button style="background:#B90E0A;color:#fff;border:none;padding:9px 20px;font-size:11px;font-weight:700;letter-spacing:1px;cursor:pointer;border-radius:4px;">Shop Now</button>' +
                '</nav>' +
 
                // Hero
                '<section class="mf-grad" style="min-height:calc(100vh - 64px);display:grid;grid-template-columns:1fr 1fr;gap:0;position:relative;z-index:1;">' +
 
                // Left text half
                '<div style="display:flex;flex-direction:column;justify-content:center;padding:80px 60px;">' +
                '<span class="mf-tag mf-su mf-d1" style="align-self:flex-start;margin-bottom:24px;">SS 2026 Collection</span>' +
                '<h1 class="mf-su mf-d2" style="font-size:80px;font-weight:900;color:#1a1a1a;line-height:.95;margin:0 0 8px;text-transform:uppercase;letter-spacing:-3px;">' +
                '<span id="mf-tw"></span>' +
                '</h1>' +
                '<span class="mf-line mf-d3"></span>' +
                '<p class="mf-su mf-d4" style="font-size:15px;color:#888;line-height:1.8;margin:24px 0 40px;max-width:400px;">Timeless silhouettes. Contemporary edge. Crafted for the confident Filipino who wears their story.</p>' +
                '<div class="mf-su mf-d5" style="display:flex;gap:12px;">' +
                '<button class="mf-btn-primary">Explore Now</button>' +
                '<button class="mf-btn-outline">Our Story</button>' +
                '</div>' +
                '<div class="mf-su mf-d6" style="display:flex;gap:24px;margin-top:56px;padding-top:32px;border-top:1px solid #e5e5e5;">' +
                '<div><div style="font-size:24px;font-weight:900;color:#1a1a1a;">48</div><div style="font-size:10px;color:#aaa;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;">Branches</div></div>' +
                '<div><div style="font-size:24px;font-weight:900;color:#1a1a1a;">30+</div><div style="font-size:10px;color:#aaa;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;">Years</div></div>' +
                '<div><div style="font-size:24px;font-weight:900;color:#B90E0A;">PH</div><div style="font-size:10px;color:#aaa;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;">Nationwide</div></div>' +
                '</div></div>' +
 
                // Right image half
                '<div style="background:linear-gradient(135deg,#fff5f5,#ffe8e8);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">' +
                '<div class="mf-float mf-su mf-d2" style="width:300px;height:380px;background:linear-gradient(145deg,#B90E0A,#7a0806);border-radius:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 40px 80px rgba(185,14,10,0.25);font-size:120px;">👗</div>' +
                '<div class="mf-su mf-d3" style="position:absolute;bottom:60px;right:50px;background:#fff;border-radius:16px;padding:16px 20px;box-shadow:0 8px 32px rgba(0,0,0,0.1);">' +
                '<div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">New Arrival</div>' +
                '<div style="font-size:14px;font-weight:800;color:#1a1a1a;margin-top:2px;">Summer Dress</div>' +
                '<div style="font-size:16px;font-weight:900;color:#B90E0A;margin-top:4px;">₱1,299</div>' +
                '</div>' +
                '<div class="mf-su mf-d4" style="position:absolute;top:60px;left:40px;background:#1a1a1a;color:#fff;border-radius:12px;padding:12px 16px;">' +
                '<div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;opacity:.6;">Trending</div>' +
                '<div style="font-size:13px;font-weight:800;margin-top:2px;">#1 This Week</div>' +
                '</div></div>' +
                '</section>' +
 
                // Marquee strip
                '<div style="background:#1a1a1a;overflow:hidden;padding:14px 0;position:relative;z-index:1;">' +
                '<div id="mf-marquee" style="display:flex;gap:0;white-space:nowrap;animation:marquee 20s linear infinite;">' +
                '<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;padding:0 32px;">New Collection</span>' +
                '<span style="color:#B90E0A;padding:0 8px;">✦</span>' +
                '<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;padding:0 32px;">SS 2026</span>' +
                '<span style="color:#B90E0A;padding:0 8px;">✦</span>' +
                '<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;padding:0 32px;">Bench Apparel</span>' +
                '<span style="color:#B90E0A;padding:0 8px;">✦</span>' +
                '<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;padding:0 32px;">Shop Now</span>' +
                '<span style="color:#B90E0A;padding:0 8px;">✦</span>' +
                '<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;padding:0 32px;">New Collection</span>' +
                '<span style="color:#B90E0A;padding:0 8px;">✦</span>' +
                '<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;padding:0 32px;">SS 2026</span>' +
                '<span style="color:#B90E0A;padding:0 8px;">✦</span>' +
                '<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;padding:0 32px;">Bench Apparel</span>' +
                '<span style="color:#B90E0A;padding:0 8px;">✦</span>' +
                '<span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;padding:0 32px;">Shop Now</span>' +
                '<span style="color:#B90E0A;padding:0 8px;">✦</span>' +
                '</div></div>' +
 
                // Products scroll reveal
                '<section style="padding:80px 40px;background:#fafaf8;position:relative;z-index:1;">' +
                '<div style="max-width:1100px;margin:0 auto;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">' +
                '<h2 class="mf-reveal" style="font-size:40px;font-weight:900;color:#1a1a1a;margin:0;text-transform:uppercase;letter-spacing:-1.5px;">Featured<br><span style="color:#B90E0A;">Pieces</span></h2>' +
                '<a class="mf-reveal" href="#" style="font-size:12px;font-weight:700;color:#1a1a1a;text-decoration:none;letter-spacing:2px;text-transform:uppercase;border-bottom:1.5px solid #1a1a1a;">View All →</a>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">' +
                '<div class="mf-product-card mf-reveal"><div style="height:200px;background:linear-gradient(135deg,#B90E0A,#7a0806);display:flex;align-items:center;justify-content:center;font-size:60px;">👕</div><div style="padding:16px;"><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Essentials</div><div style="font-size:14px;font-weight:800;color:#1a1a1a;margin-top:3px;">Classic Polo</div><div style="font-size:15px;font-weight:900;color:#B90E0A;margin-top:6px;">₱899</div></div></div>' +
                '<div class="mf-product-card mf-reveal"><div style="height:200px;background:linear-gradient(135deg,#1a1a1a,#333);display:flex;align-items:center;justify-content:center;font-size:60px;">🧥</div><div style="padding:16px;"><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Outerwear</div><div style="font-size:14px;font-weight:800;color:#1a1a1a;margin-top:3px;">Urban Jacket</div><div style="font-size:15px;font-weight:900;color:#B90E0A;margin-top:6px;">₱2,499</div></div></div>' +
                '<div class="mf-product-card mf-reveal"><div style="height:200px;background:linear-gradient(135deg,#f5f5f0,#e8e8e0);display:flex;align-items:center;justify-content:center;font-size:60px;">👗</div><div style="padding:16px;"><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Women\'s</div><div style="font-size:14px;font-weight:800;color:#1a1a1a;margin-top:3px;">Summer Dress</div><div style="font-size:15px;font-weight:900;color:#B90E0A;margin-top:6px;">₱1,299</div></div></div>' +
                '<div class="mf-product-card mf-reveal"><div style="height:200px;background:linear-gradient(135deg,#7a0806,#B90E0A);display:flex;align-items:center;justify-content:center;font-size:60px;">👖</div><div style="padding:16px;"><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Bottoms</div><div style="font-size:14px;font-weight:800;color:#1a1a1a;margin-top:3px;">Slim Chinos</div><div style="font-size:15px;font-weight:900;color:#B90E0A;margin-top:6px;">₱1,199</div></div></div>' +
                '</div></div></section>' +
 
                '<script>' +
                '(function(){' +
                // Typewriter
                'var lines=[["WEAR","THE","FUTURE."],["DEFINE","YOUR","EDGE."],["BENCH","SS","2026."]];' +
                'var li=0,wi=0,ci=0,del=false,lineBuilt=[];' +
                'var el=document.getElementById("mf-tw");' +
                'function type(){if(!el)return;' +
                'if(!del){' +
                'var w=lines[li][wi];' +
                'var cur=w.substring(0,ci+1);ci++;' +
                'var built=[...lineBuilt,cur].join("<br>");' +
                'el.innerHTML=built;' +
                'if(ci===w.length){' +
                'if(wi<lines[li].length-1){lineBuilt.push(w);wi++;ci=0;setTimeout(type,200);return;}' +
                'else{del=true;setTimeout(type,2500);return;}}}' +
                'else{' +
                'if(lineBuilt.length>0){lineBuilt.pop();el.innerHTML=lineBuilt.join("<br>");' +
                'if(lineBuilt.length===0){del=false;li=(li+1)%lines.length;wi=0;ci=0;lineBuilt=[];}}' +
                'else{del=false;}}' +
                'setTimeout(type,del?80:110);}type();' +
                // Bubbles
                'var bc=document.getElementById("mf-bubbles");' +
                'for(var i=0;i<15;i++){' +
                '(function(i){var b=document.createElement("div");b.className="mf-bubble";' +
                'var sz=Math.random()*30+10;' +
                'b.style.cssText="width:"+sz+"px;height:"+sz+"px;left:"+Math.random()*100+"%;bottom:-50px;background:rgba(185,14,10,"+(Math.random()*.06+.02)+");animation:bubbleRise "+(Math.random()*10+8)+"s ease-in "+(Math.random()*8)+"s infinite;";' +
                'bc.appendChild(b);})(i);}' +
                // Scroll reveal
                'var revs=document.querySelectorAll(".mf-reveal");' +
                'function chk(){revs.forEach(function(r,i){if(r.getBoundingClientRect().top<window.innerHeight-60){r.style.transitionDelay=(i%4*.1)+"s";r.classList.add("vis");}});}' +
                'window.addEventListener("scroll",chk);chk();' +
                '})();' +
                '<\/script>' +
                '</div>';
            })()
        },
 


        // ── STOCK TRANSFER / DELIVERY TRACKER ────────────────────────────

        {
            id: 'screen-delivery-tracker',
            label: 'Screen: Stock Transfer Tracker',
            category: 'HR Screens',
            content: (function(){
                var mapSvg = '<svg width="100%" height="100%" viewBox="0 0 700 520" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;">' +
                    '<rect width="700" height="520" fill="#e8e4dc"/>' +
                    // water/background shapes
                    '<path d="M0 0 L700 0 L700 520 L0 520Z" fill="#eae6de"/>' +
                    // road network - major
                    '<path d="M200 0 L210 120 L350 200 L420 320 L440 520" stroke="#fff" stroke-width="8" fill="none" opacity="0.9"/>' +
                    '<path d="M0 200 L150 210 L350 200 L500 180 L700 190" stroke="#fff" stroke-width="6" fill="none" opacity="0.8"/>' +
                    '<path d="M0 350 L200 360 L420 320 L580 300 L700 310" stroke="#fff" stroke-width="5" fill="none" opacity="0.7"/>' +
                    '<path d="M350 200 L380 280 L420 320" stroke="#fff" stroke-width="4" fill="none" opacity="0.6"/>' +
                    '<path d="M150 210 L180 300 L200 360" stroke="#fff" stroke-width="3" fill="none" opacity="0.5"/>' +
                    '<path d="M500 180 L510 260 L580 300" stroke="#fff" stroke-width="3" fill="none" opacity="0.5"/>' +
                    // minor roads
                    '<path d="M0 100 L150 210" stroke="#fff" stroke-width="2" fill="none" opacity="0.4"/>' +
                    '<path d="M0 450 L200 360 L300 400 L420 320" stroke="#fff" stroke-width="2" fill="none" opacity="0.4"/>' +
                    '<path d="M700 80 L580 300" stroke="#fff" stroke-width="2" fill="none" opacity="0.4"/>' +
                    '<path d="M300 0 L350 200" stroke="#fff" stroke-width="2" fill="none" opacity="0.3"/>' +
                    // area blocks (buildings/parks)
                    '<rect x="60" y="60" width="40" height="25" rx="3" fill="#d4cfc6" opacity="0.6"/>' +
                    '<rect x="110" y="50" width="30" height="20" rx="3" fill="#d4cfc6" opacity="0.6"/>' +
                    '<rect x="60" y="260" width="50" height="30" rx="3" fill="#cce8cc" opacity="0.5"/>' +
                    '<rect x="560" y="60" width="60" height="40" rx="3" fill="#d4cfc6" opacity="0.6"/>' +
                    '<rect x="560" y="370" width="50" height="35" rx="3" fill="#d4cfc6" opacity="0.6"/>' +
                    '<rect x="440" y="60" width="45" height="30" rx="3" fill="#cce8cc" opacity="0.5"/>' +
                    '<rect x="250" y="390" width="40" height="28" rx="3" fill="#d4cfc6" opacity="0.6"/>' +
                    // labels
                    '<text x="75" y="45" font-family="Helvetica Neue,sans-serif" font-size="9" fill="#aaa9a0" font-weight="600">WAREHOUSE</text>' +
                    '<text x="210" y="195" font-family="Helvetica Neue,sans-serif" font-size="9" fill="#aaa9a0" font-weight="600">DEPOT</text>' +
                    '<text x="570" y="55" font-family="Helvetica Neue,sans-serif" font-size="9" fill="#aaa9a0" font-weight="600">BGC</text>' +
                    '<text x="395" y="315" font-family="Helvetica Neue,sans-serif" font-size="9" fill="#aaa9a0" font-weight="600">SM MOA</text>' +
                    '<text x="545" y="365" font-family="Helvetica Neue,sans-serif" font-size="9" fill="#aaa9a0" font-weight="600">ALABANG</text>' +
                    '<text x="55" y="360" font-family="Helvetica Neue,sans-serif" font-size="9" fill="#aaa9a0" font-weight="600">CEBU HUB</text>' +
                    // active route - warehouse to SM MOA (dashed)
                    '<path d="M90 80 L210 120 L350 200 L420 320" stroke="#1a1a1a" stroke-width="2.5" stroke-dasharray="6 4" fill="none" opacity="0.8"/>' +
                    // route to BGC (completed, solid)
                    '<path d="M90 80 L210 120 L350 200 L500 180 L580 100" stroke="#22c55e" stroke-width="2.5" fill="none" opacity="0.7"/>' +
                    // route to Alabang
                    '<path d="M420 320 L580 300" stroke="#1a1a1a" stroke-width="2" stroke-dasharray="5 4" fill="none" opacity="0.5"/>' +
                    // warehouse pin (origin)
                    '<circle cx="90" cy="80" r="10" fill="#1a1a1a"/>' +
                    '<text x="90" y="84" font-family="Helvetica Neue,sans-serif" font-size="9" fill="#fff" text-anchor="middle" font-weight="900">W</text>' +
                    '<text x="90" y="65" font-family="Helvetica Neue,sans-serif" font-size="8" fill="#555" text-anchor="middle" font-weight="600">MAIN WH</text>' +
                    // SM MOA pin (active destination)
                    '<circle cx="420" cy="320" r="12" fill="#B90E0A"/>' +
                    '<circle cx="420" cy="320" r="18" fill="rgba(185,14,10,0.15)"/>' +
                    '<text x="420" y="324" font-family="Helvetica Neue,sans-serif" font-size="8" fill="#fff" text-anchor="middle" font-weight="900">MOA</text>' +
                    // BGC pin (delivered)
                    '<circle cx="580" cy="100" r="10" fill="#22c55e"/>' +
                    '<text x="580" y="104" font-family="Helvetica Neue,sans-serif" font-size="8" fill="#fff" text-anchor="middle" font-weight="900">BGC</text>' +
                    // truck icon on route (current position)
                    '<circle cx="310" cy="178" r="10" fill="#fff" stroke="#1a1a1a" stroke-width="2"/>' +
                    '<text x="310" y="182" font-family="Helvetica Neue,sans-serif" font-size="9" text-anchor="middle">🚚</text>' +
                    // Alabang pin
                    '<circle cx="580" cy="300" r="9" fill="#f59e0b"/>' +
                    '<text x="580" y="304" font-family="Helvetica Neue,sans-serif" font-size="7" fill="#fff" text-anchor="middle" font-weight="900">ALB</text>' +
                    '</svg>';

                return '<div style="min-height:100vh;background:#f0ede8;font-family:\'Helvetica Neue\',Arial,sans-serif;display:grid;grid-template-columns:56px 380px 1fr;overflow:hidden;">' +

                // Icon sidebar
                '<div style="background:#fff;border-right:1px solid #e8e4de;display:flex;flex-direction:column;align-items:center;padding:18px 0;gap:6px;">' +
                '<div style="width:36px;height:36px;background:#1a1a1a;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div>' +
                '<button style="width:36px;height:36px;border:none;background:transparent;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">🏠</button>' +
                '<button style="width:36px;height:36px;border:none;background:#f4f4f2;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">📦</button>' +
                '<button style="width:36px;height:36px;border:none;background:transparent;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">🚚</button>' +
                '<button style="width:36px;height:36px;border:none;background:transparent;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">📊</button>' +
                '<div style="flex:1;"></div>' +
                '<button style="width:36px;height:36px;border:none;background:transparent;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">⚙️</button>' +
                '<button style="width:36px;height:36px;border:none;background:transparent;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">🚪</button>' +
                '</div>' +

                // List panel
                '<div style="background:#fff;border-right:1px solid #e8e4de;overflow-y:auto;display:flex;flex-direction:column;">' +
                // Header
                '<div style="padding:20px 20px 0;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
                '<div style="font-size:18px;font-weight:800;color:#1a1a1a;">Shipments</div>' +
                '<button style="width:32px;height:32px;border:1px solid #e5e7eb;border-radius:7px;background:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;">⋯</button>' +
                '</div>' +
                // Tab bar
                '<div style="display:flex;gap:8px;padding:0 20px;margin-bottom:16px;">' +
                '<button style="padding:7px 16px;background:#1a1a1a;border:none;border-radius:99px;font-size:12px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">In Transit</button>' +
                '<button style="padding:7px 16px;background:transparent;border:1.5px solid #e5e7eb;border-radius:99px;font-size:12px;color:#888;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Delivered</button>' +
                '<button style="padding:7px 16px;background:transparent;border:1.5px solid #e5e7eb;border-radius:99px;font-size:12px;color:#888;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Pending</button>' +
                '</div>' +

                // Item 1 - not selected
                '<div style="padding:12px 20px;border-bottom:1px solid #f5f5f3;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">' +
                '<div><div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:2px;">Warehouse → BGC Branch</div><div style="font-size:11px;color:#aaa;">TRF #18498-98018</div></div>' +
                '<span style="background:#d1fae5;color:#065f46;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;">DELIVERED</span>' +
                '</div>' +

                // Item 2 - SELECTED/ACTIVE
                '<div style="margin:4px 10px;background:#f8f7f4;border-radius:14px;padding:16px;border:1.5px solid #e5e7eb;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">' +
                '<div><div style="font-size:13px;font-weight:800;color:#1a1a1a;margin-bottom:2px;">Warehouse → SM MOA</div><div style="font-size:11px;color:#aaa;">TRF #29698-98971</div></div>' +
                '<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">IN TRANSIT</span>' +
                '</div>' +
                // Progress bar
                '<div style="background:#e5e7eb;border-radius:99px;height:5px;margin-bottom:12px;overflow:hidden;">' +
                '<div style="background:linear-gradient(90deg,#1a1a1a,#555);width:62%;height:5px;border-radius:99px;"></div>' +
                '</div>' +
                // Meta grid
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px;">' +
                '<div><div style="font-size:9px;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Driver</div><div style="font-size:11px;font-weight:700;color:#1a1a1a;">R. Manalo</div></div>' +
                '<div><div style="font-size:9px;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Departed</div><div style="font-size:11px;font-weight:700;color:#1a1a1a;">06:30 AM</div></div>' +
                '<div><div style="font-size:9px;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Distance</div><div style="font-size:11px;font-weight:700;color:#1a1a1a;">28 km</div></div>' +
                '<div><div style="font-size:9px;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Items</div><div style="font-size:11px;font-weight:700;color:#1a1a1a;">142 pcs</div></div>' +
                '</div>' +
                // Driver row
                '<div style="display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#B90E0A,#7a0806);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700;">RM</div>' +
                '<div style="font-size:12px;font-weight:600;color:#1a1a1a;">Rodrigo Manalo</div>' +
                '</div>' +
                '<div style="display:flex;gap:6px;">' +
                '<button style="width:28px;height:28px;border:1.5px solid #e5e7eb;border-radius:7px;background:#fff;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">💬</button>' +
                '<button style="width:28px;height:28px;border:1.5px solid #e5e7eb;border-radius:7px;background:#fff;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;">📞</button>' +
                '</div></div>' +
                '<div style="margin-top:10px;border-top:1px solid #e5e7eb;padding-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#888;cursor:pointer;"><span>Shipment history and manifest</span><span>▾</span></div>' +
                '</div>' +

                // Item 3
                '<div style="padding:12px 20px;border-bottom:1px solid #f5f5f3;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">' +
                '<div><div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:2px;">Warehouse → Alabang</div><div style="font-size:11px;color:#aaa;">TRF #09498-98367</div></div>' +
                '<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;">IN TRANSIT</span>' +
                '</div>' +

                // Item 4
                '<div style="padding:12px 20px;border-bottom:1px solid #f5f5f3;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">' +
                '<div><div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:2px;">Warehouse → Cebu</div><div style="font-size:11px;color:#aaa;">TRF #14398-98719</div></div>' +
                '<span style="background:#fef9c3;color:#92400e;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;">PACKED</span>' +
                '</div>' +

                // Item 5
                '<div style="padding:12px 20px;border-bottom:1px solid #f5f5f3;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">' +
                '<div><div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:2px;">Warehouse → Davao</div><div style="font-size:11px;color:#aaa;">TRF #25398-98001</div></div>' +
                '<span style="font-size:10px;font-weight:700;color:#bbb;letter-spacing:1px;text-transform:uppercase;">DELIVERED</span>' +
                '</div>' +

                // Item 6
                '<div style="padding:12px 20px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;">' +
                '<div><div style="font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:2px;">Warehouse → Cebu Ayala</div><div style="font-size:11px;color:#aaa;">TRF #25398-98002</div></div>' +
                '<span style="font-size:10px;font-weight:700;color:#bbb;letter-spacing:1px;text-transform:uppercase;">DELIVERED</span>' +
                '</div>' +

                '</div>' +

                // Map + detail panel
                '<div style="display:flex;flex-direction:column;position:relative;">' +
                // Map area
                '<div style="flex:1;position:relative;overflow:hidden;">' +
                mapSvg +
                // map controls
                '<div style="position:absolute;top:16px;right:16px;display:flex;flex-direction:column;gap:8px;">' +
                '<button style="width:36px;height:36px;background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);">🔍</button>' +
                '<button style="width:36px;height:36px;background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);">⊕</button>' +
                '<button style="width:36px;height:36px;background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);">⊖</button>' +
                '</div>' +
                // Active shipment map badge
                '<div style="position:absolute;top:16px;left:16px;background:rgba(26,26,26,0.85);backdrop-filter:blur(8px);border-radius:10px;padding:10px 14px;color:#fff;font-size:11px;">' +
                '<div style="display:flex;align-items:center;gap:6px;"><div style="width:6px;height:6px;background:#22c55e;border-radius:50%;"></div><span style="font-weight:600;">Live Tracking Active</span></div>' +
                '<div style="color:rgba(255,255,255,0.5);margin-top:2px;font-size:10px;">TRF #29698-98971 · Updating every 30s</div>' +
                '</div>' +
                '</div>' +
                // Detail strip bottom
                '<div style="background:#fff;border-top:1px solid #e8e4de;padding:16px 20px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                '<div style="font-size:13px;font-weight:800;color:#1a1a1a;">TRF #29698-98971</div>' +
                '<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;padding:2px 10px;border-radius:99px;font-size:10px;font-weight:700;">IN TRANSIT</span>' +
                '</div>' +
                '<button style="padding:8px 18px;background:#1a1a1a;border:none;border-radius:8px;font-size:12px;color:#fff;cursor:pointer;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">Contact Driver</button>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:0;border-top:1px solid #f5f5f3;padding-top:12px;">' +
                '<div><div style="font-size:10px;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">From</div><div style="font-size:13px;font-weight:700;color:#1a1a1a;">Main Warehouse</div><div style="font-size:11px;color:#aaa;">Valenzuela</div></div>' +
                '<div><div style="font-size:10px;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">To</div><div style="font-size:13px;font-weight:700;color:#1a1a1a;">SM Mall of Asia</div><div style="font-size:11px;color:#aaa;">Pasay City</div></div>' +
                '<div><div style="font-size:10px;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Current Location</div><div style="font-size:13px;font-weight:700;color:#1a1a1a;">EDSA–Roxas</div><div style="font-size:11px;color:#aaa;">Pasay City</div></div>' +
                '<div><div style="font-size:10px;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">ETA</div><div style="font-size:13px;font-weight:700;color:#B90E0A;">35 mins</div><div style="font-size:11px;color:#aaa;">~10:45 AM</div></div>' +
                '<div><div style="font-size:10px;color:#bbb;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Items</div><div style="font-size:13px;font-weight:700;color:#1a1a1a;">142 pcs</div><div style="font-size:11px;color:#aaa;">3 SKUs</div></div>' +
                '</div>' +
                '</div>' +
                '</div>' +

                '</div>';
            })()
        },

        
        {
            id: 'hr-org-positions-directory',
            label: 'Org: Positions Directory',
            category: 'HR Screens',
            content: '<div class="min-h-screen bg-gray-50 font-sans">' +
 
                // Header
                '<div class="bg-white border-b border-gray-200 px-7 h-14 flex items-center justify-between shadow-sm">' +
                '<div class="flex items-center gap-3">' +
                '<div class="w-8 h-8 bg-[#B90E0A] rounded-lg flex items-center justify-center text-white font-black text-sm">B</div>' +
                '<span class="text-sm font-bold text-gray-900">Positions Directory</span>' +
                '</div>' +
                '<button class="px-4 py-2 bg-[#B90E0A] text-white text-xs font-bold rounded-lg">+ Add Position</button>' +
                '</div>' +
 
                '<div class="p-7">' +
 
                // Stats
                '<div class="grid grid-cols-4 gap-3 mb-5">' +
                '<div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"><span class="text-2xl font-black text-gray-900">8</span><span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Positions</span></div>' +
                '<div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"><span class="text-2xl font-black text-green-600">7</span><span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</span></div>' +
                '<div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"><span class="text-2xl font-black text-red-600">1</span><span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inactive</span></div>' +
                '<div class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"><span class="text-2xl font-black text-blue-600">5</span><span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Departments</span></div>' +
                '</div>' +
 
                // Filters
                '<div class="flex gap-3 flex-wrap mb-5">' +
                '<div class="flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2">' +
                '<span class="text-gray-400 text-sm">🔍</span>' +
                '<input placeholder="Search position or department..." class="border-none outline-none text-sm flex-1 bg-transparent text-gray-900" />' +
                '</div>' +
                '<select class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white text-gray-600"><option>All Departments</option><option>Retail Operations</option><option>Human Resources</option><option>Finance</option></select>' +
                '<select class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white text-gray-600"><option>All Levels</option><option>Entry</option><option>Junior</option><option>Senior</option><option>Supervisor</option><option>Manager</option></select>' +
                '<select class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white text-gray-600"><option>All Status</option><option>Active</option><option>Inactive</option></select>' +
                '</div>' +
 
                // Table
                '<div class="bg-white rounded-xl shadow-sm overflow-hidden">' +
                '<table class="w-full text-sm border-collapse">' +
                '<thead><tr class="bg-gray-50 border-b border-gray-100">' +
                '<th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">ID</th>' +
                '<th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</th>' +
                '<th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department</th>' +
                '<th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Level</th>' +
                '<th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Salary Range</th>' +
                '<th class="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>' +
                '<th class="px-4 py-3"></th>' +
                '</tr></thead>' +
                '<tbody>' +
 
                '<tr class="border-b border-gray-50 hover:bg-gray-50">' +
                '<td class="px-4 py-3 font-mono text-xs font-bold text-[#B90E0A]">HR-P001</td>' +
                '<td class="px-4 py-3 font-semibold text-gray-900">Sales Associate</td>' +
                '<td class="px-4 py-3 text-gray-500">Retail Operations</td>' +
                '<td class="px-4 py-3"><span class="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Entry</span></td>' +
                '<td class="px-4 py-3 text-xs"><span class="text-gray-400">PHP 18,000</span><span class="text-gray-300"> — </span><span class="font-bold text-gray-800">PHP 22,000</span></td>' +
                '<td class="px-4 py-3"><span class="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Active</span></td>' +
                '<td class="px-4 py-3"><div class="flex gap-2"><button class="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">Edit</button><button class="px-3 py-1.5 bg-[#B90E0A] rounded-lg text-xs font-semibold text-white">View</button></div></td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50 bg-gray-50/50 hover:bg-gray-50">' +
                '<td class="px-4 py-3 font-mono text-xs font-bold text-[#B90E0A]">HR-P002</td>' +
                '<td class="px-4 py-3 font-semibold text-gray-900">Sr. Sales Associate</td>' +
                '<td class="px-4 py-3 text-gray-500">Retail Operations</td>' +
                '<td class="px-4 py-3"><span class="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Senior</span></td>' +
                '<td class="px-4 py-3 text-xs"><span class="text-gray-400">PHP 24,000</span><span class="text-gray-300"> — </span><span class="font-bold text-gray-800">PHP 30,000</span></td>' +
                '<td class="px-4 py-3"><span class="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Active</span></td>' +
                '<td class="px-4 py-3"><div class="flex gap-2"><button class="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">Edit</button><button class="px-3 py-1.5 bg-[#B90E0A] rounded-lg text-xs font-semibold text-white">View</button></div></td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50 hover:bg-gray-50">' +
                '<td class="px-4 py-3 font-mono text-xs font-bold text-[#B90E0A]">HR-P003</td>' +
                '<td class="px-4 py-3 font-semibold text-gray-900">Branch Manager</td>' +
                '<td class="px-4 py-3 text-gray-500">Operations</td>' +
                '<td class="px-4 py-3"><span class="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Manager</span></td>' +
                '<td class="px-4 py-3 text-xs"><span class="text-gray-400">PHP 55,000</span><span class="text-gray-300"> — </span><span class="font-bold text-gray-800">PHP 80,000</span></td>' +
                '<td class="px-4 py-3"><span class="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Active</span></td>' +
                '<td class="px-4 py-3"><div class="flex gap-2"><button class="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">Edit</button><button class="px-3 py-1.5 bg-[#B90E0A] rounded-lg text-xs font-semibold text-white">View</button></div></td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50 bg-gray-50/50 hover:bg-gray-50">' +
                '<td class="px-4 py-3 font-mono text-xs font-bold text-[#B90E0A]">HR-P004</td>' +
                '<td class="px-4 py-3 font-semibold text-gray-900">HR Coordinator</td>' +
                '<td class="px-4 py-3 text-gray-500">Human Resources</td>' +
                '<td class="px-4 py-3"><span class="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Supervisor</span></td>' +
                '<td class="px-4 py-3 text-xs"><span class="text-gray-400">PHP 35,000</span><span class="text-gray-300"> — </span><span class="font-bold text-gray-800">PHP 45,000</span></td>' +
                '<td class="px-4 py-3"><span class="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Active</span></td>' +
                '<td class="px-4 py-3"><div class="flex gap-2"><button class="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">Edit</button><button class="px-3 py-1.5 bg-[#B90E0A] rounded-lg text-xs font-semibold text-white">View</button></div></td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50 hover:bg-gray-50">' +
                '<td class="px-4 py-3 font-mono text-xs font-bold text-[#B90E0A]">HR-P005</td>' +
                '<td class="px-4 py-3 font-semibold text-gray-900">Payroll Officer</td>' +
                '<td class="px-4 py-3 text-gray-500">Finance</td>' +
                '<td class="px-4 py-3"><span class="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Senior</span></td>' +
                '<td class="px-4 py-3 text-xs"><span class="text-gray-400">PHP 32,000</span><span class="text-gray-300"> — </span><span class="font-bold text-gray-800">PHP 42,000</span></td>' +
                '<td class="px-4 py-3"><span class="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Inactive</span></td>' +
                '<td class="px-4 py-3"><div class="flex gap-2"><button class="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">Edit</button><button class="px-3 py-1.5 bg-[#B90E0A] rounded-lg text-xs font-semibold text-white">View</button></div></td>' +
                '</tr>' +
 
                '</tbody></table>' +
                '<div class="px-4 py-3 flex justify-between items-center border-t border-gray-100">' +
                '<span class="text-xs text-gray-400">Showing 5 of 8 positions</span>' +
                '<div class="flex gap-2">' +
                '<button class="px-3 py-1.5 bg-gray-100 rounded-md text-xs font-semibold text-gray-500">← Prev</button>' +
                '<button class="px-3 py-1.5 bg-[#B90E0A] text-white rounded-md text-xs font-bold">1</button>' +
                '<button class="px-3 py-1.5 bg-gray-100 rounded-md text-xs font-semibold text-gray-500">Next →</button>' +
                '</div></div>' +
                '</div></div></div>'
        },
 
        {
            id: 'hr-org-chart-viewer',
            label: 'Org: Org Chart Viewer',
            category: 'HR Screens',
            content: '<div class="min-h-screen bg-gray-50 font-sans">' +
 
                '<div class="bg-white border-b border-gray-200 px-7 h-14 flex items-center justify-between shadow-sm">' +
                '<div class="flex items-center gap-3">' +
                '<div class="w-8 h-8 bg-[#B90E0A] rounded-lg flex items-center justify-center text-white font-black text-sm">B</div>' +
                '<span class="text-sm font-bold text-gray-900">Org Chart</span>' +
                '</div>' +
                '<div class="flex gap-2">' +
                '<select class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none bg-white text-gray-600"><option>All Departments</option><option>Operations</option><option>HR</option></select>' +
                '<button class="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">⬇ Export</button>' +
                '<button class="px-4 py-1.5 bg-[#B90E0A] rounded-lg text-xs font-bold text-white">+ Add Node</button>' +
                '</div></div>' +
 
                // Legend
                '<div class="px-7 pt-4 flex gap-4 flex-wrap">' +
                '<div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block"></span><span class="text-xs text-gray-500">Manager</span></div>' +
                '<div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-yellow-100 border border-yellow-300 inline-block"></span><span class="text-xs text-gray-500">Supervisor</span></div>' +
                '<div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300 inline-block"></span><span class="text-xs text-gray-500">Senior</span></div>' +
                '<div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-300 inline-block"></span><span class="text-xs text-gray-500">Junior</span></div>' +
                '<div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm bg-gray-100 border border-gray-300 inline-block"></span><span class="text-xs text-gray-500">Entry</span></div>' +
                '</div>' +
 
                // Chart canvas
                '<div class="p-7 overflow-x-auto">' +
                '<div class="min-w-[900px] flex flex-col items-center gap-0">' +
 
                // Top node — Regional Director
                '<div class="bg-white border-2 border-gray-200 border-t-4 border-t-[#B90E0A] rounded-2xl p-4 w-44 text-center shadow-md">' +
                '<div class="w-11 h-11 rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-sm mx-auto mb-2">RD</div>' +
                '<div class="text-xs font-bold text-gray-900">Roberto D.</div>' +
                '<div class="text-[10px] text-[#B90E0A] font-semibold mt-0.5">Regional Director</div>' +
                '<span class="mt-1.5 inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Manager</span>' +
                '</div>' +
 
                // Connector down
                '<div class="w-0.5 h-6 bg-gray-200"></div>' +
 
                // Level 2 row
                '<div class="flex gap-0 items-start relative">' +
                '<div class="absolute top-0 left-[15%] right-[15%] h-0.5 bg-gray-200"></div>' +
 
                // Branch 1
                '<div class="flex flex-col items-center px-6">' +
                '<div class="w-0.5 h-6 bg-gray-200"></div>' +
                '<div class="bg-white border-2 border-gray-200 border-t-4 border-t-[#B90E0A] rounded-2xl p-4 w-44 text-center shadow-md">' +
                '<div class="w-11 h-11 rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-sm mx-auto mb-2">RM</div>' +
                '<div class="text-xs font-bold text-gray-900">Rico M.</div>' +
                '<div class="text-[10px] text-[#B90E0A] font-semibold mt-0.5">Branch Manager</div>' +
                '<span class="mt-1.5 inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Manager</span>' +
                '</div>' +
                '<div class="w-0.5 h-6 bg-gray-200"></div>' +
                '<div class="flex gap-0 items-start relative">' +
                '<div class="absolute top-0 left-[10%] right-[10%] h-0.5 bg-gray-200"></div>' +
                '<div class="flex flex-col items-center px-4">' +
                '<div class="w-0.5 h-6 bg-gray-200"></div>' +
                '<div class="bg-white border border-gray-200 border-t-2 border-t-[#B90E0A] rounded-xl p-3 w-36 text-center shadow-sm">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-xs mx-auto mb-1.5">MS</div>' +
                '<div class="text-[11px] font-bold text-gray-900">Maria S.</div>' +
                '<div class="text-[9px] text-[#B90E0A] font-semibold mt-0.5">Sr. Sales Assoc.</div>' +
                '<span class="mt-1 inline-block bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[8px] font-bold">Senior</span>' +
                '</div></div>' +
                '<div class="flex flex-col items-center px-4">' +
                '<div class="w-0.5 h-6 bg-gray-200"></div>' +
                '<div class="bg-white border border-gray-200 border-t-2 border-t-[#B90E0A] rounded-xl p-3 w-36 text-center shadow-sm">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] flex items-center justify-center text-white font-black text-xs mx-auto mb-1.5">JC</div>' +
                '<div class="text-[11px] font-bold text-gray-900">Juan C.</div>' +
                '<div class="text-[9px] text-[#B90E0A] font-semibold mt-0.5">Sales Associate</div>' +
                '<span class="mt-1 inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[8px] font-bold">Entry</span>' +
                '</div></div>' +
                '</div></div>' +
 
                // Branch 2
                '<div class="flex flex-col items-center px-6">' +
                '<div class="w-0.5 h-6 bg-gray-200"></div>' +
                '<div class="bg-white border-2 border-gray-200 border-t-4 border-t-[#B90E0A] rounded-2xl p-4 w-44 text-center shadow-md">' +
                '<div class="w-11 h-11 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] flex items-center justify-center text-white font-black text-sm mx-auto mb-2">SC</div>' +
                '<div class="text-xs font-bold text-gray-900">Sara C.</div>' +
                '<div class="text-[10px] text-[#B90E0A] font-semibold mt-0.5">Operations Mgr.</div>' +
                '<span class="mt-1.5 inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Manager</span>' +
                '</div>' +
                '<div class="w-0.5 h-6 bg-gray-200"></div>' +
                '<div class="bg-white border border-gray-200 border-t-2 border-t-[#B90E0A] rounded-xl p-3 w-36 text-center shadow-sm">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#4c1d95] to-[#2e1065] flex items-center justify-center text-white font-black text-xs mx-auto mb-1.5">PG</div>' +
                '<div class="text-[11px] font-bold text-gray-900">Pedro G.</div>' +
                '<div class="text-[9px] text-[#B90E0A] font-semibold mt-0.5">Stock Clerk</div>' +
                '<span class="mt-1 inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[8px] font-bold">Entry</span>' +
                '</div></div>' +
 
                // Branch 3
                '<div class="flex flex-col items-center px-6">' +
                '<div class="w-0.5 h-6 bg-gray-200"></div>' +
                '<div class="bg-white border-2 border-gray-200 border-t-4 border-t-[#B90E0A] rounded-2xl p-4 w-44 text-center shadow-md">' +
                '<div class="w-11 h-11 rounded-full bg-gradient-to-br from-[#064e3b] to-[#022c22] flex items-center justify-center text-white font-black text-sm mx-auto mb-2">DL</div>' +
                '<div class="text-xs font-bold text-gray-900">Dana L.</div>' +
                '<div class="text-[10px] text-[#B90E0A] font-semibold mt-0.5">HR Manager</div>' +
                '<span class="mt-1.5 inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Manager</span>' +
                '</div>' +
                '<div class="w-0.5 h-6 bg-gray-200"></div>' +
                '<div class="bg-white border border-gray-200 border-t-2 border-t-[#B90E0A] rounded-xl p-3 w-36 text-center shadow-sm">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#92400e] to-[#451a03] flex items-center justify-center text-white font-black text-xs mx-auto mb-1.5">LT</div>' +
                '<div class="text-[11px] font-bold text-gray-900">Lisa T.</div>' +
                '<div class="text-[9px] text-[#B90E0A] font-semibold mt-0.5">HR Coordinator</div>' +
                '<span class="mt-1 inline-block bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full text-[8px] font-bold">Supervisor</span>' +
                '</div></div>' +
 
                '</div></div></div></div>'
        },
 
        {
            id: 'hr-org-position-history',
            label: 'Org: Position History Timeline',
            category: 'HR Screens',
            content: '<div class="min-h-screen bg-gray-50 font-sans">' +
 
                '<div class="bg-white border-b border-gray-200 px-7 h-14 flex items-center justify-between shadow-sm">' +
                '<div class="flex items-center gap-3">' +
                '<div class="w-8 h-8 bg-[#B90E0A] rounded-lg flex items-center justify-center text-white font-black text-sm">B</div>' +
                '<span class="text-sm font-bold text-gray-900">Position History</span>' +
                '</div>' +
                '<button class="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">⬇ Export PDF</button>' +
                '</div>' +
 
                '<div class="p-7">' +
 
                // Employee card
                '<div class="bg-white rounded-xl shadow-sm p-5 mb-6 flex items-center gap-4">' +
                '<div class="w-14 h-14 rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-lg shrink-0">MS</div>' +
                '<div class="flex-1">' +
                '<p class="text-base font-extrabold text-gray-900">Maria Santos</p>' +
                '<p class="text-xs text-[#B90E0A] font-semibold mt-0.5">Sr. Sales Associate · Retail Operations</p>' +
                '<p class="text-xs text-gray-400 mt-0.5">HR-00142 · SM Mall of Asia</p>' +
                '</div>' +
                '<div class="text-right">' +
                '<p class="text-[10px] text-gray-400 uppercase tracking-wider">Total Tenure</p>' +
                '<p class="text-lg font-black text-gray-900">3 yrs 2 mos</p>' +
                '<p class="text-[10px] text-gray-400 mt-0.5">Since March 2023</p>' +
                '</div>' +
                '</div>' +
 
                // Filters
                '<div class="flex gap-3 mb-6">' +
                '<select class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white text-gray-600"><option>All Change Types</option><option>Hired</option><option>Promoted</option><option>Transferred</option><option>Demoted</option></select>' +
                '<select class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white text-gray-600"><option>All Years</option><option>2026</option><option>2025</option><option>2024</option><option>2023</option></select>' +
                '</div>' +
 
                // Timeline
                '<div class="relative">' +
                '<div class="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200"></div>' +
 
                // Entry 1 — Promoted
                '<div class="flex gap-5 mb-6 relative">' +
                '<div class="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center shrink-0 z-10 text-sm">⬆</div>' +
                '<div class="flex-1 bg-white rounded-xl shadow-sm p-5">' +
                '<div class="flex items-start justify-between mb-3">' +
                '<div><span class="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Promoted</span>' +
                '<p class="text-sm font-extrabold text-gray-900 mt-2">Sr. Sales Associate</p>' +
                '<p class="text-xs text-gray-500">Retail Operations · SM Mall of Asia</p></div>' +
                '<div class="text-right shrink-0"><p class="text-xs font-bold text-gray-900">Jan 15, 2026</p><p class="text-[10px] text-gray-400">Current Position</p></div>' +
                '</div>' +
                '<div class="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">' +
                '<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Remarks</p>' +
                '<p class="text-xs text-gray-600">Exceeded Q4 targets consistently for 2 years. Recommended by Branch Manager.</p>' +
                '</div>' +
                '<p class="text-[10px] text-gray-400 mt-2">Changed by: Admin</p>' +
                '</div></div>' +
 
                // Entry 2 — Transferred
                '<div class="flex gap-5 mb-6 relative">' +
                '<div class="w-10 h-10 rounded-full bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center shrink-0 z-10 text-sm">↔</div>' +
                '<div class="flex-1 bg-white rounded-xl shadow-sm p-5">' +
                '<div class="flex items-start justify-between mb-3">' +
                '<div><span class="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Transferred</span>' +
                '<p class="text-sm font-extrabold text-gray-900 mt-2">Sales Associate</p>' +
                '<p class="text-xs text-gray-500">Retail Operations · SM Mall of Asia</p></div>' +
                '<div class="text-right shrink-0"><p class="text-xs font-bold text-gray-900">Jun 1, 2024</p><p class="text-[10px] text-gray-400">1 yr 7 mos</p></div>' +
                '</div>' +
                '<div class="bg-gray-50 rounded-lg p-3 border-l-4 border-yellow-400">' +
                '<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Remarks</p>' +
                '<p class="text-xs text-gray-600">Requested branch transfer to SM Mall of Asia due to personal reasons.</p>' +
                '</div>' +
                '<p class="text-[10px] text-gray-400 mt-2">Changed by: Admin</p>' +
                '</div></div>' +
 
                // Entry 3 — Hired
                '<div class="flex gap-5 mb-6 relative">' +
                '<div class="w-10 h-10 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center shrink-0 z-10 text-sm">✓</div>' +
                '<div class="flex-1 bg-white rounded-xl shadow-sm p-5">' +
                '<div class="flex items-start justify-between mb-3">' +
                '<div><span class="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Hired</span>' +
                '<p class="text-sm font-extrabold text-gray-900 mt-2">Sales Associate</p>' +
                '<p class="text-xs text-gray-500">Retail Operations · Cebu Branch</p></div>' +
                '<div class="text-right shrink-0"><p class="text-xs font-bold text-gray-900">Mar 10, 2023</p><p class="text-[10px] text-gray-400">Start of employment</p></div>' +
                '</div>' +
                '<div class="bg-gray-50 rounded-lg p-3 border-l-4 border-green-400">' +
                '<p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Remarks</p>' +
                '<p class="text-xs text-gray-600">Initial employment. Passed all pre-employment requirements.</p>' +
                '</div>' +
                '<p class="text-[10px] text-gray-400 mt-2">Changed by: HR System</p>' +
                '</div></div>' +
 
                '</div></div></div>'
        },
 
        {
            id: 'hr-org-management-dashboard',
            label: 'Org: Management Dashboard',
            category: 'HR Dashboards',
            content: '<div class="min-h-screen bg-gray-50 font-sans">' +
 
                '<div class="bg-white border-b border-gray-200 px-7 h-14 flex items-center justify-between shadow-sm">' +
                '<div class="flex items-center gap-3">' +
                '<div class="w-8 h-8 bg-[#B90E0A] rounded-lg flex items-center justify-center text-white font-black text-sm">B</div>' +
                '<span class="text-sm font-bold text-gray-900">Org Management Dashboard</span>' +
                '</div>' +
                '<div class="flex gap-2">' +
                '<select class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none bg-white text-gray-600"><option>Q1 2026</option><option>Q4 2025</option><option>Q3 2025</option></select>' +
                '<button class="px-4 py-1.5 bg-[#B90E0A] rounded-lg text-xs font-bold text-white">⬇ Export Report</button>' +
                '</div></div>' +
 
                '<div class="p-7">' +
 
                // KPI row
                '<div class="grid grid-cols-4 gap-4 mb-6">' +
                '<div class="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-t-[#B90E0A]">' +
                '<p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Positions</p>' +
                '<p class="text-3xl font-black text-gray-900">24</p>' +
                '<p class="text-xs text-green-600 font-semibold mt-1">↑ 3 new this quarter</p>' +
                '</div>' +
                '<div class="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-t-green-500">' +
                '<p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Filled Positions</p>' +
                '<p class="text-3xl font-black text-green-600">21</p>' +
                '<p class="text-xs text-gray-400 font-semibold mt-1">87.5% fill rate</p>' +
                '</div>' +
                '<div class="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-t-yellow-400">' +
                '<p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Vacant Positions</p>' +
                '<p class="text-3xl font-black text-yellow-600">3</p>' +
                '<p class="text-xs text-gray-400 font-semibold mt-1">Actively recruiting</p>' +
                '</div>' +
                '<div class="bg-white rounded-2xl p-5 shadow-sm border-t-4 border-t-blue-500">' +
                '<p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Movements Q1</p>' +
                '<p class="text-3xl font-black text-blue-600">12</p>' +
                '<p class="text-xs text-gray-400 font-semibold mt-1">Promo, transfer, hire</p>' +
                '</div>' +
                '</div>' +
 
                // Two columns
                '<div class="grid grid-cols-2 gap-6 mb-6">' +
 
                // Dept breakdown
                '<div class="bg-white rounded-2xl shadow-sm p-5">' +
                '<p class="text-xs font-bold text-gray-900 mb-4">Positions by Department</p>' +
                '<div class="space-y-3">' +
                '<div><div class="flex justify-between mb-1"><span class="text-xs text-gray-600">Retail Operations</span><span class="text-xs font-bold text-gray-900">9</span></div><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-[#B90E0A] h-2 rounded-full" style="width:75%"></div></div></div>' +
                '<div><div class="flex justify-between mb-1"><span class="text-xs text-gray-600">Human Resources</span><span class="text-xs font-bold text-gray-900">4</span></div><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-blue-500 h-2 rounded-full" style="width:33%"></div></div></div>' +
                '<div><div class="flex justify-between mb-1"><span class="text-xs text-gray-600">Finance</span><span class="text-xs font-bold text-gray-900">4</span></div><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-green-500 h-2 rounded-full" style="width:33%"></div></div></div>' +
                '<div><div class="flex justify-between mb-1"><span class="text-xs text-gray-600">Marketing</span><span class="text-xs font-bold text-gray-900">3</span></div><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-yellow-400 h-2 rounded-full" style="width:25%"></div></div></div>' +
                '<div><div class="flex justify-between mb-1"><span class="text-xs text-gray-600">Operations</span><span class="text-xs font-bold text-gray-900">4</span></div><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-purple-500 h-2 rounded-full" style="width:33%"></div></div></div>' +
                '</div></div>' +
 
                // Level breakdown
                '<div class="bg-white rounded-2xl shadow-sm p-5">' +
                '<p class="text-xs font-bold text-gray-900 mb-4">Positions by Level</p>' +
                '<div class="grid grid-cols-2 gap-3">' +
                '<div class="bg-red-50 border border-red-100 rounded-xl p-3 text-center"><p class="text-xl font-black text-red-700">4</p><p class="text-[10px] text-red-500 font-bold mt-0.5">Manager</p></div>' +
                '<div class="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center"><p class="text-xl font-black text-yellow-700">3</p><p class="text-[10px] text-yellow-500 font-bold mt-0.5">Supervisor</p></div>' +
                '<div class="bg-green-50 border border-green-100 rounded-xl p-3 text-center"><p class="text-xl font-black text-green-700">7</p><p class="text-[10px] text-green-500 font-bold mt-0.5">Senior</p></div>' +
                '<div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center"><p class="text-xl font-black text-blue-700">4</p><p class="text-[10px] text-blue-500 font-bold mt-0.5">Junior</p></div>' +
                '<div class="col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center"><p class="text-xl font-black text-gray-700">6</p><p class="text-[10px] text-gray-500 font-bold mt-0.5">Entry</p></div>' +
                '</div></div>' +
                '</div>' +
 
                // Recent movements
                '<div class="bg-white rounded-2xl shadow-sm p-5">' +
                '<div class="flex justify-between items-center mb-4">' +
                '<p class="text-xs font-bold text-gray-900">Recent Position Movements</p>' +
                '<a href="#" class="text-xs text-[#B90E0A] font-semibold">View All →</a>' +
                '</div>' +
                '<div class="space-y-3">' +
 
                '<div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-xs shrink-0">MS</div>' +
                '<div class="flex-1"><p class="text-xs font-bold text-gray-900">Maria Santos</p><p class="text-[10px] text-gray-500">Sales Associate → Sr. Sales Associate</p></div>' +
                '<div class="text-right"><span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Promoted</span><p class="text-[10px] text-gray-400 mt-0.5">Jan 15, 2026</p></div>' +
                '</div>' +
 
                '<div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] flex items-center justify-center text-white font-black text-xs shrink-0">JC</div>' +
                '<div class="flex-1"><p class="text-xs font-bold text-gray-900">Juan dela Cruz</p><p class="text-[10px] text-gray-500">BGC Branch → SM MOA Branch</p></div>' +
                '<div class="text-right"><span class="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Transferred</span><p class="text-[10px] text-gray-400 mt-0.5">Jan 10, 2026</p></div>' +
                '</div>' +
 
                '<div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#064e3b] to-[#022c22] flex items-center justify-center text-white font-black text-xs shrink-0">AR</div>' +
                '<div class="flex-1"><p class="text-xs font-bold text-gray-900">Ana Reyes</p><p class="text-[10px] text-gray-500">Visual Merchandiser · Hired</p></div>' +
                '<div class="text-right"><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Hired</span><p class="text-[10px] text-gray-400 mt-0.5">Jan 5, 2026</p></div>' +
                '</div>' +
 
                '<div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#4c1d95] to-[#2e1065] flex items-center justify-center text-white font-black text-xs shrink-0">PG</div>' +
                '<div class="flex-1"><p class="text-xs font-bold text-gray-900">Pedro Gomez</p><p class="text-[10px] text-gray-500">Supervisor → Stock Clerk</p></div>' +
                '<div class="text-right"><span class="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Demoted</span><p class="text-[10px] text-gray-400 mt-0.5">Dec 20, 2025</p></div>' +
                '</div>' +
 
                '</div></div></div></div>'
        },
 
        {
            id: 'hr-org-position-detail',
            label: 'Org: Position Detail Page',
            category: 'HR Screens',
            content: '<div class="min-h-screen bg-gray-50 font-sans">' +
 
                '<div class="bg-white border-b border-gray-200 px-7 h-14 flex items-center justify-between shadow-sm">' +
                '<div class="flex items-center gap-3">' +
                '<div class="w-8 h-8 bg-[#B90E0A] rounded-lg flex items-center justify-center text-white font-black text-sm">B</div>' +
                '<div class="flex items-center gap-2 text-sm text-gray-400">' +
                '<span class="cursor-pointer hover:text-[#B90E0A]">Positions</span>' +
                '<span>/</span>' +
                '<span class="font-bold text-gray-900">Sr. Sales Associate</span>' +
                '</div>' +
                '</div>' +
                '<div class="flex gap-2">' +
                '<button class="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">Edit Position</button>' +
                '<button class="px-4 py-2 bg-[#B90E0A] text-white text-xs font-bold rounded-lg">+ Assign Employee</button>' +
                '</div></div>' +
 
                '<div class="p-7">' +
                '<div class="grid grid-cols-3 gap-6">' +
 
                // Left column — position info
                '<div class="col-span-2 space-y-5">' +
 
                // Header card
                '<div class="bg-white rounded-2xl shadow-sm overflow-hidden">' +
                '<div class="bg-gradient-to-r from-[#B90E0A] to-[#7a0806] px-6 py-5">' +
                '<div class="flex items-center justify-between">' +
                '<div>' +
                '<p class="text-[10px] font-bold text-white/60 uppercase tracking-wider">Position</p>' +
                '<p class="text-2xl font-black text-white mt-1">Sr. Sales Associate</p>' +
                '<p class="text-sm text-white/70 mt-0.5">Retail Operations · HR-P002</p>' +
                '</div>' +
                '<span class="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">Active</span>' +
                '</div></div>' +
                '<div class="px-6 py-5 grid grid-cols-3 gap-4 border-b border-gray-100">' +
                '<div><p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Level</p><span class="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Senior</span></div>' +
                '<div><p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Min Salary</p><p class="text-sm font-bold text-gray-900">PHP 24,000</p></div>' +
                '<div><p class="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Max Salary</p><p class="text-sm font-bold text-gray-900">PHP 30,000</p></div>' +
                '</div>' +
                '<div class="px-6 py-5">' +
                '<p class="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Description</p>' +
                '<p class="text-sm text-gray-600 leading-relaxed">Responsible for driving sales performance, mentoring junior associates, and ensuring outstanding customer service across all product categories. Acts as team lead in the absence of the Branch Manager.</p>' +
                '</div></div>' +
 
                // Current occupants
                '<div class="bg-white rounded-2xl shadow-sm p-5">' +
                '<p class="text-xs font-bold text-gray-900 mb-4">Current Occupants <span class="text-gray-400 font-normal">(3 employees)</span></p>' +
                '<div class="space-y-3">' +
                '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-xs">MS</div>' +
                '<div class="flex-1"><p class="text-xs font-bold text-gray-900">Maria Santos</p><p class="text-[10px] text-gray-500">SM Mall of Asia · Since Jan 2026</p></div>' +
                '<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Active</span>' +
                '</div>' +
                '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] flex items-center justify-center text-white font-black text-xs">KR</div>' +
                '<div class="flex-1"><p class="text-xs font-bold text-gray-900">Karen Reyes</p><p class="text-[10px] text-gray-500">BGC Branch · Since Mar 2025</p></div>' +
                '<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Active</span>' +
                '</div>' +
                '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#064e3b] to-[#022c22] flex items-center justify-center text-white font-black text-xs">TC</div>' +
                '<div class="flex-1"><p class="text-xs font-bold text-gray-900">Toni Cruz</p><p class="text-[10px] text-gray-500">Cebu Branch · Since Aug 2024</p></div>' +
                '<span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Active</span>' +
                '</div>' +
                '</div></div>' +
                '</div>' +
 
                // Right column — sidebar
                '<div class="space-y-5">' +
                '<div class="bg-white rounded-2xl shadow-sm p-5">' +
                '<p class="text-xs font-bold text-gray-900 mb-4">Quick Stats</p>' +
                '<div class="space-y-3">' +
                '<div class="flex justify-between items-center"><span class="text-xs text-gray-500">Total Employees</span><span class="text-sm font-black text-gray-900">3</span></div>' +
                '<div class="flex justify-between items-center"><span class="text-xs text-gray-500">Avg. Tenure</span><span class="text-sm font-black text-gray-900">14 mos</span></div>' +
                '<div class="flex justify-between items-center"><span class="text-xs text-gray-500">Promotions Out</span><span class="text-sm font-black text-blue-600">5</span></div>' +
                '<div class="flex justify-between items-center"><span class="text-xs text-gray-500">Turnovers</span><span class="text-sm font-black text-red-600">2</span></div>' +
                '</div></div>' +
 
                '<div class="bg-white rounded-2xl shadow-sm p-5">' +
                '<p class="text-xs font-bold text-gray-900 mb-4">Reports To</p>' +
                '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-xs">RM</div>' +
                '<div><p class="text-xs font-bold text-gray-900">Rico M.</p><p class="text-[10px] text-[#B90E0A] font-semibold">Branch Manager</p></div>' +
                '</div></div>' +
 
                '<div class="bg-white rounded-2xl shadow-sm p-5">' +
                '<p class="text-xs font-bold text-gray-900 mb-4">Next Level</p>' +
                '<div class="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">' +
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#B90E0A] to-[#7a0806] flex items-center justify-center text-white font-black text-xs">→</div>' +
                '<div><p class="text-xs font-bold text-gray-900">Supervisor</p><p class="text-[10px] text-gray-500">PHP 35k – PHP 45k</p></div>' +
                '</div></div>' +
 
                '</div></div></div></div>'
        },
 
        {
            id: 'hr-org-movement-report',
            label: 'Org: Movement Report',
            category: 'HR Printable',
            content: '<div style="width:794px;min-height:1123px;background:#fff;padding:0;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;margin:0 auto;">' +
 
                // Print header
                '<div class="bg-[#B90E0A] px-10 py-6 flex items-center justify-between">' +
                '<div class="flex items-center gap-4">' +
                '<div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-[#B90E0A] text-sm">B</div>' +
                '<div><p class="text-white font-black text-base">BENCH APPAREL</p><p class="text-white/60 text-xs">Position Movement Report</p></div>' +
                '</div>' +
                '<div class="text-right">' +
                '<p class="text-white/60 text-[10px] uppercase tracking-wider">Report Period</p>' +
                '<p class="text-white font-bold text-sm">Q1 2026 · Jan–Mar</p>' +
                '<p class="text-white/50 text-[10px] mt-0.5">Generated: March 18, 2026</p>' +
                '</div></div>' +
 
                // Summary strip
                '<div class="grid grid-cols-4 border-b border-gray-100">' +
                '<div class="px-8 py-4 text-center border-r border-gray-100"><p class="text-2xl font-black text-gray-900">12</p><p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Movements</p></div>' +
                '<div class="px-8 py-4 text-center border-r border-gray-100"><p class="text-2xl font-black text-green-600">4</p><p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Hired</p></div>' +
                '<div class="px-8 py-4 text-center border-r border-gray-100"><p class="text-2xl font-black text-blue-600">5</p><p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Promoted</p></div>' +
                '<div class="px-8 py-4 text-center"><p class="text-2xl font-black text-yellow-600">3</p><p class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Transferred</p></div>' +
                '</div>' +
 
                '<div class="px-10 py-6">' +
 
                // Table
                '<table class="w-full text-sm border-collapse">' +
                '<thead><tr class="border-b-2 border-gray-200">' +
                '<th class="py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider pr-4">Date</th>' +
                '<th class="py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider pr-4">Employee</th>' +
                '<th class="py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider pr-4">Type</th>' +
                '<th class="py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider pr-4">From</th>' +
                '<th class="py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider pr-4">To</th>' +
                '<th class="py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dept</th>' +
                '</tr></thead>' +
                '<tbody>' +
 
                '<tr class="border-b border-gray-50">' +
                '<td class="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">Jan 5, 2026</td>' +
                '<td class="py-3 pr-4"><p class="text-xs font-bold text-gray-900">Ana Reyes</p><p class="text-[10px] text-gray-400">HR-00198</p></td>' +
                '<td class="py-3 pr-4"><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Hired</span></td>' +
                '<td class="py-3 pr-4 text-xs text-gray-400">—</td>' +
                '<td class="py-3 pr-4 text-xs font-semibold text-gray-900">Visual Merchandiser</td>' +
                '<td class="py-3 text-xs text-gray-500">Marketing</td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50 bg-gray-50/50">' +
                '<td class="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">Jan 10, 2026</td>' +
                '<td class="py-3 pr-4"><p class="text-xs font-bold text-gray-900">Juan dela Cruz</p><p class="text-[10px] text-gray-400">HR-00089</p></td>' +
                '<td class="py-3 pr-4"><span class="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Transferred</span></td>' +
                '<td class="py-3 pr-4 text-xs text-gray-600">BGC Branch</td>' +
                '<td class="py-3 pr-4 text-xs font-semibold text-gray-900">SM MOA Branch</td>' +
                '<td class="py-3 text-xs text-gray-500">Operations</td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50">' +
                '<td class="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">Jan 15, 2026</td>' +
                '<td class="py-3 pr-4"><p class="text-xs font-bold text-gray-900">Maria Santos</p><p class="text-[10px] text-gray-400">HR-00142</p></td>' +
                '<td class="py-3 pr-4"><span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Promoted</span></td>' +
                '<td class="py-3 pr-4 text-xs text-gray-600">Sales Associate</td>' +
                '<td class="py-3 pr-4 text-xs font-semibold text-gray-900">Sr. Sales Associate</td>' +
                '<td class="py-3 text-xs text-gray-500">Retail Ops</td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50 bg-gray-50/50">' +
                '<td class="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">Feb 1, 2026</td>' +
                '<td class="py-3 pr-4"><p class="text-xs font-bold text-gray-900">Rico Mendoza</p><p class="text-[10px] text-gray-400">HR-00077</p></td>' +
                '<td class="py-3 pr-4"><span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Promoted</span></td>' +
                '<td class="py-3 pr-4 text-xs text-gray-600">Supervisor</td>' +
                '<td class="py-3 pr-4 text-xs font-semibold text-gray-900">Branch Manager</td>' +
                '<td class="py-3 text-xs text-gray-500">Operations</td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50">' +
                '<td class="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">Feb 14, 2026</td>' +
                '<td class="py-3 pr-4"><p class="text-xs font-bold text-gray-900">Dana Lim</p><p class="text-[10px] text-gray-400">HR-00201</p></td>' +
                '<td class="py-3 pr-4"><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Hired</span></td>' +
                '<td class="py-3 pr-4 text-xs text-gray-400">—</td>' +
                '<td class="py-3 pr-4 text-xs font-semibold text-gray-900">HR Manager</td>' +
                '<td class="py-3 text-xs text-gray-500">Human Resources</td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50 bg-gray-50/50">' +
                '<td class="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">Feb 20, 2026</td>' +
                '<td class="py-3 pr-4"><p class="text-xs font-bold text-gray-900">Sara Cruz</p><p class="text-[10px] text-gray-400">HR-00155</p></td>' +
                '<td class="py-3 pr-4"><span class="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Transferred</span></td>' +
                '<td class="py-3 pr-4 text-xs text-gray-600">Cebu Branch</td>' +
                '<td class="py-3 pr-4 text-xs font-semibold text-gray-900">Davao Branch</td>' +
                '<td class="py-3 text-xs text-gray-500">Operations</td>' +
                '</tr>' +
 
                '<tr class="border-b border-gray-50">' +
                '<td class="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">Mar 5, 2026</td>' +
                '<td class="py-3 pr-4"><p class="text-xs font-bold text-gray-900">Lena Torres</p><p class="text-[10px] text-gray-400">HR-00203</p></td>' +
                '<td class="py-3 pr-4"><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold">Hired</span></td>' +
                '<td class="py-3 pr-4 text-xs text-gray-400">—</td>' +
                '<td class="py-3 pr-4 text-xs font-semibold text-gray-900">Payroll Officer</td>' +
                '<td class="py-3 text-xs text-gray-500">Finance</td>' +
                '</tr>' +
 
                '</tbody></table>' +
 
                // Signature block
                '<div class="mt-12 pt-6 border-t border-gray-200 grid grid-cols-3 gap-10">' +
                '<div class="text-center"><div class="border-b border-gray-900 pb-1 mb-2"></div><p class="text-[10px] text-gray-500">Prepared by</p><p class="text-xs font-bold text-gray-900">HR Officer</p></div>' +
                '<div class="text-center"><div class="border-b border-gray-900 pb-1 mb-2"></div><p class="text-[10px] text-gray-500">Reviewed by</p><p class="text-xs font-bold text-gray-900">HR Manager</p></div>' +
                '<div class="text-center"><div class="border-b border-gray-900 pb-1 mb-2"></div><p class="text-[10px] text-gray-500">Approved by</p><p class="text-xs font-bold text-gray-900">Regional Director</p></div>' +
                '</div>' +
 
                '<div class="mt-8 text-center">' +
                '<p class="text-[9px] text-gray-400">BENCH APPAREL · Position Movement Report · Q1 2026 · CONFIDENTIAL</p>' +
                '</div>' +
                '</div></div>'
        },

        // ── HR PRINTABLE DOCUMENTS ───────────────────────────────────────

        {
            id: 'hr-print-201',
            label: 'HR Print: 201 File Cover',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#fff;padding:0;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#1a1a1a;margin:0 auto;overflow:hidden;">' +
                '<div style="background:#B90E0A;padding:0;height:10px;"></div>' +
                '<div style="padding:48px 56px 32px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">' +
                '<div style="display:flex;align-items:center;gap:16px;">' +
                '<div style="width:56px;height:56px;background:#B90E0A;border-radius:10px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:22px;">B</span></div>' +
                '<div><div style="font-size:20px;font-weight:800;color:#1a1a1a;letter-spacing:1px;">BENCH APPAREL</div><div style="font-size:10px;color:#999;letter-spacing:2px;text-transform:uppercase;">Human Resources Department</div></div>' +
                '</div>' +
                '<div style="text-align:right;">' +
                '<div style="font-size:11px;color:#999;letter-spacing:1px;margin-bottom:4px;">Document Type</div>' +
                '<div style="font-size:16px;font-weight:800;color:#B90E0A;letter-spacing:1px;">EMPLOYEE 201 FILE</div>' +
                '<div style="font-size:11px;color:#999;margin-top:4px;">Personal Information Record</div>' +
                '</div>' +
                '</div>' +
                '<div style="border-top:2px solid #1a1a1a;border-bottom:2px solid #1a1a1a;padding:20px 0;margin-bottom:32px;display:flex;gap:40px;align-items:center;">' +
                '<div style="width:100px;height:120px;background:#f3f4f6;border:2px dashed #ddd;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><div style="text-align:center;font-size:10px;color:#bbb;letter-spacing:1px;">2x2<br/>PHOTO</div></div>' +
                '<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Employee ID Number</div><div style="border-bottom:1.5px solid #1a1a1a;padding-bottom:6px;font-size:14px;font-weight:700;">BA-____-____</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Date Hired</div><div style="border-bottom:1.5px solid #1a1a1a;padding-bottom:6px;font-size:14px;">_______________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Last Name</div><div style="border-bottom:1.5px solid #1a1a1a;padding-bottom:6px;font-size:14px;">___________________________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">First Name</div><div style="border-bottom:1.5px solid #1a1a1a;padding-bottom:6px;font-size:14px;">___________________________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Middle Name</div><div style="border-bottom:1.5px solid #1a1a1a;padding-bottom:6px;font-size:14px;">___________________________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Nickname / Goes By</div><div style="border-bottom:1.5px solid #1a1a1a;padding-bottom:6px;font-size:14px;">___________________________</div></div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:28px;">' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Position / Job Title</div><div style="border-bottom:1px solid #ddd;padding-bottom:6px;font-size:13px;">___________________________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Department</div><div style="border-bottom:1px solid #ddd;padding-bottom:6px;font-size:13px;">___________________________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Branch Assignment</div><div style="border-bottom:1px solid #ddd;padding-bottom:6px;font-size:13px;">___________________________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Employment Type</div><div style="border-bottom:1px solid #ddd;padding-bottom:6px;font-size:13px;">☐ Regular &nbsp; ☐ Probationary &nbsp; ☐ Part-time</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Date of Birth</div><div style="border-bottom:1px solid #ddd;padding-bottom:6px;font-size:13px;">___________________________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">Civil Status</div><div style="border-bottom:1px solid #ddd;padding-bottom:6px;font-size:13px;">☐ Single &nbsp; ☐ Married &nbsp; ☐ Other</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">SSS Number</div><div style="border-bottom:1px solid #ddd;padding-bottom:6px;font-size:13px;">___________________________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">PhilHealth Number</div><div style="border-bottom:1px solid #ddd;padding-bottom:6px;font-size:13px;">___________________________</div></div>' +
                '<div><div style="font-size:10px;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:4px;">TIN Number</div><div style="border-bottom:1px solid #ddd;padding-bottom:6px;font-size:13px;">___________________________</div></div>' +
                '</div>' +
                '<div style="background:#f9fafb;border-left:4px solid #B90E0A;padding:16px 20px;margin-bottom:28px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#B90E0A;margin-bottom:12px;">Documents Checklist</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:12px;color:#555;">' +
                '<div>☐ Resume / CV</div><div>☐ Birth Certificate</div><div>☐ SSS E1 / E4</div>' +
                '<div>☐ PhilHealth MDR</div><div>☐ Pag-IBIG MDF</div><div>☐ TIN / BIR Form</div>' +
                '<div>☐ NBI Clearance</div><div>☐ Medical Certificate</div><div>☐ PRC License (if applicable)</div>' +
                '<div>☐ Barangay Clearance</div><div>☐ Police Clearance</div><div>☐ 2x2 Photos (4 pcs)</div>' +
                '</div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:40px;">' +
                '<div><div style="border-top:1.5px solid #1a1a1a;padding-top:8px;"><div style="font-size:11px;font-weight:700;">Employee Signature</div><div style="font-size:10px;color:#aaa;margin-top:2px;">Over Printed Name &amp; Date</div></div></div>' +
                '<div><div style="border-top:1.5px solid #1a1a1a;padding-top:8px;"><div style="font-size:11px;font-weight:700;">HR Officer</div><div style="font-size:10px;color:#aaa;margin-top:2px;">Over Printed Name &amp; Date</div></div></div>' +
                '<div><div style="border-top:1.5px solid #1a1a1a;padding-top:8px;"><div style="font-size:11px;font-weight:700;">HR Manager</div><div style="font-size:10px;color:#aaa;margin-top:2px;">Over Printed Name &amp; Date</div></div></div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#1a1a1a;padding:12px 56px;display:flex;justify-content:space-between;font-size:10px;color:#555;letter-spacing:1px;">' +
                '<span>BENCH APPAREL CORPORATION &mdash; HUMAN RESOURCES</span><span>FORM HR-201 &mdash; REV. 2026</span>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-print-offer',
            label: 'HR Print: Job Offer Letter',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#fff;box-sizing:border-box;font-family:\'Georgia\',serif;color:#1a1a1a;margin:0 auto;display:flex;flex-direction:column;">' +
                '<div style="height:6px;background:linear-gradient(90deg,#B90E0A 60%,#1a1a1a 60%);"></div>' +
                '<div style="padding:44px 60px;flex:1;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">' +
                '<div><div style="font-size:22px;font-weight:700;color:#1a1a1a;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">BENCH APPAREL</div><div style="font-size:10px;color:#999;letter-spacing:2px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;">Corporation</div><div style="margin-top:10px;font-size:11px;color:#888;font-family:\'Helvetica Neue\',sans-serif;line-height:1.8;">123 Bench Avenue, Makati City<br/>Metro Manila, Philippines 1200</div></div>' +
                '<div style="text-align:right;font-size:12px;color:#888;font-family:\'Helvetica Neue\',sans-serif;line-height:1.8;"><div>March 4, 2026</div><div style="margin-top:8px;font-size:11px;">Ref No: HR-OL-2026-042</div></div>' +
                '</div>' +
                '<div style="margin-bottom:28px;font-size:13px;font-family:\'Helvetica Neue\',sans-serif;color:#555;line-height:1.8;">' +
                '<div style="font-weight:700;color:#1a1a1a;font-size:14px;">Maria Santos</div>' +
                '<div>45 Rizal Street, Quezon City</div>' +
                '<div>Metro Manila, Philippines 1100</div>' +
                '</div>' +
                '<div style="font-size:14px;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:20px;text-transform:uppercase;letter-spacing:1px;">Job Offer &mdash; Senior Sales Associate</div>' +
                '<div style="font-size:14px;line-height:2;color:#333;margin-bottom:20px;">' +
                '<p style="margin:0 0 16px;">Dear Ms. Santos,</p>' +
                '<p style="margin:0 0 16px;">We are pleased to offer you the position of <strong>Senior Sales Associate</strong> at Bench Apparel Corporation. This offer is contingent upon the completion of your pre-employment requirements and a satisfactory background check.</p>' +
                '<p style="margin:0 0 16px;">Please review the following terms and conditions of your employment:</p>' +
                '</div>' +
                '<div style="background:#f9fafb;border-left:4px solid #B90E0A;padding:20px 24px;margin-bottom:24px;font-family:\'Helvetica Neue\',sans-serif;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#B90E0A;margin-bottom:14px;">Terms of Employment</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">' +
                '<div><span style="color:#999;">Position:</span><strong style="margin-left:8px;">Senior Sales Associate</strong></div>' +
                '<div><span style="color:#999;">Branch:</span><strong style="margin-left:8px;">SM Mall of Asia</strong></div>' +
                '<div><span style="color:#999;">Start Date:</span><strong style="margin-left:8px;">March 10, 2026</strong></div>' +
                '<div><span style="color:#999;">Employment Type:</span><strong style="margin-left:8px;">Regular / Full-time</strong></div>' +
                '<div><span style="color:#999;">Basic Salary:</span><strong style="margin-left:8px;color:#B90E0A;">PHP 18,000 / month</strong></div>' +
                '<div><span style="color:#999;">Probation Period:</span><strong style="margin-left:8px;">6 months</strong></div>' +
                '<div><span style="color:#999;">Work Schedule:</span><strong style="margin-left:8px;">5 days/week, shifting</strong></div>' +
                '<div><span style="color:#999;">Reporting To:</span><strong style="margin-left:8px;">Branch Manager</strong></div>' +
                '</div></div>' +
                '<div style="font-size:14px;line-height:2;color:#333;margin-bottom:24px;">' +
                '<p style="margin:0 0 16px;">You will also be entitled to the following benefits upon regularization: SSS, PhilHealth, and Pag-IBIG contributions; HMO coverage; paid leave credits; and employee purchase discounts.</p>' +
                '<p style="margin:0 0 16px;">To confirm your acceptance of this offer, please sign the acknowledgment below and return one copy to the HR Department no later than <strong>March 7, 2026</strong>. Failure to respond by this date may result in the withdrawal of this offer.</p>' +
                '<p style="margin:0;">We look forward to welcoming you to the Bench Apparel family.</p>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;">' +
                '<div><div style="margin-bottom:32px;"><div style="font-size:13px;font-weight:700;">Offered by:</div></div><div style="border-top:1px solid #1a1a1a;padding-top:8px;"><div style="font-size:12px;font-weight:700;">HR Manager</div><div style="font-size:11px;color:#999;margin-top:2px;">Bench Apparel Corporation</div></div></div>' +
                '<div><div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;margin-bottom:12px;font-size:12px;font-family:\'Helvetica Neue\',sans-serif;color:#555;">☐ I accept the offer as stated above.<br/>☐ I decline the offer.</div><div style="border-top:1px solid #1a1a1a;padding-top:8px;"><div style="font-size:12px;font-weight:700;">Applicant Signature &amp; Date</div><div style="font-size:11px;color:#999;margin-top:2px;">Over Printed Name</div></div></div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#1a1a1a;padding:12px 60px;display:flex;justify-content:space-between;font-size:10px;color:#555;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">' +
                '<span>BENCH APPAREL CORPORATION &mdash; HUMAN RESOURCES</span><span>FORM HR-OL &mdash; 2026</span>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-print-contract',
            label: 'HR Print: Employment Contract',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#fff;padding:56px 64px;box-sizing:border-box;font-family:\'Georgia\',serif;color:#1a1a1a;margin:0 auto;">' +
                '<div style="text-align:center;margin-bottom:36px;">' +
                '<div style="font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:4px;">BENCH APPAREL CORPORATION</div>' +
                '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:16px;">Human Resources Department</div>' +
                '<div style="width:60px;height:2px;background:#B90E0A;margin:0 auto 16px;"></div>' +
                '<h1 style="font-size:20px;font-weight:400;margin:0;letter-spacing:2px;text-transform:uppercase;">Contract of Employment</h1>' +
                '</div>' +
                '<div style="font-size:13px;line-height:2;margin-bottom:20px;">' +
                '<p style="margin:0 0 14px;">This Contract of Employment is entered into by and between:</p>' +
                '<div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px 20px;margin-bottom:14px;font-family:\'Helvetica Neue\',sans-serif;font-size:12px;">' +
                '<strong>BENCH APPAREL CORPORATION</strong>, a corporation duly organized and existing under Philippine law, with principal offices at 123 Bench Avenue, Makati City, Metro Manila, hereinafter referred to as the <strong>"COMPANY"</strong>; and' +
                '</div>' +
                '<div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px 20px;margin-bottom:14px;font-family:\'Helvetica Neue\',sans-serif;font-size:12px;">' +
                '<strong>_________________________________</strong>, Filipino citizen, of legal age, residing at <strong>_________________________________</strong>, hereinafter referred to as the <strong>"EMPLOYEE"</strong>.' +
                '</div>' +
                '</div>' +
                '<div style="font-size:12px;line-height:1.9;color:#333;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Article I — Position and Assignment</div>' +
                '<p style="margin:0 0 14px;">The COMPANY hereby employs the EMPLOYEE as <strong>_______________________________</strong> to be assigned at <strong>_______________________________</strong> Branch, effective <strong>_______________</strong>. The EMPLOYEE agrees to accept such employment under the terms and conditions herein stated.</p>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Article II — Compensation</div>' +
                '<p style="margin:0 0 14px;">The EMPLOYEE shall receive a monthly basic salary of <strong>PHP _______________</strong>, payable semi-monthly, subject to lawful deductions. Salary shall be reviewed annually based on performance.</p>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Article III — Probationary Period</div>' +
                '<p style="margin:0 0 14px;">The EMPLOYEE shall undergo a probationary period of <strong>six (6) months</strong> from the date of commencement of employment. Regularization is subject to satisfactory performance evaluation by the COMPANY.</p>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Article IV — Work Hours &amp; Schedule</div>' +
                '<p style="margin:0 0 14px;">The EMPLOYEE shall render a minimum of eight (8) hours per day, five (5) days per week, in accordance with the schedule assigned by the COMPANY. Overtime shall be compensated in accordance with existing labor laws.</p>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:8px;font-family:\'Helvetica Neue\',sans-serif;">Article V — Confidentiality</div>' +
                '<p style="margin:0 0 24px;">The EMPLOYEE agrees to maintain strict confidentiality of all proprietary business information, trade secrets, and customer data both during and after the period of employment.</p>' +
                '</div>' +
                '<div style="border-top:1px solid #e5e5e5;padding-top:24px;">' +
                '<p style="font-size:12px;margin:0 0 24px;color:#555;">IN WITNESS WHEREOF, the parties have hereunto set their hands on <strong>_______________</strong> at <strong>_______________</strong>, Philippines.</p>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">' +
                '<div><div style="height:48px;"></div><div style="border-top:1.5px solid #1a1a1a;padding-top:8px;font-size:12px;"><div style="font-weight:700;">BENCH APPAREL CORPORATION</div><div style="color:#999;font-size:11px;margin-top:2px;">Authorized Signatory / HR Manager</div></div></div>' +
                '<div><div style="height:48px;"></div><div style="border-top:1.5px solid #1a1a1a;padding-top:8px;font-size:12px;"><div style="font-weight:700;">EMPLOYEE</div><div style="color:#999;font-size:11px;margin-top:2px;">Over Printed Name</div></div></div>' +
                '</div>' +
                '<div style="margin-top:32px;border-top:1px solid #e5e5e5;padding-top:20px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:12px;">Witnesses:</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">' +
                '<div><div style="height:40px;"></div><div style="border-top:1px solid #1a1a1a;padding-top:6px;font-size:11px;color:#999;">Witness 1 — Over Printed Name</div></div>' +
                '<div><div style="height:40px;"></div><div style="border-top:1px solid #1a1a1a;padding-top:6px;font-size:11px;color:#999;">Witness 2 — Over Printed Name</div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-print-coe',
            label: 'HR Print: Certificate of Employment',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:800px;background:#fff;box-sizing:border-box;font-family:\'Georgia\',serif;color:#1a1a1a;margin:0 auto;overflow:hidden;">' +
                '<div style="height:8px;background:#B90E0A;"></div>' +
                '<div style="padding:56px 72px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;">' +
                '<div><div style="font-size:20px;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:2px;color:#1a1a1a;">BENCH APPAREL</div><div style="font-size:10px;color:#999;letter-spacing:2px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;">Corporation</div></div>' +
                '<div style="text-align:right;font-size:11px;font-family:\'Helvetica Neue\',sans-serif;color:#888;line-height:1.8;">' +
                '<div>123 Bench Avenue, Makati City</div><div>Metro Manila 1200</div><div>hr@bench.com.ph</div>' +
                '</div>' +
                '</div>' +
                '<div style="text-align:center;margin-bottom:48px;">' +
                '<div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B90E0A;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:10px;">To Whom It May Concern</div>' +
                '<h1 style="font-size:28px;font-weight:400;margin:0;letter-spacing:3px;text-transform:uppercase;">Certificate of Employment</h1>' +
                '<div style="width:80px;height:2px;background:#1a1a1a;margin:16px auto 0;"></div>' +
                '</div>' +
                '<div style="font-size:14px;line-height:2.2;color:#333;margin-bottom:36px;">' +
                '<p style="margin:0 0 20px;">This is to certify that <strong>_________________________________</strong> has been employed with <strong>Bench Apparel Corporation</strong> as a <strong>_________________________________</strong> since <strong>_______________</strong> up to the present.</p>' +
                '<p style="margin:0 0 20px;">As of the date of this certification, the aforementioned employee is <strong>☐ currently employed / ☐ no longer employed</strong> with the company and holds/held a regular/full-time position.</p>' +
                '<p style="margin:0 0 20px;">His/Her basic salary is/was <strong>PHP _______________</strong> per month.</p>' +
                '<p style="margin:0;">This certification is being issued upon the request of the employee for <strong>_________________________________</strong> purposes only and is valid for <strong>thirty (30) days</strong> from date of issue.</p>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:48px;">' +
                '<div>' +
                '<div style="font-size:12px;font-family:\'Helvetica Neue\',sans-serif;color:#888;margin-bottom:6px;">Issued this <strong style="color:#1a1a1a;">4th</strong> day of <strong style="color:#1a1a1a;">March</strong>, <strong style="color:#1a1a1a;">2026</strong></div>' +
                '<div style="font-size:11px;color:#aaa;font-family:\'Helvetica Neue\',sans-serif;">at Makati City, Metro Manila, Philippines</div>' +
                '</div>' +
                '<div style="text-align:center;">' +
                '<div style="height:56px;"></div>' +
                '<div style="border-top:1.5px solid #1a1a1a;padding-top:10px;width:240px;">' +
                '<div style="font-size:13px;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">HR Manager</div>' +
                '<div style="font-size:11px;color:#999;margin-top:2px;font-family:\'Helvetica Neue\',sans-serif;">Human Resources Department</div>' +
                '<div style="font-size:11px;color:#999;font-family:\'Helvetica Neue\',sans-serif;">Bench Apparel Corporation</div>' +
                '</div></div>' +
                '</div>' +
                '<div style="margin-top:36px;padding-top:20px;border-top:1px solid #e5e5e5;font-size:10px;color:#bbb;text-align:center;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">' +
                'Ref No: HR-COE-2026-042 &mdash; NOT VALID WITHOUT OFFICIAL SEAL' +
                '</div>' +
                '</div>' +
                '<div style="height:4px;background:#1a1a1a;"></div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-print-cndr',
            label: 'HR Print: No Derogatory Record',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:760px;background:#fff;box-sizing:border-box;font-family:\'Georgia\',serif;color:#1a1a1a;margin:0 auto;">' +
                '<div style="padding:56px 72px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;">' +
                '<div style="display:flex;align-items:center;gap:14px;"><div style="width:48px;height:48px;background:#B90E0A;border-radius:9px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:20px;">B</span></div><div><div style="font-size:18px;font-weight:700;letter-spacing:1px;font-family:\'Helvetica Neue\',sans-serif;">BENCH APPAREL</div><div style="font-size:9px;color:#999;letter-spacing:2px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;">Corporation</div></div></div>' +
                '<div style="text-align:right;font-size:11px;font-family:\'Helvetica Neue\',sans-serif;color:#888;line-height:1.8;"><div>Date: March 4, 2026</div><div>Ref: HR-CNDR-2026-042</div></div>' +
                '</div>' +
                '<div style="text-align:center;margin-bottom:44px;">' +
                '<div style="display:inline-block;border:2px solid #1a1a1a;padding:6px 24px;margin-bottom:14px;"><div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;font-weight:700;">Official Certification</div></div>' +
                '<h1 style="font-size:22px;font-weight:400;margin:0 0 6px;letter-spacing:2px;text-transform:uppercase;">Certificate of No Derogatory Record</h1>' +
                '<div style="font-size:12px;color:#888;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">Human Resources Department</div>' +
                '</div>' +
                '<div style="font-size:14px;line-height:2.2;color:#333;margin-bottom:28px;">' +
                '<p style="margin:0 0 20px;">This is to certify that based on records available with the Human Resources Department of <strong>Bench Apparel Corporation</strong>, the following employee has <strong>NO EXISTING DEROGATORY RECORDS</strong>, disciplinary cases, or pending administrative complaints as of the date of this certification:</p>' +
                '<div style="background:#f9fafb;border:1px solid #e5e7eb;padding:20px 24px;margin-bottom:20px;font-family:\'Helvetica Neue\',sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:13px;">' +
                '<div><span style="color:#999;">Full Name: </span><strong>_________________________________</strong></div>' +
                '<div><span style="color:#999;">Employee ID: </span><strong>_____________________</strong></div>' +
                '<div><span style="color:#999;">Position: </span><strong>_________________________________</strong></div>' +
                '<div><span style="color:#999;">Branch: </span><strong>_____________________</strong></div>' +
                '<div><span style="color:#999;">Date Hired: </span><strong>_____________________</strong></div>' +
                '<div><span style="color:#999;">Status: </span><strong>☐ Regular &nbsp; ☐ Probationary</strong></div>' +
                '</div>' +
                '<p style="margin:0 0 16px;">This certification covers the entirety of the employee\'s tenure with the company and is issued for <strong>_________________________________</strong> purposes only.</p>' +
                '<p style="margin:0;">This certification is valid for <strong>thirty (30) days</strong> from date of issue and is not valid without the official seal of the HR Department.</p>' +
                '</div>' +
                '<div style="display:flex;justify-content:flex-end;margin-top:52px;">' +
                '<div style="text-align:center;">' +
                '<div style="width:60px;height:60px;border:2px dashed #ddd;border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#ddd;font-family:\'Helvetica Neue\',sans-serif;text-align:center;line-height:1.4;">OFFICIAL<br/>SEAL</div>' +
                '<div style="height:48px;"></div>' +
                '<div style="border-top:1.5px solid #1a1a1a;padding-top:10px;width:240px;"><div style="font-size:13px;font-weight:700;font-family:\'Helvetica Neue\',sans-serif;">HR Manager</div><div style="font-size:11px;color:#999;margin-top:2px;font-family:\'Helvetica Neue\',sans-serif;">Bench Apparel Corporation</div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-print-resignation',
            label: 'HR Print: Resignation Acceptance',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:900px;background:#fff;padding:60px 68px;box-sizing:border-box;font-family:\'Georgia\',serif;color:#1a1a1a;margin:0 auto;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44px;">' +
                '<div><div style="font-size:18px;font-weight:700;letter-spacing:2px;font-family:\'Helvetica Neue\',sans-serif;">BENCH APPAREL</div><div style="font-size:9px;color:#999;letter-spacing:2px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;">Corporation</div></div>' +
                '<div style="text-align:right;font-size:11px;font-family:\'Helvetica Neue\',sans-serif;color:#888;line-height:1.8;"><div>March 4, 2026</div><div>Ref: HR-RL-2026-042</div></div>' +
                '</div>' +
                '<div style="font-size:13px;font-family:\'Helvetica Neue\',sans-serif;color:#555;line-height:1.8;margin-bottom:28px;">' +
                '<div style="font-weight:700;color:#1a1a1a;font-size:14px;">Maria Santos</div>' +
                '<div>Senior Sales Associate</div>' +
                '<div>SM Mall of Asia Branch</div>' +
                '</div>' +
                '<div style="border-left:4px solid #B90E0A;padding-left:20px;margin-bottom:28px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;font-family:\'Helvetica Neue\',sans-serif;margin-bottom:4px;">Re: Acceptance of Resignation</div>' +
                '</div>' +
                '<div style="font-size:14px;line-height:2.1;color:#333;">' +
                '<p style="margin:0 0 16px;">Dear Ms. Santos,</p>' +
                '<p style="margin:0 0 16px;">This letter serves as the formal acceptance of your resignation letter dated <strong>February 28, 2026</strong>. The Human Resources Department, on behalf of Management, acknowledges your intention to resign from your position as <strong>Senior Sales Associate</strong> effective <strong>March 31, 2026</strong>, in compliance with the required thirty (30) day notice period.</p>' +
                '<p style="margin:0 0 16px;">We would like to take this opportunity to express our sincere gratitude for your dedication and valuable contributions to Bench Apparel Corporation during your tenure of <strong>four (4) years and two (2) months</strong>. Your consistent performance and positive attitude have been an asset to our team.</p>' +
                '<p style="margin:0 0 16px;">Please note the following requirements prior to your last working day:</p>' +
                '</div>' +
                '<div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px 20px;margin-bottom:20px;font-size:13px;font-family:\'Helvetica Neue\',sans-serif;">' +
                '<div style="font-weight:700;margin-bottom:10px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#555;">Clearance Requirements</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<div>☐ Return all company-issued equipment</div><div>☐ Complete all pending reports</div>' +
                '<div>☐ Process HR clearance form</div><div>☐ Turn over responsibilities</div>' +
                '<div>☐ Return company ID and access cards</div><div>☐ Exit interview with HR</div>' +
                '</div></div>' +
                '<div style="font-size:14px;line-height:2.1;color:#333;margin-bottom:36px;">' +
                '<p style="margin:0 0 16px;">Your final pay, including any unused leave credits, shall be released within thirty (30) days after your last working day, subject to the completion of your clearance process.</p>' +
                '<p style="margin:0;">We wish you all the best in your future endeavors.</p>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">' +
                '<div><div style="height:48px;"></div><div style="border-top:1px solid #1a1a1a;padding-top:8px;font-size:12px;"><div style="font-weight:700;">HR Manager</div><div style="font-size:11px;color:#999;margin-top:2px;">Bench Apparel Corporation</div></div></div>' +
                '<div><div style="height:48px;"></div><div style="border-top:1px solid #1a1a1a;padding-top:8px;font-size:12px;"><div style="font-weight:700;">Acknowledged by Employee</div><div style="font-size:11px;color:#999;margin-top:2px;">Signature over Printed Name &amp; Date</div></div></div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-print-termination',
            label: 'HR Print: Termination Notice',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:960px;background:#fff;padding:0;box-sizing:border-box;font-family:\'Georgia\',serif;color:#1a1a1a;margin:0 auto;overflow:hidden;">' +
                '<div style="background:#1a1a1a;padding:20px 60px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:16px;font-weight:700;color:#fff;letter-spacing:2px;font-family:\'Helvetica Neue\',sans-serif;">BENCH APPAREL CORPORATION</div><div style="font-size:9px;color:#666;letter-spacing:2px;text-transform:uppercase;font-family:\'Helvetica Neue\',sans-serif;margin-top:2px;">Human Resources Department &mdash; Disciplinary Action</div></div>' +
                '<div style="text-align:right;font-size:11px;color:#555;font-family:\'Helvetica Neue\',sans-serif;line-height:1.8;"><div>March 4, 2026</div><div>Ref: HR-TN-2026-042</div></div>' +
                '</div>' +
                '<div style="padding:40px 60px;">' +
                '<div style="background:#fee2e2;border:1px solid #fca5a5;border-left:4px solid #dc2626;padding:14px 20px;margin-bottom:32px;font-family:\'Helvetica Neue\',sans-serif;display:flex;align-items:center;gap:12px;">' +
                '<div style="font-size:18px;">⚠</div>' +
                '<div><div style="font-size:12px;font-weight:700;color:#dc2626;letter-spacing:1px;text-transform:uppercase;">Notice of Termination of Employment</div><div style="font-size:11px;color:#b91c1c;margin-top:2px;">This is an official HR document. Handle with strict confidentiality.</div></div>' +
                '</div>' +
                '<div style="font-size:13px;font-family:\'Helvetica Neue\',sans-serif;color:#555;line-height:1.8;margin-bottom:28px;">' +
                '<div style="font-weight:700;color:#1a1a1a;font-size:14px;">_________________________________</div>' +
                '<div>Position: _________________________________</div><div>Branch: _________________________________</div><div>Employee ID: _____________________</div>' +
                '</div>' +
                '<div style="font-size:14px;line-height:2.1;color:#333;">' +
                '<p style="margin:0 0 16px;">Dear _______________,</p>' +
                '<p style="margin:0 0 16px;">After careful deliberation and in accordance with the due process requirements under the Labor Code of the Philippines and company policy, Management has decided to terminate your employment with Bench Apparel Corporation effective <strong>_______________</strong>.</p>' +
                '<p style="margin:0 0 16px;">This decision is based on the following ground(s):</p>' +
                '</div>' +
                '<div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px 20px;margin-bottom:20px;font-family:\'Helvetica Neue\',sans-serif;font-size:13px;">' +
                '<div style="font-weight:700;margin-bottom:8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#555;">Ground(s) for Termination:</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                '<div>☐ Serious Misconduct</div><div>☐ Gross Negligence</div>' +
                '<div>☐ Fraud / Dishonesty</div><div>☐ Habitual Tardiness / Absenteeism</div>' +
                '<div>☐ Insubordination</div><div>☐ Redundancy / Retrenchment</div>' +
                '<div>☐ End of Contract</div><div>☐ Other: ___________________</div>' +
                '</div></div>' +
                '<div style="font-size:13px;line-height:1.9;color:#333;margin-bottom:20px;font-family:\'Helvetica Neue\',sans-serif;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:8px;">Details / Narrative:</div>' +
                '<div style="border:1px solid #e5e7eb;min-height:80px;padding:10px;font-size:12px;color:#aaa;">_______________________________________________________________________________________________________________<br/>_______________________________________________________________________________________________________________<br/>_______________________________________________________________________________________________________________</div>' +
                '</div>' +
                '<div style="font-size:14px;line-height:2.1;color:#333;margin-bottom:32px;">' +
                '<p style="margin:0 0 16px;">You are hereby advised to complete your clearance process and surrender all company-issued equipment, IDs, and documents. Your final pay will be processed in accordance with existing labor laws.</p>' +
                '<p style="margin:0;">Should you wish to file an appeal, you may do so within five (5) days from receipt of this notice.</p>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px;">' +
                '<div><div style="height:48px;"></div><div style="border-top:1.5px solid #1a1a1a;padding-top:8px;font-size:12px;"><div style="font-weight:700;">HR Manager / Authorized Signatory</div><div style="font-size:11px;color:#999;margin-top:2px;">Bench Apparel Corporation</div></div></div>' +
                '<div><div style="background:#f9fafb;border:1px solid #e5e7eb;padding:10px 14px;margin-bottom:8px;font-size:12px;font-family:\'Helvetica Neue\',sans-serif;color:#555;">☐ Received and acknowledged<br/>☐ Refused to sign</div><div style="border-top:1px solid #1a1a1a;padding-top:8px;font-size:12px;"><div style="font-weight:700;">Employee Acknowledgment</div><div style="font-size:11px;color:#999;margin-top:2px;">Signature over Printed Name &amp; Date</div></div></div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-print-warning',
            label: 'HR Print: Warning Letter',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:960px;background:#fff;padding:0;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#1a1a1a;margin:0 auto;overflow:hidden;">' +
                '<div style="background:#B90E0A;padding:24px 60px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:16px;font-weight:800;color:#fff;letter-spacing:2px;">BENCH APPAREL CORPORATION</div><div style="font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:3px;text-transform:uppercase;margin-top:2px;">Disciplinary Action Form</div></div>' +
                '<div style="text-align:right;font-size:11px;color:rgba(255,255,255,0.7);line-height:1.8;"><div>March 4, 2026</div><div>HR-WL-2026-042</div></div>' +
                '</div>' +
                '<div style="padding:36px 60px;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:28px;">' +
                '<div style="border:2px solid #e5e7eb;border-radius:8px;padding:12px 16px;text-align:center;cursor:pointer;"><div style="font-size:18px;margin-bottom:4px;">📝</div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;">Verbal Warning</div><div style="font-size:10px;color:#bbb;margin-top:2px;">1st Offense</div></div>' +
                '<div style="border:2px solid #f59e0b;border-radius:8px;padding:12px 16px;text-align:center;background:#fffbeb;"><div style="font-size:18px;margin-bottom:4px;">⚠️</div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#ca8a04;">Written Warning</div><div style="font-size:10px;color:#d97706;margin-top:2px;">2nd Offense ✓</div></div>' +
                '<div style="border:2px solid #e5e7eb;border-radius:8px;padding:12px 16px;text-align:center;cursor:pointer;"><div style="font-size:18px;margin-bottom:4px;">🚨</div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;">Final Warning</div><div style="font-size:10px;color:#bbb;margin-top:2px;">3rd Offense</div></div>' +
                '</div>' +
                '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;">' +
                '<div><span style="color:#999;text-transform:uppercase;letter-spacing:1px;font-size:10px;">Employee Name</span><div style="font-weight:700;margin-top:3px;font-size:14px;">_________________________________</div></div>' +
                '<div><span style="color:#999;text-transform:uppercase;letter-spacing:1px;font-size:10px;">Employee ID</span><div style="font-weight:700;margin-top:3px;font-size:14px;">_____________________</div></div>' +
                '<div><span style="color:#999;text-transform:uppercase;letter-spacing:1px;font-size:10px;">Position</span><div style="margin-top:3px;">_________________________________</div></div>' +
                '<div><span style="color:#999;text-transform:uppercase;letter-spacing:1px;font-size:10px;">Branch</span><div style="margin-top:3px;">_________________________________</div></div>' +
                '<div><span style="color:#999;text-transform:uppercase;letter-spacing:1px;font-size:10px;">Date of Incident</span><div style="margin-top:3px;">_________________________________</div></div>' +
                '<div><span style="color:#999;text-transform:uppercase;letter-spacing:1px;font-size:10px;">Date of This Notice</span><div style="margin-top:3px;">_________________________________</div></div>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:8px;">Nature of Violation:</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">' +
                '<div>☐ Habitual Tardiness</div><div>☐ Unauthorized Absence</div>' +
                '<div>☐ Insubordination</div><div>☐ Misconduct</div>' +
                '<div>☐ Negligence of Duty</div><div>☐ Violation of Company Policy</div>' +
                '<div>☐ Other: ___________________________</div><div></div>' +
                '</div></div>' +
                '<div style="margin-bottom:20px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:8px;">Details of Violation / Incident:</div>' +
                '<div style="border:1px solid #e5e7eb;min-height:80px;padding:10px;font-size:12px;color:#aaa;border-radius:4px;">Describe the incident in detail including date, time, location, and witnesses...<br/><br/><br/></div>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:8px;">Employee\'s Explanation / Response:</div>' +
                '<div style="border:1px solid #e5e7eb;min-height:60px;padding:10px;font-size:12px;color:#aaa;border-radius:4px;"><br/><br/></div>' +
                '</div>' +
                '<div style="background:#fff8e1;border:1px solid #fde68a;border-left:3px solid #f59e0b;padding:12px 16px;margin-bottom:24px;font-size:12px;">' +
                '<strong>MANAGEMENT ACTION:</strong> ☐ Verbal Warning &nbsp; ☐ Written Warning &nbsp; ☐ Final Warning &nbsp; ☐ Suspension: _____ days &nbsp; ☐ Other: ___________' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:24px;">' +
                '<div><div style="height:40px;"></div><div style="border-top:1px solid #1a1a1a;padding-top:6px;font-size:11px;"><div style="font-weight:700;">Immediate Supervisor</div><div style="color:#aaa;font-size:10px;margin-top:1px;">Signature / Date</div></div></div>' +
                '<div><div style="height:40px;"></div><div style="border-top:1px solid #1a1a1a;padding-top:6px;font-size:11px;"><div style="font-weight:700;">HR Officer</div><div style="color:#aaa;font-size:10px;margin-top:1px;">Signature / Date</div></div></div>' +
                '<div><div style="background:#f9fafb;border:1px solid #e5e7eb;padding:8px;margin-bottom:6px;font-size:11px;color:#555;">☐ Acknowledged<br/>☐ Refused to sign</div><div style="border-top:1px solid #1a1a1a;padding-top:6px;font-size:11px;"><div style="font-weight:700;">Employee</div><div style="color:#aaa;font-size:10px;margin-top:1px;">Signature / Date</div></div></div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-print-clearance',
            label: 'HR Print: Clearance Form',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1000px;background:#fff;padding:0;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#1a1a1a;margin:0 auto;overflow:hidden;">' +
                '<div style="background:#1a1a1a;padding:20px 52px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:15px;font-weight:800;color:#fff;letter-spacing:2px;">BENCH APPAREL CORPORATION</div><div style="font-size:9px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-top:2px;">Employee Clearance Form</div></div>' +
                '<div style="background:#B90E0A;color:#fff;padding:6px 14px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1px;">CONFIDENTIAL</div>' +
                '</div>' +
                '<div style="padding:28px 52px;">' +
                '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:12px;">' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Employee Name</div><div style="font-weight:700;font-size:14px;">_________________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Employee ID</div><div style="font-weight:700;font-size:14px;">___________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Last Working Day</div><div style="font-weight:700;font-size:14px;color:#B90E0A;">___________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Position</div><div>_________________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Department</div><div>_________________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Branch</div><div>_________________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Reason for Separation</div><div>☐ Resignation &nbsp; ☐ End of Contract &nbsp; ☐ Termination</div></div>' +
                '</div>' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:12px;">Department Sign-Off</div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px;">' +
                '<thead><tr style="background:#1a1a1a;color:#fff;"><th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:1px;font-weight:700;">Department</th><th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:1px;font-weight:700;">Accountability / Items</th><th style="padding:10px 14px;text-align:center;font-size:10px;letter-spacing:1px;font-weight:700;">Status</th><th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:1px;font-weight:700;">Authorized Signatory</th><th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:1px;font-weight:700;">Date</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 14px;font-weight:600;">Human Resources</td><td style="padding:12px 14px;color:#666;">201 file, leave balance, final pay computation</td><td style="padding:12px 14px;text-align:center;">☐ Clear &nbsp; ☐ With Accountabilities</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">______________________</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">___________</td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;background:#fafafa;"><td style="padding:12px 14px;font-weight:600;">Immediate Supervisor</td><td style="padding:12px 14px;color:#666;">Pending tasks, ongoing projects, turnover</td><td style="padding:12px 14px;text-align:center;">☐ Clear &nbsp; ☐ With Accountabilities</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">______________________</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">___________</td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 14px;font-weight:600;">IT / Systems</td><td style="padding:12px 14px;color:#666;">Laptop, devices, system access deactivation</td><td style="padding:12px 14px;text-align:center;">☐ Clear &nbsp; ☐ With Accountabilities</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">______________________</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">___________</td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;background:#fafafa;"><td style="padding:12px 14px;font-weight:600;">Finance / Payroll</td><td style="padding:12px 14px;color:#666;">Cash advances, loans, SSS/Pag-IBIG loans</td><td style="padding:12px 14px;text-align:center;">☐ Clear &nbsp; ☐ With Accountabilities</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">______________________</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">___________</td></tr>' +
                '<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 14px;font-weight:600;">Admin / Facilities</td><td style="padding:12px 14px;color:#666;">Office keys, ID, uniform, locker</td><td style="padding:12px 14px;text-align:center;">☐ Clear &nbsp; ☐ With Accountabilities</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">______________________</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">___________</td></tr>' +
                '<tr style="background:#fafafa;"><td style="padding:12px 14px;font-weight:600;">Branch Manager</td><td style="padding:12px 14px;color:#666;">Final endorsement and branch sign-off</td><td style="padding:12px 14px;text-align:center;">☐ Clear &nbsp; ☐ With Accountabilities</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">______________________</td><td style="padding:12px 14px;color:#bbb;font-size:11px;">___________</td></tr>' +
                '</tbody></table>' +
                '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid #22c55e;padding:12px 16px;margin-bottom:20px;font-size:12px;">' +
                '<strong style="color:#15803d;">FINAL CLEARANCE STATUS:</strong> &nbsp; ☐ <strong>CLEARED</strong> — Employee has no outstanding accountabilities &nbsp;|&nbsp; ☐ <strong>WITH ACCOUNTABILITIES</strong> — See attached details' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;">' +
                '<div><div style="height:40px;"></div><div style="border-top:1.5px solid #1a1a1a;padding-top:8px;font-size:11px;"><div style="font-weight:700;">HR Manager / Authorized Signatory</div><div style="color:#aaa;font-size:10px;margin-top:1px;">Bench Apparel Corporation &mdash; Date: ___________</div></div></div>' +
                '<div><div style="height:40px;"></div><div style="border-top:1.5px solid #1a1a1a;padding-top:8px;font-size:11px;"><div style="font-weight:700;">Employee</div><div style="color:#aaa;font-size:10px;margin-top:1px;">Signature over Printed Name &mdash; Date: ___________</div></div></div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-print-exit',
            label: 'HR Print: Exit Interview Form',
            category: 'HR Printable',
            content: (function(){
                return '<div style="width:794px;min-height:1123px;background:#fff;padding:0;box-sizing:border-box;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#1a1a1a;margin:0 auto;overflow:hidden;">' +
                '<div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:24px 52px;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:15px;font-weight:800;color:#fff;letter-spacing:2px;">BENCH APPAREL CORPORATION</div><div style="font-size:9px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-top:2px;">Exit Interview Form &mdash; Human Resources</div></div>' +
                '<div style="text-align:right;font-size:10px;color:#555;line-height:1.8;"><div>Date: _______________</div><div>Ref: HR-EI-2026-___</div></div>' +
                '</div>' +
                '<div style="padding:28px 52px;">' +
                '<div style="background:#f9fafb;border-left:4px solid #B90E0A;padding:14px 20px;margin-bottom:24px;font-size:12px;color:#555;">' +
                'This exit interview is completely confidential. Your honest responses will help us improve the work environment for remaining and future employees. Thank you for your service to Bench Apparel.' +
                '</div>' +
                '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:12px;">' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Name</div><div style="border-bottom:1px solid #ddd;padding-bottom:4px;">_________________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Position</div><div style="border-bottom:1px solid #ddd;padding-bottom:4px;">_________________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Branch</div><div style="border-bottom:1px solid #ddd;padding-bottom:4px;">_________________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Date Hired</div><div style="border-bottom:1px solid #ddd;padding-bottom:4px;">_________________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Last Working Day</div><div style="border-bottom:1px solid #ddd;padding-bottom:4px;">_________________________</div></div>' +
                '<div><div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Years of Service</div><div style="border-bottom:1px solid #ddd;padding-bottom:4px;">_________________________</div></div>' +
                '</div>' +
                '<div style="margin-bottom:20px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:8px;">1. Primary Reason for Leaving:</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:8px;">' +
                '<div>☐ Better job opportunity</div><div>☐ Higher compensation elsewhere</div>' +
                '<div>☐ Personal / family reasons</div><div>☐ Career change</div>' +
                '<div>☐ Work environment issues</div><div>☐ Management concerns</div>' +
                '<div>☐ Relocation</div><div>☐ Health reasons</div>' +
                '<div>☐ Contract ended</div><div>☐ Other: ___________________________</div>' +
                '</div></div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">' +
                '<div><div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:8px;">2. How would you rate your overall experience?</div>' +
                '<div style="display:flex;gap:12px;font-size:12px;">☐ Excellent &nbsp; ☐ Good &nbsp; ☐ Fair &nbsp; ☐ Poor</div></div>' +
                '<div><div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:8px;">3. Would you recommend Bench as an employer?</div>' +
                '<div style="display:flex;gap:12px;font-size:12px;">☐ Definitely &nbsp; ☐ Maybe &nbsp; ☐ No</div></div>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:6px;">4. What did you enjoy most about working here?</div>' +
                '<div style="border:1px solid #e5e7eb;min-height:52px;padding:8px;font-size:11px;color:#bbb;border-radius:4px;"><br/><br/></div>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:6px;">5. What could Bench Apparel improve?</div>' +
                '<div style="border:1px solid #e5e7eb;min-height:52px;padding:8px;font-size:11px;color:#bbb;border-radius:4px;"><br/><br/></div>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:6px;">6. Comments on management / supervisors:</div>' +
                '<div style="border:1px solid #e5e7eb;min-height:52px;padding:8px;font-size:11px;color:#bbb;border-radius:4px;"><br/><br/></div>' +
                '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;margin-bottom:6px;">7. Any other feedback or message to the team:</div>' +
                '<div style="border:1px solid #e5e7eb;min-height:52px;padding:8px;font-size:11px;color:#bbb;border-radius:4px;"><br/><br/></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:24px;">' +
                '<div><div style="height:40px;"></div><div style="border-top:1px solid #1a1a1a;padding-top:8px;font-size:11px;"><div style="font-weight:700;">Employee Signature</div><div style="color:#aaa;font-size:10px;margin-top:1px;">Over Printed Name &amp; Date</div></div></div>' +
                '<div><div style="height:40px;"></div><div style="border-top:1px solid #1a1a1a;padding-top:8px;font-size:11px;"><div style="font-weight:700;">Interviewed by (HR Officer)</div><div style="color:#aaa;font-size:10px;margin-top:1px;">Over Printed Name &amp; Date</div></div></div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#1a1a1a;padding:10px 52px;display:flex;justify-content:space-between;font-size:9px;color:#555;letter-spacing:1px;">' +
                '<span>BENCH APPAREL CORPORATION &mdash; EXIT INTERVIEW &mdash; STRICTLY CONFIDENTIAL</span><span>FORM HR-EI &mdash; 2026</span>' +
                '</div>' +
                '</div>';
            })()
        },

        // ── HR DASHBOARD TEMPLATES ────────────────────────────────────────

        {
            id: 'hr-dash-overview',
            label: 'HR: Overview Dashboard',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                // Top nav
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="display:flex;align-items:center;gap:12px;">' +
                '<div style="width:36px;height:36px;background:#B90E0A;border-radius:9px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:15px;">B</span></div>' +
                '<div><div style="font-size:14px;font-weight:700;color:#1a1a1a;">Bench Apparel</div><div style="font-size:10px;color:#aaa;letter-spacing:1px;text-transform:uppercase;">Human Resources</div></div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:20px;">' +
                '<span style="font-size:13px;color:#666;">March 2026</span>' +
                '<div style="width:34px;height:34px;background:#B90E0A;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;">HR</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:28px;">' +
                // Header
                '<div style="margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end;">' +
                '<div><h1 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">HR Overview</h1><p style="font-size:13px;color:#888;margin:0;">All branches &mdash; February 2026</p></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="padding:8px 16px;background:#fff;border:1px solid #e5e7eb;border-radius:7px;font-size:12px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Export PDF</button>' +
                '<button style="padding:8px 16px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">+ Add Employee</button>' +
                '</div>' +
                '</div>' +
                // KPI row
                '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:24px;">' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Total Employees</div><div style="font-size:26px;font-weight:800;color:#1a1a1a;">1,240</div><div style="font-size:11px;color:#22c55e;margin-top:4px;">+18 this month</div></div>' +
                '<div style="width:36px;height:36px;background:#f0fdf4;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;">👥</div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Present Today</div><div style="font-size:26px;font-weight:800;color:#1a1a1a;">1,184</div><div style="font-size:11px;color:#22c55e;margin-top:4px;">95.5% attendance</div></div>' +
                '<div style="width:36px;height:36px;background:#f0fdf4;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;">✅</div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">On Leave</div><div style="font-size:26px;font-weight:800;color:#1a1a1a;">38</div><div style="font-size:11px;color:#f59e0b;margin-top:4px;">12 sick, 26 vacation</div></div>' +
                '<div style="width:36px;height:36px;background:#fffbeb;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;">🏖️</div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Open Positions</div><div style="font-size:26px;font-weight:800;color:#1a1a1a;">14</div><div style="font-size:11px;color:#B90E0A;margin-top:4px;">3 urgent</div></div>' +
                '<div style="width:36px;height:36px;background:#fee2e2;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;">📋</div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
                '<div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Turnover Rate</div><div style="font-size:26px;font-weight:800;color:#1a1a1a;">2.4%</div><div style="font-size:11px;color:#22c55e;margin-top:4px;">-0.3% vs last mo</div></div>' +
                '<div style="width:36px;height:36px;background:#f0fdf4;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;">📉</div>' +
                '</div></div>' +
                '</div>' +
                // Main content grid
                '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:16px;">' +
                // Employee table
                '<div style="background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">' +
                '<div style="padding:18px 20px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:14px;font-weight:700;color:#1a1a1a;">Recent Hires</span>' +
                '<span style="font-size:12px;color:#B90E0A;cursor:pointer;font-weight:500;">View all</span>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="background:#f9fafb;"><th style="padding:10px 20px;text-align:left;color:#9ca3af;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Employee</th><th style="padding:10px;text-align:left;color:#9ca3af;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Branch</th><th style="padding:10px;text-align:left;color:#9ca3af;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Role</th><th style="padding:10px;text-align:left;color:#9ca3af;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Status</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #f9fafb;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:30px;height:30px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#B90E0A;">MS</div><div><div style="font-weight:600;color:#1a1a1a;">Maria Santos</div><div style="color:#aaa;font-size:11px;">Hired Mar 1</div></div></div></td><td style="padding:12px 10px;color:#555;">SM MOA</td><td style="padding:12px 10px;color:#555;">Sales Associate</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Active</span></td></tr>' +
                '<tr style="border-bottom:1px solid #f9fafb;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:30px;height:30px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#2563eb;">JC</div><div><div style="font-weight:600;color:#1a1a1a;">Jose Cruz</div><div style="color:#aaa;font-size:11px;">Hired Feb 28</div></div></div></td><td style="padding:12px 10px;color:#555;">BGC</td><td style="padding:12px 10px;color:#555;">Cashier</td><td style="padding:12px 10px;"><span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Probation</span></td></tr>' +
                '<tr style="border-bottom:1px solid #f9fafb;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:30px;height:30px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#16a34a;">AR</div><div><div style="font-weight:600;color:#1a1a1a;">Ana Reyes</div><div style="color:#aaa;font-size:11px;">Hired Feb 25</div></div></div></td><td style="padding:12px 10px;color:#555;">Cebu</td><td style="padding:12px 10px;color:#555;">Team Leader</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Active</span></td></tr>' +
                '<tr><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:30px;height:30px;border-radius:50%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#6b7280;">PG</div><div><div style="font-weight:600;color:#1a1a1a;">Pedro Gomez</div><div style="color:#aaa;font-size:11px;">Hired Feb 20</div></div></div></td><td style="padding:12px 10px;color:#555;">Davao</td><td style="padding:12px 10px;color:#555;">Stock Clerk</td><td style="padding:12px 10px;"><span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Probation</span></td></tr>' +
                '</tbody></table></div>' +
                // Dept breakdown
                '<div style="background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06);padding:20px;">' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">Headcount by Branch</div>' +
                '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">SM Mall of Asia</span><span style="font-weight:700;color:#1a1a1a;">342</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#B90E0A;height:7px;border-radius:99px;width:88%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">BGC High Street</span><span style="font-weight:700;color:#1a1a1a;">298</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#B90E0A;height:7px;border-radius:99px;width:77%;opacity:0.8;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Cebu IT Park</span><span style="font-weight:700;color:#1a1a1a;">210</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#B90E0A;height:7px;border-radius:99px;width:54%;opacity:0.7;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Davao Abreeza</span><span style="font-weight:700;color:#1a1a1a;">188</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#B90E0A;height:7px;border-radius:99px;width:48%;opacity:0.6;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Online / Remote</span><span style="font-weight:700;color:#1a1a1a;">202</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#3b82f6;height:7px;border-radius:99px;width:52%;"></div></div></div>' +
                '</div>' +
                '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;">' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#1a1a1a;">68%</div><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Full-time</div></div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#1a1a1a;">32%</div><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Part-time</div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-dash-payroll',
            label: 'HR: Payroll Dashboard',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#0d0d0d;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#fff;">' +
                '<div style="background:#111;border-bottom:1px solid #1f1f1f;padding:0 32px;height:60px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:14px;">' +
                '<div style="width:38px;height:38px;background:#B90E0A;border-radius:9px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:16px;">B</span></div>' +
                '<div><div style="font-size:14px;font-weight:700;">Bench Apparel</div><div style="font-size:10px;color:#555;letter-spacing:1px;text-transform:uppercase;">Payroll Management</div></div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:16px;">' +
                '<div style="background:#B90E0A;color:#fff;padding:6px 14px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;">MARCH PAYROLL OPEN</div>' +
                '<div style="width:32px;height:32px;background:#1f1f1f;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#888;font-size:13px;">⚙</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:32px;">' +
                '<div style="margin-bottom:28px;">' +
                '<h1 style="font-size:24px;font-weight:800;margin:0 0 4px;">Payroll Overview</h1>' +
                '<p style="font-size:13px;color:#555;margin:0;">Processing period: March 1–31, 2026</p>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;">' +
                '<div style="background:linear-gradient(135deg,#B90E0A,#7a0806);border-radius:14px;padding:24px;">' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Gross Payroll</div>' +
                '<div style="font-size:28px;font-weight:800;">PHP 22.4M</div>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px;">1,240 employees</div>' +
                '</div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:24px;">' +
                '<div style="font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Total Deductions</div>' +
                '<div style="font-size:28px;font-weight:800;color:#ef4444;">PHP 2.1M</div>' +
                '<div style="font-size:11px;color:#555;margin-top:6px;">SSS, PhilHealth, Pag-IBIG</div>' +
                '</div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:24px;">' +
                '<div style="font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Net Payout</div>' +
                '<div style="font-size:28px;font-weight:800;color:#22c55e;">PHP 20.3M</div>' +
                '<div style="font-size:11px;color:#555;margin-top:6px;">Pay date: March 5</div>' +
                '</div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:24px;">' +
                '<div style="font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Avg Salary</div>' +
                '<div style="font-size:28px;font-weight:800;">PHP 18,064</div>' +
                '<div style="font-size:11px;color:#22c55e;margin-top:6px;">+3.2% vs last month</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:16px;">' +
                '<div style="background:#111;border:1px solid #1f1f1f;border-radius:14px;overflow:hidden;">' +
                '<div style="padding:18px 22px;border-bottom:1px solid #1f1f1f;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:14px;font-weight:700;">Payroll by Branch</span>' +
                '<span style="font-size:11px;color:#555;">Feb vs Mar 2026</span>' +
                '</div>' +
                '<div style="padding:20px 22px;">' +
                '<div style="display:flex;flex-direction:column;gap:14px;">' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#aaa;">SM Mall of Asia</span><div style="display:flex;gap:16px;"><span style="color:#555;">PHP 6.1M</span><span style="color:#fff;font-weight:700;">PHP 6.4M</span></div></div><div style="background:#1f1f1f;border-radius:2px;height:8px;position:relative;"><div style="background:#333;height:8px;border-radius:2px;width:82%;position:absolute;"></div><div style="background:#B90E0A;height:8px;border-radius:2px;width:88%;position:absolute;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#aaa;">BGC High Street</span><div style="display:flex;gap:16px;"><span style="color:#555;">PHP 5.2M</span><span style="color:#fff;font-weight:700;">PHP 5.5M</span></div></div><div style="background:#1f1f1f;border-radius:2px;height:8px;position:relative;"><div style="background:#333;height:8px;border-radius:2px;width:70%;position:absolute;"></div><div style="background:#B90E0A;height:8px;border-radius:2px;width:75%;position:absolute;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#aaa;">Cebu IT Park</span><div style="display:flex;gap:16px;"><span style="color:#555;">PHP 3.8M</span><span style="color:#fff;font-weight:700;">PHP 4.0M</span></div></div><div style="background:#1f1f1f;border-radius:2px;height:8px;position:relative;"><div style="background:#333;height:8px;border-radius:2px;width:52%;position:absolute;"></div><div style="background:#B90E0A;height:8px;border-radius:2px;width:55%;position:absolute;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#aaa;">Davao Abreeza</span><div style="display:flex;gap:16px;"><span style="color:#555;">PHP 3.1M</span><span style="color:#fff;font-weight:700;">PHP 3.3M</span></div></div><div style="background:#1f1f1f;border-radius:2px;height:8px;position:relative;"><div style="background:#333;height:8px;border-radius:2px;width:43%;position:absolute;"></div><div style="background:#B90E0A;height:8px;border-radius:2px;width:46%;position:absolute;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#aaa;">Remote / Online</span><div style="display:flex;gap:16px;"><span style="color:#555;">PHP 2.9M</span><span style="color:#fff;font-weight:700;">PHP 3.2M</span></div></div><div style="background:#1f1f1f;border-radius:2px;height:8px;position:relative;"><div style="background:#333;height:8px;border-radius:2px;width:40%;position:absolute;"></div><div style="background:#3b82f6;height:8px;border-radius:2px;width:44%;position:absolute;"></div></div></div>' +
                '</div>' +
                '<div style="display:flex;gap:16px;margin-top:16px;padding-top:14px;border-top:1px solid #1f1f1f;">' +
                '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#555;"><div style="width:10px;height:10px;background:#333;border-radius:2px;"></div>February</div>' +
                '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#aaa;"><div style="width:10px;height:10px;background:#B90E0A;border-radius:2px;"></div>March</div>' +
                '</div>' +
                '</div></div>' +
                '<div style="background:#111;border:1px solid #1f1f1f;border-radius:14px;padding:20px;">' +
                '<div style="font-size:14px;font-weight:700;margin-bottom:16px;">Deduction Breakdown</div>' +
                '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<div style="background:#1a1a1a;border-radius:10px;padding:14px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:12px;font-weight:600;">SSS</div><div style="font-size:10px;color:#555;margin-top:2px;">Social Security System</div></div><div style="text-align:right;"><div style="font-size:14px;font-weight:700;color:#ef4444;">PHP 1,116,000</div><div style="font-size:10px;color:#555;margin-top:2px;">PHP 900 avg/emp</div></div></div>' +
                '<div style="background:#1a1a1a;border-radius:10px;padding:14px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:12px;font-weight:600;">PhilHealth</div><div style="font-size:10px;color:#555;margin-top:2px;">Health Insurance</div></div><div style="text-align:right;"><div style="font-size:14px;font-weight:700;color:#ef4444;">PHP 496,000</div><div style="font-size:10px;color:#555;margin-top:2px;">PHP 400 avg/emp</div></div></div>' +
                '<div style="background:#1a1a1a;border-radius:10px;padding:14px;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:12px;font-weight:600;">Pag-IBIG</div><div style="font-size:10px;color:#555;margin-top:2px;">Housing Fund</div></div><div style="text-align:right;"><div style="font-size:14px;font-weight:700;color:#ef4444;">PHP 248,000</div><div style="font-size:10px;color:#555;margin-top:2px;">PHP 200 avg/emp</div></div></div>' +
                '<div style="background:#1a1a1a;border-radius:10px;padding:14px;display:flex;justify-content:space-between;align-items:center;border:1px solid #2a2a2a;"><div><div style="font-size:12px;font-weight:700;color:#fff;">Total Deductions</div></div><div style="text-align:right;"><div style="font-size:16px;font-weight:800;color:#ef4444;">PHP 1,860,000</div></div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-dash-attendance',
            label: 'HR: Attendance Dashboard',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#f8fafc;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:linear-gradient(135deg,#B90E0A 0%,#7a0806 100%);padding:28px 32px 80px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>' +
                '<div style="position:absolute;bottom:-60px;left:200px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>' +
                '<div style="position:relative;display:flex;justify-content:space-between;align-items:center;">' +
                '<div><div style="font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Bench Apparel HR</div><h1 style="font-size:24px;font-weight:800;color:#fff;margin:0;">Attendance &amp; Timekeeping</h1><p style="font-size:13px;color:rgba(255,255,255,0.6);margin:6px 0 0;">Week of March 4–8, 2026</p></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="padding:8px 16px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">This Week</button>' +
                '<button style="padding:8px 16px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:7px;font-size:12px;color:rgba(255,255,255,0.6);cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">This Month</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:0 32px;margin-top:-52px;position:relative;z-index:2;">' +
                '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;">' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;">' +
                '<div style="font-size:28px;font-weight:900;color:#1a1a1a;">1,184</div>' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Present</div>' +
                '<div style="width:40px;height:3px;background:#22c55e;border-radius:99px;margin:8px auto 0;"></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;">' +
                '<div style="font-size:28px;font-weight:900;color:#1a1a1a;">38</div>' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">On Leave</div>' +
                '<div style="width:40px;height:3px;background:#3b82f6;border-radius:99px;margin:8px auto 0;"></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;">' +
                '<div style="font-size:28px;font-weight:900;color:#1a1a1a;">18</div>' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Absent</div>' +
                '<div style="width:40px;height:3px;background:#ef4444;border-radius:99px;margin:8px auto 0;"></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;">' +
                '<div style="font-size:28px;font-weight:900;color:#1a1a1a;">64</div>' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Late</div>' +
                '<div style="width:40px;height:3px;background:#f59e0b;border-radius:99px;margin:8px auto 0;"></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;">' +
                '<div style="font-size:28px;font-weight:900;color:#1a1a1a;">142</div>' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Overtime hrs</div>' +
                '<div style="width:40px;height:3px;background:#8b5cf6;border-radius:99px;margin:8px auto 0;"></div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
                '<div style="background:#fff;border-radius:14px;padding:22px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">Daily Attendance This Week</div>' +
                '<div style="display:flex;align-items:flex-end;gap:10px;height:100px;margin-bottom:10px;">' +
                '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="width:100%;background:#B90E0A;border-radius:4px 4px 0 0;" style="height:82px;"></div><div style="font-size:10px;color:#aaa;">Mon</div><div style="font-size:11px;font-weight:700;color:#1a1a1a;">95%</div></div>' +
                '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="width:100%;border-radius:4px 4px 0 0;background:#B90E0A;opacity:0.9;" style="height:88px;"></div><div style="font-size:10px;color:#aaa;">Tue</div><div style="font-size:11px;font-weight:700;color:#1a1a1a;">97%</div></div>' +
                '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="width:100%;border-radius:4px 4px 0 0;background:#B90E0A;opacity:0.75;" style="height:76px;"></div><div style="font-size:10px;color:#aaa;">Wed</div><div style="font-size:11px;font-weight:700;color:#1a1a1a;">93%</div></div>' +
                '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="width:100%;border-radius:4px 4px 0 0;background:#B90E0A;opacity:0.85;" style="height:84px;"></div><div style="font-size:10px;color:#aaa;">Thu</div><div style="font-size:11px;font-weight:700;color:#1a1a1a;">96%</div></div>' +
                '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;"><div style="width:100%;border-radius:4px 4px 0 0;background:#e5e7eb;" style="height:60px;"></div><div style="font-size:10px;color:#aaa;">Fri</div><div style="font-size:11px;color:#aaa;">—</div></div>' +
                '</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:14px;padding:22px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">Late Arrivals by Branch</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#B90E0A;border-radius:50%;"></div><span style="font-size:13px;color:#555;">SM Mall of Asia</span></div><div style="display:flex;align-items:center;gap:12px;"><div style="width:80px;background:#f3f4f6;border-radius:99px;height:5px;"><div style="background:#B90E0A;height:5px;border-radius:99px;width:65%;"></div></div><span style="font-size:12px;font-weight:700;color:#1a1a1a;">21</span></div></div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#f59e0b;border-radius:50%;"></div><span style="font-size:13px;color:#555;">BGC High Street</span></div><div style="display:flex;align-items:center;gap:12px;"><div style="width:80px;background:#f3f4f6;border-radius:99px;height:5px;"><div style="background:#f59e0b;height:5px;border-radius:99px;width:48%;"></div></div><span style="font-size:12px;font-weight:700;color:#1a1a1a;">16</span></div></div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#3b82f6;border-radius:50%;"></div><span style="font-size:13px;color:#555;">Cebu IT Park</span></div><div style="display:flex;align-items:center;gap:12px;"><div style="width:80px;background:#f3f4f6;border-radius:99px;height:5px;"><div style="background:#3b82f6;height:5px;border-radius:99px;width:34%;"></div></div><span style="font-size:12px;font-weight:700;color:#1a1a1a;">11</span></div></div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#22c55e;border-radius:50%;"></div><span style="font-size:13px;color:#555;">Davao Abreeza</span></div><div style="display:flex;align-items:center;gap:12px;"><div style="width:80px;background:#f3f4f6;border-radius:99px;height:5px;"><div style="background:#22c55e;height:5px;border-radius:99px;width:25%;"></div></div><span style="font-size:12px;font-weight:700;color:#1a1a1a;">8</span></div></div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#8b5cf6;border-radius:50%;"></div><span style="font-size:13px;color:#555;">Remote</span></div><div style="display:flex;align-items:center;gap:12px;"><div style="width:80px;background:#f3f4f6;border-radius:99px;height:5px;"><div style="background:#8b5cf6;height:5px;border-radius:99px;width:16%;"></div></div><span style="font-size:12px;font-weight:700;color:#1a1a1a;">8</span></div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-dash-recruitment',
            label: 'HR: Recruitment Pipeline',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#fafaf8;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,0.05);">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:34px;height:34px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div><div style="font-size:14px;font-weight:700;color:#1a1a1a;">Recruitment Pipeline</div></div>' +
                '<button style="padding:8px 18px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">+ Post New Job</button>' +
                '</div>' +
                '<div style="padding:28px;">' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px;">' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #3b82f6;"><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Applications</div><div style="font-size:24px;font-weight:800;color:#1a1a1a;">284</div><div style="font-size:11px;color:#3b82f6;margin-top:4px;">+42 this week</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #f59e0b;"><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Interviews</div><div style="font-size:24px;font-weight:800;color:#1a1a1a;">48</div><div style="font-size:11px;color:#f59e0b;margin-top:4px;">Scheduled this week</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #22c55e;"><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Job Offers</div><div style="font-size:24px;font-weight:800;color:#1a1a1a;">12</div><div style="font-size:11px;color:#22c55e;margin-top:4px;">8 accepted</div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #B90E0A;"><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Open Positions</div><div style="font-size:24px;font-weight:800;color:#1a1a1a;">14</div><div style="font-size:11px;color:#B90E0A;margin-top:4px;">3 urgent</div></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:24px;">' +
                // Kanban columns
                '<div style="background:#f0f4ff;border-radius:12px;padding:14px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="font-size:12px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:1px;">Applied</span><span style="background:#3b82f6;color:#fff;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;">8</span></div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Carlos Mendoza</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Sales Associate</div><div style="font-size:10px;background:#eff6ff;color:#3b82f6;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:6px;">BGC Branch</div></div>' +
                '<div style="background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Lisa Tan</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Cashier</div><div style="font-size:10px;background:#eff6ff;color:#3b82f6;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:6px;">Cebu Branch</div></div>' +
                '<div style="background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Ricky Lim</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Stock Clerk</div><div style="font-size:10px;background:#eff6ff;color:#3b82f6;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:6px;">SM MOA</div></div>' +
                '</div></div>' +
                '<div style="background:#fffbeb;border-radius:12px;padding:14px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="font-size:12px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;">Interview</span><span style="background:#f59e0b;color:#fff;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;">5</span></div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Jenny Dela Rosa</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Team Leader</div><div style="font-size:10px;background:#fffbeb;color:#f59e0b;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:6px;">Mar 5, 2:00 PM</div></div>' +
                '<div style="background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Marco Reyes</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Visual Merch</div><div style="font-size:10px;background:#fffbeb;color:#f59e0b;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:6px;">Mar 6, 10:00 AM</div></div>' +
                '</div></div>' +
                '<div style="background:#f0fdf4;border-radius:12px;padding:14px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="font-size:12px;font-weight:700;color:#22c55e;text-transform:uppercase;letter-spacing:1px;">Offer</span><span style="background:#22c55e;color:#fff;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;">3</span></div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Ana Santos</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Branch Manager</div><div style="font-size:10px;background:#f0fdf4;color:#22c55e;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:6px;">Offer sent</div></div>' +
                '<div style="background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Mike Torres</div><div style="font-size:11px;color:#aaa;margin-top:2px;">HR Coordinator</div><div style="font-size:10px;background:#f0fdf4;color:#22c55e;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:6px;">Negotiating</div></div>' +
                '</div></div>' +
                '<div style="background:#fff0f0;border-radius:12px;padding:14px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="font-size:12px;font-weight:700;color:#B90E0A;text-transform:uppercase;letter-spacing:1px;">Hired</span><span style="background:#B90E0A;color:#fff;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;">4</span></div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Maria Santos</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Sales Associate</div><div style="font-size:10px;background:#fee2e2;color:#B90E0A;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:6px;">Starts Mar 10</div></div>' +
                '<div style="background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"><div style="font-size:12px;font-weight:700;color:#1a1a1a;">Jose Cruz</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Cashier</div><div style="font-size:10px;background:#fee2e2;color:#B90E0A;padding:2px 6px;border-radius:4px;display:inline-block;margin-top:6px;">Starts Mar 12</div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-dash-performance',
            label: 'HR: Performance Dashboard',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#0a0a14;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#fff;">' +
                '<div style="background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.07);padding:0 32px;height:58px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:34px;height:34px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div><span style="font-size:14px;font-weight:700;">Performance Review — Q1 2026</span></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="padding:7px 14px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:7px;font-size:11px;color:#aaa;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Export</button>' +
                '<button style="padding:7px 14px;background:#B90E0A;border:none;border-radius:7px;font-size:11px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">Start Reviews</button>' +
                '</div>' +
                '</div>' +
                '<div style="padding:28px;">' +
                '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;">' +
                '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">Avg Score</div><div style="font-size:26px;font-weight:800;color:#fff;">4.2<span style="font-size:14px;color:#555;">/5</span></div><div style="font-size:11px;color:#22c55e;margin-top:4px;">+0.3 vs Q4</div></div>' +
                '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">Completed</div><div style="font-size:26px;font-weight:800;color:#fff;">892</div><div style="font-size:11px;color:#f59e0b;margin-top:4px;">348 pending</div></div>' +
                '<div style="background:rgba(185,14,10,0.12);border:1px solid rgba(185,14,10,0.25);border-radius:12px;padding:18px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#B90E0A;margin-bottom:8px;">Top Performers</div><div style="font-size:26px;font-weight:800;color:#fff;">124</div><div style="font-size:11px;color:#22c55e;margin-top:4px;">Score 4.8+</div></div>' +
                '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">For Promotion</div><div style="font-size:26px;font-weight:800;color:#fff;">38</div><div style="font-size:11px;color:#3b82f6;margin-top:4px;">Recommended</div></div>' +
                '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">Needs Dev</div><div style="font-size:26px;font-weight:800;color:#fff;">62</div><div style="font-size:11px;color:#ef4444;margin-top:4px;">Score below 3.0</div></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:22px;">' +
                '<div style="font-size:14px;font-weight:700;margin-bottom:16px;">Score Distribution</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:12px;color:#aaa;width:80px;">Exceptional (5)</span><div style="flex:1;background:rgba(255,255,255,0.06);border-radius:2px;height:10px;"><div style="background:linear-gradient(90deg,#22c55e,#16a34a);height:10px;border-radius:2px;width:18%;"></div></div><span style="font-size:11px;font-weight:700;width:30px;text-align:right;">224</span></div>' +
                '<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:12px;color:#aaa;width:80px;">Exceeds (4)</span><div style="flex:1;background:rgba(255,255,255,0.06);border-radius:2px;height:10px;"><div style="background:linear-gradient(90deg,#3b82f6,#2563eb);height:10px;border-radius:2px;width:42%;"></div></div><span style="font-size:11px;font-weight:700;width:30px;text-align:right;">521</span></div>' +
                '<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:12px;color:#aaa;width:80px;">Meets (3)</span><div style="flex:1;background:rgba(255,255,255,0.06);border-radius:2px;height:10px;"><div style="background:linear-gradient(90deg,#f59e0b,#d97706);height:10px;border-radius:2px;width:28%;"></div></div><span style="font-size:11px;font-weight:700;width:30px;text-align:right;">347</span></div>' +
                '<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:12px;color:#aaa;width:80px;">Below (2)</span><div style="flex:1;background:rgba(255,255,255,0.06);border-radius:2px;height:10px;"><div style="background:linear-gradient(90deg,#ef4444,#dc2626);height:10px;border-radius:2px;width:8%;"></div></div><span style="font-size:11px;font-weight:700;width:30px;text-align:right;">98</span></div>' +
                '<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:12px;color:#aaa;width:80px;">Poor (1)</span><div style="flex:1;background:rgba(255,255,255,0.06);border-radius:2px;height:10px;"><div style="background:linear-gradient(90deg,#6b7280,#4b5563);height:10px;border-radius:2px;width:4%;"></div></div><span style="font-size:11px;font-weight:700;width:30px;text-align:right;">50</span></div>' +
                '</div></div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:22px;">' +
                '<div style="font-size:14px;font-weight:700;margin-bottom:16px;">Top Performers</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.04);border-radius:10px;padding:12px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#ffd700;border-radius:50%;"></div><div><div style="font-size:12px;font-weight:700;">Maria Santos</div><div style="font-size:10px;color:#555;margin-top:1px;">SM MOA &mdash; Sales</div></div></div><div style="font-size:16px;font-weight:800;color:#22c55e;">4.9</div></div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.04);border-radius:10px;padding:12px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#c0c0c0;border-radius:50%;"></div><div><div style="font-size:12px;font-weight:700;">Juan dela Cruz</div><div style="font-size:10px;color:#555;margin-top:1px;">BGC &mdash; Manager</div></div></div><div style="font-size:16px;font-weight:800;color:#22c55e;">4.8</div></div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.04);border-radius:10px;padding:12px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#cd7f32;border-radius:50%;"></div><div><div style="font-size:12px;font-weight:700;">Ana Reyes</div><div style="font-size:10px;color:#555;margin-top:1px;">Cebu &mdash; Team Lead</div></div></div><div style="font-size:16px;font-weight:800;color:#3b82f6;">4.7</div></div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.04);border-radius:10px;padding:12px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:8px;height:8px;background:#B90E0A;border-radius:50%;"></div><div><div style="font-size:12px;font-weight:700;">Pedro Gomez</div><div style="font-size:10px;color:#555;margin-top:1px;">Davao &mdash; Sales</div></div></div><div style="font-size:16px;font-weight:800;color:#3b82f6;">4.6</div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-dash-leaves',
            label: 'HR: Leave Management',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#f8fafc;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:56px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:34px;height:34px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div><span style="font-size:14px;font-weight:700;color:#1a1a1a;">Leave Management</span></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:#f59e0b;background:#fffbeb;border:1px solid #fde68a;padding:5px 12px;border-radius:7px;font-weight:600;">⚠ 8 Pending Approvals</span>' +
                '<button style="padding:7px 16px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">+ File Leave</button>' +
                '</div>' +
                '</div>' +
                '<div style="padding:24px 28px;">' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:center;">' +
                '<div style="width:44px;height:44px;background:#f0fdf4;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">🏖️</div>' +
                '<div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Vacation</div><div style="font-size:22px;font-weight:800;color:#1a1a1a;">24</div><div style="font-size:11px;color:#22c55e;">Active</div></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:center;">' +
                '<div style="width:44px;height:44px;background:#fef9c3;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">🤒</div>' +
                '<div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Sick Leave</div><div style="font-size:22px;font-weight:800;color:#1a1a1a;">12</div><div style="font-size:11px;color:#f59e0b;">Active</div></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:center;">' +
                '<div style="width:44px;height:44px;background:#eff6ff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">🛑</div>' +
                '<div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Emergency</div><div style="font-size:22px;font-weight:800;color:#1a1a1a;">2</div><div style="font-size:11px;color:#3b82f6;">Active</div></div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:center;">' +
                '<div style="width:44px;height:44px;background:#fee2e2;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">⏳</div>' +
                '<div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Pending</div><div style="font-size:22px;font-weight:800;color:#1a1a1a;">8</div><div style="font-size:11px;color:#B90E0A;">For approval</div></div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;">' +
                '<div style="background:#fff;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">' +
                '<div style="padding:18px 20px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:14px;font-weight:700;color:#1a1a1a;">Pending Approvals</span><span style="font-size:12px;color:#B90E0A;font-weight:500;">View all</span></div>' +
                '<div style="padding:8px 0;">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #f9fafb;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#B90E0A;">MS</div><div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Maria Santos</div><div style="font-size:11px;color:#aaa;">Vacation &bull; Mar 10–14 (5 days)</div></div></div>' +
                '<div style="display:flex;gap:6px;"><button style="padding:5px 12px;background:#dcfce7;border:none;border-radius:6px;color:#16a34a;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Approve</button><button style="padding:5px 12px;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Decline</button></div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #f9fafb;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#2563eb;">JC</div><div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Jose Cruz</div><div style="font-size:11px;color:#aaa;">Sick Leave &bull; Mar 5–6 (2 days)</div></div></div>' +
                '<div style="display:flex;gap:6px;"><button style="padding:5px 12px;background:#dcfce7;border:none;border-radius:6px;color:#16a34a;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Approve</button><button style="padding:5px 12px;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Decline</button></div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#16a34a;">AR</div><div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Ana Reyes</div><div style="font-size:11px;color:#aaa;">Emergency &bull; Mar 4 (1 day)</div></div></div>' +
                '<div style="display:flex;gap:6px;"><button style="padding:5px 12px;background:#dcfce7;border:none;border-radius:6px;color:#16a34a;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Approve</button><button style="padding:5px 12px;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Decline</button></div>' +
                '</div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">Leave Balance Summary</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#555;">Vacation Leave</span><span style="font-weight:700;">18 / 25 days used</span></div><div style="background:#f3f4f6;border-radius:99px;height:8px;"><div style="background:#22c55e;height:8px;border-radius:99px;width:72%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#555;">Sick Leave</span><span style="font-weight:700;">6 / 15 days used</span></div><div style="background:#f3f4f6;border-radius:99px;height:8px;"><div style="background:#f59e0b;height:8px;border-radius:99px;width:40%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#555;">Emergency Leave</span><span style="font-weight:700;">2 / 5 days used</span></div><div style="background:#f3f4f6;border-radius:99px;height:8px;"><div style="background:#3b82f6;height:8px;border-radius:99px;width:40%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#555;">Maternity / Paternity</span><span style="font-weight:700;">0 / 105 days used</span></div><div style="background:#f3f4f6;border-radius:99px;height:8px;"><div style="background:#8b5cf6;height:8px;border-radius:99px;width:0%;"></div></div></div>' +
                '</div>' +
                '<div style="margin-top:20px;background:#f9fafb;border-radius:10px;padding:14px;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Leave Credits Expiring Soon</div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;"><span style="color:#555;">5 employees</span><span style="color:#B90E0A;font-weight:600;">Credits expire Mar 31</span></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-dash-employee-dir',
            label: 'HR: Employee Directory',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#f4f6f9;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:32px;position:relative;overflow:hidden;">' +
                '<div style="position:absolute;top:-80px;right:-80px;width:280px;height:280px;border-radius:50%;background:rgba(185,14,10,0.12);"></div>' +
                '<div style="position:relative;">' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Bench Apparel Corporation</div>' +
                '<h1 style="font-size:24px;font-weight:800;color:#fff;margin:0 0 20px;">Employee Directory</h1>' +
                '<div style="display:flex;gap:10px;">' +
                '<div style="flex:1;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:9px;padding:11px 16px;display:flex;align-items:center;gap:10px;">' +
                '<span style="color:rgba(255,255,255,0.4);font-size:14px;">🔍</span>' +
                '<input placeholder="Search employees by name, role, branch..." style="background:transparent;border:none;outline:none;color:#fff;font-size:13px;flex:1;font-family:\'Helvetica Neue\',sans-serif;" />' +
                '</div>' +
                '<select style="padding:11px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:9px;color:#fff;font-size:13px;outline:none;font-family:\'Helvetica Neue\',sans-serif;cursor:pointer;"><option>All Branches</option><option>SM MOA</option><option>BGC</option><option>Cebu</option></select>' +
                '<select style="padding:11px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:9px;color:#fff;font-size:13px;outline:none;font-family:\'Helvetica Neue\',sans-serif;cursor:pointer;"><option>All Roles</option><option>Manager</option><option>Associate</option><option>Cashier</option></select>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div style="padding:24px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
                '<span style="font-size:13px;color:#888;">Showing <strong style="color:#1a1a1a;">1,240</strong> employees</span>' +
                '<div style="display:flex;gap:6px;">' +
                '<button style="padding:7px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:7px;font-size:11px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">⊞ Grid</button>' +
                '<button style="padding:7px 12px;background:#1a1a1a;border:1px solid #1a1a1a;border-radius:7px;font-size:11px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">☰ List</button>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;">' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#B90E0A,#7a0806);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px;">MS</div>' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;">Maria Santos</div>' +
                '<div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:2px;">Sr. Sales Associate</div>' +
                '<div style="font-size:11px;color:#aaa;margin-top:2px;">SM Mall of Asia</div>' +
                '<div style="display:flex;justify-content:center;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid #f3f4f6;">' +
                '<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Active</span>' +
                '<span style="background:#f3f4f6;color:#555;padding:2px 8px;border-radius:20px;font-size:10px;">Full-time</span>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#0f2040);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px;">JC</div>' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;">Juan dela Cruz</div>' +
                '<div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:2px;">Branch Manager</div>' +
                '<div style="font-size:11px;color:#aaa;margin-top:2px;">BGC High Street</div>' +
                '<div style="display:flex;justify-content:center;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid #f3f4f6;">' +
                '<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Active</span>' +
                '<span style="background:#f3f4f6;color:#555;padding:2px 8px;border-radius:20px;font-size:10px;">Full-time</span>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#064e3b,#022c22);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px;">AR</div>' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;">Ana Reyes</div>' +
                '<div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:2px;">Visual Merchandiser</div>' +
                '<div style="font-size:11px;color:#aaa;margin-top:2px;">Cebu IT Park</div>' +
                '<div style="display:flex;justify-content:center;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid #f3f4f6;">' +
                '<span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">On Leave</span>' +
                '<span style="background:#f3f4f6;color:#555;padding:2px 8px;border-radius:20px;font-size:10px;">Full-time</span>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);text-align:center;">' +
                '<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#4c1d95,#2e1065);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:18px;">PG</div>' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;">Pedro Gomez</div>' +
                '<div style="font-size:11px;color:#B90E0A;font-weight:600;margin-top:2px;">Stock Clerk</div>' +
                '<div style="font-size:11px;color:#aaa;margin-top:2px;">Davao Abreeza</div>' +
                '<div style="display:flex;justify-content:center;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid #f3f4f6;">' +
                '<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Active</span>' +
                '<span style="background:#f3f4f6;color:#555;padding:2px 8px;border-radius:20px;font-size:10px;">Part-time</span>' +
                '</div></div>' +
                '</div>' +
                '<div style="text-align:center;margin-top:20px;">' +
                '<button style="padding:10px 28px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:500;">Load more employees...</button>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-dash-payroll-dark',
            label: 'HR: Payroll Command Center',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#0a0a0a;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#fff;">' +
                // Topbar
                '<div style="background:#111;border-bottom:2px solid #B90E0A;padding:0 32px;height:58px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:14px;">' +
                '<div style="width:38px;height:38px;background:#B90E0A;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:16px;letter-spacing:1px;">B</span></div>' +
                '<div><div style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Bench Apparel</div><div style="font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase;">Payroll Module</div></div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:20px;">' +
                '<div style="display:flex;gap:24px;">' +
                '<span style="font-size:12px;color:#444;cursor:pointer;letter-spacing:1px;">DASHBOARD</span>' +
                '<span style="font-size:12px;color:#B90E0A;cursor:pointer;letter-spacing:1px;border-bottom:1px solid #B90E0A;padding-bottom:2px;">PAYROLL</span>' +
                '<span style="font-size:12px;color:#444;cursor:pointer;letter-spacing:1px;">REPORTS</span>' +
                '<span style="font-size:12px;color:#444;cursor:pointer;letter-spacing:1px;">SETTINGS</span>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:8px;background:#1a1a1a;border:1px solid #2a2a2a;padding:6px 14px;">' +
                '<div style="width:28px;height:28px;background:#B90E0A;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">B</div>' +
                '<span style="font-size:12px;color:#888;">Bernard M.</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                // Body
                '<div style="padding:32px;">' +
                // Page header
                '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;">' +
                '<div>' +
                '<div style="font-size:10px;color:#B90E0A;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px;">March 2026 · Period 1 of 2</div>' +
                '<div style="font-size:32px;font-weight:900;letter-spacing:-1px;">Payroll Dashboard</div>' +
                '</div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="padding:9px 18px;background:transparent;border:1px solid #2a2a2a;color:#888;font-size:12px;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;">EXPORT PDF</button>' +
                '<button style="padding:9px 18px;background:#B90E0A;border:none;color:#fff;font-size:12px;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:700;letter-spacing:1px;">▶ GENERATE PAYROLL</button>' +
                '</div>' +
                '</div>' +
                // KPI Row
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-bottom:2px;">' +
                '<div style="background:#111;border-top:3px solid #B90E0A;padding:24px;">' +
                '<div style="font-size:10px;color:#B90E0A;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;">Total Payroll</div>' +
                '<div style="font-size:36px;font-weight:900;letter-spacing:-1px;">₱2.4M</div>' +
                '<div style="font-size:11px;color:#444;margin-top:6px;">↑ 4.2% vs last period</div>' +
                '</div>' +
                '<div style="background:#111;border-top:3px solid #2a2a2a;padding:24px;">' +
                '<div style="font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;">Employees Paid</div>' +
                '<div style="font-size:36px;font-weight:900;letter-spacing:-1px;">148</div>' +
                '<div style="font-size:11px;color:#444;margin-top:6px;">of 152 active</div>' +
                '</div>' +
                '<div style="background:#111;border-top:3px solid #2a2a2a;padding:24px;">' +
                '<div style="font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;">Pending Payslips</div>' +
                '<div style="font-size:36px;font-weight:900;letter-spacing:-1px;color:#B90E0A;">4</div>' +
                '<div style="font-size:11px;color:#444;margin-top:6px;">Needs approval</div>' +
                '</div>' +
                '<div style="background:#111;border-top:3px solid #2a2a2a;padding:24px;">' +
                '<div style="font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;">Avg Net Pay</div>' +
                '<div style="font-size:36px;font-weight:900;letter-spacing:-1px;">₱16.2K</div>' +
                '<div style="font-size:11px;color:#22c55e;margin-top:6px;">↑ 1.1% growth</div>' +
                '</div>' +
                '</div>' +
                // Main grid
                '<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:2px;margin-bottom:2px;">' +
                // Payroll records table
                '<div style="background:#111;">' +
                '<div style="padding:18px 22px;border-bottom:1px solid #1f1f1f;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Payroll Records</span>' +
                '<span style="font-size:11px;color:#B90E0A;cursor:pointer;letter-spacing:1px;">VIEW ALL</span>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="border-bottom:1px solid #1a1a1a;"><th style="padding:10px 22px;text-align:left;color:#444;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Employee</th><th style="padding:10px;text-align:left;color:#444;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Gross</th><th style="padding:10px;text-align:left;color:#444;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Deductions</th><th style="padding:10px;text-align:left;color:#444;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Net Pay</th><th style="padding:10px;text-align:left;color:#444;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Status</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:14px 22px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;background:#B90E0A;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">JC</div><div><div style="font-weight:600;font-size:12px;">Juan dela Cruz</div><div style="color:#444;font-size:10px;margin-top:1px;">Sales · SM MOA</div></div></div></td><td style="padding:14px 10px;color:#888;font-size:12px;">₱22,000</td><td style="padding:14px 10px;color:#ef4444;font-size:12px;">₱3,550</td><td style="padding:14px 10px;font-weight:700;font-size:13px;">₱18,450</td><td style="padding:14px 10px;"><span style="background:#22c55e20;color:#22c55e;font-size:10px;padding:3px 8px;letter-spacing:1px;font-weight:700;">PAID</span></td></tr>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:14px 22px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;background:#1f3a5f;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">MS</div><div><div style="font-weight:600;font-size:12px;">Maria Santos</div><div style="color:#444;font-size:10px;margin-top:1px;">HR Officer · Head Office</div></div></div></td><td style="padding:14px 10px;color:#888;font-size:12px;">₱26,500</td><td style="padding:14px 10px;color:#ef4444;font-size:12px;">₱4,400</td><td style="padding:14px 10px;font-weight:700;font-size:13px;">₱22,100</td><td style="padding:14px 10px;"><span style="background:#22c55e20;color:#22c55e;font-size:10px;padding:3px 8px;letter-spacing:1px;font-weight:700;">PAID</span></td></tr>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:14px 22px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;background:#2a2a2a;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">PR</div><div><div style="font-weight:600;font-size:12px;">Pedro Reyes</div><div style="color:#444;font-size:10px;margin-top:1px;">Warehouse · BGC</div></div></div></td><td style="padding:14px 10px;color:#888;font-size:12px;">₱18,000</td><td style="padding:14px 10px;color:#ef4444;font-size:12px;">₱3,200</td><td style="padding:14px 10px;font-weight:700;font-size:13px;">₱14,800</td><td style="padding:14px 10px;"><span style="background:#B90E0A20;color:#B90E0A;font-size:10px;padding:3px 8px;letter-spacing:1px;font-weight:700;">PENDING</span></td></tr>' +
                '<tr><td style="padding:14px 22px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;background:#1a3a2a;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">AL</div><div><div style="font-weight:600;font-size:12px;">Ana Lim</div><div style="color:#444;font-size:10px;margin-top:1px;">Supervisor · Glorietta</div></div></div></td><td style="padding:14px 10px;color:#888;font-size:12px;">₱33,000</td><td style="padding:14px 10px;color:#ef4444;font-size:12px;">₱4,700</td><td style="padding:14px 10px;font-weight:700;font-size:13px;">₱28,300</td><td style="padding:14px 10px;"><span style="background:#22c55e20;color:#22c55e;font-size:10px;padding:3px 8px;letter-spacing:1px;font-weight:700;">PAID</span></td></tr>' +
                '</tbody></table></div>' +
                // Deductions panel
                '<div style="background:#111;padding:22px;">' +
                '<div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:18px;color:#fff;border-bottom:1px solid #1f1f1f;padding-bottom:12px;">Deductions Breakdown</div>' +
                '<div style="display:flex;flex-direction:column;gap:14px;">' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#666;">SSS</span><span style="font-weight:700;color:#fff;">₱38,400</span></div><div style="background:#1a1a1a;height:4px;"><div style="background:#B90E0A;height:4px;width:75%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#666;">PhilHealth</span><span style="font-weight:700;color:#fff;">₱22,800</span></div><div style="background:#1a1a1a;height:4px;"><div style="background:#B90E0A;height:4px;width:45%;opacity:0.8;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#666;">Pag-IBIG</span><span style="font-weight:700;color:#fff;">₱14,800</span></div><div style="background:#1a1a1a;height:4px;"><div style="background:#B90E0A;height:4px;width:30%;opacity:0.7;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#666;">Withholding Tax</span><span style="font-weight:700;color:#fff;">₱55,200</span></div><div style="background:#1a1a1a;height:4px;"><div style="background:#B90E0A;height:4px;width:90%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;"><span style="color:#666;">Loan Deductions</span><span style="font-weight:700;color:#fff;">₱18,600</span></div><div style="background:#1a1a1a;height:4px;"><div style="background:#B90E0A;height:4px;width:38%;opacity:0.6;"></div></div></div>' +
                '</div>' +
                '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #1a1a1a;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;">Total Deductions</span>' +
                '<span style="font-size:20px;font-weight:900;color:#ef4444;">₱149,800</span>' +
                '</div>' +
                '<button style="width:100%;margin-top:16px;padding:12px;background:#B90E0A;border:none;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:2px;text-transform:uppercase;">Export Payslips PDF</button>' +
                '</div>' +
                '</div>' +
                // Bottom row
                '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-top:2px;">' +
                '<div style="background:#111;padding:20px;">' +
                '<div style="font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;">Attendance This Period</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;border-bottom:1px solid #161616;"><span style="color:#666;">Days Present</span><span style="font-weight:700;">1,628</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;border-bottom:1px solid #161616;"><span style="color:#666;">Days Absent</span><span style="font-weight:700;color:#ef4444;">44</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;border-bottom:1px solid #161616;"><span style="color:#666;">OT Hours</span><span style="font-weight:700;color:#22c55e;">386 hrs</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;"><span style="color:#666;">Late Instances</span><span style="font-weight:700;color:#f59e0b;">22</span></div>' +
                '</div></div>' +
                '<div style="background:#111;padding:20px;">' +
                '<div style="font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;">Active Loans</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;border-bottom:1px solid #161616;"><span style="color:#666;">SSS Loans</span><span style="font-weight:700;">12 employees</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;border-bottom:1px solid #161616;"><span style="color:#666;">Cash Advance</span><span style="font-weight:700;">8 employees</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;border-bottom:1px solid #161616;"><span style="color:#666;">Pag-IBIG Loan</span><span style="font-weight:700;">5 employees</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;"><span style="color:#666;">Total Balance</span><span style="font-weight:700;color:#B90E0A;">₱284,000</span></div>' +
                '</div></div>' +
                '<div style="background:#111;padding:20px;">' +
                '<div style="font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;">Quick Actions</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<button style="padding:12px;background:#B90E0A;border:none;color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:2px;text-align:left;">▶ GENERATE PAYROLL RUN</button>' +
                '<button style="padding:12px;background:#1a1a1a;border:1px solid #2a2a2a;color:#888;font-size:11px;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;text-align:left;">📄 EXPORT PAYSLIPS</button>' +
                '<button style="padding:12px;background:#1a1a1a;border:1px solid #2a2a2a;color:#888;font-size:11px;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;text-align:left;">🏛 GOV. REMITTANCE</button>' +
                '<button style="padding:12px;background:#1a1a1a;border:1px solid #2a2a2a;color:#888;font-size:11px;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;letter-spacing:1px;text-align:left;">🎁 13TH MONTH PAY</button>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },
 
        {
            id: 'hr-dash-training',
            label: 'HR: Training & Compliance',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#f8fafc;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:58px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#B90E0A;border-radius:9px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:15px;">B</span></div><div><div style="font-size:14px;font-weight:700;color:#1a1a1a;">Bench Apparel</div><div style="font-size:10px;color:#aaa;letter-spacing:1px;text-transform:uppercase;">Training &amp; Compliance</div></div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="padding:8px 16px;background:#fff;border:1px solid #e5e7eb;border-radius:7px;font-size:12px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Export Report</button>' +
                '<button style="padding:8px 16px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">+ Add Training</button>' +
                '</div>' +
                '</div>' +
                '<div style="padding:28px;">' +
                '<div style="margin-bottom:24px;"><h1 style="font-size:22px;font-weight:800;color:#1a1a1a;margin:0 0 4px;">Training Dashboard</h1><p style="font-size:13px;color:#888;margin:0;">Q1 2026 &mdash; All Branches</p></div>' +
                '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:24px;">' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-top:3px solid #3b82f6;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Total Courses</div>' +
                '<div style="font-size:26px;font-weight:800;color:#1a1a1a;">24</div>' +
                '<div style="font-size:11px;color:#3b82f6;margin-top:4px;">8 mandatory</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-top:3px solid #22c55e;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Completed</div>' +
                '<div style="font-size:26px;font-weight:800;color:#1a1a1a;">892</div>' +
                '<div style="font-size:11px;color:#22c55e;margin-top:4px;">This quarter</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-top:3px solid #f59e0b;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">In Progress</div>' +
                '<div style="font-size:26px;font-weight:800;color:#1a1a1a;">148</div>' +
                '<div style="font-size:11px;color:#f59e0b;margin-top:4px;">Currently enrolled</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-top:3px solid #B90E0A;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Expiring Soon</div>' +
                '<div style="font-size:26px;font-weight:800;color:#B90E0A;">23</div>' +
                '<div style="font-size:11px;color:#B90E0A;margin-top:4px;">Within 30 days</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-top:3px solid #8b5cf6;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Compliance Rate</div>' +
                '<div style="font-size:26px;font-weight:800;color:#1a1a1a;">91%</div>' +
                '<div style="font-size:11px;color:#22c55e;margin-top:4px;">+3% vs Q4</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:16px;">' +
                '<div style="background:#fff;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">' +
                '<div style="padding:18px 20px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:14px;font-weight:700;color:#1a1a1a;">Training Records</span>' +
                '<span style="font-size:12px;color:#B90E0A;cursor:pointer;font-weight:500;">View all</span>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="background:#f9fafb;"><th style="padding:10px 20px;text-align:left;color:#9ca3af;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Employee</th><th style="padding:10px;text-align:left;color:#9ca3af;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Course</th><th style="padding:10px;text-align:left;color:#9ca3af;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Score</th><th style="padding:10px;text-align:left;color:#9ca3af;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Expires</th><th style="padding:10px;text-align:left;color:#9ca3af;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Status</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #f9fafb;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#B90E0A;">MS</div><div style="font-weight:600;color:#1a1a1a;">Maria Santos</div></div></td><td style="padding:12px 10px;color:#555;font-size:12px;">Customer Service</td><td style="padding:12px 10px;font-weight:700;color:#22c55e;">98%</td><td style="padding:12px 10px;color:#555;">Dec 2026</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Completed</span></td></tr>' +
                '<tr style="border-bottom:1px solid #f9fafb;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#2563eb;">JC</div><div style="font-weight:600;color:#1a1a1a;">Jose Cruz</div></div></td><td style="padding:12px 10px;color:#555;font-size:12px;">Brand Standards</td><td style="padding:12px 10px;font-weight:700;color:#f59e0b;">72%</td><td style="padding:12px 10px;color:#555;">Mar 2026</td><td style="padding:12px 10px;"><span style="background:#fef9c3;color:#ca8a04;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Expiring</span></td></tr>' +
                '<tr style="border-bottom:1px solid #f9fafb;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#16a34a;">AR</div><div style="font-weight:600;color:#1a1a1a;">Ana Reyes</div></div></td><td style="padding:12px 10px;color:#555;font-size:12px;">Inventory Handling</td><td style="padding:12px 10px;font-weight:700;color:#22c55e;">95%</td><td style="padding:12px 10px;color:#555;">Jun 2026</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Completed</span></td></tr>' +
                '<tr><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:#fdf4ff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#9333ea;">PG</div><div style="font-weight:600;color:#1a1a1a;">Pedro Gomez</div></div></td><td style="padding:12px 10px;color:#555;font-size:12px;">Safety Compliance</td><td style="padding:12px 10px;color:#aaa;">—</td><td style="padding:12px 10px;color:#aaa;">—</td><td style="padding:12px 10px;"><span style="background:#fee2e2;color:#B90E0A;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;">Not Started</span></td></tr>' +
                '</tbody></table></div>' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">Course Completion Rate</div>' +
                '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Customer Service Training</span><span style="font-weight:700;color:#1a1a1a;">94%</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#22c55e;height:7px;border-radius:99px;width:94%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Brand Standards</span><span style="font-weight:700;color:#1a1a1a;">88%</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#3b82f6;height:7px;border-radius:99px;width:88%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Inventory Handling</span><span style="font-weight:700;color:#1a1a1a;">76%</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#f59e0b;height:7px;border-radius:99px;width:76%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Safety Compliance</span><span style="font-weight:700;color:#B90E0A;">61%</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#B90E0A;height:7px;border-radius:99px;width:61%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Anti-Harassment Policy</span><span style="font-weight:700;color:#1a1a1a;">99%</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#22c55e;height:7px;border-radius:99px;width:99%;"></div></div></div>' +
                '</div>' +
                '<div style="margin-top:20px;background:#fee2e2;border-radius:10px;padding:14px;">' +
                '<div style="font-size:11px;font-weight:700;color:#B90E0A;margin-bottom:4px;">⚠ Action Required</div>' +
                '<div style="font-size:12px;color:#7f1d1d;">23 certifications expiring within 30 days. Schedule re-training immediately.</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },
 
        {
    id: 'luxury-carousel',
    label: 'Carousel: New Arrivals',
    category: 'Components',
    content: (function () {
 
        var head =
            '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>' +
            '<script src="https://cdn.tailwindcss.com"><\/script>' +
            '<style>' +
            '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }' +
            'body { font-family: "Montserrat", sans-serif; background: #F5F0E8; }' +
            ':root {' +
            '  --cream: #F5F0E8;' +
            '  --cream-dk: #E8E0D0;' +
            '  --ink: #1A1614;' +
            '  --ink-m: #7A7068;' +
            '  --red: #B90E0A;' +
            '  --gold: #C4A55A;' +
            '}' +
            '.lc-btn { transition: background 0.25s, border-color 0.25s, color 0.25s; }' +
            '.lc-btn:hover { background: var(--ink) !important; border-color: var(--ink) !important; color: var(--cream) !important; }' +
            '.lc-btn:hover svg { stroke: var(--cream) !important; }' +
            '.lc-card { transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.35s ease; cursor: pointer; }' +
            '.lc-card.hovered { transform: scale(1.055) translateY(-12px) !important; z-index: 10; position: relative; }' +
            '.lc-card.dimmed  { opacity: 0.5 !important; }' +
            '.lc-overlay { opacity: 0; transition: opacity 0.3s ease; }' +
            '.lc-card:hover .lc-overlay { opacity: 1 !important; }' +
            '.lc-dot { transition: all 0.4s cubic-bezier(0.87,0,0.13,1); cursor: pointer; border: none; padding: 0; }' +
            '.lc-add-btn:hover { opacity: 0.7; }' +
            '.lc-wish-btn:hover { border-color: rgba(255,255,255,0.9) !important; }' +
            '@keyframes timerFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }' +
            '</style>';
 
        // ── Card data ──────────────────────────────────────────
        var CARDS = [
            { no: '01', col: 'STREETWEAR',  name: 'Premium Hoodie',  price: '₱1,299', shade: '#D8D3CC' },
            { no: '02', col: 'ESSENTIALS',  name: 'Classic Tee',     price: '₱599',   shade: '#C8C3BC' },
            { no: '03', col: 'OUTERWEAR',   name: 'Denim Jacket',    price: '₱2,499', shade: '#B8B3AC' },
            { no: '04', col: 'BOTTOMS',     name: 'Cargo Pants',     price: '₱1,799', shade: '#A8A39C' },
            { no: '05', col: 'ESSENTIALS',  name: 'Polo Shirt',      price: '₱699',   shade: '#C0BBB4' },
            { no: '06', col: 'OUTERWEAR',   name: 'Bomber Jacket',   price: '₱2,999', shade: '#B0ABA4' },
            { no: '07', col: 'BOTTOMS',     name: 'Chino Shorts',    price: '₱849',   shade: '#CCCAB8' },
            { no: '08', col: 'STREETWEAR',  name: 'Graphic Tee',     price: '₱699',   shade: '#BDB9A8' },
        ];
 
        // Wishlist SVG reused
        var wishSvg =
            '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="display:block;">' +
            '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
 
        // Prev arrow SVG
        var prevSvg =
            '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="display:block;">' +
            '<path d="M19 12H5M10 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
 
        // Next arrow SVG
        var nextSvg =
            '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="display:block;">' +
            '<path d="M5 12h14M14 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
 
        // ── Build card HTML ─────────────────────────────────────
        function buildCard(c, i) {
            return '<div class="lc-card" data-ci="' + i + '" style="flex-shrink:0;width:calc(100%/4);padding:0 8px;">' +
 
                // Image area
                '<div style="position:relative;aspect-ratio:3/4;background:' + c.shade + ';overflow:hidden;margin-bottom:16px;">' +
 
                // Number tag
                '<span style="position:absolute;top:14px;left:14px;font-size:11px;font-weight:500;letter-spacing:0.18em;color:var(--ink);opacity:0.38;z-index:1;">' + c.no + '</span>' +
 
                // Hover overlay
                '<div class="lc-overlay" style="position:absolute;inset:0;background:rgba(26,22,20,0.42);display:flex;align-items:flex-end;justify-content:space-between;padding:20px;z-index:2;">' +
                '<button class="lc-add-btn" style="font-size:10px;font-weight:600;letter-spacing:0.16em;padding:10px 18px;background:var(--cream);color:var(--ink);border:none;cursor:pointer;">ADD TO BAG</button>' +
                '<button class="lc-wish-btn" style="width:38px;height:38px;border:1px solid rgba(255,255,255,0.4);background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;flex-shrink:0;">' + wishSvg + '</button>' +
                '</div>' +
 
                '</div>' +
 
                // Info row
                '<div style="display:flex;align-items:flex-start;justify-content:space-between;padding:0 4px;gap:8px;">' +
                '<div>' +
                '<p style="font-size:9px;letter-spacing:0.2em;color:var(--ink-m);margin:0 0 4px;">' + c.col + '</p>' +
                '<h4 style="font-size:13px;font-weight:500;color:var(--ink);margin:0;">' + c.name + '</h4>' +
                '</div>' +
                '<p style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:16px;color:var(--red);margin:0;flex-shrink:0;margin-top:2px;">' + c.price + '</p>' +
                '</div>' +
 
                '</div>';
        }
 
        // ── Build all cards × 3 for infinite loop ──────────────
        var allCardsHtml = '';
        // Copy 1 (left buffer)
        for (var i = 0; i < CARDS.length; i++) allCardsHtml += buildCard(CARDS[i], i);
        // Copy 2 (main visible set)
        for (var i = 0; i < CARDS.length; i++) allCardsHtml += buildCard(CARDS[i], i);
        // Copy 3 (right buffer)
        for (var i = 0; i < CARDS.length; i++) allCardsHtml += buildCard(CARDS[i], i);
 
        var total = CARDS.length;  // 8
 
        // ── Wrapper HTML ───────────────────────────────────────
        var carousel =
            '<div id="lc-root" style="background:var(--cream);padding:48px 0 32px;overflow:hidden;position:relative;">' +
 
            // ── Header ──
            '<div style="padding:0 40px;margin-bottom:28px;display:flex;align-items:flex-end;justify-content:space-between;">' +
 
            // Left: label + title + arrows
            '<div>' +
            '<p style="font-size:10px;letter-spacing:0.25em;color:var(--ink-m);margin:0 0 8px;">— LATEST DROPS</p>' +
            '<div style="display:flex;align-items:center;gap:20px;">' +
            '<h2 style="font-family:\'Bebas Neue\',sans-serif;font-size:clamp(2rem,4vw,3.2rem);letter-spacing:0.05em;color:var(--ink);margin:0;line-height:1;">NEW ARRIVALS</h2>' +
 
            // Arrows — beside the title
            '<div style="display:flex;align-items:center;gap:8px;">' +
            '<button id="lc-prev" class="lc-btn" style="width:40px;height:40px;border:1px solid rgba(26,22,20,0.22);background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink);">' + prevSvg + '</button>' +
            '<button id="lc-next" class="lc-btn" style="width:40px;height:40px;border:1px solid rgba(26,22,20,0.22);background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink);">' + nextSvg + '</button>' +
            '</div>' +
 
            '</div>' +
            '</div>' +
 
            // Right: paused + counter
            '<div style="display:flex;align-items:center;gap:16px;padding-bottom:4px;">' +
            '<span id="lc-paused" style="font-size:10px;letter-spacing:0.18em;color:var(--ink-m);display:none;">PAUSED</span>' +
            '<span id="lc-counter" style="font-size:11px;letter-spacing:0.2em;color:var(--ink-m);font-variant-numeric:tabular-nums;">01 / 08</span>' +
            '</div>' +
 
            '</div>' +
 
            // ── Carousel viewport ──
            '<div style="overflow:hidden;padding:0 40px;position:relative;">' +
            '<div id="lc-track" style="display:flex;will-change:transform;">' +
            allCardsHtml +
            '</div>' +
            '</div>' +
 
            // ── Footer: progress + dots ──
            '<div style="display:flex;align-items:center;gap:20px;padding:24px 40px 0;">' +
            '<div style="flex:1;max-width:360px;height:1px;background:rgba(26,22,20,0.1);overflow:hidden;">' +
            '<div id="lc-progress" style="height:100%;background:var(--ink);width:0%;transition:width 0.85s cubic-bezier(0.87,0,0.13,1);"></div>' +
            '</div>' +
            '<div id="lc-dots" style="display:flex;align-items:center;gap:6px;"></div>' +
            '</div>' +
 
            // ── Timer bar ──
            '<div style="margin:16px 40px 0;height:1px;background:rgba(26,22,20,0.07);overflow:hidden;">' +
            '<div id="lc-timer" style="height:100%;width:100%;background:var(--red);opacity:0.7;transform:scaleX(0);transform-origin:left center;"></div>' +
            '</div>' +
 
            '</div>'; // /#lc-root
 
        // ── Carousel script ────────────────────────────────────
        var script =
            '<script>' +
            '(function(){' +
 
            'var DELAY   = 4000;' +
            'var VISIBLE = 4;' +
            'var TOTAL   = 8;' +
            'var current = TOTAL;' +   // start at middle copy
            'var paused  = false;' +
            'var timer   = null;' +
            'var raf     = null;' +
            'var timerAnim = null;' +
 
            'var track    = document.getElementById("lc-track");' +
            'var progress = document.getElementById("lc-progress");' +
            'var dotsEl   = document.getElementById("lc-dots");' +
            'var counter  = document.getElementById("lc-counter");' +
            'var pausedEl = document.getElementById("lc-paused");' +
            'var timerEl  = document.getElementById("lc-timer");' +
            'var prevBtn  = document.getElementById("lc-prev");' +
            'var nextBtn  = document.getElementById("lc-next");' +
 
            'function cardW(){ return track.parentElement.offsetWidth / VISIBLE; }' +
 
            // ── easeInOutCubic ──
            'function ease(t){ return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; }' +
 
            // ── slideTo ──
            'function slideTo(idx, instant){' +
            '  var cw = cardW();' +
            '  var target = -(idx * cw);' +
            '  if(raf){ cancelAnimationFrame(raf); raf=null; }' +
            '  if(instant){' +
            '    track.style.transform = "translateX("+target+"px)";' +
            '    afterSlide(idx); return;' +
            '  }' +
            '  var startX = getCurrentX();' +
            '  var dist   = target - startX;' +
            '  var dur    = 850;' +
            '  var startT = null;' +
            '  function step(ts){' +
            '    if(!startT) startT = ts;' +
            '    var p = Math.min((ts-startT)/dur, 1);' +
            '    track.style.transform = "translateX("+(startX + dist*ease(p))+"px)";' +
            '    if(p < 1){ raf = requestAnimationFrame(step); }' +
            '    else { afterSlide(idx); }' +
            '  }' +
            '  raf = requestAnimationFrame(step);' +
            '}' +
 
            'function getCurrentX(){' +
            '  var t = track.style.transform;' +
            '  var m = t.match(/translateX\\(([^)]+)px\\)/);' +
            '  return m ? parseFloat(m[1]) : 0;' +
            '}' +
 
            // ── afterSlide: seamless jump ──
            'function afterSlide(idx){' +
            '  var next = idx;' +
            '  if(idx >= TOTAL*2) next = idx - TOTAL;' +
            '  if(idx < TOTAL)    next = idx + TOTAL;' +
            '  if(next !== idx){' +
            '    track.style.transform = "translateX("+-(next*cardW())+"px)";' +
            '    current = next;' +
            '  }' +
            '  updateUI();' +
            '}' +
 
            // ── updateUI ──
            'function updateUI(){' +
            '  var dot = ((current % TOTAL) + TOTAL) % TOTAL;' +
            '  var pct = ((dot+1)/TOTAL)*100;' +
            '  if(progress) progress.style.width = pct + "%";' +
            '  if(counter)  counter.textContent  = pad(dot+1)+" / "+pad(TOTAL);' +
            '  if(pausedEl) pausedEl.style.display = paused ? "inline" : "none";' +
            '  buildDots(dot);' +
            '}' +
 
            'function pad(n){ return n < 10 ? "0"+n : ""+n; }' +
 
            // ── dots ──
            'function buildDots(active){' +
            '  if(!dotsEl) return;' +
            '  dotsEl.innerHTML = "";' +
            '  for(var i=0;i<TOTAL;i++){' +
            '    var d = document.createElement("button");' +
            '    d.className = "lc-dot";' +
            '    d.style.height = "6px";' +
            '    d.style.borderRadius = "3px";' +
            '    d.style.background = i===active ? "var(--ink)" : "rgba(26,22,20,0.2)";' +
            '    d.style.width = i===active ? "22px" : "6px";' +
            '    (function(idx){ d.addEventListener("click", function(){ jumpTo(idx); }); })(i);' +
            '    dotsEl.appendChild(d);' +
            '  }' +
            '}' +
 
            // ── timer bar ──
            'function startTimer(){' +
            '  if(!timerEl) return;' +
            '  timerEl.style.transition = "none";' +
            '  timerEl.style.transform  = "scaleX(0)";' +
            '  if(timerAnim){ clearTimeout(timerAnim); }' +
            '  if(paused) return;' +
            '  void timerEl.offsetWidth;' +
            '  timerEl.style.transition = "transform "+DELAY+"ms linear";' +
            '  timerEl.style.transform  = "scaleX(1)";' +
            '}' +
 
            // ── auto-advance ──
            'function schedule(){' +
            '  clearTimeout(timer);' +
            '  timer = setTimeout(function(){' +
            '    if(!paused){' +
            '      current++;' +
            '      slideTo(current);' +
            '      schedule();' +
            '      startTimer();' +
            '    }' +
            '  }, DELAY);' +
            '}' +
 
            'function jumpTo(i){' +
            '  current = TOTAL + i;' +
            '  slideTo(current);' +
            '  clearTimeout(timer);' +
            '  schedule();' +
            '  startTimer();' +
            '}' +
 
            // ── arrows ──
            'prevBtn.addEventListener("click", function(){' +
            '  current--;' +
            '  slideTo(current);' +
            '  clearTimeout(timer); schedule(); startTimer();' +
            '});' +
            'nextBtn.addEventListener("click", function(){' +
            '  current++;' +
            '  slideTo(current);' +
            '  clearTimeout(timer); schedule(); startTimer();' +
            '});' +
 
            // ── hover ──
            'var cards = track.querySelectorAll(".lc-card");' +
            'cards.forEach(function(card){' +
            '  card.addEventListener("mouseenter", function(){' +
            '    paused = true;' +
            '    clearTimeout(timer);' +
            '    startTimer();' +
            '    card.classList.add("hovered");' +
            '    cards.forEach(function(c){ if(c !== card) c.classList.add("dimmed"); });' +
            '    updateUI();' +
            '  });' +
            '  card.addEventListener("mouseleave", function(){' +
            '    paused = false;' +
            '    card.classList.remove("hovered");' +
            '    cards.forEach(function(c){ c.classList.remove("dimmed"); });' +
            '    updateUI();' +
            '    schedule();' +
            '    startTimer();' +
            '  });' +
            '});' +
 
            // ── resize ──
            'window.addEventListener("resize", function(){ slideTo(current, true); });' +
 
            // ── init ──
            'slideTo(current, true);' +
            'schedule();' +
            'startTimer();' +
            'updateUI();' +
 
            '})();' +
            '<\/script>';
 
        return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>' +
            head +
            '</head><body style="margin:0;padding:0;">' +
            carousel +
            script +
            '</body></html>';
 
    })()
},
        {
            id: 'hr-dash-branch',
            label: 'HR: Branch & Rotation Management',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#0d0d0d;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#fff;">' +
                '<div style="background:#111;border-bottom:1px solid #1f1f1f;padding:0 28px;height:58px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#B90E0A;border-radius:9px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:15px;">B</span></div><div><div style="font-size:14px;font-weight:700;">Bench Apparel</div><div style="font-size:10px;color:#555;letter-spacing:1px;text-transform:uppercase;">Branch &amp; Rotation</div></div></div>' +
                '<button style="padding:8px 16px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">+ Assign Employee</button>' +
                '</div>' +
                '<div style="padding:28px;">' +
                '<div style="margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end;">' +
                '<div><h1 style="font-size:22px;font-weight:800;margin:0 0 4px;">Branch Management</h1><p style="font-size:13px;color:#555;margin:0;">All store locations &mdash; March 2026</p></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px;"><div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Total Branches</div><div style="font-size:26px;font-weight:800;">18</div><div style="font-size:11px;color:#3b82f6;margin-top:4px;">Nationwide</div></div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px;"><div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Total Assigned</div><div style="font-size:26px;font-weight:800;">1,240</div><div style="font-size:11px;color:#22c55e;margin-top:4px;">All branches</div></div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px;"><div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Rotations This Month</div><div style="font-size:26px;font-weight:800;color:#f59e0b;">14</div><div style="font-size:11px;color:#f59e0b;margin-top:4px;">Transfers pending: 3</div></div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:18px;"><div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Understaffed</div><div style="font-size:26px;font-weight:800;color:#B90E0A;">3</div><div style="font-size:11px;color:#B90E0A;margin-top:4px;">Below minimum</div></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:16px;">' +
                '<div style="background:#111;border:1px solid #1f1f1f;border-radius:14px;overflow:hidden;">' +
                '<div style="padding:18px 22px;border-bottom:1px solid #1f1f1f;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:14px;font-weight:700;">Branch Headcount</span><span style="font-size:11px;color:#555;">March 2026</span></div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="border-bottom:1px solid #1a1a1a;"><th style="padding:10px 22px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Branch</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Manager</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Staff</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Status</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:13px 22px;"><div style="font-weight:600;font-size:12px;">SM Mall of Asia</div><div style="font-size:10px;color:#555;margin-top:1px;">Pasay City, NCR</div></td><td style="padding:13px 10px;color:#888;font-size:12px;">Juan dela Cruz</td><td style="padding:13px 10px;font-weight:700;">342</td><td style="padding:13px 10px;"><span style="background:#22c55e20;color:#22c55e;font-size:10px;padding:2px 8px;font-weight:700;">Fully Staffed</span></td></tr>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:13px 22px;"><div style="font-weight:600;font-size:12px;">BGC High Street</div><div style="font-size:10px;color:#555;margin-top:1px;">Taguig City, NCR</div></td><td style="padding:13px 10px;color:#888;font-size:12px;">Ana Lim</td><td style="padding:13px 10px;font-weight:700;">298</td><td style="padding:13px 10px;"><span style="background:#22c55e20;color:#22c55e;font-size:10px;padding:2px 8px;font-weight:700;">Fully Staffed</span></td></tr>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:13px 22px;"><div style="font-weight:600;font-size:12px;">Cebu IT Park</div><div style="font-size:10px;color:#555;margin-top:1px;">Cebu City</div></td><td style="padding:13px 10px;color:#888;font-size:12px;">Maria Santos</td><td style="padding:13px 10px;font-weight:700;">210</td><td style="padding:13px 10px;"><span style="background:#f59e0b20;color:#f59e0b;font-size:10px;padding:2px 8px;font-weight:700;">Under Review</span></td></tr>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:13px 22px;"><div style="font-weight:600;font-size:12px;">Davao Abreeza</div><div style="font-size:10px;color:#555;margin-top:1px;">Davao City</div></td><td style="padding:13px 10px;color:#888;font-size:12px;">Pedro Gomez</td><td style="padding:13px 10px;font-weight:700;">188</td><td style="padding:13px 10px;"><span style="background:#22c55e20;color:#22c55e;font-size:10px;padding:2px 8px;font-weight:700;">Fully Staffed</span></td></tr>' +
                '<tr><td style="padding:13px 22px;"><div style="font-weight:600;font-size:12px;">Glorietta 4</div><div style="font-size:10px;color:#555;margin-top:1px;">Makati City, NCR</div></td><td style="padding:13px 10px;color:#888;font-size:12px;">—</td><td style="padding:13px 10px;font-weight:700;color:#B90E0A;">12</td><td style="padding:13px 10px;"><span style="background:#B90E0A20;color:#B90E0A;font-size:10px;padding:2px 8px;font-weight:700;">Understaffed</span></td></tr>' +
                '</tbody></table></div>' +
                '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<div style="background:#111;border:1px solid #1f1f1f;border-radius:14px;padding:20px;">' +
                '<div style="font-size:13px;font-weight:700;margin-bottom:14px;">Pending Rotations</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="background:#1a1a1a;border-radius:10px;padding:12px;"><div style="display:flex;justify-content:space-between;align-items:flex-start;"><div><div style="font-size:12px;font-weight:700;">Maria Santos</div><div style="font-size:11px;color:#555;margin-top:2px;">SM MOA → BGC Branch</div></div><span style="background:#f59e0b20;color:#f59e0b;font-size:10px;padding:2px 8px;font-weight:700;">Pending</span></div><div style="font-size:10px;color:#444;margin-top:6px;">Effective: March 20, 2026</div></div>' +
                '<div style="background:#1a1a1a;border-radius:10px;padding:12px;"><div style="display:flex;justify-content:space-between;align-items:flex-start;"><div><div style="font-size:12px;font-weight:700;">Jose Cruz</div><div style="font-size:11px;color:#555;margin-top:2px;">BGC → Cebu IT Park</div></div><span style="background:#3b82f620;color:#3b82f6;font-size:10px;padding:2px 8px;font-weight:700;">Approved</span></div><div style="font-size:10px;color:#444;margin-top:6px;">Effective: April 1, 2026</div></div>' +
                '</div></div>' +
                '<div style="background:#111;border:1px solid #1f1f1f;border-radius:14px;padding:20px;">' +
                '<div style="font-size:13px;font-weight:700;margin-bottom:14px;">Staff Distribution</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#888;">NCR Branches</span><span style="font-weight:700;">652</span></div><div style="background:#1f1f1f;border-radius:2px;height:6px;"><div style="background:#B90E0A;height:6px;border-radius:2px;width:53%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#888;">Visayas</span><span style="font-weight:700;">210</span></div><div style="background:#1f1f1f;border-radius:2px;height:6px;"><div style="background:#B90E0A;height:6px;border-radius:2px;width:17%;opacity:0.7;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#888;">Mindanao</span><span style="font-weight:700;">188</span></div><div style="background:#1f1f1f;border-radius:2px;height:6px;"><div style="background:#B90E0A;height:6px;border-radius:2px;width:15%;opacity:0.6;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#888;">Remote / Online</span><span style="font-weight:700;">190</span></div><div style="background:#1f1f1f;border-radius:2px;height:6px;"><div style="background:#3b82f6;height:6px;border-radius:2px;width:15%;"></div></div></div>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },
 
        {
            id: 'hr-dash-onboarding',
            label: 'HR: Onboarding Checklist',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#fafaf8;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:58px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,0.05);">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#B90E0A;border-radius:9px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:15px;">B</span></div><div><div style="font-size:14px;font-weight:700;color:#1a1a1a;">Bench Apparel</div><div style="font-size:10px;color:#aaa;letter-spacing:1px;text-transform:uppercase;">Onboarding Management</div></div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="padding:8px 16px;background:#fff;border:1px solid #e5e7eb;border-radius:7px;font-size:12px;color:#555;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">View All</button>' +
                '<button style="padding:8px 16px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">+ New Hire</button>' +
                '</div>' +
                '</div>' +
                '<div style="padding:28px;">' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;">' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #22c55e;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Fully Onboarded</div>' +
                '<div style="font-size:28px;font-weight:800;color:#1a1a1a;">24</div>' +
                '<div style="font-size:11px;color:#22c55e;margin-top:4px;">This month</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #f59e0b;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">In Progress</div>' +
                '<div style="font-size:28px;font-weight:800;color:#1a1a1a;">8</div>' +
                '<div style="font-size:11px;color:#f59e0b;margin-top:4px;">Pending tasks</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #B90E0A;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Overdue Tasks</div>' +
                '<div style="font-size:28px;font-weight:800;color:#B90E0A;">5</div>' +
                '<div style="font-size:11px;color:#B90E0A;margin-top:4px;">Immediate action</div>' +
                '</div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);border-left:4px solid #3b82f6;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Avg Completion</div>' +
                '<div style="font-size:28px;font-weight:800;color:#1a1a1a;">4.2 days</div>' +
                '<div style="font-size:11px;color:#3b82f6;margin-top:4px;">-0.8 days vs last mo</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
                // New hire cards
                '<div style="background:#fff;border-radius:14px;padding:22px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">Maria Santos — SM MOA</div>' +
                '<div style="margin-bottom:12px;background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#16a34a;font-weight:700;">✓</div><span style="font-size:13px;color:#1a1a1a;">Submit NBI Clearance</span></div>' +
                '<span style="font-size:11px;color:#22c55e;font-weight:600;">Done</span>' +
                '</div>' +
                '<div style="margin-bottom:12px;background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#16a34a;font-weight:700;">✓</div><span style="font-size:13px;color:#1a1a1a;">Complete Brand Orientation</span></div>' +
                '<span style="font-size:11px;color:#22c55e;font-weight:600;">Done</span>' +
                '</div>' +
                '<div style="margin-bottom:12px;background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#fef9c3;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#ca8a04;font-weight:700;">!</div><span style="font-size:13px;color:#1a1a1a;">Receive Uniform &amp; ID</span></div>' +
                '<span style="font-size:11px;color:#f59e0b;font-weight:600;">Pending</span>' +
                '</div>' +
                '<div style="margin-bottom:12px;background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#dc2626;font-weight:700;">✗</div><span style="font-size:13px;color:#1a1a1a;">Complete Customer Service Training</span></div>' +
                '<span style="font-size:11px;color:#B90E0A;font-weight:600;">Overdue</span>' +
                '</div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#f3f4f6;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#9ca3af;">○</div><span style="font-size:13px;color:#9ca3af;">Setup Payroll Account</span></div>' +
                '<span style="font-size:11px;color:#aaa;font-weight:600;">Not started</span>' +
                '</div>' +
                '<div style="margin-top:14px;background:#f3f4f6;border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:12px;color:#555;font-weight:500;">Progress</span>' +
                '<span style="font-size:12px;font-weight:700;color:#1a1a1a;">2 / 5 tasks done</span>' +
                '</div>' +
                '</div>' +
                // Second hire
                '<div style="background:#fff;border-radius:14px;padding:22px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">Jose Cruz — BGC Branch</div>' +
                '<div style="margin-bottom:12px;background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#16a34a;font-weight:700;">✓</div><span style="font-size:13px;color:#1a1a1a;">Submit NBI Clearance</span></div>' +
                '<span style="font-size:11px;color:#22c55e;font-weight:600;">Done</span>' +
                '</div>' +
                '<div style="margin-bottom:12px;background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#16a34a;font-weight:700;">✓</div><span style="font-size:13px;color:#1a1a1a;">Complete Brand Orientation</span></div>' +
                '<span style="font-size:11px;color:#22c55e;font-weight:600;">Done</span>' +
                '</div>' +
                '<div style="margin-bottom:12px;background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#16a34a;font-weight:700;">✓</div><span style="font-size:13px;color:#1a1a1a;">Receive Uniform &amp; ID</span></div>' +
                '<span style="font-size:11px;color:#22c55e;font-weight:600;">Done</span>' +
                '</div>' +
                '<div style="margin-bottom:12px;background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#16a34a;font-weight:700;">✓</div><span style="font-size:13px;color:#1a1a1a;">Complete Customer Service Training</span></div>' +
                '<span style="font-size:11px;color:#22c55e;font-weight:600;">Done</span>' +
                '</div>' +
                '<div style="background:#f9fafb;border-radius:8px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><div style="width:20px;height:20px;background:#fef9c3;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#ca8a04;font-weight:700;">!</div><span style="font-size:13px;color:#1a1a1a;">Setup Payroll Account</span></div>' +
                '<span style="font-size:11px;color:#f59e0b;font-weight:600;">Pending</span>' +
                '</div>' +
                '<div style="margin-top:14px;background:#dcfce7;border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:12px;color:#16a34a;font-weight:500;">Progress</span>' +
                '<span style="font-size:12px;font-weight:700;color:#16a34a;">4 / 5 tasks done — Almost complete!</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },
 
        {
            id: 'hr-dash-kpi',
            label: 'HR: KPI & Performance Tracking',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#0a0a14;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#fff;">' +
                '<div style="background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.07);padding:0 32px;height:58px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:34px;height:34px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:14px;">B</span></div><span style="font-size:14px;font-weight:700;">KPI &amp; Performance Tracker — Q1 2026</span></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="padding:7px 14px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:7px;font-size:11px;color:#aaa;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Set KPIs</button>' +
                '<button style="padding:7px 14px;background:#B90E0A;border:none;border-radius:7px;font-size:11px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">+ Add KPI Record</button>' +
                '</div>' +
                '</div>' +
                '<div style="padding:28px;">' +
                '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px;">' +
                '<div style="background:rgba(185,14,10,0.12);border:1px solid rgba(185,14,10,0.25);border-radius:12px;padding:18px;"><div style="font-size:10px;color:#B90E0A;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Top Performers</div><div style="font-size:26px;font-weight:800;">124</div><div style="font-size:11px;color:#22c55e;margin-top:4px;">Above 90% KPI</div></div>' +
                '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">Meeting KPI</div><div style="font-size:26px;font-weight:800;">684</div><div style="font-size:11px;color:#3b82f6;margin-top:4px;">75-90% achievement</div></div>' +
                '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">Below KPI</div><div style="font-size:26px;font-weight:800;color:#f59e0b;">370</div><div style="font-size:11px;color:#f59e0b;margin-top:4px;">Needs coaching</div></div>' +
                '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">Avg Achievement</div><div style="font-size:26px;font-weight:800;">84%</div><div style="font-size:11px;color:#22c55e;margin-top:4px;">+6% vs Q4 2025</div></div>' +
                '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:18px;"><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#555;margin-bottom:8px;">Total Commissions</div><div style="font-size:26px;font-weight:800;">₱840K</div><div style="font-size:11px;color:#22c55e;margin-top:4px;">+12% vs Q4</div></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:16px;">' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;">' +
                '<div style="padding:18px 22px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:14px;font-weight:700;">KPI Records — March 2026</span>' +
                '<span style="font-size:11px;color:#B90E0A;cursor:pointer;">View all</span>' +
                '</div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="border-bottom:1px solid rgba(255,255,255,0.06);"><th style="padding:10px 22px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Employee</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">KPI</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Target</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Actual</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Rate</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Commission</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:13px 22px;"><div style="font-weight:600;font-size:12px;">Maria Santos</div><div style="font-size:10px;color:#555;margin-top:1px;">SM MOA · Sales</div></td><td style="padding:13px 10px;color:#888;font-size:11px;">Monthly Sales</td><td style="padding:13px 10px;color:#888;">₱500K</td><td style="padding:13px 10px;font-weight:700;color:#22c55e;">₱582K</td><td style="padding:13px 10px;"><span style="background:#22c55e20;color:#22c55e;font-size:10px;padding:2px 8px;font-weight:700;">116%</span></td><td style="padding:13px 10px;font-weight:700;color:#22c55e;">₱11,640</td></tr>' +
                '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:13px 22px;"><div style="font-weight:600;font-size:12px;">Juan dela Cruz</div><div style="font-size:10px;color:#555;margin-top:1px;">BGC · Manager</div></td><td style="padding:13px 10px;color:#888;font-size:11px;">Branch Sales</td><td style="padding:13px 10px;color:#888;">₱2.0M</td><td style="padding:13px 10px;font-weight:700;color:#22c55e;">₱2.1M</td><td style="padding:13px 10px;"><span style="background:#22c55e20;color:#22c55e;font-size:10px;padding:2px 8px;font-weight:700;">105%</span></td><td style="padding:13px 10px;font-weight:700;color:#22c55e;">₱21,000</td></tr>' +
                '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:13px 22px;"><div style="font-weight:600;font-size:12px;">Ana Reyes</div><div style="font-size:10px;color:#555;margin-top:1px;">Cebu · Team Lead</div></td><td style="padding:13px 10px;color:#888;font-size:11px;">Monthly Sales</td><td style="padding:13px 10px;color:#888;">₱300K</td><td style="padding:13px 10px;font-weight:700;color:#f59e0b;">₱248K</td><td style="padding:13px 10px;"><span style="background:#f59e0b20;color:#f59e0b;font-size:10px;padding:2px 8px;font-weight:700;">83%</span></td><td style="padding:13px 10px;font-weight:700;color:#f59e0b;">₱4,960</td></tr>' +
                '<tr><td style="padding:13px 22px;"><div style="font-weight:600;font-size:12px;">Pedro Gomez</div><div style="font-size:10px;color:#555;margin-top:1px;">Davao · Sales</div></td><td style="padding:13px 10px;color:#888;font-size:11px;">Monthly Sales</td><td style="padding:13px 10px;color:#888;">₱400K</td><td style="padding:13px 10px;font-weight:700;color:#B90E0A;">₱291K</td><td style="padding:13px 10px;"><span style="background:#B90E0A20;color:#B90E0A;font-size:10px;padding:2px 8px;font-weight:700;">73%</span></td><td style="padding:13px 10px;font-weight:700;color:#B90E0A;">₱5,820</td></tr>' +
                '</tbody></table></div>' +
                '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;">' +
                '<div style="font-size:13px;font-weight:700;margin-bottom:16px;">Achievement Distribution</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:11px;color:#888;width:70px;">100%+</span><div style="flex:1;background:rgba(255,255,255,0.06);border-radius:2px;height:8px;"><div style="background:#22c55e;height:8px;border-radius:2px;width:18%;"></div></div><span style="font-size:11px;font-weight:700;width:28px;text-align:right;">124</span></div>' +
                '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:11px;color:#888;width:70px;">90–99%</span><div style="flex:1;background:rgba(255,255,255,0.06);border-radius:2px;height:8px;"><div style="background:#3b82f6;height:8px;border-radius:2px;width:40%;"></div></div><span style="font-size:11px;font-weight:700;width:28px;text-align:right;">280</span></div>' +
                '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:11px;color:#888;width:70px;">75–89%</span><div style="flex:1;background:rgba(255,255,255,0.06);border-radius:2px;height:8px;"><div style="background:#f59e0b;height:8px;border-radius:2px;width:58%;"></div></div><span style="font-size:11px;font-weight:700;width:28px;text-align:right;">404</span></div>' +
                '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:11px;color:#888;width:70px;">Below 75%</span><div style="flex:1;background:rgba(255,255,255,0.06);border-radius:2px;height:8px;"><div style="background:#B90E0A;height:8px;border-radius:2px;width:20%;"></div></div><span style="font-size:11px;font-weight:700;width:28px;text-align:right;">432</span></div>' +
                '</div></div>' +
                '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px;">' +
                '<div style="font-size:13px;font-weight:700;margin-bottom:16px;">Commission Summary</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#666;">Total Commissions</span><span style="font-weight:700;color:#22c55e;">₱840,000</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#666;">Avg Commission</span><span style="font-weight:700;">₱677</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#666;">Highest Earner</span><span style="font-weight:700;color:#B90E0A;">₱21,000</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:8px 0;"><span style="color:#666;">Included in Payroll</span><span style="font-weight:700;color:#22c55e;">Yes</span></div>' +
                '</div></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },
 
        {
            id: 'hr-dash-overtime',
            label: 'HR: Overtime Management',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#f8fafc;font-family:\'Helvetica Neue\',Arial,sans-serif;">' +
                '<div style="background:#fff;border-bottom:1px solid #e5e7eb;padding:0 28px;height:58px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 4px rgba(0,0,0,0.05);">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#B90E0A;border-radius:9px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:15px;">B</span></div><div><div style="font-size:14px;font-weight:700;color:#1a1a1a;">Bench Apparel</div><div style="font-size:10px;color:#aaa;letter-spacing:1px;text-transform:uppercase;">Overtime Management</div></div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:#f59e0b;background:#fffbeb;border:1px solid #fde68a;padding:5px 12px;border-radius:7px;font-weight:600;">⏳ 11 OT Requests Pending</span>' +
                '<button style="padding:7px 16px;background:#B90E0A;border:none;border-radius:7px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">+ File OT Request</button>' +
                '</div>' +
                '</div>' +
                '<div style="padding:28px;">' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;">' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:center;"><div style="width:44px;height:44px;background:#eff6ff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">⏱️</div><div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Total OT Hours</div><div style="font-size:22px;font-weight:800;color:#1a1a1a;">386</div><div style="font-size:11px;color:#3b82f6;">This period</div></div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:center;"><div style="width:44px;height:44px;background:#fef9c3;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">📋</div><div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Pending Approval</div><div style="font-size:22px;font-weight:800;color:#f59e0b;">11</div><div style="font-size:11px;color:#f59e0b;">Needs action</div></div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:center;"><div style="width:44px;height:44px;background:#f0fdf4;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">✅</div><div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">Approved</div><div style="font-size:22px;font-weight:800;color:#1a1a1a;">48</div><div style="font-size:11px;color:#22c55e;">This month</div></div></div>' +
                '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);display:flex;gap:14px;align-items:center;"><div style="width:44px;height:44px;background:#fee2e2;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">💰</div><div><div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;">OT Pay Total</div><div style="font-size:22px;font-weight:800;color:#1a1a1a;">₱168K</div><div style="font-size:11px;color:#B90E0A;">Included in payroll</div></div></div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;">' +
                '<div style="background:#fff;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">' +
                '<div style="padding:18px 20px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:14px;font-weight:700;color:#1a1a1a;">Pending OT Requests</span>' +
                '<span style="font-size:12px;color:#B90E0A;cursor:pointer;font-weight:500;">View all</span>' +
                '</div>' +
                '<div style="padding:8px 0;">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #f9fafb;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#B90E0A;">MS</div><div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Maria Santos</div><div style="font-size:11px;color:#aaa;">Mar 14 · 6:00 PM – 9:00 PM · 3 hrs</div></div></div>' +
                '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;color:#555;">₱450 OT Pay</span><button style="padding:5px 12px;background:#dcfce7;border:none;border-radius:6px;color:#16a34a;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Approve</button><button style="padding:5px 12px;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Decline</button></div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #f9fafb;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#2563eb;">JC</div><div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Jose Cruz</div><div style="font-size:11px;color:#aaa;">Mar 15 · 7:00 PM – 10:00 PM · 3 hrs</div></div></div>' +
                '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;color:#555;">₱390 OT Pay</span><button style="padding:5px 12px;background:#dcfce7;border:none;border-radius:6px;color:#16a34a;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Approve</button><button style="padding:5px 12px;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Decline</button></div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#16a34a;">AR</div><div><div style="font-size:13px;font-weight:600;color:#1a1a1a;">Ana Reyes</div><div style="font-size:11px;color:#aaa;">Mar 16 · 5:00 PM – 8:00 PM · 3 hrs</div></div></div>' +
                '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:12px;color:#555;">₱525 OT Pay</span><button style="padding:5px 12px;background:#dcfce7;border:none;border-radius:6px;color:#16a34a;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Approve</button><button style="padding:5px 12px;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Decline</button></div>' +
                '</div>' +
                '</div></div>' +
                '<div style="background:#fff;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-bottom:16px;">OT Hours by Branch</div>' +
                '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">SM Mall of Asia</span><span style="font-weight:700;color:#1a1a1a;">114 hrs</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#B90E0A;height:7px;border-radius:99px;width:74%;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">BGC High Street</span><span style="font-weight:700;color:#1a1a1a;">98 hrs</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#B90E0A;height:7px;border-radius:99px;width:64%;opacity:0.8;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Cebu IT Park</span><span style="font-weight:700;color:#1a1a1a;">78 hrs</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#B90E0A;height:7px;border-radius:99px;width:51%;opacity:0.7;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Davao Abreeza</span><span style="font-weight:700;color:#1a1a1a;">62 hrs</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#B90E0A;height:7px;border-radius:99px;width:40%;opacity:0.6;"></div></div></div>' +
                '<div><div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px;"><span style="color:#555;font-weight:500;">Remote</span><span style="font-weight:700;color:#1a1a1a;">34 hrs</span></div><div style="background:#f3f4f6;border-radius:99px;height:7px;"><div style="background:#3b82f6;height:7px;border-radius:99px;width:22%;"></div></div></div>' +
                '</div>' +
                '<div style="margin-top:18px;padding-top:14px;border-top:1px solid #f3f4f6;background:#f9fafb;border-radius:8px;padding:14px;margin-top:14px;">' +
                '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">OT Pay Computation</div>' +
                '<div style="font-size:12px;color:#555;">Hourly rate × 1.25 × OT hours</div>' +
                '<div style="font-size:14px;font-weight:700;color:#1a1a1a;margin-top:4px;">Total: ₱168,000 this period</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },
 
        {
            id: 'hr-dash-13thmonth',
            label: 'HR: 13th Month & Benefits',
            category: 'HR Dashboards',
            content: (function(){
                return '<div style="min-height:100vh;background:#0d0d0d;font-family:\'Helvetica Neue\',Arial,sans-serif;color:#fff;">' +
                '<div style="background:#111;border-bottom:1px solid #1f1f1f;padding:0 28px;height:58px;display:flex;align-items:center;justify-content:space-between;">' +
                '<div style="display:flex;align-items:center;gap:12px;"><div style="width:36px;height:36px;background:#B90E0A;border-radius:9px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:15px;">B</span></div><div><div style="font-size:14px;font-weight:700;">Bench Apparel</div><div style="font-size:10px;color:#555;letter-spacing:1px;text-transform:uppercase;">13th Month &amp; Benefits</div></div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button style="padding:8px 16px;background:#1f1f1f;border:1px solid #2a2a2a;color:#888;font-size:12px;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Export</button>' +
                '<button style="padding:8px 16px;background:#B90E0A;border:none;color:#fff;font-size:12px;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;font-weight:600;">Compute 13th Month</button>' +
                '</div>' +
                '</div>' +
                '<div style="padding:32px;">' +
                '<div style="margin-bottom:28px;"><h1 style="font-size:22px;font-weight:800;margin:0 0 4px;">13th Month Pay — 2026</h1><p style="font-size:13px;color:#555;margin:0;">Accrued January – December 2026</p></div>' +
                '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;">' +
                '<div style="background:linear-gradient(135deg,#B90E0A,#7a0806);border-radius:14px;padding:22px;">' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Estimated Total</div>' +
                '<div style="font-size:28px;font-weight:800;">₱18.7M</div>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px;">Based on Jan–Mar</div>' +
                '</div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:22px;">' +
                '<div style="font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Eligible Employees</div>' +
                '<div style="font-size:28px;font-weight:800;">1,240</div>' +
                '<div style="font-size:11px;color:#555;margin-top:6px;">All regular employees</div>' +
                '</div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:22px;">' +
                '<div style="font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Avg 13th Month</div>' +
                '<div style="font-size:28px;font-weight:800;color:#22c55e;">₱15,088</div>' +
                '<div style="font-size:11px;color:#555;margin-top:6px;">Based on basic salary</div>' +
                '</div>' +
                '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:22px;">' +
                '<div style="font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Months Accrued</div>' +
                '<div style="font-size:28px;font-weight:800;">3<span style="font-size:14px;color:#555;"> / 12</span></div>' +
                '<div style="font-size:11px;color:#f59e0b;margin-top:6px;">Release: Dec 2026</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:16px;">' +
                '<div style="background:#111;border:1px solid #1f1f1f;border-radius:14px;overflow:hidden;">' +
                '<div style="padding:18px 22px;border-bottom:1px solid #1f1f1f;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:14px;font-weight:700;">13th Month Computation</span><span style="font-size:11px;color:#555;">Jan–Mar 2026</span></div>' +
                '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                '<thead><tr style="border-bottom:1px solid #1a1a1a;"><th style="padding:10px 22px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Employee</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Total Basic Pay (YTD)</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Months</th><th style="padding:10px;text-align:left;color:#555;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Accrued 13th</th></tr></thead>' +
                '<tbody>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:14px 22px;"><div style="font-weight:600;font-size:12px;">Juan dela Cruz</div><div style="font-size:10px;color:#555;margin-top:1px;">Branch Manager · BGC</div></td><td style="padding:14px 10px;color:#888;">₱99,000</td><td style="padding:14px 10px;color:#888;">3</td><td style="padding:14px 10px;font-weight:700;color:#22c55e;">₱8,250</td></tr>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:14px 22px;"><div style="font-weight:600;font-size:12px;">Maria Santos</div><div style="font-size:10px;color:#555;margin-top:1px;">Sales Associate · SM MOA</div></td><td style="padding:14px 10px;color:#888;">₱54,000</td><td style="padding:14px 10px;color:#888;">3</td><td style="padding:14px 10px;font-weight:700;color:#22c55e;">₱4,500</td></tr>' +
                '<tr style="border-bottom:1px solid #161616;"><td style="padding:14px 22px;"><div style="font-weight:600;font-size:12px;">Pedro Reyes</div><div style="font-size:10px;color:#555;margin-top:1px;">Warehouse · BGC</div></td><td style="padding:14px 10px;color:#888;">₱45,000</td><td style="padding:14px 10px;color:#888;">3</td><td style="padding:14px 10px;font-weight:700;color:#22c55e;">₱3,750</td></tr>' +
                '<tr><td style="padding:14px 22px;"><div style="font-weight:600;font-size:12px;">Ana Lim</div><div style="font-size:10px;color:#555;margin-top:1px;">Supervisor · Glorietta</div></td><td style="padding:14px 10px;color:#888;">₱99,000</td><td style="padding:14px 10px;color:#888;">3</td><td style="padding:14px 10px;font-weight:700;color:#22c55e;">₱8,250</td></tr>' +
                '</tbody></table></div>' +
                '<div style="background:#111;border:1px solid #1f1f1f;border-radius:14px;padding:20px;">' +
                '<div style="font-size:14px;font-weight:700;margin-bottom:16px;">Computation Formula</div>' +
                '<div style="background:#1a1a1a;border-radius:10px;padding:16px;margin-bottom:14px;">' +
                '<div style="font-size:11px;color:#B90E0A;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Formula</div>' +
                '<div style="font-size:13px;color:#aaa;line-height:1.6;">Total Basic Pay Earned ÷ 12 = 13th Month Pay</div>' +
                '</div>' +
                '<div style="display:flex;flex-direction:column;gap:10px;">' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:10px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;">Total YTD Basic Pay</span><span style="font-weight:700;color:#fff;">₱18.7M</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:10px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;">Eligible Employees</span><span style="font-weight:700;color:#fff;">1,240</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:10px 0;border-bottom:1px solid #1a1a1a;"><span style="color:#666;">Months Worked (avg)</span><span style="font-weight:700;color:#fff;">3 months</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;padding:10px 0;"><span style="color:#666;">Status</span><span style="font-weight:700;color:#f59e0b;">Accruing</span></div>' +
                '</div>' +
                '<div style="margin-top:16px;background:#B90E0A20;border:1px solid #B90E0A40;border-radius:8px;padding:12px;">' +
                '<div style="font-size:11px;color:#B90E0A;font-weight:700;margin-bottom:4px;">📅 Release Date</div>' +
                '<div style="font-size:12px;color:#ff9999;">December 24, 2026 — Per PH Labor Law</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            })()
        },

        {
            id: 'hr-saas-main-dashboard',
            label: 'HR: Main Dashboard (SaaS Style)',
            category: 'HR Dashboards',
            content: (function(){
                var sidebar = '<div style="width:220px;min-height:100vh;background:#fff;border-right:1px solid #f0f0f0;display:flex;flex-direction:column;padding:0;flex-shrink:0;">' +
                    '<div style="padding:20px 20px 16px;border-bottom:1px solid #f5f5f5;">' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="width:32px;height:32px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:13px;">B</span></div>' +
                    '<div><div style="font-size:14px;font-weight:700;color:#111;">Bench Apparel</div><div style="font-size:10px;color:#aaa;">ERP System</div></div>' +
                    '</div></div>' +
                    '<div style="padding:16px 12px 8px;">' +
                    '<div style="font-size:10px;color:#bbb;letter-spacing:1.5px;text-transform:uppercase;padding:0 8px;margin-bottom:6px;">HR MODULE</div>' +
                    '<div style="background:#fff5f5;border-radius:8px;padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;">' +
                    '<span style="font-size:15px;">⊞</span><span style="font-size:13px;font-weight:600;color:#B90E0A;">Dashboard</span>' +
                    '</div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">👥</span><span style="font-size:13px;color:#555;">Employees</span>' +
                    '</div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">⏰</span><span style="font-size:13px;color:#555;">Attendance</span>' +
                    '</div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">💰</span><span style="font-size:13px;color:#555;">Payroll</span><span style="margin-left:auto;background:#B90E0A;color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;">4</span>' +
                    '</div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">🏖️</span><span style="font-size:13px;color:#555;">Leave</span><span style="margin-left:auto;background:#f59e0b;color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;">8</span>' +
                    '</div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">📢</span><span style="font-size:13px;color:#555;">Recruitment</span>' +
                    '</div>' +
                    '<div style="font-size:10px;color:#bbb;letter-spacing:1.5px;text-transform:uppercase;padding:0 8px;margin:14px 0 6px;">MANAGEMENT</div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">📈</span><span style="font-size:13px;color:#555;">Performance</span>' +
                    '</div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">🎓</span><span style="font-size:13px;color:#555;">Training</span>' +
                    '</div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">📊</span><span style="font-size:13px;color:#555;">Reports</span>' +
                    '</div>' +
                    '</div>' +
                    '<div style="margin-top:auto;padding:16px 12px;border-top:1px solid #f5f5f5;">' +
                    '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;cursor:pointer;">' +
                    '<div style="width:32px;height:32px;background:linear-gradient(135deg,#B90E0A,#7a0806);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">BM</div>' +
                    '<div><div style="font-size:12px;font-weight:600;color:#111;">Bernard M.</div><div style="font-size:10px;color:#aaa;">HR Payroll</div></div>' +
                    '</div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;border-radius:8px;margin-top:4px;">' +
                    '<span style="font-size:14px;">🚪</span><span style="font-size:12px;color:#aaa;">Log out</span>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

                var topbar = '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 28px;border-bottom:1px solid #f5f5f5;background:#fff;">' +
                    '<div><h1 style="font-size:20px;font-weight:700;color:#111;margin:0;">Dashboard</h1><p style="font-size:12px;color:#aaa;margin:2px 0 0;">Welcome back, Bernard — March 12, 2026</p></div>' +
                    '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<div style="background:#f5f5f5;border-radius:8px;padding:8px 14px;display:flex;align-items:center;gap:8px;">' +
                    '<span style="font-size:13px;color:#aaa;">🔍</span>' +
                    '<span style="font-size:12px;color:#bbb;">Search...</span>' +
                    '<span style="font-size:10px;color:#ccc;background:#e5e5e5;padding:1px 5px;border-radius:3px;">⌘F</span>' +
                    '</div>' +
                    '<div style="position:relative;cursor:pointer;"><span style="font-size:18px;">🔔</span><div style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:#B90E0A;border-radius:50%;border:2px solid #fff;"></div></div>' +
                    '<button style="padding:8px 16px;background:#B90E0A;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">+ Add Employee</button>' +
                    '</div>' +
                    '</div>';

                var kpiRow = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px;">' +
                    '<div style="background:#fff;border-radius:12px;padding:18px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
                    '<span style="font-size:11px;color:#aaa;font-weight:500;">Total Employees</span>' +
                    '<div style="width:32px;height:32px;background:#fff5f5;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;">👥</div>' +
                    '</div>' +
                    '<div style="font-size:26px;font-weight:800;color:#111;margin-bottom:4px;">1,240</div>' +
                    '<div style="font-size:11px;color:#22c55e;display:flex;align-items:center;gap:4px;">↑ 2.5% <span style="color:#aaa;">vs last month</span></div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:12px;padding:18px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
                    '<span style="font-size:11px;color:#aaa;font-weight:500;">Present Today</span>' +
                    '<div style="width:32px;height:32px;background:#f0fdf4;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;">✅</div>' +
                    '</div>' +
                    '<div style="font-size:26px;font-weight:800;color:#111;margin-bottom:4px;">1,184</div>' +
                    '<div style="font-size:11px;color:#22c55e;display:flex;align-items:center;gap:4px;">95.5% <span style="color:#aaa;">attendance rate</span></div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:12px;padding:18px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
                    '<span style="font-size:11px;color:#aaa;font-weight:500;">Total Payroll</span>' +
                    '<div style="width:32px;height:32px;background:#fff5f5;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;">💰</div>' +
                    '</div>' +
                    '<div style="font-size:26px;font-weight:800;color:#111;margin-bottom:4px;">₱22.4M</div>' +
                    '<div style="font-size:11px;color:#22c55e;display:flex;align-items:center;gap:4px;">↑ 3.2% <span style="color:#aaa;">vs last period</span></div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:12px;padding:18px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
                    '<span style="font-size:11px;color:#aaa;font-weight:500;">On Leave</span>' +
                    '<div style="width:32px;height:32px;background:#fffbeb;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;">🏖️</div>' +
                    '</div>' +
                    '<div style="font-size:26px;font-weight:800;color:#111;margin-bottom:4px;">38</div>' +
                    '<div style="font-size:11px;color:#f59e0b;display:flex;align-items:center;gap:4px;">8 pending <span style="color:#aaa;">approval</span></div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:12px;padding:18px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
                    '<span style="font-size:11px;color:#aaa;font-weight:500;">Open Positions</span>' +
                    '<div style="width:32px;height:32px;background:#fff5f5;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;">📋</div>' +
                    '</div>' +
                    '<div style="font-size:26px;font-weight:800;color:#B90E0A;margin-bottom:4px;">14</div>' +
                    '<div style="font-size:11px;color:#B90E0A;display:flex;align-items:center;gap:4px;">3 urgent <span style="color:#aaa;">hiring</span></div>' +
                    '</div>' +
                    '</div>';

                var chartArea = '<div style="display:grid;grid-template-columns:1.6fr 1fr;gap:16px;margin-bottom:16px;">' +
                    '<div style="background:#fff;border-radius:16px;padding:22px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
                    '<div><div style="font-size:15px;font-weight:700;color:#111;">Attendance Overview</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Daily attendance — this week</div></div>' +
                    '<div style="display:flex;gap:14px;align-items:center;">' +
                    '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#555;"><div style="width:8px;height:8px;background:#B90E0A;border-radius:50%;"></div>Present</div>' +
                    '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#555;"><div style="width:8px;height:8px;background:#e5e7eb;border-radius:50%;"></div>Absent</div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:flex-end;gap:12px;height:120px;padding-bottom:20px;border-bottom:1px solid #f5f5f5;">' +
                    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;"><div style="width:100%;background:#B90E0A;border-radius:6px 6px 0 0;height:95px;"></div><div style="font-size:10px;color:#aaa;">Mon</div><div style="font-size:11px;font-weight:700;color:#111;">95%</div></div>' +
                    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;"><div style="width:100%;background:#B90E0A;border-radius:6px 6px 0 0;height:100px;opacity:0.85;"></div><div style="font-size:10px;color:#aaa;">Tue</div><div style="font-size:11px;font-weight:700;color:#111;">97%</div></div>' +
                    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;"><div style="width:100%;background:#B90E0A;border-radius:6px 6px 0 0;height:88px;opacity:0.75;"></div><div style="font-size:10px;color:#aaa;">Wed</div><div style="font-size:11px;font-weight:700;color:#111;">93%</div></div>' +
                    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;"><div style="width:100%;background:#B90E0A;border-radius:6px 6px 0 0;height:96px;opacity:0.9;"></div><div style="font-size:10px;color:#aaa;">Thu</div><div style="font-size:11px;font-weight:700;color:#111;">96%</div></div>' +
                    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;"><div style="width:100%;background:#e5e7eb;border-radius:6px 6px 0 0;height:60px;"></div><div style="font-size:10px;color:#aaa;">Fri</div><div style="font-size:11px;color:#aaa;">—</div></div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:16px;padding:22px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:15px;font-weight:700;color:#111;margin-bottom:4px;">Headcount by Branch</div>' +
                    '<div style="font-size:11px;color:#aaa;margin-bottom:16px;">Distribution across all locations</div>' +
                    '<div style="display:flex;flex-direction:column;gap:12px;">' +
                    '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#555;font-weight:500;">SM Mall of Asia</span><span style="font-weight:700;color:#111;">342</span></div><div style="background:#f5f5f5;border-radius:99px;height:6px;"><div style="background:#B90E0A;height:6px;border-radius:99px;width:88%;"></div></div></div>' +
                    '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#555;font-weight:500;">BGC High Street</span><span style="font-weight:700;color:#111;">298</span></div><div style="background:#f5f5f5;border-radius:99px;height:6px;"><div style="background:#B90E0A;height:6px;border-radius:99px;width:77%;opacity:0.8;"></div></div></div>' +
                    '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#555;font-weight:500;">Cebu IT Park</span><span style="font-weight:700;color:#111;">210</span></div><div style="background:#f5f5f5;border-radius:99px;height:6px;"><div style="background:#B90E0A;height:6px;border-radius:99px;width:54%;opacity:0.65;"></div></div></div>' +
                    '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#555;font-weight:500;">Davao Abreeza</span><span style="font-weight:700;color:#111;">188</span></div><div style="background:#f5f5f5;border-radius:99px;height:6px;"><div style="background:#B90E0A;height:6px;border-radius:99px;width:48%;opacity:0.5;"></div></div></div>' +
                    '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;"><span style="color:#555;font-weight:500;">Remote / Online</span><span style="font-weight:700;color:#111;">202</span></div><div style="background:#f5f5f5;border-radius:99px;height:6px;"><div style="background:#3b82f6;height:6px;border-radius:99px;width:52%;"></div></div></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

                var bottomRow = '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;">' +
                    '<div style="background:#fff;border-radius:16px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);overflow:hidden;">' +
                    '<div style="padding:18px 20px;border-bottom:1px solid #f5f5f5;display:flex;justify-content:space-between;align-items:center;">' +
                    '<div><div style="font-size:14px;font-weight:700;color:#111;">Recent Hires</div><div style="font-size:11px;color:#aaa;margin-top:2px;">Newly onboarded employees</div></div>' +
                    '<span style="font-size:12px;color:#B90E0A;font-weight:600;cursor:pointer;">View all →</span>' +
                    '</div>' +
                    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                    '<thead><tr style="background:#fafafa;"><th style="padding:10px 20px;text-align:left;color:#bbb;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Employee</th><th style="padding:10px;text-align:left;color:#bbb;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Branch</th><th style="padding:10px;text-align:left;color:#bbb;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Role</th><th style="padding:10px;text-align:left;color:#bbb;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Status</th></tr></thead>' +
                    '<tbody>' +
                    '<tr style="border-bottom:1px solid #fafafa;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#B90E0A,#7a0806);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">MS</div><div><div style="font-weight:600;color:#111;">Maria Santos</div><div style="color:#bbb;font-size:10px;">Mar 1, 2026</div></div></div></td><td style="padding:12px 10px;color:#666;font-size:12px;">SM MOA</td><td style="padding:12px 10px;color:#666;font-size:12px;">Sales Associate</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">Active</span></td></tr>' +
                    '<tr style="border-bottom:1px solid #fafafa;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#1e40af,#1e3a8a);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">JC</div><div><div style="font-weight:600;color:#111;">Jose Cruz</div><div style="color:#bbb;font-size:10px;">Feb 28, 2026</div></div></div></td><td style="padding:12px 10px;color:#666;font-size:12px;">BGC</td><td style="padding:12px 10px;color:#666;font-size:12px;">Cashier</td><td style="padding:12px 10px;"><span style="background:#fef9c3;color:#ca8a04;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">Probation</span></td></tr>' +
                    '<tr><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#059669,#047857);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">AR</div><div><div style="font-weight:600;color:#111;">Ana Reyes</div><div style="color:#bbb;font-size:10px;">Feb 25, 2026</div></div></div></td><td style="padding:12px 10px;color:#666;font-size:12px;">Cebu</td><td style="padding:12px 10px;color:#666;font-size:12px;">Team Leader</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">Active</span></td></tr>' +
                    '</tbody></table></div>' +
                    '<div style="background:#fff;border-radius:16px;padding:20px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">Quick Actions</div>' +
                    '<div style="font-size:11px;color:#aaa;margin-bottom:16px;">Shortcuts for common tasks</div>' +
                    '<div style="display:flex;flex-direction:column;gap:8px;">' +
                    '<button style="padding:11px 16px;background:#fff5f5;border:1px solid #fecaca;border-radius:10px;color:#B90E0A;font-size:12px;font-weight:600;cursor:pointer;text-align:left;font-family:\'Helvetica Neue\',sans-serif;display:flex;align-items:center;gap:8px;">💰 Generate March Payroll</button>' +
                    '<button style="padding:11px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;color:#16a34a;font-size:12px;font-weight:600;cursor:pointer;text-align:left;font-family:\'Helvetica Neue\',sans-serif;display:flex;align-items:center;gap:8px;">✅ Review Leave Requests (8)</button>' +
                    '<button style="padding:11px 16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;color:#2563eb;font-size:12px;font-weight:600;cursor:pointer;text-align:left;font-family:\'Helvetica Neue\',sans-serif;display:flex;align-items:center;gap:8px;">📄 Export Payslips PDF</button>' +
                    '<button style="padding:11px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;color:#d97706;font-size:12px;font-weight:600;cursor:pointer;text-align:left;font-family:\'Helvetica Neue\',sans-serif;display:flex;align-items:center;gap:8px;">⏰ Approve OT Requests (11)</button>' +
                    '<button style="padding:11px 16px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;color:#7c3aed;font-size:12px;font-weight:600;cursor:pointer;text-align:left;font-family:\'Helvetica Neue\',sans-serif;display:flex;align-items:center;gap:8px;">🎁 Compute 13th Month</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

                return '<div style="min-height:100vh;background:#f8f9fb;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;">' +
                    sidebar +
                    '<div style="flex:1;display:flex;flex-direction:column;min-width:0;">' +
                    topbar +
                    '<div style="padding:24px;overflow-y:auto;">' +
                    kpiRow + chartArea + bottomRow +
                    '</div></div></div>';
            })()
        },

        {
            id: 'hr-saas-payroll',
            label: 'HR: Payroll Dashboard (SaaS)',
            category: 'HR Dashboards',
            content: (function(){
                var sidebar = '<div style="width:220px;min-height:100vh;background:#fff;border-right:1px solid #f0f0f0;display:flex;flex-direction:column;padding:0;flex-shrink:0;">' +
                    '<div style="padding:20px 20px 16px;border-bottom:1px solid #f5f5f5;">' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="width:32px;height:32px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:13px;">B</span></div>' +
                    '<div><div style="font-size:14px;font-weight:700;color:#111;">Bench Apparel</div><div style="font-size:10px;color:#aaa;">HR &bull; Payroll</div></div>' +
                    '</div></div>' +
                    '<div style="padding:16px 12px 8px;">' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">⊞</span><span style="font-size:13px;color:#555;">Dashboard</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">👥</span><span style="font-size:13px;color:#555;">Employees</span></div>' +
                    '<div style="background:#fff5f5;border-radius:8px;padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;">' +
                    '<span style="font-size:15px;">💰</span><span style="font-size:13px;font-weight:600;color:#B90E0A;">Payroll</span><span style="margin-left:auto;background:#B90E0A;color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;">4</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;padding-left:28px;">' +
                    '<span style="font-size:12px;color:#B90E0A;">·</span><span style="font-size:12px;color:#B90E0A;font-weight:500;">Payroll Periods</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;padding-left:28px;">' +
                    '<span style="font-size:12px;color:#999;">·</span><span style="font-size:12px;color:#999;">Payslips</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;padding-left:28px;">' +
                    '<span style="font-size:12px;color:#999;">·</span><span style="font-size:12px;color:#999;">Loans</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;padding-left:28px;">' +
                    '<span style="font-size:12px;color:#999;">·</span><span style="font-size:12px;color:#999;">13th Month</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">⏰</span><span style="font-size:13px;color:#555;">Attendance</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;border-radius:8px;">' +
                    '<span style="font-size:15px;">📊</span><span style="font-size:13px;color:#555;">Reports</span></div>' +
                    '</div>' +
                    '<div style="margin-top:auto;padding:16px 12px;border-top:1px solid #f5f5f5;">' +
                    '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;">' +
                    '<div style="width:32px;height:32px;background:linear-gradient(135deg,#B90E0A,#7a0806);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">BM</div>' +
                    '<div><div style="font-size:12px;font-weight:600;color:#111;">Bernard M.</div><div style="font-size:10px;color:#aaa;">Payroll Officer</div></div>' +
                    '</div></div></div>';

                var content = '<div style="flex:1;display:flex;flex-direction:column;min-width:0;">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 28px;border-bottom:1px solid #f5f5f5;background:#fff;">' +
                    '<div><h1 style="font-size:20px;font-weight:700;color:#111;margin:0;">Payroll</h1><p style="font-size:12px;color:#aaa;margin:2px 0 0;">March 2026 · Period 1 of 2 · Due: March 15</p></div>' +
                    '<div style="display:flex;gap:10px;">' +
                    '<button style="padding:8px 16px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;color:#555;font-size:12px;font-weight:500;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Export PDF</button>' +
                    '<button style="padding:8px 16px;background:#B90E0A;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">▶ Generate Payroll</button>' +
                    '</div></div>' +
                    '<div style="padding:24px;overflow-y:auto;">' +
                    // Hero card
                    '<div style="background:linear-gradient(135deg,#B90E0A 0%,#7a0806 100%);border-radius:16px;padding:28px;margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:24px;">' +
                    '<div><div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:8px;letter-spacing:0.5px;">GROSS PAYROLL</div><div style="font-size:28px;font-weight:800;color:#fff;">₱22.4M</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;">1,240 employees</div></div>' +
                    '<div><div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:8px;letter-spacing:0.5px;">DEDUCTIONS</div><div style="font-size:28px;font-weight:800;color:#fca5a5;">₱2.1M</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;">SSS + PhilHealth + Tax</div></div>' +
                    '<div><div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:8px;letter-spacing:0.5px;">NET PAYOUT</div><div style="font-size:28px;font-weight:800;color:#86efac;">₱20.3M</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;">Pay date: Mar 15</div></div>' +
                    '<div><div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:8px;letter-spacing:0.5px;">PENDING</div><div style="font-size:28px;font-weight:800;color:#fde68a;">4</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;">Payslips for review</div></div>' +
                    '</div>' +
                    // Table + deductions
                    '<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:16px;margin-bottom:16px;">' +
                    '<div style="background:#fff;border-radius:16px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);overflow:hidden;">' +
                    '<div style="padding:18px 20px;border-bottom:1px solid #f5f5f5;display:flex;justify-content:space-between;align-items:center;">' +
                    '<div><div style="font-size:14px;font-weight:700;color:#111;">Payroll Records</div><div style="font-size:11px;color:#aaa;margin-top:1px;">March 1–15, 2026</div></div>' +
                    '<div style="display:flex;gap:8px;"><div style="background:#f5f5f5;border-radius:6px;padding:5px 10px;font-size:11px;color:#555;cursor:pointer;">Filter</div><span style="font-size:12px;color:#B90E0A;font-weight:600;cursor:pointer;">View all →</span></div>' +
                    '</div>' +
                    '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
                    '<thead><tr style="background:#fafafa;"><th style="padding:10px 20px;text-align:left;color:#bbb;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Employee</th><th style="padding:10px;text-align:left;color:#bbb;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Basic Pay</th><th style="padding:10px;text-align:left;color:#bbb;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Deductions</th><th style="padding:10px;text-align:left;color:#bbb;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Net Pay</th><th style="padding:10px;text-align:left;color:#bbb;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Status</th></tr></thead>' +
                    '<tbody>' +
                    '<tr style="border-bottom:1px solid #fafafa;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#B90E0A,#7a0806);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;">JC</div><div><div style="font-weight:600;color:#111;font-size:12px;">Juan dela Cruz</div><div style="color:#bbb;font-size:10px;">Sales · SM MOA</div></div></div></td><td style="padding:12px 10px;color:#555;font-size:12px;">₱22,000</td><td style="padding:12px 10px;color:#ef4444;font-size:12px;">₱3,550</td><td style="padding:12px 10px;font-weight:700;color:#111;font-size:13px;">₱18,450</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">Paid</span></td></tr>' +
                    '<tr style="border-bottom:1px solid #fafafa;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#1e40af,#1e3a8a);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;">MS</div><div><div style="font-weight:600;color:#111;font-size:12px;">Maria Santos</div><div style="color:#bbb;font-size:10px;">HR · Head Office</div></div></div></td><td style="padding:12px 10px;color:#555;font-size:12px;">₱26,500</td><td style="padding:12px 10px;color:#ef4444;font-size:12px;">₱4,400</td><td style="padding:12px 10px;font-weight:700;color:#111;font-size:13px;">₱22,100</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">Paid</span></td></tr>' +
                    '<tr style="border-bottom:1px solid #fafafa;"><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6b7280,#4b5563);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;">PR</div><div><div style="font-weight:600;color:#111;font-size:12px;">Pedro Reyes</div><div style="color:#bbb;font-size:10px;">Warehouse · BGC</div></div></div></td><td style="padding:12px 10px;color:#555;font-size:12px;">₱18,000</td><td style="padding:12px 10px;color:#ef4444;font-size:12px;">₱3,200</td><td style="padding:12px 10px;font-weight:700;color:#111;font-size:13px;">₱14,800</td><td style="padding:12px 10px;"><span style="background:#fef9c3;color:#ca8a04;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">Pending</span></td></tr>' +
                    '<tr><td style="padding:12px 20px;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#059669,#047857);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;">AL</div><div><div style="font-weight:600;color:#111;font-size:12px;">Ana Lim</div><div style="color:#bbb;font-size:10px;">Supervisor · Glorietta</div></div></div></td><td style="padding:12px 10px;color:#555;font-size:12px;">₱33,000</td><td style="padding:12px 10px;color:#ef4444;font-size:12px;">₱4,700</td><td style="padding:12px 10px;font-weight:700;color:#111;font-size:13px;">₱28,300</td><td style="padding:12px 10px;"><span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:700;">Paid</span></td></tr>' +
                    '</tbody></table></div>' +
                    '<div style="background:#fff;border-radius:16px;padding:22px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">Deduction Summary</div>' +
                    '<div style="font-size:11px;color:#aaa;margin-bottom:18px;">Government contributions</div>' +
                    '<div style="display:flex;flex-direction:column;gap:14px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fafafa;border-radius:10px;"><div><div style="font-size:12px;font-weight:600;color:#111;">SSS</div><div style="font-size:10px;color:#aaa;margin-top:1px;">Social Security</div></div><div style="text-align:right;"><div style="font-size:13px;font-weight:700;color:#ef4444;">₱38,400</div><div style="font-size:10px;color:#aaa;">₱900 avg/emp</div></div></div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fafafa;border-radius:10px;"><div><div style="font-size:12px;font-weight:600;color:#111;">PhilHealth</div><div style="font-size:10px;color:#aaa;margin-top:1px;">Health Insurance</div></div><div style="text-align:right;"><div style="font-size:13px;font-weight:700;color:#ef4444;">₱22,800</div><div style="font-size:10px;color:#aaa;">₱400 avg/emp</div></div></div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fafafa;border-radius:10px;"><div><div style="font-size:12px;font-weight:600;color:#111;">Pag-IBIG</div><div style="font-size:10px;color:#aaa;margin-top:1px;">Housing Fund</div></div><div style="text-align:right;"><div style="font-size:13px;font-weight:700;color:#ef4444;">₱14,800</div><div style="font-size:10px;color:#aaa;">₱200 avg/emp</div></div></div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#fff5f5;border-radius:10px;border:1px solid #fecaca;"><div><div style="font-size:12px;font-weight:700;color:#111;">Total Deductions</div></div><div style="font-size:16px;font-weight:800;color:#B90E0A;">₱149,800</div></div>' +
                    '</div>' +
                    '<button style="width:100%;margin-top:16px;padding:12px;background:#B90E0A;border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Generate Payslips</button>' +
                    '</div>' +
                    '</div>' +
                    '</div></div>';

                return '<div style="min-height:100vh;background:#f8f9fb;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;">' +
                    sidebar + content + '</div>';
            })()
        },

        {
            id: 'hr-saas-attendance',
            label: 'HR: Attendance Dashboard (SaaS)',
            category: 'HR Dashboards',
            content: (function(){
                var sidebar = '<div style="width:220px;min-height:100vh;background:#fff;border-right:1px solid #f0f0f0;display:flex;flex-direction:column;padding:0;flex-shrink:0;">' +
                    '<div style="padding:20px 20px 16px;border-bottom:1px solid #f5f5f5;">' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="width:32px;height:32px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:13px;">B</span></div>' +
                    '<div><div style="font-size:14px;font-weight:700;color:#111;">Bench Apparel</div><div style="font-size:10px;color:#aaa;">HR &bull; Attendance</div></div>' +
                    '</div></div>' +
                    '<div style="padding:16px 12px 8px;">' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;"><span style="font-size:15px;">⊞</span><span style="font-size:13px;color:#555;">Dashboard</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;"><span style="font-size:15px;">👥</span><span style="font-size:13px;color:#555;">Employees</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;"><span style="font-size:15px;">💰</span><span style="font-size:13px;color:#555;">Payroll</span></div>' +
                    '<div style="background:#fff5f5;border-radius:8px;padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;">' +
                    '<span style="font-size:15px;">⏰</span><span style="font-size:13px;font-weight:600;color:#B90E0A;">Attendance</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;padding-left:28px;"><span style="font-size:12px;color:#B90E0A;">·</span><span style="font-size:12px;color:#B90E0A;font-weight:500;">Daily Logs</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;padding-left:28px;"><span style="font-size:12px;color:#999;">·</span><span style="font-size:12px;color:#999;">Leave Requests</span><span style="margin-left:auto;background:#f59e0b;color:#fff;font-size:9px;padding:1px 5px;border-radius:99px;">8</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;border-radius:8px;padding-left:28px;"><span style="font-size:12px;color:#999;">·</span><span style="font-size:12px;color:#999;">Overtime</span><span style="margin-left:auto;background:#f59e0b;color:#fff;font-size:9px;padding:1px 5px;border-radius:99px;">11</span></div>' +
                    '</div>' +
                    '<div style="margin-top:auto;padding:16px 12px;border-top:1px solid #f5f5f5;">' +
                    '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;">' +
                    '<div style="width:32px;height:32px;background:linear-gradient(135deg,#B90E0A,#7a0806);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">BM</div>' +
                    '<div><div style="font-size:12px;font-weight:600;color:#111;">Bernard M.</div><div style="font-size:10px;color:#aaa;">HR Officer</div></div>' +
                    '</div></div></div>';

                var content = '<div style="flex:1;display:flex;flex-direction:column;min-width:0;">' +
                    '<div style="background:linear-gradient(135deg,#B90E0A 0%,#7a0806 100%);padding:28px 32px 70px;position:relative;overflow:hidden;">' +
                    '<div style="position:absolute;top:-50px;right:-50px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>' +
                    '<div style="position:absolute;bottom:-60px;left:180px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.04);"></div>' +
                    '<div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;">' +
                    '<div><div style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Bench Apparel · HR</div>' +
                    '<h1 style="font-size:24px;font-weight:800;color:#fff;margin:0 0 6px;">Attendance &amp; Timekeeping</h1>' +
                    '<p style="font-size:13px;color:rgba(255,255,255,0.6);margin:0;">Week of March 10–14, 2026</p></div>' +
                    '<div style="display:flex;gap:8px;">' +
                    '<button style="padding:8px 16px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);border-radius:8px;font-size:12px;color:#fff;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">This Week</button>' +
                    '<button style="padding:8px 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-size:12px;color:rgba(255,255,255,0.6);cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">This Month</button>' +
                    '</div></div></div>' +
                    '<div style="padding:0 28px;margin-top:-48px;position:relative;z-index:2;">' +
                    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px;">' +
                    '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 16px rgba(0,0,0,0.08);text-align:center;">' +
                    '<div style="font-size:28px;font-weight:900;color:#111;">1,184</div>' +
                    '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Present</div>' +
                    '<div style="width:36px;height:3px;background:#22c55e;border-radius:99px;margin:8px auto 0;"></div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 16px rgba(0,0,0,0.08);text-align:center;">' +
                    '<div style="font-size:28px;font-weight:900;color:#111;">38</div>' +
                    '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">On Leave</div>' +
                    '<div style="width:36px;height:3px;background:#3b82f6;border-radius:99px;margin:8px auto 0;"></div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 16px rgba(0,0,0,0.08);text-align:center;">' +
                    '<div style="font-size:28px;font-weight:900;color:#B90E0A;">18</div>' +
                    '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Absent</div>' +
                    '<div style="width:36px;height:3px;background:#ef4444;border-radius:99px;margin:8px auto 0;"></div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 16px rgba(0,0,0,0.08);text-align:center;">' +
                    '<div style="font-size:28px;font-weight:900;color:#111;">64</div>' +
                    '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Late</div>' +
                    '<div style="width:36px;height:3px;background:#f59e0b;border-radius:99px;margin:8px auto 0;"></div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:14px;padding:18px;box-shadow:0 4px 16px rgba(0,0,0,0.08);text-align:center;">' +
                    '<div style="font-size:28px;font-weight:900;color:#111;">386</div>' +
                    '<div style="font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">OT Hours</div>' +
                    '<div style="width:36px;height:3px;background:#8b5cf6;border-radius:99px;margin:8px auto 0;"></div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;">' +
                    '<div style="background:#fff;border-radius:16px;padding:22px;border:1px solid #f0f0f0;box-shadow:0 1px 4px rgba(0,0,0,0.04);">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
                    '<div><div style="font-size:14px;font-weight:700;color:#111;">Daily Attendance Rate</div><div style="font-size:11px;color:#aaa;margin-top:2px;">This week</div></div>' +
                    '<div style="display:flex;gap:12px;align-items:center;">' +
                    '<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#555;"><div style="width:8px;height:8px;background:#B90E0A;border-radius:2px;"></div>Attendance %</div>' +
                    '</div></div>' +
                    '<div style="display:flex;align-items:flex-end;justify-content:space-around;height:110px;margin-bottom:12px;">' +
                    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:14%;"><div style="width:100%;background:#B90E0A;border-radius:6px 6px 0 0;height:95px;"></div><div style="font-size:10px;color:#aaa;">Mon</div><div style="font-size:11px;font-weight:700;color:#111;">95%</div></div>' +
                    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:14%;"><div style="width:100%;background:#B90E0A;border-radius:6px 6px 0 0;height:100px;opacity:0.85;"></div><div style="font-size:10px;color:#aaa;">Tue</div><div style="font-size:11px;font-weight:700;color:#111;">97%</div></div>' +
                    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:14%;"><div style="width:100%;background:#B90E0A;border-radius:6px 6px 0 0;height:85px;opacity:0.7;"></div><div style="font-size:10px;color:#aaa;">Wed</div><div style="font-size:11px;font-weight:700;color:#111;">93%</div></div>' +
                    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:14%;"><div style="width:100%;background:#B90E0A;border-radius:6px 6px 0 0;height:96px;opacity:0.9;"></div><div style="font-size:10px;color:#aaa;">Thu</div><div style="font-size:11px;font-weight:700;color:#111;">96%</div></div>' +
                    '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:14%;"><div style="width:100%;background:#e5e7eb;border-radius:6px 6px 0 0;height:55px;"></div><div style="font-size:10px;color:#aaa;">Fri</div><div style="font-size:11px;color:#aaa;">—</div></div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:16px;padding:22px;border:1px solid #f0f0f0;box-shadow:0 1px 4px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">Leave Requests</div>' +
                    '<div style="font-size:11px;color:#aaa;margin-bottom:16px;">Pending approval</div>' +
                    '<div style="display:flex;flex-direction:column;gap:10px;">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#fafafa;border-radius:10px;">' +
                    '<div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#B90E0A;">MS</div><div><div style="font-size:12px;font-weight:600;color:#111;">Maria Santos</div><div style="font-size:10px;color:#aaa;">Vacation · 5 days</div></div></div>' +
                    '<div style="display:flex;gap:5px;"><button style="padding:4px 10px;background:#dcfce7;border:none;border-radius:6px;color:#16a34a;font-size:10px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">✓</button><button style="padding:4px 10px;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;font-size:10px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">✗</button></div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#fafafa;border-radius:10px;">' +
                    '<div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#2563eb;">JC</div><div><div style="font-size:12px;font-weight:600;color:#111;">Jose Cruz</div><div style="font-size:10px;color:#aaa;">Sick Leave · 2 days</div></div></div>' +
                    '<div style="display:flex;gap:5px;"><button style="padding:4px 10px;background:#dcfce7;border:none;border-radius:6px;color:#16a34a;font-size:10px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">✓</button><button style="padding:4px 10px;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;font-size:10px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">✗</button></div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#fafafa;border-radius:10px;">' +
                    '<div style="display:flex;align-items:center;gap:10px;"><div style="width:28px;height:28px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#16a34a;">AR</div><div><div style="font-size:12px;font-weight:600;color:#111;">Ana Reyes</div><div style="font-size:10px;color:#aaa;">Emergency · 1 day</div></div></div>' +
                    '<div style="display:flex;gap:5px;"><button style="padding:4px 10px;background:#dcfce7;border:none;border-radius:6px;color:#16a34a;font-size:10px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">✓</button><button style="padding:4px 10px;background:#fee2e2;border:none;border-radius:6px;color:#dc2626;font-size:10px;font-weight:700;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">✗</button></div>' +
                    '</div>' +
                    '<div style="text-align:center;margin-top:4px;"><span style="font-size:12px;color:#B90E0A;font-weight:600;cursor:pointer;">View all 8 pending →</span></div>' +
                    '</div></div></div></div></div></div>';

                return '<div style="min-height:100vh;background:#f8f9fb;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;">' +
                    sidebar + content + '</div>';
            })()
        },

        {
            id: 'hr-saas-employee-profile',
            label: 'HR: Employee Profile (SaaS)',
            category: 'HR Dashboards',
            content: (function(){
                var sidebar = '<div style="width:220px;min-height:100vh;background:#fff;border-right:1px solid #f0f0f0;display:flex;flex-direction:column;padding:0;flex-shrink:0;">' +
                    '<div style="padding:20px 20px 16px;border-bottom:1px solid #f5f5f5;">' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="width:32px;height:32px;background:#B90E0A;border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-weight:900;font-size:13px;">B</span></div>' +
                    '<div><div style="font-size:14px;font-weight:700;color:#111;">Bench Apparel</div><div style="font-size:10px;color:#aaa;">HR · Employees</div></div>' +
                    '</div></div>' +
                    '<div style="padding:16px 12px 8px;">' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;"><span style="font-size:15px;">⊞</span><span style="font-size:13px;color:#555;">Dashboard</span></div>' +
                    '<div style="background:#fff5f5;border-radius:8px;padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;">' +
                    '<span style="font-size:15px;">👥</span><span style="font-size:13px;font-weight:600;color:#B90E0A;">Employees</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;"><span style="font-size:15px;">💰</span><span style="font-size:13px;color:#555;">Payroll</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:2px;cursor:pointer;border-radius:8px;"><span style="font-size:15px;">⏰</span><span style="font-size:13px;color:#555;">Attendance</span></div>' +
                    '<div style="padding:9px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;border-radius:8px;"><span style="font-size:15px;">📊</span><span style="font-size:13px;color:#555;">Reports</span></div>' +
                    '</div>' +
                    '<div style="margin-top:auto;padding:16px 12px;border-top:1px solid #f5f5f5;">' +
                    '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;">' +
                    '<div style="width:32px;height:32px;background:linear-gradient(135deg,#B90E0A,#7a0806);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;">BM</div>' +
                    '<div><div style="font-size:12px;font-weight:600;color:#111;">Bernard M.</div><div style="font-size:10px;color:#aaa;">HR Officer</div></div>' +
                    '</div></div></div>';

                var content = '<div style="flex:1;display:flex;flex-direction:column;min-width:0;">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 28px;border-bottom:1px solid #f5f5f5;background:#fff;">' +
                    '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:#aaa;cursor:pointer;">Employees</span><span style="color:#ccc;">/</span><span style="font-size:12px;color:#111;font-weight:600;">Juan dela Cruz</span></div>' +
                    '<div style="display:flex;gap:8px;">' +
                    '<button style="padding:8px 16px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;color:#555;font-size:12px;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">Edit Profile</button>' +
                    '<button style="padding:8px 16px;background:#B90E0A;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:\'Helvetica Neue\',sans-serif;">View Payslips</button>' +
                    '</div></div>' +
                    '<div style="padding:24px;overflow-y:auto;">' +
                    '<div style="display:grid;grid-template-columns:300px 1fr;gap:20px;">' +
                    // Left profile card
                    '<div style="display:flex;flex-direction:column;gap:16px;">' +
                    '<div style="background:#fff;border-radius:16px;padding:24px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);text-align:center;">' +
                    '<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#B90E0A,#7a0806);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:800;">JC</div>' +
                    '<div style="font-size:17px;font-weight:700;color:#111;">Juan dela Cruz</div>' +
                    '<div style="font-size:12px;color:#B90E0A;font-weight:600;margin-top:3px;">Branch Manager</div>' +
                    '<div style="font-size:12px;color:#aaa;margin-top:2px;">BGC High Street</div>' +
                    '<div style="display:flex;justify-content:center;gap:8px;margin-top:12px;">' +
                    '<span style="background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:700;">Active</span>' +
                    '<span style="background:#f0f0f0;color:#555;padding:4px 12px;border-radius:99px;font-size:11px;">Full-time</span>' +
                    '</div>' +
                    '<div style="margin-top:16px;padding-top:14px;border-top:1px solid #f5f5f5;display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div style="background:#fafafa;border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:800;color:#111;">4.8</div><div style="font-size:10px;color:#aaa;">Perf Score</div></div>' +
                    '<div style="background:#fafafa;border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:800;color:#111;">3 yrs</div><div style="font-size:10px;color:#aaa;">Tenure</div></div>' +
                    '</div></div>' +
                    '<div style="background:#fff;border-radius:16px;padding:20px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:13px;font-weight:700;color:#111;margin-bottom:14px;">Contact Info</div>' +
                    '<div style="display:flex;flex-direction:column;gap:10px;">' +
                    '<div style="display:flex;gap:10px;align-items:flex-start;"><span style="font-size:13px;margin-top:1px;">📧</span><div><div style="font-size:11px;color:#aaa;">Email</div><div style="font-size:12px;color:#111;font-weight:500;">jdelacruz@bench.ph</div></div></div>' +
                    '<div style="display:flex;gap:10px;align-items:flex-start;"><span style="font-size:13px;margin-top:1px;">📱</span><div><div style="font-size:11px;color:#aaa;">Phone</div><div style="font-size:12px;color:#111;font-weight:500;">+63 917 123 4567</div></div></div>' +
                    '<div style="display:flex;gap:10px;align-items:flex-start;"><span style="font-size:13px;margin-top:1px;">📍</span><div><div style="font-size:11px;color:#aaa;">Address</div><div style="font-size:12px;color:#111;font-weight:500;">Taguig City, Metro Manila</div></div></div>' +
                    '<div style="display:flex;gap:10px;align-items:flex-start;"><span style="font-size:13px;margin-top:1px;">🆔</span><div><div style="font-size:11px;color:#aaa;">SSS Number</div><div style="font-size:12px;color:#111;font-weight:500;">34-1234567-8</div></div></div>' +
                    '</div></div></div>' +
                    // Right detail tabs
                    '<div style="display:flex;flex-direction:column;gap:16px;">' +
                    '<div style="display:flex;gap:4px;background:#f5f5f5;border-radius:10px;padding:4px;width:fit-content;">' +
                    '<div style="padding:7px 16px;background:#fff;border-radius:8px;font-size:12px;font-weight:600;color:#111;box-shadow:0 1px 2px rgba(0,0,0,0.06);cursor:pointer;">Overview</div>' +
                    '<div style="padding:7px 16px;font-size:12px;color:#888;cursor:pointer;">Documents</div>' +
                    '<div style="padding:7px 16px;font-size:12px;color:#888;cursor:pointer;">Payroll</div>' +
                    '<div style="padding:7px 16px;font-size:12px;color:#888;cursor:pointer;">Attendance</div>' +
                    '<div style="padding:7px 16px;font-size:12px;color:#888;cursor:pointer;">Training</div>' +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
                    '<div style="background:#fff;border-radius:12px;padding:16px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:11px;color:#aaa;margin-bottom:6px;">Basic Salary</div><div style="font-size:20px;font-weight:800;color:#111;">₱33,000</div><div style="font-size:11px;color:#22c55e;">per month</div></div>' +
                    '<div style="background:#fff;border-radius:12px;padding:16px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:11px;color:#aaa;margin-bottom:6px;">Last Net Pay</div><div style="font-size:20px;font-weight:800;color:#111;">₱28,300</div><div style="font-size:11px;color:#aaa;">Feb 28, 2026</div></div>' +
                    '<div style="background:#fff;border-radius:12px;padding:16px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:11px;color:#aaa;margin-bottom:6px;">Leave Balance</div><div style="font-size:20px;font-weight:800;color:#111;">12 days</div><div style="font-size:11px;color:#aaa;">VL remaining</div></div>' +
                    '</div>' +
                    '<div style="background:#fff;border-radius:16px;padding:22px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">Employment History</div>' +
                    '<div style="font-size:11px;color:#aaa;margin-bottom:16px;">Position changes and promotions</div>' +
                    '<div style="display:flex;flex-direction:column;gap:0;">' +
                    '<div style="display:flex;gap:14px;">' +
                    '<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:10px;height:10px;background:#B90E0A;border-radius:50%;margin-top:4px;flex-shrink:0;"></div><div style="width:2px;flex:1;background:#f0f0f0;margin:4px 0;"></div></div>' +
                    '<div style="padding-bottom:16px;"><div style="font-size:12px;font-weight:600;color:#111;">Branch Manager</div><div style="font-size:11px;color:#aaa;">BGC High Street · Jan 2024 – Present</div></div>' +
                    '</div>' +
                    '<div style="display:flex;gap:14px;">' +
                    '<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:10px;height:10px;background:#e5e7eb;border-radius:50%;margin-top:4px;flex-shrink:0;"></div><div style="width:2px;flex:1;background:#f0f0f0;margin:4px 0;"></div></div>' +
                    '<div style="padding-bottom:16px;"><div style="font-size:12px;font-weight:600;color:#111;">Senior Sales Associate</div><div style="font-size:11px;color:#aaa;">SM MOA · Mar 2022 – Dec 2023</div></div>' +
                    '</div>' +
                    '<div style="display:flex;gap:14px;">' +
                    '<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:10px;height:10px;background:#e5e7eb;border-radius:50%;margin-top:4px;flex-shrink:0;"></div></div>' +
                    '<div><div style="font-size:12px;font-weight:600;color:#111;">Sales Associate</div><div style="font-size:11px;color:#aaa;">SM MOA · Jan 2021 – Feb 2022</div></div>' +
                    '</div></div></div>' +
                    '<div style="background:#fff;border-radius:16px;padding:22px;border:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">Government IDs</div>' +
                    '<div style="font-size:11px;color:#aaa;margin-bottom:14px;">Required for payroll computation</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
                    '<div style="background:#fafafa;border-radius:10px;padding:12px;"><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">SSS</div><div style="font-size:12px;font-weight:600;color:#111;">34-1234567-8</div></div>' +
                    '<div style="background:#fafafa;border-radius:10px;padding:12px;"><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">PhilHealth</div><div style="font-size:12px;font-weight:600;color:#111;">12-345678901-2</div></div>' +
                    '<div style="background:#fafafa;border-radius:10px;padding:12px;"><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Pag-IBIG</div><div style="font-size:12px;font-weight:600;color:#111;">1234-5678-9012</div></div>' +
                    '<div style="background:#fafafa;border-radius:10px;padding:12px;"><div style="font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">TIN</div><div style="font-size:12px;font-weight:600;color:#111;">123-456-789-000</div></div>' +
                    '</div></div>' +
                    '</div></div></div></div></div>';

                return '<div style="min-height:100vh;background:#f8f9fb;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;">' +
                    sidebar + content + '</div>';
            })()
        },

        {
            id: 'payroll-dashboard-overview',
            label: 'Payroll: Dashboard Overview',
            category: 'Payroll Module',
            content: (function () {
 
                var head = '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>' +
                    '<script src="https://cdn.tailwindcss.com"><\/script>' +
                    '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"><\/script>' +
                    '<style>*{font-family:\'Plus Jakarta Sans\',sans-serif;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#F33939;border-radius:99px}</style>';
 
                // Sidebar
                var sidebar =
                    '<aside style="width:220px;min-height:100vh;background:#180101;display:flex;flex-direction:column;flex-shrink:0;">' +
                    '<div style="padding:20px 18px 16px;border-bottom:1px solid #430404;">' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="width:34px;height:34px;background:#F10E0E;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                    '<span style="color:#fff;font-weight:900;font-size:14px;">B</span></div>' +
                    '<div><div style="font-size:13px;font-weight:800;color:#fff;line-height:1;">Bench Apparel</div>' +
                    '<div style="font-size:10px;color:#F66565;margin-top:1px;">Payroll Module</div></div>' +
                    '</div></div>' +
                    '<nav style="padding:14px 10px;flex:1;">' +
                    // nav items
                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6F0606;padding:0 10px;margin-bottom:6px;margin-top:4px;">Overview</div>' +
                    '<div style="padding:9px 12px;border-radius:10px;background:#B50B0B;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:2px;">' +
                    '<i data-lucide="layout-dashboard" style="width:15px;height:15px;color:#FEE7E7;flex-shrink:0;"></i>' +
                    '<span style="font-size:12px;font-weight:700;color:#FEE7E7;">Dashboard</span></div>' +
                    '<div style="padding:9px 12px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:2px;">' +
                    '<i data-lucide="users" style="width:15px;height:15px;color:#9A0909;flex-shrink:0;"></i>' +
                    '<span style="font-size:12px;color:#9A0909;">Payroll Register</span></div>' +
                    '<div style="padding:9px 12px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:2px;">' +
                    '<i data-lucide="file-text" style="width:15px;height:15px;color:#9A0909;flex-shrink:0;"></i>' +
                    '<span style="font-size:12px;color:#9A0909;">Payslips</span></div>' +
                    '<div style="padding:9px 12px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:14px;">' +
                    '<i data-lucide="history" style="width:15px;height:15px;color:#9A0909;flex-shrink:0;"></i>' +
                    '<span style="font-size:12px;color:#9A0909;">History</span></div>' +
                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6F0606;padding:0 10px;margin-bottom:6px;">Settings</div>' +
                    '<div style="padding:9px 12px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:2px;">' +
                    '<i data-lucide="settings" style="width:15px;height:15px;color:#9A0909;flex-shrink:0;"></i>' +
                    '<span style="font-size:12px;color:#9A0909;">Settings</span></div>' +
                    '</nav>' +
                    '<div style="padding:14px 18px;border-top:1px solid #430404;display:flex;align-items:center;gap:10px;">' +
                    '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#F10E0E,#9A0909);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;flex-shrink:0;">HR</div>' +
                    '<div><div style="font-size:11px;font-weight:700;color:#FEE7E7;">HR Officer</div><div style="font-size:10px;color:#9A0909;">hr@bench.ph</div></div>' +
                    '</div>' +
                    '</aside>';
 
                // Stat card helper
                function statCard(icon, label, value, sub, bg, textColor, iconColor) {
                    return '<div style="background:' + bg + ';border-radius:16px;padding:20px;border:1px solid #FEE7E7;">' +
                        '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;">' +
                        '<div style="width:40px;height:40px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(241,14,14,0.15);">' +
                        '<i data-lucide="' + icon + '" style="width:18px;height:18px;color:' + iconColor + ';"></i></div>' +
                        '<span style="font-size:10px;font-weight:700;color:' + textColor + ';background:#fff;padding:3px 8px;border-radius:99px;opacity:0.7;">' + sub + '</span>' +
                        '</div>' +
                        '<div style="font-size:26px;font-weight:900;color:#180101;letter-spacing:-1px;margin-bottom:2px;">' + value + '</div>' +
                        '<div style="font-size:11px;color:#9A0909;font-weight:600;">' + label + '</div>' +
                        '</div>';
                }
 
                var statsRow =
                    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px;">' +
                    statCard('users', 'Total Employees', '148', 'This period', '#FEE7E7', '#B50B0B', '#F10E0E') +
                    statCard('trending-up', 'Total Gross Pay', '₱4,872,600', '↑ 3.2%', '#FBBCBC', '#9A0909', '#B50B0B') +
                    statCard('minus-circle', 'Total Deductions', '₱1,024,330', 'SSS · PhilHealth · Tax', '#F99090', '#6F0606', '#9A0909') +
                    statCard('banknote', 'Total Net Pay', '₱3,848,270', '↑ 2.8%', '#FEE7E7', '#B50B0B', '#F10E0E') +
                    '</div>';
 
                var payPeriodCard =
                    '<div style="background:#fff;border-radius:16px;border:1px solid #FBBCBC;padding:20px 24px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 12px rgba(241,14,14,0.06);">' +
                    '<div style="display:flex;align-items:center;gap:16px;">' +
                    '<div style="width:44px;height:44px;background:#FEE7E7;border-radius:12px;display:flex;align-items:center;justify-content:center;">' +
                    '<i data-lucide="calendar-range" style="width:20px;height:20px;color:#F10E0E;"></i></div>' +
                    '<div>' +
                    '<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:2px;">Current Pay Period</div>' +
                    '<div style="font-size:20px;font-weight:900;color:#180101;letter-spacing:-0.5px;">March 1 – March 15, 2026</div>' +
                    '<div style="font-size:11px;color:#9ca3af;margin-top:2px;">Cut-off: March 15 &nbsp;·&nbsp; Release: March 20</div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="display:flex;align-items:center;gap:6px;background:#FEE7E7;padding:8px 14px;border-radius:10px;">' +
                    '<i data-lucide="clock" style="width:14px;height:14px;color:#F10E0E;"></i>' +
                    '<span style="font-size:12px;font-weight:700;color:#B50B0B;">Pending</span>' +
                    '</div>' +
                    '<button style="display:flex;align-items:center;gap:8px;background:#F10E0E;color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:12px;font-weight:800;cursor:pointer;letter-spacing:0.5px;">' +
                    '<i data-lucide="play-circle" style="width:15px;height:15px;color:#fff;"></i>' +
                    'Run Payroll</button>' +
                    '</div>' +
                    '</div>';
 
                // Breakdown chart area
                var breakdownRow =
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">' +
 
                    // Deductions breakdown
                    '<div style="background:#fff;border-radius:16px;border:1px solid #FEE7E7;padding:20px;box-shadow:0 1px 4px rgba(241,14,14,0.04);">' +
                    '<div style="font-size:13px;font-weight:800;color:#180101;margin-bottom:4px;">Deductions Breakdown</div>' +
                    '<div style="font-size:11px;color:#9ca3af;margin-bottom:16px;">Current period &middot; All employees</div>' +
                    '<div style="display:flex;flex-direction:column;gap:12px;">' +
 
                    // SSS
                    '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<div style="width:32px;height:32px;background:#FEE7E7;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                    '<i data-lucide="shield" style="width:14px;height:14px;color:#F10E0E;"></i></div>' +
                    '<div style="flex:1;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
                    '<span style="font-size:11px;font-weight:700;color:#374151;">SSS</span>' +
                    '<span style="font-size:11px;color:#6b7280;">₱354,800 <span style="color:#d1d5db;">35%</span></span></div>' +
                    '<div style="height:6px;background:#FEE7E7;border-radius:99px;"><div style="width:35%;height:100%;background:#F33939;border-radius:99px;"></div></div>' +
                    '</div></div>' +
 
                    // PhilHealth
                    '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<div style="width:32px;height:32px;background:#FBBCBC;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                    '<i data-lucide="heart-pulse" style="width:14px;height:14px;color:#B50B0B;"></i></div>' +
                    '<div style="flex:1;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
                    '<span style="font-size:11px;font-weight:700;color:#374151;">PhilHealth</span>' +
                    '<span style="font-size:11px;color:#6b7280;">₱236,500 <span style="color:#d1d5db;">23%</span></span></div>' +
                    '<div style="height:6px;background:#FEE7E7;border-radius:99px;"><div style="width:23%;height:100%;background:#F66565;border-radius:99px;"></div></div>' +
                    '</div></div>' +
 
                    // Pag-IBIG
                    '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<div style="width:32px;height:32px;background:#F99090;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                    '<i data-lucide="home" style="width:14px;height:14px;color:#9A0909;"></i></div>' +
                    '<div style="flex:1;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
                    '<span style="font-size:11px;font-weight:700;color:#374151;">Pag-IBIG</span>' +
                    '<span style="font-size:11px;color:#6b7280;">₱118,250 <span style="color:#d1d5db;">12%</span></span></div>' +
                    '<div style="height:6px;background:#FEE7E7;border-radius:99px;"><div style="width:12%;height:100%;background:#F99090;border-radius:99px;"></div></div>' +
                    '</div></div>' +
 
                    // Withholding Tax
                    '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<div style="width:32px;height:32px;background:#FEE7E7;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                    '<i data-lucide="receipt" style="width:14px;height:14px;color:#6F0606;"></i></div>' +
                    '<div style="flex:1;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
                    '<span style="font-size:11px;font-weight:700;color:#374151;">Withholding Tax</span>' +
                    '<span style="font-size:11px;color:#6b7280;">₱314,780 <span style="color:#d1d5db;">30%</span></span></div>' +
                    '<div style="height:6px;background:#FEE7E7;border-radius:99px;"><div style="width:30%;height:100%;background:#6F0606;border-radius:99px;"></div></div>' +
                    '</div></div>' +
 
                    '</div></div>' +
 
                    // Quick actions + recent activity
                    '<div style="display:flex;flex-direction:column;gap:12px;">' +
                    '<div style="background:#180101;border-radius:16px;padding:20px;">' +
                    '<div style="font-size:13px;font-weight:800;color:#FEE7E7;margin-bottom:14px;">Quick Actions</div>' +
                    '<div style="display:flex;flex-direction:column;gap:8px;">' +
 
                    '<button style="display:flex;align-items:center;gap:10px;background:#430404;border:none;border-radius:10px;padding:12px 14px;cursor:pointer;width:100%;text-align:left;">' +
                    '<i data-lucide="download" style="width:15px;height:15px;color:#F66565;flex-shrink:0;"></i>' +
                    '<span style="font-size:12px;font-weight:600;color:#FEE7E7;">Export Payroll Report</span></button>' +
 
                    '<button style="display:flex;align-items:center;gap:10px;background:#430404;border:none;border-radius:10px;padding:12px 14px;cursor:pointer;width:100%;text-align:left;">' +
                    '<i data-lucide="send" style="width:15px;height:15px;color:#F66565;flex-shrink:0;"></i>' +
                    '<span style="font-size:12px;font-weight:600;color:#FEE7E7;">Send Payslips via Email</span></button>' +
 
                    '<button style="display:flex;align-items:center;gap:10px;background:#430404;border:none;border-radius:10px;padding:12px 14px;cursor:pointer;width:100%;text-align:left;">' +
                    '<i data-lucide="calculator" style="width:15px;height:15px;color:#F66565;flex-shrink:0;"></i>' +
                    '<span style="font-size:12px;font-weight:600;color:#FEE7E7;">Recalculate Deductions</span></button>' +
 
                    '<button style="display:flex;align-items:center;gap:10px;background:#430404;border:none;border-radius:10px;padding:12px 14px;cursor:pointer;width:100%;text-align:left;">' +
                    '<i data-lucide="file-plus" style="width:15px;height:15px;color:#F66565;flex-shrink:0;"></i>' +
                    '<span style="font-size:12px;font-weight:600;color:#FEE7E7;">Add Adjustment</span></button>' +
 
                    '</div></div>' +
 
                    // Status summary pill
                    '<div style="background:#FEE7E7;border-radius:16px;padding:18px;border:1px solid #FBBCBC;">' +
                    '<div style="font-size:12px;font-weight:800;color:#180101;margin-bottom:10px;">Payroll Status</div>' +
                    '<div style="display:flex;flex-direction:column;gap:8px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<span style="font-size:11px;color:#6b7280;">Employees Processed</span>' +
                    '<span style="font-size:11px;font-weight:700;color:#180101;">0 / 148</span></div>' +
                    '<div style="height:6px;background:#FBBCBC;border-radius:99px;"><div style="width:0%;height:100%;background:#F10E0E;border-radius:99px;"></div></div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">' +
                    '<span style="font-size:11px;color:#6b7280;">Approval Status</span>' +
                    '<span style="background:#FBBCBC;color:#B50B0B;font-size:10px;font-weight:700;padding:2px 10px;border-radius:99px;">Pending</span></div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<span style="font-size:11px;color:#6b7280;">Scheduled Release</span>' +
                    '<span style="font-size:11px;font-weight:700;color:#180101;">March 20, 2026</span></div>' +
                    '</div></div>' +
 
                    '</div>' +
                    '</div>';
 
                return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>' + head + '</head>' +
                    '<body style="margin:0;padding:0;background:#fafafa;">' +
                    '<div style="display:flex;min-height:100vh;">' +
                    sidebar +
                    '<div style="flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;">' +
 
                    // Topbar
                    '<div style="background:#fff;border-bottom:1px solid #FEE7E7;padding:14px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;">' +
                    '<div>' +
                    '<h1 style="font-size:20px;font-weight:900;color:#180101;margin:0;letter-spacing:-0.5px;">Payroll Dashboard</h1>' +
                    '<div style="font-size:11px;color:#9ca3af;margin-top:1px;">March 2026 &middot; Semi-monthly</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="background:#FEE7E7;border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:7px;cursor:pointer;">' +
                    '<i data-lucide="bell" style="width:15px;height:15px;color:#F10E0E;"></i>' +
                    '<span style="font-size:12px;font-weight:600;color:#B50B0B;">3 alerts</span></div>' +
                    '<div style="background:#F10E0E;border-radius:10px;padding:8px 16px;display:flex;align-items:center;gap:7px;cursor:pointer;">' +
                    '<i data-lucide="plus" style="width:14px;height:14px;color:#fff;"></i>' +
                    '<span style="font-size:12px;font-weight:700;color:#fff;">New Period</span></div>' +
                    '</div>' +
                    '</div>' +
 
                    // Main content
                    '<div style="flex:1;overflow-y:auto;padding:24px 28px 40px;">' +
                    statsRow +
                    payPeriodCard +
                    breakdownRow +
                    '</div>' +
 
                    '</div>' +
                    '</div>' +
                    '<script>if(window.lucide)lucide.createIcons();<\/script>' +
                    '</body></html>';
 
            })()
        },
 
 
        // ════════════════════════════════════════════════════
        // BLOCK 2 — Payroll Register / Employee List
        // ════════════════════════════════════════════════════
        {
            id: 'payroll-register',
            label: 'Payroll: Employee Register',
            category: 'Payroll Module',
            content: (function () {
 
                var head = '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>' +
                    '<script src="https://cdn.tailwindcss.com"><\/script>' +
                    '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"><\/script>' +
                    '<style>*{font-family:\'Plus Jakarta Sans\',sans-serif;}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#F33939;border-radius:99px}table{border-collapse:collapse;}th{background:#180101;color:#FEE7E7;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:12px 14px;white-space:nowrap;}td{padding:11px 14px;font-size:12px;color:#374151;border-bottom:1px solid #FEE7E7;white-space:nowrap;}tr:hover td{background:#FEE7E7;}</style>';
 
                var rows = [
                    ['HR-001','Juan dela Cruz','Branch Manager','₱33,000','22','₱1,500','₱34,500','₱1,440','₱660','₱200','₱3,200','₱5,500','₱29,000'],
                    ['HR-002','Maria Santos','HR Specialist','₱28,000','22','₱0','₱28,000','₱1,210','₱560','₱200','₱2,100','₱4,070','₱23,930'],
                    ['MKT-001','Jose Reyes','Marketing Lead','₱35,000','21','₱2,100','₱37,100','₱1,530','₱742','₱200','₱4,100','₱6,572','₱30,528'],
                    ['OPS-001','Ana Garcia','Operations Head','₱42,000','22','₱0','₱42,000','₱1,840','₱840','₱200','₱6,300','₱9,180','₱32,820'],
                    ['FIN-001','Carlo Bautista','Finance Officer','₱38,000','20','₱3,200','₱41,200','₱1,650','₱824','₱200','₱5,800','₱8,474','₱32,726'],
                    ['IT-001','Lea Villanueva','IT Manager','₱45,000','22','₱1,800','₱46,800','₱1,900','₱936','₱200','₱7,500','₱10,536','₱36,264'],
                    ['SLS-001','Ramon Cruz','Sales Associate','₱22,000','22','₱800','₱22,800','₱990','₱456','₱100','₱1,200','₱2,746','₱20,054'],
                    ['SLS-002','Cynthia Lim','Sales Associate','₱22,000','19','₱0','₱19,000','₱990','₱456','₱100','₱900','₱2,446','₱16,554'],
                ];
 
                var tableRows = rows.map(function(r, i) {
                    return '<tr>' +
                        '<td style="font-size:11px;"><span style="background:#FEE7E7;color:#B50B0B;padding:3px 8px;border-radius:6px;font-weight:700;">' + r[0] + '</span></td>' +
                        '<td><div style="font-weight:700;color:#180101;">' + r[1] + '</div></td>' +
                        '<td style="color:#6b7280;">' + r[2] + '</td>' +
                        '<td style="font-weight:700;color:#180101;">' + r[3] + '</td>' +
                        '<td style="text-align:center;">' + r[4] + '</td>' +
                        '<td style="color:#F10E0E;font-weight:600;">' + r[5] + '</td>' +
                        '<td style="font-weight:800;color:#180101;">' + r[6] + '</td>' +
                        '<td>' + r[7] + '</td>' +
                        '<td>' + r[8] + '</td>' +
                        '<td>' + r[9] + '</td>' +
                        '<td>' + r[10] + '</td>' +
                        '<td style="font-weight:700;color:#B50B0B;">' + r[11] + '</td>' +
                        '<td style="font-weight:800;color:#180101;">' + r[12] + '</td>' +
                        '<td>' +
                        '<button style="display:flex;align-items:center;gap:5px;background:#F10E0E;color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;">' +
                        '<i data-lucide="eye" style="width:12px;height:12px;color:#fff;"></i>View</button>' +
                        '</td>' +
                        '</tr>';
                }).join('');
 
                return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>' + head + '</head>' +
                    '<body style="margin:0;padding:0;background:#fafafa;font-family:\'Plus Jakarta Sans\',sans-serif;">' +
 
                    // Header
                    '<div style="background:#fff;border-bottom:1px solid #FEE7E7;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;">' +
                    '<div>' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">' +
                    '<span style="font-size:11px;color:#9ca3af;cursor:pointer;">Payroll</span>' +
                    '<span style="color:#d1d5db;font-size:11px;">/</span>' +
                    '<span style="font-size:11px;font-weight:700;color:#180101;">Payroll Register</span>' +
                    '</div>' +
                    '<h1 style="font-size:20px;font-weight:900;color:#180101;margin:0;">Employee Payroll Register</h1>' +
                    '<div style="font-size:11px;color:#9ca3af;margin-top:2px;">March 1 – 15, 2026 &middot; 148 employees</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
 
                    // Search
                    '<div style="background:#f9fafb;border:1px solid #FEE7E7;border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:8px;">' +
                    '<i data-lucide="search" style="width:14px;height:14px;color:#9ca3af;"></i>' +
                    '<span style="font-size:11px;color:#9ca3af;">Search employee...</span>' +
                    '</div>' +
 
                    // Filter
                    '<div style="background:#FEE7E7;border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:7px;cursor:pointer;">' +
                    '<i data-lucide="filter" style="width:14px;height:14px;color:#F10E0E;"></i>' +
                    '<span style="font-size:12px;font-weight:600;color:#B50B0B;">Filter</span>' +
                    '</div>' +
 
                    // Export
                    '<div style="background:#F10E0E;border-radius:10px;padding:8px 16px;display:flex;align-items:center;gap:7px;cursor:pointer;">' +
                    '<i data-lucide="download" style="width:14px;height:14px;color:#fff;"></i>' +
                    '<span style="font-size:12px;font-weight:700;color:#fff;">Export</span>' +
                    '</div>' +
 
                    '</div>' +
                    '</div>' +
 
                    // Summary bar
                    '<div style="background:#180101;padding:14px 28px;display:flex;align-items:center;gap:32px;">' +
                    '<div><div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:2px;">Gross Pay</div><div style="font-size:16px;font-weight:900;color:#FEE7E7;">₱4,872,600</div></div>' +
                    '<div style="width:1px;height:32px;background:#430404;"></div>' +
                    '<div><div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:2px;">Total Deductions</div><div style="font-size:16px;font-weight:900;color:#F66565;">₱1,024,330</div></div>' +
                    '<div style="width:1px;height:32px;background:#430404;"></div>' +
                    '<div><div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:2px;">Net Pay</div><div style="font-size:16px;font-weight:900;color:#fff;">₱3,848,270</div></div>' +
                    '<div style="margin-left:auto;display:flex;align-items:center;gap:8px;">' +
                    '<span style="background:#430404;color:#F66565;font-size:10px;font-weight:700;padding:4px 12px;border-radius:99px;">&#9679; Pending Approval</span>' +
                    '</div>' +
                    '</div>' +
 
                    // Table
                    '<div style="padding:24px 28px;overflow-x:auto;">' +
                    '<div style="background:#fff;border-radius:16px;border:1px solid #FEE7E7;overflow:hidden;box-shadow:0 2px 12px rgba(241,14,14,0.06);">' +
                    '<table style="width:100%;min-width:1100px;">' +
                    '<thead><tr>' +
                    '<th style="border-radius:0;">Employee ID</th>' +
                    '<th>Full Name</th>' +
                    '<th>Position</th>' +
                    '<th>Basic Salary</th>' +
                    '<th>Days Worked</th>' +
                    '<th>OT Pay</th>' +
                    '<th>Gross Pay</th>' +
                    '<th>SSS</th>' +
                    '<th>PhilHealth</th>' +
                    '<th>Pag-IBIG</th>' +
                    '<th>Tax</th>' +
                    '<th>Total Deductions</th>' +
                    '<th>Net Pay</th>' +
                    '<th>Action</th>' +
                    '</tr></thead>' +
                    '<tbody>' + tableRows + '</tbody>' +
                    '</table>' +
                    '</div>' +
 
                    // Pagination
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;">' +
                    '<span style="font-size:11px;color:#9ca3af;">Showing 8 of 148 employees</span>' +
                    '<div style="display:flex;align-items:center;gap:4px;">' +
                    '<button style="width:32px;height:32px;border-radius:8px;border:1px solid #FEE7E7;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;">' +
                    '<i data-lucide="chevron-left" style="width:14px;height:14px;color:#9ca3af;"></i></button>' +
                    '<button style="width:32px;height:32px;border-radius:8px;background:#F10E0E;border:none;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">1</button>' +
                    '<button style="width:32px;height:32px;border-radius:8px;border:1px solid #FEE7E7;background:#fff;font-size:12px;color:#6b7280;cursor:pointer;">2</button>' +
                    '<button style="width:32px;height:32px;border-radius:8px;border:1px solid #FEE7E7;background:#fff;font-size:12px;color:#6b7280;cursor:pointer;">3</button>' +
                    '<span style="font-size:12px;color:#9ca3af;padding:0 4px;">...</span>' +
                    '<button style="width:32px;height:32px;border-radius:8px;border:1px solid #FEE7E7;background:#fff;font-size:12px;color:#6b7280;cursor:pointer;">19</button>' +
                    '<button style="width:32px;height:32px;border-radius:8px;border:1px solid #FEE7E7;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;">' +
                    '<i data-lucide="chevron-right" style="width:14px;height:14px;color:#9ca3af;"></i></button>' +
                    '</div>' +
                    '</div>' +
 
                    '</div>' +
                    '<script>if(window.lucide)lucide.createIcons();<\/script>' +
                    '</body></html>';
 
            })()
        },
 
 
        // ════════════════════════════════════════════════════
        // BLOCK 3 — Individual Payslip
        // ════════════════════════════════════════════════════
        {
            id: 'payroll-individual-payslip',
            label: 'Payroll: Individual Payslip',
            category: 'Payroll Module',
            content: (function () {
 
                var head = '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>' +
                    '<script src="https://cdn.tailwindcss.com"><\/script>' +
                    '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"><\/script>' +
                    '<style>*{font-family:\'Plus Jakarta Sans\',sans-serif;}@media print{.no-print{display:none!important;}.payslip{box-shadow:none!important;}}</style>';
 
                return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>' + head + '</head>' +
                    '<body style="margin:0;padding:0;background:#f3f4f6;">' +
 
                    // Action bar
                    '<div class="no-print" style="background:#180101;padding:12px 32px;display:flex;align-items:center;justify-content:space-between;">' +
                    '<div style="display:flex;align-items:center;gap:10px;cursor:pointer;">' +
                    '<i data-lucide="arrow-left" style="width:16px;height:16px;color:#F66565;"></i>' +
                    '<span style="font-size:12px;color:#F66565;font-weight:600;">Back to Register</span>' +
                    '</div>' +
                    '<div style="display:flex;gap:10px;">' +
                    '<button style="display:flex;align-items:center;gap:7px;background:#430404;border:none;border-radius:10px;padding:9px 18px;cursor:pointer;">' +
                    '<i data-lucide="download" style="width:14px;height:14px;color:#F66565;"></i>' +
                    '<span style="font-size:12px;font-weight:700;color:#FEE7E7;">Download PDF</span></button>' +
                    '<button onclick="window.print()" style="display:flex;align-items:center;gap:7px;background:#F10E0E;border:none;border-radius:10px;padding:9px 18px;cursor:pointer;">' +
                    '<i data-lucide="printer" style="width:14px;height:14px;color:#fff;"></i>' +
                    '<span style="font-size:12px;font-weight:700;color:#fff;">Print Payslip</span></button>' +
                    '</div>' +
                    '</div>' +
 
                    // Payslip card
                    '<div style="max-width:680px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);" class="payslip">' +
 
                    // Header band
                    '<div style="background:#180101;padding:28px 32px;position:relative;overflow:hidden;">' +
                    '<div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;border-radius:50%;background:#430404;opacity:0.5;"></div>' +
                    '<div style="position:absolute;bottom:-30px;right:60px;width:80px;height:80px;border-radius:50%;background:#6F0606;opacity:0.4;"></div>' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;position:relative;">' +
                    '<div style="display:flex;align-items:center;gap:14px;">' +
                    '<div style="width:48px;height:48px;background:#F10E0E;border-radius:14px;display:flex;align-items:center;justify-content:center;">' +
                    '<span style="color:#fff;font-weight:900;font-size:20px;">B</span></div>' +
                    '<div>' +
                    '<div style="font-size:20px;font-weight:900;color:#fff;line-height:1;">BENCH APPAREL</div>' +
                    '<div style="font-size:11px;color:#F66565;margin-top:2px;">Enterprise Resource Planning System</div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                    '<div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#9A0909;margin-bottom:2px;">Payslip</div>' +
                    '<div style="font-size:13px;font-weight:800;color:#FEE7E7;">March 1 – 15, 2026</div>' +
                    '<div style="font-size:10px;color:#6F0606;margin-top:2px;">Released: March 20, 2026</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
 
                    // Employee info band
                    '<div style="background:#FEE7E7;padding:20px 32px;display:flex;align-items:center;justify-content:space-between;">' +
                    '<div style="display:flex;align-items:center;gap:14px;">' +
                    '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#F10E0E,#9A0909);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:800;">JC</div>' +
                    '<div>' +
                    '<div style="font-size:16px;font-weight:900;color:#180101;">Juan dela Cruz</div>' +
                    '<div style="font-size:11px;color:#B50B0B;font-weight:600;margin-top:1px;">Branch Manager &middot; BGC High Street</div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                    '<div style="font-size:11px;color:#9ca3af;">Employee ID</div>' +
                    '<div style="font-size:15px;font-weight:900;color:#180101;">HR-001</div>' +
                    '<div style="font-size:10px;color:#9ca3af;margin-top:2px;">SSS: 34-1234567-8</div>' +
                    '</div>' +
                    '</div>' +
 
                    // Body
                    '<div style="padding:28px 32px;">' +
 
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">' +
 
                    // Earnings
                    '<div>' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">' +
                    '<div style="width:28px;height:28px;background:#FEE7E7;border-radius:8px;display:flex;align-items:center;justify-content:center;">' +
                    '<i data-lucide="trending-up" style="width:14px;height:14px;color:#F10E0E;"></i></div>' +
                    '<span style="font-size:13px;font-weight:800;color:#180101;">Earnings</span>' +
                    '</div>' +
                    '<div style="background:#fafafa;border-radius:12px;overflow:hidden;border:1px solid #FEE7E7;">' +
                    '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #FEE7E7;">' +
                    '<span style="font-size:11px;color:#6b7280;">Basic Salary</span><span style="font-size:11px;font-weight:700;color:#180101;">₱33,000.00</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #FEE7E7;">' +
                    '<span style="font-size:11px;color:#6b7280;">Rice Allowance</span><span style="font-size:11px;font-weight:700;color:#180101;">₱1,500.00</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #FEE7E7;">' +
                    '<span style="font-size:11px;color:#6b7280;">Transport Allowance</span><span style="font-size:11px;font-weight:700;color:#180101;">₱800.00</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:10px 14px;">' +
                    '<span style="font-size:11px;color:#F10E0E;font-weight:600;">Overtime (3 hrs)</span><span style="font-size:11px;font-weight:700;color:#F10E0E;">₱1,500.00</span></div>' +
                    '</div>' +
                    '</div>' +
 
                    // Deductions
                    '<div>' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">' +
                    '<div style="width:28px;height:28px;background:#FEE7E7;border-radius:8px;display:flex;align-items:center;justify-content:center;">' +
                    '<i data-lucide="minus-circle" style="width:14px;height:14px;color:#B50B0B;"></i></div>' +
                    '<span style="font-size:13px;font-weight:800;color:#180101;">Deductions</span>' +
                    '</div>' +
                    '<div style="background:#fafafa;border-radius:12px;overflow:hidden;border:1px solid #FEE7E7;">' +
                    '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #FEE7E7;">' +
                    '<span style="font-size:11px;color:#6b7280;">SSS Contribution</span><span style="font-size:11px;font-weight:700;color:#B50B0B;">- ₱1,440.00</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #FEE7E7;">' +
                    '<span style="font-size:11px;color:#6b7280;">PhilHealth</span><span style="font-size:11px;font-weight:700;color:#B50B0B;">- ₱660.00</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #FEE7E7;">' +
                    '<span style="font-size:11px;color:#6b7280;">Pag-IBIG</span><span style="font-size:11px;font-weight:700;color:#B50B0B;">- ₱200.00</span></div>' +
                    '<div style="display:flex;justify-content:space-between;padding:10px 14px;">' +
                    '<span style="font-size:11px;color:#6b7280;">Withholding Tax</span><span style="font-size:11px;font-weight:700;color:#B50B0B;">- ₱3,200.00</span></div>' +
                    '</div>' +
                    '</div>' +
 
                    '</div>' +
 
                    // Summary
                    '<div style="background:#180101;border-radius:16px;padding:20px 24px;">' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;">' +
                    '<div style="padding-right:20px;border-right:1px solid #430404;">' +
                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:4px;">Gross Pay</div>' +
                    '<div style="font-size:22px;font-weight:900;color:#FEE7E7;">₱36,800</div>' +
                    '</div>' +
                    '<div style="padding:0 20px;border-right:1px solid #430404;">' +
                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:4px;">Total Deductions</div>' +
                    '<div style="font-size:22px;font-weight:900;color:#F66565;">₱5,500</div>' +
                    '</div>' +
                    '<div style="padding-left:20px;">' +
                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:4px;">Net Pay</div>' +
                    '<div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-1px;">₱31,300</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
 
                    '</div>' +
 
                    // Footer
                    '<div style="background:#FEE7E7;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;">' +
                    '<div style="font-size:10px;color:#9A0909;">This is a system-generated payslip. No signature required.</div>' +
                    '<div style="font-size:10px;color:#9A0909;">Generated: March 20, 2026 08:00 AM</div>' +
                    '</div>' +
 
                    '</div>' +
 
                    '<script>if(window.lucide)lucide.createIcons();<\/script>' +
                    '</body></html>';
 
            })()
        },
 
 
        // ════════════════════════════════════════════════════
        // BLOCK 4 — Payroll History
        // ════════════════════════════════════════════════════
        {
            id: 'payroll-history',
            label: 'Payroll: History',
            category: 'Payroll Module',
            content: (function () {
 
                var head = '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>' +
                    '<script src="https://cdn.tailwindcss.com"><\/script>' +
                    '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"><\/script>' +
                    '<style>*{font-family:\'Plus Jakarta Sans\',sans-serif;}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#F33939;border-radius:99px}</style>';
 
                var historyData = [
                    {period:'Mar 1 – 15, 2026', run:'March 20, 2026', emp:'148', total:'₱3,848,270', status:'pending', statusLabel:'Pending'},
                    {period:'Feb 16 – 28, 2026', run:'March 5, 2026', emp:'148', total:'₱3,812,440', status:'completed', statusLabel:'Completed'},
                    {period:'Feb 1 – 15, 2026', run:'Feb 20, 2026', emp:'146', total:'₱3,790,120', status:'completed', statusLabel:'Completed'},
                    {period:'Jan 16 – 31, 2026', run:'Feb 5, 2026', emp:'145', total:'₱3,765,800', status:'completed', statusLabel:'Completed'},
                    {period:'Jan 1 – 15, 2026', run:'Jan 20, 2026', emp:'145', total:'₱3,751,600', status:'completed', statusLabel:'Completed'},
                    {period:'Dec 16 – 31, 2025', run:'Jan 5, 2026', emp:'143', total:'₱4,120,500', status:'completed', statusLabel:'Completed'},
                    {period:'Dec 1 – 15, 2025', run:'Dec 20, 2025', emp:'143', total:'₱3,698,900', status:'completed', statusLabel:'Completed'},
                    {period:'Nov 16 – 30, 2025', run:'Dec 5, 2025', emp:'141', total:'₱3,650,200', status:'completed', statusLabel:'Completed'},
                ];
 
                var cards = historyData.map(function(h, i) {
                    var isPending = h.status === 'pending';
                    var statusBg = isPending ? '#FEE7E7' : '#dcfce7';
                    var statusColor = isPending ? '#B50B0B' : '#15803d';
                    var statusDot = isPending ? '#F10E0E' : '#22c55e';
                    return '<div style="background:#fff;border-radius:16px;border:1px solid ' + (isPending ? '#FBBCBC' : '#e5e7eb') + ';padding:18px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 1px 6px rgba(0,0,0,0.04);">' +
 
                        // Period icon
                        '<div style="width:44px;height:44px;background:' + (isPending ? '#FEE7E7' : '#f3f4f6') + ';border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                        '<i data-lucide="calendar" style="width:20px;height:20px;color:' + (isPending ? '#F10E0E' : '#6b7280') + ';"></i></div>' +
 
                        // Period info
                        '<div style="flex:1;min-width:0;">' +
                        '<div style="font-size:14px;font-weight:800;color:#180101;margin-bottom:2px;">' + h.period + '</div>' +
                        '<div style="font-size:11px;color:#9ca3af;">Released: ' + h.run + '</div>' +
                        '</div>' +
 
                        // Employees
                        '<div style="text-align:center;min-width:70px;">' +
                        '<div style="font-size:18px;font-weight:900;color:#180101;">' + h.emp + '</div>' +
                        '<div style="font-size:10px;color:#9ca3af;">Employees</div>' +
                        '</div>' +
 
                        '<div style="width:1px;height:32px;background:#f3f4f6;"></div>' +
 
                        // Total
                        '<div style="text-align:right;min-width:110px;">' +
                        '<div style="font-size:18px;font-weight:900;color:#180101;">' + h.total + '</div>' +
                        '<div style="font-size:10px;color:#9ca3af;">Total Disbursed</div>' +
                        '</div>' +
 
                        '<div style="width:1px;height:32px;background:#f3f4f6;"></div>' +
 
                        // Status badge
                        '<div style="display:flex;align-items:center;gap:6px;background:' + statusBg + ';padding:6px 14px;border-radius:99px;min-width:110px;justify-content:center;">' +
                        '<div style="width:6px;height:6px;border-radius:50%;background:' + statusDot + ';flex-shrink:0;"></div>' +
                        '<span style="font-size:11px;font-weight:700;color:' + statusColor + ';">' + h.statusLabel + '</span>' +
                        '</div>' +
 
                        // Actions
                        '<div style="display:flex;gap:6px;">' +
                        '<button style="display:flex;align-items:center;gap:5px;background:#FEE7E7;border:none;border-radius:9px;padding:7px 12px;cursor:pointer;">' +
                        '<i data-lucide="eye" style="width:13px;height:13px;color:#F10E0E;"></i>' +
                        '<span style="font-size:11px;font-weight:700;color:#B50B0B;">View</span></button>' +
                        (isPending ? '' :
                            '<button style="display:flex;align-items:center;gap:5px;background:#f3f4f6;border:none;border-radius:9px;padding:7px 12px;cursor:pointer;">' +
                            '<i data-lucide="download" style="width:13px;height:13px;color:#6b7280;"></i>' +
                            '<span style="font-size:11px;font-weight:700;color:#6b7280;">Export</span></button>') +
                        '</div>' +
 
                        '</div>';
                }).join('');
 
                // Yearly summary bar chart
                var monthlyTotals = [3.62, 3.65, 3.70, 3.75, 3.81, 4.12, 3.76, 3.79, 3.81, 3.85];
                var maxVal = 4.12;
                var barChart = '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:8px;height:80px;margin-bottom:8px;">' +
                    monthlyTotals.map(function(v, i) {
                        var pct = Math.round((v / maxVal) * 100);
                        var isLast = i === monthlyTotals.length - 1;
                        return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
                            '<div style="width:100%;border-radius:6px 6px 0 0;background:' + (isLast ? '#F10E0E' : '#FBBCBC') + ';height:' + pct + '%;"></div>' +
                            '</div>';
                    }).join('') +
                    '</div>';
 
                var months = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
                var barLabels = '<div style="display:flex;justify-content:space-between;gap:8px;">' +
                    months.map(function(m){ return '<div style="flex:1;text-align:center;font-size:9px;color:#9ca3af;">' + m + '</div>'; }).join('') +
                    '</div>';
 
                return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>' + head + '</head>' +
                    '<body style="margin:0;padding:0;background:#fafafa;">' +
 
                    // Page header
                    '<div style="background:#fff;border-bottom:1px solid #FEE7E7;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;">' +
                    '<div>' +
                    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">' +
                    '<span style="font-size:11px;color:#9ca3af;cursor:pointer;">Payroll</span>' +
                    '<span style="color:#d1d5db;font-size:11px;">/</span>' +
                    '<span style="font-size:11px;font-weight:700;color:#180101;">History</span>' +
                    '</div>' +
                    '<h1 style="font-size:20px;font-weight:900;color:#180101;margin:0;">Payroll History</h1>' +
                    '<div style="font-size:11px;color:#9ca3af;margin-top:2px;">All past payroll runs &middot; Fiscal Year 2025–2026</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<div style="background:#f9fafb;border:1px solid #FEE7E7;border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:7px;">' +
                    '<i data-lucide="calendar" style="width:14px;height:14px;color:#9ca3af;"></i>' +
                    '<span style="font-size:11px;color:#9ca3af;">FY 2025–2026 &#9660;</span>' +
                    '</div>' +
                    '<div style="background:#F10E0E;border-radius:10px;padding:8px 16px;display:flex;align-items:center;gap:7px;cursor:pointer;">' +
                    '<i data-lucide="download" style="width:14px;height:14px;color:#fff;"></i>' +
                    '<span style="font-size:12px;font-weight:700;color:#fff;">Export All</span>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
 
                    '<div style="padding:24px 28px;max-width:1200px;">' +
 
                    // Top stats + chart
                    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 2fr;gap:16px;margin-bottom:24px;">' +
 
                    '<div style="background:#180101;border-radius:16px;padding:18px 20px;">' +
                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:8px;">Total Runs (FY)</div>' +
                    '<div style="font-size:28px;font-weight:900;color:#fff;line-height:1;">20</div>' +
                    '<div style="font-size:11px;color:#6F0606;margin-top:4px;">Semi-monthly</div>' +
                    '</div>' +
 
                    '<div style="background:#FEE7E7;border-radius:16px;padding:18px 20px;border:1px solid #FBBCBC;">' +
                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:8px;">Total Disbursed</div>' +
                    '<div style="font-size:22px;font-weight:900;color:#180101;line-height:1;letter-spacing:-0.5px;">₱76.2M</div>' +
                    '<div style="font-size:11px;color:#B50B0B;margin-top:4px;">&#9650; 8.4% vs last FY</div>' +
                    '</div>' +
 
                    '<div style="background:#FBBCBC;border-radius:16px;padding:18px 20px;">' +
                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9A0909;margin-bottom:8px;">Avg per Period</div>' +
                    '<div style="font-size:22px;font-weight:900;color:#180101;line-height:1;letter-spacing:-0.5px;">₱3.81M</div>' +
                    '<div style="font-size:11px;color:#9A0909;margin-top:4px;">148 avg employees</div>' +
                    '</div>' +
 
                    // Trend chart
                    '<div style="background:#fff;border-radius:16px;padding:18px 20px;border:1px solid #FEE7E7;">' +
                    '<div style="font-size:12px;font-weight:800;color:#180101;margin-bottom:14px;">Monthly Disbursement Trend (₱M)</div>' +
                    barChart +
                    barLabels +
                    '</div>' +
 
                    '</div>' +
 
                    // History list
                    '<div style="display:flex;flex-direction:column;gap:10px;">' +
                    cards +
                    '</div>' +
 
                    '</div>' +
 
                    '<script>if(window.lucide)lucide.createIcons();<\/script>' +
                    '</body></html>';
 
            })()
        },

        {
            id: 'saas-revenue-dashboard',
            label: 'SaaS: Revenue Dashboard',
            category: 'Dashboards',
            content: (function () {

                // ── Avatars ──────────────────────────────────────────────
                var avatars =
                    '<div style="display:flex;align-items:center;gap:6px;">' +
                    '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#be185d);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800;border:2px solid #fff;box-shadow:0 0 0 1px #fce7f3;">AA</div>' +
                    '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f43f5e,#e11d48);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800;border:2px solid #fff;box-shadow:0 0 0 1px #fce7f3;margin-left:-8px;">EY</div>' +
                    '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#db2777,#9d174d);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800;border:2px solid #fff;box-shadow:0 0 0 1px #fce7f3;margin-left:-8px;">MA</div>' +
                    '<div style="width:24px;height:24px;border-radius:50%;border:2px dashed #f9a8d4;display:flex;align-items:center;justify-content:center;color:#ec4899;font-size:13px;font-weight:700;margin-left:-6px;">+</div>' +
                    '</div>';

                // ── Sidebar ──────────────────────────────────────────────
                var sidebar =
                    '<div style="width:200px;min-height:100vh;background:#fff;border-right:1px solid #f3f4f6;display:flex;flex-direction:column;flex-shrink:0;">' +

                    // Logo
                    '<div style="padding:18px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:8px;">' +
                    '<div style="width:28px;height:28px;background:#ec4899;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span style="color:#fff;font-weight:900;font-size:12px;">C</span></div>' +
                    '<div style="flex:1;"><div style="font-size:13px;font-weight:800;color:#111;line-height:1;">Codename</div><div style="font-size:10px;color:#9ca3af;margin-top:1px;">Sales Platform</div></div>' +
                    '<span style="color:#9ca3af;font-size:10px;">&#9660;</span>' +
                    '</div>' +

                    // Nav
                    '<div style="padding:12px 10px;flex:1;overflow:hidden;">' +

                    // Starred / Recent
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;margin-bottom:2px;">' +
                    '<span style="font-size:12px;color:#9ca3af;">&#9733;</span><span style="font-size:11px;color:#6b7280;">Starred</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
                    '<span style="font-size:12px;color:#9ca3af;">&#9716;</span><span style="font-size:11px;color:#6b7280;">Recent</span></div>' +

                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d1d5db;padding:0 10px;margin-bottom:4px;">Sales</div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;"><span style="font-size:11px;color:#6b7280;">Sales list</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;"><span style="font-size:11px;color:#6b7280;">Goals</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;background:#fdf2f8;cursor:pointer;margin-bottom:8px;"><span style="font-size:11px;color:#ec4899;font-weight:700;">Dashboard</span></div>' +

                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d1d5db;padding:0 10px;margin-bottom:4px;">Shared with me</div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;"><span style="font-size:11px;color:#6b7280;">Cargo2go</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:11px;color:#6b7280;">Cloudr3r</span><span style="background:#fce7f3;color:#ec4899;font-size:9px;font-weight:700;padding:2px 6px;border-radius:99px;">2</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;"><span style="font-size:11px;color:#6b7280;">Idiome</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;"><span style="font-size:11px;color:#6b7280;">Syllebles</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:8px;"><span style="font-size:11px;color:#6b7280;">x-0b</span></div>' +

                    '<div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d1d5db;padding:0 10px;margin-bottom:4px;">Reports</div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;"><span style="font-size:11px;color:#6b7280;">Deals by user</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;"><span style="font-size:11px;color:#6b7280;">Deal duration</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;margin-bottom:2px;"><span style="font-size:11px;color:#ec4899;font-weight:600;">New report</span></div>' +
                    '<div style="padding:7px 10px;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:11px;color:#6b7280;">Analytics</span><span style="background:#fce7f3;color:#ec4899;font-size:9px;font-weight:700;padding:2px 6px;border-radius:99px;">7</span></div>' +

                    '</div>' +

                    // Bottom
                    '<div style="padding:14px 16px;border-top:1px solid #f3f4f6;">' +
                    '<div style="font-size:10px;color:#9ca3af;cursor:pointer;display:flex;align-items:center;gap:6px;">&#128193; Manage folders</div>' +
                    '</div>' +

                    '</div>';

                // ── Top Bar ──────────────────────────────────────────────
                var topbar =
                    '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 24px;border-bottom:1px solid #f3f4f6;background:#fff;position:sticky;top:0;z-index:10;">' +
                    '<div style="display:flex;align-items:center;gap:6px;">' +
                    '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#be185d);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800;border:2px solid #fff;">AA</div>' +
                    '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f43f5e,#e11d48);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800;border:2px solid #fff;margin-left:-8px;">EY</div>' +
                    '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#db2777,#9d174d);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800;border:2px solid #fff;margin-left:-8px;">MA</div>' +
                    '<div style="width:24px;height:24px;border-radius:50%;border:2px dashed #f9a8d4;display:flex;align-items:center;justify-content:center;color:#ec4899;font-size:13px;margin-left:-6px;">+</div>' +
                    '</div>' +
                    '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:8px 14px;display:flex;align-items:center;gap:8px;min-width:220px;">' +
                    '<span style="color:#9ca3af;font-size:12px;">&#128269;</span>' +
                    '<span style="font-size:11px;color:#9ca3af;font-style:italic;">Try searching &#8220;insights&#8221;</span>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:8px;">' +
                    '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#f9a8d4,#ec4899);"></div>' +
                    '<div style="width:32px;height:32px;border-radius:50%;background:#ec4899;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:300;cursor:pointer;">+</div>' +
                    '</div>' +
                    '</div>';

                // ── Revenue Hero ─────────────────────────────────────────
                var revenueHero =
                    '<div style="background:#fff;border-radius:16px;border:1px solid #f3f4f6;padding:20px 24px;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-bottom:16px;">' +

                    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">' +
                    '<div>' +
                    '<div style="font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;">Revenue</div>' +
                    '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">' +
                    '<span style="font-size:38px;font-weight:900;color:#111;letter-spacing:-2px;line-height:1;">$528,976</span>' +
                    '<span style="font-size:22px;font-weight:900;color:#d1d5db;">.82</span>' +
                    '<span style="background:#fce7f3;color:#ec4899;font-size:10px;font-weight:700;padding:3px 8px;border-radius:99px;">+7.8k</span>' +
                    '<span style="background:#fff1f2;color:#f43f5e;font-size:10px;font-weight:600;padding:3px 8px;border-radius:99px;">-$27,335.09</span>' +
                    '</div>' +
                    '<div style="font-size:11px;color:#9ca3af;margin-top:4px;">vs prev. $501,641.73 &middot; Jun 1 &ndash; Aug 31, 2023</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">' +
                    '<div style="background:#f3f4f6;border-radius:99px;padding:6px 12px;display:flex;align-items:center;gap:6px;">' +
                    '<div style="width:32px;height:16px;background:#ec4899;border-radius:99px;position:relative;"><div style="position:absolute;right:2px;top:2px;width:12px;height:12px;background:#fff;border-radius:50%;"></div></div>' +
                    '<span style="font-size:10px;color:#374151;font-weight:600;white-space:nowrap;">Timeframe</span>' +
                    '</div>' +
                    '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:6px 12px;font-size:11px;color:#374151;white-space:nowrap;">Sep 1 &ndash; Nov 30 &#9660;</div>' +
                    '</div>' +
                    '</div>' +

                    // 4 metric tiles
                    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">' +

                    // Top Sales
                    '<div style="background:#f9fafb;border-radius:12px;padding:14px;">' +
                    '<div style="font-size:10px;color:#9ca3af;margin-bottom:4px;">Top sales</div>' +
                    '<div style="font-size:22px;font-weight:900;color:#111;line-height:1;margin-bottom:8px;">72</div>' +
                    '<div style="display:flex;align-items:center;gap:6px;">' +
                    '<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#be185d);display:flex;align-items:center;justify-content:center;color:#fff;font-size:8px;font-weight:800;">M</div>' +
                    '<span style="font-size:10px;color:#6b7280;">Mikasa</span>' +
                    '<span style="margin-left:auto;color:#d1d5db;font-size:11px;">&#8250;</span>' +
                    '</div>' +
                    '</div>' +

                    // Best Deal
                    '<div style="background:#111;border-radius:12px;padding:14px;position:relative;">' +
                    '<div style="font-size:10px;color:#6b7280;margin-bottom:4px;">Best deal</div>' +
                    '<div style="font-size:22px;font-weight:900;color:#fff;line-height:1;margin-bottom:2px;">$42,300</div>' +
                    '<div style="font-size:10px;color:#6b7280;">Rolf Inc.</div>' +
                    '<span style="position:absolute;top:10px;right:12px;color:#4b5563;font-size:12px;cursor:pointer;">&times;</span>' +
                    '</div>' +

                    // Deals
                    '<div style="background:#f9fafb;border-radius:12px;padding:14px;">' +
                    '<div style="font-size:10px;color:#9ca3af;margin-bottom:4px;">Deals</div>' +
                    '<div style="font-size:22px;font-weight:900;color:#111;line-height:1;margin-bottom:8px;">265</div>' +
                    '<div style="font-size:10px;color:#ec4899;font-weight:600;">&#9650; +5</div>' +
                    '</div>' +

                    // Value / Win rate
                    '<div style="background:#f9fafb;border-radius:12px;padding:14px;">' +
                    '<div style="display:flex;gap:16px;margin-bottom:10px;">' +
                    '<div><div style="font-size:10px;color:#9ca3af;">Value</div><div style="font-size:16px;font-weight:900;color:#ec4899;">$28k</div><div style="font-size:9px;color:#9ca3af;">&#9650; 7.9%</div></div>' +
                    '<div><div style="font-size:10px;color:#9ca3af;">Win rate</div><div style="font-size:16px;font-weight:900;color:#374151;">66%</div><div style="font-size:9px;color:#9ca3af;">&#9650; 1.2%</div></div>' +
                    '</div>' +
                    '<button style="width:100%;background:#ec4899;color:#fff;border:none;border-radius:8px;padding:7px;font-size:10px;font-weight:700;cursor:pointer;letter-spacing:1px;">Details</button>' +
                    '</div>' +

                    '</div>' +
                    '</div>';

                // ── Platform Breakdown ────────────────────────────────────
                var platformPanel =
                    '<div style="background:#fff;border-radius:16px;border:1px solid #f3f4f6;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
                    '<div style="font-size:13px;font-weight:800;color:#111;">Platform breakdown</div>' +
                    '<span style="font-size:11px;color:#9ca3af;cursor:pointer;">Filters &#9660;</span>' +
                    '</div>' +

                    // Dribbble
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
                    '<span style="font-size:16px;">&#127936;</span>' +
                    '<div style="flex:1;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#374151;">Dribbble</span><span style="font-size:11px;color:#6b7280;">$227,459 <span style="color:#d1d5db;">43%</span></span></div>' +
                    '<div style="height:5px;background:#f3f4f6;border-radius:99px;"><div style="width:43%;height:100%;background:#ec4899;border-radius:99px;"></div></div>' +
                    '</div></div>' +

                    // Instagram
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
                    '<span style="font-size:16px;">&#128247;</span>' +
                    '<div style="flex:1;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#374151;">Instagram</span><span style="font-size:11px;color:#6b7280;">$142,023 <span style="color:#d1d5db;">27%</span></span></div>' +
                    '<div style="height:5px;background:#f3f4f6;border-radius:99px;"><div style="width:27%;height:100%;background:#f472b6;border-radius:99px;"></div></div>' +
                    '</div></div>' +

                    // Behance
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
                    '<span style="font-size:16px;">&#127912;</span>' +
                    '<div style="flex:1;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#374151;">Behance</span><span style="font-size:11px;color:#6b7280;">$89,935 <span style="color:#d1d5db;">11%</span></span></div>' +
                    '<div style="height:5px;background:#f3f4f6;border-radius:99px;"><div style="width:11%;height:100%;background:#fbcfe8;border-radius:99px;"></div></div>' +
                    '</div></div>' +

                    // Google
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">' +
                    '<span style="font-size:16px;">&#128269;</span>' +
                    '<div style="flex:1;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#374151;">Google</span><span style="font-size:11px;color:#6b7280;">$37,028 <span style="color:#d1d5db;">7%</span></span></div>' +
                    '<div style="height:5px;background:#f3f4f6;border-radius:99px;"><div style="width:7%;height:100%;background:#fce7f3;border-radius:99px;"></div></div>' +
                    '</div></div>' +

                    // Mini bar chart
                    '<div style="background:#f9fafb;border-radius:12px;padding:12px;">' +
                    '<div style="font-size:10px;color:#9ca3af;margin-bottom:2px;">Platform value &middot; <span style="color:#ec4899;font-weight:600;">Dribbble</span></div>' +
                    '<div style="font-size:15px;font-weight:900;color:#111;margin-bottom:10px;">$18,962</div>' +
                    '<div style="display:flex;align-items:flex-end;gap:3px;height:36px;">' +
                    '<div style="flex:1;background:#e5e7eb;border-radius:3px 3px 0 0;height:40%;"></div>' +
                    '<div style="flex:1;background:#e5e7eb;border-radius:3px 3px 0 0;height:65%;"></div>' +
                    '<div style="flex:1;background:#e5e7eb;border-radius:3px 3px 0 0;height:45%;"></div>' +
                    '<div style="flex:1;background:#fbcfe8;border-radius:3px 3px 0 0;height:75%;"></div>' +
                    '<div style="flex:1;background:#ec4899;border-radius:3px 3px 0 0;height:100%;"></div>' +
                    '<div style="flex:1;background:#f9a8d4;border-radius:3px 3px 0 0;height:80%;"></div>' +
                    '<div style="flex:1;background:#e5e7eb;border-radius:3px 3px 0 0;height:55%;"></div>' +
                    '<div style="flex:1;background:#e5e7eb;border-radius:3px 3px 0 0;height:70%;"></div>' +
                    '<div style="flex:1;background:#fbcfe8;border-radius:3px 3px 0 0;height:85%;"></div>' +
                    '<div style="flex:1;background:#e5e7eb;border-radius:3px 3px 0 0;height:60%;"></div>' +
                    '</div>' +
                    '<div style="display:flex;justify-content:space-between;font-size:9px;color:#d1d5db;margin-top:4px;"><span>Oct</span><span>Nov</span></div>' +
                    '</div>' +
                    '</div>';

                // ── Deals Chart Panel ─────────────────────────────────────
                var dealsPanel =
                    '<div style="background:#fff;border-radius:16px;border:1px solid #f3f4f6;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">' +
                    '<div style="font-size:13px;font-weight:800;color:#111;">Deals amount</div>' +
                    '<span style="font-size:11px;color:#9ca3af;cursor:pointer;">Filters &#9660;</span>' +
                    '</div>' +
                    '<div style="font-size:10px;color:#9ca3af;margin-bottom:14px;">by referrer category &#9660;</div>' +

                    // Grouped bar chart
                    '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:3px;height:90px;margin-bottom:10px;">' +
                    '<div style="flex:1;background:#f3f4f6;border-radius:3px 3px 0 0;" style="height:35%;"></div>' +
                    '<div style="flex:1;background:#fbcfe8;border-radius:3px 3px 0 0;height:58%;"></div>' +
                    '<div style="flex:1;background:#f3f4f6;border-radius:3px 3px 0 0;height:40%;"></div>' +
                    '<div style="flex:1;background:#ec4899;border-radius:3px 3px 0 0;height:88%;"></div>' +
                    '<div style="flex:1;background:#f9a8d4;border-radius:3px 3px 0 0;height:55%;"></div>' +
                    '<div style="flex:1;background:#be185d;border-radius:3px 3px 0 0;height:100%;"></div>' +
                    '<div style="flex:1;background:#f3f4f6;border-radius:3px 3px 0 0;height:62%;"></div>' +
                    '<div style="flex:1;background:#fbcfe8;border-radius:3px 3px 0 0;height:48%;"></div>' +
                    '<div style="flex:1;background:#f472b6;border-radius:3px 3px 0 0;height:77%;"></div>' +
                    '<div style="flex:1;background:#f3f4f6;border-radius:3px 3px 0 0;height:55%;"></div>' +
                    '<div style="flex:1;background:#f9a8d4;border-radius:3px 3px 0 0;height:68%;"></div>' +
                    '<div style="flex:1;background:#ec4899;border-radius:3px 3px 0 0;height:84%;"></div>' +
                    '</div>' +

                    '<div style="display:flex;justify-content:center;gap:16px;padding:10px 0;border-top:1px solid #f3f4f6;">' +
                    '<div style="display:flex;align-items:center;gap:5px;"><div style="width:8px;height:8px;border-radius:50%;background:#ec4899;"></div><span style="font-size:10px;color:#9ca3af;">Revenue</span></div>' +
                    '<div style="display:flex;align-items:center;gap:5px;"><div style="width:8px;height:8px;border-radius:50%;background:#fbcfe8;"></div><span style="font-size:10px;color:#9ca3af;">Leads</span></div>' +
                    '<div style="display:flex;align-items:center;gap:5px;"><div style="width:8px;height:8px;border-radius:50%;background:#f3f4f6;"></div><span style="font-size:10px;color:#9ca3af;">W/L</span></div>' +
                    '</div>' +

                    // Platform value pill
                    '<div style="margin-top:10px;background:#fdf2f8;border:1px solid #fce7f3;border-radius:12px;padding:12px;display:flex;align-items:center;justify-content:space-between;">' +
                    '<div><div style="font-size:10px;color:#9ca3af;">Platform value</div><div style="font-size:14px;font-weight:900;color:#be185d;">$156,841</div></div>' +
                    '<span style="background:#fce7f3;color:#ec4899;font-size:9px;font-weight:700;padding:3px 8px;border-radius:99px;">+3</span>' +
                    '</div>' +
                    '</div>';

                // ── Top Review Panel ──────────────────────────────────────
                var topReviewPanel =
                    '<div style="background:#fff;border-radius:16px;border:1px solid #f3f4f6;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">' +
                    '<div style="font-size:13px;font-weight:800;color:#111;margin-bottom:12px;">Top review &#11088;</div>' +
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">' +
                    '<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#f43f5e,#e11d48);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;flex-shrink:0;">EY</div>' +
                    '<div><div style="font-size:12px;font-weight:700;color:#111;">Eren Y.</div><div style="font-size:10px;color:#9ca3af;">Senior Account Exec</div></div>' +
                    '</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">' +
                    '<div style="background:#fdf2f8;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:14px;font-weight:900;color:#ec4899;">$117,115</div><div style="font-size:9px;color:#9ca3af;margin-top:2px;">Revenue</div></div>' +
                    '<div style="background:#f9fafb;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:14px;font-weight:900;color:#111;">22</div><div style="font-size:9px;color:#9ca3af;margin-top:2px;">Leads</div></div>' +
                    '<div style="background:#f9fafb;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:14px;font-weight:900;color:#111;">84</div><div style="font-size:9px;color:#9ca3af;margin-top:2px;">KPIs <span style="color:#d1d5db;">0.79</span></div></div>' +
                    '<div style="background:#f9fafb;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:13px;font-weight:900;color:#111;">32% <span style="font-size:11px;color:#ec4899;font-weight:700;">7</span></div><div style="font-size:9px;color:#9ca3af;margin-top:2px;">Win/Loss &middot; 15</div></div>' +
                    '</div>' +
                    '<div style="background:#fff1f2;border-radius:12px;padding:12px;display:flex;align-items:center;gap:10px;">' +
                    '<span style="font-size:18px;">&#128200;</span>' +
                    '<div style="flex:1;"><div style="font-size:10px;font-weight:700;color:#374151;">Best streak this month</div><div style="font-size:9px;color:#9ca3af;">9 consecutive wins</div></div>' +
                    '<div style="font-size:11px;font-weight:900;color:#ec4899;white-space:nowrap;">+$156k</div>' +
                    '</div>' +
                    '</div>';

                // ── Sales Reps Table ──────────────────────────────────────
                var salesTable =
                    '<div style="background:#fff;border-radius:16px;border:1px solid #f3f4f6;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.04);margin-top:16px;">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">' +
                    '<div style="font-size:13px;font-weight:800;color:#111;">Sales</div>' +
                    '<div style="display:flex;gap:24px;">' +
                    '<span style="font-size:10px;color:#9ca3af;font-weight:600;">Revenue</span>' +
                    '<span style="font-size:10px;color:#9ca3af;font-weight:600;">Leads</span>' +
                    '<span style="font-size:10px;color:#9ca3af;font-weight:600;">KPIs</span>' +
                    '<span style="font-size:10px;color:#9ca3af;font-weight:600;">W/L</span>' +
                    '</div>' +
                    '</div>' +

                    // Rep 1 — Armin
                    '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f9fafb;">' +
                    '<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#be185d);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;flex-shrink:0;">AA</div>' +
                    '<div style="flex:1;min-width:0;">' +
                    '<div style="font-size:12px;font-weight:700;color:#111;">Armin A.</div>' +
                    '<div style="display:flex;gap:8px;margin-top:2px;">' +
                    '<span style="font-size:9px;color:#ec4899;font-weight:700;">Top sales &#128293;</span>' +
                    '<span style="font-size:9px;color:#9ca3af;">Sales streak &#128293;</span>' +
                    '<span style="font-size:9px;color:#9ca3af;">Top review &#11088;</span>' +
                    '</div>' +
                    '</div>' +
                    '<div style="font-size:12px;font-weight:800;color:#111;width:80px;text-align:right;">$209,633</div>' +
                    '<div style="width:36px;text-align:center;"><span style="background:#fce7f3;color:#ec4899;font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;">41</span></div>' +
                    '<div style="width:70px;text-align:right;font-size:11px;color:#374151;">118 <span style="color:#9ca3af;font-size:9px;">0.84</span></div>' +
                    '<div style="width:80px;text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:4px;">' +
                    '<span style="font-size:11px;font-weight:700;color:#374151;">31%</span>' +
                    '<span style="background:#fce7f3;color:#ec4899;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;">12</span>' +
                    '<span style="font-size:9px;color:#9ca3af;">29</span>' +
                    '<span style="color:#ec4899;font-size:10px;">&#9650;</span>' +
                    '</div>' +
                    '</div>' +

                    // Rep 2 — Mikasa
                    '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f9fafb;">' +
                    '<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#db2777,#9d174d);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;flex-shrink:0;">MA</div>' +
                    '<div style="flex:1;min-width:0;">' +
                    '<div style="font-size:12px;font-weight:700;color:#111;">Mikasa A.</div>' +
                    '<div style="display:flex;gap:8px;margin-top:2px;">' +
                    '<span style="font-size:9px;color:#ec4899;font-weight:700;">Sales streak &#128293;</span>' +
                    '</div>' +
                    '</div>' +
                    '<div style="font-size:12px;font-weight:800;color:#111;width:80px;text-align:right;">$156,841</div>' +
                    '<div style="width:36px;text-align:center;"><span style="background:#fce7f3;color:#ec4899;font-size:10px;font-weight:700;padding:2px 7px;border-radius:99px;">54</span></div>' +
                    '<div style="width:70px;text-align:right;font-size:11px;color:#374151;">103 <span style="color:#9ca3af;font-size:9px;">0.89</span></div>' +
                    '<div style="width:80px;text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:4px;">' +
                    '<span style="font-size:11px;font-weight:700;color:#374151;">39%</span>' +
                    '<span style="background:#fce7f3;color:#ec4899;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;">21</span>' +
                    '<span style="font-size:9px;color:#9ca3af;">33</span>' +
                    '<span style="color:#ec4899;font-size:10px;">&#9650;</span>' +
                    '</div>' +
                    '</div>' +

                    // Platform badges
                    '<div style="margin-top:14px;padding-top:14px;border-top:1px solid #f3f4f6;">' +
                    '<div style="font-size:10px;color:#9ca3af;font-weight:600;margin-bottom:8px;">Work with platforms</div>' +
                    '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;background:#fdf2f8;border:1px solid #fce7f3;border-radius:10px;padding:8px 12px;">' +
                    '<span style="font-size:15px;">&#127936;</span>' +
                    '<div><div style="font-size:10px;font-weight:700;color:#374151;">Dribbble</div><div style="font-size:9px;color:#9ca3af;">28.1% &middot; $44,072</div></div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:8px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:10px;padding:8px 12px;">' +
                    '<span style="font-size:15px;">&#128247;</span>' +
                    '<div><div style="font-size:10px;font-weight:700;color:#374151;">Instagram</div><div style="font-size:9px;color:#9ca3af;">14.1% &middot; $22.1k</div></div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:8px;background:#f9fafb;border:1px solid #f3f4f6;border-radius:10px;padding:8px 12px;">' +
                    '<span style="font-size:15px;">&#128269;</span>' +
                    '<div><div style="font-size:10px;font-weight:700;color:#374151;">Google</div><div style="font-size:9px;color:#9ca3af;">14.1% &middot; $22.1k</div></div>' +
                    '</div>' +
                    '<div style="background:#f9fafb;border:1px solid #f3f4f6;border-radius:10px;padding:8px 12px;">' +
                    '<div style="font-size:10px;font-weight:700;color:#374151;">Other</div><div style="font-size:9px;color:#9ca3af;">7.1% &middot; $11,131</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +

                    // Sales dynamic sparkline
                    '<div style="margin-top:14px;padding-top:14px;border-top:1px solid #f3f4f6;">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
                    '<div style="font-size:10px;color:#9ca3af;font-weight:600;">Sales dynamic</div>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<span style="font-size:18px;font-weight:900;color:#111;">45.3%</span>' +
                    '<span style="font-size:14px;font-weight:800;color:#ec4899;">$71,048</span>' +
                    '</div>' +
                    '</div>' +
                    '<svg viewBox="0 0 400 60" style="width:100%;height:56px;" preserveAspectRatio="none">' +
                    '<defs>' +
                    '<linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">' +
                    '<stop offset="0%" stop-color="#ec4899" stop-opacity="0.15"/>' +
                    '<stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>' +
                    '</linearGradient>' +
                    '</defs>' +
                    '<path d="M0,45 C40,40 60,22 110,30 S160,10 200,24 S255,36 290,20 S340,8 400,14" fill="none" stroke="#ec4899" stroke-width="2"/>' +
                    '<path d="M0,45 C40,40 60,22 110,30 S160,10 200,24 S255,36 290,20 S340,8 400,14 L400,60 L0,60 Z" fill="url(#sparkGrad)"/>' +
                    '<path d="M0,50 C50,46 90,48 140,43 S190,39 240,44 S300,49 400,41" fill="none" stroke="#fbcfe8" stroke-width="1.5" stroke-dasharray="5,4"/>' +
                    '<circle cx="200" cy="24" r="4" fill="#ec4899"/>' +
                    '<circle cx="290" cy="20" r="3.5" fill="#f43f5e"/>' +
                    '</svg>' +
                    '<div style="display:flex;justify-content:space-between;font-size:9px;color:#d1d5db;margin-top:2px;">' +
                    '<span>W1</span><span>W3</span><span>W5</span><span>W7</span><span>W9</span><span>W11</span>' +
                    '</div>' +
                    '</div>' +

                    '</div>';

                // ── Assemble ──────────────────────────────────────────────
                return '<div style="min-height:100vh;background:#f8f9fb;font-family:\'Helvetica Neue\',Arial,sans-serif;display:flex;">' +

                    sidebar +

                    // Main area
                    '<div style="flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;">' +

                    topbar +

                    // Scrollable content
                    '<div style="flex:1;overflow-y:auto;padding:20px 24px 32px;">' +

                    // Page title
                    '<div style="margin-bottom:18px;">' +
                    '<h1 style="font-size:26px;font-weight:900;color:#111;margin:0;letter-spacing:-0.5px;">New report</h1>' +
                    '<div style="font-size:11px;color:#9ca3af;margin-top:2px;">$209,633 &middot; Sep 1 &ndash; Nov 30, 2023</div>' +
                    '</div>' +

                    revenueHero +

                    // 3-column row
                    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:0;">' +
                    platformPanel +
                    dealsPanel +
                    topReviewPanel +
                    '</div>' +

                    salesTable +

                    '</div>' +
                    '</div>' +

                    '</div>';

            })()
        },

        // ── CHARTS ────────────────────────────────────────────────────────
        { id: 'chart-bar-v', label: 'Bar Chart (Vertical)', category: 'Charts', content: chartHtml('Monthly Sales', 'Revenue per month (PHP)', '2026', {type:'bar',data:{labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],datasets:[{label:'Revenue',data:[420,380,510,460,530,490,620,580,540,670,720,800],backgroundColor:'#B90E0A',borderRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#f0f0f0'}},x:{grid:{display:false}}}}}) },
        { id: 'chart-bar-h', label: 'Bar Chart (Horizontal)', category: 'Charts', content: chartHtml('Sales by Branch', 'Top performing branches', 'Feb 2026', {type:'bar',data:{labels:['SM Mall of Asia','BGC','Cebu','Davao','Online'],datasets:[{label:'Revenue',data:[1200,980,750,620,650],backgroundColor:['#B90E0A','#c41510','#cf1a15','#da1f1a','#e5241f'],borderRadius:4}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#f0f0f0'}},y:{grid:{display:false}}}}}) },
        { id: 'chart-line', label: 'Line Chart', category: 'Charts', content: chartHtml('Revenue Trend', 'Monthly revenue over time', '2026', {type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],datasets:[{label:'Revenue',data:[3.2,3.8,4.1,3.9,4.5,4.2,5.1,4.8,5.3,5.8,6.1,6.8],borderColor:'#B90E0A',backgroundColor:'rgba(185,14,10,0.08)',borderWidth:2.5,pointBackgroundColor:'#B90E0A',pointRadius:4,tension:0.4,fill:true}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#f0f0f0'}},x:{grid:{display:false}}}}}) },
        { id: 'chart-line-m', label: 'Line Chart (Multi)', category: 'Charts', content: chartHtml('Sales vs Target', 'Actual performance vs goal', '2026', {type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Actual',data:[420,380,510,460,530,490],borderColor:'#B90E0A',backgroundColor:'rgba(185,14,10,0.08)',borderWidth:2.5,pointBackgroundColor:'#B90E0A',pointRadius:4,tension:0.4,fill:true},{label:'Target',data:[450,450,450,500,500,500],borderColor:'#3b82f6',backgroundColor:'transparent',borderWidth:2,pointRadius:0,tension:0}]},options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{y:{grid:{color:'#f0f0f0'}},x:{grid:{display:false}}}}}) },
        { id: 'chart-area', label: 'Area Chart', category: 'Charts', content: chartHtml('Daily Orders', 'Orders per day this week', 'This Week', {type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Orders',data:[142,198,165,220,310,380,290],borderColor:'#B90E0A',backgroundColor:'rgba(185,14,10,0.12)',borderWidth:2.5,pointBackgroundColor:'#B90E0A',pointRadius:4,tension:0.4,fill:true}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#f0f0f0'},beginAtZero:true},x:{grid:{display:false}}}}}) },
        { id: 'chart-pie', label: 'Pie Chart', category: 'Charts', content: chartHtml('Sales by Category', 'Product category breakdown', 'Feb 2026', {type:'pie',data:{labels:['Polo Shirts','T-Shirts','Pants','Jackets','Accessories'],datasets:[{data:[35,25,20,12,8],backgroundColor:['#B90E0A','#c41510','#1a1a1a','#3b82f6','#f59e0b'],borderWidth:2,borderColor:'#fff'}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}}) },
        { id: 'chart-doughnut', label: 'Doughnut Chart', category: 'Charts', content: chartHtml('Order Status', 'Distribution of all orders', 'Feb 2026', {type:'doughnut',data:{labels:['Completed','Processing','Shipped','Cancelled'],datasets:[{data:[580,240,310,110],backgroundColor:['#22c55e','#f59e0b','#3b82f6','#ef4444'],borderWidth:2,borderColor:'#fff',cutout:'65%'}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}}) },
        { id: 'chart-mixed', label: 'Bar + Line (Mixed)', category: 'Charts', content: chartHtml('Sales and Growth Rate', 'Revenue vs growth %', '2026', {type:'bar',data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{type:'bar',label:'Revenue (PHP K)',data:[420,380,510,460,530,490],backgroundColor:'rgba(185,14,10,0.15)',borderColor:'#B90E0A',borderWidth:2,borderRadius:4,yAxisID:'y'},{type:'line',label:'Growth %',data:[5,8,12,9,14,11],borderColor:'#3b82f6',backgroundColor:'transparent',borderWidth:2.5,pointBackgroundColor:'#3b82f6',pointRadius:5,tension:0.4,yAxisID:'y1'}]},options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{y:{grid:{color:'#f0f0f0'}},y1:{position:'right',grid:{display:false}},x:{grid:{display:false}}}}}) },
        { id: 'chart-stacked', label: 'Stacked Bar Chart', category: 'Charts', content: chartHtml('Sales by Category per Month', 'Stacked category breakdown', 'H1 2026', {type:'bar',data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Polo Shirts',data:[120,100,140,130,150,140],backgroundColor:'#B90E0A'},{label:'T-Shirts',data:[80,75,90,85,100,95],backgroundColor:'#1a1a1a'},{label:'Pants',data:[60,55,70,65,75,70],backgroundColor:'#3b82f6'},{label:'Others',data:[40,35,50,45,55,50],backgroundColor:'#f59e0b'}]},options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,grid:{color:'#f0f0f0'}}}}}) },
        { id: 'chart-radar', label: 'Radar Chart', category: 'Charts', content: chartHtml('Performance Metrics', 'KPI comparison across departments', 'Q1 2026', {type:'radar',data:{labels:['Sales','Inventory','HR','Finance','Operations','Marketing'],datasets:[{label:'Actual',data:[85,72,90,68,78,88],borderColor:'#B90E0A',backgroundColor:'rgba(185,14,10,0.12)',borderWidth:2,pointBackgroundColor:'#B90E0A'},{label:'Target',data:[80,80,80,80,80,80],borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.06)',borderWidth:1.5,pointRadius:0}]},options:{responsive:true,plugins:{legend:{position:'bottom'}},scales:{r:{grid:{color:'#f0f0f0'},ticks:{display:false}}}}}) },
        { id: 'chart-scatter', label: 'Scatter Chart', category: 'Charts', content: chartHtml('Price vs Quantity Sold', 'Product pricing analysis', 'Feb 2026', {type:'scatter',data:{datasets:[{label:'Products',data:[{x:299,y:850},{x:499,y:620},{x:799,y:380},{x:999,y:210},{x:1299,y:150},{x:199,y:1200},{x:399,y:720},{x:599,y:480},{x:149,y:1500},{x:699,y:320}],backgroundColor:'rgba(185,14,10,0.7)',pointRadius:6}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{grid:{color:'#f0f0f0'},title:{display:true,text:'Price (PHP)'}},y:{grid:{color:'#f0f0f0'},title:{display:true,text:'Units Sold'}}}}}) }
    ];

    /* --------------------------------------------------
       HELPERS
    -------------------------------------------------- */
    function status(msg) {
        var el = document.getElementById('stMsg');
        if (el) { el.textContent = msg; }
        setTimeout(function () { if (el) { el.textContent = 'Ready'; } }, 2500);
    }

    function activatePanel(items, activeId) {
        for (var i = 0; i < items.length; i++) {
            var el = document.getElementById(items[i]);
            if (el) { el.classList.remove('on'); }
        }
        var target = document.getElementById(activeId);
        if (target) { target.classList.add('on'); }
    }

    function pageSlug() {
        return (PAGE_NAME || 'page')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'page';
    }

    function triggerBlobDownload(blob, fileName) {
        var a = document.createElement('a');
        var url = URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 300);
    }

    function buildExportHtml(html, css, cssHref) {
        var cssTag = cssHref
            ? '<link rel="stylesheet" href="' + cssHref + '">' 
            : '<style>' + (css || '') + '</style>';

        return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width,initial-scale=1.0">' +
            '<title>Bench Apparel ERP</title>' +
            '<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet">' +
            '<script src="' + CHARTJS + '"><\/script>' +
            cssTag +
            '</head><body>' + (html || '') +
            '<script>' +
            'window.addEventListener("load",function(){' +
            'document.querySelectorAll("[data-cfg]").forEach(function(el){' +
            'try{var c=JSON.parse(decodeURIComponent(escape(atob(el.getAttribute("data-cfg")))));' +
            'var cv=el.querySelector("canvas");if(cv)new Chart(cv,c);}catch(e){}});' +
            '});' +
            '<\/script></body></html>';
    }

    function exportZipFromEditor() {
        if (!editor) { return; }
        if (typeof window.JSZip === 'undefined') {
            alert('ZIP library failed to load. Please refresh and try again.');
            status('ZIP export unavailable.');
            return;
        }

        status('Building ZIP...');
        var html = editor.getHtml();
        var css = editor.getCss();
        var zip = new window.JSZip();
        zip.file('index.html', buildExportHtml(html, css, 'style.css'));
        zip.file('style.css', css || '');

        zip.generateAsync({ type: 'blob' })
            .then(function (blob) {
                triggerBlobDownload(blob, pageSlug() + '.zip');
                status('ZIP exported!');
            })
            .catch(function () {
                status('ZIP export failed.');
            });
    }

    function formatHtmlSource(source) {
        if (!source) { return ''; }

        var html = source
            .replace(/>\s*</g, '><')
            .replace(/></g, '>\n<');

        var lines = html.split('\n');
        var depth = 0;
        var formatted = [];

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) { continue; }

            if (/^<\//.test(line)) {
                depth = Math.max(0, depth - 1);
            }

            formatted.push(new Array(depth + 1).join('  ') + line);

            if (/^<[^!/][^>]*[^/]?>$/.test(line) && !/^<[^>]+>.*<\//.test(line)) {
                depth += 1;
            }
        }

        return formatted.join('\n');
    }

    function formatCssSource(source) {
        if (!source) { return ''; }

        var css = source
            .replace(/\s*\{\s*/g, ' {\n')
            .replace(/;\s*/g, ';\n')
            .replace(/\s*\}\s*/g, '\n}\n')
            .replace(/\n{2,}/g, '\n');

        var lines = css.split('\n');
        var depth = 0;
        var formatted = [];

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) { continue; }

            if (line === '}') {
                depth = Math.max(0, depth - 1);
            }

            formatted.push(new Array(depth + 1).join('  ') + line);

            if (line.charAt(line.length - 1) === '{') {
                depth += 1;
            }
        }

        return formatted.join('\n');
    }

    function openCodeModal() {
        if (!editor || !editor.Modal) { return; }

        var wrap = document.createElement('div');
        wrap.style.padding = '12px 0 0';
        wrap.style.color = '#ddd';

        // ── TOOLBAR ───────────────────────────────────────────────
        var toolbar = document.createElement('div');
        toolbar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';
        toolbar.innerHTML = '<div style="font-size:12px;color:#999;">Edit source then apply to canvas</div>';

        var actions = document.createElement('div');
        actions.style.cssText = 'display:flex;gap:8px;';

        var applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.textContent = 'Apply';
        applyBtn.style.cssText = 'background:#B90E0A;color:#fff;border:none;border-radius:4px;padding:7px 10px;cursor:pointer;font-size:11px;font-weight:700;';

        var zipBtn = document.createElement('button');
        zipBtn.type = 'button';
        zipBtn.textContent = 'Export ZIP';
        zipBtn.style.cssText = 'background:transparent;color:#ccc;border:1px solid #333;border-radius:4px;padding:7px 10px;cursor:pointer;font-size:11px;font-weight:700;';

        actions.appendChild(applyBtn);
        actions.appendChild(zipBtn);
        toolbar.appendChild(actions);

        // ── TABS ──────────────────────────────────────────────────
        var tabBar = document.createElement('div');
        tabBar.style.cssText = 'display:flex;gap:0;margin-bottom:12px;border-bottom:1px solid #2a2a2a;';

        function makeTab(label, color, active) {
            var t = document.createElement('button');
            t.type = 'button';
            t.textContent = label;
            t.dataset.tab = label;
            t.style.cssText = 'background:transparent;border:none;padding:8px 18px;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:1px;text-transform:uppercase;border-bottom:2px solid transparent;color:#555;transition:all .2s;';
            if (active) {
                t.style.color = color;
                t.style.borderBottomColor = color;
            }
            t.addEventListener('mouseenter', function(){ if(t.style.borderBottomColor === 'transparent') t.style.color = '#888'; });
            t.addEventListener('mouseleave', function(){ if(t.style.borderBottomColor === 'transparent') t.style.color = '#555'; });
            return t;
        }

        var tabHtml = makeTab('HTML', '#f97316', true);
        var tabCss  = makeTab('CSS',  '#9be22d', false);
        var tabTw   = makeTab('Tailwind CSS', '#38bdf8', false);
        tabBar.appendChild(tabHtml);
        tabBar.appendChild(tabCss);
        tabBar.appendChild(tabTw);

        // ── HTML + CSS PANEL ──────────────────────────────────────
        var codePanel = document.createElement('div');

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;';

        var htmlWrap = document.createElement('div');
        htmlWrap.innerHTML = '<div style="font-size:11px;color:#d4a16a;margin-bottom:6px;font-weight:700;">HTML</div>';

        var cssWrap = document.createElement('div');
        cssWrap.innerHTML = '<div style="font-size:11px;color:#d4a16a;margin-bottom:6px;font-weight:700;">CSS</div>';

        var htmlArea = document.createElement('textarea');
        htmlArea.value = formatHtmlSource(editor.getHtml());
        htmlArea.style.cssText = 'width:100%;min-height:380px;background:#1b1b1b;border:1px solid #2f2f2f;color:#f97316;padding:10px;font-family:Consolas,Monaco,monospace;font-size:12px;resize:vertical;box-sizing:border-box;';

        var cssArea = document.createElement('textarea');
        cssArea.value = formatCssSource(editor.getCss());
        cssArea.style.cssText = 'width:100%;min-height:380px;background:#1b1b1b;border:1px solid #2f2f2f;color:#9be22d;padding:10px;font-family:Consolas,Monaco,monospace;font-size:12px;resize:vertical;box-sizing:border-box;';

        htmlWrap.appendChild(htmlArea);
        cssWrap.appendChild(cssArea);
        grid.appendChild(htmlWrap);
        grid.appendChild(cssWrap);
        codePanel.appendChild(grid);

        // ── TAILWIND CHEATSHEET PANEL ─────────────────────────────
        var twPanel = document.createElement('div');
        twPanel.style.display = 'none';

        var twSections = [
            {
                title: '📐 Layout & Display',
                color: '#38bdf8',
                items: [
                    ['flex',              'display: flex'],
                    ['inline-flex',       'display: inline-flex'],
                    ['grid',              'display: grid'],
                    ['hidden',            'display: none'],
                    ['block',             'display: block'],
                    ['inline-block',      'display: inline-block'],
                    ['items-center',      'align-items: center'],
                    ['items-start',       'align-items: flex-start'],
                    ['items-end',         'align-items: flex-end'],
                    ['justify-center',    'justify-content: center'],
                    ['justify-between',   'justify-content: space-between'],
                    ['justify-end',       'justify-content: flex-end'],
                    ['flex-col',          'flex-direction: column'],
                    ['flex-row',          'flex-direction: row'],
                    ['flex-wrap',         'flex-wrap: wrap'],
                    ['flex-1',            'flex: 1 1 0%'],
                    ['flex-none',         'flex: none'],
                    ['shrink-0',          'flex-shrink: 0'],
                    ['grid-cols-2',       'grid-template-columns: repeat(2, 1fr)'],
                    ['grid-cols-3',       'grid-template-columns: repeat(3, 1fr)'],
                    ['grid-cols-4',       'grid-template-columns: repeat(4, 1fr)'],
                    ['col-span-2',        'grid-column: span 2'],
                    ['gap-2',             'gap: 0.5rem'],
                    ['gap-4',             'gap: 1rem'],
                    ['gap-6',             'gap: 1.5rem'],
                    ['gap-8',             'gap: 2rem'],
                    ['overflow-hidden',   'overflow: hidden'],
                    ['overflow-auto',     'overflow: auto'],
                    ['relative',          'position: relative'],
                    ['absolute',          'position: absolute'],
                    ['fixed',             'position: fixed'],
                    ['inset-0',           'top/right/bottom/left: 0'],
                    ['z-10',              'z-index: 10'],
                    ['z-50',              'z-index: 50'],
                ]
            },
            {
                title: '📏 Spacing (Padding & Margin)',
                color: '#a78bfa',
                items: [
                    ['p-2',    'padding: 0.5rem'],
                    ['p-4',    'padding: 1rem'],
                    ['p-6',    'padding: 1.5rem'],
                    ['p-8',    'padding: 2rem'],
                    ['px-4',   'padding-left/right: 1rem'],
                    ['py-2',   'padding-top/bottom: 0.5rem'],
                    ['pt-4',   'padding-top: 1rem'],
                    ['pb-4',   'padding-bottom: 1rem'],
                    ['pl-4',   'padding-left: 1rem'],
                    ['pr-4',   'padding-right: 1rem'],
                    ['m-2',    'margin: 0.5rem'],
                    ['m-4',    'margin: 1rem'],
                    ['mx-auto','margin-left/right: auto'],
                    ['my-4',   'margin-top/bottom: 1rem'],
                    ['mt-2',   'margin-top: 0.5rem'],
                    ['mb-4',   'margin-bottom: 1rem'],
                    ['ml-2',   'margin-left: 0.5rem'],
                    ['mr-2',   'margin-right: 0.5rem'],
                    ['-mt-8',  'margin-top: -2rem'],
                    ['-mt-11', 'margin-top: -2.75rem'],
                    ['space-x-2', '> * + * margin-left: 0.5rem'],
                    ['space-y-3', '> * + * margin-top: 0.75rem'],
                ]
            },
            {
                title: '📦 Sizing',
                color: '#34d399',
                items: [
                    ['w-full',    'width: 100%'],
                    ['w-screen',  'width: 100vw'],
                    ['w-auto',    'width: auto'],
                    ['w-4',       'width: 1rem'],
                    ['w-8',       'width: 2rem'],
                    ['w-16',      'width: 4rem'],
                    ['w-20',      'width: 5rem'],
                    ['w-48',      'width: 12rem'],
                    ['w-64',      'width: 16rem'],
                    ['w-1/2',     'width: 50%'],
                    ['w-1/3',     'width: 33.33%'],
                    ['max-w-sm',  'max-width: 24rem'],
                    ['max-w-md',  'max-width: 28rem'],
                    ['max-w-lg',  'max-width: 32rem'],
                    ['max-w-xl',  'max-width: 36rem'],
                    ['max-w-2xl', 'max-width: 42rem'],
                    ['max-w-3xl', 'max-width: 48rem'],
                    ['h-full',    'height: 100%'],
                    ['h-screen',  'height: 100vh'],
                    ['h-4',       'height: 1rem'],
                    ['h-8',       'height: 2rem'],
                    ['h-16',      'height: 4rem'],
                    ['h-20',      'height: 5rem'],
                    ['min-h-screen', 'min-height: 100vh'],
                ]
            },
            {
                title: '🎨 Typography',
                color: '#fbbf24',
                items: [
                    ['text-xs',        'font-size: 0.75rem'],
                    ['text-sm',        'font-size: 0.875rem'],
                    ['text-base',      'font-size: 1rem'],
                    ['text-lg',        'font-size: 1.125rem'],
                    ['text-xl',        'font-size: 1.25rem'],
                    ['text-2xl',       'font-size: 1.5rem'],
                    ['text-3xl',       'font-size: 1.875rem'],
                    ['text-4xl',       'font-size: 2.25rem'],
                    ['font-normal',    'font-weight: 400'],
                    ['font-medium',    'font-weight: 500'],
                    ['font-semibold',  'font-weight: 600'],
                    ['font-bold',      'font-weight: 700'],
                    ['font-extrabold', 'font-weight: 800'],
                    ['font-black',     'font-weight: 900'],
                    ['text-center',    'text-align: center'],
                    ['text-left',      'text-align: left'],
                    ['text-right',     'text-align: right'],
                    ['uppercase',      'text-transform: uppercase'],
                    ['lowercase',      'text-transform: lowercase'],
                    ['capitalize',     'text-transform: capitalize'],
                    ['tracking-wide',  'letter-spacing: 0.025em'],
                    ['tracking-wider', 'letter-spacing: 0.05em'],
                    ['tracking-widest','letter-spacing: 0.1em'],
                    ['leading-tight',  'line-height: 1.25'],
                    ['leading-normal', 'line-height: 1.5'],
                    ['leading-relaxed','line-height: 1.625'],
                    ['truncate',       'overflow: hidden; text-overflow: ellipsis'],
                    ['underline',      'text-decoration: underline'],
                    ['no-underline',   'text-decoration: none'],
                    ['italic',         'font-style: italic'],
                ]
            },
            {
                title: '🌈 Colors (Text)',
                color: '#f472b6',
                items: [
                    ['text-white',      'color: #ffffff'],
                    ['text-black',      'color: #000000'],
                    ['text-gray-400',   'color: #9ca3af'],
                    ['text-gray-500',   'color: #6b7280'],
                    ['text-gray-600',   'color: #4b5563'],
                    ['text-gray-700',   'color: #374151'],
                    ['text-gray-800',   'color: #1f2937'],
                    ['text-gray-900',   'color: #111827'],
                    ['text-red-500',    'color: #ef4444'],
                    ['text-red-600',    'color: #dc2626'],
                    ['text-green-500',  'color: #22c55e'],
                    ['text-green-600',  'color: #16a34a'],
                    ['text-green-700',  'color: #15803d'],
                    ['text-blue-500',   'color: #3b82f6'],
                    ['text-blue-600',   'color: #2563eb'],
                    ['text-yellow-500', 'color: #eab308'],
                    ['text-amber-600',  'color: #d97706'],
                    ['text-white/50',   'color: rgba(255,255,255,0.5)'],
                    ['text-white/30',   'color: rgba(255,255,255,0.3)'],
                    ['text-[#B90E0A]',  'color: #B90E0A (Bench Red)'],
                ]
            },
            {
                title: '🖌 Colors (Background)',
                color: '#fb923c',
                items: [
                    ['bg-white',         'background: #ffffff'],
                    ['bg-black',         'background: #000000'],
                    ['bg-transparent',   'background: transparent'],
                    ['bg-gray-50',       'background: #f9fafb'],
                    ['bg-gray-100',      'background: #f3f4f6'],
                    ['bg-gray-200',      'background: #e5e7eb'],
                    ['bg-gray-800',      'background: #1f2937'],
                    ['bg-gray-900',      'background: #111827'],
                    ['bg-red-50',        'background: #fef2f2'],
                    ['bg-red-100',       'background: #fee2e2'],
                    ['bg-green-50',      'background: #f0fdf4'],
                    ['bg-green-100',     'background: #dcfce7'],
                    ['bg-blue-50',       'background: #eff6ff'],
                    ['bg-yellow-50',     'background: #fefce8'],
                    ['bg-black/50',      'background: rgba(0,0,0,0.5)'],
                    ['bg-black/60',      'background: rgba(0,0,0,0.6)'],
                    ['bg-white/10',      'background: rgba(255,255,255,0.1)'],
                    ['bg-white/20',      'background: rgba(255,255,255,0.2)'],
                    ['bg-[#B90E0A]',     'background: #B90E0A (Bench Red)'],
                    ['bg-[#1a1a1a]',     'background: #1a1a1a (Dark)'],
                    ['bg-gradient-to-br','background gradient → bottom-right'],
                    ['from-[#B90E0A]',   'gradient start color'],
                    ['to-[#7a0806]',     'gradient end color'],
                ]
            },
            {
                title: '🔲 Borders & Radius',
                color: '#67e8f9',
                items: [
                    ['border',           'border-width: 1px'],
                    ['border-2',         'border-width: 2px'],
                    ['border-4',         'border-width: 4px'],
                    ['border-t',         'border-top-width: 1px'],
                    ['border-b',         'border-bottom-width: 1px'],
                    ['border-l',         'border-left-width: 1px'],
                    ['border-r',         'border-right-width: 1px'],
                    ['border-gray-100',  'border-color: #f3f4f6'],
                    ['border-gray-200',  'border-color: #e5e7eb'],
                    ['border-white/10',  'border-color: rgba(255,255,255,0.1)'],
                    ['border-[#333]',    'border-color: #333'],
                    ['divide-x',         'border between cols (x)'],
                    ['divide-y',         'border between rows (y)'],
                    ['rounded',          'border-radius: 0.25rem'],
                    ['rounded-md',       'border-radius: 0.375rem'],
                    ['rounded-lg',       'border-radius: 0.5rem'],
                    ['rounded-xl',       'border-radius: 0.75rem'],
                    ['rounded-2xl',      'border-radius: 1rem'],
                    ['rounded-3xl',      'border-radius: 1.5rem'],
                    ['rounded-full',     'border-radius: 9999px'],
                ]
            },
            {
                title: '✨ Effects & Shadows',
                color: '#c084fc',
                items: [
                    ['shadow',       'box-shadow: sm'],
                    ['shadow-md',    'box-shadow: medium'],
                    ['shadow-lg',    'box-shadow: large'],
                    ['shadow-xl',    'box-shadow: xl'],
                    ['shadow-2xl',   'box-shadow: 2xl'],
                    ['shadow-none',  'box-shadow: none'],
                    ['opacity-0',    'opacity: 0'],
                    ['opacity-50',   'opacity: 0.5'],
                    ['opacity-75',   'opacity: 0.75'],
                    ['opacity-100',  'opacity: 1'],
                    ['blur',         'filter: blur(8px)'],
                    ['blur-sm',      'filter: blur(4px)'],
                    ['backdrop-blur-sm',  'backdrop-filter: blur(4px)'],
                    ['backdrop-blur-md',  'backdrop-filter: blur(12px)'],
                    ['transition',        'transition: all 150ms'],
                    ['transition-all',    'transition: all'],
                    ['duration-200',      'transition-duration: 200ms'],
                    ['duration-300',      'transition-duration: 300ms'],
                    ['ease-in-out',       'transition-timing: ease-in-out'],
                    ['cursor-pointer',    'cursor: pointer'],
                    ['select-none',       'user-select: none'],
                    ['pointer-events-none','pointer-events: none'],
                ]
            },
            {
                title: '📱 Responsive Breakpoints',
                color: '#86efac',
                items: [
                    ['sm:',    'min-width: 640px'],
                    ['md:',    'min-width: 768px'],
                    ['lg:',    'min-width: 1024px'],
                    ['xl:',    'min-width: 1280px'],
                    ['2xl:',   'min-width: 1536px'],
                    ['sm:hidden',       'hide on sm+'],
                    ['md:flex',         'flex on md+'],
                    ['lg:grid-cols-3',  '3 cols on lg+'],
                    ['sm:text-lg',      'larger text on sm+'],
                    ['md:px-8',         'more padding on md+'],
                    ['hover:bg-gray-100','on hover'],
                    ['hover:text-white', 'text on hover'],
                    ['focus:outline-none','on focus'],
                    ['active:scale-95',  'on active/click'],
                    ['group',            'parent for group-hover'],
                    ['group-hover:block','show on parent hover'],
                ]
            },
        ];

        // Search bar
        var searchWrap = document.createElement('div');
        searchWrap.style.cssText = 'margin-bottom:12px;position:relative;';
        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '🔍  Search classes... e.g. "flex", "text", "bg"';
        searchInput.style.cssText = 'width:100%;background:#1b1b1b;border:1px solid #2f2f2f;color:#ddd;padding:9px 14px;font-size:12px;border-radius:6px;outline:none;box-sizing:border-box;font-family:Consolas,monospace;';
        searchWrap.appendChild(searchInput);
        twPanel.appendChild(searchWrap);

        // Sections container
        var sectionsWrap = document.createElement('div');
        sectionsWrap.style.cssText = 'max-height:400px;overflow-y:auto;display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-right:4px;';
        sectionsWrap.style.scrollbarWidth = 'thin';

        twSections.forEach(function(sec) {
            var secEl = document.createElement('div');
            secEl.style.cssText = 'background:#1b1b1b;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden;';
            secEl.dataset.section = sec.title;

            var secHeader = document.createElement('div');
            secHeader.style.cssText = 'padding:8px 12px;font-size:11px;font-weight:700;background:#222;border-bottom:1px solid #2a2a2a;color:' + sec.color + ';letter-spacing:0.5px;';
            secHeader.textContent = sec.title;

            var secBody = document.createElement('div');
            secBody.style.cssText = 'padding:6px 0;';

            sec.items.forEach(function(item) {
                var row = document.createElement('div');
                row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 12px;cursor:pointer;transition:background .15s;';
                row.dataset.class = item[0];
                row.dataset.desc  = item[1];

                var cls = document.createElement('span');
                cls.style.cssText = 'font-family:Consolas,monospace;font-size:11px;color:' + sec.color + ';font-weight:600;';
                cls.textContent = item[0];

                var desc = document.createElement('span');
                desc.style.cssText = 'font-size:10px;color:#555;text-align:right;max-width:55%;line-height:1.3;';
                desc.textContent = item[1];

                var copyBadge = document.createElement('span');
                copyBadge.textContent = 'copy';
                copyBadge.style.cssText = 'display:none;font-size:9px;background:#B90E0A;color:#fff;padding:1px 5px;border-radius:3px;margin-left:6px;';

                row.appendChild(cls);
                row.appendChild(desc);
                row.appendChild(copyBadge);

                row.addEventListener('mouseenter', function(){
                    row.style.background = '#252525';
                    copyBadge.style.display = 'inline';
                });
                row.addEventListener('mouseleave', function(){
                    row.style.background = 'transparent';
                    copyBadge.style.display = 'none';
                });
                row.addEventListener('click', function(){
                    navigator.clipboard.writeText(item[0]).then(function(){
                        copyBadge.textContent = '✓ copied!';
                        copyBadge.style.background = '#16a34a';
                        copyBadge.style.display = 'inline';
                        setTimeout(function(){
                            copyBadge.textContent = 'copy';
                            copyBadge.style.background = '#B90E0A';
                        }, 1200);
                    });
                });

                secBody.appendChild(row);
            });

            secEl.appendChild(secHeader);
            secEl.appendChild(secBody);
            sectionsWrap.appendChild(secEl);
        });

        twPanel.appendChild(sectionsWrap);

        // Search filter logic
        searchInput.addEventListener('input', function(){
            var q = searchInput.value.toLowerCase().trim();
            sectionsWrap.innerHTML = '';

            if (!q) {
                // Show all sections
                twSections.forEach(function(sec) {
                    // rebuild — reuse secEl by re-running (just re-append)
                });
                // Easier: just reload the panel
                searchInput.dispatchEvent(new Event('_reload'));
                return;
            }

            // Filter matching rows across all sections
            var results = document.createElement('div');
            results.style.cssText = 'background:#1b1b1b;border:1px solid #2a2a2a;border-radius:8px;overflow:hidden;grid-column:span 2;';
            var rHeader = document.createElement('div');
            rHeader.style.cssText = 'padding:8px 12px;font-size:11px;font-weight:700;background:#222;border-bottom:1px solid #2a2a2a;color:#38bdf8;';
            rHeader.textContent = '🔍 Search Results';
            results.appendChild(rHeader);

            var found = 0;
            twSections.forEach(function(sec) {
                sec.items.forEach(function(item) {
                    if (item[0].toLowerCase().includes(q) || item[1].toLowerCase().includes(q)) {
                        found++;
                        var row = document.createElement('div');
                        row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:5px 12px;cursor:pointer;border-bottom:1px solid #222;';

                        var cls = document.createElement('span');
                        cls.style.cssText = 'font-family:Consolas,monospace;font-size:11px;color:#38bdf8;font-weight:600;';
                        cls.textContent = item[0];

                        var desc = document.createElement('span');
                        desc.style.cssText = 'font-size:10px;color:#555;';
                        desc.textContent = item[1];

                        row.appendChild(cls);
                        row.appendChild(desc);

                        row.addEventListener('mouseenter', function(){ row.style.background = '#252525'; });
                        row.addEventListener('mouseleave', function(){ row.style.background = 'transparent'; });
                        row.addEventListener('click', function(){
                            navigator.clipboard.writeText(item[0]);
                            cls.textContent = '✓ ' + item[0];
                            setTimeout(function(){ cls.textContent = item[0]; }, 1200);
                        });

                        results.appendChild(row);
                    }
                });
            });

            if (found === 0) {
                var none = document.createElement('div');
                none.style.cssText = 'padding:16px 12px;color:#555;font-size:12px;text-align:center;';
                none.textContent = 'No classes found for "' + q + '"';
                results.appendChild(none);
            }

            sectionsWrap.appendChild(results);
        });

        // ── TAB SWITCHING LOGIC ───────────────────────────────────
        function activateTab(tab) {
            [tabHtml, tabCss, tabTw].forEach(function(t) {
                t.style.color = '#555';
                t.style.borderBottomColor = 'transparent';
            });

            codePanel.style.display = 'none';
            twPanel.style.display   = 'none';
            toolbar.style.display   = 'none';

            if (tab === 'HTML' || tab === 'CSS') {
                tab === 'HTML' ? tabHtml.style.color = '#f97316' : tabCss.style.color = '#9be22d';
                tab === 'HTML' ? tabHtml.style.borderBottomColor = '#f97316' : tabCss.style.borderBottomColor = '#9be22d';
                codePanel.style.display = 'block';
                toolbar.style.display   = 'flex';
            } else {
                tabTw.style.color = '#38bdf8';
                tabTw.style.borderBottomColor = '#38bdf8';
                twPanel.style.display = 'block';
            }
        }

        tabHtml.addEventListener('click', function(){ activateTab('HTML'); });
        tabCss.addEventListener('click',  function(){ activateTab('CSS'); });
        tabTw.addEventListener('click',   function(){ activateTab('Tailwind CSS'); });

        // ── BUTTON EVENTS ─────────────────────────────────────────
        applyBtn.addEventListener('click', function () {
            editor.setComponents(htmlArea.value || '');
            editor.setStyle(cssArea.value || '');
            setTimeout(function () {
                injectChartJs(renderCharts);
                injectTailwind();
            }, 350);
            status('Code applied.');
        });

        zipBtn.addEventListener('click', function () {
            exportZipFromEditor();
        });

        // ── ASSEMBLE & OPEN ───────────────────────────────────────
        wrap.appendChild(toolbar);
        wrap.appendChild(tabBar);
        wrap.appendChild(codePanel);
        wrap.appendChild(twPanel);

        editor.Modal.setTitle('Code');
        editor.Modal.setContent(wrap);
        editor.Modal.open();

        // Set modal width wider to fit cheatsheet grid
        var modalEl = document.querySelector('.gjs-mdl-dialog');
        if (modalEl) modalEl.style.maxWidth = '900px';
    }

    /* --------------------------------------------------
       CHART RENDERING — reads data-cfg, draws Chart.js
       Works on first load AND after save/reload because
       it reads from the HTML attribute, not inline script
    -------------------------------------------------- */
    function renderCharts(win, doc) {
        if (!win || !win.Chart) { return; }
        doc.querySelectorAll('[data-cfg]').forEach(function (el) {
            if (el.dataset.rendered) { return; }
            el.dataset.rendered = '1';
            try {
                var json = decodeURIComponent(escape(atob(el.getAttribute('data-cfg'))));
                var cfg  = JSON.parse(json);
                var canvas = el.querySelector('canvas');
                if (canvas) { new win.Chart(canvas, cfg); }
            } catch (e) { console.warn('Chart render error', e); }
        });
    }

    function injectChartJs(callback) {
        try {
            var frame = editor.Canvas.getFrameEl();
            if (!frame) { setTimeout(function () { injectChartJs(callback); }, 300); return; }
            var doc = frame.contentDocument || frame.contentWindow.document;
            var win = frame.contentWindow;
            if (!doc || !doc.head) { setTimeout(function () { injectChartJs(callback); }, 300); return; }
            // Already loaded
            if (win.Chart) { if (callback) { callback(win, doc); } return; }
            // Already injecting
            if (doc.getElementById('chartjs-cdn')) {
                var wait = function () {
                    if (win.Chart) { if (callback) { callback(win, doc); } }
                    else { setTimeout(wait, 100); }
                };
                wait(); return;
            }
            var s = doc.createElement('script');
            s.id  = 'chartjs-cdn';
            s.src = CHARTJS;
            s.onload = function () { if (callback) { callback(win, doc); } };
            doc.head.appendChild(s);
        } catch (e) {}
    }

        function injectTailwind() {
        var iframe = document.querySelector('.gjs-frame');
        if (!iframe) { setTimeout(injectTailwind, 400); return; }

        var doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc || !doc.head) { setTimeout(injectTailwind, 400); return; }

        // Already injected — skip
        if (doc.getElementById('tw-cdn')) return;

        var s = doc.createElement('script');
        s.id  = 'tw-cdn';
        s.src = 'https://cdn.tailwindcss.com';
        doc.head.appendChild(s);
    }

    /* --------------------------------------------------
       SAVE TO SERVER
    -------------------------------------------------- */
    function savePage(publishStatus) {
        if (!editor) { return; }
        var html = editor.getHtml();
        var css  = editor.getCss();
        var payload = { name: PAGE_NAME, html: html, css: css };
        if (PAGE_ID) { payload.id = PAGE_ID; }
        if (publishStatus) { payload.status = publishStatus; }
        status('Saving...');
        fetch('/api/pages/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
            body: JSON.stringify(payload)
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                PAGE_ID = data.page.id;
                if (window.history && window.history.replaceState) {
                    window.history.replaceState({}, '', '/builder/' + PAGE_ID);
                }
                status(publishStatus === 'published' ? 'Published!' : 'Saved!');
            } else { status('Save failed.'); }
        })
        .catch(function () { status('Save error.'); });
    }

    /* --------------------------------------------------
       LOAD SAVED CONTENT
    -------------------------------------------------- */
    function loadPageContent() {
        if (!PAGE_ID || HAS_CONTENT !== 'yes') { return; }
        fetch('/api/pages/' + PAGE_ID)
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data && data.html) {
                editor.setComponents(data.html);
                editor.setStyle(data.css || '');
                // After content loads, inject Chart.js and render charts
                setTimeout(function () {
                    injectChartJs(renderCharts);
                    injectTailwind();  
                }, 500);
                status('Page loaded.');
            }
        })
        .catch(function () { status('Could not load saved content.'); });
    }

    /* --------------------------------------------------
       GRAPEJS INIT
    -------------------------------------------------- */
    function initGrape() {
        if (typeof grapesjs === 'undefined') { setTimeout(initGrape, 300); return; }

        var initialHtml = HAS_CONTENT === 'yes' ? '' : DASH;
        var initialCss  = '* { box-sizing: border-box; } body { margin: 0; font-family: Barlow, sans-serif; }';

        editor = grapesjs.init({
            container: '#gjs',
            height: '100%',
            width: 'auto',
            fromElement: false,
            storageManager: false,
            panels: { defaults: [] },
            deviceManager: {
                devices: [
                    { name: 'Desktop', width: '' },
                    { name: 'Tablet', width: '768px', widthMedia: '992px' },
                    { name: 'Mobile', width: '375px', widthMedia: '480px' }
                ]
            },
            blockManager: { appendTo: '#gjs-blocks', blocks: BLOCKS },
            styleManager: {
                appendTo: '#gjs-styles',
                sectors: [
                    { name: 'Layout', open: true, properties: ['display','flex-direction','justify-content','align-items','width','height','max-width','min-height'] },
                    { name: 'Spacing', open: false, properties: ['margin','margin-top','margin-right','margin-bottom','margin-left','padding','padding-top','padding-right','padding-bottom','padding-left'] },
                    { name: 'Typography', open: false, properties: ['font-family','font-size','font-weight','line-height','color','text-align','text-transform','text-decoration'] },
                    { name: 'Background', open: false, properties: ['background-color','background-image','background-size','background-position'] },
                    { name: 'Border', open: false, properties: ['border','border-width','border-style','border-color','border-radius'] },
                    { name: 'Effects', open: false, properties: ['box-shadow','opacity','overflow'] }
                ]
            },
            traitManager: { appendTo: '#gjs-traits' },
            layerManager: { appendTo: '#gjs-layers' },
            canvas: { styles: ['https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap'] },
            components: initialHtml,
            style: initialCss
        });
                editor.DomComponents.addType('input', {
            model: {
                defaults: {
                    traits: [
                        { type: 'text', name: 'id', label: 'Id' },
                        { type: 'text', name: 'name', label: 'Name' },
                        { type: 'text', name: 'placeholder', label: 'Placeholder' },
                        { type: 'select', name: 'type', label: 'Type', options: [
                            { id: 'text', name: 'Text' },
                            { id: 'email', name: 'Email' },
                            { id: 'password', name: 'Password' },
                            { id: 'number', name: 'Number' },
                            { id: 'tel', name: 'Tel' },
                            { id: 'date', name: 'Date' },
                        ]},
                        { type: 'checkbox', name: 'required', label: 'Required' },
                        { type: 'checkbox', name: 'disabled', label: 'Disabled' },
                    ]
                }
            }
        });

// ─────────────────────────────────────────────────────────────────
// REPLACE everything from:
//     // On editor load: inject Chart.js...
// all the way down to:
//     status('Ready');
//
// with this entire block below
// ─────────────────────────────────────────────────────────────────

        // ── CUSTOM COMPONENT TYPES WITH TRAITS ────────────────────────────
        // Must be registered RIGHT HERE — after grapesjs.init(), NOT inside editor.on('load')

        var cm = editor.Components;

        cm.addType('erp-kpi', {
            isComponent: function(el) { return el.getAttribute && el.getAttribute('data-erp') === 'kpi'; },
            model: {
                defaults: {
                    tagName: 'div',
                    attributes: { 'data-erp': 'kpi' },
                    traits: [
                        { type: 'text',   name: 'kpi-label',     label: 'Metric Label', placeholder: 'e.g. Total Sales' },
                        { type: 'text',   name: 'kpi-value',     label: 'Value',        placeholder: 'e.g. PHP 128,400' },
                        { type: 'text',   name: 'kpi-sub',       label: 'Sub Text',     placeholder: 'e.g. +12% vs last period' },
                        { type: 'select', name: 'kpi-sub-color', label: 'Sub Color',
                          options: [{ id:'#22c55e', name:'Green' },{ id:'#ef4444', name:'Red' },{ id:'#888', name:'Gray' }] },
                        { type: 'select', name: 'kpi-accent',    label: 'Accent Color',
                          options: [{ id:'#B90E0A', name:'Red' },{ id:'#22c55e', name:'Green' },{ id:'#3b82f6', name:'Blue' },{ id:'#f59e0b', name:'Amber' }] }
                    ]
                },
                init: function() {
                    this.on('change:attributes:kpi-label',     this._syncLabel,    this);
                    this.on('change:attributes:kpi-value',     this._syncValue,    this);
                    this.on('change:attributes:kpi-sub',       this._syncSub,      this);
                    this.on('change:attributes:kpi-sub-color', this._syncSubColor, this);
                    this.on('change:attributes:kpi-accent',    this._syncAccent,   this);
                },
                _syncLabel:    function() { var el=this.getEl(); if(!el) return; var d=el.querySelectorAll('div'); var v=this.getAttributes()['kpi-label'];     if(v&&d[0]) d[0].textContent=v; },
                _syncValue:    function() { var el=this.getEl(); if(!el) return; var d=el.querySelectorAll('div'); var v=this.getAttributes()['kpi-value'];     if(v&&d[1]) d[1].textContent=v; },
                _syncSub:      function() { var el=this.getEl(); if(!el) return; var d=el.querySelectorAll('div'); var v=this.getAttributes()['kpi-sub'];       if(v&&d[2]) d[2].textContent=v; },
                _syncSubColor: function() { var el=this.getEl(); if(!el) return; var d=el.querySelectorAll('div'); var v=this.getAttributes()['kpi-sub-color']; if(v&&d[2]) d[2].style.color=v; },
                _syncAccent:   function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['kpi-accent']; if(v) el.style.borderTopColor=v; }
            }
        });

        cm.addType('erp-sec-hdr', {
            isComponent: function(el) { return el.getAttribute && el.getAttribute('data-erp') === 'sec-hdr'; },
            model: {
                defaults: {
                    tagName: 'div',
                    attributes: { 'data-erp': 'sec-hdr' },
                    traits: [
                        { type: 'text', name: 'hdr-title',    label: 'Title',    placeholder: 'Section Title' },
                        { type: 'text', name: 'hdr-subtitle', label: 'Subtitle', placeholder: 'Subtitle here' }
                    ]
                },
                init: function() {
                    this.on('change:attributes:hdr-title',    this._syncTitle,    this);
                    this.on('change:attributes:hdr-subtitle', this._syncSubtitle, this);
                },
                _syncTitle:    function() { var el=this.getEl(); if(!el) return; var h=el.querySelector('h2'); var v=this.getAttributes()['hdr-title'];    if(v&&h) h.textContent=v; },
                _syncSubtitle: function() { var el=this.getEl(); if(!el) return; var p=el.querySelector('p');  var v=this.getAttributes()['hdr-subtitle']; if(v&&p) p.textContent=v; }
            }
        });

        cm.addType('erp-form-in', {
            isComponent: function(el) { return el.getAttribute && el.getAttribute('data-erp') === 'form-in'; },
            model: {
                defaults: {
                    tagName: 'div',
                    attributes: { 'data-erp': 'form-in' },
                    traits: [
                        { type: 'text',     name: 'fi-label',       label: 'Field Label',  placeholder: 'Field Label' },
                        { type: 'text',     name: 'fi-placeholder', label: 'Placeholder',  placeholder: 'Enter value...' },
                        { type: 'select',   name: 'fi-type',        label: 'Input Type',
                          options: [{ id:'text', name:'Text' },{ id:'email', name:'Email' },{ id:'password', name:'Password' },{ id:'number', name:'Number' },{ id:'date', name:'Date' },{ id:'tel', name:'Phone' }] },
                        { type: 'checkbox', name: 'fi-required',    label: 'Required?' }
                    ]
                },
                init: function() {
                    this.on('change:attributes:fi-label',       this._syncLabel,       this);
                    this.on('change:attributes:fi-placeholder', this._syncPlaceholder, this);
                    this.on('change:attributes:fi-type',        this._syncType,        this);
                    this.on('change:attributes:fi-required',    this._syncRequired,    this);
                },
                _syncLabel:       function() { var el=this.getEl(); if(!el) return; var l=el.querySelector('label'); var v=this.getAttributes()['fi-label'];       if(v&&l) l.textContent=v; },
                _syncPlaceholder: function() { var el=this.getEl(); if(!el) return; var i=el.querySelector('input'); var v=this.getAttributes()['fi-placeholder']; if(v&&i) i.setAttribute('placeholder',v); },
                _syncType:        function() { var el=this.getEl(); if(!el) return; var i=el.querySelector('input'); var v=this.getAttributes()['fi-type'];        if(v&&i) i.setAttribute('type',v); },
                _syncRequired:    function() { var el=this.getEl(); if(!el) return; var i=el.querySelector('input'); var v=this.getAttributes()['fi-required'];    if(i){ if(v) i.setAttribute('required','required'); else i.removeAttribute('required'); } }
            }
        });

        cm.addType('erp-form-sel', {
            isComponent: function(el) { return el.getAttribute && el.getAttribute('data-erp') === 'form-sel'; },
            model: {
                defaults: {
                    tagName: 'div',
                    attributes: { 'data-erp': 'form-sel' },
                    traits: [
                        { type: 'text', name: 'fs-label',   label: 'Field Label',              placeholder: 'Select Label' },
                        { type: 'text', name: 'fs-options', label: 'Options (comma-separated)', placeholder: 'Option 1,Option 2,Option 3' }
                    ]
                },
                init: function() {
                    this.on('change:attributes:fs-label',   this._syncLabel,   this);
                    this.on('change:attributes:fs-options', this._syncOptions, this);
                },
                _syncLabel:   function() { var el=this.getEl(); if(!el) return; var l=el.querySelector('label'); var v=this.getAttributes()['fs-label']; if(v&&l) l.textContent=v; },
                _syncOptions: function() {
                    var el=this.getEl(); if(!el) return;
                    var sel=el.querySelector('select'); var v=this.getAttributes()['fs-options'];
                    if(v&&sel){ sel.innerHTML=v.split(',').map(function(o){ return '<option>'+o.trim()+'</option>'; }).join(''); }
                }
            }
        });

        cm.addType('erp-btn-red', {
            isComponent: function(el) { return el.tagName === 'BUTTON' && el.getAttribute('data-erp') === 'btn-red'; },
            model: {
                defaults: {
                    tagName: 'button',
                    attributes: { 'data-erp': 'btn-red' },
                    traits: [
                        { type: 'text',   name: 'btn-label', label: 'Button Text', placeholder: 'Save Changes' },
                        { type: 'select', name: 'btn-color', label: 'Color',
                          options: [{ id:'#B90E0A', name:'Red' },{ id:'#1a1a1a', name:'Black' },{ id:'#22c55e', name:'Green' },{ id:'#3b82f6', name:'Blue' }] }
                    ]
                },
                init: function() {
                    this.on('change:attributes:btn-label', this._syncLabel, this);
                    this.on('change:attributes:btn-color', this._syncColor, this);
                },
                _syncLabel: function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['btn-label']; if(v) el.textContent=v; },
                _syncColor: function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['btn-color']; if(v) el.style.background=v; }
            }
        });

        cm.addType('erp-btn-out', {
            isComponent: function(el) { return el.tagName === 'BUTTON' && el.getAttribute('data-erp') === 'btn-out'; },
            model: {
                defaults: {
                    tagName: 'button',
                    attributes: { 'data-erp': 'btn-out' },
                    traits: [
                        { type: 'text',   name: 'btn-label', label: 'Button Text', placeholder: 'Cancel' },
                        { type: 'select', name: 'btn-color', label: 'Color',
                          options: [{ id:'#B90E0A', name:'Red' },{ id:'#1a1a1a', name:'Black' },{ id:'#22c55e', name:'Green' },{ id:'#3b82f6', name:'Blue' }] }
                    ]
                },
                init: function() {
                    this.on('change:attributes:btn-label', this._syncLabel, this);
                    this.on('change:attributes:btn-color', this._syncColor, this);
                },
                _syncLabel: function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['btn-label']; if(v) el.textContent=v; },
                _syncColor: function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['btn-color']; if(v){ el.style.color=v; el.style.borderColor=v; } }
            }
        });

        cm.addType('erp-alert-w', {
            isComponent: function(el) { return el.getAttribute && el.getAttribute('data-erp') === 'alert-w'; },
            model: {
                defaults: {
                    tagName: 'div',
                    attributes: { 'data-erp': 'alert-w' },
                    traits: [
                        { type: 'text', name: 'aw-title',   label: 'Alert Title',   placeholder: 'Warning' },
                        { type: 'text', name: 'aw-message', label: 'Alert Message', placeholder: 'Alert message goes here.' }
                    ]
                },
                init: function() {
                    this.on('change:attributes:aw-title',   this._syncTitle,   this);
                    this.on('change:attributes:aw-message', this._syncMessage, this);
                },
                _syncTitle:   function() { var el=this.getEl(); if(!el) return; var d=el.querySelectorAll('div'); var v=this.getAttributes()['aw-title'];   if(v&&d[0]) d[0].textContent=v; },
                _syncMessage: function() { var el=this.getEl(); if(!el) return; var d=el.querySelectorAll('div'); var v=this.getAttributes()['aw-message']; if(v&&d[1]) d[1].textContent=v; }
            }
        });

        cm.addType('erp-alert-e', {
            isComponent: function(el) { return el.getAttribute && el.getAttribute('data-erp') === 'alert-e'; },
            model: {
                defaults: {
                    tagName: 'div',
                    attributes: { 'data-erp': 'alert-e' },
                    traits: [
                        { type: 'text', name: 'ae-title',   label: 'Alert Title',   placeholder: 'Error' },
                        { type: 'text', name: 'ae-message', label: 'Alert Message', placeholder: 'Error message goes here.' }
                    ]
                },
                init: function() {
                    this.on('change:attributes:ae-title',   this._syncTitle,   this);
                    this.on('change:attributes:ae-message', this._syncMessage, this);
                },
                _syncTitle:   function() { var el=this.getEl(); if(!el) return; var d=el.querySelectorAll('div'); var v=this.getAttributes()['ae-title'];   if(v&&d[0]) d[0].textContent=v; },
                _syncMessage: function() { var el=this.getEl(); if(!el) return; var d=el.querySelectorAll('div'); var v=this.getAttributes()['ae-message']; if(v&&d[1]) d[1].textContent=v; }
            }
        });

        cm.addType('erp-prog', {
            isComponent: function(el) { return el.getAttribute && el.getAttribute('data-erp') === 'prog'; },
            model: {
                defaults: {
                    tagName: 'div',
                    attributes: { 'data-erp': 'prog' },
                    traits: [
                        { type: 'text',   name: 'pb-label', label: 'Label',         placeholder: 'Label' },
                        { type: 'number', name: 'pb-value', label: 'Value (0-100)', placeholder: '75' },
                        { type: 'select', name: 'pb-color', label: 'Bar Color',
                          options: [{ id:'#B90E0A', name:'Red' },{ id:'#22c55e', name:'Green' },{ id:'#3b82f6', name:'Blue' },{ id:'#f59e0b', name:'Amber' }] }
                    ]
                },
                init: function() {
                    this.on('change:attributes:pb-label', this._syncLabel, this);
                    this.on('change:attributes:pb-value', this._syncValue, this);
                    this.on('change:attributes:pb-color', this._syncColor, this);
                },
                _syncLabel: function() { var el=this.getEl(); if(!el) return; var s=el.querySelectorAll('span'); var v=this.getAttributes()['pb-label']; if(v&&s[0]) s[0].textContent=v; },
                _syncValue: function() {
                    var el=this.getEl(); if(!el) return;
                    var s=el.querySelectorAll('span'); var bar=el.querySelector('div > div');
                    var v=this.getAttributes()['pb-value'];
                    if(v!==undefined&&v!==''){
                        var pct=Math.min(100,Math.max(0,parseInt(v)));
                        if(s[1]) s[1].textContent=pct+'%';
                        if(bar)  bar.style.width=pct+'%';
                    }
                },
                _syncColor: function() { var el=this.getEl(); if(!el) return; var bar=el.querySelector('div > div'); var v=this.getAttributes()['pb-color']; if(v&&bar) bar.style.background=v; }
            }
        });

        cm.addType('erp-card', {
            isComponent: function(el) { return el.getAttribute && el.getAttribute('data-erp') === 'card'; },
            model: {
                defaults: {
                    tagName: 'div',
                    attributes: { 'data-erp': 'card' },
                    traits: [
                        { type: 'text', name: 'card-title', label: 'Title',       placeholder: 'Card Title' },
                        { type: 'text', name: 'card-body',  label: 'Description', placeholder: 'Card description here.' }
                    ]
                },
                init: function() {
                    this.on('change:attributes:card-title', this._syncTitle, this);
                    this.on('change:attributes:card-body',  this._syncBody,  this);
                },
                _syncTitle: function() { var el=this.getEl(); if(!el) return; var h=el.querySelector('h3'); var v=this.getAttributes()['card-title']; if(v&&h) h.textContent=v; },
                _syncBody:  function() { var el=this.getEl(); if(!el) return; var p=el.querySelector('p');  var v=this.getAttributes()['card-body'];  if(v&&p) p.textContent=v; }
            }
        });

        cm.addType('erp-heading', {
            isComponent: function(el) { return el.tagName === 'H2' && el.getAttribute('data-erp') === 'h2'; },
            model: {
                defaults: {
                    tagName: 'h2',
                    attributes: { 'data-erp': 'h2' },
                    traits: [
                        { type: 'text',   name: 'h2-text',  label: 'Text',      placeholder: 'Your Heading' },
                        { type: 'select', name: 'h2-size',  label: 'Size',
                          options: [{ id:'16px', name:'Small' },{ id:'20px', name:'Medium' },{ id:'24px', name:'Large' },{ id:'32px', name:'XL' },{ id:'40px', name:'XXL' }] },
                        { type: 'select', name: 'h2-align', label: 'Alignment',
                          options: [{ id:'left', name:'Left' },{ id:'center', name:'Center' },{ id:'right', name:'Right' }] },
                        { type: 'color',  name: 'h2-color', label: 'Color' }
                    ]
                },
                init: function() {
                    this.on('change:attributes:h2-text',  this._syncText,  this);
                    this.on('change:attributes:h2-size',  this._syncSize,  this);
                    this.on('change:attributes:h2-align', this._syncAlign, this);
                    this.on('change:attributes:h2-color', this._syncColor, this);
                },
                _syncText:  function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['h2-text'];  if(v) el.textContent=v; },
                _syncSize:  function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['h2-size'];  if(v) el.style.fontSize=v; },
                _syncAlign: function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['h2-align']; if(v) el.style.textAlign=v; },
                _syncColor: function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['h2-color']; if(v) el.style.color=v; }
            }
        });

        cm.addType('erp-text', {
            isComponent: function(el) { return el.tagName === 'P' && el.getAttribute('data-erp') === 'txt'; },
            model: {
                defaults: {
                    tagName: 'p',
                    attributes: { 'data-erp': 'txt' },
                    traits: [
                        { type: 'text',   name: 'p-text',  label: 'Text',      placeholder: 'Click to edit this text.' },
                        { type: 'select', name: 'p-size',  label: 'Font Size',
                          options: [{ id:'11px', name:'XS' },{ id:'13px', name:'Small' },{ id:'14px', name:'Medium' },{ id:'16px', name:'Large' },{ id:'18px', name:'XL' }] },
                        { type: 'select', name: 'p-align', label: 'Alignment',
                          options: [{ id:'left', name:'Left' },{ id:'center', name:'Center' },{ id:'right', name:'Right' }] }
                    ]
                },
                init: function() {
                    this.on('change:attributes:p-text',  this._syncText,  this);
                    this.on('change:attributes:p-size',  this._syncSize,  this);
                    this.on('change:attributes:p-align', this._syncAlign, this);
                },
                _syncText:  function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['p-text'];  if(v) el.textContent=v; },
                _syncSize:  function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['p-size'];  if(v) el.style.fontSize=v; },
                _syncAlign: function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['p-align']; if(v) el.style.textAlign=v; }
            }
        });

        cm.addType('erp-img', {
            isComponent: function(el) { return el.tagName === 'IMG' && el.getAttribute('data-erp') === 'img'; },
            model: {
                defaults: {
                    tagName: 'img',
                    attributes: { 'data-erp': 'img' },
                    traits: [
                        { type: 'text',   name: 'img-src',    label: 'Image URL',  placeholder: 'https://...' },
                        { type: 'text',   name: 'img-alt',    label: 'Alt Text',   placeholder: 'Image description' },
                        { type: 'select', name: 'img-radius', label: 'Corners',
                          options: [{ id:'0', name:'Sharp' },{ id:'4px', name:'Slight' },{ id:'8px', name:'Rounded' },{ id:'16px', name:'Very Rounded' },{ id:'50%', name:'Circle' }] }
                    ]
                },
                init: function() {
                    this.on('change:attributes:img-src',    this._syncSrc,    this);
                    this.on('change:attributes:img-alt',    this._syncAlt,    this);
                    this.on('change:attributes:img-radius', this._syncRadius, this);
                },
                _syncSrc:    function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['img-src'];    if(v) el.setAttribute('src',v); },
                _syncAlt:    function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['img-alt'];    if(v) el.setAttribute('alt',v); },
                _syncRadius: function() { var el=this.getEl(); if(!el) return; var v=this.getAttributes()['img-radius']; if(v) el.style.borderRadius=v; }
            }
        });

        // ── EDITOR EVENTS ─────────────────────────────────────────────────

        editor.on('load', function () {
            if (HAS_CONTENT === 'yes') {
                loadPageContent();
            } else {
                injectChartJs(renderCharts);
                injectTailwind();
            }
        });

        editor.on('block:drag:stop', function () {
            setTimeout(function () {
                injectChartJs(renderCharts);
                injectTailwind();
            }, 400);
        });

        editor.on('change:device', function () {
            setTimeout(function () {
                injectChartJs(renderCharts);
                injectTailwind();
            }, 600);
        });

        editor.on('component:selected', function (component) {
            if (!component) return;
            var el = component.getEl();
            if (!el) return;
            var inlineBg = el.style.backgroundColor;
            var computedBg = window.getComputedStyle(el).backgroundColor;
            var bg = inlineBg || computedBg;
            if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') bg = '';
            if (bg) {
                var sm = editor.StyleManager;
                var prop = sm.getProperty('Background', 'background-color');
                if (prop) prop.setValue(bg);
            }
        });

        status('Ready');
    }

    /* --------------------------------------------------
       DOM EVENTS
    -------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', function () {

        document.getElementById('stBlocks').addEventListener('click', function () {
            document.querySelectorAll('.sub-left .sub-tab').forEach(function (x) { x.classList.remove('on'); });
            this.classList.add('on');
            activatePanel(['pBlocks', 'pLayers'], 'pBlocks');
        });
        document.getElementById('stLayers').addEventListener('click', function () {
            document.querySelectorAll('.sub-left .sub-tab').forEach(function (x) { x.classList.remove('on'); });
            this.classList.add('on');
            activatePanel(['pBlocks', 'pLayers'], 'pLayers');
        });
        document.getElementById('rtStyles').addEventListener('click', function () {
            document.querySelectorAll('.sub-right .sub-tab').forEach(function (x) { x.classList.remove('on'); });
            this.classList.add('on');
            activatePanel(['rStyles', 'rProps'], 'rStyles');
        });
        document.getElementById('rtProps').addEventListener('click', function () {
            document.querySelectorAll('.sub-right .sub-tab').forEach(function (x) { x.classList.remove('on'); });
            this.classList.add('on');
            activatePanel(['rStyles', 'rProps'], 'rProps');
        });

        document.getElementById('dDsk').addEventListener('click', function () {
            document.querySelectorAll('.dev-btns button').forEach(function (b) { b.classList.remove('on'); });
            this.classList.add('on');
            if (editor) { editor.setDevice('Desktop'); }
        });
        document.getElementById('dTab').addEventListener('click', function () {
            document.querySelectorAll('.dev-btns button').forEach(function (b) { b.classList.remove('on'); });
            this.classList.add('on');
            if (editor) { editor.setDevice('Tablet'); }
        });
        document.getElementById('dMob').addEventListener('click', function () {
            document.querySelectorAll('.dev-btns button').forEach(function (b) { b.classList.remove('on'); });
            this.classList.add('on');
            if (editor) { editor.setDevice('Mobile'); }
        });

        document.getElementById('bUndo').addEventListener('click', function () { if (editor) { editor.runCommand('core:undo'); } });
        document.getElementById('bRedo').addEventListener('click', function () { if (editor) { editor.runCommand('core:redo'); } });
        document.getElementById('bSave').addEventListener('click', function () { savePage(null); });
        document.getElementById('bPublish').addEventListener('click', function () { savePage('published'); });
        document.getElementById('bCode').addEventListener('click', function () {
            openCodeModal();
        });

        document.getElementById('bPrev').addEventListener('click', function () {
            if (!editor) { return; }
            var win = window.open('', '_blank');
            if (!win) { alert('Allow popups to preview.'); return; }
            win.document.open();
            win.document.write(
                '<!DOCTYPE html><html><head>' +
                '<meta charset="UTF-8">' +
                '<meta name="viewport" content="width=device-width,initial-scale=1.0">' +
                '<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">' +
                '<script src="https://cdn.tailwindcss.com"><\/script>' +  // ← ADDED
                '<script src="' + CHARTJS + '"><\/script>' +
                '<style>' + editor.getCss() + '</style>' +
                '</head><body>' +
                editor.getHtml() +
                '<script>' +
                'document.querySelectorAll("[data-cfg]").forEach(function(el){' +
                'try{var c=JSON.parse(decodeURIComponent(escape(atob(el.getAttribute("data-cfg")))));' +
                'var cv=el.querySelector("canvas");if(cv)new Chart(cv,c);}catch(e){}});' +
                '<\/script>' +
                '</body></html>'
            );
            win.document.close();
            status('Preview opened!');
        });
 

        document.getElementById('bExp').addEventListener('click', function () {
            exportZipFromEditor();
        });

        initGrape();
    });

}());