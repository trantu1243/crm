import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    UncontrolledTooltip
} from 'reactstrap';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {
    faCopy,
    faSearch
} from '@fortawesome/free-solid-svg-icons'
import { checkUID } from '../../services/getInfoService';
import CopyToClipboard from 'react-copy-to-clipboard';

class QuickAnswerPopup extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            loading: false,
            link: '',
            id: ''
        };

        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
    
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
        return (
            <div className={"ui-theme-settings " }>
                <Button className="btn-open-options" id="TooltipDemo" color="info" onClick={this.toggle}>
                    <FontAwesomeIcon icon={faSearch} color="#fff" fixedWidth={false} size="2x"/>
                </Button>
                <UncontrolledTooltip placement="left" target={'TooltipDemo'}>
                    Check UID facebook
                </UncontrolledTooltip>
                <div className="theme-settings__inner">
                    
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
