import { useState } from "react";
import "./App.css";
import LandingScreen from "./components/LandingScreen";
import Questionnaire from "./components/Questionnaire";
import ReviewScreen from "./components/ReviewScreen";

const initialAnswers = {
  players: "",
  time: "",
  complexity: "",
  mood: [],
  style: [],
  youngestPlayerAge: "",
  contentPreference: "",
};

function App() {
  const [isEditingReviewAnswer, setIsEditingReviewAnswer] = useState(false);
  const [screen, setScreen] = useState("landing");
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers);
  const [recommendationResponse, setRecommendationResponse] = useState(null);
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function editAnswer(step) {
    setSubmissionError("");
    setIsEditingReviewAnswer(true);
    setCurrentStep(step);
    setScreen("questionnaire");
  }

  async function submitQuestionnaire() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");

    const requestBody = {
      players: Number(answers.players),
      time: answers.time,
      complexity: answers.complexity,
      mood: answers.mood,
      style: answers.style,
      youngestPlayerAge: Number(answers.youngestPlayerAge),
      contentPreference: answers.contentPreference,
    };

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Recommendation request failed.");
      }

      const data = await response.json();

      setRecommendationResponse(data);
      setScreen("results");
    } catch (error) {
      console.error(error);

      setSubmissionError(
        "We could not get your recommendations. Your answers have been kept, so you can try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startQuestionnaire() {
    setScreen("questionnaire");
  }

  function returnToLanding() {
    setScreen("landing");
  }

  function showReview() {
    setIsEditingReviewAnswer(false);
    setScreen("review");
  }

  function startOver() {
    setAnswers(initialAnswers);
    setCurrentStep(1);
    setRecommendationResponse(null);
    setSubmissionError("");
    setIsSubmitting(false);
    setIsEditingReviewAnswer(false);
    setScreen("landing");
  }

  if (screen === "landing") {
    return <LandingScreen onStart={startQuestionnaire} />;
  }

  if (screen === "landing") {
    return <LandingScreen onStart={startQuestionnaire} />;
  }

  if (screen === "questionnaire") {
    return (
      <Questionnaire
        answers={answers}
        setAnswers={setAnswers}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onBackToStart={returnToLanding}
        onReview={showReview}
        isEditingReviewAnswer={isEditingReviewAnswer}
      />
    );
  }

  if (screen === "review") {
    return (
      <ReviewScreen
        answers={answers}
        onEdit={editAnswer}
        onSubmit={submitQuestionnaire}
        onStartOver={startOver}
        isSubmitting={isSubmitting}
        submissionError={submissionError}
      />
    );
  }

  if (screen === "results") {
    return (
      <main className="app-page">
        <section className="review-card">
          <h1>Recommendations received</h1>

          <p>
            The backend returned{" "}
            {recommendationResponse?.recommendationCount ?? 0} recommendations.
          </p>

          <p>The full results screen will be added next.</p>
        </section>
      </main>
    );
  }

  return null;
}

export default App;
