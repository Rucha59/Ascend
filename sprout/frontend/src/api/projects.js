import api from "./axios";

export const listProjects = () => api.get("/projects").then(r => r.data);
export const getProject   = (id) => api.get(`/projects/${id}`).then(r => r.data);
export const createProject = (payload) => api.post("/projects", payload).then(r => r.data);
export const updateProject = (id, payload) => api.patch(`/projects/${id}`, payload).then(r => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export const addMilestone    = (projectId, payload) => api.post(`/projects/${projectId}/milestones`, payload).then(r => r.data);
export const updateMilestone = (projectId, milestoneId, payload) => api.patch(`/projects/${projectId}/milestones/${milestoneId}`, payload).then(r => r.data);
export const deleteMilestone = (projectId, milestoneId) => api.delete(`/projects/${projectId}/milestones/${milestoneId}`).then(r => r.data);

export const addChecklistItem    = (projectId, milestoneId, payload) => api.post(`/projects/${projectId}/milestones/${milestoneId}/items`, payload).then(r => r.data);
export const toggleChecklistItem = (projectId, milestoneId, itemId)  => api.patch(`/projects/${projectId}/milestones/${milestoneId}/items/${itemId}/toggle`).then(r => r.data);
export const deleteChecklistItem = (projectId, milestoneId, itemId)  => api.delete(`/projects/${projectId}/milestones/${milestoneId}/items/${itemId}`).then(r => r.data);
export const updateChecklistItem = (projectId, milestoneId, itemId, payload) =>
    api.patch(
        `/projects/${projectId}/milestones/${milestoneId}/items/${itemId}`,
        payload
    ).then(r => r.data);