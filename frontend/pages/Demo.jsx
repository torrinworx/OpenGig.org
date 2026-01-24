import { DropDown, Typography, Icon, Icons, OObject, Paper } from 'destamatic-ui';

const ExampleWrapper = ({ example }) => {
	const { header, example: ExampleComp } = example;

	return <DropDown
		open={example.open}
		label={<Typography type="p1" label={header} />}
		iconOpen={<Icon name="feather:chevron-up" />}
		iconClose={<Icon name="feather:chevron-down" />}
	>
		<ExampleComp globalTheme={OObject({})} />
	</DropDown>;
};

const Demo = () => {
	const example_array = Object.values(
		import.meta.glob(
			'../../destamatic-ui/components/**/**/*.example.jsx',
			{ eager: true }
		)
	).map(e => e.default);

	return <div theme='primary_fill' style={{
		background: '$color_background',
		height: '100vh',
		overflowY: 'auto',
	}}>
		<ExampleWrapper each:example={example_array} />
	</div>;
};

export default Demo;
