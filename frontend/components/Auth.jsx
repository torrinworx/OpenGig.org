import { Observer } from "destam";
import { TextField, Button, Typography } from 'destamatic-ui';

import { jobRequest } from "../ws";

const SignUp = ({ login }) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');

	const handleSignUp = () => {
		jobRequest('signup', {email: email.get(), password: password.get()});
	};

return <div style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
		<Typography type="h3">Sign Up</Typography>
		<TextField value={email} placeholder="Email" style={{ marginBottom: '10px' }} />
		<TextField type="password" value={password} placeholder="Password" style={{ marginBottom: '10px' }} />
		<Button label="Sign Up" onClick={handleSignUp} type="contained" style={{ marginBottom: '10px' }} />
		<Button label="Already have an account? Log in" onClick={() => login.set(true)} type="text" />
	</div>;
};

const Login = ({ login }) => {
	const email = Observer.mutable('');
	const password = Observer.mutable('');

	const handleLogin = () => { };

	return <div style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
		<Typography type="h3">Login</Typography>
		<TextField value={email} placeholder="Email" style={{ marginBottom: '10px' }} />
		<TextField type="password" value={password} placeholder="Password" style={{ marginBottom: '10px' }} />
		<Button label="Login" onClick={handleLogin} type="contained" style={{ marginBottom: '10px' }} />
		<Button label="New user? Sign Up" onClick={() => { login.set(false) }} type="text" />
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
