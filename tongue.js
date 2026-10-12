const challenges = [
    { title: "Easy Peasy", text: "She sells seashells by the seashore." },
    { title: "Peter Piper", text: "Peter Piper picked a peck of pickled peppers." },
    { title: "Busy Bees", text: "Busy buzzing bees buzz by blue blossoms." },
    { title: "Red Lorry", text: "Red lorry, yellow lorry." },
    { title: "Fresh Fish", text: "Fresh fried fish, fish fresh fried." },
    { title: "Wooden Wood", text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?" },
    { title: "Fuzzy Wuzzy", text: "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair." },
    { title: "Unique New York", text: "Unique New York, unique New York, you know you need unique New York." },
    { title: "Eleven Elephants", text: "Eleven elegant elephants eagerly eat everything." },
    { title: "Tricky Trains", text: "The train travels through three thrilling tunnels." },
    { title: "Clever Clocks", text: "Clever clocks click clearly close to closing time." },
    { title: "Six Sticky Sticks", text: "Six sticky sticks stuck in six thick socks." },
    { title: "Rolling Rivers", text: "Round and round the rugged rocks the ragged rascal ran." },
    { title: "Black Background", text: "Black background, brown background." },
    { title: "Proper Copper", text: "A proper copper coffee pot." },
    { title: "Lesser Leather", text: "Lesser leather never weathered wetter weather better." },
    { title: "Truly Rural", text: "Truly rural, truly rural, the rural jury rarely worries." },
    { title: "Brisk Biscuit", text: "Brisk brave brigadiers brandished broad bright blades." },
    { title: "Advanced Challenge", text: "Six sleek swans swam swiftly southwards while seven swift swallows swept silently skywards." },
    { title: "Master Speaker", text: "The thirty-three thoughtful thieves thought that they thrilled the throne throughout Thursday." }
];

const STORAGE_KEY = "speakwise_tongue_progress_v1";

const $ = id => document.getElementById(id);

const levelLabel = $("levelLabel");
const progressLabel = $("progressLabel");
const progressBar = $("progressBar");
const xpValue = $("xpValue");
const completedValue = $("completedValue");
const challengeTitle = $("challengeTitle");
const twisterText = $("twisterText");
const levelBadge = $("levelBadge");
const playButton = $("playButton");
const stopButton = $("stopButton");
const audioStatus = $("audioStatus");
const recordButton = $("recordButton");
const stopRecordButton = $("stopRecordButton");
const recordStatus = $("recordStatus");
const recordedAudio = $("recordedAudio");
const completeButton = $("completeButton");
const resultBox = $("resultBox");
const resultTitle = $("resultTitle");
const scoreValue = $("scoreValue");
const resultMessage = $("resultMessage");
const practiceStatus = $("practiceStatus");
const playStatus = $("playStatus");
const earnedXP = $("earnedXP");
const nextButton = $("nextButton");
const unlockMessage = $("unlockMessage");
const levelPath = $("levelPath");
const toast = $("toast");

let currentLevel = 0;
let mediaRecorder = null;
let audioStream = null;
let audioChunks = [];
let audioUrl = null;
let hasRecording = false;
let hasPlayedRecording = false;
let isRecording = false;
let toastTimer;

function loadProgress() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (
            saved &&
            Array.isArray(saved.completed) &&
            Number.isFinite(saved.xp)
        ) {
            return {
                completed: [...new Set(
                    saved.completed.filter(
                        n => Number.isInteger(n) && n >= 0 && n < 20
                    )
                )],
                xp: Math.max(0, saved.xp)
            };
        }
    } catch (error) {
        console.warn("Could not load saved progress.", error);
    }

    return { completed: [], xp: 0 };
}

let progress = loadProgress();

function saveProgress() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        showToast("Progress could not be saved in this browser.");
    }
}

function getUnlockedLevel() {
    let unlocked = 0;

    while (
        unlocked < challenges.length - 1 &&
        progress.completed.includes(unlocked)
    ) {
        unlocked++;
    }

    return unlocked;
}

