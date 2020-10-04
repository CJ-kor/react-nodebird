// next에 리덕스 붙이기 (next-redux-wrapper)
import { createWrapper } from 'next-redux-wrapper';
import { compose, applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';

import reducer from '../reducers';
import rootSaga from '../sagas';

const configureStore = (context) => {
   console.log(context);
   // history 확인용 
   const sagaMiddleware = createSagaMiddleware();
   const middlewares = [sagaMiddleware];  
   // 미들웨어: 리덕스에 없는 기능을 추가해줌 redux-saga, redux-thunk
   // redux-saga : next쓸때는 next-redux-saga도 설치
   const enhancer = process.env.NODE_ENV === 'production'
      ? compose(applyMiddleware(...middlewares))      // 배포용
      : composeWithDevTools(applyMiddleware(...middlewares))      //개발용

   const store = createStore(reducer, enhancer);
   store.sagaTask = sagaMiddleware.run(rootSaga);
   // SSR용(front/pages/index.js에서 갖다씀)
   return store;
};

const wrapper = createWrapper(configureStore, { debug: process.env.NODE_ENV === 'development' });

export default wrapper;