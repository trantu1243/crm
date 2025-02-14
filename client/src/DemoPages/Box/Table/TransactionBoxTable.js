import { Button, Card, CardHeader, Col, FormText, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import Select from "react-select";

import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { connect } from "react-redux";
import Loader from "react-loaders";
import StatusBadge from "../../Transactions/Tables/StatusBadge";
import { formatDate } from "../../Transactions/Tables/data";
import { faCheck, faCopy, faMinus, faPen, faPlus, faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { getBoxById, undoBox } from "../../../reducers/boxSlice";
import { cancelTransaction, confirmTransaction, createTransaction, updateTransaction } from "../../../services/transactionService";
import { withRouter } from "../../../utils/withRouter";
import cx from "classnames";
import { fetchBankAccounts } from "../../../services/bankAccountService";
import { fetchFee } from "../../../services/feeService";
import { typeFee } from "../../CreateTransaction";
import { SERVER_URL } from "../../../services/url";
import CopyToClipboard from "react-copy-to-clipboard";

class TransactionsTable extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isMobile: window.innerWidth < 768,
            bankAccounts: [],
            fee: [],
            show: false,
            undoModal: false,
            createModal: false,
            updateModal: false,
            cancelModal: false,
            confirmTransactionModal: false,
            confirmTransaction: null,
            undoTransaction: null,
            updateTransaction: null,
            cancelTransaction: null,
            loading: false,
            textCopy: '',
            copied: false,
            input: {
                amount: '',
                bankId: '',
                bonus: '0',
                content: '',
                fee: '',
                messengerId: this.props.messengerId,
                typeFee: 'buyer',
                typeBox: 'facebook',
                isToggleOn: true,
            },
            update: {
                amount: '',
                bankId: '',
                bonus: '0',
                content: '',
                fee: '',
                messengerId: '',
                typeFee: 'buyer',
                typeBox: 'facebook',
            }
        };

        this.toggleUndo = this.toggleUndo.bind(this);
        this.toggleConfirmTransaction = this.toggleConfirmTransaction.bind(this)
        this.toggleCreate = this.toggleCreate.bind(this);
        this.toggleUpdate = this.toggleUpdate.bind(this);
        this.toggleCancel = this.toggleCancel.bind(this);
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateScreenSize);
        this.getBankAccounts();
        this.getFee();
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

    toggleUpdate() {
        this.setState({
            updateModal: !this.state.updateModal,
        });
    }

    toggleConfirmTransaction() {
        this.setState({
            confirmTransactionModal: !this.state.confirmTransactionModal,
        });
    }

    toggleCancel() {
        this.setState({
            cancelModal: !this.state.cancelModal,
        });
    }

    onCopy = () => {
        this.setState({ copied: true });
    };

    handleUndo = async () => {
        this.toggleUndo()    
        await this.props.undoBox(this.props.boxId)
        await this.props.getBoxById(this.props.boxId)
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

    handleUpdateChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            update: {
                ...prevState.update,
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
            await this.props.getBoxById(this.props.boxId);
            this.toggleCreate();
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    };

    handleConfirmTransaction = async () => {
        try {          
            this.toggleConfirmTransaction();          
            const res = await confirmTransaction(this.state.confirmTransaction._id);
            if (res.status) {
                this.props.getBoxById(this.props.boxId)
            }
        } catch (error) {

        }
    }

    handleUpdate = async (e) => {
        try{
            e.preventDefault();
            this.setState({loading: true});
            const res = await updateTransaction(this.state.updateTransaction?._id, this.state.update);
            await this.props.getBoxById(this.props.boxId)
            this.setState({loading: false});
            if (this.props.boxId !== res.transaction.boxId) window.location.href = `/box/${res.transaction.boxId}`;
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    }

    hanldeCancel = async (e) => {
        try {          
            this.toggleCancel();          
            const res = await cancelTransaction(this.state.cancelTransaction._id);
            this.props.getBoxById(this.props.boxId)
        } catch (error) {

        }
    }
    
    render() { 
        const { transactions } = this.props;
        const input = this.state.input;

        return (
            <Card className="main-card mb-3">
                {this.props.loading ? (
                    <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                        <Loader type="ball-spin-fade-loader" />
                    </div>
                ) : ( <>
                    <CardHeader className="mt-2">
                        <Button color="info" onClick={this.toggleCreate}>
                            Tạo GDTG
                        </Button>
                        <Modal isOpen={this.state.createModal} toggle={this.toggleCreate} className="modal-xl" style={{marginTop: '10rem'}}>
                            <ModalHeader toggle={this.toggleCreate}>Tạo bill thanh khoản</ModalHeader>
                            <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && this.handleSubmit(e)}>
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
                                            disabled
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
                        
                            {transactions.map((item) => <tr>
                                <td className="text-center text-muted">{item._id.slice(-8)}</td>
                                <td className="text-center text-muted">{formatDate(item.createdAt)}</td>
                                <td className="text-center text-muted">{item.bankId.bankCode}</td>
                                <td className="text-center text-muted">{item.amount.toLocaleString()}</td>
                                <td className="text-center text-muted">{item.fee.toLocaleString()}</td>
                                <td className="text-center text-muted">{item.totalAmount.toLocaleString()}</td>
                                <td className="text-center text-muted">{item.bonus.toLocaleString()}</td>
                                <td className="text-center text-muted">{item.content}</td>
                                <td className="text-center text-muted"> <StatusBadge status={item.status} /></td>
                                <td className="text-center text-muted"><img className="rounded-circle" src={`${SERVER_URL}${item.staffId.avatar}`} alt={item.staffId.name_staff} style={{width: 40, height: 40, objectFit: 'cover'}}/></td>
                                <td className="text-center text-muted"><a href="https://www.messenger.com/t/8681198405321843"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>
                                <td className="text-center text-muted">
                                    {item.status === 6 && <>
                                        <button className="btn btn-sm btn-primary me-1 mb-1" title="Tạo bill thanh khoản">
                                            <FontAwesomeIcon icon={faPlus} color="#fff" size="3xs"/>
                                        </button>
                                    </>}
                                    {item.status === 1 && <>
                                        <button className="btn btn-sm btn-success me-1 mb-1" title="Xác nhận giao dịch" onClick={() => {this.setState({confirmTransaction: item}); this.toggleConfirmTransaction()}}>
                                            <FontAwesomeIcon icon={faCheck} color="#fff" size="3xs"/>
                                        </button>
    
                                        <button 
                                            className="btn btn-sm btn-info me-1 mb-1" 
                                            title="Chỉnh sửa giao dịch" 
                                            onClick={() => {
                                                this.setState({
                                                    updateTransaction: item,
                                                    textCopy: `${item.bankId.bankAccount} tại ${item.bankId.bankName} - ${item.bankId.bankAccountName}\nSố tiền: ${item.amount.toLocaleString()} vnd\nPhí: ${item.fee.toLocaleString()} vnd\nNội dung: ${item.content}`,
                                                    update: {
                                                        amount: String(item.amount),
                                                        bankId: item.bankId._id,
                                                        bonus: String(item.bonus),
                                                        content: item.content,
                                                        fee: String(item.fee),
                                                        messengerId: item.messengerId,
                                                        typeFee: item.typeFee,
                                                        typeBox: 'facebook',

                                                    }
                                                });
                                                this.toggleUpdate()
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPen} color="#fff" size="3xs"/>
                                        </button>
                                    </>}
                                
                                    {item.status === 1 && <>
                                        <button className="btn btn-sm btn-danger me-1 mb-1" title="Hủy" onClick={() => {this.setState({cancelTransaction: item}); this.toggleCancel()}}>
                                            <FontAwesomeIcon icon={faMinus} color="#fff" size="3xs"/>
                                        </button>
                                    </>}
                                    {(item.status !== 1) && <>
                                        <button className="btn btn-sm btn-warning me-1 mb-1" title="Hoàn tác" onClick={()=> {this.setState({undoTransaction: item});this.toggleUndo()}}>
                                            <FontAwesomeIcon icon={faUndoAlt} color="#fff" size="3xs"/>
                                        </button>
                                    </>}
                                </td>
                            </tr>)}
                        </tbody>
                    </Table>

                    <Modal isOpen={this.state.undoModal} toggle={this.toggleUndo} className={this.props.className}>
                        <ModalHeader toggle={this.toggleUndo}><span style={{fontWeight: 'bold'}}>Xác nhận hoàn tác box</span></ModalHeader>
                        <ModalBody>
                            
                            Số tài khoản: {this.state.undoTransaction?.bankId.bankAccount} <br />
                            Ngân hàng: {this.state.undoTransaction?.bankId.bankName} <br />
                            Chủ tài khoản: {this.state.undoTransaction?.bankId.bankAccountName} <br />
                            Tổng tiền: <span className="fw-bold text-danger">{this.state.undoTransaction?.totalAmount.toLocaleString()} vnd</span><br />
            
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
                            Tổng tiền: <span className="fw-bold text-danger">{this.state.confirmTransaction?.totalAmount.toLocaleString()} vnd</span><br />
            
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

                    <Modal isOpen={this.state.cancelModal} toggle={this.toggleCancel} className={this.props.className}>
                        <ModalHeader toggle={this.toggleCancel}><span style={{fontWeight: 'bold'}}>Xác nhận hủy giao dịch</span></ModalHeader>
                        <ModalBody>
                            Số tài khoản: {this.state.cancelTransaction?.bankId.bankAccount} <br />
                            Ngân hàng: {this.state.cancelTransaction?.bankId.bankName} <br />
                            Chủ tài khoản: {this.state.cancelTransaction?.bankId.bankAccountName} <br />
                            Tổng tiền: <span className="fw-bold text-danger">{this.state.cancelTransaction?.totalAmount.toLocaleString()} vnd</span><br />
            
                        </ModalBody>
    
                        <ModalFooter>
                            <Button color="link" onClick={this.toggleCancel}>
                                Cancel
                            </Button>
                            <Button color="danger" onClick={this.hanldeCancel}>
                                Hủy giao dịch
                            </Button>{" "}
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={this.state.updateModal} toggle={this.toggleUpdate} className="modal-xl">
                        <ModalHeader toggle={this.toggleUpdate}><span style={{fontWeight: 'bold'}}>Chỉnh sửa giao dịch</span></ModalHeader>
                        <ModalBody onKeyDown={(e) => e.key === "Enter" && this.handleUpdate(e)}>
                            <Row>
                                <Col md={6} xs={12}>

                                    <Row className="mb-4">
                                        <Col md={12}>
                                            <Select
                                                value={this.state.bankAccounts
                                                    .map(bank => ({ value: bank._id, label: bank.bankName }))
                                                    .find(option => option.value === this.state.update.bankId) || null}
                                                onChange={selected => {
                                                        this.setState({ update: { ...this.state.update, bankId: selected.value } })
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
                                    </Row>
                                    <Row className="mb-4">
                                        <Col md={6} xs={12} className={cx({ "pe-2": !this.state.isMobile, "mb-4": this.state.isMobile })}>
                                            <Label>Số tiền</Label>
                                            <Input
                                                type="text"
                                                name="amount"
                                                value={new Intl.NumberFormat('en-US').format(this.state.update.amount)}
                                                onChange={(e) => {
                                                    let rawValue = e.target.value.replace(/,/g, '');
                                                    let value = parseInt(rawValue, 10) || 0;

                                                    let fee = 0;
                                                    const feeItem = this.state.fee.find(item => value >= item.min && value <= item.max);
                                                    if (feeItem) {
                                                        fee = feeItem.feeDefault;
                                                    }
                                                
                                                    this.setState((prevState) => ({
                                                        update: {
                                                            ...prevState.update,
                                                            amount: value < 0 ? 0 : value,
                                                            fee: fee,
                                                        },
                                                    }));
                                                }}
                                            />
                                        </Col>
                                        <Col md={6} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
                                            <Label>Phí</Label>
                                            <Input
                                                type="text"
                                                name="fee"
                                                value={new Intl.NumberFormat('en-US').format(this.state.update.fee)}
                                                onChange={(e) => {
                                                    let rawValue = e.target.value.replace(/,/g, '');
                                                    let numericValue = parseInt(rawValue, 10) || 0;

                                                    this.setState((prevState) => ({
                                                        update: {
                                                            ...prevState.update,
                                                            fee: numericValue < 0 ? 0 : numericValue,
                                                        },
                                                    }));
                                                }}
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
                                                value={this.state.update.content}
                                                onChange={this.handleUpdateChange}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mb-4">
                                        <Col md={6} xs={12} className="pe-2">
                                            <Input
                                                type="text"
                                                name="messengerId"
                                                id="messengerId"
                                                placeholder="Messenger ID"
                                                value={this.state.update.messengerId}
                                                onChange={this.handleUpdateChange}
                                            />
                                        </Col>
                                        <Col md={6} xs={12} className="ps-2">
                                            <Select
                                                value={typeFee
                                                    .map(option => ({ value: option.value, label: option.name }))
                                                    .find(option => option.value === this.state.update.typeFee) || null}
                                                onChange={selected => this.setState(prevState => ({
                                                    update: { ...prevState.update, typeFee: selected?.value }
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
                                        <div>
                                            <Label>Trạng thái: &nbsp;</Label><StatusBadge status={this.state.updateTransaction?.status}/>           
                                        </div>
                                    </Row>
                                    <Row className="mb-4">
                                        <Col md={12} xs={12} style={{position: 'relative'}}>
                                            <textarea rows={5} cols={10}className="form-control" value={this.state.textCopy} disabled/>
                                            <div style={{position: 'absolute', right: 8, top: 0}}>
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
                                <Col md={6} xs={12}>
                                    <Row>
                                        <Col md={6}>

                                        </Col>
                                        <Col md={6} xs={12}>
                                            <InputGroup>
                                                <Input value={this.state.updateTransaction?.linkQr} placeholder="Link QR" disabled/>
                                                <CopyToClipboard text={this.state.updateTransaction?.linkQr}>
                                                    <Button color="primary">
                                                        <FontAwesomeIcon icon={faCopy} />
                                                    </Button>
                                                </CopyToClipboard>
                                            </InputGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <img src={this.state.updateTransaction?.linkQr} alt="" style={{width: '100%', height: '100%', padding: this.state.isMobile ? '0' : '0 3rem'}}></img>
                                    </Row>
                                </Col>
                            
                            </Row>
                        </ModalBody>

                        <ModalFooter>
                            <Button color="link" onClick={this.toggleUpdate}>
                                Cancel
                            </Button>
                            <Button color="primary" onClick={this.handleUpdate} disabled={this.state.loading}>
                                {this.state.loading ? "Đang cập nhật..." : "Cập nhật"}
                            </Button>{" "}
                        </ModalFooter>
                    </Modal>
                </>)}
            </Card>)
    }
}

const mapStateToProps = (state) => ({
    transactions: state.box.box ? state.box.box.transactions : [],
    loading: state.box.loading,
    boxId: state.box.box ? state.box.box._id : '',
    messengerId: state.box.box ? state.box.box.messengerId : '',
});
  
const mapDispatchToProps = {
    getBoxById,
    undoBox
};
  
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TransactionsTable));