(function () {
    'use strict';

    const { t, notify, api } = window.Urungi;

    class UserStatusBadgeElement extends HTMLAnchorElement {
        static get observedAttributes () {
            return ['user-status'];
        }

        attributeChangedCallback (name, oldValue, newValue) {
            if (name === 'user-status') {
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
                const newStatus = this.userStatus === 'active' ? 'Not active' : 'active';
                api.updateUser(this.userId, { status: newStatus }).then(({ response, data }) => {
                    if (!response.ok) {
                        throw new Error(t('Failed to change user status'));
                    }

                    notify.success(t('Status updated'));
                    this.userStatus = newStatus;
                }).catch(err => {
                    notify.error(err);
                });
            });
        }

        get userStatus () {
            return this.getAttribute('user-status');
        }

        set userStatus (userStatus) {
            this.setAttribute('user-status', userStatus);
        }

        get userId () {
            return this.getAttribute('user-id');
        }
    }

    window.UserStatusBadgeElement = UserStatusBadgeElement;
    window.customElements.define('app-user-status-badge', UserStatusBadgeElement, { extends: 'a' });
})();
