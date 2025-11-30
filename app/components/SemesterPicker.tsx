'use client';
import { useEffect, useState } from "react";

interface SemesterPickerProps {
    semester: string;
    setSemester: (semester: string) => void;
}

const SemesterPicker = ({ semester, setSemester }: SemesterPickerProps) => {
    const [season, setSeason] = useState(semester.charAt(0) || "h");
    const [year, setYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        const yearStr = String(year);

        if (yearStr.trim() !== "") {
            const value = `${yearStr.slice(-2)}${season}`;
            const isValid = /^[0-9]{2}[hv]$/i.test(value); // Example: "24h" or "24v"

            if (isValid && yearStr.length === 4) {
                setSemester(value);
            }
        }
    }, [season, year, setSemester]);

    return (
        <div className="w-full max-w-md flex flex-col gap-4">
            <label className="text-sm text-center">Velg semester:</label>

            <div className="flex gap-4 h-12">
                {/* Season selector */}
                <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="h-12 border-b-2 border-terracotta-clay w-1/2 focus:outline-none"
                >
                    <option value="h">Høst</option>
                    <option value="v">Vår</option>
                </select>

                {/* Year input */}
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-12 w-1/2 border-b-2 border-terracotta-clay focus:outline-none"
                    placeholder="År (2024)"
                    min="2000"
                    max="2100"
                />
            </div>

            {/* Display the saved internal value */}
            <div className="text-center text-sm text-gray-500">
                Lagret verdi: <strong>{semester}</strong>
            </div>
        </div>
    );
};

export default SemesterPicker;