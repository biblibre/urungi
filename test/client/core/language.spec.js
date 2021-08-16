require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/language');

describe('language', () => {
    beforeEach(angular.mock.module('app.core'));

    let $httpBackend;
    let language;
    let gettextCatalog;
    let moment;

    beforeEach(inject((_$httpBackend_, _language_, _gettextCatalog_, _moment_) => {
        $httpBackend = _$httpBackend_;
        language = _language_;
        gettextCatalog = _gettextCatalog_;
        moment = _moment_;
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('getAvailableLanguages', () => {
        it('should return all languages', () => {
            const languages = language.getAvailableLanguages();

            expect(languages).toEqual(['en', 'es', 'fr']);
        });
    });

    describe('setCurrentLanguage', () => {
        beforeEach(() => {
            $httpBackend.expect('GET', '/translations/fr.json')
                .respond({ fr: { foo: 'bar' } });
        });

        it('should load remote translation file', () => {
            language.setCurrentLanguage('fr');

            $httpBackend.flush();

            expect(gettextCatalog.getString('foo')).toBe('bar');
        });

        it('should set localStorage item currentLanguage if option given', () => {
            language.setCurrentLanguage('fr', { save: true });

            $httpBackend.flush();

            expect(localStorage.getItem('currentLanguage')).toBe('fr');
        });

        it('should set moment locale', () => {
            language.setCurrentLanguage('fr');

            $httpBackend.flush();

            expect(moment.locale()).toBe('fr');
        });
    });

    describe('getCurrentLanguage', () => {
        it('should return current language', () => {
            expect(language.getCurrentLanguage()).toBe('en');

            $httpBackend.expect('GET', '/translations/fr.json')
                .respond({ fr: { foo: 'bar' } });
            language.setCurrentLanguage('fr');
            $httpBackend.flush();

            expect(language.getCurrentLanguage()).toBe('fr');
        });
    });

    describe('initLanguage', () => {
        it('should set language from localStorage', () => {
            localStorage.setItem('currentLanguage', 'fr');

            $httpBackend.expect('GET', '/translations/fr.json')
                .respond({ fr: { foo: 'bar' } });
            language.initLanguage();
            $httpBackend.flush();

            expect(language.getCurrentLanguage()).toBe('fr');
        });
    });
});
