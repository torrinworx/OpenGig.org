import { Observer } from "destam";
import { Theme, TextField, Button, Typography, Shown, LoadingDots } from 'destamatic-ui';

import { jobRequest } from "../ws";

Theme.define({
	authPage: {
		display: 'flex',
		height: '100vh',
		justifyContent: 'center',
		alignItems: 'center' 
	},
	authForm: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	authButtonContainer: {
		display: 'flex', 
		flexDirection: 'column',
		alignItems: 'center',
		height: '200px',
		gap: '10px'
	}
})

const SignUp = ({ login }) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const loading = Observer.mutable(false);

	const handleSignUp = async () => {
		loading.set(true)
		const progress = await jobRequest('signup', { email: email.get(), password: password.get() });
		if (progress.result.status === 'success') login.set(true);
	};

	return <div theme='authPage'>
		<div theme='authForm'>
			<Typography type="h3">Sign Up</Typography>
			<TextField disabled={loading} value={email} placeholder="Email" />
			<TextField disabled={loading} type="password" value={password} placeholder="Password" />

			<div theme='authButtonContainer'>
				<Shown value={loading} invert>
					<Button label="Sign Up" onClick={handleSignUp} type="contained" />
					<Button label="Already have an account? Log in" onClick={() => login.set(true)} type="text" />
				</Shown>
				<Shown value={loading}>
					<LoadingDots />
				</Shown>
			</div>
		</div>
	</div>;
};

const Login = ({ login }) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const loading = Observer.mutable(false);

	const handleLogin = () => { };

	return <div theme='authPage'>
		<div theme='authForm'>
			<Typography type="h3">Login</Typography>
			<TextField value={email} placeholder="Email" style={{ marginBottom: '10px' }} />
			<TextField type="password" value={password} placeholder="Password" style={{ marginBottom: '10px' }} />

			<div theme='authButtonContainer'>
				<Shown value={loading} invert>
					<Button label="Login" onClick={handleLogin} type="contained"/>
					<Button label="New user? Sign Up" onClick={() => { login.set(false) }} type="text" />
				</Shown>
				<Shown value={loading}>
					<LoadingDots />
				</Shown>
			</div>
		</div>
	</div>;
};

const Auth = ({ state }) => {
	const authenticated = state.observer.path(['client', 'authenticated']);
	const login = Observer.mutable(false);

	return login.map(l => {
		if (l) {
			return <Login login={login} />
		} else {
			return <SignUp authenticated={authenticated} login={login} />
		}
	});
};

export default Auth;
