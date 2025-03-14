import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './redux/store.ts'
import './styles/main.scss'
// import { CanvasPlayground } from './components/canvas-playground/CanvasPlayground.tsx'
import './tailwind.css'
import App from '@/App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
)
