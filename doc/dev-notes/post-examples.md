```
curl
  'http://localhost:3001/finalize' -X POST
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0'
  -H 'Accept: */*'
  -H 'Accept-Language: fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3'
  -H 'Accept-Encoding: gzip, deflate, br, zstd'
  -H 'Referer: http://localhost:3001/'
  -H 'Content-Type: application/json'
  -H 'Origin: http://localhost:3001'
  -H 'Connection: keep-alive'
  -H 'Cookie: WikijsProfileSettings={%22disableEditorSelector%22:true}; jwt=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJmYWJyaWNlLXNhbHZhaXJlQG9yYW5nZS5mciIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwiYXYiOm51bGwsInR6IjoiQW1lcmljYS9OZXdfWW9yayIsImxjIjoiZW4iLCJkZiI6IiIsImFwIjoiIiwicGVybWlzc2lvbnMiOlsibWFuYWdlOnN5c3RlbSJdLCJncm91cHMiOlsxXSwiaWF0IjoxNzQ3MTU2MjM4LCJleHAiOjE3NDcxNTgwMzgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.a5WpZ_bXGuy4ByqwFpJfZTpU_I-MVJqfejLpKb1M7_66cUyxN37TodW7ILYELaFKdoZC0CS3suIasTg2W2UaAc-av2DhSKZmNpzFZj2rrm85CyyTDgC9_U4GB68SNBKoiJXWuU5MMqwMSAsQyrta0v0xesRrIZTRy2k2udOawmDtax2xYHg4mXlfhz2BPI5hKWzI79XWOeDp8OzOVUw5kusGeaeevlaOPtocPcJnuXfDkK5eo_GtS1yEILxw8qNa1yim2yL2WzlP9InW2Z0H4cjBO-0wBaEH7TzsSE046xWTe551liWdzX9IuEJYQJV0GP0JKQFkBuzYZ391MQ3XXw; org.cups.sid=bf3c2d6cf9d3e4535019bf72d1a3ac9e; io=mw3LKXjXMTxkoE1jAAAC; PGADMIN_LANGUAGE=en; __stripe_mid=8339212b-74e9-4ac9-a563-d6d0767fbeb3c50254; _redmine_session=YjlVcWJzdncydk01SFBuZTBRV0Y2Y2Z1eGFPaWdqQTVxeDQ2VzBhUndpNFZBaDJTMDFidTVnRG1WMWdjdFRESERRbTNIQ1Qra210S1VObXBYSWRoOHpKZGJtbHNBZjVBR0VVQ0tFV0N0U09wZUs5bzNZN040VElHSWp0bTFhbEYvZGJXSndTOU04NVI2ZWYreDhCNVBvbGpzRTBPR3hMWm9IVTRWS1dWREJIQzJac0lycXNHTWJMVFh2T0djc1RKLS1mQWswOGpzSFhmRTltNEhYQkRBbTd3PT0%3D--184d6a55605fa1a3a193ce4b0662af1e3aed0b68; frontend_lang=fr_FR; tz=Europe/Paris; _open_project_session=243cef0c9bb8c3305c26de2e197ae630'
  -H 'Sec-Fetch-Dest: empty'
  -H 'Sec-Fetch-Mode: cors'
  -H 'Sec-Fetch-Site: same-origin'
  -H 'Priority: u=4'
  -H 'Pragma: no-cache'
  -H 'Cache-Control: no-cache'
  --data-raw '{"adminEmail":"fabrice-salvaire@orange.f","adminPassword":"wikijs","adminPasswordConfirm":"wikijs","siteUrl":"http://localhost:3001","telemetry":false}'

{"ok":true,"redirectPath":"/","redirectPort":3001}
```

