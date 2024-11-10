import { Observer } from "destam";
import { TextField, Button, Typography, Shown, LoadingDots } from 'destamatic-ui';

import { jobRequest } from "../ws";
import { getCookie } from "../util";
import Home from "../pages/Home";

import { define } from "../theme";

define({
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

const SignUp = ({ state, login }) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const loading = Observer.mutable(false);

	const handleSignUp = async () => {
		loading.set(true)
		const progress = await jobRequest('signup', { email: email.get(), password: password.get() });
		console.log(progress)
		if (progress.result.status === 'success') {

			login.set(true);
		};
	};

	return <div theme='authPage'>
		<div theme='authForm'>
			<Typography type="h3">Sign Up</Typography>
			<TextField style={{margin: '10px 0px'}} disabled={loading} value={email} placeholder="Email" />
			<TextField style={{margin: '10px 0px'}} disabled={loading} type="password" value={password} placeholder="Password" />

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

const Login = ({ state, authenticated, login }) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const loading = Observer.mutable(false);

	const handleLogin = async () => {
		const progress = await jobRequest('login', { email: email.get(), password: password.get() });
		if (progress.result.status === 'success') {
			const sessionToken = progress.result.sessionToken;
			const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
			document.cookie = `opengigSessionToken=${sessionToken}; expires=${expires}; path=/; SameSite=Lax`;
	
			// Log cookies to verify they are being set correctly
			console.log(document.cookie);
	
			authenticated.set(true);
			console.log('Login successful, session token stored in cookies.', sessionToken);

			jobRequest('sync', { init: true })

			console.log(authenticated);

		} else {
			console.log('Login failed.');
		}
	};
	
	return <div theme='authPage'>
		<div theme='authForm'>
			<Typography type="h3">Login</Typography>
			<TextField style={{margin: '10px 0px'}} disabled={loading} value={email} placeholder="Email" />
			<TextField style={{margin: '10px 0px'}} disabled={loading} type="password" value={password} placeholder="Password" />

			<div theme='authButtonContainer'>
				<Shown value={loading} invert>
					<Button label="Login" onClick={handleLogin} type="contained" />
					<Button label="New user? Sign Up" onClick={() => login.set(false)} type="text" />
				</Shown>
				<Shown value={loading}>
					<LoadingDots />
				</Shown>
			</div>
		</div>
	</div>;
};

const Auth = ({ state }) => {
	const authenticated = state.observer.path(['client', 'authenticated']).def(false);
	const login = Observer.mutable(false);

	if (authenticated && state.sync) {
		return <Home state={state} />
	} else return <>
		<Shown value={login} invert>
			<SignUp state={state} login={login} />
		</Shown>
		<Shown value={login} >
			<Login state={state} authenticated={authenticated} login={login} />
		</Shown>
	</>;
};

export default Auth;
