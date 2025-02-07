import React, { Fragment } from "react";
import { Route } from "react-router-dom";

// USER PAGES

import Login from "./Login/";
import LoginBoxed from "./LoginBoxed/";

import Register from "./Register/";
import RegisterBoxed from "./RegisterBoxed/";

import ForgotPassword from "./ForgotPassword/";
import ForgotPasswordBoxed from "./ForgotPasswordBoxed/";

const UserPages = ({ match }) => (
    <Fragment>
        <div className="app-container">
            <LoginBoxed />
        
        </div>
    </Fragment>
);

export default UserPages;
