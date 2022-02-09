import './App.css';
import Wallet from './components/Wallet';
import Phase from './components/Phase';
import BuyToken from './components/BuyToken';
import Pause from './components/Pause';
import Balance from './components/Balance';
import Whitelist from './components/Whitelist';

function App() {
  return (
    <div className="App">
      <div>
        <Wallet />
        <hr />
        <Phase />
        <hr />
        <BuyToken />
        <hr />
        <Pause />
        <hr />
        <Balance />
        <hr />
        <Whitelist />
      </div>
    </div>
  )
}

export default App
