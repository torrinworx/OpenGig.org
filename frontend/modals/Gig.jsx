import { ModalContext, Typography } from "destamatic-ui";

export default ModalContext.use(m => {

    return () => {
        console.log(m.props);

        return <div>
            <Typography type='p1' label={m.observer.path(['props', 'gig']).map(g => g ? g.description : null)} />
        </div>;
    };
});
