import React, { Component, Fragment } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import {
  Row,
  Col,
  CardHeader,
  Card,
  CardBody,
} from "reactstrap";

import Donut from "./Examples/Donut";
import { getBalanceService, getDailyStatsService, getMonthlyStatsService, getTotalBillServiceByDaily } from "../../../services/statisticService";
import Loader from "react-loaders";
import MixedSingleMonth from "./Examples/Mixed";
import DonutFeeChart from "./Examples/DonutFee";
import DonutTransactionChart from "./Examples/DonutTransaction";
import { DatePicker } from "react-widgets/cjs";

export default class General extends Component {
    constructor(props) {
        super(props);

        this.togglePop1 = this.togglePop1.bind(this);

        this.state = {
            visible: true,
            popoverOpen1: false,
            date: new Date(),
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
            billStats: null,
            loading: false,
            balance: []
        };
        this.onDismiss = this.onDismiss.bind(this);
    }

    componentDidMount() {
        this.loadStatistics();
        this.getBalance();
    }

    getBalance = async () => {
        try {
            const data = await getBalanceService();
            this.setState({balance: data.data})
        } catch (error) {
            console.error("Lỗi khi lấy thống kê", error);
            this.setState({ loading: false });
        }
    }

    handleDateChange = async (date) => {
        this.setState({ date });
        this.loadStatistics(date); 
    };

