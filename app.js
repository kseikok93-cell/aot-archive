/**
 * Attack on Titan - Interactive Archive & Encyclopedia Engine
 * محرك موسوعة وأرشيف هجوم العمالقة الشامل
 */

// App State
const state = {
  activeTab: 'timeline',
  timelineData: [],
  charactersData: [],
  titansData: null,
  filters: {
    timeline: {
      search: '',
      work: 'all',
      era: 'all'
    },
    characters: {
      search: '',
      importance: 'all',
      work: 'all',
      affiliation: 'all',
      status: 'all'
    }
  }
};

// DOM Elements
const elements = {
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabSections: document.querySelectorAll('.tab-content-section'),
  
  // Timeline elements
  timelineFlow: document.getElementById('timelineFlow'),
  timelineSearch: document.getElementById('timelineSearch'),
  timelineWorkFilter: document.getElementById('timelineWorkFilter'),
  timelineEraFilter: document.getElementById('timelineEraFilter'),
  timelineSortBtn: document.getElementById('timelineSortBtn'),
  timelineCount: document.getElementById('timelineCount'),
  
  // Character elements
  charGrid: document.getElementById('characterGrid'),
  charSearch: document.getElementById('charSearch'),
  charImportanceFilter: document.getElementById('charImportanceFilter'),
  charWorkFilter: document.getElementById('charWorkFilter'),
  charAffiliationFilter: document.getElementById('charAffiliationFilter'),
  charStatusFilter: document.getElementById('charStatusFilter'),
  charCount: document.getElementById('charCount'),
  
  // Titans elements
  titansGrid: document.getElementById('titansGrid'),
  techGrid: document.getElementById('techGrid'),
  
  // Metrics
  metricChars: document.getElementById('metricChars'),
  metricEvents: document.getElementById('metricEvents'),
  metricTitans: document.getElementById('metricTitans'),
  
  // Modal Dossier elements
  modalOverlay: document.getElementById('dossierModal'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  modalContent: document.getElementById('modalDetailsContainer'),
  
  // Offline notification banner
  corsBanner: document.getElementById('corsNoticeBanner')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupFilterListeners();
  setupModalEvents();
  await loadAllData();
});

