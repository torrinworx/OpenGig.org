import { StageContext, suspend, LoadingDots, Typography } from 'destamatic-ui';
import { modReq } from 'destam-web-core/client';

const User = StageContext.use(stage =>
  suspend(LoadingDots, async () => {
    const uuid = stage.observer.path('urlProps').get().id;

    const user = await modReq('users/get', { uuid });

    // your endpoint returns { error: ... } for bad uuid
    // and returns null if user not found
    if (!user || user.error) {
      stage.open({ name: 'fallback' });
      return null;
    }

	// TODO: list all user gigs.
    return <div theme="column_fill_contentContainer" style={{ gap: 10 }}>
          <Typography type="h1" label={user.name} />

        <div theme="divider" />

        <Typography type="h2" label="Profile" />
      </div>;
  })
);

export default User;
