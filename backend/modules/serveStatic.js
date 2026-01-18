import path from "path";
import express from "express";

export const deps = [];

export default ({ serverProps }) => {
	// only needed for local dev filesystem serving
	if (process.env.NODE_ENV === "production") return;

	const filesPath = process.env.FILES_PATH;
	if (!filesPath) return; // don't crash dev if not set

	const app = serverProps.app;

	app.use(
		"/files",
		express.static(path.resolve(filesPath), {
			fallthrough: false,
			index: false,
		})
	);

	app.use("/files", (req, res) => {
		res.status(404).json({ ok: false, error: "File not found" });
	});
};