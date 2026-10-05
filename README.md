# astro-common

Reusable Astro components for static business sites deployed on Cloudflare.

Built as a git submodule so a consuming site imports the components as source
with no build step and no published package. Intended for small local-business
sites: fast, accessible, no framework runtime, no client-side UI library.

---

## Consuming it

The submodule lives at `src/common`. Point tsconfig at it once:

```jsonc
// tsconfig.json
{
    "extends": "astro/tsconfigs/strict",
    "compilerOptions": {
        "paths": {
            "@common/*": ["./src/common/*"]
        }
    }
}
```

Then import components by path:

```astro
---
import BaseLayout from '@common/components/BaseLayout.astro';
import Hero from '@common/components/Hero.astro';
import { site } from '../config/site';
---
```

> Import with **relative** paths inside `astro.config.mjs` if you need config-time
> values. Astro does not resolve tsconfig aliases while loading the config file.

### Initialising behaviour

Client-side behaviour is opt-in. Add the barrel once, anywhere in the document:

```astro
<BaseLayout ...>
    <slot name="scripts" />
</BaseLayout>
```

```astro
<!-- in a layout, or directly in the page -->
<script>
    import '@common/scripts/index';
</script>
```

Import individual modules instead if you only want one behaviour
(`@common/scripts/nav`, `@common/scripts/contact-form`).

---

## Boundaries

This library **imports nothing from the consuming site**. All configuration
arrives through props. `src/config/site.ts` is a convention this library
teaches, not a file it depends on.

That rule is enforced by `eslint.config.js`, which fails the build on:

| Attempted import | Why it is blocked |
| --- | --- |
| `@/…`, `~/**`, `@common/**`, `@config/**` | Reaching into the consuming site |
| `@astrojs/cloudflare`, `wrangler`, `cloudflare:*` | Would hardcode the Cloudflare adapter |
| `node:*` | Would break other edge runtimes |
| `react`, `vue`, `svelte`, … | This library is framework-agnostic |
| `../../*` | Escapes the library root |

Also never present here: API routes, secrets, deployment config, or client
content. If you need those, they belong in the site repo.

The quick test: `grep` this repo for a client name, domain, or key. Nothing
should come back.

---

## Site configuration

```ts
// src/config/site.ts
import type { SiteConfig } from '@common/components/types';

export const site: SiteConfig = {
    name: 'Acme Plumbing',
    legalName: 'Acme Plumbing LLC',
    domain: 'https://acmeplumbing.com',
    description: 'Fast, local plumbing repairs.',
    themeColor: '#0066ff',
    contact: { email: 'hello@acmeplumbing.com', phone: '(555) 010-0100' },
    nav: [
        { href: '/services', label: 'Services' },
        { href: '/contact', label: 'Contact' },
    ],
    social: [{ label: 'Facebook', href: 'https://facebook.com/acme' }],
};
```

`domain` must be an absolute origin with no trailing slash. It is used to build
canonical URLs, Open Graph image URLs, and JSON-LD.

### Environment variables

Never put a secret in `site.ts` — it is bundled into client-side code. Turnstile
site keys are public by design and belong in a public env var:

```sh
# .env
PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA...
```

```ts
const site: SiteConfig = { /* ... */ };
export const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '';
```

Secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) belong in `.dev.vars`
locally and Cloudflare secrets in production. They are read server-side only,
in your own API route.

---

## Components

### `BaseLayout.astro`

Document shell. Composes `Seo.astro`, optionally renders `Header`/`Footer`, and
exposes `head` and `scripts` slots.

| Prop | Type | Notes |
| --- | --- | --- |
| `site` | `SiteConfig` | Required |
| `title` | `string` | Required |
| `description` | `string` | Falls back to `site.description` |
| `ogImage` | `ImageSource` | Falls back to `site.ogImage` |
| `noindex` | `boolean` | Default `false` |
| `jsonLd` | `object \| object[]` | Merged after `site.jsonLd` |
| `turnstile` | `boolean` | Default `false`. Only set `true` on pages that render a widget |
| `titleTemplate` | `string` | Default `'{title} \| {site}'` |
| `header` | `HeaderProps \| null` | Omitted when absent |
| `footer` | `FooterProps \| null` | Omitted when absent |
| `bodyClass` | `string` | |

Slots: `default`, `head`, `scripts`.

### `Seo.astro`

Head tags only: title, description, canonical, robots, Open Graph, Twitter card,
favicon, JSON-LD, optional Turnstile script. Use directly if you have your own
`<html>` shell.

### `Header.astro`

| Prop | Type | Notes |
| --- | --- | --- |
| `logo` | `ImageSource` | Required |
| `logoAlt` | `string` | Required |
| `logoHref` | `string` | Default `/` |
| `navLinks` | `NavLink[]` | Falls back to `site.nav` when used via `BaseLayout` |
| `cta` | `Cta` | Rendered twice: desktop button + mobile panel item |
| `logoHeight` | `string` | Default `'44px'` |
| `showMobileCta` | `boolean` | Default `true` |

### `Footer.astro`

