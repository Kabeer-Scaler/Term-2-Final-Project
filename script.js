document.addEventListener("DOMContentLoaded", () => {
  const quizQuestion = document.getElementById("quiz-question");
  const quizOptions = document.getElementById("quiz-options");
  const quizSubmit = document.getElementById("quiz-submit");
  const quizResult = document.getElementById("quiz-result"); // Feedback area
  const ctx = document.getElementById("progressChart").getContext("2d");

  let currentQuestion = {};
  let selectedAnswer = "";
  const today = new Date().getDay(); // Get today's index (0 for Sunday, 6 for Saturday)

  // Load quiz statistics from localStorage
  let quizStats = JSON.parse(localStorage.getItem("quizStats")) || {
    totalQuestions: 0,
    weeklyData: new Array(7).fill(0), // Array of 7 days, each day initialized to 0
  };

  // Function to fetch a new quiz question
  async function fetchQuiz() {
    try {
      const response = await fetch("https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple");
      const data = await response.json();
      const questionData = data.results[0];

      displayQuestion(questionData);
    } catch (error) {
      console.error("Error fetching quiz:", error);
    }
  }

  function displayQuestion(questionData) {
    quizQuestion.innerHTML = questionData.question;
    quizResult.innerHTML = ""; // Clear previous result

    let answers = [...questionData.incorrect_answers, questionData.correct_answer];
    answers.sort(() => Math.random() - 0.5);

    quizOptions.innerHTML = "";
    answers.forEach(answer => {
      const button = document.createElement("button");
      button.classList.add("quiz-option");
      button.textContent = answer;
      button.addEventListener("click", () => {
        selectedAnswer = answer;
        document.querySelectorAll(".quiz-option").forEach(btn => btn.style.backgroundColor = "#f4f4f9");
        button.style.backgroundColor = "#b3d9ff";
      });
      quizOptions.appendChild(button);
    });

    currentQuestion.correct_answer = questionData.correct_answer;
  }

  quizSubmit.addEventListener("click", () => {
    if (!selectedAnswer) {
      quizResult.innerHTML = `<span style="color: red;">Please select an answer!</span>`;
      return;
    }

    if (selectedAnswer === currentQuestion.correct_answer) {
      quizResult.innerHTML = `<span style="color: green;">Correct! 🎉</span>`;
    } else {
      quizResult.innerHTML = `<span style="color: red;">Wrong! The correct answer was: <strong>${currentQuestion.correct_answer}</strong></span>`;
    }

    updateQuizStats();
    setTimeout(fetchQuiz, 2000); // Load a new question after 2 seconds
  });

  function updateQuizStats() {
    quizStats.totalQuestions += 1;
    quizStats.weeklyData[today] += 1; // Increase progress for today

    localStorage.setItem("quizStats", JSON.stringify(quizStats));
    updateChart();
  }

  let progressChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets: [
        {
          label: "Weekly Quiz Progress",
          data: quizStats.weeklyData,
          backgroundColor: "rgba(98, 0, 234, 0.6)",
          borderColor: "rgba(98, 0, 234, 1)",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  function updateChart() {
    progressChart.data.datasets[0].data = quizStats.weeklyData;
    progressChart.update();
  }

  fetchQuiz();
  updateChart();
});


