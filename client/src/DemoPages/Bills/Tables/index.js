import { Button, Card, CardFooter, CardHeader, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";

import React, { Component } from "react";
import StatusBadge from "./StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { getBills, setFilters } from "../../../reducers/billsSlice";
import { connect } from "react-redux";
import { Combobox } from "react-widgets/cjs";
import Loader from "react-loaders";
import PaginationTable from "../../Transactions/Tables/PaginationTable";
import { formatDate } from "../../Transactions/Tables/data";
import { faCheck, faInfoCircle, faMinus, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import { cancelBillService, confirmBillService } from "../../../services/billService";
import { SERVER_URL } from "../../../services/url";
import SweetAlert from 'react-bootstrap-sweetalert';

class BillsTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmBillModal: false,
            confirmBill: null,
            cancelBillModal: false,
            alert: false,
            errorMsg: '',
            cancelBill: null,
        };
    
        this.toggleConfirmBill = this.toggleConfirmBill.bind(this);
        this.toggleCancelBill = this.toggleCancelBill.bind(this);
    }

    componentDidMount() {
        this.props.getBills({});
    }

    toggleConfirmBill() {
        this.setState({
            confirmBillModal: !this.state.confirmBillModal,
        });
    }

    toggleCancelBill() {
        this.setState({
            cancelBillModal: !this.state.cancelBillModal,
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.filters.page !== this.props.filters.page) {
            this.props.getBills(this.props.filters);
        }
        if (prevProps.filters.limit !== this.props.filters.limit) {
            this.props.getBills(this.props.filters);
        }
    }

    handleConfirmBill = async () => {
        try {                  
            this.toggleConfirmBill()  
            const res = await confirmBillService(this.state.confirmBill?._id);
            this.props.getBills(this.props.filters);
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
        }
    }

    handleCancelBill = async () => {
        try {                    
            this.toggleCancelBill();
            const res = await cancelBillService(this.state.cancelBill?._id);
            this.props.getBills(this.props.filters);
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
        }
    }

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
        const { bills } = this.props;
        
        return (<Card className="main-card mb-3">
            {this.props.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
                <CardHeader className="mt-2">
                    <h3 className="text-center w-100">Tổng bill: <span className="text-danger fw-bold">{bills.totalDocs}</span></h3>
                    
                </CardHeader>
                <Table responsive hover striped borderless className="align-middle mb-0">
                    <thead>
                        <tr>
                            <th className="text-center">ID</th>
                            <th className="text-center">Thời gian</th>
                            <th className="text-center">Ngân hàng</th>
                            <th className="text-center">Số tiền</th>
                            <th className="text-center">Tiền tip</th>
                            <th className="text-center">Nội dung</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-center">Nhân viên</th>
                            <th className="text-center">Box</th>
                            <th className="text-center">#</th>

                        </tr>
                    </thead>
                    <tbody>
                    
                        {bills.docs.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{formatDate(item.createdAt)}</td>
                            <td className="text-center text-muted">{item.bankCode}</td>
                            <td className="text-center text-muted">{item.amount.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.bonus.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.content}</td>
                            <StatusBadge status={item.status} />
                            <td className="text-center text-muted"><img className="rounded-circle" src={`${SERVER_URL}${item.staffId.avatar}`} alt={item.staffId.name_staff} style={{width: 40, height: 40, objectFit: 'cover'}} /></td>
                            <td className="text-center text-muted"><a href="https://www.messenger.com/t/8681198405321843"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>
                            <td className="text-center text-muted">
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-success me-1 mb-1" title="Xác nhận giao dịch" onClick={() => {this.setState({ confirmBill: item }); this.toggleConfirmBill()}}>
                                        <FontAwesomeIcon icon={faCheck} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                                <a href={`/bill/${item._id}`} className="btn btn-sm btn-info me-1 mb-1" title="Xem chi tiết giao dịch">
                                    <FontAwesomeIcon icon={faMoneyBill} color="#fff" size="3xs"/>
                                </a>
                                <a href={`/box/${item.boxId}`} className="btn btn-sm btn-light me-1 mb-1" title="Xem chi tiết box">
                                    <FontAwesomeIcon icon={faInfoCircle} color="#000" size="3xs"/>
                                </a>
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-danger me-1 mb-1" title="Huỷ giao dịch" onClick={() => {this.setState({ cancelBill: item }); this.toggleCancelBill()}}>
                                        <FontAwesomeIcon icon={faMinus} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                    <Row>
                        <Col md={11}>
                            <PaginationTable
                                totalPages={bills.totalPages}
                                currentPage={bills.page}
                                hasPrevPage={bills.hasPrevPage}
                                hasNextPage={bills.hasNextPage}
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
            </>)}
            <Modal isOpen={this.state.confirmBillModal} toggle={this.toggleConfirmBill} className={this.props.className}>
                <ModalHeader toggle={this.toggleConfirmBill}><span style={{fontWeight: 'bold'}}>Xác nhận bill</span></ModalHeader>
                <ModalBody>
                    Số tài khoản: {this.state.confirmBill?.stk} <br />
                    Ngân hàng: {this.state.confirmBill?.bankCode} <br />
                    Số tiền: <span className="fw-bold text-danger">{this.state.confirmBill?.amount.toLocaleString()} vnd</span><br />
                    Cho: {this.state.confirmBill?.typeTransfer === 'buyer' ? "Người bán" : "Người mua"}
                </ModalBody>

                <ModalFooter>
                    <Button color="link" onClick={this.toggleConfirmBill}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={this.handleConfirmBill}>
                        Xác nhận
                    </Button>{" "}
                </ModalFooter>
            </Modal>
            <Modal isOpen={this.state.cancelBillModal} toggle={this.toggleCancelBill} className={this.props.className}>
                <ModalHeader toggle={this.toggleCancelBill}><span style={{fontWeight: 'bold'}}>Huỷ bill</span></ModalHeader>
                <ModalBody>
                    Số tài khoản: {this.state.cancelBill?.stk} <br />
                    Ngân hàng: {this.state.cancelBill?.bankCode} <br />
                    Số tiền: <span className="fw-bold text-danger">{this.state.cancelBill?.amount.toLocaleString()} vnd</span><br />
                    Cho: {this.state.cancelBill?.typeTransfer === 'buyer' ? "Người bán" : "Người mua"}
                </ModalBody>

                <ModalFooter>
                    <Button color="link" onClick={this.toggleCancelBill}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={this.handleCancelBill}>
                        Xác nhận
                    </Button>{" "}
                </ModalFooter>
            </Modal>
            <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                type="error" onConfirm={() => this.setState({alert: false})}/>
        </Card>)
    }
}

const mapStateToProps = (state) => ({
    bills: state.bills.bills,
    loading: state.bills.loading,
    filters: state.bills.filters,
});
  
const mapDispatchToProps = {
    getBills,
    setFilters
};
  
export default connect(mapStateToProps, mapDispatchToProps)(BillsTable);