import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';


function PostCardContent({ postData }) {
   return (
      <div>
         {/* 해시태그 선택하는 정규표현식 /#[^\s#]+/g */}
         {/* how to find hashtag with split? */}
         {postData.split(/(#[^\s#]+)/g).map((v, i) => {
            if (v.match(/(#[^\s#]+)/)) {
               return <Link href={`/hashtag/${v.slice(1)}`} key={i}><a>{v}</a></Link>
            }
            return v;
         })}
         {/* split에서는 해시태그부분을 ()로 감싸줘야함 */}
      </div>
   );
}

PostCardContent.propTypes = { postData: PropTypes.string.isRequired };

export default PostCardContent;

