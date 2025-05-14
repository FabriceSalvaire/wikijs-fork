!!!
La taille pour les téléversements est trop petite. Pour la changer et limiter à 6MB:
sudo micro /etc/nginx/conf.d/client-body-size.conf
Ajouter:
client_max_body_size 6M;

[Installation de ce serveur Wiki | Wiki.js](https://wiki.paris8-ied.net/fr/general/installation)

- [Install Wiki.js with Node.js, PostgreSQL, and Nginx on Ubuntu 20.04 LTS | Vultr Docs](https://docs.vultr.com/install-wiki-js-with-node-js-postgresql-and-nginx-on-ubuntu-20-04-lts)
- [Setting up Wiki.js with Docker Compose and an Nginx Reverse Proxy on Ubuntu 20.04](https://markjames.dev/blog/setting-up-wikijs-nginx-docker-ubuntu)
