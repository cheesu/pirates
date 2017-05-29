import {
    SEARCH,
    SEARCH_SUCCESS,
    SEARCH_FAILURE
} from './ActionTypes';
import axios from 'axios';

export function searchRequest(keyword) {
    console.log("서치 리퀘스트");
    return (dispatch) => {

        dispatch(search());

        return axios.get('/api/account/search/' + keyword)
            .then((response) => {
                dispatch(searchSuccess(response.data));
            }).catch((error) => {
                dispatch(searchFailure());
            });
    };
}

export function search() {
    return {
        type: SEARCH
    };
}

export function searchSuccess(usernames) {
    console.log("콘솔 석세스");
    console.log(usernames);
    return {
        type: SEARCH_SUCCESS,
        usernames
    };
}

export function searchFailure() {
    return {
        type: SEARCH_FAILURE
    };
}