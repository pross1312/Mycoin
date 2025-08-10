import React, {useEffect, useState, useRef} from "react";
import {mapLinkIfNeeded} from "#/utils";
import {createRoot} from 'react-dom/client';
import Api from "#/api";
import "./index.css";
// import { ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter, useRoutes } from "react-router-dom";
import HomePage from "#/home";
import BlockPage from "#/block";
import NotFoundPage from "#/404";
import WalletPage from "#/wallet";

function Router({children}) {
  const Routes = () => {
    return useRoutes([
      {path: "/", element: <HomePage/>},
      {path: "/home", element: <HomePage/>},
      {path: "/blocks", element: <BlockPage/>},
      {path: "/wallet/*", element: <WalletPage/>},
      {path: "*", element: <NotFoundPage/>},
    ]);
  }
  return (
    <BrowserRouter>
      {children}
      <Routes/>
    </BrowserRouter>
  );
}

function Header({}) {
  const walletInfoRef = useRef({});
  const [walletInfo, setWalletInfo] = useState(false);
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
    <div className="w-full h-fit flex items-center justify-between p-2 text-white border-b border-gray-700 shadow-md">
      <div className="flex items-center gap-2 text-lg font-bold tracking-wide">
        🪙 My Coin
      </div>
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 rounded-md bg-gray-800 text-sm border border-gray-700 ">
          🔑 <span className="text-gray-300">Address:</span>&nbsp;
          <span className="font-mono">{mapLinkIfNeeded(walletInfo.address, "/wallet", 9999)}</span>
        </div>
        <div className="px-3 py-1 rounded-md bg-gray-800 text-sm border border-gray-700">
          💰 <span className="text-gray-300">Balance:</span>&nbsp;
          <span className="font-semibold">{walletInfo.balance}</span>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <div className="bg-black w-screen h-screen flex flex-col justify-start overflow-hidden">
    <Router>
      <Header />
    </Router>
  </div>
);
