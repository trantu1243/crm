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
import { Tooltip as ReactTooltip } from "react-tooltip";

import {
    faBell,
    faCopy,
    faInfoCircle,
    faSearch
} from '@fortawesome/free-solid-svg-icons'
import { checkUID } from '../../services/getInfoService';
import CopyToClipboard from 'react-copy-to-clipboard';
import { formatDate } from '../../DemoPages/Transactions/Tables/data';
import { getNoteBoxTransactions } from '../../reducers/boxSlice';

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
        this.props.getNoteBoxTransactions({});
    }

    async getTransactions() {
        try {
            await this.props.getNoteBoxTransactions({});
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
        const { showing } = this.state;
        const { boxes } = this.props;
        return (<>
            {boxes.length > 0 && <>
                <div style={{
                    position: 'fixed',
                    left: '0.75rem',
                    bottom: '1.5rem',
                    zIndex: 10
                }}>
                    <Button
                        id="TooltipDemo2"
                        color="warning"
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            padding: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                        }}
                        onClick={() => this.setState({showing: !showing})}
                    >
                        <FontAwesomeIcon
                            icon={faBell}
                            color="#fff"
                            className="shake-infinite"
                            size="lg" 
                            style={{ width: 22.4, height: 25.59 }}
                        />
                        {boxes.length > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: 7,
                            right: 7,
                            background: 'red',
                            color: 'white',
                            borderRadius: '50%',
                            padding: '2px 6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            minWidth: '20px',
                            textAlign: 'center'
                        }}>
                            {boxes.length}
                        </span>
                        )}
                    </Button>
                </div>
                <UncontrolledTooltip placement="left" target={'TooltipDemo2'}>
                    Có ghi chú chưa hoàn thành
                </UncontrolledTooltip>
            </>}
            <div className={"ui-theme-settings "  + (showing ? 'settings-open' : '')}>
                <Button className="btn-open-options" id="TooltipDemo" color="info" onClick={this.toggle}>
                    <FontAwesomeIcon icon={faSearch} color="#fff" fixedWidth={false} size="2x"/>
                </Button>
                <UncontrolledTooltip placement="left" target={'TooltipDemo'}>
                    Check UID facebook
                </UncontrolledTooltip>
                <div className="theme-settings__inner">
                    <PerfectScrollbar>
                        <div className="theme-settings__options-wrapper">
                            <button 
                                type='button' 
                                className='btn-close'
                                style={{
                                    position: 'fixed',
                                    top: '0.75rem',
                                    right: '0.75rem'
                                }}
                                onClick={() => this.setState({showing: false})}
                            ></button>
                            <h3 className="themeoptions-heading">Các box có ghi chú chưa hoàn thành</h3>
                            <div className='p-2'>
                                <Table responsive hover striped bordered className="align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th className="text-center">Thời gian</th>
                                            <th className="text-center">Tiền trong box</th>
                                            <th className="text-center">Trạng thái</th>
                                            <th className="text-center">#</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    
                                        {boxes.map((item) => {
                                            let rowClass = "";
                                            switch (item.status) {
                                                case 1:
                                                rowClass = "fst-italic"; 
                                                break;
                                                case 2:
                                                rowClass = "text-success"; 
                                                break;
                                                case 3:
                                                rowClass = "al-text-decoration-line-through"; 
                                                break;
                                                case 6:
                                                rowClass = "fw-bold"; 
                                                break;
                                                default:
                                                rowClass = "";
                                            }
                                            return <tr className={rowClass} data-tooltip-id="myTooltip" data-tooltip-content={item.notes.join('; ')}>
                                                <td className="text-center">{formatDate(item.createdAt)}</td>
                                                <td className="text-center">{new Intl.NumberFormat('en-US').format(item.amount)}</td>
                                                <td className="text-center "> 
                                                    {item.status === "active" && <span className={`badge bg-primary`}>đang hoạt động</span>}
                                                    {item.status === "complete" && <span className={`badge bg-success`}>hoàn thành</span>}
                                                    {item.status === "lock" && <span className={`badge bg-danger`}>bị khóa</span>}
                                                </td>
                                                <td>
                                                    <a href={`/box/${item._id}`} className="btn btn-sm btn-light me-1 mb-1" data-tooltip-id="my-tooltip" data-tooltip-content="Xem chi tiết box">
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
                <ReactTooltip
                    id="myTooltip"
                    place="left"
                    style={{
                        fontSize: '16px'
                    }}
                />
            </div>
           
        </>
            
        );
    }
}

const mapStateToProps = state => ({
    boxes: state.box.noteBoxes,
});

const mapDispatchToProps = {
    getNoteBoxTransactions
};

export default connect(mapStateToProps, mapDispatchToProps)(QuickAnswerPopup);
