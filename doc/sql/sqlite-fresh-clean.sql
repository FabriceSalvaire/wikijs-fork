-- Just after setup

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

INSERT INTO migrations VALUES(1,'2.0.0.js',1,1745189250185);
INSERT INTO migrations VALUES(2,'2.2.3.js',1,1745189250187);
INSERT INTO migrations VALUES(3,'2.2.17.js',1,1745189250189);
INSERT INTO migrations VALUES(4,'2.3.10.js',1,1745189250191);
INSERT INTO migrations VALUES(5,'2.3.14.js',1,1745189250192);
INSERT INTO migrations VALUES(6,'2.3.23.js',1,1745189250193);
INSERT INTO migrations VALUES(7,'2.4.13.js',1,1745189250196);
INSERT INTO migrations VALUES(8,'2.4.36.js',1,1745189250200);
INSERT INTO migrations VALUES(9,'2.4.61.js',1,1745189250202);
INSERT INTO migrations VALUES(10,'2.5.1.js',1,1745189250206);
INSERT INTO migrations VALUES(11,'2.5.12.js',1,1745189250208);
INSERT INTO migrations VALUES(12,'2.5.108.js',1,1745189250209);
INSERT INTO migrations VALUES(13,'2.5.118.js',1,1745189250210);
INSERT INTO migrations VALUES(14,'2.5.122.js',1,1745189250211);
INSERT INTO migrations VALUES(15,'2.5.128.js',1,1745189250211);
INSERT INTO migrations_lock VALUES(1,0);

INSERT INTO analytics VALUES('azureinsights',0,'{"instrumentationKey":""}');
INSERT INTO analytics VALUES('baidutongji',0,'{"propertyTrackingId":""}');
INSERT INTO analytics VALUES('countly',0,'{"appKey":"","serverUrl":""}');
INSERT INTO analytics VALUES('elasticapm',0,'{"serverUrl":"http://apm.example.com:8200","serviceName":"wiki-js","environment":""}');
INSERT INTO analytics VALUES('fathom',0,'{"host":"","siteId":""}');
INSERT INTO analytics VALUES('fullstory',0,'{"org":""}');
INSERT INTO analytics VALUES('google',0,'{"propertyTrackingId":""}');
INSERT INTO analytics VALUES('gtm',0,'{"containerTrackingId":""}');
INSERT INTO analytics VALUES('hotjar',0,'{"siteId":""}');
INSERT INTO analytics VALUES('matomo',0,'{"siteId":1,"serverHost":"https://example.matomo.cloud"}');
INSERT INTO analytics VALUES('newrelic',0,'{"licenseKey":"","appId":"","beacon":"bam.nr-data.net","errorBeacon":"bam.nr-data.net"}');
INSERT INTO analytics VALUES('plausible',0,'{"domain":"","plausibleJsSrc":"https://plausible.io/js/plausible.js"}');
INSERT INTO analytics VALUES('statcounter',0,'{"projectId":"","securityToken":""}');
INSERT INTO analytics VALUES('umami',0,'{"websiteID":"","url":""}');
INSERT INTO analytics VALUES('umami2',0,'{"websiteID":"","url":""}');
INSERT INTO analytics VALUES('yandex',0,'{"tagNumber":""}');

INSERT INTO authentication VALUES('local',1,'{}',0,'{"v":[]}','{"v":[]}',0,'local','Local');

INSERT INTO editors VALUES('api',0,'{}');
INSERT INTO editors VALUES('asciidoc',0,'{}');
INSERT INTO editors VALUES('ckeditor',0,'{}');
INSERT INTO editors VALUES('code',0,'{}');
INSERT INTO editors VALUES('markdown',1,'{}');
INSERT INTO editors VALUES('redirect',0,'{}');
INSERT INTO editors VALUES('wysiwyg',0,'{}');

