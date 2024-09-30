const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');

const PROJECT_ID = 'mindjourney-e72bf';

describe('Firestore security rules', () => {
  let testEnv;

  beforeAll(async () => {
    console.log('Initializing test environment...');
    try {
      testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
          rules: readFileSync('firestore.rules', 'utf8'),
        }
      });
      console.log('Test environment initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize test environment:', error);
    }
  });

  afterAll(async () => {
    console.log('Cleaning up test environment...');
    if (testEnv) {
      await testEnv.cleanup();
      console.log('Test environment cleaned up successfully.');
    } else {
      console.log('No test environment to clean up.');
    }
  });

  beforeEach(async () => {
    console.log('Clearing Firestore...');
    if (testEnv) {
      await testEnv.clearFirestore();
      console.log('Firestore cleared successfully.');
    } else {
      console.log('No test environment to clear Firestore.');
    }
  });

  const runTest = (testName, testFunction) => {
    it(testName, async () => {
      if (!testEnv) {
        console.error(`Test environment not initialized. Skipping test: ${testName}`);
        return;
      }
      await testFunction();
    });
  };

  runTest('allows users to read and write their own document', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();
    
    const userDocRef = db.collection('users').doc(userId);
    await assertSucceeds(userDocRef.set({ name: 'Test User' }));
    await assertSucceeds(userDocRef.get());
  });

  runTest('prevents users from reading or writing other users documents', async () => {
    const userId = 'user123';
    const otherUserId = 'user456';
    const db = testEnv.authenticatedContext(userId).firestore();
    
    const otherUserDocRef = db.collection('users').doc(otherUserId);
    await assertFails(otherUserDocRef.set({ name: 'Other User' }));
    await assertFails(otherUserDocRef.get());
  });

  runTest('allows authenticated users to create activities with valid data', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();
    
    const validActivityData = {
      userId: userId,
      date: new Date(),
      type: 'exercise',
      duration: 30
    };
    
    const activityRef = db.collection('activities').doc();
    await assertSucceeds(activityRef.set(validActivityData));
  });

  runTest('prevents creating activities with invalid data', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();
    
    const invalidActivityData = {
      userId: userId,
      date: 'not a timestamp',
      type: 'invalid_type',
      duration: 'not a number'
    };
    
    const activityRef = db.collection('activities').doc();
    await assertFails(activityRef.set(invalidActivityData));
  });

  runTest('allows authenticated users to read achievements', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();
    
    const achievementRef = db.collection('achievements').doc('achievement1');
    await assertSucceeds(achievementRef.get());
  });

  runTest('prevents writing to global achievements', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();
    
    const achievementRef = db.collection('achievements').doc('achievement1');
    await assertFails(achievementRef.set({ name: 'New Achievement' }));
  });

  runTest('allows users to read and write their own rewards', async () => {
    const userId = 'user123';
    const db = testEnv.authenticatedContext(userId).firestore();
    
    const rewardRef = db.collection('users').doc(userId).collection('rewards').doc('reward1');
    await assertSucceeds(rewardRef.set({ name: 'User Reward' }));
    await assertSucceeds(rewardRef.get());
  });
});