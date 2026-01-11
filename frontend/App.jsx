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
	InputContext,
	Observer,
	suspend,
	LoadingDots,
} from 'destamatic-ui';
import IconifyIcons from "destamatic-ui/components/icons/IconifyIcons/IconifyIcons";

import fonts from './utils/fonts.js';
import theme from './utils/theme.js';
import JsonLd from './utils/JsonLd.jsx';
import Landing from './pages/Landing.jsx';
import NotFound from './pages/NotFound.jsx';
import Demo from './pages/Demo.jsx';
import Auth from './pages/Auth.jsx';
import Home from './pages/Home.jsx';
import AppContext from './utils/appContext.js';

import { syncState } from 'destam-web-core/client';

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
			href="/branding/OpenGig_Icon.png"
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

const appContext = Observer.mutable(false)
window.state = appContext; 

const authenticate = (Comp) =>
	StageContext.use(stage =>
		AppContext.use(app =>
			suspend(LoadingDots, async (props) => {

				const syncExists = !!app.get()?.observer?.path('sync')?.get()
				if (!syncExists) {
					const state = await syncState();
					console.log(state.observer.path('sync').get());
					app.set(state);
				}

				const authed = !!app.get()?.observer?.path('sync')?.get();

				console.log('Authed: ', authed);
				if (!authed) {
					queueMicrotask(() => stage.open({ name: 'auth' }));
					return null;
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
		demo: Demo,
		fallback: NotFound,
	},
	onOpen: ({ }) => {
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

const socialLinks = [
	{
		title: 'LinkedIn',
		icon: 'simpleIcons:linkedin',
		href: 'https://www.linkedin.com/in/torrin-leonard-8343a1154/'
	},
	{
		title: 'Instagram',
		icon: 'simpleIcons:instagram',
		href: 'https://www.instagram.com/torrinleonard/',
	},
	{
		title: 'GitHub',
		icon: 'simpleIcons:github',
		href: 'https://github.com/torrinworx',
	},
	{
		title: 'GitLab',
		icon: 'simpleIcons:gitlab',
		href: 'https://gitlab.com/torrin1',
	},
	{
		title: 'YouTube',
		icon: 'simpleIcons:youtube',
		href: 'https://www.youtube.com/@TorrinZLeonard',
	},
	{
		title: 'Medium',
		icon: 'simpleIcons:medium',
		href: 'https://medium.com/@torrin_1169',
	},
	{
		title: 'dev.to',
		icon: 'simpleIcons:devdotto',
		href: 'https://dev.to/torrin',
	},
	{
		title: 'Hacker News',
		icon: 'simpleIcons:ycombinator',
		href: 'https://news.ycombinator.com/user?id=torrinleonard',
	},
];

const SocialButton = ({ each }) => <Button
	style={{ height: 50, width: 50 }}
	title={each.title}
	type='text'
	icon={<Icon name={each.icon} size={30} />}
	onClick={() => window.open(each.href, '_blank')}
	href={each.href}
/>;

const Footer = StageContext.use(s => () => <div theme='column_fill_center_contentContainer' style={{ gap: 10 }} >
	<div theme='column_center_fill' style={{ gap: 10 }}>
		<div theme='row_wrap_fill_center' style={{ gap: 10 }}>
			<SocialButton each={socialLinks} />
		</div>
	</div>
	<div theme='row_center_fill_wrap_tight'>
		<Typography style={{ textAlign: 'center' }} type='p1' label={`© OpenGig 2024-${new Date().getFullYear()} | Built by `} />
		<Button
			type='link'
			iconPosition='right'
			icon={<Icon name='feather:external-link' />}
			label='Torrin'
			onClick={() => window.open('https://torrin.me', '_blank')}
			href='https://torrin.me'
		/>
		<Typography style={{ textAlign: 'center' }} type='p1' label=' with ' />
		<Button
			type='link'
			iconPosition='right'
			icon={<Icon name='feather:external-link' />}
			label='destamatic-ui'
			onClick={() => window.open('https://github.com/torrinworx/destamatic-ui', '_blank')}
			href='https://github.com/torrinworx/destamatic-ui'
		/>
	</div>
	<div theme='row_fill_center' style={{ gap: 10 }}>
		<Button
			type='text'
			label='Privacy'
		// onMouseDown={() => state.client.openPage = { name: "Privacy" }}
		/>
		<Button
			type='text'
			label='Terms'
		// onMouseDown={() => state.client.openPage = { name: "Terms" }}
		/>
	</div>
</div>);

/*
Logic I need:

any url loaded -> check if cookie, if cookie, attempt initws and syncNetwork
if no cookie, load page/let onOpen direct pages.

*/


const App = () => <AppContext value={appContext}>
	<Theme value={theme}>
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
							<div theme='column_fill_center' style={{ gap: 20, padding: '20px 0' }}>
								<Stage />
								<Footer />
							</div>
						</div>
					</StageContext>
				</Head>
			</Icons>
		</InputContext>
	</Theme>
</AppContext>;

export default App;
