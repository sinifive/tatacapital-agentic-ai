import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TataCapitalPrototype from './pages/TataCapitalPrototype'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TataCapitalPrototype />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
