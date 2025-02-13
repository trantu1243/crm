import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import { withRouter } from "react-router-dom";
import AppMain from "../../Layout/AppMain";

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            closedSmallerSidebar: false,
            containerWidth: window.innerWidth < 1250,
        };
    }

    updateWidth = () => {
        this.setState({ containerWidth: window.innerWidth < 1250});
    };

    componentDidMount() {
        window.addEventListener("resize", this.updateWidth);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWidth);
    }

    render() {
        let {
            colorScheme,
            enableFixedHeader,
            enableFixedSidebar,
            enableFixedFooter,
            enableClosedSidebar,
            closedSmallerSidebar,
            enableMobileMenu,
            enablePageTabsAlt,
        } = this.props;

        return (
            <Fragment>
                <div
                    className={cx(
                        "app-container app-theme-" + colorScheme,
                        { "fixed-header": enableFixedHeader },
                        { "fixed-sidebar": enableFixedSidebar || this.state.containerWidth },
                        { "closed-sidebar": enableClosedSidebar || this.state.containerWidth },
                        {
                            "closed-sidebar-mobile": closedSmallerSidebar || this.state.containerWidth,
                        },
                        { "sidebar-mobile-open": enableMobileMenu },
                        { "body-tabs-shadow-btn": enablePageTabsAlt }
                    )}
                >
                    <AppMain />
                </div>
            </Fragment>
        );
    }
}

const mapStateToProp = (state) => ({
    colorScheme: state.ThemeOptions.colorScheme,
    enableFixedHeader: state.ThemeOptions.enableFixedHeader,
    enableMobileMenu: state.ThemeOptions.enableMobileMenu,
    enableFixedFooter: state.ThemeOptions.enableFixedFooter,
    enableFixedSidebar: state.ThemeOptions.enableFixedSidebar,
    enableClosedSidebar: state.ThemeOptions.enableClosedSidebar,
    enablePageTabsAlt: state.ThemeOptions.enablePageTabsAlt,
});

export default withRouter(connect(mapStateToProp)(Main));
