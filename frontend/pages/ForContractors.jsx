import { Button, Typography, StageContext, Icon } from 'destamatic-ui';
import Paper from '../components/Paper.jsx';

const size = 'clamp(1.45rem, 1.8rem + 1.1vw, 4rem)';
const size2 = 'clamp(1.15rem, 1.05rem + 0.7vw, 1.6rem)';

const ContractorLanding = StageContext.use(s => () => <>
	<div theme='column_fill_contentContainer'>
		{/* HERO */}
		<div theme='column_fill_center' style={{ gap: 22, margin: '80px 0' }}>
			<Typography
				label='Turn messages into booked jobs.'
				type="h1_bold"
				style={{
					textAlign: 'center',
					fontSize: 'clamp(2.4rem, 1.8rem + 2.6vw, 5rem)',
				}}
			/>
			<Typography
				label='OpenGig helps contractors track leads, follow up on time, and share a clean service link customers can use to request a quote.'
				type="h2"
				style={{ textAlign: 'center', maxWidth: 900 }}
			/>

			<div theme="row_wrap_center" style={{ gap: 12 }}>
				<Button
					label={<Typography type='h2' style={{ color: 'inherit' }} label='Create your storefront' />}
					type="contained"
					style={{ borderRadius: 50, padding: 20 }}
					iconPosition='right'
					onClick={() => s.open({ name: 'home' })}
					icon={<Icon size={size} name='feather:arrow-right' />}
				/>
				<Button
					label={<Typography type='h2' style={{ color: 'inherit' }} label='See how it works' />}
					type="outlined"
					style={{ borderRadius: 50, padding: 20 }}
					onClick={() => s.open({ name: 'contractor_how_it_works' })}
				/>
			</div>

			<Typography
				type="p1"
				label="Starting with local services (Waterloo Region). Remote gigs supported too."
				style={{ opacity: 0.8, textAlign: 'center' }}
			/>
		</div>

		<Typography type="h2" label="Built for contractors who want fewer dropped leads." />
		<div theme="divider" />
		<Typography
			type="p1"
			label="If your business lives in texts, Instagram DMs, or voicemail, leads get lost. OpenGig gives you a simple place to capture requests, respond, and follow up."
		/>

		<div theme="landingCards">
			<Paper>
				<div theme="row_spread">
					<Typography type='h2_bold' label="LEAD INBOX" />
					<Icon size={size} name="feather:inbox" />
				</div>
				<Typography type="p1_bold" label="All requests in one place" />
				<Typography type="p1" label="Quote requests become trackable leads — no more scrolling through old messages." />
			</Paper>

			<Paper>
				<div theme="row_spread">
					<Typography type='h2_bold' label="FOLLOW-UP NUDGES" />
					<Icon size={size} name="feather:clock" />
				</div>
				<Typography type="p1_bold" label="Never forget to follow up" />
				<Typography type="p1" label='Get reminders like “2 days since last reply” so you close more work without extra admin.' />
			</Paper>

			<Paper>
				<div theme="row_spread">
					<Typography type='h2_bold' label="SHARE LINK" />
					<Icon size={size} name="feather:link" />
				</div>
				<Typography type="p1_bold" label="A storefront you can send today" />
				<Typography type="p1" label="Send one link to customers. They see your services and can request a quote in seconds." />
			</Paper>

			<Paper>
				<div theme="row_spread">
					<Typography type='h2_bold' label="OPEN REQUESTS" />
					<Icon size={size} name="feather:search" />
				</div>
				<Typography type="p1_bold" label="Find new work (optional)" />
				<Typography type="p1" label="Customers can post requests publicly. You can browse and respond — not pay-to-win, not algorithm-gated." />
			</Paper>
		</div>

		{/* WHAT YOU GET */}
		<Paper>
			<Typography type="p1_bold" label="What you get on day 1" />
			<ul theme="landingList">
				<li><Typography type="p1" label={<>A public business page you can share.</>} /></li>
				<li><Typography type="p1" label={<>Service listings (what you do, where you work, starting price).</>} /></li>
				<li><Typography type="p1" label={<>Quote requests → lead inbox + notifications.</>} /></li>
				<li><Typography type="p1" label={<>Simple follow-up reminders so leads don’t rot.</>} /></li>
			</ul>
		</Paper>

		{/* HOW IT WORKS */}
		<Typography type="h2" label="How it works" />
		<div theme="landing_divider" />

		<div theme='column_fill' style={{ gap: 20 }}>
			<Paper>
				<Typography type='h2_bold' label="1. SET UP" />
				<Typography type="p1_bold" label="Create your storefront in minutes" />
				<Typography type="p1" label="Add your business name, service area, and 1–3 services. You get a shareable link." />
			</Paper>

			<Paper>
				<Typography type='h2_bold' label="2. CAPTURE" />
				<Typography type="p1_bold" label="Customers request quotes through your link" />
				<Typography type="p1" label="Requests show up as leads you can track, reply to, and mark as won/lost." />
			</Paper>

			<Paper>
				<Typography type='h2_bold' label="3. CLOSE" />
				<Typography type="p1_bold" label="Follow up and book more work" />
				<Typography type="p1" label="OpenGig helps you stay on top of conversations so you don’t lose jobs to silence." />
			</Paper>
		</div>

		{/* TRUST / PRICING */}
		<Typography type="h2" label="Transparent by design" />
		<div theme="landing_divider" />

		<div theme="landingCards">
			<Paper>
				<div theme='row_spread'>
					<Typography type="p1_bold" label="Open Source" />
					<Icon size={size2} name="feather:code" />
				</div>
				<Typography type="p1" label="Core code is public. No hidden ranking games." />
			</Paper>

			<Paper>
				<div theme='row_spread'>
					<Typography type="p1_bold" label="Clear fees" />
					<Icon size={size2} name="feather:percent" />
				</div>
				<Typography type="p1" label="At-cost direction. You’ll know what you pay and why." />
			</Paper>

			<Paper>
				<div theme='row_spread'>
					<Typography type="p1_bold" label="You own the relationship" />
					<Icon size={size2} name="feather:user-check" />
				</div>
				<Typography type="p1" label="Repeat customers matter. This isn’t built for churn." />
			</Paper>

			<Paper>
				<div theme='row_spread'>
					<Typography type="p1_bold" label="Local-first" />
					<Icon size={size2} name="feather:map-pin" />
				</div>
				<Typography type="p1" label="Designed for on-site work with service areas and local trust." />
			</Paper>
		</div>

		{/* CTA */}
		<div theme='column_fill_center' style={{ gap: 20, margin: '80px 0' }}>
			<Typography type="h1_bold" label="Try it with your next customer" />
			<Typography
				type="h2"
				style={{ textAlign: 'center', maxWidth: 900 }}
				label="Set up your storefront, share your link, and route your next quote request through OpenGig."
			/>

			<div theme="row_wrap_center" style={{ gap: 12 }}>
				<Button
					label={<Typography type='h2' style={{ color: 'inherit' }} label={'Create your storefront'} />}
					type="contained"
					style={{ borderRadius: 50, marginTop: '10px', padding: 20 }}
					iconPosition='right'
					onClick={() => s.open({ name: 'home' })}
					icon={<Icon size={size} name='feather:arrow-right' />}
				/>
				<Button
					label={<Typography type='h2' style={{ color: 'inherit' }} label={'I want early access'} />}
					type="outlined"
					style={{ borderRadius: 50, marginTop: '10px', padding: 20 }}
					onClick={() => s.open({ name: 'waitlist' })}
				/>
			</div>

			<Typography
				type="p1"
				label="If you’re in Waterloo Region and want concierge onboarding, contact us — we’ll set it up with you."
				style={{ opacity: 0.8, textAlign: 'center' }}
			/>
		</div>
	</div>
</>);

export default ContractorLanding;
