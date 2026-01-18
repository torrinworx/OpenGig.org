import { Detached, Button, Icon, Observer } from 'destamatic-ui';

import Paper from './Paper.jsx';

const Hamburger = ({ children }) => {
	const focused = Observer.mutable(false);

	return <Detached enabled={focused}>
		<Button
			type='text'
			onClick={() => focused.set(!focused.get())}
			title='Menu'
			icon={<Icon name='feather:menu' size={30} />}
		/>
		<mark:popup>
			<Paper
				theme='column_tight_center'
				style={{ padding: 0, gap: 8 }}
				onPointerDown={e => e.stopPropagation()}
				onTouchStart={e => e.stopPropagation()}
				onMouseDown={e => e.stopPropagation()}
			>
				{children}
			</Paper>
		</mark:popup>
	</Detached>;
};

export default Hamburger;
