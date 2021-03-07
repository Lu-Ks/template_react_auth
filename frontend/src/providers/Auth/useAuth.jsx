import { useContext } from 'react';
import AUTHcontext from './context';

const useAUTH = () => useContext(AUTHcontext);

export default useAUTH;
