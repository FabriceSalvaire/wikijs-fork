-- Wikijs Schema for Sqlite

-- Tables

CREATE TABLE `migrations` (
    `id` integer not null primary key autoincrement,
    `name` varchar(255),
    `batch` integer,
    `migration_time` datetime
);

CREATE TABLE sqlite_sequence(name,seq
);

CREATE TABLE `migrations_lock` (
    `index` integer not null primary key autoincrement,
    `is_locked` integer
);

CREATE TABLE `analytics` (
    `key` varchar(255) not null,
    `isEnabled` boolean not null default '0',
    `config` json not null,
     primary key (
    `key`)
);

CREATE TABLE `assets` (
    `id` integer not null primary key autoincrement,
    `filename` varchar(255) not null,
    `hash` varchar(255) not null default '',
    `ext` varchar(255) not null,
    `kind` text check (`kind` in ('binary', 'image')) not null default 'binary',
    `mime` varchar(255) not null default 'application/octet-stream',
    `fileSize` integer,
    `metadata` json,
    `createdAt` varchar(255) not null,
    `updatedAt` varchar(255) not null,
    `folderId` integer,
    `authorId` integer,
     foreign key(`folderId`) references `assetFolders`(`id`),
     foreign key(`authorId`) references `users`(`id`)
);

CREATE TABLE `assetData` (
    `id` integer,
    `data` blob not null,
     primary key (`id`)
);

CREATE TABLE `assetFolders` (
    `id` integer not null primary key autoincrement,
    `name` varchar(255) not null,
    `slug` varchar(255) not null,
    `parentId` integer,
     foreign key(`parentId`) references `assetFolders`(`id`)
);

CREATE TABLE `authentication` (
    `key` varchar(255) not null,
    `isEnabled` boolean not null default '0',
    `config` json not null,
    `selfRegistration` boolean not null default '0',
    `domainWhitelist` json not null,
    `autoEnrollGroups` json not null,
    `order` integer not null default '0',
    `strategyKey` varchar(255) not null default '',
    `displayName` varchar(255) not null default '',
     primary key (`key`)
);

CREATE TABLE `comments` (
    `id` integer not null primary key autoincrement,
    `content` text not null,
    `createdAt` varchar(255) not null,
    `updatedAt` varchar(255) not null,
    `pageId` integer,
    `authorId` integer,
    `render` text not null default '',
    `name` varchar(255) not null default '',
    `email` varchar(255) not null default '',
    `ip` varchar(255) not null default '',
    `replyTo` integer not null default '0',
     foreign key(`pageId`) references `pages`(`id`),
     foreign key(`authorId`) references `users`(`id`)
);

CREATE TABLE `editors` (
    `key` varchar(255) not null,
    `isEnabled` boolean not null default '0',
    `config` json not null,
     primary key (`key`)
);

CREATE TABLE `groups` (
    `id` integer not null primary key autoincrement,
    `name` varchar(255) not null,
    `permissions` json not null,
    `pageRules` json not null,
    `isSystem` boolean not null default '0',
    `createdAt` varchar(255) not null,
    `updatedAt` varchar(255) not null,
    `redirectOnLogin` varchar(255) not null default '/'
);

CREATE TABLE `locales` (
    `code` varchar(5) not null,
    `strings` json,
    `isRTL` boolean not null default '0',
    `name` varchar(255) not null,
    `nativeName` varchar(255) not null,
    `availability` integer not null default '0',
    `createdAt` varchar(255) not null,
    `updatedAt` varchar(255) not null,
     primary key (`code`)
);

CREATE TABLE `loggers` (
    `key` varchar(255) not null,
    `isEnabled` boolean not null default '0',
    `level` varchar(255) not null default 'warn',
    `config` json,
     primary key (`key`)
);

CREATE TABLE `navigation` (
    `key` varchar(255) not null,
    `config` json,
     primary key (`key`)
);

CREATE TABLE `pageHistory` (
    `id` integer not null primary key autoincrement,
    `path` varchar(255) not null,
    `hash` varchar(255) not null,
    `title` varchar(255) not null,
    `description` varchar(255),
    `isPrivate` boolean not null default '0',
    `isPublished` boolean not null default '0',
    `publishStartDate` varchar(255),
    `publishEndDate` varchar(255),
    `content` text,
    `contentType` varchar(255) not null,
    `createdAt` varchar(255) not null,
    `action` varchar(255) default 'updated',
    `pageId` integer,
    `editorKey` varchar(255),
    `localeCode` varchar(5),
    `authorId` integer,
    `versionDate` varchar(255) not null default '',
    `extra` json not null default '{}',
     foreign key(`editorKey`) references `editors`(`key`),
     foreign key(`localeCode`) references `locales`(`code`),
     foreign key(`authorId`) references `users`(`id`)
);

CREATE TABLE `pageLinks` (
    `id` integer not null primary key autoincrement,
    `pageId` integer,
    `path` varchar(255) not null,
    `localeCode` varchar(5) not null,
     foreign key(`pageId`) references `pages`(`id`) on delete CASCADE
);

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

