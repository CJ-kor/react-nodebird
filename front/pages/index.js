import React, { useEffect } from 'react';   // no need in next pages folder files
import { useDispatch, useSelector } from 'react-redux';
import { END } from 'redux-saga';
import axios from 'axios';
import AppLayout from '../components/AppLayout'
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';

import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import wrapper from '../store/configureStore';


const Home = () => {
   const dispatch = useDispatch();
   const { me } = useSelector((state) => state.user);
   const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);
   
   useEffect(() => {       // 리트윗 에러났을 때 (Postcard.js)
      if (retweetError) {
         alert(retweetError)
      }
   }, [retweetError]);
   
   // useEffect(() => {     // 아래 SSR 적용하면서 삭제
   //    dispatch({
   //       type: LOAD_MY_INFO_REQUEST
   //    })
   //    dispatch({
   //       type: LOAD_POSTS_REQUEST,
   //    })
   // }, []);

   // 최초 로딩 post갯수 이상 더보기할때
   useEffect(() => {
      function onScroll() {
         if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight -300) {  // 스크롤을 다 내리기 300px전
            if (hasMorePosts && !loadPostsLoading) {
               const lastId = mainPosts[mainPosts.length - 1]?.id;
               dispatch({
               type: LOAD_POSTS_REQUEST,
               lastId,
               });
            }
         }
      }
      window.addEventListener('scroll', onScroll)
      return () => {
         window.removeEventListener('scroll', onScroll);
      }  // return으로 해제해주지 않으면 메모리에 계속 쌓여있음
   }, [hasMorePosts, loadPostsLoading, mainPosts]);
   

   // redux 연결 후, 게시글은 로그인한 사람한테만 보여야 함
   return (
      <AppLayout>
         {/* <div>Hello, Next!</div> */}
         {me && <PostForm />}
         {mainPosts.map(post => <PostCard post={post} key={post.id} />)}
      </AppLayout>
   )
};

// == SSR(next Server-Side-Rendering) 아래 Home보다 먼저 실행해서 화면 그릴 때 data도 같이
// wrapper : 넥스트에 리덕스 붙이는 wrapper(store폴더 configureStore.js)
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {     // 아래부분 실행된 결과를 HYDRATE로 보내줌(reducers/index.js)
   console.log('getServerSideProps start');
   console.log(context.req.headers);
   const cookie = context.req ? context.req.headers.cookie : '';
   axios.defaults.headers.Cookie = '';
   if (context.req && cookie) {
      axios.defaults.headers.Cookie = cookie;
   }
   context.store.dispatch({
      type: LOAD_MY_INFO_REQUEST,
   });
   context.store.dispatch({
      type: LOAD_POSTS_REQUEST,
   });
   context.store.dispatch(END);
   console.log('getServerSideProps end');
   await context.store.sagaTask.toPromise();
});



export default Home;