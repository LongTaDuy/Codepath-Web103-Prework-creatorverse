import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import AddCreator from './pages/AddCreator.jsx'
import EditCreator from './pages/EditCreator.jsx'
import ShowCreators from './pages/ShowCreators.jsx'
import ViewCreator from './pages/ViewCreator.jsx'

function App() {
  return (
    <>
      <Navbar />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<ShowCreators />} />
          <Route path="/creator/:id" element={<ViewCreator />} />
          <Route path="/new" element={<AddCreator />} />
          <Route path="/edit/:id" element={<EditCreator />} />
        </Routes>
      </main>
    </>
  )
}

export default App
