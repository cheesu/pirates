import authentication from './authentication';
import search from './search';

import { combineReducers } from 'redux';

export default combineReducers({
    authentication,
    search
});
