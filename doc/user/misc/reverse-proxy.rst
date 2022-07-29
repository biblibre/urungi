Using a reverse proxy
=====================

Urungi can work without reverse proxy but it's a good idea to use one to serve
static files (CSS, JS, fonts, ...).

Here is a sample configuration for Nginx:

.. code:: nginx

  upstream urungi {
      server 127.0.0.1:8080;
  }

  server {
      listen 80;
      listen [::]:80;

      server_name urungi.example.com;

      location / {
          root /var/www/urungi/public;
          expires 1d;
          try_files $uri @urungi;
      }

      location @urungi {
          expires off;
          include proxy_params;
          proxy_pass http://urungi;
      }
  }

Or if you want to run urungi in a subdirectory:

.. code:: nginx

  upstream urungi {
      server 127.0.0.1:8080;
  }

  server {
      listen 80;
      listen [::]:80;

      server_name example.com;

      location /urungi {
          root /var/www/urungi/public;
          rewrite ^/urungi/?(.*)$ /$1 break;
          expires 1d;
          try_files $uri @urungi;
      }

      location @urungi {
          expires off;
          include proxy_params;
          proxy_pass http://urungi;
      }
  }

