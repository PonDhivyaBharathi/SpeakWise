"use strict";

const paragraphs = [
    {
        title: "My Daily Routine",
        description: "A simple paragraph about everyday activities.",
        text: "I wake up early in the morning. I brush my teeth and get ready for the day. I eat breakfast before going to college."
    },
    {
        title: "My College",
        description: "Listen to a paragraph about college life.",
        text: "My college is a place where I learn new things. I meet my friends and attend classes every day. I try to improve my knowledge and skills."
    },
    {
        title: "The Importance of Reading",
        description: "Learn why reading is useful.",
        text: "Reading books helps us gain knowledge. It improves our vocabulary and imagination. Reading for a few minutes every day can become a good habit."
    },
    {
        title: "A Good Friend",
        description: "Listen to a paragraph about friendship.",
        text: "A good friend supports us during difficult times. Friends share their happiness and help each other. True friendship is built on trust and respect."
    },
    {
        title: "Healthy Habits",
        description: "Practise listening to everyday advice.",
        text: "Healthy habits make our lives better. We should eat nutritious food, drink enough water, and exercise regularly. Good sleep is also important for our health."
    },
    {
        title: "Learning English",
        description: "Listen to ideas about learning a language.",
        text: "Learning English takes time and regular practice. We can improve by reading books, listening to conversations, and speaking every day. Mistakes help us learn."
    },
    {
        title: "The Environment",
        description: "A paragraph about protecting nature.",
        text: "The environment gives us air, water, and food. We should keep our surroundings clean and avoid wasting resources. Planting trees helps protect nature."
    },
    {
        title: "A Rainy Day",
        description: "Imagine a day filled with rain.",
        text: "Dark clouds covered the sky in the afternoon. Soon, rain began to fall on the streets and trees. People opened their umbrellas and walked carefully."
    },
    {
        title: "Time Management",
        description: "Learn how to use time wisely.",
        text: "Time management helps us complete our work on time. Making a daily plan can reduce stress. We should focus on important tasks before spending time on entertainment."
    },
    {
        title: "Technology in Education",
        description: "Listen to a paragraph about technology.",
        text: "Technology has changed the way students learn. Online lessons and digital libraries provide useful information. Students should use technology responsibly and avoid distractions."
    },
    {
        title: "Teamwork",
        description: "Understand the value of working together.",
        text: "Teamwork allows people to share ideas and responsibilities. Each person can contribute different skills. When a team communicates well, it can solve problems more effectively."
    },
    {
        title: "My Favourite Season",
        description: "Listen to a description of a favourite season.",
        text: "My favourite season is winter because the weather is cool and pleasant. I enjoy wearing warm clothes and drinking hot tea. The season makes outdoor walks comfortable."
    },
    {
        title: "The Value of Money",
        description: "Learn about careful spending.",
        text: "Money should be spent carefully and wisely. We can save a small amount regularly for future needs. Planning our expenses helps us avoid unnecessary purchases."
    },
    {
        title: "Artificial Intelligence",
        description: "Listen to a simple explanation of AI.",
        text: "Artificial intelligence helps computers perform tasks that usually require human intelligence. It can recognise patterns, understand language, and support decision making. People should use AI responsibly."
    },
    {
        title: "Building Confidence",
        description: "Listen to advice about self-confidence.",
        text: "Confidence grows when we practise and learn from experience. We should set realistic goals and celebrate small improvements. Speaking positively to ourselves can help us face challenges."
    },
    {
        title: "A Memorable Experience",
        description: "Listen to a story about a special experience.",
        text: "Last year, I took part in a college event. I worked with my classmates and learned how to manage my time. The experience taught me the importance of teamwork."
    },
    {
        title: "Career Planning",
        description: "Listen to ideas about preparing for a career.",
        text: "Career planning helps students understand their interests and strengths. They can develop useful skills through projects and internships. Preparing early can make the transition to work easier."
    },
    {
        title: "Communication Skills",
        description: "Learn why communication matters.",
        text: "Good communication helps people express ideas clearly. Listening carefully is just as important as speaking. Respectful communication can prevent misunderstandings and build stronger relationships."
    },
    {
        title: "Protecting Natural Resources",
        description: "A paragraph about saving resources.",
        text: "Natural resources are important for people and wildlife. We can conserve water by turning off taps when they are not needed. Reusing materials and reducing waste can also protect the environment."
    },
    {
        title: "The Power of Persistence",
        description: "Listen to a paragraph about not giving up.",
        text: "Success often requires patience, effort, and consistent practice. Difficult tasks may seem impossible at first, but breaking them into smaller steps makes them easier. Learning from mistakes helps us move forward."
    }
];

