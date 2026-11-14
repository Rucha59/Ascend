import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/layout/Header";
import TodayProgressCard from "../components/dashboard/TodayProgressCard";
import HabitQuickStrip from "../components/dashboard/HabitQuickStrip";
import TaskSection from "../components/dashboard/TaskSection";
import ProjectSummaryRow from "../components/dashboard/ProjectSummaryRow";
import HabitModal from "../components/habits/HabitModal";
import ProjectDetailModal from "../components/projects/ProjectDetailModal";
import { getToday } from "../api/days";
import { markHabitLog } from "../api/habits";
import {
  getTodayTodos,
  quickCreateTodo,
  createTodo,
  toggleTodo,
  updateTodo,
  deleteTodo,
  toggleChecklistItemFromToday,
} from "../api/todos";
import { listProjects } from "../api/projects";
import { Loader2, RefreshCw } from "lucide-react";

export default function HomeDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayData, setTodayData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  // Modals
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Load all dashboard data in parallel from the backend
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const [todayRes, todosRes, projectsRes] = await Promise.all([
        getToday().catch((e) => {
          console.error("Failed to load today data:", e);
          return null;
        }),
        getTodayTodos().catch((e) => {
          console.error("Failed to load todos:", e);
          return [];
        }),
        listProjects().catch((e) => {
          console.error("Failed to load projects:", e);
          return [];
        }),
      ]);

      if (todayRes) setTodayData(todayRes);
      if (todosRes) setTasks(todosRes);
      if (projectsRes) setProjects(projectsRes);
    } catch (err) {
      setError("Failed to sync data with Ascend server. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Habit 1-click status cycling
  const handleCycleHabitStatus = async (habitId, newStatus) => {
    // Optimistic UI update
    setTodayData((prev) => {
      if (!prev) return prev;
      const updatedHabits = prev.habits.map((h) =>
        h.habitId === habitId ? { ...h, status: newStatus } : h
      );
      const completed = updatedHabits.filter((h) => h.status === "COMPLETED").length;
      const total = updatedHabits.length;
      const pct = total === 0 ? 0 : Math.round((completed * 100) / total);

      return {
        ...prev,
        habits: updatedHabits,
        completedCount: completed,
        completionPercentage: pct,
      };
    });

    try {
      await markHabitLog(habitId, { status: newStatus });
    } catch (err) {
      console.error("Failed to mark habit status:", err);
      // Revert on error
      loadDashboardData(true);
    }
  };

  // Inline Task Creation directly on Home
  const handleAddTask = async ({ title, priority, dueDate }) => {
    try {
      if (!dueDate) {
        // Quick add creates task for today
        const created = await quickCreateTodo(title, priority);
        setTasks((prev) => [created, ...prev]);
      } else {
        const created = await createTodo({ title, priority, dueDate });
        setTasks((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Could not add task. Please try again.");
    }
  };

  // 1-Click Task Toggle
  const handleToggleTask = async (item) => {
    if (item.source === "CHECKLIST") {
      // Toggle checklist item under milestone
      setTasks((prev) =>
        prev.map((t) =>
          t.itemId === item.itemId ? { ...t, completed: !t.completed } : t
        )
      );
      try {
        await toggleChecklistItemFromToday(item.projectId, item.milestoneId, item.itemId);
      } catch (err) {
        console.error("Checklist toggle failed:", err);
        loadDashboardData(true);
      }
      return;
    }

    const taskId = item.id || item.taskId;
    // Optimistic toggle
    setTasks((prev) =>
      prev.map((t) =>
        (t.id || t.taskId) === taskId ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      await toggleTodo(taskId);
    } catch (err) {
      console.error("Todo toggle failed:", err);
      loadDashboardData(true);
    }
  };

  // Update Task
  const handleUpdateTask = async (taskId, payload) => {
    try {
      const updated = await updateTodo(taskId, payload);
      setTasks((prev) =>
        prev.map((t) => ((t.id || t.taskId) === taskId ? { ...t, ...updated } : t))
      );
    } catch (err) {
      console.error("Task update failed:", err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    setTasks((prev) => prev.filter((t) => (t.id || t.taskId) !== taskId));
    try {
      await deleteTodo(taskId);
    } catch (err) {
      console.error("Task delete failed:", err);
      loadDashboardData(true);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => !!t.completed).length;

  return (
    <div className="min-h-screen bg-page flex flex-col pb-8">
      {/* Top Header */}
      <Header
        todayDate={todayData?.date}
        streak={user?.currentStreak || user?.streak || 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3 py-3 space-y-4 max-w-lg mx-auto w-full">
        {error && (
          <div className="p-2.5 rounded bg-danger-surface text-danger text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => loadDashboardData(true)}
              className="underline text-[11px]"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-primary">
            <Loader2 size={30} className="animate-spin" />
            <span className="text-[12px] font-semibold text-text-muted mt-2">
              Syncing with Ascend...
            </span>
          </div>
        ) : (
          <>
            {/* 1. Today's Progress Card */}
            <TodayProgressCard
              completionPct={todayData?.completionPercentage || 0}
              completedHabits={todayData?.completedCount || 0}
              totalHabits={todayData?.totalCount || 0}
              pendingTasksCount={pendingTasks}
              completedTasksCount={completedTasks}
              quote={todayData?.quote}
            />

            {/* 2. Habits Quick Strip (1-click status cycling) */}
            <HabitQuickStrip
              habits={todayData?.habits || []}
              onCycleStatus={handleCycleHabitStatus}
              onOpenAddHabit={() => {
                setSelectedHabit(null);
                setIsHabitModalOpen(true);
              }}
            />

            {/* 3. Tasks Management directly on Home */}
            <TaskSection
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />

            {/* 4. Active Projects with Milestone Progress */}
            <ProjectSummaryRow
              projects={projects}
              onSelectProject={(proj) => setSelectedProject(proj)}
            />

            {/* Sync Status Footer */}
            <div className="pt-2 flex items-center justify-center">
              <button
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                className="text-[11px] text-text-muted hover:text-text flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
                <span>{refreshing ? "Syncing..." : "Sync latest from web app"}</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        habit={selectedHabit}
        onSaved={() => loadDashboardData(true)}
        onDeleted={() => loadDashboardData(true)}
      />

      {/* Project Milestones Inspector Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onProjectUpdated={() => loadDashboardData(true)}
        />
      )}
    </div>
  );
}
