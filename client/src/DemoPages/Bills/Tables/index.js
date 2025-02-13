import { Button, Card, CardFooter, CardHeader, Col, Row, Table } from "reactstrap";

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
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

class BillsTable extends Component {
    componentDidMount() {
        this.props.getBills({});
    }
    componentDidUpdate(prevProps) {
        if (prevProps.filters.page !== this.props.filters.page) {
            this.props.getBills(this.props.filters);
        }
        if (prevProps.filters.limit !== this.props.filters.limit) {
            this.props.getBills(this.props.filters);
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
                            <td className="text-center text-muted"><img width={40} className="rounded-circle" src={item.staffId.avatar} alt={item.staffId.name_staff}/></td>
                            <td className="text-center text-muted"><a href="https://www.messenger.com/t/8681198405321843"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>
                            <td className="text-center text-muted">
                                <a href={`/box/${item.boxId}`} className="btn btn-sm btn-light">
                                    <FontAwesomeIcon icon={faInfoCircle} color="#000" size="3xs"/>
                                </a>
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