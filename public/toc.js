/**
 * toc.js — Table of Contents auto-inject for card-news style pages
 * Adds a floating TOC button (hamburger menu) that shows a list of all cards.
 * Cards are detected via [data-card] attribute and titles from h1/h2 inside .card-inner.
 */
(function () {
  'use strict';

  var cards = document.querySelectorAll('.card[data-card]');
  if (cards.length < 2) return;

  // Collect card info
  var items = [];
  cards.forEach(function (card) {
    var idx = card.getAttribute('data-card');
    var heading = card.querySelector('.card-inner h2') || card.querySelector('.card-inner h1');
    var label = heading ? heading.textContent.trim().replace(/\s+/g, ' ') : 'Card ' + idx;
    items.push({ idx: idx, label: label, el: card });
  });

  // Create TOC button
  var btn = document.createElement('button');
  btn.setAttribute('aria-label', 'Table of Contents');
  btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '14px',
    left: '14px',
    zIndex: '9999',
    width: '44px',
    height: '44px',
    border: 'none',
    borderRadius: '12px',
    background: 'rgba(0,0,0,0.55)',
    color: 'white',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    transition: 'opacity 0.2s, transform 0.2s'
  });

  // Create TOC panel
  var panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '9998',
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  });

  var list = document.createElement('div');
  Object.assign(list.style, {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '18px',
    padding: '20px 16px',
    maxWidth: '380px',
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  });

  var title = document.createElement('div');
  title.textContent = 'Table of Contents';
  Object.assign(title.style, {
    fontWeight: '900',
    fontSize: '16px',
    color: '#1a1a2e',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    letterSpacing: '-0.02em'
  });
  list.appendChild(title);

  items.forEach(function (item, i) {
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = (i === 0 ? '' : item.idx + '. ') + item.label;
    Object.assign(link.style, {
      display: 'block',
      padding: '10px 12px',
      borderRadius: '10px',
      color: '#333',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: i === 0 ? '800' : '600',
      lineHeight: '1.35',
      transition: 'background 0.15s'
    });
    link.addEventListener('mouseenter', function () {
      link.style.background = 'rgba(0,0,0,0.06)';
    });
    link.addEventListener('mouseleave', function () {
      link.style.background = 'transparent';
    });
    link.addEventListener('click', function (e) {
      e.preventDefault();
      panel.style.display = 'none';
      item.el.scrollIntoView({ behavior: 'smooth' });
    });
    list.appendChild(link);
  });

  panel.appendChild(list);

  // Toggle
  var isOpen = false;
  btn.addEventListener('click', function () {
    isOpen = !isOpen;
    panel.style.display = isOpen ? 'flex' : 'none';
  });
  panel.addEventListener('click', function (e) {
    if (e.target === panel) {
      isOpen = false;
      panel.style.display = 'none';
    }
  });

  document.body.appendChild(panel);
  document.body.appendChild(btn);
})();
