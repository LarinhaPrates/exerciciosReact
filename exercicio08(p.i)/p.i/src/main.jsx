import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Cadastrar from './Cadastrar.jsx'

function Root() {
  const [page, setPage] = useState('cadastrar')

  function goToApp() {
    setPage('app')
  }

  function goToCadastrar() {
    setPage('cadastrar')
  }

  return page === 'app' ? <App goToCadastrar={goToCadastrar} /> : <Cadastrar goToApp={goToApp} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
