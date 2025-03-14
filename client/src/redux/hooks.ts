import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux'
import { AppDispatch, RootState } from './store'

export const useStoreSelector: TypedUseSelectorHook<RootState> = useSelector
export const useStoreDispatch = () => useDispatch<AppDispatch>()
