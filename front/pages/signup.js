import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Form, Input, Checkbox, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import Router from 'next/router';
import axios from 'axios';
import { END } from 'redux-saga';

import AppLayout from '../components/AppLayout';
import useInput from '../hooks/useInput';
import { LOAD_MY_INFO_REQUEST, SIGN_UP_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';


function Signup() {
   const dispatch = useDispatch();
   const { signUpLoading, signUpDone, signUpError, me } = useSelector((state) => state.user);

   useEffect(() => {
      if (me && me.id) {            // 로그인을 하면 회원가입페이지를 index페이지로 이동
         Router.replace(`/`);       // push는 뒤로가기 같음, replace하면 기록에서 사라짐
      }
   }, [me && me.id]);

   useEffect(() => {       // signUp 완료되면 메인페이지로...
      if (signUpDone) {    // reducer에서 SIGN_UP_SUCCESS에 signUpDone이 true가 됨
         Router.replace('/');
      }
   }, [signUpDone]);

   useEffect(() => {
      if (signUpError) {
         alert(signUpError);
      }
   }, [signUpError])

   const [email, onChangeEmail] = useInput('');
   const [nickname, onChangeNickname] = useInput('');
   const [password, onChangePassword] = useInput('');

   // passwordCheck은 callback func가 다르기 때문에 custom hooks 못씀
   const [passwordCheck, setPasswordCheck] = useState('');
   const [passwordError, setPasswordError] = useState(false)
   const onChangePasswordCheck = useCallback((e) => {
      setPasswordCheck(e.target.value);
      setPasswordError(e.target.value !== password); 
       // if true setState true, false? no statechange
   }, [password])

   const [term, setTerm] = useState('');
   const [termError, setTermError] = useState(false);
   const onChangeTerm = useCallback((e) => {
      setTerm(e.target.checked);
      setTermError(false);
   }, [])

   const onSubmit = useCallback(() => {
      if (password !== passwordCheck) {
         return setPasswordError(true);
      }
      if (!term) {
         return setTermError(true);
      }     // input에서도 체크했지만 submit에서 한번더 체크
      console.log(email, nickname, password);
      dispatch({
         type: SIGN_UP_REQUEST,
         data: { email, password, nickname }
      })
   }, [email, password, passwordCheck, term])   // 아래 Form onFinish에 기본으로 e.preventDefault() 실행됨
   
   return (
      <AppLayout>
         <Head>
            <title>회원가입 | NodeBird</title>
         </Head>
         <Form onFinish={onSubmit}>
            <div>
               <label htmlFor="user-email">이메일</label>
               <br/>
               <Input name="user-email" type="email" value={email} required onChange={onChangeEmail} />
            </div>
            <div>
               <label htmlFor="user-nick">닉네임</label>
               <br/>
               <Input name="user-nick" value={nickname} required onChange={onChangeNickname} />
            </div>
            <div>
               <label htmlFor="user-password">비밀번호</label>
               <br/>
               <Input name="user-password" type="password" value={password} required onChange={onChangePassword} />
            </div>
            <div>
               <label htmlFor="user-password-check">비밀번호체크</label>
               <br/>
               <Input name="user-password-check" type="password" value={passwordCheck} required onChange={onChangePasswordCheck} 
               />
               {passwordError && <div style={{ color: 'red' }}>비밀번호가 일치하지 않습니다</div>}
            </div>
            <div>
               <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>제로초 말을 잘 들을 것을 동의합니다</Checkbox>
               {termError && <div style={{ color: 'red' }}>약관에 동의하셔야 합니다</div>}
            </div>
            <div style={{ marginTop: 10 }}>
               <Button type="primary" htmlType="submit" loading={signUpLoading}>가입하기</Button>
            </div>
         </Form>
      </AppLayout>
   );
}

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
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
  context.store.dispatch(END);
  console.log('getServerSideProps end');
  await context.store.sagaTask.toPromise();
});

export default Signup;