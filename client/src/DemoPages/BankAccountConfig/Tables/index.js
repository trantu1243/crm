import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, PaginationItem, PaginationLink, Row, Table } from "reactstrap";
import Select from "react-select";

import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from "react-loaders";
import { Combobox } from "react-widgets/cjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import SweetAlert from 'react-bootstrap-sweetalert';
import { createBankAccount, deleteBankAccount, fetchBankAccounts, updateBankAccount } from "../../../services/bankAccountService";
import { fetchBankApi } from "../../../services/bankApiService";

class BankAccountTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            createLoading: false,
            createModal: false,
            deleteModal: false,
            updateModal: false,
            bankAccountId: null,
            bankAccounts: [],
            banks: [],
            alert: false,
            errorMsg: '',
            name: '',
            selectedBank: null,
            input: {
                bankId: '',
                bankAccount: '',
                bankAccountName: ''
            },
            update: {
                bankId: '',
                bankAccount: '',
                bankAccountName: ''
            }
        };

        this.toggleCreate = this.toggleCreate.bind(this);
        this.toggleUpdate = this.toggleUpdate.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this)
    }

    componentDidMount() {
        this.getBankAccounts();
        this.getBanks();
    }

    getBankAccounts = async () => {
        this.setState({loading: true});
        const res = await fetchBankAccounts();
        this.setState({bankAccounts: res.data, loading: false});
    }

     getBanks = async () => {
        const data = await fetchBankApi();
        this.setState({
            banks: data.data
        })
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

    toggleDelete() {
        this.setState({
            deleteModal: !this.state.deleteModal,
        });
    }

    handleSubmit = async (e) => {
        try{
            e.preventDefault();
            this.setState({createLoading: true});
            const res = await createBankAccount(this.state.input);
            this.setState({createLoading: false});
            this.toggleCreate();
            this.setState({input: {
                bankId: '',
                bankAccount: '',
                bankAccountName: ''
            },})
            this.getBankAccounts();
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({createLoading: false})
            this.toggleCreate();
        }
    };

    handleUpdate = async (e) => {
        try{
            e.preventDefault();
            this.setState({createLoading: true});
            const res = await updateBankAccount(this.state.bankAccountId, this.state.update);
            this.setState({createLoading: false});
            this.toggleUpdate();
            this.getBankAccounts();
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({createLoading: false})
            this.toggleUpdate();
        }
    };

    handleDelete = async (e) => {
        try{
            e.preventDefault();
            this.setState({createLoading: true});
            const res = await deleteBankAccount(this.state.bankAccountId);
            this.setState({createLoading: false});
            this.getBankAccounts();
            this.toggleDelete()
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({createLoading: false})
            this.toggleDelete()
        }
    };

    render() { 

        return (<Card className="main-card mb-3">
            {this.state.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
                <CardHeader className="mt-2">
                    <Button color="info" className="me-1 al-min-width-max-content" style={{minWidth: 'max-content', textTransform: 'none'}} onClick={this.toggleCreate}>
                        <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
                    </Button>
                    <Modal isOpen={this.state.createModal} toggle={this.toggleCreate} className="modal-lg" style={{marginTop: '10rem'}}>
                        <ModalHeader toggle={this.toggleCreate}>Thêm ngân hàng</ModalHeader>
                        <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.createLoading && this.handleSubmit(e)}>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Chọn ngân hàng</Label>
                                </Col>
                                <Col md={9}>
                                    <Select
                                        value={this.state.banks
                                            .map(bank => ({ value: bank._id, label: bank.bankName }))
                                            .find(option => option.value === this.state.input.bankId) || null}
                                        onChange={selected => {
                                                this.setState({ input: { ...this.state.input, bankId: selected.value } })
                                            }
                                        }
                                        options={this.state.banks.map(bank => ({
                                            value: bank._id,
                                            label: bank.bankName
                                        }))}
                                        placeholder="Chọn ngân hàng"
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Số tài khoản</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="bankAccount"
                                        id="bankAccount"
                                        value={this.state.input.bankAccount}
                                        onChange={(e)=>{
                                            const sanitizedValue = e.target.value.replace(/\s/g, '');
                                            this.setState((prevState) => ({
                                                input: { ...prevState.input, bankAccount: sanitizedValue }
                                            }));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Tên chủ tài khoản</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="bankAccountName"
                                        value={this.state.input.bankAccountName}
                                        onChange={(e) => {
                                            this.setState((prevState) => ({
                                                input: {
                                                    ...prevState.input,
                                                    bankAccountName: e.target.value,
                                                },
                                            }));
                                        }}
                                        required
                                    />
                                </Col>
                            </Row>
        
                        </ModalBody>
                        <ModalFooter>
                            <Button color="link" onClick={this.toggleCreate}>
                                Hủy
                            </Button>
                            <Button color="primary" disabled={this.state.createLoading} onClick={this.handleSubmit}>
                                {this.state.createLoading ? "Đang tạo..." : "Tạo"}
                            </Button>{" "}
                        </ModalFooter>
                    </Modal>
                </CardHeader>
                <Table responsive hover striped borderless className="align-middle mb-0">
                    <thead>
                        <tr>
                            <th className="text-center">ID</th>
                            <th className="text-center">Tên ngân hàng</th>
                            <th className="text-center">Code</th>
                            <th className="text-center">STK</th>
                            <th className="text-center">Tên chủ STK</th>
                            <th className="text-center">Bin</th>
                            <th className="text-center">#</th>
                        </tr>
                    </thead>
                    <tbody>
                    
                        {this.state.bankAccounts.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{item.bankName}</td>
                            <td className="text-center text-muted">{item.bankCode}</td>
                            <td className="text-center text-muted">{item.bankAccount}</td>
                            <td className="text-center text-muted">{item.bankAccountName}</td>
                            <td className="text-center text-muted">{item.binBank}</td>
                            <td className="text-center text-muted">
                                <button 
                                    className="btn btn-sm btn-info me-1 mb-1" 
                                    title="Chỉnh sửa" 
                                    onClick={() => {
                                        const selectedBank = this.state.banks.find(b => b.bankCode === item.bankCode);
                                        this.setState({
                                            bankAccountId: item._id,
                                            update: {
                                                bankId: selectedBank?._id || "",
                                                bankAccount: item.bankAccount,
                                                bankAccountName: item.bankAccountName
                                            }
                                        });
                                        this.toggleUpdate()
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPen} color="#fff" size="3xs"/>
                                </button>
                                <button className="btn btn-sm btn-danger me-1 mb-1" title="Xóa" 
                                    onClick={(e) => {
                                        const selectedBank = this.state.banks.find(b => b.bankCode === item.bankCode);
                                        this.setState({
                                            bankAccountId: item._id,
                                            selectedBank: {
                                                bankName: selectedBank?.bankName || "",
                                                bankAccount: item.bankAccount || "",
                                                bankAccountName: item.bankAccountName || "",
                                            }
                                        })
                                        this.toggleDelete();
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTrash} color="#fff" size="3xs"/>
                                </button>
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                    <Row className="mt-2">
                        <Col md={11}>
                            <Pagination aria-label="Page navigation">
                                <PaginationItem active>
                                    <PaginationLink>
                                        {1}
                                    </PaginationLink>
                                </PaginationItem>
                            </Pagination>
                        </Col>
                        <Col md={1}>
                            <Combobox
                                data={[10, 20, 30, 50, 100]} 
                                defaultValue={[10]} 
                            />
                        </Col>
                    </Row>

                </CardFooter>
            </>)}
            <Modal isOpen={this.state.updateModal} toggle={this.toggleUpdate} className="modal-lg" style={{marginTop: '10rem'}}>
                <ModalHeader toggle={this.toggleUpdate}>Cập nhật ngân hàng</ModalHeader>
                    <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.createLoading && this.handleUpdate(e)}>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Chọn ngân hàng</Label>
                            </Col>
                            <Col md={9}>
                                <Select
                                    value={this.state.banks
                                        .map(bank => ({ value: bank._id, label: bank.bankName }))
                                        .find(option => option.value === this.state.update.bankId) || null}
                                    onChange={selected => {
                                            this.setState({ update: { ...this.state.update, bankId: selected.value } })
                                        }
                                    }
                                    options={this.state.banks.map(bank => ({
                                        value: bank._id,
                                        label: bank.bankName
                                    }))}
                                    placeholder="Chọn ngân hàng"
                                />
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Số tài khoản</Label>
                            </Col>
                            <Col md={9}>
                                <Input
                                    type="text"
                                    name="bankAccount"
                                    id="bankAccount"
                                    value={this.state.update.bankAccount}
                                    onChange={(e)=>{
                                        const sanitizedValue = e.target.value.replace(/\s/g, '');
                                        this.setState((prevState) => ({
                                            update: { ...prevState.update, bankAccount: sanitizedValue }
                                        }));
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Tên chủ tài khoản</Label>
                            </Col>
                            <Col md={9}>
                                <Input
                                    type="text"
                                    name="bankAccountName"
                                    value={this.state.update.bankAccountName}
                                    onChange={(e) => {
                                        this.setState((prevState) => ({
                                            update: {
                                                ...prevState.update,
                                                bankAccountName: e.target.value,
                                            },
                                        }));
                                    }}
                                    required
                                />
                            </Col>
                        </Row>
    
                    </ModalBody>
                <ModalFooter>
                    <Button color="link" onClick={this.toggleUpdate}>
                        Hủy
                    </Button>
                    <Button color="primary" disabled={this.state.createLoading} onClick={this.handleUpdate}>
                        {this.state.createLoading ? "Đang cập nhật..." : "Cập nhật"}
                    </Button>{" "}
                </ModalFooter>
            </Modal>
            <Modal isOpen={this.state.deleteModal} toggle={this.toggleDelete} className={this.props.className}>
                <ModalHeader toggle={this.toggleDelete}><span style={{fontWeight: 'bold'}}>Xác nhận xóa ngân hàng</span></ModalHeader>
                <ModalBody>
                    Số tài khoản: {this.state.selectedBank?.bankAccount} <br />
                    Ngân hàng: {this.state.selectedBank?.bankName} <br />
                    Chủ tài khoản: {this.state.selectedBank?.bankAccountName} <br />
                </ModalBody>

                <ModalFooter>
                    <Button color="link" onClick={this.toggleDelete}>
                        Cancel
                    </Button>
                    <Button color="danger" onClick={this.handleDelete} disabled={this.state.loading}>
                        {this.state.loading ? "Đang xóa..." : "Xóa"}
                    </Button>{" "}
                </ModalFooter>
            </Modal>
            <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                type="error" onConfirm={() => this.setState({alert: false})}/>
        </Card>)
    }
}

const mapStateToProps = (state) => ({
});
  
const mapDispatchToProps = {

};
  
export default connect(mapStateToProps, mapDispatchToProps)(BankAccountTable);