import { Button, Card, CardFooter, CardHeader, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, PaginationItem, PaginationLink, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from "react-loaders";
import { Combobox } from "react-widgets/cjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import SweetAlert from 'react-bootstrap-sweetalert';
import { createTag, deleteTag, fetchTags, updateTag } from "../../../services/tagService";
import Select from "react-select";

export const colorOptions = [
    { value: "primary", label: "primary", color: "#545cd8" },
    { value: "secondary", label: "secondary", color: "#6c757d" },
    { value: "success", label: "success", color: "#3ac47d" },
    { value: "info", label: "info", color: "#30b1ff" },
    { value: "warning", label: "warning", color: "#f7b924" },
    { value: "danger", label: "danger", color: "#d92550" },
    { value: "focus", label: "focus", color: "#444054" },
    { value: "alternate", label: "alternate", color: "#83588a" },
    { value: "dark", label: "dark", color: "#343a40" },
];

export const findColorByValue = (value) => {
    const option = colorOptions.find(option => option.value === value);
    return option ? option.color : "#545cd8";
};

const customStyles = {
    singleValue: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    option: (styles, { data, isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? data.color
        : isFocused
        ? "#ddd"
        : "white",
      color: isSelected ? "white" : data.color,
      cursor: "pointer",
    }),
  };

class TagTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            createLoading: false,
            createModal: false,
            deleteModal: false,
            updateModal: false,
            tagId: null,
            tags: [],
            alert: false,
            errorMsg: '',
            name: '',
            selectedTag: null,
            input: {
                name: '',
                slug: '',
                color: { value: "primary", label: "primary", color: "#545cd8" }
            },
            update: {
                name: '',
                slug: '',
                color: { value: "primary", label: "primary", color: "#545cd8" }
            }
        };

        this.toggleCreate = this.toggleCreate.bind(this);
        this.toggleUpdate = this.toggleUpdate.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this)
    }

    componentDidMount() {
        this.getTags();
    }

    getTags = async () => {
        this.setState({loading: true});
        const res = await fetchTags();
        this.setState({tags: res.tags, loading: false});
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
            await createTag({
                name: this.state.input.name,
                slug: this.state.input.slug,
                color: this.state.input.color?.value
            });
            this.setState({createLoading: false});
            this.toggleCreate();
            this.setState({input: {
                name: '',
                slug: '',
                color: ''
            },})
            this.getTags();
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
            await updateTag(this.state.tagId, {
                name: this.state.update.name,
                slug: this.state.update.slug,
                color: this.state.update.color?.value
            });
            this.setState({createLoading: false});
            this.toggleUpdate();
            this.getTags();
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
            await deleteTag(this.state.tagId);
            this.setState({createLoading: false});
            this.getTags();
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

    removeVietnameseAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
                                    <Label>Tên</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={this.state.input.name}
                                        onChange={(e)=>{
                                            this.setState((prevState) => ({
                                                input: { ...prevState.input, name: e.target.value }
                                            }));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Slug</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="slug"
                                        id="slug"
                                        value={this.state.input.slug}
                                        onChange={(e)=>{
                                            const newSlug = e.target.value.replace(/\s+/g, '');
                                            const convertedValue = this.removeVietnameseAccents(newSlug);
                                            this.setState((prevState) => ({
                                                input: { ...prevState.input, slug: convertedValue }
                                            }));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Color</Label>
                                </Col>
                                <Col md={9}>
                                <Select
                                    options={colorOptions}
                                    styles={customStyles}
                                    value={this.state.input.color}
                                    onChange={(value) => {
                                        this.setState((prevState) => ({
                                            input: { ...prevState.input, color: value }
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
                            <th className="text-center">Tên</th>
                            <th className="text-center">Slug</th>
                            <th className="text-center">Color</th>
                            <th className="text-center">#</th>
                        </tr>
                    </thead>
                    <tbody>
                    
                        {this.state.tags.map((item) => <tr>
                            <td className="text-center text-muted">{item.name}</td>
                            <td className="text-center text-muted">{item.slug}</td>
                            <td className="text-center text-muted"><span className={`badge`} style={{backgroundColor: findColorByValue(item.color)}}>{item.color}</span></td>
                            <td className="text-center text-muted">
                                <button
                                    className="btn btn-sm btn-info me-1 mb-1" 
                                    onClick={() => {
                                        this.setState({
                                            tagId: item._id,
                                            update: {
                                                name: item.name,
                                                slug: item.slug,
                                                color: colorOptions.find(option => option.value === item.color)
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
                                            tagId: item._id,
                                            selectedTag: {
                                                name: item.name,
                                                slug: item.slug,
                                                color: colorOptions.find(option => option.value === item.color)
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
                                    <Label>Tên</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={this.state.update.name}
                                        onChange={(e)=>{
                                            this.setState((prevState) => ({
                                                update: { ...prevState.update, name: e.target.value }
                                            }));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Slug</Label>
                                </Col>
                                <Col md={9}>
                                    <Input
                                        type="text"
                                        name="slug"
                                        id="slug"
                                        value={this.state.update.slug}
                                        onChange={(e)=>{
                                            const newSlug = e.target.value.replace(/\s+/g, '');
                                            const convertedValue = this.removeVietnameseAccents(newSlug);
                                            this.setState((prevState) => ({
                                                update: { ...prevState.update, slug: convertedValue }
                                            }));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Color</Label>
                                </Col>
                                <Col md={9}>
                                <Select
                                    options={colorOptions}
                                    styles={customStyles}
                                    value={this.state.update.color}
                                    onChange={(value) => {
                                        this.setState((prevState) => ({
                                            update: { ...prevState.update, color: value }
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
                <ModalHeader toggle={this.toggleDelete}><span style={{fontWeight: 'bold'}}>Xác nhận xóa câu trả lời nhanh "{this.state.selectedTag?.title}"</span></ModalHeader>

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
  
export default connect(mapStateToProps, mapDispatchToProps)(TagTable);