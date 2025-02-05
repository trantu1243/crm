import React, { Component, Fragment } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Tabs from "react-responsive-tabs";

import PageTitle from "../../Layout/AppMain/PageTitle";

import { Button, ButtonGroup, Card, CardFooter, CardHeader, Col, Container, Table } from "reactstrap";
import Row from "../Components/GuidedTours/Examples/Row";
import { Sparklines, SparklinesBars, SparklinesLine } from "react-sparklines";

import avatar1 from "../../assets/utils/images/avatars/1.jpg";
import avatar2 from "../../assets/utils/images/avatars/2.jpg";
import avatar3 from "../../assets/utils/images/avatars/3.jpg";
import avatar4 from "../../assets/utils/images/avatars/4.jpg";
import AppFooter from "../../Layout/AppFooter";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import ThemeOptions from "../../Layout/ThemeOptions";
import TransactionsTable from "./Tables";

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
    name: "Danh sách giao dịch trung gian",
    content: <TransactionsTable />,
  },
];

export default class Transactions extends Component {
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
            <ThemeOptions />
            <AppHeader />
            <div className="app-main">
            <AppSidebar />
            <div className="app-main__outer">
                <div className="app-main__inner">
                <Fragment>
                    <TransitionGroup>
                        <CSSTransition component="div" classNames="TabsAnimation" appear={true}
                            timeout={1500} enter={false} exit={false}>
                            <div>  

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
                </div>
                <AppFooter />
            </div>
            </div>
        </Fragment>
        
        );
    }
}
