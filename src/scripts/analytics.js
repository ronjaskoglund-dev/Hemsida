const GTM_ID = 'GTM-WNQPKQ36';
let loaded = false;

export const loadAnalytics = () => {
    if (loaded || document.querySelector(`script[data-gtm-id="${GTM_ID}"]`)) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

    const script = document.createElement('script');
    script.async = true;
    script.dataset.gtmId = GTM_ID;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.append(script);
};
