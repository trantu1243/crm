import React, { Component, Fragment } from "react";
import Tabs from "react-responsive-tabs";

import { Button, Container, ListGroup, ListGroupItem } from "reactstrap";

import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CopyToClipboard from "react-copy-to-clipboard";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { fetchQuickAnswers } from "../../services/quickAnswer.service";


class QuickReply extends Component {
    constructor(props) {
        super(props);
    
        this.toggle = this.toggle.bind(this);
        this.state = {
            quickAnswers: [],
            isMobile: window.innerWidth < 768,
        };
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }

     componentDidMount() {
        this.getQuickAnswers();
    }

    getQuickAnswers = async () => {
        const res = await fetchQuickAnswers();
        this.setState({quickAnswers: res.quickAnswers});
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

    render() {  
        const { quickAnswers } = this.state;

        return (
            <Fragment>
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner" style={this.state.isMobile ? {padding: 0} : {}}>
                            <Container fluid>
                                <ListGroup>
                                    {quickAnswers.map((item, key) => {
                                        return <ListGroupItem>
                                        <div className="widget-content p-0">
                                            <div className="widget-content-wrapper">
                                                
                                                <div className="widget-content-left">
                                                    <div className="widget-heading">
                                                        {item.title}
                                                    </div>
                                                    <div className="widget-subheading">
                                                    {item.content.length > 50 ? item.content.slice(0, 50) + "..." : item.content}
                                                    </div>
                                                </div>

                                                <div className="widget-content-right" >
                                                    <CopyToClipboard text={item.content}>
                                                        <Button type='button' color='primary'>
                                                            <FontAwesomeIcon icon={faCopy}/>
                                                        </Button>
                                                    </CopyToClipboard>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </ListGroupItem>
                                    })}
                                </ListGroup>
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
  
export default connect(mapStateToProps, mapDispatchToProps)(QuickReply);
