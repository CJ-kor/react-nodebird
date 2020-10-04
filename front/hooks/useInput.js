import { useState, useCallback } from 'react';


// custom hook (root에 hook폴더를 만들어서 사용)
const useInput = (initialValue = null) => {
   const [value, setValue ] = useState(initialValue)
   const handler = useCallback((e) => {
      setValue(e.target.value)
   }, []);
   return [value, handler, setValue];
}

export default useInput;