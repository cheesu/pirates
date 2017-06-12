import * as types from 'Actions/ActionTypes';
import update from 'react-addons-update';

const initialState = {
    login: {
        status: 'INIT'
    },
    register: {
        status: 'INIT',
        error: -1
    },
    status: {
        valid: false,
        isLoggedIn: false,
        currentUser: '',
        job:'',
        lv:0,
        exp:0,
        hp:0,
        mp:0,
        str:0,
        int:0,
        dex:0,
        max_hp:0,
        max_mp:0,
    }
};

export default function authentication(state, action) {
    if(typeof state === "undefined")
        state = initialState;

    switch(action.type) {
        /* LOGIN */
        case types.AUTH_LOGIN:
            return update(state, {
                login: {
                    status: { $set: 'WAITING' }
                }
            });
        case types.AUTH_LOGIN_SUCCESS:
            return update(state, {
                login: {
                    status: { $set: 'SUCCESS' }
                },
                status: {
                    isLoggedIn: { $set: true },
                    currentUser: { $set: action.username },
                    job: { $set: action.job }
                }
            });
        case types.AUTH_LOGIN_FAILURE:
            return update(state, {
                login: {
                    status: { $set: 'FAILURE' }
                }
            });


        case types.AUTH_REGISTER:
            return update(state, {
                register: {
                    status: { $set: 'WAITING' },
                    error: { $set: -1 }
                }
            });
        case types.AUTH_REGISTER_SUCCESS:
            return update(state, {
                register: {
                    status: { $set: 'SUCCESS' }
                }
            });
        case types.AUTH_REGISTER_FAILURE:
            return update(state, {
                register: {
                    status: { $set: 'FAILURE' },
                    error: { $set: action.error }
                }
            });


        case types.AUTH_GET_STATUS:
            return update(state, {
                status: {
                    isLoggedIn: { $set: true }
                }
            });
        case types.AUTH_GET_STATUS_SUCCESS:
            return update(state, {
                status: {
                    valid: { $set: true },
                    currentUser: { $set: action.username },
                    job: { $set: action.job },
                    lv: { $set: action.lv },
                    exp:{ $set: action.exp },
                    hp:{ $set: action.hp },
                    mp:{ $set: action.mp },
                    str:{ $set: action.str },
                    int:{ $set: action.int },
                    dex:{ $set: action.dex },
                    max_hp:{ $set: action.max_hp },
                    max_mp:{ $set: action.max_mp },
                }
            });
        case types.AUTH_GET_STATUS_FAILURE:
            return update(state, {
                status: {
                    valid: { $set: false },
                    isLoggedIn: { $set: false }
                }
            });


        case types.AUTH_LOGOUT:
              return update(state, {
                  status: {
                      isLoggedIn: { $set: false },
                      currentUser: { $set: '' },
                      job: { $set: '' },
                      lv: { $set: 0 },
                      exp:{ $set: 0 },
                      hp:{ $set: 0 },
                      mp:{ $set: 0 },
                      str:{ $set: 0 },
                      int:{ $set: 0 },
                      dex:{ $set: 0 },
                  }
              });

        default:
            return state;
    }
}
