/**
 * Central export point for all server actions
 * This makes it easier to import actions throughout the application
 */

// Parent-Child linking actions
export {
  linkParentToChild,
  unlinkParentFromChild,
  getParentChildLinks,
  type LinkParentToChildInput,
  type ServerActionResult,
} from "./parent-child";

// Teacher-Classroom assignment actions
export {
  assignTeacherToClass,
  unassignTeacherFromClass,
  getTeacherClassAssignments,
  getAvailableTeachers,
  getSchoolClassrooms,
  type AssignTeacherToClassInput,
} from "./teacher-classroom";

// User management and principal allocation actions
export {
  createUser,
  updateUser,
  deleteUser,
  allocatePrincipalToSchool,
  getSchoolUsers,
  getSchoolPrincipals,
  type CreateUserInput,
  type UpdateUserInput,
  type AllocatePrincipalInput,
} from "./users";
