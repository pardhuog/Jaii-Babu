import { createContext, useContext, useReducer, useEffect } from 'react';
import { DEMO_PROFILE } from '../data/mockData';

const KEY = 'skillbridge_profile';

const initial = () => {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'LOAD_DEMO':
      return { ...state, profile: DEMO_PROFILE };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'SET_MATCHED_JOBS':
      return { ...state, matchedJobs: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.value } };
    case 'ADD_INTERACTION':
      return { ...state, interactions: [...state.interactions, action.payload] };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    profile: initial(),
    matchedJobs: [],
    loading: {},
    interactions: [],
    language: 'en', // 'en' | 'hi'
  });

  // Persist profile to localStorage
  useEffect(() => {
    if (state.profile) {
      localStorage.setItem(KEY, JSON.stringify(state.profile));
    }
  }, [state.profile]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
