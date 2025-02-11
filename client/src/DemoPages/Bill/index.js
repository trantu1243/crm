import React, { Component, Fragment } from "react";

import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Input, Label } from "reactstrap";

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
            showBuyerQR: false,
            showSellerQR: false
        };
    }

    componentDidMount() {
        const { id } = this.props.params; 
        this.props.getBillById(id);
    }

    toggleQR = (side) => {
        if (side === "buyer") {
            this.setState({ showBuyerQR: !this.state.showBuyerQR, showSellerQR: false });
        } else {
            this.setState({ showSellerQR: !this.state.showSellerQR, showBuyerQR: false });
        }
    };

    // componentDidUpdate(prevProps) {
    //     if (prevProps.bill !== this.props.bill) {
    //         console.log(this.props.bill);
    //         console.log(this.props.bill.boxId);
    //         if (this.props.bill) this.props.getBoxById(this.props.bill.boxId);
    //     }
    // }

    render() {       
        const box = this.props.bill?.boxId || {
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
            boxId: null,
            linkQr: '',
            status: '',
            staffId: '',
            billId: null,
        }
        const { showBuyerQR, showSellerQR } = this.state;
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
                                {/* Bên Mua */}
                                <Col md={6} className="pe-2">
                                    <Card className="main-card mb-3">
                                        <div className="btn btn-primary">Bên mua</div>

                                        {(bill.typeTransfer === 'buyer' || (bill.billId && bill.billId.typeTransfer === 'buyer')) && (
                                            <>
                                                <img 
                                                    src={bill.linkQr || bill.billId?.linkQr} 
                                                    alt="QR Code" 
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '0 6em',
                                                        filter: (bill.status === 2 || !showBuyerQR) ? 'blur(10px)' : 'none',
                                                        transition: 'filter 0.3s ease'
                                                    }}
                                                    onClick={() => this.toggleQR("buyer")}
                                                />
                                            
                                                {bill.status === 1 && (
                                                    <div className="d-flex justify-content-center gap-3 p-3">
                                                        <Button color="success">Xác nhận bill</Button>
                                                        <Button color="danger">Huỷ</Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Card>
                                </Col>

                                {/* Bên Bán */}
                                <Col md={6} className="ps-2">
                                    <Card className="main-card mb-3">
                                        <div className="btn btn-primary">Bên bán</div>

                                        {(bill.typeTransfer === 'seller' || (bill.billId && bill.billId.typeTransfer === 'seller')) && (
                                            <>
                                                <img 
                                                    src={bill.linkQr || bill.billId?.linkQr} 
                                                    alt="QR Code" 
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '0 6em',
                                                        filter: (bill.status === 2 || !showSellerQR) ? 'blur(10px)' : 'none',
                                                        transition: 'filter 0.3s ease'
                                                    }}
                                                    onClick={() => this.toggleQR("seller")}
                                                />
                                            
                                                {bill.status === 1 && (
                                                    <div className="d-flex justify-content-center gap-3 p-3">
                                                        <Button color="success">Xác nhận bill</Button>
                                                        <Button color="danger">Huỷ</Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Card>
                                </Col>
                            </Row>
                            </Container>

                            <Container fluid>
                                <Card className="p-3">
                                    <div className="d-flex justify-content-center gap-3 mb-2">
                                        <Button color="success" style={{width: 150}}>Đảo bill</Button>
                                    </div> 
                                    <div className="d-flex justify-content-center gap-3">
                                        <a href={`/box/${bill.boxId?._id || ''}`} className="btn btn-secondary" style={{width: 150}}>Quay lại box</a>
                                        <a href="/bills" className="btn btn-secondary" style={{width: 150}}>Quay lại quản lý bill</a>
                                    </div>
                                </Card>
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
