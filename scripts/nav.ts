/**
 * Progressive enhancement for Header.astro and Footer.astro.
 *
 * Everything is wired through data attributes rather than hardcoded ids, so
 * multiple headers on a page each initialise independently:
 *   [data-nav-toggle]  the hamburger button (points at the panel via aria-controls)
 *   [data-nav-panel]   the link list that slides down
 *   [data-nav-icon]    the hamburger/cross path whose `d` is swapped
 *   [data-year]        filled with the current year
 */

const ICON_CLOSED = 'M4 6h16M4 12h16M4 18h16';
const ICON_OPEN = 'M6 18L18 6M6 6l12 12';
const DESKTOP_QUERY = '(min-width: 869px)';

function initYear(): void {
    const year = String(new Date().getFullYear());
    document.querySelectorAll<HTMLElement>('[data-year]').forEach((el) => {
        el.textContent = year;
    });
}

function initNav(): void {
    document.querySelectorAll<HTMLElement>('[data-nav-toggle]').forEach((toggle) => {
        const panelId = toggle.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;

        const icon = toggle.querySelector<SVGPathElement>('[data-nav-icon]');

        const setOpen = (open: boolean): void => {
            panel.toggleAttribute('data-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            icon?.setAttribute('d', open ? ICON_OPEN : ICON_CLOSED);
        };

        const close = (): void => setOpen(false);

        toggle.addEventListener('click', () => setOpen(!panel.hasAttribute('data-open')));

        // Tapping any link closes the panel.
        panel.addEventListener('click', (event) => {
            if ((event.target as HTMLElement).closest('a')) close();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape' || !panel.hasAttribute('data-open')) return;
            close();
            toggle.focus();
        });

        // Crossing into desktop width must not leave the panel stuck shut.
        const desktop = window.matchMedia(DESKTOP_QUERY);
        desktop.addEventListener('change', (mq) => {
            if (mq.matches) close();
        });
    });
}

export function init(): void {
    initYear();
    initNav();
}