function renderPage() {
    const challenge = challenges[currentLevel];

    challengeTitle.textContent = challenge.title;
    twisterText.textContent = challenge.text;
    levelLabel.textContent = `Level ${currentLevel + 1} of 20`;
    levelBadge.textContent = `LEVEL ${currentLevel + 1}`;

    const percent = Math.round(
        progress.completed.length / challenges.length * 100
    );

    progressBar.style.width = percent + "%";
    progressLabel.textContent = percent + "% Completed";
    xpValue.textContent = progress.xp;
    completedValue.textContent = progress.completed.length;

    resultBox.hidden = true;
    completeButton.disabled = true;
    completeButton.textContent = "Complete Level →";

    hasRecording = false;
    hasPlayedRecording = false;

    recordedAudio.hidden = true;
    recordedAudio.removeAttribute("src");

    recordStatus.textContent =
        "Microphone is ready when you are.";
    audioStatus.textContent =
        "Listen to the tongue twister first.";

    renderLevelPath();
}

function renderLevelPath() {
    levelPath.innerHTML = "";

    const unlockedLevel = getUnlockedLevel();

    challenges.forEach((challenge, index) => {
        const button = document.createElement("button");
        button.type = "button";

        const completed = progress.completed.includes(index);
        const unlocked = index <= unlockedLevel;

        button.className = "level-node";

        if (completed) {
            button.classList.add("done");
        } else if (index === currentLevel) {
            button.classList.add("current");
        }

        button.disabled = !unlocked;

        const number = document.createElement("strong");
        number.textContent = completed
            ? "✓"
            : unlocked
                ? index + 1
                : "🔒";

        const label = document.createElement("span");
        label.textContent = completed
            ? "Completed"
            : unlocked
                ? "Practice"
                : "Locked";

        button.append(number, label);

        button.addEventListener("click", () => {
            if (isRecording) {
                showToast("Stop your recording first.");
                return;
            }

            stopVoice();
            currentLevel = index;
            renderPage();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        levelPath.appendChild(button);
    });
}

function playVoice() {
    if (!("speechSynthesis" in window)) {
        audioStatus.textContent =
            "Voice playback is not supported by this browser.";
        return;
    }

    stopVoice();

    const speech = new SpeechSynthesisUtterance(
        challenges[currentLevel].text
    );

    speech.lang = "en-US";
    speech.rate = 0.8;
    speech.pitch = 1;

    speech.onstart = () => {
        playButton.disabled = true;
        playButton.textContent = "🔊 Playing...";
        audioStatus.textContent = "Listen carefully!";
    };

    speech.onend = () => {
        playButton.disabled = false;
        playButton.textContent = "🔊 Play Again";
        audioStatus.textContent =
            "Voice finished! Now try saying it yourself.";
    };

    speech.onerror = () => {
        playButton.disabled = false;
        playButton.textContent = "🔊 Play Voice";
        audioStatus.textContent =
            "Playback failed. Try pressing Play Voice again.";
    };

    window.speechSynthesis.speak(speech);
}

function stopVoice() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    playButton.disabled = false;
    playButton.textContent = "🔊 Play Voice";
}

async function startRecording() {
    if (isRecording) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        recordStatus.textContent =
            "Microphone requires HTTPS or localhost and a supported browser.";
        showToast("Open this page using HTTPS or localhost.");
        return;
    }

    if (!window.MediaRecorder) {
        recordStatus.textContent =
            "Audio recording is not supported in this browser.";
        return;
    }

    try {
        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        audioChunks = [];

        let options = {};

        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
            options.mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
            options.mimeType = "audio/webm";
        }

        mediaRecorder = new MediaRecorder(audioStream, options);

        mediaRecorder.ondataavailable = event => {
            if (event.data && event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const type = mediaRecorder.mimeType || "audio/webm";
            const blob = new Blob(audioChunks, { type });

            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            audioUrl = URL.createObjectURL(blob);
            recordedAudio.src = audioUrl;
            recordedAudio.hidden = false;

            hasRecording = blob.size > 0;
            hasPlayedRecording = false;

            completeButton.disabled = !hasRecording;

            recordStatus.textContent = hasRecording
                ? "Recording saved! Play it back and listen to yourself."
                : "No audio was recorded. Please try again.";

            stopStream();
        };

        mediaRecorder.start();
        isRecording = true;

        recordButton.disabled = true;
        recordButton.classList.add("recording");
        recordButton.textContent = "🔴 Recording...";
        stopRecordButton.disabled = false;

        recordStatus.textContent =
            "Recording now! Speak the tongue twister clearly.";
        completeButton.disabled = true;

    } catch (error) {
        recordStatus.textContent =
            "Microphone permission denied or unavailable. Allow microphone access and try again.";

        showToast("Please allow microphone access.");
        stopStream();
    }
}

