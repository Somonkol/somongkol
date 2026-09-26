/* 
  Kim Somangkol Physics Portfolio
  Main Application Logic, UI Interactions, Theme Toggle, & Form Handler
*/

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initCounterAnimations();
  initGradeCabinet();
  initCabinetUpload();
  initResourceModal();
  initContactForm();
  initEnrolledStudentsTable();
});

// 1. Navbar Scroll Effect, Mobile Menu, & Dropdowns
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveNavLink();
  });

  // Mobile Menu Toggle & Interactions
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('mobile-open');
    });

    // Close mobile menu if clicked outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
        navLinks.classList.remove('mobile-open');
        document.querySelectorAll('.nav-item.dropdown-open').forEach(el => el.classList.remove('dropdown-open'));
      }
    });

    // Mobile Dropdown Accordion Toggle
    document.querySelectorAll('.nav-item.has-dropdown > .nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 991) {
          e.preventDefault(); // Don't navigate immediately on mobile, toggle submenu first
          const parentItem = link.closest('.nav-item');
          const isOpen = parentItem.classList.contains('dropdown-open');
          
          // Close other open mobile dropdowns
          document.querySelectorAll('.nav-item.dropdown-open').forEach(el => el.classList.remove('dropdown-open'));
          
          if (!isOpen) {
            parentItem.classList.add('dropdown-open');
          }
        }
      });
    });

    // Direct nav links without dropdowns
    document.querySelectorAll('.nav-item:not(.has-dropdown) > .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });

    // Dropdown Items Click (including nested submenu items)
    document.querySelectorAll('.dropdown-item, .dropdown-nested-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (item.getAttribute('target') === '_blank') {
          navLinks.classList.remove('mobile-open');
          document.querySelectorAll('.nav-item.dropdown-open').forEach(el => el.classList.remove('dropdown-open'));
          return;
        }

        navLinks.classList.remove('mobile-open');
        document.querySelectorAll('.nav-item.dropdown-open').forEach(el => el.classList.remove('dropdown-open'));

        // Handle Grade Tab Switching
        const switchGrade = item.dataset.switchGrade;
        if (switchGrade) {
          const targetTabBtn = document.querySelector(`.grade-tab-btn[data-grade="${switchGrade}"]`);
          if (targetTabBtn) {
            targetTabBtn.click();
          }
        }

        // Handle Folder Drawer Switching
        const switchFolder = item.dataset.switchFolder;
        if (switchFolder) {
          const activeCabinet = document.querySelector('.grade-cabinet.active') || document.querySelector('#grade-cabinet-12');
          if (activeCabinet) {
            const folderBtn = activeCabinet.querySelector(`.folder-tab-btn[data-target$="${switchFolder}"]`);
            if (folderBtn) folderBtn.click();
          }
        }
      });
    });
  }
}

function highlightActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;
  let currentActiveId = '';

  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 140;
    const sectionId = current.getAttribute('id');
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      currentActiveId = sectionId;
    }
  });

  if (!currentActiveId && scrollY < 200) {
    currentActiveId = 'hero';
  }

  // Clear existing active states
  document.querySelectorAll('.nav-link, .dropdown-item').forEach(el => el.classList.remove('active'));

  if (currentActiveId) {
    // 1. Highlight specific dropdown-item matching currentActiveId
    const targetItem = document.querySelector(`.dropdown-item[href="#${currentActiveId}"]`);
    if (targetItem) {
      targetItem.classList.add('active');
    }

    // 2. Map section IDs to parent dropdown links
    const parentMap = {
      'hero': '#hero',
      'about': '#about',
      'timeline': '#about',
      'testimonials': '#about',
      'curriculum': '#curriculum',
      'lab': '#lab',
      'calculator': '#lab',
      'resources': '#resources',
      'contact': '#contact'
    };

    const parentHref = parentMap[currentActiveId] || `#${currentActiveId}`;
    const mainNavLink = document.querySelector(`.nav-links > .nav-item > a[href="${parentHref}"]`);
    if (mainNavLink) {
      mainNavLink.classList.add('active');
    }
  }
}

// 2. Dark / Light Theme Switcher
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;

  const currentTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeBtn.addEventListener('click', () => {
    const theme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    showToast(theme === 'dark' ? 'បានប្តូរទៅ Dark Quantum Theme' : 'បានប្តូរទៅ Light Lab Theme');
  });
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;
  themeBtn.innerHTML = theme === 'light' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
}

// 3. Animated Number Counters
function initCounterAnimations() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.dataset.target);
          const suffix = stat.dataset.suffix || '';
          let count = 0;
          const speed = target / 50;

          const updateCount = () => {
            count += speed;
            if (count < target) {
              stat.innerText = Math.ceil(count) + suffix;
              setTimeout(updateCount, 30);
            } else {
              stat.innerText = target + suffix;
            }
          };
          updateCount();
        });
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) observer.observe(statsSection);
}

// 4. Download Resource Modal
function initResourceModal() {
  const modal = document.getElementById('resource-modal');
  const modalClose = document.getElementById('modal-close');
  const resourceCards = document.querySelectorAll('.resource-card');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalMeta = document.getElementById('modal-meta');
  const downloadBtn = document.getElementById('modal-download-btn');
  const viewBtn = document.getElementById('modal-view-btn');
  const editBtn = document.getElementById('modal-edit-btn');
  const togglePreviewBtn = document.getElementById('modal-toggle-preview');
  const previewBox = document.getElementById('modal-pdf-preview');
  const pdfFrame = document.getElementById('pdf-frame');

  resourceCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Ignore if clicked on the quick download button directly
      if (e.target.closest('.resource-quick-btn')) return;

      const title = card.dataset.title;
      const desc = card.dataset.desc;
      const file = card.dataset.file;
      const filename = card.dataset.filename || 'Physics_Summary_BacII.pdf';
      const meta = card.dataset.meta || 'PDF File';

      if (modalTitle) modalTitle.innerText = title;
      if (modalDesc) modalDesc.innerHTML = desc;
      if (modalMeta) modalMeta.innerText = meta;

      // Reset embedded preview
      if (previewBox) previewBox.style.display = 'none';
      if (pdfFrame) pdfFrame.src = '';
      if (togglePreviewBtn) {
        togglePreviewBtn.style.display = file ? 'inline-flex' : 'none';
        togglePreviewBtn.innerHTML = '<span>📖 មើលផ្ទាល់ក្នុងនេះ</span>';
      }

      if (file) {
        if (downloadBtn) {
          downloadBtn.href = file;
          downloadBtn.setAttribute('download', filename);
          downloadBtn.onclick = () => {
            showToast('កំពុងទាញយកឯកសារ ' + title + '...');
          };
        }
        if (viewBtn) {
          viewBtn.href = file;
          viewBtn.style.display = 'inline-flex';
        }
        if (editBtn) {
          if (file && file.includes('.html')) {
            editBtn.href = file + (file.includes('?') ? '&edit=1' : '?edit=1');
            editBtn.style.display = 'inline-flex';
          } else {
            editBtn.style.display = 'none';
          }
        }
        if (togglePreviewBtn) {
          togglePreviewBtn.onclick = () => {
            if (previewBox.style.display === 'none' || !previewBox.style.display) {
              previewBox.style.display = 'block';
              pdfFrame.src = file;
              togglePreviewBtn.innerHTML = '<span>✕ បិទផ្ទាំងមើល</span>';
            } else {
              previewBox.style.display = 'none';
              pdfFrame.src = '';
              togglePreviewBtn.innerHTML = '<span>📖 មើលផ្ទាល់ក្នុងនេះ</span>';
            }
          };
        }
      } else {
        if (downloadBtn) {
          downloadBtn.removeAttribute('download');
          downloadBtn.href = '#';
          downloadBtn.onclick = (ev) => {
            ev.preventDefault();
            showToast('ឯកសារនេះកំពុងរៀបចំបញ្ចូលឆាប់ៗ!');
          };
        }
        if (viewBtn) viewBtn.style.display = 'none';
      }

      // Re-render KaTeX if available
      if (window.renderMathInElement && modalDesc) {
        try {
          renderMathInElement(modalDesc, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '\\(', right: '\\)', display: false},
              {left: '$', right: '$', display: false}
            ]
          });
        } catch (err) {
          console.warn('Math rendering error:', err);
        }
      }

      modal.classList.add('active');
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
      if (pdfFrame) pdfFrame.src = '';
      if (previewBox) previewBox.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        if (pdfFrame) pdfFrame.src = '';
        if (previewBox) previewBox.style.display = 'none';
      }
    });
  }
}

