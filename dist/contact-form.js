(() => {
    const HUBSPOT_PORTAL_ID = '149587357';
    const HUBSPOT_FORM_ID = '4049832f-829a-4fed-b3b2-64427f166c7f';
    const ENDPOINT = `https://forms-eu1.hsforms.com/submissions/v3/public/submit/formsnext/multipart/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

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

    const addHiddenField = (form, name, value) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.querySelector('#contact-form');
        if (!form) return;

        const submitButton = form.querySelector('.submit-button');
        const status = form.querySelector('.form-status');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;

            const language = document.documentElement.lang === 'en' ? 'en' : 'sv';
            const copy = messages[language];
            const firstName = form.elements['first-name'].value.trim();
            const lastName = form.elements['last-name'].value.trim();
            const email = form.elements.email.value.trim();
            const message = form.elements.message.value.trim();
            const honey = form.elements._honey.value;

            // Stoppa bottar utan att skicka något till HubSpot.
            if (honey) {
                form.reset();
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = copy.sending;
            status.hidden = true;
            status.className = 'form-status';

            const frameName = `hubspot_submission_${Date.now()}`;
            const iframe = document.createElement('iframe');
            iframe.name = frameName;
            iframe.title = 'HubSpot submission';
            iframe.hidden = true;

            const hubspotForm = document.createElement('form');
            hubspotForm.method = 'POST';
            hubspotForm.action = ENDPOINT;
            hubspotForm.enctype = 'multipart/form-data';
            hubspotForm.target = frameName;
            hubspotForm.hidden = true;

            addHiddenField(hubspotForm, '0-1/firstname', firstName);
            addHiddenField(hubspotForm, '0-1/lastname', lastName);
            addHiddenField(hubspotForm, '0-1/email', email);
            addHiddenField(hubspotForm, '0-1/message', message);
            addHiddenField(hubspotForm, 'hs_context', JSON.stringify({
                pageUrl: window.location.href,
                pageName: document.title
            }));

            let submitted = false;
            const finish = (success) => {
                if (submitted) return;
                submitted = true;

                if (success) {
                    form.reset();
                    status.textContent = copy.success;
                    status.classList.add('form-status--success');
                } else {
                    status.textContent = copy.error;
                    status.classList.add('form-status--error');
                }

                status.hidden = false;
                submitButton.disabled = false;
                submitButton.textContent = copy.button;
                window.setTimeout(() => {
                    hubspotForm.remove();
                    iframe.remove();
                }, 1000);
            };

            iframe.addEventListener('load', () => {
                iframe.addEventListener('load', () => finish(true), { once: true });

                try {
                    hubspotForm.submit();
                    window.setTimeout(() => finish(false), 15000);
                } catch {
                    finish(false);
                }
            }, { once: true });

            document.body.append(iframe, hubspotForm);
        });
    });
})();
