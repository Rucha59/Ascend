import api from "./client";

export async function listProjects() {
  const response = await api.get("/projects");
  return response.data; // List<ProjectSummaryResponse>
}

export async function getProject(id) {
  const response = await api.get(`/projects/${id}`);
  return response.data; // ProjectResponse with milestones and checklist items
}

export async function createProject(payload) {
  const response = await api.post("/projects", payload);
  return response.data;
}

export async function updateProject(id, payload) {
  const response = await api.patch(`/projects/${id}`, payload);
  return response.data;
}

export async function deleteProject(id) {
  await api.delete(`/projects/${id}`);
}

export async function addMilestone(projectId, payload) {
  const response = await api.post(`/projects/${projectId}/milestones`, payload);
  return response.data;
}

export async function updateMilestone(projectId, milestoneId, payload) {
  const response = await api.patch(`/projects/${projectId}/milestones/${milestoneId}`, payload);
  return response.data;
}

export async function deleteMilestone(projectId, milestoneId) {
  const response = await api.delete(`/projects/${projectId}/milestones/${milestoneId}`);
  return response.data;
}

export async function addChecklistItem(projectId, milestoneId, payload) {
  const response = await api.post(`/projects/${projectId}/milestones/${milestoneId}/items`, payload);
  return response.data;
}

export async function toggleChecklistItem(projectId, milestoneId, itemId) {
  const response = await api.patch(`/projects/${projectId}/milestones/${milestoneId}/items/${itemId}/toggle`);
  return response.data;
}

export async function updateChecklistItem(projectId, milestoneId, itemId, payload) {
  const response = await api.patch(`/projects/${projectId}/milestones/${milestoneId}/items/${itemId}`, payload);
  return response.data;
}

export async function deleteChecklistItem(projectId, milestoneId, itemId) {
  const response = await api.delete(`/projects/${projectId}/milestones/${milestoneId}/items/${itemId}`);
  return response.data;
}
