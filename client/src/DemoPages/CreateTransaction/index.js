import React, { Component, Fragment } from "react";

import { Button, Card, CardBody, CardTitle, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, FormText, Input, InputGroup, Label } from "reactstrap";
import Select from "react-select";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import cx from "classnames";

import SweetAlert from 'react-bootstrap-sweetalert';
import { fetchFee } from "../../services/feeService";
import { createTransaction } from "../../services/transactionService";
import CopyToClipboard from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import StatusBadge from "../Transactions/Tables/StatusBadge";
import { setTransaction } from "../../reducers/transactionsSlice";
import { getSenderInfo, updateBoxService } from "../../services/boxService";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";

export const typeFee = [
    {name: 'Bên mua chịu phí', value: 'buyer'},
    {name: 'Bên bán chịu phí', value: 'seller'},
    {name: 'Chia đôi', value: 'split'},
    {name: 'Miễn phí', value: 'free'}
]

class CreateTransaction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMobile: window.innerWidth < 768,
            value: [],
            bankAccounts: this.props.bankAccounts,
            fee: [],
            copied: false,
            imageCopied: false,
            loading: false,
            alert: false,
            errorMsg: '',
            isCreated: false,
            textCopy: '',
            linkQr: '',
            senders: [],
            buyerOpen: false,
            sellerOpen: false,
            buyerSender: null,
            sellerSender: null,
            input: {
                amount: 0,
                bankId: '',
                bonus: 0,
                content: '',
                fee: 0,
                messengerId: '',
                typeFee: 'buyer',
                typeBox: 'facebook',
                isToggleOn: true,
                isEncrypted: false
            },
            updateBox: {
                buyerId: '',
                sellerId: '',
            }
        };
        this.handleClick = this.handleClick.bind(this);
        this.toggleBuyer = this.toggleBuyer.bind(this);
        this.toggleSeller = this.toggleSeller.bind(this);
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateScreenSize);
        this.getFee();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.bankAccounts !== this.props.bankAccounts) {
            this.setState({bankAccounts: this.props.bankAccounts});
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }


    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 576 });
    };

    getFee = async () => {
        const data = await fetchFee();
        this.setState({
            fee: data.data
        })
    }

    handleClick = () => {
        this.setState((prevState) => ({
            input: {
                ...prevState.input,
                isToggleOn: !prevState.input.isToggleOn
            }
        }));
    };

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

    onChange = ({ target: { value } }) => {
        this.setState({ textCopy: value, copied: false });
      };

    onCopy = () => {
        this.setState({ copied: true });
    };

    handleAmountChange = (value) => {
        let fee = 0;
        const feeItem = this.state.fee.find(item => value >= item.min && value <= item.max);
        if (feeItem) {
            fee = feeItem.feeDefault;
        }
    
        this.setState((prevState) => ({
            input: {
                ...prevState.input,
                amount: value < 0 ? 0 : value,
                fee: fee,
            },
        }));
    };
    
    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            input: {
                ...prevState.input,
                [name]: value,
            },
        }));
    };

    copyImageToClipboard = async () => {
        try {
            if (this.state.linkQr === '') {
                this.setState({
                    alert: true,
                    errorMsg: "Vui lòng đợi ảnh tải xong"
                })
            } else {
                const response = await fetch(this.state.linkQr);
                const blob = await response.blob();
                const data = [new ClipboardItem({ [blob.type]: blob })];

                await navigator.clipboard.write(data);
                this.setState({imageCopied: true})
            }
            
        } catch (error) {
            console.error(error);
            this.setState({
                alert: true,
                errorMsg: "Lỗi khi sao chép hình ảnh"
            })
        }
    };

    handleSubmit = async (e) => {
        try{
            e.preventDefault();
            this.setState({loading: true});
            if (this.state.input.isToggleOn) {
                const res = await createTransaction(this.state.input);
                this.props.setTransaction(res.transaction);
                const bank = this.state.bankAccounts.find(bank => bank._id === this.state.input.bankId);
                this.setState({
                    isCreated: true,
                    loading: false,
                    linkQr: `https://img.vietqr.io/image/${bank.binBank}-${bank.bankAccount}-nCr4dtn.png?amount=${this.props.transaction.totalAmount + this.props.transaction.bonus}&addInfo=${this.props.transaction.content}&accountName=${bank.bankAccountName}`,
                    textCopy: `${bank.bankAccount} tại ${bank.bankName} - ${bank.bankAccountName}\nSố tiền: ${new Intl.NumberFormat('en-US').format(this.props.transaction.amount)} vnd\nPhí: ${new Intl.NumberFormat('en-US').format(this.props.transaction.fee)} vnd\nNội dung: ${this.props.transaction.content}`
                });
                const box = res.box;
                
                const data = await getSenderInfo(box._id);
                this.setState({senders: data.senders});
                
                if (box.buyer) {
                    this.setState({
                        buyerSender: box.buyer,
                        updateBox: {
                            ...this.state.updateBox,
                            buyerId: box.buyer.facebookId
                        }
                    })
                }
                
                if (box.seller) {
                    this.setState({
                        sellerSender: box.seller,
                        updateBox: {
                            ...this.state.updateBox,
                            sellerId: box.seller.facebookId
                        }
                    })
                }

                this.setState({loading: false});
            } else {
                const { amount = 0, bankId, bonus = 0, content, fee = 0, typeFee } = this.state.input;
                if ((!bankId || !typeFee) || ( amount === 0 && bonus === 0)) {
                    this.setState({loading: false})
                    return this.setState({
                        alert: true,
                        errorMsg: 'Vui lòng nhập đầy đủ'
                    })
                }

                let oriAmount = Number(amount);
                let totalAmount = Number(amount);

                if (typeFee === "buyer") {
                    totalAmount += Number(fee);
                } else if (typeFee === "seller") {
                    oriAmount -= Number(fee);
                } else if (typeFee === "split") {
                    oriAmount -= Number(fee) / 2;
                    totalAmount += Number(fee) / 2;
                }
                const bank = this.state.bankAccounts.find(bank => bank._id === this.state.input.bankId);
                this.setState({
                    isCreated: true,
                    linkQr: `https://img.vietqr.io/image/${bank.binBank}-${bank.bankAccount}-nCr4dtn.png?amount=${Number(totalAmount) + Number(bonus)}&addInfo=${content}&accountName=${bank.bankAccountName}`,
                    textCopy: `${bank.bankAccount} tại ${bank.bankName} - ${bank.bankAccountName}\nSố tiền: ${new Intl.NumberFormat('en-US').format(amount)} vnd\nPhí: ${new Intl.NumberFormat('en-US').format(fee)} vnd\nNội dung: ${content}`
                })
                setTimeout(() => {
                    this.setState({loading: false});
                }, 1000);
            }
            
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    };

    handleRecreate = async () => {
        try{
            if (this.state.input.isToggleOn) {
                this.setState({loading: true});
                await updateBoxService(this.props.transaction.boxId, this.state.updateBox);
                this.setState({loading: false});
            }
            this.setState({
                copied: false,
                imageCopied: false,
                loading: false,
                alert: false,
                errorMsg: '',
                isCreated: false,
                textCopy: '',
                linkQr: '',
                input: {
                    ...this.state.input,
                    amount: '',
                    bonus: '0',
                    content: '',
                    fee: '',
                    messengerId: '',
                    typeFee: 'buyer',
                    typeBox: 'facebook',
                    isToggleOn: true,
                },
                updateBox: {
                    buyerId: '',
                    sellerId: '',
                },
                senders: [],
                buyerOpen: false,
                sellerOpen: false,
                buyerSender: null,
                sellerSender: null,
            })
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    }

    handleRedirect = async () => {
        try{
            if (this.state.input.isToggleOn) {
                this.setState({loading: true});
                await updateBoxService(this.props.transaction.boxId, this.state.updateBox);
                this.setState({loading: false});
            }
            window.location.href = `/box/${this.props.transaction.boxId}`;
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    }

    handleSave = async () => {
        try{
            if (this.state.input.isToggleOn) {
                this.setState({loading: true});
                await updateBoxService(this.props.transaction.boxId, this.state.updateBox);
                this.setState({loading: false});
            }
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    }

    render() {
        const input = this.state.input;
        return (
            <Fragment>
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner" style={this.state.isMobile ? {padding: 0} : {}}>
                            <Container fluid>
                                <Card className="main-card mb-3" onKeyDown={(e) => e.key === "Enter" && !this.state.loading && this.handleSubmit(e)}>
                                    <CardTitle></CardTitle>
                                    <CardBody>
                                        <Row>
                                            <Col sm={6}>
                                                <Row className="mb-4">
                                                    <Col sm={3} xs={6}>
                                                        <Label>Tạo <span className="fw-bold text-danger">GDTG</span>?</Label>
                                                    </Col>
                                                    <Col sm={3} xs={6}>
                                                        <div className="switch has-switch mb-2 me-2" data-on-label="ON"
                                                            data-off-label="OFF" onClick={this.handleClick}>
                                                            <div className={cx("switch-animate", {
                                                                "switch-on": input.isToggleOn,
                                                                "switch-off": !input.isToggleOn,
                                                                })}>
                                                                <input type="checkbox" />
                                                                <span className="switch-left bg-info">ON</span>
                                                                <label>&nbsp;</label>
                                                                <span className="switch-right bg-info">OFF</span>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col sm={6} xs={12}>
                                                        <Select
                                                            value={['facebook']
                                                                .map(platform => ({ value: platform, label: platform }))
                                                                .find(option => option.value === this.state.input.typeBox) || { value: "facebook", label: "facebook" }}
                                                            onChange={selected => {
                                                                this.setState({ input: { ...this.state.input, typeBox: selected.value } });
                                                            }}
                                                            options={['facebook'].map(platform => ({
                                                                value: platform,
                                                                label: platform
                                                            }))}
                                                            placeholder="Chọn nền tảng"
                                                        />
                                                    </Col>
                                                </Row>

                                                <Row className="mb-4">
                                                    <Col sm={12} xs={12}>
                                                        <Select
                                                            value={this.state.bankAccounts
                                                                .map(bank => ({ value: bank._id, label: bank.bankName }))
                                                                .find(option => option.value === this.state.input.bankId) || null}
                                                            onChange={selected => {
                                                                    this.setState({ input: { ...this.state.input, bankId: selected.value } })
                                                                }
                                                            }
                                                            options={this.state.bankAccounts.map(bank => ({
                                                                value: bank._id,
                                                                label: bank.bankName
                                                            }))}
                                                            placeholder="Chọn ngân hàng"
                                                        />
                                                    </Col>
                                                    {this.state.input.bankId && (
                                                        (() => {
                                                            const selectedBank = this.state.bankAccounts.find(bank => bank._id === this.state.input.bankId);
                                                            return selectedBank ? (
                                                                <label className="fw-bold text-danger mt-2">
                                                                    {selectedBank.bankName} - {selectedBank.bankAccountName} - {selectedBank.bankAccount}
                                                                </label>
                                                            ) : null;
                                                        })()
                                                    )}
                                                </Row>
                                                <Row className="mb-4">
                                                
                                                    <Col sm={4} xs={12} className={cx({ "mb-4": this.state.isMobile })}>
                                                        <Label>Số tiền</Label>
                                                        <Input
                                                            type="text"
                                                            name="amount"
                                                            value={new Intl.NumberFormat('en-US').format(this.state.input.amount)}
                                                            onChange={(e) => {
                                                                let rawValue = e.target.value.replace(/,/g, '');
                                                                let numericValue = parseInt(rawValue, 10) || 0;

                                                                this.handleAmountChange(numericValue);
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={4} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
                                                        <Label>Phí</Label>
                                                        <Input
                                                            type="text"
                                                            name="fee"
                                                            value={new Intl.NumberFormat('en-US').format(this.state.input.fee)}
                                                            onChange={(e) => {
                                                                let rawValue = e.target.value.replace(/,/g, '');
                                                                let numericValue = parseInt(rawValue, 10) || 0;

                                                                this.setState((prevState) => ({
                                                                    input: {
                                                                        ...prevState.input,
                                                                        fee: numericValue < 0 ? 0 : numericValue,
                                                                    },
                                                                }));
                                                            }}
                                                        />

                                                    </Col>    
                                                    <Col sm={4} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
                                                        <Label>Tiền tip</Label>
                                                        <Input
                                                            type="text"
                                                            name="bonus"
                                                            value={new Intl.NumberFormat('en-US').format(this.state.input.bonus)}
                                                            onChange={(e) => {
                                                                let rawValue = e.target.value.replace(/,/g, '');
                                                                let numericValue = parseInt(rawValue, 10) || 0;

                                                                this.setState((prevState) => ({
                                                                    input: {
                                                                        ...prevState.input,
                                                                        bonus: numericValue < 0 ? 0 : numericValue,
                                                                    },
                                                                }));
                                                            }}
                                                        />

                                                    </Col>           
                                                </Row>
                                                <Row className="mb-4">
                                                    <Col sm={12} xs={12}>
                                                        <Label for="content">Nội dung chuyển khoản</Label>
                                                        <Input
                                                            type="text"
                                                            name="content"
                                                            id="content"
                                                            placeholder="Nhập nội dung"
                                                            value={input.content}
                                                            onChange={this.handleInputChange}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row className="mb-4">
                                                    <Col sm={6} xs={12} className={cx({ "pe-2": !this.state.isMobile })}>
                                                        <Input
                                                            type="text"
                                                            name="messengerId"
                                                            id="messengerId"
                                                            placeholder="Messenger ID"
                                                            value={input.messengerId}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                const match = value.match(/(\d+)/);
                                                                this.setState((prevState) => ({
                                                                    input: {
                                                                        ...prevState.input,
                                                                        messengerId: match ? match[0] : "",
                                                                    },
                                                                }));
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={6} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
                                                        <Select
                                                            value={typeFee
                                                                .map(option => ({ value: option.value, label: option.name }))
                                                                .find(option => option.value === this.state.input.typeFee) || null}
                                                            onChange={selected => this.setState(prevState => ({
                                                                input: { ...prevState.input, typeFee: selected?.value }
                                                            }))}
                                                            options={typeFee.map(option => ({
                                                                value: option.value,
                                                                label: option.name
                                                            }))}
                                                            placeholder="Chọn loại phí"
                                                        />

                                                    </Col>
                                                </Row>

                                                <Row className="mb-4">
                                                    <Label className="me-3">Box mã hóa ? </Label>
                                                    <Input 
                                                        id="isEncrypted" 
                                                        type="checkbox" checked={this.state.input.isEncrypted} 
                                                        onChange={() => {
                                                            this.setState({
                                                                input: {
                                                                    ...this.state.input,
                                                                    isEncrypted: !this.state.input.isEncrypted
                                                                }
                                                            })
                                                        }}
                                                    />
                                                </Row>
                                                
                                                {this.state.isCreated &&
                                                <>
                                                    {this.state.input.isToggleOn && <Row className="mb-4"> 
                                                        <div>
                                                            <Label>Trạng thái: &nbsp;</Label><StatusBadge status={this.props.transaction.status}/>           
                                                        </div>        
                                                    </Row>}
                                                    <Row className="mb-4">
                                                        <Col sm={12} xs={12} style={{position: 'relative'}}>
                                                            <textarea rows={5} cols={10}className="form-control" value={this.state.textCopy} disabled/>
                                                            <div style={{position: 'absolute', right: 0, top: 0}}>
                                                                <CopyToClipboard onCopy={this.onCopy} text={this.state.textCopy}>
                                                                    <Button color="link">
                                                                        <FontAwesomeIcon icon={faCopy} color="#545cd8" size="lg"/>
                                                                    </Button>
                                                                </CopyToClipboard>
                                                            </div>
                                                        
                                                            {this.state.copied ? (
                                                                <FormText color="success">Text has been copied.</FormText>
                                                            ) : null}
                                                        </Col>
                                                    </Row>
                                                </>}
                                            </Col>
                                            <Col sm={6} xs={12}>
                                                <Row>
                                                    <Col sm={6}>

                                                    </Col>
                                                    <Col sm={6} xs={12}>
                                                        <InputGroup>
                                                            <Input value={this.state.linkQr} placeholder="Link QR" disabled/>
                                                            <CopyToClipboard text={this.state.linkQr}>
                                                                <Button color="primary">
                                                                    <FontAwesomeIcon icon={faCopy} />
                                                                </Button>
                                                            </CopyToClipboard>
                                                        </InputGroup>
                                                    </Col>
                                                </Row>
                                                {this.state.isCreated && <>

                                                    <Row>
                                                        <div style={{width: '100%',padding: this.state.isMobile ? '0' : '0 2em', position: 'relative'}}>
                                                            <img src={this.state.linkQr} alt="" style={{width: '100%', height: '100%'}} onClick={this.copyImageToClipboard}></img>
                                                            
                                                        </div>
                                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%"}}>
                                                            <Button color="link" onClick={this.copyImageToClipboard}>
                                                                <FontAwesomeIcon icon={faCopy} color="#545cd8" size="lg" />
                                                            </Button>
                                                        </div>

                                                        {this.state.imageCopied ? (
                                                            <div className="text-center" style={{width: '100%'}}>
                                                                <FormText color="success">Image has been copied.</FormText>
                                                            </div>
                                                        ) : null}
                                                    </Row>
                                                    {this.state.input.isToggleOn && <>
                                                        <Row className="mb-3 ms-2">
                                                            <Col md={12} xs={12}>
                                                                <Label>Bên mua</Label>
                                                            </Col>
                                                            <Col md={6} xs={6} className="pe-1">
                                                                <InputGroup>
                                                                    <Input
                                                                        type="text"
                                                                        name="buyerId"
                                                                        id="buyerId"
                                                                        value={this.state.updateBox.buyerId}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            const match = value.match(/(\d+)/);
                                                                            this.setState({ 
                                                                                updateBox: {
                                                                                    ...this.state.updateBox,
                                                                                    buyerId: match ? match[0] : "" 
                                                                                },
                                                                                buyerOpen: false
                                                                            });
                                                                        }}
                                                                        onClick={this.toggleBuyer}
                                                                        autoComplete="off"
                                                                    />
                                                                </InputGroup>
                                                                {this.state.senders.length > 0 && <Dropdown isOpen={this.state.buyerOpen} toggle={this.toggleBuyer} style={{height: 0}}>
                                                                    <DropdownToggle 
                                                                        style={{width: 0, height: 0, padding: 0}}
                                                                    >
                                                                        
                                                                    </DropdownToggle>
                                                                    <DropdownMenu>
                                                                        {this.state.senders.map(sender => (
                                                                            <DropdownItem 
                                                                                key={sender.id} 
                                                                                onClick={() => this.setState({
                                                                                    buyerSender: sender, 
                                                                                    updateBox: {
                                                                                        ...this.state.updateBox,
                                                                                        buyerId: sender.facebookId,
                                                                                    }
                                                                                })}
                                                                            >
                                                                                <img src={sender.avatar} alt={sender.name} style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 5 }} />
                                                                                <div >
                                                                                    <p style={{margin: 0}}>{sender.nameCustomer}</p>
                                                                                    <p style={{margin: 0, fontSize: '0.7rem', color: '#6c757d'}}>{sender.facebookId}</p>
                                                                                </div>
                                                                            </DropdownItem>
                                                                        ))}
                                                                    </DropdownMenu>
                                                                </Dropdown>}                                                                      
                                                            </Col>
                                                            <Col md={6} xs={6} className="ps-1">
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
                                                                            <img src={this.state.buyerSender && this.state.buyerSender.avatar ? this.state.buyerSender.avatar : 'https://scontent-hkg4-2.xx.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=cp0_dst-png_s50x50&_nc_cat=1&ccb=1-7&_nc_sid=22ec41&_nc_eui2=AeE9TwOP7wEuiZ2qY8BFwt1lWt9TLzuBU1Ba31MvO4FTUGf8ADKeTGTU-o43Z-i0l0K-jfGG1Z8MmBxnRngVwfmr&_nc_ohc=NtrlBO4xUsUQ7kNvgEqW2p5&_nc_zt=24&_nc_ht=scontent-hkg4-2.xx&_nc_gid=AolcEUubYfwv6yHkXKiD81H&oh=00_AYGTs7ZIZj93EBzaF2Y5UQyytpW2Bc9CwlZD7A4wC0RoRA&oe=67F82FFA'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                                        </a>
                                                                    </div>
                                                                </InputGroup>
                                                                
                                                            </Col>
                                                        </Row>
                                                        <Row className="mb-3 ms-2">
                                                            <Col md={12} xs={12}>
                                                                <Label>Bên bán</Label>
                                                            </Col>
                                                            <Col md={6} xs={6} className="pe-1">
                                                                <InputGroup>
                                                                    <Input
                                                                        type="text"
                                                                        name="sellerId"
                                                                        id="sellerId"
                                                                        value={this.state.updateBox.sellerId}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            const match = value.match(/(\d+)/);
                                                                            this.setState({ 
                                                                                updateBox: {
                                                                                    ...this.state.updateBox,
                                                                                    sellerId: match ? match[0] : "" 
                                                                                },
                                                                                sellerOpen: false
                                                                            });
                                                                        }}
                                                                        onClick={this.toggleSeller}
                                                                        autoComplete="off"
                                                                    />
                                                                    
                                                                </InputGroup>
                                                                {this.state.senders.length > 0 && <Dropdown isOpen={this.state.sellerOpen} toggle={this.toggleSeller} style={{height: 0}}>
                                                                    <DropdownToggle 
                                                                        style={{width: 0, height: 0, padding: 0}}
                                                                    >
                                                                        
                                                                    </DropdownToggle>
                                                                    <DropdownMenu>
                                                                        {this.state.senders.map(sender => (
                                                                            <DropdownItem 
                                                                                key={sender.id} 
                                                                                onClick={() => this.setState({
                                                                                    sellerSender: sender, 
                                                                                    updateBox: {
                                                                                        ...this.state.updateBox,
                                                                                        sellerId: sender.facebookId,
                                                                                    }
                                                                                })}
                                                                            >
                                                                                <img src={sender.avatar} alt={sender.name} style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 5 }} />
                                                                                <div >
                                                                                    <p style={{margin: 0}}>{sender.nameCustomer}</p>
                                                                                    <p style={{margin: 0, fontSize: '0.7rem', color: '#6c757d'}}>{sender.facebookId}</p>
                                                                                </div>
                                                                            </DropdownItem>
                                                                        ))}
                                                                    </DropdownMenu>
                                                                </Dropdown>}                                                                      
                                                            </Col>
                                                            <Col md={6} xs={6} className="ps-1">
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
                                                                            <img src={this.state.sellerSender && this.state.sellerSender.avatar ? this.state.sellerSender.avatar : 'https://scontent-hkg4-2.xx.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=cp0_dst-png_s50x50&_nc_cat=1&ccb=1-7&_nc_sid=22ec41&_nc_eui2=AeE9TwOP7wEuiZ2qY8BFwt1lWt9TLzuBU1Ba31MvO4FTUGf8ADKeTGTU-o43Z-i0l0K-jfGG1Z8MmBxnRngVwfmr&_nc_ohc=NtrlBO4xUsUQ7kNvgEqW2p5&_nc_zt=24&_nc_ht=scontent-hkg4-2.xx&_nc_gid=AolcEUubYfwv6yHkXKiD81H&oh=00_AYGTs7ZIZj93EBzaF2Y5UQyytpW2Bc9CwlZD7A4wC0RoRA&oe=67F82FFA'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                                        </a>
                                                                    </div>
                                                                </InputGroup>
                                                            </Col>
                                                        </Row>
                                                    </>}
                                                </>}
                                            </Col>
                                        </Row>
                                        
                                        <Row>
                                            <div className="btn-actions-pane-right">
                                                <div>
                                                    
                                                    {this.state.isCreated ? 
                                                    <>
                                                        {this.state.input.isToggleOn && <>
                                                            <div style={{display: 'inline-block'}}>
                                                                <Button 
                                                                    
                                                                    className="btn me-2 mt-2 btn-secondary" 
                                                                    style={{width: 120}}
                                                                    onClick={this.handleRedirect}
                                                                    disabled={this.state.loading}
                                                                >
                                                                    Chi tiết box
                                                                </Button>
                                                            </div>
                                                            <div style={{display: 'inline-block'}}>
                                                                <Button 
                                                                    
                                                                    className="btn me-2 mt-2 btn-success" 
                                                                    style={{width: 120}}
                                                                    onClick={this.handleSave}
                                                                    disabled={this.state.loading}
                                                                >
                                                                    Lưu khách hàng
                                                                </Button>
                                                            </div>
                                                        </>}
                                                        <div style={{display: 'inline-block'}}>
                                                            <Button 
                                                                className="btn-wide me-2 mt-2 btn-dashed w-100" 
                                                                color="primary"  
                                                                disabled={this.state.loading}   
                                                                onClick={this.handleRecreate}                                                           
                                                            >
                                                                {this.state.loading ? "Đang tạo..." : "Tạo lại QR"}
                                                            </Button>
                                                        </div>
                                                    </>
                                                    : 
                                                    <Button 
                                                        className="btn-wide me-2 mt-2 btn-dashed w-100" 
                                                        color="primary" 
                                                        onClick={this.handleSubmit}
                                                        disabled={this.state.loading}    
                                                    >
                                                        {this.state.loading ? "Đang tạo..." : "Tạo QR"}
                                                    </Button>}
                                                </div>
                                            </div>
                                        </Row>
                                    </CardBody>
                                </Card>
      
                            </Container>

                            
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
    transaction: state.transactions.transaction || {
        _id: '',
        amount: 0,
        bankId: null,
        bonus: 0,
        boxId: '',
        content: '',
        fee:'',
        status: 1,
        messengerId: '',
        linkQr: '',
        totalAmount: '',
        typeFee: '',
        createdAt: '',
        updatedAt: ''
    },
    loading: state.transactions.loading  || false,
    bankAccounts: state.user.user.permission_bank || [],
});
  
const mapDispatchToProps = {
    setTransaction
};
  
export default connect(mapStateToProps, mapDispatchToProps)(CreateTransaction);
