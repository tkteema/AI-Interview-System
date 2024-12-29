import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const MockInterview = pgTable("mockinterviewtool", {
  id: serial("id").primaryKey(),
  jsonMockResp: text("jsonmockresp").notNull(),
  jobPosition: varchar("jobposition").notNull(),
  jobDesc: varchar("jobdesc").notNull(),
  jobExperience: varchar("jobexperience").notNull(),
  createdBy: varchar("createdby").notNull(),
  createdAt: varchar("createdat"),
  mockId: varchar("mockid").notNull()
});



export const UserAnswer=pgTable('useanswer',{
   id:serial('id').primaryKey(),
   mockIdRef:varchar("mockidref").notNull(),
   question:varchar('question').notNull(),
   correctAns:text('correctans'),
   userAns:text('userans'),
   feedback:text('feedback'),
   rating:varchar('rating'),
   userEmail:varchar('useremail'),
   createdAt:varchar('createdat')
})
