import React, { Fragment } from "react";
import { connect } from "react-redux";

import { Slider } from "react-burgers";

import {
  setEnableMobileMenu,
  setEnableMobileMenuSmall,
} from "../../reducers/ThemeOptions";
import { logout } from "../../reducers/userSlice";
import { Redirect } from "react-router-dom";
import UserBoxMobile from "./UserBoxMobile";

class AppMobileMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      mobile: false,
      activeSecondaryMenuMobile: false,
    };
  }

  toggleMobileSidebar = () => {
    let { enableMobileMenu, setEnableMobileMenu } = this.props;
    setEnableMobileMenu(!enableMobileMenu);
  };

  toggleMobileSmall = () => {
    let { enableMobileMenuSmall, setEnableMobileMenuSmall } = this.props;
    setEnableMobileMenuSmall(!enableMobileMenuSmall);
  };

  state = {
    openLeft: false,
    openRight: false,
    relativeWidth: false,
    width: 280,
    noTouchOpen: false,
    noTouchClose: false,
  };

  render() {
    let {
        user
    } = this.props;
    if (!user) {
        return <Redirect to="/login" />
    }
    return (
      <Fragment>
        <div className="app-header__mobile-menu">
          <div onClick={this.toggleMobileSidebar}>
            <Slider width={26} lineHeight={2} lineSpacing={5} color="#6c757d" 
              active={this.state.active} onClick={() => this.setState({ active: !this.state.active })}/>
          </div>
        </div>
        <div className="app-header__menu">
          <div className="app-header-right">
              <UserBoxMobile user={user} logout={this.props.logout}/>
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  closedSmallerSidebar: state.ThemeOptions.closedSmallerSidebar,
  enableMobileMenu: state.ThemeOptions.enableMobileMenu,
  enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
  user: state.user.user || null
});

const mapDispatchToProps = (dispatch) => ({
  setEnableMobileMenu: (enable) => dispatch(setEnableMobileMenu(enable)),
  setEnableMobileMenuSmall: (enable) =>
    dispatch(setEnableMobileMenuSmall(enable)),
      logout: () => dispatch(logout())
  
});

export default connect(mapStateToProps, mapDispatchToProps)(AppMobileMenu);
