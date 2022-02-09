import { useContext } from "react";
import { TransactionContext } from '../context/TransactionContext';

const BuyToken = () => {
  const { clickPayWithEth, etherText, buyTokenError, handleTextChange } = useContext(TransactionContext);
  return (
    <div>
      <div className="flex justify-center mt-10">
        <input
          onChange={handleTextChange}
          name="etherText"
          value={etherText}
          placeholder="send ether to buy token"
          className="bg-gray-50 border border-gray-300 text-black-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-screen-md"
        />
      </div>
      <button
        onClick={clickPayWithEth}
        className="text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 mr-2 mb-2"
      >
        <svg className="w-4 h-4 mr-2 -ml-1 text-[#626890]" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="ethereum" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"></path></svg>
        Buy Token
      </button>
      <div className="text-red-500">{buyTokenError}</div>
    </div>
  );
}

export default BuyToken;