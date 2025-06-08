import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    signInAnonymously,
    signInWithCustomToken
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    addDoc, 
    query, 
    where, 
    getDocs,
    onSnapshot,
    updateDoc,
} from 'firebase/firestore';
import { ArrowRight, BarChart, CheckCircle, Flame, Heart, LogOut, Sun, Target, Users, Zap, X, Plus, Info } from 'lucide-react';

// --- Firebase Configuration (Updated with your project keys) ---
const firebaseConfig = {
  apiKey: "AIzaSyAEXgwyTLNOgVmxFQZHFKtPaHN7u4i4guw",
  authDomain: "my-awesome-fitness-app-e7bad.firebaseapp.com",
  projectId: "my-awesome-fitness-app-e7bad",
  storageBucket: "my-awesome-fitness-app-e7bad.appspot.com", // Corrected for standard format
  messagingSenderId: "584937924904",
  appId: "1:584937924904:web:f5e88a02a28df03b13881d",
  measurementId: "G-EKJV3605RP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper for App ID ---
const appId = 'my-awesome-fitness-app-e7bad'; 

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('login'); // 'dashboard', 'workouts', 'challenges', 'profile', 'about', 'login', 'signup'
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && !user.isAnonymous) {
                const userDocRef = doc(db, `users/${user.uid}`);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUser({ uid: user.uid, ...userDocSnap.data() });
                } else {
                    setUser({ uid: user.uid, email: user.email }); 
                }
                setPage('dashboard');
            } else {
                setUser(null);
                setPage('login');
            }
            setIsAuthReady(true);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setPage('login');
    };

    if (loading) {
        return <LoadingScreen />;
    }

    const renderPage = () => {
        if (!isAuthReady) return <LoadingScreen />;
        
        switch (page) {
            case 'signup':
                return <SignUpPage setPage={setPage} />;
            case 'login':
                return <LoginPage setPage={setPage} />;
            case 'dashboard':
                return <Dashboard user={user} setPage={setPage} />;
            case 'workouts':
                return <WorkoutsPage user={user} setPage={setPage} />;
            case 'challenges':
                return <ChallengesPage user={user} setPage={setPage} />;
            case 'profile':
                return <ProfilePage user={user} setUser={setUser} setPage={setPage} />;
            case 'about':
                return <AboutPage />;
            default:
                return <LoginPage setPage={setPage} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            {user && <Navbar setPage={setPage} handleLogout={handleLogout} />}
            <main className="p-4 sm:p-6 lg:p-8">
                {renderPage()}
            </main>
        </div>
    );
}

// --- Screens/Pages Components ---

function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
}

function LoginPage({ setPage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setPage('dashboard');
        } catch (err) {
            setError(err.message); // Show the actual error
            console.error("Login Error:", err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Welcome Back!</h2>
                    <p className="mt-2 text-sm text-gray-400">Log in to continue your fitness journey.</p>
                </div>
                {error && <p className="text-red-500 text-center bg-red-900/50 p-3 rounded-md">{error}</p>}
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <button type="submit" className="w-full py-3 mt-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300">Log In</button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-400">
                    Don't have an account? <button onClick={() => setPage('signup')} className="font-medium text-blue-400 hover:text-blue-500">Sign up</button>
                </p>
            </div>
        </div>
    );
}

// --- UPDATED SignUpPage with better error message ---
function SignUpPage({ setPage }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, `users`, user.uid), {
                name: name,
                email: email,
                joinDate: new Date().toISOString(),
                healthCoins: 0,
                goals: { weight: 0, steps: 10000 }
            });

            setPage('dashboard');
        } catch (err) {
            // THIS IS THE IMPORTANT CHANGE
            // We now show the *actual* error message from Firebase.
            setError(err.message); 
            console.error("Sign Up Error:", err);
            console.error("Firebase Error Code:", err.code);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">Join the Community</h2>
                    <p className="mt-2 text-sm text-gray-400">Create an account to start tracking.</p>
                </div>
                {error && <p className="text-red-500 text-center bg-red-900/50 p-3 rounded-md">{error}</p>}
                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                    <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <button type="submit" className="w-full py-3 mt-4 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300">Sign Up</button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-400">
                    Already have an account? <button onClick={() => setPage('login')} className="font-medium text-blue-400 hover:text-blue-500">Log in</button>
                </p>
            </div>
        </div>
    );
}


function Navbar({ setPage, handleLogout }) {
    return (
        <nav className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
            <div className="text-2xl font-bold text-blue-400">FitTrack</div>
            <div className="hidden md:flex items-center space-x-6">
                <button onClick={() => setPage('dashboard')} className="hover:text-blue-400 transition">Dashboard</button>
                <button onClick={() => setPage('workouts')} className="hover:text-blue-400 transition">Workouts</button>
                <button onClick={() => setPage('challenges')} className="hover:text-blue-400 transition">Challenges</button>
                <button onClick={() => setPage('profile')} className="hover:text-blue-400 transition">Profile</button>
                <button onClick={() => setPage('about')} className="hover:text-blue-400 transition">About</button>
            </div>
             <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-500 px-3 py-2 rounded-lg hover:bg-red-600 transition">
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </nav>
    );
}

