import { Observer } from 'destam-dom';
import { TextField, Button, Typography, Shown, LoadingDots } from 'destamatic-ui';

const AuthForm = ({ title, buttonText, switchText, switchAction, onSubmit, login }) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');
	const loading = Observer.mutable(false);

	const handleSubmit = async () => {
		loading.set(true);

		const response = await onSubmit({ email: email, password: password });
		console.log(response);
		if (response.name === 'signup' && response.result.status === 'success') {
			login.set(true);
		}
	
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

// TODO: refactor and make this a bit cleaner.
const SignUp = ({ login }) => {
	return <AuthForm
		title="Sign Up"
		buttonText="Sign Up"
		switchText="Already have an account? Log in"
		switchAction={() => login.set(true)}
		onSubmit={state.signup}
		login={login}
	/>;
};

const Login = ({ login }) => {
	return <AuthForm
		title="Login"
		buttonText="Login"
		switchText="New user? Sign Up"
		switchAction={() => login.set(false)}
		onSubmit={state.login}
		login={login}
	/>;
};

const Auth = ({ state }) => {
	const login = Observer.mutable(false);

	return state.observer.path('sync').shallow().ignore().map((s) => {
		console.log(s)
		if (s) {
			state.client.openPage = { page: "Home" }
			return null
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
