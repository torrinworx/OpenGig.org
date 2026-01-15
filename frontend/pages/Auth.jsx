import {
	StageContext,
	Shown,
	Typography,
	Button,
	TextField,
	Observer,
	suspend,
	LoadingDots,
	Validate,
	ValidateContext,
} from 'destamatic-ui';

import AppContext from '../utils/appContext.js';
import ensureSync from '../utils/ensureSync.js';

import LogoLightMode from '/branding/OpenGig_Logo_Light_Mode.svg';
import LogoDarkMode from '/branding/OpenGig_Logo_Dark_Mode.svg';

const Auth = StageContext.use(s => AppContext.use(app => suspend(LoadingDots, async () => {
	const email = Observer.mutable('');
	const name = Observer.mutable('');
	const password = Observer.mutable('');
	const confirmPassword = Observer.mutable('');

	const loading = Observer.mutable(false);
	const exists = Observer.mutable(false);
	const checked = Observer.mutable(false);

	// validation
	const submit = Observer.mutable(false);
	const allValid = Observer.mutable(true);

	// prevents the email watcher from resetting flow during programmatic normalization
	const suppressEmailReset = Observer.mutable(false);

	const runValidated = async (fn) => {
		submit.set({ value: true });

		// allow ValidateContext to aggregate
		await new Promise(r => setTimeout(r, 0));

		if (!allValid.get()) return;
		await fn();
	};

	const resetToEmailStep = () => {
		checked.set(false);
		exists.set(false);

		// clear create/login fields so you're not carrying them across emails
		name.set('');
		password.set('');
		confirmPassword.set('');
	};

	const checkUser = async () => runValidated(async () => {
		loading.set(true);

		// normalize email before check so validator trimming won't cause weird state flips
		suppressEmailReset.set(true);
		email.set((email.get() || '').trim());

		const state = await ensureSync(app);
		const response = await state.check(email);

		if (typeof response === 'string') checked.set(false);
		else { exists.set(response); checked.set(true); }

		loading.set(false);

		// release on next tick
		setTimeout(() => suppressEmailReset.set(false), 0);
	});

	const enter = async () => runValidated(async () => {
		loading.set(true);
		const state = await ensureSync(app);
		await state.enter({ email, password });
		loading.set(false);
		s.open({ name: 'home' });
	});

	const createAccount = async () => runValidated(async () => {
		loading.set(true);

		if (password.get() !== confirmPassword.get()) {
			loading.set(false);
			return;
		}

		const state = await ensureSync(app);
		await state.enter({ email, name, password });
		loading.set(false);
		s.open({ name: 'home' });
	});

	// If user edits email while on "create account" step, kick them back to email check step
	// (create account step is: checked === true, exists === false)
	email.watch(ev => {
		if (suppressEmailReset.get()) return;

		if (checked.get() === true && exists.get() === false) {
			// only reset if it actually changed
			if (ev?.value !== ev?.prev) resetToEmailStep();
		}
	});

	await ensureSync(app);

	return <ValidateContext value={allValid}>
		<div
			theme="column_fill_center"
			style={{
				minHeight: '100dvh',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 16,
				boxSizing: 'border-box',
			}}
		>
			<div
				theme="column_center"
				style={{
					width: '100%',
					maxWidth: 420,
					margin: 10,
					gap: 20,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'stretch',
				}}
			>
				<div theme='row_center_fill_contentContainer'>
					<img
						src={window.themeMode.map(t => t === false ? LogoLightMode : LogoDarkMode)}
						style={{
							width: '20vw',
							maxWidth: 440,
							minWidth: 220,
							height: 'auto',
							objectFit: 'cover',
							display: 'block',
						}}
					/>
				</div>

				<div theme='column_center' style={{ margin: 10, gap: 20 }}>
					<Shown value={app.map(a => !!a.observer?.path('sync')?.get())} >
						<mark:then>
							<Typography type="h3" label='Your Already Logged In' />

							<Button
								label='Continue'
								onClick={() => s.open({ name: 'home' })}
								type="contained"
							/>
						</mark:then>

						<mark:else>
							<Typography type="h3" label='Enter' />

							<TextField
								onEnter={checkUser}
								disabled={loading}
								value={email}
								placeholder="Email"
							/>
							<Validate value={email} signal={submit} validate="email" />

							<Shown value={exists}>
								<mark:then>
									<Shown value={checked}>
										<mark:then>
											<TextField
												style={{ margin: '10px 0px' }}
												disabled={loading}
												password
												value={password}
												onEnter={enter}
												placeholder="Password"
											/>
											<Validate
												value={password}
												signal={submit}
												validate={val => {
													const v = (val.get() || '');
													if (!v) return 'Password is required.';
													return '';
												}}
											/>

											<Button
												label='Enter'
												onClick={enter}
												type="contained"
												disabled={loading}
											/>
										</mark:then>

										<mark:else>
											<Button
												label='Continue'
												onClick={checkUser}
												type="contained"
												disabled={loading}
											/>
										</mark:else>
									</Shown>
								</mark:then>

								<mark:else>
									<Shown value={checked}>
										<mark:then>
											<TextField
												disabled={loading}
												value={name}
												placeholder="Name"
											/>
											<Validate
												value={name}
												signal={submit}
												validate={val => {
													const v = (val.get() || '').trim();
													if (!v) return 'Name is required.';
													if (v.length > 20) return 'Name must be 20 characters or less.';
													return '';
												}}
											/>

											<TextField
												disabled={loading}
												password
												value={password}
												placeholder="Password"
											/>
											<Validate
												value={password}
												signal={submit}
												validate={val => {
													const v = (val.get() || '');
													if (!v) return 'Password is required.';
													if (v.length < 8) return 'Password must be at least 8 characters.';
													return '';
												}}
											/>

											<TextField
												onEnter={createAccount}
												disabled={loading}
												password
												value={confirmPassword}
												placeholder="Confirm Password"
											/>
											<Validate
												value={confirmPassword}
												signal={submit}
												validate={val => {
													const v = (val.get() || '');
													if (!v) return 'Please confirm your password.';
													if (v !== password.get()) return 'Passwords do not match.';
													return '';
												}}
											/>

											<Button
												label='Create Account'
												onClick={createAccount}
												type="contained"
												disabled={loading}
											/>
										</mark:then>

										<mark:else>
											<Button
												label='Continue'
												onClick={checkUser}
												type="contained"
												disabled={loading}
											/>
										</mark:else>
									</Shown>
								</mark:else>
							</Shown>
						</mark:else>
					</Shown>
				</div>
			</div>
		</div>
	</ValidateContext>;
})));

export default Auth;