    async loadStatistics(selectedDate) {
        try {
            this.setState({ loading: true });
        
            const today = selectedDate || new Date();
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();
            const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            const currentDay = today.getDate();
            
            const currentMonthStats = await getMonthlyStatsService({ month: currentMonth, year: currentYear });
            const lastMonthStats = await getMonthlyStatsService({ month: lastMonth, year: lastYear });
            const todayStats = await getDailyStatsService({ day: currentDay, month: currentMonth, year: currentYear });
            const billStats = await getTotalBillServiceByDaily({ day: currentDay, month: currentMonth, year: currentYear });
            this.setState({
                currentMonthStats,
                lastMonthStats,
                todayStats,
                billStats,
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
        const { loading, currentMonthStats, lastMonthStats, todayStats, billStats } = this.state;
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
        return (
            <Fragment>
                <TransitionGroup>
                    <CSSTransition component="div" classNames="TabsAnimation" appear={true}
                        timeout={1500} enter={false} exit={false}>
                        <div>
                            <Fragment>
                                <div className="app-page-title app-page-title-simple">
                                    <div className="page-title-wrapper">
                                        <div className="page-title-heading">
                                            <div>
                                                <div className="page-title-head center-elem">
                                                <span className={"d-inline-block pe-2"}>
                                                    <i className="lnr-apartment icon-gradient bg-mean-fruit" />
                                                </span>
                                                <span className="d-inline-block">Thống kê chung</span>
                                                </div>
                                                
                                            </div>
                                        </div>
                                        <div className="page-title-actions">
                                            <Fragment>
                                                <div className="d-inline-block pe-3">
                                                <Fragment>
                                                    <div className="d-inline-block pe-3">
                                                        <DatePicker
                                                            value={this.state.date}
                                                            onChange={this.handleDateChange}
                                                            format="YYYY-MM-DD"
                                                            max={new Date()}
                                                        />
                                                    </div>
                                                </Fragment>    
                                                </div>
                                            </Fragment>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
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
                                                                    {new Intl.NumberFormat('en-US').format(currentMonthStats?.totalStats.totalAmount)}&nbsp;
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
                                                                    {new Intl.NumberFormat('en-US').format(lastMonthStats?.totalStats.totalAmount)}&nbsp;
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
                                                                    {new Intl.NumberFormat('en-US').format(currentMonthStats?.totalStats.totalFee)}&nbsp;
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
                                                                    {new Intl.NumberFormat('en-US').format(lastMonthStats?.totalStats.totalFee)}&nbsp;
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
                                                                {new Intl.NumberFormat('en-US').format(currentMonthStats?.totalStats.totalTransactions)}
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
                                                                {new Intl.NumberFormat('en-US').format(lastMonthStats?.totalStats.totalTransactions)}
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
                                                                    {new Intl.NumberFormat('en-US').format(todayStats?.totalStats.totalAmount)}&nbsp;
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
                                                                    {new Intl.NumberFormat('en-US').format(todayStats?.totalStats.totalFee)}&nbsp;
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
                                                    Tiền GDTG còn dư
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-4" style={{ minHeight: 350 }}>
                                                <Donut bankStats={this.state.balance} />
                                                
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm="12" md="6" lg="6">
                                        <Card className="mb-3">
                                            <CardHeader className="card-header-tab">
                                                <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                                    Số tiền GD trong ngày
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-4" style={{ minHeight: 350 }}>
                                                <Donut bankStats={todayStats?.bankStats} />
                                                
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    
                                    <Col sm="12" md="6" lg="6">
                                        <Card className="mb-3">
                                            <CardHeader className="card-header-tab">
                                                <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                                    Phí trong ngày
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-4" style={{ minHeight: 350 }}>
                                                <DonutFeeChart bankStats={todayStats?.bankStats} />
                                                
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm="12" md="6" lg="6">
                                        <Card className="mb-3">
                                            <CardHeader className="card-header-tab">
                                                <div className="card-header-title font-size-lg text-capitalize fw-normal">
                                                    Số GD trong ngày
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-4" style={{ minHeight: 350 }}>
                                                <DonutTransactionChart bankStats={todayStats?.bankStats} />
                                                
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                                <CardHeader className="mbg-3 h-auto ps-0 pe-0 bg-transparent no-border">
                                    <div className="card-header-title fsize-2 text-capitalize fw-normal">
                                        Thống kê bill thanh khoản
                                    </div>
                                    
                                </CardHeader>

                                <Row>
                                    <Col md="6" lg="3">
                                        
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-primary border-primary">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content">
                                                    <h6 className="widget-subheading">Tiền thanh khoản trong tháng</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {new Intl.NumberFormat('en-US').format(billStats?.totalBillMonth)}&nbsp;
                                                                    <small className="opacity-5 text-muted">vnd</small>
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
                                                    <h6 className="widget-subheading">Số thanh khoản tháng trước</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {new Intl.NumberFormat('en-US').format(billStats?.totalBillLastMonth)}&nbsp;
                                                                    <small className="opacity-5 text-muted">vnd</small>
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
                                                    <h6 className="widget-subheading">Số thanh khoản trong tháng</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3 text-danger">
                                                                    {new Intl.NumberFormat('en-US').format(billStats?.countBillMonth)}&nbsp;
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
                                                    <h6 className="widget-subheading">Số thanh khoản tháng trước</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3 text-danger">
                                                                    {new Intl.NumberFormat('en-US').format(billStats?.countBillLastMonth)}&nbsp;
                                                                   
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
                                                    <h6 className="widget-subheading">Tiền thanh khoản trong ngày</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                {new Intl.NumberFormat('en-US').format(billStats?.totalBillToday)}&nbsp;
                                                                <small className="opacity-5 text-muted">vnd</small>
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
                                                    <h6 className="widget-subheading">Số thanh khoản trong ngày</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                {new Intl.NumberFormat('en-US').format(billStats?.countBillToday)}
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
                                                    <h6 className="widget-subheading">Tiền dư trong ngày</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {new Intl.NumberFormat('en-US').format(billStats?.transactionDiffToday)}&nbsp;
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
                                                    <h6 className="widget-subheading">Tiền dư trong tháng</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {new Intl.NumberFormat('en-US').format(billStats?.transactionDiffMonth)}&nbsp;
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
                            </>)}
                            
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </Fragment>
        );
    }
}