// Schedule Slot Definitions (ចន្ទ-សុក្រ vs សៅរ៍-អាទិត្យ)
const SCHEDULE_OPTIONS = {
  'ចន្ទ - សុក្រ': [
    'ម៉ោង 1-2',
    'ម៉ោង 3-4',
    'ម៉ោង 4-5',
    'ម៉ោង 5-6',
    'ម៉ោង 6-7',
    'ម៉ោង 7-8'
  ],
  'សៅរ៍ - អាទិត្យ': [
    'ម៉ោង 1-3',
    'ម៉ោង 3-5'
  ]
};

// Helper: Convert Arabic numbers to Khmer digits
function toKhmerDigits(num) {
  const map = { '0': '០', '1': '១', '2': '២', '3': '៣', '4': '៤', '5': '៥', '6': '៦', '7': '៧', '8': '៨', '9': '៩' };
  return String(num).split('').map(d => map[d] || d).join('');
}

// Helper: Format readable date time
function formatRegistrationDate(d = new Date()) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

// Helper: Play celebratory chime via Web Audio API
function playEnrollmentChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 fanfare
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
    });
  } catch (e) {}
}

// Helper: Populate dynamic time select options based on selected day
function syncScheduleTimeDropdown(dayElem, timeElem) {
  if (!dayElem || !timeElem) return;
  const day = dayElem.value;
  const times = SCHEDULE_OPTIONS[day] || SCHEDULE_OPTIONS['ចន្ទ - សុក្រ'];
  timeElem.innerHTML = '';
  times.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    timeElem.appendChild(opt);
  });
}

// 5. Contact & Enrollment Form Handler
function initContactForm() {
  const form = document.getElementById('enrollment-form');
  const daySelect = document.getElementById('form-day');
  const timeSelect = document.getElementById('form-time');

  if (daySelect && timeSelect) {
    // Populate initial and on change
    syncScheduleTimeDropdown(daySelect, timeSelect);
    daySelect.addEventListener('change', () => {
      syncScheduleTimeDropdown(daySelect, timeSelect);
    });
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const course = document.getElementById('form-course').value;
    const day = daySelect ? daySelect.value : 'ចន្ទ - សុក្រ';
    const time = timeSelect ? timeSelect.value : 'ម៉ោង 5-6';

    if (!name || !phone) {
      showToast('សូមបំពេញឈ្មោះពេញ និងលេខទូរស័ព្ទឲ្យបានត្រឹមត្រូវ!');
      return;
    }

    const newStudent = {
      id: Date.now(),
      name: name,
      grade: course,
      day: day,
      time: time,
      schedule: `${day} (${time})`,
      phone: phone,
      date: formatRegistrationDate(new Date()),
      status: 'បានចុះឈ្មោះជាក់ស្តែង'
    };

    // 1. Add locally so user sees immediate feedback
    if (window.addActualStudent) {
      window.addActualStudent(newStudent);
    }

    // 2. Send data to Google Sheets via Webhook
    if (window.sendStudentToGoogleSheet) {
      window.sendStudentToGoogleSheet(newStudent);
    }

    // Play celebration audio chime
    playEnrollmentChime();

    // Show celebration alert modal to the user
    if (window.showNewStudentAlertModal) {
      window.showNewStudentAlertModal(newStudent);
    }

    showToast(`🎉 សូមអរគុណ ${name}! បានចុះឈ្មោះចូលរៀនវគ្គ ${course} (${day} ${time}) ដោយជោគជ័យ!`);
    form.reset();
    if (daySelect && timeSelect) {
      syncScheduleTimeDropdown(daySelect, timeSelect);
    }
  });
}

// ----------------------------------------------------------------------------
// 6. Enrolled Students Directory & Google Sheets Two-Way Sync System
// ----------------------------------------------------------------------------

