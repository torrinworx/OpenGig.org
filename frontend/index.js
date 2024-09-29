import { h, mount } from 'destam-dom'

let remove;
window.addEventListener('load', () => {
	remove = mount(document.body, <div>
        Hello World
    </div>);
});

window.addEventListener('unload', () => remove());
