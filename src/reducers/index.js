import authentication from './authentication';
import search from './search';
import skill from './skill';
import item from './item';

import { combineReducers } from 'redux';

export default combineReducers({
    authentication,
    search,
    skill,
    item
});
