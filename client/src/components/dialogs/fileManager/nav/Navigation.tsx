import React from 'react'
import './navigation.scss'
import { useStoreDispatch, useStoreSelector } from '@/redux/hooks'
import Button from '@/components/general/button/Button'
import { Route, routes, setCurrentRoute } from '@/redux/reducers/fileManager'

const Navigation: React.FC = () => {
  const dispatch = useStoreDispatch()
  const currentRoute = useStoreSelector(state => state.fileManager.currentRoute)

  const setRoute = (route: Route) => {
    dispatch(setCurrentRoute(route))
  }

  return (
    <nav className="nav">
      {
        routes.map(routeObj => {
          const { label, route } = routeObj
          const isActive = route === currentRoute

          return (
            <Button 
              className='nav-button' 
              key={route} 
              variant={isActive ? 'primary' : 'secondary'}
              onClick={() => setRoute(route)}
            >
              { label }
            </Button>
          )
        })
      }
    </nav>
  )
}

export default Navigation
