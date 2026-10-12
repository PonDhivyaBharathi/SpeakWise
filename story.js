"use strict";

// ==========================================
// SPEAKWISE - STORY DEVELOPMENT
// ==========================================

const PASS_MARK = 80;
const TOTAL_LEVELS = 20;
const STORAGE_KEY = "speakwise_story_progress_v1";

// Story titles and tasks
const stories = [
    {
        title: "The Honest Woodcutter",
        task: "Write a story about an honest woodcutter who loses his axe and learns the value of honesty."
    },
    {
        title: "A Helpful Friend",
        task: "Write about two friends who help each other during a difficult situation."
    },
    {
        title: "The Lost Puppy",
        task: "Develop a story about a puppy that gets lost and finds its way home."
    },
    {
        title: "The Magic Garden",
        task: "Imagine a garden where magical things happen. Describe the adventure."
    },
    {
        title: "The Power of Kindness",
        task: "Write a story showing how one kind action can change someone's day."
    },
    {
        title: "The Clever Student",
        task: "Create a story about a student who solves a difficult problem using intelligence."
    },
    {
        title: "A Day Without a Phone",
        task: "Describe a day when a person cannot use a phone and discovers something new."
    },
    {
        title: "The Mysterious Letter",
        task: "Write an interesting story about a letter that arrives unexpectedly."
    },
    {
        title: "The Brave Little Girl",
        task: "Develop a story about a girl who faces her fear and helps others."
    },
    {
        title: "An Unexpected Journey",
        task: "Write about a journey that begins normally but turns into an exciting adventure."
    },
    {
        title: "The Forgotten Promise",
        task: "Create a story about someone who remembers an important promise at the last moment."
    },
    {
        title: "The Secret Room",
        task: "Imagine a secret room in an old house and explain what happens inside it."
    },
    {
        title: "A Mistake That Changed My Life",
        task: "Write a story about a mistake that teaches the main character an important lesson."
    },
    {
        title: "The Last Tree",
        task: "Develop a story about a village trying to save its last tree."
    },
    {
        title: "The Future Classroom",
        task: "Imagine a classroom in the future with robots, artificial intelligence, and new inventions."
    },
    {
        title: "The Missing Scientist",
        task: "Write a mystery story about a scientist who suddenly disappears."
    },
    {
        title: "A Journey to Another Planet",
        task: "Create a science-fiction story about travelling to another planet."
    },
    {
        title: "The City of Tomorrow",
        task: "Describe a future city and a challenge its people must solve."
    },
    {
        title: "The Power of One Decision",
        task: "Write a detailed story about how one decision changes several people's lives."
    },
    {
        title: "A World I Want to Create",
        task: "Write an imaginative story about your ideal world, its people, its challenges, and its future."
    }
];

// ==========================================
// ELEMENT REFERENCES
// ==========================================

const storyTitle = document.getElementById("storyTitle");
const storyTask = document.getElementById("storyTask");
const storyInput = document.getElementById("storyInput");

const levelText = document.getElementById("levelText");
const levelBadge = document.getElementById("levelBadge");
const xpText = document.getElementById("xpText");
const completedText = document.getElementById("completedText");

const percentageText = document.getElementById("percentageText");
const progressBar = document.getElementById("progressBar");

const wordCount = document.getElementById("wordCount");
const analyzeButton = document.getElementById("analyzeButton");
const message = document.getElementById("message");

const resultSection = document.getElementById("resultSection");
const scoreText = document.getElementById("scoreText");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");

const wordResult = document.getElementById("wordResult");
const grammarResult = document.getElementById("grammarResult");
const spellingResult = document.getElementById("spellingResult");
const xpResult = document.getElementById("xpResult");

const feedbackList = document.getElementById("feedbackList");
const tipsList = document.getElementById("tipsList");

const nextButton = document.getElementById("nextButton");
const retryButton = document.getElementById("retryButton");
const levelsGrid = document.getElementById("levelsGrid");

// ==========================================
// PROGRESS DATA
// ==========================================

function createDefaultProgress() {
    return {
        currentLevel: 0,
        xp: 0,
        completed: [],
        scores: {}
    };
}

function loadProgress() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return createDefaultProgress();
        }

        const parsed = JSON.parse(savedData);

        if (
            !parsed ||
            !Array.isArray(parsed.completed) ||
            typeof parsed.xp !== "number" ||
            typeof parsed.currentLevel !== "number"
        ) {
            return createDefaultProgress();
        }

        const completed = parsed.completed.filter(function (level) {
            return Number.isInteger(level) &&
                level >= 0 &&
                level < TOTAL_LEVELS;
        });

        const scores = {};

        if (parsed.scores && typeof parsed.scores === "object") {
            Object.keys(parsed.scores).forEach(function (key) {
                const level = Number(key);
                const score = parsed.scores[key];

                if (
                    Number.isInteger(level) &&
                    level >= 0 &&
                    level < TOTAL_LEVELS &&
                    typeof score === "number" &&
                    Number.isFinite(score)
                ) {
                    scores[level] = Math.max(0, Math.min(100, score));
                }
            });
        }

        return {
            currentLevel: Math.max(
                0,
                Math.min(TOTAL_LEVELS - 1, parsed.currentLevel)
            ),
            xp: Math.max(0, parsed.xp),
            completed: Array.from(new Set(completed)),
            scores: scores
        };

    } catch (error) {
        return createDefaultProgress();
    }
}

