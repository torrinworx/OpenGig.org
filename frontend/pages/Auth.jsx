import { Observer } from 'destam-dom';
import { jobRequest } from "web-core/client";
import { TextField, Button, Typography, Shown, LoadingDots } from 'destamatic-ui';

const AuthForm = ({ title, buttonText, switchText, switchAction, onSubmit }) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const loading = Observer.mutable(false);

	const handleSubmit = async () => {
		loading.set(true);

		const response = await onSubmit({ email: email.get(), password: password.get() });

		if (response.result.error) {
			state.client.notifications.push({
				type: 'error',
				content: response.result.error
			}),
				loading.set(false);
			return;
		}
		loading.set(false);
	};

	return <div theme='pageSection_inset'>
		<div style={{ position: 'absolute', top: '10px', left: '10px' }}>
			<Button label="Back" type="text" onMouseDown={() => state.client.openPage = { page: "Landing" }} />
		</div>
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<Typography type="h3">{title}</Typography>
			<TextField style={{ margin: '10px 0px' }} disabled={loading} value={email} placeholder="Email" />
			<TextField style={{ margin: '10px 0px' }} disabled={loading} type="password" value={password} placeholder="Password" />
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '10px'
			}}>
				<Shown value={loading} invert>
					<Button label={buttonText} onMouseDown={handleSubmit} type="contained" />
					<Button label={switchText} onMouseDown={switchAction} type="text" />
				</Shown>
				<Shown value={loading}>
					<LoadingDots />
				</Shown>
			</div>
		</div>
	</div>;
};

const SignUp = ({ login }) => {
	const handleSignUp = async ({ email, password }) => {
		const response = await jobRequest('signup', { email, password });

		if (response.result.status === 'success') {
			login.set(true);
		}

		return response;
	};

	return <AuthForm
		title="Sign Up"
		buttonText="Sign Up"
		switchText="Already have an account? Log in"
		switchAction={() => login.set(true)}
		onSubmit={handleSignUp}
	/>;
};

const Login = ({ state, login }) => {
	const handleLogin = async ({ email, password }) => {
		const response = await jobRequest('login', { email, password });

		if (response.result.status === 'success') {
			const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
			const sessionToken = response.result.sessionToken;
			document.cookie = `webCore=${sessionToken}; expires=${expires}; path=/; SameSite=Lax`;

			// TODO For some reason it get's stuck here and doesn't load the home page/state.sync:
			console.log("Login, initializing sync...")
			const response = await jobRequest('sync');
			console.log(response)
			state.client.authenticated = true;
			loading.set(false)
		}

		return response;
	};

	return <AuthForm
		title="Login"
		buttonText="Login"
		switchText="New user? Sign Up"
		switchAction={() => login.set(false)}
		onSubmit={handleLogin}
	/>;
};

const Auth = ({ state }) => {
	const login = Observer.mutable(false);

	return state.observer.path('sync').shallow().ignore().map((s) => {
		if (s) {
			return state.client.openPage = { page: "Home" }
		} else return <div theme='page_center'>
			<Shown value={login} invert>
				<SignUp login={login} />
			</Shown>
			<Shown value={login}>
				<Login state={state} login={login} />
			</Shown>
		</div>;
	});
};

export default Auth;
