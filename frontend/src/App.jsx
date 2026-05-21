import './App.css'
import Admin from './admin/Admin'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>XDPM Admin Dashboard</h1>
          <p>Manage products and orders from one place.</p>
        </div>
      </header>
      <main className="app-main">
        <Admin />
      </main>
    </div>
  )
}

export default App
