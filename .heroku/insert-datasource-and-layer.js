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
                                elementLabel: 'movie_id',
                                elementID: 'acwk',
                                collectionID: 'Cabta',
                                collectionName: 'movie'
                            },
                            {
                                elementName: 'company_id',
                                elementType: 'number',
                                elementLabel: 'company_id',
                                elementID: 'adqt',
                                collectionID: 'Cabta',
                                collectionName: 'movie'
                            },
                            {
                                elementName: 'country_id',
                                elementType: 'number',
                                elementLabel: 'country_id',
                                elementID: 'aekf',
                                collectionID: 'Cabta',
                                collectionName: 'movie'
                            },
                            {
                                elementName: 'release_date',
                                elementType: 'date',
                                elementLabel: 'Release Date',
                                elementID: 'afwi',
                                collectionID: 'Cabta',
                                collectionName: 'movie',
                                elementRole: 'dimension',
                                component: 1
                            },
                            {
                                elementName: 'title',
                                elementType: 'string',
                                elementLabel: 'Movie title',
                                elementID: 'agxk',
                                collectionID: 'Cabta',
                                collectionName: 'movie',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'movie',
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
                                elementLabel: 'company_id',
                                elementID: 'aiuu',
                                collectionID: 'Cahqb',
                                collectionName: 'company'
                            },
                            {
                                elementName: 'name',
                                elementType: 'string',
                                elementLabel: 'Company',
                                elementID: 'ajkq',
                                collectionID: 'Cahqb',
                                collectionName: 'company',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'company',
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
                                elementLabel: 'country_id',
                                elementID: 'almp',
                                collectionID: 'Caktl',
                                collectionName: 'country'
                            },
                            {
                                elementName: 'name',
                                elementType: 'string',
                                elementLabel: 'Movie country',
                                elementID: 'amxh',
                                collectionID: 'Caktl',
                                collectionName: 'country',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'country',
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
                                elementLabel: 'genre_id',
                                elementID: 'aocs',
                                collectionID: 'Canob',
                                collectionName: 'genre'
                            },
                            {
                                elementName: 'name',
                                elementType: 'string',
                                elementLabel: 'Genre',
                                elementID: 'apho',
                                collectionID: 'Canob',
                                collectionName: 'genre',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'genre',
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
                                elementLabel: 'movie_id',
                                elementID: 'arqp',
                                collectionID: 'Caqdo',
                                collectionName: 'movie_actor'
                            },
                            {
                                elementName: 'person_id',
                                elementType: 'number',
                                elementLabel: 'person_id',
                                elementID: 'aspa',
                                collectionID: 'Caqdo',
                                collectionName: 'movie_actor'
                            }
                        ],
                        collectionName: 'movie_actor',
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
                                elementLabel: 'movie_id',
                                elementID: 'aupm',
                                collectionID: 'Catwk',
                                collectionName: 'movie_genre'
                            },
                            {
                                elementName: 'genre_id',
                                elementType: 'number',
                                elementLabel: 'genre_id',
                                elementID: 'avri',
                                collectionID: 'Catwk',
                                collectionName: 'movie_genre'
                            }
                        ],
                        collectionName: 'movie_genre',
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
                                elementLabel: 'person_id',
                                elementID: 'axsg',
                                collectionID: 'Cawrc',
                                collectionName: 'person'
                            },
                            {
                                elementName: 'firstname',
                                elementType: 'string',
                                elementLabel: 'Actor first name',
                                elementID: 'aybn',
                                collectionID: 'Cawrc',
                                collectionName: 'person',
                                elementRole: 'dimension',
                                component: 1
                            },
                            {
                                elementName: 'lastname',
                                elementType: 'string',
                                elementLabel: 'Actor last name',
                                elementID: 'azxd',
                                collectionID: 'Cawrc',
                                collectionName: 'person',
                                elementRole: 'dimension',
                                component: 1
                            },
                            {
                                elementName: 'date_of_birth',
                                elementType: 'date',
                                elementLabel: 'Actor date of birth',
                                elementID: 'bacz',
                                collectionID: 'Cawrc',
                                collectionName: 'person',
                                elementRole: 'dimension',
                                component: 1
                            }
                        ],
                        collectionName: 'person',
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
                    elementLabel: 'Movie title',
                    elementID: 'agxk',
                    collectionID: 'Cabta',
                    collectionName: 'movie',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'release_date',
                    elementType: 'date',
                    elementLabel: 'Release Date',
                    elementID: 'afwi',
                    collectionID: 'Cabta',
                    collectionName: 'movie',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'name',
                    elementType: 'string',
                    elementLabel: 'Movie country',
                    elementID: 'amxh',
                    collectionID: 'Caktl',
                    collectionName: 'country',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'firstname',
                    elementType: 'string',
                    elementLabel: 'Actor first name',
                    elementID: 'aybn',
                    collectionID: 'Cawrc',
                    collectionName: 'person',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'lastname',
                    elementType: 'string',
                    elementLabel: 'Actor last name',
                    elementID: 'azxd',
                    collectionID: 'Cawrc',
                    collectionName: 'person',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'date_of_birth',
                    elementType: 'date',
                    elementLabel: 'Actor date of birth',
                    elementID: 'bacz',
                    collectionID: 'Cawrc',
                    collectionName: 'person',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'name',
                    elementType: 'string',
                    elementLabel: 'Genre',
                    elementID: 'apho',
                    collectionID: 'Canob',
                    collectionName: 'genre',
                    elementRole: 'dimension',
                    component: 1
                },
                {
                    elementName: 'name',
                    elementType: 'string',
                    elementLabel: 'Company',
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
