import express from 'express'
const router = express.Router()
import lodash from 'lodash'
import multer from 'multer'
import * as path from 'node:path'
import sanitize from 'sanitize-filename'

/* global WIKI */

/**
 * Upload files
 */
router.post('/u', (req, res, next) => {
    multer({
        dest: path.resolve(WIKI.ROOTPATH, WIKI.config.dataPath, 'uploads'),
        limits: {
            fileSize: WIKI.config.uploads.maxFileSize,
            files: WIKI.config.uploads.maxFiles
        }
    }).array('mediaUpload')(req, res, next)
}, async (req, res, next) => {
    if (!lodash.some(req.user.permissions, (pm) => lodash.includes(['write:assets', 'manage:system'], pm))) {
        return res.status(403).json({
            succeeded: false,
            message: 'You are not authorized to upload files.'
        })
    } else if (req.files.length < 1) {
        return res.status(400).json({
            succeeded: false,
            message: 'Missing upload payload.'
        })
    } else if (req.files.length > 1) {
        return res.status(400).json({
            succeeded: false,
            message: 'You cannot upload multiple files within the same request.'
        })
    }
    const fileMeta = lodash.get(req, 'files[0]', false)
    if (!fileMeta) {
        return res.status(500).json({
            succeeded: false,
            message: 'Missing upload file metadata.'
        })
    }

    // Get folder Id
    let folderId = null
    try {
        const folderRaw = lodash.get(req, 'body.mediaUpload', false)
        if (folderRaw) {
            folderId = lodash.get(JSON.parse(folderRaw), 'folderId', null)
            if (folderId === 0)
                folderId = null
        } else {
            throw new Error('Missing File Metadata')
        }
    } catch (err) {
        return res.status(400).json({
            succeeded: false,
            message: 'Missing upload folder metadata.'
        })
    }

    // Build folder hierarchy
    let hierarchy = []
    if (folderId) {
        try {
            hierarchy = await WIKI.models.assetFolders.getHierarchy(folderId)
        } catch (err) {
            return res.status(400).json({
                succeeded: false,
                message: 'Failed to fetch folder hierarchy.'
            })
        }
    }

    // Sanitize filename
    fileMeta.originalname = sanitize(fileMeta.originalname.toLowerCase().replace(/[\s,;#]+/g, '_'))

    // Check if user can upload at path
    const assetPath = folderId
        ? hierarchy.map((h) => h.slug).join('/') + `/${fileMeta.originalname}`
        : fileMeta.originalname
    if (!WIKI.auth.checkAccess(req.user, ['write:assets'], { path: assetPath })) {
        return res.status(403).json({
            succeeded: false,
            message: 'You are not authorized to upload files to this folder.'
        })
    }

    // Process upload file
    await WIKI.models.assets.upload({
        ...fileMeta,
        mode: 'upload',
        folderId: folderId,
        assetPath,
        user: req.user
    })
    res.send('ok')
})

router.get('/u', async (req, res, next) => {
    res.json({
        ok: true
    })
})

export { router }
