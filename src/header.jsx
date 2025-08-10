import {useEffect, useState, useRef} from "react"
import {useNavigate} from "react-router-dom";
import {mapLinkIfNeeded} from "#/utils";
import { FaCoins, FaKey, FaWallet, FaPaperPlane } from "react-icons/fa";
import Api from "#/api";
import FloatOverlay from "#/components/float-overlay";

export default function() {
  const walletInfoRef = useRef({});
  const [walletInfo, setWalletInfo] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    Api.getLocalWallet().then(data => {
      walletInfoRef.current = data;
      setWalletInfo(walletInfoRef.current);
    }).catch(console.error);

    const id = setInterval(() => {
      Api.getLocalWallet().then(data => {
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
        <div className="px-3 py-1 rounded-md bg-gray-800 text-sm border border-gray-700 flex items-center gap-1">
          <FaKey className="text-blue-400" />
          <span className="text-header-gray">Address:</span>&nbsp;
          <span className="font-mono">
            {mapLinkIfNeeded(walletInfo.address, "/wallet", 9999)}
          </span>
        </div>
        <div className="px-3 py-1 rounded-md bg-gray-800 text-sm border border-gray-700 flex items-center gap-1">
          <FaWallet className="text-green-400" />
          <span className="text-header-gray">Balance:</span>&nbsp;
          <span className="font-semibold">{walletInfo.balance}</span>
        </div>
        <button
          className="px-3 py-1 rounded-md bg-gray-800 text-sm border border-gray-700 flex items-center gap-1 hover:bg-gray-700"
          onClick={() => navigate('/send')}>
          <FaPaperPlane className="text-blue-400" />
          <span className="text-header-gray">Transfer</span>
        </button>
      </div>
    </div>
    <FloatOverlay hidden={false}>
      <div className="w-[500px] h-[500px] card">
      </div>
    </FloatOverlay>
  </>
  );
}

