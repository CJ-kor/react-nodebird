import React, { useCallback, useEffect } from 'react';
// import PropTypes from 'prop-types';
import useInput from '../hooks/useInput';
import Link from 'next/link';
import { Form, Input, Button } from 'antd';
import styled from 'styled-components';

import { useDispatch, useSelector } from 'react-redux';

import { loginRequestAction } from '../reducers/user';

const ButtonWrapper = styled.div`     
   margin-top: 10px;
`;   // div 컴포넌트이면서 css적용된 태그
const FormWrapper = styled(Form)`
   margin-left: 10px;
`;  
   // 또는 useMemo 이용해서 밖으로 뺌 
   // hooks함수 안에 const style = useMemo(() => ({ marginTop = 10 }), [])
   // style정의 한다음 아래 <Div style={style}>


const LoginForm = () => {
   const dispatch = useDispatch();  // useDispatch : store.dispatch와 같음
   const { logInLoading, logInError } = useSelector((state) => state.user);

   // const [email, setEmail] = useState('');
   // const [password, setPassword] = useState('');
   // const onChangeemail = useCallback((e) => {
   //    setEmail(e.target.value)
   // }, []);
   // const onChangePassword = useCallback((e) => {
   //    setPassword(e.target.value)
   // }, []);

   // -> custom hooks 사용(hooks폴더 useinput.js)
   const [email, onChangeEmail] = useInput('');
   const [password, onChangePassword] = useInput('');

   useEffect(() => {
      if (logInError) {
         alert(logInError);
      }
   }, [logInError]);

   // onFinish는 e.preventDefault() 적용되어있음
   const onSubmitForm = useCallback(() => {
      console.log(email, password);
      // setIsLoggedIn(true);
      dispatch(loginRequestAction({ email, password }));      
      // loginRequestAction() : action creator(user.js)
   }, [email, password])

   return (
      // react form library 이용가능
      <FormWrapper onFinish={onSubmitForm}> 
         <div>
            <label htmlFor="user-email">아이디</label>
            <br/>
            <Input name="user-email" type="email" value={email} onChange={onChangeEmail} required />
         </div>
         <div>
            <label htmlFor="user-password">비밀번호</label>
            <br/>
            <Input name="user-password" type="password" value={password} onChange={onChangePassword} required />
         </div>
         {/* <div style={{ marginTop: 10 }}> re-rendering 때문에 styled component사용 or useMemo <- css object를 다른 object로 매번 인식하기때문 */}  
         <ButtonWrapper>
            <Button type="primary" htmlType="submit" loading={logInLoading}>로그인</Button>
            {/* logInLoading이면 버튼이 "loading"으로 바뀜 */}
            <Link href="/signup"><a><Button>회원가입</Button></a></Link>
         </ButtonWrapper>
      </FormWrapper>
   );
}

// LoginForm.protoTypes = {
//    setIsLoggedIn: PropTypes.func.isRequired
// }     리덕스로 props 필요없음

export default LoginForm;