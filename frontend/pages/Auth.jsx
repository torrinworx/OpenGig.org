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

import { syncState } from 'destam-web-core/client';

const Auth = StageContext.use(s => suspend(LoadingDots, async () => {
	const state = await syncState();

	// Wait until the server tells us whether the token is valid.
	// Prevents rendering the "Enter" form for a split second when already logged in.
	await state.authKnown.defined(v => v === true);

	const email = Observer.mutable('');
	const name = Observer.mutable('');
	const password = Observer.mutable('');
	const confirmPassword = Observer.mutable('');

	const loading = Observer.mutable(false);
	const exists = Observer.mutable(false);
	const checked = Observer.mutable(false);

	const submit = Observer.mutable(false);
	const allValid = Observer.mutable(true);

	const suppressEmailReset = Observer.mutable(false);

	const runValidated = async (fn) => {
		submit.set({ value: true });
		await new Promise(r => setTimeout(r, 0));
		if (!allValid.get()) return;
		await fn();
	};

	const resetToEmailStep = () => {
		checked.set(false);
		exists.set(false);
		name.set('');
		password.set('');
		confirmPassword.set('');
	};

	const checkUser = async () =>
		runValidated(async () => {
			loading.set(true);

			suppressEmailReset.set(true);
			email.set((email.get() || '').trim());

			const response = await state.check(email);

			if (typeof response === 'string') checked.set(false);
			else { exists.set(response); checked.set(true); }

			loading.set(false);
			setTimeout(() => suppressEmailReset.set(false), 0);
		});

	const finishLogin = async (response) => {
		// if server returned an error, don't redirect
		if (response?.error) {
			console.log(response.error);
			return
		};

		// enter() reconnects the socket; wait for auth answer
		await state.authKnown.defined(v => v === true);

		if (state.authed.get()) s.open({ name: 'home' });
		// else: token rejected / auth failed; stay on page
	};

	const enter = async () =>
		runValidated(async () => {
			loading.set(true);
			const response = await state.enter({ email, password });
			loading.set(false);
			await finishLogin(response);
		});

	const createAccount = async () =>
		runValidated(async () => {
			loading.set(true);

			if (password.get() !== confirmPassword.get()) {
				loading.set(false);
				return;
			}

			const response = await state.enter({ email, name, password });
			loading.set(false);
			await finishLogin(response);
		});

	email.watch(ev => {
		if (suppressEmailReset.get()) return;

		if (checked.get() === true && exists.get() === false) {
			if (ev?.value !== ev?.prev) resetToEmailStep();
		}
	});

	return <ValidateContext value={allValid}>
		<div
			theme="column_fill_center"
			style={{
				minHeight: '100dvh',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
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
				<div theme="column_center" style={{ margin: 10, gap: 20 }}>
					<Shown value={state.authed}>
						<mark:then>
							<Typography type="h3" label="Your Already Logged In" />
							<Button
								label="Continue"
								type="contained"
								onClick={async () => {
									if (!state.sync) {
										await state.observer.path('sync').defined(v => v != null);
									}
									s.open({ name: 'home' });
								}}
							/>
						</mark:then>

						<mark:else>
							<Typography type="h3" label="Enter" />

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
												label="Enter"
												onClick={enter}
												type="contained"
												disabled={loading}
											/>
										</mark:then>

										<mark:else>
											<Button
												label="Continue"
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
												label="Create Account"
												onClick={createAccount}
												type="contained"
												disabled={loading}
											/>
										</mark:then>

										<mark:else>
											<Button
												label="Continue"
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
}));

export default Auth;
