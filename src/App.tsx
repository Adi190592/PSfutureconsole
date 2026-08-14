import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import People from './pages/People'
import PersonDetail from './pages/PersonDetail'
import Elements from './pages/Elements'
import ElementDetail from './pages/ElementDetail'
import Placeholder from './pages/Placeholder'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/people" element={<People />} />
        <Route path="/people/:id" element={<PersonDetail />} />
        <Route path="/elements" element={<Elements />} />
        <Route path="/elements/:key" element={<ElementDetail />} />
        <Route path="/awareness" element={<Placeholder title="Awareness Coverage" />} />
        <Route path="/activity" element={<Placeholder title="Signal Feed" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        <Route path="*" element={<Placeholder title="Not found" />} />
      </Route>
    </Routes>
  )
}
