import { Button, Typography, Paper } from 'destamatic-ui';

import Header from '../components/Header';

const Privacy = ({ state }) => <div theme='page'>
    <Header state={state}>
            <Button
                label="Enter"
                type="contained"
                onMouseDown={() => state.client.openPage = { name: "Auth" }}
            />
    </Header>
    <Paper>
        <Typography type="h1" label='Privacy Policy for OpenGig' />
        <Typography type="p1">
            OpenGig.org is an Open Source Service platform built for gig workers and customers. We stand for openness, the rights of customers, and for the empowerment of workers.
        </Typography>
    </Paper>
</div>;

export default {
    authenticated: false,
    page: Privacy,
};
