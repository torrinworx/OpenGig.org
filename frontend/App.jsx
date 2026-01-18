import {
	Head,
	Title,
	Theme,
	Style,
	Icons,
	Stage,
	StageContext,
	Link,
	Meta,
	is_node,
	Script,
	InputContext,
	Observer,
	suspend,
	LoadingDots,
	PopupContext,
} from 'destamatic-ui';
import IconifyIcons from "destamatic-ui/components/icons/IconifyIcons/IconifyIcons";

import { syncState } from 'destam-web-core/client';

import fonts from './utils/fonts.js';
import theme from './utils/theme.js';
import JsonLd from './utils/JsonLd.jsx';
import AppContext from './utils/appContext.js';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

import Landing from './pages/Landing.jsx';
import NotFound from './pages/NotFound.jsx';
import Demo from './pages/Demo.jsx';
import Auth from './pages/Auth.jsx';
import Home from './pages/Home.jsx';
import NewGig from './pages/NewGig.jsx';
import Gig from './pages/Gig.jsx';
import User from './pages/User.jsx';

let track;

if (!is_node()) {
	const plausible = await import('@plausible-analytics/tracker');
	plausible.init({
		domain: 'torrin.me',
		endpoint: 'https://stats.torrin.me/api/event',
	});
	track = plausible.track;
};

const HeadTags = () => {
	const siteUrl = 'https://opengig.org';
	const pageTitle = 'OpenGig';
	const description = 'A transparent gig platform. Anyone can hire or work. Pricing and fees are transparent.';
	const imageUrl = `${siteUrl}/branding/OpenGig_Logo_Light_Mode.svg`;

	return <>
		<Title text={pageTitle} />

		<Meta charset="UTF-8" />
		<Meta name="description" content={description} />
		<Meta name="author" content="Torrin Leonard" />
		<Meta name="robots" content="index, follow" />
		<Meta name="geo.placename" content="Waterloo, Ontario, Canada" />
		<Meta name="geo.region" content="CA-ON" />
		<Meta name="theme-color" content="#ffffff" />

		<Meta property="og:title" content={pageTitle} />
		<Meta property="og:description" content={description} />
		<Meta property="og:type" content="website" />
		<Meta property="og:url" content={siteUrl} />
		<Meta property="og:image" content={imageUrl} />
		<Meta property="og:site_name" content="OpenGig" />
		<Meta property="og:locale" content="en_CA" />

		<Meta name="twitter:card" content="summary_large_image" />
		<Meta name="twitter:title" content={pageTitle} />
		<Meta name="twitter:description" content={description} />
		<Meta name="twitter:image" content={imageUrl} />
		<Meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

		<Link rel="canonical" href={siteUrl} />
		<Link rel="icon" href="/favicon.ico" type="image/x-icon" />

		<Style>
			{`
            /* Hide body content while we're "preloading" */
            html.preload body {
                visibility: hidden;
            }

            /* Explicit white background so users just see a blank screen */
            html.preload {
                background: #ffffff;
            }
			${fonts}
            `}
		</Style>

		{is_node() ? <Script type="module" crossorigin src="/index.js" /> : null}
		<JsonLd />

		<Script
			group="plausible-js"
			async
			defer
			src="https://stats.torrin.me/js/pa-IrHVGS0qwb1Sw2RL0UdF8.js"
		/>

		<Script
			group="plausible-inline"
			type="text/javascript"
		>
			{`
                window.plausible = window.plausible || function() {
					(plausible.q = plausible.q || []).push(arguments)
					};
					plausible.init = plausible.init || function (opts) {
						plausible.o = opts || {};
						};
						plausible.init();
			`}
		</Script>
	</>;
};

const appContext = Observer.mutable(null);
if (!is_node()) queueMicrotask(async () => {
	appContext.set(await syncState());
	appContext.get().theme = theme;
});

window.state = appContext;

const authenticate = (Comp) =>
	StageContext.use(stage =>
		AppContext.use(app =>
			suspend(LoadingDots, async (props) => {
				let state = app.get();

				if (!state) {
					state = await syncState();
					state.theme = theme;
					app.set(state);
				}

				// wait until server responds with auth result
				await state.authKnown.defined(v => v === true);

				if (!state.authed.get()) {
					queueMicrotask(() => stage.open({ name: 'auth' }));
					return null;
				}

				// authed, but sync might still be establishing
				if (!state.sync) {
					await state.observer.path('sync').defined(v => v != null);
				}

				return <Comp {...props} />;
			})
		)
	);

const stage = {
	acts: {
		landing: Landing,
		auth: Auth,
		home: authenticate(Home),
		'new-gig': authenticate(NewGig),
		gig: authenticate(Gig),
		user: authenticate(User),
		demo: Demo,
		fallback: NotFound,
	},
	onOpen: () => {
		window.scrollTo(0, 0);
	},
	template: ({ children }) => children,
	ssg: true,
	initial: 'landing',
	urlRouting: true,
	fallback: 'fallback',
	truncateInitial: true,
};

const onClick = (event) => {
	track(event.type, { props: { id: event.id } });
};

const inputs = {
	meta: { scope: 'root' },
	onClick: onClick,
};

const App = () => <AppContext value={appContext}>
	<Theme value={theme}>
		<InputContext value={inputs} >
			<Icons value={[IconifyIcons]} >
				<Head>
					<HeadTags />
					<StageContext value={stage}>
						<PopupContext>
							<div
								theme="primary"
								style={{
									background: '$color_background',
									minHeight: '100dvh',
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<div
									theme="column_fill_center"
									style={{
										gap: 20,
										display: 'flex',
										flexDirection: 'column',
										flex: 1,
									}}
								>
									<Header />
									<Stage />
									<div style={{ marginTop: 'auto' }}>
										<Footer />
									</div>
								</div>
							</div>
						</PopupContext>
					</StageContext>
				</Head>
			</Icons>
		</InputContext>
	</Theme>
</AppContext>;

export default App;
