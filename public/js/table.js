/* global Urungi: false */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Urungi.Table = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const { t, dom: { el } } = Urungi;

    class Table {
        constructor (options) {
            this.options = options;
            this.page = 1;
        }

        render (element) {
            this.element = element;

            const colgroup = el('colgroup');
            this.t = el('table.table.table-striped',
                colgroup,
                el('thead', el('tr')),
                el('tbody')
            );
            element.append(this.t);

            for (const column of this.options.columns) {
                const col = el('col');
                if (column.width) {
                    col.style.setProperty('width', column.width);
                }
                colgroup.append(col);

                this.t.tHead.rows[0].append(el('th', column.name ?? ''));
            }

            this.pagination = el('ul.pagination');
            element.append(this.pagination);

            return this.draw();
        }

        async draw () {
            const params = {
                page: this.page,
            };

            const { data, pages } = await this.options.fetch(params);
            this.pages = pages;

            const trs = [];
            for (const row of data) {
                const tr = el('tr');
                for (const column of this.options.columns) {
                    const td = el('td');
                    td.append(column.render(row));
                    tr.append(td);
                }
                trs.push(tr);
            }

            this.t.tBodies[0].replaceChildren(...trs);

            this.drawPagination();
        }

        drawPagination () {
            const first = el('li', el('a', t('First')));
            const previous = el('li', el('a', t('Previous')));
            if (this.page === 1) {
                first.classList.add('disabled');
                previous.classList.add('disabled');
            } else {
                first.firstChild.addEventListener('click', () => { this.setPage(1); });
                previous.firstChild.addEventListener('click', () => { this.setPage(this.page - 1); });
            }

            const firstPageNumber = Math.max(1, this.page - 4);
            const lastPageNumber = Math.min(this.page + 5, this.pages);

            const pageNumbers = [];
            for (let i = firstPageNumber; i <= lastPageNumber; i++) {
                const pageNumber = el('li', el('a', i));
                if (i === this.page) {
                    pageNumber.classList.add('active');
                } else {
                    pageNumber.firstChild.addEventListener('click', () => { this.setPage(i); });
                }
                pageNumbers.push(pageNumber);
            }

            const next = el('li', el('a', t('Next')));
            const last = el('li', el('a', t('Last')));
            if (this.page === this.pages) {
                next.classList.add('disabled');
                last.classList.add('disabled');
            } else {
                next.firstChild.addEventListener('click', () => { this.setPage(this.page + 1); });
                last.firstChild.addEventListener('click', () => { this.setPage(this.pages); });
            }

            this.pagination.replaceChildren(first, previous, ...pageNumbers, next, last);
        }

        setPage (page) {
            this.page = Math.max(1, Math.min(this.pages, page));
            return this.draw();
        }
    }

    return Table;
}));
