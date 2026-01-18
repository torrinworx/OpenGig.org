import { Button, Typography, Icon, Toggle, StageContext } from 'destamatic-ui';

const socialLinks = [
	{
		title: 'LinkedIn',
		icon: 'simpleIcons:linkedin',
		href: 'https://www.linkedin.com/company/opengig-org',
	},
	{
		title: 'GitHub',
		icon: 'simpleIcons:github',
		href: 'https://github.com/torrinworx/OpenGig.org',
	},
	{
		title: 'Discord',
		icon: 'simpleIcons:discord',
		href: 'https://discord.gg/VsZ3gUQCUe',
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
			<Toggle value={window.themeMode} style={{ padding: 10 }} />
		</div>
	</div>
	<div theme='row_center_fill_wrap_tight'>
		<Typography style={{ textAlign: 'center' }} type='p1' label={`© OpenGig 2024-${new Date().getFullYear()} 🇨🇦 | Built by `} />
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

export default Footer;
