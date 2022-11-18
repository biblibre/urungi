$(document).ready(function () {
    $('#language-selector a[data-code]').on('click', function (ev) {
        ev.preventDefault();
        document.cookie = 'language=' + this.getAttribute('data-code') + ' ;SameSite=Strict';
        location.reload();
    });

    $('#tree-root').jstree({
        core: {
            data: function (node, cb) {
                fetch('api/user/objects')
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
        }
    }).on('select_node.jstree', function (e, data) {
        const href = data.node.a_attr.href;
        if (href !== '#') {
            document.location.href = href;
        }
    });

    $('#refresh-shared-area-button').on('click', function (ev) {
        ev.preventDefault();
        $('#tree-root').jstree('refresh');
    });

    function jsTreeNodeFromSharedAreaNode (node) {
        const treeNode = {
            text: node.title,
        };

        if (node.nodeType === 'report') {
            treeNode.icon = 'fa fa-bar-chart';
            treeNode.a_attr = { href: 'reports/view/' + node.id };
        } else if (node.nodeType === 'dashboard') {
            treeNode.icon = 'fa fa-dashboard';
            treeNode.a_attr = { href: 'dashboards/view/' + node.id };
        } else {
            treeNode.icon = 'fa fa-folder-open-o';
            treeNode.state = { opened: true };
        }

        if (node.nodes) {
            treeNode.children = node.nodes.map(jsTreeNodeFromSharedAreaNode);
        }

        return treeNode;
    }
});
