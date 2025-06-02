import { Observer } from 'destam-dom';
import { TextField, Button, Typography, Shown, LoadingDots, Paper } from 'destamatic-ui';

const Auth = ({ state }, cleanup) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const confirmPassword = Observer.mutable('');
	const loading = Observer.mutable(false);
	const exists = Observer.mutable(false);
	const checked = Observer.mutable(false);

	const checkUser = async () => {
		loading.set(true);
		const response = await state.check(email);

		// If response is a string => it is an error code
		// If response === true => user exists
		// If response === false => user does not exist
		if (typeof response === 'string') {
			// state.client.notifications.push({
			// 	type: 'error',
			// 	content: response
			// });
			checked.set(false);
		} else {
			exists.set(response);
			checked.set(true);
		}

		loading.set(false);
	};

	const createAccount = async () => {
		loading.set(true);
		if (password.get() !== confirmPassword.get()) {
			// state.client.notifications.push({
			// 	type: 'error',
			// 	content: 'Confirmation password did not match your password.'
			// });
			loading.set(false);
			return;
		}
		// should only get a response if there is an error, else account
		// creation was successful and state.enter will reload the page
		const response = await state.enter(email, password);
		// if (response.error) state.client.notifications.push({
		// 	type: 'error',
		// 	content: response
		// });
	};

	/*
	Issue: for some reason thiis component doesn't unmount when the openPage is changed
	to another componnet. It seems to be hiddn behind the home page or somehow still able
	to render when the page is set to landing when the user signs out for some reason.

	which doesn't make sense because that goes against how the pages system is setup.

	*/

	const auth = state.observer.path('sync');

	cleanup(auth.effect(a => { if (a) state.client.openPage = { name: 'Home' } }));

	return <div theme='page_center'>
		<Paper style={{ width: '285px' }}>
			<div style={{ position: 'absolute', top: '10px', left: '10px' }}>
				<Button
					label="Back"
					type="text"
					onMouseDown={() => (state.client.openPage = { name: "Landing" })}
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
									disabled={loading}
									type="password"
									value={password}
									placeholder="Password"
								/>
								<TextField
									onEnter={createAccount}
									disabled={loading}
									type="password"
									value={confirmPassword}
									placeholder="Confirm Password"
								/>
								<Shown value={loading} invert>
									<Button
										label='Create Account'
										onMouseDown={createAccount}
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
					</mark:else>
				</Shown>

				<Shown value={loading}>
					<LoadingDots />
				</Shown>
			</div>
		</Paper>
	</div>;
};

export default {
	authenticated: false,
	page: Auth,
};
