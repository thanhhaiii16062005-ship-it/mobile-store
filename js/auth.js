import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// ĐĂNG KÝ
// =====================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("registerMessage");


        if (password !== confirmPassword) {
            message.textContent =
                "❌ Mật khẩu nhập lại không khớp.";
            return;
        }


        if (password.length < 6) {
            message.textContent =
                "❌ Mật khẩu phải có ít nhất 6 ký tự.";
            return;
        }


        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            await updateProfile(user, {
                displayName: name
            });


            // Lưu người dùng vào Firestore
            await setDoc(
                doc(db, "users", user.uid),
                {
                    uid: user.uid,
                    name: name,
                    email: email,
                    role: "customer",
                    createdAt: serverTimestamp()
                }
            );


            message.textContent =
                "✅ Đăng ký thành công!";


            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);


        } catch (error) {

            console.error(error);


            if (error.code === "auth/email-already-in-use") {

                message.textContent =
                    "❌ Email này đã được đăng ký.";

            }
            else if (error.code === "auth/invalid-email") {

                message.textContent =
                    "❌ Email không hợp lệ.";

            }
            else if (error.code === "auth/weak-password") {

                message.textContent =
                    "❌ Mật khẩu phải có ít nhất 6 ký tự.";

            }
            else {

                message.textContent =
                    "❌ Đăng ký thất bại.";

            }

        }

    });

}


// =====================================================
// ĐĂNG NHẬP
// =====================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");


        try {

            message.textContent = "Đang đăng nhập...";


            // Đăng nhập Firebase Authentication
            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user = userCredential.user;


            // Lấy thông tin user từ Firestore
            const userRef =
                doc(db, "users", user.uid);

            const userSnap =
                await getDoc(userRef);


            let role = "customer";


            if (userSnap.exists()) {

                const userData = userSnap.data();

                role = (userData.role || "customer").trim();

            }


            message.textContent =
                "✅ Đăng nhập thành công!";


            // Phân quyền chuyển trang
            setTimeout(() => {

                if (role === "admin") {

                    window.location.href =
                        "admin/index.html";

                }
                else {

                    window.location.href =
                        "index.html";

                }

            }, 800);


        } catch (error) {

            console.error("Lỗi đăng nhập:", error);


            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {

                message.textContent =
                    "❌ Email hoặc mật khẩu không đúng.";

            }
            else if (error.code === "auth/invalid-email") {

                message.textContent =
                    "❌ Email không hợp lệ.";

            }
            else {

                message.textContent =
                    "❌ Đăng nhập thất bại.";

            }

        }

    });

}


// =====================================================
// HIỂN THỊ TRẠNG THÁI ĐĂNG NHẬP
// =====================================================

onAuthStateChanged(auth, function (user) {

    const userArea =
        document.getElementById("userArea");


    if (!userArea) {
        return;
    }


    // ĐÃ ĐĂNG NHẬP
    if (user) {

        const displayName =
            user.displayName || user.email;


        userArea.innerHTML = `

            <div class="user-menu">

                <span class="welcome-user">
                    👤 Xin chào, ${displayName}
                </span>

                <button
                    id="logoutButton"
                    class="logout-btn"
                    type="button"
                >
                    Đăng xuất
                </button>

            </div>

        `;


        const logoutButton =
            document.getElementById("logoutButton");


        logoutButton.addEventListener(
            "click",
            async function () {

                try {

                    await signOut(auth);

                    window.location.href =
                        "index.html";

                } catch (error) {

                    console.error(error);

                    alert(
                        "Không thể đăng xuất. Vui lòng thử lại."
                    );

                }

            }
        );

    }


    // CHƯA ĐĂNG NHẬP
    else {

        userArea.innerHTML = `

            <a
                href="login.html"
                class="login-btn"
            >
                Đăng nhập
            </a>

        `;

    }

});