import React, { Component, Fragment } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Tabs from "react-responsive-tabs";

import PageTitle from "../../../Layout/AppMain/PageTitle";

import { Button, ButtonGroup, Card, CardFooter, CardHeader, Col, Container, Table } from "reactstrap";
import Row from "../../Components/GuidedTours/Examples/Row";
import { Sparklines, SparklinesBars, SparklinesLine } from "react-sparklines";

import avatar1 from "../../../assets/utils/images/avatars/1.jpg";
import avatar2 from "../../../assets/utils/images/avatars/2.jpg";
import avatar3 from "../../../assets/utils/images/avatars/3.jpg";
import avatar4 from "../../../assets/utils/images/avatars/4.jpg";

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

export const dummyData = [
  {
    name: "George Washington",
    content:
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
            <Button size="sm" color="primary" id={"PopoverCustomT-1"}>
              Details
            </Button>
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
            <Button size="sm" color="primary" id={"PopoverCustomT-2"}>
              Details
            </Button>
  
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
            <Button size="sm" color="primary" id={"PopoverCustomT-3"}>
              Details
            </Button>
        
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
            <Button size="sm" color="primary" id={"PopoverCustomT-4"}>
              Details
            </Button>
  
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
  </Card>,
  },
  {
    name: "Thomas Jefferson",
    content:
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
            <Button size="sm" color="primary" id={"PopoverCustomT-1"}>
              Details
            </Button>
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
            <Button size="sm" color="primary" id={"PopoverCustomT-2"}>
              Details
            </Button>
  
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
            <Button size="sm" color="primary" id={"PopoverCustomT-3"}>
              Details
            </Button>
        
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
            <Button size="sm" color="primary" id={"PopoverCustomT-4"}>
              Details
            </Button>
  
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
  </Card>,
  }
];

export default class CommerceDashboard extends Component {
   constructor(props) {
      super(props);
  
      this.toggle = this.toggle.bind(this);
      this.state = {
        activeTab: "1",
        showMore: true,
        transform: true,
        showInkBar: true,
        items: this.getSimpleTabs() || [],
        selectedTabKey: 0,
        transformWidth: 400,
      };
    }
  
    toggle(tab) {
      if (this.state.activeTab !== tab) {
        this.setState({
          activeTab: tab,
        });
      }
    }
  
    getSimpleTabs = () =>
      dummyData.map(({ name, content }, index) => ({
        key: index,
        title: name,
        getContent: () => content,
      }));
  render() {
    return (
      <Fragment>
        <TransitionGroup>
          <CSSTransition component="div" classNames="TabsAnimation" appear={true}
            timeout={1500} enter={false} exit={false}>
            <div>  
              <PageTitle heading="Commerce Dashboard"
                subheading="This dashboard was created as an example of the flexibility that ArchitectUI offers."
                icon="pe-7s-graph icon-gradient bg-ripe-malin"/>
                <Fragment>
                    <Container fluid>
                      <Row>
                        <Col md="12">
                          <div className="mb-3">
                              <Tabs tabsWrapperClass="card-header" {...this.state} />
                          </div>
                          
                        </Col>
                      </Row>

                    </Container>
                  </Fragment>
                
            </div>
          </CSSTransition>
        </TransitionGroup>
      </Fragment>
    );
  }
}
