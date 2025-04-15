import { Button, Card, CardFooter, CardHeader, Col, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, PaginationItem, PaginationLink, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from "react-loaders";
import { Combobox } from "react-widgets/cjs";
import SweetAlert from 'react-bootstrap-sweetalert';
import { fetchCustomer } from "../../../services/customerService";
import { findColorByValue } from "../../Tag/Tables";
import Select from "react-select";
import { fetchTags } from "../../../services/tagService";

const DropdownIndicator = () => null;
const ClearIndicator = () => null;
const IndicatorSeparator = () => null;

const customStyles = {
    multiValue: (styles, { data }) => ({
        ...styles,
        backgroundColor: data.color, 
        color: "white",
        borderRadius: '5px'
    }),
    multiValueLabel: (styles) => ({
        ...styles,
        color: "white",
    }),
    option: (styles, { data, isFocused, isSelected }) => ({
        ...styles,
        color: data.color,
        cursor: "pointer",
    }),
};

class CustomerTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            createLoading: false,
            createModal: false,
            customerId: null,
            customers: [],
            permissions: [],
            alert: false,
            errorMsg: '',
            tags: [],
            input: {
                tags: [],
                facebookIds: ''
            },
        };

        this.toggleCreate = this.toggleCreate.bind(this);

    }

    componentDidMount() {
        this.getCustomers();
        this.getTags();
    }

    getCustomers = async () => {
        this.setState({loading: true});
        const res = await fetchCustomer();
        console.log(res);
        this.setState({customers: res.data.docs, loading: false});
    }

    getTags = async () => {
        const res = await fetchTags();
        this.setState({
            tags: res.tags.map(item => ({
                label: item.name,
                value: item._id,
                color: findColorByValue(item.color)
            }))
        });
    }

    toggleCreate() {
        this.setState({
            createModal: !this.state.createModal,
        });
    }

    render() { 
        return (<Card className="main-card mb-3">
            {this.state.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
                <CardHeader className="mt-2">
                    <Button color="info" className="me-1 al-min-width-max-content" style={{minWidth: 'max-content', textTransform: 'none'}} onClick={this.toggleCreate}>
                        Gắn tag
                    </Button>
                    <Modal isOpen={this.state.createModal} toggle={this.toggleCreate} className="modal-lg" style={{marginTop: '10rem'}}>
                        <ModalHeader toggle={this.toggleCreate}>Gắn tag</ModalHeader>
                        <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.createLoading && this.handleSubmit(e)}>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>Tags</Label>
                                </Col>
                                <Col md={9}>
                                    <Select
                                        isMulti
                                        options={this.state.tags}
                                        styles={customStyles}
                                        value={this.state.input.tags}
                                        onChange={(value) => {
                                            this.setState((prevState) => ({
                                                input: { ...prevState.input, tags: value }
                                            }));
                                        }}
                                        placeholder="Tags ..."
                                        components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }} 
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-4">
                                <Col md={3}>
                                    <Label>FB ID (ngăn cách bằng dấu xuống dòng)</Label>
                                </Col>
                                <Col md={9}>
                                    <textarea 
                                        rows={5} 
                                        className="form-control" 
                                        value={this.state.input.facebookIds}
                                        onChange={(e)=>{
                                            this.setState((prevState) => ({
                                                input: { ...prevState.input, facebookIds: e.target.value }
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
                                {this.state.createLoading ? "Đang lưu..." : "Lưu"}
                            </Button>{" "}
                        </ModalFooter>
                    </Modal>
                </CardHeader>
                <Table responsive hover striped borderless className="align-middle mb-0">
                    <thead>
                        <tr>
                            <th className="text-center">Facebook ID</th>
                            <th className="text-center">Tên</th>
                            <th className="text-center">Số GD bên mua thành công</th>
                            <th className="text-center">Số GD bên mua hủy</th>
                            <th className="text-center">Số GD bên bán thành công</th>
                            <th className="text-center">Số GD bên bán hủy</th>
                            <th className="text-center">Tags</th>
                            <th className="text-center">#</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.customers.map((item) => <tr>
                            <td className="text-center text-muted">{item.facebookId}</td>
                            <td className="text-center text-muted">{item.nameCustomer}</td>
                            <td className="text-center text-muted">{item.buyerCount.success}</td>
                            <td className="text-center text-muted">{item.buyerCount.cancel}</td>
                            <td className="text-center text-muted">{item.sellerCount.success}</td>
                            <td className="text-center text-muted">{item.sellerCount.cancel}</td>
                            <td className="text-center text-muted">
                                {item.tags.map((tag) => <>
                                    <span 
                                        className={`badge`} 
                                        style={{backgroundColor: findColorByValue(tag.color)}}
                                    >{tag.name}</span>&nbsp;
                                </>
                                )}
                            </td>
                            <td className="text-center text-muted">
                                
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

            <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                type="error" onConfirm={() => this.setState({alert: false})}/>
        </Card>)
    }
}

const mapStateToProps = (state) => ({
});
  
const mapDispatchToProps = {

};
  
export default connect(mapStateToProps, mapDispatchToProps)(CustomerTable);