import multer from "multer";
import cookieParser from "cookie-parser";

export const deps = ["addFile"];

/*
TODO: Since this is the public upload endpoint, we should:
- filter file formats available.
- implement moderation for image formats (ping openai moderation endpoint for images) reject if they don't pass.
*/
export default ({ serverProps, addFile, DB }) => {
	const app = serverProps.app;
	app.use(cookieParser());

	const upload = multer({ storage: multer.memoryStorage() });

	app.post("/api/upload", upload.single("file"), async (req, res) => {
		try {
			if (!req.file) return res.status(400).json({ ok: false, error: "No file" });

			const token = req.cookies?.webcore;
			if (!token) return res.status(401).json({ ok: false, error: "Missing session token" });

			// 1) Find the session doc by uuid (token)
			// Since createSession returns session.query.uuid, token should be that uuid.
			const session = await DB("sessions", { uuid: token });
			if (!session) return res.status(401).json({ ok: false, error: "Invalid session" });

			// 2) Validate session
			const now = Date.now();
			if (!session.status) {
				return res.status(401).json({ ok: false, error: "Session disabled" });
			}
			if (typeof session.expires !== "number" || session.expires <= now) {
				return res.status(401).json({ ok: false, error: "Session expired" });
			}

			// 3) Extract user uuid associated with the session
			const user = session.query?.user;
			if (!user) {
				return res.status(401).json({ ok: false, error: "Session has no user" });
			}

			const out = await addFile({
				userId: user,
				file: req.file,
				meta: { ip: req.ip },
			});

			res.json(out);
		} catch (err) {
			console.error("upload error:", err);
			return res.status(500).json({ ok: false, error: "Internal error" });
		}
	});
};