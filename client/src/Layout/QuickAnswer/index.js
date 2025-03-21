import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
    Button, ListGroup, ListGroupItem,
    UncontrolledTooltip
} from 'reactstrap';

import PerfectScrollbar from 'react-perfect-scrollbar';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {
    faComment,
    faCopy
} from '@fortawesome/free-solid-svg-icons'
import { fetchQuickAnswers } from '../../services/quickAnswer.service';
import CopyToClipboard from 'react-copy-to-clipboard';

class QuickAnswerPopup extends Component {

    constructor(props) {
        super(props);

        this.state = {
            quickAnswers: []
        };

    }

    componentDidMount() {
        this.getQuickAnswers();
    }

    getQuickAnswers = async () => {
        const res = await fetchQuickAnswers();
        this.setState({quickAnswers: res.quickAnswers});
    }

    state = {
        showing: false
    };

    render() {

        const { showing, quickAnswers } = this.state;

        return (
            <div className={"ui-theme-settings " + (showing ? 'settings-open' : '')}>
                <Button className="btn-open-options" id="TooltipDemo" color="info" onClick={() => this.setState({showing: !showing})}>
                    <FontAwesomeIcon icon={faComment} color="#fff" fixedWidth={false} size="2x"/>
                </Button>
                <UncontrolledTooltip placement="left" target={'TooltipDemo'}>
                    Câu trả lời nhanh
                </UncontrolledTooltip>
                <div className="theme-settings__inner">
                    <PerfectScrollbar>
                        <div className="theme-settings__options-wrapper">
                            <h3 className="themeoptions-heading">Các câu trả lời nhanh</h3>
                            <ListGroup>
                                {quickAnswers.map((item, key) => {
                                    return <ListGroupItem>
                                    <div className="widget-content p-0">
                                        <div className="widget-content-wrapper">
                                            
                                            <div className="widget-content-left">
                                                <div className="widget-heading">
                                                    {item.title}
                                                </div>
                                                <div className="widget-subheading">
                                                {item.content.length > 50 ? item.content.slice(0, 50) + "..." : item.content}
                                                </div>
                                            </div>

                                            <div className="widget-content-right" >
                                                <CopyToClipboard text={item.content}>
                                                    <Button type='button' color='primary'>
                                                        <FontAwesomeIcon icon={faCopy}/>
                                                    </Button>
                                                </CopyToClipboard>
                                                
                                            </div>
                                        </div>
                                    </div>
                                </ListGroupItem>
                                })}
                            </ListGroup>
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(QuickAnswerPopup);
