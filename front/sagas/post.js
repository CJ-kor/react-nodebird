import axios from 'axios';
// import shortId from 'shortid';
import { all, fork, delay, put, takeLatest, throttle, call } from "redux-saga/effects";
import {
   UPLOAD_IMAGES_REQUEST, UPLOAD_IMAGES_SUCCESS, UPLOAD_IMAGES_FAILURE,
   LIKE_POST_REQUEST, LIKE_POST_SUCCESS, LIKE_POST_FAILURE,
   UNLIKE_POST_REQUEST, UNLIKE_POST_SUCCESS, UNLIKE_POST_FAILURE, 
   LOAD_POST_REQUEST, LOAD_POST_SUCCESS, LOAD_POST_FAILURE,
   LOAD_USER_POSTS_REQUEST, LOAD_USER_POSTS_SUCCESS, LOAD_USER_POSTS_FAILURE,
   LOAD_HASHTAG_POSTS_REQUEST, LOAD_HASHTAG_POSTS_SUCCESS, LOAD_HASHTAG_POSTS_FAILURE,
   LOAD_POSTS_REQUEST, LOAD_POSTS_SUCCESS, LOAD_POSTS_FAILURE,
   ADD_POST_REQUEST, ADD_POST_SUCCESS, ADD_POST_FAILURE,
   REMOVE_POST_REQUEST, REMOVE_POST_SUCCESS, REMOVE_POST_FAILURE, 
   ADD_COMMENT_REQUEST, ADD_COMMENT_SUCCESS, ADD_COMMENT_FAILURE,
   RETWEET_REQUEST, RETWEET_SUCCESS, RETWEET_FAILURE, generateDummyPost
} from '../reducers/post';
import { ADD_POST_TO_ME, REMOVE_POST_OF_ME } from '../reducers/user';


function uploadImagesAPI(data) {
   return axios.post('/post/images', data);
} 

