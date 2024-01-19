
// Zustand is lightweight alternative to Reducer
import { create } from 'zustand';

interface LoginModalStore {
  lang:string
  change: () => void;
  // onClose: () => void;
}

const useLanguageSet = create<LoginModalStore>((set) => ({
  lang: 'en-US',
  change: () => {

    set((state) => {
      if(state.lang==='en-US'){
        return {lang:'ne-NP'}
      }
      else{
        return {lang:'en-US'}
      }
    })

  },
  
}));


export default useLanguageSet;