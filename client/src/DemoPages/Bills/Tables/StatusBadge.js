import React from 'react';

const BillStatusBadge = ({ status }) => {
    let badgeClass = '';
    let badgeText = '';

    switch (status) {
        case 1:
            badgeClass = 'bg-warning';
            badgeText = 'Đang xử lý';
            break;
        case 2:
            badgeClass = 'bg-success';
            badgeText = 'Thành công';
            break;
        case 3:
            badgeClass = 'bg-danger';
            badgeText = 'Hủy';
            break;
        default:
            badgeClass = 'bg-light';
            badgeText = 'Chưa xác định';
    }

    return (
            <span className={`badge ${badgeClass}`}>{badgeText}</span>
    
    );
};

export default BillStatusBadge;
