export default () => {
	return {
		authenticated: false,
		onMsg: async ({ uuid, uuids }, { DB }) => {
			const toGigInfo = (gig) => ({
				uuid: gig.query.uuid,
				user: gig.query.user,
				type: gig.type,
				name: gig.name,
				description: gig.description,
				tags: gig.tags,
				image: gig.image,
				createdAt: gig.persistent?.createdAt ?? null,
			});

			// Single uuid (backwards compatible)
			if (typeof uuid === 'string' && uuid.length) {
				const gig = await DB('gigs', { uuid });
				if (!gig) return { error: "Gig not found." };
				return toGigInfo(gig);
			}

			// Multiple uuids
			if (Array.isArray(uuids)) {
				const cleaned = uuids.filter(u => typeof u === 'string' && u.length);
				if (cleaned.length === 0) return { error: "Invalid uuids." };

				const gigs = await Promise.all(
					cleaned.map(async (id) => {
						const gig = await DB('gigs', { uuid: id });
						return gig ? toGigInfo(gig) : null;
					})
				);

				return gigs.filter(Boolean);
			}

			return { error: "Invalid uuid." };
		}
	};
};
