import React, { Component, Fragment } from "react";

import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import { getBoxById } from "../../reducers/boxSlice";
import { withRouter } from "../../utils/withRouter";
import { confirmBill, getBillById, switchBill } from "../../reducers/billsSlice";
import Loader from "react-loaders";

class Box extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            value: [],
            showBuyerQR: false,
            showSellerQR: false,
            confirmBillModal: false,
            confirmBill: null,
            isMobile: window.innerWidth < 768,
        };
        this.toggleConfirmBill = this.toggleConfirmBill.bind(this);
    }

    componentDidMount() {
        const { id } = this.props.params; 
        this.props.getBillById(id);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }
    
    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 768 });
    };

    toggleQR = (side) => {
        if (side === "buyer") {
            this.setState({ showBuyerQR: !this.state.showBuyerQR, showSellerQR: false });
        } else {
            this.setState({ showSellerQR: !this.state.showSellerQR, showBuyerQR: false });
        }
    };

    toggleConfirmBill() {
        this.setState({
            confirmBillModal: !this.state.confirmBillModal,
        });
    }

    // componentDidUpdate(prevProps) {
    //     if (prevProps.bill !== this.props.bill) {
    //         console.log(this.props.bill);
    //         console.log(this.props.bill.boxId);
    //         if (this.props.bill) this.props.getBoxById(this.props.bill.boxId);
    //     }
    // }

    handleSwitch = async () => {
        await this.props.switchBill(this.props.bill._id);
        this.props.getBillById(this.props.bill._id);
    }

    handleConfirmBill = async () => {
        this.toggleConfirmBill()
        await this.props.confirmBill(this.state.confirmBill._id);
        this.props.getBillById(this.props.bill._id);
    }

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
                        <div className="app-main__inner" style={this.state.isMobile ? {padding: 0} : {}}>
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
                                                        <Col md={6} xs={12} className="pe-2">
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

                                                        <Col md={6} xs={12} className="ps-2">
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
                                        <Col md={6} xs={12} className="pe-2">
                                            <Card className="main-card mb-3">
                                                <div className="btn btn-primary">Bên mua</div>

                                                {(bill.typeTransfer === 'buyer') && (
                                                    <>
                                                        <img 
                                                            src={bill.linkQr || bill.billId?.linkQr} 
                                                            alt="QR Code" 
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                padding: '0 6em',
                                                                filter: (bill.status !== 1 || !showBuyerQR) ? 'blur(10px)' : 'none',
                                                                transition: 'filter 0.3s ease'
                                                            }}
                                                            onClick={() => this.toggleQR("buyer")}
                                                        />
                                                    
                                                        {bill.status === 1 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <Button color="success" onClick={() => {this.setState({ confirmBill: bill }); this.toggleConfirmBill()}}>Xác nhận bill</Button>
                                                                <Button color="danger">Huỷ</Button>
                                                            </div>
                                                        )}
                                                        {bill.status === 2 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <span className="badge bg-success">Thành công</span>
                                                            </div>
                                                        )}
                                                        {bill.status === 3 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <span className="badge bg-danger">Huỷ</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {(bill.billId && bill.billId.typeTransfer === 'buyer') && (
                                                    <>
                                                        <img 
                                                            src={bill.billId?.linkQr} 
                                                            alt="QR Code" 
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                padding: '0 6em',
                                                                filter: (bill.billId.status !== 1 || !showBuyerQR) ? 'blur(10px)' : 'none',
                                                                transition: 'filter 0.3s ease'
                                                            }}
                                                            onClick={() => this.toggleQR("buyer")}
                                                        />
                                                    
                                                        {bill.billId.status === 1 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <Button color="success" onClick={() => {this.setState({ confirmBill: bill.billId }); this.toggleConfirmBill()}}>Xác nhận bill</Button>
                                                                <Button color="danger">Huỷ</Button>
                                                            </div>
                                                        )}
                                                        {bill.billId.status === 2 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <span className="badge bg-success">Thành công</span>
                                                            </div>
                                                        )}
                                                        {bill.billId.status === 3 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <span className="badge bg-danger">Huỷ</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </Card>
                                        </Col>

                                        {/* Bên Bán */}
                                        <Col md={6} xs={12} className="ps-2">
                                            <Card className="main-card mb-3">
                                                <div className="btn btn-primary">Bên bán</div>

                                                {(bill.typeTransfer === 'seller') && (
                                                    <>
                                                        <img 
                                                            src={bill.linkQr} 
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
                                                                <Button color="success"  onClick={() => {this.setState({ confirmBill: bill }); this.toggleConfirmBill()}}>Xác nhận bill</Button>
                                                                <Button color="danger">Huỷ</Button>
                                                            </div>
                                                        )}
                                                        {bill.status === 2 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <span className="badge bg-success">Thành công</span>
                                                            </div>
                                                        )}
                                                        {bill.status === 3 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <span className="badge bg-danger">Huỷ</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                {(bill.billId && bill.billId.typeTransfer === 'seller') && (
                                                    <>
                                                        <img 
                                                            src={bill.billId?.linkQr} 
                                                            alt="QR Code" 
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                padding: '0 6em',
                                                                filter: (bill.billId.status === 2 || !showSellerQR) ? 'blur(10px)' : 'none',
                                                                transition: 'filter 0.3s ease'
                                                            }}
                                                            onClick={() => this.toggleQR("seller")}
                                                        />
                                                    
                                                        {bill.billId.status === 1 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <Button color="success" onClick={() => {this.setState({ confirmBill: bill.billId }); this.toggleConfirmBill()}}>Xác nhận bill</Button>
                                                                <Button color="danger">Huỷ</Button>
                                                            </div>
                                                        )}
                                                        {bill.status === 2 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <span className="badge bg-success">Thành công</span>
                                                            </div>
                                                        )}
                                                        {bill.status === 3 && (
                                                            <div className="d-flex justify-content-center gap-3 p-3">
                                                                <span className="badge bg-danger">Huỷ</span>
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
                                            <Button color="success" style={{width: 150}} onClick={this.handleSwitch}>Đảo bill</Button>
                                        </div> 
                                        <div className="d-flex justify-content-center gap-3">
                                            <a href={`/box/${bill.boxId?._id || ''}`} className="btn btn-info" style={{width: 150}}>Quay lại box</a>
                                            <a href="/bills" className="btn btn-primary" style={{width: 150}}>Quay lại quản lý bill</a>
                                        </div>
                                    </Card>
                                </Container>
                            </>)}
                        </div>
                    </div>
                </div>

                <Modal isOpen={this.state.confirmBillModal} toggle={this.toggleConfirmBill} className={this.props.className}>
                    <ModalHeader toggle={this.toggleConfirmBill}><span style={{fontWeight: 'bold'}}>Xác nhận bill</span></ModalHeader>
                    <ModalBody>
                        Số tài khoản: {this.state.confirmBill?.stk} <br />
                        Ngân hàng: {this.state.confirmBill?.bankCode} <br />
                        Số tiền: <span className="fw-bold text-danger">{this.state.confirmBill?.amount.toLocaleString()} vnd</span><br />
                        Cho: {this.state.confirmBill?.typeTransfer === 'buyer' ? "Người bán" : "Người mua"}
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleConfirmBill}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleConfirmBill}>
                            Xác nhận
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }    
}

const mapStateToProps = (state) => ({
    box: state.box.box || {},
    loading: state.bills.loading  || false,
    bill: state.bills.bill
});
  
const mapDispatchToProps = {
    getBoxById,
    getBillById,
    switchBill,
    confirmBill
};
  
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Box));
