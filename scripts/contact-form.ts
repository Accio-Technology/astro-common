/**
 * Progressive enhancement for ContactForm.astro.
 *
 * Owns: lazy Turnstile rendering, the verification state machine, and the submit
 * request. Reads its entire configuration from data attributes on the form
 * element, so this file has no knowledge of any particular endpoint or secret:
 *   data-action      endpoint to POST JSON to
 *   data-headers     JSON object of extra request headers
 *   data-turnstile   "required" | "off"
 *
 * When Turnstile is off, the form submits straight away and no Turnstile polling
 * or script loading is attempted at all.
 */

interface TurnstileRenderOptions {
    sitekey: string;
    size?: 'normal' | 'compact' | 'flexible';
    appearance?: 'always' | 'execute' | 'interaction-only';
    retry?: 'auto' | 'never';
    'refresh-expired'?: 'auto' | 'never' | 'manual';
    callback?: (token: string) => void;
    'error-callback'?: (code: string) => void;
    'expired-callback'?: () => void;
    'timeout-callback'?: () => void;
}

interface TurnstileApi {
    render: (host: HTMLElement, options: TurnstileRenderOptions) => string;
    reset: (widgetId?: string) => void;
    remove?: (widgetId: string) => void;
}

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const MAX_RETRIES = 3;
const SCRIPT_TIMEOUT_MS = 15_000;

function readHeaders(raw: string | undefined): Record<string, string> {
    if (!raw) return {};
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as Record<string, string>;
    } catch {
        /* malformed data-headers is treated as "no extra headers" */
    }
    return {};
}

function setupForm(form: HTMLFormElement): void {
    const action = form.dataset.action || form.action;
    const headers = readHeaders(form.dataset.headers);

    const host = form.querySelector<HTMLElement>('[data-turnstile-host]');
    const siteKey = host?.dataset.sitekey ?? '';
    const configured = form.dataset.turnstile === 'required';

    // Degrade rather than deadlock: if a form asks for Turnstile but no key made
    // it into the markup, fall back to an unverified submit and warn in the console.
    const needsTurnstile = configured && Boolean(siteKey);
    if (configured && !siteKey) {
        console.warn('[astro-common] ContactForm has data-turnstile="required" but no site key; submitting without verification.');
    }

    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const labelEl = form.querySelector<HTMLElement>('[data-submit-label]');
    const loadingEl = form.querySelector<HTMLElement>('[data-loading]');
    const successEl = form.querySelector<HTMLElement>('[data-success]');
    const errorEl = form.querySelector<HTMLElement>('[data-error]');
    const errorTextEl = form.querySelector<HTMLElement>('[data-error-text]');

    let widgetId: string | null = null;
    let verified = !needsTurnstile;
    let loading = false;
    let pendingSubmit = false;
    let retryCount = 0;
    let token = '';
    let rendered = false;

    const showError = (message: string): void => {
        if (errorTextEl) errorTextEl.textContent = message;
        if (errorEl) errorEl.hidden = false;
        if (successEl) successEl.hidden = true;
    };

    const hideMessages = (): void => {
        if (errorEl) errorEl.hidden = true;
        if (successEl) successEl.hidden = true;
    };

    const showSuccess = (): void => {
        if (successEl) successEl.hidden = false;
        if (errorEl) errorEl.hidden = true;
    };

    const syncButton = (): void => {
        if (submitBtn) submitBtn.disabled = loading || !verified;
        if (labelEl) labelEl.hidden = loading;
        if (loadingEl) loadingEl.hidden = !loading;
    };

    const resetWidget = (): void => {
        verified = false;
        token = '';
        if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
    };

    const onVerifySuccess = (value: string): void => {
        verified = true;
        retryCount = 0;
        token = value;
        syncButton();
        if (pendingSubmit) {
            pendingSubmit = false;
            void submit();
        }
    };

    const onVerifyExpired = (): void => {
        resetWidget();
        syncButton();
    };

    const onVerifyTimeout = (): void => {
        resetWidget();
        syncButton();
    };

    const onVerifyError = (): void => {
        resetWidget();
        syncButton();
        if (retryCount < MAX_RETRIES) {
            retryCount += 1;
            window.setTimeout(resetWidget, 800 * retryCount);
        } else {
            showError("We couldn't verify you're not a bot. Please refresh the page and try again.");
        }
    };

    const renderWidget = (): void => {
        if (!host || !siteKey || !window.turnstile) return;
        widgetId = window.turnstile.render(host, {
            sitekey: siteKey,
            size: 'normal',
            appearance: 'interaction-only',
            retry: 'never',
            'refresh-expired': 'auto',
            callback: onVerifySuccess,
            'error-callback': onVerifyError,
            'expired-callback': onVerifyExpired,
            'timeout-callback': onVerifyTimeout,
        });
    };

    const submit = async (): Promise<void> => {
        loading = true;
        syncButton();
        hideMessages();

        const payload: Record<string, string> = {};
        new FormData(form).forEach((value, key) => {
            payload[key] = typeof value === 'string' ? value : '';
        });
        payload.turnstileToken = token;

        const requiredFields = ['name', 'email', 'message'];
        if (form.elements.namedItem('subject')) requiredFields.push('subject');
        const missing = requiredFields.filter((field) => !payload[field]?.trim());
        if (missing.length > 0 || (needsTurnstile && !payload.turnstileToken)) {
            loading = false;
            syncButton();
            showError('Please fill in all fields and wait for verification to complete.');
            return;
        }

        try {
            const response = await fetch(action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...headers },
                body: JSON.stringify(payload),
            });

            const result: unknown = await response.json().catch(() => ({}));

            if (response.ok && (result as { success?: boolean })?.success) {
                form.reset();
                showSuccess();
                resetWidget();
                return;
            }

            showError((result as { error?: string })?.error || 'Something went wrong. Please try again.');
            resetWidget();
        } catch {
            showError('Network error. Please check your connection and try again.');
            resetWidget();
        } finally {
            loading = false;
            syncButton();
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (loading) return;

        if (!verified) {
            pendingSubmit = true;
            hideMessages();
            if (!rendered) {
                rendered = true;
                renderWidget();
            } else {
                resetWidget();
                syncButton();
            }
            return;
        }

        void submit();
    });

    if (needsTurnstile) {
        // Render the widget on first interaction so pages without a real
        // submission never pay for the challenge.
        const fields = form.querySelectorAll<HTMLElement>('input, textarea');
        const onInteraction = (): void => {
            if (rendered) return;
            rendered = true;
            renderWidget();
            fields.forEach((el) => {
                el.removeEventListener('focus', onInteraction);
                el.removeEventListener('input', onInteraction);
            });
        };
        fields.forEach((el) => {
            el.addEventListener('focus', onInteraction);
            el.addEventListener('input', onInteraction);
        });

        // The widget renders on first interaction, so there is nothing to do on
        // script load. We only watch for the script never arriving, otherwise the
        // submit button would stay disabled with no explanation.
        window.setTimeout(() => {
            if (!window.turnstile) showError('Could not load verification. Please refresh the page.');
        }, SCRIPT_TIMEOUT_MS);
    }

    syncButton();
}

export function init(): void {
    document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach(setupForm);
}