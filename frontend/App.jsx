import {
	Typography,
	Button,
	Head,
	Title,
	Theme,
	Style,
	Icons,
	Icon,
	Stage,
	StageContext,
	Link,
	Meta,
	is_node,
	Script,
	InputContext
} from 'destamatic-ui';
import IconifyIcons from "destamatic-ui/components/icons/IconifyIcons/IconifyIcons";

import fonts from './utils/fonts.js';
import theme from './utils/theme.js';
import JsonLd from './utils/JsonLd.jsx';
import Landing from './pages/Landing.jsx';
import NotFound from './pages/NotFound.jsx';
import Demo from './pages/Demo.jsx';

let track;

if (!is_node()) {
	const plausible = await import('@plausible-analytics/tracker');
	plausible.init({
		domain: 'torrin.me',
		endpoint: 'https://stats.torrin.me/api/event',
	});
	track = plausible.track;
}

const HeadTags = () => {
	const siteUrl = 'https://torrin.me';
	const pageTitle = 'Torrin Leonard | Full-Stack Engineer';
	const description =
		'Full-stack software engineer building AI-powered web apps, custom UI frameworks, and the infrastructure they run on.';
	const imageUrl = `${siteUrl}/site-card.png`;

	return <>
		<Title text={pageTitle} />

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
		<Meta property="og:site_name" content="Torrin Leonard" />
		<Meta property="og:locale" content="en_CA" />

		<Meta name="twitter:card" content="summary_large_image" />
		<Meta name="twitter:title" content={pageTitle} />
		<Meta name="twitter:description" content={description} />
		<Meta name="twitter:image" content={imageUrl} />
		<Meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

		<Link rel="canonical" href={siteUrl} />
		<Link
			rel="icon"
			href="/favicon.png"
			sizes="any"
			type="image/png"
		/>

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

const stage = {
	acts: {
		landing: Landing,
		demo: Demo,
		fallback: NotFound,
	},
	onOpen: () => {
		window.scrollTo(0, 0);
	},
	template: ({ children }) => children,
	ssg: true,
	initial: 'demo',
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

const App = () => <Theme value={theme}>
	<InputContext value={inputs} >
		<Icons value={[IconifyIcons]} >
			<Head>
				<HeadTags />
				<StageContext value={stage}>
					<div theme='primary' style={{
						background: '$color_background',
						height: '100%',
						minHeight: '100vh'
					}}>
						<Stage />
					</div>
				</StageContext>
			</Head>
		</Icons>
	</InputContext>
</Theme>;

export default App;
