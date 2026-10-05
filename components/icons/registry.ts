/**
 * Inline SVG path registry, stroke-based (Lucide-style), 24x24 viewBox.
 * Rendered by components/Icon.astro.
 */
export const ICON_PATHS = {
    check: ['M20 6 9 17l-5-5'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
    minus: ['M5 12h14'],
    'arrow-right': ['M5 12h14', 'M12 5l7 7-7 7'],
    'arrow-up-right': ['M7 17 17 7', 'M7 7h10v10'],
    phone: [
        'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
    ],
    mail: ['M4 4h16v16H4z', 'm4 4 8 8 8-8'],
    'map-pin': ['M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
    clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
    star: ['m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1z'],
    bolt: ['M13 2 4 14h6l-1 8 9-12h-6z'],
    shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
    globe: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M3 12h18', 'M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z'],
    users: [
        'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
        'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
        'M23 21v-2a4 4 0 0 0-3-3.9',
        'M16 3.1a4 4 0 0 1 0 7.8',
    ],
    sparkle: ['M12 3v4M12 17v4M3 12h4M17 12h4', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
    pencil: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
    'credit-card': ['M3 5h18v14H3z', 'M3 10h18'],
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function hasIcon(name: string | undefined): name is IconName {
    return typeof name === 'string' && Object.hasOwn(ICON_PATHS, name);
}