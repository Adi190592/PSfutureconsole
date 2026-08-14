import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import LiveOps from './pages/LiveOps'
import People from './pages/People'
import PersonDetail from './pages/PersonDetail'
import Elements from './pages/Elements'
import ElementDetail from './pages/ElementDetail'
import Integrations from './pages/Integrations'
import Placeholder from './pages/Placeholder'
import { IntegrationsProvider } from './store/integrations'

export default function App() {
  return (
    <IntegrationsProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/live" element={<LiveOps />} />
          <Route path="/people" element={<People />} />
          <Route path="/people/:id" element={<PersonDetail />} />
          <Route path="/elements" element={<Elements />} />
          <Route path="/elements/:key" element={<ElementDetail />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="*" element={<Placeholder title="Not found" />} />
        </Route>
      </Routes>
    </IntegrationsProvider>
  )
}
