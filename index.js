/**
 *
 */
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import app from './src/reducers';

import App from './src/app';

const store = createStore(app);

ReactDOM.render(<App />, document.getElementById('app'));
