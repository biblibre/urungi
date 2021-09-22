# How to build user documentation

User documentation is built by [Sphinx](https://www.sphinx-doc.org). You need
to install it using [pip](https://pip.pypa.io/en/stable/):

    pip install -r doc/user/requirements.txt

This should install sphinx and the sphinx theme called readthedocs.

Once it is done, you can build the documentation:

    make -C doc/user clean html

Documentation will be generated in doc/user/_build/html
