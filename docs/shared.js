/* shared.js — navigation, TOC highlighting, code copy, checklist */

(function () {
  'use strict';

  /* ── Reading progress bar ───────────────────────────────── */
  const bar = document.getElementById('reading-progress');
  if (bar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Mobile sidebar ─────────────────────────────────────── */
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  /* ── Scroll to top ──────────────────────────────────────── */
  const scrollBtn = document.querySelector('.scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Copy code blocks ───────────────────────────────────── */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.closest('.code-block').querySelector('pre code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'COPIED';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
      });
    });
  });

  /* ── Clickable checklist ────────────────────────────────── */
  document.querySelectorAll('.checklist li').forEach(item => {
    item.addEventListener('click', () => item.classList.toggle('checked'));
  });

  /* ── Answers toggle ─────────────────────────────────────── */
  document.querySelectorAll('.answers-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const open = panel.classList.toggle('open');
      btn.querySelector('.toggle-icon').textContent = open ? '▲' : '▼';
    });
  });

  /* ── Sidebar download section ────────────────────────────── */
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    const pdfs = [
      ['M01 Overview & Architecture',  'Ebook-Module-01-SQL-Server-Overview-and-Architecture.pdf'],
      ['M02 Install & Configure',       'Ebook-Module-02-Installing-and-Configuring-SQL-Server.pdf'],
      ['M03 Database Management',       'Ebook-Module-03-Database-Creation-and-Management.pdf'],
      ['M04 Tables & Data',             'Ebook-Module-04-Tables-and-Data-Management.pdf'],
      ['M05 Security & Users',          'Ebook-Module-05-Security-and-User-Management.pdf'],
      ['M06 Backup & Restore',          'Ebook-Module-06-Backup-and-Restore.pdf'],
      ['M07 DB Maintenance',            'Ebook-Module-07-Database-Maintenance.pdf'],
      ['M08 SQL Agent',                 'Ebook-Module-08-SQL-Server-Agent-and-Automation.pdf'],
      ['M09 Monitoring',                'Ebook-Module-09-Monitoring-and-Performance-Basics.pdf'],
      ['M10 Troubleshooting',           'Ebook-Module-10-Basic-Troubleshooting.pdf'],
      ['M11 Import & Export',           'Ebook-Module-11-Data-Import-and-Export.pdf'],
    ];
    const hdr = document.createElement('div');
    hdr.className = 'nav-section';
    hdr.textContent = '↓ Student E-Books (PDF)';
    sidebarNav.appendChild(hdr);
    pdfs.forEach(([label, file]) => {
      const a = document.createElement('a');
      a.href = '../student-guide/pdf/' + file;
      a.download = file;
      a.className = 'nav-item nav-download';
      a.title = 'Download ' + label + ' PDF';
      a.innerHTML = '<span class="nav-dl-icon">↓</span>' + label;
      sidebarNav.appendChild(a);
    });
  }

  /* ── TOC active section highlight ───────────────────────── */
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (tocLinks.length) {
    const headings = Array.from(document.querySelectorAll('article h2, article h3'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      });
    }, { rootMargin: '-52px 0px -70% 0px' });
    headings.forEach(h => { if (h.id) observer.observe(h); });
  }
})();
