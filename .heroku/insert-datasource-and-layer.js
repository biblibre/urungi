const config = require('config');
const mongoose = require('mongoose');

(async function () {
    const db = config.get('db');
    await mongoose.connect(db, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    });
    const Datasource = require('../server/models/datasource');
    let datasource = await Datasource.findOne({ name: 'Heroku PostgreSQL' });
    if (!datasource) {
        const re = new RegExp('^postgres://(.*):(.*)@(.*):(.*)/(.*)$');
        const found = process.env.DATABASE_URL.match(re);
        const [, user, password, host, port, database] = found;

        datasource = new Datasource({
            companyID: 'COMPID',
            name: 'Heroku PostgreSQL',
            status: 1,
            type: 'POSTGRE',
            nd_trash_deleted: false,
            connection: {
                host: host,
                port: port,
                database: database,
                userName: user,
                password: password,
            },
        });
        datasource = await datasource.save();
    }

    const Layer = require('../server/models/layer');
    let layer = await Layer.findOne({ name: 'Movies' });
    if (!layer) {
        layer = new Layer({
            params: {
                joins: [
                    {
                        joinID: 'Jabin',
                        targetElementID: 'adqt',
                        targetElementName: 'company_id',
                        targetCollectionID: 'Cabta',
                        targetCollectionName: 'movie',
                        sourceElementID: 'aiuu',
                        sourceElementName: 'company_id',
                        sourceCollectionID: 'Cahqb',
                        sourceCollectionName: 'company',
                        joinType: 'default'
                    },
                    {
                        joinID: 'Jacgz',
                        sourceElementID: 'aekf',
                        sourceElementName: 'country_id',
                        sourceCollectionID: 'Cabta',
                        sourceCollectionName: 'movie',
                        targetElementID: 'almp',
                        targetElementName: 'country_id',
                        targetCollectionID: 'Caktl',
                        targetCollectionName: 'country',
                        joinType: 'default'
                    },
                    {
                        joinID: 'Jadoi',
                        sourceElementID: 'acwk',
                        sourceElementName: 'movie_id',
                        sourceCollectionID: 'Cabta',
                        sourceCollectionName: 'movie',
                        targetElementID: 'aupm',
                        targetElementName: 'movie_id',
                        targetCollectionID: 'Catwk',
                        targetCollectionName: 'movie_genre',
                        joinType: 'default'
                    },
                    {
                        joinID: 'Jaeck',
                        targetElementID: 'aocs',
                        targetElementName: 'genre_id',
                        targetCollectionID: 'Canob',
                        targetCollectionName: 'genre',
                        sourceElementID: 'avri',
                        sourceElementName: 'genre_id',
                        sourceCollectionID: 'Catwk',
                        sourceCollectionName: 'movie_genre',
                        joinType: 'default'
                    },
                    {
                        joinID: 'Jafza',
                        targetElementID: 'acwk',
                        targetElementName: 'movie_id',
                        targetCollectionID: 'Cabta',
                        targetCollectionName: 'movie',
                        sourceElementID: 'arqp',
                        sourceElementName: 'movie_id',
                        sourceCollectionID: 'Caqdo',
                        sourceCollectionName: 'movie_actor',
                        joinType: 'default'
                    },
                    {
                        joinID: 'Jagcg',
                        sourceElementID: 'aspa',
                        sourceElementName: 'person_id',
                        sourceCollectionID: 'Caqdo',
                        sourceCollectionName: 'movie_actor',
                        targetElementID: 'axsg',
                        targetElementName: 'person_id',
                        targetCollectionID: 'Cawrc',
                        targetCollectionName: 'person',
                        joinType: 'default'
                    }
                ],
                schema: [
                    {
                        elements: [
                            {
                                elementName: 'movie_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'movie_id',
                                data_type: 'integer',
                                elementID: 'acwk',
                                collectionID: 'Cabta',
                                collectionName: 'movie'
                            },
                            {
                                elementName: 'company_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'company_id',
                                data_type: 'integer',
                                elementID: 'adqt',
                                collectionID: 'Cabta',
                                collectionName: 'movie'
                            },
                            {
                                elementName: 'country_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'country_id',
                                data_type: 'integer',
                                elementID: 'aekf',
                                collectionID: 'Cabta',
                                collectionName: 'movie'
                            },
                            {
                                elementName: 'release_date',
                                elementType: 'date',
                                visible: true,
                                elementLabel: 'Release Date',
                                data_type: 'date',
                                elementID: 'afwi',
                                collectionID: 'Cabta',
                                collectionName: 'movie',
                                elementRole: 'dimension',
                                component: 1
                            },
                            {
                                elementName: 'title',
                                elementType: 'string',
                                visible: true,
                                elementLabel: 'Movie title',
                                data_type: 'character varying',
                                elementID: 'agxk',
                                collectionID: 'Cabta',
                                collectionName: 'movie',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'movie',
                        visible: true,
                        collectionLabel: 'movie',
                        collectionID: 'Cabta',
                        component: 1,
                        left: 590,
                        top: 302
                    },
                    {
                        elements: [
                            {
                                elementName: 'company_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'company_id',
                                data_type: 'integer',
                                elementID: 'aiuu',
                                collectionID: 'Cahqb',
                                collectionName: 'company'
                            },
                            {
                                elementName: 'name',
                                elementType: 'string',
                                visible: true,
                                elementLabel: 'Company',
                                data_type: 'character varying',
                                elementID: 'ajkq',
                                collectionID: 'Cahqb',
                                collectionName: 'company',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'company',
                        visible: true,
                        collectionLabel: 'company',
                        collectionID: 'Cahqb',
                        component: 1,
                        left: 294,
                        top: 399
                    },
                    {
                        elements: [
                            {
                                elementName: 'country_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'country_id',
                                data_type: 'integer',
                                elementID: 'almp',
                                collectionID: 'Caktl',
                                collectionName: 'country'
                            },
                            {
                                elementName: 'name',
                                elementType: 'string',
                                visible: true,
                                elementLabel: 'Movie country',
                                data_type: 'character varying',
                                elementID: 'amxh',
                                collectionID: 'Caktl',
                                collectionName: 'country',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'country',
                        visible: true,
                        collectionLabel: 'country',
                        collectionID: 'Caktl',
                        component: 1,
                        left: 908,
                        top: 403
                    },
                    {
                        elements: [
                            {
                                elementName: 'genre_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'genre_id',
                                data_type: 'integer',
                                elementID: 'aocs',
                                collectionID: 'Canob',
                                collectionName: 'genre'
                            },
                            {
                                elementName: 'name',
                                elementType: 'string',
                                visible: true,
                                elementLabel: 'Genre',
                                data_type: 'character varying',
                                elementID: 'apho',
                                collectionID: 'Canob',
                                collectionName: 'genre',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'genre',
                        visible: true,
                        collectionLabel: 'genre',
                        collectionID: 'Canob',
                        component: 1,
                        left: 54,
                        top: 297
                    },
                    {
                        elements: [
                            {
                                elementName: 'movie_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'movie_id',
                                data_type: 'integer',
                                elementID: 'arqp',
                                collectionID: 'Caqdo',
                                collectionName: 'movie_actor'
                            },
                            {
                                elementName: 'person_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'person_id',
                                data_type: 'integer',
                                elementID: 'aspa',
                                collectionID: 'Caqdo',
                                collectionName: 'movie_actor'
                            }
                        ],
                        collectionName: 'movie_actor',
                        visible: true,
                        collectionLabel: 'movie_actor',
                        collectionID: 'Caqdo',
                        component: 1,
                        left: 904,
                        top: 238
                    },
                    {
                        elements: [
                            {
                                elementName: 'movie_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'movie_id',
                                data_type: 'integer',
                                elementID: 'aupm',
                                collectionID: 'Catwk',
                                collectionName: 'movie_genre'
                            },
                            {
                                elementName: 'genre_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'genre_id',
                                data_type: 'integer',
                                elementID: 'avri',
                                collectionID: 'Catwk',
                                collectionName: 'movie_genre'
                            }
                        ],
                        collectionName: 'movie_genre',
                        visible: true,
                        collectionLabel: 'movie_genre',
                        collectionID: 'Catwk',
                        component: 1,
                        left: 315,
                        top: 277
                    },
                    {
                        elements: [
                            {
                                elementName: 'person_id',
                                elementType: 'number',
                                visible: true,
                                elementLabel: 'person_id',
                                data_type: 'integer',
                                elementID: 'axsg',
                                collectionID: 'Cawrc',
                                collectionName: 'person'
                            },
                            {
                                elementName: 'firstname',
                                elementType: 'string',
                                visible: true,
                                elementLabel: 'Actor first name',
                                data_type: 'character varying',
                                elementID: 'aybn',
                                collectionID: 'Cawrc',
                                collectionName: 'person',
                                elementRole: 'dimension',
                                component: 1
                            },
                            {
                                elementName: 'lastname',
                                elementType: 'string',
                                visible: true,
                                elementLabel: 'Actor last name',
                                data_type: 'character varying',
                                elementID: 'azxd',
                                collectionID: 'Cawrc',
                                collectionName: 'person',
                                elementRole: 'dimension',
                                component: 1
                            },
                            {
                                elementName: 'date_of_birth',
                                elementType: 'date',
                                visible: true,
                                elementLabel: 'Actor date of birth',
                                data_type: 'date',
                                elementID: 'bacz',
                                collectionID: 'Cawrc',
                                collectionName: 'person',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'person',
                        visible: true,
                        collectionLabel: 'person',
                        collectionID: 'Cawrc',
                        component: 1,
                        left: 1212,
                        top: 188
                    }
                ]
            },
            status: 'active',
            name: 'Movies',
            datasourceID: datasource._id,
            companyID: 'COMPID',
            nd_trash_deleted: false,
            objects: [
                {
                    elementName: 'title',
                    elementType: 'string',
                    visible: true,
                    elementLabel: 'Movie title',
                    data_type: 'character varying',
                    elementID: 'agxk',
                    collectionID: 'Cabta',
                    collectionName: 'movie',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'release_date',
                    elementType: 'date',
                    visible: true,
                    elementLabel: 'Release Date',
                    data_type: 'date',
                    elementID: 'afwi',
                    collectionID: 'Cabta',
                    collectionName: 'movie',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'name',
                    elementType: 'string',
                    visible: true,
                    elementLabel: 'Movie country',
                    data_type: 'character varying',
                    elementID: 'amxh',
                    collectionID: 'Caktl',
                    collectionName: 'country',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'firstname',
                    elementType: 'string',
                    visible: true,
                    elementLabel: 'Actor first name',
                    data_type: 'character varying',
                    elementID: 'aybn',
                    collectionID: 'Cawrc',
                    collectionName: 'person',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'lastname',
                    elementType: 'string',
                    visible: true,
                    elementLabel: 'Actor last name',
                    data_type: 'character varying',
                    elementID: 'azxd',
                    collectionID: 'Cawrc',
                    collectionName: 'person',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'date_of_birth',
                    elementType: 'date',
                    visible: true,
                    elementLabel: 'Actor date of birth',
                    data_type: 'date',
                    elementID: 'bacz',
                    collectionID: 'Cawrc',
                    collectionName: 'person',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'name',
                    elementType: 'string',
                    visible: true,
                    elementLabel: 'Genre',
                    data_type: 'character varying',
                    elementID: 'apho',
                    collectionID: 'Canob',
                    collectionName: 'genre',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'name',
                    elementType: 'string',
                    visible: true,
                    elementLabel: 'Company',
                    data_type: 'character varying',
                    elementID: 'ajkq',
                    collectionID: 'Cahqb',
                    collectionName: 'company',
                    elementRole: 'dimension',
                    component: 1
                }
            ],
        });
        await layer.save();
    }

    await mongoose.disconnect();
})();
