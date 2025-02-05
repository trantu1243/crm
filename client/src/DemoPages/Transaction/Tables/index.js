import { Sparklines, SparklinesBars, SparklinesLine } from "react-sparklines";
import { Button, ButtonGroup, Card, CardFooter, CardHeader, Table } from "reactstrap";


import avatar1 from "../../../assets/utils/images/avatars/1.jpg";
import avatar2 from "../../../assets/utils/images/avatars/2.jpg";
import avatar3 from "../../../assets/utils/images/avatars/3.jpg";
import avatar4 from "../../../assets/utils/images/avatars/4.jpg";
import { Component } from "react";
import data, { formatDate } from "./data";
import StatusBadge from "./StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";

function boxMullerRandom() {
    let phase = true,
      x1,
      x2,
      w;
  
    return (function () {
      if (phase) {
        do {
          x1 = 2.0 * Math.random() - 1.0;
          x2 = 2.0 * Math.random() - 1.0;
          w = x1 * x1 + x2 * x2;
        } while (w >= 1.0);
  
        w = Math.sqrt((-2.0 * Math.log(w)) / w);
        return x1 * w;
      } else {
        return x2 * w;
      }
    })();
  }
  
  function randomData(n = 30) {
    return Array.apply(0, Array(n)).map(boxMullerRandom);
  }
  
  const sampleData = randomData(10);

export default class TransactionsTable extends Component {
    render() { 
        return <Card className="main-card mb-3">
        <CardHeader className="mt-2">
            <Button className={"btn btn-sm btn-info me-1 al-min-width-max-content"} style={{minWidth: "max-content"}}>
                + Tạo GDTG
            </Button>
            <h3 className="text-center w-100">Tổng số GD: <span className="text-danger fw-bold">81269</span></h3>
            <div className="btn-actions-pane-right">
                <ButtonGroup size="sm">
                    <Button caret="true" color="focus" className={"active"}>
                        Last Week
                    </Button>
                    <Button caret="true" color="focus">
                        All Month
                    </Button>
                </ButtonGroup>
          </div>
        </CardHeader>
        <Table responsive hover striped borderless className="align-middle mb-0">
          <thead>
            <tr>
                <th className="text-center">ID</th>
                <th className="text-center">Thời gian</th>
                <th className="text-center">Ngân hàng</th>
                <th className="text-center">Số tiền</th>
                <th className="text-center">Phí</th>
                <th className="text-center">Tổng tiền</th>
                <th className="text-center">Tiền tip</th>
                <th className="text-center">Nội dung</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Nhân viên</th>
                <th className="text-center">Box</th>
                <th className="text-center">#</th>

            </tr>
          </thead>
          <tbody>
            
            {data.map((item) => <tr>
                <td className="text-center text-muted">{item._id.slice(-8)}</td>
                <td className="text-center text-muted">{formatDate(item.createdAt)}</td>
                <td className="text-center text-muted">{item.bankId.bankCode}</td>
                <td className="text-center text-muted">{item.amount.toLocaleString()}</td>
                <td className="text-center text-muted">{item.fee.toLocaleString()}</td>
                <td className="text-center text-muted">{item.totalAmount.toLocaleString()}</td>
                <td className="text-center text-muted">{item.bonus.toLocaleString()}</td>
                <td className="text-center text-muted">{item.content}</td>
                <StatusBadge status={item.status} />
                <td><img width={40} className="rounded-circle" src={item.staffId.avatar} alt={item.staffId.name_staff}/></td>
                <td><a href="https://www.messenger.com/t/8681198405321843"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>

            </tr>)}
            
            
            <tr>
              <td className="text-center text-muted">#347</td>
              <td>
                <div className="widget-content p-0">
                  <div className="widget-content-wrapper">
                    <div className="widget-content-left me-3">
                      <div className="widget-content-left">
                        <img width={40} className="rounded-circle" src={avatar1} alt=""/>
                      </div>
                    </div>
                    <div className="widget-content-left flex2">
                      <div className="widget-heading">
                        Ruben Tillman
                      </div>
                      <div className="widget-subheading opacity-7">
                        Etiam sit amet orci eget
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-center">Berlin</td>
              <td className="text-center">
                <div className="badge bg-success">Completed</div>
              </td>
              <td className="text-center" style={{ width: "150px" }}>
                <Sparklines height={60} data={sampleData}>
                  <SparklinesBars
                    style={{
                      stroke: "none",
                      fill: "#3ac47d",
                      fillOpacity: ".5",
                    }}/>
                </Sparklines>
              </td>
              <td className="text-center">
                <Button size="sm" color="primary" id={"PopoverCustomT-2"}>
                  Details
                </Button>
      
              </td>
            </tr>
            <tr>
              <td className="text-center text-muted">#321</td>
              <td>
                <div className="widget-content p-0">
                  <div className="widget-content-wrapper">
                    <div className="widget-content-left me-3">
                      <div className="widget-content-left">
                        <img width={40} className="rounded-circle" src={avatar3} alt=""/>
                      </div>
                    </div>
                    <div className="widget-content-left flex2">
                      <div className="widget-heading">Elliot Huber</div>
                      <div className="widget-subheading opacity-7">
                        Lorem ipsum dolor sic
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-center">London</td>
              <td className="text-center">
                <div className="badge bg-danger">In Progress</div>
              </td>
              <td className="text-center" style={{ width: "150px" }}>
                <Sparklines height={60} data={sampleData}>
                  <SparklinesBars
                    style={{
                      stroke: "none",
                      fill: "#d92550",
                      fillOpacity: ".5",
                    }}/>
                </Sparklines>
              </td>
              <td className="text-center">
                <Button size="sm" color="primary" id={"PopoverCustomT-3"}>
                  Details
                </Button>
            
              </td>
            </tr>
            <tr>
              <td className="text-center text-muted">#55</td>
              <td>
                <div className="widget-content p-0">
                  <div className="widget-content-wrapper">
                    <div className="widget-content-left me-3">
                      <div className="widget-content-left">
                        <img width={40} className="rounded-circle" src={avatar4} alt=""/>
                      </div>
                    </div>
                    <div className="widget-content-left flex2">
                      <div className="widget-heading">
                        Vinnie Wagstaff
                      </div>
                      <div className="widget-subheading opacity-7">
                        UI Designer
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td className="text-center">Amsterdam</td>
              <td className="text-center">
                <div className="badge bg-info">On Hold</div>
              </td>
              <td className="text-center" style={{ width: "150px" }}>
                <Sparklines height={60} data={sampleData}>
                  <SparklinesLine
                    style={{
                      strokeWidth: 3,
                      stroke: "#f7b924",
                      fill: "#f7b924",
                      fillOpacity: ".2",
                    }}/>
                </Sparklines>
              </td>
              <td className="text-center">
                <Button size="sm" color="primary" id={"PopoverCustomT-4"}>
                  Details
                </Button>
      
              </td>
            </tr>
          </tbody>
        </Table>
        <CardFooter className="d-block text-center">
          <Button className="me-2 btn-icon btn-icon-only" outline color="danger">
            <i className="pe-7s-trash btn-icon-wrapper"> </i>
          </Button>
          <Button className="btn-wide" color="success">
            Save
          </Button>
        </CardFooter>
      </Card>
    }
}