// Google Apps Script source code template for 1-click copy
const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script for Kim Somangkol Physics Platform
 * -----------------------------------------------------
 * 1. doGet: Returns enrolled students from Google Sheet as JSON
 * 2. doPost: Appends new student registration to Google Sheet
 */
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: 0, data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var students = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var name = row[1];
      if (!name || String(name).trim() === '') continue;
      students.push({
        id: row[0] || i,
        name: String(row[1] || '').trim(),
        grade: String(row[2] || '').trim(),
        day: String(row[3] || '').trim(),
        time: String(row[4] || '').trim(),
        schedule: (row[3] && row[4]) ? (row[3] + ' (' + row[4] + ')') : String(row[4] || row[3] || ''),
        phone: String(row[5] || '').trim(),
        date: String(row[6] || '').trim(),
        status: String(row[7] || 'បានចុះឈ្មោះជាក់ស្តែង').trim()
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: students.length, data: students }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['ល.រ', 'ឈ្មោះសិស្ស', 'ថ្នាក់ទី', 'ថ្ងៃសិក្សា', 'ម៉ោងសិក្សា', 'លេខទូរស័ព្ទ / Telegram', 'កាលបរិច្ឆេទចុះឈ្មោះ', 'ស្ថានភាព']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#0F9D58').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
    var data = {};
    if (e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (ex) { data = e.parameter || {}; }
    } else {
      data = e.parameter || {};
    }
    var nextId = sheet.getLastRow();
    var name = data.name || '';
    var grade = data.grade || '';
    var day = data.day || '';
    var time = data.time || '';
    var phone = data.phone || '';
    var date = data.date || Utilities.formatDate(new Date(), 'Asia/Phnom_Penh', 'dd/MM/yyyy hh:mm a');
    var status = data.status || 'បានចុះឈ្មោះជាក់ស្តែង';

    if (name && String(name).trim() !== '') {
      sheet.appendRow([nextId, String(name).trim(), String(grade).trim(), String(day).trim(), String(time).trim(), String(phone).trim(), String(date).trim(), String(status).trim()]);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', id: nextId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

// Helper: Extract Google Spreadsheet ID from any Google Sheets URL
function extractGoogleSheetId(url) {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

function initEnrolledStudentsTable() {
  const tableBody = document.getElementById('students-table-body');
  if (!tableBody) return;

  const countBadge = document.getElementById('student-count-badge');
  const googleSheetBtn = document.getElementById('google-sheet-link-btn');
  const syncSheetsBtn = document.getElementById('btn-sync-sheets');
  const syncStatusPill = document.getElementById('sync-status-pill');
  const syncStatusText = document.getElementById('sync-status-text');
  const configSheetBtn = document.getElementById('btn-config-sheet');
  const copySheetsBtn = document.getElementById('btn-copy-sheets');
  const downloadCsvBtn = document.getElementById('btn-download-csv');
  const quickAddBtn = document.getElementById('btn-quick-add');
  const clearStudentsBtn = document.getElementById('btn-clear-students');
  const searchInput = document.getElementById('student-search-input');
  const filterBtns = document.querySelectorAll('.student-filter-btn');

  // ==========================================================================
  // Central Cloud Registry & Google Sheets Configuration
  // ធានាថាការចុះឈ្មោះពីទូរស័ព្ទ ឬកុំព្យូទ័រណាក៏ដោយ អាចមើលឃើញគ្រប់ Device ទាំងអស់ភ្លាមៗ
  // ==========================================================================
  const CLOUD_REGISTRY_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0dc728bfc19ef';
  const DEFAULT_WEBHOOK_URL = ''; // e.g. 'https://script.google.com/macros/s/.../exec'
  const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dB5oZnM8qgCBoblr7pVa9u6Y_WS-NzmpUI16sBTmcM4/edit';
  const defaultSheetUrl = DEFAULT_SHEET_URL;
  const defaultWebhookUrl = DEFAULT_WEBHOOK_URL;

  const savedSheetUrl = localStorage.getItem('ap_phy_google_sheet_url') || defaultSheetUrl;
  if (googleSheetBtn) {
    googleSheetBtn.href = savedSheetUrl || 'https://drive.google.com/drive/my-drive';
  }

  // Storage key for client cache
  const STORAGE_KEY = 'ap_phy_actual_students';

  // Automatically purge any dummy sample data ('Gender', 'Female', 'Male', old dummy test data, etc.)
  function purgeSampleData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let list = JSON.parse(stored);
        if (Array.isArray(list)) {
          list = list.filter(st => {
            const str = (String(st.name || '') + ' ' + String(st.grade || '') + ' ' + String(st.schedule || '') + ' ' + String(st.phone || '')).toLowerCase();
            const isSampleEnglish = str.includes('gender') ||
                   str.includes('female') ||
                   str.includes('male') ||
                   str.includes('senior') ||
                   str.includes('freshman') ||
                   str.includes('sophomore') ||
                   str.includes('junior') ||
                   str.includes('alexandra') ||
                   str.includes('andrew') ||
                   str.includes('extracurricular') ||
                   str.includes('drama club') ||
                   str.includes('lacrosse') ||
                   str.includes('student name');
            const isOldSampleDummy = (st.name === 'ជា សុខា' && st.phone === '012-962-818') ||
                   (st.name === 'ស៊ន វ៉ាន់នី' && st.phone === '015-962-818') ||
                   (st.name === 'គង់ ពិសិដ្ឋ' && st.phone === '097-123-456');
            return !isSampleEnglish && !isOldSampleDummy;
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
      }
      const savedUrl = localStorage.getItem('ap_phy_google_sheet_url');
      if (savedUrl && savedUrl.includes('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms')) {
        localStorage.removeItem('ap_phy_google_sheet_url');
      }
    } catch (e) {}
  }
  purgeSampleData();

  let students = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      students = JSON.parse(stored);
    }
  } catch (err) {
    students = [];
  }

  let activeFilter = 'all';
  let activeSearch = '';
  let recentlyAddedId = null;

  // Render Table
  function renderTable() {
    tableBody.innerHTML = '';

    const filtered = students.filter(st => {
      let matchFilter = true;
      if (activeFilter === '12') matchFilter = st.grade && st.grade.includes('១២');
      else if (activeFilter === '11') matchFilter = st.grade && st.grade.includes('១១');
      else if (activeFilter === '10') matchFilter = st.grade && st.grade.includes('១០');
      else if (activeFilter === 'ចន្ទ - សុក្រ') matchFilter = (st.day === 'ចន្ទ - សុក្រ' || (st.schedule && st.schedule.includes('ចន្ទ')));
      else if (activeFilter === 'សៅរ៍ - អាទិត្យ') matchFilter = (st.day === 'សៅរ៍ - អាទិត្យ' || (st.schedule && st.schedule.includes('សៅរ៍')));

      let matchSearch = true;
      if (activeSearch) {
        const q = activeSearch.toLowerCase();
        matchSearch = (st.name && st.name.toLowerCase().includes(q)) || 
                      (st.grade && st.grade.toLowerCase().includes(q)) || 
                      (st.schedule && st.schedule.toLowerCase().includes(q)) ||
                      (st.phone && st.phone.toLowerCase().includes(q));
      }

      return matchFilter && matchSearch;
    });

    if (countBadge) {
      const khmerCount = toKhmerDigits(students.length);
      countBadge.innerText = `${khmerCount} នាក់`;
    }

    if (students.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="students-empty-state">
            <div style="font-size: 2.8rem; margin-bottom: 10px;">📋</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
              មិនទាន់មានសិស្សចុះឈ្មោះជាក់ស្តែងនៅឡើយទេ
            </div>
            <div style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 18px; max-width: 480px; margin-left: auto; margin-right: auto;">
              សូមបំពេញទម្រង់ចុះឈ្មោះខាងក្រោមដើម្បីចុះឈ្មោះចូលរៀន។ ទិន្នន័យជាក់ស្តែងនឹងបង្ហាញនៅទីនេះភ្លាមៗ!
            </div>
            <div>
              <a href="#contact" class="btn-primary" style="padding: 8px 22px; font-size: 0.88rem;">
                <span>✍️ ចុះឈ្មោះសិស្សថ្មី</span>
              </a>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 36px; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
            <div>មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកនេះទេ!</div>
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach((st, idx) => {
      const tr = document.createElement('tr');
      if (st.id === recentlyAddedId) {
        tr.classList.add('highlight-new-row');
      }

      let gradeClass = 'g12';
      if (st.grade && st.grade.includes('១១')) gradeClass = 'g11';
      else if (st.grade && st.grade.includes('១០')) gradeClass = 'g10';

      const khmerIdx = toKhmerDigits(idx + 1);
      const studentDay = st.day || ((st.schedule && st.schedule.includes('សៅរ៍')) ? 'សៅរ៍ - អាទិត្យ' : 'ចន្ទ - សុក្រ');
      const studentTime = st.time || (st.schedule ? st.schedule.replace(/^[^(]+\(([^)]+)\).*$/, '$1') : 'ម៉ោង 1-2');

      tr.innerHTML = `
        <td style="text-align: center;">
          <span class="student-no-badge">${khmerIdx}</span>
        </td>
        <td>
          <div class="student-name-cell">
            <span class="student-avatar">${st.name ? st.name.charAt(0) : 'ស'}</span>
            <span style="font-weight: 600;">${st.name}</span>
          </div>
        </td>
        <td>
          <span class="grade-tag ${gradeClass}">${st.grade}</span>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-size: 0.88rem; font-weight: 600; color: var(--text-main);">
              📅 ${studentDay}
            </span>
            <span class="schedule-pill" style="font-size: 0.82rem; color: var(--cyan-glow);">
              <span class="schedule-icon">⏰</span>
              <span>${studentTime}</span>
            </span>
          </div>
        </td>
        <td>
          <a href="tel:${st.phone}" style="color: var(--cyan-glow); text-decoration: none; font-family: var(--font-number); font-weight: 600;">
            ${st.phone || '-'}
          </a>
        </td>
        <td style="text-align: center; font-size: 0.82rem; color: var(--text-muted);">
          ${st.date || '-'}
        </td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 6px; justify-content: center;">
            <button class="student-action-btn" title="ចម្លងសិស្សនេះសម្រាប់ Google Sheets" onclick="window.copySingleStudent(${st.id})">
              📋
            </button>
            <button class="student-action-btn btn-del" title="លុបទិន្នន័យសិស្សនេះ" onclick="window.deleteSingleStudent(${st.id})">
              🗑️
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // --------------------------------------------------------------------------
  // Core Data Synchronization Logic (Cloud Registry + Google Sheets Two-Way Sync)
  // ធានាថាគ្រប់ Device ទាំងអស់អាចមើលឃើញទិន្នន័យដូចគ្នាភ្លាមៗ (Cross-Device Live Sync)
  // --------------------------------------------------------------------------
  async function fetchStudentsFromGoogleSheets(silent = false) {
    const currentSheetUrl = localStorage.getItem('ap_phy_google_sheet_url') || defaultSheetUrl;
    const webhookUrl = localStorage.getItem('ap_phy_sheet_webhook_url') || defaultWebhookUrl;

    if (syncSheetsBtn) syncSheetsBtn.classList.add('syncing');
    if (syncStatusPill) {
      syncStatusPill.className = 'sync-status-pill syncing';
      if (syncStatusText) syncStatusText.innerText = 'កំពុងធ្វើបច្ចុប្បន្នភាពទិន្នន័យ...';
    }

    let cloudStudents = null;
    let sheetStudents = null;

    // 1. Fetch from Central Cloud Registry (Real-time Cross-Device Sync)
    try {
      const cRes = await fetch(`${CLOUD_REGISTRY_URL}?_=${Date.now()}`);
      if (cRes.ok) {
        const cJson = await cRes.json();
        if (cJson && cJson.data && Array.isArray(cJson.data.students)) {
          cloudStudents = cJson.data.students;
        }
      }
    } catch (cErr) {
      console.warn('Notice from Cloud Registry:', cErr);
    }

    // 2. Fetch from Google Apps Script Webhook (if configured)
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        const resp = await fetch(webhookUrl, { method: 'GET' });
        if (resp.ok) {
          const json = await resp.json();
          if (json && json.status === 'success' && Array.isArray(json.data)) {
            sheetStudents = json.data;
          }
        }
      } catch (err) {
        console.warn('Webhook GET fetch notice:', err);
      }
    }

    // 3. Fetch from Google Visualization API (GViz) (if custom Sheet URL is configured)
    if (!sheetStudents && currentSheetUrl && !currentSheetUrl.includes('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms')) {
      const sheetId = extractGoogleSheetId(currentSheetUrl);
      if (sheetId) {
        try {
          const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
          const resp = await fetch(gvizUrl);
          if (resp.ok) {
            const text = await resp.text();
            const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const gvizData = JSON.parse(jsonStr);

            if (gvizData && gvizData.table && Array.isArray(gvizData.table.rows)) {
              const rows = gvizData.table.rows;
              const parsed = [];

              let startIdx = 0;
              if (rows.length > 0 && rows[0].c) {
                const c0 = String(rows[0].c[0]?.v || '').toLowerCase();
                const c1 = String(rows[0].c[1]?.v || '').toLowerCase();
                if (c0 === 'ល.រ' || c0 === 'id' || c0 === 'no' || c0 === '#' || c1.includes('ឈ្មោះ') || c1.includes('name')) {
                  startIdx = 1;
                }
              }

              for (let i = startIdx; i < rows.length; i++) {
                const r = rows[i];
                if (!r || !r.c) continue;
                const cells = r.c.map(c => (c && c.v !== null && c.v !== undefined) ? c.v : '');

                let id = cells[0];
                let name = cells[1];
                let grade = cells[2];
                let day = cells[3];
                let time = cells[4];
                let phone = cells[5];
                let date = cells[6];
                let status = cells[7] || 'បានចុះឈ្មោះជាក់ស្តែង';

                if (!name || String(name).trim() === '') {
                  if (cells[0] && isNaN(cells[0])) {
                    name = cells[0];
                    id = i + 1;
                  } else {
                    continue;
                  }
                }

                const nLower = String(name).toLowerCase();
                if (nLower === 'student name' || nLower === 'gender' || nLower === 'female' || nLower === 'male') {
                  continue;
                }

                parsed.push({
                  id: id || (i + 1),
                  name: String(name).trim(),
                  grade: String(grade || 'ថ្នាក់ទី ១២').trim(),
                  day: String(day || 'ចន្ទ - សុក្រ').trim(),
                  time: String(time || 'ម៉ោង 1-2').trim(),
                  schedule: (day && time) ? (day + ' (' + time + ')') : String(time || day || ''),
                  phone: String(phone || '').trim(),
                  date: String(date || '').trim(),
                  status: String(status).trim()
                });
              }

              sheetStudents = parsed;
            }
          }
        } catch (err) {
          console.warn('GViz fetch notice:', err);
        }
      }
    }

    if (syncSheetsBtn) syncSheetsBtn.classList.remove('syncing');

    // Combine all sources: Cloud Registry + Google Sheets + Local Storage
    let combined = [];
    const seenKeys = new Set();

    function addUnique(list) {
      if (!Array.isArray(list)) return;
      list.forEach(item => {
        if (!item || !item.name) return;
        const phoneKey = String(item.phone || '').trim().replace(/[-\s]/g, '');
        const nameKey = String(item.name || '').trim().toLowerCase();
        const dedupeKey = phoneKey ? phoneKey : (nameKey + '_' + String(item.schedule || item.time || ''));
        if (!seenKeys.has(dedupeKey)) {
          seenKeys.add(dedupeKey);
          combined.push(item);
        }
      });
    }

    // Add Cloud Students (highest cross-device priority)
    addUnique(cloudStudents);
    // Add Google Sheets Students
    addUnique(sheetStudents);
    // Add Local Pending Students
    addUnique(students);

    if (combined.length > 0) {
      students = combined;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      } catch (e) {}

      // If local had students not yet in cloud, push to cloud in background
      if (cloudStudents && cloudStudents.length < combined.length) {
        updateFullCloudList(combined);
      }

      renderTable();

      if (syncStatusPill) {
        syncStatusPill.className = 'sync-status-pill';
        const khmerTotal = toKhmerDigits(students.length);
        if (syncStatusText) {
          syncStatusText.innerText = (currentSheetUrl || webhookUrl)
            ? `🟢 ភ្ជាប់ Sheets & Cloud (${khmerTotal} នាក់)`
            : `🟢 Sync គ្រប់ Device ផ្ទាល់ (${khmerTotal} នាក់)`;
        }
      }

      if (!silent) {
        showToast(`✅ បានធ្វើបច្ចុប្បន្នភាពបញ្ជីសិស្ស ${toKhmerDigits(students.length)} នាក់គ្រប់ Device ទាំងអស់ដោយជោគជ័យ!`);
      }
    } else {
      renderTable();
      if (syncStatusPill) {
        syncStatusPill.className = 'sync-status-pill';
        if (syncStatusText) {
          syncStatusText.innerText = `⚪ មិនទាន់មានសិស្សចុះឈ្មោះ`;
        }
      }
      if (!silent && (currentSheetUrl || webhookUrl)) {
        showToast('💡 បានបង្ហាញទិន្នន័យចុងក្រោយដែលបានរក្សាទុកក្នុងម៉ាស៊ីន');
      }
    }
  }

  // Bind Sync Button
  if (syncSheetsBtn) {
    syncSheetsBtn.addEventListener('click', () => {
      fetchStudentsFromGoogleSheets(false);
    });
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      renderTable();
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearch = e.target.value.trim();
      renderTable();
    });
  }

  // 1-Click Copy for Google Sheets (Formatted in TSV for instant Ctrl+V)
  function copyAllForGoogleSheets() {
    if (!students || students.length === 0) {
      showToast('មិនទាន់មានទិន្នន័យសិស្សជាក់ស្តែងសម្រាប់ចម្លងទេ!');
      return;
    }
    const header = ['ល.រ', 'ឈ្មោះសិស្ស', 'ថ្នាក់ទី', 'ថ្ងៃសិក្សា', 'ម៉ោងសិក្សា', 'លេខទូរស័ព្ទ', 'កាលបរិច្ឆេទ'].join('\t');
    const rows = students.map((st, i) => {
      const sDay = st.day || ((st.schedule && st.schedule.includes('សៅរ៍')) ? 'សៅរ៍ - អាទិត្យ' : 'ចន្ទ - សុក្រ');
      const sTime = st.time || (st.schedule ? st.schedule.replace(/^[^(]+\(([^)]+)\).*$/, '$1') : 'ម៉ោង 1-2');
      return [
        i + 1,
        st.name || '',
        st.grade || '',
        sDay,
        sTime,
        st.phone || '',
        st.date || ''
      ].join('\t');
    });

    const tsv = [header, ...rows].join('\n');
    navigator.clipboard.writeText(tsv).then(() => {
      const khmerTotal = toKhmerDigits(students.length);
      showToast(`📋 បានចម្លងបញ្ជីសិស្សជាក់ស្តែង ${khmerTotal} នាក់រួចរាល់! លោកគ្រូអាចបើក Google Sheets រួចចុច Ctrl+V ដើម្បីបិទភ្ជាប់បានភ្លាមៗ។`);
    }).catch(() => {
      fallbackCopy(tsv);
    });
  }

  if (copySheetsBtn) {
    copySheetsBtn.addEventListener('click', copyAllForGoogleSheets);
  }

  // Fallback copy helper
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('📋 បានចម្លងទិន្នន័យសម្រាប់ Google Sheets រួចរាល់ (Ctrl+V ដើម្បីបិទភ្ជាប់)!');
  }

  // Download CSV (UTF-8 BOM preserves Khmer fonts in Excel & Sheets)
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener('click', () => {
      if (!students || students.length === 0) {
        showToast('មិនទាន់មានទិន្នន័យសិស្សជាក់ស្តែងសម្រាប់ទាញយកទេ!');
        return;
      }
      const header = ['"ល.រ"', '"ឈ្មោះសិស្ស"', '"ថ្នាក់ទី"', '"ថ្ងៃសិក្សា"', '"ម៉ោងសិក្សា"', '"លេខទូរស័ព្ទ"', '"កាលបរិច្ឆេទ"'].join(',');
      const rows = students.map((st, i) => {
        const sDay = st.day || ((st.schedule && st.schedule.includes('សៅរ៍')) ? 'សៅរ៍ - អាទិត្យ' : 'ចន្ទ - សុក្រ');
        const sTime = st.time || st.schedule;
        return [
          `"${i + 1}"`,
          `"${(st.name || '').replace(/"/g, '""')}"`,
          `"${(st.grade || '').replace(/"/g, '""')}"`,
          `"${sDay.replace(/"/g, '""')}"`,
          `"${sTime.replace(/"/g, '""')}"`,
          `"${(st.phone || '').replace(/"/g, '""')}"`,
          `"${(st.date || '').replace(/"/g, '""')}"`
        ].join(',');
      });

      const csvContent = '\uFEFF' + [header, ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `បញ្ជីឈ្មោះសិស្សជាក់ស្តែង_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📥 បានទាញយកឯកសារ CSV បញ្ជីឈ្មោះសិស្សជាក់ស្តែងដោយជោគជ័យ!');
    });
  }

  // --------------------------------------------------------------------------
  // Cloud Registry Real-time Synchronization Functions
  // --------------------------------------------------------------------------
  async function syncStudentToCloud(newStudent) {
    try {
      let cloudList = [];
      try {
        const res = await fetch(`${CLOUD_REGISTRY_URL}?_=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.data && Array.isArray(json.data.students)) {
            cloudList = json.data.students;
          }
        }
      } catch (e) {}

      const newPhone = String(newStudent.phone || '').trim().replace(/[-\s]/g, '');
      const newName = String(newStudent.name || '').trim().toLowerCase();

      const exists = cloudList.some(s => {
        const sPhone = String(s.phone || '').trim().replace(/[-\s]/g, '');
        const sName = String(s.name || '').trim().toLowerCase();
        if (newPhone && sPhone && newPhone === sPhone) return true;
        if (newName === sName && s.time === newStudent.time) return true;
        return s.id === newStudent.id;
      });

      if (!exists) {
        cloudList.unshift(newStudent);
      }

      await fetch(CLOUD_REGISTRY_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Somongkol Physics Students Registry',
          data: {
            lastUpdated: new Date().toISOString(),
            students: cloudList
          }
        })
      });
    } catch (err) {
      console.warn('Sync to Cloud notice:', err);
    }
  }

  async function updateFullCloudList(list) {
    try {
      await fetch(CLOUD_REGISTRY_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Somongkol Physics Students Registry',
          data: {
            lastUpdated: new Date().toISOString(),
            students: list
          }
        })
      });
    } catch (err) {
      console.warn('Update cloud list notice:', err);
    }
  }

  async function deleteStudentFromCloud(studentId) {
    try {
      const res = await fetch(`${CLOUD_REGISTRY_URL}?_=${Date.now()}`);
      if (!res.ok) return;
      const json = await res.json();
      if (!json.data || !Array.isArray(json.data.students)) return;
      const updated = json.data.students.filter(s => s.id !== studentId);
      await fetch(CLOUD_REGISTRY_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Somongkol Physics Students Registry',
          data: {
            lastUpdated: new Date().toISOString(),
            students: updated
          }
        })
      });
    } catch (e) {}
  }

  async function clearCloudRegistry() {
    try {
      await fetch(CLOUD_REGISTRY_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Somongkol Physics Students Registry',
          data: {
            lastUpdated: new Date().toISOString(),
            students: []
          }
        })
      });
    } catch (e) {}
  }

  // Clear all students button
  if (clearStudentsBtn) {
    clearStudentsBtn.addEventListener('click', () => {
      if (students.length === 0) {
        showToast('បញ្ជីឈ្មោះសិស្សទទេស្រាប់ហើយ!');
        return;
      }
      if (confirm('តើលោកគ្រូពិតជាចង់សម្អាតបញ្ជីឈ្មោះសិស្សទាំងអស់មែនទេ? (សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ)')) {
        students = [];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        } catch (e) {}
        renderTable();
        clearCloudRegistry();
        showToast('🗑️ បានសម្អាតបញ្ជីឈ្មោះសិស្សរួចរាល់!');
      }
    });
  }

  // Global helper: Copy single student row
  window.copySingleStudent = function(studentId) {
    const st = students.find(s => s.id === studentId);
    if (!st) return;
    const sDay = st.day || ((st.schedule && st.schedule.includes('សៅរ៍')) ? 'សៅរ៍ - អាទិត្យ' : 'ចន្ទ - សុក្រ');
    const sTime = st.time || st.schedule;
    const rowTsv = [st.name, st.grade, sDay, sTime, st.phone, st.date].join('\t');
    navigator.clipboard.writeText(rowTsv).then(() => {
      showToast(`📋 បានចម្លងព័ត៌មានសិស្ស "${st.name}" សម្រាប់បិទភ្ជាប់ក្នុង Sheets (Ctrl+V)!`);
    }).catch(() => {
      fallbackCopy(rowTsv);
    });
  };

  // Global helper: Delete single student
  window.deleteSingleStudent = function(studentId) {
    const st = students.find(s => s.id === studentId);
    if (!st) return;
    if (confirm(`តើលោកគ្រូចង់លុបសិស្ស "${st.name}" ចេញពីបញ្ជីជាក់ស្តែងមែនទេ?`)) {
      students = students.filter(s => s.id !== studentId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      } catch (e) {}
      renderTable();
      deleteStudentFromCloud(studentId);
      showToast(`🗑️ បានលុបសិស្ស "${st.name}" រួចរាល់!`);
    }
  };

  // Global helper: Add enrolled student locally & sync to cloud
  window.addActualStudent = function(newStudent) {
    students.unshift(newStudent);
    recentlyAddedId = newStudent.id;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {}
    renderTable();

    // Broadcast to Central Cloud Registry so all other devices see it in real time!
    syncStudentToCloud(newStudent);
  };

  // Global helper: Send student to Google Sheets via Webhook (POST)
  window.sendStudentToGoogleSheet = function(newStudent) {
    const webhookUrl = localStorage.getItem('ap_phy_sheet_webhook_url') || defaultWebhookUrl;
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      console.warn('Google Apps Script Webhook URL is not configured yet. Student is saved locally.');
      return;
    }

    try {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(newStudent)
      }).then(() => {
        console.log('Student successfully sent to Google Sheets via Webhook');
        // Re-fetch from Google Sheets after 2 seconds to synchronize
        setTimeout(() => {
          fetchStudentsFromGoogleSheets(true);
        }, 2000);
      }).catch(err => {
        console.error('Error sending student to Google Sheets:', err);
      });
    } catch (e) {
      console.error('Webhook dispatch exception:', e);
    }
  };

  // --------------------------------------------------------------------------
  // New Student Enrollment Alert Modal Setup
  // --------------------------------------------------------------------------
  const alertModal = document.getElementById('new-student-modal');
  const alertCloseBtn = document.getElementById('new-student-close');
  const alertCard = document.getElementById('student-alert-card');
  const alertOpenSheetsBtn = document.getElementById('modal-open-sheets-btn');
  const alertCopyBtn = document.getElementById('modal-copy-student-btn');
  const alertViewTableBtn = document.getElementById('modal-view-table-btn');

  let currentAlertStudent = null;

  window.showNewStudentAlertModal = function(student) {
    if (!alertModal || !alertCard) return;
    currentAlertStudent = student;

    const currentSheetUrl = localStorage.getItem('ap_phy_google_sheet_url') || defaultSheetUrl;
    const webhookUrl = localStorage.getItem('ap_phy_sheet_webhook_url') || defaultWebhookUrl;
    if (alertOpenSheetsBtn) alertOpenSheetsBtn.href = currentSheetUrl || 'https://drive.google.com/drive/my-drive';

    const khmerCount = toKhmerDigits(students.length);
    const hasGoogleLink = (currentSheetUrl && !currentSheetUrl.includes('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms')) || (webhookUrl && webhookUrl.startsWith('http'));

    alertCard.innerHTML = `
      <div style="margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <span style="font-size:0.85rem; color:var(--cyan-glow); font-weight:700;">
          🔢 លេខរៀងសិស្សជាក់ស្តែងក្នុងបញ្ជី៖ ${khmerCount}
        </span>
        ${hasGoogleLink 
          ? '<span class="status-badge new">● បានភ្ជាប់ Google Sheets</span>' 
          : '<span class="status-badge" style="background:rgba(234,179,8,0.15); color:#facc15; border-color:rgba(234,179,8,0.3);">● កត់ត្រាក្នុងម៉ាស៊ីន</span>'}
      </div>
      <div class="student-detail-grid">
        <div class="student-detail-item">
          <div class="student-detail-label">👤 ឈ្មោះពេញសិស្ស</div>
          <div class="student-detail-value" style="color:var(--cyan-glow); font-size:1.05rem;">${student.name}</div>
        </div>
        <div class="student-detail-item">
          <div class="student-detail-label">📚 ថ្នាក់សិក្សា</div>
          <div class="student-detail-value">${student.grade}</div>
        </div>
        <div class="student-detail-item">
          <div class="student-detail-label">📅 ថ្ងៃសិក្សា</div>
          <div class="student-detail-value" style="color:#38bdf8;">${student.day}</div>
        </div>
        <div class="student-detail-item">
          <div class="student-detail-label">⏰ ម៉ោងសិក្សា</div>
          <div class="student-detail-value" style="color:#fbbf24;">${student.time}</div>
        </div>
        <div class="student-detail-item">
          <div class="student-detail-label">📱 លេខទូរស័ព្ទ / Telegram</div>
          <div class="student-detail-value">${student.phone}</div>
        </div>
        <div class="student-detail-item">
          <div class="student-detail-label">🕒 កាលបរិច្ឆេទចុះឈ្មោះ</div>
          <div class="student-detail-value" style="font-size:0.84rem; color:var(--text-muted);">${student.date}</div>
        </div>
      </div>
      ${!hasGoogleLink ? `
      <div style="margin-top:14px; padding:10px 14px; background:rgba(234,179,8,0.08); border:1px solid rgba(234,179,8,0.25); border-radius:8px; font-size:0.82rem; color:#fde047; line-height:1.6;">
        💡 <strong>ដើម្បីឱ្យទិន្នន័យនេះរត់ចូល Google Sheet ក្នុង Drive និងឃើញលើគ្រប់ Device ទាំងអស់៖</strong><br>
        សូមភ្ជាប់តំណភ្ជាប់ Google Sheets ក្នុង Google Drive របស់អ្នកត្រង់ប៊ូតុង <strong>"⚙️ កំណត់តំណ Sheets"</strong> ឬផ្ញើតំណភ្ជាប់ Google Sheet មកខ្ញុំ!
      </div>
      ` : ''}
    `;

    alertModal.classList.add('active');
  };

  if (alertCloseBtn) {
    alertCloseBtn.addEventListener('click', () => {
      alertModal.classList.remove('active');
    });
  }

  if (alertCopyBtn) {
    alertCopyBtn.addEventListener('click', () => {
      if (!currentAlertStudent) return;
      const rowTsv = [
        students.length,
        currentAlertStudent.name,
        currentAlertStudent.grade,
        currentAlertStudent.day,
        currentAlertStudent.time,
        currentAlertStudent.phone,
        currentAlertStudent.date
      ].join('\t');
      navigator.clipboard.writeText(rowTsv).then(() => {
        showToast('📋 បានចម្លងព័ត៌មានសិស្សនេះសម្រាប់បិទភ្ជាប់ក្នុង Google Sheets (Ctrl+V) រួចរាល់!');
      }).catch(() => fallbackCopy(rowTsv));
    });
  }

  if (alertViewTableBtn) {
    alertViewTableBtn.addEventListener('click', () => {
      alertModal.classList.remove('active');
      const tableSec = document.getElementById('students');
      if (tableSec) {
        tableSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (alertModal) {
    alertModal.addEventListener('click', (e) => {
      if (e.target === alertModal) alertModal.classList.remove('active');
    });
  }

  // --------------------------------------------------------------------------
  // Quick Add Student Modal Setup (➕ បន្ថែមសិស្សផ្ទាល់)
  // --------------------------------------------------------------------------
  const quickAddModal = document.getElementById('quick-add-student-modal');
  const quickAddClose = document.getElementById('quick-add-close');
  const quickAddForm = document.getElementById('quick-add-form');
  const quickDaySelect = document.getElementById('quick-day');
  const quickTimeSelect = document.getElementById('quick-time');

  if (quickDaySelect && quickTimeSelect) {
    syncScheduleTimeDropdown(quickDaySelect, quickTimeSelect);
    quickDaySelect.addEventListener('change', () => {
      syncScheduleTimeDropdown(quickDaySelect, quickTimeSelect);
    });
  }

  if (quickAddBtn && quickAddModal) {
    quickAddBtn.addEventListener('click', () => {
      quickAddModal.classList.add('active');
    });
  }

  if (quickAddClose && quickAddModal) {
    quickAddClose.addEventListener('click', () => {
      quickAddModal.classList.remove('active');
    });
  }

  if (quickAddForm) {
    quickAddForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('quick-name').value.trim();
      const phone = document.getElementById('quick-phone').value.trim();
      const grade = document.getElementById('quick-grade').value;
      const day = quickDaySelect ? quickDaySelect.value : 'ចន្ទ - សុក្រ';
      const time = quickTimeSelect ? quickTimeSelect.value : 'ម៉ោង 5-6';

      if (!name || !phone) {
        showToast('សូមបំពេញឈ្មោះ និងលេខទូរស័ព្ទ!');
        return;
      }

      const newRec = {
        id: Date.now(),
        name: name,
        grade: grade,
        day: day,
        time: time,
        schedule: `${day} (${time})`,
        phone: phone,
        date: formatRegistrationDate(new Date()),
        status: 'បានចុះឈ្មោះជាក់ស្តែង'
      };

      window.addActualStudent(newRec);
      if (window.sendStudentToGoogleSheet) {
        window.sendStudentToGoogleSheet(newRec);
      }

      playEnrollmentChime();
      quickAddForm.reset();
      if (quickDaySelect && quickTimeSelect) {
        syncScheduleTimeDropdown(quickDaySelect, quickTimeSelect);
      }
      quickAddModal.classList.remove('active');
      showToast(`✅ បានបន្ថែមសិស្ស "${name}" ចូលក្នុងបញ្ជីជាក់ស្តែងដោយជោគជ័យ!`);
      window.showNewStudentAlertModal(newRec);
    });
  }

  if (quickAddModal) {
    quickAddModal.addEventListener('click', (e) => {
      if (e.target === quickAddModal) quickAddModal.classList.remove('active');
    });
  }

  // --------------------------------------------------------------------------
  // Google Sheets Integration Configuration Modal
  // --------------------------------------------------------------------------
  const sheetModal = document.getElementById('sheet-config-modal');
  const sheetClose = document.getElementById('sheet-config-close');
  const copyAppsScriptBtn = document.getElementById('btn-copy-apps-script');
  const cfgSheetUrlInput = document.getElementById('cfg-sheet-url');
  const cfgWebhookInput = document.getElementById('cfg-webhook-url');
  const cfgSaveBtn = document.getElementById('cfg-sheet-save');
  const cfgResetBtn = document.getElementById('cfg-sheet-reset');

  // Copy Google Apps Script code button
  if (copyAppsScriptBtn) {
    copyAppsScriptBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE).then(() => {
        showToast('📋 បានចម្លងកូដ Google Apps Script រួចរាល់! សូមចូលទៅ Extensions -> Apps Script រួចបិទភ្ជាប់ (Ctrl+V)។');
      }).catch(() => {
        fallbackCopy(GOOGLE_APPS_SCRIPT_CODE);
      });
    });
  }

  if (configSheetBtn && sheetModal) {
    configSheetBtn.addEventListener('click', () => {
      if (cfgSheetUrlInput) {
        cfgSheetUrlInput.value = localStorage.getItem('ap_phy_google_sheet_url') || defaultSheetUrl;
      }
      if (cfgWebhookInput) {
        cfgWebhookInput.value = localStorage.getItem('ap_phy_sheet_webhook_url') || defaultWebhookUrl;
      }
      sheetModal.classList.add('active');
    });
  }

  if (sheetClose && sheetModal) {
    sheetClose.addEventListener('click', () => {
      sheetModal.classList.remove('active');
    });
  }

  if (cfgSaveBtn) {
    cfgSaveBtn.addEventListener('click', () => {
      const url = cfgSheetUrlInput ? cfgSheetUrlInput.value.trim() : '';
      const webhook = cfgWebhookInput ? cfgWebhookInput.value.trim() : '';

      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        localStorage.setItem('ap_phy_google_sheet_url', url);
        if (googleSheetBtn) googleSheetBtn.href = url;
      } else {
        localStorage.removeItem('ap_phy_google_sheet_url');
        if (googleSheetBtn) googleSheetBtn.href = defaultSheetUrl || 'https://drive.google.com/drive/my-drive';
      }

      if (webhook && (webhook.startsWith('http://') || webhook.startsWith('https://'))) {
        localStorage.setItem('ap_phy_sheet_webhook_url', webhook);
      } else {
        localStorage.removeItem('ap_phy_sheet_webhook_url');
      }

      sheetModal.classList.remove('active');
      showToast('💾 បានរក្សាទុកការកំណត់ Google Sheets និង Webhook ដោយជោគជ័យ!');

      // Automatically pull from the newly configured sheet
      fetchStudentsFromGoogleSheets(false);
    });
  }

  if (cfgResetBtn) {
    cfgResetBtn.addEventListener('click', () => {
      if (cfgSheetUrlInput) cfgSheetUrlInput.value = defaultSheetUrl;
      if (cfgWebhookInput) cfgWebhookInput.value = defaultWebhookUrl;
      localStorage.removeItem('ap_phy_google_sheet_url');
      localStorage.removeItem('ap_phy_sheet_webhook_url');
      if (googleSheetBtn) googleSheetBtn.href = defaultSheetUrl || 'https://drive.google.com/drive/my-drive';
      showToast('🔄 បានកំណត់តំណភ្ជាប់ Google Sheets មកលំនាំដើមវិញ!');
      fetchStudentsFromGoogleSheets(false);
    });
  }

  if (sheetModal) {
    sheetModal.addEventListener('click', (e) => {
      if (e.target === sheetModal) sheetModal.classList.remove('active');
    });
  }

  // Initial table render from cache
  renderTable();

  // Automatically pull live data from Cloud & Google Sheets on page load
  fetchStudentsFromGoogleSheets(true);

  // Auto-sync across devices on window focus / tab visibility change
  window.addEventListener('focus', () => {
    fetchStudentsFromGoogleSheets(true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchStudentsFromGoogleSheets(true);
    }
  });


}

