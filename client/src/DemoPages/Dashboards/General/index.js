import React, { Component, Fragment } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import {
  Row,
  Col,
  CardHeader,
  Card,
  CardBody,
  DropdownToggle,
  DropdownMenu,
  Nav,
  NavItem,
  ButtonDropdown,
  InputGroup,
} from "reactstrap";
import Select from "react-select";

import Donut from "./Examples/Donut";
import { getBalanceService, getDailyStats, getDailyStatsService, getHourlyStats, getMonthlyStats, getMonthlyStatsService, getTotalBillServiceByDaily, getTotalTransactionService, getYearlyStats } from "../../../services/statisticService";
import Loader from "react-loaders";
import MixedSingleMonth from "./Examples/Mixed";
import { DatePicker } from "react-widgets/cjs";
import DonutTransactionsChart from "../StaffStatistic/Component/DonutTranction";
import { NavLink } from "react-router-dom";
import DatePickerr from "react-datepicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import "react-datepicker/dist/react-datepicker.css"; 
import Hourly from "./Examples/Hourly";
import Monthly from "./Examples/Monthly";
import Yearly from "./Examples/Yearly";
const chartTypes = [
    {label: 'Giờ trong ngày', value: 'hourly'},
    {label: 'Ngày trong tháng', value: 'daily'},
    {label: 'Tháng trong năm', value: 'monthly'},
    {label: 'Theo năm', value: 'yearly'},
]

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
                            margin: 0,
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
            isOpen: false,
            isOpen1: false,
            seriesRadial: [76],
            currentMonthStats: null,
            lastMonthStats: null,
            todayStats: null,
            billStats: null,
            loading: false,
            totalTransaction: null,
            balance: [],
            chartType: 'hourly',
            chartDate: new Date(),
            chartStats: [],
            chartLoading: false,
        };
        this.onDismiss = this.onDismiss.bind(this);
    }

    componentDidMount() {
        this.loadStatistics();
        this.loadChart();
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
            const totalTransaction = await getTotalTransactionService({ day: currentDay, month: currentMonth, year: currentYear });
            this.setState({
                currentMonthStats,
                lastMonthStats,
                todayStats,
                billStats,
                totalTransaction: totalTransaction.data,
                loading: false,
            });
        } catch (error) {
            console.error("Lỗi khi lấy thống kê", error);
            this.setState({ loading: false });
        }
    }

    loadChart = async (date) => {
        try {
            this.setState({ chartLoading: true });
            const today = date || new Date();
            const day = today.getDate();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();

            if (this.state.chartType === 'hourly') {
                const res = await getHourlyStats({ day, month, year });
                this.setState({chartStats: res.mergedStats});
            } else if (this.state.chartType === 'daily') {
                const res = await getDailyStats({ month, year });
                this.setState({chartStats: res.mergedStats});
            } else if (this.state.chartType === 'monthly') {
                const res = await getMonthlyStats({ year });
                this.setState({chartStats: res.mergedStats});
            } else if (this.state.chartType === 'yearly') {
                const res = await getYearlyStats({ year });
                this.setState({chartStats: res.mergedStats});
            }
            this.setState({ chartLoading: false });

        } catch (error) {
            console.error( error);
            this.setState({ chartLoading: false });
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

    renderChartPicker() {
        const today = this.state.chartDate;
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
        switch (this.state.chartType) {
            case "hourly":
                return <Hourly hourlyStats={this.state.chartStats} />;
            case "daily":
                return <MixedSingleMonth dailyStats={this.state.chartStats} daysThisMonth={daysInCurrentMonth} />;
            case "monthly":
                return <Monthly monthlyStats={this.state.chartStats} />;
            case "yearly":
                return <Yearly yearlyStats={this.state.chartStats} year={currentYear} />;
            default:
                return null;
        }
    }

    render() {
        const { loading, currentMonthStats, lastMonthStats, todayStats, billStats, totalTransaction } = this.state;

        let pickerProps = {};

        switch (this.state.chartType) {
            case "hourly":
                pickerProps = { showTimeSelect: false, dateFormat: "dd/MM/yyyy" };
                break;
            case "daily":
                pickerProps = { showMonthYearPicker: true, dateFormat: "MM/yyyy" };
                break;
            case "monthly":
                pickerProps = { showYearPicker: true, dateFormat: "yyyy" };
                break;
            case "yearly":
                pickerProps = {
                    showYearPicker: true,
                    dateFormat: "yyyy",
                };
                break;
            default:
                pickerProps = { showTimeSelect: false, dateFormat: "dd/MM/yyyy" };
                break;
        }

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
                                                <div className="d-inline-block">
                                                    <Fragment>
                                                        <div className="d-inline-block pe-5">
                                                            <DatePicker
                                                                value={this.state.date}
                                                                onChange={this.handleDateChange}
                                                                format="YYYY-MM-DD"
                                                                max={new Date()}
                                                                valueDisplayFormat={{ dateStyle: "medium" }}

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
                                                <ButtonDropdown
                                                    onMouseEnter={() => this.setState({isOpen: true})}
                                                    onMouseLeave={() => this.setState({isOpen: false})}
                                                    isOpen={this.state.isOpen}
                                                    disabled
                                                >
                                                    <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                        <h6 className="widget-subheading">Số lượng GD trong tháng</h6>
                                                        <div className="widget-chart-flex">
                                                            <div className="widget-numbers mb-0 w-100">
                                                                <div className="widget-chart-flex">
                                                                    <div className="fsize-3">
                                                                    {new Intl.NumberFormat('en-US').format(
                                                                        totalTransaction?.currentMonth 
                                                                        ? Object.values(totalTransaction.currentMonth).reduce((sum, item) => sum + item.count, 0) 
                                                                        : 0 
                                                                    )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <DropdownToggle style={{width: 0, height: 0, padding: 0, border: 'none'}}>

                                                            </DropdownToggle>
                                                            <DropdownMenu
                                                                container="body"
                                                                modifiers={[
                                                                    { name: 'offset', options: { offset: [0, 18] } },
                                                                ]}
                                                                right={'false'}
                                                            >
                                                                <Nav vertical>
                                                                    <NavItem>
                                                                    {totalTransaction?.currentMonth &&
                                                                    Object.entries(totalTransaction.currentMonth).map(([statusKey, item], index) => (
                                                                        <NavLink to="#" className="p-2" key={index} style={{ display: "block" }}>
                                                                        <i className="nav-link-icon pe-7s-graph me-2"> </i>
                                                                        <span>{item.name}</span>
                                                                        <div className="ms-auto badge rounded-pill bg-danger me-2" style={{ float: "right" }}>
                                                                            {item.count}
                                                                        </div>
                                                                        </NavLink>
                                                                    ))}

                                                                        
                                                                    </NavItem>
                                                                </Nav>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </ButtonDropdown>
                                            </div>
                                        </Card>
                                    
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-warning border-warning">
                                            <div className="widget-chat-wrapper-outer">
                                                <ButtonDropdown
                                                    onMouseEnter={() => this.setState({isOpen1: true})}
                                                    onMouseLeave={() => this.setState({isOpen1: false})}
                                                    isOpen={this.state.isOpen1}
                                                    disabled
                                                >
                                                    <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                        <h6 className="widget-subheading">Số lượng GD tháng trước</h6>
                                                        <div className="widget-chart-flex">
                                                            <div className="widget-numbers mb-0 w-100">
                                                                <div className="widget-chart-flex">
                                                                    <div className="fsize-3">
                                                                    {new Intl.NumberFormat('en-US').format(
                                                                        totalTransaction?.lastMonth 
                                                                        ? Object.values(totalTransaction.lastMonth).reduce((sum, item) => sum + item.count, 0) 
                                                                        : 0 
                                                                    )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <DropdownToggle style={{width: 0, height: 0, padding: 0, border: 'none'}}>

                                                                </DropdownToggle>
                                                                <DropdownMenu
                                                                    container="body"
                                                                    modifiers={[
                                                                        { name: 'offset', options: { offset: [0, 18] } },
                                                                    ]}
                                                                    right={'false'}
                                                                >
                                                                    <Nav vertical>
                                                                        <NavItem>
                                                                        {totalTransaction?.lastMonth &&
                                                                        Object.entries(totalTransaction.lastMonth).map(([statusKey, item], index) => (
                                                                            <NavLink to="#" className="p-2" key={index} style={{ display: "block" }}>
                                                                            <i className="nav-link-icon pe-7s-graph me-2"> </i>
                                                                            <span>{item.name}</span>
                                                                            <div className="ms-auto badge rounded-pill bg-danger me-2" style={{ float: "right" }}>
                                                                                {item.count}
                                                                            </div>
                                                                            </NavLink>
                                                                        ))}

                                                                            
                                                                        </NavItem>
                                                                    </Nav>
                                                                </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </ButtonDropdown>
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
                                            Thống kê theo biểu đồ
                                        </div>
                                        <div className="page-title-actions" style={{marginLeft: 'auto', textTransform: 'none', fontWeight: 'normal'}}>  
                                            <Fragment>
                                                
                                                <div className="d-inline-block me-4">
                                                    <Row>
                                                        <Col md={6} xs={6} className="p-1">
                                                            <div style={{width: '180px', height: '38px'}}>
                                                                <Select
                                                                    value={chartTypes
                                                                        .find(option => option.value === this.state.chartType)}
                                                                    onChange={async (selected) => {
                                                                        await this.setState({ chartType: selected.value });
                                                                        this.loadChart(this.state.chartDate);
                                                                    }}
                                                                    options={chartTypes}
                                                                    placeholder="Chọn loại biểu đồ"
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col md={6} xs={6} className="p-1">
                                                            <div style={{ width: '180px', height: '38px', display: 'flex', alignItems: 'center' }}>
                                                                <InputGroup>
                                                                    <DatePickerr
                                                                        selected={this.state.chartDate} 
                                                                        onChange={(date) => {
                                                                            this.setState({
                                                                                chartDate: date,
                                                                            });
                                                                            this.loadChart(date);
                                                                        }} 
                                                                        className="form-control" 
                                                                        {...pickerProps}
                                                                        maxDate={new Date()}
                                                                        style={{height: '38px'}}
                                                                    />
                                                                    <div className="input-group-text">
                                                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                                                    </div>
                                                                </InputGroup>   
                                                            </div>
                                                                
                                                        </Col>
                                                    </Row>
                                                   
                                                    
                                                </div>
                                            </Fragment>    
                                        </div>
                                    </CardHeader>
                                    <CardBody className="pt-0">
                                        {this.renderChartPicker()}
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
                                                    Số GD trong ngày
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-4" style={{ minHeight: 350 }}>
                                                <DonutTransactionsChart bankStats={totalTransaction?.today} />
                                                
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
