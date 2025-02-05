import React, { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyToken } from "../../services/authService";
import { loginSuccess, logout } from "../../reducers/userSlice";

const PrivateRoute = ({ component: Component, ...rest }) => {
    const [isAuth, setIsAuth] = useState(null);
    const [tokenState, setTokenState] = useState(localStorage.getItem("token"));
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuth = async () => {
            if (!tokenState) {
                setIsAuth(false);
                return;
            }
            try {
                const userData = await verifyToken(tokenState);
                dispatch(loginSuccess(userData));
                setIsAuth(true);
            } catch (error) {
                localStorage.removeItem("token");
                dispatch(logout());
                setIsAuth(false);
            }
        };

        checkAuth();
    }, [dispatch, tokenState]);

    if (isAuth === null) return <p>Loading...</p>;
    console.log(rest);
    return (
        <Route
            {...rest}
            render={(props) =>
                isAuth ? <Component {...props} /> : <Redirect to="/login" />
            }
        />
    );
};

export default PrivateRoute;
