import { useEffect } from 'react'
import Dialogs from '@/components/dialogs/Dialogs'
import Animator from './components/animator/Animator'
import Game from './components/game/Game'
import api from './api/api'
import { User, setUser } from '@/redux/reducers/auth'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import BoxOpening from '@/components/game/openingUI/boxOpening/BoxOpening'
import { MapEditor } from '@/components/map-editor/MapEditor'

const handleAuthCookie = async (setUser: (user: User | null) => void) => {
  const data = await api.get<{ user: User }>('auth/user')
  if (!data) {
    return
  }

  setUser(data.user)
}

const handleAuth = async (setUser: (user: User | null) => void) => {
  const queryParams = new URLSearchParams(window.location.search)
  const code = queryParams.get('code')

  if (!code) {
    handleAuthCookie(setUser)
    return
  }

  const data = await api.post<{ user: User }>('auth/code', { code })

  setUser(data?.user ?? null)

  window.history.replaceState({}, document.title, window.location.pathname)
}

const App = () => {
  const dispatch = useStoreDispatch()
  const currentRoute = useStoreSelector((state) => state.route.currentRoute)
  const user = useStoreSelector((state) => state.auth.user)

  useEffect(() => {
    handleAuth((user) => dispatch(setUser(user)))
  }, [])

  useEffect(() => {
    console.log('user changed', user)
  }, [user])

  return (
    <div className="app">
      {(() => {
        if (currentRoute === 'GAME') {
          return <Game />
        } else if (currentRoute === 'ANIMATOR') {
          return <Animator />
        } else if (currentRoute === 'MAP-EDITOR') {
          return <MapEditor />
        }
      })()}
      <Dialogs />
      <BoxOpening />
    </div>
  )
}

export default App
