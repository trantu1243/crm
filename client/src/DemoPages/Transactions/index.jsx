import React, { Component, Fragment } from "react";
import Tabs from "react-responsive-tabs";

import { Button, Card, CardBody, Col, Container, Input, Label } from "reactstrap";

import Row from "../Components/GuidedTours/Examples/Row";
import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import TransactionsTable from "./Tables";
import { connect } from "react-redux";
import { getTransactions, setFilters } from "../../reducers/transactionsSlice";
import { DatePicker, Multiselect } from "react-widgets/cjs";
import { fetchStaffs } from "../../services/staffService";
import { fetchBankAccounts } from "../../services/bankAccountService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faSearch } from "@fortawesome/free-solid-svg-icons";

export const dummyData = [
  {
    name: "Danh sách giao dịch trung gian",
    content: <TransactionsTable />,
  },
];

export const statusList = [
    { value: 1, name: "Chưa nhận" },
    { value: 2, name: "Thành công" },
    { value: 3, name: "Hủy" },
    { value: 6, name: "Đã nhận" },
    { value: 7, name: "Đang xử lý" },
    { value: 8, name: "Hoàn thành một phần" },
];

class Transactions extends Component {
    constructor(props) {
        super(props);
    
        this.toggle = this.toggle.bind(this);
        this.state = {
            isMobile: window.innerWidth < 768,
            activeTab: "1",
            showMore: true,
            transform: true,
            showInkBar: true,
            items: this.getSimpleTabs() || [],
            selectedTabKey: 0,
            transformWidth: 400,
            loading: false,
            value: [],
            staffs: [],
            bankAccounts: []
        };
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }
    
    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 768 });
    };

    componentDidMount() {
        this.getStaffs()
        this.getBankAccounts()
    }
  
    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab,
            });
        }
    }
  
    getSimpleTabs = () =>
        dummyData.map(({ name, content }, index) => ({
            key: index,
            title: name,
            getContent: () => content,
        }));

    getStaffs = async () => {
        const data = await fetchStaffs();
        this.setState({
            staffs: data.data
        })
    }

    getBankAccounts = async () => {
        const data = await fetchBankAccounts();
        this.setState({
            bankAccounts: data.data
        })
    }

    handleInputChange = (e) => {
        this.props.setFilters({ [e.target.name]: e.target.value });
    };
    
    handleFilter = () => {
        this.props.getTransactions(this.state.filters);
    };

    handleDateChange = (date) => {
        this.props.setFilters({
            startDate: date ? new Date(date[0]).toISOString().split("T")[0] : null,
            endDate: date ? new Date(date[1]).toISOString().split("T")[0] : null,
        });
    };

    render() {
        let { staffs, bankAccounts } = this.state;
        let filters = this.props.filters || {
            staffId: [],
            status: [],
            bankId: [],
            minAmount: "",
            maxAmount: "",
            startDate: "",
            endDate: "",
            content: "",
            page: 1,
            limit: 10,
        };
    
        return (
            <Fragment>
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner" style={this.state.isMobile ? {padding: 0} : {}}>
                            <Container fluid>
                                <Row>
                                    <Col md="12">
                                        <Card className="main-card mb-3">
                                            <CardBody onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    this.props.setFilters({ ...this.props.filters, page: 1 });
                                                    this.props.getTransactions(this.props.filters);
                                                }}}
                                            >
                                                <Row>
                                                    <Col md={3} xs={12} className="pe-2 mb-2">
                                                        <Label>Nhân viên</Label>
                                                        <Multiselect
                                                            data={staffs}
                                                            value={staffs.filter((s) => filters?.staffId?.includes(s._id))}
                                                            onChange={(selected) =>
                                                                this.props.setFilters({
                                                                    ...filters,
                                                                    staffId: selected.map((s) => s._id),
                                                                })
                                                            }
                                                            textField="name_staff"
                                                            valueField="_id"
                                                            placeholder="Chọn nhân viên"
                                                        />
                                                    </Col>
    
                                                    <Col md={3} xs={12} className="pe-2 mb-2">
                                                        <Label>Trạng thái</Label>
                                                        <Multiselect
                                                            data={statusList}
                                                            value={statusList.filter((s) => filters?.status?.includes(s.value))}
                                                            onChange={(selected) =>
                                                                this.props.setFilters({
                                                                    ...filters,
                                                                    status: selected.map((s) => s.value),
                                                                })
                                                            }
                                                            textField="name"
                                                            valueField="value"
                                                            placeholder="Chọn trạng thái"
                                                        />
                                                    </Col>
    
                                                    <Col md={3} xs={12} className="pe-2 mb-2">
                                                        <Label>Ngân hàng</Label>
                                                        <Multiselect
                                                            data={bankAccounts}
                                                            value={bankAccounts.filter((b) => filters?.bankId?.includes(b._id))}
                                                            onChange={(selected) =>
                                                                this.props.setFilters({
                                                                    ...filters,
                                                                    bankId: selected.map((b) => b._id),
                                                                })
                                                            }
                                                            textField="bankName"
                                                            valueField="_id"
                                                            placeholder="Chọn ngân hàng"
                                                        />
                                                    </Col>
    
                                                    <Col md={3} xs={12} className="pe-2 mb-2">
                                                        <Label for="content">Nội dung</Label>
                                                        <Input
                                                            type="text"
                                                            name="content"
                                                            id="content"
                                                            placeholder="Nhập nội dung"
                                                            value={filters?.content || ""}
                                                            onChange={(e) =>
                                                                this.props.setFilters({
                                                                    ...filters,
                                                                    content: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </Col>
                                                </Row>
    
                                                <Row>
                                                    <Col md={3} xs={12} className="pe-2 mb-2">
                                                        <Label>Số tiền min</Label>
                                                        <Input
                                                            type="text"
                                                            value={new Intl.NumberFormat('en-US').format(filters?.minAmount || 0)}
                                                            onChange={(e) => {
                                                                let rawValue = e.target.value.replace(/,/g, ''); // Xóa dấu phẩy để xử lý số
                                                                let numericValue = parseInt(rawValue, 10) || 0; // Chuyển thành số nguyên

                                                                this.props.setFilters({
                                                                    ...filters,
                                                                    minAmount: numericValue < 0 ? 0 : numericValue, // Đảm bảo không có số âm
                                                                });
                                                            }}
                                                            className="form-control"
                                                        />
                                                    </Col>

                                                    <Col md={3} xs={12} className="pe-2 mb-2">
                                                        <Label>Số tiền max</Label>
                                                        <Input
                                                            type="text"
                                                            value={new Intl.NumberFormat('en-US').format(filters?.maxAmount || 0)}
                                                            onChange={(e) => {
                                                                let rawValue = e.target.value.replace(/,/g, ''); // Xóa dấu phẩy để xử lý số
                                                                let numericValue = parseInt(rawValue, 10) || 0; // Chuyển thành số nguyên

                                                                this.props.setFilters({
                                                                    ...filters,
                                                                    maxAmount: numericValue < 0 ? 0 : numericValue, // Đảm bảo không có số âm
                                                                });
                                                            }}
                                                            className="form-control"
                                                        />
                                                    </Col>
                                                    <Col md={3} xs={12} className="pe-2 mb-2">
                                                        <Label>Start Date</Label>
                                                        <DatePicker
                                                            selected={filters?.startDate ? new Date(filters.startDate) : null}
                                                            selectsStart
                                                            startDate={filters?.startDate ? new Date(filters.startDate) : null}
                                                            endDate={filters?.endDate ? new Date(filters.endDate) : null}
                                                            onChange={(date) =>
                                                                this.props.setFilters({
                                                                    ...filters,
                                                                    startDate: date ? date.toISOString() : "",
                                                                })
                                                            }
                                                            dateFormat="yyyy-MM-dd"
                                                        />
                                                    </Col>
                                                    <Col md={3} xs={12} className="pe-2 mb-2">
                                                        <Label>End Date</Label>
                                                        <DatePicker
                                                            selected={filters?.endDate ? new Date(filters.endDate) : null}
                                                            selectsEnd
                                                            startDate={filters?.startDate ? new Date(filters.startDate) : null}
                                                            endDate={filters?.endDate ? new Date(filters.endDate) : null}
                                                            onChange={(date) =>
                                                                this.props.setFilters({
                                                                    ...filters,
                                                                    endDate: date ? date.toISOString() : "",
                                                                })
                                                            }
                                                            dateFormat="yyyy-MM-dd"
                                                        />
                                                    </Col>

                                                </Row>
    
                                                <Row>
                                                    <div className="btn-actions-pane-right">
                                                        <div>
                                                            <Button 
                                                                className="btn-wide me-2 mt-2 btn-dashed w-50" 
                                                                color="primary" 
                                                                onClick={()=>{
                                                                    this.props.setFilters({...filters, page: 1});
                                                                    this.props.getTransactions(filters);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faSearch} className="me-2"  />
                                                                Tìm kiếm
                                                            </Button>
                                                            <Button className="btn-wide me-2 mt-2 btn-dashed w-50" color="info">
                                                                <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                                                                Xuất
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </Container>

                            <Container fluid>
                                <div className="mb-3">
                                        <Tabs tabsWrapperClass="card-header" {...this.state} />
                                </div>
                            </Container>
                        </div>
                    </div>
                </div>
            </Fragment>
        );
    }    
}

const mapStateToProps = (state) => ({
    transactions: state.transactions.transactions,
    filters: state.transactions.filters,
    loading: state.transactions.loading  || false,
});
  
const mapDispatchToProps = {
    getTransactions,
    setFilters
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Transactions);
