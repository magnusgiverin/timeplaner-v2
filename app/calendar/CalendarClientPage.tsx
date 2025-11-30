'use client'
import { SemesterPlan } from "../types/SemesterPlan";
import CalendarDisplay from "../components/Calendar/CalendarDisplay";
import StepDescription from "../components/StepDescription";
import { useState } from "react";
import SemesterPlanEditor from "../components/SemesterPlanEditor";

interface CalendarClientPageProps {
    semesterPlans: SemesterPlan[];
}

const CalendarClientPage = ({ semesterPlans }: CalendarClientPageProps) => {
    const [editedSemesterPlans, setEditedSemesterPlans] = useState<SemesterPlan[]>(semesterPlans);

    return (
        <div className="flex flex-col items-center pt-20 gap-20 w-full">
            <StepDescription
                number="3"
                title="Se kalender"
                description="Se og rediger kalenderen basert på valgte fag."
            />
            <CalendarDisplay semesterPlans={editedSemesterPlans} />
            <SemesterPlanEditor 
                originalSemesterPlans={semesterPlans} 
                setEditedSemesterPlans={setEditedSemesterPlans} 
            />
        </div>
    );
};

export default CalendarClientPage;
