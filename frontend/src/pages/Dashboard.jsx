import React, { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";
import AiCoachCard from "../components/AiCoachCard";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    rewardsCount: 0,
    nextReward: null
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const tasksRes = await API.get("/tasks");
      const rewardsRes = await API.get("/rewards");

      const tasks = tasksRes.data;
      const rewards = rewardsRes.data;

      const completedTasks = tasks.filter(
        (task) => task.completed
      ).length;

      const pendingTasks = tasks.filter(
        (task) => !task.completed
      ).length;

      const nextReward = rewards
        .filter((reward) => !reward.redeemed)
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

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Track your productivity and rewards progress.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p>{stats.totalTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p>{stats.completedTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <p>{stats.pendingTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Rewards</h3>
          <p>{stats.rewardsCount}</p>
        </div>
      </div>

      <div className="reward-progress-card">
        <h2>Next Reward</h2>
        {stats.nextReward ? (
          <>
            <h3>{stats.nextReward.title}</h3>
            <p>
              Requires {stats.nextReward.requiredPoints} points
            </p>
          </>
        ) : (
          <p>No rewards available yet</p>
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