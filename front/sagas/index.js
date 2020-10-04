import { all, fork } from 'redux-saga/effects';
import axios from 'axios';

import postSaga from './post';
import userSaga from './user';

axios.defaults.baseURL = 'http://localhost:3065';  // axios 주소 앞에 default로 붙는 주소
axios.defaults.withCredentials = true;
// backend와 cors문제로 cookie전달 못하는것 방지

export default function* rootSaga() {
   yield all([          
      fork(postSaga),
      fork(userSaga),
   ])
}