// Global Toast System
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// 6. Grade Levels & Digital Cabinets Interactive System
function initGradeCabinet() {
  const gradeBtns = document.querySelectorAll('.grade-tab-btn');
  const cabinets = document.querySelectorAll('.grade-cabinet');

  // Grade Switching (ថ្នាក់ទី ១០, ១១, ១២)
  gradeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const grade = btn.dataset.grade;

      gradeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cabinets.forEach(cab => {
        cab.classList.remove('active');
        cab.style.display = 'none';
      });

      const targetCabinet = document.getElementById(`grade-cabinet-${grade}`);
      if (targetCabinet) {
        targetCabinet.classList.add('active');
        targetCabinet.style.display = 'block';

        // Re-render KaTeX in newly active cabinet
        if (window.renderMathInElement) {
          try {
            renderMathInElement(targetCabinet, {
              delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '\\(', right: '\\)', display: false},
                {left: '$', right: '$', display: false}
              ]
            });
          } catch (err) {
            console.warn('KaTeX rendering error:', err);
          }
        }
      }
    });
  });

  // Folder Drawer Switching inside each grade cabinet
  document.querySelectorAll('.grade-cabinet').forEach(cabinet => {
    const folderBtns = cabinet.querySelectorAll('.folder-tab-btn');
    const folderPanels = cabinet.querySelectorAll('.folder-content-panel');

    folderBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;

        folderBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        folderPanels.forEach(panel => {
          panel.classList.remove('active');
          panel.style.display = 'none';
        });

        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
          targetPanel.style.display = 'block';

          // Re-render KaTeX in newly active folder panel
          if (window.renderMathInElement) {
            try {
              renderMathInElement(targetPanel, {
                delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '\\(', right: '\\)', display: false},
                  {left: '$', right: '$', display: false}
                ]
              });
            } catch (err) {
              console.warn('KaTeX rendering error:', err);
            }
          }
        }
      });
    });
  });

  // Quick download toast trigger for btn-file-download and resource-quick-btn
  document.querySelectorAll('.btn-file-download, .resource-quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.cabinet-file-card, .resource-card');
      const title = card ? (card.dataset.title || 'ឯកសារ') : 'ឯកសារ';
      showToast(`បានចាប់ផ្តើមទាញយក៖ ${title}`);
    });
  });
}

