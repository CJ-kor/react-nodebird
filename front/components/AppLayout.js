import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Menu, Input, Row, Col } from 'antd';
import styled from 'styled-components';
import UserProfile from '../components/UserProfile';
import LoginForm from '../components/LoginForm';
import useInput from '../hooks/useInput';
import Router from 'next/router';

import { useSelector } from 'react-redux';

const SearchInput = styled(Input.Search)`
   vertical-align: middle
`;
// antdesign 컴포넌트인 Input.Search에 css적용된 태그(SearchInput태그)
// 이게 싫으면 useMemo사용
// const style = useMemo(() => ({ marginTop: 10 }), [])

const AppLayout = ({ children }) => {
   // const [me, setMe] = useState(false);  
   // server 완성이 안된상태라 Redux 연결 전 임시로

   const [searchInput, onChangeSearchInput] = useInput('')
   const me = useSelector((state) => state.user.me)
   // = const { me } = useSelector((state) => state.user)
   // index.js에서 initialState object구조로 받아옴
   // me가 바뀌면 알아서 re-rendering됨

   const onSearch = useCallback(() => {
      Router.push(`/hashtag/${searchInput}`);
   }, [searchInput]);   // next 라우팅

   return (
      <div>
         <Menu mode="horizontal">
            <Menu.Item>
               <Link href="/"><a>노드버드</a></Link>
            </Menu.Item>
            <Menu.Item>
               <Link href="/profile"><a>프로필</a></Link>
            </Menu.Item>
            <Menu.Item>
               <SearchInput
                  enterButton
                  value={searchInput}
                  onChange={onChangeSearchInput}
                  onSearch={onSearch}
               />
            </Menu.Item>  
         </Menu>
         <Row gutter={8}>
            {/* gutter: 컬럼사이의 간격 
            반응형 Grid  xs: mobile, sm:tablet, md:desktop, lg:large   (24칸>100%  6칸>25%) */}
            <Col xs={24} md={6}>
               {me ? <UserProfile /> : <LoginForm />}
               {/* {me ? <UserProfile setMe={setMe} /> : <LoginForm setMe={setMe} />}     props 안넘겨줘도 됨(Redux) */}
            </Col>    
            <Col xs={24} md={12}>
               {children}
            </Col>
            <Col xs={24} md={6}>
               <a href="https://www.zerocho.com" target="_blank" rel="noreferrer noopener">Made by Zerocho</a>
               {/* rel="noreferrer noopener" : _blank 보안문제해결 */}
            </Col>
         </Row>
      </div>
   );
}

AppLayout.propTypes = {
   children: PropTypes.node.isRequired
};


export default AppLayout;