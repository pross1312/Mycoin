import React from "react";
import {createRoot} from 'react-dom/client';
import "./index.css";
import { BrowserRouter, useRoutes } from "react-router-dom";
import HomePage from "#/home";
import BlockPage from "#/block";
import TransactionPage from "#/transaction";
import NotFoundPage from "#/404";
import WalletPage from "#/wallet";
import Header from "#/header";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Router({children}) {
  const Routes = () => {
    return useRoutes([
      {path: "/", element: <HomePage/>},
      {path: "/home", element: <HomePage/>},
      {path: "/blocks", element: <BlockPage/>},
      {path: "/transactions", element: <TransactionPage/>},
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

createRoot(document.getElementById('root')).render(
  <div className="bg-black w-screen h-screen flex flex-col justify-start overflow-hidden">
    <ToastContainer/>
    <Router>
      <Header />
    </Router>
  </div>
);
