import { StageContext, Shown, Typography, Button, TextField, Observer, suspend, LoadingDots } from 'destamatic-ui';

import AppContext from '../utils/appContext.js';
import ensureSync from '../utils/ensureSync.js';

const Auth = StageContext.use(s => AppContext.use(app => suspend(LoadingDots, async () => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const confirmPassword = Observer.mutable('');
	const loading = Observer.mutable(false);
	const exists = Observer.mutable(false);
	const checked = Observer.mutable(false);

	const checkUser = async () => {
		loading.set(true);
		const state = await ensureSync(app);
		const response = await state.check(email);
		if (typeof response === 'string') checked.set(false);
		else { exists.set(response); checked.set(true); }
		loading.set(false);
	};

	const enter = async () => {
		loading.set(true);
		const state = await ensureSync(app);
		await state.enter(email, password);
		loading.set(false);
		s.open({ name: 'home' });
	};

	const createAccount = async () => {
		loading.set(true);
		if (password.get() !== confirmPassword.get()) { loading.set(false); return; }
		const state = await ensureSync(app);
		await state.enter(email, password);
		loading.set(false);
		s.open({ name: 'home' });
	};

	await ensureSync(app)

	return <div theme='column_fill_center'>
		<div theme='column_center' style={{ margin: 10, gap: 20 }}>
			<Shown value={app.map(a => !!a.observer?.path('sync')?.get())} >
				<mark:then>
					<Typography type="h3" label='Already Logged In' />

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
					<Shown value={exists}>
						<mark:then>
							<Shown value={checked}>
								<mark:then>
									<TextField
										style={{ margin: '10px 0px' }}
										disabled={loading}
										password
										value={password}
										placeholder="Password"
									/>
									<Button
										label='Enter'
										onClick={enter}
										type="contained"
									/>
								</mark:then>
								<mark:else>
									<Button
										label='Continue'
										onClick={checkUser}
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
										password
										value={password}
										placeholder="Password"
									/>
									<TextField
										onEnter={createAccount}
										disabled={loading}
										password
										value={confirmPassword}
										placeholder="Confirm Password"
									/>
									<Button
										label='Create Account'
										onClick={createAccount}
										type="contained"
									/>
								</mark:then>
								<mark:else>
									<Button
										label='Continue'
										onClick={checkUser}
										type="contained"
									/>
								</mark:else>
							</Shown>
						</mark:else>
					</Shown>
				</mark:else>
			</Shown>
		</div>
	</div>;
})));

export default Auth;
 