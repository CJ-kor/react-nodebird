import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from '../reducers/user';

function FollowButton({ post }) {
   const dispatch = useDispatch();
   const { me, followLoading, unfollowLoading } = useSelector((state) => state.user);
   const isFollowing = me?.Followings.find((v) => v.id === post.User.id);

   const onClickButton = useCallback(() => {
      if (isFollowing) {
         dispatch({
            type: UNFOLLOW_REQUEST,
            data: post.User.id,
         });
      } else {
         dispatch({
            type: FOLLOW_REQUEST,
            data: post.User.id,
         })
      }
   }, [isFollowing]);

   //  로그인사용자 = 포스트게시자
   if (post.User.id === me.id) {
      return null;   // 아무것도 보여주지 않음
   }
   return (
      <Button onClick={onClickButton} loading={followLoading || unfollowLoading}>
         {isFollowing ? "언팔로우" : "팔로우"}
      </Button>
   )
}

FollowButton.porpTypes = {
   post: PropTypes.object.isRequired
};

export default FollowButton;