// 7. Cabinet Document Upload Feature (បញ្ចូលឯកសារក្នុងទូថ្នាក់)
function initCabinetUpload() {
  const uploadModal = document.getElementById('upload-document-modal');
  const uploadModalClose = document.getElementById('upload-modal-close');
  const btnCancelUpload = document.getElementById('btn-cancel-upload');
  const uploadForm = document.getElementById('cabinet-upload-form');
  const uploadDropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('upload-file-input');
  const defaultView = document.getElementById('dropzone-default-view');
  const selectedView = document.getElementById('dropzone-selected-view');
  const selectedName = document.getElementById('selected-file-name');
  const selectedSize = document.getElementById('selected-file-size');
  const btnRemoveFile = document.getElementById('btn-remove-file');
  const gradeSelect = document.getElementById('upload-target-grade');
  const folderSelect = document.getElementById('upload-target-folder');

  let currentSelectedFile = null;

  // Global function to open upload modal with target grade & folder
  window.openCabinetUploadModal = function(grade, folder) {
    if (!uploadModal) return;

    if (grade && gradeSelect) {
      gradeSelect.value = grade;
    } else {
      const activeGradeTab = document.querySelector('.grade-tab-btn.active');
      if (activeGradeTab && gradeSelect) {
        gradeSelect.value = activeGradeTab.dataset.grade || '12';
      }
    }

    if (folder && folderSelect) {
      folderSelect.value = folder;
    } else {
      const currentCabinet = document.querySelector('.grade-cabinet.active');
      if (currentCabinet && folderSelect) {
        const activeFolderBtn = currentCabinet.querySelector('.folder-tab-btn.active');
        if (activeFolderBtn) {
          const target = activeFolderBtn.dataset.target || '';
          if (target.includes('lessonplans')) folderSelect.value = 'lessonplans';
          else if (target.includes('lessons')) folderSelect.value = 'lessons';
          else if (target.includes('slides')) folderSelect.value = 'slides';
          else if (target.includes('exercises')) folderSelect.value = 'exercises';
          else if (target.includes('exams')) folderSelect.value = 'exams';
        }
      }
    }

    resetUploadForm();
    uploadModal.classList.add('active');
  };

  function closeUploadModal() {
    if (uploadModal) uploadModal.classList.remove('active');
    resetUploadForm();
  }

  function resetUploadForm() {
    if (uploadForm) uploadForm.reset();
    currentSelectedFile = null;
    if (fileInput) fileInput.value = '';
    if (defaultView) defaultView.style.display = 'block';
    if (selectedView) selectedView.style.display = 'none';
  }

  // Bind click on all upload buttons in headers and folder tabs
  document.querySelectorAll('.btn-cabinet-upload, .folder-tab-upload-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const grade = btn.dataset.grade;
      window.openCabinetUploadModal(grade);
    });
  });

  if (uploadModalClose) uploadModalClose.addEventListener('click', closeUploadModal);
  if (btnCancelUpload) btnCancelUpload.addEventListener('click', closeUploadModal);

  if (uploadModal) {
    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) closeUploadModal();
    });
  }

  // Dropzone file selection & drag-and-drop
  if (uploadDropzone && fileInput) {
    uploadDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btn-remove-file')) return;
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    });

    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.classList.add('dragover');
    });

    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.classList.remove('dragover');
    });

    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    currentSelectedFile = file;
    if (defaultView) defaultView.style.display = 'none';
    if (selectedView) selectedView.style.display = 'flex';
    if (selectedName) selectedName.innerText = file.name;
    if (selectedSize) selectedSize.innerText = formatFileSize(file.size);

    const titleInput = document.getElementById('upload-file-title');
    if (titleInput && !titleInput.value) {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      titleInput.value = baseName;
    }
  }

  if (btnRemoveFile) {
    btnRemoveFile.addEventListener('click', (e) => {
      e.stopPropagation();
      currentSelectedFile = null;
      if (fileInput) fileInput.value = '';
      if (defaultView) defaultView.style.display = 'block';
      if (selectedView) selectedView.style.display = 'none';
    });
  }

  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Handle Form Submission
  if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const grade = gradeSelect ? gradeSelect.value : '12';
      const folder = folderSelect ? folderSelect.value : 'lessons';
      const title = document.getElementById('upload-file-title').value.trim();
      const desc = document.getElementById('upload-file-desc').value.trim() || 'ឯកសារត្រូវបានបញ្ចូលដោយលោកគ្រូ។';
      const formula = document.getElementById('upload-formula').value.trim();
      const chipsInput = document.getElementById('upload-file-chips').value.trim();

      const chips = chipsInput ? chipsInput.split(',').map(c => c.trim()).filter(Boolean) : ['ឯកសារថ្មី', 'រូបវិទ្យា'];

      let fileName = currentSelectedFile ? currentSelectedFile.name : `${title}.pdf`;
      let fileSize = currentSelectedFile ? formatFileSize(currentSelectedFile.size) : '2.5 MB';
      let fileExt = fileName.split('.').pop().toLowerCase();
      let fileType = fileExt === 'pptx' || fileExt === 'ppt' ? 'pptx' : (fileExt === 'pdf' ? 'pdf' : 'doc');
      let fileUrl = currentSelectedFile ? URL.createObjectURL(currentSelectedFile) : 'assets/docs/physics_formula_summary_grade12.pdf';

      const uploadItem = {
        id: 'upload-' + Date.now(),
        grade: grade,
        folder: folder,
        title: title,
        desc: desc,
        formula: formula,
        chips: chips,
        fileName: fileName,
        fileSize: fileSize,
        fileType: fileType,
        fileUrl: fileUrl,
        timestamp: new Date().toLocaleDateString('km-KH')
      };

      // Save to localStorage
      saveUploadToStorage(uploadItem);

      // Render Card in target panel
      renderUploadedCard(uploadItem, true);

      // Update folder count badge
      updateFolderBadgeCount(grade, folder, 1);

      // Close modal
      closeUploadModal();

      // Switch to target grade and folder
      switchToGradeAndFolder(grade, folder);

      // Show toast
      showToast(`✅ បានបញ្ចូល "${title}" ទៅក្នុងទូថ្នាក់ទី ${grade} ដោយជោគជ័យ!`);
    });
  }

  // Load existing saved uploads from localStorage
  loadSavedUploads();
}

