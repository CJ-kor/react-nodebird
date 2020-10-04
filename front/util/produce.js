import { enableES5, produce } from 'immer';
// 원래는 이거 한줄 entry-point(front소스코드) 제일 윗줄에 놓으면 되는데
// next에는 리액트돔의 render부분이 없어서 넣기가 애매 -> produce함수를 직접 만듬

export default (...args) => {
  enableES5();
  return produce(...args);
};