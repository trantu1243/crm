import { Button, Card, CardFooter, CardHeader, Col, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { formatDate } from "./data";
import StatusBadge from "./StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { getTransactions, setFilters } from "../../../reducers/transactionsSlice";
import { connect } from "react-redux";
import TransactionsPagination from "./PaginationTable";
import { Combobox } from "react-widgets/cjs";
import Loader from "react-loaders";

class TransactionsTable extends Component {
    componentDidMount() {
        this.props.getTransactions({});
    }
    componentDidUpdate(prevProps) {
        if (prevProps.filters.page !== this.props.filters.page) {
            this.props.getTransactions(this.props.filters);
        }
        if (prevProps.filters.limit !== this.props.filters.limit) {
            this.props.getTransactions(this.props.filters);
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
        const { transactions } = this.props;
        
        return (<Card className="main-card mb-3">
            {this.props.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
                <CardHeader className="mt-2">
                    <Button className={"btn btn-sm btn-info me-1 al-min-width-max-content"} style={{minWidth: "max-content"}}>
                        + Tạo GDTG
                    </Button>
                    <h3 className="text-center w-100">Tổng số GD: <span className="text-danger fw-bold">{transactions.totalDocs}</span></h3>
                    
                </CardHeader>
                <Table responsive hover striped borderless className="align-middle mb-0">
                    <thead>
                        <tr>
                            <th className="text-center">ID</th>
                            <th className="text-center">Thời gian</th>
                            <th className="text-center">Ngân hàng</th>
                            <th className="text-center">Số tiền</th>
                            <th className="text-center">Phí</th>
                            <th className="text-center">Tổng tiền</th>
                            <th className="text-center">Tiền tip</th>
                            <th className="text-center">Nội dung</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-center">Nhân viên</th>
                            <th className="text-center">Box</th>
                            <th className="text-center">#</th>

                        </tr>
                    </thead>
                    <tbody>
                    
                        {transactions.docs.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{formatDate(item.createdAt)}</td>
                            <td className="text-center text-muted">{item.bankId.bankCode}</td>
                            <td className="text-center text-muted">{item.amount.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.fee.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.totalAmount.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.bonus.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.content}</td>
                            <StatusBadge status={item.status} />
                            <td><img width={40} className="rounded-circle" src={item.staffId.avatar} alt={item.staffId.name_staff}/></td>
                            <td><a href="https://www.messenger.com/t/8681198405321843"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>

                        </tr>)}
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                    <Row>
                        <Col md={11}>
                            <TransactionsPagination
                                totalPages={transactions.totalPages}
                                currentPage={transactions.page}
                                hasPrevPage={transactions.hasPrevPage}
                                hasNextPage={transactions.hasNextPage}
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
    transactions: state.transactions.transactions,
    loading: state.transactions.loading,
    filters: state.transactions.filters,
});
  
const mapDispatchToProps = {
    getTransactions,
    setFilters
};
  
export default connect(mapStateToProps, mapDispatchToProps)(TransactionsTable);