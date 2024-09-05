import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

    useEffect(() => {
        const checkWellbeingSetup = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setHasCompletedSetup(userDoc.data().hasCompletedWellbeingSetup);
                }
            }
            setLoading(false);
        };

        checkWellbeingSetup();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!hasCompletedSetup) {
        return <Navigate to="/wellbeing-setup" replace />;
    }

    return children;
};

export default ProtectedRoute;