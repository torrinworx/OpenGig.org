import { Observer } from 'destam-dom';
import { jobRequest } from "web-core/client";
import { TextField, Button, Typography, Shown, LoadingDots } from 'destamatic-ui';

import Home from "./Home";
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
	},
	authError: {
		extends: 'error',
		color: '$color'
	}
})

const SignUp = ({ login }) => {
	const error = Observer.mutable('');
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const loading = Observer.mutable(false);

	const handleSignUp = async () => {
		loading.set(true)
		const response = await jobRequest('signup', { email: email.get(), password: password.get() });
		if (response.result.error) {
			error.set(response.result.error);
			loading.set(false)
			return;
		};
		if (response.result.status === 'success') {
			login.set(true);
		};
	};

	error.watch(d => console.log(d.value));

	return <div theme='authPage'>
		<div style={{ position: 'absolute', top: '10px', left: '10px' }}>
		<Button label="Back" type="text" onMouseDown={() => state.client.openPage = { page: "Landing" }} />
		</div>
		<div theme='authForm'>
			<Typography type="h3">Sign Up</Typography>
			<TextField style={{ margin: '10px 0px' }} disabled={loading} value={email} placeholder="Email" />
			<TextField style={{ margin: '10px 0px' }} disabled={loading} type="password" value={password} placeholder="Password" />

			<div theme='authButtonContainer'>
				<Typography theme='authError' type='p1'>{error}</Typography>
				<Shown value={loading} invert>
					<Button label="Sign Up" onMouseDown={handleSignUp} type="contained" />
					<Button label="Already have an account? Log in" onMouseDown={() => login.set(true)} type="text" />
				</Shown>
				<Shown value={loading}>
					<LoadingDots />
				</Shown>
			</div>
		</div>
	</div>;
};

const Login = ({ state, login }) => {
	const error = Observer.mutable('');
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const loading = Observer.mutable(false);

	const handleLogin = async () => {
		loading.set(true)
		const response = await jobRequest('login', { email: email.get(), password: password.get() });
		if (response.result.error) {
			error.set(response.result.error);
			loading.set(false)
			return;
		};
		const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
		const sessionToken = response.result.sessionToken;
		document.cookie = `webCore=${sessionToken}; expires=${expires}; path=/; SameSite=Lax`;
		console.log("HI THERE")
		
		await jobRequest('sync');

		loading.set(false)
		state.client.authenticated = true;
	};

	return <div theme='authPage'>
		<div style={{ position: 'absolute', top: '10px', left: '10px' }}>
			<Button label="Back" type="text" onMouseDown={() => state.client.openPage = { page: "Landing" }} />
		</div>
		<div theme='authForm'>
			<Typography type="h3">Login</Typography>
			<TextField style={{ margin: '10px 0px' }} disabled={loading} value={email} placeholder="Email" />
			<TextField style={{ margin: '10px 0px' }} disabled={loading} type="password" value={password} placeholder="Password" />

			<div theme='authButtonContainer'>
				<Typography theme='authError' type='p1'>{error}</Typography>
				<Shown value={loading} invert>
					<Button label="Login" onMouseDown={handleLogin} type="contained" />
					<Button label="New user? Sign Up" onMouseDown={() => login.set(false)} type="text" />
				</Shown>
				<Shown value={loading}>
					<LoadingDots />
				</Shown>
			</div>
		</div>
	</div>;
};

const Auth = ({ state }) => {
	const login = Observer.mutable(false);

	return state.observer.path('sync').shallow().ignore().map((s) => {
		if (s) {
			return <Home state={state} />
		} else return <>
			<Shown value={login} invert>
				<SignUp state={state} login={login} />
			</Shown>
			<Shown value={login} >
				<Login state={state} login={login} />
			</Shown>
		</>;
	});
};

export default Auth;
