import { StageContext, suspend, LoadingDots, Typography } from 'destamatic-ui';
import { modReq } from 'destam-web-core/client';

import NotFound from '../pages/NotFound.jsx';

const User = StageContext.use(stage =>
  suspend(LoadingDots, async () => {
    const uuid = stage.observer.path('urlProps').get()?.id;

    // IMPORTANT: if you want "my profile", don't send uuid at all
    const user = await modReq('users/get', uuid ? { uuid } : undefined);

    // public profile lookup: null or error => not found
    if (uuid) {
      if (!user || user.error) return <NotFound />;
    } else {
      // my profile: session/auth issues come back as { error: ... }
      if (!user) return <NotFound />; // shouldn't happen often, but safe
      if (user.error) {
        stage.open({ name: 'auth' }); // or return <NotFound />
        return null;
      }
    }

    return <div theme="column_fill_contentContainer" style={{ gap: 10 }}>
      <Typography type="h1" label={user.name} />

      <div theme="divider" />

      <Typography type="h2" label="Profile" />
    </div>;
  })
);

export default User;