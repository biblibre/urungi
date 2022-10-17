/* global introJs: false */
(function () {
    'use strict';

    const { api, i18n, notify, uuid } = window.Urungi;

    $(document).ready(function () {
        const tree = $('#sharedSpaceArea').jstree({
            plugins: ['wholerow', 'dnd', 'contextmenu'],
            core: {
                check_callback: true,
                data: function (node, cb) {
                    api.getSharedSpace()
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to fetch user objects');
                            }
                            return response.json();
                        })
                        .then(data => data.items.map(jsTreeNodeFromSharedAreaNode))
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
                        label: i18n.gettext('Create sub-folder'),
                        icon: 'fa fa-plus',
                        action: function (data) {
                            create(data.reference, jsTreeNode('New folder'));
                        },
                    },
                    rename: {
                        label: i18n.gettext('Rename folder'),
                        icon: 'fa fa-pencil-square-o',
                        action: function (data) {
                            tree.jstree(true).edit(data.reference);
                        },
                    },
                    delete: {
                        label: i18n.gettext('Delete folder'),
                        icon: 'fa fa-trash-o',
                        action: function (data) {
                            tree.jstree(true).delete_node(data.reference);
                        },
                    }
                },
            },
        });

        $('#showIntroButton').on('click', function () {
            showIntro();
        });

        $('#sharedSpaceNewFolderBtn').on('click', function () {
            create(null, jsTreeNode(i18n.gettext('New folder')));
        });

        $('#sharedSpaceSaveBtn').on('click', function () {
            const treeObject = tree.jstree(true).get_json();
            const sharedSpace = treeObject.map(sharedAreaNodeFromJsTreeNode);

            return api.setSharedSpace(sharedSpace).then(() => {
                notify.success(i18n.gettext('Shared space saved'));
                tree.jstree(true).refresh();
            });
        });
    });

    function create (reference, node) {
        const tree = $('#sharedSpaceArea').jstree(true);
        tree.create_node(reference, jsTreeNode(i18n.gettext('New folder')), 'last', function (node) {
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
            nextLabel: i18n.gettext('Next'),
            prevLabel: i18n.gettext('Back'),
            skipLabel: '&times;',
            doneLabel: i18n.gettext('Done'),
            tooltipPosition: 'auto',
            showStepNumbers: false,
            steps: [
                {
                    title: i18n.gettext('Shared space'),
                    intro: '<p><strong>' +
                        i18n.gettext('The shared space is the place where you or your users will publish reports to be available for other users or the hole company.') +
                        '</strong></p><p>' +
                        i18n.gettext('Here you can define the structure in folders of the shared space.') +
                        '</p><p>' +
                        i18n.gettext('Later using roles you can grant or deny access to the different folders of the shared space to users that have the appropriate role to execute or share reports along the shared space.') +
                        '</p>',
                },
                {
                    element: '#sharedSpaceArea',
                    title: i18n.gettext('Structure area'),
                    intro: '<p><strong>' +
                        i18n.gettext('This is the area where you can define the structure for the shared space.') +
                        '</strong></p><p>' +
                        i18n.gettext('Create folders and drag and drop them across to structure it.') +
                        '</p>',
                },
                {
                    element: '#sharedSpaceNewFolderBtn',
                    title: i18n.gettext('New folder'),
                    intro: '<p><strong>' +
                        i18n.gettext('Click here to create a new folder in the root of the shared space.') +
                        '</strong></p><p>' +
                        i18n.gettext('After creating the folder you can drag and drop it across the shared space.') +
                        '</p>',
                },
                {
                    element: '#sharedSpaceSaveBtn',
                    title: i18n.gettext('Save shared space'),
                    intro: '<p>' +
                        i18n.gettext('Once you get the structure you want save it to make it available for your users.') +
                        '</p>',
                },
            ]
        }).start();
    }
})();
