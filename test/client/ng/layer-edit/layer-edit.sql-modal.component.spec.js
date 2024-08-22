require('angular-ui-sortable');
require('angular-ui-tree');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.user.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/layer-edit/layer-edit.module.js');
require('../../../../public/js/ng/layer-edit/layer-edit.templates.js');
require('../../../../public/js/ng/layer-edit/layer-edit.service.js');
require('../../../../public/js/ng/layer-edit/layer-edit.sql-modal.component.js');

describe('appLayerEditSqlModal', function () {
    beforeEach(angular.mock.module('app.layer-edit'));

    let $componentController;
    let $httpBackend;

    beforeEach(inject(function (_$componentController_, _$httpBackend_) {
        $componentController = _$componentController_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('LayerEditSqlModalController', function () {
        describe('addSqlToLayer', function () {
            test('with a valid query it should close with the resulting collection', function () {
                const closeSpy = jest.fn();
                const dismissSpy = jest.fn();

                const layer = {
                    datasourceID: 'ds1',
                };

                const bindings = {
                    resolve: {
                        collection: {},
                        layer,
                        mode: 'add',
                        name: 'Sql Collection',
                        sqlQuery: '',
                    },
                    close: closeSpy,
                    dismiss: dismissSpy,
                };
                const vm = $componentController('appLayerEditSqlModal', null, bindings);
                vm.$onInit();

                vm.sqlQuery = 'SELECT a, b FROM t';
                const collection = {
                    collectionLabel: 'Sql Collection',
                    collectionName: 'Sql Collection',
                    isSQL: true,
                    sqlQuery: vm.sqlQuery,
                    elements: [
                        {
                            elementName: 'a',
                            elementLabel: 'a',
                            elementType: 'string',
                        },
                        {
                            elementName: 'b',
                            elementLabel: 'b',
                            elementType: 'number',
                        },
                    ],
                };

                $httpBackend.expect('GET', '/api/datasources/ds1/sql-query-collection?collectionName=Sql+Collection&sqlQuery=SELECT+a,+b+FROM+t').respond(200, JSON.stringify(collection));

                vm.addSqlToLayer();
                $httpBackend.flush();

                expect(closeSpy).toHaveBeenCalledWith({
                    $value: {
                        isSQL: true,
                        sqlQuery: vm.sqlQuery,
                        collectionID: expect.any(String),
                        collectionLabel: collection.collectionLabel,
                        collectionName: collection.collectionName,
                        elements: [
                            {
                                collectionID: expect.any(String),
                                collectionName: collection.collectionName,
                                elementID: expect.any(String),
                                elementLabel: collection.elements[0].elementLabel,
                                elementName: collection.elements[0].elementName,
                                elementType: collection.elements[0].elementType,
                            },
                            {
                                collectionID: expect.any(String),
                                collectionName: collection.collectionName,
                                elementID: expect.any(String),
                                elementLabel: collection.elements[1].elementLabel,
                                elementName: collection.elements[1].elementName,
                                elementType: collection.elements[1].elementType,
                            },
                        ],
                    }
                });
            });
        });

        describe('saveSQLChanges', function () {
            test('with a valid query it should calculate matched, lost and new elements', function () {
                const closeSpy = jest.fn();
                const dismissSpy = jest.fn();

                const layer = {
                    datasourceID: 'ds1',
                };

                const bindings = {
                    resolve: {
                        collection: {
                            collectionID: 'Cabcd',
                            collectionLabel: 'Sql Collection',
                            collectionName: 'Sql Collection',
                            isSQL: true,
                            sqlQuery: 'SELECT a, b FROM t',
                            elements: [
                                {
                                    elementName: 'a',
                                    elementLabel: 'a',
                                    elementType: 'string',
                                },
                                {
                                    elementName: 'b',
                                    elementLabel: 'b',
                                    elementType: 'number',
                                },
                            ],
                        },
                        layer,
                        mode: 'edit',
                        name: 'Sql Collection',
                        sqlQuery: 'SELECT a, b FROM t',
                    },
                    close: closeSpy,
                    dismiss: dismissSpy,
                };
                const vm = $componentController('appLayerEditSqlModal', null, bindings);
                vm.$onInit();

                vm.sqlQuery = 'SELECT a, c FROM t';
                const collection = {
                    collectionLabel: 'Sql Collection',
                    collectionName: 'Sql Collection',
                    isSQL: true,
                    sqlQuery: vm.sqlQuery,
                    elements: [
                        {
                            elementName: 'a',
                            elementLabel: 'a',
                            elementType: 'string',
                        },
                        {
                            elementName: 'c',
                            elementLabel: 'c',
                            elementType: 'number',
                        },
                    ],
                };

                $httpBackend.expect('GET', '/api/datasources/ds1/sql-query-collection?collectionName=Sql+Collection&sqlQuery=SELECT+a,+c+FROM+t').respond(200, JSON.stringify(collection));

                vm.saveSQLChanges();
                $httpBackend.flush();

                expect(vm.matchedElements).toStrictEqual([{
                    elementName: 'a',
                    elementLabel: 'a',
                    elementType: 'string',
                }]);
                expect(vm.lostElements).toStrictEqual([{
                    elementName: 'b',
                    elementLabel: 'b',
                    elementType: 'number',
                }]);
                expect(vm.newElements).toStrictEqual([{
                    collectionID: 'Cabcd',
                    collectionName: collection.collectionName,
                    elementID: expect.any(String),
                    elementName: 'c',
                    elementLabel: 'c',
                    elementType: 'number',
                }]);
                expect(closeSpy).not.toHaveBeenCalled();

                vm.confirmSQLChanges();
                expect(closeSpy).toHaveBeenCalled();
            });
        });
    });
});
