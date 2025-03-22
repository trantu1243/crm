export const MainNav = [
    {
        icon: "pe-7s-rocket",
        label: "Dashboards",
        content: [
            {
              label: "Thống kê chung",
              to: "/dashboards/general",
            },
            {
              label: "Thống kê theo nhân viên",
              to: "/dashboards/staff",
            },
        ],
    },
    {
        icon: "pe-7s-browser",
        label: "Giao dịch trung gian",
        content: [
            {
                label: "Tạo giao dịch trung gian",
                to: "/create-transaction",
            },
            {
                label: "Quản lý giao dịch trung gian",
                to: "/transactions",
            },
            {
                label: "Quản lý thanh khoản",
                to: "/bills",
            },
            {
                label: "Các câu trả lời nhanh",
                to: "/quick-reply",
            },
        ],
    },
    {
      icon: "pe-7s-users",
      label: "Phân quyền hệ thống",
      content: [
            {
                label: "Quản lý nhóm quyền",
                to: "/role",
            },
            {
                label: "Quản lý nhân viên",
                to: "/staff",
            },
            {
                label: "Quản lý quyền thao tác",
                to: "/permission",
            }
        ],
    },
    {
      icon: "pe-7s-settings",
      label: "Cấu hình hệ thống",
      content: [
            {
                label: "Cấu hình ngân hàng",
                to: "/config/bank-account",
            },
            {
                label: "Cấu hình phí",
                to: "/config/fee",
            },
            {
                label: "Các câu trả lời nhanh",
                to: "/config/quick-answer",
            },
            {
                label: "Settings",
                to: "/config/setting",
            },
        ],
    },
];

