import { Button, Card, CardFooter, CardHeader, Col, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import Select from "react-select";

import React, { Component } from "react";
import StatusBadge from "./StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { getBills, getBillsNoLoad, searchBills, searchBillsNoload, setFilters } from "../../../reducers/billsSlice";
import { connect } from "react-redux";
import { Combobox } from "react-widgets/cjs";
import Loader from "react-loaders";
import PaginationTable from "../../Transactions/Tables/PaginationTable";
import { formatDate } from "../../Transactions/Tables/data";
import { faCheck, faExclamationTriangle, faInfoCircle, faLock, faMinus, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
import { cancelBillService, confirmBillService } from "../../../services/billService";
import { SERVER_URL } from "../../../services/url";
import SweetAlert from 'react-bootstrap-sweetalert';
import { banks } from "./data";

const statusList = [
    { value: 0, name: "Tất cả" },
    { value: 1, name: "Đang xử lý" },
    { value: 2, name: "Thành công" },
    { value: 3, name: "Hủy" },
    { value: 4, name: "Có ghi chú chưa hoàn thành" },
    { value: 5, name: "Box bị khóa" },
];

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
            search: '',
            loading: false,
            status: '',
        };
    
        this.toggleConfirmBill = this.toggleConfirmBill.bind(this);
        this.toggleCancelBill = this.toggleCancelBill.bind(this);
    }

    componentDidMount() {
        this.props.getBills({});
    }

    toggleConfirmBill = () => {
        this.setState((prevState) => ({
            confirmBillModal: !prevState.confirmBillModal
        }), () => {
            if (this.state.confirmBillModal) {
                document.addEventListener("keydown", this.handleKeyDown);
            } else {
                document.removeEventListener("keydown", this.handleKeyDown);
            }
        });
    };

    toggleCancelBill = () => {
        this.setState((prevState) => ({
            cancelBillModal: !prevState.cancelBillModal
        }), () => {
            if (this.state.cancelBillModal) {
                document.addEventListener("keydown", this.handleKeyDown);
            } else {
                document.removeEventListener("keydown", this.handleKeyDown);
            }
        });
    };

    handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (this.state.confirmBillModal) {
                this.handleConfirmBill();
            } else if (this.state.cancelBillModal) {
                this.handleCancelBill();
            }
        }
    };

    componentDidUpdate(prevProps) {
        if (prevProps.filters.page !== this.props.filters.page) {
            this.props.getBills(this.props.filters);
        }
        if (prevProps.filters.limit !== this.props.filters.limit) {
            if (this.state.search) {
                this.props.searchBills({
                    search: this.state.search, 
                    page: this.props.filters.page, 
                    limit: this.props.filters.limit
                })
            } else this.props.getBills(this.props.filters);
        }
    }

    handleConfirmBill = async () => {
        try {    
            this.setState({loading: true});              
            await confirmBillService(this.state.confirmBill?._id);
            this.props.getBillsNoLoad(this.props.filters);
            
            this.toggleConfirmBill()  
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.toggleConfirmBill()
            this.setState({loading: false});
        }
    }

    handleCancelBill = async () => {
        try {     
            this.setState({loading: true}); 
            await cancelBillService(this.state.cancelBill?._id);
            this.props.getBillsNoLoad(this.props.filters);
            this.toggleCancelBill();
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.toggleCancelBill()
            this.setState({loading: false});
        }
    }

    handleSearch = async (e) => {
        try {
             await this.props.setFilters({
                ...this.props.filters,
                status: [], 
                hasNotes: false,
                isLocked: false,
                search: this.state.search,
                page: 1
            });
            await this.props.getBills(this.props.filters);
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
        }
    }

    handleStatus = async (value) => {
        try {
            if (value === 0) {
                await this.props.setFilters({
                    ...this.props.filters,
                    status: [], 
                    hasNotes: false,
                    isLocked: false,
                    search: '',
                    page: 1
                });
            } else if (value === 4) {
                await this.props.setFilters({
                    ...this.props.filters,
                    status: [], 
                    isLocked: false,
                    hasNotes: true, 
                    search: '',
                    page: 1
                });
            } else if (value === 5) {
                await this.props.setFilters({
                    ...this.props.filters,
                    status: [], 
                    hasNotes: false, 
                    isLocked: true,
                    search: '',
                    page: 1
                });
            } else {
                await this.props.setFilters({
                    ...this.props.filters,
                    status: [value], 
                    hasNotes: false, 
                    isLocked: false,
                    search: '',
                    page: 1
                });
            } 
            await this.props.getBills(this.props.filters);
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

        const amount = bills.docs.reduce((sum, item) => {
            return sum + item.amount;
        }, 0);

        const bonus = bills.docs.reduce((sum, item) => {
            return sum + item.bonus;
        }, 0);
        
        return (<Card className="main-card mb-3">
            {this.props.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
                <CardHeader className="mt-2">
                    <h3 className="text-center w-100">Tổng bill: <span className="text-danger fw-bold">{bills.totalDocs}</span></h3>
                    <div>
                        <Input
                            name="search"
                            value={this.state.search}
                            placeholder="Tìm kiếm"
                            onChange={(e) => this.setState({search: e.target.value})}
                            onKeyDown={(e) => e.key === "Enter" && this.handleSearch(e)}
                        />
                    </div>
                </CardHeader>
                <Table responsive hover striped bordered className="align-middle mb-0">
                    <thead>
                        <tr>
                            <th className="text-center">ID</th>
                            <th className="text-center">Thời gian</th>
                            <th className="text-center">Ngân hàng</th>
                            <th className="text-center">Số tiền</th>
                            <th className="text-center">Tiền tip</th>
                            <th className="text-center">Nội dung</th>
                            <th className="text-center" style={{ width: "160px" }}>
                                <Select
                                    value={statusList
                                        .map(option => ({ value: option.value, label: option.name }))
                                        .find(option => option.value === this.state.status) || null}
                                    onChange={selected => {
                                        this.setState(prevState => ({ status: selected?.value }))
                                        this.handleStatus(selected?.value)
                                    }}
                                    options={statusList.map(option => ({
                                        value: option.value,
                                        label: option.name
                                    }))}
                                    placeholder="Trạng thái ..."
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            width: 150,
                                            minHeight: 30
                                        }),
                                        menuPortal: base => ({ ...base, zIndex: 9999 })
                                    }}
                                    menuPortalTarget={document.body}
                                />
                            </th>
                            <th className="text-center">Nhân viên</th>
                            <th className="text-center">Box</th>
                            <th className="text-center">#</th>

                        </tr>
                    </thead>
                    <tbody>
                    
                        {bills.docs.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{formatDate(item.createdAt)}</td>
                            <td
                                className="text-center"
                                title={item.stk}
                                onClick={() => {
                                    navigator.clipboard.writeText(item.stk);
                                }}
                            >
                                {banks.find(b => b.bankCode === item.bankCode).bankName}
                            </td>
                            <td className="text-center text-muted">{new Intl.NumberFormat('en-US').format(item.amount)}</td>
                            <td className="text-center text-muted">{new Intl.NumberFormat('en-US').format(item.bonus)}</td>
                            <td className="text-center text-muted">{item.content}</td>
                            <td className="text-center "> 
                                <StatusBadge status={item.status} />
                                {item.boxId.notes.length > 0 && <>&nbsp;
                                <FontAwesomeIcon color="#d92550" title="Có ghi chú chưa hoàn thành" icon={faExclamationTriangle}>
                                </FontAwesomeIcon>
                                </>}
                                {item.boxId.status === 'lock' && <>&nbsp;
                                <FontAwesomeIcon color="#d92550" title="Box bị khóa" icon={faLock}>
                                </FontAwesomeIcon>
                                </>}
                            </td> 
                            <td className="text-center text-muted"><img className="rounded-circle" title={item.staffId.name_staff} src={`${SERVER_URL}${item.staffId.avatar ? item.staffId.avatar : '/images/avatars/avatar.jpg'}`} alt={item.staffId.name_staff} style={{width: 40, height: 40, objectFit: 'cover'}} /></td>
                            <td className="text-center"><a href={`https://www.messenger.com/t/${item.boxId.messengerId}`} rel="noreferrer" target="_blank"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>
                            <td className="text-center text-muted">
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-success me-1 mb-1" title="Xác nhận giao dịch" onClick={() => {this.setState({ confirmBill: item }); this.toggleConfirmBill()}}>
                                        <FontAwesomeIcon icon={faCheck} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                                <a href={`/bill/${item._id}`} className="btn btn-sm btn-info me-1 mb-1" title="Xem chi tiết giao dịch">
                                    <FontAwesomeIcon icon={faMoneyBill} color="#fff" size="3xs"/>
                                </a>
                                <a href={`/box/${item.boxId._id}`} className="btn btn-sm btn-light me-1 mb-1" title="Xem chi tiết box">
                                    <FontAwesomeIcon icon={faInfoCircle} color="#000" size="3xs"/>
                                </a>
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-danger me-1 mb-1" title="Huỷ giao dịch" onClick={() => {this.setState({ cancelBill: item }); this.toggleCancelBill()}}>
                                        <FontAwesomeIcon icon={faMinus} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                            </td>
                        </tr>)}
                        <tr className="fw-bold">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-center">{new Intl.NumberFormat('en-US').format(amount)}</td>
                            <td className="text-center">{new Intl.NumberFormat('en-US').format(bonus)}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
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
                    Số tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.state.confirmBill?.amount)} vnd</span><br />
                    Cho: {this.state.confirmBill?.typeTransfer === 'buyer' ? "Người bán" : "Người mua"}
                </ModalBody>

                <ModalFooter>
                    <Button color="link" onClick={this.toggleConfirmBill}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={this.handleConfirmBill} disabled={this.state.loading}>
                        {this.state.loading ? "Đang xác nhận..." : "Xác nhận"}
                    </Button>{" "}
                </ModalFooter>
            </Modal>
            <Modal isOpen={this.state.cancelBillModal} toggle={this.toggleCancelBill} className={this.props.className}>
                <ModalHeader toggle={this.toggleCancelBill}><span style={{fontWeight: 'bold'}}>Huỷ bill</span></ModalHeader>
                <ModalBody>
                    Số tài khoản: {this.state.cancelBill?.stk} <br />
                    Ngân hàng: {this.state.cancelBill?.bankCode} <br />
                    Số tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.state.cancelBill?.amount)} vnd</span><br />
                    Cho: {this.state.cancelBill?.typeTransfer === 'buyer' ? "Người bán" : "Người mua"}
                </ModalBody>

                <ModalFooter>
                    <Button color="link" onClick={this.toggleCancelBill}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={this.handleCancelBill} disabled={this.state.loading}>
                        {this.state.loading ? "Đang xác nhận..." : "Xác nhận"}
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
    getBillsNoLoad,
    setFilters,
    searchBills,
    searchBillsNoload
};
  
export default connect(mapStateToProps, mapDispatchToProps)(BillsTable);