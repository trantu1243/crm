import React, { useState } from "react";
import cx from "classnames";
import { toggleBlacklistCustomer } from "../../../services/customerService";

const ToggleBlacklist = ({ id, status }) => {
    const [isToggleOn, setIsToggleOn] = useState(status);

    const handleClick = async () => {
        setIsToggleOn(prevState => !prevState);
        await toggleBlacklistCustomer(id);
    };

    return (
        <div className="switch has-switch mb-2 me-2" data-on-label="ON"
            data-off-label="OFF" onClick={handleClick}>
            <div className={cx("switch-animate", {
                "switch-on": isToggleOn,
                "switch-off": !isToggleOn,
            })}>
                <input type="checkbox" checked={isToggleOn} readOnly />
                <span className="switch-left bg-danger">ON</span>
                <label>&nbsp;</label>
                <span className="switch-right bg-danger">OFF</span>
            </div>
        </div>
    );
};

export default ToggleBlacklist;
