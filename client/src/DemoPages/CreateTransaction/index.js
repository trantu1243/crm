import React, { Component, Fragment } from "react";

import { Button, Card, CardBody, CardTitle, Col, Container, FormText, Input, InputGroup, Label } from "reactstrap";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import cx from "classnames";

import { Combobox, NumberPicker } from "react-widgets/cjs";
import { fetchBankAccounts } from "../../services/bankAccountService";
import { withRouter } from "../../utils/withRouter";
import { fetchFee } from "../../services/feeService";

const typeFee = [
    {name: 'Bên mua chịu phí', value: 'buyer'},
    {name: 'Bên bán chịu phí', value: 'seller'},
    {name: 'Chia đôi', value: 'split'},
    {name: 'Miễn phí', value: 'free'}
]

class CreateTransaction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: [],
            bankAccounts: [],
            fee: [],
            copied: false,
            input: {
                amount: '',
                bankCode: '',
                bonus: '',
                content: '',
                fee: '',
                messengerId: '',
                typeFee: 'buyer',
                isToggleOn: true,
            },
        };
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        this.getBankAccounts();
        this.getFee();
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
   
    loading: state.transactions.loading  || false,
});
  
const mapDispatchToProps = {

};
  
export default connect(mapStateToProps, mapDispatchToProps)(CreateTransaction);
