import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useState } from 'react';

export default function Card({ med, type = "due", onAction, onEdit, isTakenInitial = false }) {
  const { med_name, dosage, instructions, med_time } = med;
  const [isTaken, setIsTaken] = useState(isTakenInitial);

  const handleAction = async () => {
    if (type === "due" && !isTaken) {
      const success = await onAction(med_name);
      if (success) setIsTaken(true);
    } else if (type === "cabinet") {
      onAction(med_name);
    }
  };

  return (
    <div className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-300 border ${
      isTaken 
        ? "bg-slate-50 border-slate-200 opacity-80" 
        : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300"
    }`}>
      <div className="relative z-10 flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-3 tracking-tight transition-all duration-300 ${
            isTaken ? "text-slate-400 line-through" : "text-slate-900"
          }`}>
            {med_name}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {dosage && (
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-100">
                {dosage}
              </span>
            )}
            {med_time && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider border border-slate-200">
                <AccessTimeIcon style={{ fontSize: 14 }} />
                {Array.isArray(med_time) ? med_time.join(", ") : med_time}
              </span>
            )}
          </div>

          {instructions && (
            <div className="flex items-start gap-2 text-slate-500 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="italic">"{instructions}"</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 relative z-20">
          {type === "cabinet" && (
            <button
              onClick={() => onEdit(med)}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
              title="Edit Medication"
            >
              <EditIcon fontSize="small" />
            </button>
          )}
          <button
            onClick={handleAction}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              type === "cabinet"
                ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                : isTaken
                ? "text-emerald-600 bg-emerald-50 scale-110"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200"
            } active:scale-95`}
          >
            {type === "cabinet" ? (
              <DeleteOutlineIcon fontSize="small" />
            ) : isTaken ? (
              <CheckCircleIcon fontSize="medium" />
            ) : (
              <RadioButtonUncheckedIcon fontSize="medium" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