```
curl 'http://localhost:3001/graphql' --compressed -X POST
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0'
  -H 'Accept: */*'
  -H 'Accept-Language: fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3'
  -H 'Accept-Encoding: gzip, deflate, br, zstd'
  -H 'Referer: http://localhost:3001/login'
  -H 'content-type: application/json'
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJmYWJyaWNlLXNhbHZhaXJlQG9yYW5nZS5mciIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwiYXYiOm51bGwsInR6IjoiQW1lcmljYS9OZXdfWW9yayIsImxjIjoiZW4iLCJkZiI6IiIsImFwIjoiIiwicGVybWlzc2lvbnMiOlsibWFuYWdlOnN5c3RlbSJdLCJncm91cHMiOlsxXSwiaWF0IjoxNzQ3MTU2MjM4LCJleHAiOjE3NDcxNTgwMzgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.a5WpZ_bXGuy4ByqwFpJfZTpU_I-MVJqfejLpKb1M7_66cUyxN37TodW7ILYELaFKdoZC0CS3suIasTg2W2UaAc-av2DhSKZmNpzFZj2rrm85CyyTDgC9_U4GB68SNBKoiJXWuU5MMqwMSAsQyrta0v0xesRrIZTRy2k2udOawmDtax2xYHg4mXlfhz2BPI5hKWzI79XWOeDp8OzOVUw5kusGeaeevlaOPtocPcJnuXfDkK5eo_GtS1yEILxw8qNa1yim2yL2WzlP9InW2Z0H4cjBO-0wBaEH7TzsSE046xWTe551liWdzX9IuEJYQJV0GP0JKQFkBuzYZ391MQ3XXw'
  -H 'Origin: http://localhost:3001'
  -H 'Connection: keep-alive'
  -H 'Cookie: WikijsProfileSettings={%22disableEditorSelector%22:true}; jwt=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJmYWJyaWNlLXNhbHZhaXJlQG9yYW5nZS5mciIsIm5hbWUiOiJBZG1pbmlzdHJhdG9yIiwiYXYiOm51bGwsInR6IjoiQW1lcmljYS9OZXdfWW9yayIsImxjIjoiZW4iLCJkZiI6IiIsImFwIjoiIiwicGVybWlzc2lvbnMiOlsibWFuYWdlOnN5c3RlbSJdLCJncm91cHMiOlsxXSwiaWF0IjoxNzQ3MTU2MjM4LCJleHAiOjE3NDcxNTgwMzgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.a5WpZ_bXGuy4ByqwFpJfZTpU_I-MVJqfejLpKb1M7_66cUyxN37TodW7ILYELaFKdoZC0CS3suIasTg2W2UaAc-av2DhSKZmNpzFZj2rrm85CyyTDgC9_U4GB68SNBKoiJXWuU5MMqwMSAsQyrta0v0xesRrIZTRy2k2udOawmDtax2xYHg4mXlfhz2BPI5hKWzI79XWOeDp8OzOVUw5kusGeaeevlaOPtocPcJnuXfDkK5eo_GtS1yEILxw8qNa1yim2yL2WzlP9InW2Z0H4cjBO-0wBaEH7TzsSE046xWTe551liWdzX9IuEJYQJV0GP0JKQFkBuzYZ391MQ3XXw; org.cups.sid=bf3c2d6cf9d3e4535019bf72d1a3ac9e; io=mw3LKXjXMTxkoE1jAAAC; PGADMIN_LANGUAGE=en; __stripe_mid=8339212b-74e9-4ac9-a563-d6d0767fbeb3c50254; _redmine_session=YjlVcWJzdncydk01SFBuZTBRV0Y2Y2Z1eGFPaWdqQTVxeDQ2VzBhUndpNFZBaDJTMDFidTVnRG1WMWdjdFRESERRbTNIQ1Qra210S1VObXBYSWRoOHpKZGJtbHNBZjVBR0VVQ0tFV0N0U09wZUs5bzNZN040VElHSWp0bTFhbEYvZGJXSndTOU04NVI2ZWYreDhCNVBvbGpzRTBPR3hMWm9IVTRWS1dWREJIQzJac0lycXNHTWJMVFh2T0djc1RKLS1mQWswOGpzSFhmRTltNEhYQkRBbTd3PT0%3D--184d6a55605fa1a3a193ce4b0662af1e3aed0b68; frontend_lang=fr_FR; tz=Europe/Paris; _open_project_session=243cef0c9bb8c3305c26de2e197ae630'
  -H 'Sec-Fetch-Dest: empty'
  -H 'Sec-Fetch-Mode: cors'
  -H 'Sec-Fetch-Site: same-origin'
  -H 'Priority: u=4'
  -H 'Pragma: no-cache'
  -H 'Cache-Control: no-cache'
  --data-raw '[{"operationName":null,"variables":{},"extensions":{},"query":"{\n  authentication {\n    activeStrategies(enabledOnly: true) {\n      key\n      strategy {\n        key\n        logo\n        color\n        icon\n        useForm\n        usernameType\n        __typename\n      }\n      displayName\n      order\n      selfRegistration\n      __typename\n    }\n    __typename\n  }\n}\n"}]'


[{"data":{"authentication":{"activeStrategies":[{"key":"local","strategy":{"key":"local","logo":"https://static.requarks.io/logo/wikijs.svg","color":"primary","icon":"<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t width=\"64px\" height=\"64px\" viewBox=\"0 0 64 64\" enable-background=\"new 0 0 64 64\" xml:space=\"preserve\">\n<path d=\"M32,19c13.089,0,27-3.154,27-9S45.089,1,32,1S5,4.154,5,10S18.911,19,32,19z\"/>\n<path d=\"M32,41c13.089,0,27-3.154,27-9V14.436c-1.481,1.493-3.963,2.968-8.022,4.174C45.864,20.128,38.946,21,32,21\n\ts-13.864-0.872-18.978-2.391C8.963,17.403,6.481,15.929,5,14.436V32C5,37.846,18.911,41,32,41z\"/>\n<path d=\"M32,63c13.089,0,27-3.154,27-9V36.436c-1.481,1.493-3.963,2.968-8.022,4.174C45.864,42.128,38.946,43,32,43\n\ts-13.864-0.872-18.978-2.391C8.963,39.403,6.481,37.929,5,36.436V54C5,59.846,18.911,63,32,63z\"/>\n</svg>\n","useForm":true,"usernameType":"email","__typename":"AuthenticationStrategy"},"displayName":"Local","order":0,"selfRegistration":false,"__typename":"AuthenticationActiveStrategy"}],"__typename":"AuthenticationQuery"}}}]

```
