import React, { Component, Fragment } from "react";
import Tabs from "react-responsive-tabs";

import { Container } from "reactstrap";

import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import CustomerTable from "./Tables";
import { connect } from "react-redux";

export const dummyData = [
  {
    name: "Danh sách quyền",
    content: <CustomerTable />,
  },
];


class Customers extends Component {
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
            isMobile: window.innerWidth < 768,
        };
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }
    
    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 768 });
    };
  
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
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner" style={this.state.isMobile ? {padding: 0} : {}}>
                            <Container fluid>
                                <div className="mb-3">
                                    <Tabs tabsWrapperClass="card-header" {...this.state} />
                                </div>
                            </Container>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }    
}

const mapStateToProps = (state) => ({
});
  
const mapDispatchToProps = {
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Customers);
