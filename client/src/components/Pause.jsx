import { useContext } from "react";
import { TransactionContext } from '../context/TransactionContext';

const Pause = () => {
  const { clickChangeState, currentState, stateError } = useContext(TransactionContext);
  return (
    <div className="mt-10">
      <button
        onClick={clickChangeState}
        className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >
        {currentState === "Active" ? "Pause the Project" : "Resume the Project"}
      </button>
      <h3 className="decoration-red-500">Current State: <b>{currentState}</b></h3>
      <div className="text-red-500">{stateError}</div>
    </div>
  );
}

export default Pause;