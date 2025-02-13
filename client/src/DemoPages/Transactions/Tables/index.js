import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import Select from "react-select";

import React, { Component } from "react";
import { formatDate } from "./data";
import StatusBadge from "./StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { getTransactions, setFilters } from "../../../reducers/transactionsSlice";
import { connect } from "react-redux";
import TransactionsPagination from "./PaginationTable";
import { Combobox } from "react-widgets/cjs";
import Loader from "react-loaders";
import { faCheck, faInfoCircle, faMinus, faPen, faPlus, faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { confirmTransaction, createTransaction } from "../../../services/transactionService";
import { fetchBankAccounts } from "../../../services/bankAccountService";
import { fetchFee } from "../../../services/feeService";
import cx from "classnames";
import { typeFee } from "../../CreateTransaction";
import { undoBox } from "../../../reducers/boxSlice";

class TransactionsTable extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isMobile: window.innerWidth < 768,
            bankAccounts: [],
            fee: [],
            show: false,
            undoModal: false,
            undoTransaction: null,
            createModal: false,
            confirmTransactionModal: false,
            confirmTransaction: null,
            loading: false,
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

        this.toggleUndo = this.toggleUndo.bind(this);
        this.toggleConfirmTransaction = this.toggleConfirmTransaction.bind(this)
        this.toggleCreate = this.toggleCreate.bind(this);

    }
    
    componentDidMount() {
        this.props.getTransactions({});

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
    componentDidUpdate(prevProps) {
        if (prevProps.filters.page !== this.props.filters.page) {
            this.props.getTransactions(this.props.filters);
        }
        if (prevProps.filters.limit !== this.props.filters.limit) {
            this.props.getTransactions(this.props.filters);
        }
    }

    toggleUndo() {
        this.setState({
            undoModal: !this.state.undoModal,
        });
    }

    toggleCreate() {
        this.setState({
            createModal: !this.state.createModal,
        });
    }

    toggleConfirmTransaction() {
        this.setState({
            confirmTransactionModal: !this.state.confirmTransactionModal,
        });
    }

    handleUndo = async () => {
        try{
            this.toggleUndo()    
            await this.props.undoBox(this.state.undoTransaction?.boxId);
            await this.props.getTransactions(this.props.filters);
        } catch (error) {

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

    handleConfirmTransaction = async () => {
        try {          
            this.toggleConfirmTransaction();          
            const res = await confirmTransaction(this.state.confirmTransaction._id);
            if (res.status) {
                this.props.getTransactions(this.props.filters)
            }
        } catch (error) {

        }
    }

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
        let filters = this.props.filters || {
            staffId: [],
            status: [],
            bankId: [],
            minAmount: "",
            maxAmount: "",
            startDate: "",
            endDate: "",
            content: "",
            page: 1,
            limit: 10,
        };
        const { transactions } = this.props;
        const input = this.state.input;
        
        return (<Card className="main-card mb-3">
            {this.props.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
                <CardHeader className="mt-2">
                    <Button color="info" className="me-1 al-min-width-max-content" style={{minWidth: 'max-content', textTransform: 'none'}} onClick={this.toggleCreate}>
                        Tạo GDTG
                    </Button>
                    <Modal isOpen={this.state.createModal} toggle={this.toggleCreate} className="modal-xl" style={{marginTop: '10rem'}}>
                        <ModalHeader toggle={this.toggleCreate}>Tạo bill thanh khoản</ModalHeader>
                        <ModalBody className="p-4">
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
                        </ModalBody>
                        <ModalFooter>
                            <Button color="link" onClick={this.toggleCreate}>
                                Hủy
                            </Button>
                            <Button color="primary" disabled={this.state.loading} onClick={this.handleSubmit}>
                                {this.state.loading ? "Đang tạo..." : "Tạo"}
                            </Button>{" "}
                        </ModalFooter>
                    </Modal>
                    <h3 className="text-center w-100">Tổng số GD: <span className="text-danger fw-bold">{transactions.totalDocs}</span></h3>
                    
                </CardHeader>
                <Table responsive hover striped borderless className="align-middle mb-0">
                    <thead>
                        <tr>
                            <th className="text-center">ID</th>
                            <th className="text-center">Thời gian</th>
                            <th className="text-center">Ngân hàng</th>
                            <th className="text-center">Số tiền</th>
                            <th className="text-center">Phí</th>
                            <th className="text-center">Tổng tiền</th>
                            <th className="text-center">Tiền tip</th>
                            <th className="text-center">Nội dung</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-center">Nhân viên</th>
                            <th className="text-center">Box</th>
                            <th className="text-center">#</th>

                        </tr>
                    </thead>
                    <tbody>
                    
                        {transactions.docs.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{formatDate(item.createdAt)}</td>
                            <td className="text-center text-muted">{item.bankId.bankCode}</td>
                            <td className="text-center text-muted">{item.amount.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.fee.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.totalAmount.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.bonus.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.content}</td>
                            <StatusBadge status={item.status} />
                            <td className="text-center text-muted"><img width={40} className="rounded-circle" src={item.staffId.avatar} alt={item.staffId.name_staff}/></td>
                            <td className="text-center text-muted"><a href="https://www.messenger.com/t/8681198405321843"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>
                            <td className="text-center text-muted">
                                {item.status === 2 && <>
                                    <button className="btn btn-sm btn-primary me-1" title="Tạo bill thanh khoản">
                                        <FontAwesomeIcon icon={faPlus} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-success me-1" title="Xác nhận giao dịch" onClick={() => {this.setState({confirmTransaction: item}); this.toggleConfirmTransaction()}}>
                                        <FontAwesomeIcon icon={faCheck} color="#fff" size="3xs"/>
                                    </button>
                                    <a href={`/transaction/${item._id}`} className="btn btn-sm btn-info me-1" title="Xem chi tiết giao dịch">
                                        <FontAwesomeIcon icon={faPen} color="#fff" size="3xs"/>
                                    </a>
                                </>}
                                <a href={`/box/${item.boxId}`} className="btn btn-sm btn-light me-1" title="Xem chi tiết box">
                                    <FontAwesomeIcon icon={faInfoCircle} color="#000" size="3xs"/>
                                </a>
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-danger me-1" title="Hủy">
                                        <FontAwesomeIcon icon={faMinus} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                                {(item.status !== 1) && <>
                                    <button className="btn btn-sm btn-warning me-1" title="Hoàn tác" onClick={()=> {this.setState({undoTransaction: item});this.toggleUndo()}}>
                                        <FontAwesomeIcon icon={faUndoAlt} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                    <Row>
                        <Col md={11}>
                            <TransactionsPagination
                                totalPages={transactions.totalPages}
                                currentPage={transactions.page}
                                hasPrevPage={transactions.hasPrevPage}
                                hasNextPage={transactions.hasNextPage}
                                onPageChange={(page) => {
                                    this.props.setFilters({
                                        ...filters,
                                        page,
                                    });
                                }}
                            />
                        </Col>
                        <Col md={1}>
                            <Combobox 
                                data={[10, 20, 30, 50, 100]} 
                                defaultValue={[10]} 
                                value={filters.limit} 
                                onChange={(value) => {
                                        this.props.setFilters({
                                            ...filters,
                                            limit: value,
                                        });
                                    }
                                }/>
                        </Col>
                    </Row>
                    
                </CardFooter>
                <Modal isOpen={this.state.undoModal} toggle={this.toggleUndo} className={this.props.className}>
                    <ModalHeader toggle={this.toggleUndo}><span style={{fontWeight: 'bold'}}>Xác nhận hoàn tác box</span></ModalHeader>
                    <ModalBody>
                        
                        Số tài khoản: {this.state.undoTransaction?.bankId.bankAccount} <br />
                        Ngân hàng: {this.state.undoTransaction?.bankId.bankName} <br />
                        Chủ tài khoản: {this.state.undoTransaction?.bankId.bankAccountName} <br />
                        Số tiền: <span className="fw-bold text-danger">{this.state.undoTransaction?.totalAmount.toLocaleString()} vnd</span><br />
        
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.toggleUndo}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleUndo}>
                            Xác nhận
                        </Button>{" "}
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.confirmTransactionModal} toggle={this.toggleConfirmTransaction} className={this.props.className}>
                    <ModalHeader toggle={this.toggleConfirmTransaction}><span style={{fontWeight: 'bold'}}>Xác nhận đã nhận được tiền</span></ModalHeader>
                    <ModalBody>
                        Số tài khoản: {this.state.confirmTransaction?.bankId.bankAccount} <br />
                        Ngân hàng: {this.state.confirmTransaction?.bankId.bankName} <br />
                        Chủ tài khoản: {this.state.confirmTransaction?.bankId.bankAccountName} <br />
                        Số tiền: <span className="fw-bold text-danger">{this.state.confirmTransaction?.totalAmount.toLocaleString()} vnd</span><br />
        
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleConfirmTransaction}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleConfirmTransaction}>
                            Xác nhận
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </>)}
        </Card>)
    }
}

const mapStateToProps = (state) => ({
    transactions: state.transactions.transactions,
    loading: state.transactions.loading,
    filters: state.transactions.filters,
});
  
const mapDispatchToProps = {
    getTransactions,
    setFilters,
    undoBox
};
  
export default connect(mapStateToProps, mapDispatchToProps)(TransactionsTable);