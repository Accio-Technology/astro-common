/**
 * Shared data shapes for astro-common.
 *
 * Consumers import these to type their own config and content:
 *   import type { SiteConfig } from '@common/components/types';
 *   export const site: SiteConfig = { name: '...', domain: '...' };
 *
 * Individual components declare their own `interface Props` inline, which the
 * Astro language server picks up for autocomplete at the call site.
 */
import type { ImageMetadata } from 'astro';

/** An image the library can render: an optimized `astro:assets` import, or a plain path. */
export type ImageSource = ImageMetadata | string;

export interface NavLink {
    href: string;
    label: string;
    /** Adds target="_blank" rel="noopener" and marks the link external for assistive tech. */
    external?: boolean;
}

export interface SocialLink {
    label: string;
    href: string;
}

export interface SiteContact {
    email?: string;
    phone?: string;
    address?: string;
    hours?: string;
}

/** Everything the library needs to know about the business it is rendering for. */
export interface SiteConfig {
    /** Display name, e.g. "Accio Technology". */
    name: string;
    /** Absolute origin, no trailing slash. e.g. "https://example.com" */
    domain: string;
    /** Full legal entity for the footer, e.g. "Accio Technology LLC". */
    legalName?: string;
    locale?: string;
    tagline?: string;
    /** Default meta description when a page does not supply its own. */
    description?: string;
    logo?: ImageSource;
    favicon?: string;
    ogImage?: ImageSource;
    themeColor?: string;
    contact?: SiteContact;
    social?: SocialLink[];
    /** Convenience default nav. Header.astro prefers its own `navLinks` prop over this. */
    nav?: NavLink[];
    /** Site-wide Schema.org objects, merged with any page-level ones. */
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export interface Cta {
    href: string;
    label: string;
    external?: boolean;
    variant?: 'primary' | 'secondary';
}

export interface Stat {
    value: string;
    label: string;
}

export interface FeatureItem {
    /** Key of an icon in components/icons, or raw text/number, or a small snippet. */
    icon?: string;
    title: string;
    text: string;
}

export interface SolutionCard {
    badge?: string;
    badgeTone?: 'info' | 'warning' | 'neutral';
    title: string;
    text: string;
    bullets?: string[];
    cta?: Cta;
}

export interface ComparisonSide {
    heading: string;
    tone: 'positive' | 'negative';
    /** Plain strings. Inline <strong> is not interpreted. */
    items: string[];
    highlight?: boolean;
}

export interface FaqItem {
    q: string;
    a: string;
}

export interface FooterColumn {
    heading: string;
    links: NavLink[];
}

/** Turns an ImageSource into an absolute URL, given the site origin. */
export function absoluteUrl(source: ImageSource, domain: string): string {
    const path = typeof source === 'string' ? source : source.src;
    try {
        return new URL(path, domain).href;
    } catch {
        return path;
    }
}

/** Normalizes SiteConfig.jsonLd into an array. */
export function toJsonLdArray(value: SiteConfig['jsonLd']): Record<string, unknown>[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}