function stopRecording() {
    if (!mediaRecorder || !isRecording) return;

    isRecording = false;

    recordButton.disabled = false;
    recordButton.classList.remove("recording");
    recordButton.textContent = "🔴 Record Again";
    stopRecordButton.disabled = true;

    if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
}

function stopStream() {
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
}

recordedAudio.addEventListener("play", () => {
    hasPlayedRecording = true;

    recordStatus.textContent =
        "Listen carefully! Compare your speech with the original voice.";

    if (hasRecording) {
        completeButton.disabled = false;
    }
});

recordedAudio.addEventListener("ended", () => {
    hasPlayedRecording = true;

    recordStatus.textContent =
        "Playback completed! You can complete the level now.";

    completeButton.disabled = !hasRecording;
});

function completeLevel() {
    if (!hasRecording) {
        showToast("First record your voice, paa!");
        return;
    }

    if (!hasPlayedRecording) {
        showToast("Play your recording once before completing!");
        return;
    }

    const alreadyCompleted = progress.completed.includes(currentLevel);

    let gainedXP = 0;

    if (!alreadyCompleted) {
        progress.completed.push(currentLevel);
        progress.xp += 20;
        gainedXP = 20;
        saveProgress();
    }

    scoreValue.textContent = "100%";
    resultTitle.textContent = alreadyCompleted
        ? "Practice Completed Again! ⭐"
        : "Level Completed! 🎉";

    resultMessage.textContent = alreadyCompleted
        ? "You have already earned XP for this level. Keep practising!"
        : "Great work! You recorded your voice and played it back. Keep practising to improve your pronunciation.";

    practiceStatus.textContent = "✓";
    playStatus.textContent = "✓";
    earnedXP.textContent = gainedXP;

    resultBox.hidden = false;

    nextButton.hidden = currentLevel >= challenges.length - 1;

    unlockMessage.textContent =
        currentLevel >= challenges.length - 1
            ? "🏆 Amazing! You completed all 20 levels!"
            : `🔓 Level ${currentLevel + 2} is now unlocked!`;

    nextButton.textContent = `Next Level ${currentLevel + 2} →`;

    completeButton.disabled = true;
    completeButton.textContent = "Level Completed ✓";

    renderLevelPath();
    updateStats();

    resultBox.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

    if (gainedXP) {
        showToast("🎉 Level complete! +20 XP");
    }
}

function updateStats() {
    const percent = Math.round(
        progress.completed.length / challenges.length * 100
    );

    progressBar.style.width = percent + "%";
    progressLabel.textContent = percent + "% Completed";
    xpValue.textContent = progress.xp;
    completedValue.textContent = progress.completed.length;
}

function nextLevel() {
    if (!progress.completed.includes(currentLevel)) {
        showToast("Complete this level first!");
        return;
    }

    if (currentLevel >= challenges.length - 1) {
        showToast("🏆 All 20 levels completed!");
        return;
    }

    stopVoice();
    currentLevel++;
    renderPage();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

playButton.addEventListener("click", playVoice);

stopButton.addEventListener("click", () => {
    stopVoice();
    audioStatus.textContent = "Voice playback stopped.";
});

recordButton.addEventListener("click", startRecording);
stopRecordButton.addEventListener("click", stopRecording);
completeButton.addEventListener("click", completeLevel);
nextButton.addEventListener("click", nextLevel);

window.addEventListener("beforeunload", () => {
    stopVoice();
    stopStream();

    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }
});

renderPage();