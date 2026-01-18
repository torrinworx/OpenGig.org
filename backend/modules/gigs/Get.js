export default () => {
  return {
    onMsg: async ({ uuid }, __, { DB }) => {
      if (typeof uuid !== 'string' || !uuid.length) {
        return { error: "Invalid uuid." };
      }

      const gig = await DB('gigs', { uuid });
      if (!gig) return { error: "Gig not found." };

      return {
        uuid: gig.query.uuid,
        user: gig.query.user,
        type: gig.type,
        name: gig.name,
        description: gig.description,
        tags: gig.tags,
        image: gig.image,
      };
    }
  };
};
