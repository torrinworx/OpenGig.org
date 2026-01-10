import { StageContext, Typography } from "destamatic-ui";

export default StageContext.use(m => {

    return () => {
        return <div>
            <Typography type='p1' label={m.observer.path(['props', 'gig']).map(g => g ? g.description : null)} />
        </div>;
    };
});
