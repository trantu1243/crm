import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, PaginationItem, PaginationLink, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from "react-loaders";
import { Combobox, Multiselect } from "react-widgets/cjs";
import { createRole, deleteRole, fetchRoles, updateRole } from "../../../services/roleService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { fetchStaffs } from "../../../services/staffService";
import { fetchPermissions } from "../../../services/permissionService";
import SweetAlert from 'react-bootstrap-sweetalert';

class RoleTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            createLoading: false,
            createModal: false,
            updateModal: false,
            deleteModal: false,
            roleId: null,
            roles: [],
            staffs: [],
            permissions: [],
            alert: false,
            errorMsg: '',
            name: '',
            input: {
                name: '',
                staffId: [],
                permissions: []
            },
            update: {
                name: '',
                staffId: [],
                permissions: []
            }
        };

        this.toggleCreate = this.toggleCreate.bind(this);
        this.toggleUpdate = this.toggleUpdate.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this);

    }

    componentDidMount() {
        this.getRoles();
        this.getStaffs();
        this.getPermissions();
    }

    getRoles = async () => {
        this.setState({loading: true});
        const res = await fetchRoles();
        this.setState({roles: res.data, loading: false});
    }

    getStaffs = async () => {
        const data = await fetchStaffs();
        this.setState({
            staffs: data.data
        })
    }

    getPermissions = async () => {
        const res = await fetchPermissions();
        this.setState({permissions: res.data});
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
            const res = await createRole(this.state.input);
            this.setState({createLoading: false});
            this.toggleCreate();
            this.getRoles();
        } catch(error) {
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
            const res = await updateRole(this.state.roleId, this.state.update);
            this.setState({createLoading: false});
            this.toggleUpdate();
            this.getRoles();
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({createLoading: false})
        }
    };

    handleDelete = async (e) => {
        try{
            e.preventDefault();
            this.setState({createLoading: true});
            const res = await deleteRole(this.state.roleId, this.state.update);
            this.setState({createLoading: false});
            this.toggleDelete();
            this.getRoles();
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({createLoading: false})
        }
    };

    render() { 
        let { staffs, permissions } = this.state;

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
                        <ModalHeader toggle={this.toggleCreate}>Tạo nhóm quyền</ModalHeader>
                        <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && this.handleSubmit(e)}>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Tên nhóm quyền</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="name"
                                        value={this.state.input.name}
                                        onChange={(e)=>{this.setState({input: {...this.state.input, name: e.target.value}})}}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Nhân viên</Label>
                                </Col>
                                <Col md={9}>
                                    <Multiselect
                                        data={staffs}
                                        value={staffs.filter((s) => this.state.input.staffId.includes(s._id))}
                                        onChange={(selected) =>
                                            this.setState({
                                                input: {
                                                    ...this.state.input,
                                                    staffId: selected.map((s) => s._id),
                                                }
                                            })
                                        }
                                        textField="name_staff"
                                        valueField="_id"
                                        placeholder="Chọn nhân viên"
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Quyền thao tác</Label>
                                </Col>
                                <Col md={9}>
                                    <Multiselect
                                        data={permissions}
                                        value={permissions.filter((s) => this.state.input.permissions.includes(s._id))}
                                        onChange={(selected) =>
                                            this.setState({
                                                input: {
                                                    ...this.state.input,
                                                    permissions: selected.map((s) => s._id),
                                                }
                                            })
                                        }
                                        textField="name"
                                        valueField="_id"
                                        placeholder="Chọn quyền thao tác"
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
                            <th className="text-center">Tên quyền</th>
                            <th className="text-center">#</th>
                        </tr>
                    </thead>
                    <tbody>
                    
                        {this.state.roles.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{item.name}</td>
                            <td className="text-center text-muted">
                                <button 
                                    className="btn btn-sm btn-info me-1 mb-1" 
                                    title="Chỉnh sửa" 
                                    onClick={() => {
                                        this.setState({
                                            roleId: item._id,
                                            update: {
                                                name: item.name,
                                                staffId: item.staffs,
                                                permissions: item.permissions
                                            }
                                        });
                                        this.toggleUpdate()
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPen} color="#fff" size="3xs"/>
                                </button>
                                <button className="btn btn-sm btn-danger me-1 mb-1" title="Xóa" onClick={() => {this.setState({roleId: item._id, name: item.name}); this.toggleDelete()}}>
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
                <ModalHeader toggle={this.toggleUpdate}>Cập nhật nhóm quyền</ModalHeader>
                <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && this.handleUpdate(e)}>
                    <Row className="mb-4">
                        <Col md={3}>
                            <Label>Tên nhóm quyền</Label>
                        </Col>
                        <Col md={9}>
                            <Input
                                type="text"
                                name="name"
                                value={this.state.update.name}
                                onChange={(e)=>{this.setState({update: {...this.state.update, name: e.target.value}})}}
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={3}>
                            <Label>Nhân viên</Label>
                        </Col>
                        <Col md={9}>
                            <Multiselect
                                data={staffs}
                                value={staffs.filter((s) => this.state.update.staffId.includes(s._id))}
                                onChange={(selected) =>
                                    this.setState({
                                        update: {
                                            ...this.state.update,
                                            staffId: selected.map((s) => s._id),
                                        }
                                    })
                                }
                                textField="name_staff"
                                valueField="_id"
                                placeholder="Chọn nhân viên"
                            />
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={3}>
                            <Label>Quyền thao tác</Label>
                        </Col>
                        <Col md={9}>
                            <Multiselect
                                data={permissions}
                                value={permissions.filter((s) => this.state.update.permissions.includes(s._id))}
                                onChange={(selected) =>
                                    this.setState({
                                        update: {
                                            ...this.state.update,
                                            permissions: selected.map((s) => s._id),
                                        }
                                    })
                                }
                                textField="name"
                                valueField="_id"
                                placeholder="Chọn quyền thao tác"
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
                <ModalHeader toggle={this.toggleDelete}><span style={{fontWeight: 'bold'}}>Xác nhận xóa nhóm quyền "{this.state.name}"</span></ModalHeader>
               
                <ModalFooter>
                    <Button color="link" onClick={this.toggleDelete}>
                        Cancel
                    </Button>
                    <Button color="danger" onClick={this.handleDelete}>
                        Xóa
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
  
export default connect(mapStateToProps, mapDispatchToProps)(RoleTable);