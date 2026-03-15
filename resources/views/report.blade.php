<!DOCTYPE html>
<html lang="en">

  <head>
    <title>HR Reports Module</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index,follow">
    <meta name="generator" content="GrapesJS Studio">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Manrope:wght@600;700;800&amp;display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="{{ asset('css/report.css') }}" />
  </head>

  <body class="gjs-t-body">
    <header class="header-navbar" id="ix9ri">
      <div class="header-container" id="ivp0f">
        <div class="header-branding-group" id="ikgof">
          <a href="#" aria-label="HR Reports Home" class="gjs-t-link header-logo-link" id="i172y">
            <span class="header-logo-badge" id="i82ul">
              <img src="https://api.iconify.design/lucide-bar-chart-3.svg?color=%23ffffff" alt="HR Icon" class="header-logo-icon" id="ivoqa" />
            </span>
            <span class="header-title-text" id="izfnh">HR Reports</span>
          </a>
          <span class="header-divider" id="i9mxk">|</span>
          <nav class="header-nav" id="ig3hf">
            <a href="#" class="gjs-t-link header-nav-link" id="ic8nh">Overview</a>
            <a href="#dashboard" class="gjs-t-link header-nav-link" id="i71kj">Dashboard</a>
            <a href="#filters" class="gjs-t-link header-nav-link" id="iey1n">Filters</a>
            <a href="#details" class="gjs-t-link header-nav-link" id="is44f">Details</a>
          </nav>
        </div>
        <div class="header-actions" id="iemrz">
          <a href="#" class="header-action-link" id="iyfug">
            <img src="https://api.iconify.design/lucide-life-buoy.svg?color=%23ffffff" alt="Support Icon" class="header-action-icon" id="ip92u" />
            <span id="ie44i">Support</span>
          </a>
          <a href="#" class="header-action-link" id="ix51s">
            <img src="https://api.iconify.design/lucide-book-open.svg?color=%238a0a07" alt="Docs Icon" class="header-action-icon" id="ip7vj" />
            <span id="iam5x">Docs</span>
          </a>
        </div>
      </div>
    </header>
    <section class="section-overview" id="i8eik">
      <div class="overview-container" id="ieswd">
        <div class="overview-content-group" id="iumfo">
          <div class="overview-text-block" id="iuk5m">
            <h1 class="gjs-t-h1 overview-heading" id="ivjgj">Actionable HR Reports</h1>
            <p class="overview-paragraph" id="i6b4g">
              The HR Reports module centralizes attendance, performance, leave, and payroll insights into a clean, modern dashboard. Easily filter by department, date range, and employment status, then export your findings in PDF or Excel with one click.
            </p>
            <ul class="overview-feature-list" id="iiww4">
              <li class="overview-feature-item" id="iylw1">
                <img src="https://api.iconify.design/lucide-check-circle-2.svg?color=%23B90E0A" alt="Check" class="overview-feature-icon" id="iagu1" />
                <span class="overview-feature-text" id="iow4p">Consistent red-accented UI for clarity and focus</span>
              </li>
              <li class="overview-feature-item" id="io5rg">
                <img src="https://api.iconify.design/lucide-filters.svg?color=%23B90E0A" alt="Filters" class="overview-feature-icon" id="ihgis" />
                <span class="overview-feature-text" id="izcsk">Powerful filters and date selection with accessible controls</span>
              </li>
              <li class="overview-feature-item" id="if7k8">
                <img src="https://api.iconify.design/lucide-file-down.svg?color=%23B90E0A" alt="Download" class="overview-feature-icon" id="iv0bf" />
                <span class="overview-feature-text" id="ic773">Export to PDF and Excel from any report</span>
              </li>
            </ul>
          </div>
          <div class="overview-media-block" id="ijk7i">
            <img src="https://app.grapesjs.com/api/assets/random-image?query=%22hr%20analytics%22&amp;w=1200&amp;h=600" alt="HR Analytics Overview" class="overview-media-image" id="i614j" />
          </div>
        </div>
      </div>
      <div class="overview-divider-container" id="iiney">
        <div class="overview-divider" id="i963h"></div>
      </div>
    </section>
    <section id="dashboard" class="section-dashboard">
      <div class="dashboard-container" id="idu7z">
        <div class="dashboard-header-group" id="iwzbl">
          <h2 class="gjs-t-h2" id="ia56y">Reports Dashboard</h2>
          <div class="dashboard-actions-group" id="ioyvg">
            <button type="button" class="gjs-t-button dashboard-action-button" id="ikw89">
              <img src="https://api.iconify.design/lucide-plus.svg?color=%23ffffff" alt="Add" class="dashboard-action-icon" id="i6lz2" />
              <span id="iikg7">Create Custom Report</span>
            </button>
            <button type="button" class="dashboard-action-button" id="ifxir">
              <img src="https://api.iconify.design/lucide-sliders-horizontal.svg?color=%231f2937" alt="Configure" class="dashboard-action-icon" id="irvsk" />
              <span id="ihfyg">Configure</span>
            </button>
          </div>
        </div>
        <div class="dashboard-grid" id="iu4bf">
          <article tabindex="0" data-report="attendance" class="group gjs-t-border dashboard-card" id="iuo5s">
            <div class="dashboard-card-header" id="ika1l">
              <span class="dashboard-card-badge" id="ir6hh">
                <img src="https://api.iconify.design/lucide-calendar-days.svg?color=%23B90E0A" alt="Attendance" class="dashboard-card-icon" id="i3wtj" />
              </span>
              <h3 class="dashboard-card-title" id="io9ag">Attendance</h3>
            </div>
            <p class="dashboard-card-description" id="iyssn">Track daily presence, late arrivals, and overtime across departments.</p>
            <div class="dashboard-card-actions" id="i0v23">
              <button type="button" data-action="open-details" class="dashboard-card-button" id="iqcdg">
                <img src="https://api.iconify.design/lucide-eye.svg?color=%231f2937" alt="View" class="dashboard-card-button-icon" id="i2k71" />
                <span id="ihqc7">Open Report</span>
              </button>
            </div>
          </article>
          <article tabindex="0" data-report="performance" class="group gjs-t-border dashboard-card" id="icivi">
            <div class="dashboard-card-header" id="ifxfg">
              <span class="dashboard-card-badge" id="i04dt">
                <img src="https://api.iconify.design/lucide-activity.svg?color=%23B90E0A" alt="Performance" class="dashboard-card-icon" id="i2dj5" />
              </span>
              <h3 class="dashboard-card-title" id="iz6niy">Employee Performance</h3>
            </div>
            <p class="dashboard-card-description" id="iblrf6">Review KPIs, goals, and appraisals for individuals and teams.</p>
            <div class="dashboard-card-actions" id="inqhu2">
              <button type="button" data-action="open-details" class="dashboard-card-button" id="iawo4d">
                <img src="https://api.iconify.design/lucide-eye.svg?color=%231f2937" alt="View" class="dashboard-card-button-icon" id="i8oyj2" />
                <span id="i7q7pf">Open Report</span>
              </button>
            </div>
          </article>
          <article tabindex="0" data-report="leave" class="group gjs-t-border dashboard-card" id="irjbvz">
            <div class="dashboard-card-header" id="ibbw9g">
              <span class="dashboard-card-badge" id="i4bc32">
                <img src="https://api.iconify.design/lucide-plane.svg?color=%23B90E0A" alt="Leave" class="dashboard-card-icon" id="inez8o" />
              </span>
              <h3 class="dashboard-card-title" id="ite81l">Leave Summary</h3>
            </div>
            <p class="dashboard-card-description" id="idfx9k">Analyze vacation, sick days, and accrual balances by role.</p>
            <div class="dashboard-card-actions" id="ibog2b">
              <button type="button" data-action="open-details" class="dashboard-card-button" id="i2obtl">
                <img src="https://api.iconify.design/lucide-eye.svg?color=%231f2937" alt="View" class="dashboard-card-button-icon" id="i6qx2f" />
                <span id="iis8ny">Open Report</span>
              </button>
            </div>
          </article>
          <article tabindex="0" data-report="payroll" class="group gjs-t-border dashboard-card" id="itxv2i">
            <div class="dashboard-card-header" id="igbj9p">
              <span class="dashboard-card-badge" id="i97xk1">
                <img src="https://api.iconify.design/lucide-wallet.svg?color=%23B90E0A" alt="Payroll" class="dashboard-card-icon" id="ihvxda" />
              </span>
              <h3 class="dashboard-card-title" id="ip0yvd">Payroll Reports</h3>
            </div>
            <p class="dashboard-card-description" id="izxf8g">Review pay cycles, deductions, tax summaries, and bonuses.</p>
            <div class="dashboard-card-actions" id="i0d2ti">
              <button type="button" data-action="open-details" class="dashboard-card-button" id="in9s24">
                <img src="https://api.iconify.design/lucide-eye.svg?color=%231f2937" alt="View" class="dashboard-card-button-icon" id="iclvdg" />
                <span id="i93rki">Open Report</span>
              </button>
            </div>
          </article>
        </div>
      </div>
      <div class="dashboard-divider-container" id="it2gdu">
        <div class="dashboard-divider" id="icsdv6"></div>
      </div>
    </section>
    <section id="filters" class="section-filters">
      <div class="filters-container" id="iqun6f">
        <div class="filters-header-group" id="i4i4cj">
          <h2 class="gjs-t-h2" id="ie3cez">Filters &amp; Date Range</h2>
          <div class="filters-tag-group" id="i4y0pg">
            <span class="filters-tag" id="ituvkh">
              <img src="https://api.iconify.design/lucide-filter.svg?color=%238a0a07" alt="Filter Icon" class="filters-tag-icon" id="imn4x4" />
              <span id="ide7gx">Active Filters</span>
            </span>
            <span class="filters-result-count" id="ic9c0k">0 results</span>
          </div>
        </div>
        <form method="get" id="filters-form" aria-label="Report Filters" class="filters-form">
          <div class="filters-field" id="i17zkw">
            <label for="department" class="filters-label" id="im794b">Department</label>
            <div class="filters-select-wrapper" id="i6brnu">
              <select type="text" id="department" name="department" class="filters-select">
                <option value="" id="izsa0i">All</option>
                <option value="HR" id="ilql88">HR</option>
                <option value="Engineering" id="iegt3b">Engineering</option>
                <option value="Sales" id="imoqte">Sales</option>
                <option value="Finance" id="ifeaia">Finance</option>
              </select>
              <img src="https://api.iconify.design/lucide-chevron-down.svg?color=%231f2937" alt="" aria-hidden="true" class="filters-select-icon" id="ia4y8i" />
            </div>
          </div>
          <div class="filters-field" id="ixgqvg">
            <label for="status" class="filters-label" id="i4pjry">Employment Status</label>
            <div class="filters-select-wrapper" id="i7uiwi">
              <select type="text" id="status" name="status" class="filters-select">
                <option value="" id="ikl981">All</option>
                <option value="Full-time" id="ifcyw6">Full-time</option>
                <option value="Part-time" id="is2nrd">Part-time</option>
                <option value="Contract" id="i149nq">Contract</option>
              </select>
              <img src="https://api.iconify.design/lucide-chevron-down.svg?color=%231f2937" alt="" aria-hidden="true" class="filters-select-icon" id="ic8eq7" />
            </div>
          </div>
          <div class="filters-field" id="i7k074">
            <label for="from" class="filters-label" id="i5rc0g">From Date</label>
            <input type="date" id="from" name="from" aria-describedby="from-help" class="filters-date-input" />
            <span id="from-help" class="filters-help-text">Select a start date</span>
          </div>
          <div class="filters-field" id="ias7kv">
            <label for="to" class="filters-label" id="iywa4i">To Date</label>
            <input type="date" id="to" name="to" aria-describedby="to-help" class="filters-date-input" />
            <span id="to-help" class="filters-help-text">Select an end date</span>
          </div>
          <fieldset class="filters-fieldset" id="i8dnq3">
            <legend class="filters-legend" id="iu3uad">Include</legend>
            <div class="filters-checkbox-group" id="igojdq">
              <label class="filters-checkbox-label" id="iq0esg">
                <input type="checkbox" name="include_overtime" id="include_overtime" class="peer filters-checkbox-input" />
                <span class="peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 peer-checked:bg-[#B90E0A] peer-checked:border-[#B90E0A] filters-checkbox-custom" id="iknvbh">
                  <img src="https://api.iconify.design/lucide-check.svg?color=%23ffffff" alt="" aria-hidden="true" class="peer-checked:opacity-100 filters-checkbox-icon" id="i9l2fi" />
                </span>
                <span class="filters-checkbox-text" id="i6xrl8">Overtime</span>
              </label>
              <label class="filters-checkbox-label" id="i50g9c">
                <input type="checkbox" name="include_late" id="include_late" class="peer filters-checkbox-input" />
                <span class="peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 peer-checked:bg-[#B90E0A] peer-checked:border-[#B90E0A] filters-checkbox-custom" id="ip39de">
                  <img src="https://api.iconify.design/lucide-check.svg?color=%23ffffff" alt="" aria-hidden="true" class="peer-checked:opacity-100 filters-checkbox-icon" id="iq96ar" />
                </span>
                <span class="filters-checkbox-text" id="i0ayd8">Late arrivals</span>
              </label>
              <label class="filters-checkbox-label" id="i0n1qs">
                <input type="checkbox" name="include_absence" id="include_absence" class="peer filters-checkbox-input" />
                <span class="peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 peer-checked:bg-[#B90E0A] peer-checked:border-[#B90E0A] filters-checkbox-custom" id="iorgij">
                  <img src="https://api.iconify.design/lucide-check.svg?color=%23ffffff" alt="" aria-hidden="true" class="peer-checked:opacity-100 filters-checkbox-icon" id="iplapi" />
                </span>
                <span class="filters-checkbox-text" id="ixbfpm">Unplanned absence</span>
              </label>
            </div>
          </fieldset>
          <fieldset class="filters-fieldset" id="i6ckid">
            <legend class="filters-legend" id="ids2yc">Group By</legend>
            <div class="filters-radio-group" id="i9dasj">
              <label class="filters-radio-label" id="irnv2y">
                <input type="radio" name="groupby" value="department" checked class="peer filters-radio-input" id="il5ubz" />
                <span class="peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 filters-radio-custom" id="iejw7l">
                  <span class="peer-checked:opacity-100 filters-radio-dot" id="io6sjx"></span>
                </span>
                <span class="filters-radio-text" id="ilz82z">Department</span>
              </label>
              <label class="filters-radio-label" id="il5i83">
                <input type="radio" name="groupby" value="role" class="peer filters-radio-input" id="ihubbg" />
                <span class="peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 filters-radio-custom" id="ig6u6p">
                  <span class="peer-checked:opacity-100 filters-radio-dot" id="ivswxl"></span>
                </span>
                <span class="filters-radio-text" id="i3xjav">Role</span>
              </label>
              <label class="filters-radio-label" id="in784k">
                <input type="radio" name="groupby" value="location" class="peer filters-radio-input" id="iaxxzp" />
                <span class="peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 filters-radio-custom" id="i8asdg">
                  <span class="peer-checked:opacity-100 filters-radio-dot" id="ir1aaq"></span>
                </span>
                <span class="filters-radio-text" id="i74qjh">Location</span>
              </label>
            </div>
          </fieldset>
          <div class="filters-actions" id="igstl1">
            <button type="button" id="reset-filters" class="filters-reset-button">
              <img src="https://api.iconify.design/lucide-rotate-ccw.svg?color=%231f2937" alt="Reset" class="filters-reset-icon" id="i1qw8t" />
              <span id="i78lp8">Reset</span>
            </button>
            <button type="submit" class="gjs-t-button filters-apply-button" id="i170t2">
              <img src="https://api.iconify.design/lucide-search.svg?color=%23ffffff" alt="Apply" class="filters-apply-icon" id="it8toq" />
              <span id="ib9oco">Apply Filters</span>
            </button>
          </div>
        </form>
      </div>
      <div class="filters-divider-container" id="i64jej">
        <div class="filters-divider" id="i3mx6t"></div>
      </div>
    </section>
    <section id="details" class="section-details">
      <div class="details-container" id="iy2db5">
        <div class="details-header-group" id="iundi4">
          <div class="details-text-block" id="il7yc5">
            <h2 class="gjs-t-h2" id="isqynl">Report Details</h2>
            <p class="details-paragraph" id="iqmtz9">Select a report from the dashboard to preview data, charts, and export options. The filters above will refine results.</p>
          </div>
          <div class="details-actions-group" id="itqoe6">
            <button type="button" id="open-modal" class="details-open-modal-button">
              <img src="https://api.iconify.design/lucide-expand.svg?color=%231f2937" alt="Expand" class="details-open-modal-icon" id="igxw4l" />
              <span id="imslef">Open in Modal</span>
            </button>
            <button type="button" id="download-pdf" class="details-download-pdf-button">
              <img src="https://api.iconify.design/lucide-file-down.svg?color=%238a0a07" alt="PDF" class="details-download-pdf-icon" id="ih6yb6" />
              <span id="iblj09">PDF</span>
            </button>
            <button type="button" id="download-xls" class="details-download-xls-button">
              <img src="https://api.iconify.design/lucide-file-spreadsheet.svg?color=%238a0a07" alt="Excel" class="details-download-xls-icon" id="icm8i3" />
              <span id="ix638h">Excel</span>
            </button>
          </div>
        </div>
        <div class="details-grid" id="i2evc1">
          <div class="gjs-t-border details-panel" id="ipqiwk">
            <div class="details-panel-header" id="ilwqk3">
              <div class="details-panel-title-group" id="iqbejz">
                <span class="details-panel-badge" id="i8t7n4">
                  <img id="details-icon" src="https://api.iconify.design/lucide-info.svg?color=%23B90E0A" alt="Report Icon" class="details-panel-icon" />
                </span>
                <h3 id="details-title" class="details-panel-title">No report selected</h3>
              </div>
              <span id="details-subtitle" class="details-panel-subtitle">Choose a report from the dashboard</span>
            </div>
            <div class="details-analytics-grid" id="irkl3g">
              <div class="details-stat-card" id="i9b1kl">
                <div class="details-stat-header" id="i5nvm2">
                  <span class="details-stat-label" id="i65i9z">Period</span>
                  <span id="details-period" class="details-stat-value">—</span>
                </div>
                <div class="details-stat-footer" id="i15tcv">
                  <span class="details-stat-label" id="i7ddro">Department</span>
                  <span id="details-dept" class="details-stat-value">—</span>
                </div>
              </div>
              <div class="details-stat-card" id="i5o7sr">
                <div class="details-stat-header" id="i8xbgr">
                  <span class="details-stat-label" id="i98k7s">Group By</span>
                  <span id="details-groupby" class="details-stat-value">—</span>
                </div>
                <div class="details-stat-footer" id="i66znh">
                  <span class="details-stat-label" id="iv5i04">Status</span>
                  <span id="details-status" class="details-stat-value">—</span>
                </div>
              </div>
            </div>
            <div class="details-chart-block" id="is5qd2">
              <div class="details-chart-header" id="iatcki">
                <span class="details-chart-title" id="ia0iqy">Charts preview</span>
                <div class="details-chart-actions" id="inaukl">
                  <button type="button" class="details-chart-action-button" id="i0rgvz">
                    <img src="https://api.iconify.design/lucide-refresh-cw.svg?color=%238a0a07" alt="Refresh" class="details-chart-action-icon" id="ijqa6k" />
                    <span id="i7g4jv">Refresh</span>
                  </button>
                </div>
              </div>
              <img loading="lazy" src="https://app.grapesjs.com/api/assets/random-image?query=%22charts%22&amp;w=1400&amp;h=420" alt="Charts preview" class="details-chart-image" id="i3ijgc" />
            </div>
            <div class="details-table-block" id="ig84ai">
              <div class="details-table-header" id="i0fkse">
                <span class="details-table-title" id="i3nbpb">Top Lines</span>
                <div class="details-table-actions" id="i9tw99">
                  <button type="button" class="details-table-action-button" id="iwh8kq">
                    <img src="https://api.iconify.design/lucide-columns.svg?color=%231f2937" alt="Columns" class="details-table-action-icon" id="iw02mk" />
                    <span id="iu7nvn">Columns</span>
                  </button>
                </div>
              </div>
              <div class="details-table-wrapper" id="izyvv5">
                <table class="details-table" id="iv881o">
                  <thead class="details-table-head" id="iv1z18">
                    <tr id="i1wr6u">
                      <th class="details-table-head-cell" id="i8vmv5">Employee</th>
                      <th class="details-table-head-cell" id="i0v219">Department</th>
                      <th class="details-table-head-cell" id="iqbi8h">Metric</th>
                      <th class="details-table-head-cell" id="iuf7xj">Value</th>
                    </tr>
                  </thead>
                  <tbody class="details-table-body" id="ijtspf">
                    <tr id="ioyagj">
                      <td class="details-table-cell" id="ij4vt8">Alex Johnson</td>
                      <td class="details-table-cell" id="imtqwt">Engineering</td>
                      <td class="details-table-cell" id="ifnmoj">Attendance Rate</td>
                      <td class="details-table-cell" id="id3hv1">98%</td>
                    </tr>
                    <tr id="iznj6g">
                      <td class="details-table-cell" id="ixio13">Priya Patel</td>
                      <td class="details-table-cell" id="icwtrl">HR</td>
                      <td class="details-table-cell" id="it23v9">Appraisal Score</td>
                      <td class="details-table-cell" id="i1z73n">4.6</td>
                    </tr>
                    <tr id="izp3zl">
                      <td class="details-table-cell" id="i2uint">Chen Li</td>
                      <td class="details-table-cell" id="i05npf">Finance</td>
                      <td class="details-table-cell" id="i9zs0j">Leave Balance</td>
                      <td class="details-table-cell" id="ioxfmg">12 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <aside class="gjs-t-border details-sidebar" id="ixdrag">
            <h3 class="details-sidebar-title" id="iatno1">Quick Actions</h3>
            <div class="details-sidebar-actions" id="ib6c3a">
              <button type="button" class="details-sidebar-button" id="i61jqz">
                <span class="details-sidebar-button-content" id="i2klem">
                  <img src="https://api.iconify.design/lucide-pin.svg?color=%231f2937" alt="Pin" class="details-sidebar-button-icon" id="ici916" />
                  <span id="iozi3f">Pin report</span>
                </span>
                <img src="https://api.iconify.design/lucide-chevron-right.svg?color=%231f2937" alt="" aria-hidden="true" class="details-sidebar-button-arrow" id="ibgg4s" />
              </button>
              <button type="button" class="details-sidebar-button" id="ijrsmk">
                <span class="details-sidebar-button-content" id="i5kmbd">
                  <img src="https://api.iconify.design/lucide-share-2.svg?color=%231f2937" alt="Share" class="details-sidebar-button-icon" id="ik49f7" />
                  <span id="i87b2i">Share link</span>
                </span>
                <img src="https://api.iconify.design/lucide-chevron-right.svg?color=%231f2937" alt="" aria-hidden="true" class="details-sidebar-button-arrow" id="iq2udi" />
              </button>
              <button type="button" class="details-sidebar-button" id="i9ho6g">
                <span class="details-sidebar-button-content" id="ia0rwi">
                  <img src="https://api.iconify.design/lucide-bell.svg?color=%231f2937" alt="Alert" class="details-sidebar-button-icon" id="ilngai" />
                  <span id="iltmvj">Set alert</span>
                </span>
                <img src="https://api.iconify.design/lucide-chevron-right.svg?color=%231f2937" alt="" aria-hidden="true" class="details-sidebar-button-arrow" id="izh0ww" />
              </button>
            </div>
            <div class="details-sidebar-divider-group" id="ic7xsc">
              <h4 class="details-sidebar-secondary-title" id="i9u74k">Pinned Reports</h4>
              <ul class="details-sidebar-pinned-list" id="io9q0n">
                <li class="details-sidebar-pinned-item" id="iiwori">
                  <span class="details-sidebar-pinned-text" id="iol99u">Monthly Attendance</span>
                  <img src="https://api.iconify.design/lucide-chevron-right.svg?color=%231f2937" alt="" aria-hidden="true" class="details-sidebar-pinned-arrow" id="ifqsag" />
                </li>
                <li class="details-sidebar-pinned-item" id="ikjxtv">
                  <span class="details-sidebar-pinned-text" id="ixmbwr">Quarterly Performance</span>
                  <img src="https://api.iconify.design/lucide-chevron-right.svg?color=%231f2937" alt="" aria-hidden="true" class="details-sidebar-pinned-arrow" id="izkq82" />
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
    <div id="modal" aria-hidden="true" class="modal-root">
      <div class="modal-backdrop" id="indwxh"></div>
      <div class="modal-container" id="itajxz">
        <div class="modal-content" id="io40q8">
          <div class="modal-header" id="ivzen2">
            <div class="modal-title-group" id="i5289s">
              <span class="modal-badge" id="iqfocb">
                <img id="modal-icon" src="https://api.iconify.design/lucide-info.svg?color=%23B90E0A" alt="Report Icon" class="modal-icon" />
              </span>
              <h3 id="modal-title" class="modal-title">Report</h3>
            </div>
            <button type="button" id="close-modal" aria-label="Close modal" class="modal-close-button">
              <img src="https://api.iconify.design/lucide-x.svg?color=%231f2937" alt="" aria-hidden="true" class="modal-close-icon" id="iggk2h" />
              <span id="isswox">Close</span>
            </button>
          </div>
          <div class="modal-body" id="ihqeei">
            <div class="modal-grid" id="i3lsac">
              <div class="modal-stat-card" id="ixja2y">
                <div class="modal-stat-header" id="i7qiwp">
                  <span class="modal-stat-label" id="i2mtcj">Period</span>
                  <span id="modal-period" class="modal-stat-value">—</span>
                </div>
                <div class="modal-stat-footer" id="iu3cbs">
                  <span class="modal-stat-label" id="i5gy4p">Department</span>
                  <span id="modal-dept" class="modal-stat-value">—</span>
                </div>
              </div>
              <div class="modal-stat-card" id="iijf3j">
                <div class="modal-stat-header" id="im1qte">
                  <span class="modal-stat-label" id="iezv4g">Group By</span>
                  <span id="modal-groupby" class="modal-stat-value">—</span>
                </div>
                <div class="modal-stat-footer" id="i1q3bo">
                  <span class="modal-stat-label" id="ifnsq8">Status</span>
                  <span id="modal-status" class="modal-stat-value">—</span>
                </div>
              </div>
            </div>
            <div class="modal-chart-block" id="i6zebi">
              <img loading="lazy" src="https://app.grapesjs.com/api/assets/random-image?query=%22hr%20charts%22&amp;w=1200&amp;h=380" alt="Report charts" class="modal-chart-image" id="iqpbtj" />
            </div>
          </div>
          <div class="modal-footer" id="ig2boj">
            <div class="modal-footer-actions-left" id="ins3mf">
              <button type="button" class="modal-footer-button" id="i7amol">
                <img src="https://api.iconify.design/lucide-file-down.svg?color=%238a0a07" alt="PDF" class="modal-footer-button-icon" id="ic6hpj" />
                <span id="ixn07w">PDF</span>
              </button>
              <button type="button" class="modal-footer-button" id="ilopli">
                <img src="https://api.iconify.design/lucide-file-spreadsheet.svg?color=%238a0a07" alt="Excel" class="modal-footer-button-icon" id="i9rwyj" />
                <span id="ifpsew">Excel</span>
              </button>
            </div>
            <div class="modal-footer-actions-right" id="iqbsbu">
              <button type="button" class="gjs-t-button modal-footer-button" id="i60h8h">
                <img src="https://api.iconify.design/lucide-download.svg?color=%23ffffff" alt="Download" class="modal-footer-button-icon" id="ipp3vi" />
                <span id="in5ipo">Download All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer-main" id="it65hm">
      <div class="footer-container" id="ihrwr4">
        <div class="footer-left-group" id="inckf1">
          <img src="https://api.iconify.design/lucide-copyright.svg?color=%231f2937" alt="Copyright" class="footer-copyright-icon" id="i0n92e" />
          <span id="iyszbi">© 2026 HR Reports</span>
        </div>
        <div class="footer-right-group" id="iyizpn">
          <a href="#" class="gjs-t-link footer-link" id="ijo3hg">Support</a>
          <a href="#" class="gjs-t-link footer-link" id="i7hpf4">Documentation</a>
          <a href="#" class="gjs-t-link footer-link" id="ihubah">Privacy</a>
        </div>
      </div>
    </footer>
    <script id="iyay3l">
      const cards = document.querySelectorAll('[data-action="open-details"]');
      const detailsTitle = document.getElementById('details-title');
      const detailsSubtitle = document.getElementById('details-subtitle');
      const detailsIcon = document.getElementById('details-icon');
      const detailsPeriod = document.getElementById('details-period');
      const detailsDept = document.getElementById('details-dept');
      const detailsGroupBy = document.getElementById('details-groupby');
      const detailsStatus = document.getElementById('details-status');

      const filtersForm = document.getElementById('filters-form');
      const resultCount = document.querySelector('[data-gjs-name="Filters Result Count"]');
      const resetBtn = document.getElementById('reset-filters');

      const modalRoot = document.getElementById('modal');
      const openModalBtn = document.getElementById('open-modal');
      const closeModalBtn = document.getElementById('close-modal');
      const modalTitle = document.getElementById('modal-title');
      const modalIcon = document.getElementById('modal-icon');
      const modalPeriod = document.getElementById('modal-period');
      const modalDept = document.getElementById('modal-dept');
      const modalGroupBy = document.getElementById('modal-groupby');
      const modalStatus = document.getElementById('modal-status');

      let currentReport = null;

      const REPORT_META = {
        attendance: {
          title: 'Attendance',
          subtitle: 'Daily presence, late arrivals, overtime',
          icon: 'https://api.iconify.design/lucide-calendar-days.svg?color=%23B90E0A'
        },
        performance: {
          title: 'Employee Performance',
          subtitle: 'KPIs, goals, appraisals',
          icon: 'https://api.iconify.design/lucide-activity.svg?color=%23B90E0A'
        },
        leave: {
          title: 'Leave Summary',
          subtitle: 'Vacation, sick days, accruals',
          icon: 'https://api.iconify.design/lucide-plane.svg?color=%23B90E0A'
        },
        payroll: {
          title: 'Payroll Reports',
          subtitle: 'Pay cycles, deductions, taxes',
          icon: 'https://api.iconify.design/lucide-wallet.svg?color=%23B90E0A'
        }
      };

      function getFilterData() {
        const department = document.getElementById('department').value || 'All';
        const status = document.getElementById('status').value || 'All';
        const from = document.getElementById('from').value || '—';
        const to = document.getElementById('to').value || '—';
        const includeOvertime = document.getElementById('include_overtime').checked;
        const includeLate = document.getElementById('include_late').checked;
        const includeAbsence = document.getElementById('include_absence').checked;
        const groupby = document.querySelector('input[name="groupby"]:checked')?.value || 'department';
        return {
          department,
          status,
          from,
          to,
          includeOvertime,
          includeLate,
          includeAbsence,
          groupby
        };
      }

      function updateDetailsMeta() {
        const f = getFilterData();
        detailsPeriod.textContent = f.from !== '—' && f.to !== '—' ? `${f.from} → ${f.to}` : '—';
        detailsDept.textContent = f.department;
        detailsGroupBy.textContent = f.groupby;
        detailsStatus.textContent = f.status;
        modalPeriod.textContent = detailsPeriod.textContent;
        modalDept.textContent = f.department;
        modalGroupBy.textContent = f.groupby;
        modalStatus.textContent = f.status;
      }

      function updateResultCount() {
        const f = getFilterData();
        let countBase = 124;
        if (f.department && f.department !== 'All') countBase -= 20;
        if (f.status && f.status !== 'All') countBase -= 15;
        if (f.includeOvertime) countBase += 8;
        if (f.includeLate) countBase += 5;
        if (f.includeAbsence) countBase += 3;
        resultCount.textContent = `${Math.max(0, countBase)} results`;
      }

      cards.forEach(btn => {
        btn.addEventListener('click', e => {
          const card = e.currentTarget.closest('[data-report]');
          const report = card?.getAttribute('data-report');
          currentReport = report;
          const meta = REPORT_META[report];
          detailsTitle.textContent = meta.title;
          detailsSubtitle.textContent = meta.subtitle;
          detailsIcon.src = meta.icon;
          modalTitle.textContent = meta.title;
          modalIcon.src = meta.icon;
          updateDetailsMeta();
          window.location.hash = '#details';
        });
      });

      filtersForm.addEventListener('submit', e => {
        e.preventDefault();
        updateDetailsMeta();
        updateResultCount();
      });

      resetBtn.addEventListener('click', () => {
        filtersForm.reset();
        updateDetailsMeta();
        updateResultCount();
      });

      openModalBtn.addEventListener('click', () => {
        if (!currentReport) {
          currentReport = 'attendance';
          const meta = REPORT_META[currentReport];
          detailsTitle.textContent = meta.title;
          detailsSubtitle.textContent = meta.subtitle;
          detailsIcon.src = meta.icon;
          modalTitle.textContent = meta.title;
          modalIcon.src = meta.icon;
        }
        updateDetailsMeta();
        modalRoot.classList.remove('hidden');
        modalRoot.setAttribute('aria-hidden', 'false');
        closeModalBtn.focus();
      });

      closeModalBtn.addEventListener('click', () => {
        modalRoot.classList.add('hidden');
        modalRoot.setAttribute('aria-hidden', 'true');
        openModalBtn.focus();
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          modalRoot.classList.add('hidden');
          modalRoot.setAttribute('aria-hidden', 'true');
        }
      });

      document.addEventListener('click', e => {
        if (e.target === modalRoot.querySelector('[data-gjs-name="Modal Backdrop"]')) {
          modalRoot.classList.add('hidden');
          modalRoot.setAttribute('aria-hidden', 'true');
        }
      });

      updateResultCount();
    </script>
  </body>

</html>