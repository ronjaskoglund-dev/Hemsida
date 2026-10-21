(() => {
    const HUBSPOT_PORTAL_ID = '149587357';
    const HUBSPOT_FORM_ID = '4049832f-829a-4fed-b3b2-64427f166c7f';
    const HUBSPOT_REGION = 'eu1';
    const ENDPOINT = `https://api-${HUBSPOT_REGION}.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;
    const REQUEST_TIMEOUT_MS = 15000;

    const messages = {
        sv: {
            sending: 'Skickar...',
            button: 'Skicka meddelande',
            success: 'Tack! Ditt meddelande har skickats. Jag återkommer så snart jag kan.',
            error: 'Meddelandet kunde inte skickas just nu. Försök igen eller mejla direkt till ronja.skoglund@gmail.com.'
        },
        en: {
            sending: 'Sending...',
            button: 'Send message',
            success: 'Thank you! Your message has been sent. I will get back to you as soon as I can.',
            error: 'Your message could not be sent right now. Please try again or email ronja.skoglund@gmail.com directly.'
        }
    };

    const getHubSpotCookie = () => {
        const cookie = document.cookie
            .split('; ')
            .find((item) => item.startsWith('hubspotutk='));

        return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : undefined;
    };

    const buildPayload = ({ firstName, lastName, email, message }) => {
        const hutk = getHubSpotCookie();
        const context = {
            pageUri: window.location.href,
            pageName: document.title
        };

        if (hutk) context.hutk = hutk;

        return {
            submittedAt: Date.now().toString(),
            fields: [
                { objectTypeId: '0-1', name: 'firstname', value: firstName },
                { objectTypeId: '0-1', name: 'lastname', value: lastName },
                { objectTypeId: '0-1', name: 'email', value: email },
                { objectTypeId: '0-1', name: 'message', value: message }
            ],
            context
        };
    };

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.querySelector('#contact-form');
        if (!form) return;

        const submitButton = form.querySelector('.submit-button');
        const status = form.querySelector('.form-status');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!form.reportValidity() || submitButton.disabled) return;

            const language = document.documentElement.lang === 'en' ? 'en' : 'sv';
            const copy = messages[language];
            const firstName = form.elements['first-name'].value.trim();
            const lastName = form.elements['last-name'].value.trim();
            const email = form.elements.email.value.trim();
            const message = form.elements.message.value.trim();

            // Honeypot: låtsas lyckas för bottar utan att skicka något till HubSpot.
            if (form.elements._honey.value) {
                form.reset();
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = copy.sending;
            submitButton.setAttribute('aria-busy', 'true');
            status.hidden = true;
            status.className = 'form-status';

            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            try {
                const response = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(buildPayload({ firstName, lastName, email, message })),
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error(`HubSpot svarade med status ${response.status}`);
                }

                form.reset();
                status.textContent = copy.success;
                status.classList.add('form-status--success');
            } catch (error) {
                console.error('Kontaktformuläret kunde inte skickas:', error);
                status.textContent = copy.error;
                status.classList.add('form-status--error');
            } finally {
                window.clearTimeout(timeout);
                status.hidden = false;
                submitButton.disabled = false;
                submitButton.textContent = copy.button;
                submitButton.removeAttribute('aria-busy');
            }
        });
    });
})();
