import { Observer } from 'destam-dom';
import { TextField, Button, Typography, Shown, LoadingDots, Paper } from 'destamatic-ui';

const Auth = ({ state }) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const confirmPassword = Observer.mutable('');
	const loading = Observer.mutable(false);
	const exists = Observer.mutable(false);
	const checked = Observer.mutable(false);

	loading.watch(d => console.log(d.value));

	const checkUser = async () => {
		loading.set(true);
		const response = await state.check(email);
		// If user exists => set exists to true
		// If user does not exist => set exists to false
		exists.set(!!response.result.exists);
		checked.set(true);

		if (response.result.error) {
			state.client.notifications.push({
				type: 'error',
				content: response.result.error
			});
			checked.set(false);
		}
		console.log("THIS IS HAPPENING");
		loading.set(false);
	};

	const createAccount = async () => {
		loading.set(true);
		if (password.get() !== confirmPassword.get()) {
			state.client.notifications.push({
				type: 'error',
				content: 'Confirmation password did not match your password.'
			});
			loading.set(false);
			return;
		}
		await enter(email, password);
	};

	return state.observer.path('sync').shallow().ignore().map(s => {
		if (s) {
			state.client.openPage = { page: "Home" };
			return null;
		}
		return (
			<div theme='page_center'>
				<Paper style={{ width: '285px' }}>
					<div style={{ position: 'absolute', top: '10px', left: '10px' }}>
						<Button
							label="Back"
							type="text"
							onMouseDown={() => (state.client.openPage = { page: "Landing" })}
						/>
					</div>
					<div theme='column_center' style={{ margin: 10, gap: 20 }}>
						<Typography type="h3" label='Enter' />

						<TextField
							onEnter={checkUser}
							disabled={loading}
							value={email}
							placeholder="Email"
						/>
						<Shown value={exists}>
							<mark:then>
								<Shown value={checked}>
									<mark:then>
										<TextField
											style={{ margin: '10px 0px' }}
											disabled={loading}
											type="password"
											value={password}
											placeholder="Password"
										/>
										<Shown value={loading} invert>
											<Button
												label='Enter'
												onMouseDown={async () => {
													loading.set(true)
													await state.enter(email, password)
												}}
												type="contained"
											/>
										</Shown>
									</mark:then>
									<mark:else>
										<Button
											label='Continue with Email'
											onMouseDown={checkUser}
											type="contained"
										/>
									</mark:else>
								</Shown>
							</mark:then>
							<mark:else>
								<Shown value={checked}>
									<mark:then>
										<TextField
											style={{ margin: '10px 0px' }}
											disabled={loading}
											type="password"
											value={password}
											placeholder="Password"
										/>
										<TextField
											onEnter={createAccount}
											style={{ margin: '10px 0px' }}
											disabled={loading}
											type="password"
											value={confirmPassword}
											placeholder="Confirm Password"
										/>
										<Button
											label='Create Account'
											onMouseDown={createAccount}
											type="contained"
										/>
									</mark:then>
									<mark:else>
										<Button
											label='Continue with Email'
											onMouseDown={checkUser}
											type="contained"
										/>
									</mark:else>
								</Shown>
							</mark:else>
						</Shown>

						<Shown value={loading}>
							<LoadingDots />
						</Shown>
					</div>
				</Paper>
			</div>
		);
	});
};

export default Auth;
