// import shortId from 'shortid';
// import faker from 'faker';

// import produce from 'immer';
// IE 11에서 immer지원이 안됨 -> util폴더에 produce.js만들어서 produce함수 실행
import produce from '../util/produce';


export const initialState = {
   mainPosts: [],
   singlePost: null,
   imagePaths: [],      // 이미지 업로드시 경로 저장
   hasMorePosts: true,
   uploadImagesLoading: false,    // 좋아요
   uploadImagesDone: false,
   uploadImagesError: null,
   likePostLoading: false,    // 좋아요
   likePostDone: false,
   likePostError: null,
   unlikePostLoading: false,
   unlikePostDone: false,
   unlikePostError: null,
   loadPostLoading: false,   // 포스트별 페이지 로딩
   loadPostDone: false,
   loadPostError: null,
   loadPostsLoading: false,   // 초기화면 포스트들 로딩
   loadPostsDone: false,
   loadPostsError: null,
   addPostLoading: false,     // 게시글 추가가 완료되면 true
   addPostDone: false,
   addPostError: null,
   removePostLoading: false,
   removePostDone: false,
   removePostError: null,
   addCommentLoading: false,
   addCommentDone: false,
   addCommentError: null,
   retweetLoading: false,
   retweetDone: false,
   retweetError: null,
};

// export const generateDummyPost = (number) => 
//    Array(number).fill().map(() => ({
//       id: shortId.generate(),
//       User: {
//          id: shortId.generate(),
//          nickname: faker.name.findName()
//       },
//       content: faker.lorem.paragraph(),
//       Images: [{
//          id: shortId.generate(),
//          src: faker.image.image(),
//       }],
//       Comments: [{
//          id: shortId.generate(),
//          User: {
//             id: shortId.generate(),
//             nickname: faker.name.findName()
//          },
//          content: faker.lorem.sentence(),
//       }],
//    }));

// initialState.mainPosts = initialState.mainPosts.concat(
//    generateDummyPost(10)
// );

export const UPLOAD_IMAGES_REQUEST = 'UPLOAD_IMAGES_REQUEST';
export const UPLOAD_IMAGES_SUCCESS = 'UPLOAD_IMAGES_SUCCESS';
export const UPLOAD_IMAGES_FAILURE = 'UPLOAD_IMAGES_FAILURE';

export const LIKE_POST_REQUEST = 'LIKE_POST_REQUEST';
export const LIKE_POST_SUCCESS = 'LIKE_POST_SUCCESS';
export const LIKE_POST_FAILURE = 'LIKE_POST_FAILURE';

export const UNLIKE_POST_REQUEST = 'UNLIKE_POST_REQUEST';
export const UNLIKE_POST_SUCCESS = 'UNLIKE_POST_SUCCESS';
export const UNLIKE_POST_FAILURE = 'UNLIKE_POST_FAILURE';

export const LOAD_POST_REQUEST = 'LOAD_POST_REQUEST';
export const LOAD_POST_SUCCESS = 'LOAD_POST_SUCCESS';
export const LOAD_POST_FAILURE = 'LOAD_POST_FAILURE';

export const LOAD_POSTS_REQUEST = 'LOAD_POSTS_REQUEST';
export const LOAD_POSTS_SUCCESS = 'LOAD_POSTS_SUCCESS';
export const LOAD_POSTS_FAILURE = 'LOAD_POSTS_FAILURE';

export const LOAD_USER_POSTS_REQUEST = 'LOAD_USER_POSTS_REQUEST';
export const LOAD_USER_POSTS_SUCCESS = 'LOAD_USER_POSTS_SUCCESS';
export const LOAD_USER_POSTS_FAILURE = 'LOAD_USER_POSTS_FAILURE';

export const LOAD_HASHTAG_POSTS_REQUEST = 'LOAD_HASHTAG_POSTS_REQUEST';
export const LOAD_HASHTAG_POSTS_SUCCESS = 'LOAD_HASHTAG_POSTS_SUCCESS';
export const LOAD_HASHTAG_POSTS_FAILURE = 'LOAD_HASHTAG_POSTS_FAILURE';

export const ADD_POST_REQUEST = 'ADD_POST_REQUEST';
export const ADD_POST_SUCCESS = 'ADD_POST_SUCCESS';
export const ADD_POST_FAILURE = 'ADD_POST_FAILURE';

export const REMOVE_POST_REQUEST = 'REMOVE_POST_REQUEST';
export const REMOVE_POST_SUCCESS = 'REMOVE_POST_SUCCESS';
export const REMOVE_POST_FAILURE = 'REMOVE_POST_FAILURE';

