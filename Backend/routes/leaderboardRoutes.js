const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

router.get('/', async (req, res) => {
    try {
        let { quizId } = req.query; // Retrieve quizId from query parameters
        if (!quizId) {
            return res.status(400).json({ error: 'Missing quizId parameter' });
        }
        // Fetch totalMarks from the quiz table using quizId
        const quizDoc = await db.collection('quizzes').doc(quizId).get();
        if (!quizDoc.exists) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        const { totalMarks } = quizDoc.data();

        // Fetch data from results table
        const resultsSnapshot = await db.collection('results')
            .where('quizId', '==', quizId)
            .get();
        const resultsData = resultsSnapshot.docs.map(doc => doc.data());

        // Calculate statistics
        const numberOfParticipants = resultsData.length;
        const totalScore = resultsData.reduce((acc, result) => acc + result.score, 0);
        const averageScore = numberOfParticipants > 0 ? totalScore / numberOfParticipants : 0;
        const highestScore = Math.max(...resultsData.map(result => result.score));
        const participantsWithHighestScore = resultsData.filter(result => result.score === highestScore).length;

        // Sort the data based on score and timestamp
        resultsData.sort((a, b) => {
            // Sort by score
            if (a.score !== b.score) {
                return b.score - a.score; // Descending order of score
            } else {
                // If scores are equal, sort by timestamp
                return new Date(a.timestamp) - new Date(b.timestamp); // Ascending order of timestamp
            }
        });

        // Optionally, join with students table to get student name
        const leaderboard = await Promise.all(resultsData.map(async result => {
            const studentDoc = await db.collection('Student').doc(result.studentId).get();
            const studentData = studentDoc.data();
            const minutes = Math.floor(result.timeTaken / 60);
            const seconds = result.timeTaken % 60;
            const timeTakenFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            return {
                studentName: studentData.Name, // Include student name
                score: result.score,
                timeTaken: timeTakenFormatted
            };
        }));

        // Return the leaderboard data and statistics
        res.json({
            leaderboard,
            statistics: {
                numberOfParticipants,
                averageScore,
                highestScore,
                totalMarks, // Assuming totalMark is the same as highestScore in this context
                participantsWithHighestScore
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;