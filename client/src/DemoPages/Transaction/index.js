import React, { Component, Fragment } from "react";

import { Button, Card, CardBody, CardTitle, Col, Container, FormText, Input, InputGroup, Label } from "reactstrap";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import cx from "classnames";

import { getTransactionById } from "../../reducers/transactionsSlice";
import { Combobox, NumberPicker } from "react-widgets/cjs";
import { fetchBankAccounts } from "../../services/bankAccountService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy} from "@fortawesome/free-solid-svg-icons";
import { withRouter } from "../../utils/withRouter";
import CopyToClipboard from "react-copy-to-clipboard";
import { fetchFee } from "../../services/feeService";
import StatusBadge from "../Transactions/Tables/StatusBadge";

const typeFee = [
    {name: 'Bên mua chịu phí', value: 'buyer'},
    {name: 'Bên bán chịu phí', value: 'seller'},
    {name: 'Chia đôi', value: 'split'},
    {name: 'Miễn phí', value: 'free'}
]

class Transaction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: [],
            bankAccounts: [],
            fee: [],
            textCopy: this.props.transaction.bankId ?  `${this.props.transaction.bankId.bankAccount} tại ${this.props.transaction.bankId.bankName} - ${this.props.transaction.bankId.bankAccountName}\nSố tiền: ${this.props.transaction.amount.toLocaleString()} vnd\nPhí: ${this.props.transaction.fee.toLocaleString()} vnd\nNội dung: ${this.props.transaction.content}`: "",
            copied: false,
            input: {
                amount: this.props.transaction.amount ? this.props.transaction.amount : '',
                bankCode: this.props.transaction.bankId ? this.props.transaction.bankId.bankCode : '',
                bonus: this.props.transaction.bonus,
                content: this.props.transaction.content,
                fee: this.props.transaction.fee ? this.props.transaction.fee : '',
                messengerId: this.props.transaction.messengerId,
                typeFee: this.props.transaction.typeFee,
                isToggleOn: true,
            },
            linkQr: this.props.transaction.linkQr
        };
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        const { id } = this.props.params; 
        this.getBankAccounts();
        this.getFee();
        this.props.getTransactionById(id);
    }

    componentDidUpdate(prevProps) {
            if (prevProps.transaction !== this.props.transaction) {
                this.setState((prevState) => ({
                    input: {
                        ...prevState.input,
                        amount: this.props.transaction.amount ? this.props.transaction.amount : '',
                        bankCode: this.props.transaction.bankId ? this.props.transaction.bankId.bankCode : '',
                        bonus: this.props.transaction.bonus,
                        content: this.props.transaction.content,
                        fee: this.props.transaction.fee ? this.props.transaction.fee : '',
                        messengerId: this.props.transaction.messengerId,
                        typeFee: this.props.transaction.typeFee,
                    }
                }));
                this.setState({
                    linkQr: this.props.transaction.linkQr,
                    textCopy: this.props.transaction.bankId ?  `${this.props.transaction.bankId.bankAccount} tại ${this.props.transaction.bankId.bankName} - ${this.props.transaction.bankId.bankAccountName}\nSố tiền: ${this.props.transaction.amount.toLocaleString()} vnd\nPhí: ${this.props.transaction.fee.toLocaleString()} vnd\nNội dung: ${this.props.transaction.content}`: "",
                })
            }
        }

    getBankAccounts = async () => {
        const data = await fetchBankAccounts();
        this.setState({
            bankAccounts: data.data
        })
    }

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
                amount: value,
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

    render() {
        const input = this.state.input;
        const status = this.props.transaction.status ? this.props.transaction.status : 9;
        return (
            <Fragment>
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner">
                            <Container fluid>
                                <Card className="main-card mb-3">
                                    <CardTitle></CardTitle>
                                    <CardBody>
                                        <Row>
                                            <Col md={6}>
                                                <Row className="mb-4">
                                                    <Col md={3}>
                                                        <Label>Tạo <span className="fw-bold text-danger">GDTG</span>?</Label>
                                                    </Col>
                                                    <Col md={3}>
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
                                                    <Col md={6}>
                                                        <Combobox
                                                            data={['facebook']} 
                                                            defaultValue="facebook"
                                                        />
                                                    </Col>
                                                    
                                                </Row>

                                                <Row className="mb-4">
                                                    <Col md={12}>
                                                        <Combobox
                                                            data={this.state.bankAccounts}
                                                            textField="bankName"
                                                            valueField="bankCode"
                                                            value={this.state.bankAccounts.find(item => item.bankCode === input.bankCode) || null}
                                                            onChange={(item) => {
                                                                const selectedValue = typeof item === "string" ? item : item?.bankCode;
                                                                this.setState((prevState) => ({
                                                                    input: { ...prevState.input, bankCode: selectedValue }
                                                                }));
                                                            }}
                                                            placeholder="Chọn ngân hàng"
                                                        />
                                                    </Col>       
                                                </Row>
                                                <Row className="mb-4">
                                                
                                                    <Col md={6} className="pe-2">
                                                        <Label>Số tiền</Label>
                                                        <NumberPicker
                                                            step={100000}
                                                            name="amount"
                                                            value={input.amount}
                                                            onChange={this.handleAmountChange}
                                                        />
                                                    </Col>
                                                    <Col md={6} className="ps-2">
                                                        <Label>Phí</Label>
                                                        <NumberPicker
                                                            step={10000}
                                                            name="fee"
                                                            value={input.fee}
                                                            onChange={this.handleInputChange}
                                                        />
                                                    </Col>           
                                                </Row>
                                                <Row className="mb-4">
                                                    <Col md={12}>
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
                                                    <Col md={6} className="pe-2">
                                                        <Input
                                                            type="text"
                                                            name="messengerId"
                                                            id="messengerId"
                                                            placeholder="Messenger ID"
                                                            value={input.messengerId}
                                                            onChange={this.handleInputChange}
                                                        />
                                                    </Col>
                                                    <Col md={6} className="ps-2">
                                                        <Combobox
                                                            data={typeFee}
                                                            textField="name"
                                                            valueField="value"
                                                            value={typeFee.find(item => item.value === input.typeFee) || null}
                                                            onChange={(item) => {
                                                                const selectedValue = typeof item === "string" ? item : item?.value;
                                                                this.setState((prevState) => ({
                                                                    input: { ...prevState.input, typeFee: selectedValue }
                                                                }));
                                                            }}
                                                            placeholder="Chọn loại phí"
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row className="mb-4"> 
                                                    <Label>Trạng thái: &nbsp;</Label><StatusBadge status={status}/>           
                                                </Row>
                                                <Row className="mb-4">
                                                    <Col md={12} style={{position: 'relative'}}>
                                                        <textarea onChange={this.onChange} rows={5} cols={10}className="form-control" value={this.state.textCopy} disabled/>
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
                                                
                                            </Col>
                                            <Col md={6}>
                                                <Row>
                                                    <Col md={6}>

                                                    </Col>
                                                    <Col md={6}>
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
                                                <Row>
                                                    <img src={this.state.linkQr} alt="" style={{width: '100%', height: '100%', padding: '0 6em'}}></img>
                                                </Row>
                                            </Col>
                                        
                                        </Row>
                                        
                                        <Row>
                                            <div className="btn-actions-pane-right">
                                                <div>
                                                    <Button 
                                                        className="btn-wide me-2 mt-2 btn-dashed w-100" 
                                                        color="primary" 
                                                    >
                                                        Tạo QR
                                                    </Button>
                                                    
                                                </div>
                                            </div>
                                        </Row>
                                        
                                    </CardBody>
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
    transaction: state.transactions.transaction || {
        _id: '',
        amount: 0,
        bankId: null,
        bonus: 0,
        boxId: '',
        content: '',
        fee:'',
        messengerId: '',
        linkQr: '',
        totalAmount: '',
        typeFee: '',
        createdAt: '',
        updatedAt: ''
    },
    loading: state.transactions.loading  || false,
});
  
const mapDispatchToProps = {
    getTransactionById
};
  
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Transaction));
