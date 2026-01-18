import fs from "fs/promises";
import path from "path";
import UUID from "destam/UUID.js";

const ensureDir = async (dir) => {
	await fs.mkdir(dir, { recursive: true });
}

/**
 * Generic file storage helper.
 *
 * @param {object} deps
 * @param {Function} deps.DB destam-db instance
 */
export default ({ DB }) => {
	return {
		/**
		 * Add a file to db and persist to FILES_PATH.
		 *
		 * @param {object} params
		 * @param {string|object} params.userId user uuid (string "#...." or UUID instance)
		 * @param {Buffer|Uint8Array|object} params.file file bytes OR multer file object
		 * @param {string} [params.originalName]
		 * @param {string} [params.mimeType]
		 * @param {object} [params.meta] any extra metadata you want saved
		 *
		 * @returns {Promise<object>} { ok, fileId, path, store }
		 */
		async int({
			userId,
			file,
			originalName,
			mimeType,
			meta = {},
		}) {
			const filesPath = process.env.FILES_PATH;
			if (!filesPath) throw new Error("FILES_PATH env var is not set");

			// Accept either a multer-style file object, or raw bytes.
			let buffer;
			let size;
			let inferredOriginal = originalName;
			let inferredMime = mimeType;

			if (file && (file.buffer || file.stream || file.path)) {
				// Multer memoryStorage gives buffer.
				if (file.buffer) {
					buffer = file.buffer;
				} else if (file.path) {
					// If someone passed diskStorage result anyway, load it.
					buffer = await fs.readFile(file.path);
				} else {
					throw new Error("Unsupported file input: stream not handled (pass a Buffer)");
				}

				size = file.size ?? buffer.byteLength;
				inferredOriginal ??= file.originalname;
				inferredMime ??= file.mimetype;
			} else {
				buffer = file;
				size = buffer?.byteLength;
			}

			if (!buffer || typeof size !== "number") {
				throw new Error("No file data provided (expected Buffer/Uint8Array or multer file object)");
			}

			const userUUID = UUID(userId);
			const fileUUID = UUID(); // built-in lightweight uuid
			const fileId = fileUUID.toHex();

			await ensureDir(filesPath);

			const fileName = fileUUID.rawHex()
			const absPath = path.resolve(filesPath, fileName);

			// Write file to disk
			await fs.writeFile(absPath, buffer);

			// Create db document
			// Table name: "files" (change if your project uses a different convention)
			const store = await DB("files");

			// Query fields (important: user + file id searchable)
			store.query.fileId = fileId;
			store.query.userId = userUUID.toHex();
			store.query.uploadedAt = Date.now(); // useful for simple exact-match queries if needed

			// Metadata stored in the main store (not query-optimized)
			store.fileId = fileId;
			store.userId = userUUID.toHex();
			store.uploadedAt = new Date().toISOString();

			store.originalName = inferredOriginal || null;
			store.mimeType = inferredMime || null;
			store.size = size;

			store.storage = {
				provider: "fs",
				root: filesPath,
				fileName,
				path: absPath,
			};

			// optional extra metadata (keep it JSONy)
			store.meta = meta;

			// Persist db doc
			await DB.flush(store);

			return fileId
		},
	};
};
