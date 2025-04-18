import { Route, Redirect } from "react-router-dom";
import React, { Suspense, lazy, Fragment, useState, useEffect } from "react";
import Loader from "react-loaders";

import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { verifyToken } from "../../services/authService";
import { authSuccess, logout } from "../../reducers/userSlice";
import Transactions from "../../DemoPages/Transactions";
import Bills from "../../DemoPages/Bills";
import Transaction from "../../DemoPages/Transaction";
import CreateTransaction from "../../DemoPages/CreateTransaction";
import Box from "../../DemoPages/Box";
import Bill from "../../DemoPages/Bill";
import Permissions from "../../DemoPages/Permissions";
import Roles from "../../DemoPages/Roles";
import Staffs from "../../DemoPages/Staffs";
import { closeSocket, getSocket } from "../../services/socketService";
import { getTransactionsNoLoad } from "../../reducers/transactionsSlice";
import { getBoxByIdNoLoad, getNoteBoxTransactions } from "../../reducers/boxSlice";
import { getBillByIdNoLoad, getBillsNoLoad } from "../../reducers/billsSlice";
import ChangePassword from "../../DemoPages/ChangePassword";
import FeeConfig from "../../DemoPages/FeeConfig";
import BankAccountConfig from "../../DemoPages/BankAccountConfig";
import Setting from "../../DemoPages/Setting";
import QuickAnswer from "../../DemoPages/QuickAnswer";
import QuickReply from "../../DemoPages/QuickReply";
import Tag from "../../DemoPages/Tag";
import Customers from "../../DemoPages/Customers";

const UserPages = lazy(() => import("../../DemoPages/UserPages"));
const Dashboards = lazy(() => import("../../DemoPages/Dashboards"));

const AppMain = () => {

    const [isAuth, setIsAuth] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    const [tokenState] = useState(localStorage.getItem("token"));
    const dispatch = useDispatch();
    const transactions = useSelector(state => state.transactions);
    const box = useSelector(state => state.box);
    const bills = useSelector(state => state.bills);
    const isLogout = useSelector(state => state.user.isLogout);
    useEffect(() => {
        const checkAuth = async () => {
            if (!tokenState) {
                setIsAuth(false);
                setIsAdmin(false);
                return;
            }
            try {
                const userData = await verifyToken(tokenState);
                if (!userData.user) {
                    localStorage.removeItem("token");
                    dispatch(logout());
                    setIsAuth(false);
                    setIsAdmin(false);
                }

                if (userData.user.is_admin === 1) setIsAdmin(true);
                dispatch(authSuccess(userData));
                setIsAuth(true);
            } catch (error) {
                localStorage.removeItem("token");
                dispatch(logout());
                setIsAuth(false);
            }
        };

        checkAuth();
    }, [dispatch, tokenState]);

    useEffect(() => {
        if (isAuth) {
            const initData = {
                token: `Bearer ${localStorage.getItem("token")}`
            };
    
            const socket = getSocket(initData);
    
            if (socket) {
                socket.on('create_transaction', (data) => {
                    if (transactions.transactions?.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })

                socket.on('update_transaction', (data) => {
                    if (transactions.transactions?.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })

                socket.on('confirm_transaction', (data) => {
                    if (transactions.transactions?.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })

                socket.on('cancel_transaction', (data) => {
                    if (transactions.transactions?.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })

                socket.on('undo_box', (data) => {
                    if (data.box?._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (transactions.transactions?.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (bills.bills?.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                })

                socket.on('add_note', (data) => {
                    if (data.box?._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    dispatch(getNoteBoxTransactions({}));
                })
                socket.on('delete_note', (data) => {
                    if (data.box?._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    dispatch(getNoteBoxTransactions({}));
                })
                socket.on('update_box', (data) => {
                    if (data.box?._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (transactions.transactions?.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (bills.bills?.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                })
                socket.on('switch_box', (data) => {
                    if (data.box?._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })
                socket.on('create_bill', (data) => {
                    if (data.box?._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (bills.bill && (bills.bill?._id === data.buyerBill?._id || bills.bill?._id === data.sellerBill?._id)) {
                        dispatch(getBillByIdNoLoad(bills.bill?._id));
                    }
                    if (bills.bills?.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                    if (transactions.transactions?.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                })
                socket.on('confirm_bill', (data) => {
                    if (data.box?._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (bills.bill?._id === data.bill?._id) {
                        dispatch(getBillByIdNoLoad(bills.bill?._id));
                    }
                    if (bills.bills?.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                    if (transactions.transactions?.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                })
                socket.on('cancel_bill', (data) => {
                    if (data.box?._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (bills.bill?._id === data.bill?._id) {
                        dispatch(getBillByIdNoLoad(bills.bill?._id));
                    }
                    if (bills.bills?.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                    if (transactions.transactions?.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                })
                socket.on('switch_bill', (data) => {
                    if (data.bill?.boxId === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (bills.bill?._id === data.bill?._id) {
                        dispatch(getBillByIdNoLoad(bills.bill?._id));
                    }
                    if (bills.bills?.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                })
            }
    
            return () => {
                closeSocket();
            };
        }
        
    }, [isAuth, box, transactions, dispatch, bills]);

    if (isAuth === null) return <div className="loader-container">
        <div className="loader-container-inner">
            <div className="text-center">
                <Loader type="ball-pulse-sync"/>
            </div>
            <h6 className="mt-3">
                Please wait a minute ...
            </h6>
        </div>
    </div>;
    
    return (
        <Fragment>

            {/* Dashboards */}
            
            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/dashboards" render={() => isAuth ? <Dashboards url={"/dashboards"}/> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/transactions" render={() => isAuth ? <Transactions /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/transaction/:id" render={() => isAuth ? <Transaction /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/box/:id" render={() => isAuth ? <Box /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/create-transaction" render={() => isAuth ? <CreateTransaction /> : <Redirect to="/login" />
                }  />
            </Suspense>
            
            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/bills" render={() => isAuth ? <Bills /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/bill/:id" render={() => isAuth ? <Bill /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/permission" render={() => isAdmin ? <Permissions /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/role" render={() => isAdmin ? <Roles /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/fee" render={() => isAdmin ? <FeeConfig /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/staff" render={() => isAdmin ? <Staffs /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/change-password" render={() => isAuth ? <ChangePassword /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/config/fee" render={() => isAdmin ? <FeeConfig /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/config/bank-account" render={() => isAdmin ? <BankAccountConfig /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/config/setting" render={() => isAuth ? <Setting /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/config/quick-answer" render={() => isAuth ? <QuickAnswer /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/config/tag" render={() => isAuth ? <Tag /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/quick-reply" render={() => isAuth ? <QuickReply /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/customers" render={() => isAdmin ? <Customers /> : <Redirect to="/login" />
                }  />
            </Suspense>

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-grid-cy"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait a minute ...
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/login" render={() => (isAuth && !isLogout) ? <Redirect to="/transactions" /> : <UserPages />
                }  />
            </Suspense>

            <Route exact path="/" render={() => (
                <Redirect to="/transactions"/>
            )}/>
            <ToastContainer/>
        </Fragment>
    )
};

export default AppMain;
