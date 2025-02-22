import React, { Component, Fragment } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import PageTitleAlt3 from "../../../Layout/AppMain/PageTitleAlt3";

import Chart from "react-apexcharts";

import bg1 from "../../../assets/utils/images/dropdown-header/abstract1.jpg";

import avatar1 from "../../../assets/utils/images/avatars/1.jpg";
import avatar2 from "../../../assets/utils/images/avatars/2.jpg";
import avatar3 from "../../../assets/utils/images/avatars/3.jpg";
import avatar4 from "../../../assets/utils/images/avatars/4.jpg";

import classnames from "classnames";

import {
  Row,
  Col,
  Alert,
  Button,
  CardHeader,
  Table,
  ButtonGroup,
  Nav,
  NavItem,
  NavLink,
  Popover,
  PopoverBody,
  Progress,
  Card,
  CardBody,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
  UncontrolledButtonDropdown,
  CardFooter,
} from "reactstrap";

import Column from "./Examples/Column";
import Bar2 from "./Examples/Bar";
import Area from "./Examples/Area";
import Mixed from "./Examples/Mixed";

import {
  faAngleUp,
  faAngleDown,
  faQuestionCircle,
  faBusinessTime,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Donut from "./Examples/Donut";
import { getDailyStatsService, getMonthlyStatsService } from "../../../services/statisticService";
import Loader from "react-loaders";
import MixedSingleMonth from "./Examples/Mixed";

export default class General extends Component {
    constructor(props) {
        super(props);

        this.togglePop1 = this.togglePop1.bind(this);

        this.state = {
            visible: true,
            popoverOpen1: false,

            optionsRadial: {
                chart: {
                    height: 350,
                    type: "radialBar",
                    toolbar: {
                        show: true,
                    },
                },
                plotOptions: {
                    radialBar: {
                        startAngle: -135,
                        endAngle: 225,
                        hollow: {
                            margin: 0,
                            size: "70%",
                            background: "#fff",
                            image: undefined,
                            imageOffsetX: 0,
                            imageOffsetY: 0,
                            position: "front",
                            dropShadow: {
                                enabled: true,
                                top: 3,
                                left: 0,
                                blur: 4,
                                opacity: 0.24,
                            },
                        },
                        track: {
                        background: "#fff",
                        strokeWidth: "67%",
                        margin: 0, // margin is in pixels
                        dropShadow: {
                            enabled: true,
                            top: -3,
                            left: 0,
                            blur: 4,
                            opacity: 0.35,
                        },
                        },

                        dataLabels: {
                            showOn: "always",
                            name: {
                                offsetY: -10,
                                show: true,
                                color: "#888",
                                fontSize: "17px",
                            },
                            value: {
                                formatter: function (val) {
                                    return parseInt(val);
                                },
                                color: "#111",
                                fontSize: "36px",
                                show: true,
                            },
                        },
                    },
                },
                fill: {
                    type: "gradient",
                    gradient: {
                        shade: "dark",
                        type: "horizontal",
                        shadeIntensity: 0.5,
                        gradientToColors: ["#ABE5A1"],
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 100],
                    },
                },
                stroke: {
                    lineCap: "round",
                },
                labels: ["Percent"],
            },
            seriesRadial: [76],
            currentMonthStats: null,
            lastMonthStats: null,
            todayStats: null,
            loading: false,
        };
        this.onDismiss = this.onDismiss.bind(this);
    }

    componentDidMount() {
        this.loadStatistics();
    }

    async loadStatistics() {
        try {
            this.setState({ loading: true });

            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();
            const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            const currentDay = today.getDate();

            // Gọi API lấy dữ liệu từ server (đã tính % trên backend)
            const currentMonthStats = await getMonthlyStatsService({ month: currentMonth, year: currentYear });
            const lastMonthStats = await getMonthlyStatsService({ month: lastMonth, year: lastYear });
            const todayStats = await getDailyStatsService({ day: currentDay, month: currentMonth, year: currentYear });
            // Cập nhật state với dữ liệu từ API
            this.setState({
                currentMonthStats,
                lastMonthStats,
                todayStats,
                loading: false,
            });
        } catch (error) {
            console.error("Lỗi khi lấy thống kê", error);
            this.setState({ loading: false });
        }
    }
    
    togglePop1() {
        this.setState({
            popoverOpen1: !this.state.popoverOpen1,
        });
    }

    onDismiss() {
        this.setState({ visible: false });
    }

    render() {
        const { loading, currentMonthStats, lastMonthStats, todayStats } = this.state;
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // Tương tự với lastMonth, lastYear
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        // Lúc này bạn mới được dùng ở line 199, 200
        const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
        const daysInLastMonth = new Date(lastYear, lastMonth, 0).getDate();
        return (
            <Fragment>
                <TransitionGroup>
                    <CSSTransition component="div" classNames="TabsAnimation" appear={true}
                        timeout={1500} enter={false} exit={false}>
                        <div>
                            {loading ? (
                                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                                    <Loader type="ball-spin-fade-loader" />
                                </div>
                            ) : ( <>
                                <Row>
                                    <Col md="6" lg="3">
                                        
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-primary border-primary">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content">
                                                    <h6 className="widget-subheading">Số tiền GD trong tháng</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {currentMonthStats?.totalStats.totalAmount.toLocaleString()}&nbsp;
                                                                    <small className="opacity-5 text-muted">vnd</small>
                                                                </div>
                                                                <div className="ms-auto">
                                                                    <div className="widget-title ms-auto font-size-lg fw-normal text-muted">
                                                                        <span className={currentMonthStats?.totalStats.percentChangeAmount >= 0 ? "text-success ps-2" : "text-danger ps-2"}>
                                                                            {currentMonthStats?.totalStats.percentChangeAmount >= 0 ? "+" : ""}
                                                                            {currentMonthStats?.totalStats.percentChangeAmount}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    
                                    
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-primary border-primary">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content">
                                                    <h6 className="widget-subheading">Số tiền GD tháng trước</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {lastMonthStats?.totalStats.totalAmount.toLocaleString()}&nbsp;
                                                                    <small className="opacity-5 text-muted">vnd</small>
                                                                </div>
                                                                <div className="ms-auto">
                                                                    <div className="widget-title ms-auto font-size-lg fw-normal text-muted">
                                                                    <span className={lastMonthStats?.totalStats.percentChangeAmount >= 0 ? "text-success ps-2" : "text-danger ps-2"}>
                                                                            {lastMonthStats?.totalStats.percentChangeAmount >= 0 ? "+" : ""}
                                                                            {lastMonthStats?.totalStats.percentChangeAmount}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                        
                                    </Col>
                                    <Col md="6" lg="3">
                                    
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-danger border-danger">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content">
                                                    <h6 className="widget-subheading">Tiền phí trong tháng</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3 text-danger">
                                                                    {currentMonthStats?.totalStats.totalFee.toLocaleString()}&nbsp;
                                                                    <small className="opacity-5 text-muted">vnd</small>
                                                                </div>
                                                                <div className="ms-auto">
                                                                    <div className="widget-title ms-auto font-size-lg fw-normal text-muted">
                                                                        <span className={currentMonthStats?.totalStats.percentChangeFee >= 0 ? "text-success ps-2" : "text-danger ps-2"}>
                                                                            {currentMonthStats?.totalStats.percentChangeFee >= 0 ? "+" : ""}
                                                                            {currentMonthStats?.totalStats.percentChangeFee}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-danger border-danger">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content">
                                                    <h6 className="widget-subheading">Tiền phí tháng trước</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3 text-danger">
                                                                    {lastMonthStats?.totalStats.totalFee.toLocaleString()}&nbsp;
                                                                    <small className="opacity-5 text-muted">vnd</small>
                                                                </div>
                                                                <div className="ms-auto">
                                                                    <div className="widget-title ms-auto font-size-lg fw-normal text-muted">
                                                                        <span className={lastMonthStats?.totalStats.percentChangeFee >= 0 ? "text-success ps-2" : "text-danger ps-2"}>
                                                                            {lastMonthStats?.totalStats.percentChangeFee >= 0 ? "+" : ""}
                                                                            {lastMonthStats?.totalStats.percentChangeFee}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    
                                    </Col>
                                    <Col md="6" lg="3">
                                        
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-warning border-warning">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content">
                                                    <h6 className="widget-subheading">Số lượng GD trong tháng</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                {currentMonthStats?.totalStats.totalTransactions.toLocaleString()}
                                                                </div>
                                                                <div className="ms-auto">
                                                                    <div className="widget-title ms-auto font-size-lg fw-normal text-muted">
                                                                    <span className={currentMonthStats?.totalStats.percentChangeTransactions >= 0 ? "text-success ps-2" : "text-danger ps-2"}>
                                                                            {currentMonthStats?.totalStats.percentChangeTransactions >= 0 ? "+" : ""}
                                                                            {currentMonthStats?.totalStats.percentChangeTransactions}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-warning border-warning">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content">
                                                    <h6 className="widget-subheading">Số lượng GD tháng trước</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                {lastMonthStats?.totalStats.totalTransactions.toLocaleString()}
                                                                </div>
                                                                <div className="ms-auto">
                                                                    <div className="widget-title ms-auto font-size-lg fw-normal text-muted">
                                                                        <span className={lastMonthStats?.totalStats.percentChangeTransactions >= 0 ? "text-success ps-2" : "text-danger ps-2"}>
                                                                            {lastMonthStats?.totalStats.percentChangeTransactions >= 0 ? "+" : ""}
                                                                            {lastMonthStats?.totalStats.percentChangeTransactions}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col md="6" lg="3">
                                    
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-success border-success">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content">
                                                    <h6 className="widget-subheading">Số tiền giao dịch trong ngày</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {todayStats?.totalStats.totalAmount.toLocaleString()}&nbsp;
                                                                    <small className="opacity-5">vnd</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-success border-success">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content">
                                                    <h6 className="widget-subheading">Tiền phí trong ngày</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {todayStats?.totalStats.totalFee.toLocaleString()}&nbsp;
                                                                    <small className="opacity-5">vnd</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    
                                        
                                    </Col>
                                </Row>
                            
                                <Card className="mb-3" >
                                    <CardHeader className="card-header-tab">
                                        <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                            Số tiền GD trong tháng
                                        </div>
                                    
                                    </CardHeader>
                                    <CardBody className="pt-0">
                                        <MixedSingleMonth
                                            dailyStats={this.state.currentMonthStats?.dailyStats}
                                            daysThisMonth={daysInCurrentMonth} // VD: new Date(year, month, 0).getDate()
                                        />
                                    </CardBody>
                                </Card>
                                
                                <Row>
                                    <Col sm="12" md="6" lg="6">
                                        <Card className="mb-3">
                                            <CardHeader className="card-header-tab">
                                                <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                                    Income
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-2">
                                                <Donut bankStats={todayStats?.bankStats} />
                                                
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm="12" md="6" lg="6">
                                        <Card className="mb-3">
                                            <CardHeader className="card-header-tab">
                                                <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                                    Income
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-2">
                                            <Donut bankStats={todayStats?.bankStats} />
                                                
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm="12" md="6" lg="6">
                                        <Card className="mb-3">
                                            <CardHeader className="card-header-tab">
                                                <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                                    Income
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-2">
                                            <Donut bankStats={todayStats?.bankStats} />
                                                
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm="12" md="6" lg="6">
                                        <Card className="mb-3">
                                            <CardHeader className="card-header-tab">
                                                <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                                    Income
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-2">
                                            <Donut bankStats={todayStats?.bankStats} />
                                                
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                                <CardHeader className="mbg-3 h-auto ps-0 pe-0 bg-transparent no-border">
                                    <div className="card-header-title fsize-2 text-capitalize fw-normal">
                                    Target Section
                                    </div>
                                    <div className="btn-actions-pane-right text-capitalize actions-icon-btn">
                                    <Button size="sm" color="link">
                                        View Details
                                    </Button>
                                    </div>
                                </CardHeader>
                                <Row>
                                    <Col md="6" lg="3">
                                    <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start">
                                        <div className="widget-content p-0 w-100">
                                        <div className="widget-content-outer">
                                            <div className="widget-content-wrapper">
                                            <div className="widget-content-left pe-2 fsize-1">
                                                <div className="widget-numbers mt-0 fsize-3 text-danger">
                                                71%
                                                </div>
                                            </div>
                                            <div className="widget-content-right w-100">
                                                <Progress className="progress-bar-xs" color="danger" value="71"/>
                                            </div>
                                            </div>
                                            <div className="widget-content-left fsize-1">
                                            <div className="text-muted opacity-6">Income Target</div>
                                            </div>
                                        </div>
                                        </div>
                                    </Card>
                                    </Col>
                                    <Col md="6" lg="3">
                                    <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start">
                                        <div className="widget-content p-0 w-100">
                                        <div className="widget-content-outer">
                                            <div className="widget-content-wrapper">
                                            <div className="widget-content-left pe-2 fsize-1">
                                                <div className="widget-numbers mt-0 fsize-3 text-success">
                                                54%
                                                </div>
                                            </div>
                                            <div className="widget-content-right w-100">
                                                <Progress className="progress-bar-xs" color="success" value="54"/>
                                            </div>
                                            </div>
                                            <div className="widget-content-left fsize-1">
                                            <div className="text-muted opacity-6">
                                                Expenses Target
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    </Card>
                                    </Col>
                                    <Col md="6" lg="3">
                                    <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start">
                                        <div className="widget-content p-0 w-100">
                                        <div className="widget-content-outer">
                                            <div className="widget-content-wrapper">
                                            <div className="widget-content-left pe-2 fsize-1">
                                                <div className="widget-numbers mt-0 fsize-3 text-warning">
                                                32%
                                                </div>
                                            </div>
                                            <div className="widget-content-right w-100">
                                                <Progress className="progress-bar-xs" color="warning" value="32"/>
                                            </div>
                                            </div>
                                            <div className="widget-content-left fsize-1">
                                            <div className="text-muted opacity-6">
                                                Spendings Target
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    </Card>
                                    </Col>
                                    <Col md="6" lg="3">
                                    <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start">
                                        <div className="widget-content p-0 w-100">
                                        <div className="widget-content-outer">
                                            <div className="widget-content-wrapper">
                                            <div className="widget-content-left pe-2 fsize-1">
                                                <div className="widget-numbers mt-0 fsize-3 text-info">
                                                89%
                                                </div>
                                            </div>
                                            <div className="widget-content-right w-100">
                                                <Progress className="progress-bar-xs" color="info" value="89"/>
                                            </div>
                                            </div>
                                            <div className="widget-content-left fsize-1">
                                            <div className="text-muted opacity-6">Totals Target</div>
                                            </div>
                                        </div>
                                        </div>
                                    </Card>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="12" lg="4">
                                    <Card className="mb-3">
                                        <CardHeader className="card-header-tab">
                                        <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                            Total Sales
                                        </div>
                                        <div className="btn-actions-pane-right text-capitalize actions-icon-btn">
                                            <UncontrolledButtonDropdown>
                                            <DropdownToggle className="btn-icon btn-icon-only" color="link">
                                                <i className="lnr-cog btn-icon-wrapper" />
                                            </DropdownToggle>
                                            <DropdownMenu className="dropdown-menu-right rm-pointers dropdown-menu-shadow dropdown-menu-hover-link">
                                                <DropdownItem header>Header</DropdownItem>
                                                <DropdownItem>
                                                <i className="dropdown-icon lnr-inbox"> </i>
                                                <span>Menus</span>
                                                </DropdownItem>
                                                <DropdownItem>
                                                <i className="dropdown-icon lnr-file-empty"> </i>
                                                <span>Settings</span>
                                                </DropdownItem>
                                                <DropdownItem>
                                                <i className="dropdown-icon lnr-book"> </i>
                                                <span>Actions</span>
                                                </DropdownItem>
                                                <DropdownItem divider />
                                                <div className="p-1 text-end">
                                                <Button className="me-2 btn-shadow btn-sm" color="link">
                                                    View Details
                                                </Button>
                                                <Button className="me-2 btn-shadow btn-sm" color="primary">
                                                    Action
                                                </Button>
                                                </div>
                                            </DropdownMenu>
                                            </UncontrolledButtonDropdown>
                                        </div>
                                        </CardHeader>
                                        <CardBody>
                                        <Bar2 />
                                        </CardBody>
                                        <CardFooter className="p-0 d-block">
                                        <div className="grid-menu grid-menu-2col">
                                            <Row className="g-0">
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="dark">
                                                <i className="lnr-car text-primary opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Admin
                                                </Button>
                                            </Col>
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="dark">
                                                <i className="lnr-bullhorn text-danger opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Blog
                                                </Button>
                                            </Col>
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="dark">
                                                <i className="lnr-bug text-success opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Register
                                                </Button>
                                            </Col>
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="dark">
                                                <i className="lnr-heart text-warning opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Directory
                                                </Button>
                                            </Col>
                                            </Row>
                                        </div>
                                        </CardFooter>
                                    </Card>
                                    </Col>
                                    <Col sm="12" lg="4">
                                    <Card className="mb-3">
                                        <CardHeader className="card-header-tab">
                                        <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                            Daily Sales
                                        </div>
                                        <div className="btn-actions-pane-right text-capitalize">
                                            <Button size="sm" outline className="btn-wide btn-outline-2x" color="focus">
                                            View All
                                            </Button>
                                        </div>
                                        </CardHeader>
                                        <CardBody>
                                        <Column />
                                        </CardBody>
                                        <CardFooter className="p-0 d-block">
                                        <div className="grid-menu grid-menu-2col">
                                            <Row className="g-0">
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="dark">
                                                <i className="lnr-apartment text-dark opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Overview
                                                </Button>
                                            </Col>
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="dark">
                                                <i className="lnr-database text-dark opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Support
                                                </Button>
                                            </Col>
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="dark">
                                                <i className="lnr-printer text-dark opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Activities
                                                </Button>
                                            </Col>
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="dark">
                                                <i className="lnr-store text-dark opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Marketing
                                                </Button>
                                            </Col>
                                            </Row>
                                        </div>
                                        </CardFooter>
                                    </Card>
                                    </Col>
                                    <Col sm="12" lg="4">
                                    <Card className="mb-3">
                                        <CardHeader className="card-header-tab">
                                        <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                            Total Expenses
                                        </div>
                                        <div className="btn-actions-pane-right text-capitalize">
                                            <Button size="sm" outline className="btn-wide btn-outline-2x" color="primary">
                                            View All
                                            </Button>
                                        </div>
                                        </CardHeader>
                                        <CardBody>
                                        <Area />
                                        </CardBody>
                                        <CardFooter className="p-0 d-block">
                                        <div className="grid-menu grid-menu-2col">
                                            <Row className="g-0">
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="success">
                                                <i className="lnr-lighter text-success opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Accounts
                                                </Button>
                                            </Col>
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="warning">
                                                <i className="lnr-construction text-warning opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Contacts
                                                </Button>
                                            </Col>
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="info">
                                                <i className="lnr-bus text-info opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Products
                                                </Button>
                                            </Col>
                                            <Col sm="6" className="p-2">
                                                <Button className="btn-icon-vertical btn-transition-text btn-transition btn-transition-alt pt-2 pb-2"
                                                outline color="alternate">
                                                <i className="lnr-gift text-alternate opacity-7 btn-icon-wrapper mb-2"> {" "} </i>
                                                Services
                                                </Button>
                                            </Col>
                                            </Row>
                                        </div>
                                        </CardFooter>
                                    </Card>
                                    </Col>
                                </Row>
                                <Card className="main-card mb-3">
                                    <CardHeader>
                                    <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                        Company Agents Status
                                    </div>
                                    <div className="btn-actions-pane-right">
                                        <Button size="sm" outline className="btn-icon btn-wide btn-outline-2x"
                                        id={"PopoverCustomT-1"} onClick={this.togglePop1} color="focus">
                                        Actions Menu
                                        <span className="ps-2 align-middle opacity-7">
                                            <FontAwesomeIcon icon={faAngleDown} />
                                        </span>
                                        </Button>
                                        <Popover className="popover-custom rm-pointers" placement="auto"
                                        isOpen={this.state.popoverOpen1} target={"PopoverCustomT-1"} toggle={this.togglePop1}>
                                        <PopoverBody>
                                            <div className="dropdown-menu-header">
                                            <div
                                                className={classnames(
                                                "dropdown-menu-header-inner bg-focus"
                                                )}>
                                                <div className="menu-header-image"
                                                style={{
                                                    backgroundImage: "url(" + bg1 + ")",
                                                }}/>
                                                <div className="menu-header-content">
                                                <h5 className="menu-header-title">Settings</h5>
                                                <h6 className="menu-header-subtitle">
                                                    Manage all of your options
                                                </h6>
                                                </div>
                                            </div>
                                            </div>
                                            <Nav vertical>
                                            <NavItem className="nav-item-header">Activity</NavItem>
                                            <NavItem>
                                                <NavLink href="#">
                                                Chat
                                                <div className="ms-auto badge rounded-pill bg-info">
                                                    8
                                                </div>
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink href="#">Recover Password</NavLink>
                                            </NavItem>
                                            <NavItem className="nav-item-divider" />
                                            <NavItem className="nav-item-btn text-center">
                                                <Button size="sm" className="btn-wide btn-shadow" color="danger">
                                                Cancel
                                                </Button>
                                            </NavItem>
                                            </Nav>
                                        </PopoverBody>
                                        </Popover>
                                    </div>
                                    </CardHeader>
                                    <Table responsive borderless hover className="align-middle text-truncate mb-0">
                                    <thead>
                                        <tr>
                                        <th className="text-center">#</th>
                                        <th className="text-center">Avatar</th>
                                        <th className="text-center">Name</th>
                                        <th className="text-center">Company</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-center">Due Date</th>
                                        <th className="text-center">Target Achievement</th>
                                        <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                        <td className="text-center text-muted" style={{ width: "80px" }}>
                                            #54
                                        </td>
                                        <td className="text-center" style={{ width: "80px" }}>
                                            <img width={40} className="rounded-circle" src={avatar1} alt=""/>
                                        </td>
                                        <td className="text-center">
                                            <a href="https://colorlib.com/" onClick={(e) => e.preventDefault()}>
                                            Juan C. Cargill
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <a href="https://colorlib.com/" onClick={(e) => e.preventDefault()}>
                                            Micro Electronics
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <div className="badge rounded-pill bg-danger">
                                            Canceled
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="pe-2 opacity-6">
                                            <FontAwesomeIcon icon={faBusinessTime} />
                                            </span>
                                            12 Dec
                                        </td>
                                        <td className="text-center" style={{ width: "200px" }}>
                                            <div className="widget-content p-0">
                                            <div className="widget-content-outer">
                                                <div className="widget-content-wrapper">
                                                <div className="widget-content-left pe-2">
                                                    <div className="widget-numbers fsize-1 text-danger">
                                                    71%
                                                    </div>
                                                </div>
                                                <div className="widget-content-right w-100">
                                                    <Progress className="progress-bar-xs" color="danger" value="71"/>
                                                </div>
                                                </div>
                                            </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <ButtonGroup size="sm">
                                            <Button className="btn-shadow" color="primary">
                                                Hire
                                            </Button>
                                            <Button className="btn-shadow" color="primary">
                                                Fire
                                            </Button>
                                            </ButtonGroup>
                                        </td>
                                        </tr>
                                        <tr>
                                        <td className="text-center text-muted" style={{ width: "80px" }}>
                                            #55
                                        </td>
                                        <td className="text-center" style={{ width: "80px" }}>
                                            <img width={40} className="rounded-circle" src={avatar2} alt=""/>
                                        </td>
                                        <td className="text-center">
                                            <a href="https://colorlib.com/" onClick={(e) => e.preventDefault()}>
                                            Johnathan Phelan
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <a href="https://colorlib.com/" onClick={(e) => e.preventDefault()}>
                                            Hatchworks
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <div className="badge rounded-pill bg-info">On Hold</div>
                                        </td>
                                        <td className="text-center">
                                            <span className="pe-2 opacity-6">
                                            <FontAwesomeIcon icon={faBusinessTime} />
                                            </span>
                                            15 Dec
                                        </td>
                                        <td className="text-center" style={{ width: "200px" }}>
                                            <div className="widget-content p-0">
                                            <div className="widget-content-outer">
                                                <div className="widget-content-wrapper">
                                                <div className="widget-content-left pe-2">
                                                    <div className="widget-numbers fsize-1 text-warning">
                                                    54%
                                                    </div>
                                                </div>
                                                <div className="widget-content-right w-100">
                                                    <Progress className="progress-bar-xs" color="warning" value="54"/>
                                                </div>
                                                </div>
                                            </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <ButtonGroup size="sm">
                                            <Button className="btn-shadow" color="primary">
                                                Hire
                                            </Button>
                                            <Button className="btn-shadow" color="primary">
                                                Fire
                                            </Button>
                                            </ButtonGroup>
                                        </td>
                                        </tr>
                                        <tr>
                                        <td className="text-center text-muted" style={{ width: "80px" }}>
                                            #56
                                        </td>
                                        <td className="text-center" style={{ width: "80px" }}>
                                            <img width={40} className="rounded-circle" src={avatar3} alt=""/>
                                        </td>
                                        <td className="text-center">
                                            <a href="https://colorlib.com/" onClick={(e) => e.preventDefault()}>
                                            Darrell Lowe
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <a href="https://colorlib.com/" onClick={(e) => e.preventDefault()}>
                                            Riddle Electronics
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <div className="badge rounded-pill bg-warning">
                                            In Progress
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="pe-2 opacity-6">
                                            <FontAwesomeIcon icon={faBusinessTime} />
                                            </span>
                                            6 Dec
                                        </td>
                                        <td className="text-center" style={{ width: "200px" }}>
                                            <div className="widget-content p-0">
                                            <div className="widget-content-outer">
                                                <div className="widget-content-wrapper">
                                                <div className="widget-content-left pe-2">
                                                    <div className="widget-numbers fsize-1 text-success">
                                                    97%
                                                    </div>
                                                </div>
                                                <div className="widget-content-right w-100">
                                                    <Progress className="progress-bar-xs" color="success" value="97"/>
                                                </div>
                                                </div>
                                            </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <ButtonGroup size="sm">
                                            <Button className="btn-shadow" color="primary">
                                                Hire
                                            </Button>
                                            <Button className="btn-shadow" color="primary">
                                                Fire
                                            </Button>
                                            </ButtonGroup>
                                        </td>
                                        </tr>
                                        <tr>
                                        <td className="text-center text-muted" style={{ width: "80px" }}>
                                            #56
                                        </td>
                                        <td className="text-center" style={{ width: "80px" }}>
                                            <img width={40} className="rounded-circle" src={avatar4} alt=""/>
                                        </td>
                                        <td className="text-center">
                                            <a href="https://colorlib.com/" onClick={(e) => e.preventDefault()}>
                                            George T. Cottrell
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <a href="https://colorlib.com/" onClick={(e) => e.preventDefault()}>
                                            Pixelcloud
                                            </a>
                                        </td>
                                        <td className="text-center">
                                            <div className="badge rounded-pill bg-success">
                                            Completed
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="pe-2 opacity-6">
                                            <FontAwesomeIcon icon={faBusinessTime} />
                                            </span>
                                            19 Dec
                                        </td>
                                        <td className="text-center" style={{ width: "200px" }}>
                                            <div className="widget-content p-0">
                                            <div className="widget-content-outer">
                                                <div className="widget-content-wrapper">
                                                <div className="widget-content-left pe-2">
                                                    <div className="widget-numbers fsize-1 text-info">
                                                    88%
                                                    </div>
                                                </div>
                                                <div className="widget-content-right w-100">
                                                    <Progress className="progress-bar-xs" color="info" value="88"/>
                                                </div>
                                                </div>
                                            </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <ButtonGroup size="sm">
                                            <Button className="btn-shadow" color="primary">
                                                Hire
                                            </Button>
                                            <Button className="btn-shadow" color="primary">
                                                Fire
                                            </Button>
                                            </ButtonGroup>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </Table>
                                    <CardFooter className="d-block p-4 text-center">
                                    <Button color="dark" className="btn-pill btn-shadow btn-wide fsize-1" size="lg">
                                        <span className="me-2 opacity-7">
                                        <FontAwesomeIcon spin fixedWidth={false} icon={faCog} />
                                        </span>
                                        <span className="me-1">View Complete Report</span>
                                    </Button>
                                    </CardFooter>
                                </Card>
                            </>)}
                            
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </Fragment>
        );
    }
}
