-- Pages

CREATE TABLE `pages` (
    `id` integer not null primary key autoincrement,
    `path` varchar(255) not null,
    `hash` varchar(255) not null,
    `title` varchar(255) not null,
    `description` varchar(255),
    `isPrivate` boolean not null default '0',
    `isPublished` boolean not null default '0',
    `privateNS` varchar(255),
    `publishStartDate` varchar(255),
    `publishEndDate` varchar(255),
    `content` text,
    `render` text,
    `toc` json,
    `contentType` varchar(255) not null,
    `createdAt` varchar(255) not null,
    `updatedAt` varchar(255) not null,
    `editorKey` varchar(255),
    `localeCode` varchar(5),
    `authorId` integer,
    `creatorId` integer,
    `extra` json not null default '{}',
     foreign key(`editorKey`) references `editors`(`key`),
     foreign key(`localeCode`) references `locales`(`code`),
     foreign key(`authorId`) references `users`(`id`),
     foreign key(`creatorId`) references `users`(`id`)
);

INSERT INTO pages VALUES(
    1,
    'home',
    'b29b5d2ce62e55412776ab98f05631e0aa96597b',
    'Home',
    '',
    0,
    1,
    NULL,
    '',
    '',
    'Content for home',
    replace('<p>Content for home</p>\n', '\n', char(10)),
    '[]',
    'markdown',
    '2025-04-20T23:13:09.405Z',
    '2025-04-20T23:13:12.505Z',
    'markdown',
    'en',
    1,
    1,
    '{"js":"",
    "css":""}'
);
INSERT INTO pages VALUES(
    2,
    'dir1/dir11/page1',
    '1bd5d909d13e334e78d948a693d48a6b21c9a9c1',
    'Page11',
    '',
    0,
    1,
    NULL,
    '',
    '',
    'Content for page11',
    replace('<p>Content for page11</p>\n', '\n', char(10)),
    '[]',
    'markdown',
    '2025-04-20T23:13:57.650Z',
    '2025-04-20T23:14:00.489Z',
    'markdown',
    'en',
    1,
    1,
    '{"js":"",
    "css":""}'
);
INSERT INTO pages VALUES(
    3,
    'dir2/dir21/dir211/page2',
    'a96e4fff7fda4b1cd86d50a94b05b79175071a8f',
    'Page2',
    '',
    0,
    1,
    NULL,
    '',
    '',
    replace('Content for page2\n\n[Page11](/dir1/dir11/page1)\n', '\n', char(10)),
    replace('<p>Content for page2</p>\n<p><a class="is-internal-link is-valid-page" href="/dir1/dir11/page1">Page11</a></p>\n',
    '\n',
    char(10)),
    '[]',
    'markdown',
    '2025-04-20T23:16:21.539Z',
    '2025-04-20T23:16:24.559Z',
    'markdown',
    'en',
    1,
    1,
    '{"js":"",
    "css":""}'
);
INSERT INTO pages VALUES(
    4,
    'dir1',
    '3aa78572b31f3ae1a4243ea2be487b77b08a02e6',
    'Dir1',
    '',
    0,
    1,
    NULL,
    '',
    '',
    'Content for Dir1',
    replace('<p>Content for Dir1</p>\n', '\n', char(10)),
    '[]',
    'markdown',
    '2025-04-20T23:17:08.120Z',
    '2025-04-20T23:17:11.037Z',
    'markdown',
    'en',
    1,
    1,
    '{"js":"",
    "css":""}'
);

---

-- pageLinks and pageTree are cached data

-- page links -> *pages
CREATE TABLE `pageLinks` (
    `id` integer not null primary key autoincrement,
    `pageId` integer, -- page
    `path` varchar(255) not null, -- target
    `localeCode` varchar(5) not null,
     foreign key(`pageId`) references `pages`(`id`) on delete CASCADE
);

INSERT INTO pageLinks VALUES(1, 3, 'dir1/dir11/page1', 'en');


CREATE TABLE `pageTree` (
    `id` integer,
    `path` varchar(255) not null,
    `depth` integer not null, -- a/b = 2
    `title` varchar(255) not null, -- page title else slug
    `isPrivate` boolean not null default '0',
    `isFolder` boolean not null default '0', -- page or folder
    `privateNS` varchar(255),
    `parent` integer, -- -> pageTree.id
    `pageId` integer, -- p> page.id
    `localeCode` varchar(5),
    `ancestors` json, -- [pageTree.id depth 1, ... depth N]
     foreign key(`parent`) references `pageTree`(`id`) on delete CASCADE,
     foreign key(`pageId`) references `pages`(`id`) on delete CASCADE,
     foreign key(`localeCode`) references `locales`(`code`),
     primary key (`id`)
);

INSERT INTO pageTree VALUES(1, 'dir1', 1, 'Dir1', 0, 1, NULL, NULL, 4, 'en', '[]');
INSERT INTO pageTree VALUES(2, 'dir1/dir11', 2, 'dir11', 0, 1, NULL, 1, NULL, 'en', '[1]');
INSERT INTO pageTree VALUES(3, 'dir1/dir11/page1', 3, 'Page11', 0, 0, NULL, 2, 2, 'en', '[1, 2]');
INSERT INTO pageTree VALUES(4, 'dir2', 1, 'dir2', 0, 1, NULL, NULL, NULL, 'en', '[]');
INSERT INTO pageTree VALUES(5, 'dir2/dir21', 2, 'dir21', 0, 1, NULL, 4, NULL, 'en', '[4]');
INSERT INTO pageTree VALUES(6, 'dir2/dir21/dir211', 3, 'dir211', 0, 1, NULL, 5, NULL, 'en', '[4, 5]');
INSERT INTO pageTree VALUES(7, 'dir2/dir21/dir211/page2', 4, 'Page2', 0, 0, NULL, 6, 3, 'en', '[4, 5, 6]');
INSERT INTO pageTree VALUES(8, 'home', 1, 'Home', 0, 0, NULL, NULL, 1, 'en', '[]');

---

INSERT INTO users VALUES(
    1,
    'mail@mail',
    'Administrator',
    NULL,
    '$2a$12$Xw/4cixVCp8kYswKslz/ze14tR9o4su/ySRiLi7FtT74HjpDDiZ1W',
    0,
    NULL,
    '',
    '',
    NULL,
    'America/New_York',
    0,
    1,
    1,
    0,
    '2025-04-20T22:48:16.142Z',
    '2025-04-20T22:48:16.143Z',
    'local',
    'en',
    'markdown',
    '2025-04-20T23:12:40.038Z',
    '',
    ''
);

INSERT INTO sqlite_sequence VALUES('pages', 4);
INSERT INTO sqlite_sequence VALUES('pageLinks', 1);