INSERT INTO "groups" VALUES(1,'Administrators','["manage:system"]','[]',1,'2025-04-20T22:48:15.833Z','2025-04-20T22:48:15.833Z','/');
INSERT INTO "groups" VALUES(2,'Guests','["read:pages","read:assets","read:comments"]','[{"id":"guest","roles":["read:pages","read:assets","read:comments"],"match":"START","deny":false,"path":"","locales":[]}]',1,'2025-04-20T22:48:15.841Z','2025-04-20T22:48:15.841Z','/');
INSERT INTO locales VALUES('en','{"common":{"footer":{"poweredBy":"Powered by","copyright":"© {{year}} {{company}}. All rights reserved.","license":"Content is available under the {{license}}, by {{company}}."},...');

INSERT INTO loggers VALUES('airbrake',0,'warn','{}');
INSERT INTO loggers VALUES('bugsnag',0,'warn','{"key":""}');
INSERT INTO loggers VALUES('disk',0,'info','{}');
INSERT INTO loggers VALUES('eventlog',0,'warn','{}');
INSERT INTO loggers VALUES('loggly',0,'warn','{"token":"","subdomain":""}');
INSERT INTO loggers VALUES('logstash',0,'warn','{}');
INSERT INTO loggers VALUES('newrelic',0,'warn','{}');
INSERT INTO loggers VALUES('papertrail',0,'warn','{"host":"","port":0}');
INSERT INTO loggers VALUES('raygun',0,'warn','{}');
INSERT INTO loggers VALUES('rollbar',0,'warn','{"key":""}');
INSERT INTO loggers VALUES('sentry',0,'warn','{"key":""}');
INSERT INTO loggers VALUES('syslog',0,'warn','{}');

INSERT INTO navigation VALUES('site','[{"locale":"en","items":[{"id":"0a60ce5b-9df8-47d0-90c7-18d098be3f29","icon":"mdi-home","kind":"link","label":"Home","target":"/","targetType":"home","visibilityMode":"all","visibilityGroups":null}]}]');

INSERT INTO renderers VALUES('asciidocCore',1,'{"safeMode":"server"}');
INSERT INTO renderers VALUES('htmlAsciinema',0,'{}');
INSERT INTO renderers VALUES('htmlBlockquotes',1,'{}');
INSERT INTO renderers VALUES('htmlCodehighlighter',1,'{}');
INSERT INTO renderers VALUES('htmlCore',1,'{"absoluteLinks":false,"openExternalLinkNewTab":false,"relAttributeExternalLink":"noreferrer"}');
INSERT INTO renderers VALUES('htmlDiagram',1,'{}');
INSERT INTO renderers VALUES('htmlImagePrefetch',0,'{}');
INSERT INTO renderers VALUES('htmlMediaplayers',1,'{}');
INSERT INTO renderers VALUES('htmlMermaid',1,'{}');
INSERT INTO renderers VALUES('htmlSecurity',1,'{"safeHTML":true,"allowDrawIoUnsafe":true,"allowIFrames":false}');
INSERT INTO renderers VALUES('htmlTabset',1,'{}');
INSERT INTO renderers VALUES('htmlTwemoji',1,'{}');
INSERT INTO renderers VALUES('markdownAbbr',1,'{}');
INSERT INTO renderers VALUES('markdownCore',1,'{"allowHTML":true,"linkify":true,"linebreaks":true,"underline":false,"typographer":false,"quotes":"English"}');
INSERT INTO renderers VALUES('markdownEmoji',1,'{}');
INSERT INTO renderers VALUES('markdownExpandtabs',1,'{"tabWidth":4}');
INSERT INTO renderers VALUES('markdownFootnotes',1,'{}');
INSERT INTO renderers VALUES('markdownImsize',1,'{}');
INSERT INTO renderers VALUES('markdownKatex',1,'{"useInline":true,"useBlocks":true}');
INSERT INTO renderers VALUES('markdownKroki',0,'{"server":"https://kroki.io","openMarker":"```kroki","closeMarker":"```"}');
INSERT INTO renderers VALUES('markdownMathjax',0,'{"useInline":true,"useBlocks":true}');
INSERT INTO renderers VALUES('markdownMultiTable',0,'{"multilineEnabled":true,"headerlessEnabled":true,"rowspanEnabled":true}');
INSERT INTO renderers VALUES('markdownPivotTable',0,'{}');
INSERT INTO renderers VALUES('markdownPlantuml',1,'{"server":"https://plantuml.requarks.io","openMarker":"```plantuml","closeMarker":"```","imageFormat":"svg"}');
INSERT INTO renderers VALUES('markdownSupsub',1,'{"subEnabled":true,"supEnabled":true}');
INSERT INTO renderers VALUES('markdownTasklists',1,'{}');
INSERT INTO renderers VALUES('openapiCore',1,'{}');

