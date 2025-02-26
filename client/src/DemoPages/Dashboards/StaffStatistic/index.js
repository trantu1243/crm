import React, { Component, Fragment } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import {
  Row,
  Col,
  CardHeader,
  Card,
  CardBody,
  ButtonDropdown,
  DropdownMenu,
  Nav,
  NavItem,
  DropdownToggle,
} from "reactstrap";
import Select from "react-select";

import { getBalanceServiceByStaff, getDailyStatsServiceByStaff, getMonthlyStatsServiceByStaff, getTotalBillServiceByStaffDaily, getTotalBillServiceByStaffMonthly, getTransactionStatsServiceByStaff } from "../../../services/statisticService";
import Loader from "react-loaders";
import city3 from "../../../assets/utils/images/dropdown-header/city3.jpg";

import { DatePicker } from "react-widgets/cjs";
import MixedSingleMonth from "../General/Examples/Mixed";
import DonutFeeChart from "../General/Examples/DonutFee";
import DonutChart from "../General/Examples/Donut";
import { connect } from "react-redux";
import { SERVER_URL } from "../../../services/url";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { fetchStaffs } from "../../../services/staffService";
import { NavLink } from "react-router-dom";
import DonutTransactionChart from "./Component/DonutTranction";

class StaffStatistic extends Component {
    constructor(props) {
        super(props);

        this.togglePop1 = this.togglePop1.bind(this);

        this.state = {
            visible: true,
            popoverOpen1: false,
            date: new Date(),
            staff: this.props.user,
            staffs: [],
            staffId: this.props.user._id,
            isOpen: false,
            isOpen1: false,
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
            seriesRadial: [76],
            currentMonthStats: null,
            lastMonthStats: null,
            todayStats: null,
            totalBillMonthly: null,
            lastTotalBillMonthly: null,
            totalBillDaily: null,
            transationStats: {
                currentMonth: [],
                lastMonth: [],
                today: []
            },
            loading: false,
        };
        this.onDismiss = this.onDismiss.bind(this);
    }

    componentDidMount() {
        const today = new Date();
        this.loadStatistics(today, this.props.user._id);
        if (this.props.user.is_admin === 1 ) this.getStaffs()
    }

    getStaffs = async () => {
        const data = await fetchStaffs();
        this.setState({
            staffs: data.data
        })
    }

    handleDateChange = async (date) => {
        this.setState({ date });
        await this.loadStatistics(date, this.state.staffId); 
    };

