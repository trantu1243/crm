import { Button, Card, CardFooter, CardHeader, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import SweetAlert from 'react-bootstrap-sweetalert';

import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { connect } from "react-redux";
import Loader from "react-loaders";
import StatusBadge from "../../Transactions/Tables/StatusBadge";
import { formatDate } from "../../Transactions/Tables/data";
import { faCheck, faInfoCircle, faMinus, faMoneyBill, faPen, faPlus, faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { getBoxById, undoBox } from "../../../reducers/boxSlice";
import { confirmTransaction } from "../../../services/transactionService";
import { withRouter } from "../../../utils/withRouter";

class TransactionsTable extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            show: false,
            undoModal: false,
            confirmTransactionModal: false,
            confirmTransaction: null,
        };

        this.toggleUndo = this.toggleUndo.bind(this);
        this.toggleConfirmTransaction = this.toggleConfirmTransaction.bind(this);
    }

    toggleUndo() {
        this.setState({
            undoModal: !this.state.undoModal,
        });
    }

    toggleConfirmTransaction() {
        this.setState({
            confirmTransactionModal: !this.state.confirmTransactionModal,
        });
    }

    handleConfirm = async (id, boxId) => {
       
    }

    handleUndo = async () => {
        this.toggleUndo()    
        await this.props.undoBox(this.props.boxId)
        await this.props.getBoxById(this.props.boxId)
    }

    handleConfirmTransaction = async () => {
        try {          
            this.toggleConfirmTransaction();          
            const res = await confirmTransaction(this.state.confirmTransaction._id);
            if (res.status) {
                this.props.getBoxById(this.props.boxId)
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
                                {item.status === 6 && <>
                                    <button className="btn btn-sm btn-primary me-1" title="Tạo bill thanh khoản">
                                        <FontAwesomeIcon icon={faPlus} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                                {item.status === 1 && <>
                                    <button className="btn btn-sm btn-success me-1" title="Xác nhận giao dịch" onClick={() => {this.setState({confirmTransaction: item}); this.toggleConfirmTransaction()}}>
                                        <FontAwesomeIcon icon={faCheck} color="#fff" size="3xs"/>
                                    </button>
   
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
                                    <button className="btn btn-sm btn-warning me-1" title="Hoàn tác" onClick={this.toggleUndo}>
                                        <FontAwesomeIcon icon={faUndoAlt} color="#fff" size="3xs"/>
                                    </button>
                                </>}
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                
                </CardFooter>
                <Modal isOpen={this.state.undoModal} toggle={this.toggleUndo} className={this.props.className}>
                    <ModalHeader toggle={this.toggleUndo}><span style={{fontWeight: 'bold'}}>Xác nhận hoàn tác box</span></ModalHeader>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleUndo}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleUndo}>
                            Xác nhận
                        </Button>{" "}
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.confirmTransactionModal} toggle={this.toggleConfirmTransaction} className={this.props.className}>
                    <ModalHeader toggle={this.toggleConfirmTransaction}><span style={{fontWeight: 'bold'}}>Xác nhận bill</span></ModalHeader>
                    <ModalBody>
                        Số tài khoản: {this.state.confirmTransaction?.bankId.bankAccount} <br />
                        Ngân hàng: {this.state.confirmTransaction?.bankId.bankName} <br />
                        Chủ tài khoản: {this.state.confirmTransaction?.bankId.bankAccountName} <br />
                        Số tiền: <span className="fw-bold text-danger">{this.state.confirmTransaction?.totalAmount.toLocaleString()} vnd</span><br />
        
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleConfirmTransaction}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleConfirmTransaction}>
                            Xác nhận
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </>)}
        </Card>)
    }
}

const mapStateToProps = (state) => ({
    transactions: state.box.box ? state.box.box.transactions : [],
    loading: state.box.loading,
    boxId: state.box.box ? state.box.box._id : '',
});
  
const mapDispatchToProps = {
    getBoxById,
    undoBox
};
  
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TransactionsTable));