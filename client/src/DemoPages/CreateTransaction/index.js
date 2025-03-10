import React, { Component, Fragment } from "react";

import { Button, Card, CardBody, CardTitle, Col, Container, FormText, Input, InputGroup, Label } from "reactstrap";
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
            },
        };
        this.handleClick = this.handleClick.bind(this);
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
                })
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

    handleRecreate = () => {
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
            }
        })
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
                                                
                                                    <Col sm={4} xs={12} className={cx({ "pe-2": !this.state.isMobile, "mb-4": this.state.isMobile })}>
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
                                                    <Col sm={6} xs={12} className={cx("mb-4", { "pe-2": !this.state.isMobile })}>
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
                                                {this.state.isCreated && <Row>
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
                                                </Row>}
                                            </Col>
                                        </Row>
                                        
                                        <Row>
                                            <div className="btn-actions-pane-right">
                                                <div>
                                                    
                                                    {this.state.isCreated ? 
                                                    <>
                                                        {this.state.input.isToggleOn && <div style={{display: 'inline-block'}}>
                                                            <a 
                                                                href={`/box/${this.props.transaction.boxId}`}
                                                                className="btn me-2 mt-2 btn-secondary" 
                                                                style={{width: 120}}
        
                                                            >
                                                                Chi tiết box
                                                            </a>
                                                        </div>}
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
