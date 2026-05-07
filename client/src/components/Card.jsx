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
    <div className={`relative overflow-hidden group p-5 rounded-2xl transition-all duration-300 ${
      isTaken 
        ? "bg-green-500/10 border border-green-500/20" 
        : "bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-500/50 shadow-xl"
    }`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-1 ${isTaken ? "text-green-400 line-through opacity-70" : "text-white"}`}>
            {med_name}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {dosage && (
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
                {dosage}
              </span>
            )}
            {med_time && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                <AccessTimeIcon style={{ fontSize: 14 }} />
                {Array.isArray(med_time) ? med_time.join(", ") : med_time}
              </span>
            )}
          </div>
          {instructions && (
            <p className="text-gray-400 text-sm italic mb-2">"{instructions}"</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {type === "cabinet" && (
            <button
              onClick={() => onEdit(med)}
              className="p-2 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-all duration-300"
            >
              <EditIcon />
            </button>
          )}
          <button
            onClick={handleAction}
            className={`p-3 rounded-xl transition-all duration-300 ${
              type === "cabinet"
                ? "text-red-400 hover:bg-red-500/20"
                : isTaken
                ? "text-green-400 bg-green-500/20"
                : "text-blue-400 hover:bg-blue-500/20"
            }`}
          >
            {type === "cabinet" ? (
              <DeleteOutlineIcon />
            ) : isTaken ? (
              <CheckCircleIcon fontSize="large" />
            ) : (
              <RadioButtonUncheckedIcon fontSize="large" />
            )}
          </button>
        </div>
      </div>

      {/* Decorative accent */}
      <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
        isTaken ? "w-full bg-green-500" : "w-0 bg-blue-500 group-hover:w-full"
      }`} />
    </div>
  );
}
