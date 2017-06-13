import {
    SKILL,
    SKILL_GET_SUCCESS,
    SKILL_GET_FAILURE
} from './ActionTypes';
import axios from 'axios';

export function skillRequest(userInfo) {
console.log("스킬 액션");
  console.log(userInfo);
    return (dispatch) => {

        dispatch(skill());

        return axios.post('/api/skill/getSkill/',userInfo)
            .then((response) => {
                dispatch(skillGetSuccess(response.data));
            }).catch((error) => {
                dispatch(skillGetFailure());
            });
    };
}

export function skill() {
    return {
        type: SKILL
    };
}

export function skillGetSuccess(skills) {
    return {
        type: SKILL_GET_SUCCESS,
        skills
    };
}

export function skillGetFailure() {
    return {
        type: SKILL_GET_FAILURE
    };
}
