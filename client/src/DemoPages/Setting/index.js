import React, { Component, Fragment } from "react";

import { Button, ButtonGroup, Card, CardBody, CardTitle, Col, Container, FormText, Input, InputGroup, Label, ListGroup, ListGroupItem } from "reactstrap";
import Select from "react-select";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import { connect } from "react-redux";
import cx from "classnames";

import SweetAlert from 'react-bootstrap-sweetalert';
import CopyToClipboard from "react-copy-to-clipboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";
import StatusBadge from "../Transactions/Tables/StatusBadge";
import { addGDTGAccount, fetchSettings, removeGDTGAccount, updateSetting, updateToken } from "../../services/settingService";
import { SERVER_URL } from "../../services/url";

class Setting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMobile: window.innerWidth < 768,
            value: [],
            loading: false,
            alert: false,
            errorMsg: '',
            profiles: [],
            id: '',
            input: {
                cookie: '',
                accessToken: '',
                proxy: '',
                proxy_auth: ''
            },
        };
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateScreenSize);
        this.getSetting()
    }

    componentDidUpdate(prevProps) {
        
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }

    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 576 });
    };

    getSetting = async () => {
        const data = await fetchSettings();
        this.setState({ 
            input: {
                cookie: data.data.cookie.value,
                accessToken: data.data.accessToken.value,
                proxy: data.data.proxy.proxy,
                proxy_auth: data.data.proxy.proxy_auth,
            },
            profiles: data.data.uuidFbs
        })
    }

    handleClick = () => {
        this.setState((prevState) => ({
            input: {
                ...prevState.input,
                isToggleOn: !prevState.input.isToggleOn
            }
        }));
    };

    handleUpdate = async () => {
        try {
            this.setState({ loading: true });
            await updateSetting(this.state.input);
            await this.getSetting();
            this.setState({loading: false});
        } catch (error) {
            await this.getSetting();
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    }

    handleAdd = async () => {
        try{
            this.setState({ loading: true });
            await addGDTGAccount({id: this.state.id});
            await this.getSetting();
            this.setState({loading: false, id: ''})
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    }

    handleGetToken = async () => {
        try {
            this.setState({ loading: true });
            await updateToken({cookie: this.state.input.cookie});
            await this.getSetting();
            this.setState({loading: false});
        } catch (error) {
            await this.getSetting();
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    }

    handleRemove = async (id) => {
        try{
            this.setState({ loading: true });
            await removeGDTGAccount({id});
            await this.getSetting();
            this.setState({loading: false});
        } catch (error) {
            await this.getSetting();
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.setState({loading: false})
        }
    }

    render() {
        return (
            <Fragment>
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner" style={this.state.isMobile ? {padding: 0} : {}}>
                            <Container fluid>
                                <Card className="main-card mb-3" onKeyDown={(e) => e.key === "Enter" && !this.state.loading && this.handleUpdate(e)}>
                                    <CardTitle></CardTitle>
                                    <CardBody>
                                        <Row className="mb-4">
                                            
                                            <Col sm={6} xs={12} className={cx({ "pe-2": !this.state.isMobile, "mb-4": this.state.isMobile })}>
                                                <Label>Proxy</Label>
                                                <Input
                                                    type="text"
                                                    name="proxy"
                                                    value={this.state.input.proxy}
                                                    onChange={(e) => {
                                                        this.setState({input: {...this.state.input, proxy: e.target.value}})
                                                    }}
                                                />
                                            </Col>
                                            <Col sm={6} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
                                                <Label>Proxy Auth</Label>
                                                <Input
                                                    type="text"
                                                    name="proxy_auth"
                                                    value={this.state.input.proxy_auth}
                                                    onChange={(e) => {
                                                        this.setState({input: {...this.state.input, proxy_auth: e.target.value}})
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb-4">
                                        
                                            <Col sm={6} xs={12} className={cx({ "pe-2": !this.state.isMobile, "mb-4": this.state.isMobile })}>
                                                <Label>Cookie</Label>
                                                <Input
                                                    type="text"
                                                    name="cookie"
                                                    value={this.state.input.cookie}
                                                    onChange={(e) => {
                                                        this.setState({input: {...this.state.input, cookie: e.target.value}})
                                                    }}
                                                />
                                            </Col>
                                            <Col sm={6} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
                                                <Label>Access token</Label>
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="accessToken"
                                                        value={this.state.input.accessToken}
                                                        onChange={(e) => {
                                                            this.setState({input: {...this.state.input, accessToken: e.target.value}})
                                                        }}
                                                    />
                                                    <Button color="primary" disabled={this.state.loading} onClick={this.handleGetToken}>
                                                        {this.state.loading ? "Get..." : "Get"}
                                                    </Button>
                                                </InputGroup>
                                               

                                            </Col>   
                                        </Row>


                                        <Row className="mb-3">
                                            <Col sm={6} xs={12} className={cx({ "pe-2": !this.state.isMobile, "mb-4": this.state.isMobile })}>
                                                <Row className="mb-3">
                                                    <Label for="content">Tài khoản Facebook GDTG</Label>
                                                    <InputGroup>
                                                        <Input
                                                            type="text"
                                                            name="id"
                                                            id="id"
                                                            value={this.state.id}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                const match = value.match(/(\d+)/);
                                                                this.setState({ id: match ? match[0] : "" });
                                                            }}                                                            
                                                            onKeyDown={(e) => e.key === "Enter" && !this.state.loading && this.handleAdd()}
                                                            placeholder="Facebook ID"
                                                        />
                                                        <button class="input-group-text" onClick={this.handleAdd} disabled={this.state.loading}>
                                                            {this.state.loading ? '...' : <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                height={19}
                                                                viewBox="0 0 56 56"
                                                                width={19}
                                                                fill="#545cd8"
                                                            >
                                                                <path d="m47.7928 9.5547c-1.2187 0-2.0859.8437-2.0859 2.0625 0 .8438.0469 1.5938.0469 2.7187 0 8.6953-3 12.2344-11.625 12.2344h-16.1485l-5.7656.3516 7.8985-7.2422 5.2031-5.2969c.375-.375.5859-.914.5859-1.4766 0-1.1718-.914-2.0156-2.0625-2.0156-.5625 0-1.0547.1875-1.5234.6328l-15.586 15.5625c-.4687.4453-.7265 1.0078-.7265 1.5703 0 .586.2578 1.125.7265 1.5938l15.5157 15.4922c.539.4922 1.0312.7031 1.5937.7031 1.1485 0 2.0625-.8437 2.0625-2.0156 0-.5625-.2109-1.1016-.5859-1.5l-5.2031-5.2969-7.875-7.1953 5.7421.3281h16.3594c11.1328 0 15.6565-4.875 15.6565-16.2187 0-1.3828-.047-2.5313-.1877-3.2578-.2112-.9376-.7733-1.7344-2.0157-1.7344z" />
                                                            </svg>}
                                                        </button>
                                                        
                                                    </InputGroup>  
                                                </Row>
                                                
                                                <div className="mb-3">
                                                    <Label style={{display: 'block'}}>Danh sách tài khoản GDTG</Label>
                                                    <ListGroup flush style={{}}>
                                                        {this.state.profiles.map((item) => {
                                                            return <ListGroupItem>
                                                            <div className="widget-content p-0">
                                                                <div className="widget-content-wrapper">
                                                                    <div className="widget-content-left me-3">
                                                                        <img width={42} className="rounded-circle" src={item.avatar ? item.avatar : (`${SERVER_URL}/images/avatars/avatar.jpg`)} alt=""/>
                                                                    </div>
                                                                    <div className="widget-content-left">
                                                                        <div className="widget-heading">
                                                                            {item.facebookId}
                                                                        </div>
                                                                        <div className="widget-subheading">
                                                                            {item.nameCustomer}
                                                                        </div>
                                                                    </div>
                                                                    <div className="widget-content-right">
                                                                        <ButtonGroup size="sm">
                                                                            <Button color="danger" onClick={() => {this.handleRemove(item.facebookId)}}>
                                                                                <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                                                                            </Button>
                                                                        </ButtonGroup>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </ListGroupItem>
                                                        })}
                                                        
                                                    </ListGroup>
                                                </div>
                                            </Col>
                                        </Row>
            
                      
                                        
                                        <Row>
                                            <div className="btn-actions-pane-right">
                                                 
                                                <Button 
                                                    className="btn-wide me-2 mt-2 btn-dashed w-100" 
                                                    color="primary" 
                                                    onClick={this.handleUpdate}
                                                    disabled={this.state.loading}    
                                                >
                                                    {this.state.loading ? "Đang lưu..." : "Lưu"}
                                                </Button>
                                            </div>
                                        </Row>
                                    </CardBody>
                                </Card>
      
                            </Container>

                            
                        </div>
                    </div>
                </div>
                <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                    type="error" onConfirm={() => this.setState({alert: false})}/>
            </Fragment>
        );
    }    
}

const mapStateToProps = (state) => ({
});
  
const mapDispatchToProps = {
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Setting);
