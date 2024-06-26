import "../styles.css";
import { Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";

function StudentSub() {
  const [subname, setSubname] = useState("");
  const [activeLevel, setActiveLevel] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const subjectId = new URLSearchParams(location.search).get("subjectId");
    if (subjectId) {
      fetchSubjectName(subjectId);
    }
  }, [location]);
  //prevent user from navigating to the page by pressing back button
  useEffect(() => {
    const preventBack = () => {
      window.history.forward();
    };

    setTimeout(preventBack, 0);

    window.onunload = () => {
      null;
    };

    return () => {
      window.onunload = null;
    };
  }, []);

  const fetchSubjectName = (id) => {
    setLoading(true);
    fetch(`http://localhost:3000/subject/name?id=${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch subject");
        }
        return response.json();
      })
      .then((data) => {
        setSubname(data.name);
        localStorage.setItem("subjectname", data.name);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching subject:", error);
        setError("Failed to fetch subject");
        setLoading(false);
      });
  };

  const handleLevelClick = (level) => {
    setActiveLevel(level);
    fetchQuizResults(level);
  };
  //fetching the rsults of the quiz
  const fetchQuizResults = (level) => {
    setLoading(true);
    setQuizResults([]);
    const subjectId = new URLSearchParams(window.location.search).get(
      "subjectId"
    );
    localStorage.setItem("subId", subjectId);
    localStorage.setItem("level", level);
    const studentId = localStorage.getItem("Id");
    fetch("http://localhost:3000/quizDetailsRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subjectId, level, studentId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch quiz names");
        }
        return response.json();
      })
      .then((data) => {
        const sortedQuizResults = data.quizResults.sort((a, b) =>
          b.name.localeCompare(a.name)
        );
        setQuizResults(sortedQuizResults);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching quiz names:", error);
        setError("Failed to fetch quiz names");
        setLoading(false);
      });
  };

  return (
    <>
      <div style={{ marginTop: "70px" }}>
        <h1 style={{ textAlign: "center", color: "#222831",padding:"20px" }}>{subname}</h1>
        <div className="instructions-container">
          <h2>General Instructions</h2>
          <p>
            Welcome to the quiz! Please read the following instructions
            carefully before proceeding:
          </p>
          <ol>
            <li>Ensure you have a stable internet connection.</li>
            <li>Answer all questions to the best of your ability.</li>
            <li>Double-check your answers before submitting.</li>
            <li>
              Do not press back button or refresh the page while attending the
              quiz.
            </li>
            <li>Attend the quiz only from your laptop.</li>
            <li>Click the finish button after completing the quiz.</li>
          </ol>
        </div>

        <div id="level-btn">
          <button
            type="button"
            className={`btn btn-lg ${activeLevel === "level1" ? "active" : ""}`}
            style={{
              backgroundColor: activeLevel === "1" ? "#212529" : "#76ABAE",
            }}
            onClick={() => handleLevelClick("1")}
          >
            Level 1
          </button>
          <button
            type="button"
            className={`btn btn-lg ${activeLevel === "level2" ? "active" : ""}`}
            style={{
              backgroundColor: activeLevel === "2" ? "#212529" : "#76ABAE",
            }}
            onClick={() => handleLevelClick("2")}
          >
            Level 2
          </button>
          <button
            type="button"
            className={`btn btn-lg ${activeLevel === "level3" ? "active" : ""}`}
            style={{
              backgroundColor: activeLevel === "3" ? "#212529" : "#76ABAE",
            }}
            onClick={() => handleLevelClick("3")}
          >
            Level 3
          </button>
        </div>
        {/*loading spinners*/}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100vh",
            }}
          >
            <div
              className="text-center"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="spinner-grow"
                  role="status"
                  style={{
                    width: "2rem",
                    height: "2rem",
                    color: "#222831",
                    marginRight: "1rem",
                    animationDuration: "1s",
                    animationDelay: "0s",
                  }}
                />
                <div
                  className="spinner-grow"
                  role="status"
                  style={{
                    width: "2rem",
                    height: "2rem",
                    color: "#2D5D81",
                    marginRight: "1rem",
                    animationDuration: "1s",
                    animationDelay: "0.25s",
                  }}
                />
                <div
                  className="spinner-grow"
                  role="status"
                  style={{
                    width: "2rem",
                    height: "2rem",
                    color: "#76ABAE",
                    animationDuration: "1s",
                    animationDelay: ".5s",
                  }}
                />
              </div>
              <p
                style={{
                  color: "#222831",
                  marginTop: "1rem",
                  fontFamily: "monospace",
                }}
              >
                Loading...
              </p>
            </div>
          </div>
        ) : (
          <>
            {quizResults.length > 0 && activeLevel && (
              <div className="level-click">
                {quizResults.map((quiz, index) => (
                  <div
                    className="card mb-3 shadow-bottom"
                    style={{
                      width: "70rem",
                      backgroundColor: "#EEEEEE",
                      borderColor: "#76ABAE",
                      margin: "20px auto",
                    }}
                    key={index}
                  >
                    {/*display the list of quizzes and details*/}
                    <div
                      className="card-body d-flex flex-column align-items-center justify-content-between"
                      style={{ padding: "100px " }}
                    >
                      <h5
                        className="card-title"
                        style={{
                          color: "#212529",
                          position: "absolute",
                          left: "6px",
                          top: "0px",
                          padding: "10px",
                        }}
                      >
                        {quiz.name}
                      </h5>
                      <div
                        className="attempt"
                        style={{
                          position: "absolute",
                          left: "90px",
                          top: "25px",
                          padding: "10px",
                        }}
                      >
                        <p>Number of Questions: {quiz.numberOfQuestions}</p>
                        <p>Time: {quiz.time} minutes</p>
                        <p>
                          Your Score:{" "}
                          {quiz.score !== null
                            ? quiz.score
                            : "Not attempted yet"}
                        </p>
                        <p>
                          No. of Attempts:{" "}
                          {quiz.noofattempts !== null
                            ? quiz.noofattempts
                            : "Not attempted yet"}
                        </p>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                        }}
                      >
                        <Link
                          to={`/Question?quiz=${encodeURIComponent(
                            JSON.stringify(quiz.name)
                          )}`}
                          className={`btn btn-primary btn-sm ${
                            !quiz.reattempt && quiz.noofattempts > 0
                              ? "disabled"
                              : ""
                          }`}
                          style={{
                            backgroundColor: "#76ABAE",
                            borderColor: "#76ABAE",
                          }}
                          disabled={!quiz.reattempt || quiz.noofattempts > 1}
                        >
                          Attempt Quiz
                        </Link>
                      </div>
                      <Link to={`/Leaderboard?quizId=${quiz.quizId}`}>
                        <div
                          className={`btn btn-primary btn-sm `}
                          style={{
                            backgroundColor: "#76ABAE",
                            borderColor: "#76ABAE",
                            position: "absolute",
                            bottom: "10px",
                            right: "170px",
                          }}
                        >
                          Leaderboard
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default StudentSub;
