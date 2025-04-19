rm node_modules
ln -sf /srv/cache/fabrice/node_modules node_modules
# yarn cache clean
yarn install --frozen-lockfile --non-interactive --ignore-optional
./yarn-upgrade.py
npx update-browserslist-db@latest   # reports gyp ERR ..

yarn build
yarn patch-package
node server

# firefox http://localhost:3001/

rm node_modules
ln -sf /srv/cache/fabrice/node_modules-prod node_modules
yarn --frozen-lockfile --non-interactive --ignore-optional --production
yarn patch-package
