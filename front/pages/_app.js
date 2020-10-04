import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';   // head태그 안 수정
import 'antd/dist/antd.css'
// import withReduxSaga from 'next-redux-saga';
import wrapper from '../store/configureStore';

// _app.js 모든 파일 공통, AppLayout.js 콤포넌트별 공통(해당콤포넌트에 <AppLayout>태그로 감쌈)

function NodeBird({ Component }) {
   return (
      // 원래 redux는 <Provider></Provider>로 전체를 감싸는데 넥스트가 알아서 넣어줌
      <>
      <Head>
         <meta charSet="_utf-8_" />
         <title>NodBird</title>
      </Head>
         <Component />
      </>
   );
}

NodeBird.propTypes = {
   Component: PropTypes.elementType.isRequired
}

export default wrapper.withRedux(NodeBird);