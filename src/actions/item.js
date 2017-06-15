import {
    ITEM,
    USER_ITEM_GET_SUCCESS,
    USER_ITEM_GET_FAILURE,
    STORE_ITEM_GET_SUCCESS,
    STORE_ITEM_GET_FAILURE,
} from './ActionTypes';
import axios from 'axios';

export function userItemRequest() {
    return (dispatch) => {

        dispatch(item());

        return axios.get('/api/item/getUserItem/')
            .then((response) => {
                dispatch(userItemGetSuccess(response.data));
            }).catch((error) => {
                dispatch(userItemGetFailure());
            });
    };
}

export function item() {
    return {
        type: item
    };
}

export function userItemGetSuccess(items) {
    return {
        type: USER_ITEM_GET_SUCCESS,
        items
    };
}

export function userItemGetFailure() {
    return {
        type: item_GET_FAILURE
    };
}
