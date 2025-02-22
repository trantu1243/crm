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
import { getBoxByIdNoLoad } from "../../reducers/boxSlice";
import { getBillByIdNoLoad, getBillsNoLoad } from "../../reducers/billsSlice";

const UserPages = lazy(() => import("../../DemoPages/UserPages"));
const Applications = lazy(() => import("../../DemoPages/Applications"));
const Dashboards = lazy(() => import("../../DemoPages/Dashboards"));

const Widgets = lazy(() => import("../../DemoPages/Widgets"));
const Elements = lazy(() => import("../../DemoPages/Elements"));
const Components = lazy(() => import("../../DemoPages/Components"));
const Charts = lazy(() => import("../../DemoPages/Charts"));
const Forms = lazy(() => import("../../DemoPages/Forms"));
const Tables = lazy(() => import("../../DemoPages/Tables"));


const AppMain = () => {

    const [isAuth, setIsAuth] = useState(null);
    const [tokenState, setTokenState] = useState(localStorage.getItem("token"));
    const dispatch = useDispatch();
    const transactions = useSelector(state => state.transactions);
    const box = useSelector(state => state.box);
    const bills = useSelector(state => state.bill);

    useEffect(() => {
        const checkAuth = async () => {
            if (!tokenState) {
                setIsAuth(false);
                return;
            }
            try {
                const userData = await verifyToken(tokenState);
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
                    if (transactions.transactions.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })

                socket.on('update_transaction', (data) => {
                    if (transactions.transactions.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })

                socket.on('confirm_transaction', (data) => {
                    console.log('confirm')
                    if (transactions.transactions.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })

                socket.on('cancel_transaction', (data) => {
                    if (transactions.transactions.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })

                socket.on('undo_box', (data) => {
                    if (data.box._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (transactions.transactions.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                    if (bills.bills.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                })

                socket.on('add_note', (data) => {
                    if (data.box._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })
                socket.on('delete_note', (data) => {
                    if (data.box._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })
                socket.on('update_box', (data) => {
                    if (data.box._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })
                socket.on('switch_box', (data) => {
                    if (data.box._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                })
                socket.on('create_bill', (data) => {
                    if (data.box._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (bills.bill?._id === data.buyerBill?._id || bills.bill?._id === data.sellerBill?._id) {
                        dispatch(getBillByIdNoLoad(bills.bill?._id));
                    }
                    if (bills.bills.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                    if (transactions.transactions.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                })
                socket.on('confirm_bill', (data) => {
                    if (data.box._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (bills.bill?._id === data.bill?._id) {
                        dispatch(getBillByIdNoLoad(bills.bill?._id));
                    }
                    if (bills.bills.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                    if (transactions.transactions.docs.length > 0) {
                        dispatch(getTransactionsNoLoad(transactions.filters));
                    }
                })
                socket.on('cancel_bill', (data) => {
                    if (data.box._id === box.box._id) {
                        dispatch(getBoxByIdNoLoad(box.box._id));
                    }
                    if (bills.bill?._id === data.bill?._id) {
                        dispatch(getBillByIdNoLoad(bills.bill?._id));
                    }
                    if (bills.bills.docs.length > 0) {
                        dispatch(getBillsNoLoad(bills.filters));
                    }
                    if (transactions.transactions.docs.length > 0) {
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
                    if (bills.bills.docs.length > 0) {
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

            {/* Components */}

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-pulse-rise"/>
                        </div>
                        <h6 className="mt-5">
                            Please wait while we load all the Components examples
                            <small>Because this is a demonstration we load at once all the Components examples. This wouldn't happen in a real live app!</small>
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/components" component={Components}/>
            </Suspense>

            {/* Forms */}

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-pulse-rise"/>
                        </div>
                        <h6 className="mt-5">
                            Please wait while we load all the Forms examples
                            <small>Because this is a demonstration we load at once all the Forms examples. This wouldn't happen in a real live app!</small>
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/forms" component={Forms}/>
            </Suspense>

            {/* Charts */}

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-rotate"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait while we load all the Charts examples
                            <small>Because this is a demonstration we load at once all the Charts examples. This wouldn't happen in a real live app!</small>
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/charts" component={Charts}/>
            </Suspense>

            {/* Tables */}

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-pulse-rise"/>
                        </div>
                        <h6 className="mt-5">
                            Please wait while we load all the Tables examples
                            <small>Because this is a demonstration we load at once all the Tables examples. This wouldn't happen in a real live app!</small>
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/tables" component={Tables}/>
            </Suspense>

            {/* Elements */}

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="line-scale"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait while we load all the Elements examples
                            <small>Because this is a demonstration we load at once all the Elements examples. This wouldn't happen in a real live app!</small>
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/elements" component={Elements}/>
            </Suspense>

            {/* Dashboard Widgets */}

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-pulse-sync"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait while we load all the Dashboard Widgets examples
                            <small>Because this is a demonstration we load at once all the Dashboard Widgets examples. This wouldn't happen in a real live app!</small>
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/widgets" component={Widgets}/>
            </Suspense>

            {/* Pages */}

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="line-scale-party"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait while we load all the Pages examples
                            <small>Because this is a demonstration we load at once all the Pages examples. This wouldn't happen in a real live app!</small>
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/pages" component={UserPages}/>
            </Suspense>

            {/* Applications */}

            <Suspense fallback={
                <div className="loader-container">
                    <div className="loader-container-inner">
                        <div className="text-center">
                            <Loader type="ball-pulse"/>
                        </div>
                        <h6 className="mt-3">
                            Please wait while we load all the Applications examples
                            <small>Because this is a demonstration we load at once all the Applications examples. This wouldn't happen in a real live app!</small>
                        </h6>
                    </div>
                </div>
            }>
                <Route path="/apps" component={Applications}/>
            </Suspense>

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
                <Route path="/permission" render={() => isAuth ? <Permissions /> : <Redirect to="/login" />
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
                <Route path="/role" render={() => isAuth ? <Roles /> : <Redirect to="/login" />
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
                <Route path="/staff" render={() => isAuth ? <Staffs /> : <Redirect to="/login" />
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
                <Route path="/login" render={() => isAuth ? <Redirect to="/dashboards" /> : <UserPages />
                }  />
            </Suspense>

            <Route exact path="/" render={() => (
                <Redirect to="/dashboards/crm"/>
            )}/>
            <ToastContainer/>
        </Fragment>
    )
};

export default AppMain;