| Prop | Type | Notes |
| --- | --- | --- |
| `businessName` | `string` | Required. Legal entity for the copyright line |
| `tagline` | `string` | |
| `columns` | `FooterColumn[]` | `{ heading, links }` |
| `social` | `SocialLink[]` | |
| `showYear` | `boolean` | Default `true` |

### `Hero.astro`

| Prop | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Required |
| `tag` | `string` | Pill above the headline |
| `subhead` | `string` | |
| `primaryCta` / `secondaryCta` | `Cta` | |
| `stats` | `Stat[]` | `{ value, label }` |
| `align` | `'left' \| 'center'` | Default `'left'` |
| `id` | `string` | |

Slot: `visual` for the right-hand column.

### `Services.astro`

Feature grid. `title` and `items` required; `subtitle`, `columns` (`2 | 3 | 4`),
`tone` (`'white' | 'muted'`), `id` optional. Items are
`{ icon?, title, text }`, where `icon` is either a name from the icon registry or
arbitrary text.

### `Solutions.astro`

Card grid. `title` and `items` required; `subtitle`, `highlightFirst`, `id`
optional. Items are
`{ icon?, badge?, badgeTone?, title, text, bullets?, cta? }`, where `badgeTone`
is `'info' | 'warning' | 'neutral'`. `icon` is a key from the icon registry or
arbitrary text, matching `FeatureItem.icon`.

### `Comparison.astro`

Two-column comparison. `title`, `left`, `right` required; `subtitle`, `id`
optional. Each side is `{ heading, tone, items, highlight? }`, where `tone` is
`'positive' | 'negative'` and drives colour plus the check/cross marker.
`highlight` defaults to `true` for the positive side.

### `Faq.astro`

| Prop | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Required |
| `items` | `{ q, a }[]` | Required |
| `subtitle` | `string` | |
| `accordion` | `boolean` | Default `true`. `false` renders an always-expanded list |
| `emitJsonLd` | `boolean` | Default `false`. Outputs `FAQPage` structured data |
| `id` | `string` | |

### `CtaSection.astro`

`title` required; `subhead`, `tone` (`'dark' | 'brand' | 'light'`, default
`'dark'`), `id` (default `'contact'`) optional. Slot for buttons or a form.

Dark tones re-theme the inherited form field custom properties, so a slotted
`ContactForm` adapts without being told it is inside a banner.

### `ContactForm.astro`

All props optional. `action` defaults to `/api/contact`.

| Prop | Type | Notes |
| --- | --- | --- |
| `id` | `string` | Default `'contact'`. Also prefixes field ids, so pass a unique value if you render two forms |
| `action` | `string` | Endpoint receiving the JSON POST |
| `requestHeaders` | `Record<string, string>` | Extra headers |
| `turnstileSiteKey` | `string` | Empty or omitted disables the widget |
| `showSubject` | `boolean` | Default `true` |
| `submitLabel` | `string` | Default `'Send Message'` |
| `loadingLabel` | `string` | Default `'Sending...'` |
| `successMessage` | `string` | |
| `submitVariant` | `'primary' \| 'secondary'` | Default `'primary'` |
| `namePlaceholder`, `emailPlaceholder`, `subjectPlaceholder`, `messagePlaceholder` | `string` | |

Posts JSON: `{ name, email, subject?, message, company, turnstileToken }`.

`company` is a honeypot — keep it in the payload and reject non-empty values
server-side. `turnstileToken` is an empty string when Turnstile is off.

**This library ships no server code.** Write your own route. It must verify
`turnstileToken` when Turnstile is on, reject a non-empty `company`, and return
`{ success: true }` on completion so the client shows its success state.

### `Icon.astro`

`<Icon name="phone" size={20} />`. Names: `check`, `x`, `minus`, `arrow-right`,
`arrow-up-right`, `phone`, `mail`, `map-pin`, `clock`, `star`, `bolt`, `shield`,
`globe`, `users`, `sparkle`, `pencil`, `credit-card`. Unknown names render
nothing rather than throwing. Add more in `components/icons/registry.ts`.

---

## Theming

`styles/theme.css` ships tokens, a reset, and a few global utilities
(`.container`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-block`,
`.section-header`, `.gradient-text`, `.visually-hidden`). Components never
redefine those class names, so overriding them is safe.

Rebrand by overriding tokens in the site's own stylesheet, loaded after the
library's:

```css
/* src/styles/site.css */
:root {
    --color-primary: #b45309;
    --color-accent: #f59e0b;
    --gradient-brand: linear-gradient(135deg, #b45309 0%, #f59e0b 100%);
    --radius-lg: 4px;
}
```

`BaseLayout` imports `theme.css`. If you use components without it, import
`@common/styles/theme.css` yourself.

Fonts are not shipped here. `--font-sans` lists `'Plus Jakarta Sans'` first with
system fallbacks, so it degrades cleanly. To self-host, declare `@font-face` in
your site and keep the family name.

---

## Development

```sh
npm install
npm run dev      # playground: every component with sample data
npm run build
npm run check    # astro check
npm run lint     # boundary rule
npm run verify   # both
```

Node 24.16+ or 22.22.3+ is required by the lint toolchain.

## Versioning

Sites pin a submodule commit, so **any change to a component's props or markup
is a breaking change** for consumers. Additive props are safe; renaming,
removing, or changing defaults is not.