import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
          <Route path="/login" Component={() => <div>login</div>}  /> {/* 👈 Renders at /app/ */}
          <Route path="/" Component={() => <div>home</div>}  /> {/* 👈 Renders at /app/ */}
      </Routes>
    </BrowserRouter>
      
    </>
  )
}

export default App
