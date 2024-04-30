import logo from './logo.svg';
import './App.css';
import BootstrapMessaging from './bootstrapMessaging';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <BootstrapMessaging />
      </header>
    </div>
  );
}

export default App;
