// 匯入 Firebase 函數
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, update, onValue, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
// 初始化 Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAv3DXVCQSlKRtWbHptoMyB7CMbtnWueTk",
    authDomain: "okok-44e11.firebaseapp.com",
    projectId: "okok-44e11",
    databaseURL: "https://okok-44e11-default-rtdb.asia-southeast1.firebasedatabase.app/",
    storageBucket: "okok-44e11.firebasestorage.app",
    messagingSenderId: "802160967963",
    appId: "1:802160967963:web:65c99065ddef3c749713be",
    measurementId: "G-MY47KBCFXW"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

// 存到 Cookie 的方法
function saveToCookie(data) {
    // 清除所有 Cookie
    document.cookie.split(";").forEach((cookie) => {
        const cookieName = cookie.split("=")[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
    const { displayName, email, photoURL, lastLoginTime, uid } = data;

    // 將資料存為 JSON 字符串
    const userData = JSON.stringify({ displayName, email, photoURL, lastLoginTime, uid });

    // 設置 Cookie (有效期 7 天)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `userData=${encodeURIComponent(userData)}; expires=${expires.toUTCString()}; path=/`;

    console.log("Data saved to cookie:", userData);
}
// 從 Cookie 顯示資料的方法
function getFromCookie() {
    // 解析 Cookie 字符串
    const cookies = document.cookie.split("; ");
    const userCookie = cookies.find(cookie => cookie.startsWith("userData="));

    if (!userCookie) {
        console.log("No user data found in cookie.");
        return null;
    }

    // 解碼並解析 JSON
    const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
    console.log("Data retrieved from cookie:", userData);
    return userData;
}


async function googleRegister() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const uid = user.uid;
        const { displayName, email, photoURL } = user;

        // 檢查使用者是否已存在
        const userRef = ref(database, 'users/' + uid);

        const snapshot = await get(userRef); // 使用 get() 來一次性獲取資料
        if (snapshot.exists()) {
            console.log("已經註冊");
            Swal.fire({
                icon: 'error',
                title: '使用者已經註冊！',
                text: '請稍後再試，或直接登入。',
                confirmButtonText: '確定',
            });
            return;
        } else {
            // 存儲新使用者資訊，並將註冊時間設置為當前時間
            const lastLoginTime = new Date().toISOString();
            await set(userRef, {
                displayName,
                email,
                photoURL,
                lastLoginTime
            });
            saveToCookie({ displayName, email, photoURL, lastLoginTime, uid });

            Swal.fire({
                icon: 'success',
                title: '註冊成功！！',
                text: '請稍後再試，或直接登入。',
                confirmButtonText: '確定',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "./log_analog.html";  // 轉向新頁面
                    return;
                }
            });

            console.log("註冊成功！", { displayName, email, photoURL, lastLoginTime });
            return;
        }
    } catch (error) {
        console.error("註冊失敗:", error);
        Swal.fire({
            icon: 'error',
            title: '註冊失敗',
            text: error.message,
            confirmButtonText: '確定',
        });
    }
}
// Google 登入功能
async function googleLogin() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const uid = user.uid;

        // 獲取使用者資訊
        const userRef = ref(database, 'users/' + uid);

        const snapshot = await get(userRef); // 使用 get() 來一次性獲取資料
        if (snapshot.exists()) {
            const { displayName, email, photoURL, lastLoginTime } = snapshot.val();
            const newLastLoginTime = new Date().toISOString();
            await update(userRef, { lastLoginTime: newLastLoginTime });

            console.log("登入成功", { displayName, email, photoURL, lastLoginTime, newLastLoginTime });
            saveToCookie({ displayName, email, photoURL, lastLoginTime, uid });
            window.location.href = "./log_analog.html";
        } else {
            console.log("使用者未註冊，請先註冊！");
            Swal.fire({
                icon: 'error',
                title: '使用者未註冊，請先註冊！',
                text: '請稍後再試，或聯繫支援。',
                confirmButtonText: '確定',
            });
        }
    } catch (error) {
        console.error("登入失敗:", error);
        Swal.fire({
            icon: 'error',
            title: '登入失敗',
            text: error.message,
            confirmButtonText: '確定',
        });
    }
}

// 綁定按鈕點擊事件
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("register-button").addEventListener("click", (event) => {
        event.preventDefault();  // 阻止預設行為
        googleRegister();  // 呼叫註冊函數
    });
    document.getElementById("login-button").addEventListener("click", (event) => {
        event.preventDefault();  // 阻止預設行為
        googleLogin();  // 呼叫登入函數
    });
});