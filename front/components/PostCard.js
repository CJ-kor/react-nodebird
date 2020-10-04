import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Popover, Avatar, List, Comment } from 'antd';
import { RetweetOutlined,  HeartOutlined, HeartTwoTone, MessageOutlined, EllipsisOutlined } from '@ant-design/icons';
import moment from 'moment';
import Link from 'next/link';
import PostImages from './PostImages';
import CommentForm from './CommentForm';
import FollowButton from './FollowButton';
import PostCardContent from './PostCardContent';
import { LIKE_POST_REQUEST, REMOVE_POST_REQUEST, UNLIKE_POST_REQUEST, RETWEET_REQUEST } from '../reducers/post';

moment.locale('ko'); // moment(날짜 라이브러리) locale(ko)한글

function PostCard({ post }) {
   const dispatch = useDispatch();
   const { removePostLoading } = useSelector((state) => state.post);
      // const [liked, setLiked] = useState(false);
   const [commentFormOpened, setCommentFormOpened] = useState(false);
   const id = useSelector((state) => state.user.me?.id);
   // me?.id = me && me.id (ES6)

   const onLike = useCallback(() => {
      if (!id) {
         return alert('로그인이 필요합니다.')
      }
      return dispatch({
         type: LIKE_POST_REQUEST,
         data: post.id  // 사용자id는 필요 없음(backend req.user에 있음)
      });
   }, [id]);

   const onUnlike = useCallback(() => {
      if (!id) {
         return alert('로그인이 필요합니다.')
      }
      return dispatch({
         type: UNLIKE_POST_REQUEST,
         data: post.id
      })
   }, [id]);
   
   const  onToggleComment= useCallback(() => {
      setCommentFormOpened((prev) => !prev);
   }, []);

   const onRemovePost = useCallback(() => {
      if (!id) {
         return alert('로그인이 필요합니다.')
      }
      return dispatch({
         type: REMOVE_POST_REQUEST,
         data: post.id,
      })
   }, [id])

   const onRetweet = useCallback(() => {
      if (!id) {
         return alert('로그인이 필요합니다.')
      }
      return dispatch({
         type: RETWEET_REQUEST,
         data: post.id,
      })
   }, [id]);
   
   const liked = post.Likers.find((v) => v.id === id);

   return (
      <div style={{ marginBottom: 20 }}>
         <Card
            cover={post.Images[0] && <PostImages images={post.Images} />}
            // array안에 jsx를 쓸때는 항상 key를 넣어줘야함
            actions={[
               <RetweetOutlined key="retweet" onClick={onRetweet} />,
               liked
                  ? <HeartTwoTone twoToneColor="#eb2f96" key="heart" onClick={onUnlike} />
                  : <HeartOutlined key="heart" onClick={onLike} />,
               <MessageOutlined key="comment" onClick={onToggleComment} />,
               <Popover key="more" content={(
                  <Button.Group>
   {/* id가 있고 게시물이 id것일땐 수정,삭제 가능, 아니면 신고 가능 */}
                     {id && post.User.id === id 
                        ? (
                        <>
                        <Button>수정</Button>
                        <Button type="danger" onClick={onRemovePost} loading={removePostLoading}>삭제</Button>
                        </>
                        ) 
                        : <Button>신고</Button>}
                     </Button.Group>
               )}
               >
                  <EllipsisOutlined />
               </Popover>,
            ]}
            title={post.RetweetId ? `${post.User.nickname}님이 리트윗하셨습니다.` : null}
            extra={id && <FollowButton post={post} />} // 우측상단 팔로우 버튼
            
         >
            {/* 리트윗 게시글은 카드 안에 카드넣어주기 */}
            {post.RetweetId && post.Retweet //리트윗 게시글 ?
            ? (
               <Card
                  cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images} />}
               >
                  <span style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD.')}</span>
                  <Card.Meta
                  avatar={(
                     <Link href={`/user/${post.Retweet.User.id}`}>
                        <a><Avatar>{post.Retweet.User.nickname[0]}</Avatar></a>
                     </Link>
                  )}
                  title={post.Retweet.User.nickname}
                  description={<PostCardContent postData={post.Retweet.content} />}
                  />
               </Card>
            )
            : (
               <>
               <span style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD.')}</span>
               <Card.Meta
                  avatar={(
                  <Link href={`/user/${post.User.id}`}>
                     <a><Avatar>{post.User.nickname[0]}</Avatar></a>
                  </Link>
                  )}
                  title={post.User.nickname}
                  description={<PostCardContent postData={post.content} />}
               />
               </>
               )}

         </Card>
         {commentFormOpened && (
            <div>
               <CommentForm post={post} />
               <List
                  header={`${post.Comments.length}개의 댓글`}
                  itemLayout="horizontal"
                  dataSource={post.Comments}
                  renderItem={(item) => (
                     <li>
                        <Comment
                           author={item.User.nickname}
                           avatar={(
                              <Link href={`/user/${item.User.id}`}>
                                 <a><Avatar>{item.User.nickname[0]}</Avatar></a>
                              </Link>
                           )}
                           content={item.content}
                        />
                     </li>
                  )}
               />
            </div>
         )}
      </div>
   );
};

PostCard.propTypes = {
   post: PropTypes.shape({
   id: PropTypes.number,
   User: PropTypes.object,
   content: PropTypes.string,
   createdAt: PropTypes.string,
   Comments: PropTypes.arrayOf(PropTypes.object),
   Images: PropTypes.arrayOf(PropTypes.object),
   Likers: PropTypes.arrayOf(PropTypes.object),
   RetweetId: PropTypes.number,
   Retweet: PropTypes.objectOf(PropTypes.any),
  }).isRequired,
};

export default PostCard;