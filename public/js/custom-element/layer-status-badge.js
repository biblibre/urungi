(function () {
    'use strict';

    const { t, notify, api } = window.Urungi;

    class LayerStatusBadgeElement extends HTMLAnchorElement {
        static get observedAttributes () {
            return ['layer-status'];
        }

        attributeChangedCallback (name, oldValue, newValue) {
            if (name === 'layer-status') {
                if (newValue === 'active') {
                    this.innerText = t('active');
                    this.classList.remove('badge-danger');
                    this.classList.add('badge-success');
                } else {
                    this.innerText = t('not active');
                    this.classList.remove('badge-success');
                    this.classList.add('badge-danger');
                }
            }
        }

        connectedCallback () {
            this.classList.add('badge');
            this.addEventListener('click', () => {
                const newStatus = this.layerStatus === 'active' ? 'Not active' : 'active';
                api.changeLayerStatus(this.layerId, newStatus).then(({ response, data }) => {
                    if (!response.ok) {
                        throw new Error(t('Failed to change layer status'));
                    }

                    notify.success(t('Status updated'));
                    this.layerStatus = newStatus;
                }).catch(err => {
                    notify.error(err);
                });
            });
        }

        get layerStatus () {
            return this.getAttribute('layer-status');
        }

        set layerStatus (layerStatus) {
            this.setAttribute('layer-status', layerStatus);
        }

        get layerId () {
            return this.getAttribute('layer-id');
        }
    }

    window.LayerStatusBadgeElement = LayerStatusBadgeElement;
    window.customElements.define('app-layer-status-badge', LayerStatusBadgeElement, { extends: 'a' });
})();
