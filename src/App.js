import { useState, useEffect } from 'react';
import { Switch, Route, Link, useHistory } from 'react-router-dom';
import { auth, firestore } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Listen for changes to the user authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeposit = async (amount) => {
    try {
      const uid = auth.currentUser.uid;

      await firestore.collection('users').doc(uid).update({
        balance: firebase.firestore.FieldValue.increment(amount),
        transactions: firebase.firestore.FieldValue.arrayUnion({
          type: 'deposit',
          amount: amount,
          date: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleWithdraw = async (amount) => {
    try {
      const uid = auth.currentUser.uid;
      const doc = await firestore.collection('users').doc(uid).get();
      const data = doc.data();

      if (data.balance >= amount) {
        await firestore.collection('users').doc(uid).update({
          balance: firebase.firestore.FieldValue.increment(-amount),
          transactions: firebase.firestore.FieldValue.arrayUnion({
            type: 'withdrawal',
            amount: amount,
            date: new Date().toISOString()
          })
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch the user's balance and transaction history
      const uid = user.uid;
      const unsubscribe = firestore.collection('users').doc(uid).onSnapshot((doc) => {
        const data = doc.data();
        setBalance(data.balance);
        setTransactions(data.transactions);
      });

      return () => unsubscribe();
    } else {
      setBalance(null);
      setTransactions([]);
    }
  }, [user]);

  const history = useHistory();

  const handleCreateAccount = async (email, password, name) => {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      const uid = result.user.uid;

      await firestore.collection('users').doc(uid).set({
        email: email,
        name: name,
        balance: 0,
        transactions: []
      });

      history.push('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {user && <li><Link to="/dashboard">Dashboard</Link></li>}
          {!user && <li><Link to="/login">Login</Link></li>}
          {!user && <li><Link to="/create-account">Create Account</Link></li>}
        </ul>
      </nav>
      <Switch>
        <Route path="/dashboard">
          {user && (
            <div>
              <p>Hello, {user.email}!</p>
              <p>Balance: {balance}</p>
              <ul>
                {transactions.map((transaction, index) => (
                  <li key={index}>
                    {transaction.type} ({transaction.amount}) - {transaction.date}
                  </li>
                ))}
              </ul>
              <button onClick={handleLogout}>Logout</button>
              <br />
              <br />
              <form onSubmit={(event) => {
                event.preventDefault();
                handleDeposit(parseFloat(event.target.elements.amount.value));
              }}>
                <label>
                  Deposit amount:
                  <input type="number" name="amount" min="0" step="0.01" required />
                </label>
                <button type="submit">Deposit</button>
              </form>
              <form onSubmit={(event) => {
                event.preventDefault();
                handleWithdraw(parseFloat(event.target.elements.amount.value));
              }}>
                <label>
                  Withdraw amount:
                  <input type="number" name="amount" min="0" step="0.01" required />
                </label>
                <button type="submit">Withdraw</button>
              </form>
            </div>
          )}
          {!user && (
            <div>
              <p>You must be logged in to access this page.</p>
              <Link to="/login">Login</Link>
            </div>
          )}
        </Route>
        <Route path="/login">
          {user && <Redirect to="/dashboard" />}
          {!user && <Login onLogin={handleLogin} />}
        </Route>
      </Switch>
    </div>
  );
          }  