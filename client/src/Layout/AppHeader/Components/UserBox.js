import React, { Fragment } from "react";

import PerfectScrollbar from "react-perfect-scrollbar";

import {
    DropdownToggle,
    DropdownMenu,
    Nav,
    Button,
    NavItem,
    NavLink,
    UncontrolledButtonDropdown,
} from "reactstrap";

import { toast, Bounce } from "react-toastify";

import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import 'react-toastify/dist/ReactToastify.css';

import city3 from "../../../assets/utils/images/dropdown-header/city3.jpg";
import { SERVER_URL } from "../../../services/url";

class UserBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
        };
    }

    notify2 = () =>
        (this.toastId = toast(
            "You don't have any new items in your calendar for today! Go out and play!",
            {
                transition: Bounce,
                closeButton: true,
                autoClose: 5000,
                position: "bottom-center",
                type: "success",
            }
        ));

    render() {
        const { user, logout } = this.props;
        return (
            <Fragment>
                <div className="header-btn-lg pe-0">
                    <div className="widget-content p-0">
                        <div className="widget-content-wrapper">
                            <div className="widget-content-left">
                                <UncontrolledButtonDropdown>
                                    <DropdownToggle color="link" className="p-0 pt-1">
                                        <img className="rounded-circle" src={`${SERVER_URL}${user.avatar}`} alt="" style={{width: 42, height: 42, objectFit: 'cover'}}/>
                                        <FontAwesomeIcon
                                            className="ms-2 opacity-8"
                                            icon={faAngleDown}
                                        />
                                    </DropdownToggle>
                                    <DropdownMenu end className="rm-pointers dropdown-menu-lg">
                                        <div className="dropdown-menu-header">
                                            <div className="dropdown-menu-header-inner bg-info">
                                                <div className="menu-header-image opacity-2"
                                                  style={{
                                                    backgroundImage: "url(" + city3 + ")",
                                                  }}/>
                                                <div className="menu-header-content text-start">
                                                    <div className="widget-content p-0">
                                                        <div className="widget-content-wrapper">
                                                            <div className="widget-content-left me-3">
                                                                <img className="rounded-circle" src={`${SERVER_URL}${user.avatar}`} alt="" style={{width: 42, height: 42, objectFit: 'cover'}}/>
                                                            </div>
                                                            <div className="widget-content-left">
                                                                <div className="widget-heading">
                                                                    {user.name_staff}
                                                                </div>
                                                                <div className="widget-subheading opacity-8">
                                                                    {user.is_admin ? 'Quản trị viên' : 'Nhân viên'}
                                                                </div>
                                                            </div>
                                                            <div className="widget-content-right me-2">
                                                                <Button className="btn-pill btn-shadow btn-shine" color="focus" onClick={logout}>
                                                                    Đăng xuất
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="scroll-area-xs"
                                          style={{
                                            height: "120px",
                                          }}>
                                          <PerfectScrollbar>
                                            <Nav vertical>
                                                <NavItem className="nav-item-header">
                                                    Menu
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink href="#">
                                                        Thông tin cá nhân
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink href="#">Đổi mật khẩu</NavLink>
                                                </NavItem>
                                            
                                            </Nav>
                                          </PerfectScrollbar>
                                        </div>
                                    
                              
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </div>
                            <div className="widget-content-left  ms-3 header-user-info">
                                <div className="widget-heading">{user.name_staff}</div>
                                <div className="widget-subheading"> {user.is_admin ? 'Quản trị viên' : 'Nhân viên'}</div>
                            </div>
                        
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default UserBox;
