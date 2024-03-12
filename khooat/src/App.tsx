import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/home/home'
import { LoginSignInPage } from './pages/login/LoginSignUpForm'
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

function App() {

  return (
    <>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
            <Route path="/" Component={HomePage}  /> {/* 👈 Renders at /app/ */}
            <Route path="/login" Component={LoginSignInPage}  /> {/* 👈 Renders at /app/ */}
        </Routes>
      </BrowserRouter>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={true} />

    </QueryClientProvider>
      
    </>
  )
}

export default App
