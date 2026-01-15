- **Install Packages**
  - start with an empty `node_modules`
    don't use symlink or bind mount...
  - run `yarn install`
  - check `node_modules/extract-files/package.json` is patched
    see `patches/extract-files+9.0.0.patch`
    else build will fail
  - node_modules size is 1946
- **Build client**
  - we can use a bind mount to build !
  - run `yarn build`
    `NODE_OPTIONS=--openssl-legacy-provider webpack --profile --config dev/webpack/webpack.prod.js`
    **OR**
    `/usr/bin/node /srv/cache/fabrice/wikijs-maintain/node_modules/webpack/bin/webpack.js --color=true --verbose --profile --config dev/webpack/webpack.prod.js`
    **OR**
    `inv build.build`
  - check for errors
    ```
    ✖ Client Assets
      Compiled with some errors in 1.02m
    ```
  - check files where copied in `assets`
- run `node server`

---
**webpack build bugs**

```
Browserslist: caniuse-lite is outdated. Please run:
npx browserslist@latest --update-db
Browserslist: caniuse-lite is outdated. Please run next command `yarn upgrade`
```

----
**uc.micro**

- check `dev/webpack/webpack.prod.js` `resolve / alias` is not set for pnpm

```
ERROR in ./node_modules/markdown-it/lib/common/utils.js
Module not found: Error: Can't resolve 'uc.micro' in '/srv/cache/fabrice/wikijs-maintain/node_modules/markdown-it/lib/common'
@ ./node_modules/markdown-it/lib/common/utils.js 300:30-49
  >>> 300:exports.lib.ucmicro         = require('uc.micro');
...
@ ./client/index-app.js
```

---
**ModuleConcatenation**

???

```
[./client/components/admin.vue] ./client/components/admin.vue + 5 modules 39.4 KiB {admin} [depth 2] [built]
[exports: default]
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VApp/VApp.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VChip/VChip.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VDivider/VDivider.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VGrid/VSpacer.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VIcon/VIcon.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VList/VList.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VList/VListGroup.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VList/VListItem.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VList/VListItemAction.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VList/VListItemAvatar.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VList/index.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VMain/VMain.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VNavigationDrawer/VNavigationDrawer.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify/lib/components/VSubheader/VSubheader.js
ModuleConcatenation bailout: Cannot concat with ./client/graph/admin/dashboard/dashboard-query-stats.gql (<- Module is not an ECMAScript module)
ModuleConcatenation bailout: Cannot concat with ./node_modules/lodash/includes.js (<- Module is not an ECMAScript module)
ModuleConcatenation bailout: Cannot concat with ./node_modules/lodash/isArray.js (<- Module is not an ECMAScript module)
ModuleConcatenation bailout: Cannot concat with ./node_modules/lodash/some.js (<- Module is not an ECMAScript module)
ModuleConcatenation bailout: Cannot concat with ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
ModuleConcatenation bailout: Cannot concat with ./node_modules/vue-router/dist/vue-router.common.js (<- Module is not anECMAScript module)
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuetify-loader/lib/runtime/installComponents.js (<- Module is not an ECMAScript module)
ModuleConcatenation bailout: Cannot concat with ./node_modules/vuex-pathify/dist/vuex-pathify.js (<- Module is not an ECMAScript module)
```

---

