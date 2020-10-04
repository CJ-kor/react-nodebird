import React, { useCallback, useRef, useEffect } from 'react';
import useInput from '../hooks/useInput';
import { Form, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { ADD_POST_REQUEST, UPLOAD_IMAGES_REQUEST, REMOVE_IMAGE } from '../reducers/post';

function PostForm() {
   const dispatch = useDispatch();
   const { imagePaths, addPostDone } = useSelector((state) => state.post);
   const [text, onChangeText, setText] = useInput('');

   useEffect(() => {
      if (addPostDone) {
         setText('');
      }
   }, [addPostDone])
      
   const onSubmit = useCallback(() => {
      if (!text || !text.trim()) {
         return alert('게시글을 작성하세요.')
      }
      const formData = new FormData(); // image때문에
      imagePaths.forEach((p) => {
         formData.append('image', p);
      });
      formData.append('content', text);
      return dispatch({
         type: ADD_POST_REQUEST,
         data: formData,
      });
   }, [text, imagePaths]);
   
   const imageInput = useRef();
   const onClickImageUpload = useCallback(() => {
      imageInput.current.click();
   }, [imageInput.current]);
   
   const onChangeImages = useCallback((e) => {
      console.log('images', e.target.files);
      const imageFormData = new FormData(); //FormDatag를 하면 multipart형식으로 이미지 전송 가능, 그래야 multer에서 받을 수 있음
      [].forEach.call(e.target.files, (f) => {
         imageFormData.append('image', f); // e.target.files가 유사배열이라 forEach쓰려면 빈배열로 forEach해서 imageFormData에 append
      });
      console.log(imageFormData)
      dispatch({
         type: UPLOAD_IMAGES_REQUEST,
         data: imageFormData,
      })
   }, []);

   const onRemoveImage = useCallback((index) => () => {
      dispatch({
         type: REMOVE_IMAGE,
         data: index,
      });
   }, []);

   return (
      // multipart data : 이미지,동영상등 -> backend에서 못받음
      // -> express에 multer 미들웨어 필요
      <Form style={{ margin: '10px 0 20px' }} encType="multipart/form-data" onFinish={onSubmit}>
         <Input.TextArea
            value={text}
            onChange={onChangeText}
            maxLength={140}
            placeholder="어떤 신기한 일이 있었나요?"
         />
         <div>
            <input type="file" name="image" multiple hidden ref={imageInput} onChange={onChangeImages} />
            <Button onClick={onClickImageUpload}>이미지업로드</Button>
            <Button type="primary" style={{ float: 'right' }} htmlType="submit">짹짹</Button>
         </div>
         <div>
            {imagePaths.map((v, i) => (
               <div key={v} style={{ display: 'inline-block' }}>
                  <img src={`http://localhost:3065/${v}`} style={{ width: '200px' }} alt={v} />
                  <div>
                     <Button onClick={onRemoveImage(i)}>제거</Button>
                  </div>
               </div>
            ))}
         </div>
      </Form>
   );
}

export default PostForm;