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

// 5. Contact & Registration Form
function initContactForm() {
  const form = document.getElementById('enrollment-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const course = document.getElementById('form-course').value;

    if (!name || !phone) {
      showToast('សូមបំពេញឈ្មោះ និងលេខទូរស័ព្ទឲ្យបានត្រឹមត្រូវ!');
      return;
    }

    showToast(`សូមអរគុណ ${name}! សំណើចុះឈ្មោះរៀនវគ្គ ${course} ត្រូវបានផ្ញើរួចរាល់។ លោកគ្រូនឹងទាក់ទងទៅកាន់ ${phone} ឆាប់ៗនេះ!`);
    form.reset();
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

