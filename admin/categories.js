// =====================================================
// QUẢN LÝ DANH MỤC - MOBILE STORE
// =====================================================

import { db } from "../js/firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// BIẾN
// =====================================================

let categories = [];

// =====================================================
// LẤY DANH MỤC
// =====================================================

async function loadCategories() {

    const categoryList = document.getElementById("categoryList");

    if (!categoryList) return;

    categoryList.innerHTML = `
        <div class="loading-products">
            Đang tải danh mục...
        </div>
    `;

    try {

        const snapshot = await getDocs(
            collection(db, "categories")
        );

        categories = snapshot.docs.map(item => ({
            id: item.id,
            ...item.data()
        }));

        console.log(
            "✅ Đã tải",
            categories.length,
            "danh mục"
        );

        renderCategories();

    } catch (error) {

        console.error(
            "❌ Lỗi tải danh mục:",
            error
        );

        categoryList.innerHTML = `
            <div class="empty-state">
                ❌ Không thể tải danh mục.
                <br><br>
                ${error.message}
            </div>
        `;
    }
}

// =====================================================
// HIỂN THỊ DANH MỤC
// =====================================================

function renderCategories() {

    const categoryList =
        document.getElementById("categoryList");

    if (!categoryList) return;

    if (categories.length === 0) {

        categoryList.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 40px;">📂</div>

                <h3>Chưa có danh mục</h3>

                <p>
                    Hãy thêm danh mục đầu tiên.
                </p>
            </div>
        `;

        return;
    }

    categoryList.innerHTML = categories.map(
        (category, index) => `
            <div class="admin-category-item">

                <div>
                    <strong>
                        ${index + 1}.
                        ${category.name || "Chưa đặt tên"}
                    </strong>

                    <small>
                        ID: ${category.id}
                    </small>
                </div>

                <div class="admin-actions">

                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick="editCategory('${category.id}')"
                    >
                        ✏️ Sửa
                    </button>

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deleteCategory('${category.id}')"
                    >
                        🗑️ Xóa
                    </button>

                </div>

            </div>
        `
    ).join("");
}

// =====================================================
// THÊM DANH MỤC
// =====================================================

async function addCategory(event) {

    event.preventDefault();

    const input =
        document.getElementById("categoryName");

    if (!input) return;

    const name = input.value.trim();

    if (!name) {

        alert(
            "⚠️ Vui lòng nhập tên danh mục!"
        );

        return;
    }

    // Kiểm tra trùng tên

    const exists = categories.some(
        category =>
            (category.name || "").toLowerCase()
            === name.toLowerCase()
    );

    if (exists) {

        alert(
            "⚠️ Danh mục này đã tồn tại!"
        );

        return;
    }

    try {

        await addDoc(
            collection(db, "categories"),
            {
                name: name,
                createdAt: serverTimestamp()
            }
        );

        alert(
            "✅ Thêm danh mục thành công!"
        );

        input.value = "";

        await loadCategories();

    } catch (error) {

        console.error(
            "❌ Lỗi thêm danh mục:",
            error
        );

        alert(
            "❌ Không thể thêm danh mục!\n\n"
            + error.message
        );
    }
}

// =====================================================
// SỬA DANH MỤC
// =====================================================

window.editCategory = async function(categoryId) {

    const category = categories.find(
        item => item.id === categoryId
    );

    if (!category) return;

    const newName = prompt(
        "Nhập tên danh mục mới:",
        category.name || ""
    );

    if (newName === null) return;

    const name = newName.trim();

    if (!name) {

        alert(
            "⚠️ Tên danh mục không được để trống!"
        );

        return;
    }

    try {

        await updateDoc(
            doc(db, "categories", categoryId),
            {
                name: name,
                updatedAt: serverTimestamp()
            }
        );

        alert(
            "✅ Cập nhật danh mục thành công!"
        );

        await loadCategories();

    } catch (error) {

        console.error(
            "❌ Lỗi sửa danh mục:",
            error
        );

        alert(
            "❌ Không thể sửa danh mục!\n\n"
            + error.message
        );
    }
};

// =====================================================
// XÓA DANH MỤC
// =====================================================

window.deleteCategory = async function(categoryId) {

    const category = categories.find(
        item => item.id === categoryId
    );

    if (!category) return;

    const confirmed = confirm(
        `Bạn có chắc muốn xóa danh mục "${category.name}" không?`
    );

    if (!confirmed) return;

    try {

        await deleteDoc(
            doc(db, "categories", categoryId)
        );

        alert(
            "✅ Đã xóa danh mục!"
        );

        await loadCategories();

    } catch (error) {

        console.error(
            "❌ Lỗi xóa danh mục:",
            error
        );

        alert(
            "❌ Không thể xóa danh mục!\n\n"
            + error.message
        );
    }
};

// =====================================================
// KHỞI ĐỘNG
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const categoryForm =
            document.getElementById("categoryForm");

        if (categoryForm) {

            categoryForm.addEventListener(
                "submit",
                addCategory
            );
        }

        loadCategories();
    }
);