let progress = loadProgress();

function saveProgress() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        message.textContent =
            "Progress could not be saved. Please check browser storage settings.";
    }
}

// ==========================================
// LEVEL DISPLAY
// ==========================================

function renderLevel() {
    const story = stories[progress.currentLevel];

    storyTitle.textContent = story.title;
    storyTask.textContent = story.task;

    levelText.textContent =
        "Level " + (progress.currentLevel + 1) + " of " + TOTAL_LEVELS;

    levelBadge.textContent = "LEVEL " + (progress.currentLevel + 1);

    storyInput.value = "";

    message.textContent = "";
    resultSection.hidden = true;
    nextButton.hidden = true;

    analyzeButton.disabled = false;

    updateWordCount();
    renderProgress();
    renderLevels();
}

function renderProgress() {
    const completedCount = progress.completed.length;

    const percentage = Math.round(
        (completedCount / TOTAL_LEVELS) * 100
    );

    xpText.textContent = progress.xp;
    completedText.textContent = completedCount;

    percentageText.textContent = percentage + "%";
    progressBar.style.width = percentage + "%";
}

function renderLevels() {
    levelsGrid.innerHTML = "";

    for (let i = 0; i < TOTAL_LEVELS; i++) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "level-button";

        const isCompleted = progress.completed.includes(i);
        const isCurrent = i === progress.currentLevel;

        // A level is unlocked only if the previous level is completed.
        const isUnlocked =
            i === 0 || progress.completed.includes(i - 1);

        if (isCompleted) {
            button.classList.add("completed");
        }

        if (isCurrent) {
            button.classList.add("current");
        }

        button.disabled = !isUnlocked;

        if (isCompleted) {
            button.textContent = "✓ " + (i + 1);
        } else if (isUnlocked) {
            button.textContent = "Level " + (i + 1);
        } else {
            button.textContent = "🔒 " + (i + 1);
        }

        button.addEventListener("click", function () {
            if (!isUnlocked) {
                return;
            }

            progress.currentLevel = i;
            saveProgress();
            renderLevel();
        });

        levelsGrid.appendChild(button);
    }
}

// ==========================================
// WORD COUNT
// ==========================================

function getWords(text) {
    return text.trim().split(/\s+/).filter(Boolean);
}

function updateWordCount() {
    const words = getWords(storyInput.value);

    const count = storyInput.value.trim() === ""
        ? 0
        : words.length;

    wordCount.textContent = count + (count === 1 ? " word" : " words");
}

storyInput.addEventListener("input", updateWordCount);

// ==========================================
// SPELLING CHECK
// ==========================================

// These are common examples, not a complete dictionary.
const spellingCorrections = {
    teh: "the",
    recieve: "receive",
    beleive: "believe",
    freind: "friend",
    becuase: "because",
    becaus: "because",
    thier: "their",
    seperate: "separate",
    definately: "definitely",
    enviroment: "environment",
    goverment: "government",
    adress: "address",
    writting: "writing",
    begining: "beginning",
    langauge: "language",
    sucess: "success",
    tommorow: "tomorrow",
    untill: "until",
    wich: "which",
    peaple: "people",
    studing: "studying",
    beautifull: "beautiful",
    happend: "happened",
    importent: "important",
    knowlege: "knowledge",
    oportunity: "opportunity"
};