// Storage Helpers
function getSavedUploads() {
  try {
    const raw = localStorage.getItem('ap_phy_custom_uploads');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveUploadToStorage(item) {
  const list = getSavedUploads();
  list.unshift(item);
  try {
    localStorage.setItem('ap_phy_custom_uploads', JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

function deleteUploadFromStorage(id) {
  let list = getSavedUploads();
  list = list.filter(item => item.id !== id);
  try {
    localStorage.setItem('ap_phy_custom_uploads', JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }
}

function loadSavedUploads() {
  const list = getSavedUploads();
  list.forEach(item => {
    renderUploadedCard(item, false);
    updateFolderBadgeCount(item.grade, item.folder, 1);
  });

  // Check any panel empty states
  document.querySelectorAll('.folder-content-panel').forEach(panel => {
    const emptyState = panel.querySelector('.cabinet-empty-state');
    if (emptyState) {
      const count = panel.querySelectorAll('.cabinet-file-card').length;
      emptyState.style.display = count === 0 ? 'flex' : 'none';
    }
  });
}

// Render newly uploaded card into target folder panel
function renderUploadedCard(item, prepend = true) {
  const targetPanelId = `g${item.grade}-${item.folder}`;
  const targetPanel = document.getElementById(targetPanelId);
  if (!targetPanel) return;

  const grid = targetPanel.querySelector('.cabinet-grid');
  if (!grid) return;

  // Hide empty state if present in target folder
  const emptyState = targetPanel.querySelector('.cabinet-empty-state');
  if (emptyState) emptyState.style.display = 'none';

  const card = document.createElement('div');
  card.className = 'glass-card cabinet-file-card resource-card';
  card.id = item.id;
  card.dataset.title = `ថ្នាក់ទី ${item.grade} • ${item.title}`;
  card.dataset.desc = item.desc;
  card.dataset.file = item.fileUrl || 'assets/docs/physics_formula_summary_grade12.pdf';
  card.dataset.filename = item.fileName;
  card.dataset.meta = `${item.fileType.toUpperCase()} • ${item.fileSize} • បញ្ចូលថ្ងៃ ${item.timestamp}`;

  const chipsHtml = item.chips.map(chip => `<li class="chip">${chip}</li>`).join('');
  const formulaHtml = item.formula ? `<div class="formula-box">\\(${item.formula}\\)</div>` : '';

  card.innerHTML = `
    <div class="file-card-top">
      <span class="file-badge hot">
        ថ្នាក់ទី ${item.grade} <span class="user-upload-badge">✨ Uploaded</span>
      </span>
      <span class="file-type-badge ${item.fileType}">${item.fileType.toUpperCase()}</span>
    </div>
    <h4 class="file-card-title">${item.title}</h4>
    <p class="file-card-desc">${item.desc}</p>
    ${formulaHtml}
    <ul class="file-chips">${chipsHtml}</ul>
    <div class="file-card-actions has-delete">
      <button class="btn-file-view" type="button"><span class="btn-icon">👁️</span> <span class="btn-text">បើកមើល</span></button>
      <a href="${item.fileUrl}" download="${item.fileName}" class="btn-file-download" title="ទាញយក"><span class="btn-icon">📥</span> <span class="btn-text">ទាញយក</span></a>
      <button class="btn-file-delete" type="button" title="លុបឯកសារចេញ"><span>🗑️</span></button>
    </div>
  `;

  // Bind delete button
  const deleteBtn = card.querySelector('.btn-file-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`តើលោកគ្រូពិតជាចង់លុបឯកសារ "${item.title}" នេះមែនទេ?`)) {
        deleteUploadFromStorage(item.id);
        card.remove();
        updateFolderBadgeCount(item.grade, item.folder, -1);
        const remaining = targetPanel.querySelectorAll('.cabinet-file-card').length;
        if (remaining === 0) {
          const panelEmpty = targetPanel.querySelector('.cabinet-empty-state');
          if (panelEmpty) panelEmpty.style.display = 'flex';
        }
        showToast(`🗑️ បានលុបឯកសារ "${item.title}" រួចរាល់!`);
      }
    });
  }

  // Bind card view click to open modal
  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-file-download') || e.target.closest('.resource-quick-btn') || e.target.closest('.btn-file-delete')) return;
    openResourceModalWithData(card);
  });

  const quickDownload = card.querySelector('.btn-file-download');
  if (quickDownload) {
    quickDownload.addEventListener('click', () => {
      showToast(`បានចាប់ផ្តើមទាញយក៖ ${item.title}`);
    });
  }

  if (prepend && grid.firstChild) {
    grid.insertBefore(card, grid.firstChild);
  } else {
    grid.appendChild(card);
  }

  // Re-render KaTeX on new card
  if (window.renderMathInElement && item.formula) {
    try {
      renderMathInElement(card, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '\\(', right: '\\)', display: false},
          {left: '$', right: '$', display: false}
        ]
      });
    } catch (err) {
      console.warn('KaTeX rendering error:', err);
    }
  }
}

