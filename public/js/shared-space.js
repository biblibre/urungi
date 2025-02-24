/* global introJs: false */
import api from './api.js';
import { t } from './i18n.js';
import * as notify from './notify.js';
import * as uuid from './uuid.js';

const tree = $('#sharedSpaceArea').jstree({
    plugins: ['wholerow', 'dnd', 'contextmenu'],
    core: {
        check_callback: true,
        data: function (node, cb) {
            api.getSharedSpace()
                .then(({ response, data }) => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch user objects');
                    }
                    return data.items.map(jsTreeNodeFromSharedAreaNode);
                })
                .catch(err => {
                    console.error(err);
                    return false;
                }).then(cb);
        },
        multiple: false,
        themes: {
            dots: false,
        }
    },
    contextmenu: {
        show_at_node: false,
        items: {
            create: {
                label: t('Create sub-folder'),
                icon: 'fa fa-plus',
                action: function (data) {
                    create(data.reference, jsTreeNode('New folder'));
                },
            },
            rename: {
                label: t('Rename folder'),
                icon: 'fa fa-pencil-square-o',
                action: function (data) {
                    tree.jstree(true).edit(data.reference);
                },
            },
            delete: {
                label: t('Delete folder'),
                icon: 'fa fa-trash-o',
                action: function (data) {
                    tree.jstree(true).delete_node(data.reference);
                },
            }
        },
    },
});

if (location.hash === '#intro') {
    showIntro();
}
$('#showIntroButton').on('click', function () {
    showIntro();
});

$('#sharedSpaceNewFolderBtn').on('click', function () {
    create(null, jsTreeNode(t('New folder')));
});

$('#sharedSpaceSaveBtn').on('click', function () {
    const treeObject = tree.jstree(true).get_json();
    const sharedSpace = treeObject.map(sharedAreaNodeFromJsTreeNode);

    return api.setSharedSpace(sharedSpace).then(() => {
        notify.success(t('Shared space saved'));
        tree.jstree(true).refresh();
    });
});

function create (reference, node) {
    const tree = $('#sharedSpaceArea').jstree(true);
    tree.create_node(reference, jsTreeNode(t('New folder')), 'last', function (node) {
        tree.edit(node);
    });
}

function jsTreeNodeFromSharedAreaNode (node) {
    const treeNode = jsTreeNode(node.title, node.id);

    if (node.nodes) {
        treeNode.children = node.nodes.map(jsTreeNodeFromSharedAreaNode);
    }

    return treeNode;
}

function jsTreeNode (text, id) {
    return {
        text,
        icon: 'fa fa-folder-open-o',
        state: { opened: true },
        li_attr: { 'data-folder-id': id || uuid.v4() },
    };
}

function sharedAreaNodeFromJsTreeNode (treeNode) {
    const node = {
        id: treeNode.li_attr['data-folder-id'] || uuid.v4(),
        title: treeNode.text,
        nodes: treeNode.children.map(sharedAreaNodeFromJsTreeNode),
    };

    return node;
}

function showIntro () {
    introJs().setOptions({
        nextLabel: t('Next'),
        prevLabel: t('Back'),
        doneLabel: t('Done'),
        steps: [
            {
                title: t('Shared space'),
                intro: '<p><strong>' +
                    t('The shared space is the place where you or your users will publish reports to be available for other users or the hole company.') +
                    '</strong></p><p>' +
                    t('Here you can define the structure in folders of the shared space.') +
                    '</p><p>' +
                    t('Later using roles you can grant or deny access to the different folders of the shared space to users that have the appropriate role to execute or share reports along the shared space.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceArea',
                title: t('Structure area'),
                intro: '<p><strong>' +
                    t('This is the area where you can define the structure for the shared space.') +
                    '</strong></p><p>' +
                    t('Create folders and drag and drop them across to structure it.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceNewFolderBtn',
                title: t('New folder'),
                intro: '<p><strong>' +
                    t('Click here to create a new folder in the root of the shared space.') +
                    '</strong></p><p>' +
                    t('After creating the folder you can drag and drop it across the shared space.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceSaveBtn',
                title: t('Save shared space'),
                intro: '<p>' +
                    t('Once you get the structure you want save it to make it available for your users.') +
                    '</p>',
            },
        ]
    }).start();
}
