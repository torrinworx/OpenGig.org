import fs from "fs/promises";
import path from "path";
import UUID from "destam/UUID.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ensureDir = async (dir) => {
	await fs.mkdir(dir, { recursive: true });
};

export default ({ DB }) => {
	const s3 = new S3Client({
		region: process.env.SPACES_REGION,
		endpoint: process.env.SPACES_ENDPOINT,
		credentials: {
			accessKeyId: process.env.SPACES_KEY,
			secretAccessKey: process.env.SPACES_SECRET,
		},
	});

	return {
		async int({ userId, file, originalName, mimeType, meta = {} }) {
			const isProd = process.env.NODE_ENV === "production";

			let buffer;
			let size;
			let inferredOriginal = originalName;
			let inferredMime = mimeType;

			if (file && (file.buffer || file.stream || file.path)) {
				if (file.buffer) {
					buffer = file.buffer;
				} else if (file.path) {
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

			const fileUUID = UUID()
			const fileId = fileUUID.toHex();
			const fileIdRaw = fileUUID.rawHex()

			const store = await DB("files");

			if (isProd) {
				const bucket = process.env.SPACES_BUCKET;
				if (!bucket) throw new Error("SPACES_BUCKET env var is not set");

				await s3.send(
					new PutObjectCommand({
						Bucket: bucket,
						Key: fileIdRaw,
						Body: buffer,
						ContentType: inferredMime || "application/octet-stream",
						ACL: "public-read",
					})
				);

				store.storage = {
					provider: "spaces",
					bucket,
					fileId,
					endpoint: process.env.SPACES_ENDPOINT,
				};
			} else {
				const filesPath = process.env.FILES_PATH;

				// per your requirement: if not set in dev, don't write
				if (filesPath) {
					await ensureDir(filesPath);
					const absPath = path.resolve(filesPath, fileIdRaw);
					await fs.writeFile(absPath, buffer);

					store.storage = {
						provider: "fs",
						root: filesPath,
						fileId,
						path: absPath,
					};
				} else {
					store.storage = {
						provider: "none",
						reason: "FILES_PATH not set; skipping dev write",
					};
				}
			}

			store.query.fileId = fileId;
			store.query.userId = userUUID.toHex();
			store.query.uploadedAt = Date.now();

			store.fileId = fileId;
			store.userId = userUUID.toHex();
			store.uploadedAt = new Date().toISOString();
			store.originalName = inferredOriginal || null;
			store.mimeType = inferredMime || null;
			store.size = size;
			store.meta = meta;

			await DB.flush(store);
			return fileId;
		},
	};
};