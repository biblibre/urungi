import { t } from './i18n.esm.js';
import { el } from './dom.esm.js';

class Table {
    constructor (options) {
        this.options = options;
        this.page = 1;
        this.order = null;
        this.filters = {};
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

        const hasFilterRow = this.options.columns.some(c => Object.hasOwn(c, 'filter'));
        if (hasFilterRow) {
            this.t.tHead.append(el('tr'));
        }

        for (const column of this.options.columns) {
            const col = el('col');
            if (column.width) {
                col.style.setProperty('width', column.width);
            }
            colgroup.append(col);

            const th = el('th', column.name ?? '');
            if (column.order) {
                const sortButton = el('span.sort-button', el('i.fa.fa-sort'));
                sortButton.addEventListener('click', ev => {
                    if (this.order === column.order) {
                        this.order = `-${column.order}`;
                        sortButton.replaceChildren(el('i.fa.fa-sort-desc'));
                    } else {
                        this.order = column.order;
                        sortButton.replaceChildren(el('i.fa.fa-sort-asc'));
                    }
                    this.t.tHead.querySelectorAll('.sort-button').forEach(e => e.classList.remove('active'));
                    sortButton.classList.add('active');
                    this.draw();
                });
                th.append(' ', sortButton);
            }

            if (column.filter) {
                const filterInput = el('input.form-control.input-sm', { type: 'text' });

                let keydownTimeoutPromise;
                filterInput.addEventListener('input', ev => {
                    clearTimeout(keydownTimeoutPromise);
                    keydownTimeoutPromise = setTimeout(() => {
                        this.filters[column.filter] = filterInput.value;
                        this.draw();
                    }, 250);
                });

                this.t.tHead.rows[1].append(el('th', filterInput));
            } else if (hasFilterRow) {
                this.t.tHead.rows[1].append(el('th'));
            }

            this.t.tHead.rows[0].append(th);
        }

        this.pagination = el('ul.pagination');
        element.append(this.pagination);

        return this.draw();
    }

    async draw () {
        const params = {
            page: this.page,
            filters: this.filters,
        };

        if (this.order) {
            params.sort = this.order;
        }

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

export default Table;
