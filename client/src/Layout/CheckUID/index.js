import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Table,
    UncontrolledTooltip
} from 'reactstrap';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PerfectScrollbar from 'react-perfect-scrollbar';

import {
    faBell,
    faCopy,
    faExclamationTriangle,
    faInfoCircle,
    faLock,
    faSearch
} from '@fortawesome/free-solid-svg-icons'
import { checkUID } from '../../services/getInfoService';
import CopyToClipboard from 'react-copy-to-clipboard';
import { fetchTransactions } from '../../services/transactionService';
import StatusBadge from '../../DemoPages/Transactions/Tables/StatusBadge';
import { formatDate } from '../../DemoPages/Transactions/Tables/data';

class QuickAnswerPopup extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            loading: false,
            link: '',
            id: '',
            transactions: []
        };

        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        this.getTransactions()
    }

    async getTransactions() {
        try {
            const res = await fetchTransactions({page: 1, limit: 10, hasNotes: true})
            this.setState({transactions: res.data.docs})
        } catch (e) {

        }
    }

    toggle() {
        this.setState({
            modal: !this.state.modal,
        });
    }

    state = {
        showing: false
    };

    checkUIDFacebook = async () => {
        try {
            this.setState({loading: true});
            const data = await checkUID({ link: this.state.link })
            if (data.data.id) {
                this.setState({id: data.data.id});
            }
            this.setState({loading: false});
        } catch (error) {
            console.log(error);
            this.setState({loading: false});
        }
    }

    render() {
        const {showing} = this.state;
        return (
            <div className={"ui-theme-settings "  + (showing ? 'settings-open' : '')}>
                <Button className="btn-open-options" id="TooltipDemo" color="info" onClick={this.toggle}>
                    <FontAwesomeIcon icon={faSearch} color="#fff" fixedWidth={false} size="2x"/>
                </Button>
                <UncontrolledTooltip placement="left" target={'TooltipDemo'}>
                    Check UID facebook
                </UncontrolledTooltip>
                {/* {this.state.transactions.length > 0 && <>
                    <Button className="btn-open-options" id="TooltipDemo2" color="warning" style={{left: -110, top: 100}} onClick={() => this.setState({showing: !showing})}>
                        <FontAwesomeIcon icon={faBell} color="#fff" fixedWidth={false} size="2x" style={{paddingLeft: 2}}/>
                    </Button>
                    <UncontrolledTooltip placement="left" target={'TooltipDemo2'}>
                        Có ghi chú chưa hoàn thành
                    </UncontrolledTooltip>
                </>} */}
                <div className="theme-settings__inner">
                    <PerfectScrollbar>
                        <div className="theme-settings__options-wrapper">
                            <h3 className="themeoptions-heading">Các GDTG có ghi chú chưa hoàn thành</h3>
                            <div className='p-2'>
                                <Table responsive hover striped bordered className="align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th className="text-center">Thời gian</th>
                                            <th className="text-center">Số tiền</th>
                                            <th className="text-center">Phí</th>
                                            <th className="text-center">Tổng tiền</th>
                                            <th className="text-center">Trạng thái</th>
                                            <th className="text-center">#</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                    
                                        {this.state.transactions.map((item) => {
                                            let rowClass = "";
                                            switch (item.status) {
                                                case 1:
                                                rowClass = "fst-italic"; // in nghiêng
                                                break;
                                                case 2:
                                                rowClass = "text-success"; // chữ màu xanh lá
                                                break;
                                                case 3:
                                                rowClass = "al-text-decoration-line-through"; // gạch ngang
                                                break;
                                                case 6:
                                                rowClass = "fw-bold"; // in đậm
                                                break;
                                                default:
                                                rowClass = "";
                                            }
                                            return <tr className={rowClass}>
                                                <td className="text-center">{formatDate(item.createdAt)}</td>
                                                <td className="text-center">{new Intl.NumberFormat('en-US').format(item.amount)}</td>
                                                <td className="text-center">{new Intl.NumberFormat('en-US').format(item.fee)}</td>
                                                <td className="text-center">{new Intl.NumberFormat('en-US').format(item.totalAmount)}</td>
                                              
                                                <td className="text-center "> 
                                                    <StatusBadge status={item.status} />
                                                    {item.boxId.notes?.length > 0 && <>&nbsp;
                                                    <FontAwesomeIcon color="#d92550" data-tooltip-id="my-tooltip" data-tooltip-content="Có ghi chú chưa hoàn thành" icon={faExclamationTriangle}>
                                                    </FontAwesomeIcon></>}
                                                    {item.boxId.status === 'lock' && <>&nbsp;
                                                    <FontAwesomeIcon color="#d92550" data-tooltip-id="my-tooltip" data-tooltip-content="Box bị khóa" icon={faLock}>
                                                    </FontAwesomeIcon></>}
                                                </td>
                                                <td>
                                                    <a href={`/box/${item.boxId._id}`} className="btn btn-sm btn-light me-1 mb-1" data-tooltip-id="my-tooltip" data-tooltip-content="Xem chi tiết box">
                                                        <FontAwesomeIcon icon={faInfoCircle} color="#000" size="3xs"/>
                                                    </a>
                                                </td>
                                            </tr>})}
                                        
                                    </tbody>
                                </Table>
                            </div>
                            
                        </div>
                    </PerfectScrollbar>
                </div>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggleCancel}><span style={{fontWeight: 'bold'}}>Check UID Facebook</span></ModalHeader>
                    <ModalBody>
                        <Input
                            type="text"
                            name="link"
                            id="link"
                            value={this.state.link}
                            placeholder='Nhập link Facebook...'
                            onChange={(e) => {
                                this.setState({ 
                                    link: e.target.value.trim()
                                });
                            }}
                        />
                        {this.state.id && <div className="card-border mt-1 mb-1 card border-primary p-2">
                            <h6 className='m-0'>UID:&nbsp;
                                <span class="fw-bold text-danger"><span>{this.state.id}</span></span>
                                <CopyToClipboard text={this.state.id}>
                                    <button type="button" class="btn btn-success">
                                        <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                                    </button>
                                </CopyToClipboard>
                            </h6>
                        </div>}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.toggle}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.checkUIDFacebook} disabled={this.state.loading}>
                            {this.state.loading ? "Đang kiểm tra..." : "Kiểm tra"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(QuickAnswerPopup);