// Setup Navigation Tabs
function setupNavigation() {
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update buttons
  elements.tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update sections
  elements.tabSections.forEach(section => {
    if (section.id === `${tabId}Section`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // Scroll to top of content smoothly
  window.scrollTo({ top: 380, behavior: 'smooth' });
}

// Load Data from JSON Files in /data
async function loadAllData() {
  try {
    const [
      timelineRes,
      charsMainRes,
      charsScoutsRes,
      charsMarleyRes,
      charsSpinoffsRes,
      titansRes
    ] = await Promise.all([
      fetch('./data/timeline.json'),
      fetch('./data/chars_main.json'),
      fetch('./data/chars_scouts_military.json'),
      fetch('./data/chars_marley_world.json'),
      fetch('./data/chars_spinoffs.json'),
      fetch('./data/titans_lore.json')
    ]);

    state.timelineData = await timelineRes.json();
    const charsMain = await charsMainRes.json();
    const charsScouts = await charsScoutsRes.json();
    const charsMarley = await charsMarleyRes.json();
    const charsSpinoffs = await charsSpinoffsRes.json();
    state.titansData = await titansRes.json();

    // Aggregate all characters into one unified roster
    state.charactersData = [
      ...charsMain,
      ...charsScouts,
      ...charsMarley,
      ...charsSpinoffs
    ];

    // Update header metrics
    updateMetrics();

    // Populate dynamic filter options
    populateFilterOptions();

    // Render initial views
    renderTimeline();
    renderCharacters();
    renderTitansAndLore();

  } catch (error) {
    console.warn('Network / Local Fetch Error:', error);
    // If running directly on file:// without a web server and browser blocks fetch
    if (window.location.protocol === 'file:') {
      if (elements.corsBanner) {
        elements.corsBanner.style.display = 'block';
      }
    }
  }
}

// Update Top Metrics
function updateMetrics() {
  if (elements.metricChars) elements.metricChars.textContent = state.charactersData.length;
  if (elements.metricEvents) elements.metricEvents.textContent = state.timelineData.length;
  if (elements.metricTitans) elements.metricTitans.textContent = state.titansData?.titans?.length || 9;
}

// Populate Filter Select Boxes dynamically
function populateFilterOptions() {
  // Timeline Eras
  if (elements.timelineEraFilter) {
    const eras = [...new Set(state.timelineData.map(e => e.era).filter(Boolean))];
    eras.forEach(era => {
      const opt = document.createElement('option');
      opt.value = era;
      opt.textContent = era;
      elements.timelineEraFilter.appendChild(opt);
    });
  }
}

// Setup Filter & Search Event Listeners
function setupFilterListeners() {
  // Timeline Listeners
  if (elements.timelineSearch) {
    elements.timelineSearch.addEventListener('input', (e) => {
      state.filters.timeline.search = e.target.value.trim().toLowerCase();
      renderTimeline();
    });
  }

  if (elements.timelineWorkFilter) {
    elements.timelineWorkFilter.addEventListener('change', (e) => {
      state.filters.timeline.work = e.target.value;
      renderTimeline();
    });
  }

  if (elements.timelineEraFilter) {
    elements.timelineEraFilter.addEventListener('change', (e) => {
      state.filters.timeline.era = e.target.value;
      renderTimeline();
    });
  }

  // Character Listeners
  if (elements.charSearch) {
    elements.charSearch.addEventListener('input', (e) => {
      state.filters.characters.search = e.target.value.trim().toLowerCase();
      renderCharacters();
    });
  }

  if (elements.charImportanceFilter) {
    elements.charImportanceFilter.addEventListener('change', (e) => {
      state.filters.characters.importance = e.target.value;
      renderCharacters();
    });
  }

  if (elements.charWorkFilter) {
    elements.charWorkFilter.addEventListener('change', (e) => {
      state.filters.characters.work = e.target.value;
      renderCharacters();
    });
  }

  if (elements.charAffiliationFilter) {
    elements.charAffiliationFilter.addEventListener('change', (e) => {
      state.filters.characters.affiliation = e.target.value;
      renderCharacters();
    });
  }

  if (elements.charStatusFilter) {
    elements.charStatusFilter.addEventListener('change', (e) => {
      state.filters.characters.status = e.target.value;
      renderCharacters();
    });
  }

  // Clear filters helper buttons
  document.querySelectorAll('.clear-filters-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      resetFilters();
    });
  });
}

function resetFilters() {
  // Reset Character filters
  state.filters.characters = {
    search: '',
    importance: 'all',
    work: 'all',
    affiliation: 'all',
    status: 'all'
  };
  if (elements.charSearch) elements.charSearch.value = '';
  if (elements.charImportanceFilter) elements.charImportanceFilter.value = 'all';
  if (elements.charWorkFilter) elements.charWorkFilter.value = 'all';
  if (elements.charAffiliationFilter) elements.charAffiliationFilter.value = 'all';
  if (elements.charStatusFilter) elements.charStatusFilter.value = 'all';

  // Reset Timeline filters
  state.filters.timeline = {
    search: '',
    work: 'all',
    era: 'all'
  };
  if (elements.timelineSearch) elements.timelineSearch.value = '';
  if (elements.timelineWorkFilter) elements.timelineWorkFilter.value = 'all';
  if (elements.timelineEraFilter) elements.timelineEraFilter.value = 'all';

  renderTimeline();
  renderCharacters();
}

/* ==========================================================================
   Render Section 1: Master Timeline
   ========================================================================== */
