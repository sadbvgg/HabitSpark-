const habitInput = document.getElementById("habitInput");
const addBtn = document.getElementById("addBtn");
const habitList = document.getElementById("habitList");
const totalCount = document.getElementById("totalCount");
const progressBar = document.querySelector(".progress");
const quoteBox = document.querySelector(".quote");

let habits = JSON.parse(localStorage.getItem("habits")) || [];
let lastLoginDate = localStorage.getItem("lastLoginDate");

// 🔁 AUTO DAILY RESET SYSTEM
const today = new Date().toDateString();

// If user opens app on a new day
if (lastLoginDate !== today) {
  habits.forEach((habit) => {
    if (habit.lastCompleted !== today) {
      habit.completedToday = false; // Reset daily status
    }
  });
  localStorage.setItem("lastLoginDate", today);
  localStorage.setItem("habits", JSON.stringify(habits));
}

function renderHabits() {
  habitList.innerHTML = "";
  let completedCount = 0;

  habits.forEach((habit, index) => {
    const li = document.createElement("li");
    if (habit.completedToday) li.classList.add("completed");

    const top = document.createElement("div");
    top.className = "habit-top";

    const name = document.createElement("span");
    name.className = "habit-name";
    name.textContent = habit.text;
    name.addEventListener("click", () => toggleHabit(index));

    const del = document.createElement("button");
    del.textContent = "x";
    del.className = "delete";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteHabit(index);
    });

    top.appendChild(name);
    top.appendChild(del);

    const streak = document.createElement("span");
    streak.className = "streak";
    streak.textContent = `🔥 Streak: ${habit.streak} days`;

    li.appendChild(top);
    li.appendChild(streak);
    habitList.appendChild(li);

    if (habit.completedToday) completedCount++;
  });

  totalCount.textContent = habits.length;
  updateProgress(completedCount, habits.length);
}

function updateProgress(completed, total) {
  const percent = total === 0 ? 0 : (completed / total) * 100;
  progressBar.style.width = `${percent}%`;
}

function addHabit() {
  const text = habitInput.value.trim();
  if (text === "") return;

  habits.push({
    text,
    streak: 0,
    lastCompleted: null,
    completedToday: false,
  });
  habitInput.value = "";
  saveAndRender();
}

function toggleHabit(index) {
  const habit = habits[index];
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (habit.lastCompleted === today) {
    // Undo today's completion
    habit.completedToday = false;
    habit.lastCompleted = null;
  } else {
    // Mark as completed today
    if (habit.lastCompleted === yesterday) habit.streak++;
    else habit.streak = 1;

    habit.completedToday = true;
    habit.lastCompleted = today;
  }
  saveAndRender();
}

function deleteHabit(index) {
  habits.splice(index, 1);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem("habits", JSON.stringify(habits));
  renderHabits();
}

addBtn.addEventListener("click", addHabit);
habitInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addHabit();
});

renderHabits();

// 🌤️ Fetch daily motivational quote
fetch("https://type.fit/api/quotes")
  .then(res => res.json())
  .then(data => {
    const random = data[Math.floor(Math.random() * data.length)];
    quoteBox.textContent = `"${random.text}"`;
  })
  .catch(() => {
    quoteBox.textContent = `"Small progress every day leads to big results."`;
  });
