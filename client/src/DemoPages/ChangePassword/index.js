import React, { Fragment, useEffect, useState } from "react";
import axios from "axios"; // Hoặc fetch
import SweetAlert from "react-bootstrap-sweetalert";

import AppHeader from "../../Layout/AppHeader";
import AppSidebar from "../../Layout/AppSidebar";
import { Card, CardBody, CardTitle, Col, Container, Input, Label, Row, Button } from "reactstrap";
import { changePasswordService } from "../../services/authService";
import { useDispatch } from "react-redux";
import { logout } from "../../reducers/userSlice";

const ChangePassword = () => {
    const [input, setInput] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({
        show: false,      
        type: "error",    
        title: "",        
    });

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const dispatch = useDispatch();

    const updateScreenSize = () => {
        setIsMobile(window.innerWidth < 768);
    };

    useEffect(() => {
        window.addEventListener("resize", updateScreenSize);

        return () => {
            window.removeEventListener("resize", updateScreenSize);
        };
    }, []);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { oldPassword, newPassword, confirmPassword } = input;

        if (newPassword !== confirmPassword) {
            return setAlert({
                show: true,
                type: "error",
                title: "Mật khẩu mới và xác nhận không trùng khớp!",
            });
        }
        setLoading(true);
        try {
            const requestData = {
                oldPassword,
                newPassword,
            };

            await changePasswordService(requestData);
            
            setAlert({
                show: true,
                type: "success",
                title: "Đổi mật khẩu thành công!",
                onConfirm: () => {
                    localStorage.removeItem("token");
                    dispatch(logout());
                    window.location.href = "/login";
                }
            });
        } catch (err) {
            console.error(err);
            setAlert({
                show: true,
                type: "error",
                title: err,
            });
        } finally {
            setLoading(false);
        }
  };

  return (
        <Fragment>
            <AppHeader />
            <div className="app-main">
                <AppSidebar />
                <div className="app-main__outer">
                    <div className="app-main__inner" style={isMobile ? { padding: 0 } : {}}>
                        <Container fluid>
                            <Card
                                className="main-card mb-3 ps-3 pe-3"
                                onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit(e)}
                            >
                                <CardTitle className="mt-3 ml-3">
                                    Đổi Mật Khẩu
                                </CardTitle>
                                <CardBody>
                                    <Row>
                                        <Col md={6} xs={12} className="mb-3">
                                            <Label for="oldPassword">Mật khẩu cũ</Label>
                                            <Input
                                                type="password"
                                                name="oldPassword"
                                                id="oldPassword"
                                                value={input.oldPassword}
                                                onChange={handleChange}
                                                placeholder="Nhập mật khẩu cũ"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6} xs={12} className="mb-3">
                                            <Label for="newPassword">Mật khẩu mới</Label>
                                            <Input
                                                type="password"
                                                name="newPassword"
                                                id="newPassword"
                                                value={input.newPassword}
                                                onChange={handleChange}
                                                placeholder="Nhập mật khẩu mới"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6} xs={12} className="mb-3">
                                            <Label for="confirmPassword">Xác nhận mật khẩu mới</Label>
                                            <Input
                                                type="password"
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                value={input.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Nhập lại mật khẩu mới"
                                            />
                                        </Col>
                                    </Row>
                                    <Button color="primary" onClick={handleSubmit} disabled={loading}>
                                        {loading ? "Đang đổi ..." : "Đổi mật khẩu"}
                                    </Button>
                                </CardBody>
                            </Card>
                        </Container>
                    </div>
                </div>
            </div>

            <SweetAlert
                show={alert.show}
                title={alert.title}
                type={alert.type} 
                onConfirm={() => {
                    setAlert((prev) => ({ ...prev, show: false }));
                    if (alert.onConfirm) alert.onConfirm();
                }}
            />
        </Fragment>
    );
};

export default ChangePassword;
