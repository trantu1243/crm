import { Button, Card, CardFooter, CardHeader, Col, Row, Table } from "reactstrap";
import SweetAlert from 'react-bootstrap-sweetalert';

import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { connect } from "react-redux";
import Loader from "react-loaders";
import StatusBadge from "../../Transactions/Tables/StatusBadge";
import { formatDate } from "../../Transactions/Tables/data";
import { faCheck, faInfoCircle, faMinus, faMoneyBill, faPen, faPlus, faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { getBoxById } from "../../../reducers/boxSlice";
import { confirmTransaction } from "../../../services/transactionService";
import { withRouter } from "../../../utils/withRouter";

class TransactionsTable extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            show: false,
        };
    }

     handleConfirm = async (id, boxId) => {
        try {                    
            const res = await confirmTransaction(id);
            if (res.status) {
                this.props.getBoxById(boxId)
                this.setState({show: false});
            }
        } catch (error) {

        }
    }
    
    render() { 
        const { transactions } = this.props;
        
        return (<Card className="main-card mb-3">
            {this.props.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
                <CardHeader className="mt-2">
                    <a href="/create-transaction" className={"btn btn-sm btn-info me-1 al-min-width-max-content"} style={{minWidth: "max-content", textTransform: "none"}}>
                        Tạo GDTG
                    </a>
                    
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
                    
                        {transactions.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{formatDate(item.createdAt)}</td>
                            <td className="text-center text-muted">{item.bankId.bankCode}</td>
                            <td className="text-center text-muted">{item.amount.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.fee.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.totalAmount.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.bonus.toLocaleString()}</td>
                            <td className="text-center text-muted">{item.content}</td>
                            <StatusBadge status={item.status} />
                            <td className="text-center text-muted"><img width={40} className="rounded-circle" src={item.staffId.avatar} alt={item.staffId.name_staff}/></td>
                            <td className="text-center text-muted"><a href="https://www.messenger.com/t/8681198405321843"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>
                            <td className="text-center text-muted">
                                {item.status === 2 && <>
                                    <button className="btn btn-sm btn-primary me-1" title="Tạo bill thanh khoản">
                                        <FontAwesomeIcon icon={faPlus} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-success me-1" title="Xác nhận giao dịch" onClick={() => this.setState({ show: true })}>
                                        <FontAwesomeIcon icon={faCheck} color="#fff" size="3xs"/>
                                    </button>

                                    <SweetAlert title="Xác nhận giao dịch!"  show={this.state.show}
                                        type="warning" onConfirm={() => {this.handleConfirm(item._id, item.boxId)}}/>
   
                                    <a href={`/transaction/${item._id}`} className="btn btn-sm btn-info me-1" title="Xem chi tiết giao dịch">
                                        <FontAwesomeIcon icon={faPen} color="#fff" size="3xs"/>
                                    </a>
                                </>}
                               
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-danger me-1" title="Hủy">
                                        <FontAwesomeIcon icon={faMinus} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                                {(item.status !== 1) && <>
                                    <button className="btn btn-sm btn-warning me-1" title="Hoàn tác">
                                        <FontAwesomeIcon icon={faUndoAlt} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                
                </CardFooter>
            </>)}
        </Card>)
    }
}

const mapStateToProps = (state) => ({
    transactions: state.box.box ? state.box.box.transactions : [],
    loading: state.box.loading,
});
  
const mapDispatchToProps = {
    getBoxById
};
  
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TransactionsTable));