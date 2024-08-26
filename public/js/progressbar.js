(function () {
    'use strict';

    class Progressbar extends HTMLElement {
        static get observedAttributes () {
            return ['value', 'max'];
        }

        constructor () {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(template.content.cloneNode(true));
        }

        attributeChangedCallback (name, oldValue, newValue) {
            const progressbar = this.shadowRoot.querySelector('.progress-bar');
            if (progressbar) {
                if (name === 'value') {
                    progressbar.setAttribute('aria-valuenow', newValue);
                } else if (name === 'max') {
                    progressbar.setAttribute('aria-valuemax', newValue);
                }
                const progress = this.value * 100 / this.max;
                progressbar.style.setProperty('width', progress + '%');
            }
        }

        connectedCallback () {
            this._upgradeProperty('value');
            this._upgradeProperty('max');
        }

        set value (value) {
            this.setAttribute('value', value);
        }

        get value () {
            return this.getAttribute('value') || 0;
        }

        set max (max) {
            this.setAttribute('max', max);
        }

        get max () {
            return this.getAttribute('max') || 100;
        }

        _upgradeProperty (prop) {
            if (Object.prototype.hasOwnProperty.call(this, prop)) {
                const value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        }
    }

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            .progress {
                display: flex;
                height: 1.5rem;
                overflow: hidden;
                background-color: #e9ecef;
                border-radius: .25rem;
            }
            .progress-bar {
                background-color: #79d2e6;
                transition: width .3s ease-out;
            }
        </style>
        <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuemin="0"></div>
        </div>
    `;

    window.customElements.define('app-progressbar', Progressbar);
})();
