import { db } from "../js/firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


let users = [];


async function loadUsers() {

    const userList = document.getElementById("userList");

    if (!userList) return;


    userList.innerHTML = `
        <div class="loading-products">
            Đang tải danh sách người dùng...
        </div>
    `;


    try {

        const snapshot = await getDocs(
            collection(db, "users")
        );


        users = snapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));


        console.log("✅ Đã tải", users.length, "người dùng");


        renderUsers(users);


    } catch (error) {

        console.error("❌ Lỗi tải người dùng:", error);


        userList.innerHTML = `
            <div class="empty-products">
                <h3>Không thể tải danh sách người dùng</h3>
                <p>${error.message}</p>
            </div>
        `;

    }

}


function renderUsers(userListData) {

    const userList = document.getElementById("userList");

    if (!userList) return;


    if (userListData.length === 0) {

        userList.innerHTML = `
            <div class="empty-products">
                <h3>Chưa có người dùng</h3>
                <p>Chưa có tài khoản nào được lưu trong hệ thống.</p>
            </div>
        `;

        return;

    }


    userList.innerHTML = `

        <div class="admin-table-wrapper">

            <table class="admin-table">

                <thead>

                    <tr>
                        <th>Họ và tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Ngày đăng ký</th>
                    </tr>

                </thead>

                <tbody>

                    ${userListData.map(user => `

                        <tr>

                            <td>
                                <strong>
                                    ${user.name || "Chưa cập nhật"}
                                </strong>
                            </td>

                            <td>
                                ${user.email || "Không có email"}
                            </td>

                            <td>

                                <span class="user-role">
                                    ${user.role === "admin"
                                        ? "Quản trị viên"
                                        : "Khách hàng"}
                                </span>

                            </td>

                            <td>
                                ${formatDate(user.createdAt)}
                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


function formatDate(timestamp) {

    if (!timestamp) {
        return "Chưa xác định";
    }


    try {

        const date = timestamp.toDate();

        return date.toLocaleDateString("vi-VN");

    } catch (error) {

        return "Chưa xác định";

    }

}


document.addEventListener("DOMContentLoaded", () => {

    const searchInput =
        document.getElementById("userSearch");


    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const keyword =
                searchInput.value.toLowerCase().trim();


            const filteredUsers = users.filter(user => {

                const name =
                    (user.name || "").toLowerCase();

                const email =
                    (user.email || "").toLowerCase();


                return (
                    name.includes(keyword) ||
                    email.includes(keyword)
                );

            });


            renderUsers(filteredUsers);

        });

    }


    loadUsers();

});