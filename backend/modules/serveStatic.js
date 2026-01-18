import path from "path";
import express from "express";

export const deps = [];

export default ({ serverProps }) => {
	const app = serverProps.app;

	const filesPath = process.env.FILES_PATH;
	if (!filesPath) {
		throw new Error('Missing env var "FILES_PATH"');
	}

	app.use(
		"/files",
		express.static(path.resolve(filesPath), {
			fallthrough: false,
			index: false,
		})
	);

	// optional: nicer 404 for missing files
	app.use("/files", (req, res) => {
		res.status(404).json({ ok: false, error: "File not found" });
	});
};
