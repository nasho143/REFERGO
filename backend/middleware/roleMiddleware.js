// ==========================================================
// ROLE MIDDLEWARE
// ==========================================================
// Controls which user roles are allowed to access a route.
//
// Available roles:
// - peso_staff
// - department_head
//
// Permission model:
// - Both roles have CRUD access to the operational modules.
// - Department Head also has approval/rejection authority.
// ==========================================================

const normalizeRole = (role) =>
  String(role || "").trim().toLowerCase();

const allowRoles = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const userRole = normalizeRole(req.user.role);

      if (!normalizedAllowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action.",
        });
      }

      next();
    } catch (error) {
      console.error("ROLE MIDDLEWARE ERROR:", error);

      return res.status(500).json({
        success: false,
        message:
          "Server error while checking user permissions.",
      });
    }
  };
};

// ==========================================================
// DEPARTMENT HEAD ONLY
// ==========================================================

const departmentHeadOnly = allowRoles("department_head");

// ==========================================================
// PESO STAFF ONLY
// ==========================================================

const pesoStaffOnly = allowRoles("peso_staff");

// ==========================================================
// PESO STAFF + DEPARTMENT HEAD
// ==========================================================
// Keep both names for backward compatibility.
// Existing routes currently use pesoStaffAndDepartmentHead.
// ==========================================================

const pesoStaffAndDepartmentHead = allowRoles(
  "peso_staff",
  "department_head"
);

const authenticatedStaff = pesoStaffAndDepartmentHead;

// ==========================================================
// EXPORT
// ==========================================================

module.exports = {
  allowRoles,
  departmentHeadOnly,
  pesoStaffOnly,
  pesoStaffAndDepartmentHead,
  authenticatedStaff,
};
