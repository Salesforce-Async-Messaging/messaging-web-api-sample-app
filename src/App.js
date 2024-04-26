import logo from './logo.svg';
import './App.css';
import MessagingButton from './messagingButton';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>MIAW Sample App - Let's go!!!</p>
        <MessagingButton />
      </header>
    </div>
  );
}

export default App;