// Open modal with card data
function openResourceModalWithData(card) {
  const modal = document.getElementById('resource-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalMeta = document.getElementById('modal-meta');
  const downloadBtn = document.getElementById('modal-download-btn');
  const viewBtn = document.getElementById('modal-view-btn');
  const togglePreviewBtn = document.getElementById('modal-toggle-preview');
  const previewBox = document.getElementById('modal-pdf-preview');
  const pdfFrame = document.getElementById('pdf-frame');

  if (!modal) return;

  const title = card.dataset.title;
  const desc = card.dataset.desc;
  const file = card.dataset.file;
  const filename = card.dataset.filename || 'Physics_Summary.pdf';
  const meta = card.dataset.meta || 'PDF File';

  if (modalTitle) modalTitle.innerText = title;
  if (modalDesc) modalDesc.innerHTML = desc;
  if (modalMeta) modalMeta.innerText = meta;

  if (previewBox) previewBox.style.display = 'none';
  if (pdfFrame) pdfFrame.src = '';
  if (togglePreviewBtn) {
    togglePreviewBtn.style.display = file ? 'inline-flex' : 'none';
    togglePreviewBtn.innerHTML = '<span>📖 មើលផ្ទាល់ក្នុងនេះ</span>';
  }

  if (file) {
    if (downloadBtn) {
      downloadBtn.href = file;
      downloadBtn.setAttribute('download', filename);
      downloadBtn.onclick = () => {
        showToast('កំពុងទាញយកឯកសារ ' + title + '...');
      };
    }
    if (viewBtn) {
      viewBtn.href = file;
      viewBtn.style.display = 'inline-flex';
    }
    const editBtn = document.getElementById('modal-edit-btn');
    if (editBtn) {
      if (file && file.includes('.html')) {
        editBtn.href = file + (file.includes('?') ? '&edit=1' : '?edit=1');
        editBtn.style.display = 'inline-flex';
      } else {
        editBtn.style.display = 'none';
      }
    }
    if (togglePreviewBtn) {
      togglePreviewBtn.onclick = () => {
        if (previewBox.style.display === 'none' || !previewBox.style.display) {
          previewBox.style.display = 'block';
          pdfFrame.src = file;
          togglePreviewBtn.innerHTML = '<span>✕ បិទផ្ទាំងមើល</span>';
        } else {
          previewBox.style.display = 'none';
          pdfFrame.src = '';
          togglePreviewBtn.innerHTML = '<span>📖 មើលផ្ទាល់ក្នុងនេះ</span>';
        }
      };
    }
  }

  if (window.renderMathInElement && modalDesc) {
    try {
      renderMathInElement(modalDesc, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '\\(', right: '\\)', display: false},
          {left: '$', right: '$', display: false}
        ]
      });
    } catch (e) {
      console.warn(e);
    }
  }

  modal.classList.add('active');
}

