import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, PaginationItem, PaginationLink, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from "react-loaders";
import { Combobox } from "react-widgets/cjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import SweetAlert from 'react-bootstrap-sweetalert';
import { createFee, deleteFee, fetchFee, updateFee } from "../../../services/feeService";

class FeeTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            createLoading: false,
            createModal: false,
            updateModal: false,
            feeId: null,
            fees: [],
            alert: false,
            errorMsg: '',
            name: '',
            input: {
                min: '0',
                max: '0',
                feeDefault: '0'
            },
            update: {
                min: '0',
                max: '0',
                feeDefault: '0'
            }
        };

        this.toggleCreate = this.toggleCreate.bind(this);
        this.toggleUpdate = this.toggleUpdate.bind(this);

    }

    componentDidMount() {
        this.getFees();
    }

    getFees = async () => {
        this.setState({loading: true});
        const res = await fetchFee();
        console.log(res.data)
        this.setState({fees: res.data, loading: false});
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

    handleSubmit = async (e) => {
        try{
            e.preventDefault();
            this.setState({createLoading: true});
            const res = await createFee(this.state.input);
            this.setState({createLoading: false});
            this.toggleCreate();
            this.setState({input: {
                min: '0',
                max: '0',
                feeDefault: '0'
            },})
            this.getFees();
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
            const res = await updateFee(this.state.feeId, this.state.update);
            this.setState({createLoading: false});
            this.toggleUpdate();
            this.getFees();
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({createLoading: false})
        }
    };

    handleDelete = async (e, id) => {
        try{
            e.preventDefault();
            this.setState({createLoading: true});
            const res = await deleteFee(id);
            this.setState({createLoading: false});
            this.getFees();
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
                        <ModalHeader toggle={this.toggleCreate}>Tạo nhóm quyền</ModalHeader>
                        <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.createLoading && this.handleSubmit(e)}>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Số tiền min</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="min"
                                        value={new Intl.NumberFormat('en-US').format(this.state.input.min)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/,/g, '');
                                            let numericValue = parseInt(rawValue, 10) || 0;

                                            this.setState((prevState) => ({
                                                input: {
                                                    ...prevState.input,
                                                    min: numericValue < 0 ? 0 : numericValue,
                                                },
                                            }));
                                        }}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Số tiền max</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="max"
                                        value={new Intl.NumberFormat('en-US').format(this.state.input.max)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/,/g, '');
                                            let numericValue = parseInt(rawValue, 10) || 0;

                                            this.setState((prevState) => ({
                                                input: {
                                                    ...prevState.input,
                                                    max: numericValue < 0 ? 0 : numericValue,
                                                },
                                            }));
                                        }}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Phí</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="feeDefault"
                                        value={new Intl.NumberFormat('en-US').format(this.state.input.feeDefault)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/,/g, '');
                                            let numericValue = parseInt(rawValue, 10) || 0;

                                            this.setState((prevState) => ({
                                                input: {
                                                    ...prevState.input,
                                                    feeDefault: numericValue < 0 ? 0 : numericValue,
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
                            <th className="text-center">Min</th>
                            <th className="text-center">Max</th>
                            <th className="text-center">Phí</th>
                            <th className="text-center">#</th>
                        </tr>
                    </thead>
                    <tbody>
                    
                        {this.state.fees.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{item.min}</td>
                            <td className="text-center text-muted">{item.max}</td>
                            <td className="text-center text-muted">{item.feeDefault}</td>
                            <td className="text-center text-muted">
                                <button 
                                    className="btn btn-sm btn-info me-1 mb-1" 
                                    title="Chỉnh sửa" 
                                    onClick={() => {
                                        this.setState({
                                            feeId: item._id,
                                            update: {
                                                min: item.min,
                                                max: item.max,
                                                feeDefault: item.feeDefault
                                            }
                                        });
                                        this.toggleUpdate()
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPen} color="#fff" size="3xs"/>
                                </button>
                                <button className="btn btn-sm btn-danger me-1 mb-1" title="Xóa" onClick={(e) => {this.handleDelete(e, item._id)}}>
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
                <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.createLoading && this.handleUpdate(e)}>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Số tiền min</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="min"
                                        value={new Intl.NumberFormat('en-US').format(this.state.update.min)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/,/g, '');
                                            let numericValue = parseInt(rawValue, 10) || 0;

                                            this.setState((prevState) => ({
                                                update: {
                                                    ...prevState.update,
                                                    min: numericValue < 0 ? 0 : numericValue,
                                                },
                                            }));
                                        }}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Số tiền max</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="max"
                                        value={new Intl.NumberFormat('en-US').format(this.state.update.max)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/,/g, '');
                                            let numericValue = parseInt(rawValue, 10) || 0;

                                            this.setState((prevState) => ({
                                                update: {
                                                    ...prevState.update,
                                                    max: numericValue < 0 ? 0 : numericValue,
                                                },
                                            }));
                                        }}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Phí</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="feDefault"
                                        value={new Intl.NumberFormat('en-US').format(this.state.update.feeDefault)}
                                        onChange={(e) => {
                                            let rawValue = e.target.value.replace(/,/g, '');
                                            let numericValue = parseInt(rawValue, 10) || 0;

                                            this.setState((prevState) => ({
                                                update: {
                                                    ...prevState.update,
                                                    feeDefault: numericValue < 0 ? 0 : numericValue,
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
            
            <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                type="error" onConfirm={() => this.setState({alert: false})}/>
        </Card>)
    }
}

const mapStateToProps = (state) => ({
});
  
const mapDispatchToProps = {

};
  
export default connect(mapStateToProps, mapDispatchToProps)(FeeTable);