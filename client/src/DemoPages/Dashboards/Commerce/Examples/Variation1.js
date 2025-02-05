import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";
import React, { Fragment, Component } from "react";
import LiquidFillGauge from "react-liquid-gauge";
import {
  Row,
  Col,
  Button,
  Nav,
  NavItem,
  Card,
  CardBody,
  CardTitle,
  NavLink,
  Container,
  Table,
  CardHeader,
  CardFooter,
  ButtonGroup,
  Popover,
  PopoverBody,
  ListGroupItem,
  ListGroup,
} from "reactstrap";

import bg1 from "../../../../assets/utils/images/dropdown-header/abstract1.jpg";

import classnames from "classnames";

import avatar1 from "../../../../assets/utils/images/avatars/1.jpg";
import avatar2 from "../../../../assets/utils/images/avatars/2.jpg";
import avatar3 from "../../../../assets/utils/images/avatars/3.jpg";
import avatar4 from "../../../../assets/utils/images/avatars/4.jpg";

import { Sparklines, SparklinesBars, SparklinesLine } from "react-sparklines";

function boxMullerRandom() {
  let phase = true,
    x1,
    x2,
    w;

  return (function () {
    if (phase) {
      do {
        x1 = 2.0 * Math.random() - 1.0;
        x2 = 2.0 * Math.random() - 1.0;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1.0);

      w = Math.sqrt((-2.0 * Math.log(w)) / w);
      return x1 * w;
    } else {
      return x2 * w;
    }
  })();
}

function randomData(n = 30) {
  return Array.apply(0, Array(n)).map(boxMullerRandom);
}

const sampleData = randomData(10);

