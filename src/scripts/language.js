import { attributeTranslations, textTranslations, titleTranslations } from './translations.js';

const STORAGE_KEY = 'ronja-language';
const language = localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'sv';

const applyLanguage = () => {
  document.documentElement.lang = language;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const translation = textTranslations[element.dataset.i18n];
    if (translation) element.textContent = translation[language];
  });

  document.querySelectorAll('[data-i18n-views]').forEach((element) => {
    if (language === 'en') {
      element.textContent = `${element.dataset.i18nViews.replace(',', '.')}K views`;
    }
  });

  for (const attributeName of ['placeholder', 'aria-label', 'title']) {
    document.querySelectorAll(`[data-i18n-${attributeName}]`).forEach((element) => {
      const key = element.getAttribute(`data-i18n-${attributeName}`);
      const translation = attributeTranslations[key];
      if (translation) element.setAttribute(attributeName, translation[language]);
    });
  }

  const pageTitle = titleTranslations[document.documentElement.dataset.i18nPage];
  if (pageTitle) document.title = pageTitle[language];

  document.querySelectorAll('[data-site-language]').forEach((button) => {
    const active = button.dataset.siteLanguage === language;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
};

document.addEventListener('DOMContentLoaded', applyLanguage);
