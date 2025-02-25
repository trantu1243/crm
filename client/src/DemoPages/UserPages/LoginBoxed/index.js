import React, { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Button, Form, FormGroup, Input } from "reactstrap";
import { loginFailure, loginStart, loginSuccess } from "../../../reducers/userSlice";
import { login } from "../../../services/authService";
import { useHistory } from "react-router-dom";
import SweetAlert from 'react-bootstrap-sweetalert';

// Layout
const LoginBoxed = ({ match }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alert, setAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.user);
    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const data = await login(email, password);
            console.log(data)
            localStorage.setItem("token", data.token);
            dispatch(loginSuccess(data));
            window.location.href = "/transactions";
        } catch (err) {
            setErrorMsg(err);
            setAlert(true);
            dispatch(loginFailure(err));
        }
    };
    return (
        <Fragment>
            <div className="h-100 bg-plum-plate bg-animation">
                <div className="d-flex h-100 justify-content-center align-items-center">
                    <Col md="8" className="mx-auto app-login-box">
                        <div className="app-logo-inverse mx-auto mb-3" />
                        <div className="modal-dialog w-100 mx-auto">
                            <div className="modal-content">
                                <div className="modal-body">
                                    <div className="h5 modal-title text-center">
                                        <h4 className="mt-2">
                                            <div>Chào mừng trở lại,</div>
                                            <span>Vui lòng đăng nhập tài khoản phía dưới.</span>
                                        </h4>
                                    </div>
                                    <Form onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}>
                                        <Row form>
                                            <Col md={12}>
                                                <FormGroup>
                                                    <Input 
                                                        type="email" 
                                                        name="email" 
                                                        id="exampleEmail" 
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)} 
                                                        placeholder="Email ..."
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col md={12}>
                                                <FormGroup>
                                                    <Input 
                                                        type="password" 
                                                        name="password" 
                                                        id="examplePassword" 
                                                        placeholder="Mật khẩu ..."
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                      
                                    </Form>
                                  
                                </div>
                                <div className="modal-footer clearfix">
                                  
                                    <div className="float-end">
                                        <Button color="primary" size="lg" type="submit" disabled={loading} onClick={handleLogin}>
                                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                                        </Button>
                                    </div>
                                </div>
                                <SweetAlert title={errorMsg} show={alert}
                                    type="error" onConfirm={() => setAlert(false)}/>
                            </div>
                        </div>
                        <div className="text-center text-white opacity-8 mt-3">
                            Copyright &copy; GDTG 2025
                        </div>
                    </Col>
                </div>
            </div>
        </Fragment>
    )
};

export default LoginBoxed;