export const ADD_COMMENT_REQUEST = 'ADD_COMMENT_REQUEST';
export const ADD_COMMENT_SUCCESS = 'ADD_COMMENT_SUCCESS';
export const ADD_COMMENT_FAILURE = 'ADD_COMMENT_FAILURE';

export const RETWEET_REQUEST = 'RETWEET_REQUEST';
export const RETWEET_SUCCESS = 'RETWEET_SUCCESS';
export const RETWEET_FAILURE = 'RETWEET_FAILURE';

export const REMOVE_IMAGE = 'REMOVE_IMAGE'; //동기액션
//서버쪽에서도 지우고 싶으면 success/failure넣어서 비동기액션으로 만들어줘야함

// export const addPost = (data) => ({
//    type: ADD_POST_REQUEST,
//    data,
// });

export const removePost = (data) => ({
   type: REMOVE_POST_REQUEST,
   data,
});

export const addComment = (data) => ({
   type: ADD_COMMENT_REQUEST,
   data,
});

// const dummyPost = (data) => ({
//    id: data.id,  
//    content: data.content,
//    User: {
//       id: 1,
//       nickname: '제로초',
//    },
//    Images: [],
//    Comments: [],
// });

// const dummyComment = (data) => ({
//    id: shortId.generate(),
//    content: data,
//    User: {
//       id: 1,
//       nickname: '제로초',
//    },
// });

// reducer: 이전 state를 action을 통해 다음 state로 만들어낸는 함수
// object의 불변성은 지키면서 -> 편하게 해주는 immer library
const reducer = (state = initialState, action) => {
   // immer produce
   return produce(state, (draft) => {  
      switch (action.type) {
         case REMOVE_IMAGE:
            draft.imagePaths = draft.imagePaths.filter((v, i) => i !== action.data);
            break;   // front만 지움(back은 남겨둠)

         case UPLOAD_IMAGES_REQUEST:
            draft.uploadImagesLoading = true;
            draft.uploadImagesDone = false;
            draft.uploadImagesError = null;
            break;
         case UPLOAD_IMAGES_SUCCESS: {
            draft.imagePaths = action.data;  //back에서 filename보내줌
            draft.uploadImagesLoading = false;
            draft.uploadImagesDone = true;
            break;
         }
         case UPLOAD_IMAGES_FAILURE:
            draft.uploadImagesLoading = false;
            draft.uploadImagesError = action.error;
            break;

         case LIKE_POST_REQUEST:
            draft.likePostLoading = true;
            draft.likePostDone = false;
            draft.likePostError = null;
            break;
         case LIKE_POST_SUCCESS: {
            const post = draft.mainPosts.find((v) => v.id === action.data.PostId);
            post.Likers.push({ id: action.data.UserId })
            draft.likePostLoading = false;
            draft.likePostDone = true;
            break;
         }
         case LIKE_POST_FAILURE:
            draft.likePostLoading = false;
            draft.likePostError = action.error;
            break;

         case UNLIKE_POST_REQUEST:
            draft.unlikePostLoading = true;
            draft.unlikePostDone = false;
            draft.unlikePostError = null;
            break;
         case UNLIKE_POST_SUCCESS: {
            const post = draft.mainPosts.find((v) => v.id === action.data.PostId);
            post.Likers = post.Likers.filter((v) => v.id !== action.data.UserId)
            draft.unlikePostLoading = false;
            draft.unlikePostDone = true;
            break;
         }
         case UNLIKE_POST_FAILURE:
            draft.unlikePostLoading = false;
            draft.unlikePostError = action.error;
            break;

         case LOAD_POST_REQUEST:
            draft.loadPostLoading = true;
            draft.loadPostDone = false;
            draft.loadPostError = null;
            break;
         case LOAD_POST_SUCCESS:
            draft.singlePost = action.data;
            draft.loadPostLoading = false;
            draft.loadPostDone = true;
            break;
         case LOAD_POST_FAILURE:
            draft.loadPostLoading = false;
            draft.loadPostError = action.error;
            break;

         case LOAD_USER_POSTS_REQUEST:
         case LOAD_HASHTAG_POSTS_REQUEST:  
         case LOAD_POSTS_REQUEST:
            draft.loadPostsLoading = true;
            draft.loadPostsDone = false;
            draft.loadPostsError = null;
            break;
         case LOAD_USER_POSTS_SUCCESS:
         case LOAD_HASHTAG_POSTS_SUCCESS: 
         case LOAD_POSTS_SUCCESS:
            draft.mainPosts = draft.mainPosts.concat(action.data);
            draft.hasMorePosts = action.data.length === 10;
            //post가 10개 미만이면 hasMorePosts가 false
            // 더이상 가져오지 않겠다는 뜻
            draft.loadPostsLoading = false;
            draft.loadPostsDone = true;
            break;
         case LOAD_USER_POSTS_FAILURE:
         case LOAD_HASHTAG_POSTS_FAILURE: 
         case LOAD_POSTS_FAILURE:
            draft.loadPostsLoading = false;
            draft.loadPostsError = action.error;
            break;

         case ADD_POST_REQUEST:
            draft.addPostLoading = true;
            draft.addPostDone = false;
            draft.addPostError = null;
            break;
         case ADD_POST_SUCCESS:
            draft.mainPosts.unshift(action.data);
            draft.imagePaths = []; //업로드하면 포스트 작성창의 이미지는 사라져야
            draft.addPostLoading = false;
            draft.addPostDone = true;
            break;
         case ADD_POST_FAILURE:
            draft.addPostLoading = false;
            draft.addPostError = action.error;
            break;

         case REMOVE_POST_REQUEST:
            draft.removePostLoading = true;
            draft.removePostDone = false;
            draft.removePostError = null;
            break;
         case REMOVE_POST_SUCCESS:
            draft.mainPosts = draft.mainPosts.filter((v) => v.id !== action.data.PostId);
            draft.removePostLoading = false;
            draft.removePostDone = true;
            break;
         case REMOVE_POST_FAILURE:
            draft.removePostLoading = false;
            draft.removePostError = action.error;
            break
         
         case ADD_COMMENT_REQUEST:
            draft.addCommentLoading = true;
            draft.addCommentDone = false;
            draft.addCommentError = null;
            break;
         case ADD_COMMENT_SUCCESS:
            const post = draft.mainPosts.find((v) => v.id === action.data.PostId);
            post.Comments.unshift(action.data);
            draft.addCommentLoading = false;
            draft.addCommentDone = true;
            break;
         case ADD_COMMENT_FAILURE:
            draft.addCommentLoading = false;
            draft.addCommentError = action.error;
            break;
         
         case RETWEET_REQUEST:
            draft.retweetLoading = true;
            draft.retweetDone = false;
            draft.retweetError = null;
            break;
         case RETWEET_SUCCESS:
            draft.retweetLoading = false;
            draft.retweetDone = true;
            draft.mainPosts.unshift(action.data);
            break;
         case RETWEET_FAILURE:
            draft.retweetLoading = false;
            draft.retweetError = action.error;
            break;

         default:
            break;
      };
   });
};

