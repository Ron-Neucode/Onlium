import { API_BASE_URL } from "./apiConfig.js";

async function getApiErrorMessage(response, fallback) {
  const responseText = await response.text();
  let errorBody;

  try {
    errorBody = JSON.parse(responseText);
  } catch {
    errorBody = null;
  }

  const message = errorBody?.message || errorBody?.detail || errorBody?.title;
  if (message) return message;

  if (errorBody?.errors && typeof errorBody.errors === "object") {
    const validationMessages = Object.values(errorBody.errors).flat().filter(Boolean);
    if (validationMessages.length) return validationMessages.join(" ");
  }

  return `${fallback} (HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}).`;
}

export const apiService = {
  getRequirementFileUrl(filePath) {
    const apiOrigin = new URL(API_BASE_URL).origin;
    const fileUrl = new URL(filePath, `${apiOrigin}/`);
    if (fileUrl.origin !== apiOrigin) {
      throw new Error("Requirement files must be hosted by the API.");
    }
    return fileUrl.href;
  },

  getAuthHeaders() {
    const token = localStorage.getItem("onlium_token");
    return token
      ? {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        }
      : {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
  },

  async getMyStudentProfile() {
    const response = await fetch(`${API_BASE_URL}/StudentProfiles/me`, {
        method: "GET",
        headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch student profile");
    }

    return await response.json();
  },

  async updateMyStudentProfile(profile) {
    const response = await fetch(`${API_BASE_URL}/StudentProfiles/me`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to update student profile"));
    }

    return await response.json();
  },

  async uploadMyStudentPhoto(file) {
    const formData = new FormData();
    formData.append("file", file);
    const headers = this.getAuthHeaders();
    delete headers["Content-Type"];
    const response = await fetch(`${API_BASE_URL}/StudentProfiles/me/photo`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to upload profile photo"));
    }

    return await response.json();
  },

  async getMyStudentPhoto() {
    const response = await fetch(`${API_BASE_URL}/StudentProfiles/me/photo`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (response.status === 204) return null;
    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch profile photo"));
    }

    return await response.blob();
  },

  async getMyApplications() {
    const response = await fetch(`${API_BASE_URL}/Applications/mine`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (response.status === 401) {
      throw new Error("Your session is invalid or expired. Please sign in again.");
    }

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch enrollment applications"));
    }

    return await response.json();
  },

  async getMyStudyLoadSchedules() {
    const response = await fetch(`${API_BASE_URL}/StudentStudyLoadSchedules/mine`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch study load schedules"));
    }

    return await response.json();
  },

  async saveMyStudyLoadDraft(data) {
    const response = await fetch(`${API_BASE_URL}/StudentStudyLoadSchedules/save-draft`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to save study load schedule draft"));
    }

    return await response.json();
  },

  async submitMyStudyLoadSchedule(data) {
    const response = await fetch(`${API_BASE_URL}/StudentStudyLoadSchedules/submit`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to submit study load schedule"));
    }

    return await response.json();
  },

  async getCurrentStudyTerm() {
    const response = await fetch(`${API_BASE_URL}/StudentStudyLoadSchedules/current-term`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (response.status === 401) {
      throw new Error("Your session is invalid or expired. Please sign in again.");
    }

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch current study term"));
    }

    return await response.json();
  },

  async getOfficialStudyLoads({ programCode, yearLevel, semester }) {
    const query = new URLSearchParams({
      programCode,
      yearLevel: String(yearLevel),
      semester: String(semester),
    });
    const response = await fetch(`${API_BASE_URL}/StudentStudyLoadSchedules/official?${query}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch official study loads"));
    }

    return await response.json();
  },

  // Bulletins
  async getBulletins() {
    const response = await fetch(`${API_BASE_URL}/Bulletins`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch bulletins");
    }

    return await response.json();
  },

  async getAdminBulletins() {
    const response = await fetch(`${API_BASE_URL}/Bulletins/admin`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch admin bulletins"));
    }

    return await response.json();
  },

  // Notifications
  async getMyNotifications() {
    const response = await fetch(`${API_BASE_URL}/Notifications/mine`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch notifications");
    }

    return await response.json();
  },

  async markNotificationAsRead(id) {
    const response = await fetch(`${API_BASE_URL}/Notifications/${id}/read`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to mark notification as read");
    }

    return await response.json();
  },

  // Appointments
  async getMyAppointments() {
    const response = await fetch(`${API_BASE_URL}/Appointments/mine`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch appointments");
    }

    return await response.json();
  },

  async getMyPaymentRequests() {
    const response = await fetch(`${API_BASE_URL}/payment-requests/mine`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch payment requests"));
    }

    return await response.json();
  },

  async submitPaymentReceipt(applicationId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const headers = this.getAuthHeaders();
    delete headers["Content-Type"];
    const response = await fetch(`${API_BASE_URL}/payment-requests/applications/${applicationId}/receipt`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to submit payment receipt"));
    }

    return await response.json();
  },

  async getMyPaymentReceipt(id) {
    const response = await fetch(`${API_BASE_URL}/payment-requests/${id}/receipt`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch payment receipt"));
    }

    return await response.blob();
  },

  // Resources
  async getResources() {
    const response = await fetch(`${API_BASE_URL}/Resources`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch resources");
    }

    return await response.json();
  },

  // Study Loads
  async getStudyLoads(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.programCode) queryParams.append("programCode", params.programCode);
    if (params.yearLevel) queryParams.append("yearLevel", params.yearLevel);
    if (params.semester) queryParams.append("semester", params.semester);
    if (params.includeInactive) queryParams.append("includeInactive", "true");

    const url = `${API_BASE_URL}/StudyLoads${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch study loads");
    }

    return await response.json();
  },

  // Admin - Applications
  async getAdminApplications(status = null) {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);

    const url = `${API_BASE_URL}/admin/applications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch applications");
    }

    return await response.json();
  },

  async createApplication(data) {
    const response = await fetch(`${API_BASE_URL}/Applications`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to create enrollment application"));
    }

    return await response.json();
  },

  async updateApplicationDraft(id, data) {
    const response = await fetch(`${API_BASE_URL}/Applications/${id}/draft`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to update enrollment application draft"));
    }

    return await response.json();
  },

  async uploadApplicationRequirement(applicationId, file, requirementType) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("requirementType", requirementType);
    const headers = this.getAuthHeaders();
    delete headers["Content-Type"];
    const response = await fetch(`${API_BASE_URL}/Requirements/upload/${applicationId}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, `Failed to upload ${requirementType}`));
    }

    return await response.json();
  },

  async submitApplication(id) {
    const response = await fetch(`${API_BASE_URL}/Applications/${id}/submit`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to submit enrollment application");
    }

    return await response.json();
  },

  async getApplicationById(id) {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch application");
    }

    return await response.json();
  },

  async approveApplication(id) {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}/approve`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to approve application");
    }

    return await response.json();
  },

  async rejectApplication(id, reason) {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}/reject`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to reject application");
    }

    return await response.json();
  },

  async dropEnrollment(id, reason) {
    const response = await fetch(`${API_BASE_URL}/admin/applications/${id}/drop`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to drop enrollment"));
    }

    return await response.json();
  },

  // Admin - Bulletins
  async createBulletin(title, content) {
    const response = await fetch(`${API_BASE_URL}/Bulletins`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create bulletin");
    }

    return await response.json();
  },

  async updateBulletin(id, title, content, isPublished) {
    const response = await fetch(`${API_BASE_URL}/Bulletins/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title, content, isPublished }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update bulletin");
    }

    return await response.json();
  },

  async deleteBulletin(id) {
    const response = await fetch(`${API_BASE_URL}/Bulletins/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete bulletin");
    }

    return await response.json();
  },

  // Admin - Resources
  async createResource(resourceType, title, url) {
    const response = await fetch(`${API_BASE_URL}/Resources`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ resourceType, title, url }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create resource");
    }

    return await response.json();
  },

  async updateResource(id, title, url, isActive) {
    const response = await fetch(`${API_BASE_URL}/Resources/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title, url, isActive }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update resource");
    }

    return await response.json();
  },

  async deleteResource(id) {
    const response = await fetch(`${API_BASE_URL}/Resources/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete resource");
    }

    return await response.json();
  },

  // Admin - Students
  async getAdminStudents(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.yearLevel) queryParams.append("yearLevel", params.yearLevel);
    if (params.programCode) queryParams.append("programCode", params.programCode);
    if (params.gender) queryParams.append("gender", params.gender);
    if (params.studentType) queryParams.append("studentType", params.studentType);

    const url = `${API_BASE_URL}/admin/students${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch students");
    }

    return await response.json();
  },

  // Admin - Dashboard Stats
  async getAdminDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch dashboard stats");
    }

    return await response.json();
  },

  // Admin - Study Load Schedules
  async getAdminStudyLoadSchedules(status = null) {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);

    const url = `${API_BASE_URL}/admin/study-load-schedules${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch study load schedules");
    }

    return await response.json();
  },

  async getStudyLoadScheduleById(id) {
    const response = await fetch(`${API_BASE_URL}/admin/study-load-schedules/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch study load schedule");
    }

    return await response.json();
  },

  async approveStudyLoadSchedule(id) {
    const response = await fetch(`${API_BASE_URL}/admin/study-load-schedules/${id}/approve`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to approve study load schedule");
    }

    return await response.json();
  },

  async rejectStudyLoadSchedule(id, comment) {
    const response = await fetch(`${API_BASE_URL}/admin/study-load-schedules/${id}/reject`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to reject study load schedule");
    }

    return await response.json();
  },

  // Admin - Study Load Curriculum (Create/Edit)
  async createStudyLoad(data) {
    const response = await fetch(`${API_BASE_URL}/StudyLoads`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create study load");
    }

    return await response.json();
  },

  async updateStudyLoad(id, data) {
    const response = await fetch(`${API_BASE_URL}/StudyLoads/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to update curriculum subject"));
    }

    return await response.json();
  },

  async retireStudyLoad(id) {
    const response = await fetch(`${API_BASE_URL}/StudyLoads/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to retire curriculum subject"));
    }

    return await response.json();
  },

  async retireCurriculum(programCode, yearLevel, semester) {
    const response = await fetch(
      `${API_BASE_URL}/StudyLoads/curriculum/${encodeURIComponent(programCode)}/${yearLevel}/${semester}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to retire curriculum"));
    }

    return await response.json();
  },

  async restoreStudyLoad(id) {
    const response = await fetch(`${API_BASE_URL}/StudyLoads/${id}/restore`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to restore curriculum subject"));
    }

    return await response.json();
  },

  async updateStudyLoadSchedule(id, data) {
    const response = await fetch(`${API_BASE_URL}/StudyLoads/${id}/schedule`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to update official subject schedule"));
    }

    return await response.json();
  },

  async getAdminAcademicRooms() {
    const response = await fetch(`${API_BASE_URL}/admin/academic-rooms`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch classrooms"));
    }

    return await response.json();
  },

  async createAcademicRoom(data) {
    const response = await fetch(`${API_BASE_URL}/admin/academic-rooms`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to add classroom"));
    }

    return await response.json();
  },

  async updateAcademicRoom(id, data) {
    const response = await fetch(`${API_BASE_URL}/admin/academic-rooms/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to update classroom"));
    }

    return await response.json();
  },

  async getAdminInstructors() {
    const response = await fetch(`${API_BASE_URL}/admin/instructors`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch instructor accounts"));
    }

    return await response.json();
  },

  async approveInstructor(id) {
    const response = await fetch(`${API_BASE_URL}/admin/instructors/${id}/approve`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to approve instructor"));
    }

    return await response.json();
  },

  async rejectInstructor(id) {
    const response = await fetch(`${API_BASE_URL}/admin/instructors/${id}/reject`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to reject instructor"));
    }

    return await response.json();
  },

  async setInstructorActive(id, isActive) {
    const response = await fetch(`${API_BASE_URL}/admin/instructors/${id}/active`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to update instructor account"));
    }

    return await response.json();
  },

  async getInstructorClasses() {
    const response = await fetch(`${API_BASE_URL}/instructor/classes`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch assigned classes"));
    }

    return await response.json();
  },

  async getInstructorAttendance(scheduleId, date) {
    const response = await fetch(
      `${API_BASE_URL}/instructor/classes/${scheduleId}/attendance?date=${encodeURIComponent(date)}`,
      { method: "GET", headers: this.getAuthHeaders() },
    );

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to load class attendance"));
    }

    return await response.json();
  },

  async saveInstructorAttendance(scheduleId, attendance) {
    const response = await fetch(`${API_BASE_URL}/instructor/classes/${scheduleId}/attendance`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(attendance),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to save class attendance"));
    }

    return await response.json();
  },

  async getInstructorAnnouncements() {
    const response = await fetch(`${API_BASE_URL}/instructor/announcements`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch class announcements"));
    }

    return await response.json();
  },

  async createInstructorAnnouncement(data) {
    const response = await fetch(`${API_BASE_URL}/instructor/announcements`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to publish class announcement"));
    }

    return await response.json();
  },

  async getMyClassAnnouncements() {
    const response = await fetch(`${API_BASE_URL}/SchoolCalendar/class-announcements`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to load class announcements"));
    }

    return await response.json();
  },

  async getAdminAcademicSections(params = {}) {
    const query = new URLSearchParams();
    if (params.programCode) query.append("programCode", params.programCode);
    if (params.yearLevel) query.append("yearLevel", String(params.yearLevel));
    if (params.semester) query.append("semester", String(params.semester));
    const queryString = query.toString();
    const url = `${API_BASE_URL}/admin/academic-sections${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch academic sections"));
    }

    return await response.json();
  },

  async getAdminUnassignedEnrollments() {
    const response = await fetch(`${API_BASE_URL}/admin/academic-sections/unassigned-enrollments`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch enrolled students without a section"));
    }

    return await response.json();
  },

  async createAcademicSection(data) {
    const response = await fetch(`${API_BASE_URL}/admin/academic-sections`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to create academic section"));
    }

    return await response.json();
  },

  async updateAcademicSection(id, data) {
    const response = await fetch(`${API_BASE_URL}/admin/academic-sections/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to update academic section"));
    }

    return await response.json();
  },

  async assignExistingEnrollmentToSection(sectionId, applicationId) {
    const response = await fetch(
      `${API_BASE_URL}/admin/academic-sections/${sectionId}/assign/${applicationId}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to assign student to section"));
    }

    return await response.json();
  },

  async updateSectionStudyLoad(sectionId, studyLoadId, data) {
    const response = await fetch(
      `${API_BASE_URL}/admin/academic-sections/${sectionId}/study-loads/${studyLoadId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to update section subject schedule"));
    }

    return await response.json();
  },

  // Admin - Appointments
  async getAdminAppointments() {
    const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch appointments");
    }

    return await response.json();
  },

  async createAppointment(data) {
    const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create appointment");
    }

    return await response.json();
  },

  async updateAppointmentStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/admin/appointments/${id}/status`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update appointment status");
    }

    return await response.json();
  },

  async getAdminPaymentRequests(status = "PendingReview") {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests${query}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch payment requests"));
    }

    return await response.json();
  },

  async getAdminPaymentReceipt(id) {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}/receipt`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to fetch payment receipt"));
    }

    return await response.blob();
  },

  async approvePaymentRequest(id) {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}/approve`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to approve payment request"));
    }

    return await response.json();
  },

  async rejectPaymentRequest(id, reason) {
    const response = await fetch(`${API_BASE_URL}/admin/payment-requests/${id}/reject`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Failed to reject payment request"));
    }

    return await response.json();
  },

  // School Calendar
  async getSchoolCalendarEvents(sectionId = null) {
    const queryParams = new URLSearchParams();
    if (sectionId) queryParams.append("sectionId", sectionId);

    const url = `${API_BASE_URL}/SchoolCalendar/events${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch calendar events");
    }

    return await response.json();
  },

  async getSchoolCalendarEventById(id) {
    const response = await fetch(`${API_BASE_URL}/SchoolCalendar/events/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch calendar event");
    }

    return await response.json();
  },

  async createSchoolCalendarEvent(data) {
    const response = await fetch(`${API_BASE_URL}/SchoolCalendar/events`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create calendar event");
    }

    return await response.json();
  },

  async updateSchoolCalendarEvent(id, data) {
    const response = await fetch(`${API_BASE_URL}/SchoolCalendar/events/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update calendar event");
    }

    return await response.json();
  },

  async deleteSchoolCalendarEvent(id) {
    const response = await fetch(`${API_BASE_URL}/SchoolCalendar/events/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete calendar event");
    }

    return await response.json();
  },

  async getSchoolCalendarSections() {
    const response = await fetch(`${API_BASE_URL}/SchoolCalendar/sections`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch sections");
    }

    return await response.json();
  },

  async checkRoomConflict(params) {
    const queryParams = new URLSearchParams();
    if (params.excludeSectionStudyLoadId) queryParams.append("excludeSectionStudyLoadId", params.excludeSectionStudyLoadId);
    if (params.room) queryParams.append("room", params.room);
    if (params.days) queryParams.append("days", params.days);
    if (params.startTime) queryParams.append("startTime", params.startTime);
    if (params.endTime) queryParams.append("endTime", params.endTime);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/academic-sections/check-room-conflict${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to check room conflict");
    }

    return await response.json();
  },
};