const STORAGE_KEY = "speakwise_paragraph_progress_v1";

const xpDisplay = document.getElementById("xpDisplay");
const levelLabel = document.getElementById("levelLabel");
const progressLabel = document.getElementById("progressLabel");
const progressBar = document.getElementById("progressBar");
const levelTag = document.getElementById("levelTag");
const paragraphTitle = document.getElementById("paragraphTitle");
const paragraphDescription = document.getElementById("paragraphDescription");
const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");
const voiceStatus = document.getElementById("voiceStatus");
const userAnswer = document.getElementById("userAnswer");
const checkButton = document.getElementById("checkButton");
const resultBox = document.getElementById("resultBox");
const scoreHeading = document.getElementById("scoreHeading");
const scoreValue = document.getElementById("scoreValue");
const resultMessage = document.getElementById("resultMessage");
const correctCount = document.getElementById("correctCount");
const wrongCount = document.getElementById("wrongCount");
const extraCount = document.getElementById("extraCount");
const reviewText = document.getElementById("reviewText");
const nextButton = document.getElementById("nextButton");
const retryButton = document.getElementById("retryButton");
const levelsGrid = document.getElementById("levelsGrid");

let currentLevel = 1;
let currentScore = 0;

function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (
            saved &&
            Array.isArray(saved.completed) &&
            Number.isFinite(saved.xp)
        ) {
            return {
                unlocked: Math.max(1, Math.min(20, Number(saved.unlocked) || 1)),
                completed: saved.completed.filter(
                    n => Number.isInteger(n) && n >= 1 && n <= 20
                ),
                xp: Math.max(0, Number(saved.xp) || 0)
            };
        }
    } catch (error) {
        console.warn("Could not read saved progress.", error);
    }

    return {
        unlocked: 1,
        completed: [],
        xp: 0
    };
}

let progress = loadProgress();

function saveProgress() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        console.warn("Could not save progress.", error);
    }
}

function updateProgressUI() {
    xpDisplay.textContent = "⭐ " + progress.xp + " XP";

    const percent = Math.round((progress.completed.length / 20) * 100);

    progressLabel.textContent = percent + "% Completed";
    progressBar.style.width = percent + "%";

    levelsGrid.replaceChildren();

    for (let i = 1; i <= 20; i++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "level-btn";

        const completed = progress.completed.includes(i);
        const unlocked = i <= progress.unlocked;

        if (completed) {
            button.classList.add("completed");
        } else if (!unlocked) {
            button.classList.add("locked");
        }

        if (i === currentLevel) {
            button.classList.add("current");
        }

        button.textContent =
            (completed ? "✓ " : !unlocked ? "🔒 " : "⭐ ") + i;

        button.disabled = !unlocked;

        button.addEventListener("click", function () {
            loadLevel(i);
        });

        levelsGrid.appendChild(button);
    }
}

function stopVoice() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    voiceStatus.textContent = "Voice stopped.";
}