INSERT INTO searchEngines VALUES('algolia',0,'{"appId":"","apiKey":"","indexName":"wiki"}');
INSERT INTO searchEngines VALUES('aws',0,'{"domain":"","endpoint":"","region":"us-east-1","accessKeyId":"","secretAccessKey":"","AnalysisSchemeLang":"en"}');
INSERT INTO searchEngines VALUES('azure',0,'{"serviceName":"","adminKey":"","indexName":"wiki"}');
INSERT INTO searchEngines VALUES('db',1,'{}');
INSERT INTO searchEngines VALUES('elasticsearch',0,'{"apiVersion":"7.x","hosts":"","verifyTLSCertificate":true,"tlsCertPath":"","indexName":"wiki","analyzer":"simple","sniffOnStart":false,"sniffInterval":0}');
INSERT INTO searchEngines VALUES('manticore',0,'{}');
INSERT INTO searchEngines VALUES('postgres',0,'{"dictLanguage":"english"}');
INSERT INTO searchEngines VALUES('solr',0,'{"host":"solr","port":8983,"core":"wiki","protocol":"http"}');
INSERT INTO searchEngines VALUES('sphinx',0,'{}');

INSERT INTO settings VALUES('auth','{"audience":"urn:wiki.js","tokenExpiration":"30m","tokenRenewal":"14d"}','2025-04-20T22:48:15.641Z');
INSERT INTO settings VALUES('certs','{"jwk":{"kty":"RSA","n":"1Z...DQ","e":"AQAB"},"public":"-----BEGIN RSA PUBLIC KEY-----\nMI...AB\n-----END RSA PUBLIC KEY-----\n","private":"-----BEGIN RSA PRIVATE KEY-----\nProc-Type: 4,ENCRYPTED\nDEK-Info: AES-256-CBC,15...CQm\n-----END RSA PRIVATE KEY-----\n"}','2025-04-20T22:48:15.662Z');
INSERT INTO settings VALUES('company','{"v":""}','2025-04-20T22:48:15.671Z');
INSERT INTO settings VALUES('features','{"featurePageRatings":true,"featurePageComments":true,"featurePersonalWikis":true}','2025-04-20T22:48:15.680Z');
INSERT INTO settings VALUES('graphEndpoint','{"v":"https://graph.requarks.io"}','2025-04-20T22:48:15.695Z');
INSERT INTO settings VALUES('host','{"v":"https://wiki.yourdomain.com"}','2025-04-20T22:48:15.709Z');
INSERT INTO settings VALUES('lang','{"code":"en","autoUpdate":true,"namespacing":false,"namespaces":[]}','2025-04-20T22:48:15.715Z');
INSERT INTO settings VALUES('logo','{"hasLogo":false,"logoIsSquare":false}','2025-04-20T22:48:15.723Z');
INSERT INTO settings VALUES('mail','{"senderName":"","senderEmail":"","host":"","port":465,"name":"","secure":true,"verifySSL":true,"user":"","pass":"","useDKIM":false,"dkimDomainName":"","dkimKeySelector":"","dkimPrivateKey":""}','2025-04-20T22:48:15.729Z');
INSERT INTO settings VALUES('seo','{"description":"","robots":["index","follow"],"analyticsService":"","analyticsId":""}','2025-04-20T22:48:15.738Z');
INSERT INTO settings VALUES('sessionSecret','{"v":"ef22306f17bf465025c77609e95e462e56dd29cd6af5fcf2b365ba4d068b0375"}','2025-04-20T22:48:15.745Z');
INSERT INTO settings VALUES('telemetry','{"isEnabled":false,"clientId":"a71d4d0d-bf8f-46e4-acee-a4ed2c1cab21"}','2025-04-20T22:48:15.752Z');
INSERT INTO settings VALUES('theming','{"theme":"default","darkMode":false,"iconset":"mdi","injectCSS":"","injectHead":"","injectBody":""}','2025-04-20T22:48:15.759Z');
INSERT INTO settings VALUES('uploads','{"maxFileSize":5242880,"maxFiles":10,"scanSVG":true,"forceDownload":true}','2025-04-20T22:48:15.769Z');
INSERT INTO settings VALUES('title','{"v":"Wiki.js"}','2025-04-20T22:48:15.785Z');

