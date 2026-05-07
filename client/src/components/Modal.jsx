import { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

export default function Modal({ closemodalfromchild, medname, initialData = null }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const [times_per_day_button_array, set_times_per_day_button_array] = useState([true, false, false, false]);
  const [recurrence_array, set_recurrance_array] = useState([true, false, false]);
  const [selected_days, set_selected_days] = useState(fullDays.map(() => true));

  const [dosage, set_dosage] = useState("");
  const [instructions, set_instructions] = useState("");
  const [time, set_time] = useState(["09:00"]);

  useEffect(() => {
    if (initialData) {
      set_dosage(initialData.dosage || "");
      set_instructions(initialData.instructions || "");
      
      const tpd = initialData.times_per_day;
      const tpdArr = [false, false, false, false];
      if (tpd >= 1 && tpd <= 3) tpdArr[tpd-1] = true;
      else tpdArr[3] = true;
      set_times_per_day_button_array(tpdArr);

      set_time(initialData.med_time || ["09:00"]);
      
      if (initialData.days) {
        const isWeekly = initialData.days.length < 7;
        set_recurrance_array([!isWeekly, isWeekly, false]);
        set_selected_days(fullDays.map(d => initialData.days.includes(d)));
      }
    }
  }, [initialData]);

  function finalsubmit(e) {
    e.preventDefault();
    const finalobject = {
      final_name: medname,
      final_dosage: dosage,
      final_instruction: instructions,
      final_timesperday: times_per_day_button_array,
      final_times: time,
      final_days: selected_days,
      isUpdate: !!initialData
    };
    closemodalfromchild(finalobject);
  }

  function handle_times_per_day_Recurrence(index) {
    let count = index === 3 ? 0 : index + 1;
    set_time(Array(count).fill(count > 0 ? "09:00" : ""));
    const arr = [false, false, false, false];
    arr[index] = true;
    set_times_per_day_button_array(arr);
  }

  function handle_reccurence_array(index) {
    if (index === 0) set_selected_days(fullDays.map(() => true));
    else set_selected_days(fullDays.map(() => false));
    
    const arr = [false, false, false];
    arr[index] = true;
    set_recurrance_array(arr);
  }

  function toggle_selected_day(index) {
    set_selected_days((prev) => prev.map((item, i) => i === index ? !item : item));
  }

  function setting_time(ind, e) {
    set_time((prev) => prev.map((t, i) => i === ind ? e.target.value : t));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{initialData ? "Edit" : "Add"} {medname}</h2>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Schedule Details</p>
          </div>
          <button 
            onClick={() => closemodalfromchild(null)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <form onSubmit={finalsubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Dosage</label>
              <input 
                type="text" 
                placeholder="e.g. 1 pill" 
                value={dosage} 
                onChange={(e) => set_dosage(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Instruction</label>
              <input 
                type="text" 
                placeholder="e.g. After meal" 
                value={instructions} 
                onChange={(e) => set_instructions(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Times Per Day */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Daily Frequency</label>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/50">
              {['1x', '2x', '3x', 'Custom'].map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handle_times_per_day_Recurrence(idx)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    times_per_day_button_array[idx] 
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              {time.map((t, index) => (
                <div key={index} className="relative">
                  <input 
                    type="time"
                    value={t}
                    onChange={(e) => setting_time(index, e)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Recurrence Schedule</label>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/50">
              {['Daily', 'Weekly', 'Custom'].map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handle_reccurence_array(idx)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    recurrence_array[idx] 
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {recurrence_array[1] && (
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4 animate-in slide-in-from-top-2">
                {days.map((label, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggle_selected_day(index)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${
                      selected_days[index]
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={finalsubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <SaveIcon sx={{ fontSize: 20 }} />
            {initialData ? "UPDATE MEDICATION" : "SAVE MEDICATION"}
          </button>
        </div>
      </div>
    </div>
  );
}


//left-custom code