import React, { Component, Fragment } from "react";

import { Card, CardBody, CardHeader, CardTitle, Col, Container, Input, Label } from "reactstrap";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import { getBoxById } from "../../reducers/boxSlice";
import { withRouter } from "../../utils/withRouter";
import { getBillById } from "../../reducers/billsSlice";

class Box extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            value: [],
        };
    }

    componentDidMount() {
        const { id } = this.props.params; 
        this.props.getBillById(id);
    }

    // componentDidUpdate(prevProps) {
    //     if (prevProps.bill !== this.props.bill) {
    //         console.log(this.props.bill);
    //         console.log(this.props.bill.boxId);
    //         if (this.props.bill) this.props.getBoxById(this.props.bill.boxId);
    //     }
    // }

    render() {       
        const box = this.props.bill.boxId || {
            messengerId: '',
            name: '',
            amount: '',
            createdAt: '',
            notes: [],
        };
        const bill = this.props.bill || {
            _id: '',
            bankCode: '',
            stk: '',
            content: '',
            amount: '',
            bonus: '',
            typeTransfer: '',
            boxId: '',
            linkQr: '',
            status: '',
            staffId: '',
            billId: null,
        }
        return (
            <Fragment>
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner">
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
                                                        <Row>
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
                                                        <Row>
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
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </Container>
                            <Container fluid>
                                <Row>
                                    <Col md={6} className="pe-2">
                                        <Card className="main-card mb-3">
                                            <div className="btn btn-primary">Bên mua</div>
                                            { (bill.typeTransfer === 'buyer') && <>
                                                <img src={bill.linkQr} alt="" style={{width: '100%', height: '100%', padding: '0 6em'}}></img>
                                            </>}
                                            {(bill.billId && bill.billId.typeTransfer === 'buyer') && <>
                                                <img src={bill.billId.linkQr} alt="" style={{width: '100%', height: '100%', padding: '0 6em'}}></img>
                                            </>}
                                        </Card>
                                    </Col>
                                    <Col md={6} className="ps-2">
                                        <Card className="main-card mb-3">
                                            <div className="btn btn-primary">Bên bán</div>
                                            { (bill.typeTransfer === 'seller') && <>
                                                <img src={bill.linkQr} alt="" style={{width: '100%', height: '100%', padding: '0 6em'}}></img>
                                            </>}
                                            {(bill.billId && bill.billId.typeTransfer === 'seller') && <>
                                                    <img src={bill.billId.linkQr} alt="" style={{width: '100%', height: '100%', padding: '0 6em'}}></img>
                                            </>}
                                        </Card>
                                    </Col>
                                </Row>
                            </Container>

                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }    
}

const mapStateToProps = (state) => ({
    box: state.box.box || {},
    loading: state.box.loading  || false,
    bill: state.bills.bill
});
  
const mapDispatchToProps = {
    getBoxById,
    getBillById
};
  
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Box));
