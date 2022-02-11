import './App.css';
import Wallet from './components/Wallet';
import Phase from './components/Phase';
import BuyToken from './components/BuyToken';
import Pause from './components/Pause';
import Balance from './components/Balance';
import Whitelist from './components/Whitelist';
import WithdrawToken from './components/WithdrawToken';
import { useContext } from "react";
import { TransactionContext } from "./context/TransactionContext";

function App() {
  const { currentAccount, currentPhase } = useContext(TransactionContext);
  return (
    <div className="App">
      <div>
        <Wallet />
        {currentAccount !== "" && (
          <>
            <hr />
            <Phase />
            <hr />
            <BuyToken />
            <hr />
            <Pause />
            <hr />
            <Balance />
            {currentPhase === "Seed" && (
              <>
                <hr />
                <Whitelist />
              </>
            )}
            {currentPhase === "Open" && (
              <>
                <hr />
                <WithdrawToken />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
