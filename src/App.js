import AppLogo from './AppLogo.png'
import './App.css';
import BootstrapMessaging from './bootstrapMessaging';
import Main from './main'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={AppLogo} className="App-logo" alt="logo" />
        <Main />
      </header>
    </div>
  );
}

export default App;
