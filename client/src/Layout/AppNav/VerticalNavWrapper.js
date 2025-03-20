import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import MetisMenu from "react-metismenu";
import { setEnableMobileMenu } from "../../reducers/ThemeOptions";
import {
    MainNav,
} from "./NavItems";

class Nav extends Component {
    state = {};

    toggleMobileSidebar = () => {
        let { enableMobileMenu, setEnableMobileMenu } = this.props;
        setEnableMobileMenu(!enableMobileMenu);
    };

    render() {
        const { user } = this.props;

        let filteredNav = MainNav.filter(item => {
            if (item.label === "Phân quyền hệ thống") {
                return user?.is_admin === 1;
            }
            return true;
        });
        
        const filteredNav2 = filteredNav[0].content.filter(item => {
            if (item.label === "Thống kê chung") {
                return user?.is_admin === 1;
            }
            return true;
        });

        filteredNav[0].content = filteredNav2;

        if (user?.is_admin !== 1) {
            const filteredNav3 = filteredNav[2].content.filter(item => {
                if (item.label === "Cấu hình ngân hàng" || item.label === "Cấu hình phí") {
                    return user?.is_admin === 1;
                }
                return true;
            });
    
            filteredNav[2].content = filteredNav3;
        }
        

        return (
            <Fragment>
                <h5 className="app-sidebar__heading">Menu</h5>
                <MetisMenu content={filteredNav} onSelected={this.toggleMobileSidebar} activeLinkFromLocation
                    className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>

                {/* <h5 className="app-sidebar__heading">UI Components</h5>
                <MetisMenu content={ComponentsNav} onSelected={this.toggleMobileSidebar} activeLinkFromLocation
                    className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>

                <h5 className="app-sidebar__heading">Dashboard Widgets</h5>
                <MetisMenu content={WidgetsNav} onSelected={this.toggleMobileSidebar} activeLinkFromLocation
                    className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>

                <h5 className="app-sidebar__heading">Forms</h5>
                <MetisMenu content={FormsNav} onSelected={this.toggleMobileSidebar} activeLinkFromLocation
                    className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/>

                <h5 className="app-sidebar__heading">Charts</h5>
                <MetisMenu content={ChartsNav} onSelected={this.toggleMobileSidebar} activeLinkFromLocation
                    className="vertical-nav-menu" iconNamePrefix="" classNameStateIcon="pe-7s-angle-down"/> */}
            </Fragment>
        );
    }

    isPathActive(path) {
      return this.props.location.pathname.startsWith(path);
    }
}
const mapStateToProps = (state) => ({
    enableMobileMenu: state.ThemeOptions.enableMobileMenu,
    user: state.user.user,
});

const mapDispatchToProps = (dispatch) => ({
    setEnableMobileMenu: (enable) => dispatch(setEnableMobileMenu(enable)),
});
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Nav));
