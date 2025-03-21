import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, PaginationItem, PaginationLink, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from "react-loaders";
import { Combobox } from "react-widgets/cjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import SweetAlert from 'react-bootstrap-sweetalert';
import { createQuickAnswer, deleteQuickAnswer, fetchQuickAnswers, updateQuickAnswer } from "../../../services/quickAnswer.service";

class QuickAnswerTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            createLoading: false,
            createModal: false,
            deleteModal: false,
            updateModal: false,
            quickAnswerId: null,
            quickAnswers: [],
            alert: false,
            errorMsg: '',
            name: '',
            selectedQuickAnswer: null,
            input: {
                title: '',
                content: '',
            },
            update: {
                title: '',
                content: '',
            }
        };

        this.toggleCreate = this.toggleCreate.bind(this);
        this.toggleUpdate = this.toggleUpdate.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this)
    }

    componentDidMount() {
        this.getQuickAnswers();
    }

    getQuickAnswers = async () => {
        this.setState({loading: true});
        const res = await fetchQuickAnswers();
        this.setState({quickAnswers: res.quickAnswers, loading: false});
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
            await createQuickAnswer(this.state.input);
            this.setState({createLoading: false});
            this.toggleCreate();
            this.setState({input: {
                title: '',
                content: ''
            },})
            this.getQuickAnswers();
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
            await updateQuickAnswer(this.state.quickAnswerId, this.state.update);
            this.setState({createLoading: false});
            this.toggleUpdate();
            this.getQuickAnswers();
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
            await deleteQuickAnswer(this.state.quickAnswerId);
            this.setState({createLoading: false});
            this.getQuickAnswers();
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
                        <ModalHeader toggle={this.toggleCreate}>Thêm câu trả lời nhanh</ModalHeader>
                        <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.createLoading && this.handleSubmit(e)}>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Tiêu đề</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="title"
                                        id="title"
                                        value={this.state.input.title}
                                        onChange={(e)=>{
                                            this.setState((prevState) => ({
                                                input: { ...prevState.input, title: e.target.value }
                                            }));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Nội dung</Label>
                                </Col>
                                <Col md={9}>
                                    <textarea 
                                        rows={4} 
                                        className="form-control" 
                                        value={this.state.input.content}
                                        onChange={(e)=>{
                                            this.setState((prevState) => ({
                                                input: { ...prevState.input, content: e.target.value }
                                            }));
                                        }}
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
                            <th className="text-center">Tiêu đề</th>
                            <th className="text-center">Nội dung</th>
                            <th className="text-center">#</th>
                        </tr>
                    </thead>
                    <tbody>
                    
                        {this.state.quickAnswers.map((item) => <tr>
                            <td className="text-center text-muted">{item.title}</td>
                            <td className="text-center text-muted">{item.content.length > 50 ? item.content.slice(0, 50) + "..." : item.content}</td>
                            <td className="text-center text-muted">
                                <button 
                                    className="btn btn-sm btn-info me-1 mb-1" 
                                    onClick={() => {
                                        this.setState({
                                            quickAnswerId: item._id,
                                            update: {
                                                title: item.title,
                                                content: item.content
                                            }
                                        });
                                        this.toggleUpdate()
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPen} color="#fff" size="3xs"/>
                                </button>
                                <button className="btn btn-sm btn-danger me-1 mb-1"
                                    onClick={(e) => {
                                        this.setState({
                                            quickAnswerId: item._id,
                                            selectedQuickAnswer: {
                                                title: item.title,
                                                content: item.content
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
                                <Label>Tiêu đề</Label>
                            </Col>
                            <Col md={9}>
                                <Input
                                    type="text"
                                    name="title"
                                    id="titleUpdate"
                                    value={this.state.update.title}
                                    onChange={(e)=>{
                                        this.setState((prevState) => ({
                                            update: { ...prevState.update, title: e.target.value }
                                        }));
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={3}>
                                <Label>Nội dung</Label>
                            </Col>
                            <Col md={9}>
                                <textarea 
                                    rows={4} 
                                    className="form-control" 
                                    value={this.state.update.content}
                                    onChange={(e)=>{
                                        this.setState((prevState) => ({
                                            update: { ...prevState.update, content: e.target.value }
                                        }));
                                    }}
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
                <ModalHeader toggle={this.toggleDelete}><span style={{fontWeight: 'bold'}}>Xác nhận xóa câu trả lời nhanh "{this.state.selectedQuickAnswer?.title}"</span></ModalHeader>

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
  
export default connect(mapStateToProps, mapDispatchToProps)(QuickAnswerTable);