function checkSpelling(text) {
    const findings = [];
    const words = text.match(/\b[A-Za-z']+\b/g) || [];

    const seen = new Set();

    words.forEach(function (word) {
        const lower = word.toLowerCase();

        if (
            Object.prototype.hasOwnProperty.call(
                spellingCorrections,
                lower
            ) &&
            !seen.has(lower)
        ) {
            seen.add(lower);

            findings.push({
                original: word,
                correction: spellingCorrections[lower]
            });
        }
    });

    return findings;
}

// ==========================================
// GRAMMAR CHECK
// ==========================================

function checkGrammar(text) {
    const findings = [];

    const checks = [
        {
            pattern: /\b(i)\s+(is|are|am)\b/gi,
            message: 'Use "I am", not "I is" or "I are".',
            correction: "I am"
        },
        {
            pattern: /\b(he|she|it)\s+are\b/gi,
            message: 'Use "is" with he, she, or it.',
            correction: "he/she/it is"
        },
        {
            pattern: /\b(he|she|it)\s+have\b/gi,
            message: 'Use "has" with he, she, or it.',
            correction: "he/she/it has"
        },
        {
            pattern: /\b(he|she|it)\s+don't\b/gi,
            message: 'Use "does not" or "doesn\'t" with he, she, or it.',
            correction: "he/she/it doesn't"
        },
        {
            pattern: /\b(yesterday|last night|last week|last year)\b[^.!?]{0,80}\b(go|come|see|eat|write|take|give|make|find|fall|buy|run|speak|say|do|have|is|are)\b/gi,
            message: "This sentence mentions the past. Check whether the verb needs a past-tense form.",
            correction: "Use the appropriate past-tense verb."
        },
        {
            pattern: /\b(a)\s+[aeiou][a-z]+\b/gi,
            message: 'Use "an" before a vowel sound, for example "an apple".',
            correction: 'a → an (before a vowel sound)'
        },
        {
            pattern: /\b(an)\s+[bcdfghjklmnpqrstvwxyz][a-z]+\b/gi,
            message: 'Use "a" before a consonant sound, for example "a book".',
            correction: 'an → a (before a consonant sound)'
        },
        {
            pattern: /\b(he|she|it)\s+(go|eat|play|walk|write|read|work|like|want|need|run|speak|make|take|come|do)\b/gi,
            message: "In the simple present tense, he/she/it usually needs a verb ending in -s or -es.",
            correction: "Check the verb form."
        },
        {
            pattern: /\b(is|am|are)\s+(go|eat|play|walk|write|read|work|run|speak)\b/gi,
            message: "Check whether this sentence needs an -ing verb form.",
            correction: "For example: is going, was walking."
        },
        {
            pattern: /\b(very gooder|more better|most best|more easier|most easiest)\b/gi,
            message: "Avoid double comparatives or superlatives.",
            correction: "gooder → better; more better → better; more easier → easier"
        },
        {
            pattern: /\b(your welcome)\b/gi,
            message: 'The expression is "You are welcome".',
            correction: "You're welcome."
        },
        {
            pattern: /\b(could of|should of|would of)\b/gi,
            message: 'Use "could have", "should have", or "would have".',
            correction: "could have / should have / would have"
        },
        {
            pattern: /\b(their is|there is many|there are a)\b/gi,
            message: "Check the correct use of there, their, and the subject-verb agreement.",
            correction: "Rewrite the sentence according to its meaning."
        },
        {
            pattern: /\b(he|she|it)\s+was\s+\w+ing\b/gi,
            message: "This is a valid past continuous form in many contexts. Check that it fits your story's timeline.",
            correction: "No automatic correction; review the context."
        }
    ];

    checks.forEach(function (check) {
        const matches = text.match(check.pattern);

        if (matches) {
            matches.forEach(function (match) {
                // Do not count the same phrase more than once.
                const key = check.message + "|" + match.toLowerCase();

                if (!findings.some(function (item) {
                    return item.key === key;
                })) {
                    findings.push({
                        key: key,
                        phrase: match,
                        message: check.message,
                        correction: check.correction
                    });
                }
            });
        }
    });

    // Check repeated consecutive words.
    const repeatedWords = text.match(/\b([a-z]+)\s+\1\b/gi) || [];

    repeatedWords.forEach(function (phrase) {
        findings.push({
            key: "repeat|" + phrase.toLowerCase(),
            phrase: phrase,
            message: "This word appears twice in a row.",
            correction: "Remove the repeated word."
        });
    });

    // Check sentences that may start with a lowercase letter.
    const sentences = text.match(/[^.!?]+[.!?]?/g) || [];

    sentences.forEach(function (sentence) {
        const trimmed = sentence.trim();

        if (trimmed && /^[a-z]/.test(trimmed)) {
            findings.push({
                key: "capital|" + trimmed,
                phrase: trimmed,
                message: "Start the sentence with a capital letter.",
                correction: "Capitalize the first letter."
            });
        }
    });

    return findings;
}

// ==========================================
// STORY ANALYSIS AND MARKS
// ==========================================

function calculateScore(text, words, grammar, spelling) {
    let score = 100;

    // Deduct marks for common grammar flags.
    score -= grammar.length * 5;

    // Deduct marks for spelling flags.
    score -= spelling.length * 3;

    // Very short stories do not demonstrate enough writing.
    if (words.length < 30) {
        score -= 20;
    } else if (words.length < 50) {
        score -= 10;
    }

    // Sentence structure and punctuation checks.
    const sentences = text
        .split(/[.!?]+/)
        .map(function (sentence) {
            return sentence.trim();
        })
        .filter(Boolean);

    if (sentences.length < 3) {
        score -= 10;
    }

    if (!/[.!?]["')\]]?\s*$/.test(text.trim())) {
        score -= 5;
    }

    // Prevent scores from going below zero.
    return Math.max(0, Math.min(100, score));
}

function addFeedback(type, title, description) {
    const item = document.createElement("div");
    item.className = "feedback-item " + type;

    const strong = document.createElement("strong");
    strong.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = description;

    item.appendChild(strong);
    item.appendChild(paragraph);

    feedbackList.appendChild(item);
}

function addTip(text) {
    const item = document.createElement("li");
    item.textContent = text;
    tipsList.appendChild(item);
}

function analyzeStory() {
    const text = storyInput.value.trim();
    const words = getWords(text);

    message.textContent = "";

    if (text.length === 0) {
        message.textContent = "Please write your story before analyzing it.";
        storyInput.focus();
        return;
    }

    if (words.length < 10) {
        message.textContent =
            "Please write at least 10 words. Try to develop your story further.";
        storyInput.focus();
        return;
    }

    const grammar = checkGrammar(text);
    const spelling = checkSpelling(text);

    const score = calculateScore(text, words, grammar, spelling);

    const current = progress.currentLevel;

    const wasCompleted = progress.completed.includes(current);
    const previousBest = progress.scores[current] || 0;

    // Save the best score achieved for this level.
    progress.scores[current] = Math.max(previousBest, score);

    let earnedXP = 0;

    if (score >= PASS_MARK && !wasCompleted) {
        progress.completed.push(current);
        earnedXP = 20;
        progress.xp += earnedXP;
    }

    saveProgress();

    scoreText.textContent = score;
    wordResult.textContent = words.length;
    grammarResult.textContent = grammar.length;
    spellingResult.textContent = spelling.length;
    xpResult.textContent = earnedXP;

    if (score >= PASS_MARK) {
        resultTitle.textContent = "🎉 Excellent Work!";

        resultMessage.textContent = wasCompleted
            ? "You have already completed this level. Your best score is saved."
            : "You passed this level and earned 20 XP!";

    } else {
        resultTitle.textContent = "💪 Keep Practicing!";

        resultMessage.textContent =
            "You need " + PASS_MARK +
            " marks to unlock the next level. Review the feedback and try again.";
    }

    feedbackList.innerHTML = "";
    tipsList.innerHTML = "";

    if (grammar.length === 0) {
        addFeedback(
            "success",
            "No common grammar patterns detected",
            "Good! The basic grammar checks did not find any of the patterns they recognize. This does not guarantee that every sentence is correct."
        );
    } else {
        grammar.forEach(function (item) {
            addFeedback(
                "error",
                "Grammar review: " + item.phrase,
                item.message + " Suggested guidance: " + item.correction
            );
        });
    }

    if (spelling.length === 0) {
        addFeedback(
            "success",
            "No listed spelling mistakes detected",
            "No words from the built-in spelling list were found. This is a limited check, not a full dictionary check."
        );
    } else {
        spelling.forEach(function (item) {
            addFeedback(
                "error",
                "Spelling: " + item.original,
                "Suggested spelling: " + item.correction
            );
        });
    }

    if (words.length < 30) {
        addTip("Develop your story with at least 30 words.");
    }

    if (words.length < 50) {
        addTip("Try adding more details, actions, and descriptions.");
    }

    if (grammar.length > 0) {
        addTip("Review subject-verb agreement and verb tense.");
    }

    if (spelling.length > 0) {
        addTip("Check the spelling suggestions and rewrite the incorrect words.");
    }

    if (text[0] && text[0] !== text[0].toUpperCase()) {
        addTip("Begin your story with a capital letter.");
    }

    if (!/[.!?]["')\]]?\s*$/.test(text)) {
        addTip("Finish your final sentence with suitable punctuation.");
    }

    if (score >= PASS_MARK) {
        addTip("Great progress! Continue using clear sentences and interesting details.");
    } else {
        addTip("Correct the flagged issues, improve your story, and analyze it again.");
    }

    const nextLevel = current + 1;

    nextButton.hidden = !(
        score >= PASS_MARK &&
        nextLevel < TOTAL_LEVELS
    );

    resultSection.hidden = false;

    renderProgress();
    renderLevels();

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// ==========================================
// BUTTON EVENTS
// ==========================================

analyzeButton.addEventListener("click", analyzeStory);

retryButton.addEventListener("click", function () {
    resultSection.hidden = true;
    message.textContent = "";
    storyInput.focus();
});

nextButton.addEventListener("click", function () {
    const current = progress.currentLevel;

    if (
        progress.completed.includes(current) &&
        current < TOTAL_LEVELS - 1
    ) {
        progress.currentLevel = current + 1;

        saveProgress();
        renderLevel();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
});

// ==========================================
// START APPLICATION
// ==========================================

renderLevel();