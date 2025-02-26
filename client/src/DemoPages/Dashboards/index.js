import React, { Fragment } from "react";
import { Route } from "react-router-dom";

// Layout

import AppHeader from "../../Layout/AppHeader/";
import AppSidebar from "../../Layout/AppSidebar/";

// Theme Options
import General from "./General/";
import StaffStatistic from "./StaffStatistic";

const Dashboards = ({ url }) => (
  <Fragment>
    <AppHeader />
    <div className="app-main">
      <AppSidebar />
      <div className="app-main__outer">
        <div className="app-main__inner">
          <Route exact path={`${url}/general`} component={General}/>
          <Route exact path={`${url}/staff`} component={StaffStatistic}/>
        </div>
      </div>
    </div>
  </Fragment>
);

export default Dashboards;
