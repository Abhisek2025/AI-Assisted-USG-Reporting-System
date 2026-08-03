import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const diagnosticCenters = pgTable('diagnostic_centers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  roleName: text('role_name').default('RADIOLOGIST').notNull(),
  diagnosticCenterId: integer('diagnostic_center_id'),
  phone: text('phone'),
  qualification: text('qualification'),
  registrationNumber: text('registration_number'),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  uhid: text('uhid').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender').notNull(),
  dateOfBirth: text('date_of_birth'),
  age: integer('age'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  bloodGroup: text('blood_group'),
  referringDoctor: text('referring_doctor'),
  medicalHistory: text('medical_history'),
  allergies: text('allergies'),
  createdById: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const studies = pgTable('studies', {
  id: serial('id').primaryKey(),
  studyCode: text('study_code').notNull().unique(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  studyType: text('study_type').notNull(),
  bodyRegion: text('body_region'),
  referringDoctor: text('referring_doctor'),
  clinicalIndication: text('clinical_indication'),
  technicianId: integer('technician_id'),
  assignedRadiologistId: integer('assigned_radiologist_id'),
  studyDate: timestamp('study_date').defaultNow(),
  priority: text('priority').default('ROUTINE').notNull(),
  status: text('status').default('SCHEDULED').notNull(),
  diagnosticCenterId: integer('diagnostic_center_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const studyImages = pgTable('study_images', {
  id: serial('id').primaryKey(),
  studyId: integer('study_id').references(() => studies.id).notNull(),
  imageUrl: text('image_url').notNull(),
  organType: text('organ_type'),
  viewType: text('view_type'),
  captureSequence: integer('capture_sequence'),
  metadataJson: jsonb('metadata_json'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const aiFindings = pgTable('ai_findings', {
  id: serial('id').primaryKey(),
  studyId: integer('study_id').references(() => studies.id).notNull(),
  imageId: integer('image_id').references(() => studyImages.id),
  organ: text('organ').notNull(),
  findingType: text('finding_type').notNull(),
  severity: text('severity').notNull(),
  confidenceScore: text('confidence_score'),
  description: text('description').notNull(),
  measurementsJson: jsonb('measurements_json'),
  recommendations: text('recommendations'),
  isAccepted: text('is_accepted').default('PENDING'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  reportNumber: text('report_number').notNull().unique(),
  studyId: integer('study_id').references(() => studies.id).notNull(),
  radiologistId: integer('radiologist_id'),
  impressionText: text('impression_text').notNull(),
  detailedFindingsText: text('detailed_findings_text'),
  recommendationsText: text('recommendations_text'),
  status: text('status').default('DRAFT').notNull(),
  approvedAt: timestamp('approved_at'),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedStudies: many(studies, { relationName: 'assignedRadiologist' }),
  createdPatients: many(patients, { relationName: 'creator' }),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  studies: many(studies),
}));

export const studiesRelations = relations(studies, ({ one, many }) => ({
  patient: one(patients, {
    fields: [studies.patientId],
    references: [patients.id],
  }),
  assignedRadiologist: one(users, {
    fields: [studies.assignedRadiologistId],
    references: [users.id],
    relationName: 'assignedRadiologist',
  }),
  images: many(studyImages),
  findings: many(aiFindings),
  reports: many(reports),
}));

export const studyImagesRelations = relations(studyImages, ({ one, many }) => ({
  study: one(studies, {
    fields: [studyImages.studyId],
    references: [studies.id],
  }),
  findings: many(aiFindings),
}));

export const aiFindingsRelations = relations(aiFindings, ({ one }) => ({
  study: one(studies, {
    fields: [aiFindings.studyId],
    references: [studies.id],
  }),
  image: one(studyImages, {
    fields: [aiFindings.imageId],
    references: [studyImages.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  study: one(studies, {
    fields: [reports.studyId],
    references: [studies.id],
  }),
  radiologist: one(users, {
    fields: [reports.radiologistId],
    references: [users.id],
  }),
}));
