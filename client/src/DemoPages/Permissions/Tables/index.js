import { Button, Card, CardFooter, CardHeader, Col, Pagination, PaginationItem, PaginationLink, Row, Table } from "reactstrap";

import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from "react-loaders";
import { fetchPermissions } from "../../../services/permissionService";
import { Combobox } from "react-widgets/cjs";

class PermissionTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            permissions: []
        };
    }

    componentDidMount() {
        this.getPermissions()
    }

    getPermissions = async () => {
        this.setState({loading: true});
        const res = await fetchPermissions();
        this.setState({permissions: res.data, loading: false});
    }

    render() { 
        
        return (<Card className="main-card mb-3">
            {this.state.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
               
                <Table responsive hover striped borderless className="align-middle mb-0">
                    <thead>
                        <tr>
                            <th className="text-center">ID</th>
                            <th className="text-center">Tên quyền</th>
                            <th className="text-center">Slug</th>
                        </tr>
                    </thead>
                    <tbody>
                    
                        {this.state.permissions.map((item) => <tr>
                            <td className="text-center text-muted">{item._id.slice(-8)}</td>
                            <td className="text-center text-muted">{item.name}</td>
                            <td className="text-center text-muted">{item.slug}</td>
                        </tr>)}
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                    <Row className="mt-2">
                        <Col md={11}>
                            <Pagination aria-label="Page navigation">
                                <PaginationItem active>
                                    <PaginationLink>
                                        {1}
                                    </PaginationLink>
                                </PaginationItem>
                            </Pagination>
                        </Col>
                        <Col md={1}>
                            <Combobox
                                data={[10, 20, 30, 50, 100]} 
                                defaultValue={[10]} 
                            />
                        </Col>
                    </Row>

                </CardFooter>
            </>)}
        </Card>)
    }
}

const mapStateToProps = (state) => ({
});
  
const mapDispatchToProps = {

};
  
export default connect(mapStateToProps, mapDispatchToProps)(PermissionTable);