INSERT INTO storage VALUES('azure',0,'push','{"accountName":"","accountKey":"","containerName":"wiki","storageTier":"Cool"}','P0D','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('box',0,'push','{"clientId":"","clientSecret":"","rootFolder":""}','P0D','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('digitalocean',0,'push','{"endpoint":"nyc3.digitaloceanspaces.com","bucket":"","accessKeyId":"","secretAccessKey":""}','P0D','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('disk',0,'push','{"path":"","createDailyBackups":false}','P0D','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('dropbox',0,'push','{"appKey":"","appSecret":""}','P0D','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('gdrive',0,'push','{"clientId":"","clientSecret":""}','P0D','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('git',0,'sync','{"authType":"ssh","repoUrl":"","branch":"master","sshPrivateKeyMode":"path","sshPrivateKeyPath":"","sshPrivateKeyContent":"","verifySSL":true,"basicUsername":"","basicPassword":"","defaultEmail":"name@company.com","defaultName":"John Smith","localRepoPath":"./data/repo","alwaysNamespace":false,"gitBinaryPath":""}','PT5M','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('onedrive',0,'push','{"clientId":"","clientSecret":""}','P0D','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('s3',0,'push','{"region":"","bucket":"","accessKeyId":"","secretAccessKey":""}','P0D','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('s3generic',0,'push','{"endpoint":"https://service.region.example.com","bucket":"","accessKeyId":"","secretAccessKey":"","sslEnabled":true,"s3ForcePathStyle":false,"s3BucketEndpoint":false}','P0D','{"status":"pending","message":"","lastAttempt":null}');
INSERT INTO storage VALUES('sftp',0,'push','{"host":"","port":22,"authMode":"privateKey","username":"","privateKey":"","passphrase":"","password":"","basePath":"/root/wiki"}','P0D','{"status":"pending","message":"","lastAttempt":null}');

INSERT INTO users VALUES(1,'mail@mail.com','Administrator',NULL,'$2a$12$Xw/4cixVCp8kYswKslz/ze14tR9o4su/ySRiLi7FtT74HjpDDiZ1W',0,NULL,'','',NULL,'America/New_York',0,1,1,0,'2025-04-20T22:48:16.142Z','2025-04-20T22:48:16.143Z','local','en','markdown','2025-04-20T22:52:21.729Z','','');
INSERT INTO users VALUES(2,'guest@example.com','Guest',NULL,'',0,NULL,'','',NULL,'America/New_York',1,1,1,0,'2025-04-20T22:48:16.625Z','2025-04-20T22:48:16.625Z','local','en','markdown',NULL,'','');

INSERT INTO userGroups VALUES(1,1,1);
INSERT INTO userGroups VALUES(2,2,2);

INSERT INTO commentProviders VALUES('artalk',0,'{"server":"","siteName":""}');
INSERT INTO commentProviders VALUES('commento',0,'{"instanceUrl":"https://cdn.commento.io"}');
INSERT INTO commentProviders VALUES('default',1,'{"akismet":"","minDelay":30}');
INSERT INTO commentProviders VALUES('disqus',0,'{"accountName":""}');

DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('migrations_lock',1);
INSERT INTO sqlite_sequence VALUES('migrations',15);
INSERT INTO sqlite_sequence VALUES('groups',2);
INSERT INTO sqlite_sequence VALUES('users',2);
INSERT INTO sqlite_sequence VALUES('userGroups',2);

COMMIT;