CREATE TABLE `pageTree` (
    `id` integer,
    `path` varchar(255) not null,
    `depth` integer not null,
    `title` varchar(255) not null,
    `isPrivate` boolean not null default '0',
    `isFolder` boolean not null default '0',
    `privateNS` varchar(255),
    `parent` integer,
    `pageId` integer,
    `localeCode` varchar(5),
    `ancestors` json,
     foreign key(`parent`) references `pageTree`(`id`) on delete CASCADE,
     foreign key(`pageId`) references `pages`(`id`) on delete CASCADE,
     foreign key(`localeCode`) references `locales`(`code`),
     primary key (`id`)
);

CREATE TABLE `renderers` (
    `key` varchar(255) not null,
    `isEnabled` boolean not null default '0',
    `config` json,
     primary key (`key`)
);

CREATE TABLE `searchEngines` (
    `key` varchar(255) not null,
    `isEnabled` boolean not null default '0',
    `config` json,
     primary key (`key`)
);

CREATE TABLE `settings` (
    `key` varchar(255) not null,
    `value` json,
    `updatedAt` varchar(255) not null,
     primary key (`key`)
);

CREATE TABLE `storage` (
    `key` varchar(255) not null,
    `isEnabled` boolean not null default '0',
    `mode` varchar(255) not null default 'push',
    `config` json,
    `syncInterval` varchar(255),
    `state` json,
     primary key (`key`)
);

CREATE TABLE `tags` (
    `id` integer not null primary key autoincrement,
    `tag` varchar(255) not null,
    `title` varchar(255),
    `createdAt` varchar(255) not null,
    `updatedAt` varchar(255) not null
);

CREATE UNIQUE INDEX `tags_tag_unique` on `tags` (
    `tag`
);

CREATE TABLE `userKeys` (
    `id` integer not null primary key autoincrement,
    `kind` varchar(255) not null,
    `token` varchar(255) not null,
    `createdAt` varchar(255) not null,
    `validUntil` varchar(255) not null,
    `userId` integer,
     foreign key(`userId`) references `users`(`id`)
);

CREATE TABLE `users` (
    `id` integer not null primary key autoincrement,
    `email` varchar(255) not null,
    `name` varchar(255) not null,
    `providerId` varchar(255),
    `password` varchar(255),
    `tfaIsActive` boolean not null default '0',
    `tfaSecret` varchar(255),
    `jobTitle` varchar(255) default '',
    `location` varchar(255) default '',
    `pictureUrl` varchar(255),
    `timezone` varchar(255) not null default 'America/New_York',
    `isSystem` boolean not null default '0',
    `isActive` boolean not null default '0',
    `isVerified` boolean not null default '0',
    `mustChangePwd` boolean not null default '0',
    `createdAt` varchar(255) not null,
    `updatedAt` varchar(255) not null,
    `providerKey` varchar(255) not null default 'local',
    `localeCode` varchar(5) not null default 'en',
    `defaultEditor` varchar(255) not null default 'markdown',
    `lastLoginAt` varchar(255),
    `dateFormat` varchar(255) not null default '',
    `appearance` varchar(255) not null default '',
     foreign key(`providerKey`) references `authentication`(`key`),
     foreign key(`localeCode`) references `locales`(`code`),
     foreign key(`defaultEditor`) references `editors`(`key`)
);

CREATE TABLE `pageHistoryTags` (
    `id` integer not null primary key autoincrement,
    `pageId` integer,
    `tagId` integer,
     foreign key(`pageId`) references `pageHistory`(`id`) on delete CASCADE,
     foreign key(`tagId`) references `tags`(`id`) on delete CASCADE
);

CREATE TABLE `pageTags` (
    `id` integer not null primary key autoincrement,
    `pageId` integer,
    `tagId` integer,
     foreign key(`pageId`) references `pages`(`id`) on delete CASCADE,
     foreign key(`tagId`) references `tags`(`id`) on delete CASCADE
);

CREATE TABLE `userGroups` (
    `id` integer not null primary key autoincrement,
    `userId` integer,
    `groupId` integer,
     foreign key(`userId`) references `users`(`id`) on delete CASCADE,
     foreign key(`groupId`) references `groups`(`id`) on delete CASCADE
);

CREATE UNIQUE INDEX `users_providerkey_email_unique` on `users` (
    `providerKey`,
    `email`
);

CREATE INDEX `pagelinks_path_localecode_index` on `pageLinks` (
    `path`,
    `localeCode`
);

CREATE TABLE `apiKeys` (
    `id` integer not null primary key autoincrement,
    `name` varchar(255) not null,
    `key` text not null,
    `expiration` varchar(255) not null,
    `isRevoked` boolean not null default '0',
    `createdAt` varchar(255) not null,
    `updatedAt` varchar(255) not null
);

CREATE TABLE `commentProviders` (
    `key` varchar(255) not null,
    `isEnabled` boolean not null default '0',
    `config` json not null,
     primary key (`key`)
);

CREATE TABLE `userAvatars` (
    `id` integer,
    `data` blob not null,
     primary key (`id`)
);

CREATE TABLE `brute` (
    `key` varchar(255),
    `firstRequest` bigint null,
    `lastRequest` bigint null,
    `lifetime` bigint null,
    `count` integer
);

CREATE TABLE `sessions` (
    `sid` varchar(255),
    `sess` json not null,
    `expired` datetime not null,
     primary key (`sid`)
);

-- Indexes

CREATE INDEX `sessions_expired_index` on `sessions` (
    `expired`
);
