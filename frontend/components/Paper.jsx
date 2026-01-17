import { Paper as PaperDUI, ThemeContext } from 'destamatic-ui';

const Paper =  ({ children }) => {
	return <PaperDUI>
		<ThemeContext value="antiPrimary">
			{children}
		</ThemeContext>
	</PaperDUI>;
};

export default Paper;