// Update count on folder badge (e.g. ៤ មេរៀន -> ៥ មេរៀន)
function updateFolderBadgeCount(grade, folder, delta) {
  const targetId = `g${grade}-${folder}`;
  const btn = document.querySelector(`.folder-tab-btn[data-target="${targetId}"]`);
  if (!btn) return;

  const countBadge = btn.querySelector('.folder-tab-count');
  if (!countBadge) return;

  const arabicToKhmer = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const targetPanel = document.getElementById(targetId);
  if (targetPanel) {
    const totalCards = targetPanel.querySelectorAll('.cabinet-file-card').length;
    const khmerStr = String(totalCards).split('').map(d => arabicToKhmer[d] || d).join('');
    const suffix = folder === 'lessons' ? 'មេរៀន' : (folder === 'slides' ? 'សំណុំស្លាយ' : (folder === 'exercises' ? 'កម្រង' : (folder === 'lessonplans' ? 'កិច្ចតែងការ' : 'វិញ្ញាសា')));
    countBadge.innerText = `${khmerStr} ${suffix}`;
    return;
  }

  const text = countBadge.innerText.trim();
  const match = text.match(/([០-៩0-9]+)/);
  if (!match) return;

  // Convert Khmer digits to Arabic number if needed
  const khmerToArabic = { '០': 0, '១': 1, '២': 2, '៣': 3, '៤': 4, '៥': 5, '៦': 6, '៧': 7, '៨': 8, '៩': 9 };

  let numStr = match[1];
  let currentNum = 0;
  for (let ch of numStr) {
    if (khmerToArabic[ch] !== undefined) {
      currentNum = currentNum * 10 + khmerToArabic[ch];
    } else if (!isNaN(parseInt(ch))) {
      currentNum = currentNum * 10 + parseInt(ch);
    }
  }

  const newNum = Math.max(0, currentNum + delta);
  const newKhmerStr = String(newNum).split('').map(d => arabicToKhmer[d] || d).join('');
  const suffix = text.replace(/[០-៩0-9]+/, '').trim();

  countBadge.innerText = `${newKhmerStr} ${suffix}`;
}

// Switch to given grade and folder tab
function switchToGradeAndFolder(grade, folder) {
  const gradeBtn = document.querySelector(`.grade-tab-btn[data-grade="${grade}"]`);
  if (gradeBtn) gradeBtn.click();

  setTimeout(() => {
    const targetId = `g${grade}-${folder}`;
    const folderBtn = document.querySelector(`.folder-tab-btn[data-target="${targetId}"]`);
    if (folderBtn) folderBtn.click();
  }, 100);
}

