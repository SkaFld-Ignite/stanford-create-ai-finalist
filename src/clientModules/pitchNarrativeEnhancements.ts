/**
 * Pitch Narrative page enhancements:
 * 1. Collapsible right TOC sections
 * 2. Smooth scroll-to-center for slide navigation links
 */

function enhance() {
  if (!window.location.pathname.includes('pitch-narrative')) return;
  setupCollapsibleToc();
  setupSlideClickLinks();
}

export function onRouteDidUpdate() {
  setTimeout(enhance, 50);
}

// Handle initial page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(enhance, 50));
  } else {
    setTimeout(enhance, 50);
  }
}

function setupCollapsibleToc() {
  const toc = document.querySelector('ul.table-of-contents');
  if (!toc || toc.getAttribute('data-enhanced')) return;
  toc.setAttribute('data-enhanced', 'true');

  const topItems = toc.querySelectorAll(':scope > li');
  topItems.forEach((li) => {
    const nested = li.querySelector(':scope > ul');
    if (!nested) return;

    const link = li.querySelector(':scope > a');
    if (!link) return;

    li.classList.add('toc-section', 'toc-collapsed');

    const arrow = document.createElement('span');
    arrow.className = 'toc-arrow';
    arrow.textContent = '\u25B8'; // ▸
    link.insertBefore(arrow, link.firstChild);

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const isCollapsed = li.classList.contains('toc-collapsed');
      li.classList.toggle('toc-collapsed', !isCollapsed);
      li.classList.toggle('toc-expanded', isCollapsed);
      arrow.textContent = isCollapsed ? '\u25BE' : '\u25B8'; // ▾ or ▸
    });
  });
}

function setupSlideClickLinks() {
  document.querySelectorAll('a.slide-click-link').forEach((link) => {
    if (link.getAttribute('data-enhanced')) return;
    link.setAttribute('data-enhanced', 'true');

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (!href) return;
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        history.pushState(null, '', href);
      }
    });
  });
}
