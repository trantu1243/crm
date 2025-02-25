import React, { Fragment } from "react";
import cx from "classnames";

import { connect } from "react-redux";

import { CSSTransition, TransitionGroup } from 'react-transition-group';

import HeaderLogo from "../AppLogo";

import UserBox from "./Components/UserBox";
import { Redirect } from "react-router-dom";
import { logout } from "../../reducers/userSlice";

class Header extends React.Component {

    checkLogin() {
        let { user } = this.props;
        if (!user) {
            window.location.href = "/login";
        }
    }

    render() {
        let {
            headerBackgroundColor,
            enableHeaderShadow,
            user
        } = this.props;
        if (!user) {
            return <Redirect to="/login" />
        }
        return (
            <Fragment>
                <TransitionGroup>
                    <CSSTransition component="div"
                        className={cx("app-header", headerBackgroundColor, {
                          "header-shadow": enableHeaderShadow,
                        })}
                        appear={true} timeout={1500} enter={false} exit={false}
                    >
                        <div>
                            <HeaderLogo />
                            <div className={cx("app-header__content")}>
                                <div className="app-header-right">
                                    <UserBox user={user} logout={this.props.logout}/>
                                </div>
                            </div>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    enableHeaderShadow: state.ThemeOptions.enableHeaderShadow,
    closedSmallerSidebar: state.ThemeOptions.closedSmallerSidebar,
    headerBackgroundColor: state.ThemeOptions.headerBackgroundColor,
    enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
    user: state.user.user || null
});

const mapDispatchToProps = (dispatch) => ({
    logout: () => dispatch(logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
