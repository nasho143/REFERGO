import api from "./api";

// ======================================
// GET ALL VACANCIES
// ======================================
export const getVacancies = () => {
  return api.get("/vacancies");
};

// ======================================
// GET SINGLE VACANCY
// ======================================
export const getVacancy = (id) => {
  return api.get(`/vacancies/${id}`);
};

// ======================================
// ADD VACANCY
// ======================================
export const addVacancy = (data) => {
  return api.post("/vacancies", {
    employer_id: Number(data.employer_id),
    position_title: data.position_title,
    qualifications: data.qualifications || "",
    requirements: data.requirements || "",
    salary: data.salary || "",
    location: data.location || "",
    employment_type:
      data.employment_type || "Full-time",
    deadline: data.deadline || null,
    openings: Number(data.openings),
    status: data.status || "Active",
  });
};

// ======================================
// UPDATE VACANCY
// ======================================
export const updateVacancy = (id, data) => {
  return api.put(`/vacancies/${id}`, {
    employer_id: Number(data.employer_id),
    position_title: data.position_title,
    qualifications: data.qualifications || "",
    requirements: data.requirements || "",
    salary: data.salary || "",
    location: data.location || "",
    employment_type:
      data.employment_type || "Full-time",
    deadline: data.deadline || null,
    openings: Number(data.openings),
    status: data.status || "Active",
  });
};

// ======================================
// DELETE VACANCY
// ======================================
export const deleteVacancy = (id) => {
  return api.delete(`/vacancies/${id}`);
};