import React, { Component, Fragment } from "react";
import Tabs from "react-responsive-tabs";

import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, Label, ListGroup, ListGroupItem } from "reactstrap";
import Loader from "react-loaders";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import TransactionBoxTable from "./Table/TransactionBoxTable";
import BillBoxTable from "./Table/BillBoxTable";
import { addNote, deleteNote, getBoxById, getBoxByIdNoLoad, updateBox } from "../../reducers/boxSlice";
import { withRouter } from "../../utils/withRouter";
import { formatDate } from "../Transactions/Tables/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudDownloadAlt, faCopy, faLock, faLockOpen, faSave, faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { addNoteService, deleteNoteService, getFBInfo, getInfoService, lockBoxService, updateBoxService } from "../../services/boxService";
import CopyToClipboard from "react-copy-to-clipboard";
import SweetAlert from 'react-bootstrap-sweetalert';
import {
    IoIosRefresh,
  } from "react-icons/io";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";

library.add(
    fab,
    faSpinner,
);

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
            isMobile: window.innerWidth < 768,
            activeTab: "1",
            showMore: false,
            transform: true,
            showInkBar: true,
            items: this.getSimpleTabs() || [],
            selectedTabKey: 0,
            transformWidth: 400,
            loading: false,
            loading2: false,
            errorMsg: '',
            alert: false,
            value: [],
            note: '',
            buyerOpen: false,
            sellerOpen: false,
            buyerSender: null,
            sellerSender: null,
            sender: this.props.sender,
            input: {
                name: this.props.box.name,
                messengerId: this.props.box.messengerId,
                isEncrypted: false,
                sellerId: '',
                buyerId: '',
            },
        };

        this.toggleBuyer = this.toggleBuyer.bind(this);
        this.toggleSeller = this.toggleSeller.bind(this);
    }

    componentDidMount() {
        const { id } = this.props.params; 
        this.props.getBoxById(id);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }
    
    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 768 });
    };

    componentDidUpdate(prevProps) {
        if (prevProps.box !== this.props.box && this.props.box._id) {
            this.setState({
                buyerSender: this.props.box.buyer,
                sellerSender: this.props.box.seller,
                input: {
                    name: this.props.box.name || '',
                    messengerId: this.props.box.messengerId || '',
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
    
    toggleBuyer() {
        this.setState({
            buyerOpen: !this.state.buyerOpen,
        });
    }

    toggleSeller() {
        this.setState({
            sellerOpen: !this.state.sellerOpen,
        });
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
            this.setState({loading2: true});
            await updateBoxService(this.props.box._id, this.state.input);
            await this.props.getBoxByIdNoLoad(this.props.box._id);
            this.setState({loading2: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error,
                loading2: false
            })
        }
    }

    handleLock = async () => {
        try{
            this.setState({loading2: true});
            await lockBoxService(this.props.box._id);
            await this.props.getBoxByIdNoLoad(this.props.box._id);
            this.setState({loading2: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error,
                loading2: false
            })
        }
    }

    handleGetInfo = async () => {
        try{
            this.setState({loading2: true});
            await getInfoService(this.props.box._id);
            await this.props.getBoxByIdNoLoad(this.props.box._id);
            this.setState({loading2: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error,
                loading2: false
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
            this.setState({loading2: true});
            await getFBInfo(id);
            await this.props.getBoxByIdNoLoad(this.props.box._id);
            this.setState({loading2: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error,
                loading2: false
            })
        }
    }

    render() {       
        const box = this.props.box || {
            status: '',
            messengerId: '',
            name: '',
            amount: '',
            createdAt: '',
            notes: [],
        };
        const input = this.state.input;
        return (
            <Fragment>
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner" style={this.state.isMobile ? {padding: 0} : {}}>
                        {this.state.loading ? (
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
                                                    <button class={box.status !== 'lock' ? "btn btn-danger me-1" : "btn btn-success me-1"} disabled={this.state.loading2} onClick={this.handleLock}>
                                                        <FontAwesomeIcon icon={box.status !== 'lock' ? faLock : faLockOpen}/> {box.status !== 'lock' ? 'Khóa box' : 'Mở khóa'}
                                                    </button>
                                                    <button class="btn btn-warning me-1" disabled={this.state.loading2} onClick={this.handleGetInfo}>
                                                        <FontAwesomeIcon icon={faCloudDownloadAlt}/> {this.state.loading2 ? "Đang update ..." : "Update user info"}
                                                    </button>
                                                    <button class="btn btn-primary me-1" onClick={this.handleSave} disabled={this.state.loading2}>
                                                        <FontAwesomeIcon icon={faSave} /> {this.state.loading2 ? "Đang lưu ..." : "Lưu cập nhật thông tin"}
                                                    </button>
                                                </div>
                                            </CardHeader>
                                            <CardBody>
                                                <Row>
                                                    <Col md={6} xs={12} className={!this.state.isMobile && "pe-2"}>
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
                                                                        onKeyDown={(e) => e.key === "Enter" && !this.state.loading2 && this.handleSave()}
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
                                                                        onClick={this.toggleBuyer}
                                                                        autoComplete="off"
                                                                    />
                                                                    <div className="input-group-text">
                                                                        <div role="button" disabled={this.state.loading2} onClick={()=>{this.state.buyerSender && !this.state.loading2 && this.getFB(this.state.buyerSender.facebookId)}}>
                                                                            {this.state.loading2 ? <FontAwesomeIcon icon={["fas", "spinner"]} pulse fixedWidth color="#545cd8" size="lg" />
                                                                            : <IoIosRefresh fontSize="18.7px" color="#545cd8"/>}
                                                                        </div>
                                                                    </div>
                                                               </InputGroup>
                                                                {this.state.sender.length > 0 && <Dropdown isOpen={this.state.buyerOpen} toggle={this.toggleBuyer} style={{height: 0}} direction="down" a11y={false}>
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
                                                                                <img src={sender && sender.avatar ? sender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.png'} alt={sender.name} style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 5 }} />
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
                                                                            <img src={this.state.buyerSender && this.state.buyerSender.avatar ? this.state.buyerSender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.png'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
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

                                                    <Col md={6} xs={12} className={!this.state.isMobile && "ps-2"}>
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
                                                            <Col md={4} xs={6} className="pe-1">
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
                                                                        onClick={this.toggleSeller}
                                                                        autoComplete="off"
                                                                    />
                                                                    <div className="input-group-text">
                                                                        <div role="button" disabled={this.state.loading2} onClick={()=>{this.state.sellerSender && !this.state.loading2 && this.getFB(this.state.sellerSender.facebookId)}}>
                                                                            {this.state.loading2 ? <FontAwesomeIcon icon={["fas", "spinner"]} pulse fixedWidth color="#545cd8" size="lg" />
                                                                            : <IoIosRefresh fontSize="18.7px" color="#545cd8"/>}
                                                                        </div>
                                                                    </div>
                                                               </InputGroup>
                                                                {this.state.sender.length > 0 && <Dropdown isOpen={this.state.sellerOpen} toggle={this.toggleSeller} style={{height: 0}}>
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
                                                                                <img src={sender && sender.avatar ? sender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.png'} alt={sender.name} style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 5 }} />
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
                                                                        name="sellerName"
                                                                        id="sellerName"
                                                                        value={this.state.sellerSender?.nameCustomer}
                                                                        disabled
                                                                    />
                                                                    <div className="input-group-text" style={{padding: '0.1rem 0.44rem'}}>
                                                                        <a href={`https://www.facebook.com/${this.state.sellerSender?.facebookId}`} rel="noreferrer" target="_blank">
                                                                            <img src={this.state.sellerSender && this.state.sellerSender.avatar ? this.state.sellerSender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.png'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
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
                                                                <p className="fw-bold text-success">{new Intl.NumberFormat('en-US').format(this.props.box.bills.reduce((sum, item) => sum + (item.amount + item.bonus), 0))} vnd</p>
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
                                                <p className="m-0 fst-italic fw-bold">* Nếu người dùng không xác định, hãy điền 1 với bên mua, 2 với bên bán.</p>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </Container>
                            {this.props.loading ? (
                            <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                                <Loader type="ball-spin-fade-loader" />
                            </div>
                            ) : ( <>
                            <Container fluid>
                                <div className="mb-3">
                                    <Tabs tabsWrapperClass="card-header" {...this.state} />
                                </div>
                            </Container>
                            </>)}
                        </>)}
                        </div>
                    </div>
                </div>
                <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                    type="error" onConfirm={() => this.setState({alert: false})}/>
            </Fragment>
        );
    }    
}

const mapStateToProps = (state) => ({
    box: state.box.box || {
        _id: '',
        name: '',
        messengerId: '',
        createdAt: '',
        amount: 0,
        notes: [],
        buyerCustomer: null,
        sellerCustomer: null,
        transactions: [],
        bills: []
    },
    sender: state.box.sender,
    loading: state.box.loading  || false,
});
  
const mapDispatchToProps = {
    getBoxById,
    getBoxByIdNoLoad,
    updateBox,
    addNote,
    deleteNote
};
  
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Box));