    async loadStatistics(selectedDate, staffId) {
        try {
            this.setState({ loading: true });
        
            const today = selectedDate;
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();
            const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            const currentDay = today.getDate();
        
            const currentMonthStats = await getMonthlyStatsServiceByStaff({ month: currentMonth, year: currentYear, staffId});
            const lastMonthStats = await getMonthlyStatsServiceByStaff({ month: lastMonth, year: lastYear, staffId});
            const todayStats = await getDailyStatsServiceByStaff({ day: currentDay, month: currentMonth, year: currentYear, staffId });
            const transationStats = await getTransactionStatsServiceByStaff({ day: currentDay, month: currentMonth, year: currentYear, staffId });
            const balanceStats = await getBalanceServiceByStaff({ day: currentDay, month: currentMonth, year: currentYear, staffId });
            
            const totalBillMonthly = await getTotalBillServiceByStaffMonthly({ month: currentMonth, year: currentYear, staffId});
            const lastTotalBillMonthly = await getTotalBillServiceByStaffMonthly({ month: lastMonth, year: lastYear, staffId});
            const totalBillDaily = await getTotalBillServiceByStaffDaily({ day: currentDay, month: currentMonth, year: currentYear, staffId });


            this.setState({
                currentMonthStats,
                lastMonthStats,
                todayStats,
                totalBillMonthly,
                lastTotalBillMonthly,
                totalBillDaily,
                transationStats: transationStats.data,
                loading: false,
                staff: currentMonthStats.staff
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
                                                <span className="d-inline-block">Thống kê theo nhân viên</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="page-title-actions">
                                            <Fragment>
                                                {this.props.user.is_admin === 1  && <div className="d-inline-block me-2">
                                                    <Fragment>
                                                        <div className="d-inline-block" style={{width: 212}}>
                                                            <Select
                                                                value={this.state.staffs
                                                                    .map(item => ({ value: item._id, label: item.name_staff }))
                                                                    .find(option => option.value === this.state.staffId) || null}
                                                                onChange={selected => {
                                                                        this.setState({ staffId: selected.value });
                                                                        this.loadStatistics(this.state.date, selected.value); 
                                                                    }
                                                                }
                                                                options={this.state.staffs.map(item => ({
                                                                    value: item._id,
                                                                    label: item.name_staff
                                                                }))}
                                                                placeholder="Chọn nhân viên"
                                                            />
                                                        </div>
                                                    </Fragment>    
                                                </div>}
                                                <div className="d-inline-block">
                                                    <Fragment>
                                                        <div className="d-inline-block">
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
                                <div className="dropdown-menu-header" style={{borderRadius: '0.25rem', overflow: 'hidden', zIndex: 0}}>
                                    <div className="dropdown-menu-header-inner bg-primary">
                                        <div className="menu-header-image opacity-2"
                                            style={{
                                                backgroundImage: "url(" + city3 + ")"
                                            }}/>
                                        <div className="menu-header-content text-start">
                                            <div className="widget-content p-0">
                                                <div className="widget-content-wrapper">
                                                    <div className="widget-content-left me-3">
                                                        <img className="rounded-circle" src={`${SERVER_URL}${this.state.staff.avatar ? this.state.staff.avatar : '/images/avatars/avatar.jpg'}`} alt="" style={{width: 60, height: 60, objectFit: 'cover'}}/>
                                                    </div>
                                                    <div className="widget-content-left">
                                                        <div className="widget-heading" style={{fontSize: '18px'}}>
                                                            {this.state.staff.name_staff}
                                                        </div>
                                                        <div className="widget-subheading opacity-8" style={{fontSize: '15px'}}>
                                                            {this.state.staff.email}
                                                        </div>
                                                    </div>
                                                    <div className="widget-content-right">
                                                        <a href={`tel:${this.state.staff.phone_staff ? this.state.staff.phone_staff : ''}`} rel="noreferrer" target="_blank" className="btn btn-success me-2">
                                                            <FontAwesomeIcon icon={faPhone} size="lg"/>
                                                        </a>
                                                        <a href={`https://www.facebook.com/${this.state.staff.uid_facebook ? this.state.staff.uid_facebook : ''}`} rel="noreferrer" target="_blank" className="btn btn-info me-2">
                                                            <FontAwesomeIcon icon={faFacebook} size="lg"/>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Row>
                                    <Col md="6" lg="3">
                                        
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-primary border-primary">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
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
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
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
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
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
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
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
                                                >
                                                    <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                    
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
                                                                    {Object.entries(this.state.transationStats.currentMonth).map(([statusKey, item], index) => {
                                                                        return (
                                                                            <NavLink to="#" className="p-2" key={index} style={{display: 'block'}}>
                                                                                <i className="nav-link-icon pe-7s-graph me-2"> </i>
                                                                                <span>{item.name}</span>
                                                                                <div className="ms-auto badge rounded-pill bg-danger me-2" style={{ float: 'right' }}>
                                                                                    {item.count}
                                                                                </div>
                                                                            </NavLink>
                                                                        );
                                                                    })}
                                                                        
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
                                                >
                                                    <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                    
                                                        <h6 className="widget-subheading">Số lượng GD trong tháng</h6>
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
                                                                    {Object.entries(this.state.transationStats.lastMonth).map(([statusKey, item], index) => {
                                                                        return (
                                                                            <NavLink to="#" className="p-2" key={index} style={{display: 'block'}}>
                                                                                <i className="nav-link-icon pe-7s-graph me-2"> </i>
                                                                                <span>{item.name}</span>
                                                                                <div className="ms-auto badge rounded-pill bg-danger me-2" style={{ float: 'right' }}>
                                                                                    {item.count}
                                                                                </div>
                                                                            </NavLink>
                                                                        );
                                                                    })}
                                                                        
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
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
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
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
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
                                                    Số tiền GD trong ngày
                                                </div>
                                            
                                            </CardHeader>
                                            <CardBody className="p-4" style={{ minHeight: 350 }}>
                                                <DonutChart bankStats={todayStats?.bankStats} />
                                                
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
                                                <DonutTransactionChart bankStats={this.state.transationStats.today} />
                                                
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
                                    <Col   Col md="6" lg="4">
                                        
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-primary border-primary">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                    <h6 className="widget-subheading">Số tiền thanh khoản trong ngày</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {new Intl.NumberFormat('en-US').format(this.state.totalBillDaily?.totalBills)}&nbsp;
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
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                    <h6 className="widget-subheading">Số lệnh trong ngày</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {this.state.totalBillDaily?.dailyShare2.toFixed(2)} ({this.state.totalBillDaily?.dailyShare1.toFixed(2)})&nbsp;
                                                                    
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                        
                                    </Col>

                                    <Col   Col md="6" lg="4">
                                        
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-danger border-danger">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                    <h6 className="widget-subheading">Số tiền thanh khoản trong tháng</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {new Intl.NumberFormat('en-US').format(this.state.totalBillMonthly?.totalBills)}&nbsp;
                                                                    <small className="opacity-5 text-muted">vnd</small>
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    
                                    
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-danger border-danger">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                    <h6 className="widget-subheading">Số lệnh trong tháng</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {this.state.totalBillMonthly?.share2.toFixed(2)} ({this.state.totalBillMonthly?.share.toFixed(2)})&nbsp;
                                                                    
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                        
                                    </Col>

                                    <Col   Col md="6" lg="4">
                                        
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-success border-success">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                    <h6 className="widget-subheading">Số tiền thanh khoản tháng trước</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {new Intl.NumberFormat('en-US').format(this.state.lastTotalBillMonthly?.totalBills)}&nbsp;
                                                                    <small className="opacity-5 text-muted">vnd</small>
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    
                                    
                                        <Card className="card-shadow-primary mb-3 widget-chart widget-chart2 text-start mb-3 card-btm-border card-shadow-success border-success">
                                            <div className="widget-chat-wrapper-outer">
                                                <div className="widget-chart-content" style={{ zIndex: 0 }}>
                                                    <h6 className="widget-subheading">Số lệnh tháng trước</h6>
                                                    <div className="widget-chart-flex">
                                                        <div className="widget-numbers mb-0 w-100">
                                                            <div className="widget-chart-flex">
                                                                <div className="fsize-3">
                                                                    {this.state.lastTotalBillMonthly?.share2.toFixed(2)} ({this.state.lastTotalBillMonthly?.share.toFixed(2)})&nbsp;
                                                                    
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
const mapStateToProps = (state) => ({
    user: state.user.user || {
        _id: '',
    }
});
  
const mapDispatchToProps = {

};
  
export default connect(mapStateToProps, mapDispatchToProps)(StaffStatistic);