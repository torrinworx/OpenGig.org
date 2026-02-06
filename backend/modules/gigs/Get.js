export default () => {
	return {
		authenticated: false,
		onMsg: async ({ uuid, uuids }, { odb }) => {
			const toGigInfo = gig => {
				return ({
					id: gig.observer.id.toHex(),
					user: gig.user ?? null,
					type: gig.type ?? null,
					name: gig.name ?? null,
					description: gig.description ?? null,
					tags: gig.tags ?? null,
					image: gig.image ?? null,
					createdAt: gig.createdAt ?? null,
					modifiedAt: gig.modifiedAt ?? null,
				})
			};

			const getById = id => odb.findOne({ collection: 'gigs', query: { id } });

			// single
			if (typeof uuid === 'string' && uuid.length) {
				const gig = await getById(uuid);
				if (!gig) return { error: 'Gig not found.' };
				return toGigInfo(gig);
			}

			// many
			if (Array.isArray(uuids)) {
				const ids = uuids.filter(u => typeof u === 'string' && u.length);
				if (!ids.length) return { error: 'Invalid uuids.' };
				const gigs = await Promise.all(ids.map(getById));
				return gigs.filter(Boolean).map(toGigInfo);
			}

			return { error: 'Invalid uuid.' };
		}
	};
};
