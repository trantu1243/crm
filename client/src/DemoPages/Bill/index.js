import React, { Component, Fragment } from "react";

import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, Label, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import { addNote, deleteNote, getBoxById, getBoxByIdNoLoad, updateBox } from "../../reducers/boxSlice";
import { withRouter } from "../../utils/withRouter";
import { confirmBill, getBillById, switchBill } from "../../reducers/billsSlice";
import Loader from "react-loaders";
import { cancelBillService, updateBill } from "../../services/billService";
import CopyToClipboard from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchBankApi } from "../../services/bankApiService";
import { faCheck, faCloudDownloadAlt, faCopy, faLock, faMinus, faPen, faSave, faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import Select from "react-select";
import SweetAlert from 'react-bootstrap-sweetalert';
import { formatDate } from "../Transactions/Tables/data";
import { faFacebook, faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { addNoteService, deleteNoteService, getFBInfo, getInfoService, lockBoxService, updateBoxService } from "../../services/boxService";
import {
    IoIosRefresh,
  } from "react-icons/io";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";

library.add(
    fab,
    faSpinner,
);

class Box extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            value: [],
            buyerModal: false,
            sellerModal: false,
            showBuyerQR: false,
            showSellerQR: false,
            confirmBillModal: false,
            cancelBillModal: false,
            confirmAllBillModal: false,
            cancelAllBillModal: false,
            confirmBill: null,
            cancelBill: null,
            isMobile: window.innerWidth < 768,
            isBuyerToggleOn: false,
            isSellerToggleOn: false,
            alert: false,
            errorMsg: '',
            banks: [],
            note: '',
            buyerOpen: false,
            sellerOpen: false,
            buyerSender: null,
            sellerSender: null,
            sender: this.props.sender,
            buyer: {
                _id: '',
                bankCode: '', 
                stk: '', 
                content: ``,
                amount: '', 
                bonus: 0
            },
            seller: {
                _id: '',
                bankCode: '', 
                stk: '', 
                content: ``,
                amount: '', 
                bonus: 0
            },
            input: {
                name: '',
                messengerId: '',
                isEncrypted: false,
                sellerId: '',
                buyerId: '',
            }
        };

        this.toggleBuyer = this.toggleBuyer.bind(this);
        this.toggleSeller = this.toggleSeller.bind(this);
        this.toggleConfirmBill = this.toggleConfirmBill.bind(this);
        this.toggleCancelBill = this.toggleCancelBill.bind(this);
        this.toggleAllCancelBill = this.toggleAllCancelBill.bind(this);
        this.toggleConfirmAllBill = this.toggleConfirmAllBill.bind(this);
        this.toggleBuyerOpen = this.toggleBuyerOpen.bind(this);
        this.toggleSellerOpen = this.toggleSellerOpen.bind(this);
    }

    componentDidMount() {
        const { id } = this.props.params; 
        this.props.getBillById(id);
        this.getBanks()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.bill !== this.props.bill && this.props.bill?.boxId) {
            this.props.getBoxById(this.props.bill.boxId._id);
            if (this.props.bill.typeTransfer === 'seller') {
                this.setState({
                    isSellerToggleOn: true,
                    seller: {
                        _id: this.props.bill._id,
                        bankCode: this.props.bill.bankCode, 
                        stk: this.props.bill.stk, 
                        content: this.props.bill.content,
                        amount: this.props.bill.amount, 
                        bonus: this.props.bill.bonus
                    }
                })
                if (this.props.bill.billId) {
                    this.setState({
                        isBuyerToggleOn: true,
                        buyer: {
                            _id: this.props.bill.billId._id,
                            bankCode: this.props.bill.billId.bankCode, 
                            stk: this.props.bill.billId.stk, 
                            content: this.props.bill.billId.content,
                            amount: this.props.bill.billId.amount, 
                            bonus: this.props.bill.billId.bonus
                        }
                    })
                }
            } else {
                this.setState({
                    isBuyerToggleOn: true,
                    buyer: {
                        _id: this.props.bill._id,
                        bankCode: this.props.bill.bankCode, 
                        stk: this.props.bill.stk, 
                        content: this.props.bill.content,
                        amount: this.props.bill.amount, 
                        bonus: this.props.bill.bonus
                    }
                })
                if (this.props.bill.billId) {
                    this.setState({
                        isSellerToggleOn: true,
                        seller: {
                            _id: this.props.bill.billId._id,
                            bankCode: this.props.bill.billId.bankCode, 
                            stk: this.props.bill.billId.stk, 
                            content: this.props.bill.billId.content,
                            amount: this.props.bill.billId.amount, 
                            bonus: this.props.bill.billId.bonus
                        }
                    })
                }
            }
        }

        if (prevProps.box !== this.props.box) {
            this.setState({
                buyerSender: this.props.box.buyer,
                sellerSender: this.props.box.seller,
                input: {
                    name: this.props.box.name,
                    messengerId: this.props.box.messengerId,
                    isEncrypted:  this.props.box.isEncrypted || false,
                    buyerId: this.props.box.buyer ? this.props.box.buyer.facebookId : '',
                    sellerId: this.props.box.seller ? this.props.box.seller.facebookId : '',
                }
            });
        }
        if (prevProps.sender !== this.props.sender) {
            this.setState({ sender: this.props.sender })
        }
    }
    
    getBanks = async () => {
        const data = await fetchBankApi();
        this.setState({
            banks: data.data
        })
    }

    toggleBuyer = () => {
        this.setState((prevState) => ({
            buyerModal: !prevState.buyerModal
        }));
    };

    toggleSeller = () => {
        this.setState((prevState) => ({
            sellerModal: !prevState.sellerModal
        }));
    };

    toggleBuyerOpen() {
        this.setState({
            buyerOpen: !this.state.buyerOpen,
        });
    }

    toggleSellerOpen() {
        this.setState({
            sellerOpen: !this.state.sellerOpen,
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }
    
    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 768 });
    };

    toggleCancelBill = () => {
        this.setState((prevState) => ({
            cancelBillModal: !prevState.cancelBillModal
        }), () => {
            if (this.state.cancelBillModal) {
                document.addEventListener("keydown", this.handleKeyDown);
            } else {
                document.removeEventListener("keydown", this.handleKeyDown);
            }
        });
    };

    toggleAllCancelBill = () => {
        this.setState((prevState) => ({
            cancelAllBillModal: !prevState.cancelAllBillModal
        }), () => {
            if (this.state.cancelAllBillModal) {
                document.addEventListener("keydown", this.handleKeyDown);
            } else {
                document.removeEventListener("keydown", this.handleKeyDown);
            }
        });
    };

    toggleQR = (side) => {
        if (side === "buyer") {
            this.setState({ showBuyerQR: !this.state.showBuyerQR, showSellerQR: false });
        } else {
            this.setState({ showSellerQR: !this.state.showSellerQR, showBuyerQR: false });
        }
    };

    toggleConfirmBill = () => {
        this.setState((prevState) => ({
            confirmBillModal: !prevState.confirmBillModal
        }), () => {
            if (this.state.confirmBillModal) {
                document.addEventListener("keydown", this.handleKeyDown);
            } else {
                document.removeEventListener("keydown", this.handleKeyDown);
            }
        });
    };

    
    toggleConfirmAllBill = () => {
        this.setState((prevState) => ({
            confirmAllBillModal: !prevState.confirmAllBillModal
        }), () => {
            if (this.state.confirmBillModal) {
                document.addEventListener("keydown", this.handleKeyDown);
            } else {
                document.removeEventListener("keydown", this.handleKeyDown);
            }
        });
    };

    handleCancelBill = async () => {
        try {           
            this.setState({loading: true});  
            await cancelBillService(this.state.cancelBill?._id);
            this.props.getBillById(this.props.bill._id);            
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

    handleKeyDown = (e) => {
        if (e.key === "Enter" && !this.state.loading && this.state.confirmBillModal) {
          this.handleConfirmBill();
        } else if (e.key === "Enter" && !this.state.loading && this.state.cancelBillModal) {
            this.handleCancelBill();
        } else if (e.key === "Enter" && !this.state.loading && this.state.confirmAllBillModal) {
            this.handleConfirmAllBill();
        } else if (e.key === "Enter" && !this.state.loading && this.state.cancelAllBillModal) {
            this.handleCancelAllBill();
        }
    };


    handleSwitch = async () => {
        await this.props.switchBill(this.props.bill._id);
        this.props.getBillById(this.props.bill._id);
    }

    handleConfirmBill = async () => {
        this.setState({loading: true});
        await this.props.confirmBill(this.state.confirmBill._id);
        this.props.getBillById(this.props.bill._id);
        this.toggleConfirmBill()
        this.setState({loading: false});
    }

    handleConfirmAllBill = async () => {

        this.setState({loading: true});
        if (this.props.bill?.status === 1) 
            await this.props.confirmBill(this.props.bill._id);
        if (this.props.bill?.billId && this.props.bill?.billId?.status === 1) 
            await this.props.confirmBill(this.props.bill.billId._id);
        this.props.getBillById(this.props.bill._id);
        this.toggleConfirmAllBill()
        this.setState({loading: false});
    }

    handleCancelAllBill = async () => {
        try {           
            this.setState({loading: true});  
            if (this.props.bill?.status === 1) 
                await cancelBillService(this.props.bill?._id);
            if (this.props.bill?.billId && this.props.bill?.billId?.status === 1) 
                await cancelBillService(this.props.bill?.billId._id);
            this.props.getBillById(this.props.bill._id);            
            this.toggleAllCancelBill();
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })       
            this.toggleAllCancelBill();
            this.setState({loading: false});
        }
    }

    handleUpdateSeller = async (e) => {
        try {     
            e.preventDefault();      
            this.setState({loading: true});  
           
            await updateBill(this.state.seller._id, this.state.seller);
          
            this.props.getBillById(this.props.bill._id);            
            this.toggleSeller();
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })       
            this.toggleSeller();
            this.setState({loading: false});
        }
    }

    handleUpdateBuyer = async (e) => {
        try {   
            e.preventDefault();    
            this.setState({loading: true});  
           
            await updateBill(this.state.buyer._id, this.state.buyer);
          
            this.props.getBillById(this.props.bill._id);            
            this.toggleBuyer();
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })       
            this.toggleBuyer();
            this.setState({loading: false});
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            input: {
                ...prevState.input,
                [name]: value,
            },
        }));
    };

    handleSave = async () => {
        try{
            this.setState({loading: true});
            await updateBoxService(this.props.box._id, this.state.input);
            await this.props.getBoxByIdNoLoad(this.props.box._id);
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error,
                loading: false
            })
        }
    }

    handleLock = async () => {
        try{
            this.setState({loading: true});
            await lockBoxService(this.props.box._id);
            await this.props.getBoxByIdNoLoad(this.props.box._id);
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error,
                loading: false
            })
        }
    }

    handleGetInfo = async () => {
            try{
                this.setState({loading: true});
                await getInfoService(this.props.box._id);
                await this.props.getBoxByIdNoLoad(this.props.box._id);
                this.setState({loading: false});
            } catch (error) {
                this.setState({
                    alert: true,
                    errorMsg: error,
                    loading: false
                })
            }
        }
    

    handleAddNote = async () => {
        try{
            await addNoteService(this.props.box._id, this.state.note);
            this.props.addNote(this.state.note);
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
        }
    }

    handleDeleteNote = async (note) => {
        try{
            await deleteNoteService(this.props.box._id, note);
            this.props.deleteNote(note);
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
        }
    }

    getFB = async (id) => {
        try{
            this.setState({loading: true});
            await getFBInfo(id);
            await this.props.getBoxByIdNoLoad(this.props.box._id);
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error,
                loading: false
            })
        }
    }

    render() {       
        const box = this.props.box || {
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
        const { buyer, seller} = this.state;
        const input = this.state.input;
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
                                                <CardTitle>Thông tin box giao - &nbsp;
                                                    {box.status === "active" && <span className={`badge bg-primary`}>đang hoạt động</span>}
                                                    {box.status === "complete" && <span className={`badge bg-success`}>hoàn thành</span>}
                                                    {box.status === "lock" && <span className={`badge bg-danger`}>bị khóa</span>}
                                                </CardTitle>
                                                <div class="btn-actions-pane-right">
                                                    <button class="btn btn-danger me-1" disabled={this.state.loading} onClick={this.handleLock}>
                                                        <FontAwesomeIcon icon={faLock}/> {box.status !== 'lock' ? 'Khóa box' : 'Mở khóa'}
                                                    </button>
                                                    <button class="btn btn-warning me-1" disabled={this.state.loading} onClick={this.handleGetInfo}>
                                                        <FontAwesomeIcon icon={faCloudDownloadAlt}/> {this.state.loading ? "Đang lấy ..." : "Lấy thông tin khách hàng"}
                                                    </button>
                                                    <button class="btn btn-primary me-1" onClick={this.handleSave} disabled={this.state.loading}>
                                                        <FontAwesomeIcon icon={faSave} /> {this.state.loading ? "Đang lưu ..." : "Lưu cập nhật thông tin"}
                                                    </button>
                                                </div>
                                            </CardHeader>
                                            <CardBody>
                                                <Row>
                                                    <Col md={6} xs={12} className="pe-2">
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Tên box</Label>
                                                            </Col>
                                                            <Col md={8} xs={12}>
                                                                <Input
                                                                    type="text"
                                                                    name="name"
                                                                    id="name"
                                                                    value={input.name}
                                                                    onChange={this.handleInputChange}
                                                                />
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Bên mua</Label>
                                                            </Col>
                                                            
                                                            <Col md={4} xs={6} className="pe-1">
                                                                <InputGroup>
                                                                    <Input
                                                                        type="text"
                                                                        name="buyerId"
                                                                        id="buyerId"
                                                                        value={input.buyerId}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            const match = value.match(/(\d+)/);
                                                                            this.setState({ 
                                                                                input: {
                                                                                    ...this.state.input,
                                                                                    buyerId: match ? match[0] : "" 
                                                                                },
                                                                                buyerOpen: false
                                                                            });
                                                                        }}
                                                                        onClick={this.toggleBuyerOpen}
                                                                        autoComplete="off"
                                                                    />
                                                                    <div className="input-group-text">
                                                                        <div role="button" disabled={this.state.loading} onClick={()=>{this.state.buyerSender && !this.state.loading && this.getFB(this.state.buyerSender.facebookId)}}>
                                                                            {this.state.loading ? <FontAwesomeIcon icon={["fas", "spinner"]} pulse fixedWidth color="#545cd8" size="lg" />
                                                                            : <IoIosRefresh fontSize="18.7px" color="#545cd8"/>}
                                                                        </div>
                                                                    </div>
                                                               </InputGroup>
                                                                {this.state.sender.length > 0 && <Dropdown isOpen={this.state.buyerOpen} toggle={this.toggleBuyerOpen} style={{height: 0}}>
                                                                    <DropdownToggle
                                                                        style={{width: 0, height: 0, padding: 0}}
                                                                    >
                                                                     
                                                                    </DropdownToggle>
                                                                    <DropdownMenu>
                                                                        {this.state.sender.map(sender => (
                                                                            <DropdownItem
                                                                                key={sender.id} 
                                                                                onClick={() => this.setState({
                                                                                    buyerSender: sender, 
                                                                                    input: {
                                                                                        ...this.state.input,
                                                                                        buyerId: sender.facebookId,
                                                                                    }
                                                                                })}
                                                                            >
                                                                                <img src={sender && sender.avatar ? sender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.jpg'} alt={sender.name} style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 5 }} />
                                                                                <div >
                                                                                    <p style={{margin: 0}}>{sender.nameCustomer}</p>
                                                                                    <p style={{margin: 0, fontSize: '0.7rem', color: '#6c757d'}}>{sender.facebookId}</p>
                                                                                </div>
                                                                            </DropdownItem>
                                                                        ))}
                                                                    </DropdownMenu>
                                                                </Dropdown>}                                                                      
                                                            </Col>
                                                            <Col md={4} xs={6} className="ps-1">
                                                                <InputGroup>
                                                                    <Input
                                                                        type="text"
                                                                        name="buyerName"
                                                                        id="buyerName"
                                                                        value={this.state.buyerSender?.nameCustomer}
                                                                        disabled
                                                                    />
                                                                    <div className="input-group-text" style={{padding: '0.1rem 0.44rem'}}>
                                                                        <a href={`https://www.facebook.com/${this.state.buyerSender?.facebookId}`} rel="noreferrer" target="_blank">
                                                                            <img src={this.state.buyerSender && this.state.buyerSender.avatar ? this.state.buyerSender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.jpg'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                                        </a>
                                                                    </div>
                                                                </InputGroup>
                                                                
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Ghi chú</Label>
                                                            </Col>
                                                            <Col md={8} xs={12}>
                                                                <InputGroup>
                                                                    <Input
                                                                        type="text"
                                                                        name="note"
                                                                        id="note"
                                                                        value={this.state.note}
                                                                        onChange={(e)=>{this.setState({note: e.target.value})}}
                                                                        onKeyDown={(e) => e.key === "Enter" && this.handleAddNote()}
                                                                    />
                                                                    <button class="input-group-text" onClick={this.handleAddNote}>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            height={19}
                                                                            viewBox="0 0 56 56"
                                                                            width={19}
                                                                            fill="#545cd8"
                                                                        >
                                                                            <path d="m47.7928 9.5547c-1.2187 0-2.0859.8437-2.0859 2.0625 0 .8438.0469 1.5938.0469 2.7187 0 8.6953-3 12.2344-11.625 12.2344h-16.1485l-5.7656.3516 7.8985-7.2422 5.2031-5.2969c.375-.375.5859-.914.5859-1.4766 0-1.1718-.914-2.0156-2.0625-2.0156-.5625 0-1.0547.1875-1.5234.6328l-15.586 15.5625c-.4687.4453-.7265 1.0078-.7265 1.5703 0 .586.2578 1.125.7265 1.5938l15.5157 15.4922c.539.4922 1.0312.7031 1.5937.7031 1.1485 0 2.0625-.8437 2.0625-2.0156 0-.5625-.2109-1.1016-.5859-1.5l-5.2031-5.2969-7.875-7.1953 5.7421.3281h16.3594c11.1328 0 15.6565-4.875 15.6565-16.2187 0-1.3828-.047-2.5313-.1877-3.2578-.2112-.9376-.7733-1.7344-2.0157-1.7344z" />
                                                                        </svg>
                                                                    </button>
                                                                    
                                                                </InputGroup>  
                                                            </Col>
                                                                
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Danh sách ghi chú</Label>
                                                            </Col>
                                                            <Col md={8} xs={12}>
                                                                <ListGroup>
                                                                    {box.notes.map((item, index)=> {
                                                                        return <ListGroupItem key={index}>
                                                                        <div className="todo-indicator bg-warning" />
                                                                            <div className="widget-content p-0">
                                                                                <div className="widget-content-wrapper">
                                                                                    
                                                                                    <div className="widget-content-left">
                                                                                        <div className="widget-heading">
                                                                                            {item}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="widget-content-right">
                                                                                    <Button className="border-0 btn-transition" outline color="danger" onClick={()=>{this.handleDeleteNote(item)}}>
                                                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </ListGroupItem>
                                                                    })}
                                                                    
                                                                </ListGroup>
                                                            </Col>
                                                                
                                                        </Row>
                                                    </Col>

                                                    <Col md={6} xs={12} className="ps-2">
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Messenger ID</Label>
                                                            </Col>
                                                            <Col md={8} xs={12}>
                                                                <InputGroup>
                                                                    <Input
                                                                        type="text"
                                                                        name="messengerId"
                                                                        id="messengerId"
                                                                        value={input.messengerId}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            if (/^\d*$/.test(value)) { 
                                                                                this.handleInputChange(e);
                                                                            }
                                                                        }}
                                                                    />
                                                                    <div class="input-group-text">
                                                                        <a href={box.isEncrypted ? `https://www.messenger.com/e2ee/t/${box.messengerId}` : `https://www.messenger.com/t/${box.messengerId}`} rel="noreferrer" target="_blank">
                                                                            <FontAwesomeIcon icon={faFacebookMessenger} size="lg"/>
                                                                        </a>
                                                                    </div>
                                                                </InputGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Bên bán</Label>
                                                            </Col>
                                                            <Col md={4} xs={6} className="ps-1">
                                                                <InputGroup>
                                                                    <Input
                                                                        type="text"
                                                                        name="sellerId"
                                                                        id="sellerId"
                                                                        value={input.sellerId}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            const match = value.match(/(\d+)/);
                                                                            this.setState({ 
                                                                                input: {
                                                                                    ...this.state.input,
                                                                                    sellerId: match ? match[0] : "" 
                                                                                },
                                                                                sellerOpen: false
                                                                            });
                                                                        }}
                                                                        onClick={this.toggleSellerOpen}
                                                                        autoComplete="off"
                                                                    />
                                                                    <div className="input-group-text">
                                                                        <div role="button" disabled={this.state.loading} onClick={()=>{this.state.sellerSender && !this.state.loading && this.getFB(this.state.sellerSender.facebookId)}}>
                                                                            {this.state.loading ? <FontAwesomeIcon icon={["fas", "spinner"]} pulse fixedWidth color="#545cd8" size="lg" />
                                                                            : <IoIosRefresh fontSize="18.7px" color="#545cd8"/>}
                                                                        </div>
                                                                    </div>
                                                                </InputGroup>
                                                                {this.state.sender.length > 0 && <Dropdown isOpen={this.state.sellerOpen} toggle={this.toggleSellerOpen} style={{height: 0}}>
                                                                    <DropdownToggle 
                                                                        style={{width: 0, height: 0, padding: 0}}
                                                                    >
                                                                        
                                                                    </DropdownToggle>
                                                                    <DropdownMenu>
                                                                        {this.state.sender.map(sender => (
                                                                            <DropdownItem 
                                                                                key={sender.id} 
                                                                                onClick={() => this.setState({
                                                                                    sellerSender: sender, 
                                                                                    input: {
                                                                                        ...this.state.input,
                                                                                        sellerId: sender.facebookId,
                                                                                    }
                                                                                })}
                                                                            >
                                                                                <img src={sender && sender.avatar ? sender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.jpg'} alt={sender.name} style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 5 }} />
                                                                                <div >
                                                                                    <p style={{margin: 0}}>{sender.nameCustomer}</p>
                                                                                    <p style={{margin: 0, fontSize: '0.7rem', color: '#6c757d'}}>{sender.facebookId}</p>
                                                                                </div>
                                                                            </DropdownItem>
                                                                        ))}
                                                                    </DropdownMenu>
                                                                </Dropdown>}                                                                      
                                                            </Col>
                                                            <Col md={4} xs={6} className="pe-1">
                                                                <InputGroup>
                                                                    <Input
                                                                        type="text"
                                                                        name="sellerName"
                                                                        id="sellerName"
                                                                        value={this.state.sellerSender?.nameCustomer}
                                                                        disabled
                                                                    />
                                                                    <div className="input-group-text" style={{padding: '0.1rem 0.44rem'}}>
                                                                        <a href={`https://www.facebook.com/${this.state.sellerSender?.facebookId}`} rel="noreferrer" target="_blank">
                                                                            <img src={this.state.sellerSender && this.state.sellerSender.avatar ? this.state.sellerSender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.jpg'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                                        </a>
                                                                    </div>
                                                                </InputGroup>                                              
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Box mã hóa?</Label>
                                                            </Col>
                                                            <Col md={8} xs={12}>
                                                                <Input 
                                                                    id="isEncrypted" 
                                                                    type="checkbox" checked={this.state.input.isEncrypted} 
                                                                    className="me-3"
                                                                    onChange={() => {
                                                                        this.setState({
                                                                            input: {
                                                                                ...this.state.input,
                                                                                isEncrypted: !this.state.input.isEncrypted
                                                                            }
                                                                        })
                                                                    }}
                                                                />
                                                            </Col>
                                                                
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Số giao dịch thành công</Label>
                                                            </Col>
                                                            <Col md={8} xs={12}>
                                                                <p>{this.props.box.transactions.filter(item => item.status === 2 || item.status === 8).length}/{this.props.box.transactions.length}</p>
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Thời gian tạo</Label>
                                                            </Col>
                                                            <Col md={8} xs={12}>
                                                                <p>{formatDate(box.createdAt)}</p>
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Số tiền đã giao dịch</Label>
                                                            </Col>
                                                            <Col md={8} xs={12}>
                                                                <p className="fw-bold text-success">{new Intl.NumberFormat('en-US').format(this.props.box.bills.reduce((sum, item) => sum + item.amount, 0))} vnd</p>
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3">
                                                            <Col md={4} xs={12}>
                                                                <Label>Số tiền trong box</Label>
                                                            </Col>
                                                            <Col md={8} xs={12}>
                                                                <p className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(box.amount)} vnd
                                                                    <CopyToClipboard text={new Intl.NumberFormat('en-US').format(box.amount)}>
                                                                        <button class="btn btn-success ms-1">
                                                                            <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                                                                        </button>
                                                                    </CopyToClipboard>
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
                                                            <div className="d-flex justify-content-center gap-2 p-3">
                                                                <Button color="success" title="Xác nhận bill thanh khoản" onClick={() => {this.setState({ confirmBill: bill }); this.toggleConfirmBill()}}><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon></Button>
                                                                <Button color="info" title="Chỉnh sửa bill thanh khoản" onClick={this.toggleBuyer}><FontAwesomeIcon icon={faPen}></FontAwesomeIcon></Button>
                                                                <Button color="danger" title="Hủy bill thanh khoản" onClick={() => {this.setState({ cancelBill: bill }); this.toggleCancelBill()}}><FontAwesomeIcon icon={faMinus}></FontAwesomeIcon></Button>
                                                            </div>
                                                        )}
                                                        {bill.status === 2 && (
                                                            <div className="d-flex justify-content-center gap-3 p-4">
                                                                <span className="badge bg-success">Thành công</span>
                                                            </div>
                                                        )}
                                                        {bill.status === 3 && (
                                                            <div className="d-flex justify-content-center gap-3 p-4">
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
                                                            <div className="d-flex justify-content-center gap-2 p-3">
                                                                <Button color="success" title="Xác nhận bill thanh khoản" onClick={() => {this.setState({ confirmBill: bill.billId }); this.toggleConfirmBill()}}><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon></Button>
                                                                <Button color="info" title="Chỉnh sửa bill thanh khoản" onClick={this.toggleBuyer}><FontAwesomeIcon icon={faPen}></FontAwesomeIcon></Button>
                                                                <Button color="danger" title="Hủy bill thanh khoản" onClick={() => {this.setState({ cancelBill: bill.billId }); this.toggleCancelBill()}}><FontAwesomeIcon icon={faMinus}></FontAwesomeIcon></Button>
                                                            </div>
                                                        )}
                                                        {bill.billId.status === 2 && (
                                                            <div className="d-flex justify-content-center gap-3 p-4">
                                                                <span className="badge bg-success">Thành công</span>
                                                            </div>
                                                        )}
                                                        {bill.billId.status === 3 && (
                                                            <div className="d-flex justify-content-center gap-3 p-4">
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
                                                            <div className="d-flex justify-content-center gap-2 p-3">
                                                                <Button color="success" title="Xác nhận bill thanh khoản"  onClick={() => {this.setState({ confirmBill: bill }); this.toggleConfirmBill()}}><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon></Button>
                                                                <Button color="info" title="Chỉnh sửa bill thanh khoản" onClick={this.toggleSeller}><FontAwesomeIcon icon={faPen}></FontAwesomeIcon></Button>
                                                                <Button color="danger" title="Hủy bill thanh khoản" onClick={() => {this.setState({ cancelBill: bill }); this.toggleCancelBill()}}><FontAwesomeIcon icon={faMinus}></FontAwesomeIcon></Button>
                                                            </div>
                                                        )}
                                                        {bill.status === 2 && (
                                                            <div className="d-flex justify-content-center gap-3 p-4">
                                                                <span className="badge bg-success">Thành công</span>
                                                            </div>
                                                        )}
                                                        {bill.status === 3 && (
                                                            <div className="d-flex justify-content-center gap-3 p-4">
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
                                                            <div className="d-flex justify-content-center gap-2 p-3">
                                                                <Button color="success" title="Xác nhận bill thanh khoản" onClick={() => {this.setState({ confirmBill: bill.billId }); this.toggleConfirmBill()}}><FontAwesomeIcon icon={faCheck}></FontAwesomeIcon></Button>
                                                                <Button color="info" title="Chỉnh sửa bill thanh khoản" onClick={this.toggleSeller}><FontAwesomeIcon icon={faPen}></FontAwesomeIcon></Button>
                                                                <Button color="danger" title="Hủy bill thanh khoản" onClick={() => {this.setState({ cancelBill: bill.billId }); this.toggleCancelBill()}}><FontAwesomeIcon icon={faMinus}></FontAwesomeIcon></Button>
                                                            </div>
                                                        )}
                                                        {bill.billId.status === 2 && (
                                                            <div className="d-flex justify-content-center gap-3 p-4">
                                                                <span className="badge bg-success">Thành công</span>
                                                            </div>
                                                        )}
                                                        {bill.billId.status === 3 && (
                                                            <div className="d-flex justify-content-center gap-3 p-4">
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
                                        <div className="d-flex justify-content-center gap-2 mb-2">
                                            <Button color="info" style={{width: 150}} onClick={this.handleSwitch}>Đảo bill</Button>
                                        </div> 
                                        {bill.billId && (bill.status === 1 || bill.billId.status === 1) &&<div className="d-flex justify-content-center gap-2 mb-2">
                                            <Button color="success" style={{width: 150}} onClick={this.toggleConfirmAllBill}>Xác nhận tất cả</Button>
                                            <Button color="danger" style={{width: 150}} onClick={this.toggleAllCancelBill}>Hủy tất cả</Button>
                                        </div>}
                                        
                                        <div className="d-flex justify-content-center gap-2">
                                            <a href={`/box/${bill.boxId?._id || ''}`} className="btn btn-secondary" style={{width: 150}}>Quay lại box</a>
                                            <a href="/bills" className="btn btn-secondary" style={{width: 150}}>Quay lại quản lý bill</a>
                                        </div>
                                    </Card>
                                </Container>
                            </>)}
                        </div>
                    </div>
                </div>

                <Modal 
                    isOpen={this.state.confirmBillModal} 
                    toggle={this.toggleConfirmBill} 
                    className={this.props.className} 
                    
                >
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
                <Modal 
                    isOpen={this.state.confirmAllBillModal} 
                    toggle={this.toggleConfirmAllBill} 
                    className={this.props.className} 
                    
                >
                    <ModalHeader toggle={this.toggleConfirmAllBill}><span style={{fontWeight: 'bold'}}>Xác nhận cả 2 bill</span></ModalHeader>
                    <ModalBody>
                        Số tài khoản: {this.props.bill?.stk} <br />
                        Ngân hàng: {this.props.bill?.bankCode} <br />
                        Số tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.props.bill?.amount)} vnd</span><br />
                        Cho: {this.props.bill?.typeTransfer === 'buyer' ? "Người mua" : "Người bán"}<br />
                        và<br/>
                        Số tài khoản: {this.props.bill?.billId?.stk} <br />
                        Ngân hàng: {this.props.bill?.billId?.bankCode} <br />
                        Số tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.props.bill?.billId?.amount)} vnd</span><br />
                        Cho: {this.props.bill?.billId?.typeTransfer === 'buyer' ? "Người mua" : "Người bán"}<br />
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleConfirmAllBill}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleConfirmAllBill} disabled={this.state.loading}>
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

                <Modal isOpen={this.state.cancelAllBillModal} toggle={this.toggleAllCancelBill} className={this.props.className}>
                    <ModalHeader toggle={this.toggleAllCancelBill}><span style={{fontWeight: 'bold'}}>Huỷ bill</span></ModalHeader>
                    <ModalBody>
                        Số tài khoản: {this.props.bill?.stk} <br />
                        Ngân hàng: {this.props.bill?.bankCode} <br />
                        Số tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.props.bill?.amount)} vnd</span><br />
                        Cho: {this.props.bill?.typeTransfer === 'buyer' ? "Người mua" : "Người bán"}<br />
                        và<br/>
                        Số tài khoản: {this.props.bill?.billId?.stk} <br />
                        Ngân hàng: {this.props.bill?.billId?.bankCode} <br />
                        Số tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.props.bill?.billId?.amount)} vnd</span><br />
                        Cho: {this.props.bill?.billId?.typeTransfer === 'buyer' ? "Người mua" : "Người bán"}<br />
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleAllCancelBill}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleCancelAllBill} disabled={this.state.loading}>
                            {this.state.loading ? "Đang hủy..." : "Xác nhận hủy"} 
                        </Button>{" "}
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.buyerModal} toggle={this.toggleBuyer} className="modal-xl" style={{marginTop: '10rem'}}>
                    <ModalHeader toggle={this.toggleBuyer}>Chỉnh sửa bill thanh khoản</ModalHeader>
                    <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.loading && this.handleUpdateBuyer(e)}>
                        <Row>
                            <div className="card-border mb-3 card card-body border-primary">
                                <h5>Số tiền thanh khoản còn lại:&nbsp;
                                    <span class="fw-bold text-danger"><span>{new Intl.NumberFormat('en-US').format(this.props.box?.amount)} vnd</span></span>
                                    <CopyToClipboard text={new Intl.NumberFormat('en-US').format(this.props.box?.amount)}>
                                        <button type="button" class="btn btn-success ms-1">
                                            <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                                        </button>
                                    </CopyToClipboard>
                                    
                                </h5>
                            </div>
                        
                        </Row>
                   
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Tạo cho <span className="fw-bold text-danger">BÊN MUA</span>?</Label>
                                    </Col>
                                    <Col md={8}>
                                        <div className="switch has-switch me-2" data-on-label="ON"
                                            data-off-label="OFF">
                                            <div className={cx("switch-animate", {
                                                "switch-on": true,
                                                "switch-off": false,
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
                                    <Col md={4} xs={4} className="pe-1">
                                        <InputGroup>
                                            <div className="input-group-text" style={{padding: '0.1rem 0.2rem'}}>
                                                <img src={this.props.buyer && this.props.buyer.avatar ? this.props.buyer.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.jpg'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
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

                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.toggleBuyer}>
                            Hủy
                        </Button>
                        <Button color="primary" onClick={this.handleUpdateBuyer} disabled={this.state.loading}>
                            {this.state.loading ? "Đang tạo..." : "Tạo"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.sellerModal} toggle={this.toggleSeller} className="modal-xl" style={{marginTop: '10rem'}}>
                    <ModalHeader toggle={this.toggleSeller}>Chỉnh sửa bill thanh khoản</ModalHeader>
                    <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.loading && this.handleUpdateSeller(e)}>
                        <Row>
                            <div className="card-border mb-3 card card-body border-primary">
                                <h5>Số tiền thanh khoản còn lại:&nbsp;
                                    <span class="fw-bold text-danger"><span>{new Intl.NumberFormat('en-US').format(this.props.box?.amount)} vnd</span></span>
                                    <CopyToClipboard text={new Intl.NumberFormat('en-US').format(this.props.box?.amount)}>
                                        <button type="button" class="btn btn-success ms-1">
                                            <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                                        </button>
                                    </CopyToClipboard>
                                    
                                </h5>
                            </div>
                        
                        </Row>
              
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Tạo cho <span className="fw-bold text-danger">BÊN BÁN</span>?</Label>
                                    </Col>
                                    <Col md={8}>
                                        <div className="switch has-switch me-2" data-on-label="ON"
                                            data-off-label="OFF" onClick={this.handleSellerClick}>
                                            <div className={cx("switch-animate", {
                                                "switch-on": true,
                                                "switch-off": false,
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
                                    <Col md={4} xs={4} className="pe-1">
                                        <InputGroup>
                                            <div className="input-group-text" style={{padding: '0.1rem 0.2rem'}}>
                                                <img src={this.props.seller && this.props.seller.avatar ? this.props.seller.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.jpg'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
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

                           
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.toggleSeller}>
                            Hủy
                        </Button>
                        <Button color="primary" onClick={this.handleUpdateSeller} disabled={this.state.loading}>
                            {this.state.loading ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
                <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                    type="error" onConfirm={() => this.setState({alert: false})}/>
            </Fragment>
        );
    }    
}

const mapStateToProps = (state) => ({
    box: state.box.box || {},
    loading: state.bills.loading  || false,
    bill: state.bills.bill,
    sender: state.box.sender,
    buyer: state.box.box ? state.box.box.buyer : null,
    seller: state.box.box ? state.box.box.seller : null,
});
  
const mapDispatchToProps = {
    getBoxById,
    getBillById,
    switchBill,
    confirmBill,
    addNote,
    deleteNote,
    updateBox,
    getBoxByIdNoLoad
};
  
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Box));
