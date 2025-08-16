import {useEffect, useState, useRef} from "react"
import {useNavigate} from "react-router-dom";
import {mapLinkIfNeeded, displayError, getFullLink, displaySuccess, formatCurrency} from "#/utils";
import {AiOutlineTransaction} from "react-icons/ai";
import {FaCoins, FaKey, FaWallet, FaPaperPlane} from "react-icons/fa";
import Api from "#/api";
import FloatOverlay from "#/components/float-overlay";
import Clipboard from "#/components/clipboard";

function SendForm() {
  const addressRef = useRef();
  const amountRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    Api.newTransaction(addressRef.current.value, amountRef.current.value).then(response => {
      displaySuccess("Successfully created new transaction");
    }).catch(displayError);
  };

  return (
    <div className="card w-full h-fit p-4 flex flex-col gap-4 text-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="w-full font-bold text-center flex gap-1">
          <div className="w-fit h-fit text-xl my-auto">
            <AiOutlineTransaction/>
          </div>
          <span className="align-center">New Transaction</span>
        </div>
        <input
          ref={addressRef}
          type="text"
          placeholder="Recipient Address"
          className="input w-full header-box px-3 py-1"
          required
        />
        <input
          ref={amountRef}
          type="number"
          step="0.01"
          placeholder="Amount"
          className="input w-full header-box px-3 py-1 custom-scrollbar-number"
          required
        />
        <div className="w-full">
          <button type="submit" className="btn w-fit header-box px-3 py-1 float float-right cursor-pointer hover:bg-gray-700">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default function() {
  const walletInfoRef = useRef({});
  const [walletInfo, setWalletInfo] = useState(false);
  const [overlayVisible, setOverlayVisisble] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    Api.getWalletInfo().then(data => {
      walletInfoRef.current = data;
      setWalletInfo(walletInfoRef.current);
    }).catch(console.error);

    const id = setInterval(() => {
      Api.getWalletInfo().then(data => {
        if (data.balance !== walletInfoRef.current.balance || data.address.full !== walletInfoRef.current.address.full || data.address.short !== walletInfoRef.current.address.short) {
          walletInfoRef.current = data;
          setWalletInfo(walletInfoRef.current);
        }
      }).catch(console.error);
    }, 2000);

    return () => clearInterval(id);
  }, []);
  return (
  <>
    <div className="w-full h-fit flex items-center justify-between p-2 text-white border-b border-gray-700 shadow-md">
      <div
        className="flex items-center gap-2 text-lg font-bold tracking-wide cursor-pointer"
        onClick={() => navigate('/')}
      >
        <FaCoins className="text-yellow-400" />
        My Coin
      </div>
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 header-box flex items-center gap-1">
          <FaKey className="text-blue-400" />
          <span className="text-header-gray">Address:</span>&nbsp;
          <span className="font-mono">
            {mapLinkIfNeeded(walletInfo.address, "/wallet", 9999)}
          </span>
          <div className="h-full">
            <Clipboard text={getFullLink(walletInfo.address)}/>
          </div>
        </div>
        <div className="px-3 py-1 header-box flex items-center gap-1">
          <FaWallet className="text-green-400" />
          <span className="text-header-gray">Balance:</span>&nbsp;
          <span className="font-semibold">{formatCurrency(walletInfo.balance || 0)}</span>
        </div>
        <button className="px-3 py-1 header-box flex items-center gap-1 hover:bg-gray-700 cursor-pointer"
                onClick={() => setOverlayVisisble(true)}>
          <FaPaperPlane className="text-blue-400" />
          <span className="text-header-gray">Transfer</span>
        </button>
      </div>
    </div>
    <FloatOverlay hidden={!overlayVisible} onClick={() => setOverlayVisisble(false)}>
      <div className="w-[500px] h-[500px] flex justify-center flex-col">
        <SendForm/>
      </div>
    </FloatOverlay>
  </>
  );
}

