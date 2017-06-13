import * as types from 'Actions/ActionTypes';
import update from 'react-addons-update';

const initialState = {
    skills: [],
    status: 'INIT'
};

export default function skill(state, action) {
    if(typeof state === "undefined")
        state = initialState;
    switch(action.type) {
        case types.SKILL:
            return update(state, {
                status: { $set: 'WAITING' }
            });
        case types.SKILL_GET_SUCCESS:
            return update(state, {
                status: { $set: 'SUCCESS' },
                skills: { $set: action.skills }
            });
        case types.SKILL_GET_FAILURE:
            return update(state, {
                status: { $set: 'FAILURE' },
                skills: []
            });
        default:
            return state;
    }
}
