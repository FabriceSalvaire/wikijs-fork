#! /usr/bin/bash

# Fetch locales

ORIGIN='https://graph.requarks.io/'

function fetch() {
    echo "fetch '$1' > '$2'"
    echo waiting 10s... # else server rejects
    sleep 10s
    curl $ORIGIN \
         --compressed \
         -H 'Accept-Encoding: gzip, deflate, br' \
         -H 'Content-Type: application/json' \
         -H 'Accept: application/json' \
         --data-binary "$1" \
        | json_reformat > "$2"

    # -X POST \
    # --data-raw "$query" \
}

query='{"query":"query { localization { locales { code name nativeName isRTL createdAt updatedAt availability }}} "}'
fetch "$query" "locales.json"

# ag --nonumbers code locales.json | sed -e 's/"code": "//;s/",//;s/ *//' | sort
CODES="af am ar as az bg bn bs-ba ca cs da de el en eo es et eu-es fa fi fr ga-ie gu-in he hi-in hr ht-ht hu hy id is-is it ja kk km-kh kn ko lt lv mk-mk ml mn mr nb nl nn or pa pl pt pt-br ro ru si sk sl sr sr-latn sv ta te th tr ug uk ur vi zh zh-tw"

for locale in $CODES ; do
    echo
    echo $locale
    query='{"operationName": null, "variables": {"code": "'
    query+=$locale
    query+='"}, "query": "query ($code: String!) { localization { strings(code: $code) { key value }}}"}'
    echo "$query"
    fetch "$query" "locale-${locale}.json"
done

   # -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0' \
   # -H 'Accept: */*' \
   # -H 'Accept-Language: fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3' \
   # -H 'Accept-Encoding: gzip, deflate, br, zstd' \
   # -H 'Referer: https://graph.requarks.io/' \

   # -H 'Origin: https://graph.requarks.io' \
   # -H 'Connection: keep-alive' \
   # -H 'Sec-Fetch-Dest: empty' \
   # -H 'Sec-Fetch-Mode: cors' \
   # -H 'Sec-Fetch-Site: same-origin' \
   # -H 'Priority: u=0' \
   # -H 'Pragma: no-cache' \
   # -H 'Cache-Control: no-cache' \
   # -H 'TE: trailers' \
