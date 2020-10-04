import { HYDRATE } from 'next-redux-wrapper';
//  Hydrate: server-side rendering에 사용

import { combineReducers } from 'redux';
import user from './user';
import post from './post';

// combined reducer : combine하기위한 redux method
const rootReducer = (state, action) => {
   switch (action.type) {
      case HYDRATE:
         console.log('HYDRATE', action);
         return action.payload;
      default: {
         const combinedReducer = combineReducers({
            user,
            post,
         });
         return combinedReducer(state, action);
      }
   }
};

export default rootReducer;