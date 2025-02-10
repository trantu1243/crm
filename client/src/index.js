import "./polyfills";
import React from "react";
import ReactDOM from "react-dom";
import { Helmet } from "react-helmet";

import * as serviceWorker from "./serviceWorker";
import * as process from 'process';

import { BrowserRouter, HashRouter } from "react-router-dom";
import "./assets/base.scss";
import Main from "./DemoPages/Main";
import configureStore from "./config/configureStore";
import { Provider } from "react-redux";

const store = configureStore();
const rootElement = document.getElementById("root");

window.global = window;
window.process = process;
window.Buffer = [];

const renderApp = (Component) => {
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <>
          <Helmet>
            <meta name="robots" content="noindex, nofollow" />
          </Helmet>
          <Component />
        </> 
      </BrowserRouter>
    </Provider>,
    rootElement
  );
};

renderApp(Main);

if (module.hot) {
  module.hot.accept("./DemoPages/Main", () => {
    const NextApp = require("./DemoPages/Main").default;
    renderApp(NextApp);
  });
}
serviceWorker.unregister();
