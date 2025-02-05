import React, { Fragment } from "react";
import { Route } from "react-router-dom";

// DASHBOARDS

import AnalyticsDashboard from "./Analytics/";
import SalesDashboard from "./Sales/";
import CommerceDashboard from "./Commerce/";
import CRMDashboard from "./CRM/";
import MinimalDashboard1 from "./Minimal/Variation1";
import MinimalDashboard2 from "./Minimal/Variation2";

// Layout

import AppHeader from "../../Layout/AppHeader/";
import AppSidebar from "../../Layout/AppSidebar/";
import AppFooter from "../../Layout/AppFooter/";

// Theme Options
import ThemeOptions from "../../Layout/ThemeOptions/";

const Dashboards = ({ url }) => (
  <Fragment>
    <ThemeOptions />
    <AppHeader />
    <div className="app-main">
      <AppSidebar />
      <div className="app-main__outer">
        <div className="app-main__inner">
          <Route exact path={`${url}/analytics`} component={AnalyticsDashboard}/>
          <Route exact path={`${url}/sales`} component={SalesDashboard} />
          <Route exact path={`${url}/commerce`} component={CommerceDashboard} />
          <Route exact path={`${url}/crm`} component={CRMDashboard} />
          <Route exact path={`${url}/minimal-dashboard-1`} component={MinimalDashboard1}/>
          <Route exact path={`${url}/minimal-dashboard-2`} component={MinimalDashboard2}/>
        </div>
        <AppFooter />
      </div>
    </div>
  </Fragment>
);

export default Dashboards;
