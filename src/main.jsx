import React from "react";
import { createRoot } from 'react-dom/client';
import Home from "./home";
import "./index.css";
// import { ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <>
    <Home/>
  </>
);

