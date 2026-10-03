
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css";

// const rootElement = document.getElementById("root")!;

// if (rootElement.innerHTML.trim().length > 0) {
//   ReactDOM.hydrateRoot(
//     rootElement,
//     <React.StrictMode>
//       <App />
//     </React.StrictMode>
//   );
// } else {
//   ReactDOM.createRoot(rootElement).render(
//     <React.StrictMode>
//       <App />
//     </React.StrictMode>
//   );
// }



import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SsrDataProvider, type SsrDataBag } from './ssr/SsrDataContext'
import './index.css'

declare global {
  interface Window { __SSR_DATA__?: SsrDataBag; }
}

const rootElement = document.getElementById('root')!;
const ssrData: SsrDataBag = window.__SSR_DATA__ ?? {};

const AppWithData = (
  <SsrDataProvider data={ssrData}>
    <App />
  </SsrDataProvider>
);

if (rootElement.innerHTML.trim().length > 0) {
  ReactDOM.hydrateRoot(rootElement, <React.StrictMode>{AppWithData}</React.StrictMode>);
} else {
  ReactDOM.createRoot(rootElement).render(<React.StrictMode>{AppWithData}</React.StrictMode>);
}