export default class CommerceDashboard1 extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.togglePop1 = this.togglePop1.bind(this);
    this.togglePop2 = this.togglePop2.bind(this);
    this.togglePop3 = this.togglePop3.bind(this);
    this.togglePop4 = this.togglePop4.bind(this);

    this.state = {
      activeTab: "1",
      popoverOpen1: false,
      popoverOpen2: false,
      popoverOpen3: false,
      popoverOpen4: false,
      value: 45,
      value2: 72,
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  }

  togglePop1() {
    this.setState({
      popoverOpen1: !this.state.popoverOpen1,
    });
  }

  togglePop2() {
    this.setState({
      popoverOpen2: !this.state.popoverOpen2,
    });
  }

  togglePop3() {
    this.setState({
      popoverOpen3: !this.state.popoverOpen3,
    });
  }

  togglePop4() {
    this.setState({
      popoverOpen4: !this.state.popoverOpen4,
    });
  }

  startColor = "#6495ed"; // cornflowerblue
  endColor = "#dc143c"; // crimson

  render() {
    return (
      <Fragment>
        <Container fluid>
          <Row>
            <Col md="12">
              <Card className="main-card mb-3">
                <CardHeader>
                  Active Users
                  <div className="btn-actions-pane-right">
                    <ButtonGroup size="sm">
                      <Button caret="true" color="focus" className={"active"}>
                        Last Week
                      </Button>
                      <Button caret="true" color="focus">
                        All Month
                      </Button>
                    </ButtonGroup>
                  </div>
                </CardHeader>
                <Table responsive hover striped borderless className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="text-center">#</th>
                      <th>Name</th>
                      <th className="text-center">City</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Sales</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-center text-muted">#345</td>
                      <td>
                        <div className="widget-content p-0">
                          <div className="widget-content-wrapper">
                            <div className="widget-content-left me-3">
                              <div className="widget-content-left">
                                <img width={40} className="rounded-circle" src={avatar2} alt=""/>
                              </div>
                            </div>
                            <div className="widget-content-left flex2">
                              <div className="widget-heading">John Doe</div>
                              <div className="widget-subheading opacity-7">
                                Web Developer
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">Madrid</td>
                      <td className="text-center">
                        <div className="badge bg-warning">Pending</div>
                      </td>
                      <td className="text-center" style={{ width: "150px" }}>
                        <Sparklines height={60} data={sampleData}>
                          <SparklinesLine
                            style={{
                              strokeWidth: 3,
                              stroke: "#545cd8",
                              fill: "none",
                            }}/>
                        </Sparklines>
                      </td>
                      <td className="text-center">
                        <Button size="sm" color="primary" id={"PopoverCustomT-1"} onClick={this.togglePop1}>
                          Details
                        </Button>
                        <Popover className="popover-custom rm-pointers" placement="auto" isOpen={this.state.popoverOpen1}
                          target={"PopoverCustomT-1"} toggle={this.togglePop1}>
                          <PopoverBody>
                            <div className="dropdown-menu-header">
                              <div
                                className={classnames(
                                  "dropdown-menu-header-inner bg-focus"
                                )}>
                                <div className="menu-header-image"
                                  style={{
                                    backgroundImage: "url(" + bg1 + ")",
                                  }}/>
                                <div className="menu-header-content">
                                  <h5 className="menu-header-title">
                                    Settings
                                  </h5>
                                  <h6 className="menu-header-subtitle">
                                    Manage all of your options
                                  </h6>
                                </div>
                              </div>
                            </div>
                            <Nav vertical>
                              <NavItem className="nav-item-header">
                                Activity
                              </NavItem>
                              <NavItem>
                                <NavLink href="#">
                                  Chat
                                  <div className="ms-auto badge rounded-pill bg-info">
                                    8
                                  </div>
                                </NavLink>
                              </NavItem>
                              <NavItem>
                                <NavLink href="#">Recover Password</NavLink>
                              </NavItem>
                              <NavItem className="nav-item-divider" />
                              <NavItem className="nav-item-btn text-center">
                                <Button size="sm" className="btn-wide btn-shadow" color="danger">
                                  Cancel
                                </Button>
                              </NavItem>
                            </Nav>
                          </PopoverBody>
                        </Popover>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-center text-muted">#347</td>
                      <td>
                        <div className="widget-content p-0">
                          <div className="widget-content-wrapper">
                            <div className="widget-content-left me-3">
                              <div className="widget-content-left">
                                <img width={40} className="rounded-circle" src={avatar1} alt=""/>
                              </div>
                            </div>
                            <div className="widget-content-left flex2">
                              <div className="widget-heading">
                                Ruben Tillman
                              </div>
                              <div className="widget-subheading opacity-7">
                                Etiam sit amet orci eget
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">Berlin</td>
                      <td className="text-center">
                        <div className="badge bg-success">Completed</div>
                      </td>
                      <td className="text-center" style={{ width: "150px" }}>
                        <Sparklines height={60} data={sampleData}>
                          <SparklinesBars
                            style={{
                              stroke: "none",
                              fill: "#3ac47d",
                              fillOpacity: ".5",
                            }}/>
                        </Sparklines>
                      </td>
                      <td className="text-center">
                        <Button size="sm" color="primary" id={"PopoverCustomT-2"} onClick={this.togglePop2}>
                          Details
                        </Button>
                        <Popover className="popover-custom rm-pointers" placement="auto" isOpen={this.state.popoverOpen2}
                          target={"PopoverCustomT-2"} toggle={this.togglePop2}>
                          <PopoverBody>
                            <div className="dropdown-menu-header">
                              <div
                                className={classnames(
                                  "dropdown-menu-header-inner bg-danger"
                                )}>
                                <div className="menu-header-image"
                                  style={{
                                    backgroundImage: "url(" + bg1 + ")",
                                  }}/>
                                <div className="menu-header-content">
                                  <h5 className="menu-header-title">
                                    Settings
                                  </h5>
                                  <h6 className="menu-header-subtitle">
                                    Manage all of your options
                                  </h6>
                                </div>
                              </div>
                            </div>
                            <Nav vertical>
                              <NavItem className="nav-item-header">
                                Activity
                              </NavItem>
                              <NavItem>
                                <NavLink href="#">
                                  Chat
                                  <div className="ms-auto badge rounded-pill bg-info">
                                    8
                                  </div>
                                </NavLink>
                              </NavItem>
                              <NavItem>
                                <NavLink href="#">Recover Password</NavLink>
                              </NavItem>
                              <NavItem className="nav-item-divider" />
                              <NavItem className="nav-item-btn text-end">
                                <Button size="sm" className="btn-wide btn-shadow" color="success">
                                  Save
                                </Button>
                              </NavItem>
                            </Nav>
                          </PopoverBody>
                        </Popover>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-center text-muted">#321</td>
                      <td>
                        <div className="widget-content p-0">
                          <div className="widget-content-wrapper">
                            <div className="widget-content-left me-3">
                              <div className="widget-content-left">
                                <img width={40} className="rounded-circle" src={avatar3} alt=""/>
                              </div>
                            </div>
                            <div className="widget-content-left flex2">
                              <div className="widget-heading">Elliot Huber</div>
                              <div className="widget-subheading opacity-7">
                                Lorem ipsum dolor sic
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">London</td>
                      <td className="text-center">
                        <div className="badge bg-danger">In Progress</div>
                      </td>
                      <td className="text-center" style={{ width: "150px" }}>
                        <Sparklines height={60} data={sampleData}>
                          <SparklinesBars
                            style={{
                              stroke: "none",
                              fill: "#d92550",
                              fillOpacity: ".5",
                            }}/>
                        </Sparklines>
                      </td>
                      <td className="text-center">
                        <Button size="sm" color="primary" id={"PopoverCustomT-3"} onClick={this.togglePop3}>
                          Details
                        </Button>
                        <Popover  className="popover-custom rm-pointers" placement="auto" isOpen={this.state.popoverOpen3}
                          target={"PopoverCustomT-3"} toggle={this.togglePop3}>
                          <PopoverBody>
                            <div className="dropdown-menu-header">
                              <div
                                className={classnames(
                                  "dropdown-menu-header-inner bg-focus"
                                )}>
                                <div className="menu-header-image"
                                  style={{
                                    backgroundImage: "url(" + bg1 + ")",
                                  }}/>
                                <div className="menu-header-content">
                                  <h5 className="menu-header-title">
                                    Settings
                                  </h5>
                                  <h6 className="menu-header-subtitle">
                                    Manage all of your options
                                  </h6>
                                </div>
                              </div>
                            </div>
                            <Nav vertical>
                              <NavItem className="nav-item-header">
                                Activity
                              </NavItem>
                              <NavItem>
                                <NavLink href="#">
                                  Chat
                                  <div className="ms-auto badge rounded-pill bg-info">
                                    8
                                  </div>
                                </NavLink>
                              </NavItem>
                              <NavItem>
                                <NavLink href="#">Recover Password</NavLink>
                              </NavItem>
                              <NavItem className="nav-item-divider" />
                              <NavItem className="nav-item-btn text-center">
                                <Button size="sm" className="btn-wide btn-shadow" color="danger">
                                  Cancel
                                </Button>
                              </NavItem>
                            </Nav>
                          </PopoverBody>
                        </Popover>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-center text-muted">#55</td>
                      <td>
                        <div className="widget-content p-0">
                          <div className="widget-content-wrapper">
                            <div className="widget-content-left me-3">
                              <div className="widget-content-left">
                                <img width={40} className="rounded-circle" src={avatar4} alt=""/>
                              </div>
                            </div>
                            <div className="widget-content-left flex2">
                              <div className="widget-heading">
                                Vinnie Wagstaff
                              </div>
                              <div className="widget-subheading opacity-7">
                                UI Designer
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">Amsterdam</td>
                      <td className="text-center">
                        <div className="badge bg-info">On Hold</div>
                      </td>
                      <td className="text-center" style={{ width: "150px" }}>
                        <Sparklines height={60} data={sampleData}>
                          <SparklinesLine
                            style={{
                              strokeWidth: 3,
                              stroke: "#f7b924",
                              fill: "#f7b924",
                              fillOpacity: ".2",
                            }}/>
                        </Sparklines>
                      </td>
                      <td className="text-center">
                        <Button size="sm" color="primary" id={"PopoverCustomT-4"} onClick={this.togglePop4}>
                          Details
                        </Button>
                        <Popover className="popover-custom rm-pointers" placement="auto" isOpen={this.state.popoverOpen4}
                          target={"PopoverCustomT-4"} toggle={this.togglePop4}>
                          <PopoverBody>
                            <div className="dropdown-menu-header">
                              <div
                                className={classnames(
                                  "dropdown-menu-header-inner bg-focus"
                                )}>
                                <div className="menu-header-image"
                                  style={{
                                    backgroundImage: "url(" + bg1 + ")",
                                  }}/>
                                <div className="menu-header-content">
                                  <h5 className="menu-header-title">
                                    Settings
                                  </h5>
                                  <h6 className="menu-header-subtitle">
                                    Manage all of your options
                                  </h6>
                                </div>
                              </div>
                            </div>
                            <Nav vertical>
                              <NavItem className="nav-item-header">
                                Activity
                              </NavItem>
                              <NavItem>
                                <NavLink href="#">
                                  Chat
                                  <div className="ms-auto badge rounded-pill bg-info">
                                    8
                                  </div>
                                </NavLink>
                              </NavItem>
                              <NavItem>
                                <NavLink href="#">Recover Password</NavLink>
                              </NavItem>
                              <NavItem className="nav-item-divider" />
                              <NavItem className="nav-item-btn text-center">
                                <Button size="sm" className="btn-wide btn-shadow" color="danger">
                                  Cancel
                                </Button>
                              </NavItem>
                            </Nav>
                          </PopoverBody>
                        </Popover>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                  <Button className="me-2 btn-icon btn-icon-only" outline color="danger">
                    <i className="pe-7s-trash btn-icon-wrapper"> </i>
                  </Button>
                  <Button className="btn-wide" color="success">
                    Save
                  </Button>
                </CardFooter>
              </Card>
            </Col>
          </Row>

        </Container>
      </Fragment>
    );
  }
}
