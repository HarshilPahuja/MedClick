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
    <div className={`relative overflow-hidden group p-6 rounded-[2rem] transition-all duration-500 ${
      isTaken 
        ? "bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
        : "bg-white/[0.03] backdrop-blur-3xl border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1"
    }`}>
      {/* Dynamic background glow on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500" />
      
      <div className="relative z-10 flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className={`text-xl font-black mb-2 tracking-tight transition-all duration-300 ${
            isTaken ? "text-emerald-400 line-through opacity-50" : "text-white"
          }`}>
            {med_name}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {dosage && (
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                {dosage}
              </span>
            )}
            {med_time && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
                <AccessTimeIcon style={{ fontSize: 14 }} />
                {Array.isArray(med_time) ? med_time.join(", ") : med_time}
              </span>
            )}
          </div>
          {instructions && (
            <p className="text-gray-400 text-sm font-medium italic border-l-2 border-white/10 pl-3 py-1">
              {instructions}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 relative z-20">
          {type === "cabinet" && (
            <button
              onClick={() => onEdit(med)}
              className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all duration-300 active:scale-90"
            >
              <EditIcon fontSize="small" />
            </button>
          )}
          <button
            onClick={handleAction}
            className={`p-3.5 rounded-2xl transition-all duration-500 shadow-lg ${
              type === "cabinet"
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                : isTaken
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/20 scale-110"
                : "bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 hover:scale-110"
            } active:scale-95`}
          >
            {type === "cabinet" ? (
              <DeleteOutlineIcon />
            ) : isTaken ? (
              <CheckCircleIcon fontSize="large" className="animate-in zoom-in duration-300" />
            ) : (
              <RadioButtonUncheckedIcon fontSize="large" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