`yarn install` log
```
yarn install v1.22.22
[1/5] Validating package.json...
[2/5] Resolving packages...
warning Resolution field "graphql@15.3.0" is incompatible with requested version "graphql@^14.0.2"
warning Resolution field "graphql@15.3.0" is incompatible with requested version "graphql@>=0.9.4 <0.11"
warning Resolution field "graphql@15.3.0" is incompatible with requested version "graphql@^0.10.0"
warning Resolution field "graphql@15.3.0" is incompatible with requested version "graphql@^0.10.3"
[3/5] Fetching packages...
[4/5] Linking dependencies...
warning " > graphql-subscriptions@1.1.0" has incorrect peer dependency "graphql@^0.10.5 || ^0.11.3 || ^0.12.0 || ^0.13.0 || ^14.0.0".
warning "apollo-server > graphql-tools > apollo-utilities@1.3.2" has incorrect peer dependency "graphql@^0.11.0 || ^0.12.0 ||^0.13.0 || ^14.0.0".
warning "graphql-rate-limit-directive > graphql-tag@2.10.1" has incorrect peer dependency "graphql@^0.9.0 || ^0.10.0 || ^0.11.0 || ^0.12.0 || ^0.13.0 || ^14.0.0".
warning "graphql-rate-limit-directive > graphql-tools@4.0.7" has incorrect peer dependency "graphql@^0.13.0 || ^14.0.0".
warning "apollo-client > apollo-link@1.2.13" has incorrect peer dependency "graphql@^0.11.3 || ^0.12.3 || ^0.13.0 || ^14.0.0".
warning " > postcss-cssnext@3.1.1" has unmet peer dependency "caniuse-lite@^1.0.30000697".
warning " > pug-loader@2.4.0" has incorrect peer dependency "pug@^2.0.0".
warning " > pug-plain-loader@1.0.0" has incorrect peer dependency "pug@^2.0.0".
[5/5] Building fresh packages...
[-/15] ⠄ waiting...
[-/15] ⡀ waiting...
[-/15] ⡀ waiting...
[-/15] ⡀ waiting...
warning Error running install script for optional dependency: "/srv/cache/fabrice/wikijs-maintain/node_modules/cpu-features: Command failed.
Exit code: 1
Command: node buildcheck.js > buildcheck.gypi && node-gyp rebuild
Arguments:
Directory: /srv/cache/fabrice/wikijs-maintain/node_modules/cpu-features
Output:
gyp info it worked if it ends with ok
gyp info using node-gyp@12.1.0
gyp info using node@22.21.1 | linux | x64
gyp info find Python using Python version 3.13.11 found at \"/usr/bin/python3\"

gyp info spawn /usr/bin/python3
gyp info spawn args [
gyp info spawn args '/home/fabrice/.config/yarn/global/node_modules/node-gyp/gyp/gyp_main.py',
gyp info spawn args 'binding.gyp',
gyp info spawn args '-f',
gyp info spawn args 'make',
gyp info spawn args '-I',
gyp info spawn args '/srv/cache/fabrice/wikijs-maintain/node_modules/cpu-features/build/config.gypi',
gyp info spawn args '-I',
gyp info spawn args '/home/fabrice/.config/yarn/global/node_modules/node-gyp/addon.gypi',
gyp info spawn args '-I',
gyp info spawn args '/home/fabrice/.cache/node-gyp/22.21.1/include/node/common.gypi',
gyp info spawn args '-Dlibrary=shared_library',
gyp info spawn args '-Dvisibility=default',
gyp info spawn args '-Dnode_root_dir=/home/fabrice/.cache/node-gyp/22.21.1',
gyp info spawn args '-Dnode_gyp_dir=/home/fabrice/.config/yarn/global/node_modules/node-gyp',
gyp info spawn args '-Dnode_lib_file=/home/fabrice/.cache/node-gyp/22.21.1/<(target_arch)/node.lib',
gyp info spawn args '-Dmodule_root_dir=/srv/cache/fabrice/wikijs-maintain/node_modules/cpu-features',
gyp info spawn args '-Dnode_engine=v8',
gyp info spawn args '--depth=.',
gyp info spawn args '--no-parallel',
gyp info spawn args '--generator-output',
gyp info spawn args 'build',
gyp info spawn args '-Goutput_dir=.'
gyp info spawn args ]
gyp info spawn make
gyp info spawn args [ 'BUILDTYPE=Release', '-C', 'build' ]
make : on entre dans le répertoire « /srv/cache/fabrice/wikijs-maintain/node_modules/cpu-features/build »
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/impl_aarch64_linux_or_android.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/impl_arm_linux_or_android.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/impl_mips_linux_or_android.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/impl_ppc_linux.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/impl_x86_freebsd.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/impl_x86_linux_or_android.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/impl_x86_macos.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/impl_x86_windows.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/filesystem.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/stack_line_reader.o
CC(target) Release/obj.target/cpu_features/deps/cpu_features/src/string_view.o
rm -f Release/obj.target/deps/cpu_features/cpu_features.a Release/obj.target/deps/cpu_features/cpu_features.a.ar-file-list; mkdir -p `dirname Release/obj.target/deps/cpu_features/cpu_features.a`
ar crs Release/obj.target/deps/cpu_features/cpu_features.a @Release/obj.target/deps/cpu_features/cpu_features.a.ar-file-list
COPY Release/cpu_features.a
CXX(target) Release/obj.target/cpufeatures/src/binding.o
Dans le fichier inclus depuis ../node_modules/nan/nan.h:178,
depuis ../src/binding.cc:3:
../node_modules/nan/nan_callbacks.h:55:23: erreur: « AccessorSignature » n'est pas un membre de « v8 »
55 | typedef v8::Local<v8::AccessorSignature> Sig;
|                       ^~~~~~~~~~~~~~~~~
../node_modules/nan/nan_callbacks.h:55:40: erreur: l'argument 1 du patron est invalide
55 | typedef v8::Local<v8::AccessorSignature> Sig;
|                                        ^
../node_modules/nan/nan.h: In function « void Nan::SetAccessor(v8::Local<v8::ObjectTemplate>, v8::Local<v8::String>, GetterCallback, SetterCallback, v8::Local<v8::Value>, v8::AccessControl, v8::PropertyAttribute, imp::Sig) »:
../node_modules/nan/nan.h:2544:19: erreur: pas de fonction concordante pour l'appel à « v8::ObjectTemplate::SetAccessor(v8::Local<v8::String>&, void (*&)(v8::Local<v8::Name>, const v8::PropertyCallbackInfo<v8::Value>&), void (*&)(v8::Local<v8::Name>,v8::Local<v8::Value>, const v8::PropertyCallbackInfo<void>&), v8::Local<v8::Object>&, v8::AccessControl&, v8::PropertyAttribute&, Nan::imp::Sig&) »
2544 |   tpl->SetAccessor(
|   ~~~~~~~~~~~~~~~~^
2545 |       name
|       ~~~~
2546 |     , getter_
|     ~~~~~~~~~
2547 |     , setter_
|     ~~~~~~~~~
2548 |     , obj
|     ~~~~~
2549 |     , settings
|     ~~~~~~~~~~
2550 |     , attribute
|     ~~~~~~~~~~~
2551 |     , signature);
|     ~~~~~~~~~~~~
../node_modules/nan/nan.h:2544:19: note: il y a 2 candidats
Dans le fichier inclus depuis /home/fabrice/.cache/node-gyp/22.21.1/include/node/v8-function.h:15,
depuis /home/fabrice/.cache/node-gyp/22.21.1/include/node/v8.h:33,
depuis /home/fabrice/.cache/node-gyp/22.21.1/include/node/node.h:74,
depuis ../src/binding.cc:1:
/home/fabrice/.cache/node-gyp/22.21.1/include/node/v8-template.h:1049:8: note: candidat 1 : « void v8::ObjectTemplate::SetAccessor(v8::Local<v8::String>, v8::AccessorGetterCallback, v8::AccessorSetterCallback, v8::Local<v8::Value>, v8::PropertyAttribute, v8::SideEffectType, v8::SideEffectType) »
1049 |   void SetAccessor(
|        ^~~~~~~~~~~
/home/fabrice/.cache/node-gyp/22.21.1/include/node/v8-template.h:1052:61: note: pas de conversion connue pour convertir l'argument 5 depuis « v8::AccessControl » vers « v8::PropertyAttribute »
1052 |       Local<Value> data = Local<Value>(), PropertyAttribute attribute = None,
|                                           ~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~
/home/fabrice/.cache/node-gyp/22.21.1/include/node/v8-template.h:1055:8: note: candidat 2 : « void v8::ObjectTemplate::SetAccessor(v8::Local<v8::Name>, v8::AccessorNameGetterCallback, v8::AccessorNameSetterCallback, v8::Local<v8::Value>, v8::PropertyAttribute, v8::SideEffectType, v8::SideEffectType) »
1055 |   void SetAccessor(
|        ^~~~~~~~~~~
/home/fabrice/.cache/node-gyp/22.21.1/include/node/v8-template.h:1058:61: note: pas de conversion connue pour convertir l'argument 5 depuis « v8::AccessControl » vers « v8::PropertyAttribute »
1058 |       Local<Value> data = Local<Value>(), PropertyAttribute attribute = None,
|                                           ~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~~~~
../src/binding.cc: Au niveau global:
/home/fabrice/.cache/node-gyp/22.21.1/include/node/node.h:1244:7: attention: transtypage entre types de fonctions incompatibles de « void (*)(Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE) » {aka « void (*)(v8::Local<v8::Object>) »} vers « node::addon_register_func » {aka « void (*)(v8::Local<v8::Object>, v8::Local<v8::Value>, void*) »} [-Wcast-function-type]
1244 |       (node::addon_register_func) (regfunc),                          \\\n      |       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/home/fabrice/.cache/node-gyp/22.21.1/include/node/node.h:1278:3: note: dans l'expansion de la macro « NODE_MODULE_X »
1278 |   NODE_MODULE_X(modname, regfunc, NULL, 0)  // NOLINT (readability/null_usage)
|   ^~~~~~~~~~~~~
../src/binding.cc:152:1: note: dans l'expansion de la macro « NODE_MODULE »
152 | NODE_MODULE(cpufeatures, init)
| ^~~~~~~~~~~
Dans le fichier inclus depuis /home/fabrice/.cache/node-gyp/22.21.1/include/node/v8-array-buffer.h:12,
depuis /home/fabrice/.cache/node-gyp/22.21.1/include/node/v8.h:24:
/home/fabrice/.cache/node-gyp/22.21.1/include/node/v8-local-handle.h: In instantiation of « v8::Local<T>::Local(v8::Local<S>)[with S = v8::Data; T = v8::Value] »:
../node_modules/nan/nan_callbacks_12_inl.h:175:41:   required from here
175 |       cbinfo(info, obj->GetInternalField(kDataIndex));
|                    ~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~
/home/fabrice/.cache/node-gyp/22.21.1/include/node/v8-local-handle.h:269:42: erreur: l'assertion statique a échoué : type check
269 |     static_assert(std::is_base_of<T, S>::value, \"type check\");
|                                          ^~~~~
/home/fabrice/.cache/node-gyp/22.21.1/include/node/v8-local-handle.h:269:42: note: « std::integral_constant<bool, false>::value » est évalué à « faux »
make: *** [cpufeatures.target.mk:120: Release/obj.target/cpufeatures/src/binding.o] Error 1
make : on quitte le répertoire « /srv/cache/fabrice/wikijs-maintain/node_modules/cpu-features/build »
gyp ERR! build error
gyp ERR! stack Error: `make` failed with exit code: 2
gyp ERR! stack at ChildProcess.<anonymous> (/home/fabrice/.config/yarn/global/node_modules/node-gyp/lib/build.js:219:23)
gyp ERR! System Linux 6.17.13-200.fc42.x86_64
gyp ERR! command \"/usr/bin/node-22\" \"/home/fabrice/.yarn/bin/node-gyp\" \"rebuild\"
gyp ERR! cwd /srv/cache/fabrice/wikijs-maintain/node_modules/cpu-features
$ patch-package
patch-package 8.0.0
Applying patches...

**ERROR** Failed to apply patch for package extract-files at path

node_modules/extract-files

This error was caused because patch-package cannot apply the following patch file:

patches/extract-files+9.0.0.patch

Try removing node_modules and trying again. If that doesn't work, maybe there was
an accidental change made to the patch file? Try recreating it by manually
editing the appropriate files and running:

patch-package extract-files

If that doesn't work, then it's a bug in patch-package, so please submit a bug
report. Thanks!

https://github.com/ds300/patch-package/issues


---
patch-package finished with 1 error(s).
Done in 174.51s.
```
