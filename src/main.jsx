import React from "react";
import { createRoot } from 'react-dom/client';
import "./index.css";
// import { ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter, useRoutes } from "react-router-dom";
import HomePage from "#/home";
import BlockPage from "#/block";
import NotFoundPage from "#/404";

function Router() {
  const Routes = () => {
    return useRoutes([
      {path: "/", element: <HomePage/>},
      {path: "/home", element: <HomePage/>},
      {path: "/blocks", element: <BlockPage/>},
      {path: "*", element: <NotFoundPage/>},
    ]);
  }
  return (
    <BrowserRouter>
      <Routes/>
    </BrowserRouter>
  );
}
createRoot(document.getElementById('root')).render(
  <div className="bg-black w-screen h-screen">
    <Router/>
  </div>
);

