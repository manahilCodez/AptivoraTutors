(function () {
  'use strict';

  /* ---------------- Theme toggle ---------------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyThemeUI(theme) {
    var isLight = theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  }

  applyThemeUI(currentTheme());

  themeToggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    applyThemeUI(next);
    try { localStorage.setItem('aptivora-theme', next); } catch (e) { /* storage unavailable */ }
  });

  /* ---------------- Mobile nav ---------------- */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');

  function closeMobileNav() {
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
  }

  hamburger.addEventListener('click', function () {
    var isOpen = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  /* ---------------- Sticky header shadow ---------------- */
  var header = document.getElementById('siteHeader');
  var lastScrolled = false;
  window.addEventListener('scroll', function () {
    var scrolled = window.scrollY > 8;
    if (scrolled !== lastScrolled) {
      header.style.boxShadow = scrolled ? '0 8px 24px -16px rgba(0,0,0,0.4)' : 'none';
      lastScrolled = scrolled;
    }
  }, { passive: true });

  /* ---------------- FAQ accordion ---------------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = q.getAttribute('aria-expanded') === 'true';

      faqItems.forEach(function (other) {
        if (other !== item) {
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });

      q.setAttribute('aria-expanded', String(!isOpen));
      a.style.maxHeight = isOpen ? null : a.scrollHeight + 'px';
    });
  });

  /* ---------------- Scroll-triggered stat counters + progress ring ---------------- */
  var statNums = document.querySelectorAll('.stat-num');
  var countersStarted = false;

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var ringFg = document.getElementById('ringFg');
  var ringNum = document.getElementById('ringNum');

  function animateRing() {
    if (!ringFg || !ringNum) return;
    var circumference = 314; // 2 * PI * r(50), matches stroke-dasharray in CSS
    var target = 75;
    ringFg.style.strokeDashoffset = String(circumference - (target / 100) * circumference);

    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      ringNum.textContent = Math.round(progress * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function startHeroAnimations() {
    if (countersStarted) return;
    countersStarted = true;
    statNums.forEach(animateCount);
    animateRing();
  }

  if ('IntersectionObserver' in window) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startHeroAnimations();
          statObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });

    var statBar = document.querySelector('.stat-bar');
    if (statBar) statObserver.observe(statBar);
  } else {
    startHeroAnimations();
  }

  /* ---------------- Reveal-on-scroll for cards ---------------- */
  var revealTargets = document.querySelectorAll(
    '.feature-card, .course-card, .tutor-card, .result-chip, .testimonial, .resource-item, .faq-item'
  );

  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------- Contact / demo form ---------------- */
  var form = document.getElementById('contactForm');
  var formNote = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('fName').value.trim();
      var contact = document.getElementById('fContact').value.trim();

      if (!name || !contact) {
        formNote.textContent = 'Please add your name and a way to reach you.';
        formNote.style.color = '#F87171';
        return;
      }

      formNote.textContent = 'Thanks, ' + name.split(' ')[0] + '! We\u2019ll be in touch shortly to schedule your free demo.';
      formNote.style.color = '';
      form.reset();
    });
  }

  /* ---------------- Custom skill courses: data + rendering ---------------- */
  var STORAGE_KEY = 'aptivora-custom-courses';
  var ADMIN_PASSCODE = 'aptivora2026'; // change this to your own passcode

  var defaultCustomCourses = [
    { id: 'c1', title: 'Start Home/Online Business' },
    { id: 'c2', title: 'Introduction to Finance' },
    { id: 'c3', title: 'Introduction to AI Chatbots' },
    { id: 'c4', title: 'English - Speaking, Reading, Writing, Listening' },
    { id: 'c5', title: 'Microsoft Office (Must Have Skill)' },
    { id: 'c6', title: 'Programming Language Basics - C++, Python, HTML, CSS' },
    { id: 'c7', title: 'Quickbooks' },
    { id: 'c8', title: 'IELTS for Students' },
    { id: 'c9', title: 'Summer Course' },
    { id: 'c10', title: 'Weekend Course' }
  ];

  var iconPaths = {
    cpu: '<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    chart: '<path d="M4 19V9M10 19V5M16 19v-6"/><path d="M2 19h20"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    book: '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    code: '<path d="M9 18l-6-6 6-6M15 6l6 6-6 6"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><line x1="12" y1="1.5" x2="12" y2="4.2"/><line x1="12" y1="19.8" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="4.2" y2="12"/><line x1="19.8" y1="12" x2="22.5" y2="12"/><line x1="4.4" y1="4.4" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.6" y2="19.6"/><line x1="4.4" y1="19.6" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.6" y2="4.4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    spark: '<path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2Z"/>'
  };

  var iconRules = [
    [/chatbot|\bai\b/i, 'cpu'],
    [/finance|quickbook/i, 'chart'],
    [/business/i, 'briefcase'],
    [/english|ielts/i, 'book'],
    [/office/i, 'grid'],
    [/programming|python|c\+\+|html|css/i, 'code'],
    [/summer/i, 'sun'],
    [/weekend/i, 'calendar']
  ];

  function getIconKey(title) {
    for (var i = 0; i < iconRules.length; i++) {
      if (iconRules[i][0].test(title)) return iconRules[i][1];
    }
    return 'spark';
  }

  function iconSvg(title) {
    var key = getIconKey(title);
    return '<svg viewBox="0 0 24 24">' + iconPaths[key] + '</svg>';
  }

  function loadCustomCourses() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* fall through to defaults */ }
    return defaultCustomCourses.slice();
  }

  function saveCustomCourses(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }

  var customCourses = loadCustomCourses();

  var customGrid = document.getElementById('customCourseGrid');
  var adminList = document.getElementById('adminCourseList');

  function courseCardHTML(course) {
    return '<div class="custom-course-card">' +
      '<span class="custom-course-icon">' + iconSvg(course.title) + '</span>' +
      '<span>' + escapeHTML(course.title) + '</span>' +
      '</div>';
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderAll() {
    if (customGrid) {
      customGrid.innerHTML = customCourses.map(function (c) { return courseCardHTML(c); }).join('');
    }
    if (adminList) {
      adminList.innerHTML = customCourses.map(function (c) {
        return '<li data-id="' + c.id + '"><span>' + escapeHTML(c.title) + '</span>' +
          '<button type="button" class="admin-course-remove" aria-label="Remove ' + escapeHTML(c.title) + '">' +
          '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>';
      }).join('');
    }
  }

  renderAll();

  /* ---------------- Admin panel ---------------- */
  var adminToggle = document.getElementById('adminToggle');
  var adminBody = document.getElementById('adminBody');
  var adminLock = document.getElementById('adminLock');
  var adminControls = document.getElementById('adminControls');
  var adminPasscode = document.getElementById('adminPasscode');
  var adminUnlock = document.getElementById('adminUnlock');
  var adminLockNote = document.getElementById('adminLockNote');
  var adminAddForm = document.getElementById('adminAddForm');
  var adminCourseInput = document.getElementById('adminCourseInput');
  var adminReset = document.getElementById('adminReset');

  if (adminToggle && adminBody) {
    adminToggle.addEventListener('click', function () {
      var isOpen = adminToggle.getAttribute('aria-expanded') === 'true';
      adminToggle.setAttribute('aria-expanded', String(!isOpen));
      adminBody.style.maxHeight = isOpen ? null : adminBody.scrollHeight + 'px';
    });
  }

  function tryUnlock() {
    if (!adminPasscode) return;
    if (adminPasscode.value === ADMIN_PASSCODE) {
      adminLock.hidden = true;
      adminControls.hidden = false;
      if (adminBody.style.maxHeight) adminBody.style.maxHeight = adminBody.scrollHeight + 'px';
    } else {
      adminLockNote.textContent = 'Incorrect passcode — try again.';
      adminLockNote.classList.add('admin-error');
      adminPasscode.value = '';
      adminPasscode.focus();
    }
  }

  if (adminUnlock) adminUnlock.addEventListener('click', tryUnlock);
  if (adminPasscode) {
    adminPasscode.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); tryUnlock(); }
    });
  }

  if (adminAddForm) {
    adminAddForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var title = adminCourseInput.value.trim();
      if (!title) return;
      customCourses.push({ id: 'c' + Date.now(), title: title });
      saveCustomCourses(customCourses);
      renderAll();
      adminCourseInput.value = '';
      if (adminBody.style.maxHeight) adminBody.style.maxHeight = adminBody.scrollHeight + 'px';
    });
  }

  if (adminList) {
    adminList.addEventListener('click', function (e) {
      var btn = e.target.closest('.admin-course-remove');
      if (!btn) return;
      var li = btn.closest('li');
      var id = li && li.getAttribute('data-id');
      customCourses = customCourses.filter(function (c) { return c.id !== id; });
      saveCustomCourses(customCourses);
      renderAll();
      if (adminBody.style.maxHeight) adminBody.style.maxHeight = adminBody.scrollHeight + 'px';
    });
  }

  if (adminReset) {
    adminReset.addEventListener('click', function () {
      if (!window.confirm('Reset to the default course list? This removes any custom additions on this browser.')) return;
      customCourses = defaultCustomCourses.slice();
      saveCustomCourses(customCourses);
      renderAll();
      if (adminBody.style.maxHeight) adminBody.style.maxHeight = adminBody.scrollHeight + 'px';
    });
  }

  /* ---------------- Course popup ---------------- */
  var popupOverlay = document.getElementById('coursePopupOverlay');
  var popupClose = document.getElementById('popupClose');
  var popupCta = document.getElementById('popupCta');
  var POPUP_SESSION_KEY = 'aptivora-popup-shown';

  function openPopup() {
    if (!popupOverlay) return;
    popupOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    try { sessionStorage.setItem(POPUP_SESSION_KEY, '1'); } catch (e) { /* ignore */ }
  }

  function closePopup() {
    if (!popupOverlay) return;
    popupOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  var alreadyShown = false;
  try { alreadyShown = sessionStorage.getItem(POPUP_SESSION_KEY) === '1'; } catch (e) { /* ignore */ }

  if (!alreadyShown && popupOverlay) {
    setTimeout(openPopup, 900);
  }

  if (popupClose) popupClose.addEventListener('click', closePopup);
  if (popupCta) popupCta.addEventListener('click', closePopup);
  if (popupOverlay) {
    popupOverlay.addEventListener('click', function (e) {
      if (e.target === popupOverlay) closePopup();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popupOverlay && popupOverlay.classList.contains('open')) closePopup();
  });

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();