function* uploadImages(action) {
   try {
      const result = yield call(uploadImagesAPI, action.data)
      // yield delay(1000);
      yield put({             
         type: UPLOAD_IMAGES_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      console.log(err);
      yield put({
         type: UPLOAD_IMAGES_FAILURE,
         error: err.response.data 
      });
   }
}

function likePostAPI(data) {
   return axios.patch(`/post/${data}/like`)  //patch
}  // data를 주소에 넣었으므로 따로 보낼 필요 없음

function* likePost(action) {
   try {
      const result = yield call(likePostAPI, action.data)
      // yield delay(1000);
      yield put({             
         type: LIKE_POST_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      console.log(err);
      yield put({
         type: LIKE_POST_FAILURE,
         error: err.response.data 
      });
   }
}

function unlikePostAPI(data) {
   return axios.delete(`/post/${data}/like`) // 좋아요 삭제
}  // data를 주소에 넣었으므로 따로 보낼 필요 없음

function* unlikePost(action) {
   try {
      const result = yield call(unlikePostAPI, action.data)
      // yield delay(1000);
      yield put({             
         type: UNLIKE_POST_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      console.log(err);
      yield put({
         type: UNLIKE_POST_FAILURE,
         error: err.response.data 
      });
   }
}

function loadUserPostsAPI(data, lastId) {
   return axios.get(`/user/${data}/posts?lastId=${lastId || 0}`)
}

function* loadUserPosts(action) {
   try {
      const result = yield call(loadUserPostsAPI, action.data, action.lastId)
      yield put({             
         type: LOAD_USER_POSTS_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      console.log(err);
      yield put({
         type: LOAD_USER_POSTS_FAILURE,
         error: err.response.data 
      });
   }
}

function loadHashtagPostsAPI(data, lastId) {
   return axios.get(`/hashtag/${encodeURIComponent(data)}?lastId=${lastId || 0}`)
} // encodeURIComponent() : 주소에 한글인 경우

function* loadHashtagPosts(action) {
   try {
      const result = yield call(loadHashtagPostsAPI, action.data, action.lastId)
      yield put({             
         type: LOAD_HASHTAG_POSTS_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      console.log(err);
      yield put({
         type: LOAD_HASHTAG_POSTS_FAILURE,
         error: err.response.data 
      });
   }
}

function loadPostsAPI(lastId) {
   return axios.get(`/posts?lastId=${lastId || 0}`)
   // get에서 data 보내려면 : ?key=value 형식 쿼리스트링 붙여줘야
   // 게시글 없어서 lastId가 undefined이면 0으로
}

function* loadPosts(action) {
   try {
      const result = yield call(loadPostsAPI, action.lastId)
      // yield delay(1000);
      yield put({             
         type: LOAD_POSTS_SUCCESS,
         // data: generateDummyPost(10) // db연결전. reducer것 import
         data: result.data,
      });
   } catch (err) {
      console.log(err);
      yield put({
         type: LOAD_POSTS_FAILURE,
         error: err.response.data 
      });
   }
}

function loadPostAPI(data) {
   return axios.get(`/post/${data}`);
}

function* loadPost(action) {
   try {
      const result = yield call(loadPostAPI, action.data)
      yield put({             
         type: LOAD_POST_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      console.log(err);
      yield put({
         type: LOAD_POST_FAILURE,
         error: err.response.data 
      });
   }
}

function addPostAPI(data) {
   return axios.post('/post', data)
}  

function* addPost(action) {
   try {
      const result = yield call(addPostAPI, action.data)
      // yield delay(1000);
      // const id= shortId.generate();
      yield put({             
         type: ADD_POST_SUCCESS,
         data: result.data,
      });
      yield put({
         type: ADD_POST_TO_ME,
         data: result.data.id,
      })
   } catch (err) {
      console.log(err);
      yield put({
         type: ADD_POST_FAILURE,
         error: err.response.data 
      })
   }
}

function removePostAPI(data) {
   return axios.delete(`/post/${data}`)   // delete는 data못넣음
}

function* removePost(action) {
   try {
      const result = yield call(removePostAPI, action.data)
      // yield delay(1000);
      yield put({             
         type: REMOVE_POST_SUCCESS,
         data: result.data
      });
      yield put({
         type: REMOVE_POST_OF_ME,
         data: action.data
      })
   } catch (err) {
      console.log(err);
      yield put({
         type: REMOVE_POST_FAILURE,
         error: err.response.data 
      })
   }
}

function addCommentAPI(data) {
   return axios.post(`/post/${data.postId}/comment`, data)
}                       // POST /post/1/commnet

function* addComment(action) {
   try {
      const result = yield call(addCommentAPI, action.data)
      // yield delay(1000);
      yield put({             
         type: ADD_COMMENT_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      console.log(err);
      yield put({
         type: ADD_COMMENT_FAILURE,
         error: err.response.data 
      })
   }
}

function retweetAPI(data) {
   return axios.post(`/post/${data}/retweet`)
}                       // POST /post/1/retweet

function* retweet(action) {
   try {
      const result = yield call(retweetAPI, action.data)
      // yield delay(1000);
      yield put({             
         type: RETWEET_SUCCESS,
         data: result.data,
      });
   } catch (err) {
      console.log(err);
      yield put({
         type: RETWEET_FAILURE,
         error: err.response.data 
      })
   }
}

function* watchUploadImages() {
   yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

function* watchLikePost() {
   yield takeLatest(LIKE_POST_REQUEST, likePost);
}

function* watchUnlikePost() {
   yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}

function* watchLoadPost() {
   yield takeLatest(LOAD_POST_REQUEST, loadPost);
}

function* watchLoadUserPosts() {
  yield throttle(5000, LOAD_USER_POSTS_REQUEST, loadUserPosts);
}

function* watchLoadHashtagPosts() {
  yield throttle(5000, LOAD_HASHTAG_POSTS_REQUEST, loadHashtagPosts);
}

function* watchLoadPosts() {
  yield throttle(5000, LOAD_POSTS_REQUEST, loadPosts);
}
// latest 마지막것만 응답, 
// throttle(시간, ) 시간지난 이후 req만 응답
function* watchAddPost() {
   yield takeLatest(ADD_POST_REQUEST, addPost);
}

function* watchRemovePost() {
   yield takeLatest(REMOVE_POST_REQUEST, removePost);
}

function* watchAddComment() {
   yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}

function* watchRetweet() {
   yield takeLatest(RETWEET_REQUEST, retweet);
}

export default function* postSaga() {
   yield all([
      fork(watchRetweet),
      fork(watchUploadImages),
      fork(watchLikePost),
      fork(watchUnlikePost),
      fork(watchLoadPost),
      fork(watchLoadUserPosts),
      fork(watchLoadHashtagPosts),
      fork(watchLoadPosts),
      fork(watchAddPost),
      fork(watchRemovePost),
      fork(watchAddComment),
   ]);
}