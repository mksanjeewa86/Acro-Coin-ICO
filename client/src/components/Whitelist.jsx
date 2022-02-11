import { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import Loader from "./Loader";

const Whitelist = () => {
  const { clickAddToWhitelist, whitelistText, handleTextChange, whitelistError, isLoading } = useContext(TransactionContext);
  return (
    <div>
      <div className="flex justify-center mt-10">
        <input
          onChange={handleTextChange}
          name="whitelistText"
          value={whitelistText}
          className="bg-gray-50 border border-gray-300 text-black-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-screen-md"
        />
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <button
          onClick={clickAddToWhitelist}
          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          Add to Whitelist
        </button>
      )}
      <div className="text-red-500">{whitelistError}</div>
    </div>
  );
};

export default Whitelist;