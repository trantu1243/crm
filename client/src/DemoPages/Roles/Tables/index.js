import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, PaginationItem, PaginationLink, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from "react-loaders";
import { Combobox, Multiselect } from "react-widgets/cjs";
import { fetchRoles } from "../../../services/roleService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { fetchStaffs } from "../../../services/staffService";
import { permission } from "process";
import { fetchPermissions } from "../../../services/permissionService";

class RoleTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            createLoading: false,
            createModal: false,
            roles: [],
            staffs: [],
            permissions: [],
            input: {
                staffId: [],
                permissions: []
            }
        };

        this.toggleCreate = this.toggleCreate.bind(this);
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
                        <ModalHeader toggle={this.toggleCreate}>Tạo bill thanh khoản</ModalHeader>
                        <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && this.handleSubmit(e)}>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Tên nhóm quyền</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="name"
                                      
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
                            <Button color="primary" disabled={this.state.createLoading} >
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
                            <th className="text-center">Slug</th>
                        </tr>
                    </thead>
                    <tbody>
                    
                        {this.state.roles.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{item.name}</td>
                            <td className="text-center text-muted">{item.slug}</td>
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
        </Card>)
    }
}

const mapStateToProps = (state) => ({
});
  
const mapDispatchToProps = {

};
  
export default connect(mapStateToProps, mapDispatchToProps)(RoleTable);