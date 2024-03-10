import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/home/home'

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
          <Route path="/" Component={HomePage}  /> {/* 👈 Renders at /app/ */}
          <Route path="/login" Component={() => <div>login</div>}  /> {/* 👈 Renders at /app/ */}
      </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
