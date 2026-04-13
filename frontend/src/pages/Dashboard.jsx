import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AiCoachCard from "../components/AiCoachCard";
const Dashboard = () => {
  const { user, setUser } = useAuth();

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalRewards: 0,
    redeemedRewards: 0
  });

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
  try {
    const tasksRes = await API.get("/tasks");
    const rewardsRes = await API.get("/rewards");

    const tasks = tasksRes.data;
    const rewards = rewardsRes.data;

    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.filter(task => !task.completed).length;

    const nextReward = rewards
      .filter(reward => !reward.redeemed)
      .sort((a, b) => a.requiredPoints - b.requiredPoints)[0];

    setStats({
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      rewardsCount: rewards.length,
      nextReward
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
  }
}, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const nextReward = useMemo(() => {
    const unredeemedRewards = rewards
      .filter((reward) => !reward.redeemed)
      .sort((a, b) => a.requiredPoints - b.requiredPoints);

    if (!unredeemedRewards.length) return null;

    return unredeemedRewards[0];
  }, [rewards]);

  const currentPoints = user?.totalPoints || 0;
  const targetPoints = nextReward?.requiredPoints || 0;

  const pointsNeeded =
    nextReward && currentPoints < targetPoints
      ? targetPoints - currentPoints
      : 0;

  const progressPercent =
    nextReward && targetPoints > 0
      ? Math.min((currentPoints / targetPoints) * 100, 100)
      : 0;

  if (loading) {
    return <div className="page-center">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}</h1>
          <p>Track your progress, earn points, and unlock your rewards.</p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Points</h3>
          <p>{currentPoints}</p>
        </div>

        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p>{stats.totalTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <p>{stats.completedTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <p>{stats.pendingTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Total Rewards</h3>
          <p>{stats.totalRewards}</p>
        </div>

        <div className="stat-card">
          <h3>Redeemed Rewards</h3>
          <p>{stats.redeemedRewards}</p>
        </div>
      </div>

      <div className="reward-progress-card">
        <div className="reward-progress-top">
          <div>
            <span className="reward-progress-label">Reward Progress</span>
            <h2>
              {nextReward ? nextReward.title : "No upcoming rewards"}
            </h2>
          </div>

          <div className="reward-progress-points">
            <span>Your Points</span>
            <strong>{currentPoints}</strong>
          </div>
        </div>

        {nextReward ? (
          <>
            <p className="reward-progress-text">
              {pointsNeeded > 0
                ? `You are ${pointsNeeded} points away from unlocking ${nextReward.title}.`
                : `You can now redeem ${nextReward.title}.`}
            </p>

            <div className="progress-meta">
              <span>{currentPoints} points</span>
              <span>{targetPoints} points needed</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </>
        ) : (
          <p className="reward-progress-text">
            Add a new reward to start tracking your next unlock.
          </p>
        )}
      </div>
      <AiCoachCard />
      <div className="dashboard-actions">
        <Link to="/tasks" className="primary-btn">
          Manage Tasks
        </Link>
        <Link to="/rewards" className="secondary-btn">
          Manage Rewards
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;