import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { getBills, setFilters } from "../../../reducers/billsSlice";
import { connect } from "react-redux";
import Loader from "react-loaders";
import BillStatusBadge from "../../Bills/Tables/StatusBadge";
import { formatDate } from "../../Transactions/Tables/data";
import { faCopy, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import { fetchBankApi } from "../../../services/bankApiService";
import { Combobox, NumberPicker } from "react-widgets/cjs";
import { createBill } from "../../../services/billService";

class BillsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            isBuyerToggleOn: false,
            isSellerToggleOn: false,
            banks: [],
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
            let data = {};
            if (this.state.isBuyerToggleOn) data.buyer = this.state.buyer;
            if (this.state.isSellerToggleOn) data.seller = this.state.seller;
            if (this.state.isBuyerToggleOn || this.state.isSellerToggleOn) {
                const res = await createBill(this.state.input);
                if (res.buyerBill) window.location.href = `/bill/${res.buyerBill._id}`;
                else window.location.href = `/bill/${res.sellerBill._id}`;
            }
            this.setState({loading: false});
        };

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
                                                <Combobox
                                                    data={this.state.banks}
                                                    textField="bankName"
                                                    valueField="bankCode"
                                                    value={buyer.bankCode || ""}
                                                    onChange={(item) => {
                                                        const selectedValue = typeof item === "string" ? item : item?.bankCode;
                                                        this.setState((prevState) => ({
                                                            buyer: { ...prevState.buyer, bankCode: selectedValue }
                                                        }));
                                                    }}
                                                    filter="contains"
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
                                                <Label>Số tiền giao dịch</Label>
                                            </Col>
                                            <Col md={8}>
                                                <NumberPicker
                                                    step={100000}
                                                    value={buyer.amount}
                                                    name="buyerAmount"
                                                    onChange={(value)=>{this.setState((prevState) => ({
                                                        buyer: {
                                                            ...prevState.buyer,
                                                            amount: value < 0 ? 0 : value,
                                                        },
                                                    }));}}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Tiền tip</Label>
                                            </Col>
                                            <Col md={8}>
                                                <NumberPicker
                                                    step={100000}
                                                    value={buyer.bonus}
                                                    name="buyerBonus"
                                                    onChange={(value)=>{this.setState((prevState) => ({
                                                        buyer: {
                                                            ...prevState.buyer,
                                                            bonus: value < 0 ? 0 : value,
                                                        },
                                                    }));}}
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
                                                    name="buyer"
                                                    id="buyer"
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
                                                <Combobox
                                                    data={this.state.banks}
                                                    textField="bankName"
                                                    valueField="bankCode"
                                                    value={seller.bankCode || ""}
                                                    onChange={(item) => {
                                                        const selectedValue = typeof item === "string" ? item : item?.bankCode;
                                                        this.setState((prevState) => ({
                                                            seller: { ...prevState.seller, bankCode: selectedValue }
                                                        }));
                                                    }}
                                                    filter="contains"
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
                                                    value={buyer.stk}
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
                                                    value={buyer.content}
                                                    onChange={(e)=>{this.setState((prevState) => ({
                                                        seller: { ...prevState.seller, content: e.target.value }
                                                    }));}}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Số tiền giao dịch</Label>
                                            </Col>
                                            <Col md={8}>
                                                <NumberPicker
                                                    step={100000}
                                                    value={seller.amount}
                                                    name="sellerAmount"
                                                    onChange={(value)=>{this.setState((prevState) => ({
                                                        seller: {
                                                            ...prevState.seller,
                                                            amount: value < 0 ? 0 : value,
                                                        },
                                                    }));}}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Label>Tiền tip</Label>
                                            </Col>
                                            <Col md={8}>
                                                <NumberPicker
                                                    step={100000}
                                                    value={seller.bonus}
                                                    name="sellerBonus"
                                                    onChange={(value)=>{this.setState((prevState) => ({
                                                        seller: {
                                                            ...prevState.seller,
                                                            seller: value < 0 ? 0 : value,
                                                        },
                                                    }));}}
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
                                <a href={`/bill/${item._id}`} className="btn btn-sm btn-info m-1" title="Xem chi tiết giao dịch">
                                    <FontAwesomeIcon icon={faMoneyBill} color="#fff" size="3xs"/>
                                </a>
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                   
                    
                </CardFooter>
            </>)}
        </Card>)
    }
}

const mapStateToProps = (state) => ({
    totalAmount: state.box.box ? state.box.box.amount : 0,
    bills: state.box.box ? state.box.box.bills : [],
    loading: state.box.loading,
});
  
const mapDispatchToProps = {
    getBills,
    setFilters
};
  
export default connect(mapStateToProps, mapDispatchToProps)(BillsTable);