function playVoice() {
    if (!("speechSynthesis" in window)) {
        voiceStatus.textContent =
            "Your browser does not support voice playback. Try Chrome.";
        return;
    }

    const text = paragraphs[currentLevel - 1].text;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.85;
    speech.pitch = 1;

    speech.onstart = function () {
        voiceStatus.textContent = "🔊 Playing paragraph...";
        playButton.disabled = false;
    };

    speech.onend = function () {
        voiceStatus.textContent = "Playback finished. You can play it again.";
        playButton.disabled = false;
    };

    speech.onerror = function (event) {
        voiceStatus.textContent =
            "Voice could not play: " + event.error +
            ". Try refreshing the page or using Chrome.";

        playButton.disabled = false;
    };

    playButton.disabled = true;

    window.speechSynthesis.speak(speech);
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[.,!?;:"'()]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/*
   Word-level alignment:
   Correct words are marked green.
   Wrong or missing words are marked red.
   Extra words typed by the user are marked orange.
*/
function compareWords(targetText, userText) {
    const target = normalizeText(targetText).split(" ").filter(Boolean);
    const user = normalizeText(userText).split(" ").filter(Boolean);

    const rows = target.length + 1;
    const cols = user.length + 1;

    const dp = Array.from(
        { length: rows },
        () => Array(cols).fill(0)
    );

    for (let i = 0; i < rows; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j < cols; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            if (target[i - 1] === user[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + 1
                );
            }
        }
    }

    let i = target.length;
    let j = user.length;

    const aligned = [];
    let correct = 0;
    let wrong = 0;
    let extra = 0;

    while (i > 0 || j > 0) {
        if (
            i > 0 &&
            j > 0 &&
            target[i - 1] === user[j - 1] &&
            dp[i][j] === dp[i - 1][j - 1]
        ) {
            aligned.push({ word: target[i - 1], type: "correct" });
            correct++;
            i--;
            j--;
        } else if (
            i > 0 &&
            j > 0 &&
            dp[i][j] === dp[i - 1][j - 1] + 1
        ) {
            aligned.push({ word: target[i - 1], type: "wrong" });
            wrong++;
            i--;
            j--;
        } else if (
            i > 0 &&
            dp[i][j] === dp[i - 1][j] + 1
        ) {
            aligned.push({ word: target[i - 1], type: "wrong" });
            wrong++;
            i--;
        } else {
            aligned.push({ word: user[j - 1], type: "extra" });
            extra++;
            j--;
        }
    }

    aligned.reverse();

    const accuracy = target.length
        ? Math.round((correct / target.length) * 100)
        : 0;

    return {
        correct,
        wrong,
        extra,
        accuracy,
        aligned
    };
}

function displayReview(aligned) {
    reviewText.replaceChildren();

    aligned.forEach(function (item, index) {
        const span = document.createElement("span");
        span.className = "word " + item.type;
        span.textContent = item.word;

        reviewText.appendChild(span);

        if (index < aligned.length - 1) {
            reviewText.appendChild(document.createTextNode(" "));
        }
    });
}

function loadLevel(level) {
    if (level < 1 || level > 20 || level > progress.unlocked) {
        return;
    }

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    currentLevel = level;
    currentScore = 0;

    const paragraph = paragraphs[currentLevel - 1];

    levelLabel.textContent = "Level " + currentLevel + " of 20";
    levelTag.textContent = "LEVEL " + currentLevel;
    paragraphTitle.textContent = paragraph.title;
    paragraphDescription.textContent = paragraph.description;

    voiceStatus.textContent = "Ready to play.";
    userAnswer.value = "";

    resultBox.hidden = true;
    checkButton.disabled = false;
    userAnswer.disabled = false;

    playButton.disabled = false;
    nextButton.hidden = true;

    updateProgressUI();
}

playButton.addEventListener("click", playVoice);
stopButton.addEventListener("click", stopVoice);

checkButton.addEventListener("click", function () {
    const typedText = userAnswer.value.trim();

    if (!typedText) {
        alert("First, listen to the paragraph and type your answer!");
        userAnswer.focus();
        return;
    }

    const targetText = paragraphs[currentLevel - 1].text;
    const result = compareWords(targetText, typedText);

    currentScore = result.accuracy;

    scoreValue.textContent = result.accuracy + "%";
    correctCount.textContent = result.correct;
    wrongCount.textContent = result.wrong;
    extraCount.textContent = result.extra;

    displayReview(result.aligned);

    const alreadyCompleted = progress.completed.includes(currentLevel);
    const passed = result.accuracy >= 80;

    if (passed) {
        scoreHeading.textContent = "🎉 Well Done!";

        if (!alreadyCompleted) {
            progress.completed.push(currentLevel);
            progress.xp += 20;

            if (currentLevel < 20) {
                progress.unlocked = Math.max(
                    progress.unlocked,
                    currentLevel + 1
                );
            }

            saveProgress();
        }

        resultMessage.textContent =
            "You scored " + result.accuracy +
            "%! You need at least 80% to pass. " +
            (alreadyCompleted
                ? "You have already earned XP for this level."
                : "You earned 20 XP!");

        nextButton.hidden = currentLevel >= 20;

        if (currentLevel >= 20) {
            resultMessage.textContent +=
                " Congratulations! You completed all 20 levels! 🏆";
        }
    } else {
        scoreHeading.textContent = "Keep Practising 💪";

        resultMessage.textContent =
            "You scored " + result.accuracy +
            "%. You need at least 80% to unlock the next level. " +
            "Listen again, review the red words, and try again.";

        nextButton.hidden = true;
    }

    resultBox.hidden = false;

    updateProgressUI();
});

retryButton.addEventListener("click", function () {
    resultBox.hidden = true;
    userAnswer.disabled = false;
    checkButton.disabled = false;
    userAnswer.focus();
});

nextButton.addEventListener("click", function () {
    if (currentLevel < 20 && currentLevel < progress.unlocked) {
        loadLevel(currentLevel + 1);
    }
});

loadLevel(Math.min(progress.unlocked, 20));

window.addEventListener("beforeunload", function () {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
});