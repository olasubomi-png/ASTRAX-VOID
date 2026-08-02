import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Store uploads on disk next to the API process
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || "";
    const safe = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: {
    // 50 MB — enough for images and most config/zip packs
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    // Allow images and common archive/config types
    const allowed = /\.(jpe?g|png|gif|webp|svg|zip|rar|7z|pdf|txt|json|cfg|ini|xml)$/i;
    if (allowed.test(path.extname(file.originalname)) || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Use images or common archive/config files."));
    }
  },
});

// Public base used to build the URL returned to the browser
function publicBase(req: { protocol: string; get: (h: string) => string | undefined }) {
  // Prefer explicit env (e.g. http://34.201.64.198) so URLs work behind Nginx
  if (process.env.PUBLIC_API_URL) {
    return process.env.PUBLIC_API_URL.replace(/\/$/, "");
  }
  const host = req.get("host") || "localhost:4000";
  return `${req.protocol}://${host}`;
}

/**
 * POST /api/admin/upload
 * multipart field name: "file"
 * Returns: { success, url, key, originalName, size }
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  (req, res, next) => {
    upload.single("file")(req, res, (err: unknown) => {
      if (err) {
        // Multer errors (size, type, etc.)
        const msg =
          err instanceof Error ? err.message : "Upload failed";
        const isMulter =
          err && typeof err === "object" && "code" in err
            ? String((err as { code?: string }).code)
            : "";
        if (isMulter === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            error: "File too large. Maximum size is 50 MB.",
          });
        }
        return res.status(400).json({ success: false, error: msg });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded. Use field name 'file'." });
    }

    // Relative path works on HTTPS frontends via Vercel/nginx rewrite to this host.
    const relative = `/uploads/${req.file.filename}`;
    const base = publicBase(req);
    const absolute = `${base}${relative}`;

    res.status(201).json({
      success: true,
      // Prefer relative so https:// Vercel is not blocked by mixed content (http images)
      url: relative,
      absoluteUrl: absolute,
      key: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  }
);

export { router as uploadRoutes, UPLOAD_DIR };
