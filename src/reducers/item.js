import * as types from 'Actions/ActionTypes';
import update from 'react-addons-update';

const initialState = {
    items: [],
    status: 'INIT'
};

export default function item(state, action) {
    if(typeof state === "undefined")
        state = initialState;
    switch(action.type) {
        case types.ITEM:
            return update(state, {
                status: { $set: 'WAITING' }
            });
        case types.USER_ITEM_GET_SUCCESS:
            return update(state, {
                status: { $set: 'SUCCESS' },
                items: { $set: action.items }
            });
        case types.USER_ITEM_GET_FAILURE:
            return update(state, {
                status: { $set: 'FAILURE' },
                items: []
            });
        default:
            return state;
    }
}
