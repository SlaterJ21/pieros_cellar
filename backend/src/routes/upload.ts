import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, S3_BUCKET_NAME } from '../utils/s3';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: S3_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, {
                fieldName: file.fieldname,
                uploadedBy: "piero's_cellar_user",
                uploadedAt: new Date().toISOString(),
            });
        },
        key: (req, file, cb) => {
            const fileExtension = file.originalname.split('.').pop();
            const uniqueKey = `wines/${uuidv4()}.${fileExtension}`;
            cb(null, uniqueKey);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
        }
    },
});

const router = express.Router();

router.post('/upload-photo', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = (req.file as any).location;
        const fileKey = (req.file as any).key;

        res.json({
            success: true,
            url: fileUrl,
            key: fileKey,
            size: req.file.size,
            mimetype: req.file.mimetype,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Upload failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;