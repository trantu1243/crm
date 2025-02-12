import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { getBills, setFilters } from "../../../reducers/billsSlice";
import { connect } from "react-redux";
import Loader from "react-loaders";
import BillStatusBadge from "../../Bills/Tables/StatusBadge";
import { formatDate } from "../../Transactions/Tables/data";
import { faCheck, faCopy, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import { fetchBankApi } from "../../../services/bankApiService";
import Select from "react-select";
import SweetAlert from 'react-bootstrap-sweetalert';

import { confirmBillService, createBill } from "../../../services/billService";
import { getBoxById } from "../../../reducers/boxSlice";

class BillsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            confirmBillModal: false,
            isBuyerToggleOn: false,
            isSellerToggleOn: false,
            banks: [],
            confirmBill: null,
            alert: false,
            errorMsg: '',
            buyer: {
                bankCode: '', 
                stk: '', 
                content: '', 
                amount: '', 
                bonus: 0
            },
            seller: {
                bankCode: '', 
                stk: '', 
                content: '', 
                amount: '', 
                bonus: 0
            }
        };
    
        this.toggle = this.toggle.bind(this);
        this.toggleConfirmBill = this.toggleConfirmBill.bind(this);
        this.handleBuyerClick = this.handleBuyerClick.bind(this);
    }

    componentDidMount() {
        this.getBanks()
    }
    
    toggle() {
        this.setState({
            modal: !this.state.modal,
        });
    }

    toggleConfirmBill() {
        this.setState({
            confirmBillModal: !this.state.confirmBillModal,
        });
    }

    getBanks = async () => {
        const data = await fetchBankApi();
        this.setState({
            banks: data.data
        })
    }

    handleBuyerClick = () => {
        this.setState((prevState) => ({
            isBuyerToggleOn: !prevState.isBuyerToggleOn
        }));
    };

    handleSellerClick = () => {
        this.setState((prevState) => ({
            isSellerToggleOn: !prevState.isSellerToggleOn
        }));
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({loading: true});
        let data = {
            boxId: this.props.boxId,
            buyer: null,
            seller: null
        };
        if (this.state.isBuyerToggleOn) data.buyer = this.state.buyer;
        if (this.state.isSellerToggleOn) data.seller = this.state.seller;
        if (this.state.isBuyerToggleOn || this.state.isSellerToggleOn) {
            const res = await createBill(data);
            if (res.buyerBill) window.location.href = `/bill/${res.buyerBill._id}`;
            else window.location.href = `/bill/${res.sellerBill._id}`;
        }
        this.setState({loading: false});
    };

    handleConfirmBill = async () => {
         try {                    
            const res = await confirmBillService(this.state.confirmBill?._id);
            if (res.status) {
                this.props.getBoxById(this.props.boxId)
                this.toggleConfirmBill()
            }
        } catch (error) {
            
        }
    }

    render() { 

        const { bills } = this.props;
        const { isBuyerToggleOn, isSellerToggleOn, buyer, seller} = this.state;
        
        return (<Card className="main-card mb-3">
            {this.props.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
                <CardHeader className="mt-2">
                    <span className="d-inline-block mb-2 me-2">
                        <Button color="info" onClick={this.toggle}>
                            Tạo bill thanh khoản
                        </Button>
                        <Modal isOpen={this.state.modal} toggle={this.toggle} className="modal-xl" style={{marginTop: '10rem'}}>
                            <ModalHeader toggle={this.toggle}>Tạo bill thanh khoản</ModalHeader>
                            <ModalBody className="p-4">
                                <Row>
                                    <div className="card-border mb-3 card card-body border-primary">
                                        <h5>Số tiền thanh khoản còn lại:&nbsp;
                                            <span class="fw-bold text-danger"><span>{this.props.totalAmount.toLocaleString()} vnđ</span></span>
                                            <button class="btn btn-success ms-1">
                                                <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                                            </button>
                                        </h5>
                                    </div>
                                
                                </Row>
                                <Row>
                                    <Col md={6} className="pe-2">
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Tạo cho <span className="fw-bold text-danger">BÊN MUA</span>?</Label>
                                            </Col>
                                            <Col md={8}>
                                                <div className="switch has-switch me-2" data-on-label="ON"
                                                    data-off-label="OFF" onClick={this.handleBuyerClick}>
                                                    <div className={cx("switch-animate", {
                                                        "switch-on": isBuyerToggleOn,
                                                        "switch-off": !isBuyerToggleOn,
                                                        })}>
                                                        <input type="checkbox" />
                                                        <span className="switch-left bg-info">ON</span>
                                                        <label>&nbsp;</label>
                                                        <span className="switch-right bg-info">OFF</span>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Khách mua</Label>      
                                            </Col>
                                            <Col md={8}>
                                                <Input
                                                    type="text"
                                                    name="buyer"
                                                    id="buyer"
                                                    value={""}
                                                    disabled
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Ngân hàng khách mua</Label>
                                            </Col>
                                            <Col md={8}>
                                            <Select
                                                value={this.state.banks
                                                    .map(bank => ({ value: bank.bankCode, label: bank.bankName }))
                                                    .find(option => option.value === this.state.buyer.bankCode) || null}
                                                onChange={selected => this.setState(prevState => ({
                                                    buyer: { ...prevState.buyer, bankCode: selected.value }
                                                }))}
                                                options={this.state.banks.map(bank => ({
                                                    value: bank.bankCode,
                                                    label: bank.bankName
                                                }))}
                                                placeholder="Chọn ngân hàng"
                                            />

                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Số tài khoản khách mua</Label>
                                            </Col>
                                            <Col md={8}>
                                                <Input
                                                    type="text"
                                                    name="buyerStk"
                                                    id="buyerStk"
                                                    value={buyer.stk}
                                                    onChange={(e)=>{this.setState((prevState) => ({
                                                        buyer: { ...prevState.buyer, stk: e.target.value }
                                                    }));}}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Nội dung chuyển khoản</Label>
                                            </Col>
                                            <Col md={8}>
                                                <Input
                                                    type="text"
                                                    name="buyerContent"
                                                    id="buyerContent"
                                                    value={buyer.content}
                                                    onChange={(e)=>{this.setState((prevState) => ({
                                                        buyer: { ...prevState.buyer, content: e.target.value }
                                                    }));}}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Số tiền giao dịch</Label>
                                            </Col>
                                            <Col md={8}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="buyerAmount"
                                                    value={new Intl.NumberFormat('en-US').format(this.state.buyer.amount)}
                                                    onChange={(e) => {
                                                        let rawValue = e.target.value.replace(/,/g, ''); // Xóa dấu phẩy
                                                        let numericValue = parseInt(rawValue, 10) || 0; // Chuyển thành số nguyên
                                                        
                                                        this.setState((prevState) => ({
                                                            buyer: {
                                                                ...prevState.buyer,
                                                                amount: numericValue < 0 ? 0 : numericValue,
                                                            },
                                                        }));
                                                    }}
                                                />
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Tiền tip</Label>
                                            </Col>
                                            <Col md={8}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="buyerBonus"
                                                    value={new Intl.NumberFormat('en-US').format(this.state.buyer.bonus)}
                                                    onChange={(e) => {
                                                        let rawValue = e.target.value.replace(/,/g, ''); 
                                                        let numericValue = parseInt(rawValue, 10) || 0;
                                                        
                                                        this.setState((prevState) => ({
                                                            buyer: {
                                                                ...prevState.buyer,
                                                                bonus: numericValue < 0 ? 0 : numericValue,
                                                            },
                                                        }));
                                                    }}
                                                />
                                            </Col>
                                        </Row>

                                    </Col>
                                    <Col md={6} className="ps-2">
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Tạo cho <span className="fw-bold text-danger">BÊN BÁN</span>?</Label>
                                            </Col>
                                            <Col md={8}>
                                                <div className="switch has-switch me-2" data-on-label="ON"
                                                    data-off-label="OFF" onClick={this.handleSellerClick}>
                                                    <div className={cx("switch-animate", {
                                                        "switch-on": isSellerToggleOn,
                                                        "switch-off": !isSellerToggleOn,
                                                        })}>
                                                        <input type="checkbox" />
                                                        <span className="switch-left bg-info">ON</span>
                                                        <label>&nbsp;</label>
                                                        <span className="switch-right bg-info">OFF</span>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Khách bán</Label>
                                            </Col>
                                            <Col md={8}>
                                                <Input
                                                    type="text"
                                                    name="seller"
                                                    id="sellers"
                                                    value={""}
                                                    disabled
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Ngân hàng khách bán</Label>
                                            </Col>
                                            <Col md={8}>
                                                <Select
                                                    value={this.state.banks
                                                        .map(bank => ({ value: bank.bankCode, label: bank.bankName }))
                                                        .find(option => option.value === this.state.seller.bankCode) || null}
                                                    onChange={selected => this.setState(prevState => ({
                                                        seller: { ...prevState.seller, bankCode: selected.value }
                                                    }))}
                                                    options={this.state.banks.map(bank => ({
                                                        value: bank.bankCode,
                                                        label: bank.bankName
                                                    }))}
                                                    placeholder="Chọn ngân hàng"
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Số tài khoản khách bán</Label>
                                            </Col>
                                            <Col md={8}>
                                                <Input
                                                    type="text"
                                                    name="sellerStk"
                                                    id="sellerStk"
                                                    value={seller.stk}
                                                    onChange={(e)=>{this.setState((prevState) => ({
                                                        seller: { ...prevState.seller, stk: e.target.value }
                                                    }));}}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Nội dung chuyển khoản</Label>
                                            </Col>
                                            <Col md={8}>
                                                <Input
                                                    type="text"
                                                    name="sellerContent"
                                                    id="sellerContent"
                                                    value={seller.content}
                                                    onChange={(e)=>{this.setState((prevState) => ({
                                                        seller: { ...prevState.seller, content: e.target.value }
                                                    }));}}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Số tiền giao dịch</Label>
                                            </Col>
                                            <Col md={8}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="sellerAmount"
                                                    value={new Intl.NumberFormat('en-US').format(this.state.seller.amount)}
                                                    onChange={(e) => {
                                                        let rawValue = e.target.value.replace(/,/g, ''); // Xóa dấu phẩy
                                                        let numericValue = parseInt(rawValue, 10) || 0; // Chuyển thành số nguyên

                                                        this.setState((prevState) => ({
                                                            seller: {
                                                                ...prevState.seller,
                                                                amount: numericValue < 0 ? 0 : numericValue,
                                                            },
                                                        }));
                                                    }}
                                                />
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Tiền tip</Label>
                                            </Col>
                                            <Col md={8}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="sellerBonus"
                                                    value={new Intl.NumberFormat('en-US').format(this.state.seller.bonus)}
                                                    onChange={(e) => {
                                                        let rawValue = e.target.value.replace(/,/g, ''); // Xóa dấu phẩy
                                                        let numericValue = parseInt(rawValue, 10) || 0; // Chuyển thành số nguyên

                                                        this.setState((prevState) => ({
                                                            seller: {
                                                                ...prevState.seller,
                                                                bonus: numericValue < 0 ? 0 : numericValue,
                                                            },
                                                        }));
                                                    }}
                                                />
                                            </Col>
                                        </Row>

                                    </Col>
                                </Row>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="link" onClick={this.toggle}>
                                    Hủy
                                </Button>
                                <Button color="primary" onClick={this.handleSubmit}>
                                    Tạo
                                </Button>{" "}
                            </ModalFooter>
                        </Modal>
                    </span>
                    
                </CardHeader>
                <Table responsive hover striped borderless className="align-middle mb-0">
                    <thead>
                        <tr>
                            <th className="text-center">ID</th>
                            <th className="text-center">Thời gian</th>
                            <th className="text-center">Ngân hàng</th>
                            <th className="text-center">Số tiền</th>
                            <th className="text-center">Tiền tip</th>
                            <th className="text-center">Nội dung</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-center">Nhân viên</th>
                            <th className="text-center">Box</th>
                            <th className="text-center">#</th>

                        </tr>
                    </thead>
                    <tbody>
                    
                        {bills.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{formatDate(item.createdAt)}</td>
                            <td className="text-center text-muted">{item.bankCode}</td>
                            <td className="text-center text-muted">{item.amount.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.bonus.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.content}</td>
                            <BillStatusBadge status={item.status} />
                            <td className="text-center text-muted"><img width={40} className="rounded-circle" src={item.staffId.avatar} alt={item.staffId.name_staff}/></td>
                            <td className="text-center text-muted"><a href="https://www.messenger.com/t/8681198405321843"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>
                            <td className="text-center text-muted">
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-success me-1" title="Xác nhận giao dịch" onClick={() => {this.setState({ confirmBill: item }); this.toggleConfirmBill()}}>
                                        <FontAwesomeIcon icon={faCheck} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                                <a href={`/bill/${item._id}`} className="btn btn-sm btn-info m-1" title="Xem chi tiết giao dịch">
                                    <FontAwesomeIcon icon={faMoneyBill} color="#fff" size="3xs"/>
                                </a>
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                   
                    
                </CardFooter>
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
            </>)}
             <SweetAlert title={this.state.errorMsg} show={this.state.alert} type="error" onConfirm={() => this.setState({alert: false})}/>
        </Card>)
    }
}

const mapStateToProps = (state) => ({
    totalAmount: state.box.box ? state.box.box.amount : 0,
    boxId: state.box.box ? state.box.box._id : '',
    bills: state.box.box ? state.box.box.bills : [],
    loading: state.box.loading,
});
  
const mapDispatchToProps = {
    getBills,
    setFilters,
    getBoxById
};
  
export default connect(mapStateToProps, mapDispatchToProps)(BillsTable);