import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
export const TransactionContext = React.createContext();
const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
  return transactionsContract;
};


function filterErrorMessage(error) {
  const message = (Object.values(error))[2]["message"].split(":");
  const len = message.length;
  return message[len - 1];
}

export const TransactionsProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentPhase, setCurrentPhase] = useState("");
  const [etherText, setEtherText] = useState("");
  const [errorPhase, setErrorPhase] = useState("");
  const [buyTokenError, setBuyTokenError] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [stateError, setStateError] = useState("");
  const [balance, setBalance] = useState("");
  const [balanceAddress, setBalanceAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [whitelistText, setWhitelistText] = useState("");
  const handleTextChange = (e) => {
    if (e.target.name === "etherText") {
      setEtherText(e.target.value);
    } else if (e.target.name === "balanceAddress") {
      setBalanceAddress(e.target.value);
    } else if (e.target.name === "whitelistText") {
      setWhitelistText(e.target.value);
    }
  };
  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log("error from checkIfWalletIsConnect");
      console.log(error);
    }
  };
  const checkCurrentState = async() => {
    try {
      const contract = createEthereumContract();
      const state = await contract.state();
      let ph;
      if (state !== null || state !== undefined) {
        if (state === 0) {
          ph = "Active";
        } else {
          ph = "Paused";
        }
      }
      setCurrentState(ph);
    } catch (error) {
      console.log(error);
      console.log('error from checkCurrentPhase');
    }
  };
  const checkCurrentPhase = async() => {
    try {
      const contract = createEthereumContract();
      const phase = await contract.phase();
      let ph;
      if (phase !== null || phase !== undefined) {
        if (phase === 0) {
          ph = "Seed";
        } else if (phase === 1) {
          ph = "General";
        } else {
          ph = "Open";
        }
      }
      setCurrentPhase(ph);
    } catch (error) {
      console.log(error);
      console.log('error from checkCurrentPhase');
    }
  };
  const clickConnectButton = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      console.log("error from clickConnectButton");
      throw new Error("No ethereum object");
    }
  };
  const accountChange = async () => {
    if (ethereum) {
      ethereum.on("accountsChanged", (account) => {
        if (account.length) {
          setCurrentAccount(account[0]);
        }
      });
    }
  };
  const clickPhaseForward = async () => {
    try {
      const contract = createEthereumContract();
      await contract.phaseForward();
      const phase = await contract.phase();
      setCurrentPhase(phase);
    } catch (error) {
      // setErrorPhase((Object.values(error))[2]["message"]);
      setErrorPhase(filterErrorMessage(error));
      console.log('error from clickPhaseForward');
    }
  };
  const checkBalance = async () => {
    try {
      const contract = createEthereumContract();
      const res = await contract.balanceOf(balanceAddress);
      console.log(res);
      setBalance(parseInt(res._hex));
    } catch (error) {
      // setBuyTokenError((Object.values(error))[2]["message"]);
      console.log(error);
      console.log("error from checkBalance");
    }
  };
  const clickPayWithEth = async () => {
    try {
      setBuyTokenError("");
      const contract = createEthereumContract();
      const res = await contract.buyToken(currentAccount, ethers.utils.parseEther(etherText));
      console.log(res);
    } catch (error) {
      setBuyTokenError(filterErrorMessage(error));
      console.log(error);
      console.log("error from clickPayWithEth");
    }
  };
  const clickChangeState = async () => {
    try {
      const contract = createEthereumContract();
      const state = await contract.state();
      if (state !== null || state !== undefined) {
        if (state === 0) {
          await contract.pause();
        } else {
          await contract.unpause();
        }
      }
    } catch (error) {
      setStateError(filterErrorMessage(error));
      console.log(error);
      console.log("error from clickChangeState");
    }
  };
  const clickAddToWhitelist = async () => {
    try {
      const contract = createEthereumContract();
      await contract.WhitelistedCrowdsale([whitelistText]);
    } catch (error) {
      setStateError(filterErrorMessage(error));
      console.log(error);
      console.log("error from clickAddToWhitelist");
    }
  };
  useEffect(() => {
    checkIfWalletIsConnect();
    checkCurrentPhase();
    accountChange();
    checkCurrentState();
  }, [currentPhase, currentState]);
  return (
    <TransactionContext.Provider
      value={{
        clickConnectButton,
        currentAccount,
        currentPhase,
        clickPhaseForward,
        clickPayWithEth,
        etherText,
        errorPhase,
        buyTokenError,
        clickChangeState,
        currentState,
        stateError,
        handleTextChange,
        balance,
        checkBalance,
        balanceAddress,
        isLoading,
        whitelistText,
        clickAddToWhitelist,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
