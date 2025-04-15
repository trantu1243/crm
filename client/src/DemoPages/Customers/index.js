import React, { Component, Fragment } from "react";
import Tabs from "react-responsive-tabs";

import { Button, Card, CardBody, Col, Container, Input, Label } from "reactstrap";
import Select from "react-select";

import AppSidebar from "../../Layout/AppSidebar";
import AppHeader from "../../Layout/AppHeader";
import CustomerTable from "./Tables";
import { connect } from "react-redux";
import { fetchTags } from "../../services/tagService";
import { findColorByValue } from "../Tag/Tables";
import { getCustomers, resetFilters, setFilters } from "../../reducers/customerSlice";
import Row from "../Components/GuidedTours/Examples/Row";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const DropdownIndicator = () => null;
const ClearIndicator = () => null;
const IndicatorSeparator = () => null;

export const dummyData = [
    {
        name: "Danh sách user",
        content: <CustomerTable />,
    },
];

const customStyles = {
    multiValue: (styles, { data }) => ({
        ...styles,
        backgroundColor: data.color, 
        color: "white",
        borderRadius: '5px'
    }),
    multiValueLabel: (styles) => ({
        ...styles,
        color: "white",
    }),
    option: (styles, { data }) => ({
        ...styles,
        color: data.color,
        cursor: "pointer",
    }),
};

const sortOptions = [
    {label: 'Thời gian tạo', value: 'createdAt'}, 
    {label: 'Số giao dịch bên mua thành công', value: 'buyerCount.success'},
    {label: 'Số giao dịch bên mua hủy', value: 'buyerCount.cancel'},
    {label: 'Số giao dịch bên bán thành công', value: 'sellerCount.success'},
    {label: 'Số giao dịch bên bán hủy', value: 'sellerCount.cancel'},
]

const listOptions = [
    {label: 'White list', value: 'whitelist'},
    {label: 'Black list', value: 'blacklist'}, 
]

class Customers extends Component {
    constructor(props) {
        super(props);
    
        this.toggle = this.toggle.bind(this);
        this.state = {
            activeTab: "1",
            showMore: true,
            transform: true,
            showInkBar: true,
            items: this.getSimpleTabs() || [],
            selectedTabKey: 0,
            transformWidth: 400,
            isMobile: window.innerWidth < 768,
            tags: [],
        };
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
    }

    componentDidMount() {
        this.getTags();
    }
    
    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 768 });
    };
  
    toggle(tab) {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab,
            });
        }
    }

    getTags = async () => {
        const res = await fetchTags();
        this.setState({
            tags: res.tags.map(item => ({
                label: item.name,
                value: item._id,
                color: findColorByValue(item.color)
            }))
        });
    }

    getSimpleTabs = () =>
        dummyData.map(({ name, content }, index) => ({
            key: index,
            title: name,
            getContent: () => content,
        }));

    render() {

        let filters = this.props.filters || {
            tags: [],
            page: 1,
            limit: 10,
            sortField: 'createdAt',
            facebookId: '',
        };
    
        return (
            <Fragment>
                <AppHeader />
                <div className="app-main">
                    <AppSidebar />
                    <div className="app-main__outer">
                        <div className="app-main__inner" style={this.state.isMobile ? {padding: 0} : {}}>
                            <Container fluid>
                                <Card className="main-card mb-3">
                                    <CardBody onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            this.props.setFilters({ ...this.props.filters, page: 1 });
                                            this.props.getCustomers(this.props.filters);
                                        }}}
                                    >
                                        <Row>
                                            <Col md={3} sm={6} xs={12} className="pe-2 mb-2">
                                                <Label>Tags</Label>
                                                <Select
                                                    isMulti
                                                    options={this.state.tags}
                                                    styles={customStyles}
                                                    value={filters.tags}
                                                    onChange={(value) => {
                                                        this.props.setFilters({
                                                            ...filters,
                                                            tags: value
                                                        })
                                                    }}
                                                    placeholder="Tags ..."
                                                    components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }} 
                                                />
                                            </Col>

                                            <Col md={3} sm={6} xs={12} className="pe-2 mb-2">
                                                <Label>Lọc theo tên, id</Label>
                                                <Input
                                                    type="text"
                                                    name="search"
                                                    id="search"
                                                    placeholder="Tên, facebookId id, ..."
                                                    value={filters?.search || ""}
                                                    onChange={(e) =>
                                                        this.props.setFilters({
                                                            ...filters,
                                                            search: e.target.value,
                                                        })
                                                    }
                                                    style={{ height: "38px" }}
                                                />
                                            </Col>

                                            <Col md={3} sm={6} xs={12} className="pe-2 mb-2">
                                                <Label>Sắp xếp theo</Label>
                                                <Select
                                                    options={sortOptions}
                                                    value={sortOptions.find((item) => item.value === filters.sortField)}
                                                    onChange={(value) => {
                                                        this.props.setFilters({
                                                            ...filters,
                                                            sortField: value.value
                                                        })
                                                    }}
                                                    placeholder="-- Lựa chọn --"
                                                />
                                            </Col>

                                            <Col md={3} sm={6} xs={12} className="pe-2 mb-2">
                                                <Label>Danh sách</Label>
                                                <Select
                                                    options={listOptions}
                                                    value={listOptions.find((item) => item.value === filters.list)}
                                                    onChange={(value) => {
                                                        this.props.setFilters({
                                                            ...filters,
                                                            list: value.value
                                                        })
                                                    }}
                                                    placeholder="-- Lựa chọn --"
                                                />
                                            </Col>

                                        </Row>

                                        <Row>
                                            <div className="btn-actions-pane-right">
                                                <Button
                                                    className="btn-wide me-2 mt-2 btn-dashed" 
                                                    color="primary" 
                                                    onClick={()=>{
                                                        this.props.setFilters({...filters, page: 1});
                                                        this.props.getCustomers(filters);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faSearch} className="me-2"  />
                                                    Tìm kiếm
                                                </Button>
                                            </div>
                                        </Row>
                                    </CardBody>
                                </Card>
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
    filters: state.customer.filters
});
  
const mapDispatchToProps = {
    setFilters,
    getCustomers,
    resetFilters
};
  
export default connect(mapStateToProps, mapDispatchToProps)(Customers);
