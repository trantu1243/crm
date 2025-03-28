import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, PaginationItem, PaginationLink, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from "react-loaders";
import { Combobox, Multiselect } from "react-widgets/cjs";
import { createStaff, fetchAllStaffs, updateStaff } from "../../../services/staffService";
import { formatDate } from "../../Transactions/Tables/data";
import ToggleStatus from "./ToggleStatus";
import { faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchBankAccounts } from "../../../services/bankAccountService";
import SweetAlert from 'react-bootstrap-sweetalert';

class StaffTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            staffs: [],
            createModal: false,
            updateModal: false,
            staffId: null,
            bankAccounts: [],
            createLoading: false,
            alert: false,
            errorMsg: '',
            input: {
                name_staff: '',
                phone_staff: '',
                email: '',
                uid_facebook: '',
                password: '',
                cf_password: '',
                permission_bank: []
            },
            update: {
                name_staff: '',
                phone_staff: '',
                email: '',
                uid_facebook: '',
                password: '',
                cf_password: '',
                permission_bank: []
            },
        };

        this.toggleCreate = this.toggleCreate.bind(this);
        this.toggleUpdate = this.toggleUpdate.bind(this);
    }

    componentDidMount() {
        this.getStaffs();
        this.getBankAccounts();
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

    getStaffs = async () => {
        this.setState({loading: true});
        const res = await fetchAllStaffs();
        this.setState({staffs: res.data, loading: false});
    }

    getBankAccounts = async () => {
        const data = await fetchBankAccounts();
        this.setState({
            bankAccounts: data.data
        })
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
            this.setState({createLoading: true});
            await createStaff(this.state.input);
            this.setState({
                createLoading: false,
                input: {
                    name_staff: '',
                    phone_staff: '',
                    email: '',
                    uid_facebook: '',
                    password: '',
                    cf_password: '',
                    permission_bank: []
                },
            });
            this.toggleCreate();
            this.getStaffs();
        } catch(error) {
            this.toggleCreate();
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({createLoading: false})
        }
    };

    handleUpdate = async (e) => {
        try{
            e.preventDefault();
            this.setState({createLoading: true});
            await updateStaff(this.state.staffId, this.state.update);
            this.setState({createLoading: false});
            this.toggleUpdate();
            this.getStaffs();
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({createLoading: false})
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
                        <ModalHeader toggle={this.toggleCreate}>Tạo nhân viên</ModalHeader>
                        <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.createLoading && this.handleSubmit(e)}>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Tên nhân viên</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="name_staff"
                                        value={this.state.input.name_staff}
                                        onChange={this.handleInputChange}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Số điện thoại</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="phone_staff"
                                        value={this.state.input.phone_staff}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) { 
                                                this.handleInputChange(e);
                                            }
                                        }}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Email</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="email"
                                        name="email"
                                        value={this.state.input.email}
                                        onChange={this.handleInputChange}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>UID Facebook</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="uid_facebook"
                                        value={this.state.input.uid_facebook}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) { 
                                                this.handleInputChange(e);
                                            }
                                        }}
                                        
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Mật khẩu</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="password"
                                        name="password"
                                        value={this.state.input.password}
                                        onChange={this.handleInputChange}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Xác nhận mật khẩu</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="password"
                                        name="cf_password"
                                        value={this.state.input.cf_password}
                                        onChange={this.handleInputChange}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Quyền ngân hàng</Label>
                                </Col>
                                <Col md={9}>
                                    <Multiselect
                                        data={this.state.bankAccounts}
                                        value={this.state.bankAccounts.filter((s) => this.state.input.permission_bank.includes(s._id))}
                                        onChange={(selected) =>
                                            this.setState({
                                                input: {
                                                    ...this.state.input,
                                                    permission_bank: selected.map((s) => s._id),
                                                }
                                            })
                                        }
                                        textField="bankCode"
                                        valueField="_id"
                                        placeholder="Chọn ngân hàng ..."
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
                            <th className="text-center">Tên nhân viên</th>
                            <th className="text-center">Số điện thoại</th>
                            <th className="text-center">Email</th>
                            <th className="text-center">UID Facebook</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-center">Ngày tạo</th>
                            <th className="text-center">#</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.staffs.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{item.name_staff}</td>
                            <td className="text-center text-muted">{item.phone_staff}</td>
                            <td className="text-center text-muted">{item.email}</td>
                            <td className="text-center text-muted">{item.uid_facebook}</td>
                            <td className="text-center text-muted">
                                <ToggleStatus id={item._id} status={item.status} />
                            </td>
                            <td className="text-center text-muted">{formatDate(item.createdAt)}</td>
                            <td className="text-center text-muted">
                                <button 
                                    className="btn btn-sm btn-info me-1 mb-1" 
                                    title="Chỉnh sửa" 
                                    onClick={() => {
                                        this.setState({
                                            staffId: item._id,
                                            update: {
                                                name_staff: item.name_staff,
                                                phone_staff: item.phone_staff,
                                                email: item.email,
                                                uid_facebook: item.uid_facebook,
                                                password: '',
                                                cf_password: '',
                                                permission_bank: item.permission_bank
                                            }
                                        })
                                        this.toggleUpdate()
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPen} color="#fff" size="3xs"/>
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
                <Modal isOpen={this.state.updateModal} toggle={this.toggleUpdate} className="modal-lg" style={{marginTop: '10rem'}}>
                    <ModalHeader toggle={this.toggleUpdate}>Tạo nhân viên</ModalHeader>
                    <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.createLoading && this.handleUpdate(e)}>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Tên nhân viên</Label>
                            </Col>
                            <Col md={9}>
                                <Input
                                    type="text"
                                    name="name_staff"
                                    value={this.state.update.name_staff}
                                    onChange={this.handleUpdateChange}
                                    required
                                />
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Số điện thoại</Label>
                            </Col>
                            <Col md={9}>
                                <Input
                                    type="text"
                                    name="phone_staff"
                                    value={this.state.update.phone_staff}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) { 
                                            this.handleUpdateChange(e);
                                        }
                                    }}
                                    required
                                />
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Email</Label>
                            </Col>
                            <Col md={9}>
                                <Input
                                    type="email"
                                    name="email"
                                    value={this.state.update.email}
                                    onChange={this.handleUpdateChange}
                                    required
                                />
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>UID Facebook</Label>
                            </Col>
                            <Col md={9}>
                                <Input
                                    type="text"
                                    name="uid_facebook"
                                    value={this.state.update.uid_facebook}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) { 
                                            this.handleUpdateChange(e);
                                        }
                                    }}
                                    
                                />
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Mật khẩu</Label>
                            </Col>
                            <Col md={9}>
                                <Input
                                    type="password"
                                    name="password"
                                    value={this.state.update.password}
                                    onChange={this.handleUpdateChange}
                                    required
                                />
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Xác nhận mật khẩu</Label>
                            </Col>
                            <Col md={9}>
                                <Input
                                    type="password"
                                    name="cf_password"
                                    value={this.state.update.cf_password}
                                    onChange={this.handleUpdateChange}
                                    required
                                />
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Quyền ngân hàng</Label>
                            </Col>
                            <Col md={9}>
                                <Multiselect
                                    data={this.state.bankAccounts}
                                    value={this.state.bankAccounts.filter((s) => this.state.update.permission_bank.includes(s._id))}
                                    onChange={(selected) =>
                                        this.setState({
                                            update: {
                                                ...this.state.update,
                                                permission_bank: selected.map((s) => s._id),
                                            }
                                        })
                                    }
                                    textField="bankCode"
                                    valueField="_id"
                                    placeholder="Chọn ngân hàng ..."
                                />
                            </Col>
                        </Row>
    
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.toggleUpdate}>
                            Hủy
                        </Button>
                        <Button color="primary" disabled={this.state.createLoading} onClick={this.handleUpdate}>
                            {this.state.createLoading ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
                <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                    type="error" onConfirm={() => this.setState({alert: false})}/>
            </>)}
        </Card>)
    }
}

const mapStateToProps = (state) => ({
});
  
const mapDispatchToProps = {

};
  
export default connect(mapStateToProps, mapDispatchToProps)(StaffTable);