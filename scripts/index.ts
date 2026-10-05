/**
 * Barrel entry point for astro-common client behaviour.
 *
 *   <script>
 *     import '@common/scripts/index';
 *   </script>
 *
 * Self-initialises on import. Import the individual modules instead if you only
 * want one behaviour:
 *   import { init as initNav } from '@common/scripts/nav';
 */
import { init as initNav } from './nav';
import { init as initContactForms } from './contact-form';

export { initNav, initContactForms };

function initAll(): void {
    initNav();
    initContactForms();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
} else {
    initAll();
}