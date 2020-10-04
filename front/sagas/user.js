import axios from 'axios';
import { all, fork, delay, put, takeLatest, call } from "redux-saga/effects";
import { LOAD_MY_INFO_REQUEST, LOAD_MY_INFO_SUCCESS, LOAD_MY_INFO_FAILURE,
         LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_FAILURE,
         LOG_IN_REQUEST, LOG_IN_SUCCESS, LOG_IN_FAILURE,
         LOG_OUT_REQUEST, LOG_OUT_SUCCESS, LOG_OUT_FAILURE,
         FOLLOW_REQUEST, FOLLOW_SUCCESS, FOLLOW_FAILURE,
         UNFOLLOW_REQUEST, UNFOLLOW_SUCCESS, UNFOLLOW_FAILURE,
         REMOVE_FOLLOWER_REQUEST, REMOVE_FOLLOWER_SUCCESS, REMOVE_FOLLOWER_FAILURE,
         LOAD_FOLLOWERS_REQUEST, LOAD_FOLLOWERS_SUCCESS, LOAD_FOLLOWERS_FAILURE,
         LOAD_FOLLOWINGS_REQUEST, LOAD_FOLLOWINGS_SUCCESS, LOAD_FOLLOWINGS_FAILURE,
         SIGN_UP_REQUEST, SIGN_UP_SUCCESS, SIGN_UP_FAILURE, CHANGE_NICKNAME_REQUEST, CHANGE_NICKNAME_SUCCESS, CHANGE_NICKNAME_FAILURE
        } from '../reducers/user'

// function에 * -> generator
// generator: 중단점이 있는 함수, yield에서 멈추고 next()실행, 계속 next실행하다가 마지막 yield에서 끝(done이 true가 됨)

function changeNicknameAPI(data) {
   return axios.patch('/user/nickname', data)
}

function* changeNickname(action) {     
   try {
      const result = yield call(changeNicknameAPI, action.data);
      yield put({             // put은 dispatch 역할
         type: CHANGE_NICKNAME_SUCCESS,
         data: result.data
      });
   } catch (err) {
      yield put({
         type: CHANGE_NICKNAME_FAILURE,
         error: err.response.data 
      })
   }
}

function loadMyInfoAPI() {
   return axios.get('/user')
}

function* loadMyInfo() {     
   try {
      const result = yield call(loadMyInfoAPI);
      yield put({             // put은 dispatch 역할
         type: LOAD_MY_INFO_SUCCESS,
         data: result.data
      });
   } catch (err) {
      yield put({
         type: LOAD_MY_INFO_FAILURE,
         error: err.response.data 
      })
   }
}

function loadUserAPI(data) {
   return axios.get(`/user/${data}`)
}

function* loadUser(action) {     
   try {
      const result = yield call(loadUserAPI, action.data);
      yield put({             // put은 dispatch 역할
         type: LOAD_USER_SUCCESS,
         data: result.data
      });
   } catch (err) {
      yield put({
         type: LOAD_USER_FAILURE,
         error: err.response.data 
      })
   }
}

function logInAPI(data) {
   return axios.post('/user/login', data)
}     // backend server 주소

function* logIn(action) {     // backend쪽에 passport library 설치
   try {
      const result = yield call(logInAPI, action.data);
      console.log(result);
      // call대신 fork쓰면 비동기호출이 돼서 실행전에 아래가 실행될수도
      // yield delay(1000);  // DBserver 연결 전 사용
      yield put({             // put은 dispatch 역할
         type: LOG_IN_SUCCESS,
         data: result.data    // result.data : 서버로부터 받아오는 사용자정보
      });
   } catch (err) {
      yield put({
         type: LOG_IN_FAILURE,
         error: err.response.data 
      })
   }
}

function logOutAPI() {
   return axios.post('/user/logout')  
}

function* logOut() {
   try {
      yield call(logOutAPI)
      // yield delay(1000);
      yield put({             
         type: LOG_OUT_SUCCESS,
      });
   } catch (err) {
      yield put({
         type: LOG_OUT_FAILURE,
         error: err.response.data 
      }) 
   }
}

function followAPI(data) {
   return axios.patch(`/user/${data}/follow`)
}

function* follow(action) {
   try {
      const result = yield call(followAPI, action.data);
      // yield delay(1000);  
      yield put({             
         type: FOLLOW_SUCCESS,
         data: result.data
      });
   } catch (err) {
      yield put({
         type: FOLLOW_FAILURE,
         error: err.response.data 
      })
   }
}

