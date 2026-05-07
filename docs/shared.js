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