function Dashboard({ user, setPage }) {
    const [workouts, setWorkouts] = useState([]);
    const [stats, setStats] = useState({ calories: 0, time: 0, steps: 0 });

    useEffect(() => {
        if (!user || !user.uid) return;

        const q = query(collection(db, `users/${user.uid}/workouts`));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const workoutsData = [];
            let totalCalories = 0, totalTime = 0, totalSteps = 0;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                workoutsData.push({ id: doc.id, ...data });
                totalCalories += data.calories || 0;
                totalTime += data.duration || 0;
                if(data.type === 'Running' || data.type === 'Walking') {
                    totalSteps += data.steps || 0;
                }
            });
            workoutsData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setWorkouts(workoutsData.slice(0, 5)); // show latest 5
            setStats({ calories: totalCalories, time: totalTime, steps: totalSteps });
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
                <p className="text-gray-400 mt-2">Here's a look at your progress today. Keep it up!</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4">
                    <Flame className="text-red-500" size={40} />
                    <div>
                        <p className="text-gray-400">Calories Burned</p>
                        <p className="text-2xl font-bold">{stats.calories.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4">
                    <Zap className="text-yellow-500" size={40} />
                    <div>
                        <p className="text-gray-400">Active Minutes</p>
                        <p className="text-2xl font-bold">{stats.time}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg flex items-center space-x-4">
                    <Heart className="text-pink-500" size={40} />
                    <div>
                        <p className="text-gray-400">Total Steps</p>
                        <p className="text-2xl font-bold">{stats.steps.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Recent Workouts</h2>
                 <div className="space-y-4">
                    {workouts.length > 0 ? workouts.map(workout => (
                        <div key={workout.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-lg">{workout.type}</p>
                                <p className="text-sm text-gray-400">{new Date(workout.date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="font-bold">{workout.duration} mins</p>
                                <p className="text-sm text-gray-400">{workout.calories} kcal</p>
                            </div>
                        </div>
                    )) : <p className="text-gray-400">No recent workouts. Time to get active!</p>}
                </div>
                 <button onClick={() => setPage('workouts')} className="mt-6 w-full py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2">
                    <Plus size={20} />
                    Log a New Workout
                </button>
            </div>
        </div>
    );
}

function WorkoutsPage({ user, setPage }) {
    const [workouts, setWorkouts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    useEffect(() => {
        if (!user || !user.uid) return;
        const q = query(collection(db, `users/${user.uid}/workouts`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const workoutsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            workoutsData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setWorkouts(workoutsData);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Your Workouts</h1>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <Plus size={20} /> Log Workout
                </button>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
                {workouts.length > 0 ? (
                    <div className="space-y-4">
                        {workouts.map(workout => (
                            <div key={workout.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-lg">{workout.type}</p>
                                    <p className="text-sm text-gray-400">{new Date(workout.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p><span className="font-bold">{workout.duration}</span> minutes</p>
                                    <p><span className="font-bold">{workout.calories}</span> kcal</p>
                                    {workout.steps && <p><span className="font-bold">{workout.steps}</span> steps</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">You haven't logged any workouts yet.</p>
                )}
            </div>
            {showModal && <AddWorkoutModal user={user} setShowModal={setShowModal} />}
        </div>
    );
}

function AddWorkoutModal({ user, setShowModal }) {
    const [type, setType] = useState('Running');
    const [duration, setDuration] = useState('');
    const [calories, setCalories] = useState('');
    const [steps, setSteps] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!duration || !calories) {
            setError('Please fill in duration and calories.');
            return;
        }

        try {
            await addDoc(collection(db, `users/${user.uid}/workouts`), {
                type,
                duration: Number(duration),
                calories: Number(calories),
                steps: (type === 'Running' || type === 'Walking') ? Number(steps) : null,
                date: new Date().toISOString(),
            });
            
            const userProfileRef = doc(db, 'users', user.uid);
            const userProfileSnap = await getDoc(userProfileRef);
            if(userProfileSnap.exists()){
                const currentCoins = userProfileSnap.data().healthCoins || 0;
                await updateDoc(userProfileRef, {
                    healthCoins: currentCoins + 10
                });
            }

            setShowModal(false);
        } catch (err) {
            setError('Failed to log workout.');
            console.error(err);
        }
    };
    
    const activityTypes = ["Running", "Walking", "Cycling", "Weightlifting", "HIIT", "Yoga", "Swimming"];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Log New Workout</h2>
                    <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-400 hover:text-white" /></button>
                </div>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Activity Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md">
                            {activityTypes.map(act => <option key={act} value={act}>{act}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes)</label>
                        <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Calories Burned</label>
                        <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" required />
                    </div>
                    {(type === 'Running' || type === 'Walking') && (
                        <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">Steps</label>
                           <input type="number" value={steps} onChange={e => setSteps(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
                        </div>
                    )}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md">Log Workout</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ChallengesPage({ user }) {
    const challenges = [
        { id: 1, title: "Weekly Warrior", description: "Log 5 workouts this week.", progress: 3, goal: 5, icon: <Zap /> },
        { id: 2, title: "Marathon Prep", description: "Run a total of 42km this month.", progress: 15, goal: 42, icon: <Target /> },
        { id: 3, title: "Calorie Crusher", description: "Burn 3,500 calories.", progress: 2100, goal: 3500, icon: <Flame /> }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Challenges</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map(challenge => (
                    <div key={challenge.id} className="bg-gray-800 p-6 rounded-lg flex flex-col">
                        <div className="flex items-center space-x-4 mb-4">
                             <div className="text-blue-400">{challenge.icon}</div>
                            <h3 className="text-xl font-bold">{challenge.title}</h3>
                        </div>
                        <p className="text-gray-400 mb-4 flex-grow">{challenge.description}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}></div>
                        </div>
                        <p className="text-right text-sm mt-2 text-gray-300">{challenge.progress} / {challenge.goal}</p>
                        <button className="mt-4 w-full py-2 bg-green-600 rounded-md hover:bg-green-700 transition">View Details</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProfilePage({ user, setUser, setPage }) {
    const [name, setName] = useState(user?.name || '');
    const [weight, setWeight] = useState(user?.goals?.weight || '');
    const [stepsGoal, setStepsGoal] = useState(user?.goals?.steps || '');
    const [message, setMessage] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const userProfileRef = doc(db, 'users', user.uid);
            const updatedProfile = {
                name,
                goals: {
                    weight: Number(weight),
                    steps: Number(stepsGoal)
                }
            };
            await updateDoc(userProfileRef, updatedProfile);
            setUser(prevUser => ({...prevUser, ...updatedProfile}));
            setMessage('Profile updated successfully!');
        } catch (err) {
            setMessage('Failed to update profile.');
            console.error(err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
            <div className="bg-gray-800 p-8 rounded-lg">
                <div className="flex items-center space-x-6 mb-8">
                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-4xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user?.name}</h2>
                        <p className="text-gray-400">{user?.email}</p>
                        <p className="text-yellow-400 font-semibold mt-1">Health Coins: {user?.healthCoins || 0}</p>
                    </div>
                </div>

                {message && <p className="text-green-400 mb-4">{message}</p>}
                
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Weight Goal (kg)</label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Daily Steps Goal</label>
                        <input type="number" value={stepsGoal} onChange={e => setStepsGoal(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="py-2 px-6 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto text-gray-300">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">About FitTrack</h1>
            
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">How to Use This App</h2>
                <p className="leading-relaxed">
                    Welcome to FitTrack! This app is designed to be a simple and motivating companion on your fitness journey.
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                    <li><strong className="text-white">Dashboard:</strong> Your main hub. See a quick summary of your daily stats like calories burned, active minutes, and recent workouts.</li>
                    <li><strong className="text-white">Workouts:</strong> Go here to log a new activity. Click the "Log Workout" button, fill in the details, and see it added to your history.</li>
                    <li><strong className="text-white">Challenges:</strong> (Coming Soon!) Participate in fun challenges to earn badges and rewards.</li>
                    <li><strong className="text-white">Profile:</strong> View and update your personal information and fitness goals. You can also see your "Health Coin" balance here!</li>
                </ul>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold text-white mb-6">About the Creator</h2>
                <img 
                    src="https://placehold.co/150x150/3B82F6/FFFFFF?text=Siam" 
                    alt="A photo of Siam"
                    className="w-36 h-36 rounded-full mx-auto mb-4 border-4 border-blue-500"
                />
                <h3 className="text-3xl font-bold text-white">Siam</h3>
                <p className="text-blue-400 font-semibold text-lg">Student of Public Health</p>
                <p className="text-gray-400 mb-4">Jahangirnagar University</p>

                <p className="max-w-2xl mx-auto leading-relaxed">
                    "I created this app to help people track their fitness journey in a simple and motivating way. As a public health student, I believe in the power of accessible tools to promote wellness. I hope you enjoy using it!"
                </p>

                <div className="mt-6 text-gray-500">
                    <p>Savar, Dhaka, Bangladesh</p>
                </div>
            </div>
        </div>
    );
}
