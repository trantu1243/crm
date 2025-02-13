import React, { Component, Fragment } from "react";

import { Button, Card, CardBody, CardTitle, Col, Container, Input, Label } from "reactstrap";
import Select from "react-select";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import cx from "classnames";

import SweetAlert from 'react-bootstrap-sweetalert';
import { Combobox } from "react-widgets/cjs";
import { fetchBankAccounts } from "../../services/bankAccountService";
import { fetchFee } from "../../services/feeService";
import { createTransaction } from "../../services/transactionService";

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
            bankAccounts: [],
            fee: [],
            copied: false,
            loading: false,
            alert: false,
            errorMsg: '',
            input: {
                amount: '',
                bankId: '',
                bonus: '0',
                content: '',
                fee: '',
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
        this.getBankAccounts();
        this.getFee();
        const savedBankId = localStorage.getItem("selectedBankId");
        if (savedBankId) {
            this.setState((prevState) => ({
                input: { ...prevState.input, bankId: savedBankId },
            }));
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }


    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 768 });
    };

    getBankAccounts = async () => {
        const data = await fetchBankAccounts();
        console.log(data)
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

    handleSubmit = async (e) => {
        try{
            e.preventDefault();
            this.setState({loading: true});
            const res = await createTransaction(this.state.input);
            this.setState({loading: false});
            window.location.href = `/transaction/${res.transaction._id}`;
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    };

    render() {
        const input = this.state.input;
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
                                                    <Col md={3} xs={6}>
                                                        <Label>Tạo <span className="fw-bold text-danger">GDTG</span>?</Label>
                                                    </Col>
                                                    <Col md={3} xs={6}>
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
                                                    <Col md={6} xs={12}>
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
                                                    <Col md={12} xs={12}>
                                                        <Select
                                                            value={this.state.bankAccounts
                                                                .map(bank => ({ value: bank._id, label: bank.bankName }))
                                                                .find(option => option.value === this.state.input.bankId) || null}
                                                            onChange={selected => {
                                                                    this.setState({ input: { ...this.state.input, bankId: selected.value } })
                                                                    localStorage.setItem("selectedBankId", selected.value);
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
                                                
                                                    <Col md={6} xs={12} className={cx({ "pe-2": !this.state.isMobile, "mb-4": this.state.isMobile })}>
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
                                                    <Col md={6} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
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
                                                </Row>
                                                <Row className="mb-4">
                                                    <Col md={12} xs={12}>
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
                                                    <Col md={6} xs={12} className={cx("mb-4", { "pe-2": !this.state.isMobile })}>
                                                        <Input
                                                            type="text"
                                                            name="messengerId"
                                                            id="messengerId"
                                                            placeholder="Messenger ID"
                                                            value={input.messengerId}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^\d*$/.test(value)) { 
                                                                    this.handleInputChange(e);
                                                                }
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col md={6} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
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
                                            </Col>
                                        </Row>
                                        
                                        <Row>
                                            <div className="btn-actions-pane-right">
                                                <div>
                                                    <Button 
                                                        className="btn-wide me-2 mt-2 btn-dashed w-100" 
                                                        color="primary" 
                                                        onClick={this.handleSubmit}
                                                        disabled={this.state.loading}    
                                                    >
                                                        {this.state.loading ? "Đang tạo..." : "Tạo QR"}
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
                <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                    type="error" onConfirm={() => this.setState({alert: false})}/>
            </Fragment>
        );
    }    
}

const mapStateToProps = (state) => ({
   
    loading: state.transactions.loading  || false,
});
  
const mapDispatchToProps = {

};
  
export default connect(mapStateToProps, mapDispatchToProps)(CreateTransaction);
