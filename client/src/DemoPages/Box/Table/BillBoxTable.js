import { Button, Card, CardFooter, CardHeader, Col, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { getBills, setFilters } from "../../../reducers/billsSlice";
import { connect } from "react-redux";
import Loader from "react-loaders";
import BillStatusBadge from "../../Bills/Tables/StatusBadge";
import { formatDate } from "../../Transactions/Tables/data";
import { faCheck, faCopy, faExclamationTriangle, faLock, faMinus, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import { fetchBankApi } from "../../../services/bankApiService";
import Select from "react-select";
import SweetAlert from 'react-bootstrap-sweetalert';

import { cancelBillService, confirmBillService, createBill } from "../../../services/billService";
import { getBoxById, getBoxByIdNoLoad } from "../../../reducers/boxSlice";
import { SERVER_URL } from "../../../services/url";
import CopyToClipboard from "react-copy-to-clipboard";
import { banks } from "../../Bills/Tables/data";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { transformTags } from "..";

const DropdownIndicator = () => null;
const ClearIndicator = () => null;
const IndicatorSeparator = () => null;

const customStyles = {
    multiValue: (styles, { data }) => ({
        ...styles,
        backgroundColor: data.color, 
        color: "white",
        borderRadius: '5px'
    }),
    multiValueLabel: (styles) => ({
        ...styles,
        color: "white",
    }),
    option: (styles, { data, isFocused, isSelected }) => ({
        ...styles,
        color: data.color,
        cursor: "pointer",
    }),
};

class BillsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            confirmBillModal: false,
            cancelBillModal: false,
            isBuyerToggleOn: false,
            isSellerToggleOn: false,
            banks: [],
            confirmBill: null,
            cancelBill: null,
            alert: false,
            loading: false,
            errorMsg: '',
            buyer: {
                bankCode: '', 
                stk: '', 
                content: `Refund GDTG ${this.props.boxId}`,
                amount: '', 
                bonus: 0
            },
            seller: {
                bankCode: '', 
                stk: '', 
                content: `Thanh Khoan GDTG ${this.props.boxId}`,
                amount: '', 
                bonus: 0
            }
        };
    
        this.toggle = this.toggle.bind(this);
        this.toggleConfirmBill = this.toggleConfirmBill.bind(this);
        this.toggleCancelBill = this.toggleCancelBill.bind(this);
        this.handleBuyerClick = this.handleBuyerClick.bind(this);
        this.handleSellerClick = this.handleSellerClick.bind(this);
    }

    componentDidMount() {
        this.getBanks()
        document.addEventListener("keydown", this.handleKeyDown);
    }
    
    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
    }
    
    handleKeyDown = (e) => {
        if (e.key === "Enter" && !this.state.alert.loading) {
            if (this.state.confirmBillModal) {
                this.handleConfirmBill();
            } else if (this.state.cancelBillModal) {
                this.handleCancelBill();
            }
        }
    };
    
    toggle = () => {
        this.setState((prevState) => ({
            modal: !prevState.modal
        }));
    };
    
    toggleConfirmBill = () => {
        this.setState((prevState) => ({
            confirmBillModal: !prevState.confirmBillModal
        }));
    };
    
    toggleCancelBill = () => {
        this.setState((prevState) => ({
            cancelBillModal: !prevState.cancelBillModal
        }));
    };

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
        try{
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
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false});
            this.toggle();
        }
        
    };

    handleConfirmBill = async () => {
         try {
            this.setState({loading: true});
            const res = await confirmBillService(this.state.confirmBill?._id);
            this.props.getBoxByIdNoLoad(this.props.boxId)                    
            this.toggleConfirmBill();
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })                    
            this.toggleConfirmBill();
            this.setState({loading: false});
        }
    }

    handleCancelBill = async () => {
        try {           
            this.setState({loading: true});  
            const res = await cancelBillService(this.state.cancelBill?._id);
            this.props.getBoxByIdNoLoad(this.props.boxId);       
            this.toggleCancelBill();
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })       
            this.toggleCancelBill();
            this.setState({loading: false});
        }
   }

    render() { 

        const { bills } = this.props;
        const { isBuyerToggleOn, isSellerToggleOn, buyer, seller} = this.state;
       
        const amount = bills.reduce((sum, item) => {
            return sum + item.amount;
        }, 0);
        const bonus = bills.reduce((sum, item) => {
            return sum + item.bonus;
        }, 0);
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
                            <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.loading && this.handleSubmit(e)}>
                                <Row>
                                    <div className="card-border mb-3 card card-body border-primary">
                                        <h5>Số tiền thanh khoản còn lại:&nbsp;
                                            <span class="fw-bold text-danger"><span>{new Intl.NumberFormat('en-US').format(this.props.totalAmount)} vnd</span></span>
                                            <CopyToClipboard text={new Intl.NumberFormat('en-US').format(this.props.totalAmount)}>
                                                <button type="button" class="btn btn-success ms-1">
                                                    <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                                                </button>
                                            </CopyToClipboard>
                                            
                                        </h5>
                                    </div>
                                
                                </Row>
                                <Row>
                                    <Col lg={6} xs={12} sm={12} className="pe-2">
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
                                        <Row className="mb-2">
                                            <Col md={4}>
                                                <Label>Khách mua</Label>      
                                            </Col>
                                            <Col md={4} xs={4} className="pe-1">
                                                <InputGroup>
                                                    <div className="input-group-text" style={{padding: '0.1rem 0.2rem'}}>
                                                        <img src={this.props.buyer && this.props.buyer.avatar ? this.props.buyer.avatar : 'https://scontent-hkg4-2.xx.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=cp0_dst-png_s50x50&_nc_cat=1&ccb=1-7&_nc_sid=22ec41&_nc_eui2=AeE9TwOP7wEuiZ2qY8BFwt1lWt9TLzuBU1Ba31MvO4FTUGf8ADKeTGTU-o43Z-i0l0K-jfGG1Z8MmBxnRngVwfmr&_nc_ohc=NtrlBO4xUsUQ7kNvgEqW2p5&_nc_zt=24&_nc_ht=scontent-hkg4-2.xx&_nc_gid=AolcEUubYfwv6yHkXKiD81H&oh=00_AYGTs7ZIZj93EBzaF2Y5UQyytpW2Bc9CwlZD7A4wC0RoRA&oe=67F82FFA'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        name="buyerName"
                                                        id="buyerName"
                                                        value={this.props.buyer?.nameCustomer}
                                                        disabled
                                                    />
                                                </InputGroup>
                                            </Col>
                                            <Col md={4} xs={4} className="ps-1">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="buyerId"
                                                        id="buyerId"
                                                        value={this.props.buyer?.facebookId}
                                                        disabled
                                                        autoComplete="off"
                                                    />
                                                    <div className="input-group-text">
                                                        <a href={`https://www.facebook.com/${this.props.buyer?.facebookId}`} rel="noreferrer" target="_blank">
                                                            <FontAwesomeIcon icon={faFacebook} size="lg"/>
                                                        </a>
                                                    </div>
                                                </InputGroup>
                                                                                                           
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                
                                            </Col>
                                            <Col md={8}>
                                                <Select
                                                    isMulti
                                                    styles={customStyles}
                                                    value={transformTags(this.props.buyer?.tags || [])}
                                                    placeholder="Tags ..."
                                                    components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }}
                                                    isDisabled 
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
                                                    onChange={(e)=>{
                                                        const sanitizedValue = e.target.value.replace(/\s/g, '');
                                                        this.setState((prevState) => ({
                                                            buyer: { ...prevState.buyer, stk: sanitizedValue }
                                                        }));
                                                    }}
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
                                                        let rawValue = e.target.value.replace(/,/g, '');
                                                        let numericValue = parseInt(rawValue, 10) || 0;
                                                        
                                                        this.setState((prevState) => ({
                                                            buyer: {
                                                                ...prevState.buyer,
                                                                amount: numericValue < 0 ? 0 : numericValue,
                                                            },
                                                        }));
                                                    }}
                                                    onPaste={(e) => {
                                                        e.preventDefault(); 
                                                        let pastedText = e.clipboardData.getData("text"); 
                                                        let numericValue = parseInt(pastedText.replace(/,/g, ""), 10) || 0; 

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
                                                    onPaste={(e) => {
                                                        e.preventDefault(); 
                                                        let pastedText = e.clipboardData.getData("text"); 
                                                        let numericValue = parseInt(pastedText.replace(/,/g, ""), 10) || 0; 

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
                                    <Col lg={6} xs={12} sm={12} className="ps-2">
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
                                        <Row className="mb-2">
                                        <Col md={4}>
                                                <Label>Khách bán</Label>      
                                            </Col>
                                            <Col md={4} xs={4} className="pe-1">
                                                <InputGroup>
                                                    <div className="input-group-text" style={{padding: '0.1rem 0.2rem'}}>
                                                        <img src={this.props.seller && this.props.seller.avatar ? this.props.seller.avatar : 'https://scontent-hkg4-2.xx.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=cp0_dst-png_s50x50&_nc_cat=1&ccb=1-7&_nc_sid=22ec41&_nc_eui2=AeE9TwOP7wEuiZ2qY8BFwt1lWt9TLzuBU1Ba31MvO4FTUGf8ADKeTGTU-o43Z-i0l0K-jfGG1Z8MmBxnRngVwfmr&_nc_ohc=NtrlBO4xUsUQ7kNvgEqW2p5&_nc_zt=24&_nc_ht=scontent-hkg4-2.xx&_nc_gid=AolcEUubYfwv6yHkXKiD81H&oh=00_AYGTs7ZIZj93EBzaF2Y5UQyytpW2Bc9CwlZD7A4wC0RoRA&oe=67F82FFA'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        name="sellerName"
                                                        id="sellerName"
                                                        value={this.props.seller?.nameCustomer}
                                                        disabled
                                                    />
                                                </InputGroup>
                                                
                                            </Col>
                                            <Col md={4} xs={4} className="ps-1">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="sellerId"
                                                        id="sellerId"
                                                        value={this.props.seller?.facebookId}
                                                        disabled
                                                        autoComplete="off"
                                                    />
                                                    <div className="input-group-text">
                                                        <a href={`https://www.facebook.com/${this.props.seller?.facebookId}`} rel="noreferrer" target="_blank">
                                                            <FontAwesomeIcon icon={faFacebook} size="lg"/>
                                                        </a>
                                                    </div>
                                                </InputGroup>
                                                                                                           
                                            </Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col md={4}>
                                                
                                            </Col>
                                            <Col md={8}>
                                                <Select
                                                    isMulti
                                                    styles={customStyles}
                                                    value={transformTags(this.props.seller?.tags || [])}
                                                    placeholder="Tags ..."
                                                    components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }}
                                                    isDisabled 
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
                                                    onChange={(e)=>{
                                                        const sanitizedValue = e.target.value.replace(/\s/g, '');
                                                        this.setState((prevState) => ({
                                                            seller: { ...prevState.seller, stk: sanitizedValue}
                                                        }));
                                                    }}
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
                                                    onPaste={(e) => {
                                                        e.preventDefault(); 
                                                        let pastedText = e.clipboardData.getData("text"); 
                                                        let numericValue = parseInt(pastedText.replace(/,/g, ""), 10) || 0; 

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
                                                    onPaste={(e) => {
                                                        e.preventDefault(); 
                                                        let pastedText = e.clipboardData.getData("text"); 
                                                        let numericValue = parseInt(pastedText.replace(/,/g, ""), 10) || 0; 

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
                                <Button color="primary" onClick={this.handleSubmit} disabled={this.state.loading}>
                                    {this.state.loading ? "Đang tạo..." : "Tạo"}
                                </Button>{" "}
                            </ModalFooter>
                        </Modal>
                    </span>
                    
                </CardHeader>
                <Table responsive hover striped bo className="align-middle mb-0">
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
                            <td className="text-center ">{item._id.slice(-8)}</td>
                            <td className="text-center ">{formatDate(item.createdAt)}</td>
                            <td
                                className="text-center"
                                onClick={() => {
                                    navigator.clipboard.writeText(item.stk);
                                }}
                            >
                                <p data-tooltip-id="my-tooltip" data-tooltip-content={item.stk} className="m-0">{banks.find(b => b.bankCode === item.bankCode).bankName}</p>
                            </td>
                            <td className="text-center ">{new Intl.NumberFormat('en-US').format(item.amount)}</td>
                            <td className="text-center ">{new Intl.NumberFormat('en-US').format(item.bonus)}</td>
                            <td className="text-center ">{item.content}</td>
                            <td className="text-center "> 
                                <BillStatusBadge status={item.status} />&nbsp;
                                {item.boxId.notes.length > 0 && <FontAwesomeIcon data-tooltip-id="my-tooltip" data-tooltip-content="Có ghi chú chưa hoàn thành" color="#d92550" icon={faExclamationTriangle}>
                                </FontAwesomeIcon>}
                                {item.boxId.status === 'lock' && <FontAwesomeIcon data-tooltip-id="my-tooltip" data-tooltip-content="Box bị khóa" color="#d92550" icon={faLock}>
                                </FontAwesomeIcon>}
                            </td>                            
                            <td className="text-center "><img className="rounded-circle" data-tooltip-id="my-tooltip" data-tooltip-content={item.staffId.name_staff} src={`${SERVER_URL}${item.staffId.avatar ? item.staffId.avatar : '/images/avatars/avatar.jpg'}`} alt={item.staffId.name_staff} style={{width: 40, height: 40, objectFit: 'cover'}}/></td>
                            <td className="text-center"><a href={item.boxId.isEncrypted ? `https://www.messenger.com/e2ee/t/${item.boxId.messengerId}` : `https://www.messenger.com/t/${item.boxId.messengerId}`} rel="noreferrer" target="_blank"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>
                            <td className="text-center ">
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-success me-1 mb-1" data-tooltip-id="my-tooltip" data-tooltip-content="Xác nhận giao dịch" onClick={() => {this.setState({ confirmBill: item }); this.toggleConfirmBill()}}>
                                        <FontAwesomeIcon icon={faCheck} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                                <a href={`/bill/${item._id}`} className="btn btn-sm btn-info me-1 mb-1" data-tooltip-id="my-tooltip" data-tooltip-content="Xem chi tiết giao dịch">
                                    <FontAwesomeIcon icon={faMoneyBill} color="#fff" size="3xs"/>
                                </a>
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-danger me-1 mb-1" data-tooltip-id="my-tooltip" data-tooltip-content="Huỷ giao dịch" onClick={() => {this.setState({ cancelBill: item }); this.toggleCancelBill()}}>
                                        <FontAwesomeIcon icon={faMinus} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                            </td>
                        </tr>)}
                        <tr className="fw-bold">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-center">{new Intl.NumberFormat('en-US').format(amount)}</td>
                            <td className="text-center">{new Intl.NumberFormat('en-US').format(bonus)}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                   
                    
                </CardFooter>
                <Modal isOpen={this.state.confirmBillModal} toggle={this.toggleConfirmBill} className={this.props.className}>
                    <ModalHeader toggle={this.toggleConfirmBill}><span style={{fontWeight: 'bold'}}>Xác nhận bill</span></ModalHeader>
                    <ModalBody>
                        Số tài khoản: {this.state.confirmBill?.stk} <br />
                        Ngân hàng: {this.state.confirmBill?.bankCode} <br />
                        Số tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.state.confirmBill?.amount)} vnd</span><br />
                        Cho: {this.state.confirmBill?.typeTransfer === 'buyer' ? "Người mua" : "Người bán"}
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleConfirmBill}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleConfirmBill} disabled={this.state.loading}>
                            {this.state.loading ? "Đang xác nhận..." : "Xác nhận"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.cancelBillModal} toggle={this.toggleCancelBill} className={this.props.className}>
                    <ModalHeader toggle={this.toggleCancelBill}><span style={{fontWeight: 'bold'}}>Huỷ bill</span></ModalHeader>
                    <ModalBody>
                        Số tài khoản: {this.state.cancelBill?.stk} <br />
                        Ngân hàng: {this.state.cancelBill?.bankCode} <br />
                        Số tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.state.cancelBill?.amount)} vnd</span><br />
                        Cho: {this.state.cancelBill?.typeTransfer === 'buyer' ? "Người mua" : "Người bán"}
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleCancelBill}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleCancelBill} disabled={this.state.loading}>
                            {this.state.loading ? "Đang xác nhận..." : "Xác nhận"} 
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </>)}
            <SweetAlert title={this.state.errorMsg} show={this.state.alert} type="error" onConfirm={() => this.setState({alert: false})}/>
            <ReactTooltip
                id="my-tooltip"
                place="bottom"
            />
        </Card>)
    }
}

const mapStateToProps = (state) => ({
    totalAmount: state.box.box ? state.box.box.amount : 0,
    boxId: state.box.box ? state.box.box._id : '',
    bills: state.box.box ? state.box.box.bills : [],
    loading: state.box.loading,
    buyer: state.box.box ? state.box.box.buyer : null,
    seller: state.box.box ? state.box.box.seller : null,
});
  
const mapDispatchToProps = {
    getBills,
    setFilters,
    getBoxById,
    getBoxByIdNoLoad
};
  
export default connect(mapStateToProps, mapDispatchToProps)(BillsTable);