function unfollowAPI(data) {
   return axios.delete(`/user/${data}/follow`)
}

function* unfollow(action) {
   try {
      const result = yield call(unfollowAPI, action.data)
      // yield delay(1000);
      yield put({             
         type: UNFOLLOW_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      yield put({
         type: UNFOLLOW_FAILURE,
         error: err.response.data 
      }) 
   }
}

function removeFollowerAPI(data) {
   return axios.delete(`/user/follower/${data}`)
}

function* removeFollower(action) {
   try {
      const result = yield call(removeFollowerAPI, action.data)
      // yield delay(1000);
      yield put({             
         type: REMOVE_FOLLOWER_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      yield put({
         type: REMOVE_FOLLOWER_FAILURE,
         error: err.response.data 
      }) 
   }
}

function loadFollowersAPI() {
   return axios.get('/user/followers')
}

function* loadFollowers(action) {
   try {
      const result = yield call(loadFollowersAPI, action.data);
      // yield delay(1000);  
      yield put({             
         type: LOAD_FOLLOWERS_SUCCESS,
         data: result.data
      });
   } catch (err) {
      yield put({
         type: LOAD_FOLLOWERS_FAILURE,
         error: err.response.data 
      })
   }
}

function loadFollowingsAPI() {
   return axios.get('/user/followings')
}

function* loadFollowings(action) {
   try {
      const result = yield call(loadFollowingsAPI, action.data)
      // yield delay(1000);
      yield put({             
         type: LOAD_FOLLOWINGS_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      yield put({
         type: LOAD_FOLLOWINGS_FAILURE,
         error: err.response.data 
      }) 
   }
}

function signUpAPI(data) {
   return axios.post('/user', data)
}  // 백엔드서버에 email,pw,nick데이터를 보냄
// get,delete는 데이터 못넘기는데 post,put,patch는 넘길 수 있음

function* signUp(action) { 
   try {
      const result = yield call(signUpAPI, action.data);
      console.log(result);
      yield put({             
         type: SIGN_UP_SUCCESS,
      });
   } catch (err) {
      yield put({
         type: SIGN_UP_FAILURE,
         error: err.response.data 
      }) 
   }
}

// 비동기 action creator 역할(이벤트리스너 같은 역할)
// 로그인 액션이 들어오면 로그인제너레이터를 실행
function* watchLogIn() {
   yield takeLatest(LOG_IN_REQUEST, logIn);   // take('LOG_IN') 'LOG_IN_REQUEST'라는 액션이 실행될때까지 기다리겠다
   // takeEvery: 한번이 아니고 계속 실행 = while(true) 기능
   // 실수로 두번클릭하면? 두번 로그인 그래서 takeLatest를 많이 씀
   // 그렇지만 백엔드 응답을 취소하는거라 백엔드에는 둘다 저장됨
   // 그래서 throttle을 사용할수도: 정한 시간내에는 한번만으로 제한
}

function* watchLogOut() {
   yield takeLatest(LOG_OUT_REQUEST, logOut);
}

function* watchChangeNickname() {
   yield takeLatest(CHANGE_NICKNAME_REQUEST, changeNickname);
}

function* watchLoadMyInfo() {
   yield takeLatest(LOAD_MY_INFO_REQUEST, loadMyInfo);
}

function* watchLoadUser() {
   yield takeLatest(LOAD_USER_REQUEST, loadUser);
}

function* watchFollow() {
   yield takeLatest(FOLLOW_REQUEST, follow);
}

function* watchUnfollow() {
   yield takeLatest(UNFOLLOW_REQUEST, unfollow);
}

function* watchRemoveFollower() {
   yield takeLatest(REMOVE_FOLLOWER_REQUEST, removeFollower);
}

function* watchLoadFollowers() {
   yield takeLatest(LOAD_FOLLOWERS_REQUEST, loadFollowers);
}

function* watchLoadFollowings() {
   yield takeLatest(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}

function* watchSignUp() {
   yield takeLatest(SIGN_UP_REQUEST, signUp);
}

export default function* userSaga() {
   yield all([     // all: 배열 안에 있는 것 동시에 실행
      //fork: 비동기함수를 실행, call도 실행하지만 call은 동기함수 실행
      fork(watchLoadFollowers),
      fork(watchLoadFollowings),
      fork(watchChangeNickname),
      fork(watchLoadMyInfo),
      fork(watchLoadUser),
      fork(watchLogIn),    
      fork(watchLogOut),
      fork(watchFollow),    
      fork(watchUnfollow),
      fork(watchRemoveFollower),       
      fork(watchSignUp)
   ])
}