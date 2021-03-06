import axios from 'axios';
import {
    AUTH_LOGIN,
    AUTH_LOGIN_SUCCESS,
    AUTH_LOGIN_FAILURE,
    AUTH_REGISTER,
    AUTH_REGISTER_SUCCESS,
    AUTH_REGISTER_FAILURE,
    AUTH_GET_STATUS,
    AUTH_GET_STATUS_SUCCESS,
    AUTH_GET_STATUS_FAILURE,
    AUTH_LOGOUT,
} from './ActionTypes';


/*============================================================================
    authentication
==============================================================================*/

/* LOGIN */
export function loginRequest(username, password) {
  return (dispatch) => {
        // Inform Login API is starting
        dispatch(login());

        // API REQUEST
        return axios.post('/api/account/signin', { username, password })
        .then((response) => {
            // SUCCEED
            dispatch(loginSuccess(response.data.userInfo));
        }).catch((error) => {
            // FAILED
            dispatch(loginFailure());
        });
    };
}

export function login() {
    return {
        type: AUTH_LOGIN
    };
}

export function loginSuccess(info) {
    return {
        type: AUTH_LOGIN_SUCCESS,
        username:info.username,
        job :info.job,
        job2 :info.job2,
        lv:info.lv,
        exp:info.exp,
        hp:info.hp,
        mp:info.mp,
        str:info.str,
        int:info.int,
        dex:info.dex,
        max_mp:info.max_mp,
        max_hp:info.max_hp,
        item:info.item,
        mount:info.mount,
        gold:info.gold,
        itemCount:info.itemCount,
        mapName:info.mapName,
    };
}

export function loginFailure() {
    return {
        type: AUTH_LOGIN_FAILURE
    };
}


/* REGISTER */
export function registerRequest(username, password, job) {
    return (dispatch) => {
        // Inform Register API is starting
        dispatch(register());

        return axios.post('/api/account/signup', { username, password, job })
        .then((response) => {
            dispatch(registerSuccess());
        }).catch((error) => {
            dispatch(registerFailure(error.response.data.code));
        });
    };
}

export function register() {
    return {
        type: AUTH_REGISTER
    };
}

export function registerSuccess() {
    return {
        type: AUTH_REGISTER_SUCCESS,
    };
}

export function registerFailure(error) {
    return {
        type: AUTH_REGISTER_FAILURE,
        error
    };
}



/* GET STATUS */
export function getStatusRequest() {
    return (dispatch) => {
        // inform Get Status API is starting
        dispatch(getStatus());

        return axios.get('/api/account/getInfo')
        .then((response) => {
            dispatch(getStatusSuccess(response.data.info[0]));
        }).catch((error) => {
            dispatch(getStatusFailure());
        });
    };
}

export function getStatus() {
    return {
        type: AUTH_GET_STATUS
    };
}

export function getStatusSuccess(info) {
    return {
        type: AUTH_GET_STATUS_SUCCESS,
        username:info.username,
        job :info.job,
        job2 :info.job2,
        lv:info.lv,
        exp:info.exp,
        hp:info.hp,
        mp:info.mp,
        str:info.str,
        int:info.int,
        dex:info.dex,
        max_mp:info.max_mp,
        max_hp:info.max_hp,
        item:info.item,
        mount:info.mount,
        gold:info.gold,
        itemCount:info.itemCount,
        mapName:info.mapName,
    };
}

export function getStatusFailure() {
    return {
        type: AUTH_GET_STATUS_FAILURE
    };
}


/* Logout */
export function logoutRequest() {
    return (dispatch) => {
        return axios.post('/api/account/logout')
        .then((response) => {
            dispatch(logout());
        });
    };
}

export function logout() {
    return {
        type: AUTH_LOGOUT
    };
}
