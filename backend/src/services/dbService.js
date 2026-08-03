// backend/src/services/dbService.js
// Delegated to Firebase Firestore Database Engine

export {
  dbGetAllPatients,
  dbGetPatientById,
  dbCreatePatient,
  dbUpdatePatient,
  dbGetAllStudies,
  dbGetStudyById,
  dbCreateStudy,
  dbAssignRadiologist,
  dbUpdateStudyStatus,
  dbAddStudyImages,
  dbDeleteStudyImage,
  dbUpdateFindingStatus,
  dbSaveReportDraft,
  dbApproveReport,
  dbAmendReport,
  dbGetAllReports,
  dbGetAllUsers,
  dbCreateUser,
  dbToggleUserStatus,
  dbGetDatabaseExplorer,
  dbClearAllData
} from './firestoreService.js';
