import React, { Component, Fragment } from "react";
import Tabs from "react-responsive-tabs";

import { Card, CardBody, CardHeader, CardTitle, Col, Container, Input, Label } from "reactstrap";
import Loader from "react-loaders";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import TransactionBoxTable from "./Table/TransactionBoxTable";
import BillBoxTable from "./Table/BillBoxTable";
import { getBoxById } from "../../reducers/boxSlice";
import { withRouter } from "../../utils/withRouter";
import { formatDate } from "../Transactions/Tables/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

export const dummyData = [
    {
        name: "Danh sách giao dịch trung gian",
        content: <TransactionBoxTable />,
    },
    {
        name: "Danh sách bill thanh khoản",
        content: <BillBoxTable />,
    },
];

class Box extends Component {
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
            loading: false,
            value: [],
        };
    }

    componentDidMount() {
        const { id } = this.props.params; 
        this.props.getBoxById(id);
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
        const box = this.props.box || {
            messengerId: '',
            name: '',
            amount: '',
            createdAt: '',
            notes: [],
        };
        return (
            <Fragment>
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner">
                        {this.props.loading ? (
                            <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                                <Loader type="ball-spin-fade-loader" />
                            </div>
                        ) : ( <>
                            <Container fluid>
                                <Row>
                                    <Col md="12">
                                        <Card className="main-card mb-3">
                                            <CardHeader>
                                                <CardTitle>Thông tin box giao dịch</CardTitle>
                                            </CardHeader>
                                            <CardBody>
                                                <Row>
                                                    <Col md={6} className="pe-2">
                                                        <Row className="mb-3">
                                                            <Col md={4}>
                                                                <Label>Tên box</Label>
                                                            </Col>
                                                            <Col md={8}>
                                                                <Input
                                                                    type="text"
                                                                    name="name"
                                                                    id="name"
                                                                    value={box.name}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </Col>

                                                    <Col md={6} className="ps-2">
                                                        <Row className="mb-3">
                                                            <Col md={4}>
                                                                <Label>Messenger ID</Label>
                                                            </Col>
                                                            <Col md={8}>
                                                                <Input
                                                                    type="text"
                                                                    name="messengerId"
                                                                    id="messengerId"
                                                                    value={box.messengerId}
                                                                    disabled
                                                                />
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4}>
                                                                <Label>Bên bán</Label>
                                                            </Col>
                                                            <Col md={8}>
                                                                <Input
                                                                    type="text"
                                                
                                                                />
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4}>
                                                                <Label>Số giao dịch thaành công</Label>
                                                            </Col>
                                                            <Col md={8}>
                                                                <p>0/1</p>
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4}>
                                                                <Label>Thời gian tạo</Label>
                                                            </Col>
                                                            <Col md={8}>
                                                                <p>{formatDate(box.createdAt)}</p>
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4}>
                                                                <Label>Số tiền đã giao dịch</Label>
                                                            </Col>
                                                            <Col md={8}>
                                                                <p></p>
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4}>
                                                                <Label>Số tiền trong box</Label>
                                                            </Col>
                                                            <Col md={8}>
                                                                <p className="fw-bold text-danger">{box.amount.toLocaleString()} vnd
                                                                    <button class="btn btn-success ms-1">
                                                                        <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                                                                    </button>
                                                                </p>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </Container>

                            <Container fluid>
                                <Row>
                                    <Col md="12">
                                        <div className="mb-3">
                                            <Tabs tabsWrapperClass="card-header" {...this.state} />
                                        </div>
                                    </Col>
                                </Row>
                            </Container>
                        </>)}
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }    
}

const mapStateToProps = (state) => ({
    box: state.box.box || {
        name: '',
        messengerId: '',
        createdAt: '',
        amount: 0,
    },
    loading: state.box.loading  || false,
});
  
const mapDispatchToProps = {
    getBoxById
};
  
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Box));