export default reducer;

   // immer 안쓴 reducer switch문
   // switch (action.type) {
   //    case ADD_POST_REQUEST:
   //       return {
   //          ...state,
   //          addPostLoading: true,
   //          addPostDone: false,
   //          addPostError: null,
   //       }
   //    case ADD_POST_SUCCESS: 
   //       return {
   //          ...state,
   //          mainPosts: [dummyPost(action.data), ...state.mainPosts], //앞에 추가해야 게시글 제일 위에 올라감
   //          addPostLoading: false,
   //          addPostDone: true,
   //       };
   //    case ADD_POST_FAILURE:
   //       return {
   //          ...state,
   //          addPostLoading: false,
   //          addPostError: action.error,
   //       }

   //    case REMOVE_POST_REQUEST:
   //       return {
   //          ...state,
   //          removePostLoading: true,
   //          removePostDone: false,
   //          removePostError: null,
   //       }
   //    case REMOVE_POST_SUCCESS: 
   //       return {
   //          ...state,
   //          mainPosts: state.mainPosts.filter((v) => v.id !== action.data),
   //          removePostLoading: false,
   //          removePostDone: true,
   //       };
   //    case REMOVE_POST_FAILURE:
   //       return {
   //          ...state,
   //          removePostLoading: false,
   //          removePostError: action.error,
   //       }
      
   //    case ADD_COMMENT_REQUEST:
   //       return {
   //          ...state,
   //          addCommentLoading: true,
   //          addCommentDone: false,
   //          addCommentError: null,
   //       }
   //    case ADD_COMMENT_SUCCESS:
   //       // 댓글 mainPosts>Post>Comment>content에 넣기 : 너무 복잡 -> immer모듈 npm i immer
   //       const postIndex = state.mainPosts.findIndex((v) => v.id === action.data.postId);
   //       const post = {...state.mainPosts[postIndex]};
   //       post.Comments = [dummyComment(action.data.content), ...post.Comments];
   //       const mainPosts = [...state.mainPosts];
   //       mainPosts[postIndex] = post; 
   //       return {
   //          ...state,
   //          mainPosts,
   //          addCommentLoading: false,
   //          addCommentDone: true,
   //       };
   //    case ADD_COMMENT_FAILURE:
   //       return {
   //          ...state,
   //          addCommentLoading: false,
   //          addCommentError: action.error,
   //       }

   //    default:
   //       return state;
   // }
