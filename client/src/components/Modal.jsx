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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="relative bg-gray-900/90 border border-white/10 backdrop-blur-3xl w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]">
        {/* Background decorative glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px]" />

        <div className="relative p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-blue-600/[0.05] to-purple-600/[0.05]">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">{initialData ? "Edit" : "Add"} {medname}</h2>
            <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-widest mt-1">Medication Details</p>
          </div>
          <button 
            onClick={() => closemodalfromchild(null)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all duration-300"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={finalsubmit} className="relative p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Dosage</label>
              <input 
                type="text" 
                placeholder="e.g. 1 pill" 
                value={dosage} 
                onChange={(e) => set_dosage(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Instruction</label>
              <input 
                type="text" 
                placeholder="e.g. After meal" 
                value={instructions} 
                onChange={(e) => set_instructions(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Times Per Day */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] ml-1">Daily Frequency</label>
            <div className="flex bg-white/[0.03] p-1.5 rounded-2xl gap-2 border border-white/5">
              {['1x', '2x', '3x', 'Custom'].map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handle_times_per_day_Recurrence(idx)}
                  className={`flex-1 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                    times_per_day_button_array[idx] 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]" 
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              {time.map((t, index) => (
                <div key={index} className="relative">
                  <input 
                    type="time"
                    value={t}
                    onChange={(e) => setting_time(index, e)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] ml-1">Recurrence Rule</label>
            <div className="flex bg-white/[0.03] p-1.5 rounded-2xl gap-2 border border-white/5">
              {['Daily', 'Weekly', 'Custom'].map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handle_reccurence_array(idx)}
                  className={`flex-1 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                    recurrence_array[idx] 
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]" 
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {recurrence_array[1] && (
              <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-3xl border border-white/5 mt-6 animate-in slide-in-from-top-2 duration-500">
                {days.map((label, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggle_selected_day(index)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-300 ${
                      selected_days[index]
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-110"
                        : "bg-white/5 text-gray-600 hover:text-gray-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="p-8 bg-white/[0.02] border-t border-white/5">
          <button 
            onClick={finalsubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black py-5 rounded-2xl transition-all duration-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <SaveIcon />
            {initialData ? "UPDATE MEDICATION" : "SAVE MEDICATION"}
          </button>
        </div>
      </div>
    </div>
  );
}

//left-custom code