function renderTimeline() {
  if (!elements.timelineFlow) return;

  const { search, work, era } = state.filters.timeline;

  const filtered = state.timelineData.filter(item => {
    const matchSearch = !search || 
      item.title?.toLowerCase().includes(search) ||
      item.summary?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.year?.toLowerCase().includes(search) ||
      item.characters?.some(c => c.toLowerCase().includes(search));

    const matchWork = work === 'all' || item.source_work === work;
    const matchEra = era === 'all' || item.era === era;

    return matchSearch && matchWork && matchEra;
  });

  // Sort ascending by year_sort
  filtered.sort((a, b) => (a.year_sort || 0) - (b.year_sort || 0));

  if (elements.timelineCount) {
    elements.timelineCount.textContent = `(${filtered.length} حدث)`;
  }

  if (filtered.length === 0) {
    elements.timelineFlow.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
        <p style="font-size: 1.2rem; font-weight: 700;">لم يتم العثور على أي حدث يطابق خيارات البحث.</p>
        <button class="clear-filters-btn" style="margin-top: 1rem; color: var(--accent-gold);">إعادة تعيين الفلاتر</button>
      </div>
    `;
    return;
  }

  elements.timelineFlow.innerHTML = filtered.map(item => `
    <div class="timeline-entry">
      <div class="timeline-marker">
        <span>⚔</span>
      </div>
      <div class="timeline-card">
        <div class="timeline-card-header">
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            <span class="event-year-tag">📅 ${escapeHtml(item.year)}</span>
            <span class="event-source-tag">${escapeHtml(item.source_work)}</span>
          </div>
          <span style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 700;">${escapeHtml(item.era)}</span>
        </div>

        <h3 class="timeline-title">${escapeHtml(item.title)}</h3>
        
        <div class="timeline-meta">
          <span>📍 المكان: ${escapeHtml(item.location || 'غير محدد')}</span>
        </div>

        <p class="timeline-summary">${escapeHtml(item.summary)}</p>

        <div class="timeline-details">
          ${escapeHtml(item.description)}
        </div>

        ${item.impact ? `
          <div class="timeline-impact">
            <strong>⚠️ التداعيات والنتائج:</strong> ${escapeHtml(item.impact)}
          </div>
        ` : ''}

        ${item.characters && item.characters.length > 0 ? `
          <div class="timeline-cast">
            <span class="timeline-cast-label">الشخصيات المعنية:</span>
            ${item.characters.map(c => `<span class="character-tag">${escapeHtml(c)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   Render Section 2: Character Index
   ========================================================================== */
function renderCharacters() {
  if (!elements.charGrid) return;

  const { search, importance, work, affiliation, status } = state.filters.characters;

  const filtered = state.charactersData.filter(char => {
    const searchMatch = !search ||
      char.name_ar?.toLowerCase().includes(search) ||
      char.name_en?.toLowerCase().includes(search) ||
      char.aliases?.some(a => a.toLowerCase().includes(search)) ||
      char.affiliation?.toLowerCase().includes(search) ||
      char.titan_powers?.some(t => t.toLowerCase().includes(search));

    const importanceMatch = importance === 'all' || char.importance === importance;
    const workMatch = work === 'all' || (char.source_work && char.source_work.includes(work));
    const affiliationMatch = affiliation === 'all' || (char.affiliation && char.affiliation.includes(affiliation));
    
    let statusMatch = true;
    if (status === 'alive') {
      statusMatch = char.status?.state?.includes('حي');
    } else if (status === 'dead') {
      statusMatch = char.status?.state?.includes('متوفى');
    }

    return searchMatch && importanceMatch && workMatch && affiliationMatch && statusMatch;
  });

  if (elements.charCount) {
    elements.charCount.textContent = `(${filtered.length} شخصية)`;
  }

  if (filtered.length === 0) {
    elements.charGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
        <p style="font-size: 1.2rem; font-weight: 700;">لا توجد شخصيات تطابق معايير الفلترة المحددة.</p>
        <button class="clear-filters-btn" style="margin-top: 1rem; color: var(--accent-gold);">إعادة تعيين الفلاتر</button>
      </div>
    `;
    return;
  }

  elements.charGrid.innerHTML = filtered.map(char => {
    const initial = char.name_ar ? char.name_ar.charAt(0) : '؟';
    const isAlive = char.status?.state?.includes('حي');
    const isMain = char.importance === 'رئيسية';
    const hasTitan = char.titan_powers && char.titan_powers.length > 0;

    return `
      <div class="char-card" onclick="openCharacterDossier('${char.id}')">
        <div class="char-card-header">
          <div class="char-avatar-ring">
            <span>${initial}</span>
          </div>
          <div class="char-header-text">
            <h3 class="char-name-ar">${escapeHtml(char.name_ar)}</h3>
            <span class="char-name-en">${escapeHtml(char.name_en || '')}</span>
          </div>
        </div>

        <div class="char-card-body">
          <div class="char-badges-row">
            <span class="badge ${isMain ? 'badge-main' : 'badge-secondary'}">
              ${escapeHtml(char.importance || 'جانبية')}
            </span>
            <span class="badge ${isAlive ? 'badge-alive' : 'badge-dead'}">
              ${isAlive ? '● على قيد الحياة' : '✝ متوفى'}
            </span>
            ${hasTitan ? `
              <span class="badge badge-titan">
                ⚡ متحول عملاق
              </span>
            ` : ''}
          </div>

          <div class="char-meta-table">
            <span class="char-meta-label">الانتماء:</span>
            <span>${escapeHtml(char.affiliation || 'غير معروف')}</span>

            <span class="char-meta-label">العمل:</span>
            <span>${escapeHtml(char.source_work || 'المانجا')}</span>

            <span class="char-meta-label">الرتبة:</span>
            <span>${escapeHtml(char.rank || 'غير محدد')}</span>
          </div>

          ${char.stats ? `
            <div class="char-stat-mini-bars">
              ${char.stats.combat ? `
                <div class="mini-stat-row">
                  <span>القتال</span>
                  <div class="stat-bar-track">
                    <div class="stat-bar-fill" style="width: ${Math.min(char.stats.combat * 10, 100)}%;"></div>
                  </div>
                  <span>${char.stats.combat}/10</span>
                </div>
              ` : ''}
              ${char.stats.intelligence ? `
                <div class="mini-stat-row">
                  <span>الذكاء</span>
                  <div class="stat-bar-track">
                    <div class="stat-bar-fill" style="width: ${Math.min(char.stats.intelligence * 10, 100)}%;"></div>
                  </div>
                  <span>${char.stats.intelligence}/10</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <div class="char-card-footer">
          <span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(char.birthday || '')}</span>
          <span class="view-dossier-btn">الملف الكامل ←</span>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   Render Section 3: The Nine Titans & Lore
   ========================================================================== */
function renderTitansAndLore() {
  if (!state.titansData) return;

  // Render Nine Titans
  if (elements.titansGrid && state.titansData.titans) {
    elements.titansGrid.innerHTML = state.titansData.titans.map(titan => `
      <div class="titan-card">
        <div class="titan-header">
          <div>
            <h3 class="titan-title-ar">${escapeHtml(titan.name_ar)}</h3>
            <span class="titan-title-en">${escapeHtml(titan.name_en)}</span>
          </div>
          <span class="titan-height-pill">الطول: ${escapeHtml(titan.height)}</span>
        </div>

        <p class="titan-summary">${escapeHtml(titan.summary)}</p>

        <div class="titan-abilities-box">
          <div class="box-heading">
            <span>⚡ القدرات والخصائص الخارقة:</span>
          </div>
          <ul class="titan-abilities-list">
            ${titan.abilities.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
          </ul>
        </div>

        ${titan.activation_condition ? `
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1.2rem; background: rgba(255,255,255,0.03); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm);">
            <strong>شرط التفعيل:</strong> ${escapeHtml(titan.activation_condition)}
          </div>
        ` : ''}

        <div class="box-heading" style="margin-bottom: 0.85rem;">
          <span>👑 شجرة التوارث الزمني الكاملة:</span>
        </div>

        <div class="tree-container">
          ${titan.inheritance_tree.map(node => `
            <div class="tree-node">
              <div class="tree-node-title">
                ${node.order}. ${escapeHtml(node.holder_ar)} 
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">(${escapeHtml(node.holder_en)})</span>
              </div>
              <div class="tree-node-era">${escapeHtml(node.era)}</div>
              <div class="tree-node-method">${escapeHtml(node.method)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Render Military Technology & Lore
  if (elements.techGrid && state.titansData.technology) {
    elements.techGrid.innerHTML = state.titansData.technology.map(tech => `
      <div class="tech-card">
        <h4>🛠 ${escapeHtml(tech.name_ar)}</h4>
        
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.6rem;">
          <div><strong>المخترع:</strong> ${escapeHtml(tech.inventor || 'غير معروف')}</div>
          <div><strong>الحقبة:</strong> ${escapeHtml(tech.era || 'عصر الأسوار')}</div>
          <div><strong>مصدر الطاقة:</strong> ${escapeHtml(tech.power_source || 'ميكانيكي')}</div>
        </div>

        <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.6;">
          ${escapeHtml(tech.description)}
        </p>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   Character Dossier Modal Functions
   ========================================================================== */
window.openCharacterDossier = function(charId) {
  const char = state.charactersData.find(c => c.id === charId);
  if (!char || !elements.modalContent) return;

  const initial = char.name_ar ? char.name_ar.charAt(0) : '؟';
  const isAlive = char.status?.state?.includes('حي');

  elements.modalContent.innerHTML = `
    <div class="modal-banner-header">
      <div class="modal-avatar-large">
        <span>${initial}</span>
      </div>
      <div class="modal-title-wrap">
        <h2>${escapeHtml(char.name_ar)}</h2>
        <div class="modal-subtitle">
          <span>${escapeHtml(char.name_en || '')}</span> • 
          <span>${escapeHtml(char.affiliation || '')}</span> • 
          <span style="color: ${isAlive ? '#6ee7b7' : '#fca5a5'}; font-weight: 700;">
            ${isAlive ? 'على قيد الحياة' : 'متوفى'}
          </span>
        </div>
        ${char.aliases && char.aliases.length > 0 ? `
          <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--accent-gold);">
            <strong>الألقاب:</strong> ${char.aliases.map(a => escapeHtml(a)).join(' | ')}
          </div>
        ` : ''}
      </div>
    </div>

    <div class="modal-body-content">
      <!-- 1. البطاقة التعريفية (ID Card) -->
      <div class="dossier-section">
        <h3 class="dossier-section-title">🪪 البطاقة التعريفية والبيانات الحيوية</h3>
        <div class="id-card-grid">
          <div class="id-field">
            <span class="id-label">الاسم الكامل:</span>
            <span class="id-val">${escapeHtml(char.name_ar)} (${escapeHtml(char.name_en || '')})</span>
          </div>
          <div class="id-field">
            <span class="id-label">تاريخ الميلاد:</span>
            <span class="id-val">${escapeHtml(char.birthday || 'غير محدد')}</span>
          </div>
          <div class="id-field">
            <span class="id-label">الطول:</span>
            <span class="id-val">${escapeHtml(char.height || 'غير محدد')}</span>
          </div>
          <div class="id-field">
            <span class="id-label">الوزن:</span>
            <span class="id-val">${escapeHtml(char.weight || 'غير محدد')}</span>
          </div>
          <div class="id-field">
            <span class="id-label">فصيلة الدم:</span>
            <span class="id-val">${escapeHtml(char.blood_type || 'غير معروف')}</span>
          </div>
          <div class="id-field">
            <span class="id-label">الرتبة / الدور:</span>
            <span class="id-val">${escapeHtml(char.rank || 'جندي')}</span>
          </div>
          <div class="id-field">
            <span class="id-label">العمل والظهور:</span>
            <span class="id-val">${escapeHtml(char.source_work || 'المانجا الأساسية')}</span>
          </div>
          <div class="id-field">
            <span class="id-label">الحالة الحالية:</span>
            <span class="id-val" style="color: ${isAlive ? '#6ee7b7' : '#fca5a5'};">
              ${escapeHtml(char.status?.state || 'غير محدد')}
            </span>
          </div>
        </div>

        ${char.status?.cause_of_death ? `
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px dashed rgba(239, 68, 68, 0.4); padding: 0.9rem; border-radius: var(--radius-sm); font-size: 0.85rem; color: #fca5a5;">
            <strong>ظروف الوفاة (${escapeHtml(char.status.chapter_episode || '')}):</strong><br>
            ${escapeHtml(char.status.cause_of_death)}
          </div>
        ` : ''}

        ${char.age_info ? `
          <div style="background: rgba(0,0,0,0.25); padding: 0.8rem; border-radius: var(--radius-sm); font-size: 0.82rem; color: #d1d5db;">
            <strong>تطور العمر عبر المراحل:</strong> 
            ${Object.entries(char.age_info).map(([k, v]) => `• ${escapeHtml(v)}`).join(' ')}
          </div>
        ` : ''}
      </div>

      <!-- 2. الإحصائيات والقدرات (Stats & Skills) -->
      ${char.stats ? `
        <div class="dossier-section">
          <h3 class="dossier-section-title">📊 التقييمات الرسمية والقدرات القتالية (Guidebook)</h3>
          <div class="stats-bars-detailed">
            ${Object.entries(char.stats).map(([statKey, statVal]) => `
              <div class="stat-item-row">
                <div class="stat-item-label">
                  <span>${translateStatKey(statKey)}</span>
                  <strong>${statVal}/10</strong>
                </div>
                <div class="stat-track-large">
                  <div class="stat-fill-large" style="width: ${Math.min(statVal * 10, 100)}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 3. العمالقة الموروثة والمهارات الخاصة -->
      ${(char.titan_powers && char.titan_powers.length > 0) || (char.special_skills && char.special_skills.length > 0) ? `
        <div class="dossier-section">
          <h3 class="dossier-section-title">⚡ القوى الخاصة والمهارات الفريدة</h3>
          
          ${char.titan_powers && char.titan_powers.length > 0 ? `
            <div style="background: rgba(147, 51, 234, 0.15); border: 1px solid rgba(147, 51, 234, 0.4); padding: 0.9rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
              <strong style="color: #d8b4fe;">العمالقة المستحوذ عليها:</strong>
              <ul style="margin-top: 0.35rem; padding-right: 1.2rem; color: #e9d5ff; font-size: 0.88rem;">
                ${char.titan_powers.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${char.special_skills && char.special_skills.length > 0 ? `
            <ul class="titan-abilities-list" style="background: var(--bg-card); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              ${char.special_skills.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      ` : ''}

      <!-- 4. الشخصية والتحليل النفسي (Personality) -->
      ${char.personality ? `
        <div class="dossier-section">
          <h3 class="dossier-section-title">🧠 السمات والتحليل النفسي (Personality)</h3>
          <div style="background: var(--bg-card); padding: 1.2rem; border-radius: var(--radius-md); font-size: 0.92rem; line-height: 1.7; color: #e5e7eb; border-right: 4px solid var(--accent-gold);">
            ${escapeHtml(char.personality)}
          </div>
        </div>
      ` : ''}

      <!-- 5. السيرة الذاتية المفصلة حسب الآركات (Biography) -->
      ${char.biography ? `
        <div class="dossier-section">
          <h3 class="dossier-section-title">📜 السيرة الذاتية والأحداث الزمنية</h3>
          <div class="biography-timeline">
            ${Object.entries(char.biography).map(([arcKey, arcText]) => `
              <div class="bio-arc-card">
                <div class="bio-arc-title">⚔ ${translateArcKey(arcKey)}</div>
                <div class="bio-arc-text">${escapeHtml(arcText)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 6. العلاقات (Relationships) -->
      ${char.relationships && char.relationships.length > 0 ? `
        <div class="dossier-section">
          <h3 class="dossier-section-title">👥 شبكة العلاقات الميدانية والشخصية</h3>
          <div class="relationships-grid">
            ${char.relationships.map(rel => `
              <div class="relation-card">
                <div class="relation-name">${escapeHtml(rel.name)}</div>
                <div class="relation-type">${escapeHtml(rel.relation)}</div>
                <div class="relation-notes">${escapeHtml(rel.notes)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 7. حقائق ومعلومات إضافية (Trivia) -->
      ${char.trivia && char.trivia.length > 0 ? `
        <div class="dossier-section">
          <h3 class="dossier-section-title">💡 حقائق وأسرار رسمية (Trivia)</h3>
          <ul class="trivia-list">
            ${char.trivia.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;

  if (elements.modalOverlay) {
    elements.modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

function setupModalEvents() {
  if (elements.modalCloseBtn) {
    elements.modalCloseBtn.addEventListener('click', closeModal);
  }

  if (elements.modalOverlay) {
    elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === elements.modalOverlay) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

function closeModal() {
  if (elements.modalOverlay) {
    elements.modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Helpers for translations and security
function translateStatKey(key) {
  const map = {
    combat: 'القتال والاشتباك',
    initiative: 'المبادرة والجرأة',
    intelligence: 'الذكاء والتخطيط',
    teamwork: 'العمل الجماعي',
    passion: 'الشغف والإصرار',
    speed: 'السرعة وخفة الحركة',
    cleanliness: 'الهوس بالنظافة',
    curiosity: 'الفضول العلمي',
    leadership: 'القيادة والتأثير',
    judgment: 'الحكم والتقدير',
    mental_durability: 'الثبات النفسي',
    royal_lineage: 'نقاء الدم الملكي',
    charisma: 'الكاريزما والإقناع',
    diplomacy: 'الدبلوماسية',
    fanaticism: 'التعصب الفكري',
    deception: 'الخداع والمراوغة',
    artillery_marksmanship: 'دقة تصويب المدفعية',
    honor: 'الشرف العسكري',
    survival_instinct: 'غريزة البقاء',
    mobility_gear_mastery: 'ترويض جهاز المناورة',
    empathy: 'التعاطف والإنسانية',
    craftsmanship: 'مهارة الحدادة والهندسة',
    invention: 'الابتكار والاختراع',
    loyalty: 'الوفاء والإخلاص',
    agility: 'الرشاقة',
    innocence: 'البراءة'
  };
  return map[key] || key;
}

function translateArcKey(key) {
  const map = {
    childhood: 'مرحلة الطفولة وما قبل السقوط',
    cadet_arc: 'تدريب الدفعة 104',
    cadet_and_trost: 'معركة استعادة تروست',
    trost_arc: 'أزمة مقاطعة تروست وصخرة الأمل',
    scouts_and_uprising: 'فيلق الاستطلاع وانقلاب الحكومة الملكية',
    scouts_and_clash: 'اشتباك فيلق الاستطلاع وخيانة الرفاق',
    shiganshina_reclamation: 'معركة استعادة شيغانشينا وقبو غريشا',
    marley_and_rumbling: 'غزو مارلي وانطلاق دك الأرض',
    war_for_paradis: 'حرب باراديس والانقسام الداخلي',
    the_rumbling_climax: 'معركة نهاية العالم وفضاء المسارات',
    origins: 'الأصول والنشأة الأولى',
    long_distance_formation: 'ابتكار تشكيلة الاستطلاع بعيد المدى',
    military_coup: 'الانقلاب العسكري وإسقاط النبلاء',
    the_suicide_charge: 'الشحنة الانتحارية الأسطورية ضد الوحش',
    underground_beginnings: 'نشأة المدينة السفلية',
    special_operations_squad: 'تأسيس فرقة النخبة لليفاي',
    shiganshina_beast_massacre: 'موقعة تقطيع العملاق الوحش',
    thunder_spear_blast: 'انفجار رمح الرعد والنهوض الأخير',
    early_research: 'أبحاث وتشريح العمالقة الأولى',
    invention_of_thunder_spears: 'تطوير رماح الرعد وكسر التصلب',
    becoming_commander: 'تولي قيادة فيلق الاستطلاع',
    final_sacrifice: 'التضحية النارية في ميناء أوديها',
    cadet_days: 'أيام معسكر التدريب',
    marco_loss: 'صدمة فقدان ماركو واختيار الاستطلاع',
    field_leader: 'قيادة الفرق الميدانية في ليبيريو',
    the_alliance: 'تشكيل تحالف إنقاذ العالم',
    trost_salvation: 'إنقاذ مجندي تروست وتبني خطة أرمين',
    uprising_ally: 'دعم الانقلاب العسكري بالمنطقة الجنوبية',
    wine_tragedy: 'مأساة النبيذ الملوث والمصير الأخير',
    warrior_candidate: 'معسكر تدريب المحاربين في مارلي',
    infiltrating_the_walls: 'مهمة اختراق الأسوار وسقوط ماريا',
    the_reveal: 'الاعتراف الصادم على جدار روز',
    redemption_and_alliance: 'التوبة وقيادة تحالف المسارات',
    chief_of_warriors: 'قيادة فرقة محاربي مارلي العسكرية',
    alliance_with_eren: 'التحالف مع إيرين ومؤامرة النبيذ',
    the_paths_and_redemption: 'فضاء المسارات والاعتراف الأخير',
    birth_in_vomit: 'المولد الملعون في قيء العملاق',
    escape_with_sharle: 'الهروب برفقة شارل وبداية الأمل',
    the_device_trials: 'اختبارات جهاز المناورة الأولى',
    slaying_the_first_titan: 'قتل أول عملاق في تاريخ البشرية بالعتاد',
    rescue_act: 'إنقاذ كوكلو من قفص عائلة إينوسينسيو',
    workshop_refuge: 'اللجوء للمدينة الصناعية وأبحاث السلاح',
    peaceful_end: 'تحقيق السلام والحرية',
    discovering_the_nape: 'اكتشاف نقطة ضعف العنق القاتلة',
    first_device_prototype: 'تصميم النموذج الأولي لجهاز المناورة',
    legacy: 'توريث التكنولوجيا للأجيال القادمة',
    underground_alliance: 'تحالف عصابة العالم السفلي مع ليفاي',
    the_lofv_deal: 'صفقة نيكولاس لوف واغتيال إيروين',
    tragic_expedition: 'الحملة 23 والمأساة في المطر',
    meeting_levi: 'اللقاء الأول مع ليفاي وفارلان',
    joining_scouts: 'الانضمام لفيلق الاستطلاع',
    death_in_the_rain: 'الموت المأساوي في الأمطار'
  };
  return map[key] || key;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
