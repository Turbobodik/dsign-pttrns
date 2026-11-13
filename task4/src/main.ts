import './style.css';
import { LibraryFacade } from './facade/LibraryFacade';
import { mountUi } from './ui';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app not found');

mountUi(app, new LibraryFacade());
