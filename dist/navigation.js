const savedTheme = localStorage.getItem('ronja-theme');
document.documentElement.dataset.theme = savedTheme || 'light';

const updateThemeButton = () => {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const isDark = document.documentElement.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-label', isDark ? 'Aktivera ljust läge' : 'Aktivera mörkt läge');
    themeToggle.setAttribute('title', isDark ? 'Ljust läge' : 'Mörkt läge');
    themeToggle.setAttribute('aria-pressed', String(isDark));
};

window.toggleSiteTheme = () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('ronja-theme', nextTheme);
    updateThemeButton();
};

const COOKIE_CONSENT_NAME = 'ronja_cookie_consent';

const readCookieConsent = () => {
    const consentCookie = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_NAME}=`));

    return consentCookie ? consentCookie.split('=')[1] : localStorage.getItem(COOKIE_CONSENT_NAME);
};

const saveCookieConsent = (choice) => {
    const sixMonths = 60 * 60 * 24 * 180;
    document.cookie = `${COOKIE_CONSENT_NAME}=${choice}; Path=/; Max-Age=${sixMonths}; SameSite=Lax`;
    localStorage.setItem(COOKIE_CONSENT_NAME, choice);
    document.querySelector('.cookie-consent')?.remove();
};

const showCookieConsent = () => {
    if (readCookieConsent()) return;

    const consent = document.createElement('section');
    consent.className = 'cookie-consent';
    consent.setAttribute('role', 'dialog');
    consent.setAttribute('aria-modal', 'false');
    consent.setAttribute('aria-labelledby', 'cookie-consent-title');
    consent.innerHTML = `
        <div class="cookie-consent__copy">
            <p class="cookie-consent__label">Cookies</p>
            <h2 id="cookie-consent-title">Din integritet är viktig.</h2>
            <p>Den här webbplatsen använder nödvändiga cookies för att komma ihåg ditt val. Du kan godkänna eller avvisa cookies.</p>
        </div>
        <div class="cookie-consent__actions">
            <button class="cookie-consent__button cookie-consent__button--secondary" type="button" data-cookie-choice="rejected">Avvisa</button>
            <button class="cookie-consent__button cookie-consent__button--primary" type="button" data-cookie-choice="accepted">Godkänn</button>
        </div>`;

    consent.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cookie-choice]');
        if (!button) return;
        saveCookieConsent(button.dataset.cookieChoice);
    });

    document.body.append(consent);
};

document.addEventListener('DOMContentLoaded', () => {
    let header = document.querySelector('.navbar') || document.querySelector('body > header');

    if (!header) {
        header = document.createElement('header');
        document.body.prepend(header);
    }

    header.className = 'navbar';

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = [
        ['index.html', 'HEM'],
        ['om-mig.html', 'OM MIG'],
        ['erfarenheter.html', 'ERFARENHET'],
        ['projekt.html', 'PORTFOLIO'],
        ['samarbeten.html', 'SAMARBETEN'],
        ['kontakt.html', 'KONTAKT']
    ];

    const navigation = links.map(([href, label]) => {
        const active = currentPage === href ? ' class="active" aria-current="page"' : '';
        return `<a href="${href}"${active}>${label}</a>`;
    }).join('');

    header.innerHTML = `
        <a href="index.html" class="logo">RONJA</a>
        <nav class="nav-links" aria-label="Huvudmeny">${navigation}</nav>
        <div class="social-icons">
            <a href="https://www.instagram.com/ronja.skoglund/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.332.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947C23.732 2.699 21.311.273 16.949.073 15.668.014 15.259 0 12 0zm0 5.838A6.162 6.162 0 1 0 12 18.163 6.162 6.162 0 0 0 12 5.838zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@ronjissen" target="_blank" rel="noopener noreferrer" aria-label="TikTok – ronjissen">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.99v7.74c0 1.93-.44 3.91-1.57 5.48-1.47 2.06-3.88 3.32-6.39 3.34-1.88.02-3.77-.63-5.22-1.84-2.12-1.75-3.23-4.48-2.9-7.23.33-2.73 2.04-5.11 4.54-6.22 1.25-.56 2.63-.82 4-.75v4.11c-.72-.09-1.46.04-2.12.33-.87.38-1.55 1.12-1.84 2.03-.38 1.19-.13 2.54.67 3.51.81.98 2.07 1.5 3.33 1.37 1.23-.12 2.33-.94 2.76-2.1.23-.62.33-1.28.33-1.94V.02h.07z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/ronja-skoglund" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"/></svg>
            </a>
            <button class="theme-toggle" type="button" aria-label="Aktivera mörkt läge" title="Mörkt läge" onclick="window.toggleSiteTheme()">
                <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 15.4A8.5 8.5 0 0 1 8.6 3.6 8.5 8.5 0 1 0 20.4 15.4Z"/></svg>
                <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg>
            </button>
        </div>`;

    updateThemeButton();
    showCookieConsent();
});
