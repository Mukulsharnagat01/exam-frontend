import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../services/api'; // ← Added
import toast from 'react-hot-toast'; // ← Added

const AdminTheory = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [subjectsLoading, setSubjectsLoading] = useState(true);

    // Fetch all subjects
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await api.get('/subjects'); // ← Changed
                const data = response.data;

                if (Array.isArray(data)) {
                    setSubjects(data);
                } else if (data.success && Array.isArray(data.subjects)) {
                    setSubjects(data.subjects);
                } else {
                    setSubjects(['mathematics', 'physics', 'chemistry']);
                }
            } catch (err) {
                console.error('Error loading subjects:', err);
                toast.error('Failed to load subjects');
            } finally {
                setSubjectsLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    // Fetch questions when subject changes
    useEffect(() => {
        if (selectedSubject) {
            fetchQuestions(selectedSubject);
        } else {
            setQuestions([]);
        }
    }, [selectedSubject]);

    const fetchQuestions = async (subject) => {
        try {
            setLoading(true);
            const response = await api.get(`/questions/${subject}?type=theory`); // ← Changed
            const data = response.data;

            let questionsArray = [];
            if (Array.isArray(data)) {
                questionsArray = data.filter(q => q.type === 'theory');
            } else if (data.success && Array.isArray(data.questions)) {
                questionsArray = data.questions.filter(q => q.type === 'theory');
            }

            setQuestions(questionsArray);
        } catch (err) {
            console.error('Error loading questions:', err);
            toast.error('Failed to load questions');
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setNewQuestion('');
        setAnswer('');
    };

    const addQuestion = async () => {
        if (!selectedSubject) {
            toast.error('Please select a subject first');
            return;
        }

        if (!newQuestion.trim()) {
            toast.error('Question text is required');
            return;
        }

        if (!answer.trim()) {
            toast.error('Answer is required for theory question');
            return;
        }

        try {
            const response = await api.post('/questions/theory', { // ← Changed
                subject: selectedSubject,
                question: newQuestion,
                answer: answer,
                type: "theory"
            });

            const saved = response.data;
            setQuestions(prev => [...prev, saved]);
            setNewQuestion('');
            setAnswer('');
            toast.success('Theory question added successfully!');
        } catch (err) {
            console.error('Error adding question:', err);
            toast.error('Failed to add question');
        }
    };

    const deleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        try {
            await api.delete(`/questions/theory/${id}`); // ← Changed
            setQuestions(questions.filter(q => q.id !== id));
            toast.success('Question deleted successfully!');
        } catch (err) {
            console.error('Error deleting question:', err);
            toast.error('Failed to delete question');
        }
    };

    if (subjectsLoading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="container mx-auto p-4">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading subjects...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4 max-w-6xl">
                <h1 className="text-2xl font-bold mb-6">Admin - Theory Questions Management</h1>

                {/* Subject Selection Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Select Subject for Theory Questions</h2>

                    {!selectedSubject ? (
                        <div>
                            <p className="text-gray-600 mb-4">Choose a subject to add/view theory questions:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {subjects.map((subject, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSubjectSelect(subject)}
                                        className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-center transition"
                                    >
                                        <span className="font-medium capitalize">{subject.replace(/-/g, ' ')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-green-700 font-medium">
                                        Selected Subject: <span className="capitalize">{selectedSubject.replace(/-/g, ' ')}</span>
                                    </p>
                                    <p className="text-sm text-green-600">Total Theory Questions: {questions.length}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedSubject('')}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Change Subject
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Theory Form - Only show when subject is selected */}
                {selectedSubject && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Add New Theory Question to <span className="text-purple-600 capitalize">{selectedSubject.replace(/-/g, ' ')}</span>
                        </h2>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Question:</label>
                            <textarea
                                placeholder="Enter your theory question..."
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded"
                                rows="3"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Expected Answer:</label>
                            <textarea
                                placeholder="Enter the expected answer..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded"
                                rows="4"
                            />
                        </div>

                        <button
                            onClick={addQuestion}
                            disabled={!newQuestion.trim() || !answer.trim()}
                            className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Theory Question
                        </button>
                    </div>
                )}

                {/* Questions List - Only show when subject is selected */}
                {selectedSubject && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                Theory Questions in <span className="text-purple-600 capitalize">{selectedSubject.replace(/-/g, ' ')}</span>
                            </h2>
                            <button
                                onClick={() => fetchQuestions(selectedSubject)}
                                className="text-purple-600 hover:text-purple-800"
                                disabled={loading}
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading questions...</p>
                            </div>
                        ) : questions.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No theory questions yet for this subject.</p>
                        ) : (
                            <div className="space-y-4">
                                {questions.map((q, i) => (
                                    <div key={q.id || i} className="p-4 border border-gray-200 rounded hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium mb-2">{q.question}</p>
                                                {q.answer && (
                                                    <div className="ml-4 p-3 bg-gray-50 rounded">
                                                        <p className="text-sm text-gray-600 mb-1">Expected Answer:</p>
                                                        <p className="text-gray-700">{q.answer}</p>
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500 mt-2">Subject: {q.subject || selectedSubject}</p>
                                            </div>
                                            <button
                                                onClick={() => deleteQuestion(q.id)}
                                                className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTheory;