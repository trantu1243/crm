import { Button, Card, CardFooter, CardHeader, Col, FormText, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import Select from "react-select";

import React, { Component } from "react";
import { formatDate } from "./data";
import StatusBadge from "./StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookMessenger } from "@fortawesome/free-brands-svg-icons";
import { findTransactionsByStatus, getTransactions, getTransactionsNoLoad, searchTransactions, searchTransactionsNoload, setFilters } from "../../../reducers/transactionsSlice";
import { connect } from "react-redux";
import TransactionsPagination from "./PaginationTable";
import { Combobox } from "react-widgets/cjs";
import Loader from "react-loaders";
import { faCheck, faCircle, faCopy, faExclamationTriangle, faInfoCircle, faLock, faMinus, faPen, faPlus, faSpinner, faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { cancelTransaction, confirmTransaction, createTransaction, updateTransaction } from "../../../services/transactionService";
import { fetchFee } from "../../../services/feeService";
import cx from "classnames";
import { typeFee } from "../../CreateTransaction";
import { undoBox } from "../../../reducers/boxSlice";
import { SERVER_URL } from "../../../services/url";
import CopyToClipboard from "react-copy-to-clipboard";
import SweetAlert from 'react-bootstrap-sweetalert';
import { fetchBankApi } from "../../../services/bankApiService";
import { createBill } from "../../../services/billService";
import { Tooltip as ReactTooltip } from "react-tooltip";
import QRCodeComponent from "../../CreateTransaction/QRCode";
import { getFBInfo } from "../../../services/boxService";
import {
    IoIosRefresh,
  } from "react-icons/io";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { transformTags } from "../../Box";
import { fetchTags } from "../../../services/tagService";
import { findColorByValue } from "../../Tag/Tables";

library.add(
    fab,
    faSpinner,
);

const DropdownIndicator = () => null;
const ClearIndicator = () => null;
const IndicatorSeparator = () => null;

const customStyles = {
    multiValue: (styles, { data }) => ({
        ...styles,
        backgroundColor: data.color, 
        color: "white",
        borderRadius: '3px'
    }),
    multiValueLabel: (styles) => ({
        ...styles,
        color: "white",
        zIndex: 13,
    }),
    option: (styles, { data, isFocused, isSelected }) => ({
        ...styles,
        color: data.color,
        cursor: "pointer",
    }),
};

const statusList = [
    { value: 0, name: "Tất cả" },
    { value: 1, name: "Chưa nhận" },
    { value: 2, name: "Thành công" },
    { value: 3, name: "Hủy" },
    { value: 6, name: "Đã nhận" },
    { value: 7, name: "Đang xử lý" },
    { value: 8, name: "Hoàn thành một phần" },
    { value: 4, name: "Có ghi chú chưa hoàn thành" },
    { value: 5, name: "Box bị khóa" },
    { value: 9, name: "Bị thiếu thông tin khách hàng" },
];

class TransactionsTable extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isMobile: window.innerWidth < 768,
            bankAccounts: this.props.bankAccounts,
            fee: [],
            banks: [],
            show: false,
            modal: false,
            undoModal: false,
            undoTransaction: null,
            createModal: false,
            updateModal: false,
            cancelModal: false,
            confirmTransactionModal: false,
            confirmTransaction: null,
            updateTransaction: null,
            cancelTransaction: null,
            loading: false,
            getLoading: false,
            textCopy: '',
            copied: false,
            alert: false,
            search: '',
            errorMsg: '',
            isBuyerToggleOn: false,
            isSellerToggleOn: false,
            boxAmount: 0,
            boxId: '',
            buyerSender: null,
            sellerSender: null,
            status: '',
            input: {
                amount: '',
                bankId: '',
                bonus: '0',
                content: '',
                fee: '',
                messengerId: '',
                typeFee: 'buyer',
                typeBox: 'facebook',
                isToggleOn: true,
            },
            update: {
                amount: '',
                bankId: '',
                bonus: '0',
                content: '',
                fee: '',
                messengerId: '',
                typeFee: 'buyer',
                typeBox: 'facebook',
                isEncrypted: false,
            },
            buyer: {
                bankCode: '', 
                stk: '', 
                content: '', 
                amount: '', 
                bonus: 0
            },
            seller: {
                bankCode: '', 
                stk: '', 
                content: '', 
                amount: '', 
                bonus: 0
            },
            tags: [],
            updateTag: {
                tags: [],
                sellerTags: [],
                buyerTags: [],
            }
        };

        this.toggle = this.toggle.bind(this);
        this.toggleUndo = this.toggleUndo.bind(this);
        this.toggleConfirmTransaction = this.toggleConfirmTransaction.bind(this)
        this.toggleCreate = this.toggleCreate.bind(this);
        this.toggleUpdate = this.toggleUpdate.bind(this);
        this.toggleCancel = this.toggleCancel.bind(this);
        this.handleBuyerClick = this.handleBuyerClick.bind(this);
        this.handleSellerClick = this.handleSellerClick.bind(this);
    }
    
    componentDidMount() {
        this.props.getTransactions({});
        window.addEventListener("resize", this.updateScreenSize);
        this.getFee();
        this.getBanks();
        this.getTags();
        document.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScreenSize);
        document.removeEventListener("keydown", this.handleKeyDown);
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.filters.page !== this.props.filters.page) {
            this.props.getTransactions(this.props.filters)
        }
        if (prevProps.filters.limit !== this.props.filters.limit) {
            this.props.getTransactions(this.props.filters)
        }
        if (prevProps.bankAccounts !== this.props.bankAccounts) {
            this.setState({bankAccounts: this.props.bankAccounts});
        }
    }

    handleKeyDown = (e) => {
        if (e.key === "Enter" && !this.state.loading) {
            if (this.state.confirmTransactionModal) {
                this.handleConfirmTransaction();
            } else if (this.state.cancelModal) {
                this.handleCancel();
            } else if (this.state.undoModal) {
                this.handleUndo();
            }
        }
    };

    toggle() {
        this.setState({
            modal: !this.state.modal,
        });
    }

    toggleUndo() {
        this.setState({
            undoModal: !this.state.undoModal,
        });
    }

    toggleCreate() {
        this.setState({
            createModal: !this.state.createModal,
        });
    }

    toggleUpdate() {
        this.setState({
            updateModal: !this.state.updateModal,
        });
    }

    toggleCancel() {
        this.setState({
            cancelModal: !this.state.cancelModal,
        });
    }

    toggleConfirmTransaction() {
        this.setState({
            confirmTransactionModal: !this.state.confirmTransactionModal,
        });
    }

    handleBuyerClick = () => {
        this.setState((prevState) => ({
            isBuyerToggleOn: !prevState.isBuyerToggleOn
        }));
    };

    handleSellerClick = () => {
        this.setState((prevState) => ({
            isSellerToggleOn: !prevState.isSellerToggleOn
        }));
    };

    onCopy = () => {
        this.setState({ copied: true });
    };

    updateScreenSize = () => {
        this.setState({ isMobile: window.innerWidth < 768 });
    };

    getFee = async () => {
        const data = await fetchFee();
        this.setState({
            fee: data.data
        })
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

    getBanks = async () => {
        const data = await fetchBankApi();
        this.setState({
            banks: data.data
        })
    }

    handleClick = () => {
        this.setState((prevState) => ({
            input: {
                ...prevState.input,
                isToggleOn: !prevState.input.isToggleOn
            }
        }));
    };

    handleAmountChange = (value) => {
        let fee = 0;
        const feeItem = this.state.fee.find(item => value >= item.min && value <= item.max);
        if (feeItem) {
            fee = feeItem.feeDefault;
        }
    
        this.setState((prevState) => ({
            input: {
                ...prevState.input,
                amount: value < 0 ? 0 : value,
                fee: fee,
            },
        }));
    };
    
    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            input: {
                ...prevState.input,
                [name]: value,
            },
        }));
    };

    handleConfirmTransaction = async () => {
        try {        
            this.setState({loading: true});          
            const res = await confirmTransaction(this.state.confirmTransaction._id);
            if (res.status) {
                await this.props.getTransactionsNoLoad(this.props.filters)
            }
            this.toggleConfirmTransaction();  
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.toggleConfirmTransaction();  
            this.setState({loading: false});
        }
    }

    handleUpdateChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            update: {
                ...prevState.update,
                [name]: value,
            },
        }));
    };

    handleSubmit = async (e) => {
        try{
            e.preventDefault();
            this.setState({loading: true});
            const res = await createTransaction(this.state.input);
            this.setState({loading: false});
            window.location.href = `/transaction/${res.transaction._id}`;
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.toggleCreate()
            this.setState({loading: false})
        }
    };

    handleUpdate = async (e) => {
        try{
            e.preventDefault();
            this.setState({loading: true});
            const res = await updateTransaction(this.state.updateTransaction?._id, this.state.update);
            this.setState({
                updateTransaction: res.transaction,
                textCopy: `🏦 ${res.transaction.bankId.bankAccount} tại ${res.transaction.bankId.bankName} - ${res.transaction.bankId.bankAccountName}\n💵 Số tiền: ${new Intl.NumberFormat('en-US').format(res.transaction.amount)} vnd\n💎 Phí: ${new Intl.NumberFormat('en-US').format(res.transaction.fee)} vnd\n📝 Nội dung: ${res.transaction.content} ${res.transaction.checkCode}\n-----------------------\n🎯 Check tại: https://check.tathanhan.com/${res.transaction.checkCode}`,
            });
            await this.props.getTransactionsNoLoad(this.props.filters)
            this.setState({loading: false});
           
        } catch(error) {
            this.setState({
                alert: true,
                errorMsg: error
            });
            this.toggleUpdate()
            this.setState({loading: false})
        }
    }

    handleUndo = async () => {
        try{
            this.setState({loading: true});
            await this.props.undoBox(this.state.undoTransaction?.boxId._id);
            await this.props.getTransactionsNoLoad(this.props.filters)
            this.toggleUndo()    
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.toggleUndo()    
            this.setState({loading: false});
        }
    }

    handleCancel = async (e) => {
        try {          
            this.setState({loading: true});
            await cancelTransaction(this.state.cancelTransaction._id);
            await this.props.getTransactionsNoLoad(this.props.filters)
            this.toggleCancel();          
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
            this.toggleCancel();          
            this.setState({loading: false});
        }
    }

    handleSearch = async (e) => {
        try {
            await this.props.setFilters({
                ...this.props.filters,
                search: this.state.search,
                page: 1
            });
            await this.props.getTransactions(this.props.filters);
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
        }
    }

    handleStatus = async (value) => {
        try {
            if (value === 0) {
                this.setState({search: ''});
                await this.props.setFilters({
                    ...this.props.filters,
                    status: [], 
                    hasNotes: false,
                    isMissing: false,
                    isLocked: false,
                    search: '',
                    page: 1
                });
            } else if (value === 4) {
                await this.props.setFilters({
                    ...this.props.filters,
                    status: [], 
                    isLocked: false,
                    isMissing: false,
                    hasNotes: true, 
                    page: 1
                });
            } else if (value === 5) {
                await this.props.setFilters({
                    ...this.props.filters,
                    status: [], 
                    hasNotes: false, 
                    isMissing: false,
                    isLocked: true,
                    page: 1
                });
            } else if (value === 9) {
                await this.props.setFilters({
                    ...this.props.filters,
                    status: [], 
                    hasNotes: false, 
                    isLocked: false,
                    isMissing: true,
                    page: 1
                });
            } else {
                await this.props.setFilters({
                    ...this.props.filters,
                    status: [value], 
                    hasNotes: false, 
                    isLocked: false,
                    isMissing: false,
                    page: 1
                });
            } 

            await this.props.getTransactions(this.props.filters);
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            })
        }
    }

    handleCreateBill = async (e) => {
        try{
            e.preventDefault();
            this.setState({loading: true});
            let data = {
                boxId: this.state.boxId,
                updateTag: this.state.updateTag,
                buyer: null,
                seller: null
            };
            if (this.state.isBuyerToggleOn) data.buyer = this.state.buyer;
            if (this.state.isSellerToggleOn) data.seller = this.state.seller;
            if (this.state.isBuyerToggleOn || this.state.isSellerToggleOn) {
                const res = await createBill(data);
                if (res.buyerBill) window.location.href = `/bill/${res.buyerBill._id}`;
                else window.location.href = `/bill/${res.sellerBill._id}`;
            }
            this.setState({loading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error
            });
            this.toggle()
            this.setState({loading: false});
        }
        
    };

    getFB = async (id) => {
        try{
            this.setState({getLoading: true});
            
            if (id) {
                const data = await getFBInfo(id);

                if (this.state.buyerSender.facebookId === data.data.facebookId) {
                    this.setState({buyerSender: data.data})
                } else if (this.state.sellerSender.facebookId === data.data.facebookId) {
                    this.setState({sellerSender: data.data})
                }
            }
            
            this.setState({getLoading: false});
        } catch (error) {
            this.setState({
                alert: true,
                errorMsg: error,
                getLoading: false
            })
        }
    }

    render() { 
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
        const { transactions } = this.props;
        const { isBuyerToggleOn, isSellerToggleOn, buyer, seller} = this.state;
        
        const totalAmount = transactions.docs.reduce((sum, item) => {
            return sum + item.totalAmount;
        }, 0);

        const amount = transactions.docs.reduce((sum, item) => {
            return sum + item.amount;
        }, 0);

        const fee = transactions.docs.reduce((sum, item) => {
            return sum + item.fee;
        }, 0);

        const bonus = transactions.docs.reduce((sum, item) => {
            return sum + item.bonus;
        }, 0);

        return (<Card className="main-card mb-3">
            {this.props.loading ? (
                <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                    <Loader type="ball-spin-fade-loader" />
                </div>
            ) : ( <>
                <CardHeader className="mt-2">
                    <a href="/create-transaction" className="btn btn-info me-1 al-min-width-max-content" style={{minWidth: 'max-content', textTransform: 'none'}} onClick={this.toggleCreate}>
                        Tạo GDTG
                    </a>
                    <h3 className="text-center w-100">Tổng số GD: <span className="text-danger fw-bold">{transactions.totalDocs}</span></h3>
                    <div>
                        <Input 
                            name="search"
                            value={this.state.search}
                            placeholder="Tìm kiếm"
                            onChange={(e) => this.setState({search: e.target.value})}
                            onKeyDown={(e) => e.key === "Enter" && this.handleSearch(e)}
                        />
                    </div>
                    
                </CardHeader>
                <Table responsive hover striped bordered className="align-middle mb-0">
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
                            <th className="text-center" style={{ width: "180px" }}>
                                <Select
                                    value={statusList
                                        .map(option => ({ value: option.value, label: option.name }))
                                        .find(option => option.value === this.state.status) || null}
                                    onChange={selected => {
                                        this.setState({status: selected?.value });
                                        this.handleStatus(selected?.value)
                                    }}
                                    options={statusList.map(option => ({
                                        value: option.value,
                                        label: option.name
                                    }))}
                                    placeholder="Trạng thái ..."
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            width: 150,
                                            minHeight: 30
                                        }),
                                        menuPortal: base => ({ ...base, zIndex: 9999 })
                                    }}
                                    menuPortalTarget={document.body}
                                />
                            </th>
                            <th className="text-center">Nhân viên</th>
                            <th className="text-center">Box</th>
                            <th className="text-center">#</th>

                        </tr>
                    </thead>
                    <tbody>
                    
                        {transactions.docs.map((item) => {
                            let rowClass = "";
                            switch (item.status) {
                                case 1:
                                rowClass = "fst-italic"; // in nghiêng
                                break;
                                case 2:
                                rowClass = "text-success"; // chữ màu xanh lá
                                break;
                                case 3:
                                rowClass = "al-text-decoration-line-through"; // gạch ngang
                                break;
                                case 6:
                                rowClass = "fw-bold"; // in đậm
                                break;
                                default:
                                rowClass = "";
                            }
                            return <tr className={rowClass}>
                                <td className="text-center">{item._id.slice(-8)}</td>
                                <td className="text-center">{formatDate(item.createdAt)}</td>
                                <td
                                    className="text-center"
                                    onClick={() => {
                                        navigator.clipboard.writeText(item.bankId.bankAccount);
                                    }}
                                >
                                    <p data-tooltip-id="my-tooltip" data-tooltip-content={item.bankId.bankAccount} className="m-0">{item.bankId.bankName}</p>
                                </td>
                                <td className="text-center">{new Intl.NumberFormat('en-US').format(item.amount)}</td>
                                <td className="text-center">{new Intl.NumberFormat('en-US').format(item.fee)}</td>
                                <td className="text-center">{new Intl.NumberFormat('en-US').format(item.totalAmount)}</td>
                                <td className="text-center">{new Intl.NumberFormat('en-US').format(item.bonus)}</td>
                                <td className="text-center text-muted">
                                    <div style={{
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "space-between", 
                                        width: "100%"
                                    }}>
                                        <FontAwesomeIcon icon={faCircle} color={item.boxId.buyer ? '#3ac47d' : '#d92550'} />
                                        <p style={{ margin: 0, textAlign: "center", flex: 1 }}>{item.content}</p>
                                        <FontAwesomeIcon icon={faCircle} color={item.boxId.seller ? '#3ac47d' : '#d92550'} />
                                    </div>
                                </td>
                                <td className="text-center "> 
                                    <StatusBadge status={item.status} />
                                    {item.boxId.notes?.length > 0 && <>&nbsp;
                                    <FontAwesomeIcon color="#d92550" data-tooltip-id="my-tooltip" data-tooltip-content="Có ghi chú chưa hoàn thành" icon={faExclamationTriangle}>
                                    </FontAwesomeIcon></>}
                                    {item.boxId.status === 'lock' && <>&nbsp;
                                    <FontAwesomeIcon color="#d92550" data-tooltip-id="my-tooltip" data-tooltip-content="Box bị khóa" icon={faLock}>
                                    </FontAwesomeIcon></>}
                                </td>
                                <td className="text-center"><img className="rounded-circle" data-tooltip-id="my-tooltip" data-tooltip-content={item.staffId.name_staff} src={`${SERVER_URL}${item.staffId.avatar ? item.staffId.avatar : '/images/avatars/avatar.jpg'}`} alt={item.staffId.name_staff} style={{width: 40, height: 40, objectFit: 'cover'}}/></td>
                                <td className="text-center"><a href={item.boxId.isEncrypted ? `https://www.messenger.com/e2ee/t/${item.boxId.messengerId}` : `https://www.messenger.com/t/${item.boxId.messengerId}`} rel="noreferrer" target="_blank"><FontAwesomeIcon icon={faFacebookMessenger} size="lg" color="#0084FF" /></a></td>
                                <td className="text-center">
                                    {(item.status === 6 || item.status === 8) && <>
                                        <button 
                                            className="btn btn-sm btn-primary me-1 mb-1" 
                                            data-tooltip-id="my-tooltip" data-tooltip-content="Tạo bill thanh khoản" 
                                            onClick={() => {
                                                this.setState({
                                                    boxAmount: item.boxId.amount,
                                                    boxId: item.boxId._id,
                                                    buyerSender: item.boxId.buyer,
                                                    sellerSender: item.boxId.seller,
                                                    buyer: {
                                                        ...this.state.buyer, 
                                                        content: `Refund GDTG ${item.boxId._id}`
                                                    },
                                                    seller: {
                                                        ...this.state.seller, 
                                                        content: `Thanh khoan GDTG ${item.boxId._id}`
                                                    },
                                                    updateTag: {
                                                        tags: transformTags(item.boxId.tags),
                                                        buyerTags: transformTags(item.boxId.buyer?.tags) || [],
                                                        sellerTags: transformTags(item.boxId.seller?.tags) || []
                                                    }
                                                });
                                                this.toggle();
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPlus} color="#fff" size="3xs"/>
                                        </button>
                                    </>}
                                    {item.status === 1 && <>
                                        <button className="btn btn-sm btn-success me-1 mb-1" data-tooltip-id="my-tooltip" data-tooltip-content="Xác nhận giao dịch" onClick={() => {this.setState({confirmTransaction: item, boxAmount: item.boxId.amount}); this.toggleConfirmTransaction()}}>
                                            <FontAwesomeIcon icon={faCheck} color="#fff" size="3xs"/>
                                        </button>
                                    </>}

                                    {(item.status === 1 || item.status === 6) && <button 
                                        className="btn btn-sm btn-info me-1 mb-1" 
                                        data-tooltip-id="my-tooltip" data-tooltip-content="Chỉnh sửa giao dịch" 
                                        onClick={() => {
                                            this.setState({
                                                updateTransaction: item,
                                                textCopy: `🏦 ${item.bankId.bankAccount} tại ${item.bankId.bankName} - ${item.bankId.bankAccountName}\n💵 Số tiền: ${new Intl.NumberFormat('en-US').format(item.amount)} vnd\n💎 Phí: ${new Intl.NumberFormat('en-US').format(item.fee)} vnd\n📝 Nội dung: ${item.content} ${item.checkCode}\n-----------------------\n🎯 Check tại: https://check.tathanhan.com/${item.checkCode}`,
                                                buyerSender: item.boxId.buyer,
                                                sellerSender: item.boxId.seller,
                                                update: {
                                                    amount: String(item.amount),
                                                    bankId: item.bankId._id,
                                                    bonus: String(item.bonus),
                                                    content: item.content,
                                                    fee: String(item.fee),
                                                    messengerId: item.messengerId,
                                                    typeFee: item.typeFee,
                                                    typeBox: 'facebook',
                                                    isEncrypted: item.boxId.isEncrypted
                                                }
                                            });
                                            this.toggleUpdate()
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPen} color="#fff" size="3xs"/>
                                    </button>}
                                    <a href={`/box/${item.boxId._id}`} className="btn btn-sm btn-light me-1 mb-1" data-tooltip-id="my-tooltip" data-tooltip-content="Xem chi tiết box">
                                        <FontAwesomeIcon icon={faInfoCircle} color="#000" size="3xs"/>
                                    </a>
                                    {item.status === 1 && <>
                                        <button className="btn btn-sm btn-danger me-1 mb-1" data-tooltip-id="my-tooltip" data-tooltip-content="Hủy" onClick={() => {this.setState({cancelTransaction: item}); this.toggleCancel()}}>
                                            <FontAwesomeIcon icon={faMinus} color="#fff" size="3xs"/>
                                        </button>
                                    </>}
                                    {(item.status !== 1 && ((item.status !==2 && item.status !==8) || this.props.user?.is_admin === 1)) && <>
                                        <button className="btn btn-sm btn-warning me-1 mb-1" data-tooltip-id="my-tooltip" data-tooltip-content="Hoàn tác" onClick={()=> {this.setState({undoTransaction: item});this.toggleUndo()}}>
                                            <FontAwesomeIcon icon={faUndoAlt} color="#fff" size="3xs"/>
                                        </button>
                                    </>}
                                </td>
                            </tr>})}
                            <tr className="fw-bold">
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="text-center">{new Intl.NumberFormat('en-US').format(amount)}</td>
                                <td className="text-center">{new Intl.NumberFormat('en-US').format(fee)}</td>
                                <td className="text-center">{new Intl.NumberFormat('en-US').format(totalAmount)}</td>
                                <td className="text-center">{new Intl.NumberFormat('en-US').format(bonus)}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                    </tbody>
                </Table>
                <CardFooter className="d-block text-center">
                    <Row>
                        <Col md={11}>
                            <TransactionsPagination
                                totalPages={transactions.totalPages}
                                currentPage={transactions.page}
                                hasPrevPage={transactions.hasPrevPage}
                                hasNextPage={transactions.hasNextPage}
                                onPageChange={(page) => {
                                    this.props.setFilters({
                                        ...filters,
                                        page,
                                    });
                                }}
                            />
                        </Col>
                        <Col md={1}>
                            <Combobox 
                                data={[10, 20, 30, 50, 100]} 
                                defaultValue={[10]} 
                                value={filters.limit} 
                                onChange={(value) => {
                                        this.props.setFilters({
                                            ...filters,
                                            limit: value,
                                        });
                                    }
                                }/>
                        </Col>
                    </Row>
                    
                </CardFooter>
                <Modal isOpen={this.state.undoModal} toggle={this.toggleUndo} className={this.props.className}>
                    <ModalHeader toggle={this.toggleUndo}><span style={{fontWeight: 'bold'}}>Xác nhận hoàn tác box</span></ModalHeader>
                    <ModalBody>
                        ID: {this.state.undoTransaction?._id.slice(-8)} <br />
                        Số tài khoản: {this.state.undoTransaction?.bankId.bankAccount} <br />
                        Ngân hàng: {this.state.undoTransaction?.bankId.bankName} <br />
                        Chủ tài khoản: {this.state.undoTransaction?.bankId.bankAccountName} <br />
                        Tổng tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.state.undoTransaction?.totalAmount)} vnd</span><br />
                        Nội dung: {this.state.undoTransaction?.content} <br />            
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.toggleUndo}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleUndo} disabled={this.state.loading}>
                            {this.state.loading ? "Đang xác nhận..." : "Xác nhận"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.confirmTransactionModal} toggle={this.toggleConfirmTransaction} className={this.props.className}>
                    <ModalHeader toggle={this.toggleConfirmTransaction}><span style={{fontWeight: 'bold'}}>Xác nhận đã nhận được tiền</span></ModalHeader>
                    <ModalBody>
                        <Row>
                            <div className="card-border mb-3 card card-body border-primary">
                                <h5>Số tiền trong box dự kiến:&nbsp;
                                    <span class="fw-bold text-danger"><span>{new Intl.NumberFormat('en-US').format(this.state.boxAmount + this.state.confirmTransaction?.amount)} vnđ</span></span>
                                    <CopyToClipboard text={new Intl.NumberFormat('en-US').format(this.state.boxAmount + this.state.confirmTransaction?.amount)}>
                                        <button type="button" class="btn btn-success ms-1">
                                            <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                                        </button>
                                    </CopyToClipboard>
                                </h5>
                            </div>
                        
                        </Row>
                        ID: {this.state.confirmTransaction?._id.slice(-8)} <br />
                        Số tài khoản: {this.state.confirmTransaction?.bankId.bankAccount} <br />
                        Ngân hàng: {this.state.confirmTransaction?.bankId.bankName} <br />
                        Chủ tài khoản: {this.state.confirmTransaction?.bankId.bankAccountName} <br />
                        Tổng tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.state.confirmTransaction?.totalAmount)} vnd</span><br />
                        Nội dung: {this.state.confirmTransaction?.content} <br />
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleConfirmTransaction}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={this.handleConfirmTransaction} disabled={this.state.loading}>
                            {this.state.loading ? "Đang xác nhận..." : "Xác nhận"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.cancelModal} toggle={this.toggleCancel} className={this.props.className}>
                    <ModalHeader toggle={this.toggleCancel}><span style={{fontWeight: 'bold'}}>Xác nhận hủy giao dịch</span></ModalHeader>
                    <ModalBody>
                        ID: {this.state.cancelTransaction?._id.slice(-8)} <br />            
                        Số tài khoản: {this.state.cancelTransaction?.bankId.bankAccount} <br />
                        Ngân hàng: {this.state.cancelTransaction?.bankId.bankName} <br />
                        Chủ tài khoản: {this.state.cancelTransaction?.bankId.bankAccountName} <br />
                        Tổng tiền: <span className="fw-bold text-danger">{new Intl.NumberFormat('en-US').format(this.state.cancelTransaction?.totalAmount)} vnd</span><br />
                        Nội dung: {this.state.cancelTransaction?.content} <br />            
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleCancel}>
                            Cancel
                        </Button>
                        <Button color="danger" onClick={this.handleCancel} disabled={this.state.loading}>
                        {this.state.loading ? "Đang hủy..." : "Hủy giao dịch"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.updateModal} toggle={this.toggleUpdate} className="modal-xl">
                    <ModalHeader toggle={this.toggleUpdate}><span style={{fontWeight: 'bold'}}>Chỉnh sửa giao dịch</span></ModalHeader>
                    <ModalBody onKeyDown={(e) => e.key === "Enter" && !this.state.loading && this.handleUpdate(e)}>
                        <Row>
                            <Col md={6} xs={12}>

                                <Row className="mb-4">
                                    <Col md={12}>
                                        <Select
                                            value={this.state.bankAccounts
                                                .map(bank => ({ value: bank._id, label: bank.bankName }))
                                                .find(option => option.value === this.state.update.bankId) || null}
                                            onChange={selected => {
                                                    this.setState({ update: { ...this.state.update, bankId: selected.value } })
                                                    localStorage.setItem("selectedBankId", selected.value);
                                                }
                                            }
                                            options={this.state.bankAccounts.map(bank => ({
                                                value: bank._id,
                                                label: bank.bankName
                                            }))}
                                            placeholder="Chọn ngân hàng"
                                        />
                                    </Col>       
                                </Row>
                                <Row className="mb-4">
                                    <Col md={4} xs={12} className={cx({ "pe-2": !this.state.isMobile, "mb-4": this.state.isMobile })}>
                                        <Label>Số tiền</Label>
                                        <Input
                                            type="text"
                                            name="amount"
                                            value={new Intl.NumberFormat('en-US').format(this.state.update.amount)}
                                            onChange={(e) => {
                                                let rawValue = e.target.value.replace(/,/g, '');
                                                let value = parseInt(rawValue, 10) || 0;

                                                let fee = 0;
                                                const feeItem = this.state.fee.find(item => value >= item.min && value <= item.max);
                                                if (feeItem) {
                                                    fee = feeItem.feeDefault;
                                                }
                                            
                                                this.setState((prevState) => ({
                                                    update: {
                                                        ...prevState.update,
                                                        amount: value < 0 ? 0 : value,
                                                        fee: fee,
                                                    },
                                                }));
                                            }}
                                        />
                                    </Col>
                                    <Col md={4} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
                                        <Label>Phí</Label>
                                        <Input
                                            type="text"
                                            name="fee"
                                            value={new Intl.NumberFormat('en-US').format(this.state.update.fee)}
                                            onChange={(e) => {
                                                let rawValue = e.target.value.replace(/,/g, '');
                                                let numericValue = parseInt(rawValue, 10) || 0;

                                                this.setState((prevState) => ({
                                                    update: {
                                                        ...prevState.update,
                                                        fee: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                        />

                                    </Col>     
                                    <Col md={4} xs={12} className={cx({ "ps-2": !this.state.isMobile })}>
                                        <Label>Tiền tip</Label>
                                        <Input
                                            type="text"
                                            name="bonus"
                                            value={new Intl.NumberFormat('en-US').format(this.state.update.bonus)}
                                            onChange={(e) => {
                                                let rawValue = e.target.value.replace(/,/g, '');
                                                let numericValue = parseInt(rawValue, 10) || 0;

                                                this.setState((prevState) => ({
                                                    update: {
                                                        ...prevState.update,
                                                        bonus: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                        />

                                    </Col>                    
                                </Row>
                                <Row className="mb-4">
                                    <Col md={12}>
                                        <Label for="content">Nội dung chuyển khoản</Label>
                                        <Input
                                            type="text"
                                            name="content"
                                            id="content"
                                            placeholder="Nhập nội dung"
                                            value={this.state.update.content}
                                            onChange={this.handleUpdateChange}
                                        />
                                    </Col>
                                </Row>
                                <Row className="mb-4">
                                    <Col md={6} xs={12} className="pe-2">
                                        <Input
                                            type="text"
                                            name="messengerId"
                                            id="messengerId"
                                            placeholder="Messenger ID"
                                            value={this.state.update.messengerId}
                                            onChange={this.handleUpdateChange}
                                        />
                                    </Col>
                                    <Col md={6} xs={12} className="ps-2">
                                        <Select
                                            value={typeFee
                                                .map(option => ({ value: option.value, label: option.name }))
                                                .find(option => option.value === this.state.update.typeFee) || null}
                                            onChange={selected => this.setState(prevState => ({
                                                update: { ...prevState.update, typeFee: selected?.value }
                                            }))}
                                            options={typeFee.map(option => ({
                                                value: option.value,
                                                label: option.name
                                            }))}
                                            placeholder="Chọn loại phí"
                                        />
                                    </Col>
                                </Row>
                                <Row className="mb-4">
                                    <Label className="me-3" style={{width: 'auto' }}>Box mã hóa ? </Label>
                                    <div style={{display: 'inline-block', width: '1em', maxWidth: '1em' }}>
                                        <Input 
                                            id="isEncrypted" 
                                            type="checkbox" checked={this.state.update.isEncrypted} 
                                            style={{width: '1em', maxWidth: '1em' }}
                                            onChange={() => {
                                                this.setState({
                                                    update: {
                                                        ...this.state.update,
                                                        isEncrypted: !this.state.update.isEncrypted
                                                    }
                                                })
                                            }}
                                        />
                                    </div>
                                    
                                </Row>
                                <Row className="mb-4">
                                    <div>
                                        <Label>Trạng thái: &nbsp;</Label><StatusBadge status={this.state.updateTransaction?.status}/>           
                                    </div>
                                </Row>
                                <Row className="mb-4">
                                    <Col md={12} xs={12}>
                                        <Label>Tags của box</Label>
                                    </Col>
                                    <Col md={12} xs={12}>
                                        <Select
                                            isMulti
                                            styles={customStyles}
                                            value={transformTags(this.state.updateTransaction?.boxId.tags || [])}
                                            placeholder="Tags ..."
                                            components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }}
                                            isDisabled 
                                        />   
                                    </Col>
                                </Row>
                                <Row className="mb-4">
                                    <Col md={12} xs={12} style={{position: 'relative'}}>
                                        <textarea rows={7} cols={10} className="form-control" value={this.state.textCopy} disabled/>
                                        <div style={{position: 'absolute', right: 8, top: 0}}>
                                            <CopyToClipboard onCopy={this.onCopy} text={this.state.textCopy}>
                                                <Button color="link">
                                                    <FontAwesomeIcon icon={faCopy} color="#545cd8" size="lg"/>
                                                </Button>
                                            </CopyToClipboard>
                                        </div>
                                    
                                        {this.state.copied ? (
                                            <FormText color="success">Text has been copied.</FormText>
                                        ) : null}
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6} xs={12}>
                                {!this.state.updateTransaction?.decodeQr && <Row>
                                    <Col md={6}>

                                    </Col>
                                    <Col md={6} xs={12}>
                                        <InputGroup>
                                            <Input value={this.state.updateTransaction?.linkQr} placeholder="Link QR" disabled/>
                                            <CopyToClipboard text={this.state.updateTransaction?.linkQr}>
                                                <Button color="primary">
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </Button>
                                            </CopyToClipboard>
                                        </InputGroup>
                                    </Col>
                                </Row>}
                                
                                <Row>
                                    {this.state.loading ? 
                                    <div className="loader-wrapper d-flex justify-content-center align-items-center w-100 mt-5">
                                        <Loader type="ball-spin-fade-loader" />
                                    </div> 
                                    : <>
                                        {this.state.updateTransaction?.decodeQr ? 
                                        <QRCodeComponent 
                                            encodedData={this.state.updateTransaction?.decodeQr}
                                            logo={this.state.updateTransaction?.bankId.logo}
                                            data={{
                                                amount: this.state.updateTransaction?.totalAmount,
                                                content: `${this.state.updateTransaction?.content} ${this.state.updateTransaction?.checkCode}`,
                                                bankAccount: this.state.updateTransaction?.bankId.bankAccount,
                                                bankAccountName: this.state.updateTransaction?.bankId.bankAccountName,
                                                checkCode: this.state.updateTransaction?.checkCode,
                                            }}
                                            style={{
                                                width: '100%', 
                                                height: '100%', 
                                                padding: this.state.isMobile ? '0' : '0 3rem'
                                            }}
                                        /> 
                                        : <img src={this.state.updateTransaction?.linkQr} alt="" style={{width: '100%', height: '100%', padding: this.state.isMobile ? '0' : '0 3rem'}} onClick={this.copyImageToClipboard}></img>
                                        }
                                    </>} 
                                </Row>
                                <Row className="mb-2 ms-2">
                                    <Col md={12} xs={12}>
                                        <Label>Bên mua</Label>
                                    </Col>
                                    <Col md={6} xs={6} className="pe-1">
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                name="buyerId"
                                                id="buyerId"
                                                value={this.state.buyerSender?.facebookId}
                                                disabled
                                                autoComplete="off"
                                            />
                                            <div className="input-group-text">
                                                <div role="button" disabled={this.state.getLoading} onClick={()=>{this.state.buyerSender && !this.state.getLoading && this.getFB(this.state.buyerSender.facebookId)}}>
                                                    {this.state.getLoading ? <FontAwesomeIcon icon={["fas", "spinner"]} pulse fixedWidth color="#545cd8" size="lg" />
                                                    : <IoIosRefresh fontSize="18.7px" color="#545cd8"/>}
                                                </div>
                                            </div>
                                        </InputGroup>
                                                                                                            
                                    </Col>
                                    <Col md={6} xs={6} className="ps-1">
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                name="buyerName"
                                                id="buyerName"
                                                value={this.state.buyerSender?.nameCustomer}
                                                disabled
                                            />
                                            <div className="input-group-text" style={{padding: '0.1rem 0.44rem'}}>
                                                <a href={`https://www.facebook.com/${this.state.buyerSender?.facebookId}`} rel="noreferrer" target="_blank">
                                                    <img src={this.state.buyerSender && this.state.buyerSender.avatar ? this.state.buyerSender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.png'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                </a>
                                            </div>
                                        </InputGroup>
                                        
                                    </Col>
                                </Row>
                                <Row className="mb-3 ms-2">
                                    <Col md={12} xs={12}>
                                        <Select
                                            isMulti
                                            styles={customStyles}
                                            value={transformTags(this.state.buyerSender?.tags || [])}
                                            placeholder="Tags ..."
                                            components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }}
                                            isDisabled 
                                        />   
                                    </Col>
                                </Row>
                                <Row className="mb-2 ms-2">
                                    <Col md={12} xs={12}>
                                        <Label>Bên bán</Label>
                                    </Col>
                                    <Col md={6} xs={6} className="pe-1">
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                name="sellerId"
                                                id="sellerId"
                                                value={this.state.sellerSender?.facebookId}
                                                disabled
                                                autoComplete="off"
                                            />
                                            <div className="input-group-text">
                                                <div role="button" disabled={this.state.getLoading} onClick={()=>{this.state.sellerSender && !this.state.getLoading && this.getFB(this.state.sellerSender.facebookId)}}>
                                                    {this.state.getLoading ? <FontAwesomeIcon icon={["fas", "spinner"]} pulse fixedWidth color="#545cd8" size="lg" />
                                                    : <IoIosRefresh fontSize="18.7px" color="#545cd8"/>}
                                                </div>
                                            </div>
                                        </InputGroup>
                                                                                                    
                                    </Col>
                                    <Col md={6} xs={6} className="ps-1">
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                name="sellerName"
                                                id="sellerName"
                                                value={this.state.sellerSender?.nameCustomer}
                                                disabled
                                            />
                                            <div className="input-group-text" style={{padding: '0.1rem 0.44rem'}}>
                                                <a href={`https://www.facebook.com/${this.state.sellerSender?.facebookId}`} rel="noreferrer" target="_blank">
                                                    <img src={this.state.sellerSender && this.state.sellerSender.avatar ? this.state.sellerSender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.png'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                </a>
                                            </div>
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <Row className="mb-3 ms-2">
                                    <Col md={12} xs={12}>
                                        <Select
                                            isMulti
                                            styles={customStyles}
                                            value={transformTags(this.state.sellerSender?.tags || [])}
                                            placeholder="Tags ..."
                                            components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }}
                                            isDisabled 
                                        />   
                                    </Col>
                                </Row>
                            </Col>
                        
                        </Row>
                    </ModalBody>

                    <ModalFooter>
                        <Button color="link" onClick={this.toggleUpdate}>
                            Cancel
                        </Button>
                        <a href={`/box/${this.state.updateTransaction?.boxId._id}`} className="btn btn-secondary">
                            Chi tiết box
                        </a>
                        <Button color="primary" onClick={this.handleUpdate} disabled={this.state.loading}>
                            {this.state.loading ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className="modal-xl" style={{marginTop: '10rem'}}>
                    <ModalHeader toggle={this.toggle}>Tạo bill thanh khoản</ModalHeader>
                    <ModalBody className="p-4" onKeyDown={(e) => e.key === "Enter" && !this.state.loading && this.handleCreateBill(e)}>
                        <Row className="mb-3">
                            <div className="card-border mb-3 card card-body border-primary">
                                <Row>
                                    <Col md={6} xs={12}>
                                        <h5>Số tiền thanh khoản còn lại:&nbsp;
                                            <span class="fw-bold text-danger"><span>{new Intl.NumberFormat('en-US').format(this.state.boxAmount)} vnđ</span></span>
                                            <CopyToClipboard text={new Intl.NumberFormat('en-US').format(this.state.boxAmount)}>
                                                <button type="button" class="btn btn-success ms-1">
                                                    <FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>
                                                </button>
                                            </CopyToClipboard>
                                        </h5>    
                                    </Col>
                                    <Col md={6} xs={12}>
                                        <Row>
                                            <Col md={4} xs={4}>
                                                <Label>Tags của box</Label>
                                            </Col>
                                            <Col md={8} xs={8} style={{zIndex: 12}}>
                                                <Select
                                                    isMulti
                                                    options={this.state.tags}
                                                    styles={customStyles}
                                                    value={this.state.updateTag.tags}
                                                    onChange={(value) => {
                                                        this.setState((prevState) => ({
                                                            updateTag: { ...prevState.updateTag, tags: value }
                                                        }));
                                                    }}
                                                    placeholder="Tags ..."
                                                    components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }} 
                                                />
                                            </Col>   
                                        </Row>
                                    </Col>
                                </Row>
                                
                                
                            </div>
                                      
                        </Row>
                        <Row>
                            <Col lg={6} xs={12} sm={12} className="pe-2">
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Tạo cho <span className="fw-bold text-danger">BÊN MUA</span>?</Label>
                                    </Col>
                                    <Col md={8}>
                                        <div className="switch has-switch me-2" data-on-label="ON"
                                            data-off-label="OFF" onClick={this.handleBuyerClick}>
                                            <div className={cx("switch-animate", {
                                                "switch-on": isBuyerToggleOn,
                                                "switch-off": !isBuyerToggleOn,
                                                })}>
                                                <input type="checkbox" />
                                                <span className="switch-left bg-info">ON</span>
                                                <label>&nbsp;</label>
                                                <span className="switch-right bg-info">OFF</span>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={4}>
                                        <Label>Khách mua</Label>      
                                    </Col>
                                    <Col md={4} xs={6} className="pe-1">
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                name="buyerId"
                                                id="buyerId"
                                                value={this.state.buyerSender?.facebookId}
                                                disabled
                                                autoComplete="off"
                                            />
                                            <div className="input-group-text">
                                                <div role="button" disabled={this.state.getLoading} onClick={()=>{this.state.buyerSender && !this.state.getLoading && this.getFB(this.state.buyerSender.facebookId)}}>
                                                    {this.state.getLoading ? <FontAwesomeIcon icon={["fas", "spinner"]} pulse fixedWidth color="#545cd8" size="lg" />
                                                    : <IoIosRefresh fontSize="18.7px" color="#545cd8"/>}
                                                </div>
                                            </div>
                                        </InputGroup>
                                                                                                    
                                    </Col>
                                    <Col md={4} xs={6} className="ps-1">
                                        
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                name="buyerName"
                                                id="buyerName"
                                                value={this.state.buyerSender?.nameCustomer}
                                                disabled
                                            />
                                            <div className="input-group-text" style={{padding: '0.1rem 0.44rem'}}>
                                                <a href={`https://www.facebook.com/${this.state.buyerSender?.facebookId}`} rel="noreferrer" target="_blank">
                                                    <img src={this.state.buyerSender && this.state.buyerSender.avatar ? this.state.buyerSender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.png'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                </a>
                                            </div>
                                        </InputGroup>
                                    </Col>
                                    
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        
                                    </Col>
                                    <Col md={8}>
                                        <Select
                                            isMulti
                                            options={this.state.tags}
                                            styles={customStyles}
                                            value={this.state.updateTag.buyerTags}
                                            onChange={(value) => {
                                                this.setState((prevState) => ({
                                                    updateTag: { ...prevState.updateTag, buyerTags: value }
                                                }));
                                            }}
                                            placeholder="Tags ..."
                                            components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }}
                                             
                                        />   
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Ngân hàng khách mua</Label>
                                    </Col>
                                    <Col md={8}>
                                    <Select
                                        value={this.state.banks
                                            .map(bank => ({ value: bank.bankCode, label: bank.bankName }))
                                            .find(option => option.value === this.state.buyer.bankCode) || null}
                                        onChange={selected => this.setState(prevState => ({
                                            buyer: { ...prevState.buyer, bankCode: selected.value }
                                        }))}
                                        options={this.state.banks.map(bank => ({
                                            value: bank.bankCode,
                                            label: bank.bankName
                                        }))}
                                        placeholder="Chọn ngân hàng"
                                    />

                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Số tài khoản khách mua</Label>
                                    </Col>
                                    <Col md={8}>
                                        <Input
                                            type="text"
                                            name="buyerStk"
                                            id="buyerStk"
                                            value={buyer.stk}
                                            onChange={(e)=>{
                                                const sanitizedValue = e.target.value.replace(/\s/g, '');
                                                this.setState((prevState) => ({
                                                    buyer: { ...prevState.buyer, stk: sanitizedValue }
                                                }));
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Nội dung chuyển khoản</Label>
                                    </Col>
                                    <Col md={8}>
                                        <Input
                                            type="text"
                                            name="buyerContent"
                                            id="buyerContent"
                                            value={buyer.content}
                                            onChange={(e)=>{this.setState((prevState) => ({
                                                buyer: { ...prevState.buyer, content: e.target.value }
                                            }));}}
                                        />
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Số tiền giao dịch</Label>
                                    </Col>
                                    <Col md={8}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="buyerAmount"
                                            value={new Intl.NumberFormat('en-US').format(this.state.buyer.amount)}
                                            onChange={(e) => {
                                                let rawValue = e.target.value.replace(/,/g, ''); // Xóa dấu phẩy
                                                let numericValue = parseInt(rawValue, 10) || 0; // Chuyển thành số nguyên
                                                
                                                this.setState((prevState) => ({
                                                    buyer: {
                                                        ...prevState.buyer,
                                                        amount: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault(); 
                                                let pastedText = e.clipboardData.getData("text"); 
                                                let numericValue = parseInt(pastedText.replace(/,/g, ""), 10) || 0; 

                                                this.setState((prevState) => ({
                                                    buyer: {
                                                        ...prevState.buyer,
                                                        amount: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                        />
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Tiền tip</Label>
                                    </Col>
                                    <Col md={8}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="buyerBonus"
                                            value={new Intl.NumberFormat('en-US').format(this.state.buyer.bonus)}
                                            onChange={(e) => {
                                                let rawValue = e.target.value.replace(/,/g, ''); 
                                                let numericValue = parseInt(rawValue, 10) || 0;
                                                
                                                this.setState((prevState) => ({
                                                    buyer: {
                                                        ...prevState.buyer,
                                                        bonus: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault(); 
                                                let pastedText = e.clipboardData.getData("text"); 
                                                let numericValue = parseInt(pastedText.replace(/,/g, ""), 10) || 0; 

                                                this.setState((prevState) => ({
                                                    buyer: {
                                                        ...prevState.buyer,
                                                        bonus: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                        />
                                    </Col>
                                </Row>

                            </Col>
                            <Col lg={6} xs={12} sm={12} className="ps-2">
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Tạo cho <span className="fw-bold text-danger">BÊN BÁN</span>?</Label>
                                    </Col>
                                    <Col md={8}>
                                        <div className="switch has-switch me-2" data-on-label="ON"
                                            data-off-label="OFF" onClick={this.handleSellerClick}>
                                            <div className={cx("switch-animate", {
                                                "switch-on": isSellerToggleOn,
                                                "switch-off": !isSellerToggleOn,
                                                })}>
                                                <input type="checkbox" />
                                                <span className="switch-left bg-info">ON</span>
                                                <label>&nbsp;</label>
                                                <span className="switch-right bg-info">OFF</span>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="mb-2">
                                    <Col md={4}>
                                        <Label>Khách bán</Label>
                                    </Col>
                                    <Col md={4} xs={6} className="pe-1">
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                name="sellerId"
                                                id="sellerId"
                                                value={this.state.sellerSender?.facebookId}
                                                disabled
                                                autoComplete="off"
                                            />
                                            <div className="input-group-text">
                                                <div role="button" disabled={this.state.getLoading} onClick={()=>{this.state.sellerSender && !this.state.getLoading && this.getFB(this.state.sellerSender.facebookId)}}>
                                                    {this.state.getLoading ? <FontAwesomeIcon icon={["fas", "spinner"]} pulse fixedWidth color="#545cd8" size="lg" />
                                                    : <IoIosRefresh fontSize="18.7px" color="#545cd8"/>}
                                                </div>
                                            </div>
                                        </InputGroup>
                                                                                                    
                                    </Col>
                                    <Col md={4} xs={6} className="ps-1">
                                        
                                        <InputGroup>
                                            <Input
                                                type="text"
                                                name="sellerName"
                                                id="sellerName"
                                                value={this.state.sellerSender?.nameCustomer}
                                                disabled
                                            />
                                            <div className="input-group-text" style={{padding: '0.1rem 0.44rem'}}>
                                                <a href={`https://www.facebook.com/${this.state.sellerSender?.facebookId}`} rel="noreferrer" target="_blank">
                                                    <img src={this.state.sellerSender && this.state.sellerSender.avatar ? this.state.sellerSender.avatar : 'https://mayman.tathanhan.com/images/avatars/null_avatar.png'} alt='' style={{ width: 29, height: 29, borderRadius: '50%' }} />
                                                </a>
                                            </div>
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        
                                    </Col>
                                    <Col md={8}>
                                        <Select
                                            isMulti
                                            options={this.state.tags}
                                            styles={customStyles}
                                            value={this.state.updateTag.sellerTags}
                                            placeholder="Tags ..."
                                            onChange={(value) => {
                                                this.setState((prevState) => ({
                                                    updateTag: { ...prevState.updateTag, sellerTags: value }
                                                }));
                                            }}
                                            components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator }}
                                        />   
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Ngân hàng khách bán</Label>
                                    </Col>
                                    <Col md={8}>
                                        <Select
                                            value={this.state.banks
                                                .map(bank => ({ value: bank.bankCode, label: bank.bankName }))
                                                .find(option => option.value === this.state.seller.bankCode) || null}
                                            onChange={selected => this.setState(prevState => ({
                                                seller: { ...prevState.seller, bankCode: selected.value }
                                            }))}
                                            options={this.state.banks.map(bank => ({
                                                value: bank.bankCode,
                                                label: bank.bankName
                                            }))}
                                            placeholder="Chọn ngân hàng"
                                        />
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Số tài khoản khách bán</Label>
                                    </Col>
                                    <Col md={8}>
                                        <Input
                                            type="text"
                                            name="sellerStk"
                                            id="sellerStk"
                                            value={seller.stk}
                                            onChange={(e)=>{
                                                const sanitizedValue = e.target.value.replace(/\s/g, '');
                                                this.setState((prevState) => ({
                                                    seller: { ...prevState.seller, stk: sanitizedValue }
                                                }));
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Nội dung chuyển khoản</Label>
                                    </Col>
                                    <Col md={8}>
                                        <Input
                                            type="text"
                                            name="sellerContent"
                                            id="sellerContent"
                                            value={seller.content}
                                            onChange={(e)=>{this.setState((prevState) => ({
                                                seller: { ...prevState.seller, content: e.target.value }
                                            }));}}
                                        />
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Số tiền giao dịch</Label>
                                    </Col>
                                    <Col md={8}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="sellerAmount"
                                            value={new Intl.NumberFormat('en-US').format(this.state.seller.amount)}
                                            onChange={(e) => {
                                                let rawValue = e.target.value.replace(/,/g, ''); // Xóa dấu phẩy
                                                let numericValue = parseInt(rawValue, 10) || 0; // Chuyển thành số nguyên

                                                this.setState((prevState) => ({
                                                    seller: {
                                                        ...prevState.seller,
                                                        amount: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault(); 
                                                let pastedText = e.clipboardData.getData("text"); 
                                                let numericValue = parseInt(pastedText.replace(/,/g, ""), 10) || 0; 

                                                this.setState((prevState) => ({
                                                    seller: {
                                                        ...prevState.seller,
                                                        amount: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                        />
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Label>Tiền tip</Label>
                                    </Col>
                                    <Col md={8}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="sellerBonus"
                                            value={new Intl.NumberFormat('en-US').format(this.state.seller.bonus)}
                                            onChange={(e) => {
                                                let rawValue = e.target.value.replace(/,/g, ''); // Xóa dấu phẩy
                                                let numericValue = parseInt(rawValue, 10) || 0; // Chuyển thành số nguyên

                                                this.setState((prevState) => ({
                                                    seller: {
                                                        ...prevState.seller,
                                                        bonus: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault(); 
                                                let pastedText = e.clipboardData.getData("text"); 
                                                let numericValue = parseInt(pastedText.replace(/,/g, ""), 10) || 0; 

                                                this.setState((prevState) => ({
                                                    seller: {
                                                        ...prevState.seller,
                                                        bonus: numericValue < 0 ? 0 : numericValue,
                                                    },
                                                }));
                                            }}
                                        />
                                    </Col>
                                </Row>

                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.toggle}>
                            Hủy
                        </Button>
                        <Button color="primary" onClick={this.handleCreateBill} disabled={this.state.loading}>
                            {this.state.loading ? "Đang tạo..." : "Tạo"}
                        </Button>{" "}
                    </ModalFooter>
                </Modal>
            </>)}
            <SweetAlert title={this.state.errorMsg} show={this.state.alert}
                type="error" onConfirm={() => this.setState({alert: false})}/>
            <ReactTooltip
                id="my-tooltip"
                place="bottom"
            />
        </Card>)
    }
}

const mapStateToProps = (state) => ({
    transactions: state.transactions.transactions,
    loading: state.transactions.loading,
    filters: state.transactions.filters,
    bankAccounts: state.user?.user?.permission_bank || [],
    user: state.user.user,
});
  
const mapDispatchToProps = {
    getTransactions,
    getTransactionsNoLoad,
    setFilters,
    undoBox,
    searchTransactions,
    findTransactionsByStatus,
    searchTransactionsNoload
};
  
export default connect(mapStateToProps, mapDispatchToProps)(TransactionsTable);