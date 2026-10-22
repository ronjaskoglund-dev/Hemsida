import { loadAnalytics } from './analytics.js';

const THEME_KEY = 'ronja-theme';
const LANGUAGE_KEY = 'ronja-language';
const COOKIE_CONSENT_NAME = 'ronja_cookie_consent';

const getLanguage = () => localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'sv';
const getTheme = () => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';

document.documentElement.dataset.theme = getTheme();
document.documentElement.lang = getLanguage();

const updateThemeButton = () => {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    const english = getLanguage() === 'en';
    button.setAttribute('aria-label', dark
        ? (english ? 'Enable light mode' : 'Aktivera ljust läge')
        : (english ? 'Enable dark mode' : 'Aktivera mörkt läge'));
    button.setAttribute('title', dark
        ? (english ? 'Light mode' : 'Ljust läge')
        : (english ? 'Dark mode' : 'Mörkt läge'));
    button.setAttribute('aria-pressed', String(dark));
};

const updateLanguageButtons = () => {
    const language = getLanguage();
    document.querySelectorAll('[data-site-language]').forEach((button) => {
        const active = button.dataset.siteLanguage === language;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
};

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
    if (choice === 'accepted') loadAnalytics();
};

const showCookieConsent = () => {
    const savedConsent = readCookieConsent();
    if (savedConsent === 'accepted') {
        loadAnalytics();
        return;
    }
    if (savedConsent) return;

    const english = getLanguage() === 'en';
    const consent = document.createElement('section');
    consent.className = 'cookie-consent';
    consent.setAttribute('role', 'dialog');
    consent.setAttribute('aria-modal', 'false');
    consent.setAttribute('aria-labelledby', 'cookie-consent-title');
    consent.innerHTML = `
        <div class="cookie-consent__copy">
            <p class="cookie-consent__label">Cookies</p>
            <h2 id="cookie-consent-title">${english ? 'Your privacy matters.' : 'Din integritet är viktig.'}</h2>
            <p>${english ? 'This website uses necessary cookies to remember your choice. You can accept or reject cookies.' : 'Den här webbplatsen använder nödvändiga cookies för att komma ihåg ditt val. Du kan godkänna eller avvisa cookies.'}</p>
        </div>
        <div class="cookie-consent__actions">
            <button class="cookie-consent__button cookie-consent__button--secondary" type="button" data-cookie-choice="rejected">${english ? 'Reject' : 'Avvisa'}</button>
            <button class="cookie-consent__button cookie-consent__button--primary" type="button" data-cookie-choice="accepted">${english ? 'Accept' : 'Godkänn'}</button>
        </div>`;
    consent.addEventListener('click', (event) => {
        const button = event.target.closest('[data-cookie-choice]');
        if (button) saveCookieConsent(button.dataset.cookieChoice);
    });
    document.body.append(consent);
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.theme-toggle')?.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem(THEME_KEY, nextTheme);
        updateThemeButton();
    });

    document.querySelectorAll('[data-site-language]').forEach((button) => {
        button.addEventListener('click', () => {
            const nextLanguage = button.dataset.siteLanguage === 'en' ? 'en' : 'sv';
            localStorage.setItem(LANGUAGE_KEY, nextLanguage);
            window.location.reload();
        });
    });

    updateThemeButton();
    updateLanguageButtons();
    showCookieConsent();
});
