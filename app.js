// Firebase 初始化設定
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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
// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 提交資料
const scoreForm = document.getElementById('scoreForm');
scoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const score = document.getElementById('score').value;

    try {
        // 在 Realtime Database 中新增資料
        const scoresRef = ref(database, 'scores');
        const newScoreRef = push(scoresRef);
        await set(newScoreRef, {
            name: name,
            score: parseInt(score)
        });
        alert("資料已新增！");
        loadScores();
    } catch (e) {
        console.error("Error adding data: ", e);
    }
});

// 讀取並顯示資料
function loadScores() {
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = '';
    const scoresRef = ref(database, 'scores');
    onValue(scoresRef, (snapshot) => {
        scoreList.innerHTML = '';  // 清空列表
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const li = document.createElement('li');
            li.textContent = `${data.name}: ${data.score}`;
            scoreList.appendChild(li);
        });
    });
}

// 初始化時載入資料
loadScores();
